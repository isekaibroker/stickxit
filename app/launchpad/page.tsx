import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LaunchpadExperience } from "./LaunchpadExperience";
import styles from "./launchpad.module.css";

export const metadata: Metadata = {
  title: "Launch Mint — TBA | Isekai Brokers",
  description:
    "The Isekai Brokers Genesis mint is not open. Date, price, network, contract, and allowlist details are TBA.",
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
