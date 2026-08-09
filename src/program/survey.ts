/**
 * The restaurant transparency survey — the single source of truth.
 *
 * The form, the admin review screen, the public profile, and the directory
 * filters are all generated from these definitions. Adding a question here
 * makes it appear in the form and the admin view automatically; set
 * `publicFacet: true` to also surface it on public profiles.
 *
 * Language rule for this whole program: we describe what a restaurant does,
 * never how well it does it. No grades, scores, ratings, inspections, or
 * certifications — in copy, in option labels, or in identifiers. In
 * particular, an allergen a restaurant selects is one it is *prepared to
 * discuss*, never one it is "safe" for.
 */

export const SURVEY_SCHEMA_VERSION = 2;

export type QuestionType = "single" | "multi" | "textarea" | "text" | "yesno";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  help?: string;
  options?: QuestionOption[];
  required?: boolean;
  maxLength?: number;
  /**
   * Renders only when the named question currently holds (or, for
   * multi-selects, includes) one of `value`. A list means "any of these".
   */
  showWhen?: { question: string; value: string | string[] };
  /** Included in the published, publicly readable facets. */
  publicFacet?: boolean;
  /** Short label used on the public profile, where the question phrasing is too long. */
  publicLabel?: string;
  /**
   * Plain-language explanation of what the answer actually means, shown to
   * families on the public profile.
   *
   * A short label plus a bare "Yes" is close to meaningless on its own —
   * "Allergy discussions: Yes" tells a parent nothing about what they can
   * expect when they walk in. This is the sentence that does.
   */
  explainer?: string;
}

export interface SurveySection {
  id: string;
  title: string;
  intro?: string;
  questions: Question[];
}

const YES_NO: QuestionOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const ALLERGEN_OPTIONS: QuestionOption[] = [
  { value: "milk", label: "Milk" },
  { value: "egg", label: "Egg" },
  { value: "peanut", label: "Peanut" },
  { value: "tree_nut", label: "Tree Nut" },
  { value: "sesame", label: "Sesame" },
  { value: "soy", label: "Soy" },
  { value: "wheat", label: "Wheat" },
  { value: "fish", label: "Fish" },
  { value: "shellfish", label: "Shellfish" },
  { value: "other", label: "Other" },
];

/**
 * Not in the original survey draft, but the directory filters by cuisine, so
 * we have to ask for it rather than guess.
 */
export const CUISINE_OPTIONS: QuestionOption[] = [
  { value: "american", label: "American" },
  { value: "bakery", label: "Bakery" },
  { value: "barbecue", label: "Barbecue" },
  { value: "breakfast", label: "Breakfast & Brunch" },
  { value: "burgers", label: "Burgers" },
  { value: "cafe", label: "Café & Coffee" },
  { value: "caribbean", label: "Caribbean" },
  { value: "chinese", label: "Chinese" },
  { value: "dessert", label: "Dessert & Ice Cream" },
  { value: "french", label: "French" },
  { value: "greek", label: "Greek" },
  { value: "indian", label: "Indian" },
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "mexican", label: "Mexican" },
  { value: "middle_eastern", label: "Middle Eastern" },
  { value: "pizza", label: "Pizza" },
  { value: "seafood", label: "Seafood" },
  { value: "steakhouse", label: "Steakhouse" },
  { value: "thai", label: "Thai" },
  { value: "vegetarian", label: "Vegetarian & Vegan" },
  { value: "vietnamese", label: "Vietnamese" },
  { value: "other", label: "Other" },
];

/**
 * Cross-contact steps, phrased as things a kitchen *may* do for an allergy
 * order rather than equipment it owns. "Dedicated fryer" is deliberately in
 * this list and also has its own follow-up: on its own the phrase is one of
 * the most over-read claims in allergy dining, so we ask what it actually
 * means here instead of publishing the label alone.
 */
