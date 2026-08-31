import type { MetadataRoute } from "next";
import { listings } from "@/lib/mock-data";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://stickxit.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/marketplace", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/isekai-brokers", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/launchpad", changeFrequency: "daily" as const, priority: 0.8 },
  ];

  return [
    ...publicRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...listings.map((listing) => ({
      url: `${siteUrl}/item/${listing.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
