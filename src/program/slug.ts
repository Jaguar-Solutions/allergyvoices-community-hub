/**
 * Profile URLs: /restaurants/<slug>
 *
 * Slugs are generated once at publish time and then left alone — a published
 * URL that changes because someone fixed a typo in a restaurant name is a
 * broken link in someone's bookmarks.
 */

/** Route segments under /restaurants that are not restaurant profiles. */
export const RESERVED_SLUGS = new Set([
  "participate",
  "submitted",
  "directory",
  "field",
  "program",
  "claim",
  "admin",
]);

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * Base slug for a listing: name, city, and state, so two restaurants in the
 * same chain don't collide across towns.
 */
export function baseSlug(name: string, city: string, state: string): string {
  const slug = slugify([name, city, state].filter(Boolean).join(" "));
  return slug || "restaurant";
}

/**
 * Pick a slug that isn't already taken. `taken` is the set of slugs already
 * in the database; callers pass the result of a prefix query.
 */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const candidate = RESERVED_SLUGS.has(base) ? `${base}-restaurant` : base;
  if (!used.has(candidate)) return candidate;

  for (let n = 2; n < 1000; n += 1) {
    const next = `${candidate}-${n}`;
    if (!used.has(next)) return next;
  }
  throw new Error(`Could not find a free slug for "${base}"`);
}
