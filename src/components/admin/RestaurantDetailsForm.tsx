import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUISINE_OPTIONS } from "@/program/survey";
import { US_STATES } from "@/program/us-states";
import { normalizeWebsite } from "@/program/url";
import { CONSENT_LABELS, type PublishConsent, type Restaurant } from "@/program/types";

export interface EditableDetails {
  name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  website: string;
  cuisine: string[];
  publish_consent: PublishConsent;
}

interface Props {
  restaurant: Restaurant;
  onSave: (details: EditableDetails) => Promise<void>;
  saving: boolean;
}

function initial(restaurant: Restaurant): EditableDetails {
  return {
    name: restaurant.name,
    address_line1: restaurant.address_line1 ?? "",
    address_line2: restaurant.address_line2 ?? "",
    city: restaurant.city,
    state: restaurant.state,
    postal_code: restaurant.postal_code ?? "",
    phone: restaurant.phone ?? "",
    website: restaurant.website ?? "",
    cuisine: restaurant.cuisine,
    publish_consent: restaurant.publish_consent,
  };
}

/**
 * Lets an admin correct the listing's own details — a misspelled name, a
 * wrong ZIP, a consent choice taken by phone. Separate from the survey
 * answers, which are versioned; these are attributes of the listing itself.
 */
export function RestaurantDetailsForm({ restaurant, onSave, saving }: Props) {
  const [details, setDetails] = useState<EditableDetails>(() => initial(restaurant));
  const [dirty, setDirty] = useState(false);

  const set = (patch: Partial<EditableDetails>) => {
    setDetails((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const toggleCuisine = (value: string, checked: boolean) =>
    set({
      cuisine: checked
        ? [...details.cuisine, value]
        : details.cuisine.filter((c) => c !== value),
    });

  const handleSave = async () => {
    await onSave({
      ...details,
      website: normalizeWebsite(details.website) ?? "",
    });
    setDirty(false);
  };

  return (
    <div className="space-y-5 rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-poppins text-xl font-bold text-foreground">
          Listing details
        </h2>
        <Button variant="outline" onClick={handleSave} disabled={!dirty || saving}>
          <Save className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {saving ? "Saving…" : "Save details"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="edit-name" label="Restaurant name" value={details.name}
          onChange={(v) => set({ name: v })} />
        <Field id="edit-phone" label="Phone" value={details.phone}
          onChange={(v) => set({ phone: v })} />
      </div>

      <Field id="edit-address1" label="Street address" value={details.address_line1}
        onChange={(v) => set({ address_line1: v })} />
      <Field id="edit-address2" label="Suite, unit, or floor" value={details.address_line2}
        onChange={(v) => set({ address_line2: v })} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="edit-city" label="City" value={details.city}
          onChange={(v) => set({ city: v })} />
        <div className="space-y-2">
          <Label htmlFor="edit-state" className="font-inter text-sm font-medium">State</Label>
          <Select value={details.state} onValueChange={(v) => set({ state: v })}>
            <SelectTrigger id="edit-state">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Field id="edit-zip" label="ZIP" value={details.postal_code}
          onChange={(v) => set({ postal_code: v })} />
      </div>

      <Field id="edit-website" label="Website" value={details.website}
        onChange={(v) => set({ website: v })}
        help="A missing https:// is added automatically." />

      <div className="space-y-2">
        <Label htmlFor="edit-consent" className="font-inter text-sm font-medium">
          Permission to publish
        </Label>
        <Select
          value={details.publish_consent}
          onValueChange={(v) => set({ publish_consent: v as PublishConsent })}
        >
          <SelectTrigger id="edit-consent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CONSENT_LABELS) as PublishConsent[]).map((c) => (
              <SelectItem key={c} value={c}>{CONSENT_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="font-inter text-sm text-muted-foreground">
          Only change this if the restaurant told you to.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="font-inter text-sm font-medium">Cuisine</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {CUISINE_OPTIONS.map((option) => {
            const optionId = `edit-cuisine-${option.value}`;
            return (
              <div key={option.value} className="flex items-center gap-2.5">
                <Checkbox
                  id={optionId}
                  checked={details.cuisine.includes(option.value)}
                  onCheckedChange={(checked) => toggleCuisine(option.value, checked === true)}
                />
                <Label htmlFor={optionId} className="font-inter text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function Field({
  id, label, value, onChange, help,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; help?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-inter text-sm font-medium">{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
      {help && <p className="font-inter text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
