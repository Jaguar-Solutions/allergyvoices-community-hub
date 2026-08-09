import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  Eye,
  Gift,
  HeartHandshake,
  Search,
  Users,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageHeader, PageLayout, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgramDisclaimer } from "@/components/restaurants/ProgramDisclaimer";
import { LaunchRollout } from "@/components/restaurants/LaunchRollout";

const BENEFITS = [
  {
    icon: Gift,
    title: "Free listing",
    body: "There is no fee to participate, now or later. This is a community resource, not a paid placement.",
  },
  {
    icon: Search,
    title: "Increased visibility",
    body: "Families searching for places they can eat will find your restaurant in our public directory.",
  },
  {
    icon: HeartHandshake,
    title: "Show your commitment",
    body: "Share what you already do for guests with food allergies, in your own words.",
  },
  {
    icon: Users,
    title: "Reach allergy families",
    body: "Food allergy families are actively looking for restaurants willing to clearly explain their practices.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Complete the survey",
    body: "About 5–7 minutes on how your restaurant handles allergy requests today. Every question is optional except the basics, and there are no wrong answers.",
  },
  {
    step: "2",
    title: "We review your submission",
    body: "A person reads every submission before anything goes live. We are checking that it is clear and complete — not grading it, and not inspecting you.",
  },
  {
    step: "3",
    title: "We publish it with your permission",
    body: "Nothing appears publicly unless you said we could. If you asked us to check with you first, we will. Your contact details are never published.",
  },
  {
    step: "4",
    title: "Update it any time",
    body: "Practices change. Use the update link on your own listing whenever something is different, and the date on your profile moves with it.",
  },
];

const ProgramLanding = () => (
  <PageLayout>
    <SEOHead
      title="Restaurant Allergy Transparency Program"
      description="A free public directory of restaurants that voluntarily share how they handle food allergies. Not a certification, not an inspection — just transparency so families can make informed dining decisions."
    />
    <PageHeader
      eyebrow="For restaurants"
      title="Restaurant Allergy Transparency Program"
      intro="Help food allergy families make informed dining decisions while showcasing your restaurant's commitment to serving guests with food allergies."
      breadcrumbs={[{ label: "Restaurants" }]}
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/restaurants/participate">Participate</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#how-it-works">Learn more</a>
          </Button>
        </div>
      }
    />

    <Section>
      <Container width="default">
        <div className="max-w-2xl space-y-5 font-inter text-lg leading-relaxed text-foreground">
          <p>
            Allergy Voices is creating a free public directory of restaurants
            that voluntarily share information about how they handle food
            allergies.
          </p>
          <p className="font-medium">Participation is completely free.</p>
          <p>
            This is <strong>not</strong> a certification, an inspection, or a
            grade. We do not visit, test, score, or approve restaurants. We
            publish what a restaurant tells us about its own practices, in its
            own words, so families can ask better questions.
          </p>
        </div>
      </Container>
    </Section>

    <Section tone="subtle">
      <Container width="default">
        <h2 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
          What participating restaurants get
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title}>
              <Card className="h-full">
                <CardContent className="flex gap-4 p-6">
                  <benefit.icon
                    className="mt-0.5 h-6 w-6 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-poppins font-semibold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 font-inter text-sm leading-relaxed text-muted-foreground">
                      {benefit.body}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>

    <Section id="how-it-works">
      <Container width="default">
        <h2 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
          How it works
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <li key={item.step} className="space-y-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-poppins font-bold text-primary"
                aria-hidden="true"
              >
                {item.step}
              </span>
              <h3 className="font-poppins font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="font-inter text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>

    {/* Restaurant-facing only. This never appears on a public listing, and a
        family browsing the directory never encounters it. */}
    <Section tone="subtle">
      <Container width="default">
        <div className="rounded-2xl border border-border bg-background p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <BookOpenCheck
              className="h-8 w-8 shrink-0 text-secondary"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-poppins text-xl font-bold text-foreground md:text-2xl">
                Don't have an allergen menu? We can help you build one.
              </h2>
              <p className="mt-3 max-w-2xl font-inter leading-relaxed text-muted-foreground">
                An allergen menu lists which of your dishes contain which
                allergens, so families can check before they arrive and your
                staff have something to point to. We build them for a small fee
                that covers our time — ask us any time, or tick the box on the
                thank-you page after you submit.
              </p>
              <p className="mt-3 max-w-2xl font-inter text-sm leading-relaxed text-muted-foreground">
                <strong className="font-semibold text-foreground">
                  This never affects your listing.
                </strong>{" "}
                Taking part in the directory is free and always will be.
                Restaurants we've helped are listed exactly the same way as
                everyone else — no badge, no better placement, no difference at
                all.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>

    <LaunchRollout />

    <Section tone="primary-soft">
      <Container width="narrow">
        <div className="space-y-6 text-center">
          <Eye className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
            Ready to share what you do?
          </h2>
          <p className="font-inter leading-relaxed text-muted-foreground">
            The survey takes about 5–7 minutes. Participation and your public
            listing are completely free. Your answers save as you go, so you
            can stop and come back.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/restaurants/participate">
                Participate
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/restaurants/directory">Browse the directory</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>

    <Section spacing="sm">
      <Container width="narrow">
        <ProgramDisclaimer />
      </Container>
    </Section>
  </PageLayout>
);

export default ProgramLanding;
