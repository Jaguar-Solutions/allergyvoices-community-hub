# AllergyVoices

> Every ingredient matters. Every voice counts.

A calm, practical hub for food allergy families &mdash; plain-language medical
findings, recalls from official sources, and real-world resources for home,
school, dining, and travel.

- 🌐 **Live site**: https://allergyvoices.com
- 📝 **Editorial workflow**: GitHub PRs &mdash; no CMS, no logins
- 🤖 **Daily auto-ingestion**: openFDA recalls open as draft PRs for review
- 💸 **Hosting cost**: same Hostinger plan we already had + Supabase free + GitHub Actions free

---

## Stack

| Layer | What we use | Why |
| --- | --- | --- |
| Frontend | Vite + React 18 + TypeScript + React Router v6 | SPA, fast dev loop, no Next.js complexity |
| Styling | Tailwind + shadcn/ui (Radix primitives) | Accessible defaults, consistent design tokens |
| Content | Markdown files in `/content/` validated by zod | Editorial workflow = git PRs (review queue, version control, free) |
| Light DB | Supabase (free tier) | Newsletter subscribers only; eventually filterable directory |
| Ingestion | GitHub Actions + tsx scripts | Daily cron pulls openFDA, opens PRs |
| Hosting | Hostinger shared hosting (existing plan) | Static deploy via SFTP/File Manager; domain already lives here |

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the decision log on why
**not** Next.js, why **not** Payload/Sanity, and the hybrid markdown +
Supabase choice.

## Information architecture

| Section | Route | Source |
| --- | --- | --- |
| Home | `/` | `src/pages/Index.tsx` |
| Latest Medical Findings (list) | `/findings` | `content/articles/*.md` |
| Article (detail) | `/findings/:slug` | "" |
| Recalls & Alerts | `/recalls` | `content/recalls/*.md` |
| Family Resource Center (list) | `/resources` | `content/resources/*.md` |
| Resource (detail) | `/resources/:slug` | "" |
| Allergen Hubs (index) | `/allergens` | `content/allergens/*.md` |
| Allergen Hub (detail) | `/allergens/:slug` | "" |
| Dining Out | `/dining` | hardcoded page |
| Schools & Teens | `/schools-teens` | hardcoded page |
| Local Directory | `/directory` | placeholder (Supabase later) |
| About / Editorial Policy | `/about` | hardcoded page |

## Getting started

Requires Node.js 20+.

```sh
git clone <repo>
cd allergyvoices-community-hub
npm install
npm run dev          # http://localhost:8080
```

Create a `.env` (copy `.env.example` if it exists, or use your password manager):

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

## npm scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR (port 8080) |
| `npm run build` | Production bundle + generates `dist/sitemap.xml` |
| `npm run preview` | Serve the production build locally (port 4173) |
| `npm run lint` | ESLint over the project |
| `npm run content:check` | Validate every markdown file in `/content/` against its zod schema |
| `npm run sitemap` | Regenerate `public/sitemap.xml` (also runs as part of `build`) |
| `npm run deploy` | Build + verify the deploy bundle in `dist/`. Upload manually. |
| `npm run deploy:upload` | Same, then SFTP-mirror to Hostinger via `lftp` (needs env vars). |

## Content workflow

All editorial content (articles, recalls, allergen hubs, resources) lives
in [`/content/`](./content/) as markdown with YAML frontmatter.

```sh
# 1. Create a branch, add or edit a markdown file
git checkout -b article/2026-05-fda-something

# 2. Frontmatter starts in `draft`; switch to `needs-review` when ready
#    See content/README.md for the schema for each content type.

# 3. Validate locally
npm run content:check

# 4. Commit, push, open a PR
git add content/articles/2026-05-fda-something.md
git commit -m "Draft: FDA update on ..."
git push -u origin HEAD
gh pr create
```

CI runs `npm run lint`, `npm run content:check`, and `npm run build` on every
PR. When the PR merges to `main`, Vercel rebuilds and the new content goes
live.

> **Safety rule:** AI-drafted medical interpretation never auto-publishes.
> AI drafts open as `needs-review`; a human reviewer changes the status to
> `published` only after review.

Full schema and editorial standards: [`content/README.md`](./content/README.md).

