#!/usr/bin/env tsx
/**
 * Pulls UK Food Standards Agency allergy alert RSS, filters to allergen-related
 * items, and writes new ones to content/recalls/.
 *
 * FSA categorises alerts as Allergy Alerts (AA) and Food Alerts (FA). The
 * allergen-detection regex naturally filters to AA, but we don't fail if a
 * non-allergy item slips into the feed &mdash; it's just skipped.
 */
import { detectAllergens, isoDateOf, stripHtml, writeRecall } from "./shared.js";
import type { RecallDraft } from "./shared.js";

/**
 * The FSA's JSON API, not RSS.
 *
 * The old news-alerts RSS URL began returning 404 and the feed appears to be
 * gone; data.food.gov.uk is the documented, supported interface and carries
 * structured product and risk fields an RSS description does not.
 *
 * Sorted newest first — the default order is oldest first, which returns 2018.
 *
 * Docs: https://data.food.gov.uk/food-alerts/ui/reference
 */
const API_URL =
  "https://data.food.gov.uk/food-alerts/id?_sort=-created&_limit=50";

interface FsaAlert {
  "@id"?: string;
  title?: string;
  shortTitle?: string;
  created?: string;
  modified?: string;
  notation?: string;
  alertURL?: string;
  problem?: { riskStatement?: string }[];
  productDetails?: { productName?: string }[];
  descriptionOfAction?: string;
}

function extractProductName(alert: FsaAlert): string {
  // The API names products explicitly, so there is no need to pick a title
  // apart with a regex the way the RSS version had to.
  const named = alert.productDetails?.find((p) => p.productName)?.productName;
  if (named) return named.trim().slice(0, 80);

  return (alert.shortTitle ?? alert.title ?? "")
    .replace(/^(Allergy\s*Alert:?\s*|Food\s*Alert:?\s*)/i, "")
    .replace(/\s+(due\s+to|because\s+of|containing)\s+.*$/i, "")
    .trim()
    .slice(0, 80);
}

function toDraft(alert: FsaAlert): RecallDraft | null {
  const title = (alert.title ?? alert.shortTitle ?? "").trim();
  const risk = alert.problem?.map((p) => p.riskStatement ?? "").join(" ") ?? "";
  const products = alert.productDetails?.map((p) => p.productName ?? "").join(", ") ?? "";
  const body = stripHtml([risk, alert.descriptionOfAction ?? ""].join(" ")).trim();

  // Product names carry the allergen as often as the risk statement does.
  const allergens = detectAllergens(`${title} ${risk} ${products}`);
  if (allergens.length === 0) return null;

  const recallDate = isoDateOf(alert.created ?? alert.modified);
  if (!recallDate) return null;

  return {
    product_name: extractProductName(alert) || "UK FSA allergy alert",
    undeclared_allergens: allergens,
    recall_reason: (risk || title).slice(0, 500),
    recall_date: recallDate,
    region: "uk",
    agency: "fsa-uk",
    agency_recall_id: alert.notation,
    recall_class: "unspecified",
    source_url:
      alert.alertURL ?? alert["@id"] ?? "https://data.food.gov.uk/food-alerts",
    body: body.length > 500 ? `**Full alert text:**\n\n${body}` : "",
  };
}

async function main() {
  let items: FsaAlert[];
  try {
    const response = await fetch(API_URL, {
      headers: {
        "User-Agent": "AllergyVoices-Ingest/1.0 (+https://allergyvoices.com)",
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = (await response.json()) as { items?: FsaAlert[] };
    items = payload.items ?? [];
  } catch (err) {
    console.error(`[fsa-uk] API fetch failed for ${API_URL}`);
    console.error(err instanceof Error ? err.message : err);
    console.error("[fsa-uk] Docs: https://data.food.gov.uk/food-alerts/ui/reference");
    // Non-zero so a dead feed is visible. See fsis-recalls.ts for why.
    process.exit(1);
  }

  console.log(`[fsa-uk] API returned ${items.length} alert(s).`);

  let written = 0;
  let skippedNoAllergen = 0;
  let skippedExisting = 0;

  for (const item of items) {
    const draft = toDraft(item);
    if (!draft) {
      skippedNoAllergen += 1;
      continue;
    }
    const result = writeRecall(draft, "FSA UK ingestor");
    if (result.written) {
      written += 1;
      console.log(`  + ${result.path}`);
    } else {
      skippedExisting += 1;
    }
  }

  console.log("");
  console.log(`[fsa-uk] Wrote ${written} new draft(s).`);
  console.log(`[fsa-uk] Skipped ${skippedNoAllergen} non-allergen item(s).`);
  console.log(`[fsa-uk] Skipped ${skippedExisting} already-known item(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
