/** Domain types for the Restaurant Allergy Transparency & Recognition Program. */

export type RestaurantStatus =
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "published"
  | "hidden"
  | "declined";

export type PublishConsent = "yes" | "yes_contact_first" | "no";
export type ClaimStatus = "unclaimed" | "pending" | "claimed";
export type ListingSource = "self_submitted" | "admin_entered";
export type SubmissionSource = "web_form" | "owner_update" | "admin_edit";

/** A single stored answer. Multi-select questions store an array. */
export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

/** The published-safe subset of answers, denormalized onto `restaurants`. */
export type Facets = Record<string, AnswerValue>;

export interface Restaurant {
  id: string;
  slug: string | null;
  name: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  phone: string | null;
  cuisine: string[];
  status: RestaurantStatus;
  publish_consent: PublishConsent;
  listing_source: ListingSource;
  claim_status: ClaimStatus;
  claimed_by: string | null;
  claimed_at: string | null;
  wants_website_badge: boolean;
  published_submission_id: string | null;
  facets: Facets;
  submitted_at: string;
  published_at: string | null;
  information_current_as_of: string | null;
  created_at: string;
  updated_at: string;
}

export interface RestaurantContact {
  id: string;
  restaurant_id: string;
  manager_name: string | null;
  manager_email: string;
  position: string | null;
  phone: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantSubmission {
  id: string;
  restaurant_id: string;
  version: number;
  answers: Answers;
  schema_version: number;
  source: SubmissionSource;
  submitted_by: string | null;
  submitted_at: string;
}

export interface RestaurantEvent {
  id: string;
  restaurant_id: string;
  event_type: string;
  actor_id: string | null;
  actor_type: "admin" | "owner" | "system";
  note: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface RestaurantBadge {
  id: string;
  restaurant_id: string;
  badge_key: string;
  awarded_at: string;
  awarded_by: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
}

/** What the survey form posts to the `restaurant-submit` edge function. */
export interface SubmissionPayload {
  restaurant: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    website?: string;
    phone?: string;
    cuisine: string[];
  };
  contact: {
    manager_name: string;
    manager_email: string;
    position?: string;
  };
  answers: Answers;
  /** Anti-spam: must be empty, and the form must have been open for a moment. */
  honeypot?: string;
  elapsedMs?: number;
  recaptchaToken?: string;
  /**
   * Set for submissions replayed from the offline field queue. The server
   * stores it so a retry after a flaky response can't file the same survey
   * twice.
   */
  clientSubmissionId?: string;
}

export const STATUS_LABELS: Record<RestaurantStatus, string> = {
  submitted: "New submission",
  in_review: "In review",
  changes_requested: "Changes requested",
  published: "Published",
  hidden: "Hidden",
  declined: "Not publishing",
};

export const CONSENT_LABELS: Record<PublishConsent, string> = {
  yes: "Yes — publish",
  yes_contact_first: "Yes — contact me first",
  no: "No — do not publish",
};
