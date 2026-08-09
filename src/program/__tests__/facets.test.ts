import { describe, expect, it } from "vitest";

import {
  allergenLimitations,
  allergensDiscussed,
  cardHighlights,
  crossContactSteps,
  dedicatedFryer,
  deriveFacets,
  displayFacets,
  managerOrChefAvailable,
  quickSummary,
  saysNoCrossContactProcedure,
} from "../facets";
import { ALL_QUESTIONS } from "../survey";
import type { Answers } from "../types";

/** A complete, realistic v2 answer set. */
const FULL_ANSWERS: Answers = {
  allergy_process: "yes_documented",
  staff_training: "servers_and_kitchen",
  training_type: "servsafe",
  who_to_ask: ["server", "manager", "chef"],
  ingredient_info: "documented",
  menu_modification: "most_items",
  cross_contact_steps: ["clean_surfaces", "clean_utensils", "dedicated_fryer"],
  dedicated_fryer_detail: "depends",
  dedicated_fryer_allergens: ["fish", "shellfish"],
  cross_contact_notes: "We plate allergy orders first.",
  allergens_discussed: ["milk", "peanut"],
  allergen_limitations: "Sesame is used throughout our kitchen.",
  allergy_menu: "yes_in_house",
  family_notes: "Please tell us when you book.",
  publish_consent: "yes",
  additional_comments: "Nothing else.",
  wants_website_badge: "yes",
};

describe("deriveFacets", () => {
  /**
   * The privacy guarantee the whole schema rests on. `restaurants.facets` is
   * world-readable, so anything not explicitly marked publicFacet must never
   * reach it — no matter what the form posts.
   */
  it("never publishes an answer that is not a public facet", () => {
    const facets = deriveFacets(FULL_ANSWERS);
    const privateIds = ALL_QUESTIONS.filter((q) => !q.publicFacet).map((q) => q.id);

    for (const id of privateIds) {
      expect(facets, `${id} leaked into public facets`).not.toHaveProperty(id);
    }
  });

  it("keeps private answers out even when the payload invents new keys", () => {
    const facets = deriveFacets({
      ...FULL_ANSWERS,
      manager_email: "owner@example.com",
      some_unknown_field: "surprise",
    });
    expect(facets).not.toHaveProperty("manager_email");
    expect(facets).not.toHaveProperty("some_unknown_field");
  });

  it("specifically withholds consent and free-text admin notes", () => {
    const facets = deriveFacets(FULL_ANSWERS);
    expect(facets).not.toHaveProperty("publish_consent");
    expect(facets).not.toHaveProperty("additional_comments");
  });

  it("drops empty answers rather than storing blanks", () => {
    const facets = deriveFacets({
      allergy_process: "yes_informal",
      family_notes: "   ",
      allergens_discussed: [],
    });
    expect(facets).toHaveProperty("allergy_process");
    expect(facets).not.toHaveProperty("family_notes");
    expect(facets).not.toHaveProperty("allergens_discussed");
  });
});

describe("quickSummary", () => {
  it("summarises a complete submission", () => {
    const rows = quickSummary(deriveFacets(FULL_ANSWERS));
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]));

    expect(byLabel["Allergy process"]).toBe("Yes — documented process");
    expect(byLabel["Staff allergy training"]).toBe("Yes — servers and kitchen staff");
    expect(byLabel["Manager/chef available"]).toBe("Manager or chef");
    expect(byLabel["Ingredient information"]).toBe(
      "Yes — ingredient/allergen information is documented",
    );
  });

  /**
   * The rule from the brief: never show "No" where the truth is "we never
   * asked". A blank row is honest; a fabricated negative is not.
   */
  it("omits rows for unanswered questions instead of reporting No", () => {
    const rows = quickSummary(deriveFacets({ allergy_process: "yes_informal" }));
    const labels = rows.map((r) => r.label);

    expect(labels).toContain("Allergy process");
    expect(labels).not.toContain("Staff allergy training");
    expect(labels).not.toContain("Ingredient information");
    expect(rows.every((r) => r.value !== "No")).toBe(true);
  });

  it("returns nothing at all for an empty facet set", () => {
    expect(quickSummary({})).toEqual([]);
  });
});

describe("managerOrChefAvailable", () => {
  it("is undefined when the question was never answered", () => {
    expect(managerOrChefAvailable({})).toBeUndefined();
  });

  it("does not claim a manager when only a server was named", () => {
    expect(managerOrChefAvailable({ who_to_ask: ["server"] })).toBe(
      "Server or other trained staff",
    );
  });

  it("names whichever of manager or chef was offered", () => {
    expect(managerOrChefAvailable({ who_to_ask: ["chef"] })).toBe("Chef/kitchen manager");
    expect(managerOrChefAvailable({ who_to_ask: ["manager"] })).toBe("Manager");
  });
});

