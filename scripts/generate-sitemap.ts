#!/usr/bin/env tsx
/**
 * Generates `dist/sitemap.xml` after the Vite build. Reads `content/` to
 * enumerate dynamic routes (article slugs, allergen hubs, etc.) and combines
 * them with the static route list.
 *
 * Production base URL is read from SITE_URL (env var) and falls back to
 * https://allergyvoices.com.
 *
 * Run via `npm run sitemap` or as part of `npm run build:full`.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const SITE_URL = (process.env.SITE_URL ?? "https://allergyvoices.com").replace(/\/$/, "");
const DIST = join(ROOT, "dist");
const CONTENT = join(ROOT, "content");

const STATIC_ROUTES: { path: string; changefreq: string; priority: number }[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/findings", changefreq: "daily", priority: 0.9 },
  { path: "/recalls", changefreq: "daily", priority: 0.9 },
  { path: "/resources", changefreq: "weekly", priority: 0.8 },
  { path: "/allergens", changefreq: "weekly", priority: 0.8 },
  { path: "/dining", changefreq: "monthly", priority: 0.7 },
  { path: "/schools-teens", changefreq: "monthly", priority: 0.7 },
  { path: "/directory", changefreq: "weekly", priority: 0.7 },
  { path: "/restaurants", changefreq: "monthly", priority: 0.7 },
  { path: "/restaurants/directory", changefreq: "daily", priority: 0.8 },
  { path: "/restaurants/participate", changefreq: "monthly", priority: 0.6 },
  { path: "/about", changefreq: "monthly", priority: 0.5 },
  { path: "/policies/privacy", changefreq: "yearly", priority: 0.3 },
  { path: "/policies/terms", changefreq: "yearly", priority: 0.3 },
  { path: "/policies/restaurant-participation", changefreq: "yearly", priority: 0.4 },
];

interface ContentRoute {
  path: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
}

function readPublishedFrontmatter(filePath: string): Record<string, unknown> | null {
  const raw = readFileSync(filePath, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) return null;
  const data = yaml.load(match[1]);
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  return data as Record<string, unknown>;
}

function listPublishedSlugs(
  dir: string,
  pathPrefix: string,
  changefreq: string,
  priority: number,
): ContentRoute[] {
  const fullDir = join(CONTENT, dir);
  if (!existsSync(fullDir)) return [];
  const files = readdirSync(fullDir).filter((f) => f.endsWith(".md"));
  const routes: ContentRoute[] = [];
  for (const f of files) {
    const data = readPublishedFrontmatter(join(fullDir, f));
    if (!data || data.status !== "published") continue;
    const slug = f.replace(/\.md$/, "");
    const lastmod =
      (typeof data.last_reviewed === "string" && data.last_reviewed) ||
      (typeof data.published_date === "string" && data.published_date) ||
      (typeof data.recall_date === "string" && data.recall_date) ||
      undefined;
    routes.push({ path: `${pathPrefix}/${slug}`, lastmod, changefreq, priority });
  }
  return routes;
}

/**
 * Reads `.env` by hand — this script runs under tsx, not Vite, so it doesn't
 * get `import.meta.env`. Missing values are not an error; the restaurant
 * routes are simply skipped.
 */
function readEnvFile(): Record<string, string> {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

/**
 * Published restaurant profiles live in Supabase rather than in `content/`,
 * so they're fetched at build time to get them into the sitemap. A failure
 * here logs and continues — a sitemap missing a few listings is a much
 * smaller problem than a broken build.
 */
async function listRestaurantRoutes(): Promise<ContentRoute[]> {
  const env = { ...readEnvFile(), ...process.env };
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn("! Skipping restaurant routes: Supabase credentials not found");
    return [];
  }

  try {
    const endpoint = `${url.replace(/\/$/, "")}/rest/v1/restaurants` +
      "?select=slug,published_at,information_current_as_of,updated_at" +
      "&status=eq.published&slug=not.is.null";

    const response = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    if (!response.ok) {
      console.warn(`! Skipping restaurant routes: Supabase returned ${response.status}`);
      return [];
    }

    const rows = (await response.json()) as Array<{
      slug: string;
      published_at: string | null;
      information_current_as_of: string | null;
      updated_at: string | null;
    }>;

    return rows.map((row) => ({
      path: `/restaurants/${row.slug}`,
      lastmod: (row.information_current_as_of ?? row.updated_at ?? row.published_at ?? "").slice(0, 10) || undefined,
      changefreq: "monthly",
      priority: 0.6,
    }));
  } catch (error) {
    console.warn("! Skipping restaurant routes:", (error as Error).message);
    return [];
  }
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!,
  );
}

function buildSitemap(routes: { path: string; lastmod?: string; changefreq: string; priority: number }[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map((r) => {
      const lastmod = r.lastmod ?? today;
      return `  <url>
    <loc>${escapeXml(`${SITE_URL}${r.path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

async function main() {
  const dynamic: ContentRoute[] = [
    ...listPublishedSlugs("articles", "/findings", "weekly", 0.7),
    ...listPublishedSlugs("recalls", "/recalls", "monthly", 0.6),
    ...listPublishedSlugs("allergens", "/allergens", "weekly", 0.8),
    ...listPublishedSlugs("resources", "/resources", "monthly", 0.7),
    ...(await listRestaurantRoutes()),
  ];

  const all = [...STATIC_ROUTES, ...dynamic];
  const xml = buildSitemap(all);

  // Write to dist/ if it exists (post-build), and also to public/ so dev
  // server can serve it during local development.
  const targets: string[] = [];
  if (existsSync(DIST)) targets.push(join(DIST, "sitemap.xml"));
  targets.push(join(ROOT, "public", "sitemap.xml"));

  for (const t of targets) {
    writeFileSync(t, xml, "utf8");
    console.log(`✓ wrote ${t} (${all.length} URLs)`);
  }

  console.log(`Site URL: ${SITE_URL}`);
  console.log(`${STATIC_ROUTES.length} static + ${dynamic.length} content routes`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
