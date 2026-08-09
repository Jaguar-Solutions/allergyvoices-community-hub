/**
 * A small flowing-text layout engine over pdf-lib.
 *
 * pdf-lib draws at coordinates; it has no concept of a paragraph, a page
 * break, or running out of room. This adds the smallest layer that makes a
 * multi-page report possible: a cursor that moves down the page, wraps text to
 * a measured width, and starts a new page when it would otherwise draw past
 * the bottom margin.
 *
 * The part worth understanding is `keepTogether`. A heading stranded at the
 * foot of a page with its paragraph overleaf is the single thing that makes a
 * generated PDF look generated, so blocks that must not be split are measured
 * before they are drawn and moved wholesale to the next page if they don't
 * fit. Everything in the report that has a heading uses it.
 */

import {
  PDFDocument,
  PDFFont,
  PDFName,
  PDFPage,
  PDFString,
  rgb,
  type RGB,
} from "pdf-lib";

export const PAGE = { width: 612, height: 792 } as const; // US Letter, 72dpi
export const MARGIN = { top: 64, right: 56, bottom: 64, left: 56 } as const;
export const CONTENT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right;

/** Brand colors, converted from the HSL custom properties in src/index.css. */
export const COLOR = {
  cyan: rgb(0.28, 0.66, 0.74), // --brand-cyan  190 65% 48%
  coral: rgb(0.96, 0.45, 0.29), // --brand-coral 13 88% 62%
  sun: rgb(0.96, 0.79, 0.31), // --brand-sun   45 90% 58%
  spring: rgb(0.6, 0.79, 0.31), // --brand-spring 76 56% 51%
  ink: rgb(0.09, 0.11, 0.15),
  body: rgb(0.29, 0.33, 0.39),
  muted: rgb(0.55, 0.59, 0.64),
  hairline: rgb(0.89, 0.91, 0.93),
  panel: rgb(0.97, 0.98, 0.99),
  white: rgb(1, 1, 1),
} as const;

export interface Fonts {
  heading: PDFFont; // Poppins Bold
  subheading: PDFFont; // Poppins SemiBold
  body: PDFFont; // Helvetica
  bodyBold: PDFFont; // Helvetica-Bold
}

/**
 * Replace characters the PDF base-14 fonts cannot encode.
 *
 * Helvetica is WinAnsi-encoded, so anything outside Latin-1 throws at draw
 * time rather than rendering badly — and a restaurant name we cannot encode
 * would take down report generation entirely. Typographic punctuation is
 * mapped to its closest encodable form and anything still unencodable is
 * dropped, so a report always renders.
 */
const GLYPH_FALLBACK: Record<string, string> = {
  "\u2192": "\u00bb", // → right arrow
  "\u2190": "\u00ab", // ←
  "\u2022": "\u00b7", // • bullet
  "\u2713": "+", // ✓ check
  "\u2026": "...", // …
  "\u2011": "-", // non-breaking hyphen
  "\u00a0": " ", // non-breaking space
};

export function encodableText(value: string): string {
  let out = "";
  for (const char of value) {
    const mapped = GLYPH_FALLBACK[char];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    // Latin-1 plus the WinAnsi punctuation block pdf-lib maps from U+2018-201D
    // and U+2013/2014. Everything else is dropped rather than risking a throw.
    const code = char.codePointAt(0)!;
    if (code <= 0xff || (code >= 0x2013 && code <= 0x201d) || code === 0x20ac) {
      out += char;
    }
  }
  return out;
}

