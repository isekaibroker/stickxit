import Link from "@/components/AppLink";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Listing } from "@/lib/mock-data";
import { ProductArt } from "./ProductArt";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="listing-card">
      <Link href={`/item/${listing.slug}`} aria-label={`View ${listing.title}`}><ProductArt listing={listing} /></Link>
      <div className="listing-card-body">
        <div className="listing-location"><MapPin size={13} /> {listing.local ? "Local workspace" : "Example"} · {listing.city}, {listing.country}</div>
        <div className="listing-title-row">
          <h3><Link href={`/item/${listing.slug}`}>{listing.title}</Link></h3>
          <Link className="round-link" href={`/item/${listing.slug}`} aria-label={`Open ${listing.title}`}><ArrowUpRight size={16} /></Link>
        </div>
        <div className="listing-meta"><span>{listing.totalSpots} mapped region{listing.totalSpots === 1 ? "" : "s"}</span><span>{listing.local ? "Saved locally" : "Example"}</span></div>
        <div className="listing-price">{listing.local && listing.startingPrice !== undefined ? <><small>Starting from</small><strong>${listing.startingPrice}</strong><span>/ {listing.bookingDuration ?? "booking"}</span></> : <><small>Use as a campaign template</small><strong>View</strong><span>example</span></>}</div>
      </div>
    </article>
  );
}
