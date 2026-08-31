import Image from "next/image";
import Link from "@/components/AppLink";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CircleDashed,
  Clock3,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  brokerUtilityPolicies,
  formatItemAllowance,
  type BrokerUtilityTier,
} from "@/lib/broker-utility";
import { collectionDetails } from "@/lib/collection-details";
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
  return (
    <>
      <section className={styles.hero} aria-labelledby="launchpad-title">
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>
            <CircleDashed size={14} aria-hidden="true" /> Isekai Brokers Genesis on Robinhood Chain
          </span>
          <h1 id="launchpad-title">
            Launching on <em>Robinhood Chain.</em>
          </h1>
          <p className={styles.lede}>
            Robinhood Chain mainnet is live. The Genesis collection has
            a fixed supply of {collectionDetails.supplyLabel} Isekai Brokers. The mint remains closed, and the launch date,
            price, contract address, and allowlist details are TBA.
          </p>

          <div className={styles.heroActions}>
            <span className={styles.disabledMint} aria-disabled="true">
              <CalendarClock size={16} aria-hidden="true" /> Robinhood Chain Mint: TBA
            </span>
            <Link className={styles.collectionLink} href="/isekai-brokers">
              Explore the collection <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a className={styles.collectionLink} href="https://x.com/isekaibrokers" target="_blank" rel="noopener noreferrer">
              Follow launch updates on X <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className={styles.walletState} role="status">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>
              Minting is disabled until the official launch. No wallet action,
              transaction, reservation, or payment is available on this page.
            </span>
          </div>
          <div className={styles.walletState} role="note">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>Isekai Brokers is independent and is not affiliated with, endorsed by, or sponsored by Robinhood.</span>
          </div>
        </div>

        <div className={styles.preview} aria-label="Isekai Brokers collection preview">
          <div className={`${styles.brokerCard} ${styles.cardOne}`}>
            <Image
              src="/isekai/0219.png"
              alt="Anime human Isekai Broker collection preview"
              width={320}
              height={320}
              priority
            />
            <span>Collection preview</span>
          </div>
          <div className={`${styles.brokerCard} ${styles.cardTwo}`}>
            <Image
              src="/isekai/3057.png"
              alt="Anime frog Isekai Broker collection preview"
              width={320}
              height={320}
              priority
            />
            <span>{collectionDetails.supplyLabel} Brokers</span>
          </div>
          <div className={`${styles.brokerCard} ${styles.cardThree}`}>
            <Image
              src="/isekai/3678.png"
              alt="Anime creature Isekai Broker collection preview"
              width={320}
              height={320}
              priority
            />
            <span>Stickxit utility</span>
          </div>
          <div className={styles.portal} aria-hidden="true" />
        </div>
      </section>

      <section className={styles.readiness} aria-labelledby="readiness-title">
        <div className={styles.readinessIntro}>
          <span className={styles.sectionKicker}>Launch status</span>
          <h2 id="readiness-title">Robinhood Chain confirmed. Mint details are TBA.</h2>
          <p>
            The network is confirmed and its mainnet is live. This launchpad will
            activate only when the mint configuration and official collection
            contract are ready. Isekai Brokers is one Genesis collection
            with a fixed supply of {collectionDetails.supplyLabel}. Until launch, this remains an
            information page with no mint action.
          </p>
        </div>
        <dl className={styles.readinessGrid}>
          <div>
            <dt>Collection size</dt>
            <dd>{collectionDetails.supplyLabel}</dd>
          </div>
          <div>
            <dt>Mint status</dt>
            <dd className={styles.pending}>Not live</dd>
          </div>
          <div>
            <dt>Mint price</dt>
            <dd>TBA</dd>
          </div>
          <div>
            <dt>Launch date</dt>
            <dd>TBA</dd>
          </div>
          <div>
            <dt>Network</dt>
            <dd>Robinhood Chain</dd>
          </div>
          <div>
            <dt>Contract address</dt>
            <dd>TBA</dd>
          </div>
          <div>
            <dt>Allowlist</dt>
            <dd>TBA</dd>
          </div>
          <div>
            <dt>Collection data</dt>
            <dd>Finalized</dd>
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
            Commun Human and Commun Creature assignments require the official token utility map.
            Semi-Rare currently uses a six-spot launch allocation. Final utility assignments
            and item allowances will be published before minting opens.
          </p>
        </div>
      </section>

      <section className={styles.nextStep}>
        <div>
          <span className={styles.sectionKicker}>Before launch</span>
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
    </>
  );
}
