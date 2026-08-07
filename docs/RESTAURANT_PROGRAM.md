# Restaurant Allergy Transparency & Recognition Program

A free public directory of restaurants that voluntarily share how they handle
food allergy requests. **Not** a certification, inspection, grade, score, or
rating — a transparency program.

## Language rules

This program is collaborative, not evaluative. In copy, option labels,
identifiers, and column names:

| Never use | Use instead |
| --- | --- |
| Grade, score, rating | Participant, shared information |
| Inspection, certification | Transparency, allergy-aware practices |
| Approved / rejected (publicly) | Published / not publishing |

The old `restaurant_ratings` table was dropped for exactly this reason.

## Phase 1 (built) vs Phase 2 (schema ready, UI not built)

**Phase 1 — live now:**

- Program landing page, survey, confirmation page
- Public directory with search + city/state/cuisine/allergen filters
- Restaurant profile pages with map, JSON-LD, and the standing disclaimer
- Admin dashboard: review, edit, publish, hide, request changes, CSV export
- Submission email receipts and admin notifications

**Phase 2 — tables and columns already exist, no UI yet:**

- Restaurant claim and self-service editing (`restaurant_claims`,
  `restaurants.claimed_by`, owner RLS policies are all in place)
- Recognition badges (`restaurant_badges`)
- Annual renewal prompts (`information_current_as_of`)

## Setup

Four steps. Only the first is required for the feature to work at all.

### 1. Run the migrations (required)

`supabase/migrations/20260802000000_restaurant_program.sql`, then
`supabase/migrations/20260802010000_offline_submission_idempotency.sql`

Apply it via the Supabase SQL editor or `supabase db push`.

**It refuses to run if the legacy Lovable-era tables contain any rows.** If it
raises an exception, export that data first, then delete the guard block at the
top and re-run. If those tables are empty (expected — that section was removed
in Phase 1 of the rebuild), it drops them and rebuilds cleanly.

### 2. Create your admin account (required to review submissions)

There is no public signup. In the Supabase dashboard:

