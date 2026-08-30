"use client";

import Link from "@/components/AppLink";
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
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { useWallet } from "@/components/wallet/WalletProvider";
import { getSavedCampaigns, onRecordsChanged, type SavedCampaign } from "@/lib/app-storage";
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
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [pending, setPending] = useState<"switch" | "check" | "activate" | null>(null);
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
    switchToConfiguredChain: switchNetwork,
    refreshOwnership,
    activateLicense,
  } = useWallet();

  const balance = Number(ownership.balance ?? 0);
  const verificationConfigured = chainConfigured && Boolean(collectionAddress);
  const ownershipVerified = connected && correctChain && ownership.status === "owned" && balance > 0;
  const accessReady = verificationConfigured && ownershipVerified && Boolean(license);
  const contractBalanceKnown = verificationConfigured
    && ownership.balance !== null
    && ["owned", "not-owned"].includes(ownership.status);
  const walletCampaigns = address
    ? savedCampaigns.filter((campaign) => campaign.owner.toLowerCase() === address.toLowerCase())
    : [];

  useEffect(() => {
    const refresh = () => setSavedCampaigns(address ? getSavedCampaigns(address) : []);
    const refreshTimer = window.setTimeout(refresh, 0);
    const unsubscribe = onRecordsChanged(refresh);
    return () => {
      window.clearTimeout(refreshTimer);
      unsubscribe();
    };
  }, [address]);

  async function runWalletAction(
    action: "switch" | "check" | "activate",
    operation: () => void | Promise<unknown>,
  ) {
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
      return <button type="button" onClick={() => setWalletModalOpen(true)}><Wallet size={17} /> Connect wallet</button>;
    }
    if (!verificationConfigured) {
      return <Link href="/launchpad"><LockKeyhole size={17} /> Mint status: TBA</Link>;
    }
    if (!correctChain) {
      return <button type="button" disabled={pending !== null} onClick={() => void runWalletAction("switch", switchNetwork)}>{pending === "switch" ? <LoaderCircle className={styles.spin} size={17} /> : <Network size={17} />} {pending === "switch" ? "Switching..." : "Switch network"}</button>;
    }
    if (!ownershipVerified) {
      return <button type="button" disabled={pending !== null} onClick={() => void runWalletAction("check", refreshOwnership)}>{pending === "check" ? <LoaderCircle className={styles.spin} size={17} /> : <BadgeCheck size={17} />} {pending === "check" ? "Checking..." : "Check Broker NFT"}</button>;
    }
    if (!license) {
      return <button type="button" disabled={pending !== null} onClick={() => void runWalletAction("activate", activateLicense)}>{pending === "activate" ? <LoaderCircle className={styles.spin} size={17} /> : <ShieldCheck size={17} />} {pending === "activate" ? "Waiting for wallet..." : "Activate Broker access"}</button>;
    }
    return <Link href="/marketplace"><ArrowUpRight size={17} /> Open Marketplace</Link>;
  }

  const accessStatus = !connected
    ? "Wallet required"
    : !verificationConfigured
      ? "Launch configuration pending"
      : !correctChain
        ? "Network switch required"
        : !ownershipVerified
          ? "Broker ownership required"
          : !license
            ? "Access signature required"
            : "Broker access active";

  return <>
    <section className={styles.welcome}>
      <div>
        <p className={styles.eyebrow}><Sparkles size={13} /> Broker command center</p>
        <h1>{accessReady ? <>Welcome back,<br /><em>licensed Broker.</em></> : <>Broker tools,<br /><em>ready after launch.</em></>}</h1>
        <p>Connect a wallet, verify Isekai Broker ownership, and manage platform access from one workspace.</p>
      </div>
      <div className={styles.welcomeActions}>
        <span><i className={accessReady ? styles.online : ""} /> {accessStatus}</span>
        {accessAction()}
      </div>
    </section>

    <section className={`${styles.accountBar} ${accessReady ? styles.accountActive : ""}`} aria-label="Connected wallet status">
      <div><Wallet size={17} /><span><small>Wallet</small><strong>{shortAddress(address)}</strong></span></div>
      <div><Network size={17} /><span><small>Network</small><strong className={connected && verificationConfigured && !correctChain ? styles.warning : ""}>{!verificationConfigured ? "Configuration pending" : correctChain ? targetChain.chainName : chainName(chainId)}</strong></span></div>
      <div><BadgeCheck size={17} /><span><small>Contract balance</small><strong>{!verificationConfigured ? "Not configured" : ownershipVerified ? `${balance} Broker${balance === 1 ? "" : "s"}` : "Not verified"}</strong></span></div>
      <div><ShieldCheck size={17} /><span><small>Broker access</small><strong>{accessReady ? "Active" : "Inactive"}</strong></span></div>
      <span className={styles.accessPill}>{accessReady ? <><Check size={13} /> Access unlocked</> : <><LockKeyhole size={13} /> Actions locked</>}</span>
    </section>

    {(walletError || providerError) && <p className={styles.walletError} role="alert"><CircleAlert size={14} /> {walletError || providerError}</p>}

    {!accessReady && (
      <section className={styles.accessNotice} aria-labelledby="access-notice-title">
        <LockKeyhole size={22} />
        <div>
          <strong id="access-notice-title">Broker tools remain locked until ownership can be verified</strong>
          <p>{verificationConfigured ? "Connect on the supported network, verify the collection balance, and sign the access message." : "The official network and collection contract will be published with the mint details."}</p>
        </div>
        <Link href="/launchpad">View mint status <ArrowUpRight size={15} /></Link>
      </section>
    )}

    <section className={`${styles.metrics} ${!accessReady ? styles.previewMetrics : ""}`} aria-label="Broker workspace status">
      <article><div><Layers3 size={18} /><span>Broker NFTs</span></div><strong>{contractBalanceKnown ? balance : "N/A"}</strong><small>{contractBalanceKnown ? "Verified collection contract balance" : "Waiting for collection verification"}</small></article>
      <article><div><FileCheck2 size={18} /><span>Listing tools</span></div><strong>TBA</strong><small>Temporarily unavailable before platform launch</small></article>
      <article><div><ShieldCheck size={18} /><span>Campaign records</span></div><strong>{walletCampaigns.length}</strong><small>Records authorized by this wallet</small></article>
      <article><div><BadgeCheck size={18} /><span>Broker platform fee</span></div><strong>0%</strong><small>For eligible Broker item listings</small></article>
    </section>

    <div className={`${styles.dashboardGrid} ${!accessReady ? styles.previewDashboard : ""}`}>
      <section className={styles.panel} aria-labelledby="attention-title">
        <header><div><p className={styles.eyebrow}>Getting started</p><h2 id="attention-title">Launch checklist</h2></div></header>
        <div className={styles.queue} aria-live="polite">
          <article><span><Wallet size={18} /></span><div><strong>Connect a wallet</strong><small>Use an installed EVM wallet to establish your account.</small></div>{connected ? <Check size={16} /> : <LockKeyhole size={16} />}</article>
          <article><span><BadgeCheck size={18} /></span><div><strong>Verify Broker ownership</strong><small>The official collection contract must report at least one NFT.</small></div>{ownershipVerified ? <Check size={16} /> : <LockKeyhole size={16} />}</article>
          <article><span><FileCheck2 size={18} /></span><div><strong>Listing tools launch</strong><small>Item listing will return after the production workflow is ready.</small></div><LockKeyhole size={16} /></article>
        </div>
      </section>

      <aside className={`${styles.panel} ${styles.portfolio}`} aria-labelledby="portfolio-title">
        <header className={styles.portfolioHeader}><div><p className={styles.eyebrow}>On-chain collection</p><h2 id="portfolio-title">Owned Brokers</h2></div><span className={accessReady ? styles.verified : styles.inactive}><ShieldCheck size={15} /> {accessReady ? "Access active" : "Access inactive"}</span></header>
        <div className={styles.contractPortfolio}>
          <span><BadgeCheck size={21} /></span>
          <strong>{contractBalanceKnown ? `${balance} Broker${balance === 1 ? "" : "s"} in this wallet` : "Collection balance unavailable"}</strong>
          <p>{verificationConfigured ? "The collection contract exposes the wallet balance. Token IDs, tiers, and artwork will appear after the ownership index is connected." : "The official collection contract has not been published yet. No NFT ownership is inferred."}</p>
        </div>
        <dl className={styles.portfolioFacts}><div><dt>Wallet</dt><dd>{shortAddress(address)}</dd></div><div><dt>Network</dt><dd>{verificationConfigured ? correctChain ? targetChain.chainName : "Unsupported" : "TBA"}</dd></div><div><dt>Broker access</dt><dd>{accessReady ? "Active" : "Inactive"}</dd></div><div><dt>Platform fee</dt><dd>0% for Broker listings</dd></div></dl>
        <Link className={styles.portfolioLink} href="/launchpad">View mint status <ArrowUpRight size={15} /></Link>
        <small className={styles.disclaimer}>Ownership verification will activate only after the official collection contract is configured.</small>
      </aside>

      <section className={`${styles.panel} ${styles.listings}`} aria-labelledby="listings-title">
        <header><div><p className={styles.eyebrow}>Pre-launch</p><h2 id="listings-title">Listing tools</h2></div><span className={styles.lockedLabel}><LockKeyhole size={12} /> TBA</span></header>
        <div className={styles.listingTable}><div className={styles.empty}><FileCheck2 size={20} /> Listing creation is temporarily unavailable.</div></div>
      </section>

      <section className={`${styles.panel} ${styles.campaigns}`} aria-labelledby="campaigns-title">
        <header><div><p className={styles.eyebrow}>Wallet records</p><h2 id="campaigns-title">Campaigns</h2></div></header>
        <div className={styles.campaignList}>{walletCampaigns.length ? walletCampaigns.map((campaign) => <div className={styles.localListingRow} key={campaign.id}><span className={styles.productIcon}>C</span><div><strong>{campaign.name}</strong><small>{campaign.listingTitle} / {campaign.spotName}</small></div><span><b>{campaign.status}</b><small>wallet authorized</small></span><FileCheck2 size={16} /></div>) : <div className={styles.empty}><ShieldCheck size={20} /> No wallet-authorized campaign records yet.</div>}</div>
      </section>
    </div>
    <p className={styles.previewNote}>No earnings, scans, NFT identities, or marketplace activity are inferred.</p>
    <WalletConnectModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
  </>;
}
