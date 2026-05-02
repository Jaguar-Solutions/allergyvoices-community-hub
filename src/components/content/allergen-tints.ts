import type { Allergen } from "@/content/schemas";

/**
 * Per-allergen subtle background tints for cards and section accents.
 * Tailwind classes (mapped to the --allergen-* HSL tokens in index.css).
 */
export const ALLERGEN_TINT_BG: Record<Allergen, string> = {
  peanut: "bg-allergen-peanut",
  "tree-nuts": "bg-allergen-tree-nuts",
  milk: "bg-allergen-milk",
  egg: "bg-allergen-egg",
  sesame: "bg-allergen-sesame",
  wheat: "bg-allergen-wheat",
  soy: "bg-allergen-soy",
  fish: "bg-allergen-fish",
  shellfish: "bg-allergen-shellfish",
};

/** Border accents in the same family (slightly more saturated). */
export const ALLERGEN_BORDER: Record<Allergen, string> = {
  peanut: "border-allergen-peanut",
  "tree-nuts": "border-allergen-tree-nuts",
  milk: "border-allergen-milk",
  egg: "border-allergen-egg",
  sesame: "border-allergen-sesame",
  wheat: "border-allergen-wheat",
  soy: "border-allergen-soy",
  fish: "border-allergen-fish",
  shellfish: "border-allergen-shellfish",
};
