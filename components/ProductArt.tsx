import Image from "next/image";
import type { CSSProperties } from "react";
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

type ExampleSticker = {
  spotId: string;
  image: string;
  rotation: number;
};

const exampleStickerSets: Partial<Record<Listing["visual"], ExampleSticker[]>> = {
  laptop: [
    { spotId: "A", image: "/marketplace/stickers/0001.webp", rotation: -4 },
    { spotId: "C", image: "/marketplace/stickers/0002.webp", rotation: 3 },
    { spotId: "E", image: "/marketplace/stickers/0010.webp", rotation: -2 },
  ],
  pc: [
    { spotId: "A", image: "/marketplace/stickers/0016.webp", rotation: -2 },
    { spotId: "C", image: "/marketplace/stickers/0339.webp", rotation: 2 },
    { spotId: "D", image: "/marketplace/stickers/1366.webp", rotation: -1 },
  ],
  car: [
    { spotId: "A", image: "/marketplace/stickers/0003.webp", rotation: 1 },
    { spotId: "B", image: "/marketplace/stickers/0490.webp", rotation: -2 },
    { spotId: "C", image: "/marketplace/stickers/0985.webp", rotation: 2 },
  ],
  drill: [
    { spotId: "A", image: "/marketplace/stickers/0028.webp", rotation: -1 },
    { spotId: "C", image: "/marketplace/stickers/0753.webp", rotation: 1 },
  ],
  skateboard: [
    { spotId: "A", image: "/marketplace/stickers/0183.webp", rotation: -25 },
    { spotId: "B", image: "/marketplace/stickers/0319.webp", rotation: -25 },
    { spotId: "C", image: "/marketplace/stickers/1347.webp", rotation: -25 },
  ],
  helmet: [
    { spotId: "A", image: "/marketplace/stickers/0034.webp", rotation: 7 },
    { spotId: "C", image: "/marketplace/stickers/0412.webp", rotation: -6 },
  ],
};

export function ProductArt({ listing, large = false, showExampleStickers = true }: { listing: Listing; large?: boolean; showExampleStickers?: boolean }) {
  const exampleStickers = showExampleStickers && !listing.local && !listing.photoMediaId
    ? (exampleStickerSets[listing.visual] ?? [])
    : [];

  return (
    <div
      className={`product-art product-photo ${photoClasses[listing.visual]} ${large ? "product-art-large" : ""}`}
      role="img"
      aria-label={`${listing.title} example advertising surface${exampleStickers.length ? ` with ${exampleStickers.length} Isekai Broker portrait stickers` : ""}`}
    >
      {listing.photoMediaId ? <LocalMedia mediaId={listing.photoMediaId} alt={`${listing.title} local listing photo`} className="product-local-media" /> : null}
      {exampleStickers.length ? (
        <span className="product-example-stickers" aria-hidden="true">
          {exampleStickers.map((sticker) => {
            const spot = listing.spots.find((candidate) => candidate.id === sticker.spotId);
            if (!spot) return null;
            const stickerStyle = {
              left: `${(spot.x + spot.width / 2) * 100}%`,
              top: `${(spot.y + spot.height / 2) * 100}%`,
              height: `${Math.max(spot.height, 0.1) * 100}%`,
              "--example-sticker-rotation": `${sticker.rotation}deg`,
            } as CSSProperties;
            return (
              <span className="product-example-sticker" data-example-sticker="true" style={stickerStyle} key={`${listing.slug}-${sticker.spotId}`}>
                <Image src={sticker.image} alt="" fill unoptimized sizes="80px" />
              </span>
            );
          })}
        </span>
      ) : null}
      <span className="product-example-label">{listing.local ? "Local listing" : "Example surface"}</span>
    </div>
  );
}
