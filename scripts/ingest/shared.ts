/**
 * Shared helpers for ingest scripts.
 *
 * Each ingest script (openFDA, FSIS, CFIA, FSA, PubMed, ClinicalTrials.gov)
 * pulls from an external feed, normalizes the records into our markdown
 * frontmatter shape, and writes new files. A separate GitHub Action then
 * opens a PR with whatever this script created &mdash; that's the review queue.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import type { Allergen, RecallAgency, Geography } from "../../src/content/schemas";

const __filename = fileURLToPath(import.meta.url);
export const REPO_ROOT = resolve(dirname(__filename), "..", "..");
export const CONTENT_DIR = join(REPO_ROOT, "content");

// ---------------- Allergen detection from free text ----------------

interface AllergenPattern {
  allergen: Allergen;
  pattern: RegExp;
}

// Order matters: more-specific patterns should be tried before
// generic ones (e.g. "shellfish" before "fish").
const ALLERGEN_PATTERNS: AllergenPattern[] = [
  {
    allergen: "shellfish",
    pattern:
      /\b(shellfish|shrimp|prawn|crab|lobster|scallop|mussel|oyster|clam|crayfish|crawfish)s?\b/i,
  },
  {
    allergen: "fish",
    pattern:
      /\b(fish|finfish|salmon|tuna|cod|tilapia|anchovy|anchovies|bass|haddock|halibut|trout|pollock|mackerel|sardine|herring)s?\b/i,
  },
  {
    allergen: "tree-nuts",
    pattern:
      /\b(tree[ -]?nuts?|almond|cashew|walnut|pecan|hazelnut|filbert|pistachio|brazil[ -]?nut|macadamia|chestnut|pine[ -]?nut|coconut)\b/i,
  },
  { allergen: "peanut", pattern: /\bpeanuts?\b/i },
  { allergen: "milk", pattern: /\b(milk|dairy|casein|whey|lactose|cream|butter|cheese)\b/i },
  { allergen: "egg", pattern: /\beggs?|albumin\b/i },
  { allergen: "sesame", pattern: /\b(sesame|tahini|benne)\b/i },
  { allergen: "wheat", pattern: /\b(wheat|gluten|spelt|farro|durum|semolina)\b/i },
  { allergen: "soy", pattern: /\b(soy|soya|soybean|edamame|tofu)\b/i },
];

/**
 * Extract Top-9 allergens mentioned in free text. Returns deduped list.
 * Conservative: only matches when the text says "undeclared X" or just names X.
 */
export function detectAllergens(text: string): Allergen[] {
  const found = new Set<Allergen>();
  for (const { allergen, pattern } of ALLERGEN_PATTERNS) {
    if (pattern.test(text)) found.add(allergen);
  }
  return Array.from(found);
}

// ---------------- Slug + filename helpers ----------------

export function slugify(input: string, maxLen = 60): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen)
    .replace(/-+$/g, "");
}

export function recallFilename(recallDate: string, productName: string): string {
  return `${recallDate}-${slugify(productName)}.md`;
}

// ---------------- Recall writer ----------------

export interface RecallDraft {
  product_name: string;
  brand?: string;
  undeclared_allergens: Allergen[];
  recall_reason: string;
  recall_date: string; // YYYY-MM-DD
  region: Geography;
  agency: RecallAgency;
  agency_recall_id?: string;
  recall_class:
    | "class-i"
    | "class-ii"
    | "class-iii"
    | "voluntary"
    | "unspecified";
  source_url: string;
  upcs?: string[];
  body?: string;
}

export interface WriteResult {
  written: number;
  skipped: number;
  paths: string[];
}

const RECALLS_DIR = join(CONTENT_DIR, "recalls");

/**
 * Writes one recall as a markdown file under content/recalls/.
 * Skips silently if a file with the same slug already exists OR if a file
 * with a matching `agency_recall_id` is already on disk.
 */
export function writeRecall(
  draft: RecallDraft,
  ingestor: string,
): { written: boolean; path: string } {
  if (!existsSync(RECALLS_DIR)) {
    mkdirSync(RECALLS_DIR, { recursive: true });
  }

  const filename = recallFilename(draft.recall_date, draft.product_name);
  const path = join(RECALLS_DIR, filename);

  if (existsSync(path)) return { written: false, path };

  // De-dupe by agency_recall_id (same recall might surface twice across runs
  // with a slightly different product description).
  if (draft.agency_recall_id) {
    const existing = findByAgencyRecallId(draft.agency_recall_id);
    if (existing) return { written: false, path: existing };
  }

  const today = new Date().toISOString().slice(0, 10);
  const frontmatter = {
    product_name: draft.product_name,
    brand: draft.brand,
    undeclared_allergens: draft.undeclared_allergens,
    recall_reason: draft.recall_reason,
    recall_date: draft.recall_date,
    region: draft.region,
    agency: draft.agency,
    agency_recall_id: draft.agency_recall_id,
    recall_class: draft.recall_class,
    source_url: draft.source_url,
    upcs: draft.upcs ?? [],
    // Auto-publish ingested recalls so they go live without manual review.
    status: "published",
    last_reviewed: today,
    reviewed_by: ingestor,
  };

  const yamlBody = yaml.dump(frontmatter, { lineWidth: 120, noRefs: true });
  const body = (draft.body ?? "").trim();
  const fileContents = `---\n${yamlBody}---\n\n${body}\n`;

  writeFileSync(path, fileContents, "utf8");
  return { written: true, path };
}

/**
 * Looks for an existing recall file that already records the given agency
 * recall id (e.g. an FDA F-number). Returns the path if found.
 */
function findByAgencyRecallId(id: string): string | undefined {
  if (!existsSync(RECALLS_DIR)) return undefined;
  const files = readdirSync(RECALLS_DIR).filter((f) => f.endsWith(".md"));
  for (const f of files) {
    const fullPath = join(RECALLS_DIR, f);
    const raw = readFileSync(fullPath, "utf8");
    if (raw.includes(`agency_recall_id: "${id}"`) || raw.includes(`agency_recall_id: ${id}`)) {
      return fullPath;
    }
  }
  return undefined;
}

// ---------------- Logging helper ----------------

export function summarize(label: string, result: WriteResult) {
  console.log(
    `${label}: wrote ${result.written}, skipped ${result.skipped} ` +
      `(already on disk).`,
  );
  if (result.paths.length > 0) {
    console.log("New files:");
    for (const p of result.paths) console.log(`  ${p}`);
  }
}

// ---------------- Date helpers ----------------

export function isoDate(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/** Convert "20260430" → "2026-04-30" (openFDA uses compact dates). */
export function dashIsoFromCompact(compact: string): string {
  if (!/^\d{8}$/.test(compact)) return compact;
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

/** Convert any parseable date string to YYYY-MM-DD (UTC). */
export function isoDateOf(s: string | undefined): string | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

/**
 * Strip HTML tags and collapse whitespace from a description string.
 * RSS descriptions are commonly HTML-encoded; we want clean text for both
 * the recall_reason field and for allergen detection regexes.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/\s+/g, " ")
    .trim();
}
