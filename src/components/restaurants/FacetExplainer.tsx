import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * "What does this actually mean?" for a survey answer.
 *
 * A popover rather than a tooltip on purpose: most of this site's traffic is
 * phones, where there is no hover, and a tooltip would simply never open.
 * A popover works the same way for a tap, a click, and a keyboard.
 */
export function FacetExplainer({
  label,
  explainer,
}: {
  label: string;
  explainer: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="-m-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">What does "{label}" mean?</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-left" align="start">
        <p className="font-poppins text-sm font-semibold text-foreground">
          {label}
        </p>
        <p className="mt-1.5 font-inter text-sm leading-relaxed text-muted-foreground">
          {explainer}
        </p>
      </PopoverContent>
    </Popover>
  );
}
