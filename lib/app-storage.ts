export type SavedCampaign = {
  id: string;
  owner: string;
  name: string;
  listingSlug: string;
  listingTitle: string;
  spotId: string;
  spotName: string;
  mode: "Art only" | "Art + QR" | "QR only";
  artworkName: string;
  artworkMediaId?: string;
  stickerTransform?: StickerTransform;
  destination: string;
  shortCode: string;
  signature: string;
  createdAt: string;
  status: "Draft" | "Ready";
  scanEvents?: Array<{ at: string; visitorId: string }>;
};

export type StickerTransform = {
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
};

const STORAGE_VERSION = "v1";
const changedEvent = "stickxit:records-changed";

function key(kind: "campaigns", address: string) {
  return `stickxit:${STORAGE_VERSION}:${kind}:${address.toLowerCase()}`;
}

function read<T>(storageKey: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(storageKey: string, records: T[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(changedEvent));
}

export function createRecordId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.().replaceAll("-", "").slice(0, 10) ?? Math.random().toString(36).slice(2, 12);
  return `${prefix}_${random}`;
}

export function createShortCode() {
  return globalThis.crypto?.randomUUID?.().replaceAll("-", "").slice(0, 6).toUpperCase()
    ?? Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function getSavedCampaigns(address: string) {
  return read<SavedCampaign>(key("campaigns", address));
}

export function saveCampaign(record: SavedCampaign) {
  const records = getSavedCampaigns(record.owner).filter((item) => item.id !== record.id);
  write(key("campaigns", record.owner), [record, ...records]);
}

export function updateCampaignDestination(address: string, campaignId: string, destination: string) {
  const records = getSavedCampaigns(address).map((item) => item.id === campaignId ? { ...item, destination } : item);
  write(key("campaigns", address), records);
}

export function onRecordsChanged(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(changedEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(changedEvent, listener);
    window.removeEventListener("storage", listener);
  };
}
