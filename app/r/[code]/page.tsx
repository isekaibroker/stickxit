import type { Metadata } from "next";
import { RedirectExperience } from "./RedirectExperience";

export const metadata: Metadata = {
  title: "Dynamic campaign link",
  description: "Stickxit dynamic campaign link launch status.",
  robots: { index: false, follow: false },
};

export default async function RedirectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <RedirectExperience code={code} />;
}
