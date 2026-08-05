/**
 * Delivering queued field submissions once a connection is available.
 *
 * Deliberately simple: no background sync API, no service-worker messaging.
 * The queue is flushed when the app loads, when the browser fires `online`,
 * on a slow timer while anything is pending, and whenever someone taps
 * "Sync now". On iPad — where the app may be backgrounded for hours — a
 * predictable flush on foreground beats a clever one that Safari suspends.
 */

import { submitRestaurant } from "./api";
import {
  listQueued,
  recordFailure,
  removeQueued,
  type QueuedSubmission,
} from "./offline-queue";

export interface FlushResult {
  sent: number;
  remaining: number;
  errors: string[];
}

let flushing = false;
const listeners = new Set<() => void>();

/** Notifies the UI that queue contents may have changed. */
export function onQueueChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

/**
 * A message that means "the server said no", as opposed to "we couldn't
 * reach the server". Validation failures must not be retried forever.
 */
function isPermanentRejection(message: string): boolean {
  return /required|too large|valid|moment to review/i.test(message);
}

/**
 * @param includeFailed retry submissions the server previously rejected.
 *        Automatic flushes leave those alone; a person tapping "Retry" means it.
 */
export async function flushQueue(includeFailed = false): Promise<FlushResult> {
  if (flushing) return { sent: 0, remaining: await pendingCount(), errors: [] };
  if (!isOnline()) return { sent: 0, remaining: await pendingCount(), errors: [] };

  flushing = true;
  const errors: string[] = [];
  let sent = 0;

  try {
    const all = await listQueued();
    const queued = includeFailed ? all : all.filter((r) => r.status !== "failed");
    for (const record of queued) {
      // Stop early if the connection dropped mid-flush rather than burning
      // through every record's retry counter.
      if (!isOnline()) break;

      const result = await deliver(record);
      if (result.ok === true) {
        await removeQueued(record.id);
        sent += 1;
      } else {
        errors.push(`${record.restaurantName}: ${result.error}`);
        await recordFailure(record, result.error, result.permanent);
      }
      notify();
    }
  } finally {
    flushing = false;
  }

  const remaining = await pendingCount();
  notify();
  return { sent, remaining, errors };
}

async function deliver(
  record: QueuedSubmission,
): Promise<{ ok: true } | { ok: false; error: string; permanent: boolean }> {
  try {
    const result = await submitRestaurant({
      ...record.payload,
      clientSubmissionId: record.id,
      // The elapsed-time spam check measures how long the form took to fill
      // in. A queued submission was filled in properly, possibly hours ago,
      // so send the original value rather than a misleading replay time.
      elapsedMs: record.payload.elapsedMs,
    });

    if (result.ok) return { ok: true };
    return {
      ok: false,
      error: result.error ?? "Unknown error",
      permanent: isPermanentRejection(result.error ?? ""),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
      permanent: false,
    };
  }
}

async function pendingCount(): Promise<number> {
  return (await listQueued()).length;
}

let started = false;

/**
 * Wire up automatic flushing. Safe to call more than once; only the first
 * call takes effect.
 */
export function startSync(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const attempt = () => {
    void flushQueue();
  };

  window.addEventListener("online", attempt);
  // Coming back to the tab after a drive between restaurants is the most
  // common moment for connectivity to have returned.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") attempt();
  });

  window.setInterval(async () => {
    if ((await pendingCount()) > 0) attempt();
  }, 60_000);

  attempt();
}
