-- Clear the pre-v2 test submissions.
--
-- OPTIONAL, AND DESTRUCTIVE. Run it only if you agree the statement below is
-- true for your database.
--
-- Everything submitted before the survey moved to schema version 2 was test
-- data entered by the Allergy Voices team while building the program. Those
-- rows answer questions that no longer exist (`allergens_accommodated`,
-- `kitchen_practices`, `server_training`), so their `facets` would render on
-- a public profile as a set of blanks.
--
-- The cutover timestamp is what makes this safe to keep in the migration
-- history: re-running it after real restaurants have submitted cannot touch
-- them, because they were created after this date. Deletes cascade to
-- contacts, submissions, events, claims, badges, and interests.
--
-- If you have real pre-cutover data, DO NOT run this file — export first.

DO $$
DECLARE
  cutover  constant timestamptz := '2026-08-08 00:00:00+00';
  doomed   integer;
BEGIN
  SELECT count(*) INTO doomed
  FROM public.restaurants
  WHERE created_at < cutover;

  IF doomed = 0 THEN
    RAISE NOTICE 'No pre-v2 restaurants found; nothing to remove.';
    RETURN;
  END IF;

  RAISE NOTICE 'Removing % pre-v2 test restaurant(s) created before %.', doomed, cutover;

  DELETE FROM public.restaurants WHERE created_at < cutover;
END $$;
