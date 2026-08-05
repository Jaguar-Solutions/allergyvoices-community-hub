/**
 * On-device queue for survey submissions taken in the field.
 *
 * A surveyor standing in a restaurant with no signal must be able to finish
 * the form, hit submit, and move on to the next restaurant. Submissions are
 * written to IndexedDB and replayed when a connection comes back.
 *
 * IndexedDB rather than localStorage: localStorage is synchronous, capped
 * around 5 MB, and is the same bucket the in-progress draft already uses.
 * A queue of completed submissions is exactly the kind of data you don't
 * want sharing a quota with anything else.
 */

import type { SubmissionPayload } from "./types";

const DB_NAME = "allergyvoices-field";
const DB_VERSION = 1;
const STORE = "submissions";

export type QueuedStatus = "pending" | "failed";

export interface QueuedSubmission {
  /** Client-generated id. Sent to the server so a replayed submission
   *  can't create a duplicate. */
  id: string;
  payload: SubmissionPayload;
  /** Denormalized for the pending list, so we don't parse payloads to render. */
  restaurantName: string;
  city: string;
  state: string;
  createdAt: string;
  attempts: number;
  status: QueuedStatus;
  lastError?: string;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser has no offline storage available."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open offline storage."));
  });

  return dbPromise;
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = run(transaction.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Offline storage error."));
      }),
  );
}

/** Store a completed submission for later delivery. Returns its queue id. */
export async function enqueue(payload: SubmissionPayload): Promise<string> {
  const record: QueuedSubmission = {
    id: newId(),
    payload,
    restaurantName: payload.restaurant.name,
    city: payload.restaurant.city,
    state: payload.restaurant.state,
    createdAt: new Date().toISOString(),
    attempts: 0,
    status: "pending",
  };
  await tx("readwrite", (store) => store.put(record));
  return record.id;
}

export async function listQueued(): Promise<QueuedSubmission[]> {
  const all = await tx<QueuedSubmission[]>("readonly", (store) => store.getAll());
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function countQueued(): Promise<number> {
  try {
    return await tx<number>("readonly", (store) => store.count());
  } catch {
    return 0;
  }
}

export async function removeQueued(id: string): Promise<void> {
  await tx("readwrite", (store) => store.delete(id));
}

/**
 * Record a delivery failure. `permanent` means the server rejected the
 * content itself — retrying that forever would just spin, so it's parked as
 * "failed" for a human to look at.
 */
export async function recordFailure(
  record: QueuedSubmission,
  message: string,
  permanent = false,
): Promise<void> {
  const attempts = record.attempts + 1;
  const updated: QueuedSubmission = {
    ...record,
    attempts,
    lastError: message,
    status: permanent || attempts >= 5 ? "failed" : "pending",
  };
  await tx("readwrite", (store) => store.put(updated));
}

/**
 * Everything on the device as JSON — the escape hatch if a device is about to
 * be wiped or a sync problem needs to go to someone by email.
 */
export async function exportQueued(): Promise<string> {
  const records = await listQueued();
  return JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2);
}
