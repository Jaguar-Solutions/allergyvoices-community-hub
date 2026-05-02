#!/usr/bin/env tsx
/**
 * Validates every markdown file in /content/ against its zod schema.
 * Run via `npm run content:check`. Exits non-zero on any failure.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { marked } from "marked";
import { z, type ZodTypeAny } from "zod";
import {
  AllergenHubSchema,
  ArticleSchema,
  CommunityStorySchema,
  RecallAlertSchema,
  ResourceSchema,
} from "../src/content/schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

interface CheckTarget {
  label: string;
  dir: string;
  schema: ZodTypeAny;
}

const TARGETS: CheckTarget[] = [
  { label: "article", dir: "content/articles", schema: ArticleSchema },
  { label: "recall", dir: "content/recalls", schema: RecallAlertSchema },
  { label: "allergen hub", dir: "content/allergens", schema: AllergenHubSchema },
  { label: "resource", dir: "content/resources", schema: ResourceSchema },
  { label: "story", dir: "content/stories", schema: CommunityStorySchema },
];

interface CheckError {
  file: string;
  message: string;
}

function parseFile(raw: string): { data: Record<string, unknown>; content: string } {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) {
    throw new Error(
      "No frontmatter found. Each content file must start with `---` followed by YAML, then `---`, then the body.",
    );
  }
  const parsed = yaml.load(match[1]);
  const data =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  return { data, content: match[2] };
}

function checkOne(filePath: string, schema: ZodTypeAny, slug: string): CheckError | null {
  try {
    const raw = readFileSync(filePath, "utf8");
    const { data, content } = parseFile(raw);
    const body_markdown = content.trim();
    const body_html = marked.parse(body_markdown, { async: false }) as string;
    schema.parse({ slug, ...data, body_markdown, body_html });
    return null;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues
        .map((issue) => `  - ${issue.path.join(".") || "<root>"}: ${issue.message}`)
        .join("\n");
      return {
        file: filePath,
        message: `Schema validation failed:\n${issues}`,
      };
    }
    return { file: filePath, message: String(err) };
  }
}

function main() {
  const errors: CheckError[] = [];
  let totalChecked = 0;
  let totalSkipped = 0;

  for (const target of TARGETS) {
    const fullDir = join(ROOT, target.dir);
    if (!existsSync(fullDir)) {
      console.log(`(skip) ${target.dir} does not exist yet`);
      continue;
    }
    const files = readdirSync(fullDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const filePath = join(fullDir, file);
      const slug = file.replace(/\.md$/, "");
      const err = checkOne(filePath, target.schema, slug);
      totalChecked += 1;
      if (err) {
        errors.push(err);
        console.error(`\n✗ ${target.label}: ${target.dir}/${file}`);
        console.error(err.message);
      } else {
        console.log(`✓ ${target.label}: ${target.dir}/${file}`);
      }
    }
    if (files.length === 0) totalSkipped += 1;
  }

  console.log(
    `\nChecked ${totalChecked} file(s) across ${TARGETS.length - totalSkipped} content type(s).`,
  );

  if (errors.length > 0) {
    console.error(`\n${errors.length} content file(s) failed validation.`);
    process.exit(1);
  }
}

main();