describe("cross-contact", () => {
  it("strips the 'no specific procedure' sentinel from the step list", () => {
    const facets = { cross_contact_steps: ["none"] };
    expect(crossContactSteps(facets)).toEqual([]);
    expect(saysNoCrossContactProcedure(facets)).toBe(true);
  });

  it("distinguishes 'said no procedure' from 'never answered'", () => {
    expect(saysNoCrossContactProcedure({})).toBe(false);
  });

  /**
   * "Dedicated fryer" alone is routinely read as "safe for my allergy". It is
   * only ever published together with the follow-up that says what it covers.
   */
  it("does not report a dedicated fryer without the follow-up answer", () => {
    expect(dedicatedFryer({ cross_contact_steps: ["dedicated_fryer"] })).toBeUndefined();
  });

  it("reports the fryer detail and the allergens it covers", () => {
    const fryer = dedicatedFryer(deriveFacets(FULL_ANSWERS));
    expect(fryer?.label).toBe("Depends on the allergen");
    expect(fryer?.allergens).toEqual(["fish", "shellfish"]);
  });

  it("treats an explicit 'no' as no dedicated fryer to show", () => {
    expect(dedicatedFryer({ dedicated_fryer_detail: "no" })).toBeUndefined();
    expect(dedicatedFryer({ dedicated_fryer_detail: "no_fryer" })).toBeUndefined();
  });
});

describe("allergens and limitations", () => {
  it("excludes the 'other' sentinel from the tag list", () => {
    expect(allergensDiscussed({ allergens_discussed: ["milk", "other"] })).toEqual([
      "milk",
    ]);
  });

  it("publishes stated limitations", () => {
    expect(allergenLimitations(deriveFacets(FULL_ANSWERS))).toContain("Sesame");
  });

  it("has no limitations to show when none were given", () => {
    expect(allergenLimitations({})).toBeUndefined();
  });
});

describe("cardHighlights", () => {
  it("shows at most three practice answers", () => {
    expect(cardHighlights(deriveFacets(FULL_ANSWERS))).toHaveLength(3);
  });

  it("never puts cross-contact detail on a card", () => {
    const labels = cardHighlights(deriveFacets(FULL_ANSWERS)).map((h) => h.label);
    expect(labels).not.toContain("How they reduce cross-contact");
    expect(labels).not.toContain("Dedicated fryer");
  });

  it("skips answers the restaurant did not give", () => {
    expect(cardHighlights({})).toEqual([]);
  });
});

/**
 * Rows written before the survey was rewritten still hold values like
 * "yes" for questions whose options are now "yes_documented"/"yes_informal".
 * The rule is that we never guess what an old value meant, and never render
 * the raw token.
 */
describe("legacy facets from an older survey version", () => {
  const LEGACY = {
    allergy_process: "yes",
    server_training: "yes",
    ingredient_info: "limited",
    menu_modification: "some_items",
    manager_chef_access: "yes",
    allergens_accommodated: ["milk", "egg"],
    kitchen_practices: ["dedicated_fryer"],
    allergy_menu: "yes_in_house",
    family_notes: "ask for manager",
  };

  it("never renders a raw stored token as an answer", () => {
    const values = quickSummary(LEGACY).map((r) => r.value);
    expect(values).not.toContain("yes");
    expect(values).not.toContain("limited");
    for (const value of values) {
      expect(value[0]).toBe(value[0].toUpperCase());
    }
  });

  it("still shows values that remain valid options", () => {
    const byLabel = Object.fromEntries(quickSummary(LEGACY).map((r) => [r.label, r.value]));
    expect(byLabel["Menu changes"]).toBe("Some items");
    expect(byLabel["Allergen menu"]).toBe("Yes — available in the restaurant");
    expect(byLabel["Allergy process"]).toBeUndefined();
  });

  it("does not resurrect retired questions as allergens or steps", () => {
    expect(allergensDiscussed(LEGACY)).toEqual([]);
    expect(crossContactSteps(LEGACY)).toEqual([]);
    expect(dedicatedFryer(LEGACY)).toBeUndefined();
  });

  it("renders each question at most once across summary and overflow", () => {
    const facets = deriveFacets(FULL_ANSWERS);
    const summaryIds = quickSummary(facets).map((r) => r.questionId);
    const overflowIds = displayFacets(facets).map((f) => f.questionId);
    for (const id of summaryIds) {
      expect(overflowIds, `${id} rendered twice`).not.toContain(id);
    }
  });
});

/**
 * The order families read the page in. Locked down because the summary is
 * assembled in code rather than in the JSX, so a reordering here silently
 * changes the profile without touching the profile component.
 */
describe("quick summary ordering", () => {
  it("follows the published hierarchy", () => {
    const ids = quickSummary(deriveFacets(FULL_ANSWERS)).map((r) => r.questionId);
    expect(ids).toEqual([
      "allergy_process",
      "staff_training",
      "who_to_ask",
      "ingredient_info",
      "menu_modification",
      "allergy_menu",
    ]);
  });

  it("keeps that order when some answers are missing", () => {
    const ids = quickSummary({
      allergy_menu: "on_request",
      allergy_process: "yes_informal",
    }).map((r) => r.questionId);
    expect(ids).toEqual(["allergy_process", "allergy_menu"]);
  });
});
