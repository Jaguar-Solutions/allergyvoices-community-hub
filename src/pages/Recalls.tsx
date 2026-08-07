import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import {
  Container,
  Disclaimer,
  PageHeader,
  PageLayout,
  Section,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecallCard } from "@/components/content/RecallCard";
import { getPublishedRecalls } from "@/content";
import { ALLERGEN_LABELS, type Allergen, type RecallAlert } from "@/content/schemas";
import { ALLERGEN_TINT_BG } from "@/components/content/allergen-tints";
import { cn } from "@/lib/utils";

/** Radix Select can't take an empty string as an item value. */
const ANY = "__any__";

/** How many to render before "show more". 65 cards is a 21-metre page. */
const PAGE_SIZE = 24;

const AGENCY_OPTIONS: Array<{ value: RecallAlert["agency"]; label: string }> = [
  { value: "fda", label: "FDA" },
  { value: "usda-fsis", label: "USDA FSIS" },
  { value: "cfia", label: "CFIA (Canada)" },
  { value: "fsa-uk", label: "FSA (UK)" },
];

/**
 * Recalls, newest first, in three buckets.
 *
 * A recall matters most in the days after it is announced, so the list is
 * grouped by how recent it is rather than presented as one undifferentiated
 * run. Someone checking "is there anything new this week" should be able to
 * answer that without scrolling.
 */
function bucketFor(dateString: string): "week" | "month" | "older" {
  const date = new Date(`${dateString}T00:00:00`);
  const days = (Date.now() - date.getTime()) / 86_400_000;
  if (days <= 7) return "week";
  if (days <= 30) return "month";
  return "older";
}

const BUCKET_LABELS = {
  week: "This week",
  month: "Earlier this month",
  older: "Older recalls",
} as const;

