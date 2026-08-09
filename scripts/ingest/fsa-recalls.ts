#!/usr/bin/env tsx
/**
 * Pulls UK Food Standards Agency allergy alert RSS, filters to allergen-related
 * items, and writes new ones to content/recalls/.
 *
 * FSA categorises alerts as Allergy Alerts (AA) and Food Alerts (FA). The
 * allergen-detection regex naturally filters to AA, but we don't fail if a
 * non-allergy item slips into the feed &mdash; it's just skipped.
 */
import Parser from "rss-parser";
import { detectAllergens, isoDateOf, stripHtml, writeRecall } from "./shared.js";
import type { RecallDraft } from "./shared.js";

const RSS_URL = "https://www.food.gov.uk/news-alerts/rss/alerts.xml";

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
  // FSA titles look like "Allergy alert: Brand X Y due to undeclared peanut"
  return title
    .replace(/^(Allergy\s*Alert:?\s*|Food\s*Alert:?\s*)/i, "")
    .replace(/\s+(due\s+to|because\s+of|containing)\s+.*$/i, "")
    .trim()
    .slice(0, 80);
}

function extractAlertNumber(item: RssItem): string | undefined {
  // FSA alert pattern: e.g. FSA-AA-12-2026 or FSA-FA-XX-2026
  const candidates = [item.guid, item.link, item.title].filter(Boolean) as string[];
  for (const c of candidates) {
    const m = c.match(/\bFSA-(?:AA|FA)-\d+-\d{4}\b/i);
    if (m) return m[0];
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
    product_name: extractProductName(title) || "UK FSA allergy alert",
    undeclared_allergens: allergens,
    recall_reason: body.slice(0, 500) || title,
    recall_date: recallDate,
    region: "uk",
    agency: "fsa-uk",
    agency_recall_id: extractAlertNumber(item),
    recall_class: "unspecified",
    source_url: item.link ?? "https://www.food.gov.uk/news-alerts",
    body: body.length > 500 ? `**Full RSS description:**\n\n${body}` : "",
  };
}

async function main() {
  let items: RssItem[];
  try {
    const feed = await parser.parseURL(RSS_URL);
    items = feed.items as RssItem[];
  } catch (err) {
    console.error(`[fsa-uk] RSS fetch failed for ${RSS_URL}`);
    console.error(err instanceof Error ? err.message : err);
    console.error("[fsa-uk] If the URL has changed, update RSS_URL in scripts/ingest/fsa-recalls.ts.");
    // Non-zero so a dead feed is visible. See fsis-recalls.ts for why.
    process.exit(1);
  }

  console.log(`[fsa-uk] Feed returned ${items.length} item(s).`);

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
