import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ReviewStatus = "draft" | "needs_review" | "published" | "archived";

const labels: Record<ReviewStatus, string> = {
  draft: "Draft",
  needs_review: "Needs Review",
  published: "Published",
  archived: "Archived",
};

const styles: Record<ReviewStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  needs_review: "bg-accent/10 text-accent-strong border-accent/30",
  published: "bg-secondary/10 text-secondary-strong border-secondary/30",
  archived: "bg-background-subtle text-muted-foreground border-border",
};

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-inter text-xs font-medium", styles[status], className)}
    >
      {labels[status]}
    </Badge>
  );
}
