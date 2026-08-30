import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
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
  assert.match(html, /Turn what you own into ad space/i);
  assert.match(html, /Isekai Brokers/i);
  assert.match(html, /Explore marketplace/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("server-renders primary product routes", async () => {
  const productRoutes = [
    "/marketplace",
    "/isekai-brokers",
    "/launchpad",
    "/broker",
    "/create-listing",
    "/campaigns",
    "/campaigns/new",
    "/campaigns/new?item=macbook-pro-m2-montreal&spot=A",
    "/item/macbook-pro-m2-montreal",
    "/item/custom-gaming-pc-toronto",
    "/item/bmw-330i-montreal",
    "/item/cordless-drill-calgary",
    "/item/street-deck-montreal",
    "/item/rider-helmet-ottawa",
    "/r/LOCAL1",
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
  const projectedAssets = ["silver-laptop.webp", "gaming-pc.webp", "graphite-sedan.webp", "cordless-drill.webp", "street-skateboard.webp", "rider-helmet.webp"];
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

test("primary navigation no longer exposes the removed Advertise route", async () => {
  const response = await render("/marketplace");
  assert.equal(response.status, 200);

  const html = await response.text();
  const primaryNav = html.match(/<nav[^>]*class="[^"]*nav-links[^"]*"[^>]*>[\s\S]*?<\/nav>/i)?.[0];
  assert.ok(primaryNav, "primary navigation should be present in server-rendered HTML");
  assert.doesNotMatch(primaryNav, /href="\/advertise(?:[?/#][^"]*)?"/i);
});

test("legacy Advertise route redirects to Marketplace", async () => {
  const response = await render("/advertise");
  assert.ok([301, 302, 303, 307, 308].includes(response.status), `/advertise should redirect, received ${response.status}`);

  const location = response.headers.get("location");
  assert.ok(location, "redirect response should include a Location header");
  assert.equal(new URL(location, "http://localhost").pathname, "/marketplace");
});
