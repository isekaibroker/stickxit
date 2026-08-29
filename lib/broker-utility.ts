export type BrokerUtilityTier =
  | "Commun Human"
  | "Commun Creature"
  | "Semi-Rare"
  | "Rare"
  | "Ultra-Rare"
  | "Legendary";

export type BrokerUtilityPolicy = {
  tier: BrokerUtilityTier;
  label: string;
  audience: string;
  spotsPerItem: number;
  maxItems: number | null;
  platformFee: 0;
  publicGallery: boolean;
  note?: string;
};

export const brokerUtilityPolicies: BrokerUtilityPolicy[] = [
  {
    tier: "Commun Human",
    label: "Commun — Human",
    audience: "Human Brokers",
    spotsPerItem: 3,
    maxItems: 1,
    platformFee: 0,
    publicGallery: true,
  },
  {
    tier: "Commun Creature",
    label: "Commun — Creature",
    audience: "Frogs, dragons, bunnies, goats, aliens and other creatures",
    spotsPerItem: 4,
    maxItems: 2,
    platformFee: 0,
    publicGallery: true,
  },
  {
    tier: "Semi-Rare",
    label: "Semi-Rare",
    audience: "One-of-one and special-faction Brokers",
    spotsPerItem: 6,
    maxItems: 2,
    platformFee: 0,
    publicGallery: true,
    note: "Six spots is the current launch allocation and will be confirmed before mint.",
  },
  {
    tier: "Rare",
    label: "Rare",
    audience: "Rare Brokers",
    spotsPerItem: 8,
    maxItems: 2,
    platformFee: 0,
    publicGallery: true,
  },
  {
    tier: "Ultra-Rare",
    label: "Ultra-Rare",
    audience: "Flame-family and other Ultra-Rare Brokers",
    spotsPerItem: 10,
    maxItems: null,
    platformFee: 0,
    publicGallery: false,
    note: "The item allowance will be published before mint.",
  },
  {
    tier: "Legendary",
    label: "Legendary",
    audience: "The 15 Legendary Brokers",
    spotsPerItem: 10,
    maxItems: null,
    platformFee: 0,
    publicGallery: false,
    note: "The item allowance will be published before mint.",
  },
];

export const brokerUtilityByTier = Object.fromEntries(
  brokerUtilityPolicies.map((policy) => [policy.tier, policy]),
) as Record<BrokerUtilityTier, BrokerUtilityPolicy>;

export function isBrokerUtilityTier(value: string | undefined): value is BrokerUtilityTier {
  return Boolean(value && value in brokerUtilityByTier);
}

export function resolveBrokerUtilityTier(value: string | undefined): BrokerUtilityTier {
  return isBrokerUtilityTier(value) ? value : "Commun Human";
}

/**
 * Records created before Broker assignment are charged to one deterministic
 * default Broker (the caller supplies the newest saved Broker id). This keeps
 * old records readable without letting them bypass every Broker's item cap.
 */
export function countListingsForBroker(
  listings: ReadonlyArray<{ brokerId?: string }>,
  brokerId: string,
  legacyDefaultBrokerId?: string,
) {
  return listings.filter((listing) => (
    listing.brokerId === brokerId
    || (!listing.brokerId && brokerId === legacyDefaultBrokerId)
  )).length;
}

export function formatItemAllowance(maxItems: number | null) {
  if (maxItems === null) return "Published before mint";
  return `${maxItems} item${maxItems === 1 ? "" : "s"} max`;
}
