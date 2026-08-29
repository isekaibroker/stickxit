import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LaunchpadExperience } from "./LaunchpadExperience";
import styles from "./launchpad.module.css";

export const metadata: Metadata = {
  title: "Isekai Brokers Mint Launchpad",
  description:
    "Follow the Isekai Brokers Genesis mint and review its published Stickxit utility. Minting is not open yet.",
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
