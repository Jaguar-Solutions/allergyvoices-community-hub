import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

/**
 * Marks a listing as taking part in the transparency program.
 *
 * It says "participant" and nothing more — no tier, no level, no implication
 * that one participant is better than another.
 */
export function ParticipantBadge({ className, size = "md" }: ParticipantBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 font-inter font-medium text-secondary-strong",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
    >
      <HeartHandshake
        className={cn("shrink-0", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")}
        aria-hidden="true"
      />
      Allergy Voices Participant
    </span>
  );
}
