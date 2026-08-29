import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BrokerDashboard } from "./BrokerDashboard";
import styles from "./broker.module.css";

export const metadata: Metadata = {
  title: "Broker HQ",
  description: "The wallet-gated Stickxit Broker workspace with clear contract verification and local preview modes.",
};

export default function BrokerPage() {
  return <div className={`site-shell ${styles.shell}`}><SiteHeader /><main className={styles.main}><BrokerDashboard /></main><SiteFooter /></div>;
}
