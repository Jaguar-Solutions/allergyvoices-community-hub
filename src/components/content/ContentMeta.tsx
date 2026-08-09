import { CalendarDays, ShieldCheck, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentMetaProps {
  publishedDate?: string;
  lastReviewed?: string;
  reviewedBy?: string;
  className?: string;
}

function formatDate(value?: string) {
  if (!value) return null;
  try {
    return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function ContentMeta({
  publishedDate,
  lastReviewed,
  reviewedBy,
  className,
}: ContentMetaProps) {
  const published = formatDate(publishedDate);
  const reviewed = formatDate(lastReviewed);

  return (
    <dl className={cn("flex flex-wrap gap-x-6 gap-y-2 font-inter text-sm text-muted-foreground", className)}>
      {published && (
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          <dt className="sr-only">Published</dt>
          <dd>Published {published}</dd>
        </div>
      )}
      {reviewed && (
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <dt className="sr-only">Last reviewed</dt>
          <dd>Reviewed {reviewed}</dd>
        </div>
      )}
      {/* Deliberately not "Reviewer: AllergyVoices editorial". Naming an
          unnamed team as a reviewer implies a clinical review that has not
          happened. Until a qualified named reviewer exists, the honest
          statement is who wrote it — and, alongside, that it was not
          independently medically reviewed. */}
      {reviewedBy && (
        <div className="flex items-center gap-1.5">
          <UserCheck className="h-4 w-4" aria-hidden="true" />
          <dt className="sr-only">Prepared by</dt>
          <dd>
            {/^allergyvoices editorial$/i.test(reviewedBy.trim())
              ? "Prepared by the AllergyVoices editorial team"
              : `Prepared by ${reviewedBy}`}
          </dd>
        </div>
      )}
    </dl>
  );
}
