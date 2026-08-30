import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LaunchpadExperience } from "./LaunchpadExperience";
import styles from "./launchpad.module.css";

export const metadata: Metadata = {
  title: "Mint on Robinhood Chain | Isekai Brokers",
  description:
    "The original 6,666 Isekai Brokers Genesis collection is planned to mint on Robinhood Chain. The mint is not open, and the date, price, contract address, and allowlist details remain TBA.",
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
