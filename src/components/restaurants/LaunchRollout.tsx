import { MapPin } from "lucide-react";

import { Container, Section } from "@/components/layout";
import { LAUNCH_REGION, ROLLOUT } from "@/config/launch";

/**
 * How the directory expands, stated plainly.
 *
 * A directory that is nationwide in intent but nearly empty in practice reads
 * as a failed launch unless it explains itself. Saying "one region first, then
 * these, and you can join from anywhere today" turns a thin directory into a
 * visible plan — and the last phase is what stops a restaurant outside the
 * launch region assuming the program isn't for them.
 *
 * All wording comes from `src/config/launch.ts`, so moving to phase two is one
 * edit rather than a hunt through page copy.
 */
export function LaunchRollout({ className }: { className?: string }) {
  return (
    <Section tone="subtle" className={className}>
      <Container width="default">
        <h2 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
          Where we&apos;re launching
        </h2>
        <p className="mt-3 max-w-2xl font-inter leading-relaxed text-muted-foreground">
          AllergyVoices is nationwide. The restaurant directory starts in one
          region so it is genuinely useful somewhere before it spreads
          everywhere.
        </p>

        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {ROLLOUT.map((phase) => (
            <li
              key={phase.label}
              className="rounded-2xl border border-border bg-background p-5"
            >
              <span className="font-inter text-xs font-semibold uppercase tracking-wide text-primary">
                {phase.label}
              </span>
              <h3 className="mt-1.5 font-poppins font-semibold text-foreground">
                {phase.title}
              </h3>
              <p className="mt-2 font-inter text-sm leading-relaxed text-muted-foreground">
                {phase.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-border bg-background p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 font-poppins font-semibold text-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Want to help bring AllergyVoices to your city?
              </h3>
              <p className="mt-1.5 font-inter text-sm leading-relaxed text-muted-foreground">
                Cities launch with local families and community partners, not
                advertising. Email us and say which one.
              </p>
            </div>
            {/* Deliberately mailto rather than a new signup surface: the brief
                asked not to build an ambassador system for this change, and a
                message we answer beats a form nobody has staffed. */}
            <ul className="flex flex-wrap gap-2 md:shrink-0">
              {[
                { label: "Become a local ambassador", subject: "Local ambassador" },
                { label: "Recommend a restaurant", subject: "Restaurant recommendation" },
                { label: "Request your city", subject: "Request a city" },
              ].map((action) => (
                <li key={action.subject}>
                  <a
                    href={`mailto:info@allergyvoices.com?subject=${encodeURIComponent(
                      `${action.subject} — AllergyVoices`,
                    )}`}
                    className="inline-flex rounded-full border border-border bg-background px-3 py-1.5 font-inter text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {action.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-4 font-inter text-sm text-muted-foreground">
          Currently enrolling in {LAUNCH_REGION.cities.join(", ")} and
          surrounding communities — and open to restaurants in every state.
        </p>
      </Container>
    </Section>
  );
}
