import Link from "@/components/AppLink";
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
        <Link href="/launchpad">Mint on Robinhood Chain</Link>
        <a href="https://x.com/isekaibrokers" target="_blank" rel="noopener noreferrer">Follow on X</a>
      </nav>
      <small>© 2026 Stickxit. Pre-launch experience; examples are clearly labeled. Isekai Brokers is independent and is not affiliated with, endorsed by, or sponsored by Robinhood.</small>
    </footer>
  );
}
