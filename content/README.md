# Content directory

All editorial content for AllergyVoices lives in this directory as markdown
files with YAML frontmatter. Each file is validated against a zod schema in
[`src/content/schemas.ts`](../src/content/schemas.ts) at build time —
invalid frontmatter is logged to the console and skipped.

## Layout

```
content/
  articles/      Latest medical findings (research, FDA updates, treatments)
  recalls/       Recall and allergen alerts
  allergens/     One file per major allergen hub (peanut.md, milk.md, ...)
  resources/     Family Resource Center guides
```

## File naming

- **Articles**: `YYYY-MM-short-slug.md` (e.g. `2026-03-omalizumab-multifood.md`)
- **Recalls**: `YYYY-MM-DD-product-slug.md`
- **Allergens**: `<allergen-slug>.md` — must match one of:
  `peanut`, `tree-nuts`, `milk`, `egg`, `sesame`, `wheat`, `soy`, `fish`, `shellfish`
- **Resources**: `kebab-case-slug.md` (e.g. `newly-diagnosed.md`)

The filename (minus `.md`) becomes the URL slug.

## Editorial workflow

1. **Open a pull request** with your new or edited markdown file.
2. Set `status: draft` while you're still working.
3. Set `status: needs-review` when ready for someone else to look at it.
4. Reviewer leaves comments inline on the PR diff, requests changes if needed.
5. When approved, set `status: published`, fill in `last_reviewed` and
   `reviewed_by`, and merge.
6. The site rebuilds and the new content goes live.

That's your "review queue." No CMS to log into — the PR list at
`https://github.com/<repo>/pulls?q=is%3Apr+is%3Aopen` is the queue.

## Frontmatter cheat sheet

### Article (`/findings`)

```yaml
---
title: "Plain-language headline"
summary: "1-2 sentence plain-English summary."
published_date: "2026-03-12"
status: published                # draft | needs-review | published | archived
last_reviewed: "2026-04-20"
reviewed_by: "Your name"
allergens: [peanut, tree-nuts]   # see schemas.ts for valid values
evidence_level: regulatory       # clinical-trial | systematic-review | guideline | regulatory | expert-opinion | news | educational
geography: us                    # us | ca | uk | eu | global
who_affected: "..."
family_takeaway: "..."
questions_for_allergist:
  - "Question 1"
  - "Question 2"
sources:
  - name: "Source name"
    url: "https://..."
    agency: "FDA"
    published_date: "2024-02-16"
tags: [treatment, fda]
---
```

### Recall (`/recalls`)

```yaml
---
product_name: "Brand Crunchy Cookies, 12 oz"
brand: "Brand Bakery"
undeclared_allergens: [peanut]
recall_reason: "Undeclared peanut..."
recall_date: "2026-04-22"
region: us
agency: fda                      # fda | usda-fsis | cfia | fsa-uk | other
agency_recall_id: "F-1234-2026"
recall_class: class-i            # class-i | class-ii | class-iii | voluntary | unspecified
source_url: "https://www.fda.gov/..."
upcs: ["0123456789012"]
status: published
last_reviewed: "2026-04-22"
reviewed_by: "Your name"
---
```

### Allergen hub (`/allergens/[slug]`)

```yaml
---
allergen: peanut
title: "Peanut allergy"
summary: "1-2 sentence overview."
status: published
last_reviewed: "2026-04-15"
reviewed_by: "Your name"
hidden_sources:
  - "Mole sauces"
  - "..."
family_tips:
  - "Tip 1"
  - "..."
related_article_slugs: []
---
```

### Resource (`/resources/[slug]`)

```yaml
---
title: "Newly diagnosed: a calm first week"
summary: "..."
age_stage: [newly-diagnosed]     # newly-diagnosed | infant | toddler | school-age | teen | adult
setting: [home, clinic]          # home | school | restaurant | travel | shopping | clinic
allergens: []                    # empty array if not allergen-specific
status: published
last_reviewed: "2026-04-30"
reviewed_by: "Your name"
---
```

## Editorial standards (the short version)

- **Plain language.** Write at a 9th-grade level. Skip Latin and acronyms when
  possible; explain them when you can't.
- **No medical promises.** Always encourage families to talk to their allergist.
- **Source everything.** Research and regulatory items must include a `sources`
  list with original links.
- **Calm, not alarming.** Match the tone of the homepage: "every ingredient
  matters, every voice counts." Avoid fear-based framing.
- **Mark your AI drafts.** If a piece was AI-drafted, set `status: needs-review`
  and put a note in the PR description — never `published` until a human reviews.

See `/about` on the live site for the full editorial policy.
