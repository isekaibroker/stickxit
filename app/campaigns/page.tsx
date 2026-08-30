import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CampaignDashboard } from "./CampaignDashboard";

export const metadata: Metadata = {
  title: "Campaigns",
  description: "Manage wallet-linked Stickxit campaign drafts and dynamic QR destinations.",
};

export default function CampaignsPage() {
  return <div className="site-shell"><SiteHeader /><CampaignDashboard /><SiteFooter /></div>;
}
