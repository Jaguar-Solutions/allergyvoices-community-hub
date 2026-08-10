import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageHeader, PageLayout, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { QuestionField } from "@/components/restaurants/QuestionField";
import { ProgramDisclaimer } from "@/components/restaurants/ProgramDisclaimer";
import { submitRestaurant } from "@/program/api";
import { normalizeWebsite } from "@/program/url";
import { formatPhone, isCompletePhone } from "@/program/phone";
import { enqueue } from "@/program/offline-queue";
import { OfflineBanner } from "@/components/restaurants/OfflineBanner";
import {
  CUISINE_OPTIONS,
  SURVEY_SECTIONS,
  isQuestionVisible,
} from "@/program/survey";
import { US_STATES } from "@/program/us-states";
import type { Answers, AnswerValue } from "@/program/types";

/**
 * Bumped with the survey schema. A draft saved against the old question set
 * would otherwise be restored into a form that no longer has those questions,
 * quietly resubmitting answers to things we stopped asking.
 */
const DRAFT_KEY = "av-restaurant-survey-draft-v2";

/** Shared with the confirmation page. See the write site in `handleSubmit`. */
export const SUBMITTED_ID_KEY = "av-restaurant-submitted-id";

interface RestaurantFields {
  name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  website: string;
  phone: string;
  cuisine: string[];
}

interface ContactFields {
  manager_name: string;
  manager_email: string;
  position: string;
}

interface DraftState {
  restaurant: RestaurantFields;
  contact: ContactFields;
  answers: Answers;
  /** Which step the restaurant was on. Restored with the answers. */
  step?: number;
}

/** Step 0 is restaurant identity; the rest are the survey's own sections. */
const TOTAL_STEPS = 1 + SURVEY_SECTIONS.length;

/**
 * Identity fields validated on step 0.
 *
 * Kept beside the survey questions rather than inside `validate()` so a step
 * can be checked on its own — the whole point of a wizard is not being told
 * about a mistake four screens away.
 */
/** Shown beside the progress bar. */
const STEP_TITLES = [
  "Restaurant information",
  ...SURVEY_SECTIONS.map((section) => section.title),
];

const STEP_ZERO_FIELDS = [
  "name",
  "address_line1",
  "city",
  "state",
  "postal_code",
  "phone",
  "cuisine",
  "manager_name",
  "manager_email",
] as const;

const EMPTY_DRAFT: DraftState = {
  restaurant: {
    name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    website: "",
    phone: "",
    cuisine: [],
  },
  contact: { manager_name: "", manager_email: "", position: "" },
  answers: {},
};

