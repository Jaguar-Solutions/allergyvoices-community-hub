import { Link } from "react-router-dom";
import { CloudOff, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineQueue } from "@/hooks/use-offline-queue";

/**
 * Connectivity and queue status for field use.
 *
 * Shows nothing when everything is normal — online with an empty queue. A
 * surveyor only needs to hear from this when something is actually being
 * held on the device.
 */
export function OfflineBanner({ className }: { className?: string }) {
  const { online, pending, failed, syncing, syncNow } = useOfflineQueue();
  const queued = pending + failed;

  if (online && queued === 0) return null;

  return (
    <div
      role="status"
      className={
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 " +
        (online
          ? "border-primary/30 bg-primary/5"
          : "border-warning/40 bg-warning/10 ") +
        (className ? ` ${className}` : "")
      }
    >
      <div className="flex items-start gap-3">
        {online ? (
          <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" aria-hidden="true" />
        )}
        <div>
          <p className="font-inter text-sm font-medium text-foreground">
            {!online
              ? "You're offline — answers are saved on this device"
              : `${queued} submission${queued === 1 ? "" : "s"} waiting to send`}
          </p>
          <p className="font-inter text-sm text-muted-foreground">
            {!online
              ? "Keep going. Everything sends automatically once you're back online."
              : "These will send automatically. You can also send them now."}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {queued > 0 && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/restaurants/field">View saved</Link>
          </Button>
        )}
        {online && queued > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void syncNow()}
            disabled={syncing}
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {syncing ? "Sending…" : "Send now"}
          </Button>
        )}
      </div>
    </div>
  );
}
