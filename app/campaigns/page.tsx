import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CampaignDashboard } from "./CampaignDashboard";

export const metadata: Metadata = {
  title: "Campaigns",
  description: "Manage wallet-linked Stickxit campaign records and dynamic QR destinations saved on this device.",
};

export default function CampaignsPage() {
  return <div className="site-shell"><SiteHeader /><CampaignDashboard /><SiteFooter /></div>;
}
