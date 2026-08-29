import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { listings } from "@/lib/mock-data";
import { ItemDetail, LocalItemDetail } from "./ItemDetail";
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
  if (!listing && !slug.startsWith("local-")) notFound();
  if (!listing) return {
    title: "Item not found",
    openGraph: { images: [] },
    twitter: { images: [] },
  };

  const title = `${listing.title} placement example`;
  const description = `Choose an advertising region on a ${listing.title} and build the campaign directly from the Stickxit Marketplace.`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [],
    },
  };
}

export default async function ItemPage({ params, searchParams }: Props) {
  const [{ slug }, { spot }] = await Promise.all([params, searchParams]);
  const listing = listings.find((item) => item.slug === slug);

  return (
    <div className={`site-shell ${styles.shell}`}>
      <SiteHeader />
      <main className={styles.main}>
        {listing ? <ItemDetail listing={listing} initialSpotId={spot} /> : <LocalItemDetail slug={slug} initialSpotId={spot} />}
      </main>
      <SiteFooter />
    </div>
  );
}
