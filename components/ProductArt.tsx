import type { Listing } from "@/lib/mock-data";
import { LocalMedia } from "@/components/LocalMedia";

const photoClasses: Record<Listing["visual"], string> = {
  laptop: "product-photo-laptop",
  pc: "product-photo-pc",
  car: "product-photo-car",
  toolbox: "product-photo-toolbox",
  drill: "product-photo-drill",
  skateboard: "product-photo-skateboard",
  helmet: "product-photo-helmet",
};

const exampleStickerCounts: Partial<Record<Listing["visual"], number>> = {
  laptop: 3,
  pc: 3,
  car: 3,
  drill: 2,
  skateboard: 3,
  helmet: 2,
};

export function ProductArt({ listing, large = false, showExampleStickers = true }: { listing: Listing; large?: boolean; showExampleStickers?: boolean }) {
  const exampleStickerCount = showExampleStickers && !listing.local && !listing.photoMediaId
    ? (exampleStickerCounts[listing.visual] ?? 0)
    : 0;

  return (
    <div
      className={`product-art product-photo ${photoClasses[listing.visual]} ${exampleStickerCount ? "product-photo-stickered" : ""} ${large ? "product-art-large" : ""}`}
      data-example-stickered={exampleStickerCount ? "true" : undefined}
      role="img"
      aria-label={`${listing.title} example advertising surface${exampleStickerCount ? ` with ${exampleStickerCount} applied Isekai Broker vinyl stickers` : ""}`}
    >
      {listing.photoMediaId ? <LocalMedia mediaId={listing.photoMediaId} alt={`${listing.title} local listing photo`} className="product-local-media" /> : null}
      <span className="product-example-label">{listing.local ? "Local listing" : "Example surface"}</span>
    </div>
  );
}
