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
import { SurveyInvitation } from "@/components/restaurants/SurveyInvitation";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
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

const Index = () => {
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
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-background/70 px-3 py-1 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral" aria-hidden="true" />
                <span className="font-inter text-xs font-medium uppercase tracking-wide text-foreground/80">
                  Calm, practical, family-first
                </span>
              </span>
              <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
                Every ingredient matters.{" "}
                <span className="bg-gradient-to-r from-brand-cyan to-brand-coral bg-clip-text text-transparent">
                  Every voice counts.
                </span>
              </h1>
              <p className="font-inter text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                A calm, practical hub for food allergy families. Plain-language
                research updates, recalls from official sources, and real-world
                tools for home, school, dining, and travel.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="font-poppins">
                  <Link to="/resources">Start with the Resource Center</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="font-poppins">
                  <Link to="/findings">See Latest Findings</Link>
                </Button>
              </div>

              {/* The other audience that lands here. Given its own bordered
                  card so it survives a glance, but kept visually secondary to
                  the family message above: no fill, no brand colour, and it
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
                    Share how you handle food allergies. It's free.
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
              Everything is organized by who it's for and where you'll use it &mdash; home, school, dining, travel, or shopping.
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
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mt-1">
                What's new in food allergy
              </h2>
            </div>
            <Link
              to="/findings"
              className="hidden sm:inline-flex items-center gap-1 font-inter text-sm font-medium text-primary hover:underline"
            >
              All findings <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <NewsFeed />
        </Container>
      </Section>

      {/* Featured tools placeholder */}
      <Section>
        <Container width="wide">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-cyan/5 via-background to-brand-coral/5 p-8 md:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-sun/10 blur-3xl"
            />
            <div className="relative flex items-start gap-4">
              <div className="rounded-xl bg-brand-sun/20 p-2.5">
                <BookOpen className="w-6 h-6 text-amber-700" aria-hidden="true" />
              </div>
              <div>
                <p className="font-inter text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Coming soon
                </p>
                <h2 className="font-poppins font-semibold text-xl md:text-2xl text-foreground mt-1">
                  Featured tools &amp; checklists
                </h2>
                <p className="font-inter text-sm md:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                  Printable chef cards, school-form templates, a birthday-party
                  game plan, and a travel checklist. Subscribe below to get
                  them as they're published.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Email signup */}
      <Section id="join" tone="primary-soft">
        <Container width="narrow" className="text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-3 text-foreground">
            Your story can make a difference.
          </h2>
          <p className="font-inter text-lg text-muted-foreground mb-8">
            Join families helping each other navigate food allergies. No spam &mdash; just useful updates.
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
