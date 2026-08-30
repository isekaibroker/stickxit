import type { Listing } from "@/lib/mock-data";
import { LocalMedia } from "@/components/LocalMedia";

const photoClasses: Record<Listing["visual"], string> = {
  laptop: "product-photo-laptop",
  pc: "product-photo-pc",
  car: "product-photo-car",
  toolbox: "product-photo-toolbox",
  skateboard: "product-photo-skateboard",
  helmet: "product-photo-helmet",
};

export function ProductArt({ listing, large = false }: { listing: Listing; large?: boolean }) {
  return (
    <div
      className={`product-art product-photo ${photoClasses[listing.visual]} ${large ? "product-art-large" : ""}`}
      role="img"
      aria-label={`${listing.title} example advertising surface`}
    >
      {listing.photoMediaId ? <LocalMedia mediaId={listing.photoMediaId} alt={`${listing.title} local listing photo`} className="product-local-media" /> : null}
      <span className="product-example-label">{listing.local ? "Local listing" : "Example surface"}</span>
    </div>
  );
}
