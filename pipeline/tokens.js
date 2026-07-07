/* pipeline/tokens.js — the ONE reader of css/grid-tokens.css.
   Every other place that needs token values (scripts/contrast.js,
   pipeline/build-icons.js, pipeline/icons.js) imports from here instead of
   hand-mirroring the numbers. A token edit in the CSS now propagates
   automatically; nothing to keep in sync by hand.

   Also enforces the standing rule that the two dark blocks (the
   prefers-color-scheme media query and the [data-mode="dark"] override)
   carry identical values — readTokenBlocks() throws if they drift. */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = join(here, "..", "css", "grid-tokens.css");

/* Pull `--name: value;` declarations out of the first block matched by
   `selectorRe`. Returns { name: "H S% L%" } string values, trimmed. */
function parseBlock(css, selectorRe, label) {
  const m = css.match(selectorRe);
  if (!m) throw new Error(`grid-tokens.css: could not find the ${label} block`);
  const out = {};
  for (const d of m[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    out[d[1]] = d[2].trim();
  }
  return out;
}

/* Read the light :root and both dark scopes. The two dark scopes must be
   identical (LOCKED-token rule); we assert it here so a half-finished edit
   fails loudly instead of shipping a mismatched dark theme. Returns
   { light, dark } as { token: "H S% L%" } maps. */
export function readTokenBlocks(css = readFileSync(cssPath, "utf8")) {
  const light = parseBlock(css, /:root\s*\{([\s\S]*?)\}/, "light :root");
  const darkMedia = parseBlock(
    css,
    /:root:not\(\[data-mode="light"\]\)\s*\{([\s\S]*?)\}/,
    "dark (media query)",
  );
  const darkAttr = parseBlock(
    css,
    /:root\[data-mode="dark"\]\s*\{([\s\S]*?)\}/,
    'dark ([data-mode="dark"])',
  );

  const keys = new Set([...Object.keys(darkMedia), ...Object.keys(darkAttr)]);
  const drift = [];
  for (const k of keys) {
    if (darkMedia[k] !== darkAttr[k]) {
      drift.push(
        `  --${k}: media=${darkMedia[k] ?? "(absent)"} vs attr=${darkAttr[k] ?? "(absent)"}`,
      );
    }
  }
  if (drift.length) {
    throw new Error(
      "grid-tokens.css: the two dark blocks have drifted — keep them identical:\n" +
        drift.join("\n"),
    );
  }

  return { light, dark: darkAttr };
}

/* "H S% L%" → [h, s, l] numbers (s and l as 0–100, matching the WCAG math
   in scripts/contrast.js). Returns null if the value isn't a plain triplet
   (e.g. a gradient or a var()). */
export function hslStringToTriplet(value) {
  const m = value.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/* Map a whole block's string values to numeric triplets, dropping any that
   aren't plain HSL triplets. */
export function tripletsOf(block) {
  const out = {};
  for (const [k, v] of Object.entries(block)) {
    const t = hslStringToTriplet(v);
    if (t) out[k] = t;
  }
  return out;
}

/* "H S% L%" → "#RRGGBB" (uppercase). Same conversion build-icons.js used to
   carry inline. Returns null for non-triplet values. */
export function hslStringToHex(value) {
  const t = hslStringToTriplet(value);
  if (!t) return null;
  const [h, s, l] = [t[0], t[1] / 100, t[2] / 100];
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
