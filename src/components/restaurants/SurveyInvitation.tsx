import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  ChefHat,
  ClipboardList,
  Clock,
  Copy,
  HeartHandshake,
  MapPin,
  MessagesSquare,
  ShieldOff,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/**
 * The recruitment moment for the transparency program.
 *
 * Deliberately the one dark panel on a light, airy page: on a site this calm,
 * inverting the surface does more to draw the eye than any amount of colour
 * would, and it separates a message aimed at restaurant owners from a page
 * otherwise written for families.
 *
 * It carries two calls to action because the homepage's audience is mostly
 * families, and a family who loves a restaurant is the most likely person to
 * get that restaurant to take part.
 */

const REASSURANCES = [
  { Icon: Sparkles, label: "Completely free" },
  { Icon: ShieldOff, label: "Not a certification" },
  { Icon: Clock, label: "About 10 minutes" },
];

// Labels read as statements, matching the real directory cards. A bare
// "Allergy discussions: Yes" doesn't tell a parent anything.
const PREVIEW_ROWS = [
  { Icon: MessagesSquare, label: "Has an allergy process", value: "Yes" },
  { Icon: ChefHat, label: "Talk to a manager or chef", value: "Yes" },
  { Icon: UtensilsCrossed, label: "Can change dishes", value: "Most items" },
  { Icon: ClipboardList, label: "Shares ingredient info", value: "Yes" },
];

/**
 * The allergen tints are already part of the design system (--allergen-* in
 * index.css). Using the real ones here means the preview looks like the
 * product rather than an illustration of it.
 */
const PREVIEW_ALLERGENS = [
  { label: "Milk", tint: "bg-allergen-milk" },
  { label: "Egg", tint: "bg-allergen-egg" },
  { label: "Peanut", tint: "bg-allergen-peanut" },
  { label: "Tree Nut", tint: "bg-allergen-tree-nuts" },
  { label: "Wheat", tint: "bg-allergen-wheat" },
];

