import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, GraduationCap } from "lucide-react";
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
import {
  getPublishedResources,
} from "@/content";
import type { Resource } from "@/content/schemas";

const EXTERNAL_RESOURCES = [
  {
    name: "FARE — Back to School",
    url: "https://www.foodallergy.org/resources/back-school",
    description: "Practical school-year planning from the leading U.S. food allergy nonprofit.",
  },
  {
    name: "Kids With Food Allergies — Managing at School",
    url: "https://kidswithfoodallergies.org/living-with-food-allergies/managing-food-allergies-at-school/",
    description: "Sample 504 plans, school templates, and parent guides.",
  },
  {
    name: "AAAAI — Self-carry of epinephrine",
    url: "https://www.aaaai.org/conditions-treatments/library/allergy-library/self-carry-of-epinephrine",
    description: "Clinical guidance on self-carry, helpful for school accommodation conversations.",
  },
];

function pickResources(all: Resource[]): Resource[] {
  // Show resources tagged for school setting OR for school-age / teen audiences.
  return all.filter((r) =>
    r.setting.includes("school") ||
    r.age_stage.some((s) => s === "school-age" || s === "teen"),
  );
}

const SchoolTeens = () => {
  const all = getPublishedResources();
  const relevant = pickResources(all);

  return (
    <PageLayout>
      <SEOHead
        title="Schools & Teens"
        description="Plans, forms, communication templates, and an independence guide for students and parents managing food allergies at school and beyond."
      />
      <PageHeader
        eyebrow="Schools & teens"
        title="From kindergarten to college, with a calm plan"
        intro="A hub for school accommodations (504/IHP), classroom communication, teen self-management, and the long handover toward independence."
        breadcrumbs={[{ label: "Schools & Teens" }]}
      />

      <Section>
        <Container width="default">
          <div className="mb-8">
            <p className="font-inter text-sm font-medium uppercase tracking-wide text-primary mb-1">
              Featured guides
            </p>
            <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground">
              Practical playbooks for school and teen life
            </h2>
          </div>

          {relevant.length === 0 ? (
            <p className="font-inter text-muted-foreground">More guides coming soon.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {relevant.map((r) => (
                <li key={r.slug}>
                  <ResourceCard resource={r} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      <Section tone="subtle">
        <Container width="default">
          <div className="mb-6 flex items-start gap-3">
            <GraduationCap className="w-6 h-6 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h2 className="font-poppins font-bold text-xl md:text-2xl text-foreground">
                The teen-to-adult handover
              </h2>
              <p className="font-inter text-muted-foreground mt-1 max-w-2xl">
                Most families don't go from "parent manages" to "teen
                manages" overnight. The transition usually unfolds piece
                by piece across middle school, high school, and college.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              to="/resources/teen-independence"
              className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h3 className="font-poppins font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                Teens: stepping into your own allergy management
              </h3>
              <p className="font-inter text-sm text-muted-foreground mt-2">
                Self-carry, friends, dating, parties, mental health, and
                the slow handover. For teens, written for teens.
              </p>
              <span className="text-primary text-sm font-medium inline-flex items-center gap-1 mt-3">
                Read <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </Link>

            <Link
              to="/resources/college-dining"
              className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h3 className="font-poppins font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                College dining: dorms, dining halls, and disclosure
              </h3>
              <p className="font-inter text-sm text-muted-foreground mt-2">
                Disability accommodations, dining-hall navigation,
                roommate conversations, parties, Greek life, and the
                end-of-year debrief.
              </p>
              <span className="text-primary text-sm font-medium inline-flex items-center gap-1 mt-3">
                Read <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="default">
          <h2 className="font-poppins font-bold text-xl md:text-2xl text-foreground mb-4">
            Trusted external resources
          </h2>
          <p className="font-inter text-muted-foreground mb-6 max-w-2xl">
            Established nonprofits and clinical organizations with deep
            school-resource libraries. We link out so you can use the
            originals.
          </p>
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

export default SchoolTeens;
