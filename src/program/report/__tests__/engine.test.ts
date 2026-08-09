import { describe, expect, it } from "vitest";

import { buildReport, ENGINE_VERSION } from "../engine";
import type { Answers } from "../../types";

/** A restaurant doing nearly everything it was asked about. */
const EXCELLENT: Answers = {
  allergy_process: "yes_documented",
  staff_training: "servers_and_kitchen",
  training_type: "servsafe",
  who_to_ask: ["server", "manager", "chef"],
  ingredient_info: "documented",
  menu_modification: "most_items",
  cross_contact_steps: [
    "wash_hands_gloves",
    "clean_surfaces",
    "clean_utensils",
    "separate_prep_area",
    "clean_pan",
    "order_flagged",
    "manager_verifies",
    "dedicated_fryer",
  ],
  dedicated_fryer_detail: "yes",
  dedicated_fryer_allergens: ["fish", "shellfish"],
  allergens_discussed: ["milk", "peanut"],
  allergen_limitations: "Sesame is used throughout our kitchen.",
  allergy_menu: "yes_online",
  allergy_menu_url: "https://example.com/allergens",
};

/** A restaurant at the other end: honest, but with little in place. */
const MINIMAL: Answers = {
  allergy_process: "no_specific",
  staff_training: "none",
  who_to_ask: ["server"],
  ingredient_info: "no",
  menu_modification: "rarely",
  cross_contact_steps: ["none"],
  allergy_menu: "no",
};

const ids = (r: ReturnType<typeof buildReport>) => ({
  strengths: r.strengths.map((s) => s.id),
  recommendations: r.recommendations.map((x) => x.id),
});

describe("1. restaurant with excellent practices", () => {
  const report = buildReport(EXCELLENT);

  it("reports strengths and few opportunities", () => {
    expect(report.strengths.length).toBeGreaterThanOrEqual(8);
    expect(report.recommendations.length).toBeLessThanOrEqual(2);
  });

  it("recognises the documented process, training and escalation", () => {
    const { strengths } = ids(report);
    expect(strengths).toContain("process.documented");
    expect(strengths).toContain("training.full");
    expect(strengths).toContain("training.servsafe");
    expect(strengths).toContain("communication.escalation");
    expect(strengths).toContain("ingredients.documented");
  });

  it("does not offer to build an allergen menu they already publish", () => {
    expect(report.showAllergenMenuOffer).toBe(false);
    expect(ids(report).recommendations).not.toContain("menu.create");
  });
});

describe("2. restaurant with minimal practices", () => {
  const report = buildReport(MINIMAL);

  it("produces high-priority opportunities", () => {
    expect(report.recommendations.filter((r) => r.priority === "high").length)
      .toBeGreaterThanOrEqual(3);
  });

  it("leads with the highest priority items", () => {
    expect(report.recommendations[0].priority).toBe("high");
  });

  it("still never describes the restaurant as unsafe or failing", () => {
    const corpus = JSON.stringify(report).toLowerCase();
    expect(corpus).not.toContain("unsafe");
    expect(corpus).not.toContain("fail");
    expect(corpus).not.toContain("violation");
  });

  it("offers exactly three next steps", () => {
    expect(report.nextSteps).toHaveLength(3);
  });
});

describe("3. informal process", () => {
  it("asks them to document it rather than create one", () => {
    const { strengths, recommendations } = ids(
      buildReport({ ...EXCELLENT, allergy_process: "yes_informal" }),
    );
    expect(recommendations).toContain("process.document_it");
    expect(recommendations).not.toContain("process.create_it");
    expect(strengths).not.toContain("process.documented");
  });
});

describe("4. no employee training", () => {
  it("raises training as a high priority", () => {
    const report = buildReport({ ...EXCELLENT, staff_training: "none", training_type: undefined });
    const rec = report.recommendations.find((r) => r.id === "training.introduce");
    expect(rec?.priority).toBe("high");
    expect(rec?.resource?.url).toContain("servsafe");
  });
});

describe("5. partial employee training", () => {
  it("suggests expanding for some staff", () => {
    const { recommendations } = ids(buildReport({ ...EXCELLENT, staff_training: "some_staff" }));
    expect(recommendations).toContain("training.expand");
  });

  it("suggests extending beyond managers when only they are trained", () => {
    const { recommendations } = ids(
      buildReport({ ...EXCELLENT, staff_training: "managers_chefs_only" }),
    );
    expect(recommendations).toContain("training.extend_to_all");
  });

  it("still credits ServSafe as a strength alongside a coverage gap", () => {
    const report = buildReport({
      ...EXCELLENT,
      staff_training: "some_staff",
      training_type: "servsafe",
    });
    const { strengths, recommendations } = ids(report);
    expect(strengths).toContain("training.servsafe");
    expect(recommendations).toContain("training.expand");
  });
});

