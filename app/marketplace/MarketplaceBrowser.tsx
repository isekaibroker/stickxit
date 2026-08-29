"use client";

import Link from "next/link";
import { ArrowRight, FolderKanban, Megaphone, QrCode, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { listings } from "@/lib/mock-data";
import { useWallet } from "@/components/wallet";
import { getSavedCampaigns, getSavedListings, onRecordsChanged, savedListingToMarketplaceListing, type SavedCampaign } from "@/lib/app-storage";
import { MarketplacePlacementCard } from "./MarketplacePlacementCard";
import styles from "./marketplace.module.css";

type MarketplaceView = "browse" | "campaigns" | "qr";

export function MarketplaceBrowser() {
  const { address, startLocalSession } = useWallet();
  const [localListings, setLocalListings] = useState<ReturnType<typeof savedListingToMarketplaceListing>[]>([]);
  const [campaigns, setCampaigns] = useState<SavedCampaign[]>([]);
  const [view, setView] = useState<MarketplaceView>("browse");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [city, setCity] = useState<string>("All cities");
  const [visibility, setVisibility] = useState("All visibility");
  const [sort, setSort] = useState("recommended");

  useEffect(() => {
    const load = () => {
      setLocalListings(address ? getSavedListings(address).map(savedListingToMarketplaceListing) : []);
      setCampaigns(address ? getSavedCampaigns(address) : []);
    };
    load();
    return onRecordsChanged(load);
  }, [address]);

  const allListings = useMemo(() => [...localListings, ...listings], [localListings]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(allListings.map((item) => item.category)))], [allListings]);
  const cities = useMemo(() => ["All cities", ...Array.from(new Set(allListings.map((item) => item.city)))], [allListings]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allListings
      .filter((item) => !normalized || `${item.title} ${item.city} ${item.category}`.toLowerCase().includes(normalized))
      .filter((item) => category === "All" || item.category === category)
      .filter((item) => city === "All cities" || item.city === city)
      .filter((item) => visibility === "All visibility" || item.visibility === visibility)
      .sort((a, b) => sort === "category" ? a.category.localeCompare(b.category) : sort === "capacity" ? b.totalSpots - a.totalSpots : 0);
  }, [allListings, category, city, query, sort, visibility]);

  const reset = () => { setQuery(""); setCategory("All"); setCity("All cities"); setVisibility("All visibility"); setSort("recommended"); };
  const qrCampaigns = campaigns.filter((campaign) => campaign.destination);

  return (
    <section id="marketplace-workspace" aria-label="Marketplace workspace">
      <nav className={styles.workspaceActions} aria-label="Marketplace actions">
        <button type="button" className={view === "browse" ? styles.workspaceActionActive : styles.workspaceAction} aria-pressed={view === "browse"} onClick={() => setView("browse")}>
          <Megaphone size={19} /><span><b>Browse placements</b><small>Select an item and exact sticker spot.</small></span><ArrowRight size={16} />
        </button>
        <button type="button" className={view === "campaigns" ? styles.workspaceActionActive : styles.workspaceAction} aria-pressed={view === "campaigns"} onClick={() => setView("campaigns")}>
          <FolderKanban size={19} /><span><b>My campaigns</b><small>{campaigns.length ? `${campaigns.length} saved locally` : "Open your campaign records"}</small></span><ArrowRight size={16} />
        </button>
        <button type="button" className={view === "qr" ? styles.workspaceActionActive : styles.workspaceAction} aria-pressed={view === "qr"} onClick={() => setView("qr")}>
          <QrCode size={19} /><span><b>QR destinations</b><small>{qrCampaigns.length ? `${qrCampaigns.length} dynamic link${qrCampaigns.length === 1 ? "" : "s"}` : "View editable campaign links"}</small></span><ArrowRight size={16} />
        </button>
      </nav>

      {view === "browse" && <div id="marketplace-results">
      <div className={styles.controls}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className={styles.srOnly}>Search listings</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search objects, cities, categories…" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}
        </label>
        <div className={styles.selectWrap}><SlidersHorizontal size={16} aria-hidden="true" /><label><span className={styles.srOnly}>City</span><select value={city} onChange={(e) => setCity(e.target.value)}>{cities.map((value) => <option key={value}>{value}</option>)}</select></label></div>
        <label className={styles.selectWrap}><span className={styles.srOnly}>Visibility</span><select value={visibility} onChange={(e) => setVisibility(e.target.value)}><option>All visibility</option><option>High</option><option>Medium</option></select></label>
      </div>

      <div className={styles.chips} aria-label="Filter by category">
        {categories.map((value) => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}
      </div>

      <div className={styles.resultsHead}>
        <div><p>{results.length} {results.length === 1 ? "surface" : "surfaces"}</p><span>{localListings.length ? `${localListings.length} local listing${localListings.length === 1 ? "" : "s"} plus reusable examples.` : "Choose any surface and spot to begin a campaign directly."}</span></div>
        <label>Sort by <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Featured</option><option value="category">Category</option><option value="capacity">Spot capacity</option></select></label>
      </div>

      {results.length ? <div className={styles.grid}>{results.map((listing) => <MarketplacePlacementCard key={listing.slug} listing={listing} />)}</div> : (
        <div className={styles.empty}><Search size={28} /><h2>No surfaces match those filters</h2><p>Try another city or category.</p><button type="button" onClick={reset}>Reset all filters</button></div>
      )}
      </div>}

      {view === "campaigns" && (
        <section className={styles.recordsPanel} aria-labelledby="marketplace-campaigns-title">
          <header><div><span>Local campaign records</span><h2 id="marketplace-campaigns-title">My campaigns</h2><p>Campaigns created from any marketplace spot appear here.</p></div>{campaigns.length > 0 && <Link href="/campaigns">Open campaign manager <ArrowRight size={15} /></Link>}</header>
          {!address ? <WorkspaceEmpty icon={<FolderKanban />} title="Open your local workspace" copy="Your campaigns are saved against the active browser workspace." action={<button type="button" onClick={() => void startLocalSession()}>Open local workspace</button>} /> : campaigns.length ? (
            <div className={styles.recordGrid}>{campaigns.map((campaign) => <article key={campaign.id}><span>{campaign.status}</span><h3>{campaign.name}</h3><p>{campaign.listingTitle}</p><strong>Spot {campaign.spotId} · {campaign.spotName}</strong><small>{campaign.mode}</small><Link href="/campaigns">Manage campaign <ArrowRight size={14} /></Link></article>)}</div>
          ) : <WorkspaceEmpty icon={<Megaphone />} title="No campaigns yet" copy="Browse a placement, choose its exact sticker spot, and start your first campaign." action={<button type="button" onClick={() => setView("browse")}>Browse placements</button>} />}
        </section>
      )}

      {view === "qr" && (
        <section className={styles.recordsPanel} aria-labelledby="marketplace-qr-title">
          <header><div><span>Dynamic campaign links</span><h2 id="marketplace-qr-title">QR destinations</h2><p>Open a saved short link or manage where it redirects.</p></div>{qrCampaigns.length > 0 && <Link href="/campaigns">Manage destinations <ArrowRight size={15} /></Link>}</header>
          {!address ? <WorkspaceEmpty icon={<QrCode />} title="Open your local workspace" copy="Dynamic QR destinations are stored locally for your active workspace." action={<button type="button" onClick={() => void startLocalSession()}>Open local workspace</button>} /> : qrCampaigns.length ? (
            <div className={styles.qrRecords}>{qrCampaigns.map((campaign) => <article key={campaign.id}><span className={styles.fakeQr} aria-hidden="true" /><div><small>{campaign.name}</small><h3>/r/{campaign.shortCode}</h3><p>{campaign.destination}</p></div><div><Link href={`/r/${campaign.shortCode}`}>Open link <ArrowRight size={14} /></Link><Link href="/campaigns">Edit destination</Link></div></article>)}</div>
          ) : <WorkspaceEmpty icon={<QrCode />} title="No QR destinations yet" copy="Create an Art + QR or QR-only campaign from a marketplace placement." action={<button type="button" onClick={() => setView("browse")}>Choose a placement</button>} />}
        </section>
      )}
    </section>
  );
}

function WorkspaceEmpty({ icon, title, copy, action }: { icon: ReactNode; title: string; copy: string; action: ReactNode }) {
  return <div className={styles.workspaceEmpty}><span>{icon}</span><h3>{title}</h3><p>{copy}</p>{action}</div>;
}
