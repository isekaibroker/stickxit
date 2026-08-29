import Link from "next/link";
import { Brand } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Brand />
        <p>People who own attention, connected with people who want attention.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/isekai-brokers">Isekai Brokers</Link>
        <Link href="/broker">Broker HQ</Link>
        <Link href="/launchpad">Mint launchpad</Link>
      </nav>
      <small>© 2026 Stickxit. Pre-launch experience; examples are clearly labeled.</small>
    </footer>
  );
}