function loadDraft(): { draft: DraftState; restored: boolean } {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return { draft: EMPTY_DRAFT, restored: false };
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    return {
      draft: {
        restaurant: { ...EMPTY_DRAFT.restaurant, ...parsed.restaurant },
        contact: { ...EMPTY_DRAFT.contact, ...parsed.contact },
        answers: parsed.answers ?? {},
        // Carried through explicitly: this function rebuilds the draft field
        // by field, so anything not named here is silently dropped — which is
        // how the restored step came back as "start again from the top".
        step: parsed.step,
      },
      restored: true,
    };
  } catch {
    return { draft: EMPTY_DRAFT, restored: false };
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Move focus to a field named in the error summary. Choice questions have no
 * element with the question's own id, so fall back to the first option.
 */
function focusField(field: string) {
  const target =
    document.getElementById(field) ??
    document.querySelector<HTMLElement>(`[id^="${CSS.escape(field)}-"]`) ??
    document.getElementById(`cuisine-${field}`);

  if (!target) return;
  target.scrollIntoView({ block: "center", behavior: "smooth" });
  target.focus({ preventScroll: true });
}

const Survey = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchParams] = useSearchParams();

  // A restaurant arriving from "Update this listing" on its own profile gets
  // the identity fields filled in. Matching those three fields is also how
  // the server recognizes an update rather than a new listing, so a saved
  // draft must not silently override them.
  const initial = useMemo(() => {
    const loaded = loadDraft();
    const prefill = {
      name: searchParams.get("name") ?? "",
      city: searchParams.get("city") ?? "",
      state: searchParams.get("state") ?? "",
    };
    if (!prefill.name) return loaded;
    return {
      draft: { ...loaded.draft, restaurant: { ...loaded.draft.restaurant, ...prefill } },
      restored: loaded.restored,
    };
    // Read once on mount; later edits to the URL shouldn't stomp typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [draft, setDraft] = useState<DraftState>(initial.draft);
  const [step, setStep] = useState<number>(
    Math.min(Math.max(initial.draft.step ?? 0, 0), TOTAL_STEPS - 1),
  );
  const stepHeadingRef = useRef<HTMLSpanElement>(null);
  const [draftRestored, setDraftRestored] = useState(initial.restored);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const mountedAt = useRef(Date.now());
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Pull in the pages this form leads to while we (probably) still have a
  // connection. Routes are code-split, so without this a surveyor who loses
  // signal mid-survey would hit an unloadable chunk on submit — with their
  // answers already saved but nowhere to land.
  useEffect(() => {
    void import("./Submitted");
    void import("./FieldMode");
  }, []);

  // Autosave. Debounced so we're not writing on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, step }));
        setSavedAt(new Date());
      } catch {
        // A full or disabled localStorage shouldn't break the form.
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [draft, step]);

  const setRestaurant = (fields: Partial<RestaurantFields>) =>
    setDraft((d) => ({ ...d, restaurant: { ...d.restaurant, ...fields } }));

  const setContact = (fields: Partial<ContactFields>) =>
    setDraft((d) => ({ ...d, contact: { ...d.contact, ...fields } }));

  const setAnswer = (id: string, value: AnswerValue) =>
    setDraft((d) => ({ ...d, answers: { ...d.answers, [id]: value } }));

  const toggleCuisine = (value: string, checked: boolean) =>
    setRestaurant({
      cuisine: checked
        ? [...draft.restaurant.cuisine, value]
        : draft.restaurant.cuisine.filter((c) => c !== value),
    });

  const startOver = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraft(EMPTY_DRAFT);
    setDraftRestored(false);
    setErrors({});
  };

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    const { restaurant, contact, answers } = draft;

    if (!restaurant.name.trim()) next.name = "Please enter the restaurant name.";
    if (!restaurant.address_line1.trim()) next.address_line1 = "Please enter the street address.";
    if (!restaurant.city.trim()) next.city = "Please enter the city.";
    if (!restaurant.state) next.state = "Please select the state.";
    if (!/^\d{5}(-\d{4})?$/.test(restaurant.postal_code.trim())) {
      next.postal_code = "Please enter a 5-digit ZIP code.";
    }
    if (!restaurant.phone.trim()) {
      next.phone = "Please enter a phone number.";
    } else if (!isCompletePhone(restaurant.phone)) {
      next.phone = "Please enter a 10-digit phone number.";
    }
    if (restaurant.cuisine.length === 0) {
      next.cuisine = "Please choose at least one cuisine so families can find you.";
    }
    if (!contact.manager_name.trim()) next.manager_name = "Please enter a contact name.";
    if (!EMAIL_RE.test(contact.manager_email.trim())) {
      next.manager_email = "Please enter a valid email address.";
    }

    for (const section of SURVEY_SECTIONS) {
      for (const question of section.questions) {
        if (!question.required || !isQuestionVisible(question, answers)) continue;
        const value = answers[question.id];
        const empty =
          value == null ||
          (typeof value === "string" && !value.trim()) ||
          (Array.isArray(value) && value.length === 0);
        if (empty) next[question.id] = "Please choose an answer.";
      }
    }

    return next;
  }

  /** The field names a given step is responsible for. */
  function fieldsForStep(index: number): string[] {
    if (index === 0) return [...STEP_ZERO_FIELDS];
    return (SURVEY_SECTIONS[index - 1]?.questions ?? []).map((q) => q.id);
  }

  /**
   * Errors belonging to one step.
   *
   * Reuses the whole-form validator rather than duplicating its rules, so a
   * step check and the final submit check can never disagree — which is the
   * failure mode that makes a wizard let someone through and then reject them
   * at the end.
   */
  function validateStep(index: number): Record<string, string> {
    const all = validate();
    const mine = new Set(fieldsForStep(index));
    return Object.fromEntries(Object.entries(all).filter(([k]) => mine.has(k)));
  }

  const goToStep = (next: number) => {
    setStep(next);
    setErrors({});
    // Focus the new step's heading so a keyboard or screen-reader user is told
    // where they landed instead of being left at the bottom of the page.
    requestAnimationFrame(() => {
      stepHeadingRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleContinue = () => {
    const found = validateStep(step);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => {
        errorSummaryRef.current?.focus();
        focusField(Object.keys(found)[0]);
      });
      return;
    }
    goToStep(Math.min(step + 1, TOTAL_STEPS - 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Enter in a text field submits the form. On any step but the last that
    // should advance, not send a half-finished survey.
    if (step < TOTAL_STEPS - 1) {
      handleContinue();
      return;
    }

    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // A wizard can hide the offending field on another step, so jump to the
      // first step that has a problem before pointing at it. Being told
      // something is wrong with no way to see it is worse than a long form.
      const firstBadStep = Array.from({ length: TOTAL_STEPS }, (_, i) => i).find((i) =>
        fieldsForStep(i).some((f) => f in found),
      );
      if (firstBadStep !== undefined && firstBadStep !== step) setStep(firstBadStep);

      requestAnimationFrame(() => {
        errorSummaryRef.current?.focus();
        focusField(Object.keys(found)[0]);
      });
      return;
    }

    setSubmitting(true);

    // Drop answers to questions that aren't currently shown. Someone who
    // ticked "Other", typed a note, then unticked it would otherwise have
    // that orphaned text published on their profile.
    const visibleAnswers: Answers = {};
    for (const question of SURVEY_SECTIONS.flatMap((s) => s.questions)) {
      if (!isQuestionVisible(question, draft.answers)) continue;
      const value = draft.answers[question.id];
      if (value !== undefined) visibleAnswers[question.id] = value;
    }

    const payload = {
      restaurant: {
        ...draft.restaurant,
        state: draft.restaurant.state.toUpperCase(),
        website: normalizeWebsite(draft.restaurant.website) ?? "",
      },
      contact: draft.contact,
      answers: visibleAnswers,
      honeypot,
      elapsedMs: Date.now() - mountedAt.current,
    };

    const result = await submitRestaurant(payload);

    // Couldn't reach the server — keep the submission on the device rather
    // than asking someone standing in a restaurant to fill it in again.
    if (!result.ok && result.offline) {
      try {
        await enqueue(payload);
        localStorage.removeItem(DRAFT_KEY);
        setSubmitting(false);
        navigate("/restaurants/submitted?saved=offline");
        return;
      } catch {
        setSubmitting(false);
        toast({
          title: "We couldn't save your submission",
          description:
            "This device has no offline storage available, so nothing was saved. Please try again once you have a connection.",
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(false);

    if (!result.ok) {
      toast({
        title: "We couldn't save your submission",
        description: result.error ?? "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    localStorage.removeItem(DRAFT_KEY);

    // Hand the new listing's id to the confirmation page so it can offer the
    // follow-up resources against a real restaurant. sessionStorage, not the
    // URL: an id in the query string ends up in analytics and referrers, and
    // it would survive a shared link into someone else's submission.
    if (result.restaurantId) {
      try {
        sessionStorage.setItem(SUBMITTED_ID_KEY, result.restaurantId);
      } catch {
        // Private browsing with storage disabled — the opt-in simply won't
        // be offered, which is a fine thing to lose.
      }
    }

    // The confirmation page promises a public listing, which would be wrong
    // to say to a restaurant that just declined publication.
    const consent = draft.answers.publish_consent;
    navigate(
      consent === "no"
        ? "/restaurants/submitted?consent=no"
        : "/restaurants/submitted",
    );
  };

  const errorList = Object.entries(errors);

  return (
    <PageLayout>
      <SEOHead
        title="Restaurant participation survey"
        description="Share how your restaurant handles food allergy requests. Free to participate, and nothing is published without your permission."
      />
      <PageHeader
        eyebrow="For restaurants"
        title="Tell us how you handle food allergies"
        intro="Every question is about what you already do. There are no wrong answers, and families find it just as useful to know what you don't offer as what you do."
        breadcrumbs={[
          { label: "Restaurants", href: "/restaurants" },
          { label: "Participate" },
        ]}
      />

      <Section>
        <Container width="narrow">
          <OfflineBanner className="mb-8" />

          {draftRestored && (
            <div
              role="status"
              className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background-subtle p-4"
            >
              <p className="font-inter text-sm text-foreground">
                We restored your saved answers from this device.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={startOver}>
                Start over
              </Button>
            </div>
          )}

          {errorList.length > 0 && (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              role="alert"
              className="mb-8 rounded-xl border border-destructive/40 bg-destructive/5 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h2 className="font-poppins font-semibold text-foreground">
                Please check {errorList.length}{" "}
                {errorList.length === 1 ? "answer" : "answers"}
              </h2>
              {/* Each problem links to its field. In a form this long,
                  a flat list of messages leaves people hunting. */}
              <ul className="mt-2 list-disc space-y-1 pl-5 font-inter text-sm">
                {errorList.map(([field, message]) => (
                  <li key={field}>
                    <button
                      type="button"
                      className="text-left text-muted-foreground underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => focusField(field)}
                    >
                      {message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mb-8 font-inter text-sm text-muted-foreground">
            Questions marked with{" "}
            <span className="font-medium text-destructive">*</span> are
            required. Everything else is optional — skip anything that doesn't
            apply to you.
          </p>

          {/* Progress. A bare "Step 2 of 5" tells someone how far they are but
              not how much is left in feel; the bar does that at a glance, and
              the list names what is coming so the end is visible from the
              start. */}
          <nav aria-label="Survey progress" className="mb-8">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-inter text-sm font-medium text-primary">
                Step {step + 1} of {TOTAL_STEPS}
              </p>
              <p className="font-inter text-sm text-muted-foreground">
                {STEP_TITLES[step]}
              </p>
            </div>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={TOTAL_STEPS}
              aria-label={`Step ${step + 1} of ${TOTAL_STEPS}: ${STEP_TITLES[step]}`}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </nav>

          <form onSubmit={handleSubmit} noValidate className="space-y-12">
            {/* Honeypot: hidden from humans, irresistible to bots. */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="company_website">Leave this field empty</label>
              <input
                id="company_website"
                name="company_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <fieldset className={step === 0 ? "space-y-6" : "hidden"} aria-hidden={step !== 0}>
              <SectionHeading
                headingRef={stepHeadingRef}
                step={1}
                title="Restaurant information"
              />

              <TextField
                id="name"
                label="Restaurant name"
                required
                value={draft.restaurant.name}
                onChange={(v) => setRestaurant({ name: v })}
                error={errors.name}
                autoComplete="organization"
              />
              <TextField
                id="address_line1"
                label="Street address"
                required
                value={draft.restaurant.address_line1}
                onChange={(v) => setRestaurant({ address_line1: v })}
                error={errors.address_line1}
                autoComplete="address-line1"
              />
              <TextField
                id="address_line2"
                label="Suite, unit, or floor (optional)"
                value={draft.restaurant.address_line2}
                onChange={(v) => setRestaurant({ address_line2: v })}
                autoComplete="address-line2"
              />

              <div className="grid gap-6 sm:grid-cols-3">
                <TextField
                  id="city"
                  label="City"
                  required
                  value={draft.restaurant.city}
                  onChange={(v) => setRestaurant({ city: v })}
                  error={errors.city}
                  autoComplete="address-level2"
                />
                <div className="space-y-2">
                  <Label htmlFor="state" className="font-inter font-medium">
                    State
                    <span className="ml-1 text-destructive" aria-hidden="true">*</span>
                    <span className="sr-only"> (required)</span>
                  </Label>
                  <Select
                    value={draft.restaurant.state}
                    onValueChange={(v) => setRestaurant({ state: v })}
                  >
                    <SelectTrigger
                      id="state"
                      aria-describedby={errors.state ? "state-error" : undefined}
                      aria-invalid={errors.state ? true : undefined}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p id="state-error" role="alert" className="font-inter text-sm font-medium text-destructive">
                      {errors.state}
                    </p>
                  )}
                </div>
                <TextField
                  id="postal_code"
                  label="ZIP"
                  required
                  value={draft.restaurant.postal_code}
                  onChange={(v) => setRestaurant({ postal_code: v })}
                  error={errors.postal_code}
                  autoComplete="postal-code"
                  inputMode="numeric"
                />
              </div>

              <p className="font-inter text-sm text-muted-foreground">
                This is the number guests call — not the private contact number
                below.
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  id="phone"
                  label="Public phone number"
                  required
                  type="tel"
                  placeholder="(919)555-0100"
                  value={draft.restaurant.phone}
                  // Formatted as it is typed, so the number stored and shown
                  // on a listing looks the same for every restaurant.
                  onChange={(v) => setRestaurant({ phone: formatPhone(v) })}
                  error={errors.phone}
                  autoComplete="tel"
                  inputMode="tel"
                />
                <TextField
                  id="website"
                  label="Website (optional)"
                  type="url"
                  placeholder="https://"
                  value={draft.restaurant.website}
                  onChange={(v) => setRestaurant({ website: v })}
                  autoComplete="url"
                />
              </div>

              <fieldset className="space-y-3">
                <legend className="font-inter font-medium text-foreground">
                  Cuisine
                  <span className="ml-1 text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only"> (required)</span>
                </legend>
                <p className="font-inter text-sm text-muted-foreground">
                  Pick everything that fits. Families filter the directory by cuisine.
                </p>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {CUISINE_OPTIONS.map((option) => {
                    const id = `cuisine-${option.value}`;
                    return (
                      <div key={option.value} className="flex items-center gap-3">
                        <Checkbox
                          id={id}
                          checked={draft.restaurant.cuisine.includes(option.value)}
                          onCheckedChange={(checked) =>
                            toggleCuisine(option.value, checked === true)
                          }
                        />
                        <Label htmlFor={id} className="font-inter font-normal">
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                {errors.cuisine && (
                  <p role="alert" className="font-inter text-sm font-medium text-destructive">
                    {errors.cuisine}
                  </p>
                )}
              </fieldset>
            </fieldset>

            <fieldset className={step === 0 ? "space-y-6" : "hidden"} aria-hidden={step !== 0}>
              <legend className="font-poppins text-lg font-bold text-foreground">
                Who we should talk to
              </legend>
              <p className="font-inter text-sm text-muted-foreground">
                Your contact information is used by AllergyVoices for follow-up
                only and is never displayed publicly.
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  id="manager_name"
                  label="Contact name"
                  required
                  value={draft.contact.manager_name}
                  onChange={(v) => setContact({ manager_name: v })}
                  error={errors.manager_name}
                  autoComplete="name"
                />
                <TextField
                  id="position"
                  label="Position (optional)"
                  value={draft.contact.position}
                  onChange={(v) => setContact({ position: v })}
                  autoComplete="organization-title"
                />
              </div>
              <TextField
                id="manager_email"
                label="Contact email"
                required
                type="email"
                value={draft.contact.manager_email}
                onChange={(v) => setContact({ manager_email: v })}
                error={errors.manager_email}
                autoComplete="email"
              />
            </fieldset>

            {SURVEY_SECTIONS.map((section, index) => (
              <fieldset
                key={section.id}
                // Hidden rather than unmounted: React would otherwise discard
                // the inputs, and the draft is only flushed on a debounce.
                className={step === index + 1 ? "space-y-8" : "hidden"}
                aria-hidden={step !== index + 1}
              >
                <SectionHeading
                  headingRef={step === index + 1 ? stepHeadingRef : undefined}
                  step={index + 2}
                  title={section.title}
                />
                {section.intro && (
                  <p className="font-inter leading-relaxed text-muted-foreground">
                    {section.intro}
                  </p>
                )}
                {section.questions
                  .filter((question) => isQuestionVisible(question, draft.answers))
                  .map((question) => (
                    <QuestionField
                      key={question.id}
                      question={question}
                      value={draft.answers[question.id]}
                      onChange={(value) => setAnswer(question.id, value)}
                      error={errors[question.id]}
                    />
                  ))}
              </fieldset>
            ))}

            <ProgramDisclaimer />

            <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="flex items-center gap-2 font-inter text-sm text-muted-foreground"
                role="status"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {savedAt
                  ? `Answers saved to this device at ${savedAt.toLocaleTimeString()}`
                  : "Your answers save automatically as you type"}
              </p>
              {/* Submit exists only on the final step. A submit button visible
                  on step 2 invites someone to send a half-finished survey and
                  then be told about four screens of problems at once. */}
              <div className="flex flex-wrap items-center gap-3">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => goToStep(step - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    Back
                  </Button>
                )}

                {step < TOTAL_STEPS - 1 ? (
                  <Button type="button" size="lg" onClick={handleContinue}>
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    )}
                    {submitting ? "Submitting…" : "Submit"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Container>
      </Section>
    </PageLayout>
  );
};

/**
 * The heading above the current step.
 *
 * Contact details are part of step 1, not a step of their own — they are two
 * halves of "who you are", and splitting them made a four-section survey
 * announce itself as six.
 */
function SectionHeading({
  step,
  title,
  headingRef,
}: {
  step: number;
  title: string;
  /** Focused on step change so keyboard users are told where they landed. */
  headingRef?: React.Ref<HTMLSpanElement>;
}) {
  return (
    <legend className="space-y-1">
      <span className="block font-inter text-sm font-medium uppercase tracking-wide text-primary">
        Step {step} of {TOTAL_STEPS}
      </span>
      <span
        ref={headingRef}
        tabIndex={-1}
        className="block font-poppins text-xl font-bold text-foreground focus-visible:outline-none"
      >
        {title}
      </span>
    </legend>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "tel" | "email" | "url";
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
}: TextFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-inter font-medium">
        {label}
        {required && (
          <>
            <span className="ml-1 text-destructive" aria-hidden="true">*</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={errorId}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <p id={errorId} role="alert" className="font-inter text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default Survey;