/** Split `text` into lines that each fit within `width` at `size`. */
export function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  width: number,
): string[] {
  // Normalise whitespace so a pasted answer with newlines and double spaces
  // doesn't produce ragged output.
  const words = encodableText(text).replace(/\s+/g, " ").trim().split(" ");
  if (words.length === 0 || words[0] === "") return [];

  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);

    // A single word longer than the column — a pasted URL, usually. Break it
    // by character rather than let it run off the page.
    if (font.widthOfTextAtSize(word, size) > width) {
      let chunk = "";
      for (const char of word) {
        if (font.widthOfTextAtSize(chunk + char, size) > width) {
          lines.push(chunk);
          chunk = char;
        } else {
          chunk += char;
        }
      }
      line = chunk;
    } else {
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function measureText(
  text: string,
  font: PDFFont,
  size: number,
  width: number,
  lineHeight: number,
): number {
  return wrapText(text, font, size, width).length * lineHeight;
}

interface TextOptions {
  font?: PDFFont;
  size?: number;
  color?: RGB;
  lineHeight?: number;
  /** Indent from the left margin. */
  indent?: number;
  /** Width available; defaults to the content width less the indent. */
  width?: number;
  /** Space added after the block. */
  after?: number;
}

/**
 * A document being built. Owns the page list, the vertical cursor, and the
 * running header/footer, so callers only think about content.
 */
export class ReportDoc {
  readonly pdf: PDFDocument;
  readonly fonts: Fonts;
  page: PDFPage;
  /** Distance from the top of the page to the next thing drawn. */
  y: number;
  pages: PDFPage[] = [];
  /** Pages before this index get no footer — the cover. */
  private footerFrom = 1;

  constructor(pdf: PDFDocument, fonts: Fonts) {
    this.pdf = pdf;
    this.fonts = fonts;
    this.page = pdf.addPage([PAGE.width, PAGE.height]);
    this.pages.push(this.page);
    this.y = MARGIN.top;
  }

  get remaining(): number {
    return PAGE.height - MARGIN.bottom - this.y;
  }

  /** Absolute Y for pdf-lib, which measures from the bottom edge. */
  private baseline(offset = 0): number {
    return PAGE.height - this.y - offset;
  }

  newPage(): void {
    this.page = this.pdf.addPage([PAGE.width, PAGE.height]);
    this.pages.push(this.page);
    this.y = MARGIN.top;
  }

  /** Start a new page unless at least `height` points remain. */
  ensure(height: number): void {
    if (this.remaining < height) this.newPage();
  }

  space(points: number): void {
    this.y += points;
  }

  /**
   * Draw a block only where it fits whole.
   *
   * `measure` is run first; if the block is taller than what's left, the page
   * breaks before anything is drawn. This is what stops a section heading
   * being orphaned at the bottom of a page.
   */
  keepTogether(measure: () => number, draw: () => void): void {
    const height = measure();
    // A block taller than a whole page can't be kept together; drawing it is
    // better than looping forever on empty pages.
    if (height <= PAGE.height - MARGIN.top - MARGIN.bottom) this.ensure(height);
    draw();
  }

  text(content: string, options: TextOptions = {}): void {
    const {
      font = this.fonts.body,
      size = 10.5,
      color = COLOR.body,
      lineHeight = size * 1.45,
      indent = 0,
      after = 0,
    } = options;
    const width = options.width ?? CONTENT_WIDTH - indent;

    for (const line of wrapText(content, font, size, width)) {
      // Mid-paragraph break: keep flowing onto the next page rather than
      // clipping. Long free-text answers rely on this.
      if (this.remaining < lineHeight) this.newPage();
      this.page.drawText(line, {
        x: MARGIN.left + indent,
        y: this.baseline(size),
        size,
        font,
        color,
      });
      this.y += lineHeight;
    }
    this.y += after;
  }

  /** Height `text()` would occupy, without drawing. */
  measure(content: string, options: TextOptions = {}): number {
    const {
      font = this.fonts.body,
      size = 10.5,
      lineHeight = size * 1.45,
      indent = 0,
      after = 0,
    } = options;
    const width = options.width ?? CONTENT_WIDTH - indent;
    return measureText(content, font, size, width, lineHeight) + after;
  }

  rule(color: RGB = COLOR.hairline, after = 0): void {
    this.ensure(8);
    this.page.drawLine({
      start: { x: MARGIN.left, y: this.baseline(0) },
      end: { x: PAGE.width - MARGIN.right, y: this.baseline(0) },
      thickness: 0.75,
      color,
    });
    this.y += after;
  }

  /** Filled rectangle in page coordinates, measured from the current cursor. */
  rect(opts: {
    x?: number;
    width?: number;
    height: number;
    color: RGB;
    offsetY?: number;
    radius?: number;
  }): void {
    const { x = MARGIN.left, width = CONTENT_WIDTH, height, color, offsetY = 0 } = opts;
    this.page.drawRectangle({
      x,
      y: this.baseline(height + offsetY),
      width,
      height,
      color,
    });
  }

  /** A small filled circle used as a bullet or a check mark ground. */
  dot(x: number, offsetY: number, radius: number, color: RGB): void {
    this.page.drawCircle({ x, y: this.baseline(offsetY), size: radius, color });
  }

  link(rect: { x: number; y: number; width: number; height: number }, url: string): void {
    // pdf-lib has no high-level link API, so this writes the annotation
    // directly. Without it, resource URLs would be text a reader has to retype.
    //
    // URI must be PDFString.of(url), not the bare string. `context.obj()` maps
    // a JavaScript string to a PDFName, which prefixes it with "/" and escapes
    // every "/" as "#2F" and "#" as "#23" — turning a working URL into
    // "/https:#2F#2Fexample.com" and breaking the link in every reader. Type,
    // Subtype and S are genuinely names, so those stay as they are.
    const annotation = this.pdf.context.register(
      this.pdf.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [rect.x, rect.y, rect.x + rect.width, rect.y + rect.height],
        Border: [0, 0, 0],
        A: {
          Type: "Action",
          S: "URI",
          URI: PDFString.of(url),
        },
      }),
    );
    const existing = this.page.node.Annots();
    if (existing) {
      existing.push(annotation);
    } else {
      this.page.node.set(PDFName.of("Annots"), this.pdf.context.obj([annotation]));
    }
  }

  /** Draw a hyperlinked line of text and register the clickable region. */
  linkText(label: string, url: string, options: TextOptions = {}): void {
    const { font = this.fonts.body, size = 9.5, indent = 0 } = options;
    const safe = encodableText(label);
    const width = font.widthOfTextAtSize(safe, size);
    if (this.remaining < size * 1.45) this.newPage();

    const y = this.baseline(size);
    this.page.drawText(safe, {
      x: MARGIN.left + indent,
      y,
      size,
      font,
      color: COLOR.cyan,
    });
    this.link(
      { x: MARGIN.left + indent, y: y - 2, width, height: size + 4 },
      url,
    );
    this.y += size * 1.45 + (options.after ?? 0);
  }

  /**
   * Page numbers and the standing footer, applied once at the end so the
   * total page count is known and the cover can be skipped.
   */
  finish(footerNote: string): void {
    const total = this.pages.length;
    this.pages.forEach((page, index) => {
      if (index < this.footerFrom) return;
      const y = MARGIN.bottom - 26;

      page.drawLine({
        start: { x: MARGIN.left, y: y + 22 },
        end: { x: PAGE.width - MARGIN.right, y: y + 22 },
        thickness: 0.75,
        color: COLOR.hairline,
      });
      page.drawText(encodableText(footerNote), {
        x: MARGIN.left,
        y,
        size: 8,
        font: this.fonts.body,
        color: COLOR.muted,
      });

      const label = `Page ${index + 1} of ${total}`;
      const width = this.fonts.body.widthOfTextAtSize(label, 8);
      page.drawText(label, {
        x: PAGE.width - MARGIN.right - width,
        y,
        size: 8,
        font: this.fonts.body,
        color: COLOR.muted,
      });
    });
  }
}
