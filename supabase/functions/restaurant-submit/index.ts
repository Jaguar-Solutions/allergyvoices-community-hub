/**
 * Receives a restaurant transparency survey submission.
 *
 * This is the only write path for the public form. `restaurants` has no
 * public INSERT policy, so everything arrives here first, gets validated and
 * spam-checked, and is written with the service role.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const PROGRAM_FROM_EMAIL =
  Deno.env.get("PROGRAM_FROM_EMAIL") ?? "Allergy Voices <info@allergyvoices.com>";
const PROGRAM_ADMIN_EMAIL = Deno.env.get("PROGRAM_ADMIN_EMAIL");

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

const PUBLISH_CONSENT = ["yes", "yes_contact_first", "no"] as const;
type PublishConsent = (typeof PUBLISH_CONSENT)[number];

/** Answers are stored as opaque JSON: rendering is driven by the question
 *  registry in src/program/survey.ts, so unknown keys are simply ignored
 *  everywhere. We bound the size and validate only the fields that have a
 *  database-level effect. */
const MAX_ANSWERS_BYTES = 64_000;

interface Payload {
  restaurant?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  answers?: Record<string, unknown>;
  honeypot?: string;
  elapsedMs?: number;
  clientSubmissionId?: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function optionalStr(value: unknown, max: number): string | null {
  if (value == null || value === "") return null;
  return str(value, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Restaurants type "example.com" more often than "https://example.com".
 * Stored bare, it renders as a relative link on the profile page and sends
 * visitors to a 404 on our own domain.
 */
function normalizeWebsite(value: unknown): string | null {
  const raw = optionalStr(value, 500);
  if (!raw) return null;
  if (/^(javascript|data|vbscript):/i.test(raw)) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw}`;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return; // Not configured yet — submissions still work.
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: PROGRAM_FROM_EMAIL, to, subject, html }),
    });

    // `fetch` only throws on a transport failure, so a rejected send — an
    // unverified sending domain being the usual cause — would otherwise pass
    // silently and we'd believe the receipts were going out.
    if (!response.ok) {
      console.error(
        "program email rejected",
        response.status,
        await response.text(),
      );
    }
  } catch (error) {
    // Never fail a submission because an email bounced.
    console.error("program email failed", error);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  // --- spam checks --------------------------------------------------------
  // A hidden field no human ever sees, plus a floor on how fast the form
  // could plausibly be completed.
  if (payload.honeypot) {
    return json({ ok: true }); // Look successful; write nothing.
  }
  if (typeof payload.elapsedMs === "number" && payload.elapsedMs < 3000) {
    return json({ error: "Please take a moment to review your answers." }, 400);
  }

  // --- validation ---------------------------------------------------------
  const r = payload.restaurant ?? {};
  const c = payload.contact ?? {};

  const name = str(r.name, 200);
  const city = str(r.city, 100);
  const stateRaw = str(r.state, 2);
  const managerEmail = str(c.manager_email, 255);

  if (!name) return json({ error: "Restaurant name is required." }, 400);
  if (!city) return json({ error: "City is required." }, 400);
  if (!stateRaw) return json({ error: "State is required." }, 400);
  if (!managerEmail || !EMAIL_RE.test(managerEmail)) {
    return json({ error: "A valid manager email is required." }, 400);
  }

  const state = stateRaw.toUpperCase();
  const answers = (payload.answers ?? {}) as Record<string, unknown>;

  if (JSON.stringify(answers).length > MAX_ANSWERS_BYTES) {
    return json({ error: "Submission is too large." }, 400);
  }

  const consentValue = answers.publish_consent;
  const publishConsent: PublishConsent =
    typeof consentValue === "string" &&
    (PUBLISH_CONSENT as readonly string[]).includes(consentValue)
      ? (consentValue as PublishConsent)
      : "no"; // Absent or unrecognized consent must never mean "publish".

  const cuisine = Array.isArray(r.cuisine)
    ? r.cuisine.filter((x): x is string => typeof x === "string").slice(0, 10)
    : [];

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // --- idempotency --------------------------------------------------------
  // Offline submissions carry a client-generated id. If we've already stored
  // this one, the surveyor's device just didn't hear us say so the first time.
  const clientSubmissionId =
    typeof payload.clientSubmissionId === "string" &&
    UUID_RE.test(payload.clientSubmissionId)
      ? payload.clientSubmissionId
      : null;

  if (clientSubmissionId) {
    const { data: alreadyStored } = await supabase
      .from("restaurant_submissions")
      .select("restaurant_id")
      .eq("client_submission_id", clientSubmissionId)
      .maybeSingle();

    if (alreadyStored) {
      return json({
        ok: true,
        id: alreadyStored.restaurant_id,
        duplicate: true,
      });
    }
  }

  // --- dedupe -------------------------------------------------------------
  // A restaurant filling the form in twice should update its listing, not
  // create a second one competing with itself in the directory.
  const { data: existing } = await supabase
    .from("restaurants")
    .select("id, status")
    .ilike("name", name)
    .ilike("city", city)
    .eq("state", state)
    .maybeSingle();

  let restaurantId: string;
  let isResubmission = false;

  if (existing) {
    restaurantId = existing.id;
    isResubmission = true;
    await supabase
      .from("restaurants")
      .update({
        address_line1: optionalStr(r.address_line1, 300),
        address_line2: optionalStr(r.address_line2, 300),
        postal_code: optionalStr(r.postal_code, 20),
        website: normalizeWebsite(r.website),
        phone: optionalStr(r.phone, 32),
        cuisine,
        publish_consent: publishConsent,
        wants_website_badge: answers.wants_website_badge === "yes",
        // A resubmission on a published listing stays published; the admin
        // decides whether to promote the new version.
        status: existing.status === "published" ? "published" : "submitted",
      })
      .eq("id", restaurantId);
  } else {
    const { data: created, error: createError } = await supabase
      .from("restaurants")
      .insert({
        name,
        address_line1: optionalStr(r.address_line1, 300),
        address_line2: optionalStr(r.address_line2, 300),
        city,
        state,
        postal_code: optionalStr(r.postal_code, 20),
        website: normalizeWebsite(r.website),
        phone: optionalStr(r.phone, 32),
        cuisine,
        status: "submitted",
        publish_consent: publishConsent,
        listing_source: "self_submitted",
        wants_website_badge: answers.wants_website_badge === "yes",
      })
      .select("id")
      .single();

    if (createError || !created) {
      console.error("restaurant insert failed", createError);
      return json({ error: "Could not save your submission. Please try again." }, 500);
    }
    restaurantId = created.id;
  }

  // --- contact (PII, separate table) --------------------------------------
  const contactRow = {
    restaurant_id: restaurantId,
    manager_name: optionalStr(c.manager_name, 200),
    manager_email: managerEmail,
    position: optionalStr(c.position, 120),
    is_primary: true,
  };

  const { data: existingContact } = await supabase
    .from("restaurant_contacts")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("is_primary", true)
    .maybeSingle();

  if (existingContact) {
    await supabase
      .from("restaurant_contacts")
      .update(contactRow)
      .eq("id", existingContact.id);
  } else {
    await supabase.from("restaurant_contacts").insert(contactRow);
  }

  // --- submission version -------------------------------------------------
  const { data: lastSubmission } = await supabase
    .from("restaurant_submissions")
    .select("version")
    .eq("restaurant_id", restaurantId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = (lastSubmission?.version ?? 0) + 1;

  const { error: submissionError } = await supabase
    .from("restaurant_submissions")
    .insert({
      restaurant_id: restaurantId,
      version,
      answers,
      schema_version: 1,
      source: "web_form",
      client_submission_id: clientSubmissionId,
    });

  if (submissionError) {
    console.error("submission insert failed", submissionError);
    return json({ error: "Could not save your answers. Please try again." }, 500);
  }

  await supabase.from("restaurant_events").insert({
    restaurant_id: restaurantId,
    event_type: isResubmission ? "resubmitted" : "submitted",
    actor_type: "system",
    payload: { version, publish_consent: publishConsent },
  });

  // --- notifications ------------------------------------------------------
  await sendEmail(
    managerEmail,
    "Thank you for participating — Allergy Voices",
    `<p>Thank you for sharing how ${name} handles food allergy requests.</p>
     <p>Your information will be reviewed before appearing in our public directory.
     Participation does not imply certification or endorsement.</p>
     <p>If anything needs correcting, just reply to this email.</p>
     <p>— Allergy Voices</p>`,
  );

  if (PROGRAM_ADMIN_EMAIL) {
    await sendEmail(
      PROGRAM_ADMIN_EMAIL,
      `${isResubmission ? "Updated" : "New"} restaurant submission: ${name}`,
      `<p><strong>${name}</strong> — ${city}, ${state}</p>
       <p>Consent to publish: ${publishConsent}</p>
       <p>Review it in the admin dashboard.</p>`,
    );
  }

  return json({ ok: true, id: restaurantId, resubmission: isResubmission });
});
