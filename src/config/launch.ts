/**
 * Where the restaurant directory is being enrolled first.
 *
 * AllergyVoices is nationwide in scope; the directory pilot simply starts
 * somewhere, because a directory with three restaurants spread across the
 * country helps nobody, while thirty in one metro is genuinely useful. Every
 * mention of that starting region reads from here, so moving to phase two is
 * an edit to one file rather than a hunt through page copy.
 *
 * Nothing here restricts submissions. Restaurants anywhere in the United
 * States can take part today — see `NATIONWIDE_NOTE`.
 */

export const LAUNCH_REGION = {
  /** Short form, for chips and inline mentions. */
  name: "the Triangle",
  /** Used where the sentence needs the region without an article. */
  bareName: "Triangle",
  state: "North Carolina",
  stateCode: "NC",
  /** Named communities, in the order they should be listed. */
  cities: ["Raleigh", "Cary", "Durham", "Chapel Hill"],
} as const;

/** "Raleigh, Cary, Durham and surrounding communities" */
export const LAUNCH_CITIES_PHRASE = `${LAUNCH_REGION.cities.slice(0, -1).join(", ")}, ${
  LAUNCH_REGION.cities[LAUNCH_REGION.cities.length - 1]
} and surrounding communities`;

/** The badge shown near the homepage hero. */
export const LAUNCH_BADGE = `Launching first in ${LAUNCH_REGION.name} — expanding nationwide`;

/** One-line description of scope, for hero copy and meta descriptions. */
export const SCOPE_LINE = `Building a nationwide restaurant allergy-transparency directory — launching first in ${LAUNCH_CITIES_PHRASE}.`;

/**
 * The sentence that keeps the pilot from reading as a restriction. Every place
 * that names the launch region should carry this nearby, or a restaurant in
 * Ohio reasonably concludes the program is not for them.
 */
export const NATIONWIDE_NOTE =
  "Restaurants anywhere in the United States may also participate as we prepare to expand to additional cities.";

/**
 * What the directory actually publishes.
 *
 * Repeated verbatim across the site because the distinction it draws — a
 * standardized self-report, not a rating or an inspection — is the single
 * thing most likely to be misread, and paraphrasing it invites drift.
 */
export const VALUE_PROP =
  "Standardized, restaurant-provided information showing how each location handles food-allergy requests and when the information was last confirmed.";

/** What the directory is explicitly not. Rendered as a list where there's room. */
export const NOT_A_LIST = [
  "Customer ratings",
  "Restaurant reviews",
  "Certification",
  "Inspection",
  "Safety guarantees",
] as const;

export interface RolloutPhase {
  label: string;
  title: string;
  body: string;
}

export const ROLLOUT: RolloutPhase[] = [
  {
    label: "Phase 1",
    title: `${LAUNCH_REGION.bareName} region`,
    body: `${LAUNCH_CITIES_PHRASE}. We're enrolling restaurants here first so the directory is genuinely useful to families in one place before it spreads thin across many.`,
  },
  {
    label: "Phase 2",
    title: "Selected cities",
    body: "Launched with local AllergyVoices ambassadors, allergy families, community partners and direct restaurant outreach — the same way the first region is being built.",
  },
  {
    label: "Nationwide",
    title: "Open to every state",
    body: NATIONWIDE_NOTE,
  },
];
