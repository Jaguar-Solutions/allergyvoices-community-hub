import { useEffect, useRef } from "react";

import { Container, Section } from "@/components/layout";
import { LAUNCH_REGION, ROLLOUT } from "@/config/launch";
import { CityRequestForm } from "./CityRequestForm";

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
  const details = useRef<HTMLDetailsElement>(null);

  // Arriving from "Request your city" or "Join the launch" elsewhere on the
  // site should land on an open form, not a closed summary the visitor has to
  // realise is clickable.
  useEffect(() => {
    if (window.location.hash !== "#help-your-city") return;
    const el = details.current;
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ block: "start", behavior: "smooth" });
  }, []);

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

        {/* Collapsed by default. This sits on the page whose one job is
            getting a restaurant through the survey, and an open form for a
            different audience competes with that. Anyone who came here for it
            has followed a link to #help-your-city, which opens it. */}
        <details ref={details} id="help-your-city" className="group mt-8 scroll-mt-24">
          <summary className="cursor-pointer rounded-2xl border border-border bg-background p-5 font-poppins font-semibold text-foreground marker:content-none hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Want to help bring AllergyVoices to your city?
            <span className="ml-2 font-inter text-sm font-normal text-muted-foreground group-open:hidden">
              Become an ambassador, recommend a restaurant, or request your city
            </span>
          </summary>
          <div className="mt-3">
            <CityRequestForm />
          </div>
        </details>

        <p className="mt-4 font-inter text-sm text-muted-foreground">
          Currently enrolling in {LAUNCH_REGION.cities.join(", ")} and
          surrounding communities — and open to restaurants in every state.
        </p>
      </Container>
    </Section>
  );
}
