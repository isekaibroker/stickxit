"use client";

import Link from "@/components/AppLink";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleAlert,
  LoaderCircle,
  Minus,
  Network,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/components/wallet/WalletProvider";
import { publicBrokerGallery, type PublicBrokerGalleryItem } from "@/lib/public-broker-gallery";
import styles from "./isekai.module.css";

type WalletAction = "connect" | "switch" | "verify" | "activate" | "disconnect";
const galleryBrokers = publicBrokerGallery.slice(0, 18);

function brokerLabel(broker: PublicBrokerGalleryItem) {
  return `Broker #${broker.id}`;
}

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

export function CollectionExperience() {
  const [selected, setSelected] = useState<PublicBrokerGalleryItem>(galleryBrokers[0]);
  const [pending, setPending] = useState<WalletAction | null>(null);
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
    disconnect,
    switchToConfiguredChain: switchNetwork,
    refreshOwnership,
    activateLicense,
  } = useWallet();

  const balance = Number(ownership.balance ?? 0);
  const previewMode = isLocalSession || !chainConfigured || !collectionAddress;
  const networkReady = previewMode || correctChain;
  const ownershipVerified = connected && correctChain && ownership.status === "owned" && balance > 0;
  const verificationReady = previewMode || ownershipVerified;
  const licenseActive = Boolean(license);

  async function runWalletAction(action: WalletAction, operation: () => void | Promise<void>) {
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

  function renderPrimaryAction() {
    if (!connected) {
      return (
        <button className={styles.stakeButton} type="button" disabled={pending !== null} onClick={() => void runWalletAction("connect", startLocalSession)}>
          {pending === "connect" ? <LoaderCircle className={styles.spin} size={17} /> : <Wallet size={17} />}
          {pending === "connect" ? "Opening workspace..." : "Enter local demo"}
        </button>
      );
    }
    if (!previewMode && !correctChain) {
      return (
        <button className={styles.stakeButton} type="button" disabled={pending !== null} onClick={() => void runWalletAction("switch", switchNetwork)}>
          {pending === "switch" ? <LoaderCircle className={styles.spin} size={17} /> : <Network size={17} />}
          {pending === "switch" ? "Switching network..." : "Switch to supported network"}
        </button>
      );
    }
    if (!previewMode && !ownershipVerified) {
      if (ownership.status === "checking") {
        return <button className={`${styles.stakeButton} ${styles.disabledAction}`} type="button" disabled><LoaderCircle className={styles.spin} size={17} /> Checking contract balance...</button>;
      }
      return <button className={`${styles.stakeButton} ${styles.disabledAction}`} type="button" disabled={pending !== null} onClick={() => void runWalletAction("verify", async () => { await refreshOwnership(); })}>{pending === "verify" ? <LoaderCircle className={styles.spin} size={17} /> : <BadgeCheck size={17} />} {pending === "verify" ? "Checking contract balance..." : "Recheck Broker balance"}</button>;
    }
    if (!licenseActive) {
      return (
        <button className={styles.stakeButton} type="button" disabled={pending !== null} onClick={() => void runWalletAction("activate", async () => { await activateLicense(); })}>
          {pending === "activate" ? <LoaderCircle className={styles.spin} size={17} /> : <ShieldCheck size={17} />}
          {pending === "activate" ? "Waiting for wallet..." : previewMode ? "Activate local preview" : "Sign license activation"}
        </button>
      );
    }
    return <Link className={styles.stakeButton} href="/broker">Enter Broker HQ <ArrowRight size={17} /></Link>;
  }

  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}><Sparkles size={14} /> The membership layer</p>
          <h1>Meet your<br /><em>market maker.</em></h1>
          <p className={styles.lede}>Explore every Broker workflow locally in your browser. A wallet and configured collection contract can be connected later for on-chain verification.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/launchpad">Become a Broker <ArrowRight size={17} /></Link>
            <a className={styles.secondary} href="#collection">Browse public gallery</a>
          </div>
          <p className={styles.demo}><span /> Non-custodial access - no NFT is staked, transferred, or approved.</p>
        </div>
        <div className={styles.heroCard}>
          <Image src="/isekai/gallery/0889.png" alt="Golden ram chancellor Isekai Broker artwork" width={1000} height={1000} priority />
          <div className={styles.heroCardMeta}><strong>Broker #0889</strong><small>Golden ram chancellor</small></div>
          <div className={styles.floatBadge}><ShieldCheck size={18} /><span><small>Utility</small>Broker License</span></div>
        </div>
      </section>

      <section className={styles.stats} aria-label="Collection statistics">
        <div><strong>4,444</strong><span>Original brokers</span></div>
        <div><strong>18</strong><span>Featured portraits</span></div>
        <div><strong>ERC-721</strong><span>Contract balance check</span></div>
        <div><strong>0</strong><span>NFT transfers required</span></div>
      </section>

      <section className={styles.utility} aria-labelledby="utility-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}>Broker utility</p><h2 id="utility-title">One license, practical local tools</h2></div>
          <p className={styles.utilityIntro}>The public gallery keeps collection classifications private while showing what the Broker workspace can do.</p>
        </div>
        <div className={styles.utilityGrid}>
          <article className={styles.utilityCard}><span>Mapped surfaces</span><strong>3–10<small> spots / item</small></strong><p>Define realistic sticker-safe regions on every listed object.</p></article>
          <article className={styles.utilityCard}><span>Local inventory</span><strong>1–2<small> items</small></strong><p>Prepare and manage item listings directly from the Broker workspace.</p></article>
          <article className={styles.utilityCard}><span>Broker listings</span><strong>0%<small> platform fee</small></strong><p>Broker-enabled item listings do not add a Stickxit platform fee.</p></article>
          <article className={styles.utilityCard}><span>Workspace access</span><strong>Local<small> or wallet</small></strong><p>Use the browser-only workspace now or verify a configured collection later.</p></article>
        </div>
      </section>

      <section className={styles.collection} id="collection" aria-labelledby="collection-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}>Collection artwork</p><h2 id="collection-title">Browse Broker portraits</h2></div>
        </div>

        <div className={styles.collectionLayout}>
          <div className={styles.grid} aria-live="polite">
            {galleryBrokers.map((broker) => (
              <button className={`${styles.brokerCard} ${selected.id === broker.id ? styles.selected : ""}`} key={broker.id} onClick={() => setSelected(broker)} type="button" aria-pressed={selected.id === broker.id} aria-label={`Preview artwork for ${brokerLabel(broker)}`}>
                <div className={styles.imageWrap}>
                  <Image src={broker.image} alt={`${broker.character} anime profile artwork`} width={1000} height={1000} />
                </div>
                <div><strong>{brokerLabel(broker)}</strong><small>{broker.character}</small></div>
              </button>
            ))}
          </div>

          <aside className={styles.detail} aria-label="Broker artwork preview and wallet access">
            <div className={styles.detailImage}><Image src={selected.image} alt={`${selected.character} artwork preview`} width={1000} height={1000} /></div>
            <div className={styles.detailTitle}><h3>{brokerLabel(selected)}</h3><p>{selected.character}</p></div>
            <dl className={styles.traits}>
              <div><dt>Clothing</dt><dd>{selected.clothing}</dd></div>
              <div><dt>Gender</dt><dd>{selected.gender}</dd></div>
              <div><dt>Background</dt><dd>{selected.background}</dd></div>
            </dl>

            <p className={`${styles.modeNotice} ${previewMode ? styles.localMode : ""}`}>
              <strong>{previewMode ? "Local preview" : "On-chain verification"}</strong>
              <span>{previewMode ? "Contract and chain verification is not fully configured. Portrait selection is only an artwork preview." : "The connected wallet balance is checked against the configured collection contract. Portrait selection does not claim token ownership."}</span>
            </p>

            <ol className={styles.activationSteps} aria-label="Broker license activation steps">
              <li className={connected ? styles.stepComplete : styles.stepCurrent}><Wallet size={15} /><span><strong>{isLocalSession ? "Local workspace" : "Connect wallet"}</strong><small>{isLocalSession ? "Browser-only simulation" : shortAddress(address)}</small></span>{connected && <Check size={14} />}</li>
              <li className={connected && networkReady ? previewMode ? styles.stepSkipped : styles.stepComplete : connected ? styles.stepCurrent : ""}><Network size={15} /><span><strong>{previewMode ? "Local preview mode" : "Supported network"}</strong><small>{previewMode ? "No target chain enforced" : correctChain ? targetChain.chainName : chainName(chainId)}</small></span>{connected && networkReady && (previewMode ? <Minus size={14} /> : <Check size={14} />)}</li>
              <li className={connected && verificationReady ? previewMode ? styles.stepSkipped : styles.stepComplete : connected && networkReady ? styles.stepCurrent : ""}><BadgeCheck size={15} /><span><strong>Contract balance check</strong><small>{previewMode ? "Unavailable in local preview" : ownershipVerified ? `${balance} Broker${balance === 1 ? "" : "s"} found by contract` : ownership.status === "checking" ? "Reading collection balance..." : "Collection balance required"}</small></span>{connected && verificationReady && (previewMode ? <Minus size={14} /> : <Check size={14} />)}</li>
              <li className={licenseActive ? styles.stepComplete : connected && networkReady && verificationReady ? styles.stepCurrent : ""}><ShieldCheck size={15} /><span><strong>Activate access</strong><small>{licenseActive ? "Saved on this device" : "Sign a wallet message"}</small></span>{licenseActive && <Check size={14} />}</li>
            </ol>

            <div className={`${styles.license} ${licenseActive ? styles.licenseActive : ""}`}><ShieldCheck size={22} /><span><strong>{previewMode ? "Local Preview" : "Broker License"} {licenseActive ? "Active" : "Inactive"}</strong><small>{licenseActive ? previewMode ? "Preview access is saved on this device" : "Contract-gated marketplace access unlocked" : "Complete the wallet steps to unlock access"}</small></span></div>
            {renderPrimaryAction()}
            {connected && <button className={styles.disconnectButton} type="button" disabled={pending !== null} onClick={() => void runWalletAction("disconnect", disconnect)}>{isLocalSession ? "Exit local demo" : `Disconnect ${shortAddress(address)}`}</button>}
            {(walletError || providerError) && <p className={styles.walletError} role="alert"><CircleAlert size={14} /> {walletError || providerError}</p>}
            <p className={styles.simulation}>{previewMode ? "Local preview access is saved only in this browser on this device." : "Activation is stored locally after the contract balance check and wallet message."}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
