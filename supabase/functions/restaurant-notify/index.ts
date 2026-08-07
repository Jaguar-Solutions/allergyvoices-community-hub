/**
 * Emails a restaurant on behalf of an admin.
 *
 * Two things make this safe to expose. It requires a valid JWT (see
 * supabase/config.toml), and it independently re-checks that the caller
 * carries the admin role before doing anything. Without that second check,
 * any signed-in user could send mail from the allergyvoices.com domain.
 *
 * The recipient address is never accepted from the request. It is looked up
 * from `restaurant_contacts` using the service role, so a caller cannot
 * point this at an arbitrary inbox.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const PROGRAM_FROM_EMAIL =
  Deno.env.get("PROGRAM_FROM_EMAIL") ?? "Allergy Voices <info@allergyvoices.com>";
const REPLY_TO = Deno.env.get("PROGRAM_ADMIN_EMAIL") ?? "info@allergyvoices.com";

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

type NotifyKind = "changes_requested" | "published";

const MAX_MESSAGE = 2000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Admin-typed text goes into an email body, so it is escaped, not trusted. */
function buildEmail(
  kind: NotifyKind,
  restaurantName: string,
  message: string,
  profileUrl: string | null,
): { subject: string; html: string } {
  const safeName = escapeHtml(restaurantName);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  if (kind === "published") {
    return {
      subject: `${restaurantName} is now listed on Allergy Voices`,
      html: `
        <p>Thank you for taking part in the Restaurant Allergy Transparency
        &amp; Recognition Program.</p>
        <p><strong>${safeName}</strong> is now published in our public
        directory, with the information you shared and the date you last
        confirmed it.</p>
        ${profileUrl ? `<p><a href="${profileUrl}">View your listing</a></p>` : ""}
        ${safeMessage ? `<p>${safeMessage}</p>` : ""}
        <p>Participation does not imply certification or endorsement. If
        anything needs correcting, just reply to this email.</p>
        <p>— Allergy Voices</p>`,
    };
  }

  return {
    subject: `A question about your Allergy Voices listing`,
    html: `
      <p>Thank you for sharing how <strong>${safeName}</strong> handles food
      allergy requests.</p>
      <p>Before we publish your listing, we wanted to check one thing:</p>
      <blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #ddd;color:#333">
        ${safeMessage}
      </blockquote>
      <p>Just reply to this email and we'll update your submission. Nothing is
      published until you're happy with it.</p>
      <p>— Allergy Voices</p>`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "Not authorised." }, 401);
  }

  // Identify the caller from their own token, then confirm the admin role.
  const asCaller = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await asCaller.auth.getUser();
  if (userError || !userData?.user) {
    return json({ error: "Not authorised." }, 401);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: isAdmin } = await admin.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (isAdmin !== true) {
    return json({ error: "Admin role required." }, 403);
  }

  let payload: { restaurantId?: string; kind?: string; message?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const restaurantId = typeof payload.restaurantId === "string" ? payload.restaurantId : "";
  const kind: NotifyKind =
    payload.kind === "published" ? "published" : "changes_requested";
  const message =
    typeof payload.message === "string" ? payload.message.trim().slice(0, MAX_MESSAGE) : "";

  if (!restaurantId) return json({ error: "restaurantId is required." }, 400);
  if (kind === "changes_requested" && !message) {
    return json({ error: "A message is required when requesting changes." }, 400);
  }

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, name, slug")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) return json({ error: "Restaurant not found." }, 404);

  // Recipient comes from our own records, never from the request.
  const { data: contact } = await admin
    .from("restaurant_contacts")
    .select("manager_email")
    .eq("restaurant_id", restaurantId)
    .eq("is_primary", true)
    .maybeSingle();

  if (!contact?.manager_email) {
    return json({ error: "No contact email on file for this restaurant." }, 422);
  }

  if (!RESEND_API_KEY) {
    return json({ error: "Email is not configured (RESEND_API_KEY unset)." }, 503);
  }

  const profileUrl = restaurant.slug
    ? `https://allergyvoices.com/restaurants/${restaurant.slug}`
    : null;
  const { subject, html } = buildEmail(kind, restaurant.name, message, profileUrl);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: PROGRAM_FROM_EMAIL,
      to: contact.manager_email,
      reply_to: REPLY_TO,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("notify email rejected", response.status, detail);
    return json({ error: "The email provider rejected the message." }, 502);
  }

  // Recorded so the restaurant's history shows what was sent and when.
  await admin.from("restaurant_events").insert({
    restaurant_id: restaurantId,
    event_type: `email:${kind}`,
    actor_id: userData.user.id,
    actor_type: "admin",
    note: message || null,
    payload: { to: contact.manager_email, subject },
  });

  return json({ ok: true, sentTo: contact.manager_email });
});
