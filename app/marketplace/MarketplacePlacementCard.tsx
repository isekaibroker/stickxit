"use client";

import Link from "@/components/AppLink";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { useState } from "react";
import { ProductArt } from "@/components/ProductArt";
import type { Listing } from "@/lib/mock-data";
import styles from "./marketplace.module.css";

export function MarketplacePlacementCard({ listing }: { listing: Listing }) {
  const [spotId, setSpotId] = useState(listing.spots[0]?.id ?? "");
  const spot = listing.spots.find((item) => item.id === spotId) ?? listing.spots[0];
  const detailHref = `/item/${encodeURIComponent(listing.slug)}?spot=${encodeURIComponent(spot?.id ?? "")}`;
  const campaignHref = `/campaigns/new?item=${encodeURIComponent(listing.slug)}&spot=${encodeURIComponent(spot?.id ?? "")}&template=upload&source=marketplace`;

  return (
    <article className={`listing-card ${styles.placementCard}`}>
      <Link href={detailHref} aria-label={`View ${listing.title} placement details for Spot ${spot?.id}`}>
        <ProductArt listing={listing} />
        <span className={styles.imageAction}><ArrowUpRight size={14} /> View Spot {spot?.id}</span>
      </Link>
      <div className="listing-card-body">
        <div className="listing-location"><MapPin size={13} /> Example / {listing.city}, {listing.country}</div>
        <div className="listing-title-row">
          <h3><Link href={detailHref}>{listing.title}</Link></h3>
          <Link className="round-link" href={detailHref} aria-label={`Inspect all spots on ${listing.title}`}><ArrowUpRight size={16} /></Link>
        </div>
        <div className="listing-meta"><span>{listing.totalSpots} mapped region{listing.totalSpots === 1 ? "" : "s"}</span><span>Example</span></div>

        <label className={styles.cardSpotSelect}>
          <span>Choose sticker spot</span>
          <select value={spot?.id ?? ""} onChange={(event) => setSpotId(event.target.value)}>
            {listing.spots.map((item) => <option key={item.id} value={item.id}>Spot {item.id} · {item.name} · {item.physicalSize}</option>)}
          </select>
        </label>

        <div className={styles.selectedSpotMeta}>
          <span>Selected</span>
          <strong>Spot {spot?.id} · {spot?.name}</strong>
          <small>{spot?.physicalSize}</small>
        </div>

        <Link href={campaignHref} className={styles.startCampaign}>
          Place my NFT on this spot <ArrowRight size={16} />
        </Link>
        <Link href={detailHref} className={styles.inspectLink}>Inspect placement details</Link>
      </div>
    </article>
  );
}
