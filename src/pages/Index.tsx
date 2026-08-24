import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Heart,
  Leaf,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Container,
  Disclaimer,
  PageLayout,
  Section,
} from "@/components/layout";
import FoodAllergyInfographics from "@/components/FoodAllergyInfographics";
import NewsFeed from "@/components/NewsFeed";
import { ResourceCard } from "@/components/content/ResourceCard";
import { getPublishedResources } from "@/content/loader";
import { SurveyInvitation } from "@/components/restaurants/SurveyInvitation";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { LAUNCH_BADGE, LAUNCH_CITIES_PHRASE } from "@/config/launch";
import { useQuery } from "@tanstack/react-query";
import { fetchPublishedRestaurants } from "@/program/api";
import { useToast } from "@/hooks/use-toast";

const QUICK_LINKS = [
  {
    href: "/resources",
    title: "Family Resource Center",
    description: "Newly diagnosed guides, emergency planning, school forms, travel checklists.",
    Icon: Heart,
    tint: "bg-primary/10 text-primary",
  },
  {
    href: "/allergens",
    title: "Allergen Hubs",
    description: "One trusted page each for peanut, milk, egg, sesame, and more.",
    Icon: Leaf,
    tint: "bg-brand-spring/15 text-brand-spring",
  },
  {
    href: "/recalls",
    title: "Recalls & Alerts",
    description: "Allergen recalls pulled from FDA, USDA, Canada, and UK food safety feeds.",
    Icon: AlertTriangle,
    tint: "bg-accent/10 text-accent-strong",
  },
  {
    href: "/dining",
    title: "Dining Out",
    description: "Scripts, restaurant checklists, and red flags for safer eating out.",
    Icon: Utensils,
    tint: "bg-brand-sun/20 text-amber-700",
  },
  {
    href: "/schools-teens",
    title: "Schools & Teens",
    description: "504 plans, cafeteria templates, and an independence guide for teens.",
    Icon: GraduationCap,
    tint: "bg-brand-cyan/15 text-brand-cyan",
  },
];

/**
 * Four published guides for the homepage.
 *
 * Selected by slug from what is actually published, so a guide that is
 * unpublished or renamed drops out of the homepage rather than 404ing from
 * it.
 */
const FEATURED_SLUGS = [
  "newly-diagnosed",
  "dining-out-script",
  "school-forms-checklists",
  "travel-checklist",
];

const FEATURED_RESOURCES = FEATURED_SLUGS
  .map((slug) => getPublishedResources().find((r) => r.slug === slug))
  .filter((r): r is NonNullable<typeof r> => Boolean(r));

