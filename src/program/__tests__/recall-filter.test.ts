import { describe, expect, it } from "vitest";

import {
  detectAllergens,
  detectAllergensInReason,
  isAllergenRecall,
} from "../../../scripts/ingest/shared";

/**
 * The recall page is read by families deciding whether a product is dangerous
 * to them. Two failures matter and they pull in opposite directions: showing a
 * Listeria recall as an allergen recall wastes attention and erodes trust in
 * every other entry, and missing a real undeclared-allergen recall is worse
 * than either.
 *
 * These lock the behaviour that went wrong in production, where every USDA
 * FSIS recall — Listeria, import violations, all of it — was tagged "Egg"
 * because FSIS prints "meat, poultry, or egg product" on every notice.
 */

/** Verbatim from an FSIS notice; the phrase that caused the bug. */
const FSIS_BOILERPLATE =
  "FSIS is the public health agency responsible for ensuring that the nation's commercial supply of meat, poultry, or egg product is safe, wholesome and correctly labeled and packaged.";

describe("isAllergenRecall", () => {
  it("includes recalls the agency calls an allergen problem", () => {
    for (const reason of [
      "Misbranding, Unreported Allergens",
      "Product contains undeclared milk",
      "Undeclared allergen: peanut",
      "Mislabeled — allergen not declared on the label",
      "Failure to declare wheat",
      "Cross-contact with sesame",
    ]) {
      expect(isAllergenRecall(reason), reason).toBe(true);
    }
  });

  it("excludes recalls with no allergen wording", () => {
    for (const reason of [
      "Product Contamination",
      "Listeria monocytogenes contamination",
      "Salmonella contamination",
      "Import Violation",
      "Produced without the benefit of inspection",
      "Foreign material contamination — metal fragments",
      "Product adulteration",
      "",
    ]) {
      expect(isAllergenRecall(reason), reason).toBe(false);
    }
  });
});

describe("the eight scenarios", () => {
  it("1. undeclared egg is included and tagged Egg", () => {
    expect(
      detectAllergensInReason("Misbranding, Unreported Allergens — undeclared egg"),
    ).toEqual(["egg"]);
  });

  it("2. undeclared milk and soy tags both", () => {
    const found = detectAllergensInReason(
      "Product contains undeclared milk and soy",
    );
    expect(found.sort()).toEqual(["milk", "soy"]);
  });

  it("3. Listeria contamination is excluded", () => {
    expect(
      detectAllergensInReason("Chicken salad that may be contaminated with Listeria"),
    ).toEqual([]);
  });

  it("4. import violation is excluded", () => {
    expect(detectAllergensInReason("Import Violation")).toEqual([]);
  });

  it("5. foreign-material contamination is excluded", () => {
    expect(
      detectAllergensInReason("Product Contamination — pieces of hard plastic"),
    ).toEqual([]);
  });

  /** The regression that put "Egg" on every FSIS record. */
  it("6. FSIS boilerplate mentioning egg products tags nothing", () => {
    expect(detectAllergensInReason(FSIS_BOILERPLATE)).toEqual([]);
    expect(isAllergenRecall(FSIS_BOILERPLATE)).toBe(false);
  });

  it("7. misbranding with an undeclared allergen is included", () => {
    expect(
      detectAllergensInReason(
        "Misbranding, Unreported Allergens",
        "Steak burrito containing undeclared wheat",
      ),
    ).toEqual(["wheat"]);
  });

  it("8. an allergen recall naming no allergen yields nothing to tag", () => {
    // Gate passes but nothing is named, so there is no tag to apply — and a
    // recall with no allergen is not shown on an allergen page.
    expect(detectAllergensInReason("Misbranding, Unreported Allergens")).toEqual([]);
  });
});

describe("allergen word boundaries", () => {
  it("does not read eggplant as egg", () => {
    // The old pattern was /\beggs?|albumin\b/ — the alternation bound so the
    // "egg" branch had no trailing boundary.
    expect(detectAllergens("eggplant parmesan")).not.toContain("egg");
  });

  it("still matches egg and albumin", () => {
    expect(detectAllergens("contains undeclared egg")).toContain("egg");
    expect(detectAllergens("dried albumin")).toContain("egg");
  });

  it("prefers shellfish over fish where both could match", () => {
    expect(detectAllergens("undeclared shellfish")).toContain("shellfish");
  });
});

describe("scope", () => {
  /**
   * The core rule: an allergen named anywhere on the page is not the same as
   * an allergen the agency says was the reason.
   */
  it("ignores allergens that appear only outside the reason", () => {
    const reason = "Listeria monocytogenes contamination";
    const productName = "Cheddar cheese and butter croissant";
    expect(detectAllergensInReason(reason, productName)).toEqual([]);
  });

  it("reads the product name when the reason is genuinely allergen-related", () => {
    expect(
      detectAllergensInReason("Undeclared allergen", "Peanut butter cookies"),
    ).toContain("peanut");
  });
});
