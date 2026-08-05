import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Container, PageHeader, PageLayout, Section } from "@/components/layout";
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
import { useOfflineQueue } from "@/hooks/use-offline-queue";
import { exportQueued, removeQueued } from "@/program/offline-queue";

/**
 * The surveyor's home base when collecting responses away from a desk:
 * what's on the device, what's been sent, and how to get it out if
 * something goes wrong.
 */
const FieldMode = () => {
  const { online, records, pending, failed, syncing, syncNow, refresh } =
    useOfflineQueue();
  const { toast } = useToast();
  const [discarding, setDiscarding] = useState<string | null>(null);

  const handleExport = async () => {
    const json = await exportQueued();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `allergyvoices-field-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSync = async () => {
    await syncNow(true);
    toast({
      title: "Sync finished",
      description: "Anything that couldn't send is still saved here.",
    });
  };

  const confirmDiscard = async () => {
    if (!discarding) return;
    await removeQueued(discarding);
    setDiscarding(null);
    await refresh();
  };

  return (
    <PageLayout>
      <SEOHead
        title="Field mode"
        description="Collect restaurant surveys offline and send them when you have a connection."
      />
      <PageHeader
        eyebrow="Field mode"
        title="Surveys saved on this device"
        intro="Collect responses anywhere, with or without a signal. Everything here sends automatically once you're back online."
        breadcrumbs={[
          { label: "Restaurants", href: "/restaurants" },
          { label: "Field mode" },
        ]}
        actions={
          <Button asChild size="lg">
            <Link to="/restaurants/participate">
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              New survey
            </Link>
          </Button>
        }
      />

      <Section spacing="sm">
        <Container width="default">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background-subtle p-5">
            <div className="flex items-center gap-3">
              {online ? (
                <Wifi className="h-5 w-5 text-secondary" aria-hidden="true" />
              ) : (
                <WifiOff className="h-5 w-5 text-warning-foreground" aria-hidden="true" />
              )}
              <div>
                <p className="font-poppins font-semibold text-foreground">
                  {online ? "Online" : "Offline"}
                </p>
                <p className="font-inter text-sm text-muted-foreground">
                  {records.length === 0
                    ? "Nothing waiting to send."
                    : `${pending} waiting${failed > 0 ? `, ${failed} need attention` : ""}.`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {records.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Export backup
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSync}
                disabled={!online || syncing || records.length === 0}
              >
                <RefreshCw
                  className={`mr-1.5 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                {syncing ? "Sending…" : "Send all now"}
              </Button>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-border p-8 text-center">
              <CheckCircle2
                className="mx-auto h-8 w-8 text-secondary"
                aria-hidden="true"
              />
              <h2 className="mt-4 font-poppins text-xl font-bold text-foreground">
                Everything has been sent
              </h2>
              <p className="mx-auto mt-2 max-w-md font-inter text-muted-foreground">
                Nothing is waiting on this device. Start a new survey whenever
                you're ready.
              </p>
              <Button asChild className="mt-6">
                <Link to="/restaurants/participate">Start a survey</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {records.map((record) => (
                <li key={record.id}>
                  <Card>
                    <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <p className="font-poppins font-semibold text-foreground">
                          {record.restaurantName || "Untitled restaurant"}
                        </p>
                        <p className="font-inter text-sm text-muted-foreground">
                          {[record.city, record.state].filter(Boolean).join(", ")}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 font-inter text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          Saved {new Date(record.createdAt).toLocaleString()}
                        </p>
                        {record.status === "failed" && (
                          <p className="mt-2 flex items-start gap-1.5 font-inter text-sm text-destructive">
                            <AlertTriangle
                              className="mt-0.5 h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span>
                              Couldn't send after {record.attempts} attempts
                              {record.lastError ? `: ${record.lastError}` : "."}{" "}
                              Export a backup before discarding.
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full border border-border px-2.5 py-0.5 font-inter text-xs text-muted-foreground">
                          {record.status === "failed" ? "Needs attention" : "Waiting"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDiscarding(record.id)}
                          aria-label={`Discard the saved survey for ${record.restaurantName}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 rounded-2xl border border-border bg-background-subtle p-5">
            <h2 className="font-poppins font-semibold text-foreground">
              Using this on an iPad
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 font-inter text-sm text-muted-foreground">
              <li>Open this page in Safari while you still have a connection.</li>
              <li>
                Tap Share, then "Add to Home Screen" — it installs like an app
                and opens without the browser bar.
              </li>
              <li>
                Open it once more before heading out so the survey is stored
                for offline use.
              </li>
            </ol>
          </div>
        </Container>
      </Section>

      <AlertDialog open={discarding !== null} onOpenChange={(open) => !open && setDiscarding(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this saved survey?</AlertDialogTitle>
            <AlertDialogDescription>
              It hasn't been sent yet, so these answers will be gone for good.
              If you might need them, export a backup first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default FieldMode;
