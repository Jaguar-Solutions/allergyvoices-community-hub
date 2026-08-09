import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantBadgeProps {
  className?: string;
  size?: "sm" | "md";
  /**
   * Renders the "what this means" sentence under the badge. On by default
   * nowhere — the profile passes it, because that is the one place a visitor
   * is deciding how much weight to give what follows.
   */
  withExplanation?: boolean;
}

/**
 * Marks a listing as having taken part in the transparency survey.
 *
 * The wording is load-bearing. "AllergyVoices Participant" was ambiguous
 * enough to be read as a status we conferred — a membership, an approval, a
 * standard met. "Survey Participant" can only be read as a description of
 * what the restaurant did: it answered our questions.
 *
 * No tier, no level, no implication that one participant is better than
 * another, and never the words certified, approved, verified, recommended,
 * or safe.
 */
export function ParticipantBadge({
  className,
  size = "md",
  withExplanation = false,
}: ParticipantBadgeProps) {
  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 font-inter font-medium text-secondary-strong",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        !withExplanation && className,
      )}
    >
      <HeartHandshake
        className={cn("shrink-0", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")}
        aria-hidden="true"
      />
      AllergyVoices Survey Participant
    </span>
  );

  if (!withExplanation) return badge;

  return (
    <div className={cn("space-y-2", className)}>
      {badge}
      <p className="max-w-2xl font-inter text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">What this means: </span>
        This restaurant voluntarily provided information about its food allergy
        practices. AllergyVoices does not inspect, certify, grade, or guarantee
        allergy safety.
      </p>
    </div>
  );
}
