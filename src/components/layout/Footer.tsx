import { Link } from "react-router-dom";
import { Instagram, Youtube, Facebook, Linkedin } from "lucide-react";
import logoImage from "@/assets/allergy-voices-logo.png";
import { Container } from "./Container";

const QUICK_LINKS = [
  { label: "Latest Findings", href: "/findings" },
  { label: "Recalls & Alerts", href: "/recalls" },
  { label: "Family Resources", href: "/resources" },
  { label: "Allergen Hubs", href: "/allergens" },
];

const ABOUT_LINKS = [
  { label: "About AllergyVoices", href: "/about" },
  { label: "Editorial Policy", href: "/about#editorial" },
  { label: "Local Directory", href: "/directory" },
  { label: "Contact", href: "mailto:info@allergyvoices.com" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#", Icon: Instagram },
  { label: "YouTube", href: "#", Icon: Youtube },
  { label: "Facebook", href: "#", Icon: Facebook },
  { label: "LinkedIn", href: "#", Icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-14 px-4">
      <Container width="wide">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <img
              src={logoImage}
              alt="AllergyVoices"
              className="h-10 w-auto"
              width="180"
              height="67"
            />

            <p className="font-inter text-sm text-background/70 max-w-md leading-relaxed">
              Every ingredient matters. Every voice counts. A calm, practical hub
              for food allergy families &mdash; medical findings, recalls, and
              real-world resources.
            </p>
            <p className="font-inter text-xs text-background/60 max-w-md leading-relaxed">
              Educational information only. Not medical advice. For emergencies, use
              prescribed emergency medication and seek urgent medical care.
            </p>
          </div>

          <div>
            <h2 className="font-poppins font-semibold text-sm uppercase tracking-wide mb-4">
              Explore
            </h2>
            <ul className="space-y-2 font-inter text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="-mx-2 inline-block rounded px-2 py-1.5 text-background/80 transition-colors hover:text-background">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-poppins font-semibold text-sm uppercase tracking-wide mb-4">
              About
            </h2>
            <ul className="space-y-2 font-inter text-sm">
              {ABOUT_LINKS.map((link) =>
                link.href.startsWith("mailto:") ? (
                  <li key={link.href}>
                    <a href={link.href} className="-mx-2 inline-block rounded px-2 py-1.5 text-background/80 transition-colors hover:text-background">
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link to={link.href} className="-mx-2 inline-block rounded px-2 py-1.5 text-background/80 transition-colors hover:text-background">
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
            <div className="-ml-2.5 mt-3 flex gap-1">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded text-background/70 transition-colors hover:bg-background/10 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/40"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-background/15 pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="font-inter text-xs text-background/60">
            &copy; {new Date().getFullYear()} AllergyVoices. All rights reserved.
          </p>
          <p className="font-inter text-xs text-background/60">
            Questions? <a href="mailto:info@allergyvoices.com" className="underline-offset-2 hover:underline transition-colors">info@allergyvoices.com</a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
