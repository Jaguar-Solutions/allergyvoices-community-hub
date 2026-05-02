#!/usr/bin/env tsx
/**
 * Polls NCBI PubMed E-utilities for recent food-allergy publications and
 * ClinicalTrials.gov v2 API for newly-recruiting food-allergy trials.
 *
 * Builds a single markdown report at `topic-suggestions.md`. The
 * editorial-freshness-style workflow then posts it as a recurring GitHub
 * issue. The output is a TOPIC QUEUE for editorial triage &mdash; nothing here
 * is published as a site article. Humans pick what's worth writing up.
 *
 * Both APIs are free and require no auth.
 */
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..", "..");
const REPORT_PATH = join(ROOT, "topic-suggestions.md");

const PUBMED_LOOKBACK_DAYS = Number(process.env.PUBMED_LOOKBACK_DAYS ?? 14);
const CTGOV_LOOKBACK_DAYS = Number(process.env.CTGOV_LOOKBACK_DAYS ?? 30);

interface PubMedItem {
  pmid: string;
  title: string;
  journal?: string;
  pubdate?: string;
  authors?: string;
}

interface CTgovItem {
  nctId: string;
  title: string;
  status: string;
  startDate?: string;
  sponsor?: string;
  summary?: string;
}

// ---------------- PubMed ----------------

async function fetchPubMed(): Promise<PubMedItem[]> {
  const term =
    '("food allergy"[Title/Abstract] OR "food anaphylaxis"[Title/Abstract] OR ' +
    '"peanut allergy"[Title/Abstract] OR "milk allergy"[Title/Abstract] OR ' +
    '"egg allergy"[Title/Abstract] OR "tree nut allergy"[Title/Abstract] OR ' +
    '"sesame allergy"[Title/Abstract] OR "oral immunotherapy"[Title/Abstract] OR ' +
    '"epinephrine"[Title/Abstract])';
  const esearch = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi");
  esearch.searchParams.set("db", "pubmed");
  esearch.searchParams.set("term", term);
  esearch.searchParams.set("reldate", String(PUBMED_LOOKBACK_DAYS));
  esearch.searchParams.set("retmax", "20");
  esearch.searchParams.set("retmode", "json");
  esearch.searchParams.set("sort", "date");

  const searchRes = await fetch(esearch, {
    headers: { "User-Agent": "AllergyVoices-Topics/1.0" },
  });
  if (!searchRes.ok) throw new Error(`PubMed esearch failed: ${searchRes.status}`);
  const searchJson = (await searchRes.json()) as {
    esearchresult?: { idlist?: string[] };
  };
  const ids = searchJson.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const esummary = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi");
  esummary.searchParams.set("db", "pubmed");
  esummary.searchParams.set("id", ids.join(","));
  esummary.searchParams.set("retmode", "json");

  const summaryRes = await fetch(esummary, {
    headers: { "User-Agent": "AllergyVoices-Topics/1.0" },
  });
  if (!summaryRes.ok) throw new Error(`PubMed esummary failed: ${summaryRes.status}`);
  const summaryJson = (await summaryRes.json()) as {
    result?: Record<string, unknown>;
  };
  const result = summaryJson.result as Record<string, unknown> | undefined;
  if (!result) return [];

  const items: PubMedItem[] = [];
  for (const id of ids) {
    const entry = result[id] as
      | {
          uid?: string;
          title?: string;
          fulljournalname?: string;
          source?: string;
          pubdate?: string;
          authors?: { name?: string }[];
        }
      | undefined;
    if (!entry || !entry.title) continue;
    const firstAuthor = entry.authors?.[0]?.name;
    const more = (entry.authors?.length ?? 0) > 1 ? " et al." : "";
    items.push({
      pmid: id,
      title: entry.title,
      journal: entry.fulljournalname || entry.source,
      pubdate: entry.pubdate,
      authors: firstAuthor ? `${firstAuthor}${more}` : undefined,
    });
  }
  return items;
}

// ---------------- ClinicalTrials.gov v2 ----------------

