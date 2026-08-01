/* video card poster accessible name — regression test.

   History, because the shape only makes sense with it:

   Through v1.8.1 the poster was an anchor holding nothing but the image, so
   the image's alt was the link's entire accessible name — the word "Video" on
   every card (idmx-225: 63 cards across 35 pages, 57% of its error-level
   findings). v1.9.0 hid that anchor with aria-hidden + tabindex="-1"; Canvas
   keeps aria-hidden and STRIPS tabindex, so shipped pages got a focusable
   element missing from the accessibility tree — one silent tab stop per video.

   v1.10.0 removes the mechanism instead of patching it: the poster is a bare
   decorative <img>, so the card has exactly ONE link and there is no second
   tab stop to name, hide, or strip. Nothing here depends on an attribute the
   sanitizer can eat. CSS stretches the title link over the plate; that is
   preview-only by design (Canvas strips ::after). DECISIONS.md 28.

   fetch is stubbed to fail so bestThumb takes its offline fallback — the test
   must not depend on the network.

   Run: pnpm test */

import test from "node:test";
import assert from "node:assert/strict";
import * as cheerio from "cheerio";
import { md } from "../pipeline/markdown.js";
import { enhance } from "../pipeline/enhance.js";

const ID = "hw7TwIf1rOw";

globalThis.fetch = () => Promise.reject(new Error("offline (test stub)"));

async function card(alt) {
  const html = md.render(
    `[![${alt}](https://img.youtube.com/vi/${ID}/hqdefault.jpg)](https://youtu.be/${ID})`,
  );
  const $ = cheerio.load(html);
  await enhance($);
  return $;
}

test("the card has exactly one link, and it is the title", async () => {
  const $ = await card("Video");
  const links = $(".video-card a");
  assert.equal(links.length, 1, "a second anchor is a second tab stop — that was the v1.9.0 bug");
  assert.equal(links.attr("class"), "video-title");
  assert.equal(links.attr("href"), `https://youtu.be/${ID}`);
});

test("the poster is a bare decorative image, not a link", async () => {
  const $ = await card("Video");
  const poster = $("img.video-poster");
  assert.equal(poster.length, 1);
  assert.equal(poster.attr("alt"), "", "alt is empty, never the author's string");
  assert.equal(poster.parent().attr("class"), "video-card", "not wrapped in an anchor");
  assert.equal(poster.closest("a").length, 0);
});

test("nothing in the card relies on an attribute Canvas strips", async () => {
  /* Canvas keeps aria-hidden and strips tabindex (measured 2026-07-31).
     The poster must not carry either: aria-hidden on a focusable element is
     axe's aria-hidden-focus, which is what the half-stripped v1.9.0 shipped. */
  const $ = await card("Video");
  const poster = $("img.video-poster");
  assert.equal(poster.attr("tabindex"), undefined);
  assert.equal(poster.attr("aria-hidden"), undefined);
  assert.equal($(".video-card [tabindex]").length, 0);
});

test("a meaningful alt still names the title link, and never the poster", async () => {
  const $ = await card("File System Basics");
  assert.equal($("a.video-title").text(), "File System Basics");
  assert.equal($("img.video-poster").attr("alt"), "");
});

test("a useless alt falls back to the standard title", async () => {
  const $ = await card("Video");
  assert.equal($("a.video-title").text(), "Watch on YouTube");
});

test("the letterboxed marker rides on the poster's own class list", async () => {
  /* The crop moved from `.video-poster img.letterboxed` to a second class on
     the img itself when the wrapper anchor went away. data-class uses ~=, so
     a multi-class list is fine for consumers. */
  const $ = await card("Video");
  const cls = $("img.video-poster").attr("class").split(/\s+/);
  assert.ok(cls.includes("video-poster"));
  assert.ok(cls.includes("letterboxed"), "offline fallback is the 4:3 hqdefault");
});
