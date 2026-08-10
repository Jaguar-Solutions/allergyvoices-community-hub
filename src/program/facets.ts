/**
 * Turning survey answers into published, publicly readable facets.
 *
 * `restaurants.facets` is the only place public visitors read answers from —
 * `restaurant_submissions` is never exposed. Anything not marked
 * `publicFacet` in the survey definition therefore stays private by
 * construction rather than by remembering to filter it at render time.
 *
 * Every accessor here returns `undefined` for an unanswered question rather
 * than a falsy default. A restaurant that was never asked something must not
 * be rendered as having answered "No" — see `docs/RESTAURANT_PROGRAM.md`.
 */

import { ALL_QUESTIONS, getQuestion, optionLabel, optionLabels } from "./survey";
import type { Answers, Facets } from "./types";

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** Build the published facet object from a full answer set. */
export function deriveFacets(answers: Answers): Facets {
  const facets: Facets = {};
  for (const question of ALL_QUESTIONS) {
    if (!question.publicFacet) continue;
    const value = answers[question.id];
    if (isEmpty(value)) continue;
    facets[question.id] = Array.isArray(value) ? [...value] : value;
  }
  return facets;
}

function single(facets: Facets, id: string): string | undefined {
  const v = facets[id];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/**
 * The display label for a stored value, or undefined if we don't recognize it.
 *
 * `optionLabel` passes unknown values through unchanged, which is right for
 * free text but wrong for a choice question: a listing stored before the
 * question was rewritten holds values like "yes" that no longer map to an
 * option, and passing it through renders a raw internal token — a bare
 * lowercase "yes" — as though it were the restaurant's answer.
 *
 * Rather than guess what an old value meant, we decline to display it. The
 * row disappears, which reads as "not provided" and is true, instead of
 * asserting something the restaurant never said in these terms.
 */
function knownLabel(questionId: string, value: string | undefined): string | undefined {
  if (!value) return undefined;
  const options = getQuestion(questionId)?.options;
  if (!options) return value;
  return options.find((o) => o.value === value)?.label;
}

function multi(facets: Facets, id: string): string[] {
  const v = facets[id];
  return Array.isArray(v) ? v : [];
}

export interface DisplayFacet {
  questionId: string;
  label: string;
  /** Rendered value(s), already converted from stored values to labels. */
  values: string[];
  /** Free text answers render as a paragraph rather than chips. */
  isProse: boolean;
  /** Plain-language explanation of what this answer means for a visitor. */
  explainer?: string;
}

/**
 * Questions the profile page lays out itself, in its own order and its own
 * components. Excluded from the generic list so they can't render twice.
 */
const HANDLED_BY_PROFILE = new Set([
  "allergy_menu",
  "allergy_menu_url",
  "allergens_discussed",
  "allergens_other",
  "allergen_limitations",
  "family_notes",
  "cross_contact_steps",
  "cross_contact_notes",
  "dedicated_fryer_detail",
  "dedicated_fryer_allergens",
  "allergy_process",
  "staff_training",
  "who_to_ask",
  "ingredient_info",
  "menu_modification",
]);

/**
 * Anything published that the profile does not lay out explicitly. Keeps new
 * survey questions visible on profiles without anyone having to remember to
 * add a block for them.
 */
export function displayFacets(facets: Facets): DisplayFacet[] {
  const out: DisplayFacet[] = [];
  for (const question of ALL_QUESTIONS) {
    if (!question.publicFacet) continue;
    if (HANDLED_BY_PROFILE.has(question.id)) continue;
    const value = facets[question.id];
    if (isEmpty(value)) continue;

    const isProse = question.type === "textarea" || question.type === "text";
    const values = Array.isArray(value)
      ? optionLabels(question.id, value)
      : [isProse ? value : optionLabel(question.id, value)];

    out.push({
      questionId: question.id,
      label: question.publicLabel ?? question.label,
      values,
      isProse,
      explainer: question.explainer,
    });
  }
  return out;
}

export interface SummaryRow {
  questionId: string;
  label: string;
  value: string;
  explainer?: string;
}

/**
 * Whether a guest can reach someone responsible for the food.
 *
 * Derived rather than asked: "who can they speak with" is a multi-select, and
 * a family scanning the page wants the one-line version. Absent when the
 * question went unanswered — not "No".
 */
export function managerOrChefAvailable(facets: Facets): string | undefined {
  const people = multi(facets, "who_to_ask");
  if (people.length === 0) return undefined;
  const manager = people.includes("manager");
  const chef = people.includes("chef");
  if (manager && chef) return "Manager or chef";
  if (manager) return "Manager";
  if (chef) return "Chef/kitchen manager";
  return "Server or other trained staff";
}

/**
 * The scannable block at the top of a profile: the handful of answers a
 * family checks before deciding whether to read the rest.
 *
 * Rows for unanswered questions are omitted entirely. Showing "Ingredient
 * information — No" for a restaurant that was never asked would be a
 * fabrication, and it is the exact failure this program exists to avoid.
 */
export function quickSummary(facets: Facets): SummaryRow[] {
  const rows: SummaryRow[] = [];

  const add = (questionId: string, label: string, value: string | undefined) => {
    if (!value) return;
    rows.push({
      questionId,
      label,
      value,
      explainer: getQuestion(questionId)?.explainer,
    });
  };

  add("allergy_process", "Allergy process", knownLabel("allergy_process", single(facets, "allergy_process")));
  add("staff_training", "Staff allergy training", knownLabel("staff_training", single(facets, "staff_training")));
  add("who_to_ask", "Manager/chef available", managerOrChefAvailable(facets));
  add("ingredient_info", "Ingredient information", knownLabel("ingredient_info", single(facets, "ingredient_info")));
  add("menu_modification", "Menu changes", knownLabel("menu_modification", single(facets, "menu_modification")));
  add("allergy_menu", "Allergen menu", knownLabel("allergy_menu", single(facets, "allergy_menu")));

  return rows;
}

export interface CardHighlight {
  label: string;
  value: string;
  /**
   * Which icon to draw beside it.
   *
   * A key rather than a component: this module is imported by the PDF
   * renderer and the ingest scripts as well as the UI, and none of those can
   * resolve a React icon. The card maps the key to a glyph.
   */
  icon: "process" | "training" | "people" | "ingredients" | "menu";
}

/**
 * The practice answers a directory card shows.
 *
 * Deliberately the restaurant's own answer ("Menu changes: Some items")
 * rather than a checkmark or a pass/fail. A checkmark implies a threshold
 * someone decided on; the answer itself just reports what was shared, which
 * is the whole point of the program. Detailed cross-contact steps belong on
 * the profile, not here.
 */
export function cardHighlights(facets: Facets): CardHighlight[] {
  const highlights: CardHighlight[] = [];

  const process = knownLabel("allergy_process", single(facets, "allergy_process"));
  if (process) {
    highlights.push({ label: "Allergy process", value: process, icon: "process" });
  }

  const training = knownLabel("staff_training", single(facets, "staff_training"));
  if (training) {
    highlights.push({ label: "Staff training", value: training, icon: "training" });
  }

  const manager = managerOrChefAvailable(facets);
  if (manager) {
    highlights.push({ label: "Can speak with", value: manager, icon: "people" });
  }

  const ingredients = knownLabel("ingredient_info", single(facets, "ingredient_info"));
  if (ingredients) {
    highlights.push({
      label: "Ingredient info",
      value: ingredients,
      icon: "ingredients",
    });
  }

  return highlights;
}

export interface AllergenMenuInfo {
  /** The restaurant's answer, e.g. "Yes — published online". */
  label: string;
  /** Present only when they published one we can link to. */
  url?: string;
  /** True when a menu exists in some form, online or not. */
  available: boolean;
}

/**
 * The allergen menu, if the restaurant has one.
 *
 * Pulled out of the ordered facet list because it is the single most
 * actionable thing on the page: a family can check a menu before they leave
 * the house. Note there is deliberately no directory filter for it — see
 * docs/RESTAURANT_PROGRAM.md.
 */
export function allergenMenu(facets: Facets): AllergenMenuInfo | undefined {
  const answer = single(facets, "allergy_menu");
  if (!answer || answer === "no") return undefined;

  const label = knownLabel("allergy_menu", answer);
  if (!label) return undefined;

  const url = single(facets, "allergy_menu_url");
  return { label, url, available: true };
}

/**
 * Allergies this restaurant said it regularly gets asked about.
 *
 * Named for what it is. The old name ("accommodated") invited exactly the
 * reading the program forbids — that selecting an allergen is a promise
 * about a meal.
 */
export function allergensDiscussed(facets: Facets): string[] {
  return multi(facets, "allergens_discussed").filter((a) => a !== "other");
}

export function otherAllergens(facets: Facets): string | undefined {
  return single(facets, "allergens_other");
}

/** Cross-contact steps, excluding the "no specific procedure" sentinel. */
export function crossContactSteps(facets: Facets): string[] {
  return multi(facets, "cross_contact_steps").filter((p) => p !== "none");
}

/**
 * True only when the restaurant explicitly said it has no specific procedure
 * — which is a real, publishable answer, and different from not answering.
 */
export function saysNoCrossContactProcedure(facets: Facets): boolean {
  return multi(facets, "cross_contact_steps").includes("none");
}

export interface FryerDetail {
  label: string;
  allergens: string[];
}

/**
 * The dedicated-fryer follow-up. Returns undefined unless the restaurant both
 * claimed a dedicated fryer and told us what it means, so the bare phrase can
 * never reach a profile on its own.
 */
export function dedicatedFryer(facets: Facets): FryerDetail | undefined {
  const answer = single(facets, "dedicated_fryer_detail");
  if (!answer || answer === "no" || answer === "no_fryer") return undefined;
  const label = knownLabel("dedicated_fryer_detail", answer);
  if (!label) return undefined;
  return { label, allergens: multi(facets, "dedicated_fryer_allergens") };
}

/** Free-text notes the restaurant wrote for families, if any. */
export function familyNotes(facets: Facets): string | undefined {
  return single(facets, "family_notes");
}

export function crossContactNotes(facets: Facets): string | undefined {
  return single(facets, "cross_contact_notes");
}

/** What the restaurant told us it generally cannot accommodate. */
export function allergenLimitations(facets: Facets): string | undefined {
  return single(facets, "allergen_limitations");
}

/** Label lookup used by the profile's short summary rows. */
export function facetLabel(questionId: string): string {
  const q = getQuestion(questionId);
  return q?.publicLabel ?? q?.label ?? questionId;
}
