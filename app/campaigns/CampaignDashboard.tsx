"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, ExternalLink, QrCode, Wallet } from "lucide-react";
import { useWallet } from "@/components/wallet/WalletProvider";
import { getSavedCampaigns, onRecordsChanged, updateCampaignDestination, type SavedCampaign } from "@/lib/app-storage";
import styles from "./campaigns.module.css";

type Status = "Active" | "Completed" | "Draft" | "Ready";
type CampaignCard = { id: string; name: string; listing: string; status: Status; scans: number; unique: number; today: number; week: number[]; destination: string; shortCode: string; local: boolean };

const filters = ["All", "Active", "Completed", "Ready", "Draft"] as const;

function localCard(campaign: SavedCampaign): CampaignCard {
  const events = (campaign.scanEvents ?? [])
    .map((event) => ({ ...event, date: new Date(event.at) }))
    .filter((event) => !Number.isNaN(event.date.getTime()));
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const week = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - (6 - index));
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return events.filter((event) => event.date >= start && event.date < end).length;
  });
  return { id: campaign.id, name: campaign.name, listing: `${campaign.listingTitle} · Spot ${campaign.spotId}`, status: campaign.status,
    scans: events.length, unique: new Set(events.map((event) => event.visitorId)).size, today: week[6], week, destination: campaign.destination,
    shortCode: campaign.shortCode, local: true };
}

function MiniQr() { return <span className={styles.qr} aria-hidden="true">{Array.from({ length: 25 }, (_, i) => <i key={i} className={(i * 7 + Math.floor(i / 5)) % 3 ? styles.qrDark : ""} />)}</span>; }

export function CampaignDashboard() {
  const { address, connected, startLocalSession } = useWallet();
  const [saved, setSaved] = useState<SavedCampaign[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedId, setSelectedId] = useState("");
  const [destinationDrafts, setDestinationDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!address) return;
    const refresh = () => setSaved(getSavedCampaigns(address));
    const refreshTimer = window.setTimeout(refresh, 0);
    const unsubscribe = onRecordsChanged(refresh);
    return () => { window.clearTimeout(refreshTimer); unsubscribe(); };
  }, [address]);

  const records = useMemo(() => address ? saved.map(localCard) : [], [address, saved]);
  const shown = records.filter(item => filter === "All" || item.status === filter);
  const selected = shown.find((item) => item.id === selectedId) ?? shown[0];
  const max = Math.max(...(selected?.week ?? [1]), 1);
  const destination = selected ? destinationDrafts[selected.id] ?? selected.destination : "";

  function choose(item: CampaignCard) { setSelectedId(item.id); setNotice(""); }
  function updateDestination(event: React.FormEvent) {
    event.preventDefault();
    if (!address || !selected?.local) {
      setNotice("Create a wallet-linked campaign before managing a destination.");
      return;
    }
    updateCampaignDestination(address, selected.id, destination);
    setNotice("Destination saved on this device for the connected wallet.");
  }

  if (!connected) return <main className={styles.main}><section className={styles.accessCard}><Wallet size={34} /><span className={styles.eyebrow}>Marketplace campaigns</span><h1>Open your local campaigns</h1><p>Enter the browser-only demo to create campaign records and manage dynamic QR destinations without a wallet or backend.</p><button className="button" onClick={() => void startLocalSession()}>Enter local demo</button><Link href="/marketplace">Browse placements first</Link></section></main>;

  return <main className={styles.main}>
    <section className={styles.hero}>
      <div><span className={styles.eyebrow}>Campaign workspace</span><h1>Campaigns</h1><p>Track QR activity, manage destinations, and prepare placements owned by <span className={styles.walletOwner}>{address?.slice(0, 6)}…{address?.slice(-4)}</span>.</p></div>
      <Link className="button" href="/campaigns/new">New campaign <ArrowUpRight size={17} /></Link>
    </section>

    <section aria-labelledby="campaign-list-heading">
      <div className={styles.sectionHead}><div><h2 id="campaign-list-heading">Your campaigns</h2><p>{saved.length ? `${saved.length} record${saved.length === 1 ? "" : "s"} saved on this device` : "No campaigns have been created for this wallet yet"}</p></div>
        <div className={styles.tabs} role="group" aria-label="Filter campaigns">{filters.map(value => <button key={value} className={filter === value ? styles.tabActive : styles.tab} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
      </div>
      {shown.length ? <div className={styles.cardGrid}>{shown.map(item => <button key={item.id} className={`${styles.campaignCard} ${selected?.id === item.id ? styles.selected : ""}`} onClick={() => choose(item)} aria-pressed={selected?.id === item.id}>
        <span className={styles.cardTop}><span className={styles.status} data-status={item.status.toLowerCase()}>{item.status}</span><ExternalLink size={16} /></span>
        <strong>{item.name}</strong><span>{item.listing}</span><span className={styles.localRecord}><Check size={13} /> Saved on this device</span><span className={styles.metric}><b>{item.scans}</b> recorded scans</span>
      </button>)}</div> : <div className={styles.emptyWalletState}><h2>No campaigns here yet</h2><p>Choose a Marketplace placement, then upload and adjust your artwork.</p><Link className="button" href="/marketplace">Browse Marketplace placements</Link></div>}
    </section>

    {selected && <section className={styles.analytics} aria-labelledby="analytics-title">
      <div className={styles.analyticsMain}><span className={styles.eyebrow}>Wallet-linked campaign</span><h2 id="analytics-title">{selected.name}</h2>
        <div className={styles.stats}><div><b>{selected.scans}</b><span>Total scans</span></div><div><b>{selected.unique}</b><span>Unique scans</span></div><div><b>{selected.today}</b><span>Scans today</span></div></div>
        <div className={styles.chart} aria-label={`Seven-day QR scans: ${selected.week.join(", ")}`}>
          {selected.week.map((value, index) => <div key={index}><span style={{ height: `${Math.max((value / max) * 100, 3)}%` }} title={`${value} scans`} /><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></div>)}
        </div><p className={styles.disclaimer}>Only recorded QR scan events are shown. Impressions, click-through rates, and audience estimates are not inferred.</p>
      </div>
      <aside className={styles.redirectCard} aria-labelledby="redirect-title"><MiniQr /><span className={styles.eyebrow}>Dynamic QR</span><h2 id="redirect-title">Change the destination</h2><p>The printed short link stays fixed while its destination changes.</p>
        <Link className={styles.shortLink} href={`/r/${selected.shortCode}`}><QrCode size={18} /><span>/r/{selected.shortCode}</span><ExternalLink size={14} /></Link>
        <form onSubmit={updateDestination}><label htmlFor="destination">Destination URL</label><input id="destination" type="url" required disabled={!selected.local} value={destination} onChange={event => setDestinationDrafts((drafts) => ({ ...drafts, [selected.id]: event.target.value }))} /><button className="button" type="submit" disabled={!selected.local}>Save destination</button></form>
        <p className={styles.current}><Check size={15} /> Saved destination: <span>{selected.destination || "Artwork-only campaign"}</span></p><p className={styles.notice} aria-live="polite">{notice}</p>
      </aside>
    </section>}
  </main>;
}
