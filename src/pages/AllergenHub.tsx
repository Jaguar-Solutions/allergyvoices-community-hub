import { Navigate, useParams } from "react-router-dom";
import { Lightbulb, EyeOff } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import {
  Container,
  Disclaimer,
  PageHeader,
  PageLayout,
  Prose,
  Section,
} from "@/components/layout";
import { ContentMeta } from "@/components/content/ContentMeta";
import { ALLERGEN_LABELS, AllergenSchema } from "@/content/schemas";
import { getAllergenHub } from "@/content";
import { ALLERGEN_TINT_BG } from "@/components/content/allergen-tints";

const AllergenHub = () => {
  const { allergen = "" } = useParams<{ allergen: string }>();
  const parseResult = AllergenSchema.safeParse(allergen);

  if (!parseResult.success) {
    return <Navigate to="/allergens" replace />;
  }
  const slug = parseResult.data;
  const hub = getAllergenHub(slug);
  const name = ALLERGEN_LABELS[slug];

  if (!hub) {
    return (
      <PageLayout>
        <SEOHead
          title={`${name} allergen hub`}
          description={`${name} allergy basics — coming soon.`}
        />
        <PageHeader
          eyebrow="Allergen hub"
          title={name}
          intro="This hub is being written. Check back soon."
          breadcrumbs={[
            { label: "Allergen Hubs", href: "/allergens" },
            { label: name },
          ]}
        />
        <Section>
          <Container width="narrow">
            <Disclaimer kind="medical" />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEOHead
        title={`${name} allergy — AllergyVoices`}
        description={hub.summary}
        ogType="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: hub.title,
          description: hub.summary,
          dateModified: hub.last_reviewed,
          about: { "@type": "MedicalCondition", name: `${name} allergy` },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://allergyvoices.com/" },
              { "@type": "ListItem", position: 2, name: "Allergen Hubs", item: "https://allergyvoices.com/allergens" },
              { "@type": "ListItem", position: 3, name: name, item: `https://allergyvoices.com/allergens/${slug}` },
            ],
          },
        }}
      />
      <PageHeader
        eyebrow="Allergen hub"
        title={hub.title}
        intro={hub.summary}
        breadcrumbs={[
          { label: "Allergen Hubs", href: "/allergens" },
          { label: name },
        ]}
        className={`${ALLERGEN_TINT_BG[slug]} border-b-0`}
      />
      <Section>
        <Container width="narrow">
          <ContentMeta lastReviewed={hub.last_reviewed} reviewedBy={hub.reviewed_by} className="mb-6" />
          <Prose html={hub.body_html} />

          {hub.hidden_sources.length > 0 && (
            <section className={`mt-10 rounded-xl border border-border ${ALLERGEN_TINT_BG[slug]} p-6`}>
              <h2 className="flex items-center gap-2 font-poppins font-semibold text-base text-foreground mb-3">
                <EyeOff className="h-4 w-4 text-primary" aria-hidden="true" />
                Hidden sources to watch for
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2 font-inter text-sm text-foreground/85">
                {hub.hidden_sources.map((source, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true" className="text-primary mt-1">&middot;</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hub.family_tips.length > 0 && (
            <section className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <h2 className="flex items-center gap-2 font-poppins font-semibold text-base text-foreground mb-3">
                <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
                Family tips
              </h2>
              <ul className="space-y-2 font-inter text-sm text-foreground/85 list-disc pl-5">
                {hub.family_tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </section>
          )}

          <Disclaimer kind="medical" className="mt-10" />
        </Container>
      </Section>
    </PageLayout>
  );
};

export default AllergenHub;
