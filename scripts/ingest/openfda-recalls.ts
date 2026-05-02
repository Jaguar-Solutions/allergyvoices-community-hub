#!/usr/bin/env tsx
/**
 * Pulls the most recent food enforcement reports from openFDA, filters to
 * allergen-related recalls, and writes new ones to content/recalls/ as
 * markdown drafts (status: needs-review).
 *
 * No API key required. openFDA's free tier allows up to 1,000 requests/day
 * per IP &mdash; we make at most a handful per run.
 *
 * Run: `npx tsx scripts/ingest/openfda-recalls.ts`
 */
import {
  dashIsoFromCompact,
  daysAgo,
  detectAllergens,
  isoDate,
  writeRecall,
} from "./shared.js";
import type { RecallDraft } from "./shared.js";

interface OpenFDARecall {
  recall_number?: string;
  reason_for_recall?: string;
  product_description?: string;
  recalling_firm?: string;
  classification?: string;
  voluntary_mandated?: string;
  report_date?: string;
  recall_initiation_date?: string;
  status?: string;
  country?: string;
  state?: string;
  city?: string;
  distribution_pattern?: string;
  product_quantity?: string;
  code_info?: string;
  openfda?: {
    upc?: string[];
  };
}

interface OpenFDAResponse {
  meta?: { results?: { total?: number } };
  results?: OpenFDARecall[];
  error?: { code: string; message: string };
}

const LOOKBACK_DAYS = 14;
const MAX_RESULTS = 100;
const API_BASE = "https://api.fda.gov/food/enforcement.json";

function classOf(raw: string | undefined): RecallDraft["recall_class"] {
  switch ((raw ?? "").toLowerCase()) {
    case "class i":
      return "class-i";
    case "class ii":
      return "class-ii";
    case "class iii":
      return "class-iii";
    default:
      return "unspecified";
  }
}

/**
 * openFDA's `product_description` is a long free-text blob that often
 * includes packaging, UPC, manufacturer, and ingredient statements. We want
 * a short, slug-friendly product name. Take the first 80 chars up to a
 * sensible breakpoint (period, comma, " UPC ", " ingredients ", etc.).
 */
function extractProductName(description: string): string {
  const cleaned = description.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Unknown product";

  // First, cut off the trailing "noise" portion (UPC, net weight, manufacturer, etc.).
  const noiseRe =
    /\b(UPC|Net Wt|Best By|Lot|Manufactured|Distributed|Label declares|Product Code|Item No)\b/i;
  const noiseMatch = cleaned.match(noiseRe);
  let candidate = noiseMatch ? cleaned.slice(0, noiseMatch.index ?? cleaned.length) : cleaned;

  // Prefer cutting at the first comma (separates "Brand Sauce, 15.2oz" -> "Brand Sauce").
  // Require at least 8 chars before the comma so we don't truncate "Cookies, 8 oz".
  const commaIdx = candidate.indexOf(",");
  if (commaIdx >= 8 && commaIdx <= 80) {
    candidate = candidate.slice(0, commaIdx);
  } else {
    // Fall back to first sentence end (period + whitespace, so decimals like "15.2oz"
    // don't trigger a cut).
    const periodMatch = candidate.match(/^([^.]{4,80})\.\s/);
    if (periodMatch) {
      candidate = periodMatch[1];
    }
  }

  candidate = candidate.replace(/[.;:,]+\s*$/, "").trim();
  if (candidate.length > 80) candidate = candidate.slice(0, 80).replace(/\s+\S*$/, "");
  return candidate || "Unknown product";
}

function buildSourceUrl(recallNumber: string | undefined): string {
  if (recallNumber) {
    const encoded = encodeURIComponent(`"${recallNumber}"`);
    return `https://api.fda.gov/food/enforcement.json?search=recall_number:${encoded}`;
  }
  return "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts";
}

