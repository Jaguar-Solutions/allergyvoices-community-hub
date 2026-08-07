/**
 * Admin data access. Every call here runs as the signed-in admin user and is
 * enforced by RLS (`has_role(auth.uid(), 'admin')`) — the UI gate is a
 * convenience, not the security boundary.
 */

import { supabase } from "@/integrations/supabase/client";
import { deriveFacets } from "./facets";
import { baseSlug, uniqueSlug } from "./slug";
import { ALL_QUESTIONS, optionLabel } from "./survey";
import type {
  Answers,
  Restaurant,
  RestaurantContact,
  RestaurantEvent,
  RestaurantStatus,
  RestaurantSubmission,
} from "./types";

// --- auth -----------------------------------------------------------------

export async function signInAdmin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}

/** True when the signed-in user carries the admin role. */
export async function currentUserIsAdmin(): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return false;

  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}

// --- reads ----------------------------------------------------------------

export interface AdminListing extends Restaurant {
  contact: Pick<RestaurantContact, "manager_name" | "manager_email" | "position"> | null;
}

export async function fetchAllRestaurants(): Promise<AdminListing[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "*, restaurant_contacts(manager_name, manager_email, position, is_primary)",
    )
    .order("submitted_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const contacts = (row.restaurant_contacts ?? []) as Array<{
      manager_name: string | null;
      manager_email: string;
      position: string | null;
      is_primary: boolean;
    }>;
    const primary = contacts.find((c) => c.is_primary) ?? contacts[0] ?? null;
    const { restaurant_contacts: _ignored, ...restaurant } = row as typeof row & {
      restaurant_contacts?: unknown;
    };
    return {
      ...(restaurant as unknown as Restaurant),
      facets: (row.facets ?? {}) as Restaurant["facets"],
      contact: primary
        ? {
            manager_name: primary.manager_name,
            manager_email: primary.manager_email,
            position: primary.position,
          }
        : null,
    };
  });
}

export interface RestaurantDetail {
  restaurant: Restaurant;
  contacts: RestaurantContact[];
  submissions: RestaurantSubmission[];
  events: RestaurantEvent[];
}

export async function fetchRestaurantDetail(id: string): Promise<RestaurantDetail> {
  const [restaurantRes, contactsRes, submissionsRes, eventsRes] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).single(),
    supabase.from("restaurant_contacts").select("*").eq("restaurant_id", id),
    supabase
      .from("restaurant_submissions")
      .select("*")
      .eq("restaurant_id", id)
      .order("version", { ascending: false }),
    supabase
      .from("restaurant_events")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (restaurantRes.error) throw restaurantRes.error;
  if (contactsRes.error) throw contactsRes.error;
  if (submissionsRes.error) throw submissionsRes.error;
  if (eventsRes.error) throw eventsRes.error;

  return {
    restaurant: {
      ...(restaurantRes.data as unknown as Restaurant),
      facets: (restaurantRes.data.facets ?? {}) as Restaurant["facets"],
    },
    contacts: (contactsRes.data ?? []) as RestaurantContact[],
    submissions: (submissionsRes.data ?? []).map((s) => ({
      ...(s as unknown as RestaurantSubmission),
      answers: (s.answers ?? {}) as Answers,
    })),
    events: (eventsRes.data ?? []).map((e) => ({
      ...(e as unknown as RestaurantEvent),
      payload: (e.payload ?? {}) as Record<string, unknown>,
    })),
  };
}

// --- writes ---------------------------------------------------------------

async function logEvent(
  restaurantId: string,
  eventType: string,
  note?: string,
  payload: Record<string, unknown> = {},
) {
  const { data: sessionData } = await supabase.auth.getSession();
  await supabase.from("restaurant_events").insert({
    restaurant_id: restaurantId,
    event_type: eventType,
    actor_id: sessionData.session?.user.id ?? null,
    actor_type: "admin",
    note: note ?? null,
    payload: payload as never,
  });
}

export async function setStatus(
  restaurantId: string,
  status: RestaurantStatus,
  note?: string,
) {
  const { error } = await supabase
    .from("restaurants")
    .update({ status })
    .eq("id", restaurantId);
  if (error) throw error;
  await logEvent(restaurantId, `status:${status}`, note);
}

export interface NotifyResult {
  ok: boolean;
  sentTo?: string;
  error?: string;
}

/**
 * Emails the restaurant. The recipient is resolved server-side from our own
 * contact records, so nothing here can redirect the message.
 */
export async function notifyRestaurant(
  restaurantId: string,
  kind: "changes_requested" | "published",
  message = "",
): Promise<NotifyResult> {
  try {
    const { data, error } = await supabase.functions.invoke("restaurant-notify", {
      body: { restaurantId, kind, message },
    });

    if (error) {
      // The edge function puts a readable reason in the body; surface that
      // instead of "non-2xx status code".
      let detail = error.message;
      if (error.name === "FunctionsHttpError") {
        try {
          const body = await (error as { context?: Response }).context?.json();
          if (body && typeof body.error === "string") detail = body.error;
        } catch {
          // Non-JSON body; keep the original message.
        }
      }
      return { ok: false, error: detail };
    }
    return { ok: true, sentTo: (data as { sentTo?: string })?.sentTo };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not send the email.",
    };
  }
}

/**
 * Mark a submission as needing something from the restaurant, and tell them
 * what. The status change is the record; the email is the part that actually
 * reaches a human, so a failure to send is reported rather than swallowed.
 */
export async function requestChanges(
  restaurantId: string,
  note: string,
): Promise<NotifyResult> {
  await setStatus(restaurantId, "changes_requested", note);
  return notifyRestaurant(restaurantId, "changes_requested", note);
}

