import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Store } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageHeader, PageLayout, Section } from "@/components/layout";
import LoadingSpinner from "@/components/LoadingSpinner";
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
        title="Restaurants that shared how they handle food allergies"
        intro="Every listing here was filled out by the restaurant itself. We publish what they told us, along with the date they last updated it."
        breadcrumbs={[
          { label: "Restaurants", href: "/restaurants" },
          { label: "Directory" },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link to="/restaurants">Are you a restaurant?</Link>
          </Button>
        }
      />

      <Section spacing="sm">
        <Container width="wide">
          <div className="rounded-2xl border border-border bg-background-subtle p-5 md:p-6">
            <h2 className="flex items-center gap-2 font-poppins font-semibold text-foreground">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Find a restaurant
            </h2>

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

      <Section spacing="sm">
        <Container width="wide">
          {isLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {isError && (
            <p className="py-12 text-center font-inter text-muted-foreground">
              We couldn't load the directory just now. Please refresh to try again.
            </p>
          )}

          {!isLoading && !isError && (
            <>
              <p className="mb-6 font-inter text-sm text-muted-foreground" role="status">
                {results.length} {results.length === 1 ? "restaurant" : "restaurants"}
                {hasFilters
                  ? results.length === 1
                    ? " matches your search"
                    : " match your search"
                  : " participating so far"}
              </p>

              {results.length > 0 && (
                <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((listing) => (
                    <li key={listing.id}>
                      <RestaurantCard listing={listing} />
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

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center">
      <Store className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-4 font-poppins text-xl font-bold text-foreground">
        {hasFilters ? "No restaurants match that search yet" : "We're just getting started"}
      </h2>
      <p className="mx-auto mt-2 max-w-xl font-inter leading-relaxed text-muted-foreground">
        {hasFilters
          ? "This directory grows one restaurant at a time. If you know a place that handles allergies well, ask them to add their information — it's free."
          : "This directory is brand new. Restaurants are adding their information now, and every listing comes straight from the restaurant."}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {hasFilters && (
          <Button type="button" variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        )}
        <Button asChild>
          <Link to="/restaurants/participate">Add your restaurant</Link>
        </Button>
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
