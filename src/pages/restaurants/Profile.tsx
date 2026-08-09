import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  BookOpenCheck,
  ExternalLink,
  Globe,
  Info,
  MapPin,
  Navigation2,
  Phone,
  Quote,
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
import {
  allergenLimitations,
  allergenMenu,
  allergensDiscussed,
  crossContactNotes,
  crossContactSteps,
  dedicatedFryer,
  displayFacets,
  familyNotes,
  otherAllergens,
  quickSummary,
  saysNoCrossContactProcedure,
} from "@/program/facets";
import { FacetExplainer } from "@/components/restaurants/FacetExplainer";
import { allergenLabel, cuisineLabel, optionLabel } from "@/program/survey";
import { stateName } from "@/program/us-states";

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

/** A titled block on the profile. Keeps the page's rhythm consistent. */
function ProfileSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0">
      <h2 className="font-poppins text-xl font-bold text-foreground md:text-2xl">
        {title}
      </h2>
      {note && (
        <p className="mt-1.5 font-inter text-sm leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const RestaurantProfile = () => {
  const { slug = "" } = useParams();
  // An embedded map is the one part of this page that depends on a third
  // party rendering correctly. If it doesn't, the profile still has to look
  // finished rather than broken, so a failure swaps in a directions panel.
  const [mapFailed, setMapFailed] = useState(false);

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
  const summary = quickSummary(listing.facets);
  const allergens = allergensDiscussed(listing.facets);
  const allergensOther = otherAllergens(listing.facets);
  const steps = crossContactSteps(listing.facets);
  const noProcedure = saysNoCrossContactProcedure(listing.facets);
  const fryer = dedicatedFryer(listing.facets);
  const ccNotes = crossContactNotes(listing.facets);
  const limitations = allergenLimitations(listing.facets);
  const notes = familyNotes(listing.facets);
  const extraFacets = displayFacets(listing.facets);
  const menu = allergenMenu(listing.facets);
  const menuUrl = normalizeWebsite(menu?.url);
  const lastUpdated = listing.information_current_as_of ?? listing.published_at;
  const updatedLabel = lastUpdated
    ? format(new Date(lastUpdated), "MMMM d, yyyy")
    : null;
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
            <h1 className="break-words font-poppins text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
              {listing.name}
            </h1>
            <p className="font-inter text-muted-foreground">
              {listing.city}, {listing.state}
              {listing.cuisine.length > 0 && (
                <> · {listing.cuisine.map(cuisineLabel).join(", ")}</>
              )}
            </p>
            {/* The framing line. Everything below is the restaurant's account
                of itself, and saying so before the first answer is what stops
                the page reading as an assessment by us. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
              <p className="font-inter font-medium text-foreground">
                Restaurant-reported allergy practices
              </p>
              {updatedLabel && (
                <p className="font-inter text-sm text-muted-foreground">
                  Updated {updatedLabel}
                </p>
              )}
            </div>
            <ParticipantBadge withExplanation />
          </div>
        </Container>
      </header>

      <Section spacing="sm">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
            {/* min-w-0: grid items default to min-width:auto, so without this
                a single unbreakable word (a pasted URL, a run-on string) in a
                restaurant's answer stretches the whole column past the
                viewport and the page scrolls sideways. */}
            <div className="min-w-0 space-y-10">
              {summary.length > 0 && (
                <section className="min-w-0 rounded-2xl border border-border bg-background-subtle p-5 md:p-6">
                  <h2 className="font-poppins text-lg font-bold text-foreground">
                    At a glance
                  </h2>
                  <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {summary.map((row) => (
                      <div key={row.questionId} className="min-w-0">
                        <dt className="flex items-center gap-1.5 font-inter text-xs uppercase tracking-wide text-muted-foreground">
                          {row.label}
                          {row.explainer && (
                            <FacetExplainer
                              label={row.label}
                              explainer={row.explainer}
                            />
                          )}
                        </dt>
                        <dd className="mt-1 break-words font-inter font-medium text-foreground">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                    {(steps.length > 0 || noProcedure || ccNotes) && (
                      <div className="min-w-0">
                        <dt className="font-inter text-xs uppercase tracking-wide text-muted-foreground">
                          Cross-contact procedures
                        </dt>
                        <dd className="mt-1">
                          <a
                            href="#cross-contact"
                            className="font-inter font-medium text-primary hover:underline"
                          >
                            View details
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}

              {menu && (
                <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <BookOpenCheck
                      className="mt-0.5 h-6 w-6 shrink-0 text-secondary-strong"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <h2 className="font-poppins text-lg font-semibold text-foreground">
                        Allergen menu
                      </h2>
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

              {allergens.length > 0 && (
                <ProfileSection
                  title="Food allergies they regularly receive requests for"
                  note="These are allergies this restaurant sees often and is prepared to discuss. Naming an allergy is not a promise that a meal can be made free of it."
                >
                  <ul className="flex flex-wrap gap-2">
                    {allergens.map((allergen) => (
                      <li
                        key={allergen}
                        className={`rounded-full px-3 py-1 font-inter text-sm font-medium text-foreground/80 ${
                          ALLERGEN_TINT[allergen] ?? "bg-muted"
                        }`}
                      >
                        {allergenLabel(allergen)}
                      </li>
                    ))}
                  </ul>
                  {allergensOther && (
                    <p className="mt-3 break-words font-inter text-sm text-muted-foreground">
                      Also mentioned: {allergensOther}
                    </p>
                  )}
                </ProfileSection>
              )}

              {(steps.length > 0 || noProcedure || ccNotes || fryer) && (
                <div id="cross-contact" className="scroll-mt-24">
                  <ProfileSection
                    title="How they reduce cross-contact"
                    note="Cross-contact is when a trace of an allergen moves from one food to another — on a shared fryer, board, or utensil."
                  >
                    {steps.length > 0 && (
                      <ul className="space-y-2">
                        {steps.map((step) => (
                          <li
                            key={step}
                            className="flex items-start gap-2.5 font-inter text-foreground"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                            />
                            <span className="min-w-0 break-words">
                              {optionLabel("cross_contact_steps", step)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Never publish "dedicated fryer" as a bare chip. On its
                        own it is routinely read as "safe for my allergy"; the
                        follow-up says which allergens it actually covers. */}
                    {fryer && (
                      <div className="mt-4 rounded-xl border border-border bg-background-subtle p-4">
                        <p className="font-inter font-medium text-foreground">
                          Fryer not shared with certain allergens: {fryer.label}
                        </p>
                        {fryer.allergens.length > 0 ? (
                          <p className="mt-1 font-inter text-sm text-muted-foreground">
                            They told us this applies to:{" "}
                            {fryer.allergens.map(allergenLabel).join(", ")}.
                          </p>
                        ) : (
                          <p className="mt-1 font-inter text-sm text-muted-foreground">
                            They didn't tell us which allergens this applies to —
                            worth asking when you call.
                          </p>
                        )}
                      </div>
                    )}

                    {noProcedure && steps.length === 0 && (
                      <p className="font-inter leading-relaxed text-foreground">
                        This restaurant told us it does not have a specific
                        cross-contact procedure.
                      </p>
                    )}

                    {ccNotes && (
                      <p className="mt-4 whitespace-pre-line break-words font-inter leading-relaxed text-muted-foreground">
                        {ccNotes}
                      </p>
                    )}
                  </ProfileSection>
                </div>
              )}

              {/* Hidden entirely when blank — an empty "Important limitations"
                  heading reads as though we removed something. */}
              {limitations && (
                <ProfileSection
                  title="Important limitations"
                  note="Shared by the restaurant so you can decide before you travel."
                >
                  <div className="flex gap-3 rounded-xl border border-brand-sun/40 bg-brand-sun/5 p-4 md:p-5">
                    <Info
                      className="mt-0.5 h-5 w-5 shrink-0 text-foreground/70"
                      aria-hidden="true"
                    />
                    <p className="min-w-0 whitespace-pre-line break-words font-inter leading-relaxed text-foreground">
                      {limitations}
                    </p>
                  </div>
                </ProfileSection>
              )}

              {notes && (
                <ProfileSection title="What the restaurant wants families to know">
                  <figure className="flex gap-3 rounded-xl bg-background-subtle p-4 md:p-5">
                    <Quote
                      className="h-5 w-5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <figcaption className="min-w-0">
                      <p className="whitespace-pre-line break-words font-inter leading-relaxed text-foreground">
                        {notes}
                      </p>
                      <span className="mt-2 block font-inter text-sm text-muted-foreground">
                        {listing.name}, in their own words
                      </span>
                    </figcaption>
                  </figure>
                </ProfileSection>
              )}

              {/* Anything published that this page doesn't lay out explicitly,
                  so a newly added survey question still appears without
                  someone remembering to write a block for it. */}
              {extraFacets.length > 0 && (
                <ProfileSection title="Also shared">
                  <dl className="space-y-5">
                    {extraFacets.map((facet) => (
                      <div key={facet.questionId} className="min-w-0">
                        <dt className="flex items-center gap-1.5 font-poppins font-semibold text-foreground">
                          {facet.label}
                          {facet.explainer && (
                            <FacetExplainer
                              label={facet.label}
                              explainer={facet.explainer}
                            />
                          )}
                        </dt>
                        <dd className="mt-1.5">
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
                            <p className="break-words font-inter text-foreground">
                              {facet.values[0]}
                            </p>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </ProfileSection>
              )}

              {summary.length === 0 &&
                allergens.length === 0 &&
                steps.length === 0 &&
                !notes && (
                  <p className="font-inter text-muted-foreground">
                    This restaurant hasn't shared detailed allergy information yet.
                  </p>
                )}

              <ProgramDisclaimer />
            </div>

            <aside className="min-w-0 space-y-5">
              <Card>
                <CardContent className="space-y-4 p-5">
                  <h2 className="font-poppins font-semibold text-foreground">
                    Contact
                  </h2>
                  <p className="flex items-start gap-2 font-inter text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 break-words">{address}</span>
                  </p>
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

              {hasCoordinates && !mapFailed && (
                <Card className="overflow-hidden">
                  <iframe
                    title={`Map showing the location of ${listing.name}`}
                    className="h-56 w-full border-0 bg-muted"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    onError={() => setMapFailed(true)}
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

              {updatedLabel && (
                <Card>
                  <CardContent className="p-5">
                    <h2 className="font-poppins font-semibold text-foreground">
                      Information current as of
                    </h2>
                    <p className="mt-1 font-inter text-sm text-muted-foreground">
                      {updatedLabel}
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
