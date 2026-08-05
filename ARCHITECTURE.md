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

## Decision 5 &mdash; All ingestors real, scaffolded incrementally

**Original choice (Phase 1).** Built openFDA as a real, working ingestor.
FSIS, CFIA, FSA UK, PubMed, and ClinicalTrials.gov were stub scripts that
printed "not yet implemented" but had working workflow files on the right
schedule.

**Where we are now.** All five ingestors are fully implemented:

| Source | Script | Notes |
| --- | --- | --- |
| openFDA Food Enforcement | `scripts/ingest/openfda-recalls.ts` | JSON API, allergen filter, classification mapping |
| USDA FSIS | `scripts/ingest/fsis-recalls.ts` | RSS via `rss-parser`, allergen filter, recall # extraction |
| CFIA Canada | `scripts/ingest/cfia-recalls.ts` | RSS, English feed, alert-recall ID extraction |
| FSA UK | `scripts/ingest/fsa-recalls.ts` | RSS, AA/FA alert ID extraction |
| PubMed + CT.gov | `scripts/ingest/pubmed-articles.ts` | E-utilities + CT.gov v2; writes a topic-queue issue, never a PR |

All four recall ingestors share `scripts/ingest/shared.ts` for allergen
detection, slug generation, frontmatter writing, and dedupe. Each fails
soft on transient feed/API errors so a one-off outage doesn't fail the
workflow or open a noisy PR.

**Why this took two passes.** Each external source has its own quirks
(RSS parsing, rate limits, authentication, payload normalization).
Shipping openFDA first proved the architecture end-to-end; once the
shared helpers existed, the other sources were straightforward fills.

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

## Decision 7 &mdash; Stay on Hostinger shared hosting; deploy `dist/` manually

**Original plan.** Deploy to Vercel (free Hobby tier), keep
`allergyvoices.com` registered at Hostinger but point DNS at Vercel,
cancel Hostinger web hosting after the cutover.

**What we actually chose.** Stay on the existing Hostinger shared
hosting plan that already owns the domain. Build locally with `npm run
deploy`, upload the contents of `dist/` to `public_html/` via Hostinger
File Manager (or `npm run deploy:upload` with `lftp` once it gets
tedious).

**Why we pivoted.**

- The domain is already on Hostinger. Cutting over to Vercel would have
  meant a DNS change, a TTL wait, and cancelling a hosting plan we're
  already paying for. Net cost saved: zero. Net friction added:
  non-trivial.
- The site is a static SPA. Hostinger Apache + a 30-line `.htaccess`
  (SPA fallback, cache headers, gzip, security headers) is sufficient.
- All the smart parts of the system &mdash; ingestion, auto-merge, freshness
  reports &mdash; live in GitHub Actions, which is host-agnostic.
- Build-time image optimization (`vite-plugin-image-optimizer`) already
  delivers ~70% asset reduction without runtime help from a host.

**What we give up.**

- **Preview deploys per PR.** No instant-staging URL when a recall PR
  auto-merges. Mitigation: `npm run preview` locally before each deploy.
- **CDN edge caching.** Hostinger serves from a single origin region.
  For a low-traffic content site, fine; we'll revisit if real-user
  metrics show TTFB problems internationally.
- **Auto-deploy on merge.** Recall PRs land in `main` automatically but
  go live on the next manual deploy. Acceptable until daily uploads feel
  like a chore; when they do, we'll add a `SamKirkland/FTP-Deploy-Action`
  workflow that mirrors `dist/` to Hostinger on push.

**Runners-up considered.**

- **Vercel Hobby.** Best DX, but the DNS-cutover friction outweighed it
  for a project where the host is already paid for and the deploy
  cadence is "whenever a real recall lands."
- **Cloudflare Pages.** Cheapest at scale (free, unlimited bandwidth),
  but same DNS-cutover friction.
- **GitHub Pages.** Free, no friction, but `allergyvoices.com` would
  still need DNS changes and we'd lose the `.htaccess` controls
  (SPA fallback, cache, security headers).

**When to revisit.** If/when daily manual uploads become annoying, add
the FTP-deploy GitHub Action. If/when international TTFB matters, put
Cloudflare in front (DNS-only mode &mdash; keeps Hostinger as origin, adds
the CDN for free).

## Decision 8 &mdash; The restaurant program is database-backed, reversing
## Decisions 2 and 3 for this surface only

**Choice.** The Restaurant Allergy Transparency &amp; Recognition Program stores
submissions, contacts, and published listings in Supabase, with a real admin
dashboard behind Supabase Auth. Editorial content stays exactly where it is:
markdown in `/content/`, reviewed in PRs.

