import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/allergy-voices-logo.png";

interface NavItem {
  name: string;
  href: string;
  description?: string;
}

interface NavGroup {
  name: string;
  href?: string;
  children?: NavItem[];
}

/**
 * Top-level order puts the directory first.
 *
 * "Find Restaurants" was previously reachable only by opening the Restaurants
 * dropdown, which is where a restaurant owner would look — not a family. It is
 * the thing most visitors arrive wanting, so it is a link rather than a menu
 * item, and the owner-facing pages keep their own group.
 */
const NAV: NavGroup[] = [
  { name: "Find Restaurants", href: "/restaurants/directory" },
  {
    name: "Resources",
    children: [
      { name: "Family Resource Center", href: "/resources", description: "Practical guides for everyday allergy life" },
      { name: "Allergen Hubs", href: "/allergens", description: "Quick references for each major allergen" },
      { name: "Dining Out", href: "/dining", description: "Scripts, checklists, and red flags" },
      { name: "Schools & Teens", href: "/schools-teens", description: "Plans, forms, and independence tools" },
      { name: "Local Resources", href: "/directory", description: "Allergists, dietitians, support groups" },
    ],
  },
  { name: "Recalls", href: "/recalls" },
  { name: "Findings", href: "/findings" },
  { name: "For Restaurants", href: "/restaurants" },
  { name: "About", href: "/about" },
];

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setOpenGroup(null);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openGroup) return;
    const handleClick = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [openGroup]);

  const linkClass =
    "font-inter text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 px-1 py-1";
  const activeLinkClass = "text-foreground";

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-200",
        isScrolled
          ? "bg-background/90 backdrop-blur-md shadow-sm border-b border-border/60"
          : "bg-background/70 backdrop-blur-sm",
      )}
      aria-label="Primary"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="-ml-1 flex min-h-[44px] items-center rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <img
              src={logoImage}
              alt="AllergyVoices"
              className="h-9 md:h-10 w-auto"
              width="180"
              height="67"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-7" ref={groupRef}>
            {NAV.map((group) => {
              if (group.children) {
                const isOpen = openGroup === group.name;
                return (
                  <div key={group.name} className="relative">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      onClick={() => setOpenGroup(isOpen ? null : group.name)}
                      className={cn(linkClass, "inline-flex items-center gap-1")}
                    >
                      {group.name}
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-80 rounded-xl border border-border bg-popover shadow-lg p-2">
                        <ul className="space-y-1">
                          {group.children.map((child) => (
                            <li key={child.href}>
                              <NavLink
                                to={child.href}
                                className={({ isActive }) =>
                                  cn(
                                    "block rounded-lg px-3 py-2.5 hover:bg-muted transition-colors",
                                    isActive && "bg-muted",
                                  )
                                }
                              >
                                <div className="font-poppins text-sm font-medium text-foreground">
                                  {child.name}
                                </div>
                                {child.description && (
                                  <div className="font-inter text-xs text-muted-foreground mt-0.5 leading-snug">
                                    {child.description}
                                  </div>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <NavLink
                  key={group.name}
                  to={group.href!}
                  className={({ isActive }) => cn(linkClass, isActive && activeLinkClass)}
                >
                  {group.name}
                </NavLink>
              );
            })}
            <Button asChild size="sm" className="font-poppins ml-2">
              <Link to="/#join">Join the Voices</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
            className="lg:hidden -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-muted"
            onClick={() => setIsMobileOpen((v) => !v)}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileOpen && (
          <div className="lg:hidden py-4 border-t border-border/60 bg-background/95 backdrop-blur-md">
            <ul className="flex flex-col gap-1">
              {NAV.flatMap((group) => {
                if (group.children) {
                  return [
                    <li
                      key={group.name}
                      className="px-3 pt-3 pb-1 font-poppins text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {group.name}
                    </li>,
                    ...group.children.map((child) => (
                      <li key={child.href}>
                        <NavLink
                          to={child.href}
                          className={({ isActive }) =>
                            cn(
                              "block rounded-md px-3 py-2 font-inter text-sm font-medium",
                              isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted",
                            )
                          }
                        >
                          {child.name}
                        </NavLink>
                      </li>
                    )),
                  ];
                }
                return [
                  <li key={group.name}>
                    <NavLink
                      to={group.href!}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-md px-3 py-2 font-inter text-sm font-medium",
                          isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted",
                        )
                      }
                    >
                      {group.name}
                    </NavLink>
                  </li>,
                ];
              })}
              <li className="px-3 pt-3">
                <Button asChild size="sm" className="w-full font-poppins">
                  <Link to="/#join">Join the Voices</Link>
                </Button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