1. **Authentication → Users → Add user**, with a real email and password.
2. Copy the new user's UUID.
3. Run in the SQL editor:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('<paste-the-uuid>', 'admin');
   ```

Then sign in at `/admin`. Without the `admin` role the dashboard shows "no
admin access" — and RLS returns nothing even if you bypass the UI.

### 3. Deploy the edge functions (required to accept submissions)

```bash
supabase functions deploy restaurant-submit
supabase functions deploy geocode-address
```

`restaurant-submit` is the survey's only write path — `restaurants` has no
public INSERT policy, so the form cannot save anything until this is deployed.
`geocode-address` fills in map coordinates at publish time; without it,
profiles simply show the "Get directions" link and no map.

### 4. Configure email (optional — submissions work without it)

Set these as Supabase edge function secrets:

| Secret | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Sends receipts and notifications. Unset = no email sent, submissions still save. |
| `PROGRAM_FROM_EMAIL` | Defaults to `Allergy Voices <info@allergyvoices.com>` |
| `PROGRAM_ADMIN_EMAIL` | Where new-submission alerts go. Unset = no admin alerts. |

Sending from `allergyvoices.com` requires verifying the domain in Resend by
adding their DNS records at Hostinger.

## Offline field mode

A surveyor with an iPad in a restaurant basement must be able to finish the
form and move on. The app is a PWA: it installs to the home screen, opens
without a connection, and holds completed surveys until it can deliver them.

**What happens with no signal:**

1. The app shell, fonts, and every route load from the service worker cache.
2. The surveyor fills in the form as normal and taps Submit.
3. The submission is written to **IndexedDB**, not sent.
4. They get the confirmation screen and can immediately start the next one.
5. When a connection returns, the queue is delivered to the same
   `restaurant-submit` edge function an online submission uses, and the rows
   land in Supabase exactly as if they'd been filed from a desk.

**When sync runs:** on app start, on the browser's `online` event, when the
app returns to the foreground, every 60 seconds while anything is pending,
and when someone taps "Send now". Nothing is removed from the device until
the server confirms it.

**Two failure modes worth knowing:**

- *Unreachable server, device thinks it's online.* Captive wifi and weak
  signal both report `navigator.onLine === true`. Only a genuine HTTP
  response from the server counts as delivery; everything else re-queues.
  See the `FunctionsHttpError` check in `src/program/api.ts`.
- *Duplicate delivery.* Each queued submission carries a client-generated
  UUID. The edge function looks it up before inserting, so a retry after a
  lost response is a no-op rather than a second copy.

Submissions the server actively *rejects* (validation failures) are parked as
"needs attention" on `/restaurants/field` rather than retried forever, with an
Export backup button so nothing is trapped on a device.

**Requires HTTPS.** Browsers refuse to register a service worker over plain
http. The HTTPS redirect in `public/.htaccess` is currently commented out —
until SSL is live on the domain, offline mode will not work on any device.

**Setting up an iPad:** open the site in Safari while online → Share → Add to
Home Screen → open it once more before heading out. `/restaurants/field` has
these instructions on the page.

## Directory filtering

Search matches restaurant name, city, and state. City, state, and cuisine are
single-select. **Allergens are multi-select, and combine with AND**: selecting
Peanut and Milk shows only restaurants that said they accommodate *both*.

That choice matters. A family managing two allergies needs a place that
handles both — an OR match would surface restaurants that handle one and not
the other, which reads as a match and is worse than showing nothing. The
popover says "Show restaurants that accommodate all of:" so the behaviour
isn't a guess.

Filtering happens in the browser over the full published set (see
`filterListings` in `src/program/api.ts`).

## Allergen menus, and the paid service

A restaurant can tell us it has an allergen menu (published online, available
in-house, or on request). When it's published online we show a prominent
**Allergen menu** block on the profile with a direct link, plus a badge on the
directory card. It's the most actionable thing on a listing — a family can
check it before leaving the house.

**There is deliberately no "has an allergen menu" directory filter.** Allergy
Voices also builds allergen menus for restaurants for a fee. A filter that
hid restaurants without one, run by the organisation selling them, would
create a financial incentive to exclude non-customers — and would invite that
question even though we'd never act on it. Show the menu when it exists;
don't build machinery that penalises its absence. Revisit only if the paid
service is retired.

Rules that keep the program and the service separate:

- The paid offer appears **only where restaurants are**: one opt-in question
  in the survey's improvement section, and a section on `/restaurants`. It
  never appears on a public listing or anywhere a family browses.
- `wants_menu_help` is **not** a public facet. It's follow-up information,
  not listing content.
- **Never brand a menu we built** on a public listing. No "menu by Allergy
  Voices" badge. The moment a family sees our logo on something we sold the
  restaurant, the listing reads as advertising.
- Listing order, badges, and prominence are identical regardless of whether a
  restaurant has bought anything. The program page says so out loud.

Menus we build are served from `/menus/r/<slug>` on the same domain, outside
this SPA. Two things protect that path: the `.htaccess` rewrite only falls
back to `index.html` for paths with no real file, and the service worker's
`navigateFallbackDenylist` excludes `/menus/`. Remove either and every menu
link resolves to the React app's 404 page.

## What an admin can change

| Action | Effect |
| --- | --- |
| Edit listing details | Name, address, phone, website, cuisine, publish consent. Applies immediately to the listing. |
| Edit responses | Writes a **new submission version**. The restaurant's original answers are never overwritten. |
| Publish | Derives public facets from the chosen version, generates the slug once, geocodes, sets status. |
| Request changes | Sets status, records the note, and **emails the restaurant** the note so they can reply. |
| Tell them they're live | Emails a published restaurant a link to their listing. |
| Hide | Pulls a published listing without deleting it. |
| Do not publish | Marks the listing declined. |
| Export CSV | Current filtered view, including answers from submissions not yet published. |

Publishing is blocked — in the UI *and* by a database constraint — for any
restaurant whose consent is "No". A restaurant that asked to be contacted
first is publishable, but the admin sees a warning with their email address.

## Admin email

`restaurant-notify` sends on an admin's behalf. Two things keep it safe:

- It requires a JWT (`verify_jwt = true`) **and** independently re-checks the
  admin role inside the function. Without the second check, any signed-in
  user could send mail from the allergyvoices.com domain.
- The recipient is never taken from the request. It is looked up from
  `restaurant_contacts` with the service role, so a caller cannot aim it at
  an arbitrary inbox. Admin-typed text is HTML-escaped before it goes into
  the body.

Every send is written to `restaurant_events` as `email:<kind>`, so a
restaurant's history shows what was sent and when.

Verified against the live project: unauthenticated returns 401, the public
anon key returns 401, and a genuine admin returns 200.

## How data flows

```
Survey form
  └─> restaurant-submit edge function (validates, spam-checks, dedupes)
        ├─> restaurants            (no PII)
        ├─> restaurant_contacts    (manager name/email — never public)
        └─> restaurant_submissions (version 1, append-only)

