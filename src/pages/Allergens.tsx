import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import {
  Container,
  PageHeader,
  PageLayout,
  Section,
} from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { ALLERGEN_LABELS, ALLERGEN_SLUGS, type Allergen } from "@/content/schemas";
import { getAllAllergenHubs } from "@/content";
import { ALLERGEN_TINT_BG } from "@/components/content/allergen-tints";
import { cn } from "@/lib/utils";

const Allergens = () => {
  const hubs = getAllAllergenHubs();
  const hubBySlug = new Map(hubs.map((h) => [h.slug, h]));

  return (
    <PageLayout>
      <SEOHead
        title="Allergen Hubs"
        description="One trusted, calm reference page per major food allergen: basics, hidden sources, label-reading tips, and the latest related research."
      />
      <PageHeader
        eyebrow="Allergen hubs"
        title="One trusted page per allergen"
        intro="Basics, hidden sources, label-reading shortcuts, and the latest related findings — one calm, focused page for each major allergen."
        breadcrumbs={[{ label: "Allergen Hubs" }]}
      />
      <Section>
        <Container width="wide">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ALLERGEN_SLUGS.map((slug: Allergen) => {
              const hub = hubBySlug.get(slug);
              const isPublished = hub && hub.status === "published";
              const tint = ALLERGEN_TINT_BG[slug];
              return (
                <li key={slug}>
                  <Link
                    to={`/allergens/${slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
                    aria-disabled={!isPublished}
                  >
                    <Card
                      className={cn(
                        "h-full overflow-hidden border-transparent transition-shadow",
                        tint,
                        isPublished ? "hover:shadow-md" : "opacity-70",
                      )}
                    >
                      <CardContent className="p-6 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="font-poppins font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {ALLERGEN_LABELS[slug]}
                          </h2>
                          {!isPublished && (
                            <span className="font-inter text-xs text-muted-foreground rounded-md bg-background/60 px-2 py-0.5">
                              Coming soon
                            </span>
                          )}
                        </div>
                        {isPublished ? (
                          <>
                            <p className="font-inter text-sm text-foreground/75 leading-relaxed line-clamp-3">
                              {hub.summary}
                            </p>
                            {/* These cards sit on warm allergen tints, where
                                the default primary blue falls just under AA. */}
                            <div className="text-primary-strong text-sm font-medium inline-flex items-center gap-1 pt-1">
                              Open hub
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            </div>
                          </>
                        ) : (
                          <p className="font-inter text-sm text-foreground/60">
                            Hub being written.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default Allergens;
