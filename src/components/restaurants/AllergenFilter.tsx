import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ALLERGEN_OPTIONS, allergenLabel } from "@/program/survey";

interface AllergenFilterProps {
  selected: string[];
  onChange: (allergens: string[]) => void;
  id?: string;
}

// "Other" is free text on a restaurant's side, so it can't be matched against.
const FILTERABLE = ALLERGEN_OPTIONS.filter((a) => a.value !== "other");

/**
 * Multi-select allergen filter.
 *
 * Families routinely manage more than one allergy, so this selects a set and
 * the directory requires a restaurant to have named all of them.
 *
 * The wording throughout is deliberately about what a restaurant is *asked*
 * about, never what it is safe for. Filtering to "Peanut" and getting results
 * must not read as "these restaurants are peanut-safe" — hence the note in
 * the popover rather than a bare checkbox list.
 */
export function AllergenFilter({ selected, onChange, id = "allergen-filter" }: AllergenFilterProps) {
  const toggle = (value: string, checked: boolean) =>
    onChange(
      checked ? [...selected, value] : selected.filter((a) => a !== value),
    );

  const summary =
    selected.length === 0
      ? "Any allergy"
      : selected.length <= 2
        ? selected.map(allergenLabel).join(", ")
        : `${selected.length} allergens`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-inter text-sm font-medium">
        Allergy experience
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="w-full justify-between font-inter font-normal"
            aria-describedby={`${id}-help`}
            aria-label={
              selected.length === 0
                ? "Filter by allergy experience"
                : `Filter by allergen. ${selected.length} selected: ${selected.map(allergenLabel).join(", ")}`
            }
          >
            <span className={selected.length ? "text-foreground" : "text-muted-foreground"}>
              {summary}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-3" align="start">
          <fieldset>
            <legend className="mb-2 font-inter text-sm text-muted-foreground">
              Show restaurants that regularly get asked about all of:
            </legend>
            <div className="space-y-2.5">
              {FILTERABLE.map((option) => {
                const optionId = `${id}-${option.value}`;
                return (
                  <div key={option.value} className="flex items-center gap-3">
                    <Checkbox
                      id={optionId}
                      checked={selected.includes(option.value)}
                      onCheckedChange={(checked) => toggle(option.value, checked === true)}
                    />
                    <Label htmlFor={optionId} className="font-inter font-normal">
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-3 border-t border-border pt-3 font-inter text-xs leading-relaxed text-muted-foreground">
            This finds restaurants that told us they regularly receive these
            requests. It does not mean they are safe for that allergy — always
            discuss your needs with staff.
          </p>

          {selected.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 w-full"
              onClick={() => onChange([])}
            >
              Clear allergens
            </Button>
          )}
        </PopoverContent>
      </Popover>

      <p
        id={`${id}-help`}
        className="font-inter text-xs leading-relaxed text-muted-foreground"
      >
        Filter by allergies restaurants report regularly receiving requests for.
      </p>
    </div>
  );
}

/**
 * The current allergen selection, shown outside the filter grid so several
 * chips can flow across the full width instead of stacking in one column.
 * Each chip removes just itself — quicker than reopening the menu.
 */
export function SelectedAllergens({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (allergens: string[]) => void;
}) {
  if (selected.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      <li className="font-inter text-sm text-muted-foreground">Regularly asked about:</li>
      {selected.map((value) => (
        <li key={value}>
          <button
            type="button"
            onClick={() => onChange(selected.filter((a) => a !== value))}
            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 font-inter text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Check className="h-3 w-3" aria-hidden="true" />
            {allergenLabel(value)}
            <X className="h-3 w-3" aria-hidden="true" />
            <span className="sr-only">Remove {allergenLabel(value)} filter</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
