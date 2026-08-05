-- Restaurant Allergy Transparency & Recognition Program
--
-- Replaces the Lovable-era restaurant tables, which had wide-open RLS
-- ("FOR ALL TO public USING (true)") and a `restaurant_ratings` table that
-- contradicts the program's core promise: this is not a grading system.
--
-- Design notes:
--   * `restaurants` holds NO personally identifiable information. Manager
--     names, emails, and phone numbers live in `restaurant_contacts`, which
--     is never publicly readable. That separation is what makes it safe to
--     expose published `restaurants` rows to the public anon key.
--   * `restaurant_submissions` is append-only. A restaurant updating its
--     answers writes a new version; nothing is ever overwritten. Publishing
--     means pointing `restaurants.published_submission_id` at a version.
--   * `facets` is the denormalized, published-safe copy of the answers used
--     for directory filtering and profile display. New survey questions and
--     new filters therefore never require a migration.

-- ---------------------------------------------------------------------------
-- 0. Safety gate: refuse to destroy real data
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  legacy_table text;
  row_count integer;
BEGIN
  FOREACH legacy_table IN ARRAY ARRAY[
    'restaurants',
    'restaurant_questionnaires',
    'restaurant_ratings',
    'restaurant_publications'
  ] LOOP
    IF to_regclass('public.' || legacy_table) IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM public.%I', legacy_table) INTO row_count;
      IF row_count > 0 THEN
        RAISE EXCEPTION
          'Legacy table public.% still holds % row(s). Export that data before running this migration, then delete this DO block and re-run.',
          legacy_table, row_count;
      END IF;
    END IF;
  END LOOP;
END $$;

