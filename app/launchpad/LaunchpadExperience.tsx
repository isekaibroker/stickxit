"use client";

import Image from "next/image";
import Link from "@/components/AppLink";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CircleDashed,
  CheckCircle2,
  Clock3,
  Layers3,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LOCAL_DEMO_ADDRESS, WalletConnectModal, useWallet } from "@/components/wallet";
import { brokerUtilityPolicies, formatItemAllowance, type BrokerUtilityTier } from "@/lib/broker-utility";
import { createRecordId, getSavedLocalBrokers, onRecordsChanged, saveLocalBroker, type SavedLocalBroker } from "@/lib/app-storage";
import styles from "./launchpad.module.css";

const utilityTones: Record<BrokerUtilityTier, "green" | "cyan" | "purple" | "orange" | "gold"> = {
  "Commun Human": "green",
  "Commun Creature": "cyan",
  "Semi-Rare": "purple",
  Rare: "purple",
  "Ultra-Rare": "orange",
  Legendary: "gold",
};

export function LaunchpadExperience() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<BrokerUtilityTier>("Commun Human");
  const [localMint, setLocalMint] = useState<SavedLocalBroker | null>(null);
  const [savedBrokerCount, setSavedBrokerCount] = useState(0);
  const {
    isConnected,
    shortAddress,
    walletName,
    chainConfigured,
    targetChain,
    address,
    startLocalSession,
    isLocalSession,
  } = useWallet();
  const activeOwner = address ?? LOCAL_DEMO_ADDRESS;

  useEffect(() => {
    const refresh = () => setSavedBrokerCount(getSavedLocalBrokers(activeOwner).length);
    const timer = window.setTimeout(refresh, 0);
    const unsubscribe = onRecordsChanged(refresh);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [activeOwner]);

  async function createDemoBroker() {
    const owner = activeOwner;
    if (!isConnected) await startLocalSession();
    const existing = getSavedLocalBrokers(owner);
    const record: SavedLocalBroker = {
      id: createRecordId("demo_broker"),
      owner,
      tokenNumber: existing.length + 1,
      tier: selectedTier,
      artwork: ["/isekai/0001.png", "/isekai/0002.png", "/isekai/0010.png"][existing.length % 3],
      createdAt: new Date().toISOString(),
      simulation: true,
    };
    saveLocalBroker(record);
    setLocalMint(record);
    setSavedBrokerCount(existing.length + 1);
  }

  return (
    <>
      <section className={styles.hero} aria-labelledby="launchpad-title">
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>
            <CircleDashed size={14} aria-hidden="true" /> Genesis mint launchpad
          </span>
          <h1 id="launchpad-title">
            Build your <em>local Broker.</em>
          </h1>
          <p className={styles.lede}>
            Try the complete Broker flow locally now. The demo mint creates a
            browser-only Broker record; it is not an NFT, blockchain transaction,
            reservation, or payment.
          </p>

          <div className={styles.heroActions}>
            <button className={styles.connectButton} type="button" onClick={() => void createDemoBroker()}>
              <Sparkles size={16} aria-hidden="true" /> {savedBrokerCount ? "Create another demo Broker" : "Create demo Broker"}
            </button>
            {!isConnected && <button className={styles.collectionLink} type="button" onClick={() => setWalletModalOpen(true)}><Wallet size={16} aria-hidden="true" /> Wallet options</button>}
            <Link className={styles.collectionLink} href="/isekai-brokers">
              Explore the collection <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <label className={styles.demoTier}>Demo utility tier
            <select value={selectedTier} onChange={(event) => setSelectedTier(event.target.value as BrokerUtilityTier)}>
              {brokerUtilityPolicies.map((policy) => <option value={policy.tier} key={policy.tier}>{policy.label} / {policy.spotsPerItem} spots</option>)}
            </select>
          </label>

          {localMint && <div className={styles.mintSuccess} role="status"><CheckCircle2 size={18} /><span><strong>Demo Broker #{String(localMint.tokenNumber).padStart(4, "0")} created</strong>{localMint.tier} / {savedBrokerCount} Broker{savedBrokerCount === 1 ? "" : "s"} saved in this browser</span><Link href="/broker">View portfolio</Link></div>}

          <div className={styles.walletState} aria-live="polite">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>
              {isLocalSession
                ? "Local demo active. Listings, campaigns, QR destinations, and demo Brokers persist in this browser."
                : isConnected
                  ? `${walletName ?? "Wallet"} connected as ${shortAddress}. A demo mint still remains browser-only.`
                  : "Use the local demo without an extension, or open wallet options for connection testing."}
            </span>
          </div>
        </div>

        <div className={styles.preview} aria-label="Isekai Brokers collection preview">
          <div className={`${styles.brokerCard} ${styles.cardOne}`}>
            <Image
              src="/isekai/0001.png"
              alt="Anime human Isekai Broker collection preview"
              width={320}
              height={320}
              priority
            />
            <span>Broker preview</span>
          </div>
          <div className={`${styles.brokerCard} ${styles.cardTwo}`}>
            <Image
              src="/isekai/0002.png"
              alt="Anime frog Isekai Broker collection preview"
              width={320}
              height={320}
              priority
            />
            <span>4,444 Genesis</span>
          </div>
          <div className={`${styles.brokerCard} ${styles.cardThree}`}>
            <Image
              src="/isekai/0010.png"
              alt="Anime creature Isekai Broker collection preview"
              width={320}
              height={320}
              priority
            />
            <span>Stickxit license</span>
          </div>
          <div className={styles.portal} aria-hidden="true" />
        </div>
      </section>

      <section className={styles.readiness} aria-labelledby="readiness-title">
        <div className={styles.readinessIntro}>
          <span className={styles.sectionKicker}>Launch status</span>
          <h2 id="readiness-title">Only confirmed details are shown.</h2>
          <p>
            Mint price, chain, contract address, opening date, and allowlist
            rules will appear here only after they are finalized.
          </p>
        </div>
        <dl className={styles.readinessGrid}>
          <div>
            <dt>Collection size</dt>
            <dd>4,444</dd>
          </div>
          <div>
            <dt>Mint status</dt>
            <dd className={styles.pending}>Not open</dd>
          </div>
          <div>
            <dt>Mint price</dt>
            <dd>Not published</dd>
          </div>
          <div>
            <dt>Opening date</dt>
            <dd>Not published</dd>
          </div>
          <div>
            <dt>Mint network</dt>
            <dd>{chainConfigured ? targetChain.chainName : "Not published"}</dd>
          </div>
          <div>
            <dt>Contract</dt>
            <dd>Not published</dd>
          </div>
        </dl>
      </section>

      <section className={styles.utility} aria-labelledby="utility-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionKicker}>Stickxit utility</span>
            <h2 id="utility-title">A Broker activates real placement capacity.</h2>
          </div>
          <div className={styles.feeBadge}>
            <BadgeCheck size={18} aria-hidden="true" />
            <span><strong>0% platform fee</strong> on Broker-enabled listings within the tier allowance</span>
          </div>
        </div>

        <div className={styles.tierGrid}>
          {brokerUtilityPolicies.map((policy) => (
            <article className={`${styles.tierCard} ${styles[utilityTones[policy.tier]]}`} key={policy.tier}>
              <span className={styles.tierLabel}>{policy.label}</span>
              <h3>{policy.audience}</h3>
              <div>
                <span><Layers3 size={15} aria-hidden="true" /> {formatItemAllowance(policy.maxItems)}</span>
                <span><Sparkles size={15} aria-hidden="true" /> {policy.spotsPerItem} spots / item</span>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.policyNote}>
          <Clock3 size={18} aria-hidden="true" />
          <p>
            Semi-Rare currently uses a six-spot launch allocation. Its final confirmation,
            plus the item allowances for Ultra-Rare and Legendary Brokers, will be
            published before minting opens.
          </p>
        </div>
      </section>

      <section className={styles.nextStep}>
        <div>
          <span className={styles.sectionKicker}>While the portal is closed</span>
          <h2>Meet the Brokers before mint.</h2>
          <p>
            Browse the public collection preview and learn how each Broker tier
            connects to real-world Stickxit placements.
          </p>
        </div>
        <Link className={styles.connectButton} href="/isekai-brokers">
          <ArrowLeft size={16} aria-hidden="true" /> Back to Isekai Brokers
        </Link>
      </section>

      <WalletConnectModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        title="Connect for launch readiness"
      />
    </>
  );
}
