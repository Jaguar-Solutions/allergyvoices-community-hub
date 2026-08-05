import { Link } from "react-router-dom";
import { BookOpenCheck, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { allergenMenu, cardHighlights, accommodatedAllergens } from "@/program/facets";
import { allergenLabel, cuisineLabel } from "@/program/survey";
import type { DirectoryListing } from "@/program/api";
import { ParticipantBadge } from "./ParticipantBadge";

export function RestaurantCard({ listing }: { listing: DirectoryListing }) {
  const highlights = cardHighlights(listing.facets);
  const allergens = accommodatedAllergens(listing.facets);
  const menu = allergenMenu(listing.facets);

  return (
    <Card className="relative h-full transition-shadow hover:shadow-md focus-within:shadow-md">
      <CardContent className="flex h-full flex-col gap-4 p-5 md:p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="break-words font-poppins text-lg font-semibold text-foreground">
              <Link
                to={`/restaurants/${listing.slug}`}
                className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Stretches the click target across the whole card. */}
                <span className="absolute inset-0" aria-hidden="true" />
                {listing.name}
              </Link>
            </h3>
            <ParticipantBadge size="sm" className="relative" />
          </div>

          <p className="flex items-center gap-1.5 font-inter text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            {listing.city}, {listing.state}
          </p>

          {listing.cuisine.length > 0 && (
            <p className="font-inter text-sm text-muted-foreground">
              {listing.cuisine.map(cuisineLabel).join(" · ")}
            </p>
          )}

          {/* Flagged on the card because it's the one thing a family can act
              on before leaving the house. */}
          {menu && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 font-inter text-xs font-medium text-secondary-strong">
              <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Allergen menu
            </p>
          )}
        </div>

        {highlights.length > 0 && (
          <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div key={highlight.label}>
                <dt className="font-inter text-xs uppercase tracking-wide text-muted-foreground">
                  {highlight.label}
                </dt>
                <dd className="break-words font-inter text-sm font-medium text-foreground">
                  {highlight.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {allergens.length > 0 && (
          <div className="mt-auto pt-1">
            <p className="font-inter text-xs uppercase tracking-wide text-muted-foreground">
              Allergens typically accommodated
            </p>
            <p className="font-inter text-sm text-foreground">
              {allergens.map(allergenLabel).join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
