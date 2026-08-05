/**
 * Restaurants type their website as "example.com" far more often than they
 * type "https://example.com". Stored raw, that becomes a *relative* href on
 * the profile page, so "Visit website" would navigate to
 * allergyvoices.com/example.com — a 404 on our own site.
 */
export function normalizeWebsite(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Anything with a scheme we don't want to follow is dropped rather than
  // rendered as a link.
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return null;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

/** "https://www.example.com/menu" → "example.com/menu" for display. */
export function displayWebsite(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}
