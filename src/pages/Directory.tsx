import { ExternalLink, MapPin, Mail } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import {
  Container,
  Disclaimer,
  PageHeader,
  PageLayout,
  Section,
} from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

interface NationalResource {
  name: string;
  url: string;
  description: string;
  category: string;
}

const NATIONAL_RESOURCES: NationalResource[] = [
  {
    name: "ACAAI Find an Allergist",
    url: "https://acaai.org/find-an-allergist/",
    description:
      "Search by zip code for board-certified allergists, immunologists, and food allergy specialists.",
    category: "Allergists",
  },
  {
    name: "FARE — Find Care",
    url: "https://www.foodallergy.org/resources/finding-allergist",
    description:
      "FARE's directory of allergists experienced with food allergy management.",
    category: "Allergists",
  },
  {
    name: "Academy of Nutrition and Dietetics",
    url: "https://www.eatright.org/find-a-nutrition-expert",
    description:
      "Locate registered dietitians who specialize in food allergy and pediatric nutrition.",
    category: "Dietitians",
  },
  {
    name: "Kids With Food Allergies — Support Groups",
    url: "https://kidswithfoodallergies.org/community/local-support-groups/",
    description:
      "Family support groups by region. Many meet monthly in person or online.",
    category: "Support groups",
  },
  {
    name: "FARE — Walk for Food Allergy",
    url: "https://www.foodallergy.org/our-initiatives/awareness-campaigns/walk",
    description:
      "Annual community walks across the U.S. — a low-barrier way to meet other allergy families locally.",
    category: "Community",
  },
  {
    name: "FPIES Foundation",
    url: "https://fpiesfoundation.org/",
    description:
      "Resources for families managing FPIES (food protein-induced enterocolitis syndrome), a non-IgE allergic condition.",
    category: "Specialty",
  },
  {
    name: "Allergy & Asthma Network — Find a camp",
    url: "https://allergyasthmanetwork.org/news/find-an-allergy-asthma-camp/",
    description:
      "Summer camps and programs equipped to handle food allergies and asthma.",
    category: "Camps",
  },
  {
    name: "AllergyEats",
    url: "https://www.allergyeats.com/",
    description:
      "Crowd-rated directory of allergy-aware restaurants and bakeries.",
    category: "Restaurants & bakeries",
  },
];

const CATEGORIES = Array.from(new Set(NATIONAL_RESOURCES.map((r) => r.category)));

const Directory = () => (
  <PageLayout>
    <SEOHead
      title="Local Resources Directory"
      description="National directories for allergists, dietitians, support groups, and camps — plus a growing list of local resources suggested by families."
    />
    <PageHeader
      eyebrow="Local resources"
      title="Allergists, dietitians, camps, and support"
      intro="We start with the best national directories, then add curated local listings as the community grows. Honest about what we cover and what we don't."
      breadcrumbs={[{ label: "Local Resources" }]}
    />

    {/* National resources, grouped by category */}
    <Section>
      <Container width="default">
        <div className="mb-8">
          <p className="font-inter text-sm font-medium uppercase tracking-wide text-primary mb-1">
            National resources
          </p>
          <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground">
            Trusted national directories
          </h2>
          <p className="font-inter text-muted-foreground mt-2 max-w-2xl">
            Established organizations with deep, current data. We link out so
            you always get the most accurate information.
          </p>
        </div>

        <div className="space-y-10">
          {CATEGORIES.map((category) => {
            const items = NATIONAL_RESOURCES.filter((r) => r.category === category);
            return (
              <div key={category}>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-3">
                  {category}
                </h3>
                <ul className="grid gap-3 md:grid-cols-2">
                  {items.map((r) => (
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
              </div>
            );
          })}
        </div>
      </Container>
    </Section>

    {/* Local listings — coming soon, honest about it */}
    <Section tone="subtle">
      <Container width="default">
        <div className="rounded-2xl border-2 border-dashed border-border bg-background p-6 md:p-8">
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <p className="font-inter text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Local listings
              </p>
              <h2 className="font-poppins font-bold text-xl md:text-2xl text-foreground mt-1">
                Curated state-by-state, growing as the community grows
              </h2>
              <p className="font-inter text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                We're building the local directory the slow way: every
                listing is verified, every entry has a "last checked"
                date, and we publish state by state instead of pretending
                we cover everywhere on day one.
              </p>
              <p className="font-inter text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                If a listing needs adding or correcting, send it our way.
                Verified additions are usually live within a week.
              </p>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:info@allergyvoices.com"
                  className="inline-flex items-center gap-1.5 font-inter text-sm font-medium text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  Suggest a local listing
                </a>
                <a
                  href="mailto:info@allergyvoices.com?subject=Report a listing change"
                  className="inline-flex items-center gap-1.5 font-inter text-sm font-medium text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  Report a change
                </a>
              </div>
            </div>
          </div>
        </div>

        <Disclaimer kind="community" className="mt-8" />
      </Container>
    </Section>
  </PageLayout>
);

export default Directory;
