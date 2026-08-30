"use client";

import Link from "@/components/AppLink";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, LoaderCircle, ShieldCheck, Upload, Wallet } from "lucide-react";
import { useWallet } from "@/components/wallet/WalletProvider";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { createRecordId, createShortCode, saveCampaign, type SavedCampaign, type StickerTransform } from "@/lib/app-storage";
import { listings } from "@/lib/mock-data";
import { saveLocalMedia } from "@/lib/media-storage";
import { InteractivePlacementMockup, initialStickerTransform } from "@/app/advertise/InteractivePlacementMockup";
import styles from "../campaigns.module.css";

const modes = ["Art only", "Art + QR", "QR only"] as const;
const corners = ["Top left", "Top right", "Bottom left", "Bottom right"] as const;

const templateNames: Record<string, string> = {
  "brand-launch": "Brand launch",
  "local-offer": "Local offer",
  event: "Event notice",
  upload: "Custom artwork",
};

export function NewCampaignFlow({ initialListingSlug, initialSpotId, initialTemplate }: { initialListingSlug?: string; initialSpotId?: string; initialTemplate?: string }) {
  const { address, connected, correctChain, switchNetwork, signMessage } = useWallet();
  const firstListing = listings.find((item) => item.slug === initialListingSlug) ?? listings[0];
  const firstSpot = firstListing.spots.find((spot) => spot.id === initialSpotId) ?? firstListing.spots[0];
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [listingSlug, setListingSlug] = useState(initialListingSlug ?? firstListing.slug);
  const [spotId, setSpotId] = useState(initialSpotId ?? firstSpot.id);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<(typeof modes)[number]>("Art + QR");
  const [corner, setCorner] = useState<(typeof corners)[number]>("Bottom right");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState("");
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkMediaId, setArtworkMediaId] = useState("");
  const [campaignName, setCampaignName] = useState(initialTemplate ? templateNames[initialTemplate] ?? "" : "");
  const [stickerTransform, setStickerTransform] = useState<StickerTransform>(initialStickerTransform);
  const [complete, setComplete] = useState<SavedCampaign | null>(null);
  const [authorizing, setAuthorizing] = useState(false);
  const [actionError, setActionError] = useState("");
  const labels = ["Placement", "Creative", "Preview", "Authorize"];
  const campaignListings = listings;
  const listing = campaignListings.find((item) => item.slug === listingSlug) ?? campaignListings[0];
  const availableSpots = useMemo(() => listing.spots, [listing]);
  const spot = availableSpots.find((item) => item.id === spotId) ?? availableSpots[0];
  const validDestination = mode === "Art only" || (() => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  })();
  const validArtwork = mode === "QR only" || Boolean(file || artworkMediaId || (initialTemplate && initialTemplate !== "upload"));
  const creativeReady = Boolean(campaignName.trim()) && validDestination && validArtwork;

  async function chooseArtwork(selectedFile: File | null) {
    setArtworkFile(selectedFile);
    setArtworkMediaId("");
    setFile(selectedFile?.name ?? "");
    if (!selectedFile) return;
    try {
      setArtworkMediaId(await saveLocalMedia(selectedFile));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Artwork could not be saved for draft preview.");
    }
  }

  async function authorizeCampaign() {
    if (!address || !spot) return;
    if (!creativeReady) {
      setActionError("Add a campaign name, required artwork, and a valid http(s) QR destination before saving.");
      return;
    }
    setAuthorizing(true);
    setActionError("");
    try {
      const createdAt = new Date().toISOString();
      const shortCode = createShortCode();
      const message = [
        "Stickxit campaign authorization",
        `Wallet: ${address}`,
        `Campaign: ${campaignName}`,
        `Placement: ${listing.title} / Spot ${spot.id} (${spot.name})`,
        `Creative: ${mode}`,
        `Created: ${createdAt}`,
        "This signature authorizes a campaign draft and does not transfer funds.",
      ].join("\n");
      const signature = await signMessage(message);
      const storedArtworkMediaId = artworkMediaId || (artworkFile ? await saveLocalMedia(artworkFile) : undefined);
      const record: SavedCampaign = {
        id: createRecordId("campaign"), owner: address, name: campaignName, listingSlug: listing.slug,
        listingTitle: listing.title, spotId: spot.id, spotName: spot.name, mode, artworkName: file, artworkMediaId: storedArtworkMediaId,
        stickerTransform,
        destination: mode === "Art only" ? "" : url, shortCode, signature, createdAt, status: "Ready",
      };
      saveCampaign(record);
      setComplete(record);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The wallet signature was not completed.");
    } finally {
      setAuthorizing(false);
    }
  }

  if (!connected) return <main className={styles.flowMain}><section className={styles.accessCard}><Wallet size={34} /><span className={styles.eyebrow}>Campaign workspace</span><h1>Connect your wallet</h1><p>A connected wallet is required to authorize a campaign draft. Connecting does not create a payment or transaction.</p><button className="button" onClick={() => setWalletModalOpen(true)}>Connect wallet</button><Link href="/marketplace">Return to marketplace</Link></section><WalletConnectModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} /></main>;
  if (!correctChain) return <main className={styles.flowMain}><section className={styles.accessCard}><ShieldCheck size={34} /><span className={styles.eyebrow}>Network check</span><h1>Switch to the Stickxit network</h1><p>Your wallet is connected, but the selected network does not match this deployment.</p><button className="button" onClick={() => void switchNetwork()}>Switch network</button></section></main>;

  if (complete) return <main className={styles.flowMain}><section className={styles.success}><CheckCircle2 size={52} /><span className={styles.eyebrow}>Wallet authorization saved</span><h1>Campaign ready for review</h1><p>Campaign <b>{complete.id}</b> is linked to {complete.owner.slice(0, 6)}...{complete.owner.slice(-4)}. Its dynamic link is <Link href={`/r/${complete.shortCode}`}><b>/r/{complete.shortCode}</b></Link>. No funds were transferred.</p><div className={styles.successActions}><Link href="/campaigns" className="button">Open campaign workspace</Link><Link href="/marketplace" className={styles.secondary}>Book another spot</Link></div></section></main>;

  return <main className={styles.flowMain}>
    <Link href={`/item/${encodeURIComponent(listing.slug)}?spot=${encodeURIComponent(spot?.id ?? "")}`} className={styles.back}><ArrowLeft size={16} /> Back to marketplace placement</Link>
    <div className={styles.flowHead}><div><span className={styles.eyebrow}>Wallet-linked campaign</span><h1>Create a campaign</h1><p>Choose a placement, build the creative, and authorize the draft with your connected wallet.</p></div><ol className={styles.steps}>{labels.map((label, i) => <li key={label} className={step >= i + 1 ? styles.stepActive : ""}><span>{i + 1}</span>{label}</li>)}</ol></div>
    <div className={styles.builder}>
      <section className={styles.panel}>
        {step === 1 && <><h2>Choose placement</h2><p className={styles.lead}>Choose an example surface and its host-approved sticker area.</p><div className={styles.formPair}><label>Item<select value={listingSlug} onChange={(event) => { const nextListing = campaignListings.find((item) => item.slug === event.target.value) ?? campaignListings[0]; setListingSlug(nextListing.slug); setSpotId(nextListing.spots[0]?.id ?? ""); setStickerTransform(initialStickerTransform); }}>{campaignListings.map((item) => <option key={item.slug} value={item.slug}>{item.title} / {item.city}</option>)}</select></label><label>Spot<select value={spot?.id ?? ""} onChange={(event) => { setSpotId(event.target.value); setStickerTransform(initialStickerTransform); }}>{availableSpots.map((item) => <option key={item.id} value={item.id}>Spot {item.id} / {item.name} / {item.physicalSize}</option>)}</select></label></div><div className={styles.placementChoice}><div><span className={styles.status} data-status="active">Example</span><h3>{listing.title}</h3><p>{listing.city}, {listing.country}</p><b>Spot {spot?.id} / {spot?.name}</b><span>{spot?.physicalSize} host-approved print area</span></div></div></>}
        {step === 2 && <><h2>Build the creative</h2><label>Campaign name<input value={campaignName} maxLength={64} onChange={(event) => setCampaignName(event.target.value)} /></label><fieldset><legend>Creative mode</legend><div className={styles.choiceGrid}>{modes.map(value => <label key={value} className={mode === value ? styles.choiceActive : styles.choice}><input type="radio" name="mode" checked={mode === value} onChange={() => setMode(value)} />{value}</label>)}</div></fieldset>
          {mode !== "QR only" && <label className={styles.upload}><Upload /><span><b>{file || "Choose artwork"}</b><small>PNG or JPG / kept for draft preview</small></span><input type="file" accept="image/png,image/jpeg" onChange={event => void chooseArtwork(event.target.files?.[0] ?? null)} /></label>}
          {mode !== "Art only" && <><label>Destination URL<input type="url" required value={url} onChange={event => setUrl(event.target.value)} placeholder="https://example.com" /></label><fieldset><legend>QR corner</legend><div className={styles.choiceGrid}>{corners.map(value => <label key={value} className={corner === value ? styles.choiceActive : styles.choice}><input type="radio" name="corner" checked={corner === value} onChange={() => setCorner(value)} />{value}</label>)}</div></fieldset><p className={styles.shortNote}>The short link is created after wallet authorization.</p></>}
          {!creativeReady && <p className={styles.actionError} role="status">{!campaignName.trim() ? "Add a campaign name." : !validArtwork ? "Upload PNG or JPG artwork, or start from a creative template." : "Enter a valid http(s) destination URL."}</p>}
        </>}
        {step === 3 && <><h2>Review the placement</h2><dl className={styles.review}><div><dt>Campaign</dt><dd>{campaignName}</dd></div><div><dt>Placement</dt><dd>{listing.title} · Spot {spot?.id}</dd></div><div><dt>Creative</dt><dd>{mode}</dd></div><div><dt>Artwork</dt><dd>{file || "Template placeholder"}</dd></div><div><dt>Sticker fit</dt><dd>{Math.round(stickerTransform.scale * 100)}% size · {Math.round(stickerTransform.rotation)}°</dd></div><div><dt>QR destination</dt><dd>{mode === "Art only" ? "Not included" : url || "Not added"}</dd></div><div><dt>Inventory</dt><dd>Example only · not booked</dd></div></dl></>}
        {step === 4 && <><h2>Authorize with your wallet</h2><p className={styles.lead}>Your signature links this campaign draft to {address?.slice(0, 6)}...{address?.slice(-4)}. It is not a blockchain transaction and cannot move funds.</p><dl className={styles.review}><div><dt>Placement</dt><dd>{spot?.name}</dd></div><div><dt>Inventory</dt><dd>Pre-launch example</dd></div><div><dt>Payment</dt><dd>Unavailable until the marketplace launches</dd></div></dl><button className="button" disabled={authorizing || !campaignName.trim()} onClick={() => void authorizeCampaign()}>{authorizing ? <><LoaderCircle className={styles.spin} size={17} /> Waiting for wallet</> : "Sign campaign draft"}</button>{actionError && <p className={styles.actionError} role="alert">{actionError}</p>}</>}
        <div className={styles.actions}>{step > 1 && <button className={styles.secondary} onClick={() => setStep(step - 1)}>Back</button>}{step < 4 && <button className="button" disabled={(step === 1 && !spot) || (step === 2 && !creativeReady)} onClick={() => setStep(step + 1)}>Continue</button>}</div>
      </section>
      <aside className={styles.previewWrap}><span className={styles.eyebrow}>Interactive 3D mockup</span>{spot && <InteractivePlacementMockup listing={listing} spot={spot} transform={stickerTransform} onTransformChange={setStickerTransform} artworkMediaId={mode !== "QR only" ? artworkMediaId : undefined} fallback={mode !== "QR only" ? <span>{file ? file.slice(0, 12) : campaignName || "YOUR ART"}</span> : null} showQr={mode !== "Art only"} qrCorner={corner} compact />}<p>{mode} · Spot {spot?.id} · {listing.city}</p></aside>
    </div>
  </main>;
}