DROP TABLE IF EXISTS public.restaurant_ratings CASCADE;
DROP TABLE IF EXISTS public.restaurant_publications CASCADE;
DROP TABLE IF EXISTS public.restaurant_questionnaires CASCADE;
DROP TABLE IF EXISTS public.restaurants CASCADE;

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.restaurant_status AS ENUM (
    'submitted',          -- just arrived, nobody has looked at it
    'in_review',          -- an admin is working through it
    'changes_requested',  -- admin asked the restaurant a question
    'published',          -- live in the public directory
    'hidden',             -- was published, temporarily withdrawn
    'declined'            -- will not be published
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.restaurant_publish_consent AS ENUM (
    'yes',
    'yes_contact_first',
    'no'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.restaurant_claim_status AS ENUM (
    'unclaimed',
    'pending',
    'claimed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.restaurant_listing_source AS ENUM (
    'self_submitted',
    'admin_entered'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.restaurant_submission_source AS ENUM (
    'web_form',
    'owner_update',
    'admin_edit'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 2. restaurants — listing identity + published state (no PII)
-- ---------------------------------------------------------------------------
CREATE TABLE public.restaurants (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    text UNIQUE,

  name                    text NOT NULL,
  address_line1           text,
  address_line2           text,
  city                    text NOT NULL,
  state                   text NOT NULL,
  postal_code             text,
  country                 text NOT NULL DEFAULT 'US',
  latitude                numeric(9,6),
  longitude               numeric(9,6),

  website                 text,
  phone                   text,
  cuisine                 text[] NOT NULL DEFAULT '{}',

  status                  public.restaurant_status NOT NULL DEFAULT 'submitted',
  publish_consent         public.restaurant_publish_consent NOT NULL DEFAULT 'yes',
  listing_source          public.restaurant_listing_source NOT NULL DEFAULT 'self_submitted',

  claim_status            public.restaurant_claim_status NOT NULL DEFAULT 'unclaimed',
  claimed_by              uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at              timestamptz,

  wants_website_badge     boolean NOT NULL DEFAULT false,

  -- The submission version currently shown to the public.
  published_submission_id uuid,

  -- Published-safe, denormalized answers. Drives directory filters and the
  -- profile page. See src/program/facets.ts for the shape.
  facets                  jsonb NOT NULL DEFAULT '{}'::jsonb,

  submitted_at            timestamptz NOT NULL DEFAULT now(),
  published_at            timestamptz,
  information_current_as_of timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT restaurants_name_length CHECK (char_length(name) BETWEEN 1 AND 200),
  CONSTRAINT restaurants_city_length CHECK (char_length(city) BETWEEN 1 AND 100),
  CONSTRAINT restaurants_state_length CHECK (char_length(state) BETWEEN 2 AND 2),
  CONSTRAINT restaurants_phone_length CHECK (phone IS NULL OR char_length(phone) <= 32),
  CONSTRAINT restaurants_website_length CHECK (website IS NULL OR char_length(website) <= 500),
  -- A listing can only be public if the restaurant agreed to publication.
  CONSTRAINT restaurants_published_requires_consent
    CHECK (status <> 'published' OR publish_consent <> 'no'),
  -- A published listing must have a slug to be addressable.
  CONSTRAINT restaurants_published_requires_slug
    CHECK (status <> 'published' OR slug IS NOT NULL)
);

CREATE INDEX idx_restaurants_status ON public.restaurants(status);
CREATE INDEX idx_restaurants_state_city ON public.restaurants(state, city);
CREATE INDEX idx_restaurants_submitted_at ON public.restaurants(submitted_at DESC);
CREATE INDEX idx_restaurants_published_at ON public.restaurants(published_at DESC);
CREATE INDEX idx_restaurants_facets ON public.restaurants USING gin (facets);
CREATE INDEX idx_restaurants_cuisine ON public.restaurants USING gin (cuisine);
CREATE INDEX idx_restaurants_name_trgm ON public.restaurants (lower(name));

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 3. restaurant_contacts — PII, never public
-- ---------------------------------------------------------------------------
CREATE TABLE public.restaurant_contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  manager_name  text,
  manager_email text NOT NULL,
  position      text,
  phone         text,
  is_primary    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT restaurant_contacts_email_length CHECK (char_length(manager_email) <= 255)
);

CREATE INDEX idx_restaurant_contacts_restaurant_id ON public.restaurant_contacts(restaurant_id);
CREATE INDEX idx_restaurant_contacts_email ON public.restaurant_contacts(lower(manager_email));

CREATE TRIGGER update_restaurant_contacts_updated_at
  BEFORE UPDATE ON public.restaurant_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 4. restaurant_submissions — append-only answer history
-- ---------------------------------------------------------------------------
CREATE TABLE public.restaurant_submissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  version        integer NOT NULL,
  answers        jsonb NOT NULL,
  schema_version integer NOT NULL DEFAULT 1,
  source         public.restaurant_submission_source NOT NULL DEFAULT 'web_form',
  submitted_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at   timestamptz NOT NULL DEFAULT now(),

  UNIQUE (restaurant_id, version)
);

CREATE INDEX idx_restaurant_submissions_restaurant_id
  ON public.restaurant_submissions(restaurant_id, version DESC);

ALTER TABLE public.restaurants
  ADD CONSTRAINT restaurants_published_submission_fk
  FOREIGN KEY (published_submission_id)
  REFERENCES public.restaurant_submissions(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 5. restaurant_events — audit trail (status changes, notes, emails, claims)
-- ---------------------------------------------------------------------------
CREATE TABLE public.restaurant_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  event_type    text NOT NULL,
  actor_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_type    text NOT NULL DEFAULT 'admin',
  note          text,
  payload       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT restaurant_events_actor_type
    CHECK (actor_type IN ('admin', 'owner', 'system'))
);

CREATE INDEX idx_restaurant_events_restaurant_id
  ON public.restaurant_events(restaurant_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 6. restaurant_claims — ownership verification (Phase 2 surface, schema now)
-- ---------------------------------------------------------------------------
CREATE TABLE public.restaurant_claims (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  claimant_email text NOT NULL,
  claimant_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status         text NOT NULL DEFAULT 'pending',
  decided_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at     timestamptz,
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT restaurant_claims_status
    CHECK (status IN ('pending', 'approved', 'declined'))
);

CREATE INDEX idx_restaurant_claims_restaurant_id ON public.restaurant_claims(restaurant_id);
CREATE INDEX idx_restaurant_claims_status ON public.restaurant_claims(status);

-- ---------------------------------------------------------------------------
-- 7. restaurant_badges — recognition, not grading. Empty at launch.
-- ---------------------------------------------------------------------------
CREATE TABLE public.restaurant_badges (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  badge_key     text NOT NULL,
  awarded_at    timestamptz NOT NULL DEFAULT now(),
  awarded_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at    timestamptz,
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,

  UNIQUE (restaurant_id, badge_key)
);

CREATE INDEX idx_restaurant_badges_restaurant_id ON public.restaurant_badges(restaurant_id);

-- ---------------------------------------------------------------------------
-- 8. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.restaurants            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_contacts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_claims      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_badges      ENABLE ROW LEVEL SECURITY;

-- restaurants ---------------------------------------------------------------
-- Public reads published listings only. There is deliberately NO public
-- INSERT policy: the survey posts to the `restaurant-submit` edge function,
-- which validates and inserts with the service role.
CREATE POLICY "Public can view published restaurants"
  ON public.restaurants FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all restaurants"
  ON public.restaurants FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view their claimed restaurant"
  ON public.restaurants FOR SELECT
  TO authenticated
  USING (claimed_by = auth.uid());

CREATE POLICY "Admins can insert restaurants"
  ON public.restaurants FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update restaurants"
  ON public.restaurants FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete restaurants"
  ON public.restaurants FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- restaurant_contacts -------------------------------------------------------
-- No public policy of any kind. This table holds manager PII.
CREATE POLICY "Admins manage contacts"
  ON public.restaurant_contacts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view their own contact record"
  ON public.restaurant_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_contacts.restaurant_id
        AND r.claimed_by = auth.uid()
    )
  );

-- restaurant_submissions ----------------------------------------------------
-- Never public. The public directory reads `restaurants.facets` instead.
CREATE POLICY "Admins manage submissions"
  ON public.restaurant_submissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view their submissions"
  ON public.restaurant_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_submissions.restaurant_id
        AND r.claimed_by = auth.uid()
    )
  );

CREATE POLICY "Owners can add a submission version"
  ON public.restaurant_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    source = 'owner_update'
    AND EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_submissions.restaurant_id
        AND r.claimed_by = auth.uid()
    )
  );

-- restaurant_events ---------------------------------------------------------
CREATE POLICY "Admins manage events"
  ON public.restaurant_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- restaurant_claims ---------------------------------------------------------
CREATE POLICY "Admins manage claims"
  ON public.restaurant_claims FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Claimants can view their own claims"
  ON public.restaurant_claims FOR SELECT
  TO authenticated
  USING (claimant_id = auth.uid());

-- restaurant_badges ---------------------------------------------------------
CREATE POLICY "Public can view badges on published restaurants"
  ON public.restaurant_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_badges.restaurant_id
        AND r.status = 'published'
    )
  );

CREATE POLICY "Admins manage badges"
  ON public.restaurant_badges FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
