# Browser end-to-end checks

`forms.py` drives a real Chromium against a running preview server and checks
what unit tests cannot see: that a conditional survey question actually
appears, that focus lands on the error summary, that a saved draft survives a
reload, and that nothing overflows at phone width.

```bash
npm run build
npx vite preview --port 4173 &
npm run test:e2e            # or: python3 scripts/e2e/forms.py https://allergyvoices.com
```

Exits non-zero on the first finding, so it can gate a release.

## It never submits

Every submit path writes to the production Supabase project. A suite that
leaves rows behind is one nobody runs twice, so this stops at validation.
The write paths are covered by the unit tests and by manual checks.

## Accessible names come from Chrome, not from this file

Name computation is done by Chrome over CDP. An earlier version hand-rolled
the rule and produced two false positives: the header logo, which is named by
its `<img alt>`, and every Radix checkbox, which is named by an associated
`<label for>` — `button` is a labelable element. Acting on either would have
added redundant `aria-label`s that make a screen reader announce things twice.

If you extend this file, keep name computation in the browser.

## Requires

`pip install playwright && playwright install chromium`
