/* video card poster accessible name — regression test.

   The poster anchor holds nothing but the image, so the image's alt text was
   the link's entire accessible name — in practice the word "Video" on every
   card (idmx-225: 63 cards across 35 pages, 57% of its error-level findings).
   The poster is now decorative: empty alt, aria-hidden, and OUT of the tab
   order (aria-hidden on a focusable element is its own defect, axe's
   aria-hidden-focus). The title anchor carries the name for the same href.
   DECISIONS.md 27.

   Also pins the two structural facts consumers assert against: the poster and
   the title are NOT siblings (Canvas's adjacent-links rule would fire if a
   refactor flattened the card), and the title still takes a meaningful alt.

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

test("the poster is decorative: empty alt, aria-hidden, out of the tab order", async () => {
  const $ = await card("Video");
  const poster = $("a.video-poster");
  assert.equal(poster.length, 1);
  assert.equal(poster.find("img").attr("alt"), "", "alt is empty, never the author's string");
  assert.equal(poster.attr("aria-hidden"), "true");
  assert.equal(poster.attr("tabindex"), "-1", "aria-hidden without this is aria-hidden-focus");
  assert.equal(poster.attr("href"), `https://youtu.be/${ID}`, "still clickable to the same place");
});

test("a meaningful alt still names the title link, and never the poster", async () => {
  const $ = await card("File System Basics");
  assert.equal($("a.video-title").text(), "File System Basics");
  assert.equal($("a.video-poster img").attr("alt"), "");
});

test("a useless alt falls back to the standard title", async () => {
  const $ = await card("Video");
  assert.equal($("a.video-title").text(), "Watch on YouTube");
});

test("the card has exactly one link in the accessibility tree", async () => {
  const $ = await card("Video");
  assert.equal($(".video-card a").length, 2, "both anchors are still emitted");
  assert.equal($('.video-card a:not([aria-hidden="true"])').length, 1);
});

test("the poster and the title are not siblings (Canvas adjacent-links)", async () => {
  const $ = await card("Video");
  assert.equal($("a.video-poster").parent().attr("class"), "video-card");
  assert.equal($("a.video-title").parent().attr("class"), "video-text");
  assert.equal($("a.video-poster").siblings("a").length, 0);
});
