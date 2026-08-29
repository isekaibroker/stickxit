"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, ImagePlus, LoaderCircle, Plus, ShieldCheck, Trash2, Wallet } from "lucide-react";
import { useWallet } from "@/components/wallet/WalletProvider";
import { createRecordId, getSavedListings, getSavedLocalBrokers, onRecordsChanged, saveListing, type SavedListing, type SavedLocalBroker } from "@/lib/app-storage";
import { brokerUtilityByTier, countListingsForBroker, formatItemAllowance, resolveBrokerUtilityTier } from "@/lib/broker-utility";
import { saveLocalMedia } from "@/lib/media-storage";
import styles from "./createListing.module.css";

type Spot = { id: number; name: string; x: number; y: number; width: number; height: number; price: number; duration: string };
const stepNames = ["Item", "Photos", "Spots", "Pricing", "Preview", "Publish"];
const initialSpot: Spot = { id: 1, name: "Primary display", x: .28, y: .3, width: .44, height: .28, price: 79, duration: "30 days" };
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export function ListingWizard() {
  const {
    address,
    connected,
    correctChain,
    chainConfigured,
    collectionAddress,
    ownership,
    licenseActive,
    isLocalSession,
    startLocalSession,
    switchNetwork,
    refreshOwnership,
    activateLicense,
    signMessage,
  } = useWallet();
  const [step, setStep] = useState(1);
  const [published, setPublished] = useState<SavedListing | null>(null);
  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoPreview = useMemo(() => photoFile ? URL.createObjectURL(photoFile) : "", [photoFile]);
  const [publishing, setPublishing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [localBrokers, setLocalBrokers] = useState<SavedLocalBroker[]>([]);
  const [existingListings, setExistingListings] = useState<SavedListing[]>([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState("");
  const [brokerRecordsLoaded, setBrokerRecordsLoaded] = useState(false);
  const [item, setItem] = useState({ title: "", category: "Electronics", description: "", city: "Toronto", country: "Canada", environment: "Indoor", visibility: "Public" });
  const [spots, setSpots] = useState<Spot[]>([initialSpot]);
  const [activeId, setActiveId] = useState(1);
  const active = spots.find(spot => spot.id === activeId) ?? spots[0];
  const selectedBroker = localBrokers.find((broker) => broker.id === selectedBrokerId) ?? null;
  const utilityTier = resolveBrokerUtilityTier(selectedBroker?.tier);
  const utilityPolicy = brokerUtilityByTier[utilityTier];
  const spotLimit = utilityPolicy.spotsPerItem;
  const assignedListingCount = selectedBroker ? countListingsForBroker(existingListings, selectedBroker.id, localBrokers[0]?.id) : 0;
  const brokerAtCapacity = utilityPolicy.maxItems !== null && assignedListingCount >= utilityPolicy.maxItems;
  const previewMode = isLocalSession || !chainConfigured || !collectionAddress;
  const ownershipReady = previewMode || ownership.status === "owned";
  const verifiedOnChainBalance = !previewMode && ownership.status === "owned" && (ownership.balance ?? 0n) > 0n;
  const brokerAccessReady = licenseActive && ownershipReady;
  const itemReady = Boolean(item.title.trim() && item.description.trim() && item.city.trim() && item.country.trim());
  const spotsReady = spots.length > 0 && spots.every((spot) => spot.name.trim());
  const pricingReady = spots.every((spot) => Number.isFinite(spot.price) && spot.price >= 0 && spot.duration);
  const currentStepReady = step === 1 ? Boolean(itemReady && selectedBroker && !brokerAtCapacity) : step === 2 ? Boolean(photoFile) : step === 3 ? spotsReady : step === 4 ? pricingReady : true;
  const updateItem = (key: keyof typeof item, value: string) => setItem({ ...item, [key]: value });
  const updateSpot = (patch: Partial<Spot>) => setSpots(all => all.map(spot => spot.id === activeId ? { ...spot, ...patch } : spot));

  useEffect(() => {
    if (!address) {
      const resetTimer = window.setTimeout(() => {
        setLocalBrokers([]);
        setExistingListings([]);
        setSelectedBrokerId("");
        setBrokerRecordsLoaded(true);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const loadBrokerRecords = () => {
      const brokers = getSavedLocalBrokers(address);
      setLocalBrokers(brokers);
      setExistingListings(getSavedListings(address));
      setSelectedBrokerId((current) => brokers.some((broker) => broker.id === current) ? current : brokers[0]?.id ?? "");
      setBrokerRecordsLoaded(true);
    };

    const loadTimer = window.setTimeout(loadBrokerRecords, 0);
    const unsubscribe = onRecordsChanged(loadBrokerRecords);
    return () => {
      window.clearTimeout(loadTimer);
      unsubscribe();
    };
  }, [address]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function selectBroker(brokerId: string) {
    const broker = localBrokers.find((candidate) => candidate.id === brokerId);
    if (!broker) return;
    const nextLimit = brokerUtilityByTier[resolveBrokerUtilityTier(broker.tier)].spotsPerItem;
    setSelectedBrokerId(broker.id);
    setSpots((all) => {
      const nextSpots = all.slice(0, nextLimit);
      setActiveId((current) => nextSpots.some((spot) => spot.id === current) ? current : nextSpots[0]?.id ?? 1);
      return nextSpots;
    });
  }

  function addSpot() {
    if (spots.length >= spotLimit) return;
    const id = Math.max(0, ...spots.map(spot => spot.id)) + 1;
    setSpots([...spots, { ...initialSpot, id, name: `Display spot ${id}`, x: .1 + ((id * .13) % .45), y: .12 + ((id * .09) % .35) }]);
    setActiveId(id);
  }
  function duplicate() {
    if (!active || spots.length >= spotLimit) return;
    const id = Math.max(...spots.map(spot => spot.id)) + 1;
    setSpots([...spots, { ...active, id, name: `${active.name} copy`, x: clamp(active.x + .04, 0, 1 - active.width), y: clamp(active.y + .04, 0, 1 - active.height) }]);
    setActiveId(id);
  }
  function remove() {
    if (spots.length === 1) return;
    const next = spots.filter(spot => spot.id !== activeId);
    setSpots(next);
    setActiveId(next[0].id);
  }
  function next() {
    if (!currentStepReady) return;
    setStep(Math.min(6, step + 1));
  }

  async function publishListing() {
    if (!address) return;
    setPublishing(true);
    setActionError("");
    try {
      if (!itemReady || !photoFile || !spotsReady || !pricingReady) {
        throw new Error("Complete the item, photo, spot names, and non-negative pricing before saving.");
      }
      const currentBrokers = getSavedLocalBrokers(address);
      const backingBroker = currentBrokers.find((broker) => broker.id === selectedBrokerId);
      if (!backingBroker) {
        throw new Error("Choose a Broker saved under this wallet before authorizing the listing.");
      }
      const backingTier = resolveBrokerUtilityTier(backingBroker.tier);
      const backingPolicy = brokerUtilityByTier[backingTier];
      const existingListings = getSavedListings(address);
      const assignedCount = countListingsForBroker(existingListings, backingBroker.id, currentBrokers[0]?.id);
      if (backingPolicy.maxItems !== null && assignedCount >= backingPolicy.maxItems) {
        throw new Error(`Broker #${String(backingBroker.tokenNumber).padStart(4, "0")} has reached its ${backingPolicy.maxItems}-item allowance.`);
      }
      if (spots.length > backingPolicy.spotsPerItem) {
        throw new Error(`${backingPolicy.label} supports no more than ${backingPolicy.spotsPerItem} spots on one item.`);
      }
      const createdAt = new Date().toISOString();
      const message = [
        "Stickxit listing authorization",
        `Wallet: ${address}`,
        `Broker: #${String(backingBroker.tokenNumber).padStart(4, "0")} (${backingBroker.id})`,
        `Broker tier: ${backingPolicy.label}`,
        `Item: ${item.title}`,
        `Location: ${item.city}, ${item.country}`,
        `Bookable spots: ${spots.length}`,
        `Created: ${createdAt}`,
        "This signature creates a local listing record and does not transfer funds.",
      ].join("\n");
      const signature = await signMessage(message);
      const photoMediaId = photoFile ? await saveLocalMedia(photoFile) : undefined;
      const record: SavedListing = {
        id: createRecordId("listing"), owner: address, brokerId: backingBroker.id, brokerTier: backingTier, title: item.title, category: item.category,
        description: item.description, city: item.city, country: item.country, environment: item.environment,
        photoName: photo, photoMediaId, spots, signature, createdAt, status: "Review",
      };
      saveListing(record);
      setExistingListings([record, ...existingListings]);
      setPublished(record);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The wallet signature was not completed.");
    } finally {
      setPublishing(false);
    }
  }

  if (!connected) return <main className={styles.main}><section className={styles.accessCard}><Wallet size={38} /><span className={styles.eyebrow}>Local Broker workspace</span><h1>Open the listing builder</h1><p>Enter the browser-only demo to map and save listings without a wallet extension, blockchain, or backend.</p><button type="button" className="button" onClick={() => void startLocalSession()}>Enter local demo</button><Link href="/isekai-brokers">How Broker Licenses work</Link></section></main>;
  if (!correctChain) return <main className={styles.main}><section className={styles.accessCard}><ShieldCheck size={38} /><span className={styles.eyebrow}>Network check</span><h1>Switch networks</h1><p>Your connected wallet must use the configured Stickxit network before Broker ownership can be checked.</p><button type="button" className="button" onClick={() => void switchNetwork()}>Switch network</button></section></main>;
  if (!ownershipReady) return <main className={styles.main}><section className={styles.accessCard}><BadgeCheck size={38} /><span className={styles.eyebrow}>Ownership required</span><h1>Verify an Isekai Broker</h1><p>The configured collection contract must show at least one Isekai Broker in this wallet before host tools unlock.</p><button type="button" className="button" disabled={ownership.status === "checking"} onClick={() => void refreshOwnership()}>{ownership.status === "checking" ? "Checking collection…" : "Check collection balance"}</button><Link href="/isekai-brokers">Open Broker collection</Link></section></main>;
  if (!brokerAccessReady) return <main className={styles.main}><section className={styles.accessCard}><BadgeCheck size={38} /><span className={styles.eyebrow}>{previewMode ? "Local preview" : "License inactive"}</span><h1>Activate your Broker access</h1><p>{previewMode ? "Contract details are not configured, so this signature unlocks device-only preview tools. It does not verify NFT ownership or create an on-chain license." : "Sign a gas-free wallet message after the collection balance check to unlock host tools on this device."}</p><button type="button" className="button" onClick={() => void activateLicense()}>{previewMode ? "Enable local preview" : "Sign license activation"}</button><Link href="/isekai-brokers">Review Broker access</Link></section></main>;
  if (!brokerRecordsLoaded) return <main className={styles.main}><section className={styles.accessCard}><LoaderCircle className={styles.spin} size={38} /><span className={styles.eyebrow}>Broker licenses</span><h1>Loading your Brokers</h1><p>Checking the Broker records saved under this wallet.</p></section></main>;
  if (!localBrokers.length) return <main className={styles.main}><section className={styles.accessCard}><BadgeCheck size={38} /><span className={styles.eyebrow}>{verifiedOnChainBalance ? "Balance verified" : "Broker required"}</span><h1>{verifiedOnChainBalance ? "Add identifiable Broker records" : "Create a local Broker first"}</h1><p>{verifiedOnChainBalance ? `This wallet has a verified collection balance of ${ownership.balance?.toString()}, but the current contract reader does not expose token IDs or metadata tiers. The local builder will not invent either value; create a browser-local Broker record to choose and enforce an exact allowance.` : "Every listing must name the Broker that supplies its item and spot allowance. Create one or more local Brokers, then choose between them here."}</p><Link className="button" href="/launchpad">{verifiedOnChainBalance ? "Create local Broker record" : "Open Broker launchpad"}</Link><Link href="/isekai-brokers">Review Broker utility</Link></section></main>;

  if (published) return <main className={styles.main}><section className={styles.success}><Check size={48} /><span>Local record authorized</span><h1>Your listing is ready for review.</h1><p><b>{published.id}</b> is saved on this device and assigned to <b>Broker #{String(localBrokers.find((broker) => broker.id === published.brokerId)?.tokenNumber ?? 0).padStart(4, "0")}</b> ({brokerUtilityByTier[resolveBrokerUtilityTier(published.brokerTier)].label}). Shared publishing, approval, and booking require the production data service.</p><div className={styles.successActions}><Link className="button" href="/broker">Open Broker HQ</Link><button type="button" className={styles.secondary} onClick={() => { setPublished(null); setStep(1); }}>Create another</button></div></section></main>;

  return <main className={styles.main}>
    <header className={styles.head}><div><span className={styles.eyebrow}>Host onboarding</span><h1>Create a listing</h1><p>Turn a real-world surface into a clear, bookable placement.</p></div><div className={styles.ownerBadge}><BadgeCheck size={15} /> Broker #{String(selectedBroker?.tokenNumber ?? 0).padStart(4, "0")}<span>{utilityPolicy.label} · {assignedListingCount}/{utilityPolicy.maxItems ?? "∞"} items · {spotLimit} spots/item</span></div><span className={styles.progress}>Step {step} of 6</span></header>
    <ol className={styles.steps} aria-label="Listing progress">{stepNames.map((name, index) => <li key={name} className={step >= index + 1 ? styles.active : ""} aria-current={step === index + 1 ? "step" : undefined}><span>{index + 1}</span><b>{name}</b></li>)}</ol>
    <div className={styles.layout}><section className={styles.panel} aria-live="polite">
      {step === 1 && <><h2>Tell us about the item</h2><p>Choose the exact Broker that will supply this listing&apos;s item and spot allowance.</p><div className={styles.brokerPicker} aria-label="Choose a Broker for this listing">{localBrokers.map((broker) => { const policy = brokerUtilityByTier[resolveBrokerUtilityTier(broker.tier)]; const used = countListingsForBroker(existingListings, broker.id, localBrokers[0]?.id); const full = policy.maxItems !== null && used >= policy.maxItems; return <button type="button" key={broker.id} className={styles.brokerOption} aria-pressed={broker.id === selectedBrokerId} onClick={() => selectBroker(broker.id)}><Image src={broker.artwork} alt="" width={58} height={58} /><span><strong>Broker #{String(broker.tokenNumber).padStart(4, "0")}</strong><small>{policy.label} · {policy.spotsPerItem} spots/item</small><small className={full ? styles.capacityFull : ""}>{used} used · {formatItemAllowance(policy.maxItems)}</small></span></button>; })}</div>{brokerAtCapacity && <p className={styles.capacityWarning} role="status">Broker #{String(selectedBroker?.tokenNumber ?? 0).padStart(4, "0")} has reached its listing allowance. Choose another Broker to continue.</p>}<div className={styles.formGrid}><label className={styles.full}>Item name *<input value={item.title} onChange={event => updateItem("title", event.target.value)} placeholder="e.g. Silver commuter laptop" required /></label><label>Category<select value={item.category} onChange={event => updateItem("category", event.target.value)}><option>Electronics</option><option>Vehicle</option><option>Fashion</option><option>Retail display</option><option>Other</option></select></label><label>Environment<select value={item.environment} onChange={event => updateItem("environment", event.target.value)}><option>Indoor</option><option>Outdoor</option><option>Mixed</option></select></label><label className={styles.full}>Description<textarea value={item.description} onChange={event => updateItem("description", event.target.value)} placeholder="Where the item appears and who sees it." /></label><label>City *<input required value={item.city} onChange={event => updateItem("city", event.target.value)} /></label><label>Country<input value={item.country} onChange={event => updateItem("country", event.target.value)} /></label></div><p className={styles.hint}>The selected Broker is saved with this listing. Its allowance is counted independently from every other Broker in this wallet. Older unassigned listings count against the newest saved Broker.</p>{!item.title.trim() && <p className={styles.hint}>Add an item name before continuing.</p>}</>}
      {step === 2 && <><h2>Add a reference photo</h2><p>The image is stored in this browser so it remains visible in your local marketplace and campaign previews.</p><label className={styles.drop}><ImagePlus size={34} /><b>{photo || "Choose a reference photo"}</b><span>PNG or JPG · up to 10 MB</span><input type="file" accept="image/png,image/jpeg" onChange={event => { const file = event.target.files?.[0] ?? null; setPhotoFile(file); setPhoto(file?.name ?? ""); }} /></label>{!photoFile && <p className={styles.hint}>Add a reference photo before continuing.</p>}</>}
      {step === 3 && active && <><div className={styles.rowHead}><div><h2>Map the ad spots</h2><p>{utilityPolicy.label} supports up to {spotLimit} bookable regions per item.</p></div><button className={styles.iconButton} disabled={spots.length >= spotLimit} onClick={addSpot}><Plus size={17} /> {spots.length >= spotLimit ? `${spotLimit}-spot limit` : "Add spot"}</button></div><div className={styles.spotTabs}>{spots.map(spot => <button key={spot.id} onClick={() => setActiveId(spot.id)} aria-pressed={activeId === spot.id}>{spot.name}</button>)}</div><div className={styles.spotTools}><label>Spot name<input value={active.name} onChange={event => updateSpot({ name: event.target.value })} /></label><div className={styles.toolButtons}><button onClick={duplicate} disabled={spots.length >= spotLimit}><Copy size={16} /> Duplicate</button><button onClick={remove} disabled={spots.length === 1}><Trash2 size={16} /> Delete</button></div>{(["x", "y", "width", "height"] as const).map(key => <label className={styles.range} key={key}><span>{key.toUpperCase()} <b>{Math.round(active[key] * 100)}%</b></span><input type="range" min={key === "width" || key === "height" ? .08 : 0} max={key === "x" ? 1 - active.width : key === "y" ? 1 - active.height : key === "width" ? 1 - active.x : 1 - active.y} step=".01" value={active[key]} onChange={event => updateSpot({ [key]: Number(event.target.value) })} /></label>)}</div></>}
      {step === 4 && <><h2>Set price and availability</h2><p>Configure each spot independently in Canadian dollars.</p><div className={styles.priceList}>{spots.map(spot => <div key={spot.id}><strong>{spot.name}</strong><label>Price (CAD)<input type="number" min="0" value={spot.price} onChange={event => { const price = Number(event.target.value); setSpots(all => all.map(item => item.id === spot.id ? { ...item, price } : item)); }} /></label><label>Booking length<select value={spot.duration} onChange={event => setSpots(all => all.map(item => item.id === spot.id ? { ...item, duration: event.target.value } : item))}><option>7 days</option><option>14 days</option><option>30 days</option><option>90 days</option></select></label></div>)}</div></>}
      {step === 5 && <><h2>Review your listing</h2><p>Check the customer-facing details and backing Broker before wallet authorization.</p><dl className={styles.summary}><div><dt>Item</dt><dd>{item.title || "Untitled item"}</dd></div><div><dt>Backing Broker</dt><dd>Broker #{String(selectedBroker?.tokenNumber ?? 0).padStart(4, "0")}</dd></div><div><dt>Broker tier</dt><dd>{utilityPolicy.label}</dd></div><div><dt>Broker allocation</dt><dd>{assignedListingCount} of {utilityPolicy.maxItems ?? "unlimited"} items used</dd></div><div><dt>Location</dt><dd>{item.city}, {item.country}</dd></div><div><dt>Environment</dt><dd>{item.environment}</dd></div><div><dt>Photo</dt><dd>{photo || "Not attached"}</dd></div><div><dt>Bookable spots</dt><dd>{spots.length} / {spotLimit}</dd></div><div><dt>Platform fee</dt><dd>{utilityPolicy.platformFee}%</dd></div></dl></>}
      {step === 6 && <><h2>Authorize the listing</h2><p>Your wallet signature assigns this local listing to Broker #{String(selectedBroker?.tokenNumber ?? 0).padStart(4, "0")}. It is not a blockchain transaction and cannot move funds.</p><div className={styles.confirmBox}><Check /><div><b>Ready for Broker #{String(selectedBroker?.tokenNumber ?? 0).padStart(4, "0")}</b><span>{utilityPolicy.label} · {spots.length} spot{spots.length === 1 ? "" : "s"} · {item.city}</span></div></div><button className="button" disabled={publishing || brokerAtCapacity} onClick={() => void publishListing()}>{publishing ? <><LoaderCircle className={styles.spin} size={17} /> Waiting for wallet</> : "Sign and save listing"}</button>{actionError && <p className={styles.actionError} role="alert">{actionError}</p>}</>}
      <footer className={styles.actions}>{step > 1 && <button className={styles.secondary} onClick={() => setStep(step - 1)}>Back</button>}{step < 6 && <button className="button" disabled={!currentStepReady} onClick={next}>Continue</button>}</footer>
    </section><aside className={styles.preview}><span className={styles.eyebrow}>Placement preview</span><div className={styles.canvas}>{photoPreview ? <Image src={photoPreview} alt="Selected listing preview" fill unoptimized sizes="420px" className={styles.uploadedPhoto} /> : <div className={styles.laptop}><span /><i /></div>}{spots.map(spot => <button key={spot.id} aria-label={`Edit ${spot.name}`} onClick={() => { setActiveId(spot.id); setStep(3); }} className={activeId === spot.id ? styles.spotActive : styles.spot} style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%`, width: `${spot.width * 100}%`, height: `${spot.height * 100}%` }}><span>{spot.name}</span></button>)}</div><h3>{item.title || "Your item"}</h3><p>{item.city}, {item.country} · {spots.length} of {spotLimit} spots</p><small>{utilityPolicy.label} utility preview · 0% platform fee.</small></aside></div>
  </main>;
}
