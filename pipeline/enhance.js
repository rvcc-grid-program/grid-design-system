/* enhance.js — shared post-render DOM enhancements (grid-design-system).
   Runs on BOTH the preview and Canvas builds so the two targets stay
   identical. Works on a cheerio instance loaded with the full page HTML.

   1. Video card: the corpus's existing thumbnail-link markdown
      [![alt](img.youtube.com/vi/ID/hqdefault.jpg)](youtu.be/ID)
      becomes the designed .video-card plate — authors change nothing.
   2. Link rows: ::: link-row divs get a muted URL line derived from href.
   3. Estimated time: a paragraph starting with bold "Estimated time"
      becomes the .est-chip — again, zero author change. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/* The design system is the single CSS source for every build target:
   tokens first, then components. */
export function loadSystemCss() {
  const cssDir = join(dirname(fileURLToPath(import.meta.url)), "..", "css");
  return (
    readFileSync(join(cssDir, "grid-tokens.css"), "utf8") +
    "\n" +
    readFileSync(join(cssDir, "grid-components.css"), "utf8")
  );
}

/* Prefer YouTube's true-16:9 maxresdefault.jpg (no letterbox bars — Canvas
   strips every CSS crop technique). HEAD-check at build time; fall back to
   the letterboxed hqdefault when maxres doesn't exist or we're offline. */
const thumbCache = new Map();
async function bestThumb(videoId, fallbackSrc) {
  if (thumbCache.has(videoId)) return thumbCache.get(videoId);
  let result = { src: fallbackSrc, letterboxed: true };
  try {
    const maxres = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const res = await fetch(maxres, { method: "HEAD", signal: AbortSignal.timeout(3000) });
    if (res.ok) result = { src: maxres, letterboxed: false };
  } catch {
    // offline or timeout — keep the letterboxed fallback
  }
  thumbCache.set(videoId, result);
  return result;
}

export async function enhance($) {
  // --- 1. video cards -----------------------------------------------------
  for (const img of $('p > a > img[src*="img.youtube.com"]').toArray()) {
    const a = $(img).parent();
    const p = a.parent();
    const href = a.attr("href") ?? "";
    const src = $(img).attr("src") ?? "";
    const alt = ($(img).attr("alt") ?? "").trim();
    const title = alt && alt.toLowerCase() !== "video" ? alt : "Watch on YouTube";
    const videoId = src.match(/\/vi\/([\w-]+)\//)?.[1];
    const thumb = videoId ? await bestThumb(videoId, src) : { src, letterboxed: true };
    p.replaceWith(
      `<div class="video-card">` +
        `<a class="video-poster" href="${href}">` +
        `<img${thumb.letterboxed ? ' class="letterboxed"' : ""} src="${thumb.src}" alt="${alt || "Video thumbnail"}"></a>` +
        `<div class="video-meta">` +
        `<span class="play-tile" aria-hidden="true">▶</span>` +
        `<div class="video-text">` +
        `<span class="video-kicker">Video · YouTube</span>` +
        `<a class="video-title" href="${href}">${title}</a>` +
        `</div></div></div>`,
    );
  }

  // --- 2. link-row URL lines ----------------------------------------------
  $(".link-row .link-body a").each((_, a) => {
    const el = $(a);
    if (el.siblings(".link-url").length || el.nextAll(".link-url").length) return;
    const href = el.attr("href") ?? "";
    let display;
    try {
      const u = new URL(href);
      display = (u.hostname + u.pathname).replace(/\/$/, "");
    } catch {
      return; // relative/wiki link — no URL line
    }
    el.after(`<span class="link-url">${display}</span>`);
  });

  // --- 3. estimated-time chip ---------------------------------------------
  $("p").each((_, p) => {
    const el = $(p);
    if (el.attr("class")) return;
    const firstChild = el.children().first();
    if (!firstChild.is("strong")) return;
    if (!/^estimated time/i.test(el.text().trim())) return;
    el.attr("class", "est-chip");
  });

  // --- 4. data-list: ::: data-list around a markdown list → semantic <dl> --
  // Zero-tables policy: key-value data is a definition list, never a table.
  // Author writes `- **key** — value`; bold lead becomes the <dt>.
  $("div.data-list").each((_, el) => {
    const div = $(el);
    const items = div.find("> ul > li");
    if (!items.length) return;
    const rows = items.toArray().map((li) => {
      const item = $(li);
      const key = item.children("strong").first();
      const keyHtml = key.length ? key.html() : "";
      key.remove();
      const value = (item.html() ?? "").replace(/^\s*(—|–|-|:)?\s*/, "");
      return `<div class="data-row"><dt>${keyHtml}</dt><dd>${value}</dd></div>`;
    });
    div.replaceWith(`<dl class="data-list">${rows.join("")}</dl>`);
  });

  return $;
}
