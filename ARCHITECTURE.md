# Architecture &amp; decision log

A short record of the major decisions in the AllergyVoices rebuild and why
they came out the way they did. Future-you will thank present-you.

## Goals

A calm, practical hub for food allergy families that:

- Surfaces medical findings, recalls, allergen hubs, and resources without
  feeling like a medical encyclopedia
- Stays current via scheduled ingestion of official feeds (FDA, USDA, etc.)
- Has a real review queue so AI/automation never auto-publishes medical
  content
- Costs $0/month at this scale

## Decision 1 &mdash; Track A (Vite + Supabase) over Track B (Next.js + Payload)

**Original ask.** Next.js + Payload CMS, full SSR, Postgres-backed content
models.

**Choice.** Stayed on the existing Vite + React + TypeScript + Supabase
stack. Added prerendering only via build-time sitemap + structured data;
deferred full SSR.

**Why.**

- The existing repo already had auth, RLS, the restaurant flows, and a
  44 KB admin panel. A full Next.js + Payload rewrite would have thrown
  away weeks of working code for marginal gain.
- For a content site that's mostly editorial reads, modern Google indexes
  React SPAs adequately when paired with proper meta tags, sitemap, and
  JSON-LD &mdash; which we have.
- We can revisit static prerendering later (`vite-react-ssg`, `astro`) if
  search performance underwhelms.

**Trade-off.** Some social-media crawlers (older LinkedIn, some RSS
readers) don't run JS, so they'll see the SPA shell. OG meta tags in
`index.html` cover the home page; we accept generic snippets on deep links
for now.

## Decision 2 &mdash; Markdown content + git PR review queue, not a database CMS

**The pivot.** Originally planned to put articles, recalls, allergen hubs,
and resources in Supabase tables with an admin panel for editorial review
(Draft / Needs Review / Published / Archived workflow). Pivoted to
markdown files in `/content/` with **GitHub PRs as the review queue**.

**Why.**

| Editorial spec requirement | DB approach | Markdown + git approach |
| --- | --- | --- |
| Draft queue | DB rows with `status='draft'` | Open PRs |
| Needs Review | DB status flag | PR with `needs-review` label |
| Published | DB status flag | Merged to `main` |
| Source links | Column | Frontmatter field |
| Last reviewed date | Column | Frontmatter field |
| Reviewer | Column | PR reviewer (built-in) |
| What changed | Column | PR description (built-in) |
| Archive old alerts | Move row | Move file to `/archived` |
| Backup | Manual | Git history (free) |
| AI drafts can't auto-publish | RLS rule | PR can't be auto-merged |

The "review queue" feature shipped for free as a side effect.

**Cost impact.** No database for content = no row count, no DB bandwidth,
no admin UI to maintain. Stays well inside free tiers indefinitely.

**Trade-off.** No web-based editor. Editing happens in GitHub or any code
editor. For our team size and editorial volume this is a feature, not a
bug &mdash; PRs are diff-friendly, accountable, and reviewable.

## Decision 3 &mdash; Supabase free tier kept, but only for subscribers

**Choice.** Supabase still hosts the `subscribers` table (newsletter
signup) and an existing `restaurants` table for a future surface. Auth
and the admin panel were dropped. Editorial content is **not** in
Supabase.

**Why.** The existing Supabase wiring (typed client, RLS, migrations) is
already in place and the free tier is generous (500 MB DB, 5 GB bandwidth,
50K MAUs). The only catch is the 7-day inactivity pause &mdash; mitigated by
the weekly keepalive workflow.

**Trade-off.** Still a tiny dependency on Supabase. If we ever want to go
fully serverless-free, swap the subscribers table for a hosted form
service (Buttondown free tier, Tally, etc.).

## Decision 4 &mdash; GitHub Actions for ingestion, not Vercel cron or Supabase Edge Functions

**Choice.** Each ingestion source has its own GitHub Actions workflow
(`.github/workflows/ingest-*.yml`) that runs on cron, executes a tsx
script, and uses `peter-evans/create-pull-request` to open a draft PR.

**Why.**

- **PRs are the review queue.** Putting the bot's output in a PR matches
  the editorial pipeline exactly &mdash; a human reviews, edits, and merges to
  publish.
- **Free.** GitHub Actions is unlimited on public repos and 2,000
  minutes/month on private. Our usage is < 10 min/day.
- **Decoupled from hosting.** If we move off Vercel later, ingestion
  doesn't change.
- **Easier to debug.** Workflow logs are in the GitHub UI; failed runs
  email you.

**Trade-off.** GitHub Actions has higher latency than serverless cron (a
few minutes from schedule to start). Fine for daily ingestion; not fine
for real-time triggers.

## Decision 5 &mdash; openFDA real, others stubbed

**Choice.** Built openFDA as a real, working ingestor. FSIS, CFIA, FSA UK,
PubMed, and ClinicalTrials.gov are stub scripts that print "not yet
implemented" but have working workflow files on the right schedule.

**Why.** Each external source has its own quirks (RSS parsing, rate
limits, authentication, payload normalization). Wiring them all at once
would have been days of work for incremental coverage. Shipping openFDA
proves the architecture end-to-end; the stubs reserve the schedule slots
and keep the pattern visible so adding the next source is "fill in this
script."

## Decision 6 &mdash; No full static prerendering (yet)

**Choice.** SEO baseline = sitemap.xml + robots.txt + JSON-LD + meta tags
updated client-side via `SEOHead`. No `renderToString` at build time.

**Why.** Static prerendering with `vite-react-ssg` requires a routing
refactor to a route-config style. It's a meaningful lift for marginal SEO
gain over what we already have. Crawlers like Googlebot render JS; older
ones don't, but they also don't drive significant traffic to a site like
this.

**When to revisit.** If search performance is poor 3-6 months in, or if a
new content type benefits from being instant-loadable on first paint
(e.g., a long-tail allergen-recall page). At that point the routing
refactor is justified.

## Decision 7 &mdash; Vercel for hosting, Hostinger for domain only

**Choice.** Deploy to Vercel (free Hobby tier). Keep the
`allergyvoices.com` domain registered at Hostinger and point its DNS at
Vercel. Cancel Hostinger web hosting after the cutover.

**Why.** Vercel has best-in-class DX for Vite + React (zero config,
preview deploys per PR, image optimization, free at this scale). Keeping
the domain at the existing registrar avoids the friction of a transfer.

**Runner-up.** Cloudflare Pages &mdash; cheaper-still and unlimited bandwidth
free, but Vercel's DX is meaningfully better for this stack.

## Things we explicitly didn't build

- **A CMS.** Editorial happens in git.
- **User accounts on the site.** No login. Newsletter signup is anonymous.
- **A restaurant directory** &mdash; existed in the original codebase, removed
  in Phase 1 for now. Will revisit later, possibly as a Supabase-backed
  filterable directory.
- **Real-time anything.** No live recalls feed, no chat, no comments. The
  site is a calm reference, not a forum.
- **Auto-publishing AI medical content.** Hard editorial rule. Drafts go
  to PRs as `needs-review` and a human merges.
