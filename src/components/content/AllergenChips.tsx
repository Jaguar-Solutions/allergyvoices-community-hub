import { Badge } from "@/components/ui/badge";
import { ALLERGEN_LABELS, type Allergen } from "@/content/schemas";
import { cn } from "@/lib/utils";

interface AllergenChipsProps {
  allergens: Allergen[];
  className?: string;
}

export function AllergenChips({ allergens, className }: AllergenChipsProps) {
  if (allergens.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {allergens.map((a) => (
        <li key={a}>
          <Badge variant="secondary" className="font-inter font-normal">
            {ALLERGEN_LABELS[a]}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
