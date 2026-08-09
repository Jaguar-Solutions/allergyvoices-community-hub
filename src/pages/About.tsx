import { Link } from "react-router-dom";
import { HeartHandshake, Megaphone, Users, Utensils } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageHeader, PageLayout, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";

/**
 * The page people read before deciding whether to trust the organization, so
 * it should look like the rest of the site rather than a stray document. It
 * previously rendered its own <main> without PageLayout, which meant no
 * footer, no skip link, and no SEO metadata, and set every paragraph in muted
 * grey.
 */

const COMMITMENTS = [
  {
    Icon: Users,
    title: "Sharing knowledge and stories",
    body: "What one family learns the hard way should not have to be learned again by the next.",
  },
  {
    Icon: HeartHandshake,
    title: "Supporting families and caregivers",
    body: "Practical help for the everyday work of managing an allergy, not just the emergencies.",
  },
  {
    Icon: Utensils,
    title: "Encouraging allergy-friendly businesses",
    body: "Restaurants that are willing to be open about how they handle allergies deserve to be found.",
  },
  {
    Icon: Megaphone,
    title: "Advocating for stronger laws",
    body: "Pushing at the state and national level for real transparency and allergy safety requirements.",
  },
];

const About = () => (
  <PageLayout>
    <SEOHead
      title="About AllergyVoices"
      description="AllergyVoices began with one family's search for safe places to eat. It is now a community effort to make dining, shopping, and living with food allergies safer and more inclusive."
    />
    <PageHeader
      eyebrow="About"
      title="Raising our voices so every menu considers food allergies"
      intro="AllergyVoices began with one family's struggle to find safe places to eat with their child who has food allergies."
      breadcrumbs={[{ label: "About" }]}
    />

    <Section>
      <Container width="narrow">
        <div className="space-y-6 font-inter text-lg leading-relaxed text-foreground">
          <p>
            What started as a personal search for clarity has grown into a
            community-driven effort to make life safer, easier, and more
            inclusive for all allergy sufferers and caregivers.
          </p>
          <p className="border-l-4 border-primary/40 pl-5 font-poppins text-xl font-semibold leading-snug text-foreground md:text-2xl">
            Our mission is simple: raise our voices so every menu, label, and
            decision considers people with food allergies.
          </p>
        </div>
      </Container>
    </Section>

    <Section tone="subtle">
      <Container width="default">
        <h2 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
          Real change happens when we work together
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {COMMITMENTS.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="flex gap-4 rounded-2xl border border-border bg-background p-6"
            >
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <h3 className="font-poppins font-semibold text-foreground">{title}</h3>
                <p className="mt-1 font-inter text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>

    <Section>
      <Container width="narrow">
        <h2 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
          More than a directory
        </h2>
        <div className="mt-5 space-y-6 font-inter text-lg leading-relaxed text-foreground">
          <p>
            From asking restaurants to publish clear allergen listings, to
            holding food companies accountable for recipe changes, to pushing
            for mandatory allergy-friendly practices, we aim to ensure no one
            with food allergies is left out of the decision-making process.
          </p>
          <p>
            This initiative belongs to the community. Every caregiver, teen,
            adult, and ally has a voice that can drive change. Your stories,
            suggestions, and participation are not just welcome. They are what
            make AllergyVoices possible.
          </p>
        </div>
      </Container>
    </Section>

    {/* The trust section. Someone deciding whether to believe the restaurant
        directory needs to know who is behind it and what we do not claim to
        be — stated plainly, and claiming no status the project does not
        actually hold. */}
    <Section tone="subtle">
      <Container width="narrow">
        <h2 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
          Who we are
        </h2>
        <div className="mt-5 space-y-6 font-inter text-lg leading-relaxed text-foreground">
          <p>
            AllergyVoices is a family-led food allergy advocacy initiative
            building a nationwide restaurant transparency directory, launching first in the Triangle region of North Carolina. We’re building a free
            restaurant transparency directory to help families ask better
            questions, and to help restaurants explain the allergy practices
            they already have.
          </p>
          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="font-poppins font-semibold text-foreground">
              What we are not
            </h3>
            <ul className="mt-3 space-y-2 font-inter text-base leading-relaxed text-muted-foreground">
              <li>
                We are not a medical organization, and nothing here is medical
                advice.
              </li>
              <li>
                We do not certify, inspect, grade, rate, or approve
                restaurants, and we never call a restaurant “safe.”
              </li>
              <li>
                We are not a government agency and have no regulatory
                authority.
              </li>
              <li>
                Restaurants are never charged to take part or to be listed.
              </li>
            </ul>
          </div>
          <p>
            Questions, corrections, or something we got wrong?{" "}
            <a
              href="mailto:info@allergyvoices.com"
              className="text-primary underline-offset-2 hover:underline"
            >
              info@allergyvoices.com
            </a>
            . We answer every message.
          </p>
        </div>
      </Container>
    </Section>

    {/* Linked from the footer as "Editorial Policy". The anchor has to exist
        here or that link lands at the top of the page with nothing to show. */}
    <Section id="editorial">
      <Container width="narrow">
        <h2 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
          Editorial policy
        </h2>
        <div className="mt-5 space-y-6 font-inter text-lg leading-relaxed text-foreground">
          <p>
            Medical findings are source-based summaries of published research,
            regulatory decisions and clinical guidance. Every article links to
            the original so you can read it yourself, and states its
            publication and last-reviewed dates.
          </p>
          <p>
            We do more than restate a study. Articles explain what a finding
            means in practice and suggest questions worth raising with your
            allergist — that explanation is editorial, and it is kept visibly
            separate from the source material rather than blended into it. What
            we do not do is tell any individual reader what to do about their
            own allergy; that conversation belongs with your clinician.
          </p>
          <p>
            Articles are prepared by the AllergyVoices editorial team and are
            not independently medically reviewed. We do not employ a clinical
            reviewer, and we will not imply one by naming a team as though it
            were a person. If that changes, the reviewer will be named.
          </p>
          <p>
            Statistics carry their source and the year the data was collected,
            which is not always the year it was published. If we cannot
            attribute a figure to a named source, we remove it rather than
            publish it.
          </p>
          <p>
            Restaurant listings are written by the restaurants themselves. We
            check submissions for clarity and completeness before publishing,
            with permission, and we do not edit a restaurant&rsquo;s
            description of its own practices to make it sound better or worse.
          </p>
        </div>
      </Container>
    </Section>

    <Section tone="primary-soft">
      <Container width="narrow">
        <div className="space-y-6 text-center">
          <h2 className="font-poppins text-2xl font-bold text-foreground md:text-3xl">
            Together, we can make it safer
          </h2>
          <p className="mx-auto max-w-xl font-inter leading-relaxed text-muted-foreground">
            Dining, shopping, and living with food allergies should be safer and
            more inclusive for everyone. Here is where to start.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/resources">Browse the resource center</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/restaurants">Bring a restaurant on board</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  </PageLayout>
);

export default About;
