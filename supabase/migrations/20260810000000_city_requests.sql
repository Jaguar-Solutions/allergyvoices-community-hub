-- "Help bring AllergyVoices to your city" requests.
--
-- Replaces three mailto: links. A mailto loses the request the moment someone
-- is on a phone without a mail client configured, and nothing is recorded on
-- our side — so there was no list of who asked, for which city, or whether
-- anyone replied.
--
-- Holds an email address and a name, so it follows the same rule as
-- restaurant_contacts: no public read policy of any kind, and no public write
-- either. The `city-request` edge function writes it with the service role
-- after validating and spam-checking, exactly as the restaurant survey does.

CREATE TABLE IF NOT EXISTS public.city_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What they offered or asked for. Free text is kept separate so the counts
  -- stay countable.
  kind        text NOT NULL,

  name        text,
  email       text NOT NULL,
  city        text,
  state       text,
  message     text,

  -- Whether they also asked to join the mailing list, and whether that
  -- actually succeeded — a MailerLite outage should not silently look like
  -- consent was never given.
  wants_updates    boolean NOT NULL DEFAULT false,
  subscribed       boolean NOT NULL DEFAULT false,
  subscribe_error  text,

  -- Set by an admin once the request has been answered.
  handled_at  timestamptz,
  handled_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note        text,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT city_requests_kind
    CHECK (kind IN ('ambassador', 'recommend_restaurant', 'request_city')),
  CONSTRAINT city_requests_email_length CHECK (char_length(email) <= 255),
  CONSTRAINT city_requests_message_length CHECK (message IS NULL OR char_length(message) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_city_requests_created
  ON public.city_requests(created_at DESC);

-- Which cities are being asked for most is the whole point of collecting this.
CREATE INDEX IF NOT EXISTS idx_city_requests_city
  ON public.city_requests(lower(city), lower(state));

CREATE INDEX IF NOT EXISTS idx_city_requests_unhandled
  ON public.city_requests(created_at DESC)
  WHERE handled_at IS NULL;

DROP TRIGGER IF EXISTS update_city_requests_updated_at ON public.city_requests;
CREATE TRIGGER update_city_requests_updated_at
  BEFORE UPDATE ON public.city_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.city_requests ENABLE ROW LEVEL SECURITY;

-- Admin-only, in both directions. The public form posts to an edge function.
DROP POLICY IF EXISTS "Admins manage city requests" ON public.city_requests;
CREATE POLICY "Admins manage city requests"
  ON public.city_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
