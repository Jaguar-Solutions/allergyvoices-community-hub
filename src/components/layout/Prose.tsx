import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type ProseSize = "sm" | "default" | "lg";

interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  html: string;
  size?: ProseSize;
}

const sizeClass: Record<ProseSize, string> = {
  sm: "prose-sm",
  default: "prose-base md:prose-lg",
  lg: "prose-lg md:prose-xl",
};

export function Prose({ html, size = "default", className, ...props }: ProseProps) {
  return (
    <div
      // dangerouslySetInnerHTML is fine here: HTML comes from our own
      // markdown files (committed to the repo), parsed at build time.
      dangerouslySetInnerHTML={{ __html: html }}
      className={cn(
        "prose prose-slate max-w-none font-inter",
        "prose-headings:font-poppins prose-headings:text-foreground",
        "prose-p:text-foreground/85 prose-p:leading-relaxed",
        "prose-a:text-primary prose-a:font-medium hover:prose-a:underline",
        "prose-strong:text-foreground",
        "prose-li:marker:text-primary/60",
        "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        "prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground",
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
}
