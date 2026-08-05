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
 * certifications — in copy, in option labels, or in identifiers.
 */

export const SURVEY_SCHEMA_VERSION = 1;

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
  /** Renders only when the named question currently includes `showWhenValue`. */
  showWhen?: { question: string; value: string };
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

export const KITCHEN_PRACTICE_OPTIONS: QuestionOption[] = [
  { value: "dedicated_fryer", label: "Dedicated fryer" },
  { value: "separate_prep_area", label: "Separate prep area" },
  { value: "dedicated_equipment", label: "Dedicated utensils/equipment" },
  { value: "dedicated_procedures", label: "Dedicated allergy procedures" },
  { value: "color_coded_utensils", label: "Color-coded utensils" },
  { value: "none", label: "None of the above" },
];

export const SURVEY_SECTIONS: SurveySection[] = [
  {
    id: "procedures",
    title: "Allergy procedures",
    intro:
      "Tell us how your restaurant handles allergy requests today. There are no wrong answers — families find it just as useful to know what you don't offer as what you do.",
    questions: [
      {
        id: "allergy_process",
        type: "single",
        label: "Does your restaurant have a process for handling food allergy requests?",
        required: true,
        publicFacet: true,
        publicLabel: "Has a process for allergy requests",
        explainer:
          "Whether the restaurant has a set way of handling allergy requests, rather than working it out case by case.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "partially", label: "Partially" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "server_training",
        type: "single",
        label: "Are servers trained to handle food allergy requests?",
        required: true,
        publicFacet: true,
        publicLabel: "Servers trained on allergies",
        explainer:
          "Whether the people taking your order have been trained to handle an allergy request and pass it to the kitchen correctly.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "some_staff", label: "Some staff" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "manager_chef_access",
        type: "single",
        label: "Can guests speak directly with a manager or chef about food allergies?",
        required: true,
        publicFacet: true,
        publicLabel: "Can speak to a manager or chef",
        explainer:
          "Whether you can talk directly to someone responsible for preparing the food, not only to your server.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "manager_only", label: "Manager only" },
          { value: "chef_when_available", label: "Chef when available" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "ingredient_info",
        type: "single",
        label: "Can guests review ingredient information or discuss ingredients upon request?",
        required: true,
        publicFacet: true,
        publicLabel: "Shares ingredient information",
        explainer:
          "Whether staff can tell you what is in a dish, or show you ingredient information, when you ask.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "limited", label: "Limited information" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "menu_modification",
        type: "single",
        label: "Can menu items be modified for allergy concerns?",
        required: true,
        publicFacet: true,
        publicLabel: "Can change dishes for allergies",
        explainer:
          "Whether dishes can be prepared differently \u2014 leaving out or swapping an ingredient \u2014 to avoid an allergen.",
        options: [
          { value: "most_items", label: "Most items" },
          { value: "some_items", label: "Some items" },
          { value: "rarely", label: "Rarely" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "kitchen_practices",
        type: "multi",
        label: "Which of the following does your restaurant have?",
        publicFacet: true,
        publicLabel: "Separate equipment and areas",
        explainer:
          "Equipment or areas the kitchen keeps separate to reduce the chance of an allergen ending up in the wrong dish.",
        options: KITCHEN_PRACTICE_OPTIONS,
      },
      {
        id: "cross_contact_practices",
        type: "textarea",
        label: "How does your restaurant reduce cross-contact risk?",
        help: "A sentence or two is plenty. Families read this closely.",
        maxLength: 2000,
        publicFacet: true,
        publicLabel: "How they reduce cross-contact",
        explainer:
          "Cross-contact is when a trace of an allergen moves from one food to another \u2014 on a shared fryer, board, or utensil.",
      },
      {
        id: "request_frequency",
        type: "single",
        label: "Approximately how many allergy-related requests does your restaurant receive?",
        help: "This helps us understand demand across the program. It is not shown on your public profile.",
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "rarely", label: "Rarely" },
          { value: "unsure", label: "Unsure" },
        ],
      },
      {
        id: "who_to_ask",
        type: "single",
        label: "Who should guests ask to speak with regarding food allergies?",
        publicFacet: true,
        publicLabel: "Ask to speak with",
        explainer:
          "Who the restaurant would rather you raise an allergy with when you arrive.",
        options: [
          { value: "server", label: "Server" },
          { value: "manager", label: "Manager" },
          { value: "chef", label: "Chef" },
          { value: "any_trained_employee", label: "Any trained employee" },
        ],
      },
      {
        id: "procedures_reviewed",
        type: "single",
        label: "Are your allergy procedures reviewed or updated regularly?",
        publicFacet: true,
        publicLabel: "Reviews its allergy procedures",
        explainer:
          "Whether the restaurant revisits how it handles allergies, rather than setting it up once and leaving it.",
        options: [
          { value: "yes", label: "Yes" },
          { value: "occasionally", label: "Occasionally" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "family_notes",
        type: "textarea",
        label: "Anything families with food allergies should know before visiting?",
        help: "Shown on your public profile in your own words.",
        maxLength: 4000,
        publicFacet: true,
        publicLabel: "From the restaurant",
      },
    ],
  },
  {
    id: "allergens",
    title: "Allergens",
    questions: [
      {
        id: "allergens_accommodated",
        type: "multi",
        label: "Which allergens can your restaurant typically accommodate?",
        publicFacet: true,
        publicLabel: "Allergens typically accommodated",
        explainer:
          "Allergens the restaurant says it can usually work around. Always confirm your own needs with staff before ordering.",
        options: ALLERGEN_OPTIONS,
      },
      {
        id: "allergens_other",
        type: "text",
        label: "If other, please describe",
        maxLength: 200,
        showWhen: { question: "allergens_accommodated", value: "other" },
        publicFacet: true,
        publicLabel: "Other allergens",
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
          { value: "yes_online", label: "Yes — it's published online" },
          { value: "yes_in_house", label: "Yes — available in the restaurant" },
          { value: "on_request", label: "We can put one together on request" },
          { value: "no", label: "Not yet" },
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
        id: "allergens_asked_about",
        type: "textarea",
        label: "Which allergens are guests most likely to ask about?",
        help: "Helps us build better resources. Not shown on your public profile.",
        maxLength: 2000,
      },
    ],
  },
  {
    id: "improvement",
    title: "Continuous improvement",
    intro:
      "Optional, and never published. This section only tells us how we can support you.",
    questions: [
      {
        id: "improvement_interest",
        type: "single",
        label: "Would your restaurant be interested in improving allergy accommodations?",
        options: [
          { value: "yes", label: "Yes" },
          { value: "maybe", label: "Maybe" },
          { value: "already_doing_so", label: "Already doing so" },
          { value: "not_at_this_time", label: "Not at this time" },
        ],
      },
      {
        id: "wants_best_practices_guide",
        type: "yesno",
        label: "Would you like a free Allergy Voices Best Practices Guide?",
        options: YES_NO,
      },
      {
        /**
         * The only mention of the paid menu service anywhere a restaurant is
         * asked something. Deliberately never a public facet: it must not
         * appear on a listing, and answering either way has no bearing on
         * whether or how the restaurant is published.
         */
        id: "wants_menu_help",
        type: "yesno",
        label:
          "Would you like help building an allergen menu for your restaurant?",
        help: "We build these for a small fee that covers our time. It makes no difference to your listing either way — say no and nothing changes.",
        options: YES_NO,
      },
      {
        id: "wants_updates",
        type: "yesno",
        label: "Would you like to receive updates about allergy awareness resources?",
        options: YES_NO,
      },
    ],
  },
  {
    id: "listing",
    title: "Directory listing",
    questions: [
      {
        id: "publish_consent",
        type: "single",
        label:
          "Do you give Allergy Voices permission to publish your responses in our public restaurant directory?",
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
        label: 'Would you like to display an "Allergy Voices Participant" badge on your website?',
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
