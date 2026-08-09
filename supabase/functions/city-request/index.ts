/**
 * Receives a "help bring AllergyVoices to your city" request.
 *
 * One call does three things that used to be a mailto and a hope: records the
 * request, tells the team, and — only if the person asked — adds them to the
 * mailing list. All server-side, so there is no public INSERT policy on
 * `city_requests` and a caller cannot choose where the notification goes.
 *
 * Deliberately tolerant about partial failure. The request row is the thing
 * that must not be lost; a MailerLite outage or a Resend hiccup is recorded
 * and reported, but never turns a submitted request into an error the person
 * sees, because they cannot do anything about it and would simply resubmit.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL =
  Deno.env.get("PROGRAM_FROM_EMAIL") ?? "Allergy Voices <info@allergyvoices.com>";
const TEAM_EMAIL = Deno.env.get("PROGRAM_ADMIN_EMAIL") ?? "info@allergyvoices.com";
const MAILERLITE_API_KEY = Deno.env.get("MAILERLITE_API_KEY");
const MAILERLITE_GROUP_ID = Deno.env.get("MAILERLITE_GROUP_ID") ?? "144434370088184786";
const SUPPRESS_EMAIL = Deno.env.get("PROGRAM_SUPPRESS_EMAIL") === "1";

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

const KINDS = ["ambassador", "recommend_restaurant", "request_city"] as const;
type Kind = (typeof KINDS)[number];

const KIND_LABEL: Record<Kind, string> = {
  ambassador: "Local ambassador",
  recommend_restaurant: "Restaurant recommendation",
  request_city: "City request",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  // Same anti-spam shape as the restaurant survey: an invisible field bots
  // fill in, and a form that was submitted implausibly fast. Both answer
  // "ok" rather than revealing the check.
  if (typeof payload.honeypot === "string" && payload.honeypot.trim() !== "") {
    return json({ ok: true });
  }
  if (typeof payload.elapsedMs === "number" && payload.elapsedMs < 1500) {
    return json({ error: "Please take a moment to review your details." }, 400);
  }

  const kind = KINDS.includes(payload.kind as Kind) ? (payload.kind as Kind) : null;
  if (!kind) return json({ error: "Please choose how you'd like to help." }, 400);

  const email = str(payload.email, 255);
  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  const name = str(payload.name, 120);
  const city = str(payload.city, 120);
  const state = str(payload.state, 2);
  const message = str(payload.message, 2000);
  const wantsUpdates = payload.wantsUpdates === true;

  // A city request with no city is not actionable.
  if (kind === "request_city" && !city) {
    return json({ error: "Please tell us which city." }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // --- mailing list --------------------------------------------------------
  let subscribed = false;
  let subscribeError: string | null = null;

  if (wantsUpdates) {
    // Local list first: it is ours, and a duplicate is a success, not a
    // failure — someone re-asking to be on a list they're already on has got
    // what they wanted.
    const { error } = await supabase.from("subscribers").insert([{ email }]);
    if (!error || error.code === "23505") {
      subscribed = true;
    } else {
      subscribeError = error.message;
    }

    if (MAILERLITE_API_KEY) {
      try {
        const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MAILERLITE_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, groups: [MAILERLITE_GROUP_ID] }),
        });
        if (!response.ok) {
          subscribeError = `MailerLite ${response.status}: ${(await response.text()).slice(0, 200)}`;
        }
      } catch (error) {
        subscribeError = error instanceof Error ? error.message : "MailerLite unreachable";
      }
    }
  }

  // --- record --------------------------------------------------------------
  const { data: row, error: insertError } = await supabase
    .from("city_requests")
    .insert({
      kind,
      name,
      email,
      city,
      state: state ? state.toUpperCase() : null,
      message,
      wants_updates: wantsUpdates,
      subscribed,
      subscribe_error: subscribeError,
    })
    .select("id")
    .single();

  if (insertError || !row) {
    console.error("city request insert failed", insertError);
    return json({ error: "Could not save your request. Please try again." }, 500);
  }

  // --- notify the team -----------------------------------------------------
  // Everything above is already durable, so a mail failure is logged and the
  // person is still told their request went through.
  let notified = false;
  if (RESEND_API_KEY && !SUPPRESS_EMAIL) {
    const where = [city, state].filter(Boolean).join(", ") || "not given";
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [TEAM_EMAIL],
          // Replying goes straight back to the person who asked.
          reply_to: email,
          subject: `${KIND_LABEL[kind]}: ${where}`,
          html: `
            <p><strong>${escapeHtml(KIND_LABEL[kind])}</strong></p>
            <p>
              Name: ${escapeHtml(name ?? "not given")}<br />
              Email: ${escapeHtml(email)}<br />
              City: ${escapeHtml(where)}<br />
              Joined mailing list: ${wantsUpdates ? (subscribed ? "yes" : "asked, but failed") : "no"}
            </p>
            ${message ? `<p><strong>Message</strong><br />${escapeHtml(message).replace(/\n/g, "<br />")}</p>` : ""}
            <p style="color:#667">Request ${row.id}</p>`,
        }),
      });
      notified = response.ok;
      if (!response.ok) console.error("resend failed", await response.text());
    } catch (error) {
      console.error("resend threw", error);
    }
  }

  return json({ ok: true, id: row.id, subscribed, notified });
});
