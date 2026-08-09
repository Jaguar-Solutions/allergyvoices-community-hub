import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Eye, FileText, Loader2, Mail, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  emailReport,
  fetchLatestReport,
  generateReport,
  reportFileUrl,
} from "@/program/admin-api";
import type { RestaurantContact } from "@/program/types";

interface ImprovementReportProps {
  restaurantId: string;
  restaurantName: string;
  contact?: RestaurantContact;
  /** False when the restaurant has never submitted the survey. */
  hasSubmission: boolean;
  /** Survey schema the latest submission was captured under. */
  submissionSchemaVersion?: number;
}

/** The survey version the rules engine is written against. */
const CURRENT_SURVEY_SCHEMA = 2;

const EMAIL_STATUS_LABEL = {
  not_sent: "Not sent",
  sent: "Sent",
  failed: "Failed",
  // Not a failure: the safety switch doing its job. Styled as ordinary
  // information below rather than in the destructive color.
  suppressed: "Not sent (sending switched off)",
} as const;

/**
 * The Improvement Report panel on the admin restaurant page.
 *
 * Two confirmations guard the two irreversible-ish actions. Regenerating is
 * confirmed because a restaurant may already have the previous version in its
 * inbox; emailing is confirmed because it leaves the building. The email
 * dialog spells out exactly who receives it, since the address is a private
 * contact detail the admin cannot otherwise see on this page.
 */
