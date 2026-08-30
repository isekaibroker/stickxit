export type PublicBrokerRarity = "Commun" | "Semi-Rare" | "Rare";

export type PublicBrokerGalleryItem = {
  id: string;
  name: string;
  image: string;
  character: string;
  clothing: string;
  gender: string;
  rarity: PublicBrokerRarity;
  background: string;
};

type PublicBrokerRow = readonly [
  id: string,
  background: string,
  character: string,
  clothing: string,
  gender: string,
  rarity: PublicBrokerRarity,
];

// These records are a deterministic, metadata-backed public sample from the
// public collection preview. Ultra-Rare and Legendary tokens are excluded.
const galleryRows = [
  ["0183", "Terracotta Horizon Bars", "Bunny Broker 3920", "technical fabric business jacket", "Not Assigned", "Commun"],
  ["0319", "Pearl Terminal", "High Ponytail Broker", "Business Suit", "Female", "Commun"],
  ["0405", "Pale Graphic", "Mythic Broker #132", "Tailored Formalwear", "Not Assigned", "Semi-Rare"],
  ["0412", "Pale Graphic", "Dragon Broker #097", "Armored Formalwear", "Not Assigned", "Semi-Rare"],
  ["0490", "Dusk Ticker", "Side-Braid Wrap Broker", "Belted Wrap Blazer", "Female", "Commun"],
  ["0543", "Cream Orbit", "Loc Ponytail Broker", "Structured Cape Blazer", "Female", "Commun"],
  ["0552", "Pale Pink Geometric-Sprinkle Background Using Only Sparse Abstract Dashes, No Food Props", "Adult confectionery spirit entrepreneur", "Coat", "Not Assigned", "Semi-Rare"],
  ["0752", "Pale Peach Tile-Grid Background, No Utensils", "White nonbinary culinary tactician", "Jacket", "Non-Binary", "Semi-Rare"],
  ["0753", "Silver-Blue Blueprint Grid", "Goat Broker 3586", "academy-style blazer", "Not Assigned", "Commun"],
  ["0889", "Pale Aqua Ring-Grid Background", "Golden ram chancellor", "Three-Piece Suit", "Not Assigned", "Rare"],
  ["0985", "Indigo Grid", "Swept Hair Broker", "Business Suit", "Male", "Commun"],
  ["1018", "Cream Orbit", "Natural Afro Kimono Broker", "Kimono-Sleeve Executive Jacket", "Female", "Commun"],
  ["1172", "Peach Skyline", "Bang Ponytail Preppy Broker", "Preppy Blazer and Sweater Vest", "Female", "Commun"],
  ["1277", "Ice Exchange", "Quiff Broker", "Rolled-Sleeve Oxford Shirt", "Male", "Commun"],
  ["1281", "Cyan Exchange", "Natural Coils Broker", "Business Suit", "Female", "Commun"],
  ["1347", "Pale Graphic", "Ninja Broker #159", "Tailored Shinobi Attire", "Unspecified", "Semi-Rare"],
  ["1359", "Cream Orbit", "Platinum Undercut Broker", "Satin-Lapel Tuxedo", "Male", "Commun"],
  ["1366", "Sage Window Grid", "Alien Broker 3654", "single-breasted wool suit", "Not Assigned", "Commun"],
] as const satisfies readonly PublicBrokerRow[];

export const publicBrokerGallery: PublicBrokerGalleryItem[] = galleryRows.map(
  ([id, background, character, clothing, gender, rarity]) => ({
    id,
    name: `Azuki Broker #${id}`,
    image: `/isekai/gallery/${id}.png`,
    character,
    clothing,
    gender,
    rarity,
    background,
  }),
);
