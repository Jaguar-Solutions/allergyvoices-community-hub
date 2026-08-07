import { Link } from "react-router-dom";
import { BookOpenCheck, MapPin } from "lucide-react";
import { allergenMenu, cardHighlights, accommodatedAllergens } from "@/program/facets";
import { allergenLabel, cuisineLabel } from "@/program/survey";
import type { DirectoryListing } from "@/program/api";
import { RestaurantMonogram } from "./RestaurantMonogram";

/** The allergen tints already used across the site, keyed by survey value. */
const ALLERGEN_TINT: Record<string, string> = {
  milk: "bg-allergen-milk",
  egg: "bg-allergen-egg",
  peanut: "bg-allergen-peanut",
  tree_nut: "bg-allergen-tree-nuts",
  sesame: "bg-allergen-sesame",
  soy: "bg-allergen-soy",
  wheat: "bg-allergen-wheat",
  fish: "bg-allergen-fish",
  shellfish: "bg-allergen-shellfish",
};

/**
 * One restaurant in the directory grid.
 *
 * The card answers a single question: is this somewhere worth opening? So the
 * allergens carry the visual weight, in the same tints used everywhere else on
 * the site, because "can they handle peanut" is what a family scans for. The
 * practice answers sit underneath in plain label/value pairs rather than
 * checkmarks, since a tick implies a threshold somebody set, and this
 * programme reports what was shared rather than grading it.
 *
 * There is deliberately no "Participant" badge here. Every listing in this
 * directory is a participant, so a badge on all six cards distinguishes
 * nothing and just adds noise. It lives on the profile, where it means
 * something.
 */
export function RestaurantCard({ listing }: { listing: DirectoryListing }) {
  const highlights = cardHighlights(listing.facets);
  const allergens = accommodatedAllergens(listing.facets);
  const menu = allergenMenu(listing.facets);
  const updated = listing.information_current_as_of ?? listing.published_at;

  return (
    <article className="group relative flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-within:border-primary/30 focus-within:shadow-lg">
      <div className="flex items-start gap-3">
        <RestaurantMonogram name={listing.name} />
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-poppins text-lg font-semibold leading-snug text-foreground">
            <Link
              to={`/restaurants/${listing.slug}`}
              className="rounded-sm transition-colors group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* Stretches the click target across the whole card. */}
              <span className="absolute inset-0" aria-hidden="true" />
              {listing.name}
            </Link>
          </h3>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 font-inter text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">
              {listing.city}, {listing.state}
              {listing.cuisine.length > 0 && (
                <span className="text-muted-foreground/80">
                  {" · "}
                  {listing.cuisine.map(cuisineLabel).join(", ")}
                </span>
              )}
            </span>
          </p>
        </div>
      </div>

      {allergens.length > 0 && (
        <div className="mt-4">
          <p className="font-inter text-xs text-muted-foreground">
            Usually accommodates
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {allergens.map((allergen) => (
              <li
                key={allergen}
                className={`rounded-full px-2.5 py-1 font-inter text-xs font-medium text-foreground/80 ${
                  ALLERGEN_TINT[allergen] ?? "bg-muted"
                }`}
              >
                {allergenLabel(allergen)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {highlights.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-border/70 pt-4">
          {highlights.map((highlight) => (
            <div key={highlight.label} className="min-w-0">
              <dt className="truncate font-inter text-xs text-muted-foreground">
                {highlight.label}
              </dt>
              <dd className="break-words font-inter text-sm font-medium text-foreground">
                {highlight.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-4">
        {menu && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 font-inter text-xs font-medium text-secondary-strong">
            <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Allergen menu
          </span>
        )}
        {updated && (
          <span className="font-inter text-xs text-muted-foreground">
            Updated{" "}
            {new Date(updated).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    </article>
  );
}
