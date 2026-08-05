import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  BookOpenCheck,
  ExternalLink,
  Globe,
  MapPin,
  Navigation2,
  Phone,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import {
  Breadcrumbs,
  Container,
  PageLayout,
  Section,
} from "@/components/layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ParticipantBadge } from "@/components/restaurants/ParticipantBadge";
import { ProgramDisclaimer } from "@/components/restaurants/ProgramDisclaimer";
import { fetchRestaurantBySlug, type DirectoryListing } from "@/program/api";
import { displayWebsite, normalizeWebsite } from "@/program/url";
import { allergenMenu, displayFacets } from "@/program/facets";
import { FacetExplainer } from "@/components/restaurants/FacetExplainer";
import { cuisineLabel } from "@/program/survey";
import { stateName } from "@/program/us-states";

function formatAddress(listing: DirectoryListing): string {
  return [
    listing.address_line1,
    listing.address_line2,
    `${listing.city}, ${listing.state} ${listing.postal_code ?? ""}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}

function structuredData(listing: DirectoryListing) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: listing.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address_line1 ?? undefined,
      addressLocality: listing.city,
      addressRegion: listing.state,
      postalCode: listing.postal_code ?? undefined,
      addressCountry: listing.country,
    },
    telephone: listing.phone ?? undefined,
    url: normalizeWebsite(listing.website) ?? undefined,
    servesCuisine: listing.cuisine.map(cuisineLabel),
    ...(listing.latitude != null && listing.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: listing.latitude,
            longitude: listing.longitude,
          },
        }
      : {}),
  };
}

const RestaurantProfile = () => {
  const { slug = "" } = useParams();

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ["restaurant", slug],
    queryFn: () => fetchRestaurantBySlug(slug),
    enabled: slug.length > 0,
    retry: 1,
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  if (isError || !listing) {
    return (
      <PageLayout>
        <Section className="pt-28 md:pt-32">
          <Container width="narrow">
            <h1 className="font-poppins text-3xl font-bold text-foreground">
              We couldn't find that restaurant
            </h1>
            <p className="mt-3 font-inter leading-relaxed text-muted-foreground">
              The listing may have been withdrawn, or the link may be out of date.
            </p>
            <Button asChild className="mt-6">
              <Link to="/restaurants/directory">Back to the directory</Link>
            </Button>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  const address = formatAddress(listing);
  // Older rows may hold a bare "example.com", which would resolve as a path
  // on our own domain if used as an href directly.
  const website = normalizeWebsite(listing.website);
  const facets = displayFacets(listing.facets);
  const menu = allergenMenu(listing.facets);
  const menuUrl = normalizeWebsite(menu?.url);
  const lastUpdated = listing.information_current_as_of ?? listing.published_at;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${listing.name} ${address}`,
  )}`;
  const hasCoordinates = listing.latitude != null && listing.longitude != null;

  return (
    <PageLayout>
      <SEOHead
        title={`${listing.name} — ${listing.city}, ${listing.state}`}
        description={`How ${listing.name} in ${listing.city}, ${stateName(
          listing.state,
        )} handles food allergy requests, shared voluntarily by the restaurant.`}
        structuredData={structuredData(listing)}
      />

      <header className="border-b border-border/60 bg-background-subtle pb-10 pt-28 md:pb-14 md:pt-32">
        <Container>
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: "Restaurants", href: "/restaurants" },
              { label: "Directory", href: "/restaurants/directory" },
              { label: listing.name },
            ]}
          />
          <div className="space-y-4">
            <ParticipantBadge />
            <h1 className="break-words font-poppins text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
              {listing.name}
            </h1>
            <p className="flex items-start gap-2 font-inter text-muted-foreground">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{address}</span>
            </p>
            {listing.cuisine.length > 0 && (
              <p className="font-inter text-muted-foreground">
                {listing.cuisine.map(cuisineLabel).join(" · ")}
              </p>
            )}
          </div>
        </Container>
      </header>

      <Section spacing="sm">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            {/* min-w-0: grid items default to min-width:auto, so without this
                a single unbreakable word (a pasted URL, a run-on string) in a
                restaurant's answer stretches the whole column past the
                viewport and the page scrolls sideways. */}
            <div className="min-w-0 space-y-8">
              <div>
                <h2 className="font-poppins text-2xl font-bold text-foreground">
                  What this restaurant shared
                </h2>
                <p className="mt-2 font-inter text-muted-foreground">
                  Answers below are in the restaurant's own words, as submitted
                  to Allergy Voices.
                </p>
              </div>

              {menu && (
                <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <BookOpenCheck
                      className="mt-0.5 h-6 w-6 shrink-0 text-secondary-strong"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <h3 className="font-poppins text-lg font-semibold text-foreground">
                        Allergen menu
                      </h3>
                      <p className="mt-1 font-inter text-sm leading-relaxed text-muted-foreground">
                        {menu.label}. An allergen menu shows which dishes
                        contain which allergens, so you can check before you go.
                      </p>
                      {menuUrl && (
                        <Button asChild className="mt-4">
                          <a href={menuUrl} target="_blank" rel="noopener noreferrer">
                            View the allergen menu
                            <ExternalLink className="ml-1.5 h-4 w-4" aria-hidden="true" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {facets.length === 0 ? (
                <p className="font-inter text-muted-foreground">
                  This restaurant hasn't shared detailed allergy information yet.
                </p>
              ) : (
                <dl className="space-y-6">
                  {facets.map((facet) => (
                    <div
                      key={facet.questionId}
                      className="border-b border-border/60 pb-6 last:border-0 last:pb-0"
                    >
                      <dt className="flex items-center gap-1.5 font-poppins font-semibold text-foreground">
                        {facet.label}
                        {facet.explainer && (
                          <FacetExplainer label={facet.label} explainer={facet.explainer} />
                        )}
                      </dt>
                      <dd className="mt-2">
                        {facet.isProse ? (
                          <p className="whitespace-pre-line break-words font-inter leading-relaxed text-muted-foreground">
                            {facet.values[0]}
                          </p>
                        ) : facet.values.length > 1 ? (
                          <ul className="flex flex-wrap gap-2">
                            {facet.values.map((value) => (
                              <li
                                key={value}
                                className="break-words rounded-full bg-muted px-3 py-1 font-inter text-sm text-foreground"
                              >
                                {value}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="break-words font-inter text-foreground">{facet.values[0]}</p>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <ProgramDisclaimer />
            </div>

            <aside className="min-w-0 space-y-5">
              <Card>
                <CardContent className="space-y-4 p-5">
                  <h2 className="font-poppins font-semibold text-foreground">
                    Contact
                  </h2>
                  {listing.phone && (
                    <p className="flex items-center gap-2 font-inter text-sm">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <a href={`tel:${listing.phone}`} className="text-primary hover:underline">
                        {listing.phone}
                      </a>
                    </p>
                  )}
                  {website && (
                    <p className="flex items-center gap-2 font-inter text-sm">
                      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        title={displayWebsite(website)}
                      >
                        Visit website
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </p>
                  )}
                  <Button asChild variant="outline" className="w-full">
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                      <Navigation2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Get directions
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {hasCoordinates && (
                <Card className="overflow-hidden">
                  <iframe
                    title={`Map showing the location of ${listing.name}`}
                    className="h-56 w-full border-0 bg-muted"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      listing.longitude! - 0.008
                    }%2C${listing.latitude! - 0.006}%2C${
                      listing.longitude! + 0.008
                    }%2C${listing.latitude! + 0.006}&layer=mapnik&marker=${
                      listing.latitude
                    }%2C${listing.longitude}`}
                  />
                  {/* Attribution is required by the OSM tile usage policy, and
                      it also labels the frame while tiles are still loading. */}
                  <p className="px-3 py-2 font-inter text-xs text-muted-foreground">
                    Map data ©{" "}
                    <a
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      OpenStreetMap
                    </a>{" "}
                    contributors
                  </p>
                </Card>
              )}

              {lastUpdated && (
                <Card>
                  <CardContent className="p-5">
                    <h2 className="font-poppins font-semibold text-foreground">
                      Information current as of
                    </h2>
                    <p className="mt-1 font-inter text-sm text-muted-foreground">
                      {format(new Date(lastUpdated), "MMMM d, yyyy")}
                    </p>
                    <p className="mt-3 font-inter text-sm text-muted-foreground">
                      Practices change. Confirm your needs with staff when you
                      arrive.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-5">
                  <h2 className="font-poppins font-semibold text-foreground">
                    Is this your restaurant?
                  </h2>
                  <p className="mt-1 font-inter text-sm text-muted-foreground">
                    Update your information any time — it's free. We'll match
                    it to this listing.
                  </p>
                  {/* Carries the identity fields through so the restaurant
                      isn't retyping what we already show on this page — and
                      so the submission matches this listing instead of
                      creating a second one. */}
                  <Button asChild variant="outline" className="mt-3 w-full">
                    <Link
                      to={{
                        pathname: "/restaurants/participate",
                        search: `?${new URLSearchParams({
                          name: listing.name,
                          city: listing.city,
                          state: listing.state,
                        }).toString()}`,
                      }}
                    >
                      Update this listing
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default RestaurantProfile;
