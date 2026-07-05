/* pipeline/build-icons.js — generates the Canvas PNG rasters.
   Run before/with the Canvas build. Wire into package.json:
     "build:icons": "node pipeline/build-icons.js"
   and call it from the main build before canvas-build. */

import { rasterizeAll } from "./icons.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "docs", "icons", "generated");

// Token→literal resolver: read the light :root block of grid-tokens.css and
// convert its `H S% L%` triplets to hex, so PNG colors never drift from the
// shipped tokens (INK_LITERALS in icons.js is only the fallback).
const tokensCss = readFileSync(join(here, "..", "css", "grid-tokens.css"), "utf8");
const rootBlock = tokensCss.match(/:root\s*\{([\s\S]*?)\}/)[1];
const tokens = {};
for (const m of rootBlock.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
  tokens[m[1]] = m[2].trim();
}

function hslTripletToHex(triplet) {
  const m = triplet.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return null;
  const [h, s, l] = [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100];
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

const resolve = (token) => (tokens[token] ? hslTripletToHex(tokens[token]) : null);

const files = await rasterizeAll({ outDir, resolve });
console.log(`icons: wrote ${files.length} PNG(s) → ${outDir}`);
files.forEach((f) => console.log("  " + f));
