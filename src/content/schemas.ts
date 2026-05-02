import { z } from "zod";

// ---------- Taxonomy enums ----------

export const AllergenSchema = z.enum([
  "peanut",
  "tree-nuts",
  "milk",
  "egg",
  "sesame",
  "wheat",
  "soy",
  "fish",
  "shellfish",
]);
export type Allergen = z.infer<typeof AllergenSchema>;

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  peanut: "Peanut",
  "tree-nuts": "Tree Nuts",
  milk: "Milk",
  egg: "Egg",
  sesame: "Sesame",
  wheat: "Wheat",
  soy: "Soy",
  fish: "Fish",
  shellfish: "Shellfish",
};

export const AgeStageSchema = z.enum([
  "newly-diagnosed",
  "infant",
  "toddler",
  "school-age",
  "teen",
  "adult",
]);
export type AgeStage = z.infer<typeof AgeStageSchema>;

export const SettingSchema = z.enum([
  "home",
  "school",
  "restaurant",
  "travel",
  "shopping",
  "clinic",
]);
export type Setting = z.infer<typeof SettingSchema>;

export const EvidenceLevelSchema = z.enum([
  "clinical-trial",
  "systematic-review",
  "guideline",
  "regulatory",
  "expert-opinion",
  "news",
  "educational",
]);
export type EvidenceLevel = z.infer<typeof EvidenceLevelSchema>;

export const ReviewStatusSchema = z.enum([
  "draft",
  "needs-review",
  "published",
  "archived",
]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const GeographySchema = z.enum(["us", "ca", "uk", "eu", "global"]);
export type Geography = z.infer<typeof GeographySchema>;

export const RecallAgencySchema = z.enum([
  "fda",
  "usda-fsis",
  "cfia",
  "fsa-uk",
  "other",
]);
export type RecallAgency = z.infer<typeof RecallAgencySchema>;

// ---------- Shared sub-schemas ----------

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .or(z.date().transform((d) => d.toISOString().slice(0, 10)));

export const SourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  agency: z.string().optional(),
  published_date: isoDate.optional(),
});
export type Source = z.infer<typeof SourceSchema>;

const Frontmatter = z.object({
  status: ReviewStatusSchema.default("draft"),
  last_reviewed: isoDate.optional(),
  reviewed_by: z.string().optional(),
  what_changed: z.string().optional(),
});

// ---------- Per-type schemas ----------

export const ArticleSchema = Frontmatter.extend({
  type: z.literal("article").default("article"),
  slug: z.string(),
  title: z.string().min(1),
  summary: z.string().min(1),
  published_date: isoDate,
  allergens: z.array(AllergenSchema).default([]),
  evidence_level: EvidenceLevelSchema.default("news"),
  geography: GeographySchema.default("us"),
  who_affected: z.string().optional(),
  family_takeaway: z.string().optional(),
  questions_for_allergist: z.array(z.string()).default([]),
  sources: z.array(SourceSchema).default([]),
  tags: z.array(z.string()).default([]),
  body_html: z.string(),
  body_markdown: z.string(),
});
export type Article = z.infer<typeof ArticleSchema>;

export const RecallAlertSchema = Frontmatter.extend({
  type: z.literal("recall").default("recall"),
  slug: z.string(),
  product_name: z.string().min(1),
  brand: z.string().optional(),
  undeclared_allergens: z.array(AllergenSchema).min(1),
  recall_reason: z.string().min(1),
  recall_date: isoDate,
  region: GeographySchema.default("us"),
  agency: RecallAgencySchema,
  agency_recall_id: z.string().optional(),
  recall_class: z
    .enum(["class-i", "class-ii", "class-iii", "voluntary", "unspecified"])
    .default("unspecified"),
  source_url: z.string().url(),
  upcs: z.array(z.string()).default([]),
  body_html: z.string().default(""),
  body_markdown: z.string().default(""),
});
export type RecallAlert = z.infer<typeof RecallAlertSchema>;

export const AllergenHubSchema = Frontmatter.extend({
  type: z.literal("allergen-hub").default("allergen-hub"),
  slug: AllergenSchema,
  allergen: AllergenSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  hidden_sources: z.array(z.string()).default([]),
  family_tips: z.array(z.string()).default([]),
  related_article_slugs: z.array(z.string()).default([]),
  body_html: z.string(),
  body_markdown: z.string(),
});
export type AllergenHub = z.infer<typeof AllergenHubSchema>;

export const ResourceSchema = Frontmatter.extend({
  type: z.literal("resource").default("resource"),
  slug: z.string(),
  title: z.string().min(1),
  summary: z.string().min(1),
  age_stage: z.array(AgeStageSchema).default([]),
  setting: z.array(SettingSchema).default([]),
  allergens: z.array(AllergenSchema).default([]),
  printable_url: z.string().optional(),
  body_html: z.string(),
  body_markdown: z.string(),
});
export type Resource = z.infer<typeof ResourceSchema>;

export const CommunityStorySchema = Frontmatter.extend({
  type: z.literal("story").default("story"),
  slug: z.string(),
  title: z.string().min(1),
  author_name: z.string().min(1),
  published_date: isoDate,
  age_stage: AgeStageSchema.optional(),
  allergens: z.array(AllergenSchema).default([]),
  body_html: z.string(),
  body_markdown: z.string(),
});
export type CommunityStory = z.infer<typeof CommunityStorySchema>;

// ---------- Helpers ----------

export const ALLERGEN_SLUGS = AllergenSchema.options;
export const AGE_STAGE_LABELS: Record<AgeStage, string> = {
  "newly-diagnosed": "Newly diagnosed",
  infant: "Infant",
  toddler: "Toddler",
  "school-age": "School-age",
  teen: "Teen",
  adult: "Adult",
};
export const SETTING_LABELS: Record<Setting, string> = {
  home: "Home",
  school: "School",
  restaurant: "Restaurant",
  travel: "Travel",
  shopping: "Shopping",
  clinic: "Clinic",
};
export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  "clinical-trial": "Clinical trial",
  "systematic-review": "Systematic review",
  guideline: "Clinical guideline",
  regulatory: "Regulatory update",
  "expert-opinion": "Expert opinion",
  news: "News update",
  educational: "Educational",
};
