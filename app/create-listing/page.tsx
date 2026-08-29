import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ListingWizard } from "./ListingWizard";

export const metadata: Metadata = { title: "Create a Listing", description: "Build and preview a Stickxit advertising-space listing." };
export default function CreateListingPage() { return <div className="site-shell"><SiteHeader /><ListingWizard /><SiteFooter /></div>; }