const Recalls = () => {
  const all = getPublishedRecalls();

  const [query, setQuery] = useState("");
  const [allergen, setAllergen] = useState("");
  const [agency, setAgency] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Only offer allergens that actually appear, so no filter leads to nothing.
  const presentAllergens = useMemo(() => {
    const set = new Set<Allergen>();
    all.forEach((r) => r.undeclared_allergens.forEach((a) => set.add(a)));
    return [...set].sort((a, b) => ALLERGEN_LABELS[a].localeCompare(ALLERGEN_LABELS[b]));
  }, [all]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((r) => {
      if (allergen && !r.undeclared_allergens.includes(allergen as Allergen)) return false;
      if (agency && r.agency !== agency) return false;
      if (q) {
        const haystack = `${r.product_name} ${r.brand ?? ""} ${r.recall_reason}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [all, query, allergen, agency]);

  const hasFilters = query.trim() !== "" || allergen !== "" || agency !== "";
  const shown = results.slice(0, visible);

  // Group the rendered slice, keeping the newest-first order within each bucket.
  const groups = useMemo(() => {
    const out: Array<{ key: keyof typeof BUCKET_LABELS; items: RecallAlert[] }> = [];
    for (const key of ["week", "month", "older"] as const) {
      const items = shown.filter((r) => bucketFor(r.recall_date) === key);
      if (items.length) out.push({ key, items });
    }
    return out;
  }, [shown]);

  const reset = () => {
    setQuery("");
    setAllergen("");
    setAgency("");
    setVisible(PAGE_SIZE);
  };

  const thisWeek = all.filter((r) => bucketFor(r.recall_date) === "week").length;

  return (
    <PageLayout>
      <SEOHead
        title="Recalls and Alerts"
        description="Food allergen recalls and alerts pulled from FDA, USDA FSIS, Canada, and UK FSA, with structured details and links to the official source."
      />
      <PageHeader
        eyebrow="Recalls & alerts"
        title="Allergen recalls from official sources"
        intro={
          thisWeek > 0
            ? `${thisWeek} new in the past week. Every entry is built from an official feed and links back to the source so you can verify it directly.`
            : "Built from FDA, USDA FSIS, Canada, and UK FSA feeds. Every entry links back to the official source so you can verify it directly."
        }
        breadcrumbs={[{ label: "Recalls & Alerts" }]}
      />

      <Section spacing="sm">
        <Container width="wide">
          <div className="rounded-2xl border border-border bg-background-subtle p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="flex items-center gap-2 font-poppins font-semibold text-foreground">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Find a recall
              </h2>
              <p className="font-inter text-sm text-muted-foreground" role="status">
                <span className="font-semibold text-foreground">{results.length}</span>{" "}
                {results.length === 1 ? "recall" : "recalls"}
                {hasFilters ? " match" : ""}
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="recall-search" className="font-inter text-sm font-medium">
                  Product or brand
                </Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="recall-search"
                    type="search"
                    className="pl-9"
                    placeholder="Search recalls"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setVisible(PAGE_SIZE);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recall-allergen" className="font-inter text-sm font-medium">
                  Allergen
                </Label>
                <Select
                  value={allergen || ANY}
                  onValueChange={(v) => {
                    setAllergen(v === ANY ? "" : v);
                    setVisible(PAGE_SIZE);
                  }}
                >
                  <SelectTrigger id="recall-allergen">
                    <SelectValue placeholder="Any allergen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any allergen</SelectItem>
                    {presentAllergens.map((a) => (
                      <SelectItem key={a} value={a}>
                        {ALLERGEN_LABELS[a]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recall-agency" className="font-inter text-sm font-medium">
                  Source
                </Label>
                <Select
                  value={agency || ANY}
                  onValueChange={(v) => {
                    setAgency(v === ANY ? "" : v);
                    setVisible(PAGE_SIZE);
                  }}
                >
                  <SelectTrigger id="recall-agency">
                    <SelectValue placeholder="Any source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Any source</SelectItem>
                    {AGENCY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* One tap to the thing most people came for. */}
            {presentAllergens.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-inter text-sm text-muted-foreground">
                  Jump to:
                </span>
                {presentAllergens.slice(0, 6).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      setAllergen(allergen === a ? "" : a);
                      setVisible(PAGE_SIZE);
                    }}
                    aria-pressed={allergen === a}
                    className={cn(
                      "rounded-full px-3 py-1.5 font-inter text-sm font-medium text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      ALLERGEN_TINT_BG[a],
                      allergen === a
                        ? "ring-2 ring-foreground/40"
                        : "opacity-80 hover:opacity-100",
                    )}
                  >
                    {ALLERGEN_LABELS[a]}
                  </button>
                ))}
                {hasFilters && (
                  <Button type="button" variant="ghost" size="sm" onClick={reset} className="ml-auto">
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>
        </Container>
      </Section>

      <Section spacing="sm" className="pt-0 md:pt-0">
        <Container width="wide">
          {results.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
              <h2 className="font-poppins text-xl font-bold text-foreground">
                No recalls match that
              </h2>
              <p className="mx-auto mt-2 max-w-md font-inter text-muted-foreground">
                Try a different allergen or clear the filters. A product not
                appearing here does not mean it has never been recalled.
              </p>
              <Button type="button" variant="outline" className="mt-6" onClick={reset}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {groups.map((group) => (
                <section key={group.key} aria-labelledby={`recalls-${group.key}`}>
                  <div className="mb-4 flex items-baseline gap-3">
                    <h2
                      id={`recalls-${group.key}`}
                      className="font-poppins text-lg font-bold text-foreground"
                    >
                      {BUCKET_LABELS[group.key]}
                    </h2>
                    <span className="font-inter text-sm text-muted-foreground">
                      {group.items.length}
                    </span>
                  </div>
                  <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((recall) => (
                      <li key={recall.slug} className="min-w-0">
                        <RecallCard recall={recall} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {visible < results.length && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  >
                    Show {Math.min(PAGE_SIZE, results.length - visible)} more
                  </Button>
                  <p className="mt-2 font-inter text-sm text-muted-foreground">
                    Showing {shown.length} of {results.length}
                  </p>
                </div>
              )}
            </div>
          )}

          <Disclaimer
            kind="info"
            title="Always verify with the source"
            className="mt-12"
          >
            Recall details can change. For the most current information, follow
            the source link on each recall or contact the manufacturer or the
            relevant food safety agency directly.
          </Disclaimer>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default Recalls;
