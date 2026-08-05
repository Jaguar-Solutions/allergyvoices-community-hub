/**
 * Turning survey answers into published, publicly readable facets.
 *
 * `restaurants.facets` is the only place public visitors read answers from —
 * `restaurant_submissions` is never exposed. Anything not marked
 * `publicFacet` in the survey definition therefore stays private by
 * construction rather than by remembering to filter it at render time.
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
 * The profile page's ordered list of what this restaurant shared. Order
 * follows the survey, so the page reads the way the form was filled in.
 */
export function displayFacets(facets: Facets): DisplayFacet[] {
  const out: DisplayFacet[] = [];
  for (const question of ALL_QUESTIONS) {
    if (!question.publicFacet) continue;
    // Rendered separately and prominently by the profile page.
    if (question.id === "allergy_menu" || question.id === "allergy_menu_url") continue;
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

function single(facets: Facets, id: string): string | undefined {
  const v = facets[id];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function multi(facets: Facets, id: string): string[] {
  const v = facets[id];
  return Array.isArray(v) ? v : [];
}

export interface CardHighlight {
  label: string;
  value: string;
}

/**
 * The four things a directory card shows about a restaurant's practices.
 *
 * These deliberately show the restaurant's own answer ("Menu modifications:
 * Some items") rather than a checkmark or a pass/fail. A checkmark implies a
 * threshold someone decided on; the answer itself just reports what was
 * shared, which is the whole point of the program.
 */
export function cardHighlights(facets: Facets): CardHighlight[] {
  const highlights: CardHighlight[] = [];

  // Labels read as short statements ("Has an allergy process: Yes") rather
  // than as bare topics. "Allergy discussions: Yes" tells a parent nothing.
  const process = single(facets, "allergy_process");
  if (process) {
    highlights.push({
      label: "Has an allergy process",
      value: optionLabel("allergy_process", process),
    });
  }

  const manager = single(facets, "manager_chef_access");
  if (manager) {
    highlights.push({
      label: "Talk to a manager or chef",
      value: optionLabel("manager_chef_access", manager),
    });
  }

  const menu = single(facets, "menu_modification");
  if (menu) {
    highlights.push({
      label: "Can change dishes",
      value: optionLabel("menu_modification", menu),
    });
  }

  const ingredients = single(facets, "ingredient_info");
  if (ingredients) {
    highlights.push({
      label: "Shares ingredient info",
      value: optionLabel("ingredient_info", ingredients),
    });
  }

  return highlights;
}

export interface AllergenMenuInfo {
  /** The restaurant's answer, e.g. "Yes — it's published online". */
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

  const url = single(facets, "allergy_menu_url");
  return {
    label: optionLabel("allergy_menu", answer),
    url,
    available: true,
  };
}

/** Allergens this restaurant said it can typically accommodate. */
export function accommodatedAllergens(facets: Facets): string[] {
  return multi(facets, "allergens_accommodated").filter((a) => a !== "other");
}

/** Kitchen practices, excluding the "none of the above" sentinel. */
export function kitchenPractices(facets: Facets): string[] {
  return multi(facets, "kitchen_practices").filter((p) => p !== "none");
}

export function hasKitchenPractice(facets: Facets, practice: string): boolean {
  return multi(facets, "kitchen_practices").includes(practice);
}

/** Free-text notes the restaurant wrote for families, if any. */
export function familyNotes(facets: Facets): string | undefined {
  return single(facets, "family_notes");
}

export function crossContactNotes(facets: Facets): string | undefined {
  return single(facets, "cross_contact_practices");
}

/** Label lookup used by the profile's short summary rows. */
export function facetLabel(questionId: string): string {
  const q = getQuestion(questionId);
  return q?.publicLabel ?? q?.label ?? questionId;
}
