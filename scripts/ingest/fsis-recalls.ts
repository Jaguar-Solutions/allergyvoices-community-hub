#!/usr/bin/env tsx
/**
 * Pulls USDA FSIS recall + public health alerts RSS, filters to allergen-related
 * items, and writes new ones to content/recalls/ as published recalls.
 *
 * If the RSS URL changes, edit RSS_URL below.
 */
import Parser from "rss-parser";
import { detectAllergens, isoDateOf, stripHtml, writeRecall } from "./shared.js";
import type { RecallDraft } from "./shared.js";

const RSS_URL = "https://www.fsis.usda.gov/fsis-content/rss/recalls.xml";

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

/** Parse a recall number out of a URL or title (e.g. "017-2026"). */
function extractRecallNumber(item: RssItem): string | undefined {
  const candidates = [item.guid, item.link, item.title].filter(Boolean) as string[];
  for (const c of candidates) {
    const m = c.match(/\b(\d{3}-\d{4})\b/);
    if (m) return m[1];
  }
  return undefined;
}

function extractProductName(title: string): string {
  // FSIS titles often look like "FSIS Issues Public Health Alert for X" or
  // "X Recalls Y Due To Undeclared Allergen". Strip leading boilerplate.
  return title
    .replace(/^FSIS\s+(Issues\s+)?(Public\s+Health\s+Alert\s+for|Recall\s+Notification:?|Releases?\s+Public\s+Health\s+Alert\s+for)\s+/i, "")
    .replace(/\s+Due\s+To\s+.*$/i, "")
    .trim()
    .slice(0, 80);
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
    product_name: extractProductName(title) || "USDA FSIS recall",
    undeclared_allergens: allergens,
    recall_reason: body.slice(0, 500),
    recall_date: recallDate,
    region: "us",
    agency: "usda-fsis",
    agency_recall_id: extractRecallNumber(item),
    recall_class: "unspecified",
    source_url: item.link ?? "https://www.fsis.usda.gov/recalls",
    body: body.length > 500 ? `**Full RSS description:**\n\n${body}` : "",
  };
}

async function main() {
  let items: RssItem[];
  try {
    const feed = await parser.parseURL(RSS_URL);
    items = feed.items as RssItem[];
  } catch (err) {
    console.error(`[fsis] RSS fetch failed for ${RSS_URL}`);
    console.error(err instanceof Error ? err.message : err);
    console.error("[fsis] If the URL has changed, update RSS_URL in scripts/ingest/fsis-recalls.ts.");
    process.exit(0); // Don't fail the workflow on transient feed issues.
  }

  console.log(`[fsis] Feed returned ${items.length} item(s).`);

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
