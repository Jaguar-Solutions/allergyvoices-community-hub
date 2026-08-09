/**
 * The Restaurant Allergy Practices Improvement Report — rules engine.
 *
 * Deterministic and pure: the same answers always produce the same report.
 * No AI, no network, no clock, no randomness. That is not a performance
 * choice — this document gives food-safety guidance to restaurants, and a
 * generated sentence that drifts between runs cannot be reviewed, approved,
 * or defended. Everything here is reviewable text written by people.
 *
 * ## Why contradictions are impossible
 *
 * Rules are grouped by the survey question they read, and each group is a
 * *total switch* over that question's values. A group returns at most one
 * strength and at most one recommendation, so "you already publish an
 * allergen menu" and "consider creating an allergen menu" cannot both fire —
 * they are two branches of one switch, not two independent predicates that
 * happen to disagree. Cross-contact is the single exception and is documented
 * where it is defined.
 *
 * ## Language rules
 *
 * Never safe, allergy-safe, certified, approved, verified, guaranteed, or
 * recommended-by-Allergy-Voices. Never a score, grade, rating, or percentage.
 * Prefer strength, practice, opportunity, consider, strengthen, reduce
 * cross-contact risk. There is a test asserting this over the whole corpus.
 */

/** A single stored answer. Multi-select questions store an array. */
export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

/**
 * How urgently we suggest a restaurant look at something.
 *
 * Deliberately three coarse words and not a number. A numeric score invites
 * ranking restaurants against each other, and a restaurant that scores 72
 * will be read as "72% safe" no matter what caveat sits beside it. Priority
 * orders the page; it never adds up to anything.
 */
export type Priority = "high" | "medium" | "low";

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "PRIORITY OPPORTUNITY",
  medium: "RECOMMENDED NEXT STEP",
  low: "WORTH CONSIDERING",
};

/** Ordering weight. Lower sorts first. */
export const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export interface Resource {
  label: string;
  url: string;
}

export interface Strength {
  /** Stable identifier, stored so an old report stays auditable. */
  id: string;
  /** The question group this came from — used to prove exclusivity in tests. */
  group: string;
  title: string;
  /** Optional second line, e.g. naming the allergens a fryer covers. */
  detail?: string;
}

export interface Recommendation {
  id: string;
  group: string;
  priority: Priority;
  title: string;
  /** One or two sentences reflecting back what the restaurant told us. */
  body: string;
  /** Concrete steps. May be empty when the title says it all. */
  actions: string[];
  resource?: Resource;
}

export interface Report {
  strengths: Strength[];
  recommendations: Recommendation[];
  /** The three most useful actions, drawn from the recommendations above. */
  nextSteps: string[];
  /**
   * Whether to include the allergen-menu assistance section. False when the
   * restaurant already publishes one — offering to build a thing they have
   * would read as a form letter.
   */
  showAllergenMenuOffer: boolean;
  /** Bumped when the rules change, so a stored report can be interpreted. */
  engineVersion: number;
}

/**
 * Allergen display names.
 *
 * Duplicated from `src/program/survey.ts` rather than imported: this file has
 * to resolve inside a Deno edge function, which cannot reach into `src/`.
 * A test asserts the two lists stay identical.
 */
const ALLERGEN_LABELS: Record<string, string> = {
  milk: "Milk",
  egg: "Egg",
  peanut: "Peanut",
  tree_nut: "Tree Nut",
  sesame: "Sesame",
  soy: "Soy",
  wheat: "Wheat",
  fish: "Fish",
  shellfish: "Shellfish",
  other: "Other",
};

function allergenLabel(value: string): string {
  return ALLERGEN_LABELS[value] ?? value;
}

/**
 * Bump when rule text or logic changes. Stored on every generated report so a
 * document emailed months ago can still be explained.
 */
export const ENGINE_VERSION = 1;

const RESOURCES = {
  servsafe: {
    label: "ServSafe Allergens training",
    url: "https://servsafe.com/ServSafe-Allergens",
  },
  fareRestaurants: {
    label: "FARE restaurant resources",
    url: "https://www.foodallergy.org/resources/restaurants",
  },
  fdaFoodCode: {
    label: "FDA Food Code (2022)",
    url: "https://www.fda.gov/food/fda-food-code/food-code-2022",
  },
} as const;

