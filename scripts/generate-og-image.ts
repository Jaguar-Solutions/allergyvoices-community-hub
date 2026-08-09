/**
 * Builds the 1200x630 social sharing card at public/og-image.png.
 *
 * Shared links previously fell back to the site logo — a 600x222 PNG that
 * platforms letterbox into a wide frame, leaving a small mark stranded in
 * grey. Outreach to restaurants happens by email and message, so the preview
 * card is often the first thing anyone sees of AllergyVoices.
 *
 * Regenerate after changing the logo or the tagline:
 *   npx tsx scripts/generate-og-image.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;

// Brand colours, from the HSL custom properties in src/index.css.
const CYAN = "#48a8bd";
const CORAL = "#f5734a";
const SUN = "#f5c94f";
const INK = "#171c26";
const BODY = "#4a5460";

const LOGO_WIDTH = 380;

async function main() {
  const logo = sharp(readFileSync("public/allergy-voices-logo.png"));
  const meta = await logo.metadata();
  const logoHeight = Math.round(
    ((meta.height ?? 222) / (meta.width ?? 600)) * LOGO_WIDTH,
  );
  const logoBuffer = await logo.resize({ width: LOGO_WIDTH }).png().toBuffer();

  // Text is drawn as SVG rather than composited from rendered images so the
  // card stays crisp and is trivial to edit.
  const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff"/>

  <!-- The same three-colour brand rule used on the report cover. -->
  <rect x="0" y="0" width="${WIDTH / 3}" height="14" fill="${CYAN}"/>
  <rect x="${WIDTH / 3}" y="0" width="${WIDTH / 3}" height="14" fill="${SUN}"/>
  <rect x="${(WIDTH / 3) * 2}" y="0" width="${WIDTH / 3}" height="14" fill="${CORAL}"/>

  <text x="80" y="330" font-family="Poppins, Helvetica, Arial, sans-serif"
        font-size="62" font-weight="700" fill="${INK}">
    Every ingredient matters.
  </text>
  <text x="80" y="404" font-family="Poppins, Helvetica, Arial, sans-serif"
        font-size="62" font-weight="700" fill="${CYAN}">
    Every voice counts.
  </text>

  <text x="80" y="470" font-family="Inter, Helvetica, Arial, sans-serif"
        font-size="27" fill="${BODY}">
    A calm, practical hub for food allergy families
  </text>

  <rect x="80" y="510" width="86" height="4" fill="${CORAL}"/>

  <text x="80" y="570" font-family="Inter, Helvetica, Arial, sans-serif"
        font-size="24" fill="${BODY}">
    allergyvoices.com
  </text>
</svg>`;

  const png = await sharp(Buffer.from(svg))
    .composite([{ input: logoBuffer, top: 90, left: 80 }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  writeFileSync("public/og-image.png", png);
  const kb = Math.round(png.length / 1024);
  console.log(`Wrote public/og-image.png — ${WIDTH}x${HEIGHT}, ${kb} KB`);
  console.log(`  logo drawn at ${LOGO_WIDTH}x${logoHeight} from a ${meta.width}x${meta.height} source`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
