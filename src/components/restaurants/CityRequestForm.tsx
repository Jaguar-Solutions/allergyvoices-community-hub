import { useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitCityRequest, type CityRequestKind } from "@/program/city-request";
import { US_STATES } from "@/program/us-states";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS: { value: CityRequestKind; label: string; help: string }[] = [
  {
    value: "ambassador",
    label: "Become a local ambassador",
    help: "Help introduce AllergyVoices to restaurants and families where you live.",
  },
  {
    value: "recommend_restaurant",
    label: "Recommend a restaurant",
    help: "Tell us about a place that handles allergies well and we'll invite them.",
  },
  {
    value: "request_city",
    label: "Request your city",
    help: "Tell us where you'd like the directory next. We prioritize by demand.",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The "help bring AllergyVoices to your city" form.
 *
 * Replaces three mailto: links. A mailto silently fails for anyone without a
 * mail client configured — most people on a phone — and left us with no record
 * of who asked or for which city, which is exactly the information needed to
 * decide where to launch next.
 *
 * One submit records the request, emails the team, and adds the person to the
 * mailing list if they asked. The mailing-list box is unticked by default:
 * asking to help is not consent to be emailed a newsletter.
 */
export function CityRequestForm() {
  const { toast } = useToast();
  const mountedAt = useRef(Date.now());
  const errorRef = useRef<HTMLParagraphElement>(null);

  const [kind, setKind] = useState<CityRequestKind>("request_city");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [message, setMessage] = useState("");
  const [wantsUpdates, setWantsUpdates] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = OPTIONS.find((o) => o.value === kind)!;
  const cityRequired = kind === "request_city";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    if (cityRequired && !city.trim()) {
      setError("Please tell us which city.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await submitCityRequest({
      kind,
      name: name.trim(),
      email: email.trim(),
      city: city.trim(),
      state,
      message: message.trim(),
      wantsUpdates,
      honeypot,
      elapsedMs: Date.now() - mountedAt.current,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    setDone(true);
    toast({
      title: "Thanks — we've got it",
      description: "We read every message and will reply by email.",
    });
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-5 md:p-6">
        <p className="flex items-start gap-2.5 font-inter leading-relaxed text-foreground">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-secondary-strong"
            aria-hidden="true"
          />
          <span>
            Thanks — your request is with us. We read every message and reply by
            email, usually within a few days.
          </span>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-background p-5 md:p-6"
    >
      <h3 className="font-poppins font-semibold text-foreground">
        Want to help bring AllergyVoices to your city?
      </h3>
      <p className="mt-1.5 font-inter text-sm leading-relaxed text-muted-foreground">
        Cities launch through local families, ambassadors, community partners
        and restaurant outreach. Tell us how you&apos;d like to help.
      </p>

      {/* Honeypot: hidden from humans, irresistible to bots. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="city-request-company">Leave this field empty</label>
        <input
          id="city-request-company"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <fieldset className="mt-5">
        <legend className="font-inter text-sm font-medium text-foreground">
          How would you like to help?
        </legend>
        <div className="mt-3 space-y-2.5">
          {OPTIONS.map((option) => (
            <div key={option.value} className="flex items-start gap-3">
              <input
                type="radio"
                id={`kind-${option.value}`}
                name="city-request-kind"
                value={option.value}
                checked={kind === option.value}
                onChange={() => setKind(option.value)}
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <Label
                htmlFor={`kind-${option.value}`}
                className="font-inter font-normal leading-snug"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        <p className="mt-2 font-inter text-xs leading-relaxed text-muted-foreground">
          {selected.help}
        </p>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cr-name" className="font-inter font-medium">
            Your name
          </Label>
          <Input
            id="cr-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cr-email" className="font-inter font-medium">
            Email
            <span className="ml-1 text-destructive" aria-hidden="true">*</span>
            <span className="sr-only"> (required)</span>
          </Label>
          <Input
            id="cr-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-invalid={error?.includes("email") ? true : undefined}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div className="space-y-2">
          <Label htmlFor="cr-city" className="font-inter font-medium">
            City
            {cityRequired && (
              <>
                <span className="ml-1 text-destructive" aria-hidden="true">*</span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </Label>
          <Input
            id="cr-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cr-state" className="font-inter font-medium">
            State
          </Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger id="cr-state">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="cr-message" className="font-inter font-medium">
          Anything else? (optional)
        </Label>
        <Textarea
          id="cr-message"
          rows={3}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            kind === "recommend_restaurant"
              ? "Which restaurant, and what do they do well?"
              : "Anything that would help us understand your area."
          }
        />
      </div>

      {/* Unticked by default: offering to help is not consent to a newsletter. */}
      <div className="mt-4 flex items-start gap-3">
        <Checkbox
          id="cr-updates"
          className="mt-0.5"
          checked={wantsUpdates}
          onCheckedChange={(checked) => setWantsUpdates(checked === true)}
        />
        <Label htmlFor="cr-updates" className="font-inter font-normal leading-snug">
          Also add me to the AllergyVoices email list
        </Label>
      </div>

      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-4 font-inter text-sm font-medium text-destructive focus-visible:outline-none"
        >
          {error}
        </p>
      )}

      <Button type="submit" className="mt-5" disabled={submitting}>
        {submitting && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {submitting ? "Sending…" : "Send request"}
      </Button>

      <p className="mt-3 font-inter text-xs leading-relaxed text-muted-foreground">
        We use your email to reply to this request. We never publish it or pass
        it on.
      </p>
    </form>
  );
}