## Automation

The site is designed to keep itself current with the **least amount of manual
work** that's compatible with the editorial safety rule (no AI auto-publishes
medical interpretation). Three kinds of automation, all free:

### 1. Recall ingestion → auto-merging PRs

Daily GitHub Actions pull from official agency feeds, write new draft files
to `content/recalls/`, open a pull request, and **auto-merge after CI
passes**. You don't write or merge anything yourself; the recalls page just
stays current.

| Source | Workflow | Schedule |
| --- | --- | --- |
| openFDA Food Enforcement (US) | `ingest-openfda.yml` | Daily 12:30 UTC |
| USDA FSIS (US) | `ingest-fsis.yml` | Daily 12:30 UTC |
| CFIA (Canada) | `ingest-cfia.yml` | Daily 13:30 UTC |
| FSA (UK) | `ingest-fsa-uk.yml` | Daily 11:30 UTC |

Each source's RSS/API URL is a one-line `const RSS_URL` (or equivalent) at
the top of the corresponding `scripts/ingest/<source>-recalls.ts`. If a feed
URL changes, the workflow fails gracefully with a clear log message and
opens no PR; update the URL constant and the next run picks up.

### 2. Topic suggestions → recurring GitHub issue (no PR, no auto-publish)

A weekly workflow polls **PubMed E-utilities** and **ClinicalTrials.gov v2**
for new food-allergy publications and recruiting trials, then updates a
single recurring GitHub issue titled "Topic suggestions — PubMed +
ClinicalTrials.gov." You skim it Monday morning. When something there
genuinely deserves a plain-language article, you open a PR adding a
markdown file under `content/articles/`.

This is **not** an article auto-publisher. It's an editorial queue.

| What | Workflow | Schedule |
| --- | --- | --- |
| PubMed + CT.gov topic queue | `ingest-pubmed.yml` | Mondays 14:00 UTC |

### 3. Editorial freshness → recurring GitHub issue

A weekly workflow walks `/content/`, finds anything where `last_reviewed` is
older than 90 days (configurable via the `FRESHNESS_DAYS` env var), and
updates a single recurring GitHub issue titled "Editorial freshness report"
with a checklist of files to refresh. When everything's fresh, the issue
shows ✅ "all clear."

| What | Workflow | Schedule |
| --- | --- | --- |
| Editorial freshness | `editorial-freshness.yml` | Mondays 14:00 UTC |
| Supabase keepalive | `keepalive-supabase.yml` | Mondays 13:00 UTC |

### Required GitHub repo settings (one-time)

For the auto-merge and bot-PR/issue workflows to work:

- **Settings → Actions → General → Workflow permissions:** set to "Read and
  write permissions" + check **"Allow GitHub Actions to create and approve
  pull requests"**
- **Settings → General → Pull Requests:** check **"Allow auto-merge"**
- **Settings → Secrets and variables → Actions:** add `SUPABASE_URL` and
  `SUPABASE_ANON_KEY` (used only by the keepalive ping)

### Run any ingestor manually

```sh
npx tsx scripts/ingest/openfda-recalls.ts
npx tsx scripts/ingest/fsis-recalls.ts
npx tsx scripts/ingest/cfia-recalls.ts
npx tsx scripts/ingest/fsa-recalls.ts
npx tsx scripts/ingest/pubmed-articles.ts          # writes topic-suggestions.md
npx tsx scripts/ingest/keepalive-supabase.ts       # needs SUPABASE_URL + SUPABASE_ANON_KEY
npx tsx scripts/editorial-freshness.ts             # writes stale-report.md
```

### Realistic weekly involvement

- **Daily:** zero — recall PRs auto-merge.
- **Mondays (5–10 min):** glance at the topic-suggestions and freshness
  issues. Most weeks both are quiet.
- **As needed:** when something major lands (FDA approval, new guideline),
  open a PR adding an article in `content/articles/`. The site rebuilds on
  merge.

## Deploying to Hostinger

We host on the same Hostinger shared plan that owns the domain. Build
locally, upload `dist/` to `public_html/`. No DNS changes, no vendor
swap. See [`ARCHITECTURE.md` Decision 7](./ARCHITECTURE.md) for why we
landed here instead of Vercel.

