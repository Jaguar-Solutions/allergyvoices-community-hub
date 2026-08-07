import { cn } from "@/lib/utils";

/**
 * A lettered tile standing in for a restaurant's photo.
 *
 * We deliberately don't show photography here. We never collect it, and
 * dropping in stock imagery would mean showing a family a picture that isn't
 * the restaurant they're about to trust with an allergy. On a directory whose
 * whole promise is "this came from the restaurant itself", borrowed photos
 * would undercut the one thing the page is selling.
 *
 * So the anchor is typographic: initials on a tint picked deterministically
 * from the name, which gives each card a distinct silhouette and makes a grid
 * scannable without inventing anything.
 */

const TILES = [
  "bg-brand-cyan/15",
  "bg-brand-coral/15",
  "bg-brand-sun/25",
  "bg-brand-spring/20",
  "bg-brand-berry/15",
];

function initials(name: string): string {
  const words = name
    .replace(/^(the|a|an)\s+/i, "")
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Stable per-name tile colour, so a restaurant looks the same on every visit. */
function tileFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return TILES[hash % TILES.length];
}

export function RestaurantMonogram({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-poppins text-base font-bold text-foreground",
        tileFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