export function ImprovementReport({
  restaurantId,
  restaurantName,
  contact,
  hasSubmission,
  submissionSchemaVersion,
}: ImprovementReportProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [opening, setOpening] = useState<"preview" | "download" | null>(null);

  const { data: report, isLoading } = useQuery({
    queryKey: ["restaurant-report", restaurantId],
    queryFn: () => fetchLatestReport(restaurantId),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["restaurant-report", restaurantId] });

  const generate = useMutation({
    mutationFn: () => generateReport(restaurantId),
    onSuccess: (result) => {
      if (!result.ok) {
        toast({
          title: "Could not generate the report",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Report generated" });
      refresh();
    },
  });

  const send = useMutation({
    mutationFn: () => emailReport(restaurantId),
    onSuccess: (result) => {
      if (!result.ok) {
        toast({
          // A suppressed send is a configuration state, not a failure to fix.
          title: result.suppressed ? "Email suppressed" : "Could not send the report",
          description: result.error,
          variant: result.suppressed ? "default" : "destructive",
        });
        refresh();
        return;
      }
      toast({
        title: "Report sent",
        description: result.sentTo ? `Emailed to ${result.sentTo}` : undefined,
      });
      refresh();
    },
  });

  /** Signed URLs are short-lived, so they're minted at click time. */
  const openFile = async (mode: "preview" | "download") => {
    if (!report?.pdf_path) return;
    setOpening(mode);
    const url = await reportFileUrl(report.pdf_path);
    setOpening(null);

    if (!url) {
      toast({
        title: "Could not open the report",
        description: "The stored file could not be reached.",
        variant: "destructive",
      });
      return;
    }

    if (mode === "preview") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = report.pdf_path.split("/").pop() ?? "report.pdf";
    link.click();
  };

  const generatedLabel = report
    ? format(new Date(report.generated_at), "MMMM d, yyyy")
    : null;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 className="font-poppins font-semibold text-foreground">
              Improvement Report
            </h2>
            <p className="mt-1 font-inter text-sm text-muted-foreground">
              A personalized PDF built from this restaurant's survey answers.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="font-inter text-sm text-muted-foreground">Checking…</p>
        ) : !report ? (
          <p className="font-inter text-sm text-muted-foreground">
            Status: <span className="font-medium text-foreground">Not generated</span>
          </p>
        ) : (
          <dl className="space-y-1.5 font-inter text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">Generated:</dt>
              <dd className="font-medium text-foreground">
                {generatedLabel} (v{report.version})
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">Contents:</dt>
              <dd className="font-medium text-foreground">
                {report.strengths.length} strengths,{" "}
                {report.recommendations.length} recommendations
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">Email status:</dt>
              <dd className="font-medium text-foreground">
                {EMAIL_STATUS_LABEL[report.email_status]}
                {report.email_sent_at &&
                  ` · ${format(new Date(report.email_sent_at), "MMM d, yyyy")}`}
              </dd>
            </div>
            {report.email_error && report.email_status !== "sent" && (
              <p
                className={
                  report.email_status === "failed"
                    ? "pt-1 font-inter text-xs text-destructive"
                    : "pt-1 font-inter text-xs text-muted-foreground"
                }
              >
                {report.email_error}
              </p>
            )}
          </dl>
        )}

        {/* A pre-v2 submission answers questions the rules no longer read, so
            the report comes out nearly empty. Saying so here is the difference
            between "the generator is broken" and "there is nothing to report
            on yet" — and stops a thin PDF being emailed by mistake. */}
        {hasSubmission &&
          submissionSchemaVersion !== undefined &&
          submissionSchemaVersion < CURRENT_SURVEY_SCHEMA && (
            <div className="rounded-lg border border-brand-sun/40 bg-brand-sun/5 p-3">
              <p className="font-inter text-sm text-foreground">
                This restaurant last answered survey version{" "}
                {submissionSchemaVersion}, before the questions were rewritten.
              </p>
              <p className="mt-1 font-inter text-sm text-muted-foreground">
                Most of its answers no longer map to a rule, so a report will be
                nearly empty. Ask the restaurant to update its listing before
                sending one.
              </p>
            </div>
          )}

        {!hasSubmission && (
          <p className="font-inter text-sm text-muted-foreground">
            This restaurant has no survey submission yet, so there is nothing to
            build a report from.
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {!report ? (
            <Button
              size="sm"
              disabled={!hasSubmission || generate.isPending}
              onClick={() => generate.mutate()}
            >
              {generate.isPending && (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Generate Report
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={opening === "preview"}
                onClick={() => openFile("preview")}
              >
                <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Preview Report
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={opening === "download"}
                onClick={() => openFile("download")}
              >
                <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Download PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={generate.isPending}
                onClick={() => setConfirmRegenerate(true)}
              >
                <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Regenerate
              </Button>
              <Button
                size="sm"
                disabled={send.isPending || !contact?.manager_email}
                onClick={() => setConfirmEmail(true)}
              >
                {send.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Mail className="mr-1.5 h-4 w-4" aria-hidden="true" />
                )}
                Email to Restaurant
              </Button>
            </>
          )}
        </div>

        {report && !contact?.manager_email && (
          <p className="font-inter text-sm text-muted-foreground">
            No contact email on file, so this report cannot be sent.
          </p>
        )}
      </CardContent>

      <AlertDialog open={confirmRegenerate} onOpenChange={setConfirmRegenerate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate this report?</AlertDialogTitle>
            <AlertDialogDescription>
              This creates version {(report?.version ?? 0) + 1} from the
              restaurant's latest survey answers. The previous version is kept
              — if it has already been emailed, the restaurant still has that
              copy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => generate.mutate()}>
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmEmail} onOpenChange={setConfirmEmail}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email this report?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>The report PDF will be attached and sent to:</p>
                <dl className="space-y-1 rounded-lg border border-border bg-background-subtle p-3 font-inter text-sm">
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Restaurant:</dt>
                    <dd className="font-medium text-foreground">{restaurantName}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Contact:</dt>
                    <dd className="font-medium text-foreground">
                      {contact?.manager_name ?? "—"}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Email:</dt>
                    <dd className="break-all font-medium text-foreground">
                      {contact?.manager_email}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-muted-foreground">Report date:</dt>
                    <dd className="font-medium text-foreground">{generatedLabel}</dd>
                  </div>
                </dl>
                <p>This is the private contact address from their survey.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => send.mutate()}>
              Send report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
