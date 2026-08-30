import type { Metadata } from "next";
import Link from "@/components/AppLink";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  ChartNoAxesCombined,
  Check,
  MousePointer2,
  PanelsTopLeft,
  QrCode,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { brokers, listings } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: { absolute: "Stickxit | Turn what you own into ad space" },
  description: "A marketplace for real-world sticker placements, powered by the 4,444 Isekai Brokers collection planned to mint on Robinhood Chain.",
};

const heroSpots = [
  { id: "A", className: "spot-a", name: "Top left", size: '3 × 3"', price: "Host sets rate" },
  { id: "B", className: "spot-b", name: "Top right", size: '4 × 3"', price: "Host sets rate" },
  { id: "C", className: "spot-c", name: "Center strip", size: '6 × 2"', price: "Host sets rate" },
];

const steps = [
  { no: "01", title: "Verify your Broker", copy: "Connect the holding wallet and verify an eligible Isekai Broker to unlock host tools.", icon: BadgeCheck },
  { no: "02", title: "List your item", copy: "Upload an everyday item and draw the areas available for stickers.", icon: Upload },
  { no: "03", title: "Advertiser books", copy: "A brand chooses a spot, previews its creative, and starts a campaign.", icon: MousePointer2 },
  { no: "04", title: "Place and earn", copy: "Install the sticker, upload proof, and track verified QR activity.", icon: Banknote },
];

function LaptopPreview() {
  return (
    <div className="hero-visual" aria-label="Interactive laptop advertising preview">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="laptop-wrap">
        <div className="laptop-lid">
          <div className="lid-glare" /><div className="laptop-camera" />
          <div className="isekai-sticker sticker-frog"><Image src="/isekai/0002.png" alt="Isekai Broker frog portrait sticker" width={180} height={180} priority /></div>
          <div className="isekai-sticker sticker-broker"><Image src="/isekai/0001.png" alt="Isekai Broker portrait sticker" width={180} height={180} priority /></div>
          <div className="qr-sticker" aria-hidden="true"><span className="qr-grid" /><b>SCAN<br />THIS SPOT</b></div>
          <div className="stickxit-sticker"><span className="mini-mark">:)</span> STICKXIT</div>
          {heroSpots.map((spot) => (
            <Link
              key={spot.id}
              className={`ad-spot ${spot.className}`}
              href={`/item/macbook-pro-m2-montreal?spot=${spot.id}`}
              aria-label={`Open sample ${spot.name} placement, ${spot.size}, ${spot.price}`}
            >
              <span className="spot-label">{spot.id}</span>
              <span className="spot-tooltip" role="tooltip"><small>Sample spot {spot.id}</small><strong>{spot.name}</strong><span>{spot.size} · {spot.price}</span><b>View spot →</b></span>
            </Link>
          ))}
        </div>
        <div className="laptop-base"><span /></div>
      </div>
      <div className="availability-card"><span className="pulse" /><div><small>Sample inventory</small><strong>3 spots available</strong></div></div>
    </div>
  );
}

