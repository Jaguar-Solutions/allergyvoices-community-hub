-- Allow "suppressed" as an email status on restaurant_reports.
--
-- A report generated with PROGRAM_SUPPRESS_EMAIL=1 was being recorded as
-- "failed", which is wrong in a way that costs someone real time: suppression
-- is the safety switch working exactly as intended, and labelling it a failure
-- sends an admin looking for a broken mail configuration that isn't broken.
--
-- Existing rows are corrected by reading the reason we already stored.

ALTER TABLE public.restaurant_reports
  DROP CONSTRAINT IF EXISTS restaurant_reports_email_status;

ALTER TABLE public.restaurant_reports
  ADD CONSTRAINT restaurant_reports_email_status
  CHECK (email_status IN ('not_sent', 'sent', 'failed', 'suppressed'));

UPDATE public.restaurant_reports
SET email_status = 'suppressed',
    email_error  = 'Email sending is switched off in this environment (PROGRAM_SUPPRESS_EMAIL=1). The report was rendered and stored.'
WHERE email_status = 'failed'
  AND email_error LIKE 'Suppressed:%';