describe("6. limited ingredient information", () => {
  it("recommends improving access", () => {
    const { strengths, recommendations } = ids(
      buildReport({ ...EXCELLENT, ingredient_info: "limited" }),
    );
    expect(recommendations).toContain("ingredients.improve_access");
    expect(strengths).not.toContain("ingredients.documented");
  });

  it("treats package-checking as a strength with a light suggestion", () => {
    const { strengths, recommendations } = ids(
      buildReport({ ...EXCELLENT, ingredient_info: "staff_can_check" }),
    );
    expect(strengths).toContain("ingredients.staff_check");
    expect(recommendations).toContain("ingredients.centralize");
  });
});

describe("7. shared fryer", () => {
  const report = buildReport({
    ...EXCELLENT,
    dedicated_fryer_detail: "no",
    dedicated_fryer_allergens: [],
  });

  it("recommends communication, not buying equipment", () => {
    const rec = report.recommendations.find((r) => r.id === "fryer.communicate_shared");
    expect(rec).toBeDefined();
    const corpus = JSON.stringify(report).toLowerCase();
    expect(corpus).not.toContain("purchase");
    expect(corpus).not.toContain("install a dedicated");
    expect(corpus).not.toContain("buy a");
  });

  it("does not claim a fryer strength", () => {
    expect(ids(report).strengths).not.toContain("fryer.dedicated_specified");
  });
});

describe("8. dedicated fryer with specific allergens", () => {
  it("names the allergens it covers", () => {
    const report = buildReport(EXCELLENT);
    const strength = report.strengths.find((s) => s.id === "fryer.dedicated_specified");
    expect(strength?.detail).toContain("Fish");
    expect(strength?.detail).toContain("Shellfish");
  });

  it("asks which allergens when the claim is unqualified", () => {
    const { strengths, recommendations } = ids(
      buildReport({ ...EXCELLENT, dedicated_fryer_detail: "yes", dedicated_fryer_allergens: [] }),
    );
    expect(recommendations).toContain("fryer.specify_allergens");
    expect(strengths).not.toContain("fryer.dedicated_specified");
  });

  it("asks for clarity when it depends on the allergen", () => {
    const { recommendations } = ids(
      buildReport({ ...EXCELLENT, dedicated_fryer_detail: "depends" }),
    );
    expect(recommendations).toContain("fryer.communicate_depends");
  });
});

describe("9-11. allergen menu states", () => {
  it("no menu -> create it, and the assistance section is offered", () => {
    const report = buildReport({ ...EXCELLENT, allergy_menu: "no" });
    expect(ids(report).recommendations).toContain("menu.create");
    expect(report.showAllergenMenuOffer).toBe(true);
  });

  it("in-house only -> publish it online", () => {
    const report = buildReport({ ...EXCELLENT, allergy_menu: "yes_in_house" });
    expect(ids(report).recommendations).toContain("menu.publish_online");
    expect(report.showAllergenMenuOffer).toBe(true);
  });

  it("on request -> write one down", () => {
    expect(ids(buildReport({ ...EXCELLENT, allergy_menu: "on_request" })).recommendations)
      .toContain("menu.publish_guide");
  });

  it("published online -> strength, no offer", () => {
    const report = buildReport(EXCELLENT);
    expect(ids(report).strengths).toContain("menu.online");
    expect(report.showAllergenMenuOffer).toBe(false);
  });
});

describe("12. restaurant that cannot accommodate an allergen", () => {
  it("treats stated limitations as a strength, never a penalty", () => {
    const report = buildReport(EXCELLENT);
    expect(ids(report).strengths).toContain("limitations.stated");
    expect(report.recommendations.some((r) => r.group === "allergen_limitations")).toBe(false);
  });

  it("says nothing about limitations when none were given", () => {
    const report = buildReport({ ...EXCELLENT, allergen_limitations: "" });
    expect(ids(report).strengths).not.toContain("limitations.stated");
  });
});

describe("13. missing optional responses", () => {
  it("produces a valid report from an empty answer set", () => {
    const report = buildReport({});
    expect(report.strengths).toEqual([]);
    expect(report.recommendations).toEqual([]);
    expect(report.nextSteps).toEqual([]);
    expect(report.engineVersion).toBe(ENGINE_VERSION);
  });

  /**
   * The rule that matters most here: a question nobody answered is not a "no".
   * Silence must never generate a recommendation, or every partial submission
   * would be handed advice about things it was never asked.
   */
  it("never invents a recommendation from an unanswered question", () => {
    const report = buildReport({ allergy_process: "yes_documented" });
    expect(report.recommendations).toEqual([]);
    expect(ids(report).strengths).toEqual(["process.documented"]);
  });

  it("handles a partially completed survey", () => {
    const report = buildReport({ allergy_process: "yes_informal", allergy_menu: "no" });
    expect(report.recommendations).toHaveLength(2);
    expect(report.nextSteps).toHaveLength(2);
  });
});

