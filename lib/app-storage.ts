import type { Listing } from "@/lib/mock-data";

export type SavedSpot = {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  price: number;
  duration: string;
};

export type SavedListing = {
  id: string;
  owner: string;
  /** Optional so listing records created before multi-Broker selection still load. */
  brokerId?: string;
  /** Snapshot of the selected Broker tier at authorization time. */
  brokerTier?: string;
  title: string;
  category: string;
  description: string;
  city: string;
  country: string;
  environment: string;
  photoName: string;
  photoMediaId?: string;
  spots: SavedSpot[];
  signature: string;
  createdAt: string;
  status: "Review" | "Live";
};

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

export type SavedLocalBroker = {
  id: string;
  owner: string;
  tokenNumber: number;
  tier: string;
  artwork: string;
  createdAt: string;
  simulation: true;
};

const STORAGE_VERSION = "v1";
const changedEvent = "stickxit:records-changed";

function key(kind: "listings" | "campaigns" | "brokers", address: string) {
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
  let code = "";
  do {
    code = Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (typeof window !== "undefined" && findSavedCampaignByShortCode(code));
  return code;
}

export function getSavedListings(address: string) {
  return read<SavedListing>(key("listings", address));
}

export function saveListing(record: SavedListing) {
  const records = getSavedListings(record.owner).filter((item) => item.id !== record.id);
  write(key("listings", record.owner), [record, ...records]);
}

export function getSavedCampaigns(address: string) {
  return read<SavedCampaign>(key("campaigns", address));
}

export function findSavedCampaignByShortCode(shortCode: string) {
  if (typeof window === "undefined" || !shortCode.trim()) return null;
  const normalized = shortCode.trim().toUpperCase();
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index);
    if (!storageKey?.startsWith(`stickxit:${STORAGE_VERSION}:campaigns:`)) continue;
    const match = read<SavedCampaign>(storageKey).find((campaign) => campaign.shortCode.toUpperCase() === normalized);
    if (match) return match;
  }
  return null;
}

export function recordCampaignScan(shortCode: string) {
  if (typeof window === "undefined" || !shortCode.trim()) return null;
  const normalized = shortCode.trim().toUpperCase();
  const visitorKey = `stickxit:${STORAGE_VERSION}:visitor`;
  let visitorId = window.localStorage.getItem(visitorKey);
  if (!visitorId) {
    visitorId = createRecordId("visitor");
    window.localStorage.setItem(visitorKey, visitorId);
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index);
    if (!storageKey?.startsWith(`stickxit:${STORAGE_VERSION}:campaigns:`)) continue;
    const records = read<SavedCampaign>(storageKey);
    const campaignIndex = records.findIndex((campaign) => campaign.shortCode.toUpperCase() === normalized);
    if (campaignIndex < 0) continue;
    const campaign = records[campaignIndex];
    const updated = { ...campaign, scanEvents: [...(campaign.scanEvents ?? []), { at: new Date().toISOString(), visitorId }] };
    records[campaignIndex] = updated;
    write(storageKey, records);
    return updated;
  }
  return null;
}

export function saveCampaign(record: SavedCampaign) {
  const records = getSavedCampaigns(record.owner).filter((item) => item.id !== record.id);
  write(key("campaigns", record.owner), [record, ...records]);
}

export function getSavedLocalBrokers(address: string) {
  return read<SavedLocalBroker>(key("brokers", address));
}

export function saveLocalBroker(record: SavedLocalBroker) {
  const records = getSavedLocalBrokers(record.owner).filter((item) => item.id !== record.id);
  write(key("brokers", record.owner), [record, ...records]);
}

export function savedListingToMarketplaceListing(record: SavedListing): Listing {
  const mapped = record.category === "Vehicle"
    ? { category: "Car" as const, visual: "car" as const }
    : record.category === "Electronics"
      ? { category: "Laptop" as const, visual: "laptop" as const }
      : record.category === "Fashion"
        ? { category: "Helmet" as const, visual: "helmet" as const }
        : { category: "Toolbox" as const, visual: "toolbox" as const };
  return {
    slug: `local-${record.id}`,
    title: record.title,
    city: record.city,
    country: record.country,
    category: mapped.category,
    visual: mapped.visual,
    totalSpots: record.spots.length,
    visibility: record.environment === "Outdoor" ? "High" : "Medium",
    use: record.description || `${record.environment} local demo listing`,
    local: true,
    photoMediaId: record.photoMediaId,
    startingPrice: record.spots.length ? Math.min(...record.spots.map((spot) => spot.price)) : undefined,
    bookingDuration: record.spots[0]?.duration,
    spots: record.spots.map((spot) => ({
      id: String(spot.id),
      name: spot.name,
      x: spot.x,
      y: spot.y,
      width: spot.width,
      height: spot.height,
      physicalSize: "Custom mapped region",
    })),
  };
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
