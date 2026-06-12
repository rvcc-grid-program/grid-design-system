#!/usr/bin/env node
/* Build a Canvas-ready fragment from a wiki markdown page.
   Pipeline: markdown-it (classed HTML, canvas shell) → resolve design tokens
   to literals (light theme only) → juice (inline the CSS) → normalize
   section→div → class→data-class → emit a paste-ready body fragment.
   Usage: node canvas-build.js <page.md>  (or: pnpm run canvas <page.md>)  */

import { readFileSync, writeFileSync } from "node:fs";
import juice from "juice";
import * as cheerio from "cheerio";
import { renderPage } from "./markdown.js";
import { canvasPage } from "./templates.js";
import { enhance, loadSystemCss } from "./enhance.js";
import { loadConfig } from "./config.js";

const src = process.argv[2];
if (!src) {
  console.error("usage: node canvas-build.js <page.md>");
  process.exit(1);
}
const out = src.replace(/\.md$/, ".canvas.html");

// 1. markdown-it → classed HTML in the canvas shell (no h1), then the shared
// DOM enhancements (video cards, link-row URLs, est-chip) BEFORE inlining so
// the classes they add still receive styles.
const page = renderPage(src);
const html = (
  await enhance(
    cheerio.load(
      canvasPage({
        moduleTitle: page.data.module_title,
        bodyHtml: page.html,
        config: loadConfig(),
      }),
    ),
  )
).html();

// 2. resolve design tokens to literal values, light set only
let css = loadSystemCss();
css = stripAtBlocks(css, "@media"); // dark theme + media queries don't inline
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\}/)[1];
const tokens = {};
for (const m of rootBlock.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
  tokens[m[1]] = m[2].trim();
}
for (let pass = 0; pass < 3; pass++) {
  // tokens that reference tokens
  for (const k of Object.keys(tokens)) {
    tokens[k] = tokens[k].replace(/var\(--([\w-]+)\)/g, (m, n) => tokens[n] ?? m);
  }
}
css = css
  .replace(/var\(--([\w-]+)\)/g, (m, n) => tokens[n] ?? m)
  .replace(/:root\s*\{[\s\S]*?\}/, ""); // definitions are inert once resolved

// The universal box-sizing rule would inline onto every element — drop it
// and set box-sizing only where width + padding interact.
css = css.replace(/\*\s*,\s*\*::before\s*,\s*\*::after\s*\{[^}]*\}/, "");

// Canvas-only adjustments: box-sizing where width + padding interact (the
// universal rule was dropped above); the mark renders inline-block.
css +=
  "\n.page-wrap,.content,.brand .mark{box-sizing:border-box;}" +
  "\n.brand .mark{display:inline-block;}\n";

// 3. inline styles into the markup
const inlined = juice.inlineContent(html, css, {
  removeStyleTags: true,
  applyHeightAttributes: false,
  applyWidthAttributes: false,
});

// 4. DOM fixes for what Canvas's sanitizer eats or adds
const $ = cheerio.load(inlined);

// Canvas strips text-transform — bake uppercase into the text itself.
$('[style*="text-transform: uppercase"]').each((_, el) => upperTextNodes(el));

// Canvas auto-appends its own video preview to YouTube links; the
// inline_disabled class (Canvas's own, must survive the data-class rename)
// suppresses it. Sentinel attribute swapped back after the rename.
$('a[href*="youtube.com"], a[href*="youtu.be"]').attr("data-canvas-class", "inline_disabled");

// Canvas saves class attributes AFTER the inline style — emit the same order
// so sent vs saved HTML diffs cleanly. (Object key order = serialized order.)
$("[class], [data-canvas-class]").each((_, el) => {
  for (const key of ["class", "data-canvas-class"]) {
    if (key in el.attribs) {
      const value = el.attribs[key];
      delete el.attribs[key];
      el.attribs[key] = value;
    }
  }
});

// 5. extract the body fragment, make it Canvas-safe
let frag = $("body").html().trim();
frag = frag
  .replace(/<(\/?)(section|header)\b/g, "<$1div") // plain divs for Canvas
  .replace(/(^|\s)class="/g, '$1data-class="') // inert semantic markers
  .replace(/data-canvas-class="/g, 'class="'); // real Canvas classes

writeFileSync(out, frag + "\n");
console.log(`built ${out}`);

/* Uppercase every text node under el, preserving child elements (b, strong…). */
function upperTextNodes(el) {
  for (const node of el.children ?? []) {
    if (node.type === "text") node.data = node.data.toUpperCase();
    else upperTextNodes(node);
  }
}

/* Remove every `@<marker> … { … }` block, counting braces. */
function stripAtBlocks(text, marker) {
  let i;
  while ((i = text.indexOf(marker)) !== -1) {
    let depth = 0;
    let j = text.indexOf("{", i);
    for (; j < text.length; j++) {
      if (text[j] === "{") depth++;
      else if (text[j] === "}" && --depth === 0) break;
    }
    text = text.slice(0, i) + text.slice(j + 1);
  }
  return text;
}
