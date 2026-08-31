export const collectionDetails = {
  name: "Isekai Brokers",
  tokenName: "Isekai Broker",
  supply: 5555,
  supplyLabel: "5,555",
  chainName: "Robinhood Chain",
  traitNames: ["Background", "Character", "Clothing Type", "Gender", "Rarity"],
} as const;

export const collectionRarityBreakdown = [
  { rarity: "Commun", count: 4800, countLabel: "4,800", shareLabel: "86.41%" },
  { rarity: "Semi-Rare", count: 368, countLabel: "368", shareLabel: "6.62%" },
  { rarity: "Rare", count: 210, countLabel: "210", shareLabel: "3.78%" },
  { rarity: "Ultra-Rare", count: 132, countLabel: "132", shareLabel: "2.38%" },
  { rarity: "Legendary", count: 45, countLabel: "45", shareLabel: "0.81%" },
] as const;

const rarityTotal = collectionRarityBreakdown.reduce((total, tier) => total + tier.count, 0);

if (rarityTotal !== collectionDetails.supply) {
  throw new Error(`Collection rarity total ${rarityTotal} does not match supply ${collectionDetails.supply}.`);
}
