#!/usr/bin/env tsx
/**
 * One-shot script: takes a white-background logo PNG, replaces the white
 * with transparency, trims whitespace, and writes optimized PNG copies to
 * the public/ and src/assets/ folders.
 *
 * Usage:
 *   npx tsx scripts/process-logo.ts <source.png>
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const ASSETS_DIR = join(ROOT, "src/assets");

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error("Usage: npx tsx scripts/process-logo.ts <source.png>");
  process.exit(1);
}

// Threshold for "white-ish" pixels that become transparent. 240 is fairly
// aggressive but safe for clean logo art on a pure white background.
const WHITE_THRESHOLD = 235;

async function makeWhiteTransparent(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Walk each RGBA pixel. If R, G, and B are all near-white, fade to alpha=0
  // proportional to how close to white they are (preserves anti-aliased edges).
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const min = Math.min(r, g, b);
    if (min >= WHITE_THRESHOLD) {
      // Pure-white-ish: fully transparent
      data[i + 3] = 0;
    } else if (min > 200) {
      // Partial white (anti-aliased edge): scale alpha down proportionally
      const fade = (min - 200) / (WHITE_THRESHOLD - 200);
      data[i + 3] = Math.max(0, Math.round(data[i + 3]! * (1 - fade)));
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function writeSized(
  source: Buffer,
  filename: string,
  width: number,
): Promise<void> {
  const buf = await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  const publicPath = join(PUBLIC_DIR, filename);
  const assetsPath = join(ASSETS_DIR, filename);
  await sharp(buf).toFile(publicPath);
  await sharp(buf).toFile(assetsPath);
  const meta = await sharp(buf).metadata();
  console.log(
    `  ${filename}: ${meta.width}x${meta.height}, ${(buf.length / 1024).toFixed(1)} kB`,
  );
}

/**
 * Build a square favicon by extracting the leftmost square of the trimmed
 * logo (the icons cluster: strawberry, wheat, peanut, bean) and giving it a
 * subtle padded background. The wordmark is too wide to be legible as a
 * favicon, so we use the icon block as the brand mark at small sizes.
 */
async function writeFavicon(trimmed: Buffer, sizes: number[]): Promise<void> {
  const meta = await sharp(trimmed).metadata();
  const h = meta.height ?? 0;
  // Pick a square crop sized to the logo's height, anchored at the top-left.
  // That captures the icon cluster and the very start of "Allergy" text.
  const sq = await sharp(trimmed)
    .extract({ left: 0, top: 0, width: h, height: h })
    .png()
    .toBuffer();

  for (const size of sizes) {
    const filename = `favicon-${size}.png`;
    const buf = await sharp(sq)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await sharp(buf).toFile(join(PUBLIC_DIR, filename));
    console.log(`  ${filename}: ${size}x${size}, ${(buf.length / 1024).toFixed(1)} kB`);
  }

  // Apple touch icon (180x180), with a soft white background since iOS adds
  // its own rounded square mask and a transparent icon looks bad there.
  const apple = await sharp(sq)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await sharp(apple).toFile(join(PUBLIC_DIR, "apple-touch-icon.png"));
  console.log(`  apple-touch-icon.png: 180x180, ${(apple.length / 1024).toFixed(1)} kB`);
}

async function main() {
  console.log(`Reading ${sourcePath}...`);
  const sourceBuf = readFileSync(sourcePath);

  console.log("Removing white background + anti-alias halo...");
  const transparent = await makeWhiteTransparent(sourceBuf);

  console.log("Trimming whitespace...");
  const trimmed = await sharp(transparent).trim().png().toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();
  console.log(
    `  Trimmed bounds: ${trimmedMeta.width}x${trimmedMeta.height}`,
  );

  console.log("Writing sized variants:");
  // Main logo: wide, used in nav/footer/hero. 600px wide is plenty for retina
  // at the largest place we display it (the build pipeline compresses further).
  await writeSized(trimmed, "allergy-voices-logo.png", 600);

  console.log("Writing favicons:");
  await writeFavicon(trimmed, [16, 32, 48, 64]);

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
