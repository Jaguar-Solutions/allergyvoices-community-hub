import { ExternalLink, TriangleAlert } from "lucide-react";
import { ALLERGEN_LABELS, type RecallAlert } from "@/content/schemas";
import { ALLERGEN_TINT_BG } from "./allergen-tints";
import { cn } from "@/lib/utils";

const AGENCY_LABELS: Record<RecallAlert["agency"], string> = {
  fda: "FDA",
  "usda-fsis": "USDA FSIS",
  cfia: "CFIA",
  "fsa-uk": "FSA UK",
  other: "Other agency",
};

const REGION_LABELS: Record<RecallAlert["region"], string> = {
  us: "United States",
  ca: "Canada",
  uk: "United Kingdom",
  eu: "European Union",
  global: "Global",
};

export const CLASS_LABELS: Record<RecallAlert["recall_class"], string> = {
  "class-i": "Class I",
  "class-ii": "Class II",
  "class-iii": "Class III",
  voluntary: "Voluntary",
  unspecified: "Class not stated",
};

/**
 * One recall.
 *
 * The undeclared allergen leads, in the site's per-allergen tints, because
 * that is the single thing a parent is scanning a recall list for. It used to
 * sit mid-card in small grey text under a label.
 *
 * Class I is the agency's own "reasonable probability of serious harm"
 * classification, so it gets weight the other classes don't. Everything else
 * stays visually equal: we surface the agency's judgement, we don't add one.
 */
export function RecallCard({ recall }: { recall: RecallAlert }) {
  const isHighestRisk = recall.recall_class === "class-i";

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md",
        isHighestRisk ? "border-destructive/30" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {isHighestRisk && (
          /* "Highest risk" on its own reads as an AllergyVoices judgement.
             It is not: Class I is the issuing agency's own classification,
             so the label now names it and the title says whose it is. We
             never assign a severity ourselves — a record with no stated
             class shows none. */
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 font-inter text-xs font-semibold text-destructive-strong"
            title={`Class I is ${AGENCY_LABELS[recall.agency]}'s own classification for a reasonable probability of serious health consequences. AllergyVoices does not assign risk levels.`}
          >
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Class I — {AGENCY_LABELS[recall.agency]}
          </span>
        )}
        <span className="rounded-full border border-border px-2.5 py-1 font-inter text-xs font-medium text-muted-foreground">
          {AGENCY_LABELS[recall.agency]}
        </span>
        {!isHighestRisk && (
          <span className="font-inter text-xs text-muted-foreground">
            {CLASS_LABELS[recall.recall_class]}
          </span>
        )}
        <time
          dateTime={recall.recall_date}
          className="ml-auto font-inter text-xs text-muted-foreground"
        >
          {new Date(`${recall.recall_date}T00:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {recall.undeclared_allergens.map((a) => (
          <li
            key={a}
            className={cn(
              "rounded-full px-2.5 py-1 font-inter text-sm font-semibold text-foreground",
              ALLERGEN_TINT_BG[a],
            )}
          >
            {ALLERGEN_LABELS[a]}
          </li>
        ))}
      </ul>

      <h3 className="mt-3 break-words font-poppins text-base font-semibold leading-snug text-foreground">
        {recall.product_name}
      </h3>
      {recall.brand && (
        <p className="mt-0.5 font-inter text-sm text-muted-foreground">
          {recall.brand}
        </p>
      )}

      <p className="mt-2 line-clamp-3 font-inter text-sm leading-relaxed text-foreground/80">
        {recall.recall_reason}
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        <span className="font-inter text-xs text-muted-foreground">
          {REGION_LABELS[recall.region]}
        </span>
        <a
          href={recall.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[24px] items-center gap-1.5 rounded-sm font-inter text-sm font-medium text-primary transition-colors hover:text-primary-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Official source
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">for {recall.product_name}</span>
        </a>
      </div>
    </article>
  );
}
