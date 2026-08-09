-- Restaurant Allergy Practices Improvement Report
--
-- A generated PDF sent to a restaurant, built deterministically from the
-- answers it gave us. Nothing here is public: a report reflects a
-- restaurant's own practices back to it, including the parts it asked us not
-- to publish, so this table and its storage bucket are admin-only in both
-- directions.
--
-- Reports are versioned rather than overwritten, matching the append-only
-- convention `restaurant_submissions` already uses. Regenerating after the
-- rules change inserts a new row, so a PDF emailed months ago can still be
-- explained by the `engine_version` and the rendered text stored alongside it.

CREATE TABLE IF NOT EXISTS public.restaurant_reports (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id         uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  -- Which set of answers produced it. Without this a report cannot be
  -- reproduced once the restaurant submits an update.
  submission_id         uuid REFERENCES public.restaurant_submissions(id) ON DELETE SET NULL,

  version               integer NOT NULL,
  -- Rules version (src/program/report/engine.ts). Stored so an old report is
  -- still interpretable after the rules move on.
  engine_version        integer NOT NULL,
  -- Survey schema the answers were captured under.
  survey_schema_version integer,

  -- The rendered strengths and recommendations, not just their ids. Rule text
  -- gets edited; an audit needs the words the restaurant actually received.
  strengths             jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations       jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_steps            jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Object path inside the private `restaurant-reports` bucket.
  pdf_path              text,
  pdf_bytes             integer,

  email_status          text NOT NULL DEFAULT 'not_sent',
  email_to              text,
  email_sent_at         timestamptz,
  email_error           text,

  generated_at          timestamptz NOT NULL DEFAULT now(),
  generated_by          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT restaurant_reports_email_status
    CHECK (email_status IN ('not_sent', 'sent', 'failed')),
  UNIQUE (restaurant_id, version)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_reports_restaurant
  ON public.restaurant_reports(restaurant_id, version DESC);

DROP TRIGGER IF EXISTS update_restaurant_reports_updated_at ON public.restaurant_reports;
CREATE TRIGGER update_restaurant_reports_updated_at
  BEFORE UPDATE ON public.restaurant_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.restaurant_reports ENABLE ROW LEVEL SECURITY;

-- No public policy in either direction, same posture as restaurant_contacts.
DROP POLICY IF EXISTS "Admins manage restaurant reports" ON public.restaurant_reports;
CREATE POLICY "Admins manage restaurant reports"
  ON public.restaurant_reports FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Private storage bucket for the rendered PDFs
-- ---------------------------------------------------------------------------
-- `public = false`, so objects are reachable only through a signed URL or the
-- service role. The admin UI previews and downloads via short-lived signed
-- URLs; the email function reads the bytes with the service role.
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-reports', 'restaurant-reports', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins read restaurant report files" ON storage.objects;
CREATE POLICY "Admins read restaurant report files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'restaurant-reports'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Writes come from the edge function under the service role, which bypasses
-- RLS. There is deliberately no INSERT/UPDATE/DELETE policy for any client:
-- an admin session can read a report but cannot replace its bytes.
