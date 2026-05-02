import yaml from "js-yaml";
import { marked } from "marked";
import { z, type ZodTypeAny } from "zod";
import {
  AllergenHubSchema,
  ArticleSchema,
  CommunityStorySchema,
  RecallAlertSchema,
  ResourceSchema,
  type AgeStage,
  type AllergenHub,
  type Article,
  type CommunityStory,
  type RecallAlert,
  type Resource,
  type Setting,
} from "./schemas";

// Configure marked: GitHub-flavored, no auto-linking surprises
marked.setOptions({
  gfm: true,
  breaks: false,
});

// Browser-safe frontmatter parser. Handles `---\n<yaml>\n---\n<body>`.
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) return { data: {}, content: raw };
  const parsed = yaml.load(match[1]);
  const data =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  return { data, content: match[2] };
}

const articleFiles = import.meta.glob<string>(
  "../../content/articles/*.md",
  { query: "?raw", import: "default", eager: true },
);
const recallFiles = import.meta.glob<string>(
  "../../content/recalls/*.md",
  { query: "?raw", import: "default", eager: true },
);
const allergenFiles = import.meta.glob<string>(
  "../../content/allergens/*.md",
  { query: "?raw", import: "default", eager: true },
);
const resourceFiles = import.meta.glob<string>(
  "../../content/resources/*.md",
  { query: "?raw", import: "default", eager: true },
);
const storyFiles = import.meta.glob<string>(
  "../../content/stories/*.md",
  { query: "?raw", import: "default", eager: true },
);

function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? "";
  return file.replace(/\.md$/, "");
}

interface ParseOptions<S extends ZodTypeAny> {
  schema: S;
  files: Record<string, string>;
  contentLabel: string;
}

function parseAll<S extends ZodTypeAny>({
  schema,
  files,
  contentLabel,
}: ParseOptions<S>): z.infer<S>[] {
  const items: z.infer<S>[] = [];
  for (const [path, raw] of Object.entries(files)) {
    try {
      const { data, content } = parseFrontmatter(raw);
      const slug = slugFromPath(path);
      const body_markdown = content.trim();
      const body_html = marked.parse(body_markdown, { async: false }) as string;
      const parsed = schema.parse({ slug, ...data, body_markdown, body_html });
      items.push(parsed);
    } catch (err) {
      console.warn(
        `[content] Skipping invalid ${contentLabel} at ${path}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  return items;
}

interface Sortable {
  status?: string;
  last_reviewed?: string;
  published_date?: string;
  recall_date?: string;
}

function publishedFirst<T extends Sortable>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === "published") return -1;
      if (b.status === "published") return 1;
    }
    const da = a.published_date ?? a.recall_date ?? a.last_reviewed ?? "";
    const db = b.published_date ?? b.recall_date ?? b.last_reviewed ?? "";
    return db.localeCompare(da);
  });
}

// ---------- Public API ----------

export function getAllArticles(): Article[] {
  return publishedFirst(
    parseAll({ schema: ArticleSchema, files: articleFiles, contentLabel: "article" }),
  );
}

export function getPublishedArticles(): Article[] {
  return getAllArticles().filter((a) => a.status === "published");
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}

export function getAllRecalls(): RecallAlert[] {
  return publishedFirst(
    parseAll({ schema: RecallAlertSchema, files: recallFiles, contentLabel: "recall" }),
  );
}

export function getPublishedRecalls(): RecallAlert[] {
  return getAllRecalls().filter((r) => r.status === "published");
}

export function getRecallBySlug(slug: string): RecallAlert | undefined {
  return getAllRecalls().find((r) => r.slug === slug);
}

export function getAllAllergenHubs(): AllergenHub[] {
  return parseAll({
    schema: AllergenHubSchema,
    files: allergenFiles,
    contentLabel: "allergen-hub",
  });
}

export function getAllergenHub(slug: string): AllergenHub | undefined {
  return getAllAllergenHubs().find((h) => h.slug === slug);
}

export function getAllResources(): Resource[] {
  return publishedFirst(
    parseAll({ schema: ResourceSchema, files: resourceFiles, contentLabel: "resource" }),
  );
}

export function getPublishedResources(): Resource[] {
  return getAllResources().filter((r) => r.status === "published");
}

export function getResourceBySlug(slug: string): Resource | undefined {
  return getAllResources().find((r) => r.slug === slug);
}

export function getResourcesBySetting(setting: Setting): Resource[] {
  return getPublishedResources().filter((r) => r.setting.includes(setting));
}

export function getResourcesByAgeStage(stage: AgeStage): Resource[] {
  return getPublishedResources().filter((r) => r.age_stage.includes(stage));
}

export function getAllStories(): CommunityStory[] {
  return publishedFirst(
    parseAll({ schema: CommunityStorySchema, files: storyFiles, contentLabel: "story" }),
  );
}

export function getPublishedStories(): CommunityStory[] {
  return getAllStories().filter((s) => s.status === "published");
}

export function getStoryBySlug(slug: string): CommunityStory | undefined {
  return getAllStories().find((s) => s.slug === slug);
}
