"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Move, RotateCcw, RotateCw, Scaling } from "lucide-react";
import { LocalMedia } from "@/components/LocalMedia";
import { ProductArt } from "@/components/ProductArt";
import type { StickerTransform } from "@/lib/app-storage";
import type { Listing, Spot } from "@/lib/mock-data";
import styles from "./advertise.module.css";

type InteractivePlacementMockupProps = {
  listing: Listing;
  spot: Spot;
  transform: StickerTransform;
  onTransformChange?: (next: StickerTransform) => void;
  artworkUrl?: string;
  artworkMediaId?: string;
  fallback?: ReactNode;
  fallbackClassName?: string;
  showQr?: boolean;
  qrCorner?: "Top left" | "Top right" | "Bottom left" | "Bottom right";
  compact?: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function positionLimit(scale: number) {
  return Math.max(0, (1 - scale) * 50);
}

export const initialStickerTransform: StickerTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 0.78,
  rotation: 0,
};

export function InteractivePlacementMockup({
  listing,
  spot,
  transform,
  onTransformChange,
  artworkUrl,
  artworkMediaId,
  fallback,
  fallbackClassName = "",
  showQr = true,
  qrCorner = "Bottom right",
  compact = false,
}: InteractivePlacementMockupProps) {
  const [viewAngle, setViewAngle] = useState(-4);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ pointerId: number; clientX: number; clientY: number; transform: StickerTransform } | null>(null);
  const editable = Boolean(onTransformChange);
  const limit = positionLimit(transform.scale);

  function update(next: Partial<StickerTransform>) {
    if (!onTransformChange) return;
    const scale = clamp(next.scale ?? transform.scale, 0.35, 1);
    const nextLimit = positionLimit(scale);
    onTransformChange({
      offsetX: clamp(next.offsetX ?? transform.offsetX, -nextLimit, nextLimit),
      offsetY: clamp(next.offsetY ?? transform.offsetY, -nextLimit, nextLimit),
      scale,
      rotation: clamp(next.rotation ?? transform.rotation, -18, 18),
    });
  }

  function handleStickerPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!editable) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      transform,
    };
  }

  function handleStickerPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const region = spotRef.current?.getBoundingClientRect();
    if (!editable || !drag || drag.pointerId !== event.pointerId || !region) return;
    event.preventDefault();
    event.stopPropagation();
    update({
      offsetX: drag.transform.offsetX + ((event.clientX - drag.clientX) / region.width) * 100,
      offsetY: drag.transform.offsetY + ((event.clientY - drag.clientY) / region.height) * 100,
    });
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
  }

  function handleStickerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!editable || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    if (event.key === "Home") update(initialStickerTransform);
    if (event.key === "ArrowLeft") update({ offsetX: transform.offsetX - step });
    if (event.key === "ArrowRight") update({ offsetX: transform.offsetX + step });
    if (event.key === "ArrowUp") update({ offsetY: transform.offsetY - step });
    if (event.key === "ArrowDown") update({ offsetY: transform.offsetY + step });
  }

  function handleScenePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.buttons) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setViewAngle(clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 18, -9, 9));
  }

  const sceneStyle = {
    "--mockup-tilt": `${viewAngle}deg`,
    "--mockup-shadow": `${viewAngle * -0.65}px`,
  } as CSSProperties;
  const spotStyle = {
    left: `${spot.x * 100}%`,
    top: `${spot.y * 100}%`,
    width: `${spot.width * 100}%`,
    height: `${spot.height * 100}%`,
    "--spot-rotation": `${spot.rotation ?? 0}deg`,
  } as CSSProperties;
  const stickerStyle = {
    left: `${50 + transform.offsetX}%`,
    top: `${50 + transform.offsetY}%`,
    width: `${transform.scale * 100}%`,
    height: `${transform.scale * 100}%`,
    transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`,
  };

  return (
    <div className={`${styles.mockupExperience} ${compact ? styles.mockupCompact : ""}`}>
      <div
        className={styles.mockupScene}
        style={sceneStyle}
        onPointerMove={handleScenePointerMove}
        onPointerLeave={() => setViewAngle(-4)}
      >
        <div className={styles.mockupDevice}>
          <ProductArt listing={listing} large />
          <div
            ref={spotRef}
            className={styles.designatedSpot}
            style={spotStyle}
            aria-label={`Designated sticker area: Spot ${spot.id}, ${spot.name}`}
          >
            <span className={styles.spotTag} aria-hidden="true">{spot.id}</span>
            <div
              className={`${styles.adjustableSticker} ${fallbackClassName}`}
              style={stickerStyle}
              role={editable ? "application" : undefined}
              tabIndex={editable ? 0 : undefined}
              aria-label={editable ? "Sticker artwork. Drag to move, or use arrow keys. Hold Shift for larger keyboard steps. Press Home to reset." : "Sticker artwork preview"}
              onPointerDown={handleStickerPointerDown}
              onPointerMove={handleStickerPointerMove}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onKeyDown={handleStickerKeyDown}
            >
              {artworkMediaId ? (
                <LocalMedia mediaId={artworkMediaId} alt="Uploaded sticker artwork" className={styles.adjustableArtwork} />
              ) : artworkUrl ? (
                // A browser-local data URL is used only for the immediate upload preview.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artworkUrl} alt="Uploaded sticker artwork" className={styles.adjustableArtwork} />
              ) : (
                <div className={styles.stickerFallback}>{fallback}</div>
              )}
              {showQr && <span className={`${styles.mockupQr} ${qrCorner === "Top left" ? styles.mockupQrTopLeft : qrCorner === "Top right" ? styles.mockupQrTopRight : qrCorner === "Bottom left" ? styles.mockupQrBottomLeft : styles.mockupQrBottomRight}`} aria-label="QR code area" />}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.viewControl}>
        <span>3D view</span>
        <input
          type="range"
          min="-9"
          max="9"
          step="1"
          value={viewAngle}
          onChange={(event) => setViewAngle(Number(event.target.value))}
          aria-label="3D viewing angle"
        />
        <button type="button" onClick={() => setViewAngle(0)}>Front</button>
      </div>

      {editable && (
        <div className={styles.stickerControls} aria-label="Sticker adjustment controls">
          <div className={styles.controlHeading}>
            <span><Move size={15} /> Fit sticker inside Spot {spot.id}</span>
            <button type="button" onClick={() => update(initialStickerTransform)}><RotateCcw size={14} /> Reset</button>
          </div>
          <label>
            <span>Horizontal <output>{Math.round(transform.offsetX)}</output></span>
            <input aria-label="Sticker horizontal position" type="range" min={-limit} max={limit} step="1" value={transform.offsetX} onChange={(event) => update({ offsetX: Number(event.target.value) })} />
          </label>
          <label>
            <span>Vertical <output>{Math.round(transform.offsetY)}</output></span>
            <input aria-label="Sticker vertical position" type="range" min={-limit} max={limit} step="1" value={transform.offsetY} onChange={(event) => update({ offsetY: Number(event.target.value) })} />
          </label>
          <label>
            <span><Scaling size={13} /> Size <output>{Math.round(transform.scale * 100)}%</output></span>
            <input aria-label="Sticker size" type="range" min="35" max="100" step="1" value={Math.round(transform.scale * 100)} onChange={(event) => update({ scale: Number(event.target.value) / 100 })} />
          </label>
          <label>
            <span><RotateCw size={13} /> Rotation <output>{Math.round(transform.rotation)}°</output></span>
            <input aria-label="Sticker rotation" type="range" min="-18" max="18" step="1" value={transform.rotation} onChange={(event) => update({ rotation: Number(event.target.value) })} />
          </label>
          <p>Drag the sticker on the item, use arrow keys for precise movement, or adjust the sliders. Artwork is clipped to the host-approved area.</p>
        </div>
      )}
    </div>
  );
}
