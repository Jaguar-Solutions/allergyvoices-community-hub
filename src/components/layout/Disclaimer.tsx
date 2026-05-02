import { Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type DisclaimerKind = "medical" | "community" | "info";

interface DisclaimerProps {
  kind?: DisclaimerKind;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const MEDICAL_BODY =
  "AllergyVoices provides educational information for families living with food allergies. It is not a substitute for personalized medical advice, diagnosis, or treatment. For emergencies or suspected anaphylaxis, use prescribed emergency medication and seek urgent medical care.";

const COMMUNITY_BODY =
  "Community stories and venue experiences reflect personal experiences, not guarantees of safety. Always confirm details directly with the provider or venue and follow your clinician's advice.";

export function Disclaimer({ kind = "medical", title, children, className }: DisclaimerProps) {
  const Icon = kind === "info" ? Info : AlertTriangle;
  const defaultTitle =
    kind === "medical" ? "Medical disclaimer" : kind === "community" ? "Community disclaimer" : "Heads up";
  const defaultBody = kind === "medical" ? MEDICAL_BODY : kind === "community" ? COMMUNITY_BODY : null;

  return (
    <aside
      role="note"
      className={cn(
        "rounded-xl border border-border/70 bg-background-subtle p-5 md:p-6",
        className,
      )}
    >
      <div className="flex gap-3">
        <Icon
          className="h-5 w-5 flex-shrink-0 text-muted-foreground mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1.5">
          <p className="font-poppins font-semibold text-sm text-foreground">
            {title ?? defaultTitle}
          </p>
          <div className="font-inter text-sm leading-relaxed text-muted-foreground">
            {children ?? defaultBody}
          </div>
        </div>
      </div>
    </aside>
  );
}
