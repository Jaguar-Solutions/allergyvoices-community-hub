import { cn } from "@/lib/utils";
import type { HTMLAttributes, ElementType } from "react";

type SectionTone = "default" | "subtle" | "primary-soft" | "accent-soft";
type SectionSpacing = "sm" | "md" | "lg";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  spacing?: SectionSpacing;
  as?: ElementType;
}

const toneClass: Record<SectionTone, string> = {
  default: "bg-background",
  subtle: "bg-background-subtle",
  "primary-soft": "bg-primary/5",
  "accent-soft": "bg-accent/5",
};

const spacingClass: Record<SectionSpacing, string> = {
  sm: "py-10 md:py-12",
  md: "py-14 md:py-20",
  lg: "py-20 md:py-28",
};

export function Section({
  tone = "default",
  spacing = "md",
  as: Tag = "section",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag className={cn(toneClass[tone], spacingClass[spacing], className)} {...props}>
      {children}
    </Tag>
  );
}
