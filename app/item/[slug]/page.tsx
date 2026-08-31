import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { listings } from "@/lib/mock-data";
import { ItemDetail } from "./ItemDetail";
import styles from "./item.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ spot?: string }>;
};

export function generateStaticParams() {
  return listings.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = listings.find((item) => item.slug === slug);
  if (!listing) notFound();

  const title = `${listing.title} placement example`;
  const description = `Choose an advertising region on a ${listing.title} and build the campaign directly from the Stickxit Marketplace.`;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");
  const image = new URL(listing.image, `${protocol}://${host}`).toString();

  return {
    title,
    description,
    alternates: { canonical: `/item/${listing.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: image, alt: `${listing.title} advertising placement example` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ItemPage({ params, searchParams }: Props) {
  const [{ slug }, { spot }] = await Promise.all([params, searchParams]);
  const listing = listings.find((item) => item.slug === slug);
  if (!listing) notFound();

  return (
    <div className={`site-shell ${styles.shell}`}>
      <SiteHeader />
      <main className={styles.main}>
        <ItemDetail listing={listing} initialSpotId={spot} />
      </main>
      <SiteFooter />
    </div>
  );
}
