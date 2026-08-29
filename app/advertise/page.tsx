import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ surface?: string; item?: string; spot?: string }> };

export default async function AdvertisePage({ searchParams }: Props) {
  const { surface, item, spot } = await searchParams;
  const query = new URLSearchParams();
  if (item) query.set("item", item);
  if (spot) query.set("spot", spot);
  if (surface) query.set("surface", surface === "pc" ? "gaming-pc" : surface);
  redirect(`/marketplace${query.size ? `?${query.toString()}` : ""}`);
}
