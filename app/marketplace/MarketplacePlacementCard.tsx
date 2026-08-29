"use client";

import Link from "@/components/AppLink";
import { ArrowRight, ArrowUpRight, MapPin, Megaphone } from "lucide-react";
import { useState } from "react";
import { ProductArt } from "@/components/ProductArt";
import type { Listing } from "@/lib/mock-data";
import styles from "./marketplace.module.css";

export function MarketplacePlacementCard({ listing }: { listing: Listing }) {
  const [spotId, setSpotId] = useState(listing.spots[0]?.id ?? "");
  const spot = listing.spots.find((item) => item.id === spotId) ?? listing.spots[0];
  const campaignHref = `/campaigns/new?item=${encodeURIComponent(listing.slug)}&spot=${encodeURIComponent(spot?.id ?? "")}&source=marketplace`;

  return (
    <article className={`listing-card ${styles.placementCard}`}>
      <Link href={campaignHref} aria-label={`Start a campaign on ${listing.title}, Spot ${spot?.id}`}>
        <ProductArt listing={listing} />
        <span className={styles.imageAction}><Megaphone size={14} /> Start with Spot {spot?.id}</span>
      </Link>
      <div className="listing-card-body">
        <div className="listing-location"><MapPin size={13} /> {listing.local ? "Local workspace" : "Example"} · {listing.city}, {listing.country}</div>
        <div className="listing-title-row">
          <h3>{listing.title}</h3>
          <Link className="round-link" href={`/item/${listing.slug}`} aria-label={`Inspect all spots on ${listing.title}`}><ArrowUpRight size={16} /></Link>
        </div>
        <div className="listing-meta"><span>{listing.totalSpots} mapped region{listing.totalSpots === 1 ? "" : "s"}</span><span>{listing.local ? "Saved locally" : "Example"}</span></div>

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
          Start campaign on this spot <ArrowRight size={16} />
        </Link>
        <Link href={`/item/${listing.slug}?spot=${encodeURIComponent(spot?.id ?? "")}`} className={styles.inspectLink}>Inspect placement details</Link>
      </div>
    </article>
  );
}