export const CROSS_CONTACT_OPTIONS: QuestionOption[] = [
  { value: "wash_hands_gloves", label: "Staff wash hands/change gloves" },
  { value: "clean_surfaces", label: "Clean and sanitize preparation surfaces" },
  { value: "clean_utensils", label: "Use clean/separate utensils or equipment" },
  { value: "separate_prep_area", label: "Use a separate preparation area" },
  { value: "clean_pan", label: "Use a clean pan or cooking surface" },
  { value: "order_flagged", label: "Allergy order is identified/flagged for kitchen staff" },
  { value: "manager_verifies", label: "Manager or chef oversees/verifies the order" },
  { value: "dedicated_fryer", label: "Dedicated fryer is available" },
  { value: "other", label: "Other" },
  { value: "none", label: "No specific cross-contact procedure" },
];

export const SURVEY_SECTIONS: SurveySection[] = [
  {
    id: "practices",
    title: "Allergy practices",
    intro:
      "Tell us how your restaurant handles allergy requests today. There are no wrong answers — families find it just as useful to know what you don't offer as what you do.",
    questions: [
      {
        id: "allergy_process",
        type: "single",
        label: "Does your restaurant have a process for handling food allergy requests?",
        required: true,
        publicFacet: true,
        publicLabel: "Allergy process",
        explainer:
          "Whether the restaurant has a set way of handling allergy requests, rather than working it out case by case.",
        options: [
          { value: "yes_documented", label: "Yes — documented process" },
          { value: "yes_informal", label: "Yes — informal process" },
          { value: "no_specific", label: "No specific process" },
          { value: "unsure", label: "Unsure" },
        ],
      },
      {
        id: "staff_training",
        type: "single",
        label: "Do staff receive food allergy training?",
        required: true,
        publicFacet: true,
        publicLabel: "Staff allergy training",
        explainer:
          "Which staff have been trained to handle an allergy request and pass it to the kitchen correctly.",
        options: [
          { value: "servers_and_kitchen", label: "Yes — servers and kitchen staff" },
          { value: "some_staff", label: "Some staff" },
          { value: "managers_chefs_only", label: "Managers/chefs only" },
          { value: "none", label: "No formal allergy training" },
          { value: "unsure", label: "Unsure" },
        ],
      },
      {
        id: "training_type",
        type: "single",
        label: "What type of allergy training is used?",
        help: "Optional.",
        showWhen: {
          question: "staff_training",
          value: ["servers_and_kitchen", "some_staff", "managers_chefs_only"],
        },
        publicFacet: true,
        publicLabel: "Type of training",
        explainer:
          "The kind of allergy training staff have had. Programs differ in depth; this is what the restaurant reported using.",
        options: [
          { value: "servsafe", label: "ServSafe Allergens" },
          { value: "internal", label: "Internal/company training" },
          { value: "other", label: "Other" },
          { value: "unsure", label: "Unsure" },
        ],
      },
      {
        id: "who_to_ask",
        type: "multi",
        label: "When a guest reports a food allergy, who can they speak with?",
        help: "Choose everyone a guest could reasonably be put in touch with.",
        publicFacet: true,
        publicLabel: "Who you can speak with",
        explainer:
          "Who the restaurant says a guest can talk to about an allergy — useful when you'd rather speak to whoever is preparing the food.",
        options: [
          { value: "server", label: "Server" },
          { value: "manager", label: "Manager" },
          { value: "chef", label: "Chef/kitchen manager" },
          { value: "other_trained", label: "Other trained employee" },
        ],
      },
      {
        id: "ingredient_info",
        type: "single",
        label: "Can staff access ingredient information when helping a guest with an allergy?",
        required: true,
        publicFacet: true,
        publicLabel: "Ingredient information",
        explainer:
          "Whether staff can find out what is actually in a dish when you ask — from documentation, or by checking packaging.",
        options: [
          { value: "documented", label: "Yes — ingredient/allergen information is documented" },
          { value: "staff_can_check", label: "Yes — staff can check ingredients/packages" },
          { value: "limited", label: "Limited information" },
          { value: "no", label: "No" },
          { value: "unsure", label: "Unsure" },
        ],
      },
      {
        id: "menu_modification",
        type: "single",
        label: "Can menu items be modified for allergy requests?",
        required: true,
        publicFacet: true,
        publicLabel: "Menu changes",
        explainer:
          "Whether dishes can be prepared differently — leaving out or swapping an ingredient — to avoid an allergen.",
        options: [
          { value: "most_items", label: "Most items" },
          { value: "some_items", label: "Some items" },
          { value: "rarely", label: "Rarely" },
          { value: "no", label: "No" },
        ],
      },
    ],
  },
  {
    id: "cross_contact",
    title: "Cross-contact practices",
    intro:
      "Cross-contact is when a trace of an allergen moves from one food to another — on a shared fryer, board, or utensil. This section matters more to families than almost anything else on your listing.",
    questions: [
      {
        id: "cross_contact_steps",
        type: "multi",
        label: "When preparing an allergy order, which practices may be used?",
        help: "Choose everything that may apply. It is genuinely useful to families to know if the answer is none.",
        publicFacet: true,
        publicLabel: "How they reduce cross-contact",
        explainer:
          "Steps the kitchen says it may take on an allergy order to keep an allergen out of the dish.",
        options: CROSS_CONTACT_OPTIONS,
      },
      {
        /**
         * "Dedicated fryer" is the single most over-read phrase in allergy
         * dining — it usually means "not shared with fish", not "free of all
         * allergens". Asking the follow-up is what keeps the published answer
         * honest, so this is never displayed without it.
         */
        id: "dedicated_fryer_detail",
        type: "single",
        label:
          "Do you have a fryer that is not shared with foods containing certain allergens?",
        showWhen: { question: "cross_contact_steps", value: "dedicated_fryer" },
        publicFacet: true,
        publicLabel: "Dedicated fryer",
        explainer:
          "A fryer kept separate from certain allergens. It does not mean the oil is free of every allergen — check which ones below.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "no_fryer", label: "We don't use a fryer" },
          { value: "depends", label: "Depends on the allergen" },
        ],
      },
      {
        id: "dedicated_fryer_allergens",
        type: "multi",
        label: "Which allergens does that apply to?",
        help: "Optional, but it is the detail families ask about most.",
        showWhen: { question: "dedicated_fryer_detail", value: ["yes", "depends"] },
        publicFacet: true,
        publicLabel: "Fryer kept separate from",
        explainer:
          "The allergens the restaurant says its separate fryer is kept away from.",
        options: ALLERGEN_OPTIONS,
      },
      {
        id: "cross_contact_notes",
        type: "textarea",
        label: "Tell families anything else about how you reduce cross-contact risk.",
        help: "A sentence or two is plenty.",
        maxLength: 2000,
        publicFacet: true,
        publicLabel: "In their own words",
      },
    ],
  },
  {
    id: "allergens",
    title: "Allergens and your allergen menu",
    questions: [
      {
        id: "allergens_discussed",
        type: "multi",
        label:
          "Which food allergies does your restaurant regularly receive requests for and feel prepared to discuss with guests?",
        help: "Selecting an allergen does not mean the restaurant guarantees an allergen-free meal.",
        publicFacet: true,
        publicLabel: "Food allergies they regularly receive requests for",
        explainer:
          "Allergies this restaurant sees often and is ready to talk through. It is not a claim that a meal can be made free of them — always discuss your own needs with staff.",
        options: ALLERGEN_OPTIONS,
      },
      {
        id: "allergens_other",
        type: "text",
        label: "If other, please describe",
        maxLength: 200,
        showWhen: { question: "allergens_discussed", value: "other" },
        publicFacet: true,
        publicLabel: "Other allergies",
      },
      {
        /**
         * Published deliberately. A restaurant being straight about what it
         * cannot do is more useful to a family than a listing that only lists
         * strengths — and the profile presents it as information, not as a
         * mark against them.
         */
        id: "allergen_limitations",
        type: "textarea",
        label: "Are there allergy requests your restaurant generally cannot accommodate?",
        help: "For example: “Because sesame is used throughout our kitchen, we may not be able to accommodate severe sesame allergies.” Being honest here helps families and never counts against you.",
        maxLength: 2000,
        publicFacet: true,
        publicLabel: "Important limitations",
        explainer:
          "Requests the restaurant has told us it generally cannot take on. Shared so families can rule a visit in or out before travelling.",
      },
      {
        id: "allergy_menu",
        type: "single",
        label: "Do you have an allergen menu or ingredient chart guests can see?",
        help: "A menu or chart showing which dishes contain which allergens.",
        publicFacet: true,
        publicLabel: "Allergen menu",
        explainer:
          "A menu or chart showing which dishes contain which allergens, so you can see what's suitable before you order.",
        options: [
          { value: "yes_online", label: "Yes — published online" },
          { value: "yes_in_house", label: "Yes — available in the restaurant" },
          { value: "on_request", label: "We can provide information on request" },
          { value: "no", label: "Not currently" },
        ],
      },
      {
        id: "allergy_menu_url",
        type: "text",
        label: "Link to your allergen menu",
        help: "Families can open it straight from your listing.",
        maxLength: 500,
        showWhen: { question: "allergy_menu", value: "yes_online" },
        publicFacet: true,
        publicLabel: "Allergen menu link",
      },
      {
        id: "family_notes",
        type: "textarea",
        label: "Anything else families with food allergies should know before visiting?",
        help: "Shown on your public profile in your own words.",
        maxLength: 4000,
        publicFacet: true,
        publicLabel: "What the restaurant wants families to know",
      },
    ],
  },
  {
    id: "listing",
    title: "Directory listing",
    intro:
      "Two different things: the restaurant and practice information above, which is what we would publish, and your contact details, which we never publish.",
    questions: [
      {
        id: "publish_consent",
        type: "single",
        label:
          "Do you give Allergy Voices permission to publish the restaurant information and allergy practices you provided in the public restaurant directory?",
        help: "Your contact name and email are never published either way.",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "yes_contact_first", label: "Yes, but contact me before publishing" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "wants_website_badge",
        type: "yesno",
        label:
          'Would you like a "Survey Participant" badge to display on your own website?',
        help: "It links back to your listing and says you shared information with us — nothing more.",
        options: YES_NO,
      },
      {
        id: "additional_comments",
        type: "textarea",
        label: "Additional comments",
        help: "Anything else you'd like us to know. Not published.",
        maxLength: 4000,
      },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = SURVEY_SECTIONS.flatMap((s) => s.questions);

const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return QUESTION_BY_ID.get(id);
}

/** Human-readable label for a stored answer value. Unknown values pass through. */
export function optionLabel(questionId: string, value: string): string {
  return (
    getQuestion(questionId)?.options?.find((o) => o.value === value)?.label ?? value
  );
}

export function optionLabels(questionId: string, values: string[]): string[] {
  return values.map((v) => optionLabel(questionId, v));
}

export function cuisineLabel(value: string): string {
  return CUISINE_OPTIONS.find((c) => c.value === value)?.label ?? value;
}

export function allergenLabel(value: string): string {
  return ALLERGEN_OPTIONS.find((a) => a.value === value)?.label ?? value;
}

/**
 * Whether a conditional question should currently render.
 *
 * Shared by the form (what to show), the submit path (what to keep), and the
 * tests. Keeping one implementation is what stops a question being submitted
 * that the restaurant never actually saw.
 */
export function isQuestionVisible(
  question: Question,
  answers: Record<string, string | string[]>,
): boolean {
  if (!question.showWhen) return true;
  const target = answers[question.showWhen.question];
  if (target == null) return false;
  const wanted = Array.isArray(question.showWhen.value)
    ? question.showWhen.value
    : [question.showWhen.value];
  return Array.isArray(target)
    ? target.some((v) => wanted.includes(v))
    : wanted.includes(target);
}
