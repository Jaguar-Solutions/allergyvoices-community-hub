/**
 * Renders the Restaurant Allergy Practices Improvement Report to a PDF.
 *
 * Content comes from the deterministic rules engine; this file only decides
 * how it sits on the page. Nothing here writes a sentence of food-safety
 * guidance — every recommendation string arrives already written.
 *
 * Layout rules that matter, all enforced through `keepTogether`:
 *   - a section heading is never the last thing on a page
 *   - a recommendation's title, body and actions move to the next page as one
 *   - long free text flows across pages rather than being clipped
 */

import { PDFDocument, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import {
  COLOR,
  CONTENT_WIDTH,
  MARGIN,
  PAGE,
  ReportDoc,
  type Fonts,
} from "./report-layout.ts";

export interface ReportInput {
  restaurantName: string;
  city: string;
  state: string;
  contactName?: string;
  generatedAt: Date;
  report: {
    strengths: { id: string; title: string; detail?: string }[];
    recommendations: {
      id: string;
      priority: "high" | "medium" | "low";
      title: string;
      body: string;
      actions: string[];
      resource?: { label: string; url: string };
    }[];
    nextSteps: string[];
    showAllergenMenuOffer: boolean;
  };
  assets: {
    logoPng: Uint8Array;
    poppinsBold: Uint8Array;
    poppinsSemiBold: Uint8Array;
  };
}

const PRIORITY_LABEL = {
  high: "PRIORITY OPPORTUNITY",
  medium: "RECOMMENDED NEXT STEP",
  low: "WORTH CONSIDERING",
} as const;

const PRIORITY_COLOR = {
  high: COLOR.coral,
  medium: COLOR.cyan,
  low: COLOR.spring,
} as const;

const DISCLAIMER =
  "This report is based solely on information voluntarily provided by the restaurant and is intended for educational and informational purposes. Recommendations are general suggestions for consideration and are not a certification, inspection, legal opinion, or guarantee of allergy safety. Allergy Voices does not inspect, certify, approve, or guarantee restaurant allergy practices. Restaurants are responsible for determining which practices are appropriate for their operations and for complying with applicable laws and regulations.";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function renderReportPdf(input: ReportInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fonts: Fonts = {
    // subset: only the glyphs actually used are embedded, which keeps a
    // typical report well under 200 KB despite two display faces.
    heading: await pdf.embedFont(input.assets.poppinsBold, { subset: true }),
    subheading: await pdf.embedFont(input.assets.poppinsSemiBold, { subset: true }),
    body: await pdf.embedFont(StandardFonts.Helvetica),
    bodyBold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };

  pdf.setTitle(`Restaurant Allergy Practices Improvement Report — ${input.restaurantName}`);
  pdf.setAuthor("Allergy Voices");
  pdf.setSubject("Restaurant allergy practices improvement report");
  pdf.setCreator("Allergy Voices");
  pdf.setProducer("Allergy Voices");

  const doc = new ReportDoc(pdf, fonts);
  const date = formatDate(input.generatedAt);
  const logo = await pdf.embedPng(input.assets.logoPng);

  drawCover(doc, input, logo, date);
  drawExecutiveSummary(doc, input, date);
  drawStrengths(doc, input);
  drawOpportunities(doc, input);
  drawNextSteps(doc, input);
  drawBusinessOpportunity(doc);
  if (input.report.showAllergenMenuOffer) drawAllergenMenuOffer(doc);
  drawResources(doc, input);
  drawDisclaimer(doc);

  doc.finish(`Allergy Voices  ·  allergyvoices.com  ·  Generated ${date}`);
  return pdf.save();
}

// --- cover ------------------------------------------------------------------

function drawCover(
  doc: ReportDoc,
  input: ReportInput,
  logo: { width: number; height: number },
  date: string,
) {
  const { page } = doc;

  // A single brand rule across the head of the page. The site uses this
  // three-colour gradient; three abutting bars read the same way in print and
  // survive black-and-white printing better than a gradient would.
  const barY = PAGE.height - 10;
  const third = PAGE.width / 3;
  [COLOR.cyan, COLOR.sun, COLOR.coral].forEach((color, i) => {
    page.drawRectangle({ x: third * i, y: barY, width: third, height: 10, color });
  });

  // 600x222 source drawn at 168pt wide — about 260dpi effective, so it stays
  // crisp without upscaling.
  const logoWidth = 168;
  const logoHeight = (logo.height / logo.width) * logoWidth;
  page.drawImage(logo as never, {
    x: MARGIN.left,
    y: PAGE.height - 150,
    width: logoWidth,
    height: logoHeight,
  });

  doc.y = 210;
  doc.text("Restaurant Allergy Practices", {
    font: doc.fonts.heading,
    size: 30,
    color: COLOR.ink,
    lineHeight: 36,
  });
  doc.text("Improvement Report", {
    font: doc.fonts.heading,
    size: 30,
    color: COLOR.ink,
    lineHeight: 36,
    after: 14,
  });

  doc.text("Practical opportunities to strengthen food allergy transparency and service", {
    size: 11.5,
    color: COLOR.muted,
    after: 30,
  });

  doc.rect({ height: 3, color: COLOR.cyan, width: 64 });
  doc.space(26);

  doc.text(input.restaurantName, {
    font: doc.fonts.heading,
    size: 22,
    color: COLOR.ink,
    lineHeight: 27,
  });
  doc.text(`${input.city}, ${input.state}`, {
    size: 12,
    color: COLOR.body,
    after: 46,
  });

  const label = { font: doc.fonts.bodyBold, size: 8.5, color: COLOR.muted };
  const value = { size: 11, color: COLOR.ink, after: 16 };

  doc.text("PREPARED FOR", label);
  doc.text(input.restaurantName, value);
  doc.text("PREPARED BY", label);
  doc.text("Allergy Voices", value);
  doc.text("REPORT DATE", label);
  doc.text(date, { ...value, after: 0 });
}

// --- executive summary ------------------------------------------------------

function sectionHeading(doc: ReportDoc, title: string, kicker?: string) {
  doc.keepTogether(
    () => (kicker ? 14 : 0) + 30 + 18,
    () => {
      if (kicker) {
        doc.text(kicker.toUpperCase(), {
          font: doc.fonts.bodyBold,
          size: 8.5,
          color: COLOR.cyan,
          lineHeight: 14,
        });
      }
      doc.text(title, {
        font: doc.fonts.heading,
        size: 17,
        color: COLOR.ink,
        lineHeight: 22,
        after: 6,
      });
      doc.rect({ height: 2, color: COLOR.cyan, width: 40 });
      doc.space(16);
    },
  );
}

function drawExecutiveSummary(doc: ReportDoc, input: ReportInput, date: string) {
  doc.newPage();
  sectionHeading(doc, "Executive summary");

  // Identity panel: the three facts someone forwarding this internally needs
  // at a glance.
  const rows: [string, string][] = [
    ["Restaurant", input.restaurantName],
    ["Location", `${input.city}, ${input.state}`],
    ["Report date", date],
  ];

  doc.keepTogether(
    () => rows.length * 20 + 24,
    () => {
      const height = rows.length * 20 + 20;
      doc.rect({ height, color: COLOR.panel });
      doc.space(12);
      for (const [label, value] of rows) {
        doc.page.drawText(label, {
          x: MARGIN.left + 14,
          y: PAGE.height - doc.y - 9,
          size: 9,
          font: doc.fonts.bodyBold,
          color: COLOR.muted,
        });
        doc.page.drawText(value, {
          x: MARGIN.left + 110,
          y: PAGE.height - doc.y - 9,
          size: 10,
          font: doc.fonts.body,
          color: COLOR.ink,
        });
        doc.y += 20;
      }
      doc.space(22);
    },
  );

  doc.text(
    "Thank you for participating in the Allergy Voices Restaurant Transparency Program.",
    { size: 11, color: COLOR.ink, after: 10 },
  );
  doc.text(
    "This report is based on the information your restaurant shared with Allergy Voices. It highlights practices you already have in place and identifies practical opportunities that may help strengthen food allergy communication, transparency, and service.",
    { after: 24 },
  );
}

// --- strengths --------------------------------------------------------------

function drawStrengths(doc: ReportDoc, input: ReportInput) {
  const { strengths } = input.report;
  if (strengths.length === 0) return;

  sectionHeading(doc, "What you're already doing well");

  for (const strength of strengths) {
    const titleHeight = doc.measure(strength.title, {
      font: doc.fonts.bodyBold,
      size: 10.5,
      indent: 22,
    });
    const detailHeight = strength.detail
      ? doc.measure(strength.detail, { size: 9.5, indent: 22 })
      : 0;

    doc.keepTogether(
      () => titleHeight + detailHeight + 10,
      () => {
        const markY = doc.y;
        doc.text(strength.title, {
          font: doc.fonts.bodyBold,
          size: 10.5,
          color: COLOR.ink,
          indent: 22,
        });

        // Check mark drawn as two strokes: a font glyph would depend on a
        // symbol face being present, this cannot fail to render.
        const cy = PAGE.height - markY - 7;
        doc.page.drawCircle({ x: MARGIN.left + 7, y: cy, size: 7, color: COLOR.spring });
        doc.page.drawLine({
          start: { x: MARGIN.left + 3.6, y: cy },
          end: { x: MARGIN.left + 6, y: cy - 2.6 },
          thickness: 1.4,
          color: COLOR.white,
        });
        doc.page.drawLine({
          start: { x: MARGIN.left + 6, y: cy - 2.6 },
          end: { x: MARGIN.left + 10.6, y: cy + 3 },
          thickness: 1.4,
          color: COLOR.white,
        });

        if (strength.detail) {
          doc.text(strength.detail, { size: 9.5, color: COLOR.body, indent: 22 });
        }
        doc.space(10);
      },
    );
  }
  doc.space(14);
}

// --- opportunities ----------------------------------------------------------

function drawOpportunities(doc: ReportDoc, input: ReportInput) {
  const { recommendations } = input.report;
  if (recommendations.length === 0) {
    sectionHeading(doc, "Your top opportunities");
    doc.text(
      "Based on what you shared, we did not identify specific opportunities to suggest at this time. That is a good position to be in — the practices you described already cover the areas this program asks about.",
      { after: 20 },
    );
    return;
  }

  sectionHeading(doc, "Your top opportunities");

  for (const rec of recommendations) {
    const titleHeight = doc.measure(rec.title, {
      font: doc.fonts.subheading,
      size: 13,
      lineHeight: 17,
      indent: 14,
      width: CONTENT_WIDTH - 28,
    });
    const bodyHeight = doc.measure(rec.body, {
      indent: 14,
      width: CONTENT_WIDTH - 28,
    });
    const actionsHeight = rec.actions.reduce(
      (total, action) =>
        total +
        doc.measure(action, { size: 10, indent: 28, width: CONTENT_WIDTH - 42 }) +
        2,
      rec.actions.length > 0 ? 12 : 0,
    );
    const resourceHeight = rec.resource ? 20 : 0;

    // The whole recommendation moves together: a title on one page with its
    // actions on the next is exactly what makes a report look auto-generated.
    doc.keepTogether(
      () => 16 + titleHeight + bodyHeight + actionsHeight + resourceHeight + 26,
      () => {
        const top = doc.y;

        doc.text(PRIORITY_LABEL[rec.priority], {
          font: doc.fonts.bodyBold,
          size: 8,
          color: PRIORITY_COLOR[rec.priority],
          lineHeight: 13,
          indent: 14,
        });
        doc.text(rec.title, {
          font: doc.fonts.subheading,
          size: 13,
          color: COLOR.ink,
          lineHeight: 17,
          indent: 14,
          width: CONTENT_WIDTH - 28,
          after: 4,
        });
        doc.text(rec.body, {
          indent: 14,
          width: CONTENT_WIDTH - 28,
          after: rec.actions.length > 0 ? 10 : 0,
        });

        for (const action of rec.actions) {
          const bulletY = doc.y;
          doc.text(action, { size: 10, indent: 28, width: CONTENT_WIDTH - 42 });
          doc.page.drawCircle({
            x: MARGIN.left + 18,
            y: PAGE.height - bulletY - 6,
            size: 1.7,
            color: COLOR.muted,
          });
          doc.space(2);
        }

        if (rec.resource) {
          doc.space(6);
          doc.linkText(`\u00bb  ${rec.resource.label}`, rec.resource.url, { indent: 14 });
        }

        // Accent bar down the left of the block, drawn last now that the
        // block's real height is known.
        doc.page.drawRectangle({
          x: MARGIN.left,
          y: PAGE.height - doc.y,
          width: 3,
          height: doc.y - top,
          color: PRIORITY_COLOR[rec.priority],
        });
        doc.space(22);
      },
    );
  }
}

// --- next steps -------------------------------------------------------------

function drawNextSteps(doc: ReportDoc, input: ReportInput) {
  const steps = input.report.nextSteps;
  if (steps.length === 0) return;

  sectionHeading(doc, `Your next ${steps.length === 3 ? "3" : String(steps.length)} steps`);

  for (const [index, step] of steps.entries()) {
    doc.keepTogether(
      () => doc.measure(step, { font: doc.fonts.bodyBold, size: 11, indent: 30 }) + 14,
      () => {
        const top = doc.y;
        doc.text(step, {
          font: doc.fonts.bodyBold,
          size: 11,
          color: COLOR.ink,
          indent: 30,
        });
        doc.page.drawCircle({
          x: MARGIN.left + 10,
          y: PAGE.height - top - 6,
          size: 10,
          color: COLOR.cyan,
        });
        doc.page.drawText(String(index + 1), {
          x: MARGIN.left + 7,
          y: PAGE.height - top - 9.5,
          size: 10,
          font: doc.fonts.bodyBold,
          color: COLOR.white,
        });
        doc.space(14);
      },
    );
  }
  doc.space(14);
}

// --- business opportunity ---------------------------------------------------

function drawBusinessOpportunity(doc: ReportDoc) {
  sectionHeading(doc, "Why allergy transparency can be good for business");

  doc.text(
    "Food allergy accommodations are not only about safety and inclusion. Clear allergy information can also help restaurants become easier to evaluate for families who research dining options before they visit.",
    { after: 10 },
  );
  doc.text(
    "For many families, one person's food allergy influences where the entire group chooses to eat. Making allergen and ingredient information easier to find online can help those families decide whether to contact or visit a restaurant.",
    { after: 10 },
  );
  doc.text(
    "Industry research into how food allergy families choose where to eat describes a sizeable and deliberate audience — one that routinely reviews menus and allergen information before making a decision.",
    { after: 16 },
  );

  // Callout. The panel is drawn before the text, not after: pdf-lib paints in
  // call order, so a background rectangle drawn last covers everything under
  // it. Height is measured up front so the panel can come first.
  const calloutTitle = "BE EASIER TO FIND BEFORE THE FAMILY LEAVES HOME";
  const calloutBody =
    "Many families research menus, allergen information, and restaurant procedures before deciding where to eat. Information that is easy to find online reaches them at the point the decision is actually made.";

  doc.keepTogether(
    () =>
      28 +
      doc.measure(calloutTitle, {
        font: doc.fonts.bodyBold,
        size: 9,
        indent: 16,
        width: CONTENT_WIDTH - 32,
        after: 6,
      }) +
      doc.measure(calloutBody, { indent: 16, width: CONTENT_WIDTH - 32 }),
    () => {
      const inner =
        doc.measure(calloutTitle, {
          font: doc.fonts.bodyBold,
          size: 9,
          indent: 16,
          width: CONTENT_WIDTH - 32,
          after: 6,
        }) + doc.measure(calloutBody, { indent: 16, width: CONTENT_WIDTH - 32 });
      const height = inner + 28;

      doc.rect({ height, color: COLOR.panel });
      doc.rect({ height, color: COLOR.sun, width: 3 });

      doc.space(14);
      doc.text(calloutTitle, {
        font: doc.fonts.bodyBold,
        size: 9,
        color: COLOR.ink,
        indent: 16,
        width: CONTENT_WIDTH - 32,
        after: 6,
      });
      doc.text(calloutBody, { indent: 16, width: CONTENT_WIDTH - 32 });
      doc.space(14);
      doc.space(18);
    },
  );

  doc.text("Sources", {
    font: doc.fonts.bodyBold,
    size: 9,
    color: COLOR.muted,
    after: 4,
  });
  doc.linkText(
    "FARE — The Food Allergy Consumer Journey",
    "https://www.foodallergy.org/food-allergy-consumer-journey",
  );
  doc.linkText(
    "FARE and EveryBite — restaurant allergen visibility report",
    "https://www.foodallergy.org/media-room/fare-and-everybite-partner-new-report-restaurant-operators-provide-visibility-their-food",
    { after: 20 },
  );
}

// --- allergen menu assistance ----------------------------------------------

/**
 * Only rendered when the restaurant has no online allergen menu.
 *
 * Three options are given, and ours is third. That ordering is deliberate: a
 * report that routes every problem to a service we sell stops being useful
 * advice, and a restaurant can tell the difference immediately.
 */
function drawAllergenMenuOffer(doc: ReportDoc) {
  sectionHeading(doc, "Make your allergy information easier to find");

  doc.text(
    "Your survey indicates that allergen information is not currently available online. Publishing an allergen menu or ingredient guide can make it easier for food-allergy families to research your restaurant before they visit, and can give your staff a consistent reference when answering questions.",
    { after: 18 },
  );

  doc.text("WAYS TO GET STARTED", {
    font: doc.fonts.bodyBold,
    size: 9,
    color: COLOR.muted,
    after: 10,
  });

  const options: [string, string][] = [
    [
      "Option 1 — Do it internally",
      "Build an allergen guide from your existing recipes and supplier ingredient information.",
    ],
    [
      "Option 2 — Work with a specialist",
      "A qualified food-safety or allergen consultant, or a menu-management provider, can produce one for you.",
    ],
    [
      "Option 3 — Get help from Allergy Voices",
      "Allergy Voices can assist restaurants with organizing ingredient information and developing a clear allergen menu or ingredient guide.",
    ],
  ];

  for (const [title, body] of options) {
    doc.keepTogether(
      () =>
        doc.measure(title, { font: doc.fonts.bodyBold, size: 10.5, indent: 14 }) +
        doc.measure(body, { indent: 14 }) +
        12,
      () => {
        doc.text(title, {
          font: doc.fonts.bodyBold,
          size: 10.5,
          color: COLOR.ink,
          indent: 14,
        });
        doc.text(body, { indent: 14, after: 12 });
      },
    );
  }

  doc.linkText(
    "\u00bb  Learn about Allergy Voices allergen-menu assistance",
    "https://allergyvoices.com/restaurants#how-it-works",
    { after: 10 },
  );

  doc.text(
    "Using Allergy Voices services is completely optional and has no effect on your restaurant's directory listing.",
    { size: 9.5, color: COLOR.muted, after: 22 },
  );
}

// --- resources --------------------------------------------------------------

function drawResources(doc: ReportDoc, input: ReportInput) {
  // Only what is relevant: the resources the recommendations already pointed
  // at, plus the two general references, deduplicated.
  const cited = new Map<string, string>();
  for (const rec of input.report.recommendations) {
    if (rec.resource) cited.set(rec.resource.url, rec.resource.label);
  }
  cited.set(
    "https://www.fda.gov/food/fda-food-code/food-code-2022",
    "FDA Food Code (2022)",
  );
  cited.set(
    "https://www.foodallergy.org/resources/restaurants",
    "FARE restaurant resources",
  );

  sectionHeading(doc, "Trusted resources");
  for (const [url, label] of cited) {
    doc.keepTogether(
      () => 28,
      () => {
        doc.text(label, {
          font: doc.fonts.bodyBold,
          size: 10,
          color: COLOR.ink,
          lineHeight: 14,
        });
        doc.linkText(url, url, { size: 8.5, after: 8 });
      },
    );
  }
  doc.space(12);
}

// --- disclaimer -------------------------------------------------------------

function drawDisclaimer(doc: ReportDoc) {
  const title = "ABOUT THIS REPORT";
  const titleOpts = {
    font: doc.fonts.bodyBold,
    size: 8.5,
    indent: 14,
    width: CONTENT_WIDTH - 28,
    after: 5,
  };
  const bodyOpts = {
    size: 8.5,
    lineHeight: 12,
    indent: 14,
    width: CONTENT_WIDTH - 28,
  };
  const inner = doc.measure(title, titleOpts) + doc.measure(DISCLAIMER, bodyOpts);
  const height = inner + 28;

  doc.keepTogether(
    () => height,
    () => {
      // Panel first, then the text on top of it — see the callout above.
      doc.rect({ height, color: COLOR.panel });
      doc.space(14);
      doc.text(title, { ...titleOpts, color: COLOR.muted });
      doc.text(DISCLAIMER, { ...bodyOpts, color: COLOR.body });
      doc.space(14);
    },
  );
}

/** `AllergyVoices_The_Fixture_Kitchen_Improvement_Report_2026-08-10.pdf` */
export function reportFilename(restaurantName: string, generatedAt: Date): string {
  const safe = restaurantName
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .slice(0, 60) || "Restaurant";
  const date = generatedAt.toISOString().slice(0, 10);
  return `AllergyVoices_${safe}_Improvement_Report_${date}.pdf`;
}
