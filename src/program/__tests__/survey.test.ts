import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  ALL_QUESTIONS,
  SURVEY_SCHEMA_VERSION,
  SURVEY_SECTIONS,
  isQuestionVisible,
} from "../survey";

describe("survey definition", () => {
  it("has unique question ids", () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the survey to four sections", () => {
    // The point of the v2 rewrite. A fifth section creeping back in is the
    // failure mode that turns a 5-minute form into a 15-minute one.
    expect(SURVEY_SECTIONS).toHaveLength(4);
  });

  it("only references questions that exist in showWhen", () => {
    const ids = new Set(ALL_QUESTIONS.map((q) => q.id));
    for (const question of ALL_QUESTIONS) {
      if (!question.showWhen) continue;
      expect(ids, `${question.id} depends on a missing question`).toContain(
        question.showWhen.question,
      );
    }
  });

  it("only references option values that exist in showWhen", () => {
    const byId = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
    for (const question of ALL_QUESTIONS) {
      if (!question.showWhen) continue;
      const parent = byId.get(question.showWhen.question);
      const allowed = parent?.options?.map((o) => o.value) ?? [];
      const wanted = Array.isArray(question.showWhen.value)
        ? question.showWhen.value
        : [question.showWhen.value];
      for (const value of wanted) {
        expect(allowed, `${question.id} waits on an impossible value`).toContain(value);
      }
    }
  });

  it("gives every public facet a short label", () => {
    // The profile lays answers out in narrow columns; the full question text
    // ("Can staff access ingredient information when...") does not fit.
    for (const question of ALL_QUESTIONS) {
      if (!question.publicFacet) continue;
      expect(question.publicLabel, `${question.id} has no publicLabel`).toBeTruthy();
    }
  });

  /**
   * The program's central promise, enforced rather than remembered. These
   * words on a listing would turn a description of practices into a claim
   * about safety.
   */
  it("never uses certification language anywhere restaurant-facing", () => {
    const forbidden = [
      "certified",
      "certification",
      "approved",
      "allergy safe",
      "allergy-safe",
      "verified safe",
      "recommended",
      "guarantee",
    ];

    const surfaces: string[] = [];
    for (const question of ALL_QUESTIONS) {
      surfaces.push(question.label, question.publicLabel ?? "", question.explainer ?? "");
      for (const option of question.options ?? []) surfaces.push(option.label);
    }

    for (const text of surfaces) {
      const lower = text.toLowerCase();
      for (const word of forbidden) {
        expect(
          lower.includes(word),
          `"${text}" uses forbidden term "${word}"`,
        ).toBe(false);
      }
    }
  });

  it("keeps the paid allergen-menu service out of the survey", () => {
    // It belongs on the confirmation page, after the free listing is secured.
    // Word boundaries matter here: a bare "fee" substring also matches
    // "feel prepared to discuss", which is legitimate survey copy.
    const everything = JSON.stringify(SURVEY_SECTIONS).toLowerCase();
    expect(everything).not.toMatch(/\bfees?\b/);
    expect(everything).not.toMatch(/\bpricing\b/);
    expect(everything).not.toContain("wants_menu_help");
  });

  it("matches the schema version the submit function writes", () => {
    // The edge function runs on Deno and cannot import from src/, so the
    // constant is duplicated there. This is what keeps the copies honest.
    const source = readFileSync(
      fileURLToPath(
        new URL(
          "../../../supabase/functions/restaurant-submit/index.ts",
          import.meta.url,
        ),
      ),
      "utf8",
    );
    const match = source.match(/schema_version:\s*(\d+)/);
    expect(match, "no schema_version found in restaurant-submit").not.toBeNull();
    expect(Number(match![1])).toBe(SURVEY_SCHEMA_VERSION);
  });
});

describe("isQuestionVisible", () => {
  const fryerFollowUp = ALL_QUESTIONS.find((q) => q.id === "dedicated_fryer_detail")!;
  const fryerAllergens = ALL_QUESTIONS.find(
    (q) => q.id === "dedicated_fryer_allergens",
  )!;

  it("hides a conditional question when nothing is answered", () => {
    expect(isQuestionVisible(fryerFollowUp, {})).toBe(false);
  });

  it("shows a follow-up when a multi-select includes the trigger", () => {
    expect(
      isQuestionVisible(fryerFollowUp, {
        cross_contact_steps: ["clean_surfaces", "dedicated_fryer"],
      }),
    ).toBe(true);
  });

  it("hides a follow-up when the multi-select lacks the trigger", () => {
    expect(
      isQuestionVisible(fryerFollowUp, { cross_contact_steps: ["clean_surfaces"] }),
    ).toBe(false);
  });

  it("accepts any of several trigger values", () => {
    expect(
      isQuestionVisible(fryerAllergens, { dedicated_fryer_detail: "depends" }),
    ).toBe(true);
    expect(isQuestionVisible(fryerAllergens, { dedicated_fryer_detail: "yes" })).toBe(
      true,
    );
    expect(isQuestionVisible(fryerAllergens, { dedicated_fryer_detail: "no" })).toBe(
      false,
    );
  });
});
