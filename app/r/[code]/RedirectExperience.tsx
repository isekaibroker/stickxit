"use client";

import Link from "next/link";
import { ArrowRight, CircleAlert, LoaderCircle, QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { findSavedCampaignByShortCode, recordCampaignScan, type SavedCampaign } from "@/lib/app-storage";
import styles from "./redirect.module.css";

function validDestination(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function RedirectExperience({ code }: { code: string }) {
  const [campaign, setCampaign] = useState<SavedCampaign | null>(null);
  const [resolved, setResolved] = useState(false);
  const recorded = useRef(false);

  useEffect(() => {
    const resolveTimer = window.setTimeout(() => {
      const record = findSavedCampaignByShortCode(code);
      setCampaign(record);
      setResolved(true);
      if (record?.destination && validDestination(record.destination)) {
        if (!recorded.current) {
          recordCampaignScan(code);
          recorded.current = true;
        }
        window.setTimeout(() => window.location.replace(record.destination), 900);
      }
    }, 0);
    return () => window.clearTimeout(resolveTimer);
  }, [code]);

  const destinationReady = Boolean(campaign?.destination && validDestination(campaign.destination));

  return (
    <main className={styles.main}>
      <Link className={styles.brand} href="/"><span><i /></span>STICKXIT</Link>
      <section className={styles.card} aria-live="polite">
        {!resolved ? <><LoaderCircle className={styles.spin} size={38} /><span className={styles.eyebrow}>Dynamic QR</span><h1>Resolving campaign…</h1><p>Looking up <b>/r/{code}</b> in this browser.</p></> : destinationReady && campaign ? <><QrCode size={42} /><span className={styles.eyebrow}>Destination found</span><h1>{campaign.name}</h1><p>Opening the saved destination for <b>/r/{campaign.shortCode}</b>.</p><a className={styles.button} href={campaign.destination} rel="noreferrer">Continue now <ArrowRight size={17} /></a><small>{campaign.destination}</small></> : <><CircleAlert size={42} /><span className={styles.eyebrow}>Link unavailable</span><h1>This local QR link cannot be resolved.</h1><p>The campaign may belong to another browser, or its destination is empty or invalid.</p><Link className={styles.button} href="/marketplace">Open Marketplace <ArrowRight size={17} /></Link></>}
      </section>
      <p className={styles.note}>Local campaign links resolve only on the browser where they were created. A shared deployment will replace this local lookup with the production redirect service.</p>
    </main>
  );
}
