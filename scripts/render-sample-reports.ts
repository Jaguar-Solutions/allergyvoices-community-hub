/**
 * Renders sample improvement reports to disk for visual inspection.
 *
 * Development tool, not part of the build. It exercises the same renderer the
 * edge function uses, so a layout regression shows up here before anything is
 * deployed. Deliberately covers the awkward cases: a very long restaurant
 * name, a very long free-text answer, a report with almost no
 * recommendations, and one with many.
 *
 *   npx tsx scripts/render-sample-reports.ts [outDir]
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { buildReport } from "../src/program/report/engine";
import {
  renderReportPdf,
  reportFilename,
} from "../supabase/functions/_shared/report-pdf";
import { REPORT_ASSETS } from "../supabase/functions/_shared/report-assets";
import type { Answers } from "../src/program/types";

const OUT = process.argv[2] ?? "/tmp/av-reports";
const GENERATED_AT = new Date("2026-08-10T12:00:00Z");

// The same embedded module the edge function uses, so a locally inspected
// PDF is byte-identical to a deployed one.
const assets = REPORT_ASSETS;

const LONG_TEXT =
  "Because sesame seeds are used across our bakery section and in several of our house-made sauces, dressings and finishing oils, we are generally not able to guarantee that any item leaving our kitchen is free of sesame. We would rather tell you that plainly than have a family arrive and find out at the table. We are happy to talk through the menu with any guest before they order, and our kitchen manager is available during all service hours to answer questions about specific dishes, preparation methods, shared equipment and the fryers we use for different products.";

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
  allergen_limitations: LONG_TEXT,
  allergy_menu: "yes_online",
};

const MINIMAL: Answers = {
  allergy_process: "no_specific",
  staff_training: "none",
  who_to_ask: ["server"],
  ingredient_info: "no",
  menu_modification: "rarely",
  cross_contact_steps: ["none"],
  allergy_menu: "no",
};

const MIDDLING: Answers = {
  allergy_process: "yes_informal",
  staff_training: "some_staff",
  training_type: "internal",
  who_to_ask: ["server", "manager"],
  ingredient_info: "staff_can_check",
  cross_contact_steps: ["wash_hands_gloves", "clean_surfaces", "dedicated_fryer"],
  dedicated_fryer_detail: "depends",
  dedicated_fryer_allergens: ["fish"],
  allergy_menu: "yes_in_house",
};

const SAMPLES: {
  label: string;
  name: string;
  city: string;
  state: string;
  answers: Answers;
}[] = [
  { label: "excellent-short-name", name: "Nio", city: "Cary", state: "NC", answers: EXCELLENT },
  {
    label: "minimal-many-recommendations",
    name: "Bella Vista Trattoria & Wood-Fired Pizzeria of North Raleigh",
    city: "Raleigh",
    state: "NC",
    answers: MINIMAL,
  },
  {
    label: "middling-mixed",
    name: "The Fixture Kitchen",
    city: "Durham",
    state: "NC",
    answers: MIDDLING,
  },
  {
    label: "sparse-answers",
    name: "Corner Café",
    city: "Apex",
    state: "NC",
    answers: { allergy_process: "yes_documented" },
  },
  {
    label: "legacy-v1-submission",
    name: "Legacy Diner",
    city: "Cary",
    state: "NC",
    answers: {
      allergy_process: "yes",
      server_training: "yes",
      ingredient_info: "limited",
      allergy_menu: "yes_in_house",
    },
  },
];

async function main() {
  mkdirSync(OUT, { recursive: true });

  for (const sample of SAMPLES) {
    const report = buildReport(sample.answers);
    const bytes = await renderReportPdf({
      restaurantName: sample.name,
      city: sample.city,
      state: sample.state,
      generatedAt: GENERATED_AT,
      report,
      assets,
    });

    const path = join(OUT, `${sample.label}.pdf`);
    writeFileSync(path, bytes);

    // Page count is a requirement, not a curiosity: the report targets 3-5
    // pages and must not pad or clip to get there.
    const { PDFDocument } = await import("pdf-lib");
    const pages = (await PDFDocument.load(bytes)).getPageCount();

    console.log(
      `${sample.label.padEnd(30)} ${String(pages).padStart(2)}pp  ` +
        `${String(Math.round(bytes.length / 1024)).padStart(4)}KB  ` +
        `${String(report.strengths.length).padStart(2)} strengths, ` +
        `${report.recommendations.length} recs  ` +
        `${reportFilename(sample.name, GENERATED_AT)}`,
    );
  }
  console.log(`\nWrote ${SAMPLES.length} reports to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
