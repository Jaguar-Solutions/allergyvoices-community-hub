import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, ShieldCheck, Utensils } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import {
  Container,
  Disclaimer,
  PageHeader,
  PageLayout,
  Section,
} from "@/components/layout";
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
                  The whole playbook in one page &mdash; from "how to call
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
                  Are you a restaurant?
                </h2>
                <p className="font-inter text-muted-foreground mt-1">
                  A short, plain-language explanation aimed at restaurant owners and managers.
                </p>
              </div>
            </div>

            <div className="space-y-3 font-inter text-foreground/85 leading-relaxed">
              <p>
                Food allergy families want to eat at your restaurant. We're a real
                slice of your customer base &mdash; over 32 million Americans live
                with food allergies, and we eat out with friends and family the
                same as everyone else.
              </p>
              <p>
                What we ask for is simple:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>An ingredient list we can check, on request</li>
                <li>A staff who'll bring questions to the chef instead of guessing</li>
                <li>Honesty when the kitchen can't safely accommodate an allergy &mdash; "we can't do that today" beats "you'll be fine"</li>
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

      {/* AllergyVoices Approved badge concept (placeholder) */}
      <Section tone="subtle">
        <Container width="default">
          <div className="rounded-2xl border-2 border-dashed border-border p-6 md:p-8 bg-background">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="font-inter text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Coming soon
                </p>
                <h2 className="font-poppins font-bold text-xl md:text-2xl text-foreground mt-1">
                  AllergyVoices Approved
                </h2>
                <p className="font-inter text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                  A community-vetted badge for restaurants that consistently
                  meet our standards: written allergen menus, trained staff,
                  cross-contact awareness, and a manager or chef willing to
                  talk through every order. Restaurants apply, families
                  verify, and listings include the date of last verification.
                </p>
                <p className="font-inter text-sm text-muted-foreground mt-4">
                  We're shaping the criteria with families and restaurant
                  partners. Interested in being one of the first?{" "}
                  <a
                    href="mailto:info@allergyvoices.com"
                    className="text-primary hover:underline font-medium"
                  >
                    info@allergyvoices.com
                  </a>
                </p>
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
