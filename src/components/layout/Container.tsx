import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type ContainerWidth = "narrow" | "default" | "wide";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
}

const widthClass: Record<ContainerWidth, string> = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
};

export function Container({
  width = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widthClass[width], className)}
      {...props}
    >
      {children}
    </div>
  );
}
