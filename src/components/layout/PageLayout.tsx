import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import { Footer } from "./Footer";
import { FooterWave } from "./FooterWave";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to main content
      </a>
      <Navigation />
      <main id="main" className="flex-1">
        {children}
      </main>
      <FooterWave />
      <Footer />
    </div>
  );
}
