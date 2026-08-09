-- Optional resources a restaurant asks for after finishing the survey.
--
-- These three questions used to live inside the survey itself, which put a
-- paid service (the allergen-menu build) in front of a restaurant while it
-- was still deciding whether to take part. They now sit on the confirmation
-- page, after the free listing is already secured, and are stored here rather
-- than in `restaurant_submissions.answers` so that a commercial signal can
-- never be mistaken for part of a restaurant's published answers.

CREATE TABLE IF NOT EXISTS public.restaurant_interests (
  restaurant_id              uuid PRIMARY KEY
                               REFERENCES public.restaurants(id) ON DELETE CASCADE,
  wants_best_practices_guide boolean NOT NULL DEFAULT false,
  wants_menu_help            boolean NOT NULL DEFAULT false,
  wants_updates              boolean NOT NULL DEFAULT false,
  requested_at               timestamptz NOT NULL DEFAULT now(),
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now()
);

-- Answering the follow-up twice updates the row rather than creating a
-- second one, which is why restaurant_id is the primary key.
CREATE INDEX IF NOT EXISTS idx_restaurant_interests_menu_help
  ON public.restaurant_interests(requested_at DESC)
  WHERE wants_menu_help;

DROP TRIGGER IF EXISTS update_restaurant_interests_updated_at
  ON public.restaurant_interests;
CREATE TRIGGER update_restaurant_interests_updated_at
  BEFORE UPDATE ON public.restaurant_interests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.restaurant_interests ENABLE ROW LEVEL SECURITY;

-- No public policy of any kind, in either direction. The browser never reads
-- or writes this table: the `restaurant-interests` edge function writes it
-- with the service role, exactly as the survey itself does.
DROP POLICY IF EXISTS "Admins manage restaurant interests" ON public.restaurant_interests;
CREATE POLICY "Admins manage restaurant interests"
  ON public.restaurant_interests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
