import { PDFArray, PDFDict, PDFDocument, PDFName, PDFString } from "pdf-lib";
import { beforeAll, describe, expect, it } from "vitest";

import { buildReport } from "../engine";
import { REPORT_ASSETS } from "../../../../supabase/functions/_shared/report-assets";
import { renderReportPdf } from "../../../../supabase/functions/_shared/report-pdf";
import type { Answers } from "../../types";

/**
 * Link annotations in the generated report.
 *
 * These broke once in a way nothing visible would catch: `context.obj(url)`
 * maps a JavaScript string to a PDFName, so the URI was written as
 * `/https:#2F#2Fwww.foodallergy.org#2F...` — a leading slash, every "/"
 * escaped to "#2F", every "#" to "#23". The text on the page still read
 * correctly, so the report looked perfect and every link was dead.
 *
 * This renders a report that exercises every link in the template and checks
 * the annotations as PDF objects rather than as drawn text.
 */

const assets = REPORT_ASSETS;

/**
 * Answers chosen to trigger every resource-bearing rule at once: a training
 * recommendation (ServSafe link), an ingredient recommendation (FDA link), a
 * process recommendation (FARE link), and no allergen menu, which is what
 * renders the assistance section and its allergyvoices.com link.
 */
const ALL_LINKS: Answers = {
  allergy_process: "no_specific",
  staff_training: "none",
  ingredient_info: "no",
  who_to_ask: ["server"],
  cross_contact_steps: ["clean_surfaces"],
  allergy_menu: "no",
};

interface FoundLink {
  page: number;
  uri: unknown;
  value: string;
}

async function linksIn(answers: Answers): Promise<FoundLink[]> {
  const bytes = await renderReportPdf({
    restaurantName: "Link Test Kitchen",
    city: "Durham",
    state: "NC",
    generatedAt: new Date("2026-08-10T12:00:00Z"),
    report: buildReport(answers),
    assets,
  });

  const pdf = await PDFDocument.load(bytes);
  const found: FoundLink[] = [];

  for (const [index, page] of pdf.getPages().entries()) {
    const annots = page.node.get(PDFName.of("Annots"));
    if (!(annots instanceof PDFArray)) continue;

    for (let i = 0; i < annots.size(); i++) {
      const annotation = annots.lookup(i, PDFDict);
      const action = annotation.get(PDFName.of("A"));
      if (!(action instanceof PDFDict)) continue;
      const uri = action.get(PDFName.of("URI"));
      found.push({
        page: index + 1,
        uri,
        value: uri instanceof PDFString ? uri.asString() : String(uri),
      });
    }
  }
  return found;
}

describe("PDF link annotations", () => {
  let links: FoundLink[];

  beforeAll(async () => {
    links = await linksIn(ALL_LINKS);
  }, 30_000);

  it("renders link annotations at all", () => {
    expect(links.length).toBeGreaterThanOrEqual(6);
  });

  /** The exact defect: a PDFName URI, which carries a leading "/". */
  it("writes every URI as a PDF string, never a name", () => {
    for (const link of links) {
      expect(
        link.uri instanceof PDFString,
        `page ${link.page}: URI is ${link.uri?.constructor?.name}, not PDFString — ${link.value}`,
      ).toBe(true);
    }
  });

  it("starts every URL with exactly https://", () => {
    for (const link of links) {
      expect(link.value.startsWith("https://"), `bad URL: ${link.value}`).toBe(true);
      expect(link.value.startsWith("/"), `leading slash: ${link.value}`).toBe(false);
    }
  });

  it("never escapes a separator into a name entity", () => {
    // "#2F" for "/" and "#23" for "#" are what PDFName escaping produces.
    for (const link of links) {
      expect(link.value).not.toContain("#2F");
      expect(link.value).not.toContain("#23");
      expect(link.value).not.toMatch(/#[0-9A-Fa-f]{2}/);
    }
  });

  it("keeps the path separators intact", () => {
    for (const link of links) {
      // https:// plus at least a host; a mangled URL loses its slashes.
      expect(link.value).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$|#)/i);
    }
  });

  it("points only at the expected domains", () => {
    const allowed = [
      "allergyvoices.com",
      "www.foodallergy.org",
      "servsafe.com",
      "www.fda.gov",
    ];
    for (const link of links) {
      const host = new URL(link.value).hostname;
      expect(allowed, `unexpected host ${host}`).toContain(host);
    }
  });

  it("includes each cited resource", () => {
    const urls = links.map((l) => l.value);
    expect(urls).toContain("https://servsafe.com/ServSafe-Allergens");
    expect(urls).toContain("https://www.foodallergy.org/resources/restaurants");
    expect(urls).toContain("https://www.fda.gov/food/fda-food-code/food-code-2022");
    expect(urls).toContain("https://www.foodallergy.org/food-allergy-consumer-journey");
    expect(urls.some((u) => u.startsWith("https://allergyvoices.com/"))).toBe(true);
  });

  it("parses every URL", () => {
    for (const link of links) {
      expect(() => new URL(link.value)).not.toThrow();
    }
  });

  it("still produces sound links for a restaurant with no recommendations", async () => {
    const clean = await linksIn({
      allergy_process: "yes_documented",
      staff_training: "servers_and_kitchen",
      ingredient_info: "documented",
      who_to_ask: ["manager", "chef"],
      cross_contact_steps: ["clean_surfaces", "order_flagged", "manager_verifies"],
      allergy_menu: "yes_online",
    });
    expect(clean.length).toBeGreaterThan(0);
    for (const link of clean) {
      expect(link.uri instanceof PDFString).toBe(true);
      expect(link.value.startsWith("https://")).toBe(true);
    }
  }, 30_000);
});
