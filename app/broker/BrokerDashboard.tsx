"use client";

import Link from "@/components/AppLink";
import Image from "next/image";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  CircleAlert,
  FileCheck2,
  Layers3,
  LoaderCircle,
  LockKeyhole,
  Network,
  Plus,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useWallet } from "@/components/wallet/WalletProvider";
import { getSavedCampaigns, getSavedListings, getSavedLocalBrokers, onRecordsChanged, type SavedCampaign, type SavedListing, type SavedLocalBroker } from "@/lib/app-storage";
import { brokerUtilityByTier, type BrokerUtilityTier } from "@/lib/broker-utility";
import styles from "./broker.module.css";

function shortAddress(address: string | null | undefined) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected";
}

function chainName(chainId: number | string | null | undefined) {
  if (!chainId) return "Not detected";
  const normalized = Number(chainId);
  if (normalized === 1) return "Ethereum";
  if (normalized === 137) return "Polygon";
  if (normalized === 8453) return "Base";
  if (normalized === 11155111) return "Sepolia";
  return `Chain ${chainId}`;
}

export function BrokerDashboard() {
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [savedBrokers, setSavedBrokers] = useState<SavedLocalBroker[]>([]);
  const [pending, setPending] = useState<"connect" | "switch" | null>(null);
  const [walletError, setWalletError] = useState("");
  const {
    address,
    chainId,
    isConnected: connected,
    isCorrectChain: correctChain,
    chainConfigured,
    collectionAddress,
    ownership,
    license,
    error: providerError,
    targetChain,
    startLocalSession,
    isLocalSession,
    switchToConfiguredChain: switchNetwork,
  } = useWallet();
  const balance = Number(ownership.balance ?? 0);
  const previewMode = isLocalSession || !chainConfigured || !collectionAddress;
  const networkReady = previewMode || correctChain;
  const ownershipVerified = connected && correctChain && ownership.status === "owned" && balance > 0;
  const verificationReady = previewMode || ownershipVerified;
  const licenseActive = Boolean(license);
  const accessReady = connected && networkReady && verificationReady && licenseActive;
  const localListings = address ? savedListings.filter((listing) => listing.owner.toLowerCase() === address.toLowerCase()) : [];
  const localSpotCount = localListings.reduce((total, listing) => total + listing.spots.length, 0);
  const localCampaigns = address ? savedCampaigns.filter((campaign) => campaign.owner.toLowerCase() === address.toLowerCase()) : [];
  const localBrokers = address ? savedBrokers.filter((broker) => broker.owner.toLowerCase() === address.toLowerCase()) : [];
  const contractBalanceKnown = !previewMode && ownership.balance !== null && ["owned", "not-owned"].includes(ownership.status);
  const totalBrokerCount: number | string = previewMode ? localBrokers.length : contractBalanceKnown ? balance : "—";
  const localCapacity = localBrokers.reduce((summary, broker) => {
    const policy = brokerUtilityByTier[broker.tier as BrokerUtilityTier];
    if (!policy) return summary;
    if (policy.maxItems === null) summary.hasUnpublishedAllowance = true;
    else {
      summary.knownItems += policy.maxItems;
      summary.knownPlacementSpots += policy.maxItems * policy.spotsPerItem;
    }
    return summary;
  }, { knownItems: 0, knownPlacementSpots: 0, hasUnpublishedAllowance: false });

  useEffect(() => {
    const refresh = () => {
      setSavedListings(address ? getSavedListings(address) : []);
      setSavedCampaigns(address ? getSavedCampaigns(address) : []);
      setSavedBrokers(address ? getSavedLocalBrokers(address) : []);
    };
    const refreshTimer = window.setTimeout(refresh, 0);
    const unsubscribe = onRecordsChanged(refresh);
    return () => { window.clearTimeout(refreshTimer); unsubscribe(); };
  }, [address]);

  async function runWalletAction(action: "connect" | "switch", operation: () => void | Promise<void>) {
    setWalletError("");
    setPending(action);
    try {
      await operation();
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "The wallet request was not completed.");
    } finally {
      setPending(null);
    }
  }

  function accessAction() {
    if (!connected) {
      return <button type="button" disabled={pending !== null} onClick={() => void runWalletAction("connect", startLocalSession)}>{pending === "connect" ? <LoaderCircle className={styles.spin} size={17} /> : <Wallet size={17} />} {pending === "connect" ? "Opening workspace..." : "Enter local demo"}</button>;
    }
    if (!previewMode && !correctChain) {
      return <button type="button" disabled={pending !== null} onClick={() => void runWalletAction("switch", switchNetwork)}>{pending === "switch" ? <LoaderCircle className={styles.spin} size={17} /> : <Network size={17} />} {pending === "switch" ? "Switching..." : "Switch network"}</button>;
    }
    if (!previewMode && !ownershipVerified) {
      return <Link href="/isekai-brokers"><BadgeCheck size={17} /> View Broker requirements</Link>;
    }
    if (!licenseActive) {
      return <Link href="/isekai-brokers"><ShieldCheck size={17} /> Activate license</Link>;
    }
    return <Link href="/create-listing"><Plus size={17} /> Create listing</Link>;
  }

  return <>
    <section className={styles.welcome}>
      <div>
        <p className={styles.eyebrow}><Sparkles size={13} /> Broker command center</p>
        <h1>{accessReady ? <>Welcome back,<br /><em>{previewMode ? "preview Broker." : "licensed Broker."}</em></> : <>Your business,<br /><em>one license away.</em></>}</h1>
        <p>Manage physical inventory, campaign activity, and wallet-gated Broker access from one workspace.</p>
      </div>
      <div className={styles.welcomeActions}>
        <span><i className={accessReady ? styles.online : ""} /> {accessReady ? previewMode ? "Local preview active" : "Broker access active" : "Wallet access required"}</span>
        {accessAction()}
      </div>
    </section>

    <section className={`${styles.accountBar} ${accessReady ? styles.accountActive : ""}`} aria-label="Connected wallet status">
      <div><Wallet size={17} /><span><small>Wallet</small><strong>{shortAddress(address)}</strong></span></div>
      <div><Network size={17} /><span><small>Network</small><strong className={connected && !networkReady ? styles.warning : ""}>{previewMode ? "Local preview" : correctChain ? targetChain.chainName : chainName(chainId)}</strong></span></div>
      <div><BadgeCheck size={17} /><span><small>Contract balance</small><strong>{previewMode ? "Check unavailable" : ownershipVerified ? `${balance} Broker${balance === 1 ? "" : "s"}` : "Not verified"}</strong></span></div>
      <div><ShieldCheck size={17} /><span><small>Access record</small><strong>{licenseActive ? "Saved on this device" : "Inactive"}</strong></span></div>
      <span className={styles.accessPill}>{accessReady ? <><Check size={13} /> {previewMode ? "Local preview" : "Access unlocked"}</> : <><LockKeyhole size={13} /> Actions locked</>}</span>
    </section>
    {(walletError || providerError) && <p className={styles.walletError} role="alert"><CircleAlert size={14} /> {walletError || providerError}</p>}

    {!accessReady && (
      <section className={styles.accessNotice} aria-labelledby="access-notice-title">
        <LockKeyhole size={22} />
        <div><strong id="access-notice-title">{previewMode ? "Activate local preview access" : "Activate Broker access to manage listings"}</strong><p>{previewMode ? "Contract and chain verification is not fully configured. Connect a wallet and save a local access record on this device to use the preview tools." : "Connect on the supported network, pass the collection contract balance check, and save the signed access record to enable operational actions."}</p></div>
        <Link href="/isekai-brokers">Complete setup <ArrowUpRight size={15} /></Link>
      </section>
    )}

    <section className={`${styles.metrics} ${!accessReady ? styles.previewMetrics : ""}`} aria-label="Current local Broker records">
      <article><div><Layers3 size={18} /><span>Total Brokers</span></div><strong>{totalBrokerCount}</strong><small>{previewMode ? `${localBrokers.length} browser-local Broker${localBrokers.length === 1 ? "" : "s"}` : contractBalanceKnown ? "Verified collection contract balance" : "Waiting for contract balance"}</small></article>
      <article><div><FileCheck2 size={18} /><span>Local listings</span></div><strong>{localListings.length}</strong><small>Saved for this wallet on this device</small></article>
      <article><div><BadgeCheck size={18} /><span>Mapped spots</span></div><strong>{localSpotCount}</strong><small>Across local listing records</small></article>
      <article><div><ShieldCheck size={18} /><span>Local campaigns</span></div><strong>{localCampaigns.length}</strong><small>Saved advertiser campaign records</small></article>
    </section>

    <div className={`${styles.dashboardGrid} ${!accessReady ? styles.previewDashboard : ""}`}>
      <section className={styles.panel} aria-labelledby="attention-title">
        <header><div><p className={styles.eyebrow}>Getting started</p><h2 id="attention-title">Launch checklist</h2></div></header>
        <div className={styles.queue} aria-live="polite">
          <article><span><Wallet size={18} /></span><div><strong>Connect and activate</strong><small>Use your wallet to create a local Broker access record.</small></div>{accessReady ? <Check size={16} /> : <LockKeyhole size={16} />}</article>
          <article><span><FileCheck2 size={18} /></span><div><strong>Create your first listing</strong><small>Add a real item and map the regions advertisers can request.</small></div>{localListings.length ? <Check size={16} /> : <LockKeyhole size={16} />}</article>
          <article><span><ShieldCheck size={18} /></span><div><strong>Wait for network launch</strong><small>Live bookings, payments, and performance data will appear only after launch.</small></div><LockKeyhole size={16} /></article>
        </div>
      </section>

      <aside className={`${styles.panel} ${styles.portfolio}`} aria-labelledby="portfolio-title">
        <header className={styles.portfolioHeader}><div><p className={styles.eyebrow}>{previewMode ? "Browser-local collection" : "Configured collection"}</p><h2 id="portfolio-title">Owned Brokers</h2></div><span className={licenseActive ? styles.verified : styles.inactive}><ShieldCheck size={15} /> {licenseActive ? "Access active" : "Access inactive"}</span></header>

        {previewMode ? localBrokers.length ? (
          <div className={styles.brokerPortfolio}>
            {localBrokers.map((broker) => (
              <article key={broker.id} className={styles.brokerCard}>
                <Image src={broker.artwork} alt={`Local Broker #${String(broker.tokenNumber).padStart(4, "0")} artwork`} width={320} height={320} />
                <div><strong>Broker #{String(broker.tokenNumber).padStart(4, "0")}</strong><span>{broker.tier}</span></div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyPortfolio}><Layers3 size={24} /><strong>Broker mint not live</strong><p>Broker access will appear here after the Genesis mint opens and ownership can be verified.</p><Link href="/launchpad">View mint status <ArrowUpRight size={14} /></Link></div>
        ) : (
          <div className={styles.contractPortfolio}>
            <span><BadgeCheck size={21} /></span>
            <strong>{contractBalanceKnown ? `${balance} Broker${balance === 1 ? "" : "s"} in this wallet` : ownership.status === "checking" ? "Checking collection balance" : "Collection balance unavailable"}</strong>
            <p>The configured contract exposes a wallet balance only. Token IDs, tiers, and artwork are not available here, so none are inferred or displayed.</p>
          </div>
        )}

        <div className={styles.capacitySummary}>
          <div><small>Broker count</small><strong>{totalBrokerCount}</strong></div>
          <div><small>{previewMode ? "Known item allowance" : "Utility capacity"}</small><strong>{previewMode ? `${localCapacity.knownItems} item${localCapacity.knownItems === 1 ? "" : "s"}` : "By token tier"}</strong></div>
          <div><small>{previewMode ? "Known spot capacity" : "Token details"}</small><strong>{previewMode ? `${localCapacity.knownPlacementSpots} spots` : "Not read"}</strong></div>
          {previewMode && localCapacity.hasUnpublishedAllowance && <p>Some owned tiers have item allowances that will be published before mint; those unknown limits are not included above.</p>}
          {!previewMode && <p>Contract balance does not reveal the tiers required to calculate per-item or spot capacity.</p>}
        </div>

        <dl className={styles.portfolioFacts}><div><dt>Wallet</dt><dd>{shortAddress(address)}</dd></div><div><dt>Network</dt><dd>{previewMode ? "Local preview" : correctChain ? targetChain.chainName : "Unsupported"}</dd></div><div><dt>Access record</dt><dd>{licenseActive ? "Saved on this device" : "Inactive"}</dd></div><div><dt>Platform fee</dt><dd>0% for Broker listings</dd></div></dl>
        <Link className={styles.portfolioLink} href={previewMode ? "/launchpad" : "/isekai-brokers"}>{previewMode ? "View mint status" : "View collection access"} <ArrowUpRight size={15} /></Link>
        <small className={styles.disclaimer}>{previewMode ? "Broker ownership verification will activate after the official collection contract is published." : "The displayed count comes from the configured collection contract balance. No token identity or metadata is assumed."}</small>
      </aside>

      <section className={`${styles.panel} ${styles.listings}`} aria-labelledby="listings-title">
        <header><div><p className={styles.eyebrow}>This device</p><h2 id="listings-title">Listings</h2></div>{accessReady ? <Link href="/create-listing">New listing <Plus size={14} /></Link> : <span className={styles.lockedLabel}><LockKeyhole size={12} /> Locked</span>}</header>
        <div className={styles.listingTable}>
          {localListings.map((listing) => <div className={styles.localListingRow} key={listing.id}><span className={styles.productIcon}>{listing.category.slice(0,1)}</span><div><strong>{listing.title}</strong><small>{listing.city} / {listing.spots.length} local spot{listing.spots.length === 1 ? "" : "s"}</small></div><span><b>{listing.status}</b><small>saved on this device</small></span><FileCheck2 size={16} /></div>)}
          {!localListings.length && <div className={styles.empty}><FileCheck2 size={20} /> No listings have been saved for this wallet on this device.</div>}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.campaigns}`} aria-labelledby="campaigns-title">
        <header><div><p className={styles.eyebrow}>Network status</p><h2 id="campaigns-title">Campaign requests</h2></div></header>
        <div className={styles.campaignList}>{localCampaigns.length ? localCampaigns.map((campaign) => <div className={styles.localListingRow} key={campaign.id}><span className={styles.productIcon}>C</span><div><strong>{campaign.name}</strong><small>{campaign.listingTitle} / {campaign.spotName}</small></div><span><b>{campaign.status}</b><small>saved locally</small></span><FileCheck2 size={16} /></div>) : <div className={styles.empty}><ShieldCheck size={20} /> No local campaign records yet. Create one from a Marketplace spot.</div>}</div>
      </section>
    </div>
    <p className={styles.previewNote}>Only wallet state and records saved on this device are shown. No earnings, scans, or marketplace activity are invented.</p>
  </>;
}