export default function Home() {
  return (
    <div id="top" className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span /> Physical media, reimagined</div>
            <h1 id="hero-title">Turn anything<br />you own into<br /><em>ad space.</em></h1>
            <p className="hero-lede">Activate Isekai Broker access, list your everyday item, and let brands request sticker placements that people can actually see. All 4,444 Brokers are planned to mint on Robinhood Chain.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/marketplace">Explore marketplace <span>↗</span></Link>
              <Link className="button button-secondary" href="/launchpad">Robinhood Chain Mint</Link>
            </div>
            <p className="sample-note"><span /> Interactive sample: hover or focus a spot</p>
          </div>
          <LaptopPreview />
        </section>

        <section className="metric-strip" aria-label="Stickxit launch facts">
          <div><span>01</span><strong>4,444</strong><small>Isekai Brokers</small></div>
          <div><span>02</span><strong>0%</strong><small>Broker platform fee</small></div>
          <div><span>03</span><strong>6</strong><small>Example surfaces</small></div>
          <div><span>04</span><strong>20%</strong><small>Holder fee allocation</small></div>
        </section>

        <section id="how-it-works" className="content-section how-section">
          <SectionHeading eyebrow="The loop" title={<>Activate. List. Stick. <em>Track.</em></>} copy="A focused marketplace flow that makes physical micro-advertising easy to understand and manage." />
          <div className="step-grid">
            {steps.map(({ no, title, copy, icon: Icon }) => (
              <article className="step-card" key={no}><div className="step-top"><span>{no}</span><Icon size={20} /></div><h3>{title}</h3><p>{copy}</p><span className="step-line" /></article>
            ))}
          </div>
        </section>

        <section className="content-section marketplace-preview">
          <SectionHeading eyebrow="Placement marketplace" title={<>Find your next <em>placement.</em></>} copy="Explore six surface templates now. Verified Broker hosts can publish approved items and mapped sticker spots for advertisers." action={<Link className="text-link" href="/marketplace">Open marketplace <ArrowRight size={16} /></Link>} />
          <div className="listing-grid">{listings.map((listing) => <ListingCard listing={listing} key={listing.slug} />)}</div>
        </section>

        <section className="content-section broker-story">
          <div className="broker-story-copy">
            <span className="section-kicker purple">Genesis membership</span>
            <h2>Your Broker is<br />your <em>license.</em></h2>
            <p>The original 4,444 Isekai Brokers Genesis collection provides the utility access licenses of Stickxit. Ownership unlocks host tools, listing capacity, zero-fee eligible Broker listings, and participation in the allocation of 20% of platform fees to eligible holders.</p>
            <ul>
              <li><Check size={15} /> Activate Broker access</li>
              <li><Check size={15} /> Map 3 to 10 spots per item</li>
              <li><Check size={15} /> List with no platform fee</li>
              <li><Check size={15} /> Qualify for the 20% holder allocation</li>
            </ul>
            <Link className="button button-purple" href="/isekai-brokers">Explore Isekai Brokers <ArrowRight size={17} /></Link>
          </div>
          <div className="broker-mosaic" aria-label="Isekai Brokers collection preview">
            {brokers.slice(0, 6).map((broker, index) => (
              <article className={`mini-broker mini-broker-${index + 1}`} key={broker.token}><Image src={broker.image} alt={broker.character} width={1000} height={1000} /><div><span>{broker.name}</span><small>{broker.rarity}</small></div></article>
            ))}
            <div className="license-float"><span><BadgeCheck size={18} /></span><div><small>Broker utility preview</small><strong>Wallet activated</strong></div></div>
          </div>
        </section>

        <section className="content-section advertiser-section">
          <div className="analytics-panel launch-panel">
            <div className="panel-header"><div><small>Campaign preparation</small><strong>Build your first campaign</strong></div><span className="status-live status-building"><i /> Campaign builder</span></div>
            <div className="analytics-metrics launch-steps"><div><span>01</span><strong>Choose</strong><small>Start with a surface template.</small></div><div><span>02</span><strong>Upload</strong><small>Add your campaign artwork.</small></div><div><span>03</span><strong>Prepare</strong><small>Review the campaign before wallet authorization.</small></div></div>
            <div className="empty-analytics"><QrCode size={30} /><div><strong>No invented campaign results</strong><p>Scan activity will appear only after real QR events are recorded.</p></div></div>
          </div>
          <div className="advertiser-copy">
            <span className="section-kicker">Built for advertisers</span>
            <h2>Real placement.<br />Real <em>signals.</em></h2>
            <p>Preview artwork on the selected item before campaign authorization, keep one dynamic QR code, and review scan activity without inventing impressions.</p>
            <div className="feature-list">
              <div><PanelsTopLeft size={20} /><span><strong>Live mockup</strong><small>See the creative inside the real spot.</small></span></div>
              <div><QrCode size={20} /><span><strong>Dynamic QR</strong><small>Change destinations without reprinting.</small></span></div>
              <div><ChartNoAxesCombined size={20} /><span><strong>Scan analytics</strong><small>Track activity by campaign and placement.</small></span></div>
              <div><ShieldCheck size={20} /><span><strong>Protected workflow</strong><small>Proof is required before a campaign goes live.</small></span></div>
            </div>
            <Link className="text-link" href="/marketplace">Choose a marketplace spot <ArrowRight size={16} /></Link>
          </div>
        </section>

        <section className="content-section final-cta">
          <div className="cta-orb"><Sparkles size={30} /></div>
          <span className="section-kicker">The founding network</span>
          <h2>Own it. Stick it. <em>Earn it.</em></h2>
          <p>Turn the objects you already use into a new kind of physical media inventory.</p>
          <div><Link className="button button-primary" href="/launchpad">View mint status <ArrowRight size={17} /></Link><Link className="button button-secondary" href="/marketplace">Explore marketplace</Link></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
