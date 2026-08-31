import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { NewCampaignFlow } from "./NewCampaignFlow";

export const metadata: Metadata = {
  title: "Create a Campaign",
  description: "Choose a Stickxit placement, preview the creative, and authorize a wallet-linked campaign.",
  alternates: { canonical: "/campaigns/new" },
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ item?: string; spot?: string; template?: string }> };

export default async function NewCampaignPage({ searchParams }: Props) {
  const { item, spot, template } = await searchParams;
  return <div className="site-shell"><SiteHeader /><NewCampaignFlow initialListingSlug={item} initialSpotId={spot} initialTemplate={template} /><SiteFooter /></div>;
}
