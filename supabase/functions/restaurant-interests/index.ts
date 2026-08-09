/**
 * Records the optional resources a restaurant asked for after submitting its
 * survey.
 *
 * A separate function rather than extra fields on `restaurant-submit`,
 * because these are answered on a later page and must not be able to alter a
 * submission that is already stored. It writes to exactly one table, sets
 * exactly three booleans, and can neither create a restaurant nor change a
 * listing's publication state.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const restaurantId = payload.restaurantId;
  if (typeof restaurantId !== "string" || !UUID_RE.test(restaurantId)) {
    return json({ error: "A valid restaurant id is required." }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // The id came from the browser, so confirm it names a real restaurant
  // before writing a row keyed to it.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) {
    return json({ error: "Unknown restaurant." }, 404);
  }

  const flag = (key: string) => payload[key] === true;

  const { error } = await supabase.from("restaurant_interests").upsert(
    {
      restaurant_id: restaurantId,
      wants_best_practices_guide: flag("wants_best_practices_guide"),
      wants_menu_help: flag("wants_menu_help"),
      wants_updates: flag("wants_updates"),
      requested_at: new Date().toISOString(),
    },
    { onConflict: "restaurant_id" },
  );

  if (error) {
    console.error("interest upsert failed", error);
    return json({ error: "Could not save your request." }, 500);
  }

  await supabase.from("restaurant_events").insert({
    restaurant_id: restaurantId,
    event_type: "resources_requested",
    actor_type: "system",
    payload: {
      wants_best_practices_guide: flag("wants_best_practices_guide"),
      wants_menu_help: flag("wants_menu_help"),
      wants_updates: flag("wants_updates"),
    },
  });

  return json({ ok: true });
});
