# Stickxit

Stickxit is a complete local prototype for a distributed physical advertising marketplace powered by Isekai Brokers. It runs without a backend, contract, wallet, payment, or internet service after the project dependencies are installed. An installed EVM wallet remains available as an optional access mode.

## Included flows

- One-click local demo workspace with persistent access across reloads
- Optional EIP-6963 wallet discovery with EIP-1193 injected-wallet fallback
- Shared local/wallet account and network state across every route
- Optional ERC-721 collection-balance check when a chain and collection contract are configured
- Multiple local Isekai Brokers per wallet, with tier-specific item and spot limits tracked independently
- Searchable marketplace combining six built-in surfaces with user-created listings
- Listing builder with uploaded photos, custom placement regions, pricing, and tier limits
- Item-specific, physically usable sticker regions with surface guidance for laptops, PCs, cars, cordless drills, skateboards, and helmets
- Campaign builder that preserves the selected item, spot, and artwork transform from the marketplace
- Marketplace campaign creation with custom artwork uploads and an adjustable 3D live mockup
- Drag, keyboard, position, scale, and rotation controls constrained to the selected sticker region
- A curated 18-portrait Isekai Brokers gallery without public rarity labels
- Local campaign records, editable dynamic-QR destinations, `/r/{code}` redirects, and recorded local scan events
- Broker HQ and campaign dashboards populated from the current browser's records
- IndexedDB media storage and localStorage record/session storage

## Local prototype boundaries

Broker, listing, campaign, destination, and session records are stored only in the current browser; uploaded images are stored in IndexedDB. Nothing is server-authenticated, shared between devices, submitted on-chain, or treated as a real booking. The prototype does not transfer NFTs, charge a wallet, reserve public inventory, process escrow, ship stickers, or invent production analytics. Those capabilities require contracts and a production data service.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, choose **Open workspace**, then **Use the local demo workspace**. No wallet is required. Copy `.env.example` to `.env.local` only if you want to test chain enforcement and collection ownership checks.

### Test the Marketplace campaign flow

1. Open **Marketplace** and keep **Browse placements** selected.
2. Choose a sticker spot on any item card, then select **Start campaign on this spot**.
3. Confirm the selected item and spot, then continue to upload a PNG or JPG.
4. Add a campaign name and, for QR campaigns, an `https://` destination.
5. Drag the sticker or use the position, size, rotation, and 3D-view controls.
6. Continue through Preview and Authorize. Local demo authorization saves only to this browser.
7. Return to **Marketplace → My campaigns** or **QR destinations** to inspect the saved record.

The retired `/advertise` URL redirects to Marketplace so old bookmarks do not break.

## Validation

```bash
npm run lint
npm test
```

`npm test` performs a production build and checks all primary routes, the dynamic QR route, item detail pages, and unknown-item 404 handling.
