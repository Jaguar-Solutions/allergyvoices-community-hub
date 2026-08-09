import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, SlidersHorizontal, Store } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageHeader, PageLayout, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { DirectorySkeleton } from "@/components/restaurants/DirectorySkeleton";
import { ProgramDisclaimer } from "@/components/restaurants/ProgramDisclaimer";
import { AllergenFilter, SelectedAllergens } from "@/components/restaurants/AllergenFilter";
import {
  directoryFacetOptions,
  EMPTY_FILTERS,
  fetchPublishedRestaurants,
  filterListings,
  hasActiveFilters,
  type DirectoryFilters,
} from "@/program/api";
import { cuisineLabel } from "@/program/survey";
import {
  LAUNCH_CITIES_PHRASE,
  LAUNCH_REGION,
  NATIONWIDE_NOTE,
} from "@/config/launch";
import { InviteRestaurantButton } from "@/components/restaurants/InviteRestaurantButton";
import { stateName } from "@/program/us-states";

/** Sentinel for "no filter", since a Radix Select item can't have an empty value. */
const ANY = "__any__";

const RestaurantDirectory = () => {
  const [filters, setFilters] = useState<DirectoryFilters>(EMPTY_FILTERS);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["published-restaurants"],
    queryFn: fetchPublishedRestaurants,
    // One retry, not the default three — a visitor shouldn't watch a spinner
    // for eight seconds before being told the directory is unavailable.
    retry: 1,
  });

  const listings = useMemo(() => data ?? [], [data]);
  const options = useMemo(() => directoryFacetOptions(listings), [listings]);
  const results = useMemo(
    () => filterListings(listings, filters),
    [listings, filters],
  );

  const hasFilters = hasActiveFilters(filters);
  /**
   * True before the first listing is published.
   *
   * Showing "0 restaurants" above an empty grid of filters is negative social
   * proof during the weeks when zero is the expected number — it reads as a
   * directory that failed rather than one that has not opened. So the count,
   * the filters and the "restaurants that shared" heading are all withheld
   * until there is something to count.
   *
   * Derived from the fetched data, not a flag: publishing the first listing
   * flips this page to its normal state with no deploy.
   */
  const preLaunch = !isLoading && !isError && listings.length === 0;
  // A young directory should look deliberate, not empty.
  const useFeature = results.length > 0 && results.length <= 2;

  const set = (patch: Partial<DirectoryFilters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  const fromSelect = (value: string) => (value === ANY ? "" : value);

  return (
    <PageLayout>
      <SEOHead
        title="Restaurant Directory"
        description="Restaurants that voluntarily shared how they handle food allergy requests. Search by name, city, cuisine, or allergen."
      />
      <PageHeader
        eyebrow="Restaurant directory"
        title={
          preLaunch
            ? `${LAUNCH_REGION.bareName} Restaurant Directory launching soon`
            : "Restaurants that shared how they handle food allergies"
        }
        intro={
          preLaunch
            ? `We're preparing to begin restaurant outreach in ${LAUNCH_CITIES_PHRASE}. Restaurant profiles will appear here as participating restaurants complete the survey and approve their listings.`
            : "Every restaurant here took part voluntarily and filled this out themselves. We publish what they told us, with the date they last confirmed it."
        }
        breadcrumbs={[
          { label: "Restaurants", href: "/restaurants" },
          { label: "Directory" },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link to="/restaurants">Share your restaurant's practices</Link>
          </Button>
        }
      />

      {!preLaunch && (
      <Section spacing="sm">
        <Container width="wide">
          <div className="rounded-2xl border border-border bg-background-subtle p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="flex items-center gap-2 font-poppins font-semibold text-foreground">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Find a restaurant
              </h2>
              {!isLoading && !isError && (
                <p className="font-inter text-sm text-muted-foreground" role="status">
                  <span className="font-semibold text-foreground">{results.length}</span>{" "}
                  {results.length === 1 ? "restaurant" : "restaurants"}
                  {hasFilters ? " match" : ""}
                </p>
              )}
            </div>

            {/* Six tracks so the double-width search box plus four filters
                fill exactly one row on wide screens. */}
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="directory-search" className="font-inter text-sm font-medium">
                  Restaurant or city
                </Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="directory-search"
                    type="search"
                    className="pl-9"
                    placeholder="Search by name or city"
                    value={filters.query}
                    onChange={(e) => set({ query: e.target.value })}
                  />
                </div>
              </div>

              <FilterSelect
                id="directory-city"
                label="City"
                value={filters.city}
                onChange={(v) => set({ city: fromSelect(v) })}
                placeholder="Any city"
                items={options.cities.map((c) => ({ value: c, label: c }))}
              />

              <FilterSelect
                id="directory-state"
                label="State"
                value={filters.state}
                onChange={(v) => set({ state: fromSelect(v) })}
                placeholder="Any state"
                items={options.states.map((s) => ({ value: s, label: stateName(s) }))}
              />

              <FilterSelect
                id="directory-cuisine"
                label="Cuisine"
                value={filters.cuisine}
                onChange={(v) => set({ cuisine: fromSelect(v) })}
                placeholder="Any cuisine"
                items={options.cuisines.map((c) => ({
                  value: c,
                  label: cuisineLabel(c),
                }))}
              />

              <AllergenFilter
                id="directory-allergen"
                selected={filters.allergens}
                onChange={(allergens) => set({ allergens })}
              />
            </div>

            {hasFilters && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <SelectedAllergens
                  selected={filters.allergens}
                  onChange={(allergens) => set({ allergens })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </Container>
      </Section>
      )}

      <Section spacing="sm" className="pt-0 md:pt-0">
        <Container width="wide">
          {isLoading && <DirectorySkeleton />}

          {isError && (
            <p className="py-12 text-center font-inter text-muted-foreground">
              We couldn't load the directory just now. Please refresh to try again.
            </p>
          )}

          {!isLoading && !isError && (
            <>
              {results.length > 0 && (
                <ul
                  className={
                    // One or two listings in a three-column grid look like a
                    // failed page load. Below that threshold the cards go
                    // full width and carry more detail instead.
                    useFeature
                      ? "grid gap-5"
                      : "grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                  }
                >
                  {results.map((listing, index) => (
                    <li
                      key={listing.id}
                      className="min-w-0 duration-500 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                      // A short cascade so results feel like they arrive rather
                      // than blink in. Capped so the last card is never left
                      // waiting. The global prefers-reduced-motion rule in
                      // index.css disables this entirely.
                      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                    >
                      <RestaurantCard
                        listing={listing}
                        variant={useFeature ? "feature" : "compact"}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {results.length === 0 && (
                <EmptyState hasFilters={hasFilters} onClear={() => setFilters(EMPTY_FILTERS)} />
              )}
            </>
          )}
        </Container>
      </Section>

      <Section spacing="sm">
        <Container width="default">
          <ProgramDisclaimer />
        </Container>
      </Section>
    </PageLayout>
  );
};

/**
 * What a visitor sees when the directory has nothing to show.
 *
 * Two genuinely different situations, and conflating them is why an empty
 * directory reads as broken. A filtered search that found nothing needs a way
 * back; an unlaunched directory needs to explain that it is being built in one
 * region first, and to say plainly that a restaurant in any state can still
 * take part. Neither shows a fabricated listing.
 */
function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  if (hasFilters) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center">
        <Store className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 font-poppins text-xl font-bold text-foreground">
          No restaurants match that search yet
        </h2>
        <p className="mx-auto mt-2 max-w-xl font-inter leading-relaxed text-muted-foreground">
          This directory grows one restaurant at a time. If you know a place
          that handles allergies well, ask them to add their information —
          it&apos;s free.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClear}>
            Clear filters
          </Button>
          <InviteRestaurantButton variant="default" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-8 md:p-10">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 font-inter text-xs font-medium text-primary">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {LAUNCH_REGION.cities.join(" · ")}
        </span>

        <h2 className="mt-4 font-poppins text-2xl font-bold text-foreground md:text-3xl">
          {LAUNCH_REGION.bareName} directory launching soon
        </h2>

        <p className="mt-3 font-inter leading-relaxed text-muted-foreground">
          We&apos;re currently enrolling restaurants in {LAUNCH_CITIES_PHRASE}.{" "}
          {NATIONWIDE_NOTE}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/restaurants/participate">Participate as a restaurant</Link>
          </Button>
          <InviteRestaurantButton label="Recommend a restaurant" />
          <Button asChild variant="outline">
            <Link to="/restaurants#help-your-city">
              Join the {LAUNCH_REGION.bareName} launch
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl border-t border-border pt-6">
        <h3 className="font-poppins text-sm font-semibold text-foreground">
          Other cities coming soon
        </h3>
        <p className="mt-1.5 font-inter text-sm leading-relaxed text-muted-foreground">
          Additional cities launch with local ambassadors, allergy families and
          community partners. Want to help bring AllergyVoices to yours?{" "}
          <Link
            to="/restaurants#help-your-city"
            className="text-primary underline-offset-2 hover:underline"
          >
            Request your city
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  items: Array<{ value: string; label: string }>;
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  placeholder,
  items,
}: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-inter text-sm font-medium">
        {label}
      </Label>
      <Select value={value || ANY} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{placeholder}</SelectItem>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default RestaurantDirectory;