export function SurveyInvitation({ className }: { className?: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window === "undefined"
      ? "https://allergyvoices.com/restaurants"
      : `${window.location.origin}/restaurants`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Send it to a restaurant you'd like to see in the directory.",
      });
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: "Couldn't copy the link",
        description: shareUrl,
        variant: "destructive",
      });
    }
  };

  return (
    <section className={cn("relative", className)} aria-labelledby="survey-invitation-title">
      <Container width="wide">
        <div className="relative overflow-hidden rounded-3xl bg-[hsl(222_32%_11%)] shadow-2xl">
          {/* Atmosphere: the logo palette bled through a dark surface. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-brand-coral/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-brand-cyan/20 blur-3xl"
          />
          {/* A faint grid, so the dark panel reads as a surface rather than a void. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          <div className="relative grid items-center gap-10 px-8 pb-8 pt-8 md:px-12 md:pb-10 md:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-14 lg:pb-10 lg:pt-14">
            {/* ---------------------------------------------- message */}
            <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-coral/40 bg-brand-coral/10 px-3 py-1">
                <HeartHandshake className="h-3.5 w-3.5 text-brand-coral" aria-hidden="true" />
                <span className="font-inter text-xs font-semibold uppercase tracking-wider text-brand-coral">
                  For restaurants
                </span>
              </span>

              <h2
                id="survey-invitation-title"
                className="mt-5 max-w-[15ch] text-balance font-poppins text-3xl font-bold leading-[1.1] text-white md:text-4xl lg:text-[2.6rem]"
              >
                Families are looking for you.
                <span className="mt-1 block bg-gradient-to-r from-brand-sun via-brand-coral to-brand-berry bg-clip-text text-transparent">
                  Tell them how you help.
                </span>
              </h2>

              <p className="mt-5 max-w-lg font-inter text-base leading-relaxed text-white/70 md:text-lg">
                Answer a few questions about how your restaurant handles food
                allergy requests, and we'll publish it in a free public
                directory. No inspection, no grading — just what you already do,
                in your own words.
              </p>

              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                {REASSURANCES.map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-brand-spring" aria-hidden="true" />
                    <span className="font-inter text-sm font-medium text-white/85">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="group bg-brand-coral font-poppins text-base text-accent-foreground shadow-lg shadow-brand-coral/20 hover:bg-brand-coral/90"
                >
                  <Link to="/restaurants/participate">
                    Share your practices
                    <ArrowRight
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="font-poppins text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/restaurants">How the program works</Link>
                </Button>
              </div>

            </div>

            {/* ------------------------------------- what they'd get: a preview */}
            <div className="duration-700 animate-in fade-in slide-in-from-bottom-6 fill-mode-both delay-150">
              <p className="mb-6 font-inter text-xs font-medium uppercase tracking-wider text-white/60">
                Your listing would look like this
              </p>

              <div className="relative">
                {/* Two cards stacked behind, hinting at a directory of many
                    without drawing attention from the one in front. */}
                <div
                  aria-hidden="true"
                  className="absolute -right-4 -top-3 h-full w-full rotate-[4deg] rounded-[1.25rem] border border-white/10 bg-white/[0.04]"
                />
                <div
                  aria-hidden="true"
                  className="absolute -right-2 -top-1.5 h-full w-full rotate-[2deg] rounded-[1.25rem] border border-white/15 bg-white/[0.07]"
                />

                <div className="relative overflow-hidden rounded-[1.25rem] bg-background shadow-[0_24px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                  {/* A ribbon of the logo palette, so the card is unmistakably
                      ours the moment it's seen. */}
                  <div
                    aria-hidden="true"
                    className="h-1.5 bg-gradient-to-r from-brand-cyan via-brand-sun to-brand-coral"
                  />

                  <div className="p-5 md:p-6">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <h3 className="font-poppins text-xl font-bold leading-tight text-foreground">
                          Your Restaurant
                        </h3>
                        <p className="mt-1.5 flex items-center gap-1.5 font-inter text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>Your city, ST · Your cuisine</span>
                        </p>
                      </div>
                      <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-2.5 py-1 font-inter text-xs font-semibold text-secondary-strong">
                        <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
                        Participant
                      </span>
                    </div>

                    {/* A list rather than a definition list: this is an
                        illustration of a listing, not real data about a real
                        restaurant. */}
                    <ul className="mt-5 grid grid-cols-1 gap-x-3 gap-y-4 min-[420px]:grid-cols-2">
                      {PREVIEW_ROWS.map(({ Icon, label, value }) => (
                        <li key={label} className="flex items-start gap-2.5">
                          <span
                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                            aria-hidden="true"
                          >
                            <Icon className="h-4 w-4 text-primary" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-inter text-[0.7rem] uppercase leading-tight tracking-wide text-muted-foreground">
                              {label}
                            </span>
                            <span className="block font-poppins text-sm font-semibold leading-snug text-foreground">
                              {value}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 border-t border-border pt-4">
                      <p className="font-inter text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                        Allergens typically accommodated
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {PREVIEW_ALLERGENS.map((allergen) => (
                          <li
                            key={allergen.label}
                            className={cn(
                              "rounded-full px-2.5 py-1 font-inter text-xs font-medium text-foreground/80",
                              allergen.tint,
                            )}
                          >
                            {allergen.label}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 font-inter text-xs font-medium text-secondary-strong">
                        <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Allergen menu
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-inter text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        Current as of this month
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 font-inter text-xs leading-relaxed text-white/60">
                You decide what's shared, and nothing is published without your
                permission.
              </p>
            </div>
          </div>

          {/* The family path, given its own full-width strip: most visitors to
              this page can't fill the survey in themselves, but they're the
              ones who can put it in front of someone who can. */}
          <div className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-white/10 px-8 py-5 md:px-12 lg:px-14">
            <p className="font-inter text-sm text-white/60">
              Not a restaurant? Pass this to one you trust.
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 font-inter text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(222_32%_11%)]"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copied ? "Link copied" : "Copy invite link"}
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
