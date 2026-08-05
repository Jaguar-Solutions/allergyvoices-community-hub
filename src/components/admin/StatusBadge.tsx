import { cn } from "@/lib/utils";
import { STATUS_LABELS, type RestaurantStatus } from "@/program/types";

const STATUS_STYLES: Record<RestaurantStatus, string> = {
  submitted: "bg-primary/10 text-primary border-primary/20",
  in_review: "bg-warning/15 text-warning-foreground border-warning/30",
  changes_requested: "bg-accent/10 text-accent-strong border-accent/20",
  published: "bg-secondary/10 text-secondary-strong border-secondary/20",
  hidden: "bg-muted text-muted-foreground border-border",
  declined: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  status,
  className,
}: {
  status: RestaurantStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 font-inter text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
