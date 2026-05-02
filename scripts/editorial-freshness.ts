#!/usr/bin/env tsx
/**
 * Walks /content/ and reports items whose `last_reviewed` date is older than
 * the freshness threshold (default 90 days). Writes a markdown report to
 * stale-report.md so a workflow can post/update a GitHub issue with it.
 *
 * If everything is fresh, writes a brief "all clear" report.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const CONTENT = join(ROOT, "content");
const REPORT_PATH = join(ROOT, "stale-report.md");

const FRESHNESS_DAYS = Number(process.env.FRESHNESS_DAYS ?? 90);

interface ContentEntry {
  type: string;
  path: string;
  title: string;
  lastReviewed?: string;
  daysOld?: number;
  status: string;
}

const TYPES = [
  { label: "Articles", dir: "articles", titleField: "title" },
  { label: "Allergen hubs", dir: "allergens", titleField: "title" },
  { label: "Resources", dir: "resources", titleField: "title" },
  { label: "Stories", dir: "stories", titleField: "title" },
  // Recalls are auto-ingested and turn over fast; skip them in freshness checks.
];

function parseFrontmatter(raw: string): Record<string, unknown> {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!m) return {};
  const data = yaml.load(m[1]);
  return data && typeof data === "object" && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

function daysSince(iso: string): number | undefined {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return undefined;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function collect(typeLabel: string, dir: string): ContentEntry[] {
  const fullDir = join(CONTENT, dir);
  if (!existsSync(fullDir)) return [];
  const files = readdirSync(fullDir).filter((f) => f.endsWith(".md"));
  return files.map((f) => {
    const fullPath = join(fullDir, f);
    const data = parseFrontmatter(readFileSync(fullPath, "utf8"));
    const lastReviewed =
      typeof data.last_reviewed === "string" ? data.last_reviewed : undefined;
    const status = typeof data.status === "string" ? data.status : "draft";
    return {
      type: typeLabel,
      path: `content/${dir}/${f}`,
      title: typeof data.title === "string" ? data.title : f.replace(/\.md$/, ""),
      lastReviewed,
      daysOld: lastReviewed ? daysSince(lastReviewed) : undefined,
      status,
    };
  });
}

function buildReport(stale: ContentEntry[], totalChecked: number): string {
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Editorial freshness report — ${today}`,
    "",
    `Threshold: **${FRESHNESS_DAYS} days** since \`last_reviewed\`.`,
    "",
  ];

  if (stale.length === 0) {
    lines.push(
      `✅ All ${totalChecked} content files are within the freshness window. Nothing to refresh this week.`,
    );
    lines.push("");
    lines.push("(This issue will be updated next Monday.)");
    return lines.join("\n");
  }

  lines.push(
    `📋 ${stale.length} of ${totalChecked} content file(s) are due for review.`,
  );
  lines.push("");
  lines.push("Refresh in priority order:");
  lines.push("");

  // Group by type
  const byType = new Map<string, ContentEntry[]>();
  for (const item of stale) {
    if (!byType.has(item.type)) byType.set(item.type, []);
    byType.get(item.type)!.push(item);
  }

  for (const [type, items] of byType) {
    lines.push(`## ${type} (${items.length})`);
    lines.push("");
    for (const it of items.sort((a, b) => (b.daysOld ?? 0) - (a.daysOld ?? 0))) {
      const age = it.daysOld != null ? `${it.daysOld} days` : "no date";
      const reviewed = it.lastReviewed ?? "never";
      lines.push(
        `- [ ] **${it.title}** &mdash; \`${it.path}\`  ` +
          `\n  Last reviewed ${reviewed} (${age} ago) &middot; status: \`${it.status}\``,
      );
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "When you refresh a file, bump `last_reviewed` to today and update " +
      "`reviewed_by`. The next freshness check will drop it from this list automatically.",
  );

  return lines.join("\n");
}

function main() {
  const all: ContentEntry[] = [];
  for (const t of TYPES) {
    all.push(...collect(t.label, t.dir));
  }

  // Stale = published items past the threshold (or with no last_reviewed at all).
  const stale = all.filter((e) => {
    if (e.status !== "published") return false;
    if (e.daysOld == null) return true; // no review date is itself a problem
    return e.daysOld > FRESHNESS_DAYS;
  });

  const report = buildReport(stale, all.filter((e) => e.status === "published").length);
  writeFileSync(REPORT_PATH, report, "utf8");

  console.log(report);
  console.log("");
  console.log(`Report written to ${REPORT_PATH}`);
}

main();
