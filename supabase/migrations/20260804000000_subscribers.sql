-- Newsletter subscribers.
--
-- This table existed in the original Lovable-provisioned project but not in
-- the AllergyVoices project the app was pointed at on 2026-08-04. The
-- homepage signup form writes to it, so it was created during that switch —
-- recorded here so the migration history matches the live database and a
-- rebuild from scratch produces the same schema.

CREATE TABLE IF NOT EXISTS public.subscribers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone may subscribe; only admins may read the list back.
DO $$ BEGIN
  CREATE POLICY "Anyone can subscribe"
    ON public.subscribers FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view subscribers"
    ON public.subscribers FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