async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const { data, error } = await supabase.functions.invoke("geocode-address", {
      body: { address },
    });
    if (error || !data) return null;
    const { lat, lon } = data as { lat?: number; lon?: number };
    return typeof lat === "number" && typeof lon === "number" ? { lat, lon } : null;
  } catch {
    // Geocoding is a nicety; a missing map must never block publishing.
    return null;
  }
}

function formatAddress(r: Restaurant): string {
  return [r.address_line1, r.city, r.state, r.postal_code]
    .filter(Boolean)
    .join(", ");
}

/**
 * Publish a restaurant using a specific submission version. Generates the
 * slug on first publish only — a published URL never changes underneath
 * someone's bookmark — derives the public facets, and fills in coordinates
 * for the map if we don't have them yet.
 */
export async function publishRestaurant(
  restaurant: Restaurant,
  submission: RestaurantSubmission,
) {
  let slug = restaurant.slug;
  if (!slug) {
    const base = baseSlug(restaurant.name, restaurant.city, restaurant.state);
    const { data: existing } = await supabase
      .from("restaurants")
      .select("slug")
      .like("slug", `${base}%`);
    slug = uniqueSlug(
      base,
      (existing ?? []).map((r) => r.slug).filter((s): s is string => Boolean(s)),
    );
  }

  let latitude = restaurant.latitude;
  let longitude = restaurant.longitude;
  if (latitude == null || longitude == null) {
    const point = await geocode(formatAddress(restaurant));
    if (point) {
      latitude = point.lat;
      longitude = point.lon;
    }
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("restaurants")
    .update({
      status: "published",
      slug,
      latitude,
      longitude,
      facets: deriveFacets(submission.answers) as never,
      published_submission_id: submission.id,
      published_at: restaurant.published_at ?? now,
      // Drives the "Information current as of" line families rely on to judge
      // how stale a listing is. Falling back to now() keeps that line present
      // rather than silently dropping the card.
      information_current_as_of: submission.submitted_at ?? now,
    })
    .eq("id", restaurant.id);

  if (error) throw error;
  await logEvent(restaurant.id, "published", undefined, {
    submission_version: submission.version,
    slug,
  });
}

/** Save an admin's corrections as a new submission version. Nothing is overwritten. */
export async function saveAdminEdit(
  restaurantId: string,
  answers: Answers,
  currentVersion: number,
): Promise<RestaurantSubmission> {
  const { data: sessionData } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from("restaurant_submissions")
    .insert({
      restaurant_id: restaurantId,
      version: currentVersion + 1,
      answers: answers as never,
      source: "admin_edit",
      submitted_by: sessionData.session?.user.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  await logEvent(restaurantId, "edited", "Admin edited the responses", {
    version: currentVersion + 1,
  });
  return { ...(data as unknown as RestaurantSubmission), answers };
}

export async function updateRestaurantFields(
  restaurantId: string,
  fields: Partial<
    Pick<
      Restaurant,
      | "name"
      | "address_line1"
      | "address_line2"
      | "city"
      | "state"
      | "postal_code"
      | "website"
      | "phone"
      | "cuisine"
      | "publish_consent"
    >
  >,
) {
  const { error } = await supabase
    .from("restaurants")
    .update(fields as never)
    .eq("id", restaurantId);
  if (error) throw error;
  await logEvent(restaurantId, "details_updated", undefined, fields as Record<string, unknown>);
}

// --- export ---------------------------------------------------------------

function csvCell(value: unknown): string {
  if (value == null) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Latest answer set per restaurant, keyed by restaurant id.
 *
 * The CSV needs these because `facets` only exists once a listing is
 * published — and the export is most useful for submissions still waiting
 * to be reviewed.
 */
export async function fetchLatestAnswers(): Promise<Record<string, Answers>> {
  const { data, error } = await supabase
    .from("restaurant_submissions")
    .select("restaurant_id, version, answers")
    .order("version", { ascending: true });

  if (error) throw error;

  const latest: Record<string, Answers> = {};
  // Ascending order means later rows overwrite earlier ones, leaving the
  // highest version per restaurant.
  for (const row of data ?? []) {
    latest[row.restaurant_id] = (row.answers ?? {}) as Answers;
  }
  return latest;
}

/**
 * CSV of the current admin view. Includes manager contact details, so this
 * file is internal — it is generated in the browser from data the admin can
 * already see and never leaves their machine unless they send it.
 */
export function toCsv(
  listings: AdminListing[],
  answersById: Record<string, Answers> = {},
): string {
  const questionColumns = ALL_QUESTIONS.map((q) => q.id);
  const header = [
    "name",
    "address_line1",
    "city",
    "state",
    "postal_code",
    "phone",
    "website",
    "cuisine",
    "status",
    "publish_consent",
    "claim_status",
    "manager_name",
    "manager_email",
    "position",
    "submitted_at",
    "published_at",
    "profile_url",
    ...questionColumns,
  ];

  const rows = listings.map((listing) => {
    const source = answersById[listing.id] ?? listing.facets ?? {};
    return [
      listing.name,
      listing.address_line1,
      listing.city,
      listing.state,
      listing.postal_code,
      listing.phone,
      listing.website,
      listing.cuisine,
      listing.status,
      listing.publish_consent,
      listing.claim_status,
      listing.contact?.manager_name,
      listing.contact?.manager_email,
      listing.contact?.position,
      listing.submitted_at,
      listing.published_at,
      listing.slug ? `https://allergyvoices.com/restaurants/${listing.slug}` : "",
      ...questionColumns.map((id) => {
        const value = source[id];
        if (value == null) return "";
        return Array.isArray(value)
          ? value.map((v) => optionLabel(id, v)).join("; ")
          : optionLabel(id, value);
      }),
    ].map(csvCell);
  });

  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
