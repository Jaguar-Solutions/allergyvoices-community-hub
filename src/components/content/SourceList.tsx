import { ExternalLink } from "lucide-react";
import type { Source } from "@/content/schemas";

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null;
  return (
    <section className="rounded-xl border border-border bg-background-subtle p-6 not-prose">
      <h2 className="font-poppins font-semibold text-base text-foreground mb-3">
        Sources
      </h2>
      <ul className="space-y-3">
        {sources.map((source) => (
          <li key={source.url} className="font-inter text-sm leading-relaxed">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1.5 text-primary hover:underline transition-colors"
            >
              <span>{source.name}</span>
              <ExternalLink className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            </a>
            {source.agency && (
              <span className="text-muted-foreground"> &mdash; {source.agency}</span>
            )}
            {source.published_date && (
              <span className="text-muted-foreground"> &middot; {source.published_date}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
