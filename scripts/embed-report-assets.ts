/**
 * Regenerates `supabase/functions/_shared/report-assets.ts`.
 *
 * The brand logo and the two Poppins faces are embedded as base64 rather than
 * read from disk, because `supabase functions deploy` bundles TypeScript
 * modules and nothing else — files sitting next to the function are not
 * uploaded, so `Deno.readFile` would throw at render time. Run this after
 * changing the logo or the fonts.
 *
 *   npx tsx scripts/embed-report-assets.ts
 */

import { readFileSync, writeFileSync } from "node:fs";

const SOURCES = {
  logoPng: "public/allergy-voices-logo.png",
  poppinsBold: "supabase/functions/_shared/fonts/Poppins-Bold.ttf",
  poppinsSemiBold: "supabase/functions/_shared/fonts/Poppins-SemiBold.ttf",
};

const OUT = "supabase/functions/_shared/report-assets.ts";

/** Wrap so the generated file stays diff-able rather than one enormous line. */
function wrap(value: string, width = 100): string {
  const lines: string[] = [];
  for (let i = 0; i < value.length; i += width) lines.push(value.slice(i, i + width));
  return lines.join("\n");
}

const encoded = Object.fromEntries(
  Object.entries(SOURCES).map(([key, path]) => [
    key,
    wrap(readFileSync(path).toString("base64")),
  ]),
) as Record<keyof typeof SOURCES, string>;

writeFileSync(
  OUT,
  `/**
 * Brand assets for the generated PDF, embedded as base64.
 *
 * They are inlined rather than read from disk because \`supabase functions
 * deploy\` bundles TypeScript modules and nothing else — a first deploy
 * attempt uploaded only the .ts files, which would have left \`Deno.readFile\`
 * throwing on the fonts at render time. As code, they cannot fail to ship.
 *
 * The same module is used by the local sample renderer and the link tests, so
 * what is inspected in development is byte-identical to what the edge
 * function produces.
 *
 * Generated file — do not edit by hand.
 * Regenerate with: npx tsx scripts/embed-report-assets.ts
 *
 *   allergy-voices-logo.png  600x222
 *   Poppins-Bold.ttf         SIL Open Font License 1.1
 *   Poppins-SemiBold.ttf     SIL Open Font License 1.1
 */

function decode(base64: string): Uint8Array {
  const binary = atob(base64.replace(/\\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const LOGO_PNG = \`${encoded.logoPng}\`;

const POPPINS_BOLD = \`${encoded.poppinsBold}\`;

const POPPINS_SEMIBOLD = \`${encoded.poppinsSemiBold}\`;

export const REPORT_ASSETS = {
  logoPng: decode(LOGO_PNG),
  poppinsBold: decode(POPPINS_BOLD),
  poppinsSemiBold: decode(POPPINS_SEMIBOLD),
};
`,
);

console.log(`Wrote ${OUT}`);
for (const [key, path] of Object.entries(SOURCES)) {
  console.log(`  ${key.padEnd(16)} ${path}`);
}
