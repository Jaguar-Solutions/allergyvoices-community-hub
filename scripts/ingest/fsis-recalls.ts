#!/usr/bin/env tsx
/**
 * Pulls USDA FSIS recall + public health alerts RSS, filters to allergen-related
 * items, and writes new ones to content/recalls/ as published recalls.
 *
 * If the RSS URL changes, edit RSS_URL below.
 */
import { detectAllergens, isoDateOf, stripHtml, writeRecall } from "./shared.js";
import type { RecallDraft } from "./shared.js";

/**
 * The FSIS Recall & Public Health Alert API, not RSS.
 *
 * The old fsis-content RSS URL returns 403 and appears to be retired. The
 * JSON API is FSIS's documented, supported interface and — importantly — it
 * includes public health alerts, which the RSS feed did not. A month of
 * undeclared-allergen alerts was missed partly for that reason.
 *
 * It also returns `field_recall_classification` ("Class I", "Public Health
 * Alert"), which is the agency's own severity wording. That is the only
 * source of a risk label on this site; we never assign one ourselves.
 *
 * Docs: https://www.fsis.usda.gov/science-data/developer-resources/recall-api
 */
const API_URL = "https://www.fsis.usda.gov/fsis/api/recall/v/1";

interface FsisRecall {
  field_title?: string;
  field_recall_number?: string;
  field_recall_url?: string;
  field_recall_date?: string;
  field_last_modified_date?: string;
  field_recall_reason?: string[];
  field_recall_classification?: string;
  field_risk_level?: string;
  field_summary?: string;
  field_product_items?: string[];
  field_company_media_contact?: string[];
}

/** Parse a recall number out of a URL or title (e.g. "017-2026"). */
/**
 * Human-readable product name.
 *
 * The API titles alerts like "FSIS Issues Public Health Alert for X"; strip
 * the boilerplate so a listing reads as the product rather than as a press
 * release headline.
 */
function extractProductName(item: FsisRecall): string {
  const title = (item.field_title ?? "").trim();
  return title
    .replace(/^FSIS\s+(Issues|Announces)\s+/i, "")
    .replace(/^(Public Health Alert|Recall Notification)\s+(for|of)\s+/i, "")
    .replace(/\s+(due\s+to|because\s+of)\s+.*$/i, "")
    .trim()
    .slice(0, 80);
}

/**
 * The agency's own classification, normalised to our vocabulary.
 *
 * Never inferred. If FSIS does not state a class, this stays "unspecified"
 * rather than guessing a severity, because a risk label the agency did not
 * assign would be our medical judgement dressed as theirs.
 */
function classify(item: FsisRecall): RecallDraft["recall_class"] {
  const raw = `${item.field_recall_classification ?? ""} ${item.field_risk_level ?? ""}`
    .toLowerCase();
  if (raw.includes("class i") && !raw.includes("class ii") && !raw.includes("class iii")) {
    return "class-i";
  }
  if (raw.includes("class ii")) return "class-ii";
  if (raw.includes("class iii")) return "class-iii";
  return "unspecified";
}

function toDraft(item: FsisRecall): RecallDraft | null {
  const title = (item.field_title ?? "").trim();
  const reason = (item.field_recall_reason ?? []).join(", ");
  const summary = stripHtml(item.field_summary ?? "");
  const products = (item.field_product_items ?? []).join(" ");

  const allergens = detectAllergens(`${title} ${reason} ${summary} ${products}`);
  if (allergens.length === 0) return null;

  const recallDate = isoDateOf(item.field_recall_date ?? item.field_last_modified_date);
  if (!recallDate) return null;

  return {
    product_name: extractProductName(item) || "FSIS recall",
    undeclared_allergens: allergens,
    recall_reason: (reason || title).slice(0, 500),
    recall_date: recallDate,
    region: "us",
    agency: "fsis",
    agency_recall_id: item.field_recall_number,
    recall_class: classify(item),
    source_url: item.field_recall_url ?? "https://www.fsis.usda.gov/recalls",
    body: summary.length > 500 ? `**Full FSIS summary:**\n\n${summary}` : "",
  };
}

async function main() {
  let items: FsisRecall[];
  try {
    const response = await fetch(API_URL, {
      headers: {
        "User-Agent": "AllergyVoices-Ingest/1.0 (+https://allergyvoices.com)",
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    items = (await response.json()) as FsisRecall[];
  } catch (err) {
    console.error(`[fsis] API fetch failed for ${API_URL}`);
    console.error(err instanceof Error ? err.message : err);
    console.error("[fsis] Docs: https://www.fsis.usda.gov/science-data/developer-resources/recall-api");
    // Exit non-zero. This used to exit 0 so a transient blip wouldn't turn the
    // workflow red — but the effect was that a permanently dead feed looked
    // exactly like a healthy one. Three of the four feeds were broken for a
    // month while every scheduled run reported success and nobody could tell.
    //
    // A genuinely transient failure now produces a single red run that heals
    // itself the next day; a dead feed produces an unbroken red line, which is
    // the signal that was missing.
    process.exit(1);
  }

  console.log(`[fsis] API returned ${items.length} record(s).`);

  let written = 0;
  let skippedNoAllergen = 0;
  let skippedExisting = 0;

  for (const item of items) {
    const draft = toDraft(item);
    if (!draft) {
      skippedNoAllergen += 1;
      continue;
    }
    const result = writeRecall(draft, "USDA FSIS ingestor");
    if (result.written) {
      written += 1;
      console.log(`  + ${result.path}`);
    } else {
      skippedExisting += 1;
    }
  }

  console.log("");
  console.log(`[fsis] Wrote ${written} new draft(s).`);
  console.log(`[fsis] Skipped ${skippedNoAllergen} non-allergen item(s).`);
  console.log(`[fsis] Skipped ${skippedExisting} already-known item(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
