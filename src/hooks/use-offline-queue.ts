import { useCallback, useEffect, useState } from "react";
import { listQueued, type QueuedSubmission } from "@/program/offline-queue";
import { flushQueue, onQueueChange, startSync } from "@/program/sync";

interface OfflineQueueState {
  online: boolean;
  records: QueuedSubmission[];
  pending: number;
  failed: number;
  syncing: boolean;
  refresh: () => Promise<void>;
  syncNow: (includeFailed?: boolean) => Promise<void>;
}

/**
 * Live view of the on-device submission queue, plus connectivity state.
 *
 * `navigator.onLine` only tells us the device has *a* network, not that our
 * server is reachable — a captive wifi portal reads as online. That's why a
 * failed send re-queues rather than trusting this flag.
 */
export function useOfflineQueue(): OfflineQueueState {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [records, setRecords] = useState<QueuedSubmission[]>([]);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setRecords(await listQueued());
    } catch {
      setRecords([]);
    }
  }, []);

  useEffect(() => {
    startSync();
    void refresh();

    const unsubscribe = onQueueChange(() => void refresh());
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [refresh]);

  const syncNow = useCallback(
    async (includeFailed = false) => {
      setSyncing(true);
      try {
        await flushQueue(includeFailed);
        await refresh();
      } finally {
        setSyncing(false);
      }
    },
    [refresh],
  );

  return {
    online,
    records,
    pending: records.filter((r) => r.status === "pending").length,
    failed: records.filter((r) => r.status === "failed").length,
    syncing,
    refresh,
    syncNow,
  };
}
