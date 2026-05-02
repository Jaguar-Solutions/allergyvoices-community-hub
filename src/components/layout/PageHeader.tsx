import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("bg-background-subtle border-b border-border/60 pt-28 pb-10 md:pt-32 md:pb-14", className)}>
      <Container>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-6" />
        )}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            {eyebrow && (
              <p className="font-inter text-sm font-medium uppercase tracking-wide text-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl leading-tight text-foreground">
              {title}
            </h1>
            {intro && (
              <div className="font-inter text-base md:text-lg text-muted-foreground leading-relaxed">
                {intro}
              </div>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </Container>
    </header>
  );
}