const Index = () => {
  // Cheap: the directory page already caches this query, so the homepage
  // shares the result rather than issuing a second request.
  const { data: listings } = useQuery({
    queryKey: ["published-restaurants"],
    queryFn: fetchPublishedRestaurants,
    retry: 1,
  });
  const hasListings = (listings?.length ?? 0) > 0;

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("subscribers").insert([{ email }]);
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already subscribed", description: "This email is already on our list!" });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        setEmail("");
        toast({ title: "Thanks for joining!", description: "Welcome to the AllergyVoices community." });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <SEOHead
        title="AllergyVoices — Every ingredient matters. Every voice counts."
        description="A calm, practical hub for food allergy families. Plain-language medical findings, recalls from official sources, and real-world resources for home, school, dining, and travel."
        keywords="food allergies, food allergy resources, allergen recalls, food allergy research, food allergy families, allergist, anaphylaxis"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://allergyvoices.com/#org",
              name: "AllergyVoices",
              url: "https://allergyvoices.com",
              logo: "https://allergyvoices.com/allergy-voices-logo.png",
              description:
                "A community-driven hub for food allergy families: research, recalls, and resources.",
            },
            {
              "@type": "WebSite",
              "@id": "https://allergyvoices.com/#website",
              url: "https://allergyvoices.com",
              name: "AllergyVoices",
              publisher: { "@id": "https://allergyvoices.com/#org" },
              inLanguage: "en-US",
            },
          ],
        }}
      />

      {/* Hero */}
      <Section spacing="lg" as="div" className="bg-brand-soft pt-28 md:pt-32 relative overflow-hidden">
        {/* Decorative glow accents pulled from the logo palette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 w-96 h-96 rounded-full bg-brand-coral/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-brand-cyan/10 blur-3xl"
        />
        <Container width="wide" className="relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              {/* Replaces a "calm, practical, family-first" chip that described
                  our tone. The scope of the directory is the thing a visitor
                  actually needs in the first second — nationwide in intent,
                  one region in practice today. */}
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-background/70 px-3 py-1 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" aria-hidden="true" />
                <span className="font-inter text-xs font-medium tracking-wide text-foreground/80">
                  {LAUNCH_BADGE}
                </span>
              </span>
              <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
                Every ingredient matters.{" "}
                <span className="text-gradient-brand">
                  Every voice counts.
                </span>
              </h1>
              <p className="font-inter text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                A calm, practical hub for food allergy families — plain-language
                research updates, recalls from official sources, and real-world
                tools for home, school, dining, and travel.
              </p>
              <p className="font-inter text-base text-muted-foreground leading-relaxed max-w-xl">
                We&apos;re also building a nationwide restaurant
                allergy-transparency directory, enrolling first in{" "}
                {LAUNCH_CITIES_PHRASE}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="font-poppins">
                  <Link to="/resources">Explore Family Resources</Link>
                </Button>
                {/* "Find Restaurants" promises listings that do not exist
                    before launch. Reverts automatically once one is
                    published — same source of truth as the directory. */}
                <Button asChild size="lg" variant="outline" className="font-poppins">
                  <Link to="/restaurants/directory">
                    {hasListings ? "Find Restaurants" : "Explore the Directory Launch"}
                  </Link>
                </Button>
              </div>

              {/* The other audience that lands here. Given its own bordered
                  card so it survives a glance, but kept visually secondary to
                  the family message above: no fill, no brand color, and it
                  sits below the primary actions. */}
              <Link
                to="/restaurants/participate"
                className="group flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3 backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-md"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-coral/15"
                  aria-hidden="true"
                >
                  <Utensils className="h-4 w-4 text-accent-strong" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-poppins text-sm font-semibold text-foreground">
                    Run a restaurant?
                  </span>
                  <span className="block font-inter text-sm text-muted-foreground">
                    Share your restaurant&apos;s practices. It&apos;s free,
                    anywhere in the U.S.
                  </span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
            <div className="relative">
              <FoodAllergyInfographics />
            </div>
          </div>
        </Container>
      </Section>

      {/* Pulled up over the hero's lower edge so it reads as part of the
          opening moment rather than a separate band further down the page. */}
      <SurveyInvitation className="-mt-8 md:-mt-12 pb-14 md:pb-20" />

      {/* Quick Links */}
      <Section>
        <Container width="wide">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
            <div>
              <p className="font-inter text-sm font-medium uppercase tracking-wide text-primary">
                Quick links
              </p>
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mt-1">
                Jump to what you need
              </h2>
            </div>
            <p className="font-inter text-muted-foreground text-sm md:max-w-md">
              Everything is organized by who it's for and where you'll use it — home, school, dining, travel, or shopping.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map(({ href, title, description, Icon, tint }) => (
              <li key={href}>
                <Link
                  to={href}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
                >
                  <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                    <CardContent className="p-6 space-y-3">
                      <div className={`w-11 h-11 rounded-xl ${tint} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <h3 className="font-poppins font-semibold text-lg text-foreground">
                        {title}
                      </h3>
                      <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                      <div className="text-primary text-sm font-medium inline-flex items-center gap-1 pt-1">
                        Open
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Latest news */}
      <Section tone="subtle" id="news">
        <Container width="wide">
          <div className="flex items-end justify-between gap-3 mb-8">
            <div>
              <p className="font-inter text-sm font-medium uppercase tracking-wide text-primary">
                Latest updates
              </p>
              {/* Named for what it actually contains. The heading used to say
                  "What's new in food allergy" above a list of Allergic Living
                  stories, beside a link to "All findings" — which are our own
                  source-based summaries, not these. Two different things
                  under one label. */}
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mt-1">
                News from trusted sources
              </h2>
              <p className="mt-2 max-w-2xl font-inter text-sm leading-relaxed text-muted-foreground">
                Reporting from Allergic Living. These open on their site —
                they aren't written or reviewed by AllergyVoices.
              </p>
            </div>
          </div>
          <NewsFeed />

          {/* Our own writing, kept distinct and pointed at deliberately.
              External reporting is more frequent and stays at the top for
              freshness; this is the shorter, slower shelf beside it. */}
          <div className="mt-10 rounded-2xl border border-border bg-background p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-poppins text-lg font-bold text-foreground">
                  AllergyVoices findings
                </h3>
                <p className="mt-1 font-inter text-sm leading-relaxed text-muted-foreground">
                  Plain-language summaries of published research and regulatory
                  decisions, each linking to its original source.
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link to="/findings">
                  Read the findings
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Was a "Coming soon" panel promising printable chef cards,
          school-form templates, a birthday-party game plan and a travel
          checklist. Three of those four have been published for a while, so
          the panel was advertising work already done as though it were not —
          and asking people to subscribe to wait for it. These are the real
          ones. */}
      <Section>
        <Container width="wide">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div>
              <p className="font-inter text-sm font-medium uppercase tracking-wide text-primary">
                Practical tools
              </p>
              <h2 className="mt-1 font-poppins text-2xl font-bold text-foreground md:text-3xl">
                Guides and checklists you can use today
              </h2>
            </div>
            <Link
              to="/resources"
              className="hidden items-center gap-1 font-inter text-sm font-medium text-primary hover:underline sm:inline-flex"
            >
              All resources <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURED_RESOURCES.map((resource) => (
              <li key={resource.slug} className="min-w-0">
                <ResourceCard resource={resource} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Email signup */}
      <Section id="join" tone="primary-soft">
        <Container width="narrow" className="text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-3 text-foreground">
            Your story can make a difference.
          </h2>
          <p className="font-inter text-lg text-muted-foreground mb-8">
            Join families helping each other navigate food allergies. No spam — just useful updates.
          </p>

          {isSuccess ? (
            <div className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="flex items-center justify-center w-14 h-14 bg-secondary/10 rounded-full mx-auto mb-4">
                <Heart className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-2 text-foreground">
                Thanks for joining
              </h3>
              <p className="font-inter text-muted-foreground mb-4">
                You'll receive new findings, recall alerts, and resource drops as they're published.
              </p>
              <Button variant="outline" onClick={() => setIsSuccess(false)} className="font-poppins">
                Sign up another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEmailSignup} className="max-w-md mx-auto">
              <label htmlFor="join-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  id="join-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 font-inter"
                  required
                />
                <Button type="submit" size="lg" disabled={isSubmitting} className="font-poppins">
                  {isSubmitting ? "Joining..." : "Join the Voices"}
                </Button>
              </div>
            </form>
          )}

          <p className="font-inter text-sm text-muted-foreground mt-8">
            Questions?{" "}
            <a href="mailto:info@allergyvoices.com" className="text-primary hover:underline font-medium">
              info@allergyvoices.com
            </a>
          </p>
        </Container>
      </Section>

      {/* Trust + Disclaimer */}
      <Section spacing="sm">
        <Container width="narrow">
          <Disclaimer kind="medical" />
        </Container>
      </Section>
    </PageLayout>
  );
};

export default Index;
