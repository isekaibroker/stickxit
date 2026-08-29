import assert from "node:assert/strict";
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
    "/item/pro-toolbox-calgary",
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
});

test("marketplace exposes the advertiser campaign entry point", async () => {
  const response = await render("/marketplace");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /href="\/campaigns(?:\/new)?(?:\?[^"]*)?"/i);
  assert.match(html, /advertis|campaign/i);
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
