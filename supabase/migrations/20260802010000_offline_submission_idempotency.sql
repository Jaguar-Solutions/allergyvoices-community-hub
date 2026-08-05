-- Idempotency for submissions collected offline in the field.
--
-- A surveyor's iPad may retry a queued submission after a response was lost
-- in transit. The client generates an id up front and sends it with every
-- attempt; a unique index turns a duplicate delivery into a no-op instead of
-- a second copy of the same survey.

ALTER TABLE public.restaurant_submissions
  ADD COLUMN IF NOT EXISTS client_submission_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_submissions_client_id
  ON public.restaurant_submissions (client_submission_id)
  WHERE client_submission_id IS NOT NULL;
