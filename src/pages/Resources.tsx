import SEOHead from "@/components/SEOHead";
import {
  Container,
  PageHeader,
  PageLayout,
  Section,
} from "@/components/layout";
import { ResourceCard } from "@/components/content/ResourceCard";
import { getPublishedResources } from "@/content";

const Resources = () => {
  const resources = getPublishedResources();

  return (
    <PageLayout>
      <SEOHead
        title="Family Resource Center"
        description="Practical, plain-language guides for food allergy families: newly diagnosed, emergency planning, school forms, birthday parties, travel, dining out, and grocery shopping."
      />
      <PageHeader
        eyebrow="Family Resource Center"
        title="Practical guides for everyday allergy life"
        intro="Calm, clear, family-friendly guides — from a newly diagnosed first week to travel checklists and label-reading shortcuts."
        breadcrumbs={[{ label: "Family Resource Center" }]}
      />
      <Section>
        <Container width="default">
          {resources.length === 0 ? (
            <p className="font-inter text-muted-foreground">Resources coming soon.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {resources.map((r) => (
                <li key={r.slug}>
                  <ResourceCard resource={r} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </PageLayout>
  );
};

export default Resources;
