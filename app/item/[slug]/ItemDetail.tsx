"use client";

import Link from "@/components/AppLink";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Layers3, MapPin, QrCode, ShieldCheck, WalletCards } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { ProductArt } from "@/components/ProductArt";
import type { Listing, Spot } from "@/lib/mock-data";
import styles from "./item.module.css";

function formatPhysicalSize(value: string) {
  const dimensions = value.match(/\d+(?:\.\d+)?/g);
  return dimensions && dimensions.length >= 2
    ? `${dimensions[0]} × ${dimensions[1]}"`
    : value;
}

export function ItemDetail({ listing, initialSpotId }: { listing: Listing; initialSpotId?: string }) {
  const initialSelection = listing.spots.some((spot) => spot.id === initialSpotId)
    ? initialSpotId!
    : listing.spots[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(initialSelection);
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const selected = listing.spots.find((spot) => spot.id === selectedId) ?? listing.spots[0];
  const inspected = listing.spots.find((spot) => spot.id === inspectedId) ?? selected;
  const placeNftHref = selected
    ? `/campaigns/new?item=${encodeURIComponent(listing.slug)}&spot=${encodeURIComponent(selected.id)}&template=upload&source=item-detail`
    : "";

  return (
    <>
      <Link className={styles.back} href="/marketplace"><ArrowLeft size={16} /> Back to marketplace</Link>
      <div className={styles.layout}>
        <section aria-labelledby="item-title">
          <div className={styles.visual}>
            <ProductArt listing={listing} large showExampleStickers />
            <div className={styles.overlay} aria-label="Selectable advertising spots">
              {listing.spots.map((spot) => <SpotButton key={spot.id} spot={spot} selected={spot.id === selected?.id} onSelect={() => setSelectedId(spot.id)} onInspect={(active) => setInspectedId(active ? spot.id : null)} />)}
            </div>
            <div className={styles.legend}><span><i className={styles.availableDot} />Example region</span><span><i className={styles.selectedDot} />Selected</span></div>
          </div>
          <div className={styles.inspection} aria-live="polite">
            <span>Inspecting spot {inspected?.id}</span>
            <strong>{inspected?.name}</strong>
            <small>{inspected?.description ?? "Select a mapped area to inspect its physical placement."}</small>
          </div>
        </section>

        <aside className={styles.panel}>
          <div className={styles.location}><MapPin size={14} /> Example · {listing.city}, {listing.country}<span>Launch preview</span></div>
          <h1 id="item-title">{listing.title}</h1>
          <p className={styles.use}>{listing.use}</p>
          <div className={styles.owner}><div>IB</div><p><small>Example host identity</small><strong>Broker-enabled host</strong></p></div>

          <div className={styles.selection} aria-live="polite">
            <label className={styles.spotSelect}>Placement region<select value={selected?.id ?? ""} onChange={(event) => setSelectedId(event.target.value)}>{listing.spots.map((spot) => <option key={spot.id} value={spot.id}>Spot {spot.id} · {spot.name}</option>)}</select></label>
            <div className={styles.selectionHead}><div><small>Selected placement</small><strong>{selected ? `Spot ${selected.id} · ${selected.name}` : "No spots available"}</strong></div>{selected && <span>{formatPhysicalSize(selected.physicalSize)}</span>}</div>
            {selected && <div className={styles.surfaceNote}><Layers3 size={17} /><div><small>{selected.surface ?? "Custom mapped surface"}</small><p>{selected.description ?? "Placement dimensions and surface suitability are defined by the host."}</p></div></div>}
            {selected && <div className={styles.price}><small>Host pricing</small><p><strong>Not live</strong> · published when inventory opens</p></div>}
            {selected ? <Link className={styles.buy} href={`/campaigns/new?item=${encodeURIComponent(listing.slug)}&spot=${encodeURIComponent(selected.id)}`}>Create campaign for this spot <span>→</span></Link> : <button className={styles.buy} disabled>No mapped region</button>}
            <p className={styles.safe}><ShieldCheck size={14} /> No booking or payment is created from this preview.</p>
          </div>

          <section className={styles.nftPlacement} aria-labelledby="place-my-nft-title">
            <div className={styles.nftPlacementIcon}><WalletCards size={21} /></div>
            <div className={styles.nftPlacementCopy}>
              <small>NFT creative</small>
              <h2 id="place-my-nft-title">Place my NFT</h2>
              <p>Use NFT artwork you own as a vinyl sticker in the selected host-approved region. The campaign editor lets you upload and fit the artwork precisely.</p>
            </div>
            {selected ? <Link className={styles.nftPlacementButton} href={placeNftHref}>Place my NFT in Spot {selected.id}<ArrowRight size={16} /></Link> : <button className={styles.nftPlacementButton} disabled>No mapped region</button>}
            <span className={styles.nftPlacementSafe}><ShieldCheck size={13} /> Your NFT stays in your wallet. No transfer or approval is requested.</span>
          </section>
        </aside>
      </div>

      <section className={styles.details} aria-label="Example surface details">
        <div><ImageIcon size={19} /><small>Surface type</small><strong>{listing.category}</strong><span>Product example</span></div>
        <div><Layers3 size={19} /><small>Mapped regions</small><strong>{listing.totalSpots}</strong><span>Proposed placement areas</span></div>
        <div><QrCode size={19} /><small>Creative options</small><strong>Art + QR</strong><span>Prepared from this Marketplace spot</span></div>
        <div><ShieldCheck size={19} /><small>Marketplace status</small><strong>Pre-launch</strong><span>No live booking data</span></div>
      </section>

      <div className={styles.lower}>
        <section className={styles.history}><p className={styles.sectionLabel}>Planned workflow</p><h2>From idea to placement</h2><div className={styles.timeline}><article><span /><div><strong>Choose a mapped region</strong><p>Use the surface preview to understand size and position.</p></div></article><article><span /><div><strong>Prepare the creative</strong><p>Start from a template or upload your own artwork.</p></div></article><article><span /><div><strong>Authorize after launch</strong><p>Real inventory, host approval, and payment will activate later.</p></div></article></div></section>
        <section className={styles.reviews}><p className={styles.sectionLabel}>New project status</p><div className={styles.reviewTitle}><h2>No invented history</h2></div><article><div className={styles.avatar}>0</div><div><strong>No completed campaigns yet</strong><p>Ratings, earnings, impressions, and placement history will appear only when they come from actual platform activity.</p><small>Pre-launch</small></div></article></section>
      </div>
    </>
  );
}

function SpotButton({ spot, selected, onSelect, onInspect }: { spot: Spot; selected: boolean; onSelect: () => void; onInspect: (active: boolean) => void }) {
  const spotStyle = {
    left: `${spot.x * 100}%`,
    top: `${spot.y * 100}%`,
    width: `${spot.width * 100}%`,
    height: `${spot.height * 100}%`,
    "--spot-rotation": `${spot.rotation ?? 0}deg`,
  } as CSSProperties;

  return <button type="button" className={`${styles.spot} ${styles.available} ${selected ? styles.spotSelected : ""}`} style={spotStyle} aria-pressed={selected} aria-label={`Example spot ${spot.id}, ${spot.name}, ${formatPhysicalSize(spot.physicalSize)}. ${spot.description ?? "Mapped sticker region."}`} onClick={onSelect} onMouseEnter={() => onInspect(true)} onMouseLeave={() => onInspect(false)} onFocus={() => onInspect(true)} onBlur={() => onInspect(false)}><b>{spot.id}</b><span className={styles.spotTooltip}><strong>{spot.name}</strong><small>{formatPhysicalSize(spot.physicalSize)}</small></span></button>;
}
