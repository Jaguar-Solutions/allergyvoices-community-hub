import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContentMeta } from "./ContentMeta";
import { AllergenChips } from "./AllergenChips";
import { AGE_STAGE_LABELS, SETTING_LABELS, type Resource } from "@/content/schemas";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const stages = Array.from(new Set(resource.age_stage)).map((s) => AGE_STAGE_LABELS[s]);
  const settings = Array.from(new Set(resource.setting)).map((s) => SETTING_LABELS[s]);
  const meta = [...stages, ...settings].join(" · ");

  return (
    <Link
      to={`/resources/${resource.slug}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-poppins font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {resource.title}
          </h3>
          <p className="font-inter text-sm text-muted-foreground leading-relaxed">
            {resource.summary}
          </p>
          {meta && (
            <p className="font-inter text-xs text-muted-foreground">{meta}</p>
          )}
          <AllergenChips allergens={resource.allergens} />
          <div className="flex items-center justify-between pt-1">
            <ContentMeta lastReviewed={resource.last_reviewed} />
            <span className="text-primary text-sm font-medium inline-flex items-center gap-1">
              Open
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
