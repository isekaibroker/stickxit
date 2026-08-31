import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { collectionDetails } from "@/lib/collection-details";
import { LaunchpadExperience } from "./LaunchpadExperience";
import styles from "./launchpad.module.css";

export const metadata: Metadata = {
  title: "Mint on Robinhood Chain | Isekai Brokers",
  description:
    `The ${collectionDetails.supplyLabel} Isekai Brokers Genesis collection is planned to mint on Robinhood Chain. The mint is not open, and the date, price, contract address, and allowlist details remain TBA.`,
  alternates: { canonical: "/launchpad" },
};

export default function LaunchpadPage() {
  return (
    <div className={`site-shell ${styles.shell}`}>
      <SiteHeader />
      <main className={styles.main}>
        <LaunchpadExperience />
      </main>
      <SiteFooter />
    </div>
  );
}
