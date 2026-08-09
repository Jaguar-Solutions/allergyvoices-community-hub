/**
 * The report rules engine.
 *
 * The implementation lives under `supabase/functions/_shared/` because the
 * edge function that renders the PDF must import it too, and a Deno function
 * cannot reach into `src/`. Keeping one implementation there — rather than a
 * copy on each side — is what stops the emailed PDF and the admin preview
 * drifting apart.
 */

export * from "../../../supabase/functions/_shared/report-engine";
