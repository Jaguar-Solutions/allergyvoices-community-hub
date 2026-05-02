import { Navigate, useParams } from "react-router-dom";
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
import { AllergenChips } from "@/components/content/AllergenChips";
import { getResourceBySlug } from "@/content";

const ResourceDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const resource = getResourceBySlug(slug);

  if (!resource || resource.status !== "published") {
    return <Navigate to="/resources" replace />;
  }

  return (
    <PageLayout>
      <SEOHead
        title={resource.title}
        description={resource.summary}
        ogType="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: resource.title,
          description: resource.summary,
          dateModified: resource.last_reviewed,
          author: { "@type": "Organization", name: "AllergyVoices" },
          publisher: { "@type": "Organization", name: "AllergyVoices" },
        }}
      />
      <PageHeader
        eyebrow="Family Resource Center"
        title={resource.title}
        intro={resource.summary}
        breadcrumbs={[
          { label: "Family Resource Center", href: "/resources" },
          { label: resource.title },
        ]}
      />
      <Section>
        <Container width="narrow">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <ContentMeta
              lastReviewed={resource.last_reviewed}
              reviewedBy={resource.reviewed_by}
            />
            <AllergenChips allergens={resource.allergens} />
          </div>

          <Prose html={resource.body_html} />

          <Disclaimer kind="medical" className="mt-10" />
        </Container>
      </Section>
    </PageLayout>
  );
};

export default ResourceDetail;
