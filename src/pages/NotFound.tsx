import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Compass } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageLayout, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";

/** Where someone who hit a dead link most likely wanted to go. */
const SUGGESTIONS = [
  { label: "Latest findings", href: "/findings" },
  { label: "Recalls & alerts", href: "/recalls" },
  { label: "Family resources", href: "/resources" },
  { label: "Allergen hubs", href: "/allergens" },
  { label: "Restaurant directory", href: "/restaurants/directory" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // A missing page is expected traffic (old links, typos), not an app
    // fault — logged as a warning so real errors stay visible.
    console.warn("404: no route for", location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout>
      <SEOHead
        title="Page not found"
        description="That page doesn't exist. Here's where to find what you were looking for."
      />
      <Section className="pt-28 md:pt-32">
        <Container width="narrow">
          <div className="text-center">
            <Compass className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
            <p className="mt-6 font-inter text-sm font-medium uppercase tracking-wide text-primary">
              Page not found
            </p>
            <h1 className="mt-2 font-poppins text-3xl font-bold text-foreground md:text-4xl">
              We couldn't find that page
            </h1>
            <p className="mx-auto mt-3 max-w-xl font-inter leading-relaxed text-muted-foreground">
              The link may be out of date, or the page may have moved. Nothing
              is wrong on your end.
            </p>

            <div className="mt-8">
              <p className="font-poppins font-semibold text-foreground">
                Try one of these
              </p>
              <ul className="mt-3 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-border bg-background px-4 py-2 font-inter text-sm text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild size="lg" className="mt-8">
              <Link to="/">Back to the home page</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default NotFound;
