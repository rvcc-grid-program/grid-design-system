/* pipeline/build-icons.js — generates the Canvas PNG rasters.
   Run before/with the Canvas build. Wire into package.json:
     "build:icons": "node pipeline/build-icons.js"
   and call it from the main build before canvas-build. */

import { rasterizeAll } from "./icons.js";
import { readTokenBlocks, hslStringToHex } from "./tokens.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "docs", "icons", "generated");

// Token→literal resolver from the single source (pipeline/tokens.js reads
// css/grid-tokens.css), so baked PNG colors never drift from the tokens.
const { light } = readTokenBlocks();
const resolve = (token) => (light[token] ? hslStringToHex(light[token]) : null);

const files = await rasterizeAll({ outDir, resolve });
console.log(`icons: wrote ${files.length} PNG(s) → ${outDir}`);
files.forEach((f) => console.log("  " + f));
