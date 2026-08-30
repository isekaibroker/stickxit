"use client";

const DATABASE_NAME = "stickxit-draft-media";
const STORE_NAME = "assets";
const DATABASE_VERSION = 1;

export type LocalMediaAsset = {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  blob: Blob;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Draft media storage is unavailable in this browser."));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error ?? new Error("Draft media storage could not be opened.")));
  });
}

async function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void,
): Promise<T> {
  const database = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    operation(store, resolve, reject);
    transaction.addEventListener("complete", () => database.close());
    transaction.addEventListener("abort", () => {
      database.close();
      reject(transaction.error ?? new Error("The draft media operation was cancelled."));
    });
    transaction.addEventListener("error", () => {
      database.close();
      reject(transaction.error ?? new Error("The draft media operation failed."));
    });
  });
}

export async function saveLocalMedia(file: File, preferredId?: string): Promise<string> {
  const id = preferredId ?? `media_${globalThis.crypto.randomUUID()}`;
  const asset: LocalMediaAsset = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
    blob: file,
  };

  return runTransaction<string>("readwrite", (store, resolve, reject) => {
    const request = store.put(asset);
    request.addEventListener("success", () => resolve(id));
    request.addEventListener("error", () => reject(request.error));
  });
}

export async function getLocalMedia(id: string): Promise<LocalMediaAsset | null> {
  if (!id) return null;
  return runTransaction<LocalMediaAsset | null>("readonly", (store, resolve, reject) => {
    const request = store.get(id);
    request.addEventListener("success", () => resolve((request.result as LocalMediaAsset | undefined) ?? null));
    request.addEventListener("error", () => reject(request.error));
  });
}

export async function getLocalMediaUrl(id: string): Promise<string | null> {
  const asset = await getLocalMedia(id);
  return asset ? URL.createObjectURL(asset.blob) : null;
}

export async function removeLocalMedia(id: string): Promise<void> {
  if (!id) return;
  await runTransaction<void>("readwrite", (store, resolve, reject) => {
    const request = store.delete(id);
    request.addEventListener("success", () => resolve());
    request.addEventListener("error", () => reject(request.error));
  });
}
