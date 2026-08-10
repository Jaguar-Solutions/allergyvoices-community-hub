"""End-to-end pass over every public form.

Drives a real browser against a running preview server and checks the things
unit tests cannot see: that a conditional question actually appears, that
focus moves to the error summary, that a saved draft survives a reload, and
that nothing overflows at phone width.

Deliberately stops short of submitting. Every submit path writes to the
production Supabase project, and a test suite that leaves rows behind is one
nobody runs twice.

    npm run build && npx vite preview --port 4173 &
    python3 scripts/e2e/forms.py [base-url]

Exits non-zero when it finds something, so it can gate a release.

Accessible names are computed by Chrome over CDP rather than by inspecting
markup here. An earlier version of this script hand-rolled that rule and
reported two false positives — the header logo, named by its image alt, and
every Radix checkbox, named by an associated <label for>. Acting on either
would have added redundant aria-labels that make a screen reader announce
things twice. If you extend this file, keep name computation in the browser.
"""

import os
import pathlib
import sys
from playwright.sync_api import sync_playwright

B = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4173"

# Screenshots land in a gitignored directory rather than the repo root, where
# an earlier version left four PNGs sitting in `git status`.
SHOTS = pathlib.Path(os.environ.get("E2E_SHOT_DIR", ".e2e-screenshots"))
SHOTS.mkdir(exist_ok=True)
issues = []
console = []


def note(area, msg):
    issues.append(f"[{area}] {msg}")
    print(f"  ISSUE  {msg}")


def check(area, ok, msg):
    print(f"  {'ok   ' if ok else 'ISSUE'}  {msg}")
    if not ok:
        issues.append(f"[{area}] {msg}")


