#!/usr/bin/env tsx
/**
 * Re-applies the allergen filter to recall records already on disk.
 *
 * The ingesters previously tagged an allergen found anywhere in a notice,
 * which meant every USDA FSIS record was tagged "Egg" — FSIS prints "meat,
 * poultry, or egg product" on every one — and Listeria and import-violation
 * recalls appeared on a page families read for allergen risk.
 *
 * Fixing the parser does not fix what it already wrote, so this re-runs the
 * corrected rules over stored records and reports what it would change.
 *
 *   npx tsx scripts/ingest/reprocess-recalls.ts          # dry run
 *   npx tsx scripts/ingest/reprocess-recalls.ts --apply  # write changes
 */

import { readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

import { CONTENT_DIR, detectAllergensInReason, isAllergenRecall } from "./shared.js";

const RECALLS_DIR = join(CONTENT_DIR, "recalls");
const APPLY = process.argv.includes("--apply");

interface Frontmatter {
  product_name?: string;
  undeclared_allergens?: string[];
  recall_reason?: string;
  agency?: string;
  agency_recall_id?: string;
  [key: string]: unknown;
}

function parse(raw: string): { fm: Frontmatter; body: string } | null {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  return { fm: (yaml.load(match[1]) ?? {}) as Frontmatter, body: match[2] };
}

const removed: string[] = [];
const retagged: { file: string; from: string[]; to: string[] }[] = [];
const deduped: string[] = [];
const kept: string[] = [];

const seenIds = new Map<string, string>();

for (const file of readdirSync(RECALLS_DIR).filter((f) => f.endsWith(".md")).sort()) {
  const path = join(RECALLS_DIR, file);
  const parsed = parse(readFileSync(path, "utf8"));
  if (!parsed) continue;

  const { fm, body } = parsed;
  const reason = fm.recall_reason ?? "";
  const product = fm.product_name ?? "";
  const current = (fm.undeclared_allergens ?? []) as string[];

  // 1. Not an allergen recall at all.
  if (!isAllergenRecall(reason)) {
    removed.push(`${file}  [${reason || "no reason"}]`);
    if (APPLY) unlinkSync(path);
    continue;
  }

  // 2. Allergen recall, but the tags were derived from the wrong text.
  // Reason only, matching the ingesters. A product name enumerates
  // ingredients; the reason names what was undeclared.
  const correct = detectAllergensInReason(reason);
  if (correct.length === 0) {
    removed.push(`${file}  [allergen reason, no allergen named]`);
    if (APPLY) unlinkSync(path);
    continue;
  }

  // 3. Same agency recall id already kept — a duplicate from two runs.
  const id = fm.agency_recall_id;
  if (id && seenIds.has(id)) {
    deduped.push(`${file}  [duplicate of ${seenIds.get(id)}]`);
    if (APPLY) unlinkSync(path);
    continue;
  }
  if (id) seenIds.set(id, file);

  const changed =
    correct.length !== current.length ||
    correct.some((a) => !current.includes(a));

  if (changed) {
    retagged.push({ file, from: current, to: correct });
    if (APPLY) {
      const next = { ...fm, undeclared_allergens: correct };
      writeFileSync(
        path,
        `---\n${yaml.dump(next, { lineWidth: 120, noRefs: true })}---\n\n${body.trim()}\n`,
        "utf8",
      );
    }
  } else {
    kept.push(file);
  }
}

const heading = APPLY ? "APPLIED" : "DRY RUN — pass --apply to write";
console.log(`\n=== Recall reprocessing (${heading}) ===\n`);

console.log(`Removed as non-allergen recalls: ${removed.length}`);
for (const r of removed) console.log(`  - ${r}`);

console.log(`\nRe-tagged: ${retagged.length}`);
for (const r of retagged) {
  console.log(`  ~ ${r.file}\n      ${r.from.join(", ") || "none"}  ->  ${r.to.join(", ")}`);
}

console.log(`\nDeduplicated: ${deduped.length}`);
for (const d of deduped) console.log(`  - ${d}`);

console.log(`\nUnchanged: ${kept.length}`);
console.log(
  `\nTotal after: ${kept.length + retagged.length} of ${
    kept.length + retagged.length + removed.length + deduped.length
  }\n`,
);
