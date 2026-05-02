import SEOHead from "@/components/SEOHead";
import {
  Container,
  Disclaimer,
  PageHeader,
  PageLayout,
  Section,
} from "@/components/layout";
import { RecallCard } from "@/components/content/RecallCard";
import { getPublishedRecalls } from "@/content";

const Recalls = () => {
  const recalls = getPublishedRecalls();

  return (
    <PageLayout>
      <SEOHead
        title="Recalls and Alerts"
        description="Food allergen recalls and alerts pulled from FDA, USDA FSIS, Canada, and UK FSA &mdash; with structured details and links to the official source."
      />
      <PageHeader
        eyebrow="Recalls & alerts"
        title="Allergen recalls from official sources"
        intro="Recall cards built from FDA, USDA FSIS, Canada, and UK FSA feeds. Every entry links back to the official source so you can verify details directly."
        breadcrumbs={[{ label: "Recalls & Alerts" }]}
      />
      <Section>
        <Container width="default">
          {recalls.length === 0 ? (
            <p className="font-inter text-muted-foreground">
              No active recalls right now.
            </p>
          ) : (
            <ul className="space-y-5">
              {recalls.map((recall) => (
                <li key={recall.slug}>
                  <RecallCard recall={recall} />
                </li>
              ))}
            </ul>
          )}
          <Disclaimer
            kind="info"
            title="Always verify with the source"
            className="mt-10"
          >
            Recall details can change. For the most current information, follow
            the source link on each recall card or contact the manufacturer or
            relevant food safety agency directly.
          </Disclaimer>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default Recalls;
