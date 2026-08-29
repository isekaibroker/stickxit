import type { Listing } from "@/lib/mock-data";
import { LocalMedia } from "@/components/LocalMedia";

const spriteClasses: Record<Listing["visual"], string> = {
  laptop: "product-sprite-laptop",
  pc: "product-sprite-pc",
  car: "product-sprite-car",
  toolbox: "product-sprite-toolbox",
  skateboard: "product-sprite-skateboard",
  helmet: "product-sprite-helmet",
};

export function ProductArt({ listing, large = false }: { listing: Listing; large?: boolean }) {
  return (
    <div
      className={`product-art product-photo ${spriteClasses[listing.visual]} ${large ? "product-art-large" : ""}`}
      role="img"
      aria-label={`${listing.title} example advertising surface`}
    >
      {listing.photoMediaId ? <LocalMedia mediaId={listing.photoMediaId} alt={`${listing.title} local listing photo`} className="product-local-media" /> : null}
      <span className="product-example-label">{listing.local ? "Local listing" : "Example surface"}</span>
    </div>
  );
}
