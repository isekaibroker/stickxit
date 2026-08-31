import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MarketplaceBrowser } from "./MarketplaceBrowser";
import styles from "./marketplace.module.css";

export const metadata: Metadata = {
  title: "Advertising Marketplace",
  description: "Choose a real-world surface and exact sticker spot, then start a Stickxit campaign directly from the marketplace.",
  alternates: { canonical: "/marketplace" },
};

export default function MarketplacePage() {
  return (
    <div className={`site-shell ${styles.shell}`}>
      <SiteHeader />
      <main className={styles.main}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}><span /> Placement marketplace</p>
          <div className={styles.heroRow}>
            <div>
              <h1>Find your next<br /><em>real-world spot.</em></h1>
              <p>Choose a surface, select its exact sticker area, and build a wallet-linked campaign draft.</p>
            </div>
            <div className={styles.stat} aria-label="Marketplace summary">
              <strong>6</strong><span>example surfaces</span><small>Live host inventory opens after launch</small>
            </div>
          </div>
        </header>
        <MarketplaceBrowser />
      </main>
      <SiteFooter />
    </div>
  );
}
