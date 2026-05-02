import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import {
  Container,
  Disclaimer,
  PageHeader,
  PageLayout,
  Section,
} from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { ContentMeta } from "@/components/content/ContentMeta";
import { AllergenChips } from "@/components/content/AllergenChips";
import { getPublishedArticles } from "@/content";
import { EVIDENCE_LABELS } from "@/content/schemas";

const Findings = () => {
  const articles = getPublishedArticles();

  return (
    <PageLayout>
      <SEOHead
        title="Latest Medical Findings"
        description="Plain-language summaries of food allergy research, FDA updates, treatment news, and clinical trials. Reviewed before publishing; sources always linked."
      />
      <PageHeader
        eyebrow="Latest medical findings"
        title="Research, treatments, and guideline updates"
        intro="Plain-language summaries of new food allergy research, FDA updates, and clinical trials. Every article includes what changed, who it affects, and questions to ask your allergist."
        breadcrumbs={[{ label: "Latest Findings" }]}
      />
      <Section>
        <Container width="default">
          {articles.length === 0 ? (
            <p className="font-inter text-muted-foreground">
              No articles published yet. Check back soon.
            </p>
          ) : (
            <ul className="space-y-5">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    to={`/findings/${article.slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="p-6 md:p-7 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
                          {EVIDENCE_LABELS[article.evidence_level]}
                        </div>
                        <h2 className="font-poppins font-semibold text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>
                        <p className="font-inter text-muted-foreground leading-relaxed">
                          {article.summary}
                        </p>
                        <AllergenChips allergens={article.allergens} />
                        <div className="flex items-center justify-between pt-1">
                          <ContentMeta
                            publishedDate={article.published_date}
                            lastReviewed={article.last_reviewed}
                          />
                          <span className="text-primary text-sm font-medium inline-flex items-center gap-1">
                            Read
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Disclaimer kind="medical" className="mt-10" />
        </Container>
      </Section>
    </PageLayout>
  );
};

export default Findings;
