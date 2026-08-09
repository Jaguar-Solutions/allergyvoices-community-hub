import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CloudOff } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageLayout, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ProgramDisclaimer } from "@/components/restaurants/ProgramDisclaimer";
import { OfflineBanner } from "@/components/restaurants/OfflineBanner";
import { ResourceOptIn } from "@/components/restaurants/ResourceOptIn";
import { SUBMITTED_ID_KEY } from "./Survey";

const Submitted = () => {
  const [params] = useSearchParams();
  const savedOffline = params.get("saved") === "offline";
  const declinedPublication = params.get("consent") === "no";

  // Read once on mount, then cleared: the opt-in belongs to the submission
  // that just happened, not to whoever lands on this URL next.
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const id = sessionStorage.getItem(SUBMITTED_ID_KEY);
      if (id) {
        setRestaurantId(id);
        sessionStorage.removeItem(SUBMITTED_ID_KEY);
      }
    } catch {
      // Storage unavailable; the opt-in is simply not offered.
    }
  }, []);

  return (
    <PageLayout>
      <SEOHead
        title="Thank you for participating"
        description="Your restaurant's information has been received and will be reviewed before appearing in the Allergy Voices directory."
      />

      <Section className="pt-28 md:pt-32">
        <Container width="narrow">
          <div className="space-y-6 text-center">
            {savedOffline ? (
              <CloudOff className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mx-auto h-12 w-12 text-secondary" aria-hidden="true" />
            )}

            <h1 className="font-poppins text-3xl font-bold text-foreground md:text-4xl">
              Thank you for participating.
            </h1>

            {savedOffline ? (
              <>
                <p className="font-inter text-lg leading-relaxed text-muted-foreground">
                  This survey is saved on this device and will send itself as
                  soon as you have a connection.
                </p>
                <p className="font-inter leading-relaxed text-muted-foreground">
                  You can close the app, keep collecting more restaurants, or
                  check what's waiting to send at any time. Nothing is lost.
                </p>
              </>
            ) : (
              <>
                <p className="font-inter text-lg leading-relaxed text-muted-foreground">
                  {declinedPublication
                    ? "You asked us not to publish your responses, so your restaurant will not appear in the public directory. We've kept your answers on file and nothing will be listed."
                    : "Your information will be reviewed before appearing in the public directory."}
                </p>
                <p className="font-inter leading-relaxed text-muted-foreground">
                  {declinedPublication
                    ? "If you change your mind, reply to the confirmation email and we'll add your listing."
                    : "Participation does not imply certification or endorsement."}
                </p>
                <p className="font-inter leading-relaxed text-muted-foreground">
                  We sent a confirmation to the contact email you provided. If
                  anything needs correcting, reply to that email and we'll
                  update your submission.
                </p>
              </>
            )}

            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/restaurants/participate">Add another restaurant</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={savedOffline ? "/restaurants/field" : "/restaurants/directory"}>
                  {savedOffline ? "See what's waiting to send" : "Browse the directory"}
                </Link>
              </Button>
            </div>
          </div>

          {/* An offline submission has no server id yet, so there is nothing
              to attach an opt-in to. It syncs later from the field queue. */}
          {restaurantId && !savedOffline && (
            <div className="mt-10">
              <ResourceOptIn restaurantId={restaurantId} />
            </div>
          )}

          <OfflineBanner className="mt-10" />
          <ProgramDisclaimer className="mt-6 text-left" />
        </Container>
      </Section>
    </PageLayout>
  );
};

export default Submitted;