Admin publishes
  └─> derives facets from the chosen submission version
      generates the slug (once, never changes)
      geocodes the address
      sets status = 'published'

Public directory
  └─> reads published rows from `restaurants` only
```

**The public never reads `restaurant_submissions` or `restaurant_contacts`.**
Profiles render from `restaurants.facets`, the published-safe subset derived
from answers marked `publicFacet` in `src/program/survey.ts`. Anything not
marked stays private by construction rather than by remembering to filter it.

## Adding or changing survey questions

Edit `src/program/survey.ts` only. The form, the admin review screen, the
public profile, and the CSV export are all generated from it.

- Add `publicFacet: true` to show an answer on public profiles.
- Add `publicLabel` when the question phrasing is too long for a profile.
- No migration is needed — answers and facets are `jsonb`.

Already-published listings keep the facets captured at publish time. Republish
a listing from the admin detail page to pick up newly public questions.

## Key files

| Path | What it is |
| --- | --- |
| `src/program/survey.ts` | Question definitions — the single source of truth |
| `src/program/facets.ts` | Answers → published-safe facets, and profile/card display |
| `src/program/api.ts` | Public directory queries and form submission |
| `src/program/admin-api.ts` | Admin reads, status changes, publishing, CSV |
| `src/pages/restaurants/` | Landing, survey, confirmation, directory, profile |
| `src/pages/admin/` | Submissions list and review detail |
| `supabase/functions/restaurant-submit/` | The only public write path |
| `src/program/offline-queue.ts` | IndexedDB queue for field submissions |
| `src/program/sync.ts` | Delivers the queue when a connection returns |
| `src/pages/restaurants/FieldMode.tsx` | What's saved on this device |

## Things that are easy to break

Each of these was a real bug caught in testing. They have no automated guard
in the repo, so they're worth knowing before editing nearby code.

- **`min-w-0` on the profile and admin grid columns.** Grid items default to
  `min-width: auto`; without it, one unbroken word in a restaurant's answer
  stretches the page sideways on mobile.
- **`text-accent` is never safe for small text.** Use `text-accent-strong`.
  See Decision 10 in `ARCHITECTURE.md`.
- **Only `FunctionsHttpError` means the server rejected a submission.**
  Anything else must re-queue, or field submissions get silently discarded.
- **The admin answer editor keys on submission id, not object identity.**
  Reverting to `[latest]` reintroduces silent loss of an admin's edits on
  every background refetch.
- **Website URLs are normalized on the way in.** A bare `example.com` stored
  raw becomes a relative link that 404s on our own domain.
- **Hidden conditional answers are stripped at submit.** Otherwise text typed
  under a since-unticked "Other" gets published.
- **`/menus/` must stay in the service worker's navigateFallbackDenylist.**
  Otherwise the SPA answers those navigations and allergen menus 404.
- **Public answers need an `explainer`.** A short label plus a bare "Yes"
  means nothing to a parent — "Allergy discussions: Yes" was a real defect.
  Public labels read as statements ("Has a process for allergy requests") and
  carry a tap-friendly explainer popover.

## Known limits

- The directory fetches all published listings in one request and filters in
  the browser. Correct for tens to low hundreds of restaurants; move the
  filters in `filterListings` into the query before it reaches thousands.
- Profile pages are client-rendered. They're in `sitemap.xml` with JSON-LD and
  Googlebot renders them, but crawlers that don't run JS see the SPA shell.
- Restaurants can't yet edit their own listing — Phase 2. For now they reply to
  their confirmation email and an admin edits, which creates a new version.
