# Stickxit

Stickxit is a pre-launch physical advertising marketplace powered by Isekai Brokers. Advertisers choose a real-world surface, select a designated sticker region, fit their artwork, and authorize a campaign draft with an EVM wallet.

## Current product scope

- EIP-6963 wallet discovery with an EIP-1193 injected-wallet fallback
- Optional ERC-721 balance verification after the official chain and collection address are configured
- Six realistic example surfaces with physically mapped sticker areas
- Marketplace campaign entry points for each exact item and spot
- Custom PNG or JPG artwork upload and an adjustable 3D placement mockup
- Drag, keyboard, position, scale, and rotation controls constrained to the selected region
- A curated 18-portrait Isekai Brokers gallery without public rarity labels
- Wallet-authorized campaign drafts and editable QR destinations
- Broker HQ with transparent launch, contract, and ownership states
- Mint launchpad marked TBA until verified mint details are published

Item listing is temporarily unavailable. The `/create-listing` compatibility route redirects to `/launchpad` until the production listing workflow is ready.

## Pre-launch boundaries

Example inventory is not bookable and payments are disabled. Campaign drafts and uploaded artwork are retained in the current browser for review, but they are not public bookings or shared backend records. NFT ownership-gated Broker access remains locked until the official network and collection contract are configured.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and connect an installed EVM wallet to test wallet-linked campaign authorization. Copy `.env.example` to `.env.local` to test a configured chain and collection balance check.

### Test the Marketplace campaign flow

1. Open **Marketplace** and keep **Browse placements** selected.
2. Choose a sticker spot on any item card, then select **Place my NFT on this spot**.
3. Connect an EVM wallet when prompted.
4. Confirm the selected item and spot, then upload a PNG or JPG.
5. Add a campaign name and, for QR campaigns, an `https://` destination.
6. Drag the sticker or use the position, size, rotation, and 3D view controls.
7. Continue through Preview and Authorize, then sign the campaign draft with the connected wallet.
8. Return to **Marketplace**, then open **My campaigns** or **QR destinations**.

The retired `/advertise` URL redirects to Marketplace so old bookmarks continue to work.

## Validation

```bash
npm run lint
npm test
```

The test suite performs a production build and validates the public routes, navigation, Marketplace entry points, item details, redirects, and unknown-item handling.
