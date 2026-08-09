import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PARTICIPATE_URL = "https://allergyvoices.com/restaurants/participate";

/**
 * The message someone hands to a restaurant.
 *
 * Written to be forwarded as-is by a customer who likes the place — so it
 * leads with what the restaurant gets, says "free" early, and never implies
 * the restaurant is being assessed.
 */
const INVITATION = `Hi — I'm a regular here and I manage a food allergy.

AllergyVoices is building a free directory where restaurants describe how they handle allergy requests, in their own words. It isn't a rating or an inspection, and there's no cost to take part.

The survey takes about 5–7 minutes, and nothing is published without your permission:
${PARTICIPATE_URL}

Thanks for considering it.`;

interface InviteRestaurantButtonProps {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  label?: string;
}

/**
 * Copies a ready-to-send invitation rather than navigating somewhere.
 *
 * "Invite a Restaurant" previously linked to the For Restaurants page, which
 * invites nobody — it just showed the visitor a page aimed at someone else.
 * Copying the message means the next step is paste-and-send, which is the
 * action the label actually promises.
 */
export function InviteRestaurantButton({
  variant = "outline",
  size = "default",
  className,
  label = "Invite a restaurant",
}: InviteRestaurantButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INVITATION);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({
        title: "Invitation copied",
        description: "Paste it into an email or message to the restaurant.",
      });
    } catch {
      // Clipboard is unavailable over plain HTTP and in some embedded
      // browsers. Fall back to a prefilled email rather than failing silently.
      window.location.href = `mailto:?subject=${encodeURIComponent(
        "A free way to share how you handle food allergies",
      )}&body=${encodeURIComponent(INVITATION)}`;
    }
  };

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={copy}>
      {copied ? (
        <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
      )}
      {copied ? "Copied — ready to paste" : label}
    </Button>
  );
}