### One-time setup

1. **Make sure Hostinger SSL is enabled** for `allergyvoices.com` in the
   Hostinger panel (hPanel → SSL → enable free Let's Encrypt cert).
2. **Back up the existing `public_html/` contents** in the Hostinger File
   Manager &mdash; the static site replaces whatever's there now.
3. **Confirm `public/.htaccess` is in the repo.** It ships to
   `dist/.htaccess` on every build and handles SPA routing, cache
   headers, gzip, and (optional) HTTPS redirect.
4. **GitHub repo settings** &mdash; required for the ingestion bots:
   - **Settings → Secrets and variables → Actions**: add `SUPABASE_URL`
     and `SUPABASE_ANON_KEY` (used by keepalive only).
   - **Settings → Actions → General → Workflow permissions**: set to
     "Read and write permissions" and check "Allow GitHub Actions to
     create and approve pull requests."
   - **Settings → General → Pull Requests**: check "Allow auto-merge."

### Day-to-day deploy (manual)

```sh
git checkout main && git pull   # picks up any auto-merged recall PRs
npm run deploy                  # builds dist/, verifies the bundle
```

Then upload **the contents of `dist/`** (not the folder itself) to
`public_html/` via the Hostinger File Manager or FileZilla. Make sure
`.htaccess` comes along &mdash; you may need to toggle "Show hidden files."

After SSL is provisioned, edit `public/.htaccess` and uncomment the
`HTTPS redirect` block so visitors are forced onto `https://`.

### Optional auto-upload via SFTP

If you'd rather not click through File Manager, install `lftp` once
(`brew install lftp`), then export four env vars in your shell:

```sh
export HOSTINGER_HOST=ftp.allergyvoices.com   # or the SFTP host from hPanel
export HOSTINGER_USER=u123456789
export HOSTINGER_PASS='...'
export HOSTINGER_REMOTE=/public_html
```

`npm run deploy:upload` will then build and mirror the bundle in one
step.

### Future upgrade: GitHub Actions auto-deploy

When manual uploads get tedious (probably a few weeks in), the smallest
upgrade is a workflow that runs `npm run build` and SFTPs `dist/` to
Hostinger on every push to `main`. ~25 lines of YAML using
`SamKirkland/FTP-Deploy-Action@v4` plus the same four secrets above as
GitHub Actions secrets. Still $0, still on Hostinger.

## Project layout

```
.github/
  workflows/                CI + ingestion + keepalive crons
  ISSUE_TEMPLATE/           Suggest article/recall/resource
  PULL_REQUEST_TEMPLATE.md  Editorial + code checklists
content/                    Markdown content (see content/README.md)
  articles/
  recalls/
  allergens/
  resources/
public/                     Static assets (favicon, robots.txt, sitemap.xml)
scripts/
  check-content.ts          Schema validator (CI-runnable)
  generate-sitemap.ts       Sitemap.xml generator
  ingest/                   External-source connectors
src/
  components/
    layout/                 Container, Section, PageHeader, PageLayout, Footer,
                            Breadcrumbs, Disclaimer, Prose, ReviewStatusBadge
    content/                ContentMeta, AllergenChips, RecallCard, SourceList
    ui/                     shadcn/ui primitives
    *.tsx                   Navigation, NewsFeed, etc.
  content/
    schemas.ts              zod schemas for all content types
    loader.ts               Vite-glob-based markdown loader
  pages/                    One file per route
  integrations/supabase/    Typed Supabase client
  hooks/                    React hooks
  lib/                      Small utilities (cn)
supabase/
  migrations/               SQL migrations
  functions/                (legacy) Edge Functions
```

## Editorial standards (the short version)

- **Plain language.** Write at a 9th-grade level.
- **No medical promises.** Always encourage families to talk to their allergist.
- **Source everything.** Research and regulatory items must include a `sources` list.
- **Calm, not alarming.** No fear-based framing.
- **Mark AI drafts.** Always start as `needs-review`; never `published` without a human review.

Full editorial policy: [`content/README.md`](./content/README.md). The medical
disclaimer renders on every content page automatically (`Disclaimer` component).

## License

All rights reserved. (Update if you decide to open-source.)