// --- answer accessors -------------------------------------------------------
// Absent is a real state, distinct from any answer. A restaurant that skipped
// a question must never be treated as having answered "no" to it.

function one(answers: Answers, id: string): string | undefined {
  const value: AnswerValue | undefined = answers[id];
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function many(answers: Answers, id: string): string[] {
  const value = answers[id];
  return Array.isArray(value) ? value : [];
}

function text(answers: Answers, id: string): string | undefined {
  const value = one(answers, id);
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

interface GroupResult {
  strengths?: Strength[];
  recommendations?: Recommendation[];
}

// --- 1. Allergy process -----------------------------------------------------

function allergyProcess(answers: Answers): GroupResult {
  const group = "allergy_process";
  switch (one(answers, "allergy_process")) {
    case "yes_documented":
      return {
        strengths: [
          {
            id: "process.documented",
            group,
            title: "Documented food allergy process",
          },
        ],
      };
    case "yes_informal":
      return {
        recommendations: [
          {
            id: "process.document_it",
            group,
            priority: "medium",
            title: "Document your food allergy process",
            body: "You told us your restaurant currently uses an informal process for allergy requests. Consider writing down a simple procedure describing what should happen from the moment a guest reports an allergy through preparation and delivery of the meal.",
            actions: [
              "Record the allergy clearly on the ticket",
              "Notify the manager or chef",
              "Clearly identify the allergy order for kitchen staff",
              "Follow your cross-contact procedures",
              "Verify the order before it leaves the pass",
            ],
            resource: RESOURCES.fareRestaurants,
          },
        ],
      };
    case "no_specific":
      return {
        recommendations: [
          {
            id: "process.create_it",
            group,
            priority: "high",
            title: "Create a food allergy request procedure",
            body: "You told us your restaurant does not currently have a specific process for allergy requests. A short written procedure gives every shift the same starting point, and it is usually the single change that makes the most difference to how an allergy order is handled.",
            actions: [
              "Decide who a guest's allergy is reported to",
              "Write down how that reaches the kitchen",
              "Agree how an allergy order is marked",
              "Decide who checks the plate before it is served",
            ],
            resource: RESOURCES.fareRestaurants,
          },
        ],
      };
    case "unsure":
      return {
        recommendations: [
          {
            id: "process.clarify",
            group,
            priority: "medium",
            title: "Clarify and communicate your allergy request process",
            body: "You told us you were unsure whether your restaurant has a set process for allergy requests. If different managers would describe the steps differently, writing the process down and sharing it makes it consistent across shifts.",
            actions: [
              "Ask each manager to describe the current steps",
              "Agree one version and write it down",
              "Share it with front- and back-of-house",
            ],
          },
        ],
      };
    default:
      return {};
  }
}

// --- 2. Staff training ------------------------------------------------------

function staffTraining(answers: Answers): GroupResult {
  const group = "staff_training";
  const trainingType = one(answers, "training_type");

  // The training *type* is a separate, additive strength: it says something
  // about the depth of what was delivered, not who received it. It only ever
  // adds a strength, so it cannot contradict the coverage branch below.
  const structured: Strength[] =
    trainingType === "servsafe"
      ? [
          {
            id: "training.servsafe",
            group: "training_type",
            title: "Structured allergen training program",
            detail: "Your team uses ServSafe Allergens, a recognised allergen training course.",
          },
        ]
      : [];

  switch (one(answers, "staff_training")) {
    case "servers_and_kitchen":
      return {
        strengths: [
          {
            id: "training.full",
            group,
            title: "Front- and back-of-house allergy training",
          },
          ...structured,
        ],
      };
    case "some_staff":
      return {
        strengths: structured,
        recommendations: [
          {
            id: "training.expand",
            group,
            priority: "medium",
            title: "Expand food allergy training",
            body: "You told us some of your staff have had allergy training. Extending it to everyone who takes or prepares an order means a guest's allergy is handled the same way regardless of who is working.",
            actions: [
              "List which roles have been trained and which have not",
              "Add allergy basics to onboarding for new starters",
              "Refresh training when menus change",
            ],
            resource: RESOURCES.servsafe,
          },
        ],
      };
    case "managers_chefs_only":
      return {
        strengths: structured,
        recommendations: [
          {
            id: "training.extend_to_all",
            group,
            priority: "medium",
            title: "Extend basic allergy awareness to front- and back-of-house staff",
            body: "You told us allergy training currently reaches managers and chefs. They are the right people to hold the detail — and servers and line cooks are usually the first to hear about an allergy, so a shorter awareness session for them closes the gap.",
            actions: [
              "Give servers a short session on taking an allergy order",
              "Give line staff a session on cross-contact",
              "Keep the detailed training with managers and chefs",
            ],
            resource: RESOURCES.servsafe,
          },
        ],
      };
    case "none":
      return {
        strengths: structured,
        recommendations: [
          {
            id: "training.introduce",
            group,
            priority: "high",
            title: "Introduce food allergy training",
            body: "You told us your restaurant does not currently have formal allergy training. A single structured session for the team covers how to take an allergy order, how it reaches the kitchen, and how to reduce cross-contact risk.",
            actions: [
              "Choose a training program suitable for your size",
              "Train managers first, then the wider team",
              "Add it to onboarding so it stays current",
            ],
            resource: RESOURCES.servsafe,
          },
        ],
      };
    case "unsure":
      return {
        strengths: structured,
        recommendations: [
          {
            id: "training.confirm",
            group,
            priority: "medium",
            title: "Confirm what allergy training your team has had",
            body: "You told us you were unsure what allergy training staff have received. Knowing where the team currently stands is the first step to deciding whether anything more is needed.",
            actions: [
              "Check what training records exist",
              "Ask managers what their teams have covered",
            ],
            resource: RESOURCES.servsafe,
          },
        ],
      };
    default:
      return { strengths: structured };
  }
}

// --- 3. Ingredient information ----------------------------------------------

function ingredientInformation(answers: Answers): GroupResult {
  const group = "ingredient_info";
  switch (one(answers, "ingredient_info")) {
    case "documented":
      return {
        strengths: [
          {
            id: "ingredients.documented",
            group,
            title: "Documented ingredient and allergen information",
          },
        ],
      };
    case "staff_can_check":
      return {
        strengths: [
          {
            id: "ingredients.staff_check",
            group,
            title: "Staff can check ingredients and packaging on request",
          },
        ],
        recommendations: [
          {
            id: "ingredients.centralize",
            group,
            priority: "low",
            title: "Consider centralizing your allergen information",
            body: "You told us staff can check ingredients and packaging when a guest asks. Collecting that into one reference makes the answer faster during service and the same no matter who is asked.",
            actions: [
              "Build one sheet or binder covering your regular menu",
              "Note which dishes share equipment or fryers",
              "Review it whenever a supplier or recipe changes",
            ],
          },
        ],
      };
    case "limited":
      return {
        recommendations: [
          {
            id: "ingredients.improve_access",
            group,
            priority: "medium",
            title: "Improve access to ingredient and allergen information",
            body: "You told us staff have limited information available when helping a guest with an allergy. Making ingredient details easier to reach during service helps staff answer confidently instead of estimating.",
            actions: [
              "Keep supplier ingredient statements where staff can reach them",
              "Start with your most-ordered dishes",
              "Flag dishes staff are most often asked about",
            ],
            resource: RESOURCES.fdaFoodCode,
          },
        ],
      };
    case "no":
      return {
        recommendations: [
          {
            id: "ingredients.create_reference",
            group,
            priority: "high",
            title: "Create an ingredient and allergen reference",
            body: "You told us staff cannot currently access ingredient information when helping a guest with an allergy. Without it, staff are left guessing, which is difficult for them and hard for a guest to rely on.",
            actions: [
              "Collect ingredient statements from your suppliers",
              "Record the allergens present in each regular dish",
              "Keep it somewhere reachable during service",
            ],
            resource: RESOURCES.fdaFoodCode,
          },
        ],
      };
    case "unsure":
      return {
        recommendations: [
          {
            id: "ingredients.confirm",
            group,
            priority: "medium",
            title: "Confirm what ingredient information staff can reach",
            body: "You told us you were unsure what ingredient information is available to staff during service. Checking what is actually reachable at the pass is a quick way to find the gaps.",
            actions: [
              "Ask a server how they would answer an allergen question tonight",
              "Note where they had to guess",
            ],
          },
        ],
      };
    default:
      return {};
  }
}

// --- 4. Communication and escalation ----------------------------------------

function communication(answers: Answers): GroupResult {
  const group = "who_to_ask";
  const people = many(answers, "who_to_ask");
  if (people.length === 0) return {};

  const hasEscalation = people.includes("manager") || people.includes("chef");

  if (hasEscalation) {
    return {
      strengths: [
        {
          id: "communication.escalation",
          group,
          title: "Manager or chef available to speak with guests",
        },
      ],
    };
  }

  return {
    recommendations: [
      {
        id: "communication.establish_escalation",
        group,
        priority: "medium",
        title: "Establish a clear allergy escalation contact",
        body: "You told us guests raise allergies with serving staff. Naming someone a server can hand a difficult question to — a manager or whoever is running the kitchen — means nobody has to answer beyond what they know.",
        actions: [
          "Decide who a server escalates an allergy question to",
          "Make sure that person is identified on every shift",
          "Tell servers it is fine to escalate rather than guess",
        ],
      },
    ],
  };
}

// --- 5. Cross-contact -------------------------------------------------------

const CROSS_CONTACT_STRENGTHS: Record<string, string> = {
  wash_hands_gloves: "Staff wash hands and change gloves for allergy orders",
  clean_surfaces: "Preparation surfaces are cleaned and sanitized",
  clean_utensils: "Clean or separate utensils and equipment are used",
  separate_prep_area: "A separate preparation area is used",
  clean_pan: "A clean pan or cooking surface is used",
  order_flagged: "Allergy orders are identified for kitchen staff",
  manager_verifies: "A manager or chef oversees and verifies the order",
};

/**
 * The one group that is not a switch: each practice is independent, so a
 * restaurant can report any combination.
 *
 * Absences therefore need care. Listing every practice a restaurant did not
 * tick would hand almost everyone a wall of instructions and make the report
 * feel like a checklist it failed. Instead we surface at most one
 * proportional suggestion, and only for the two practices that are cheap,
 * universal, and most often missing: flagging the order to the kitchen, and a
 * final check before it is served.
 */
function crossContact(answers: Answers): GroupResult {
  const group = "cross_contact_steps";
  const steps = many(answers, "cross_contact_steps");
  if (steps.length === 0) return {};

  const saysNone = steps.includes("none");
  const practices = steps.filter((s) => s !== "none" && s !== "other" && s !== "dedicated_fryer");

  const strengths: Strength[] = practices
    .filter((s) => s in CROSS_CONTACT_STRENGTHS)
    .map((s) => ({
      id: `cross_contact.${s}`,
      group,
      title: CROSS_CONTACT_STRENGTHS[s],
    }));

  if (saysNone && practices.length === 0) {
    return {
      recommendations: [
        {
          id: "cross_contact.establish",
          group,
          priority: "high",
          title: "Agree a small set of cross-contact steps",
          body: "You told us your restaurant does not currently follow a specific cross-contact procedure. A short, agreed set of steps for allergy orders is usually straightforward to adopt and does not require new equipment.",
          actions: [
            "Wash hands and change gloves before preparing the order",
            "Clean and sanitize the preparation surface",
            "Use clean or separate utensils",
            "Identify the order clearly for the kitchen",
          ],
          resource: RESOURCES.fdaFoodCode,
        },
      ],
    };
  }

  const missingFlagging = !steps.includes("order_flagged");
  const missingVerification = !steps.includes("manager_verifies");

  const recommendations: Recommendation[] = [];

  if (missingFlagging && missingVerification) {
    recommendations.push({
      id: "cross_contact.flag_and_verify",
      group,
      priority: "medium",
      title: "Mark allergy orders and check them before they are served",
      body: "You described steps your kitchen takes when preparing an allergy order. Two additions tend to fit alongside them easily: making the allergy visible on the ticket, and a final look before the plate leaves the pass.",
      actions: [
        "Mark allergy tickets so they stand out in the kitchen",
        "Have one person confirm the plate before it is served",
      ],
    });
  } else if (missingFlagging) {
    recommendations.push({
      id: "cross_contact.flag",
      group,
      priority: "medium",
      title: "Identify allergy orders clearly for kitchen staff",
      body: "You described steps your kitchen takes for allergy orders. Making the allergy visible on the ticket itself means it is not relying on someone remembering to mention it.",
      actions: [
        "Agree how an allergy ticket is marked",
        "Use the same marking on every station",
      ],
    });
  } else if (missingVerification) {
    recommendations.push({
      id: "cross_contact.verify",
      group,
      priority: "low",
      title: "Add a final check before an allergy order is served",
      body: "You described steps your kitchen takes for allergy orders. A quick confirmation by a manager or chef before the plate leaves the pass catches the occasional mix-up.",
      actions: ["Decide who confirms an allergy plate before service"],
    });
  }

  return { strengths, recommendations };
}

// --- 6. Fryer ---------------------------------------------------------------

/**
 * The rule here is transparency, never equipment.
 *
 * Telling a restaurant to buy a dedicated fryer is expensive advice we are in
 * no position to give, and it is not what helps a family: what helps is a
 * clear statement of what the fryer is and is not shared with. So a shared
 * fryer produces a communication recommendation, not a purchase order.
 */
function fryer(answers: Answers): GroupResult {
  const group = "dedicated_fryer_detail";
  const claimed = many(answers, "cross_contact_steps").includes("dedicated_fryer");
  const detail = one(answers, "dedicated_fryer_detail");
  const covered = many(answers, "dedicated_fryer_allergens");

  if (!claimed && !detail) return {};

  switch (detail) {
    case "yes":
      if (covered.length > 0) {
        return {
          strengths: [
            {
              id: "fryer.dedicated_specified",
              group,
              title: "Fryer kept separate from specified allergens",
              detail: `You told us this applies to ${covered.map(allergenLabel).join(", ")}.`,
            },
          ],
        };
      }
      return {
        recommendations: [
          {
            id: "fryer.specify_allergens",
            group,
            priority: "medium",
            title: "Say which allergens your separate fryer covers",
            body: "You told us you have a fryer that is not shared with certain allergens, but not which ones. On its own the phrase \"dedicated fryer\" is often read as covering every allergen, so naming the specific ones prevents a guest assuming more than you intended.",
            actions: [
              "List the allergens the fryer is kept away from",
              "Give staff the same list so answers stay consistent",
            ],
          },
        ],
      };
    case "depends":
      return {
        recommendations: [
          {
            id: "fryer.communicate_depends",
            group,
            priority: "medium",
            title: "Clearly communicate what your fryer is shared with",
            body: "You told us whether the fryer is shared depends on the allergen. That is a useful and honest answer — and it is exactly the kind of detail a guest needs stated plainly rather than discovered at the table.",
            actions: [
              "Write down which allergens the fryer is and is not shared with",
              "Make sure servers can give that answer without checking",
            ],
          },
        ],
      };
    case "no":
      return {
        recommendations: [
          {
            id: "fryer.communicate_shared",
            group,
            priority: "medium",
            title: "Clearly communicate shared-fryer limitations to guests",
            body: "You told us your fryer is shared. Many restaurants share a fryer, and that is not a problem in itself — what matters is that guests hear it before they order rather than assuming otherwise.",
            actions: [
              "Tell guests plainly that fried items share oil",
              "Note it wherever you publish allergen information",
              "Suggest alternatives that are not fried",
            ],
          },
        ],
      };
    case "no_fryer":
      return {};
    default:
      return {};
  }
}

// --- 7. Stated limitations --------------------------------------------------

/**
 * Honesty is a strength and is never penalised.
 *
 * A restaurant that says "sesame is in everything here" has given a family
 * something genuinely useful, and the report must reflect that rather than
 * treating it as a gap to close.
 */
function limitations(answers: Answers): GroupResult {
  const stated = text(answers, "allergen_limitations");
  if (!stated) return {};
  return {
    strengths: [
      {
        id: "limitations.stated",
        group: "allergen_limitations",
        title: "Clearly communicates allergy limitations to guests",
        detail:
          "Being straightforward about what you cannot accommodate helps families decide before they travel, and it is one of the most useful things a listing can carry.",
      },
    ],
  };
}

// --- 8. Allergen menu -------------------------------------------------------

function allergenMenu(answers: Answers): GroupResult {
  const group = "allergy_menu";
  switch (one(answers, "allergy_menu")) {
    case "yes_online":
      return {
        strengths: [
          {
            id: "menu.online",
            group,
            title: "Allergen information published online",
            detail:
              "Families can check before they leave home, which is where most decisions about where to eat are made.",
          },
        ],
      };
    case "yes_in_house":
      return {
        recommendations: [
          {
            id: "menu.publish_online",
            group,
            priority: "medium",
            title: "Consider making your allergen information available online",
            body: "You told us an allergen menu is available in the restaurant. Putting the same information on your website lets a family decide whether to visit before they arrive, rather than after they are seated.",
            actions: [
              "Publish the guide you already use in-house",
              "Link it from your menu page",
              "Update it when the menu changes",
            ],
          },
        ],
      };
    case "on_request":
      return {
        recommendations: [
          {
            id: "menu.publish_guide",
            group,
            priority: "medium",
            title: "Consider publishing an allergen or ingredient guide",
            body: "You told us you can provide allergen information on request. Writing it down once turns a conversation your staff repeat into something a family can read in advance and your team can point to.",
            actions: [
              "Capture the answers you already give most often",
              "Cover your regular menu first",
              "Make it available online and in-house",
            ],
          },
        ],
      };
    case "no":
      return {
        recommendations: [
          {
            id: "menu.create",
            group,
            priority: "high",
            title: "Consider creating an allergen menu or ingredient guide",
            body: "You told us you do not currently have an allergen menu or ingredient chart. This is often the single most useful thing a restaurant can add: it helps families evaluate you before they visit, and gives staff a consistent reference during service.",
            actions: [
              "Start with your most-ordered dishes",
              "Record the nine major allergens each dish contains, along with other allergens relevant to your menu or commonly reported by guests.",
              "Note where equipment or fryers are shared",
              "Review the guide whenever recipes, ingredients, or suppliers change, and display the last-updated date.",
            ],
          },
        ],
      };
    default:
      return {};
  }
}

const GROUPS = [
  allergyProcess,
  staffTraining,
  ingredientInformation,
  communication,
  crossContact,
  fryer,
  limitations,
  allergenMenu,
];

/**
 * Build the report for one set of survey answers.
 *
 * Pure. Given the same answers it returns the same report, which is what
 * makes a stored report reproducible and a regression test meaningful.
 */
export function buildReport(answers: Answers): Report {
  const strengths: Strength[] = [];
  const recommendations: Recommendation[] = [];

  for (const group of GROUPS) {
    const result = group(answers);
    if (result.strengths) strengths.push(...result.strengths);
    if (result.recommendations) recommendations.push(...result.recommendations);
  }

  // Stable sort: priority first, insertion order within a priority. Insertion
  // order follows the survey, so a report reads in the order the restaurant
  // answered rather than in an order that looks arbitrary to them.
  const sorted = recommendations
    .map((rec, index) => ({ rec, index }))
    .sort(
      (a, b) =>
        PRIORITY_RANK[a.rec.priority] - PRIORITY_RANK[b.rec.priority] ||
        a.index - b.index,
    )
    .map(({ rec }) => rec);

  return {
    strengths,
    recommendations: sorted,
    nextSteps: sorted.slice(0, 3).map((rec) => rec.title),
    // Only offer to help build a menu when there isn't one online already.
    showAllergenMenuOffer: one(answers, "allergy_menu") !== "yes_online",
    engineVersion: ENGINE_VERSION,
  };
}