function toDraft(r: OpenFDARecall): RecallDraft | null {
  const reason = r.reason_for_recall ?? "";
  const allergens = detectAllergens(reason);
  if (allergens.length === 0) return null; // not an allergen recall

  const recallDate = dashIsoFromCompact(
    r.recall_initiation_date ?? r.report_date ?? "",
  );
  if (!recallDate || !/^\d{4}-\d{2}-\d{2}$/.test(recallDate)) return null;

  const fullDescription = (r.product_description ?? "").replace(/\s+/g, " ").trim();
  const productName = extractProductName(fullDescription);
  // Prefer the formal recall classification; fall back to voluntary if
  // openFDA didn't classify (rare).
  const cls = classOf(r.classification);
  const finalClass: RecallDraft["recall_class"] =
    cls === "unspecified" && /voluntary/i.test(r.voluntary_mandated ?? "")
      ? "voluntary"
      : cls;

  // Put the full openFDA description in the body so the reviewer has the
  // raw context without polluting the slug or `product_name` field.
  const bodyParts: string[] = [];
  if (fullDescription && fullDescription !== productName) {
    bodyParts.push(`**Full openFDA product description:**\n\n${fullDescription}`);
  }
  if (r.distribution_pattern) {
    bodyParts.push(`**Distribution:** ${r.distribution_pattern}`);
  }
  if (r.code_info) {
    bodyParts.push(`**Code info:** ${r.code_info}`);
  }
  if (r.product_quantity) {
    bodyParts.push(`**Quantity:** ${r.product_quantity}`);
  }

  return {
    product_name: productName,
    brand: r.recalling_firm?.trim(),
    undeclared_allergens: allergens,
    recall_reason: reason.replace(/\s+/g, " ").trim(),
    recall_date: recallDate,
    region: "us",
    agency: "fda",
    agency_recall_id: r.recall_number?.trim(),
    recall_class: finalClass,
    source_url: buildSourceUrl(r.recall_number),
    upcs: r.openfda?.upc ?? [],
    body: bodyParts.join("\n\n"),
  };
}

async function fetchOpenFDA(): Promise<OpenFDARecall[]> {
  const since = daysAgo(LOOKBACK_DAYS).toISOString().slice(0, 10).replace(/-/g, "");
  const until = isoDate().replace(/-/g, "");
  const search = `report_date:[${since}+TO+${until}]`;
  const url = `${API_BASE}?search=${search}&limit=${MAX_RESULTS}`;

  console.log(`Fetching openFDA: ${url}`);
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "AllergyVoices-Ingest/1.0" },
  });

  if (res.status === 404) {
    // openFDA returns 404 with `error.code === "NOT_FOUND"` when zero results.
    // That's a normal case for us, not an error.
    console.log("openFDA returned no results in window. Nothing to ingest.");
    return [];
  }

  if (!res.ok) {
    throw new Error(`openFDA request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as OpenFDAResponse;
  if (data.error) {
    if (data.error.code === "NOT_FOUND") return [];
    throw new Error(`openFDA error: ${data.error.code} ${data.error.message}`);
  }
  return data.results ?? [];
}

async function main() {
  let raw: OpenFDARecall[];
  try {
    raw = await fetchOpenFDA();
  } catch (err) {
    console.error("Failed to fetch openFDA. Skipping this run.");
    console.error(err instanceof Error ? err.message : err);
    process.exit(0); // Don't fail the workflow on transient API errors.
  }

  console.log(`openFDA returned ${raw.length} record(s).`);

  let written = 0;
  let skippedNoAllergen = 0;
  let skippedExisting = 0;
  const newPaths: string[] = [];

  for (const record of raw) {
    const draft = toDraft(record);
    if (!draft) {
      skippedNoAllergen += 1;
      continue;
    }
    const result = writeRecall(draft, "openFDA ingestor");
    if (result.written) {
      written += 1;
      newPaths.push(result.path);
      console.log(`  + ${result.path}`);
    } else {
      skippedExisting += 1;
    }
  }

  console.log("");
  console.log(`Summary: wrote ${written} new recall draft(s).`);
  console.log(`  Skipped ${skippedNoAllergen} non-allergen record(s).`);
  console.log(`  Skipped ${skippedExisting} already-known recall(s).`);

  // Surface to GitHub Actions so a follow-up step can decide whether to open a PR.
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `wrote=${written}\nnew_paths=${newPaths.join("\n")}\n`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
