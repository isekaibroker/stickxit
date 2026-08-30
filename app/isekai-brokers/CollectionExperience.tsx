"use client";

import Link from "@/components/AppLink";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Check, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { publicBrokerGallery, type PublicBrokerGalleryItem } from "@/lib/public-broker-gallery";
import styles from "./isekai.module.css";

const galleryBrokers = publicBrokerGallery.slice(0, 18);

function brokerLabel(broker: PublicBrokerGalleryItem) {
  return `Broker #${broker.id}`;
}

export function CollectionExperience() {
  const [selected, setSelected] = useState<PublicBrokerGalleryItem>(galleryBrokers[0]);

  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}><Sparkles size={14} /> Isekai Brokers · Genesis access collection</p>
          <h1>Own the license<br /><em>behind Stickxit.</em></h1>
          <p className={styles.lede}>Isekai Brokers are utility NFTs for the Stickxit marketplace. Hold a Broker to unlock host tools, list real-world advertising surfaces, manage sticker placements, and qualify for the holder fee allocation.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/launchpad">Become a Broker <ArrowRight size={17} /></Link>
            <a className={styles.secondary} href="#utility">Explore NFT utility</a>
          </div>
          <p className={styles.custodyNote}><span /> Your NFT stays in your wallet—access never requires transferring or approving it.</p>
        </div>
        <div className={styles.heroCard}>
          <Image src="/isekai/gallery/0889.png" alt="Golden ram chancellor Isekai Broker artwork" width={1000} height={1000} priority />
          <div className={styles.heroCardMeta}><strong>Broker #0889</strong><small>Golden ram chancellor</small></div>
          <div className={styles.floatBadge}><ShieldCheck size={18} /><span><small>Utility</small>Broker License</span></div>
        </div>
      </section>

      <section className={styles.stats} aria-label="Collection utility statistics">
        <div><strong>4,444</strong><span>Genesis Brokers</span></div>
        <div><strong>3–10</strong><span>Sticker spots per item</span></div>
        <div><strong>0%</strong><span>Fee on eligible Broker listings</span></div>
        <div><strong>20%</strong><span>Platform fees allocated to eligible holders</span></div>
      </section>

      <section className={styles.utility} id="utility" aria-labelledby="utility-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}>NFT utility</p><h2 id="utility-title">One Broker. A real marketplace role.</h2></div>
          <p className={styles.utilityIntro}>A Broker is more than collection artwork. Wallet ownership unlocks the tools that let hosts turn approved items into measurable advertising space.</p>
        </div>
        <div className={styles.utilityGrid}>
          <article className={styles.utilityCard}><span>Broker HQ access</span><strong>Verify<small> ownership</small></strong><p>Connect the holding wallet to access listing, placement, campaign, and performance tools.</p></article>
          <article className={styles.utilityCard}><span>Real inventory</span><strong>1–2<small> items</small></strong><p>List approved physical items and map realistic sticker-safe regions for advertisers.</p></article>
          <article className={styles.utilityCard}><span>License capacity</span><strong>3–10<small> spots / item</small></strong><p>Each Broker defines how many items and sticker placements its holder can operate.</p></article>
          <article className={styles.utilityCard}><span>Holder allocation</span><strong>20%<small> of platform fees</small></strong><p>Twenty percent of platform fees collected by Stickxit is allocated to eligible Isekai Broker holders.</p></article>
        </div>
        <article className={styles.feeDisclosure} id="holder-allocation">
          <BadgeCheck size={24} />
          <div>
            <strong>The holder allocation</strong>
            <p>20% of platform fees collected by Stickxit is reserved for eligible Isekai Broker holders. Distribution timing, wallet eligibility, claim rules, and excluded fees will be defined in the published Holder Rewards Terms. Allocations depend on marketplace activity and are not guaranteed.</p>
          </div>
        </article>
      </section>

      <section className={styles.collection} id="collection" aria-labelledby="collection-title">
        <div className={styles.sectionHead}>
          <div><p className={styles.kicker}>The Genesis collection</p><h2 id="collection-title">Meet the Isekai Brokers</h2></div>
          <p className={styles.utilityIntro}>Distinct characters. One shared role: powering the people who host real-world advertising space on Stickxit.</p>
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

          <aside className={styles.detail} aria-label="Broker artwork preview and NFT utility">
            <div className={styles.detailImage}><Image src={selected.image} alt={`${selected.character} artwork preview`} width={1000} height={1000} /></div>
            <div className={styles.detailTitle}><h3>{brokerLabel(selected)}</h3><p>{selected.character}</p></div>
            <dl className={styles.traits}>
              <div><dt>Clothing</dt><dd>{selected.clothing}</dd></div>
              <div><dt>Gender</dt><dd>{selected.gender}</dd></div>
              <div><dt>Background</dt><dd>{selected.background}</dd></div>
            </dl>

            <div className={styles.utilityLicense}>
              <p className={styles.kicker}><ShieldCheck size={14} /> Broker utility</p>
              <h4>A marketplace license in your wallet</h4>
              <ul>
                <li><Check size={14} /> Unlock Broker HQ after ownership verification</li>
                <li><Check size={14} /> Operate within the Broker’s item and spot allowance</li>
                <li><Check size={14} /> Pay 0% platform fees on eligible Broker listings</li>
                <li><Check size={14} /> Qualify for the holder allocation when eligibility rules are met</li>
              </ul>
              <Link className={styles.stakeButton} href="/launchpad">Become a Broker <ArrowRight size={17} /></Link>
              <a className={styles.termsLink} href="#holder-allocation">Review holder allocation details</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
