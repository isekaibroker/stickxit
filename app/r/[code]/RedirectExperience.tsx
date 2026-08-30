import Link from "@/components/AppLink";
import { ArrowRight, QrCode } from "lucide-react";
import styles from "./redirect.module.css";

export function RedirectExperience({ code }: { code: string }) {
  return (
    <main className={styles.main}>
      <Link className={styles.brand} href="/"><span><i /></span>STICKXIT</Link>
      <section className={styles.card}>
        <QrCode size={42} />
        <span className={styles.eyebrow}>Dynamic QR</span>
        <h1>QR routing is not live yet.</h1>
        <p>Shared destination routing for <b>/r/{code}</b> will activate with the production campaign service.</p>
        <Link className={styles.button} href="/marketplace">Open Marketplace <ArrowRight size={17} /></Link>
      </section>
      <p className={styles.note}>No redirect or scan event is recorded before the production service is available.</p>
    </main>
  );
}
