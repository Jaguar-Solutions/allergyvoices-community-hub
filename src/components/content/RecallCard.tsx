import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ALLERGEN_LABELS, type RecallAlert } from "@/content/schemas";
import { ContentMeta } from "./ContentMeta";

const AGENCY_LABELS: Record<RecallAlert["agency"], string> = {
  fda: "FDA",
  "usda-fsis": "USDA FSIS",
  cfia: "CFIA (Canada)",
  "fsa-uk": "FSA (UK)",
  other: "Other agency",
};

const REGION_LABELS: Record<RecallAlert["region"], string> = {
  us: "United States",
  ca: "Canada",
  uk: "United Kingdom",
  eu: "European Union",
  global: "Global",
};

const CLASS_LABELS: Record<RecallAlert["recall_class"], string> = {
  "class-i": "Class I (highest risk)",
  "class-ii": "Class II",
  "class-iii": "Class III",
  voluntary: "Voluntary",
  unspecified: "Unspecified class",
};

interface RecallCardProps {
  recall: RecallAlert;
}

export function RecallCard({ recall }: RecallCardProps) {
  return (
    <Card className="border-l-4 border-l-accent">
      <CardContent className="p-6 md:p-7 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
            {AGENCY_LABELS[recall.agency]}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {CLASS_LABELS[recall.recall_class]}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {REGION_LABELS[recall.region]}
          </Badge>
        </div>

        <div>
          <h2 className="font-poppins font-semibold text-lg md:text-xl text-foreground">
            {recall.product_name}
          </h2>
          {recall.brand && (
            <p className="font-inter text-sm text-muted-foreground mt-0.5">
              {recall.brand}
            </p>
          )}
        </div>

        <div>
          <p className="font-inter text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Undeclared allergens
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {recall.undeclared_allergens.map((a) => (
              <li key={a}>
                <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                  {ALLERGEN_LABELS[a]}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        <p className="font-inter text-foreground/85 leading-relaxed text-sm md:text-base">
          {recall.recall_reason}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <ContentMeta publishedDate={recall.recall_date} lastReviewed={recall.last_reviewed} />
          <a
            href={recall.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-inter text-sm font-medium text-primary hover:underline"
          >
            Official source
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
