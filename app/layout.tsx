import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title: { default: "Stickxit", template: "%s | Stickxit" },
    description: "Turn what you own into ad space with Stickxit. The Isekai Brokers Genesis collection is planned to mint on Robinhood Chain.",
    applicationName: "Stickxit",
    keywords: ["Stickxit", "Isekai Brokers", "Robinhood Chain", "physical advertising", "advertising marketplace"],
    openGraph: {
      type: "website",
      siteName: "Stickxit",
      title: "Stickxit | Turn What You Own Into Ad Space",
      description: "Explore Stickxit utility and the Isekai Brokers Genesis collection planned to mint on Robinhood Chain.",
      url: origin,
      images: [{ url: socialImage, width: 1200, height: 630, alt: "Stickxit physical advertising marketplace powered by Isekai Brokers" }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@isekaibrokers",
      creator: "@isekaibrokers",
      title: "Stickxit | Turn What You Own Into Ad Space",
      description: "A distributed physical advertising marketplace powered by Isekai Brokers. The Genesis collection is planned to mint on Robinhood Chain.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