**Why this doesn't contradict Decision 2.** The git-as-CMS argument rests on
editorial medical content being low-volume, written by us, and needing a human
review trail. Restaurant submissions are none of those things. They arrive
unpredictably from third parties, contain PII we must not put in a public git
repo, and &mdash; once claim ships &mdash; get edited by the restaurants
themselves. A PR per restaurant hours-change would be absurd, and a manual
`npm run deploy` between an owner's edit and it going live defeats the point
of self-service entirely.

**Why the admin panel came back.** Decision 3 dropped it because there was
nothing left to administer. There is now: a review queue with approve, edit,
request-changes, hide, and CSV export. It is gated by Supabase Auth plus the
`user_roles` / `has_role()` infrastructure that survived from the original
build, and enforced by RLS rather than by hiding a route.

**Data safety.** `restaurants` holds no PII; manager names, emails, and phone
numbers live in `restaurant_contacts`, which has no public policy at all. The
public directory reads only published `restaurants` rows. The survey has no
public INSERT policy &mdash; everything goes through the `restaurant-submit`
edge function.

**What we dropped.** The four Lovable-era restaurant tables, whose RLS was
`FOR ALL TO public USING (true)` &mdash; readable and deletable by anyone with
the anon key. `restaurant_ratings` also contradicted the program's premise;
this is not a grading system, so the word does not appear in the schema.

**Trade-off.** Profile pages are client-rendered, so JS-less crawlers see the
shell. Mitigated with build-time sitemap generation from Supabase plus
`Restaurant` JSON-LD. Revisit alongside Decision 6 if search performance
disappoints.

See [`docs/RESTAURANT_PROGRAM.md`](./docs/RESTAURANT_PROGRAM.md) for setup.

## Decision 9 &mdash; The site is a PWA, so restaurant surveys can be taken offline

**Choice.** Added `vite-plugin-pwa`. The site installs to an iPad home
screen, loads with no connection, and the restaurant survey queues completed
submissions in IndexedDB until it can deliver them to the edge function.

**Why.** The survey's real setting is a surveyor standing in a restaurant,
often somewhere with no usable signal. A form that loses ten minutes of
someone's answers because the wifi dropped doesn't get filled in twice.

**Design notes.**

- **IndexedDB, not localStorage.** The in-progress draft already uses
  localStorage; a queue of completed submissions shouldn't share a 5 MB
  synchronous quota with it.
- **Delivery is confirmed, not assumed.** `navigator.onLine` reports true on
  a captive wifi portal and on a signal too weak to complete a request. Only
  a real HTTP response counts as delivered; everything else re-queues. This
  was a genuine bug caught in testing &mdash; the first implementation treated
  a transport failure as a server rejection and discarded the submission.
- **Idempotent replay.** Each queued submission carries a client-generated
  UUID, unique-indexed on `restaurant_submissions`, so a retry after a lost
  response can't file the survey twice.
- **Routes are preloaded.** The app is code-split, so the survey page pulls
  in the pages it leads to while a connection is still likely. Without that,
  losing signal mid-survey meant an unloadable chunk on submit.

**Trade-off.** The whole site now ships a service worker, not just the survey.
Editorial pages become readable offline (a bonus), but stale content is a new
failure mode &mdash; mitigated with `registerType: "autoUpdate"`, a
NetworkFirst strategy for data, and a `.htaccess` rule that stops `sw.js`
from being cached under the year-long immutable rule that covers hashed
assets. Getting that wrong would freeze the site for returning visitors.

**Requires HTTPS**, which is still commented out in `public/.htaccess`.

## Decision 10 &mdash; Brand colours are set by contrast ratios, not by eye

**Choice.** Darkened `--primary` (53% → 46%) and `--secondary` (42% → 32%),
and added `--primary-strong` / `--accent-strong` for text on tinted
surfaces. The logo coral `--accent` keeps its brand value but is now treated
as a fill only, with dark `--accent-foreground` for text on it.

**Why.** An axe audit found WCAG AA contrast failures on every page of the
site &mdash; 199 failing nodes on `/recalls` alone. White text on the old
primary blue was 4.02:1 against a 4.5:1 requirement, and white on the coral
was 2.94:1. For an organisation whose audience reads safety-critical
information on phones, that's not a cosmetic issue.

**How to keep it.** Never use `text-accent` for small text; use
`text-accent-strong`. Re-run an axe pass before lightening any of these
tokens.

## Things we explicitly didn't build

- **A CMS.** Editorial happens in git.
- **User accounts on the site.** No login. Newsletter signup is anonymous.
- ~~**A restaurant directory**~~ &mdash; built as a Supabase-backed filterable
  directory. See Decision 8.
- **Real-time anything.** No live recalls feed, no chat, no comments. The
  site is a calm reference, not a forum.
- **Auto-publishing AI medical content.** Hard editorial rule. Drafts go
  to PRs as `needs-review` and a human merges.
