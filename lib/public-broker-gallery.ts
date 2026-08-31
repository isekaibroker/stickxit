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
  ["0477", "Terracotta Horizon Bars", "Bunny Broker 3920", "technical fabric business jacket", "Not Assigned", "Commun"],
  ["3744", "Pearl Terminal", "High Ponytail Broker", "Business Suit", "Female", "Commun"],
  ["5521", "Pale Graphic", "Mythic Broker #132", "Tailored Formalwear", "Not Assigned", "Semi-Rare"],
  ["3476", "Pale Graphic", "Dragon Broker #097", "Armored Formalwear", "Not Assigned", "Semi-Rare"],
  ["4024", "Dusk Ticker", "Side-Braid Wrap Broker", "Belted Wrap Blazer", "Female", "Commun"],
  ["2141", "Cream Orbit", "Loc Ponytail Broker", "Structured Cape Blazer", "Female", "Commun"],
  ["5037", "Pale Pink Geometric-Sprinkle Background Using Only Sparse Abstract Dashes, No Food Props", "Adult confectionery spirit entrepreneur", "Coat", "Not Assigned", "Semi-Rare"],
  ["0333", "Pale Peach Tile-Grid Background, No Utensils", "White nonbinary culinary tactician", "Jacket", "Non-Binary", "Semi-Rare"],
  ["0809", "Silver-Blue Blueprint Grid", "Goat Broker 3586", "academy-style blazer", "Not Assigned", "Commun"],
  ["2390", "Pale Aqua Ring-Grid Background", "Golden ram chancellor", "Three-Piece Suit", "Not Assigned", "Rare"],
  ["3703", "Indigo Grid", "Swept Hair Broker", "Business Suit", "Male", "Commun"],
  ["4380", "Cream Orbit", "Natural Afro Kimono Broker", "Kimono-Sleeve Executive Jacket", "Female", "Commun"],
  ["3571", "Peach Skyline", "Bang Ponytail Preppy Broker", "Preppy Blazer and Sweater Vest", "Female", "Commun"],
  ["4665", "Ice Exchange", "Quiff Broker", "Rolled-Sleeve Oxford Shirt", "Male", "Commun"],
  ["4672", "Cyan Exchange", "Natural Coils Broker", "Business Suit", "Female", "Commun"],
  ["2132", "Pale Graphic", "Ninja Broker #159", "Tailored Shinobi Attire", "Unspecified", "Semi-Rare"],
  ["4899", "Cream Orbit", "Platinum Undercut Broker", "Satin-Lapel Tuxedo", "Male", "Commun"],
  ["1161", "Sage Window Grid", "Alien Broker 3654", "single-breasted wool suit", "Not Assigned", "Commun"],
] as const satisfies readonly PublicBrokerRow[];

export const publicBrokerGallery: PublicBrokerGalleryItem[] = galleryRows.map(
  ([id, background, character, clothing, gender, rarity]) => ({
    id,
    name: `Isekai Broker #${id}`,
    image: `/isekai/gallery/${id}.png`,
    character,
    clothing,
    gender,
    rarity,
    background,
  }),
);
