import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { recordRestaurantInterests } from "@/program/api";

interface ResourceOptInProps {
  restaurantId: string;
}

const OPTIONS = [
  {
    key: "wants_best_practices_guide",
    label: "Send me the free AllergyVoices Restaurant Best Practices Guide",
  },
  {
    key: "wants_menu_help",
    label: "I'm interested in help creating an allergen menu",
    /**
     * The fee is disclosed here and only here — after the restaurant has
     * expressed interest, and after its free listing is already secured. It
     * is never mentioned inside the survey, where it would read as a
     * condition of taking part.
     */
    note: "We build these for a small fee that covers our time. We'll explain what's involved before anything is agreed — it makes no difference to your free listing.",
  },
  {
    key: "wants_updates",
    label: "Send me occasional AllergyVoices restaurant updates",
  },
] as const;

type OptionKey = (typeof OPTIONS)[number]["key"];

/**
 * The optional "want anything else?" step, shown after a survey is safely
 * submitted.
 *
 * Everything here is genuinely optional and nothing affects the listing. The
 * component says so, and then gets out of the way: if the request fails we
 * still thank the restaurant, because the thing that mattered — their survey
 * — is already saved.
 */
export function ResourceOptIn({ restaurantId }: ResourceOptInProps) {
  const [selected, setSelected] = useState<Record<OptionKey, boolean>>({
    wants_best_practices_guide: false,
    wants_menu_help: false,
    wants_updates: false,
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const anySelected = Object.values(selected).some(Boolean);

  const toggle = (key: OptionKey, checked: boolean) =>
    setSelected((s) => ({ ...s, [key]: checked }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!anySelected) return;
    setSaving(true);
    await recordRestaurantInterests(restaurantId, selected);
    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-5 text-left md:p-6">
        <p className="flex items-start gap-2.5 font-inter leading-relaxed text-foreground">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-secondary-strong"
            aria-hidden="true"
          />
          Noted — we'll be in touch at the contact email you gave us. Nothing
          about your listing changes.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-background-subtle p-5 text-left md:p-6"
    >
      <h2 className="font-poppins text-xl font-bold text-foreground">
        Want additional restaurant resources?
      </h2>
      <p className="mt-1.5 font-inter text-sm leading-relaxed text-muted-foreground">
        Entirely optional. Your survey is already submitted and your listing is
        free either way.
      </p>

      <fieldset className="mt-5 space-y-4">
        <legend className="sr-only">Optional restaurant resources</legend>
        {OPTIONS.map((option) => (
          <div key={option.key} className="flex items-start gap-3">
            <Checkbox
              id={option.key}
              className="mt-0.5"
              checked={selected[option.key]}
              onCheckedChange={(checked) => toggle(option.key, checked === true)}
            />
            <div className="min-w-0">
              <Label htmlFor={option.key} className="font-inter font-normal leading-snug">
                {option.label}
              </Label>
              {"note" in option && selected[option.key] && (
                <p className="mt-1.5 font-inter text-sm leading-relaxed text-muted-foreground">
                  {option.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </fieldset>

      <Button type="submit" className="mt-5" disabled={!anySelected || saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {saving ? "Sending…" : "Send me these"}
      </Button>
    </form>
  );
}
