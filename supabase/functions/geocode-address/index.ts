/**
 * Address → coordinates, for the map on a restaurant profile.
 *
 * Runs server-side rather than in the browser so we can send the User-Agent
 * that Nominatim's usage policy requires. Requires a valid JWT (see
 * supabase/config.toml) so this isn't an open geocoding proxy.
 */

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let address: string;
  try {
    const body = await req.json();
    address = typeof body.address === "string" ? body.address.trim() : "";
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  if (!address || address.length > 300) {
    return json({ error: "An address is required" }, 400);
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AllergyVoices/1.0 (https://allergyvoices.com)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return json({ error: "Geocoding service unavailable" }, 502);
    }

    const results = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) {
      return json({ error: "Address not found" }, 404);
    }

    return json({
      lat: Number.parseFloat(results[0].lat),
      lon: Number.parseFloat(results[0].lon),
    });
  } catch (error) {
    console.error("geocode failed", error);
    return json({ error: "Geocoding failed" }, 502);
  }
});
