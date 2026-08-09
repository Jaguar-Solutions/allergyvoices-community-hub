/**
 * Generates and emails a Restaurant Allergy Practices Improvement Report.
 *
 * Everything happens server-side. The caller sends a restaurant id and an
 * action; the function reads the survey answers itself, runs the rules engine
 * itself, renders the PDF itself, and — for `email` — resolves the recipient
 * from `restaurant_contacts` rather than from the request. A caller cannot
 * choose the content of the report or where it is sent.
 *
 * Same two protections as `restaurant-notify`: JWT verification via
 * config.toml, plus an independent admin-role check here, because a valid JWT
 * only proves someone is signed in.
 */

import { createClient } from "@supabase/supabase-js";

import { buildReport } from "../_shared/report-engine.ts";
import { REPORT_ASSETS } from "../_shared/report-assets.ts";
import { renderReportPdf, reportFilename } from "../_shared/report-pdf.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL =
  Deno.env.get("PROGRAM_FROM_EMAIL") ?? "Allergy Voices <info@allergyvoices.com>";
const REPLY_TO = Deno.env.get("PROGRAM_ADMIN_EMAIL") ?? "info@allergyvoices.com";
const BCC_EMAIL = Deno.env.get("PROGRAM_BCC_EMAIL") ?? "jaguarsllc@gmail.com";
/**
 * Set to "1" in a development project to render and store reports but never
 * hand anything to Resend. Automated checks rely on this.
 */
const SUPPRESS_EMAIL = Deno.env.get("PROGRAM_SUPPRESS_EMAIL") === "1";

