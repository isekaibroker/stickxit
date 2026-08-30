import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html", "user-agent": "Twitterbot/1.0" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Stickxit product homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Stickxit[^<]*<\/title>/i);
  assert.match(html, /property="og:image" content="http:\/\/localhost:3000\/og\.png"/i);
  assert.match(html, /name="twitter:card" content="summary_large_image"/i);
  assert.match(html, /name="twitter:site" content="@isekaibrokers"/i);
  assert.match(html, /name="twitter:creator" content="@isekaibrokers"/i);
  assert.match(html, /Turn what you own into ad space/i);
  assert.match(html, /Isekai Brokers/i);
  assert.match(html, /4,444 Isekai Brokers/i);
  assert.doesNotMatch(html, /<strong>(?:5,555|6,666)<\/strong><small>Isekai Brokers<\/small>/i);
  assert.match(html, /Robinhood Chain/i);
  assert.match(html, /href="https:\/\/x\.com\/isekaibrokers"/i);
  assert.match(html, /Explore marketplace/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("server-renders primary product routes", async () => {
  const productRoutes = [
    "/marketplace",
    "/isekai-brokers",
    "/launchpad",
    "/broker",
    "/campaigns",
    "/campaigns/new",
    "/campaigns/new?item=macbook-pro-m2-montreal&spot=A",
    "/item/macbook-pro-m2-montreal",
    "/item/custom-gaming-pc-toronto",
    "/item/bmw-330i-montreal",
    "/item/cordless-drill-calgary",
    "/item/street-deck-montreal",
    "/item/rider-helmet-ottawa",
    "/r/TEST01",
  ];

  for (const pathname of productRoutes) {
    const response = await render(pathname);
    assert.equal(response.status, 200, `${pathname} should render`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, `${pathname} should return HTML`);
  }
});

test("unknown non-local item routes return a real 404", async () => {
  const response = await render("/item/does-not-exist");
  assert.equal(response.status, 404);
});

test("public Broker gallery is limited to eighteen approved rarity-free controls", async () => {
  const response = await render("/isekai-brokers");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.equal((html.match(/aria-label="Preview artwork for Broker #/g) ?? []).length, 18);
  assert.doesNotMatch(html, /Filter brokers by rarity/i);
  assert.doesNotMatch(html, /Broker #0197/i);
  assert.doesNotMatch(html, /Broker #0308/i);
  assert.doesNotMatch(html, /(?:\/isekai\/gallery\/|%2Fisekai%2Fgallery%2F)0197\.png/i);
  assert.doesNotMatch(html, /(?:\/isekai\/gallery\/|%2Fisekai%2Fgallery%2F)0308\.png/i);
  assert.match(html, /20% of platform fees/i);
  assert.match(html, /holder allocation/i);
  assert.doesNotMatch(html, /local demo|local workspace|local preview|browser-only simulation/i);
});

test("public collection is one original and final Genesis supply of 4,444", async () => {
  const response = await render("/isekai-brokers");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<strong>4,444<\/strong><span>Genesis Brokers<\/span>/i);
  assert.match(html, /Original Genesis/i);
  assert.match(html, /one original Genesis collection with a fixed and final supply of 4,444/i);
  assert.match(html, /<span>Original collection<\/span>\s*<strong>4,444<\/strong>/i);
  assert.match(html, /<span>Final supply<\/span>\s*<strong>4,444<\/strong>/i);
  assert.match(html, /Original and final supply: 4,444/i);
  assert.doesNotMatch(html, /1,111|2,222|5,555|6,666|joined by|expanded Genesis|expanded collection/i);

  const homepageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const launchpadSource = await readFile(new URL("../app/launchpad/LaunchpadExperience.tsx", import.meta.url), "utf8");
  const collectionSource = await readFile(new URL("../app/isekai-brokers/CollectionExperience.tsx", import.meta.url), "utf8");
  const publicSupplySource = `${homepageSource}\n${launchpadSource}\n${collectionSource}`;
  assert.doesNotMatch(publicSupplySource, /1,111|2,222|5,555|6,666|joined by|expanded Genesis|expanded collection/i);
  assert.match(publicSupplySource, /original Genesis collection/i);
  assert.match(publicSupplySource, /fixed and final supply of 4,444/i);
});

test("marketplace exposes the advertiser campaign entry point", async () => {
  const response = await render("/marketplace");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /href="\/campaigns(?:\/new)?(?:\?[^"]*)?"/i);
  assert.match(html, /advertis|campaign/i);
});

test("marketplace ships a realistic photo for every example surface", async () => {
  const assets = [
    "silver-laptop.webp",
    "gaming-pc.webp",
    "graphite-sedan.webp",
    "cordless-drill.webp",
    "street-skateboard.webp",
    "rider-helmet.webp",
  ];
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  for (const asset of assets) {
    const file = new URL(`../public/marketplace/${asset}`, import.meta.url);
    assert.ok((await stat(file)).size > 20_000, `${asset} should contain an optimized product photo`);
    assert.match(css, new RegExp(`/marketplace/${asset.replace(".", "\\.")}`));
  }
});

test("marketplace examples use surface-projected sticker photos without polluting the campaign editor", async () => {
  const projectedAssets = ["silver-laptop.webp", "gaming-pc.webp", "graphite-sedan-v2.webp", "cordless-drill.webp", "street-skateboard.webp", "rider-helmet.webp"];
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const asset of projectedAssets) {
    const file = new URL(`../public/marketplace/stickered/${asset}`, import.meta.url);
    assert.ok((await stat(file)).size > 20_000, `${asset} should contain a baked physical-sticker composite`);
    assert.match(css, new RegExp(`/marketplace/stickered/${asset.replace(".", "\\.")}`));
  }

  const marketplaceResponse = await render("/marketplace");
  assert.equal(marketplaceResponse.status, 200);
  const marketplaceHtml = await marketplaceResponse.text();
  assert.equal((marketplaceHtml.match(/data-example-stickered="true"/g) ?? []).length, 6);
  assert.match(marketplaceHtml, /Cordless Drill/i);
  assert.doesNotMatch(marketplaceHtml, /Pro Toolbox/i);

  const campaignResponse = await render("/campaigns/new?item=cordless-drill-calgary&spot=A");
  assert.equal(campaignResponse.status, 200);
  const campaignHtml = await campaignResponse.text();
  assert.doesNotMatch(campaignHtml, /data-example-stickered="true"|product-photo-stickered/i);
  const campaignMockupSource = await readFile(new URL("../app/advertise/InteractivePlacementMockup.tsx", import.meta.url), "utf8");
  assert.match(campaignMockupSource, /showExampleStickers=\{false\}/);
});

test("marketplace item clicks open stickered details with a separate Place my NFT path", async () => {
  const marketplaceResponse = await render("/marketplace");
  assert.equal(marketplaceResponse.status, 200);
  const marketplaceHtml = await marketplaceResponse.text();
  assert.match(marketplaceHtml, /href="\/item\/bmw-330i-montreal\?spot=A"/i);
  assert.match(marketplaceHtml, /Place my NFT on this spot/i);

  const detailResponse = await render("/item/bmw-330i-montreal?spot=B");
  assert.equal(detailResponse.status, 200);
  const detailHtml = await detailResponse.text();
  assert.match(detailHtml, /data-example-stickered="true"/i);
  assert.match(detailHtml, /product-photo-car[^"']*product-photo-stickered/i);
  assert.match(detailHtml, /Place my NFT/i);
  assert.match(detailHtml, /href="\/campaigns\/new\?item=bmw-330i-montreal(?:&amp;|&)spot=B(?:&amp;|&)template=upload(?:&amp;|&)source=item-detail"/i);

  const campaignResponse = await render("/campaigns/new?item=bmw-330i-montreal&spot=B&template=upload&source=item-detail");
  assert.equal(campaignResponse.status, 200);
});

test("primary navigation hides removed Advertise and List a spot routes", async () => {
  const response = await render("/marketplace");
  assert.equal(response.status, 200);

  const html = await response.text();
  const primaryNav = html.match(/<nav[^>]*class="[^"]*nav-links[^"]*"[^>]*>[\s\S]*?<\/nav>/i)?.[0];
  assert.ok(primaryNav, "primary navigation should be present in server-rendered HTML");
  assert.doesNotMatch(primaryNav, /href="\/advertise(?:[?/#][^"]*)?"/i);
  assert.doesNotMatch(primaryNav, /href="\/create-listing(?:[?/#][^"]*)?"/i);
  assert.doesNotMatch(primaryNav, /List a spot/i);
});

test("temporarily removed listing route redirects to mint status", async () => {
  const response = await render("/create-listing");
  assert.ok([302, 303, 307].includes(response.status), `/create-listing should temporarily redirect, received ${response.status}`);
  const location = response.headers.get("location");
  assert.ok(location, "redirect response should include a Location header");
  assert.equal(new URL(location, "http://localhost").pathname, "/launchpad");

  const routeSource = await readFile(new URL("../app/create-listing/page.tsx", import.meta.url), "utf8");
  assert.match(routeSource, /redirect\(["']\/launchpad["']\)/);
  assert.doesNotMatch(routeSource, /ListingWizard/);

  const dashboardSource = await readFile(new URL("../app/broker/BrokerDashboard.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(dashboardSource, /href=["']\/create-listing["']|Create listing|New listing/i);
});

test("launchpad is a non-transactional TBA page with no local demo mint", async () => {
  const response = await render("/launchpad");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Robinhood Chain Mint: TBA/i);
  assert.match(html, /Robinhood Chain mainnet is live/i);
  assert.match(html, /Robinhood Chain confirmed\. Mint details are TBA/i);
  assert.match(html, /<dt>Collection size<\/dt>\s*<dd>4,444<\/dd>/i);
  assert.match(html, /one original Genesis collection\s*with a fixed and final supply of 4,444/i);
  assert.doesNotMatch(html, /1,111|2,222|5,555|6,666|joined by|expanded Genesis|expanded collection/i);
  assert.match(html, /Isekai Brokers is independent and is not affiliated with, endorsed by, or sponsored by Robinhood/i);
  assert.match(html, /href="https:\/\/x\.com\/isekaibrokers"/i);
  assert.match(html, /<dt>Network<\/dt>\s*<dd>Robinhood Chain<\/dd>/i);
  for (const label of ["Mint price", "Launch date", "Contract address", "Allowlist"]) {
    assert.match(html, new RegExp(`<dt>${label}</dt>\\s*<dd>TBA</dd>`, "i"));
  }
  assert.doesNotMatch(html, /Create (?:another )?demo Broker|Demo utility tier|Build your local Broker|browser-only Broker record|Wallet options/i);

  const primaryNav = html.match(/<nav[^>]*class="[^"]*nav-links[^"]*"[^>]*>[\s\S]*?<\/nav>/i)?.[0];
  assert.ok(primaryNav, "primary navigation should be present in server-rendered HTML");
  assert.match(primaryNav, /href="\/launchpad"[^>]*>Mint on Robinhood Chain<\/a>/i);

  const source = await readFile(new URL("../app/launchpad/LaunchpadExperience.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /saveLocalBroker|createDemoBroker|startLocalSession|WalletConnectModal|useWallet/);
});

test("Robinhood Chain configuration is ready while the collection contract stays unset", async () => {
  const configSource = await readFile(new URL("../lib/web3/config.ts", import.meta.url), "utf8");
  assert.match(configSource, /4663:\s*\{/);
  assert.match(configSource, /chainName:\s*["']Robinhood Chain["']/);
  assert.match(configSource, /https:\/\/rpc\.mainnet\.chain\.robinhood\.com/);
  assert.match(configSource, /https:\/\/robinhoodchain\.blockscout\.com/);

  const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
  assert.match(envExample, /^NEXT_PUBLIC_SITE_URL=https:\/\/stickxit\.com$/m);
  assert.match(envExample, /^NEXT_PUBLIC_CHAIN_ID=4663$/m);
  assert.match(envExample, /^NEXT_PUBLIC_CHAIN_NAME=Robinhood Chain$/m);
  assert.match(envExample, /^NEXT_PUBLIC_CHAIN_RPC_URLS=https:\/\/rpc\.mainnet\.chain\.robinhood\.com$/m);
  assert.match(envExample, /^NEXT_PUBLIC_CHAIN_EXPLORER_URLS=https:\/\/robinhoodchain\.blockscout\.com$/m);
  assert.match(envExample, /^NEXT_PUBLIC_ISEKAI_COLLECTION_ADDRESS=$/m);
});

test("user-facing source contains no long dash characters", async () => {
  const longDashPattern = new RegExp(`[${String.fromCodePoint(8211)}${String.fromCodePoint(8212)}]`, "u");
  for (const directory of ["../app/", "../components/", "../lib/"]) {
    const root = new URL(directory, import.meta.url);
    const entries = await readdir(root, { recursive: true });
    for (const entry of entries) {
      if (!/\.(?:css|ts|tsx)$/i.test(entry)) continue;
      const source = await readFile(new URL(entry.replaceAll("\\", "/"), root), "utf8");
      assert.doesNotMatch(source, longDashPattern, `${directory}${entry} contains a long dash`);
    }
  }
});

test("source contains no browser demo access or fabricated Broker ownership", async () => {
  const forbidden = /local demo|browser-only demo|browser-only simulation|local preview|local workspace|LOCAL_DEMO|LOCAL_SESSION|startLocalSession|isLocalSession|SavedLocalBroker|getSavedLocalBrokers|saveLocalBroker|0x4444000000000000000000000000000000000001/i;
  for (const directory of ["../app/", "../components/", "../lib/"]) {
    const root = new URL(directory, import.meta.url);
    const entries = await readdir(root, { recursive: true });
    for (const entry of entries) {
      if (!/\.(?:ts|tsx)$/i.test(entry)) continue;
      const source = await readFile(new URL(entry.replaceAll("\\", "/"), root), "utf8");
      assert.doesNotMatch(source, forbidden, `${directory}${entry} contains a removed demo access path`);
      assert.doesNotMatch(source, /href=["']\/create-listing(?:[?/#][^"']*)?["']/i, `${directory}${entry} links to the disabled listing route`);
    }
  }
});

test("legacy Advertise route redirects to Marketplace", async () => {
  const response = await render("/advertise");
  assert.ok([301, 302, 303, 307, 308].includes(response.status), `/advertise should redirect, received ${response.status}`);

  const location = response.headers.get("location");
  assert.ok(location, "redirect response should include a Location header");
  assert.equal(new URL(location, "http://localhost").pathname, "/marketplace");
});
