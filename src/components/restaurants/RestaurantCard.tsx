import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  ExternalLink,
  MapPin,
  Phone,
  Quote,
} from "lucide-react";
import {
  allergenMenu,
  cardHighlights,
  accommodatedAllergens,
  familyNotes,
  kitchenPractices,
} from "@/program/facets";
import { allergenLabel, cuisineLabel, optionLabel } from "@/program/survey";
import type { DirectoryListing } from "@/program/api";
import { displayWebsite, normalizeWebsite } from "@/program/url";
import { cn } from "@/lib/utils";
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

export type CardVariant = "compact" | "feature";

/**
 * One restaurant in the directory.
 *
 * Two shapes. `compact` is the grid tile. `feature` is used when the directory
 * has only one or two listings, where a single third-width tile marooned in a
 * three-column grid reads as a page that failed to load rather than as a young
 * directory. The feature shape fills the row and spends the space on detail the
 * tile has no room for: kitchen practices, and whatever the restaurant wrote
 * for families in its own words.
 *
 * Both shapes report the restaurant's own answer rather than a checkmark. A
 * tick implies a threshold somebody set; this programme reports what was
 * shared. There is also no "Participant" badge, because every listing here is
 * a participant and a badge on all of them distinguishes nothing.
 */
export function RestaurantCard({
  listing,
  variant = "compact",
}: {
  listing: DirectoryListing;
  variant?: CardVariant;
}) {
  const highlights = cardHighlights(listing.facets);
  const allergens = accommodatedAllergens(listing.facets);
  const practices = kitchenPractices(listing.facets);
  const note = familyNotes(listing.facets);
  const menu = allergenMenu(listing.facets);
  const updated = listing.information_current_as_of ?? listing.published_at;
  const isFeature = variant === "feature";
  const website = normalizeWebsite(listing.website);

  const identity = (
    <div className={cn("flex items-start gap-3", isFeature && "md:gap-4")}>
      <RestaurantMonogram
        name={listing.name}
        className={isFeature ? "h-14 w-14 text-lg md:h-16 md:w-16 md:text-xl" : undefined}
      />
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "break-words font-poppins font-semibold leading-snug text-foreground",
            isFeature ? "text-xl md:text-2xl" : "text-lg",
          )}
        >
          <Link
            to={`/restaurants/${listing.slug}`}
            className="rounded-sm transition-colors group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* Stretches the click target across the whole card. */}
            <span className="absolute inset-0" aria-hidden="true" />
            {listing.name}
          </Link>
        </h3>
        <p
          className={cn(
            "mt-1 flex min-w-0 gap-1.5 font-inter text-sm text-muted-foreground",
            isFeature ? "items-start" : "items-center",
          )}
        >
          <MapPin
            className={cn("h-3.5 w-3.5 shrink-0", isFeature && "mt-0.5")}
            aria-hidden="true"
          />
          <span className={cn("min-w-0", isFeature ? "break-words" : "truncate")}>
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
  );

  const allergenList = allergens.length > 0 && (
    <div>
      <p className="font-inter text-xs text-muted-foreground">
        Usually accommodates
      </p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {allergens.map((allergen) => (
          <li
            key={allergen}
            className={cn(
              "rounded-full font-inter font-medium text-foreground/80",
              isFeature ? "px-3 py-1 text-sm" : "px-2.5 py-1 text-xs",
              ALLERGEN_TINT[allergen] ?? "bg-muted",
            )}
          >
            {allergenLabel(allergen)}
          </li>
        ))}
      </ul>
    </div>
  );

  const answers = highlights.length > 0 && (
    <dl
      className={cn(
        "grid gap-x-4 gap-y-2.5",
        isFeature ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2",
      )}
    >
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
  );

  const footer = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
  );

  if (!isFeature) {
    return (
      <article className="group relative flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-within:border-primary/30 focus-within:shadow-lg">
        {identity}
        {allergenList && <div className="mt-4">{allergenList}</div>}
        {answers && (
          <div className="mt-4 border-t border-border/70 pt-4">{answers}</div>
        )}
        <div className="mt-auto pt-4">{footer}</div>
      </article>
    );
  }

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg focus-within:border-primary/30 focus-within:shadow-lg">
      {/* A thin brand ribbon, the same device as the home page preview, so a
          lone listing still reads as a designed object rather than a stub. */}
      <div
        aria-hidden="true"
        className="h-1 bg-gradient-to-r from-brand-cyan via-brand-sun to-brand-coral"
      />

      <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-10 md:p-8">
        <div className="min-w-0 space-y-4">
          {identity}

          {/* Calling ahead is the standard advice for eating out with an
              allergy, so the number is worth surfacing before the profile.
              `relative z-10` lifts these above the card's stretched link so
              they stay independently clickable. */}
          {(listing.phone || website) && (
            <div className="relative z-10 flex flex-col gap-2 border-t border-border/70 pt-4">
              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  className="inline-flex w-fit items-center gap-2 rounded-sm font-inter text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {listing.phone}
                </a>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit min-w-0 items-center gap-2 rounded-sm font-inter text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{displayWebsite(website)}</span>
                </a>
              )}
            </div>
          )}

          {footer}
        </div>

        <div className="min-w-0 space-y-5 md:border-l md:border-border/70 md:pl-10">
          {allergenList}
          {answers}

          {practices.length > 0 && (
            <div>
              <p className="font-inter text-xs text-muted-foreground">
                Kitchen practices they told us about
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {practices.map((practice) => (
                  <li
                    key={practice}
                    className="rounded-full border border-border bg-background px-2.5 py-1 font-inter text-xs text-foreground/80"
                  >
                    {optionLabel("kitchen_practices", practice)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {note && (
            <figure className="flex gap-2.5 rounded-xl bg-background-subtle p-4">
              <Quote
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <figcaption className="min-w-0">
                <p className="break-words font-inter text-sm leading-relaxed text-foreground">
                  {note}
                </p>
                <span className="mt-1 block font-inter text-xs text-muted-foreground">
                  {listing.name}, in their own words
                </span>
              </figcaption>
            </figure>
          )}

          <p className="inline-flex items-center gap-1.5 font-inter text-sm font-medium text-primary">
            See everything they shared
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </p>
        </div>
      </div>
    </article>
  );
}