async function fetchCTgov(): Promise<CTgovItem[]> {
  const url = new URL("https://clinicaltrials.gov/api/v2/studies");
  url.searchParams.set("query.cond", "food allergy");
  url.searchParams.set("filter.overallStatus", "RECRUITING");
  url.searchParams.set("pageSize", "30");
  // CT.gov v2 sort syntax: 'StudyFirstPostDate:desc' (no @ prefix).
  url.searchParams.append("sort", "StudyFirstPostDate:desc");

  const res = await fetch(url, {
    headers: { "User-Agent": "AllergyVoices-Topics/1.0", Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`CT.gov failed: ${res.status}`);
  const json = (await res.json()) as {
    studies?: { protocolSection?: Record<string, Record<string, unknown>> }[];
  };

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - CTGOV_LOOKBACK_DAYS);

  const out: CTgovItem[] = [];
  for (const study of json.studies ?? []) {
    const ps = study.protocolSection ?? {};
    const id = (ps.identificationModule as { nctId?: string; briefTitle?: string })
      ?.nctId;
    const title = (ps.identificationModule as { briefTitle?: string })?.briefTitle;
    const status = (ps.statusModule as { overallStatus?: string })?.overallStatus;
    const postedStruct = (ps.statusModule as {
      studyFirstPostDateStruct?: { date?: string };
    })?.studyFirstPostDateStruct;
    const startDate = postedStruct?.date;
    const sponsor = (ps.sponsorCollaboratorsModule as {
      leadSponsor?: { name?: string };
    })?.leadSponsor?.name;
    const summary = (ps.descriptionModule as { briefSummary?: string })?.briefSummary;

    if (!id || !title) continue;

    if (startDate) {
      const d = new Date(startDate);
      if (!Number.isNaN(d.getTime()) && d < cutoff) continue;
    }

    out.push({
      nctId: id,
      title,
      status: status ?? "UNKNOWN",
      startDate,
      sponsor,
      summary: summary?.replace(/\s+/g, " ").trim().slice(0, 280),
    });
  }
  return out;
}

// ---------------- Report ----------------

function buildReport(
  pubmed: { ok: true; items: PubMedItem[] } | { ok: false; error: string },
  ctgov: { ok: true; items: CTgovItem[] } | { ok: false; error: string },
): string {
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Topic suggestions — ${today}`,
    "",
    "Editorial queue of recent food-allergy research and clinical trials. " +
      "Skim, ignore most, occasionally draft an article from one. " +
      "**Nothing here is auto-published.**",
    "",
    "---",
    "",
  ];

  // PubMed section
  lines.push(
    `## Recent PubMed publications (last ${PUBMED_LOOKBACK_DAYS} days)`,
  );
  lines.push("");
  if (!pubmed.ok) {
    lines.push(`⚠️ PubMed query failed: ${pubmed.error}`);
  } else if (pubmed.items.length === 0) {
    lines.push("No new publications matched our food-allergy keyword filter.");
  } else {
    for (const item of pubmed.items) {
      const meta = [item.authors, item.journal, item.pubdate]
        .filter(Boolean)
        .join(" · ");
      lines.push(
        `- [ ] **${item.title}**  ` +
          `\n  ${meta ? `${meta}  \n  ` : ""}` +
          `[PubMed](https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/)`,
      );
    }
  }
  lines.push("");

  // CT.gov section
  lines.push(
    `## Newly-recruiting clinical trials (last ${CTGOV_LOOKBACK_DAYS} days)`,
  );
  lines.push("");
  if (!ctgov.ok) {
    lines.push(`⚠️ ClinicalTrials.gov query failed: ${ctgov.error}`);
  } else if (ctgov.items.length === 0) {
    lines.push("No newly-recruiting food-allergy trials posted in this window.");
  } else {
    for (const item of ctgov.items) {
      const meta = [item.sponsor, item.startDate ? `posted ${item.startDate}` : null]
        .filter(Boolean)
        .join(" · ");
      lines.push(
        `- [ ] **${item.title}**  ` +
          (meta ? `\n  ${meta}  ` : "") +
          (item.summary ? `\n  ${item.summary}…  ` : "") +
          `\n  [ClinicalTrials.gov](https://clinicaltrials.gov/study/${item.nctId})`,
      );
    }
  }
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push(
    "**Workflow**: When something here looks worth writing about, open a new " +
      "PR adding a markdown file under `content/articles/`. Use the existing " +
      "articles as templates. Don't auto-summarize medical research; write " +
      "your own plain-language version with the original linked as a source.",
  );

  return lines.join("\n");
}

// ---------------- Main ----------------

async function main() {
  const [pubmedResult, ctgovResult] = await Promise.all([
    fetchPubMed()
      .then((items) => ({ ok: true as const, items }))
      .catch((err) => ({
        ok: false as const,
        error: err instanceof Error ? err.message : String(err),
      })),
    fetchCTgov()
      .then((items) => ({ ok: true as const, items }))
      .catch((err) => ({
        ok: false as const,
        error: err instanceof Error ? err.message : String(err),
      })),
  ]);

  const report = buildReport(pubmedResult, ctgovResult);
  writeFileSync(REPORT_PATH, report, "utf8");

  console.log(report);
  console.log("");
  console.log(`Report written to ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
