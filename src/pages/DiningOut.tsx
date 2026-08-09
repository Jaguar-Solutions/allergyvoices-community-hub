import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, ExternalLink, Utensils } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import {
  Container,
  Disclaimer,
  PageHeader,
  PageLayout,
  Section,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResourceCard } from "@/components/content/ResourceCard";
import { getResourcesBySetting } from "@/content";

const EXTERNAL_RESOURCES = [
  {
    name: "FARE — Dining Out With Food Allergies",
    url: "https://www.foodallergy.org/resources/dining-out",
    description: "Family-tested checklists, chef cards, and restaurant scripts.",
  },
  {
    name: "AllergyEats",
    url: "https://www.allergyeats.com/",
    description: "Crowd-rated directory of allergy-aware restaurants.",
  },
];

const DiningOut = () => {
  const restaurantResources = getResourcesBySetting("restaurant");

  return (
    <PageLayout>
      <SEOHead
        title="Dining Out"
        description="Restaurant scripts, the questions to ask before you order, the red flags to walk away from, and how to talk to a manager or chef about food allergies."
      />
      <PageHeader
        eyebrow="Dining out"
        title="Eating out with food allergies, with a script"
        intro="The script, the questions, the red flags, and how to build a list of restaurants you trust. Calm, repeatable, and family-tested."
        breadcrumbs={[{ label: "Dining Out" }]}
      />

      <Section>
        <Container width="default">
          {/* Featured: dining-out script */}
          <Link
            to="/resources/dining-out-script"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
          >
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6 md:p-8 space-y-3">
                <p className="font-inter text-sm font-medium uppercase tracking-wide text-primary">
                  Featured guide
                </p>
                <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors">
                  Dining out: the script, the questions, and the red flags
                </h2>
                <p className="font-inter text-muted-foreground leading-relaxed">
                  The whole playbook in one page — from "how to call
                  ahead" through "how to talk to the chef" to "what to do
                  when something goes wrong."
                </p>
                <span className="text-primary text-sm font-medium inline-flex items-center gap-1">
                  Read the full guide
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </Container>
      </Section>

      {/* Other restaurant-tagged resources */}
      {restaurantResources.length > 1 && (
        <Section tone="subtle">
          <Container width="default">
            <h2 className="font-poppins font-bold text-xl md:text-2xl text-foreground mb-6">
              Related guides
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {restaurantResources
                .filter((r) => r.slug !== "dining-out-script")
                .map((r) => (
                  <li key={r.slug}>
                    <ResourceCard resource={r} />
                  </li>
                ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* Restaurant-friendly explanation page */}
      <Section>
        <Container width="default">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-start gap-3 mb-4">
              <Utensils className="w-6 h-6 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <h2 className="font-poppins font-bold text-xl md:text-2xl text-foreground">
                  Share your restaurant's practices
                </h2>
                <p className="font-inter text-muted-foreground mt-1">
                  A short, plain-language explanation aimed at restaurant owners and managers.
                </p>
              </div>
            </div>

            <div className="space-y-3 font-inter text-foreground/85 leading-relaxed">
              <p>
                Food allergy families want to eat at your restaurant. We're a real
                slice of your customer base — over 32 million Americans live
                with food allergies, and we eat out with friends and family the
                same as everyone else.
              </p>
              <p>
                What we ask for is simple:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>An ingredient list we can check, on request</li>
                <li>A staff who'll bring questions to the chef instead of guessing</li>
                <li>Honesty when the kitchen can't safely accommodate an allergy — "we can't do that today" beats "you'll be fine"</li>
                <li>Awareness of cross-contact (shared fryers, grills, woks, scoops)</li>
              </ul>
              <p>
                Get those right and you'll have loyal customers who tell their
                whole community about you.
              </p>
            </div>

            <div className="mt-6">
              <a
                href="mailto:info@allergyvoices.com"
                className="inline-flex items-center gap-1.5 font-poppins text-primary hover:underline"
              >
                Talk to us about partnering
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* Replaces a "AllergyVoices Approved" coming-soon badge that promised
          community verification against "our standards". That directly
          contradicted every restaurant page, which says we do not inspect,
          certify, grade or approve — and a badge is exactly the thing a family
          would rely on hardest. What we actually publish is below. */}
      <Section tone="subtle">
        <Container width="default">
          <div className="rounded-2xl border border-border bg-background p-6 md:p-8">
            <div className="flex items-start gap-3">
              <BookOpenCheck
                className="mt-1 h-6 w-6 flex-shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h2 className="font-poppins text-xl font-bold text-foreground md:text-2xl">
                  Restaurant Allergy Transparency Directory
                </h2>
                <p className="mt-2 max-w-2xl font-inter leading-relaxed text-muted-foreground">
                  See what participating restaurants report about staff
                  training, ingredient information, cross-contact practices and
                  allergy-request procedures. Listings show when the restaurant
                  last confirmed its information.
                </p>

                <p className="mt-4 max-w-2xl font-inter text-sm leading-relaxed text-muted-foreground">
                  This is not a rating, a review, a certification or an
                  inspection, and it is never a guarantee of safety. Always
                  discuss your specific needs with restaurant staff before
                  ordering.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link to="/restaurants/directory">Find restaurants</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/restaurants">Share your restaurant's practices</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* External resources */}
      <Section>
        <Container width="default">
          <h2 className="font-poppins font-bold text-xl md:text-2xl text-foreground mb-4">
            Trusted external resources
          </h2>
          <ul className="space-y-3">
            {EXTERNAL_RESOURCES.map((r) => (
              <li key={r.url}>
                <Card>
                  <CardContent className="p-5">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-poppins font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {r.name}
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                    <p className="font-inter text-sm text-muted-foreground mt-1">
                      {r.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <Disclaimer kind="medical" className="mt-10" />
        </Container>
      </Section>
    </PageLayout>
  );
};

export default DiningOut;
