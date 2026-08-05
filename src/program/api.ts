/** Public (unauthenticated) data access for the restaurant directory. */

import { supabase } from "@/integrations/supabase/client";
import type { Facets, Restaurant, SubmissionPayload } from "./types";

/** Columns safe to read publicly — `restaurants` holds no PII by design. */
const PUBLIC_COLUMNS =
  "id, slug, name, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, website, phone, cuisine, status, facets, published_at, information_current_as_of, updated_at";

type PublicRestaurant = Pick<
  Restaurant,
  | "id"
  | "slug"
  | "name"
  | "address_line1"
  | "address_line2"
  | "city"
  | "state"
  | "postal_code"
  | "country"
  | "latitude"
  | "longitude"
  | "website"
  | "phone"
  | "cuisine"
  | "facets"
  | "published_at"
  | "information_current_as_of"
  | "updated_at"
>;

export type DirectoryListing = PublicRestaurant;

/**
 * Every published listing.
 *
 * Fetched in one query and filtered in the browser: at the scale this
 * directory will run at for a long while (tens to low hundreds of
 * restaurants), one cached request makes search feel instant and keeps the
 * filter logic in one readable place. If the directory ever outgrows that,
 * move the filters in `filterListings` into the query.
 */
export async function fetchPublishedRestaurants(): Promise<DirectoryListing[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(PUBLIC_COLUMNS)
    .eq("status", "published")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    facets: (row.facets ?? {}) as Facets,
  })) as DirectoryListing[];
}

export async function fetchRestaurantBySlug(
  slug: string,
): Promise<DirectoryListing | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(PUBLIC_COLUMNS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { ...data, facets: (data.facets ?? {}) as Facets } as DirectoryListing;
}

export interface DirectoryFilters {
  query: string;
  city: string;
  state: string;
  cuisine: string;
  /** Families often manage several allergies at once, so this is a set. */
  allergens: string[];
}

export const EMPTY_FILTERS: DirectoryFilters = {
  query: "",
  city: "",
  state: "",
  cuisine: "",
  allergens: [],
};

/**
 * Every selected allergen must be accommodated, not just one of them.
 *
 * A family managing peanut *and* milk needs a restaurant that handles both —
 * showing places that handle only one would be worse than showing nothing,
 * because it looks like a match.
 */
function matchesAllergens(listing: DirectoryListing, allergens: string[]): boolean {
  if (allergens.length === 0) return true;
  const accommodated = listing.facets.allergens_accommodated;
  if (!Array.isArray(accommodated)) return false;
  return allergens.every((allergen) => accommodated.includes(allergen));
}

export function filterListings(
  listings: DirectoryListing[],
  filters: DirectoryFilters,
): DirectoryListing[] {
  const query = filters.query.trim().toLowerCase();

  return listings.filter((listing) => {
    if (query) {
      const haystack = [listing.name, listing.city, listing.state]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.city && listing.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    if (filters.state && listing.state !== filters.state) return false;
    if (filters.cuisine && !listing.cuisine.includes(filters.cuisine)) return false;
    if (!matchesAllergens(listing, filters.allergens)) return false;
    return true;
  });
}

export function hasActiveFilters(filters: DirectoryFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.city !== "" ||
    filters.state !== "" ||
    filters.cuisine !== "" ||
    filters.allergens.length > 0
  );
}

/** Distinct values present in the directory, for populating the filter menus. */
export function directoryFacetOptions(listings: DirectoryListing[]) {
  const cities = new Set<string>();
  const states = new Set<string>();
  const cuisines = new Set<string>();

  for (const listing of listings) {
    cities.add(listing.city);
    states.add(listing.state);
    listing.cuisine.forEach((c) => cuisines.add(c));
  }

  return {
    cities: [...cities].sort((a, b) => a.localeCompare(b)),
    states: [...states].sort(),
    cuisines: [...cuisines].sort(),
  };
}

export interface SubmitResult {
  ok: boolean;
  restaurantId?: string;
  error?: string;
  /** True when the failure looks like "no connection" rather than "server said no". */
  offline?: boolean;
}

/**
 * Posts the survey to the `restaurant-submit` edge function. The form never
 * writes to the database directly — there is no public INSERT policy — so
 * validation, spam checks, and dedupe all happen server-side.
 */
export async function submitRestaurant(
  payload: SubmissionPayload,
): Promise<SubmitResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false, error: "No connection", offline: true };
  }

  try {
    const { data, error } = await supabase.functions.invoke("restaurant-submit", {
      body: payload,
    });

    if (error) {
      // Only a FunctionsHttpError means the server actually answered and said
      // no. Everything else — DNS failure, weak signal, captive wifi portal,
      // Supabase unreachable — means we never got through, and the caller
      // must queue the submission rather than lose someone's answers.
      // `navigator.onLine` is no help here: it reports true on a captive
      // portal and on a connection too weak to complete a request.
      if (error.name !== "FunctionsHttpError") {
        return { ok: false, error: error.message, offline: true };
      }

      // The server responded with an error status. Our edge function puts a
      // human-readable reason in the body, so surface that rather than
      // "Edge Function returned a non-2xx status code".
      let message = "We couldn't save your submission.";
      try {
        const body = await (error as { context?: Response }).context?.json();
        if (body && typeof body.error === "string") message = body.error;
      } catch {
        // Non-JSON error body; the generic message stands.
      }
      return { ok: false, error: message };
    }

    if (data && typeof data === "object" && "error" in data) {
      return { ok: false, error: String((data as { error: unknown }).error) };
    }
    return { ok: true, restaurantId: (data as { id?: string })?.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
      offline: true,
    };
  }
}
