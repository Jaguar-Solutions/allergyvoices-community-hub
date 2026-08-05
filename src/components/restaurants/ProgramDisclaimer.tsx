import { Disclaimer } from "@/components/layout";

/**
 * The standing disclaimer for every restaurant profile. The wording is fixed
 * — it is the line that keeps this a transparency program rather than an
 * implied endorsement, so it should not be reworded per page.
 */
export function ProgramDisclaimer({ className }: { className?: string }) {
  return (
    <Disclaimer kind="info" title="About this information" className={className}>
      The information on this page is provided voluntarily by the restaurant.
      Allergy Voices does not inspect, certify, or guarantee allergy safety.
      Guests should always discuss their specific allergy needs directly with
      restaurant staff before ordering.
    </Disclaimer>
  );
}
