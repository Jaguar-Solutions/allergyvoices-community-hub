#!/usr/bin/env tsx
/**
 * Pulls Canadian Food Inspection Agency recall + allergy alert RSS, filters to
 * allergen-related items, and writes new ones to content/recalls/.
 *
 * If the RSS URL changes, edit RSS_URL below. CFIA has historically published
 * recalls and allergy alerts together at the recalls-rappels.canada.ca subdomain.
 */
import Parser from "rss-parser";
import { detectAllergens, isoDateOf, stripHtml, writeRecall } from "./shared.js";
import type { RecallDraft } from "./shared.js";

const RSS_URL = "https://recalls-rappels.canada.ca/en/rss/recalls";

const parser = new Parser({
  headers: {
    "User-Agent": "AllergyVoices-Ingest/1.0 (+https://allergyvoices.com)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

interface RssItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  pubDate?: string;
  guid?: string;
}

function extractProductName(title: string): string {
  // CFIA titles look like "Brand X Cookies recalled due to undeclared peanut"
  // Strip the "recalled due to..." tail.
  return title
    .replace(/^(Recall\s*[-:]\s*|Allergy\s*Alert\s*[-:]?\s*)/i, "")
    .replace(/\s+(recalled|recall)\s+(due\s+to|for|because\s+of)\s+.*$/i, "")
    .replace(/\s+due\s+to\s+.*$/i, "")
    .trim()
    .slice(0, 80);
}

function extractRecallNumber(item: RssItem): string | undefined {
  // CFIA URL pattern: /en/alert-recall/<number>
  const candidates = [item.guid, item.link].filter(Boolean) as string[];
  for (const c of candidates) {
    const m = c.match(/\/(?:alert-recall|recall|alerte-rappel)\/(\d+)/i);
    if (m) return m[1];
  }
  return undefined;
}

function toDraft(item: RssItem): RecallDraft | null {
  const title = (item.title ?? "").trim();
  const body = stripHtml((item.content ?? item.contentSnippet ?? "").toString());
  const haystack = `${title} ${body}`;

  const allergens = detectAllergens(haystack);
  if (allergens.length === 0) return null;

  const recallDate = isoDateOf(item.pubDate);
  if (!recallDate) return null;

  return {
    product_name: extractProductName(title) || "CFIA Canada recall",
    undeclared_allergens: allergens,
    recall_reason: body.slice(0, 500) || title,
    recall_date: recallDate,
    region: "ca",
    agency: "cfia",
    agency_recall_id: extractRecallNumber(item),
    recall_class: "unspecified",
    source_url: item.link ?? "https://recalls-rappels.canada.ca/en",
    body: body.length > 500 ? `**Full RSS description:**\n\n${body}` : "",
  };
}

async function main() {
  let items: RssItem[];
  try {
    const feed = await parser.parseURL(RSS_URL);
    items = feed.items as RssItem[];
  } catch (err) {
    console.error(`[cfia] RSS fetch failed for ${RSS_URL}`);
    console.error(err instanceof Error ? err.message : err);
    console.error("[cfia] If the URL has changed, update RSS_URL in scripts/ingest/cfia-recalls.ts.");
    // Non-zero so a dead feed is visible. See fsis-recalls.ts for why.
    process.exit(1);
  }

  console.log(`[cfia] Feed returned ${items.length} item(s).`);

  let written = 0;
  let skippedNoAllergen = 0;
  let skippedExisting = 0;

  for (const item of items) {
    const draft = toDraft(item);
    if (!draft) {
      skippedNoAllergen += 1;
      continue;
    }
    const result = writeRecall(draft, "CFIA ingestor");
    if (result.written) {
      written += 1;
      console.log(`  + ${result.path}`);
    } else {
      skippedExisting += 1;
    }
  }

  console.log("");
  console.log(`[cfia] Wrote ${written} new draft(s).`);
  console.log(`[cfia] Skipped ${skippedNoAllergen} non-allergen item(s).`);
  console.log(`[cfia] Skipped ${skippedExisting} already-known item(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