describe("14. legacy survey submission", () => {
  /**
   * Values from the retired v1 option set. None of them match a v2 branch, so
   * every switch falls through to its default and the report simply says less
   * — rather than guessing what "yes" once meant.
   */
  const LEGACY: Answers = {
    allergy_process: "yes",
    server_training: "yes",
    manager_chef_access: "yes",
    ingredient_info: "limited",
    kitchen_practices: ["dedicated_fryer"],
    allergens_accommodated: ["milk"],
    allergy_menu: "yes_in_house",
  };

  it("does not crash and does not fabricate strengths", () => {
    const report = buildReport(LEGACY);
    expect(ids(report).strengths).not.toContain("process.documented");
    expect(ids(report).strengths).not.toContain("training.full");
  });

  it("still reads the fields whose values are unchanged", () => {
    const { recommendations } = ids(buildReport(LEGACY));
    expect(recommendations).toContain("ingredients.improve_access");
    expect(recommendations).toContain("menu.publish_online");
  });
});

// --- invariants across every combination ------------------------------------

/** Every value each switched question can hold, plus "unanswered". */
const DOMAINS: Record<string, (string | undefined)[]> = {
  allergy_process: ["yes_documented", "yes_informal", "no_specific", "unsure", undefined],
  staff_training: [
    "servers_and_kitchen",
    "some_staff",
    "managers_chefs_only",
    "none",
    "unsure",
    undefined,
  ],
  ingredient_info: ["documented", "staff_can_check", "limited", "no", "unsure", undefined],
  allergy_menu: ["yes_online", "yes_in_house", "on_request", "no", undefined],
  dedicated_fryer_detail: ["yes", "no", "no_fryer", "depends", undefined],
};

function* everyCombination(): Generator<Answers> {
  const keys = Object.keys(DOMAINS);
  const counts = keys.map((k) => DOMAINS[k].length);
  const total = counts.reduce((a, b) => a * b, 1);

  for (let i = 0; i < total; i++) {
    const answers: Answers = {
      who_to_ask: ["manager"],
      cross_contact_steps: ["clean_surfaces", "order_flagged", "manager_verifies"],
    };
    let rest = i;
    for (let k = 0; k < keys.length; k++) {
      const domain = DOMAINS[keys[k]];
      const value = domain[rest % domain.length];
      rest = Math.floor(rest / domain.length);
      if (value !== undefined) answers[keys[k]] = value;
    }
    yield answers;
  }
}

