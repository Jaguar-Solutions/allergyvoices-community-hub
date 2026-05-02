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
import { SourceList } from "@/components/content/SourceList";
import { getArticleBySlug } from "@/content";
import { EVIDENCE_LABELS } from "@/content/schemas";

const FindingDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const article = getArticleBySlug(slug);

  if (!article || article.status !== "published") {
    return <Navigate to="/findings" replace />;
  }

  return (
    <PageLayout>
      <SEOHead
        title={article.title}
        description={article.summary}
        ogType="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "MedicalScholarlyArticle",
          headline: article.title,
          datePublished: article.published_date,
          dateModified: article.last_reviewed ?? article.published_date,
          author: { "@type": "Organization", name: "AllergyVoices" },
          description: article.summary,
        }}
      />
      <PageHeader
        eyebrow={EVIDENCE_LABELS[article.evidence_level]}
        title={article.title}
        intro={article.summary}
        breadcrumbs={[
          { label: "Latest Findings", href: "/findings" },
          { label: article.title },
        ]}
      />
      <Section>
        <Container width="narrow">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <ContentMeta
              publishedDate={article.published_date}
              lastReviewed={article.last_reviewed}
              reviewedBy={article.reviewed_by}
            />
            <AllergenChips allergens={article.allergens} />
          </div>

          <Prose html={article.body_html} />

          {article.who_affected && (
            <section className="mt-10 rounded-xl border border-border bg-background-subtle p-6">
              <h2 className="font-poppins font-semibold text-base text-foreground mb-2">
                Who this affects
              </h2>
              <p className="font-inter text-foreground/85">{article.who_affected}</p>
            </section>
          )}

          {article.family_takeaway && (
            <section className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-6">
              <h2 className="font-poppins font-semibold text-base text-foreground mb-2">
                What families should know
              </h2>
              <p className="font-inter text-foreground/85">{article.family_takeaway}</p>
            </section>
          )}

          {article.questions_for_allergist.length > 0 && (
            <section className="mt-6 rounded-xl border border-border bg-card p-6">
              <h2 className="font-poppins font-semibold text-base text-foreground mb-3">
                Questions to ask your allergist
              </h2>
              <ul className="space-y-2 font-inter text-foreground/85 list-disc pl-5">
                {article.questions_for_allergist.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </section>
          )}

          {article.sources.length > 0 && (
            <div className="mt-8">
              <SourceList sources={article.sources} />
            </div>
          )}

          <Disclaimer kind="medical" className="mt-10" />
        </Container>
      </Section>
    </PageLayout>
  );
};

export default FindingDetail;
