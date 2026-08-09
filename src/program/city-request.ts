/** Client for the "help bring AllergyVoices to your city" form. */

import { supabase } from "@/integrations/supabase/client";

export type CityRequestKind =
  | "ambassador"
  | "recommend_restaurant"
  | "request_city";

export interface CityRequestPayload {
  kind: CityRequestKind;
  name?: string;
  email: string;
  city?: string;
  state?: string;
  message?: string;
  wantsUpdates: boolean;
  /** Anti-spam: must be empty, and the form open for a moment. */
  honeypot?: string;
  elapsedMs?: number;
}

export interface CityRequestResult {
  ok: boolean;
  error?: string;
  /** Whether the mailing-list signup succeeded, when one was requested. */
  subscribed?: boolean;
}

/**
 * Posts to the `city-request` edge function.
 *
 * The browser never writes to `city_requests` directly — there is no public
 * INSERT policy — so validation, spam checks, the team notification and the
 * mailing-list signup all happen server-side in one call.
 */
export async function submitCityRequest(
  payload: CityRequestPayload,
): Promise<CityRequestResult> {
  try {
    const { data, error } = await supabase.functions.invoke("city-request", {
      body: payload,
    });

    if (error) {
      let detail = "We couldn't send your request.";
      if (error.name === "FunctionsHttpError") {
        try {
          const body = await (error as { context?: Response }).context?.json();
          if (body && typeof body.error === "string") detail = body.error;
        } catch {
          // Non-JSON body; the generic message stands.
        }
      } else {
        detail = error.message;
      }
      return { ok: false, error: detail };
    }

    const result = data as { ok?: boolean; error?: string; subscribed?: boolean };
    if (result?.ok === false) return { ok: false, error: result.error };
    return { ok: true, subscribed: result?.subscribed };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