describe("invariants over every answer combination", () => {
  const all = [...everyCombination()];

  it("covers a meaningful search space", () => {
    expect(all.length).toBe(5 * 6 * 6 * 5 * 5);
  });

  /**
   * The contradiction guarantee, stated as the pairs that would actually
   * embarrass us.
   *
   * A group emitting both a strength and a recommendation is not in itself a
   * contradiction — "staff can check packaging" plus "consider centralizing
   * that information" is one branch giving credit and a next step, which is
   * exactly what a useful report does. What must never happen is a report
   * congratulating a restaurant for the very thing it also tells them to go
   * and do. These are those pairs.
   */
  const MUTUALLY_EXCLUSIVE: [string, string][] = [
    ["menu.online", "menu.create"],
    ["menu.online", "menu.publish_online"],
    ["menu.online", "menu.publish_guide"],
    ["process.documented", "process.create_it"],
    ["process.documented", "process.document_it"],
    ["process.documented", "process.clarify"],
    ["training.full", "training.introduce"],
    ["training.full", "training.expand"],
    ["training.full", "training.extend_to_all"],
    ["ingredients.documented", "ingredients.create_reference"],
    ["ingredients.documented", "ingredients.improve_access"],
    ["ingredients.documented", "ingredients.centralize"],
    ["communication.escalation", "communication.establish_escalation"],
    ["fryer.dedicated_specified", "fryer.communicate_shared"],
    ["fryer.dedicated_specified", "fryer.specify_allergens"],
    ["limitations.stated", "limitations.stated"],
  ];

  it("never congratulates and instructs on the same thing", () => {
    for (const answers of all) {
      const report = buildReport(answers);
      const strengths = new Set(report.strengths.map((s) => s.id));
      const recs = new Set(report.recommendations.map((r) => r.id));
      for (const [strength, rec] of MUTUALLY_EXCLUSIVE) {
        expect(
          strengths.has(strength) && recs.has(rec),
          `"${strength}" and "${rec}" co-occurred for ${JSON.stringify(answers)}`,
        ).toBe(false);
      }
    }
  });

  /**
   * The structural reason the pairs above can never fire together: each
   * switched question contributes items from exactly one branch, so at most
   * one recommendation per group.
   */
  it("emits at most one recommendation per switched group", () => {
    for (const answers of all) {
      const report = buildReport(answers);
      const perGroup = new Map<string, number>();
      for (const rec of report.recommendations) {
        // cross_contact is the documented exception: practices are
        // independent rather than a switch over one answer.
        if (rec.group === "cross_contact_steps") continue;
        perGroup.set(rec.group, (perGroup.get(rec.group) ?? 0) + 1);
      }
      for (const [group, count] of perGroup) {
        expect(count, `${group} emitted ${count} recommendations`).toBe(1);
      }
    }
  });

  it("never emits duplicate ids", () => {
    for (const answers of all) {
      const report = buildReport(answers);
      const all_ids = [
        ...report.strengths.map((s) => s.id),
        ...report.recommendations.map((r) => r.id),
      ];
      expect(new Set(all_ids).size).toBe(all_ids.length);
    }
  });

  it("only ever offers menu help when there is no online menu", () => {
    for (const answers of all) {
      const report = buildReport(answers);
      expect(report.showAllergenMenuOffer).toBe(answers.allergy_menu !== "yes_online");
      if (!report.showAllergenMenuOffer) {
        expect(report.recommendations.map((r) => r.group)).not.toContain("allergy_menu");
      }
    }
  });

  it("draws next steps only from the recommendations shown", () => {
    for (const answers of all) {
      const report = buildReport(answers);
      const titles = report.recommendations.map((r) => r.title);
      for (const step of report.nextSteps) expect(titles).toContain(step);
      expect(report.nextSteps.length).toBeLessThanOrEqual(3);
    }
  });

  it("orders recommendations by priority", () => {
    const rank = { high: 0, medium: 1, low: 2 } as const;
    for (const answers of all) {
      const priorities = buildReport(answers).recommendations.map((r) => rank[r.priority]);
      expect(priorities).toEqual([...priorities].sort((a, b) => a - b));
    }
  });

  it("is deterministic", () => {
    for (const answers of all.slice(0, 200)) {
      expect(JSON.stringify(buildReport(answers))).toBe(JSON.stringify(buildReport(answers)));
    }
  });

  /**
   * The language rule, enforced over every sentence the engine can ever
   * produce rather than spot-checked on one sample report.
   */
  it("never uses safety, certification, or scoring language", () => {
    // Word boundaries matter: a bare "star" substring also matches
    // "starting point", and "grade" matches "upgrade".
    const forbidden = [
      /allergy[- ]safe/,
      /\bcertified\b/,
      /\bcertification\b/,
      /\bapproved\b/,
      /\bverified\b/,
      /\bguarantee[sd]?\b/,
      /\bscores?\b/,
      /\bgrades?\b/,
      /\bratings?\b/,
      /\bstars?\b/,
      /\bwe recommend allergy voices\b/,
    ];
    const seen = new Set<string>();
    for (const answers of all) {
      const report = buildReport(answers);
      for (const item of [...report.strengths, ...report.recommendations]) {
        seen.add(JSON.stringify(item));
      }
    }
    for (const blob of seen) {
      const lower = blob.toLowerCase();
      for (const pattern of forbidden) {
        expect(pattern.test(lower), `${pattern} matches ${blob}`).toBe(false);
      }
    }
  });

  it("keeps reports to a reviewable size", () => {
    for (const answers of all) {
      // 3-5 is the target for a typical restaurant; the ceiling is what keeps
      // the PDF within its page budget for the worst case.
      expect(buildReport(answers).recommendations.length).toBeLessThanOrEqual(8);
    }
  });
});

describe("shared-engine duplication", () => {
  /**
   * The engine inlines allergen labels because it must resolve inside a Deno
   * edge function, which cannot import from src/. That duplication is only
   * safe while the two lists agree.
   */
  it("keeps its allergen labels identical to the survey's", async () => {
    const { ALLERGEN_OPTIONS, allergenLabel } = await import("../../survey");
    for (const option of ALLERGEN_OPTIONS) {
      const report = buildReport({
        cross_contact_steps: ["dedicated_fryer"],
        dedicated_fryer_detail: "yes",
        dedicated_fryer_allergens: [option.value],
      });
      const strength = report.strengths.find((s) => s.id === "fryer.dedicated_specified");
      expect(strength?.detail, `${option.value} label drifted`).toContain(
        allergenLabel(option.value),
      );
    }
  });
});
