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

/**
 * Whether the rendered article already contains a heading with this text.
 *
 * Compares on letters only, so "What families should know" still matches
 * "What Families Should Know" or a heading carrying an id attribute.
 */
function bodyHasHeading(html: string, heading: string): boolean {
  const normalize = (v: string) => v.toLowerCase().replace(/[^a-z]+/g, "");
  const target = normalize(heading);
  return [...html.matchAll(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gis)].some(
    (m) => normalize(m[1]) === target,
  );
}

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
          "@type": "MedicalWebPage",
          headline: article.title,
          description: article.summary,
          datePublished: article.published_date,
          dateModified: article.last_reviewed ?? article.published_date,
          inLanguage: "en-US",
          // Named as the author, not as a reviewer — there is no clinical
          // reviewer, and reviewedBy here would assert one in machine-readable
          // form.
          author: { "@type": "Organization", name: "AllergyVoices" },
          publisher: {
            "@type": "Organization",
            name: "AllergyVoices",
            url: "https://allergyvoices.com",
          },
          citation: article.sources.map((source) => ({
            "@type": "CreativeWork",
            name: source.name,
            url: source.url,
          })),
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

          {/* The structured frontmatter fields and the article body can carry
              the same section. Where both exist the body is the fuller
              treatment — several paragraphs against a single summary line — so
              the panel is the duplicate and is withheld. Articles whose body
              omits the section still get the highlighted panel, and a new
              article needs no coordination between the two. */}
          {article.who_affected && !bodyHasHeading(article.body_html, "Who this affects") && (
            <section className="mt-10 rounded-xl border border-border bg-background-subtle p-6">
              <h2 className="font-poppins font-semibold text-base text-foreground mb-2">
                Who this affects
              </h2>
              <p className="font-inter text-foreground/85">{article.who_affected}</p>
            </section>
          )}

          {article.family_takeaway && !bodyHasHeading(article.body_html, "What families should know") && (
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

          {/* States what this article is, next to the medical disclaimer that
              states what it is not. Without it, "Prepared by the AllergyVoices
              editorial team" could still be read as a clinical review. */}
          <p className="mt-10 font-inter text-sm leading-relaxed text-muted-foreground">
            Source-based educational summary; not independently medically
            reviewed. Every claim links to the original source below.
          </p>

          <Disclaimer kind="medical" className="mt-4" />
        </Container>
      </Section>
    </PageLayout>
  );
};

export default FindingDetail;