const BUCKET = "restaurant-reports";

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

  // --- caller must be an admin ---------------------------------------------
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Not signed in." }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: userData } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (!user) return json({ error: "Not signed in." }, 401);

  const { data: isAdmin } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (!isAdmin) return json({ error: "Admin access required." }, 403);

  // --- request -------------------------------------------------------------
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const restaurantId = payload.restaurantId;
  const action = payload.action === "email" ? "email" : "generate";
  if (typeof restaurantId !== "string" || !UUID_RE.test(restaurantId)) {
    return json({ error: "A valid restaurant id is required." }, 400);
  }

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, name, city, state")
    .eq("id", restaurantId)
    .maybeSingle();
  if (!restaurant) return json({ error: "Unknown restaurant." }, 404);

  // ---------------------------------------------------------------------------
  // generate
  // ---------------------------------------------------------------------------
  if (action === "generate") {
    const { data: submission } = await admin
      .from("restaurant_submissions")
      .select("id, answers, schema_version")
      .eq("restaurant_id", restaurantId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!submission) {
      return json({ error: "This restaurant has no survey submission yet." }, 400);
    }

    const report = buildReport(
      (submission.answers ?? {}) as Record<string, string | string[]>,
    );
    const generatedAt = new Date();

    let pdf: Uint8Array;
    try {
      pdf = await renderReportPdf({
        restaurantName: restaurant.name,
        city: restaurant.city,
        state: restaurant.state,
        generatedAt,
        report,
        assets: REPORT_ASSETS,
      });
    } catch (error) {
      console.error("pdf render failed", error);
      return json({ error: "Could not render the report PDF." }, 500);
    }

    const { data: last } = await admin
      .from("restaurant_reports")
      .select("version")
      .eq("restaurant_id", restaurantId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    const version = (last?.version ?? 0) + 1;

    // Versioned object path: regenerating never overwrites the bytes a
    // restaurant may already have received.
    const path = `${restaurantId}/v${version}-${reportFilename(restaurant.name, generatedAt)}`;

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      console.error("pdf upload failed", uploadError);
      return json({ error: "Could not store the report." }, 500);
    }

    const { data: row, error: insertError } = await admin
      .from("restaurant_reports")
      .insert({
        restaurant_id: restaurantId,
        submission_id: submission.id,
        version,
        engine_version: report.engineVersion,
        survey_schema_version: submission.schema_version,
        strengths: report.strengths,
        recommendations: report.recommendations,
        next_steps: report.nextSteps,
        pdf_path: path,
        pdf_bytes: pdf.length,
        generated_at: generatedAt.toISOString(),
        generated_by: user.id,
      })
      .select("id, version, generated_at")
      .single();

    if (insertError || !row) {
      console.error("report insert failed", insertError);
      return json({ error: "Could not record the report." }, 500);
    }

    await admin.from("restaurant_events").insert({
      restaurant_id: restaurantId,
      event_type: "report_generated",
      actor_id: user.id,
      actor_type: "admin",
      payload: {
        version,
        engine_version: report.engineVersion,
        strengths: report.strengths.length,
        recommendations: report.recommendations.length,
      },
    });

    return json({
      ok: true,
      reportId: row.id,
      version: row.version,
      generatedAt: row.generated_at,
      strengths: report.strengths.length,
      recommendations: report.recommendations.length,
      pages: null,
      bytes: pdf.length,
    });
  }

  // ---------------------------------------------------------------------------
  // email
  // ---------------------------------------------------------------------------
  const { data: report } = await admin
    .from("restaurant_reports")
    .select("id, version, pdf_path, generated_at")
    .eq("restaurant_id", restaurantId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!report?.pdf_path) {
    return json({ error: "Generate a report before emailing it." }, 400);
  }

  // The recipient is never taken from the request. It comes from our own
  // contact record — the private address the respondent gave us, which is the
  // only address this report may go to.
  const { data: contact } = await admin
    .from("restaurant_contacts")
    .select("manager_name, manager_email")
    .eq("restaurant_id", restaurantId)
    .order("is_primary", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!contact?.manager_email) {
    return json({ error: "No contact email on file for this restaurant." }, 400);
  }

  const { data: file, error: downloadError } = await admin.storage
    .from(BUCKET)
    .download(report.pdf_path);

  if (downloadError || !file) {
    console.error("pdf download failed", downloadError);
    return json({ error: "Could not read the stored report." }, 500);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);

  const contactName = contact.manager_name?.trim() || "there";
  const filename = reportFilename(restaurant.name, new Date(report.generated_at));

  const body = `
    <p>Hi ${escapeHtml(contactName)},</p>
    <p>Thank you for participating in the Allergy Voices Restaurant Transparency Program.</p>
    <p>We've prepared a personalized Restaurant Allergy Practices Improvement Report based on
       the information you shared with us.</p>
    <p>The report highlights practices you already have in place, along with practical
       opportunities to strengthen allergy communication, transparency, and service.</p>
    <p>Your report is attached.</p>
    <p>Thank you for helping make dining information clearer for food-allergy families.</p>
    <p>Allergy Voices<br />
       <a href="https://allergyvoices.com">allergyvoices.com</a><br />
       info@allergyvoices.com</p>`;

  const recordFailure = async (reason: string) => {
    await admin
      .from("restaurant_reports")
      .update({
        email_status: "failed",
        email_to: contact.manager_email,
        email_error: reason.slice(0, 500),
      })
      .eq("id", report.id);
  };

  if (SUPPRESS_EMAIL || !RESEND_API_KEY) {
    // Development and automated checks stop here: the report is rendered and
    // stored, and nothing is handed to the mail provider.
    await recordFailure(
      SUPPRESS_EMAIL ? "Suppressed: PROGRAM_SUPPRESS_EMAIL=1" : "RESEND_API_KEY not configured",
    );
    return json({
      ok: false,
      suppressed: true,
      wouldSendTo: contact.manager_email,
      filename,
      error: SUPPRESS_EMAIL
        ? "Email sending is suppressed in this environment."
        : "Email is not configured in this environment.",
    });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [contact.manager_email],
      bcc: BCC_EMAIL ? [BCC_EMAIL] : undefined,
      reply_to: REPLY_TO,
      subject: `Your Allergy Voices Restaurant Improvement Report — ${restaurant.name}`,
      html: body,
      attachments: [{ filename, content: base64 }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("resend failed", detail);
    await recordFailure(detail);
    return json({ error: "The email could not be sent." }, 502);
  }

  const sentAt = new Date().toISOString();
  await admin
    .from("restaurant_reports")
    .update({
      email_status: "sent",
      email_to: contact.manager_email,
      email_sent_at: sentAt,
      email_error: null,
    })
    .eq("id", report.id);

  await admin.from("restaurant_events").insert({
    restaurant_id: restaurantId,
    event_type: "report_emailed",
    actor_id: user.id,
    actor_type: "admin",
    payload: { version: report.version, to: contact.manager_email },
  });

  return json({ ok: true, sentTo: contact.manager_email, sentAt, filename });
});