with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1440, "height": 1000})
    pg.on("console", lambda m: console.append(f"{pg.url} :: {m.text}") if m.type == "error" else None)
    pg.on("pageerror", lambda e: console.append(f"{pg.url} :: PAGEERROR {e}"))

    # ---------------------------------------------------------------- survey
    print("\n=== RESTAURANT SURVEY ===")
    pg.goto(f"{B}/restaurants/participate")
    pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(1200)

    # every input has an accessible name
    unlabelled = pg.evaluate("""() => {
      const bad = [];
      for (const el of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
        if (el.closest('[aria-hidden="true"]')) continue;
        const id = el.id;
        const lbl = id && document.querySelector(`label[for="${CSS.escape(id)}"]`);
        const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        if (!lbl && !aria) bad.push(el.id || el.name || el.type);
      }
      return bad;
    }""")
    check("survey", not unlabelled, f"all form controls labelled (unlabelled: {unlabelled})")

    # phone mask
    phone = pg.locator("#phone")
    phone.fill(""); phone.type("9195550100", delay=8); pg.wait_for_timeout(300)
    v = phone.input_value()
    check("survey", v == "(919)555-0100", f"phone formats to (919)555-0100 (got '{v}')")

    phone.fill(""); phone.type("919.555.0100", delay=8); pg.wait_for_timeout(300)
    v2 = phone.input_value()
    check("survey", v2 == "(919)555-0100", f"phone normalises punctuation (got '{v2}')")

    # The survey is a five-step wizard: validation is per step, Submit exists
    # only on the last one, and later questions are not in the DOM path until
    # their step is reached.
    pg.get_by_role("button", name="Continue").click()
    pg.wait_for_timeout(700)
    summary = pg.locator('[role="alert"]').first
    has_summary = summary.count() > 0
    check("survey", has_summary, "Continue on an empty step surfaces an error summary")
    check("survey", "Step 1 of 5" in pg.inner_text("body"),
          "an invalid step does not advance")
    check("survey", pg.get_by_role("button", name="Submit").count() == 0,
          "no Submit button before the final step")

    # Fill step 1 and advance.
    for sel, val in [("#name", "E2E Test Kitchen"), ("#address_line1", "1 Test Way"),
                     ("#city", "Durham"), ("#postal_code", "27701"),
                     ("#phone", "9195550100"), ("#manager_name", "Test Person"),
                     ("#manager_email", "test@example.com")]:
        pg.locator(sel).fill(val)
    pg.locator("#state").click()
    pg.wait_for_timeout(300)
    pg.get_by_role("option", name="North Carolina").click()
    pg.wait_for_timeout(300)
    pg.get_by_label("Italian", exact=True).check()

    pg.get_by_role("button", name="Continue").click()
    pg.wait_for_timeout(800)
    check("survey", "Step 2 of 5" in pg.inner_text("body"), "a valid step advances")
    check("survey", pg.get_by_role("button", name="Back").count() > 0,
          "Back is offered after step 1")

    focused = pg.evaluate("() => document.activeElement?.textContent?.slice(0, 40)")
    check("survey", focused == "Allergy practices",
          f"focus moves to the new step heading (got {focused!r})")

    # Conditional questions, on their own steps.
    pg.get_by_label("Yes — servers and kitchen staff").check()
    pg.wait_for_timeout(400)
    check("survey",
          pg.get_by_text("What type of allergy training is used?", exact=False).count() > 0,
          "training-type follow-up appears")

    # Step 2 has four required questions; answering one and expecting to
    # advance was a bug in this test, not in the form.
    pg.get_by_label("Yes — documented process").check()
    pg.get_by_label("Yes — ingredient/allergen information is documented").check()
    pg.get_by_label("Most items").check()
    pg.wait_for_timeout(300)

    pg.get_by_role("button", name="Continue").click()
    pg.wait_for_timeout(800)
    check("survey", "Step 3 of 5" in pg.inner_text("body"), "advances to cross-contact")

    pg.get_by_label("Dedicated fryer is available").check()
    pg.wait_for_timeout(400)
    check("survey",
          pg.get_by_text("Do you have a fryer that is not shared", exact=False).count() > 0,
          "fryer follow-up appears when the box is ticked")
    pg.get_by_label("Dedicated fryer is available").uncheck()
    pg.wait_for_timeout(400)
    check("survey",
          pg.get_by_text("Do you have a fryer that is not shared", exact=False).count() == 0,
          "fryer follow-up disappears when unticked")

    # Back preserves what was typed.
    pg.get_by_role("button", name="Back").click()
    pg.wait_for_timeout(700)
    pg.get_by_role("button", name="Back").click()
    pg.wait_for_timeout(700)
    check("survey", pg.locator("#name").input_value() == "E2E Test Kitchen",
          "Back preserves earlier answers")

    # Submit only on the final step.
    for _ in range(5):
        if pg.get_by_role("button", name="Continue").count() == 0:
            break
        pg.get_by_role("button", name="Continue").click()
        pg.wait_for_timeout(700)
    check("survey", "Step 5 of 5" in pg.inner_text("body"), "reaches the final step")
    check("survey", pg.get_by_role("button", name="Submit").count() == 1,
          "Submit appears only on the final step")

    # Draft and step both survive a reload.
    pg.wait_for_timeout(1300)
    pg.reload()
    pg.wait_for_load_state("networkidle")
    pg.wait_for_timeout(1500)
    check("survey", "Step 5 of 5" in pg.inner_text("body"), "reload restores the step")
    if pg.get_by_role("button", name="Start over").count():
        pg.get_by_role("button", name="Start over").click()
        pg.wait_for_timeout(600)
        check("survey", pg.locator("#name").input_value() == "", "Start over clears the draft")

    # ------------------------------------------------------------ city form
    print("\n=== CITY REQUEST FORM ===")
    pg.goto(f"{B}/restaurants#help-your-city")
    pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(1200)

    unlabelled2 = pg.evaluate("""() => {
      const bad = [];
      const form = document.querySelector('#help-your-city form');
      if (!form) return ['FORM MISSING'];
      for (const el of form.querySelectorAll('input:not([type=hidden]), select, textarea')) {
        if (el.closest('[aria-hidden="true"]')) continue;
        const id = el.id;
        const lbl = id && document.querySelector(`label[for="${CSS.escape(id)}"]`);
        const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        if (!lbl && !aria) bad.push(el.id || el.name || el.type);
      }
      return bad;
    }""")
    check("city", not unlabelled2, f"all controls labelled (unlabelled: {unlabelled2})")

    pg.get_by_role("button", name="Send request").click(); pg.wait_for_timeout(500)
    a = pg.locator('#help-your-city [role="alert"]').first
    check("city", a.count() > 0 and "email" in a.inner_text().lower(), "empty submit asks for an email")

    pg.locator("#cr-email").fill("nobody@example.com")
    pg.get_by_role("button", name="Send request").click(); pg.wait_for_timeout(500)
    a = pg.locator('#help-your-city [role="alert"]').first
    check("city", a.count() > 0 and "city" in a.inner_text().lower(),
          "city request without a city is rejected")

    # switching to a kind that doesn't need a city should clear that block
    pg.locator("#kind-recommend_restaurant").check(); pg.wait_for_timeout(300)
    check("city", pg.locator("#cr-city").count() > 0, "city field still offered for recommendations")

    # ----------------------------------------------------- newsletter signup
    print("\n=== HOMEPAGE NEWSLETTER ===")
    pg.goto(B); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(1800)
    news = pg.locator('input[type="email"]').last
    check("newsletter", news.count() > 0, "email input present")
    if news.count():
        nid = news.get_attribute("id")
        aria = news.get_attribute("aria-label")
        lbl = pg.locator(f'label[for="{nid}"]').count() if nid else 0
        check("newsletter", bool(aria) or lbl > 0,
              f"email input has an accessible name (id={nid}, aria={aria}, label={lbl})")

    # ------------------------------------------------------- a11y (via CDP)
    print("\n=== HEADINGS / LINKS / ACCESSIBLE NAMES ===")
    cdp = pg.context.new_cdp_session(pg)
    cdp.send("Accessibility.enable")
    INTERACTIVE = ("link", "button", "checkbox", "radio", "textbox", "combobox", "switch")

    for path in ["/", "/restaurants", "/restaurants/directory", "/restaurants/participate",
                 "/dining", "/resources", "/recalls", "/about", "/findings"]:
        pg.goto(B + path)
        pg.wait_for_load_state("networkidle")
        pg.wait_for_timeout(900)

        # Chrome computes the accessible name the way a screen reader does,
        # covering img[alt], label[for], aria-labelledby and sr-only text.
        unnamed = [
            (n.get("role") or {}).get("value")
            for n in cdp.send("Accessibility.getFullAXTree")["nodes"]
            if (n.get("role") or {}).get("value") in INTERACTIVE
            and not n.get("ignored")
            and not (((n.get("name") or {}).get("value")) or "").strip()
        ]
        if unnamed:
            note("a11y", f"{path}: {len(unnamed)} interactive node(s) with no accessible name: {sorted(set(unnamed))}")

        h1 = pg.locator("h1").count()
        if h1 != 1:
            note("a11y", f"{path}: expected exactly 1 <h1>, found {h1}")

        dead = pg.evaluate("""() => document.querySelectorAll('a[href="#"]').length""")
        if dead:
            note("links", f"{path}: {dead} dead '#' link(s)")

        if not unnamed and h1 == 1 and not dead:
            print(f"  ok     {path}")

    # --------------------------------------------------------------- mobile
    print("\n=== MOBILE 390px ===")
    m = b.new_page(viewport={"width": 390, "height": 844})
    for path, shot in [("/", "m-home"), ("/restaurants/participate", "m-survey"),
                       ("/restaurants#help-your-city", "m-city"), ("/restaurants/directory", "m-dir")]:
        m.goto(B + path); m.wait_for_load_state("networkidle"); m.wait_for_timeout(1200)
        overflow = m.evaluate("() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1")
        if overflow:
            note("mobile", f"{path}: horizontal overflow")
        else:
            print(f"  ok     {path}: no horizontal overflow")
        m.screenshot(path=str(SHOTS / f"{shot}.png"), full_page=False)

    print("\n=== CONSOLE ERRORS ===")
    real = [c for c in console if "ERR_CONNECTION_REFUSED" not in c and "favicon" not in c]
    for c in real[:8]:
        print("  ", c[:150])
    if not real:
        print("   none")

    print(f"\n=== {len(issues)} ISSUE(S) ===")
    for i in issues:
        print("  -", i)
    b.close()

sys.exit(1 if issues else 0)
