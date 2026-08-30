import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CollectionExperience } from "./CollectionExperience";
import styles from "./isekai.module.css";

export const metadata: Metadata = {
  title: "Isekai Brokers",
  description: "Explore Isekai Brokers, the Stickxit utility NFT collection planned to mint on Robinhood Chain. Mint date, price, contract, and allowlist details remain TBA.",
};

export default function IsekaiBrokersPage() {
  return (
    <div className={`site-shell ${styles.shell}`}>
      <SiteHeader />
      <main className={styles.main}>
        <CollectionExperience />
      </main>
      <SiteFooter />
    </div>
  );
}
