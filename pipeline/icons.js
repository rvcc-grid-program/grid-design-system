/* pipeline/icons.js — GRID content-icon system (A · Signal type direction).
   ONE registry, TWO renderers:
     iconFor(use)   → inline <svg> for style-capable targets (web / PDF)
     rasterizeAll() → one transparent PNG per use, color baked in, for Canvas

   Why two: Canvas LMS strips <svg> and does not honor currentColor, so the
   Canvas build swaps every <svg.gi> for an <img> pointing at the matching PNG
   (see canvas-build.js step). Web/PDF keep the crisp, recolorable SVG.

   Icon art: Lucide (https://lucide.dev), ISC-licensed. The path data below is
   the exact Lucide source for each glyph; prefer the `lucide-static` npm
   package as the authoritative source and treat these as the expected values. */

// Lucide 0.4xx path data, viewBox 0 0 24 24.
const LUCIDE = {
  play: { fill: true, body: '<polygon points="6 3 20 12 6 21 6 3"/>' },
  "arrow-up-right": { stroke: 2, body: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>' },
  check: { stroke: 2.25, body: '<path d="M20 6 9 17l-5-5"/>' },
  "triangle-alert": {
    stroke: 2,
    body: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  },
  info: {
    stroke: 2,
    body: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  },
};

/* The FIVE content usages found in markdown.js. For each:
     icon   — Lucide name above
     px     — icon display size (chosen for its tile; do not change without QA)
     color  — the tile's foreground token; its LIGHT-THEME literal is baked into
              the PNG and MUST equal the tile's CSS `color:` (see grid-components.css) */
export const ICON_USES = {
  "play-tile": { icon: "play", px: 22, color: "accent-ink" },
  "link-ico": { icon: "arrow-up-right", px: 20, color: "accent-soft-ink" },
  "checkpoint-mark": { icon: "check", px: 20, color: "ok-ink" },
  "callout-warning": { icon: "triangle-alert", px: 16, color: "danger-ink" },
  "callout-note": { icon: "info", px: 16, color: "accent-ink" },
};

/* Light-theme literals for the baked PNG colors. These MIRROR grid-tokens.css
   (light :root). If you can import the pipeline's token→literal resolver, use
   that instead so they never drift; this map is the authoritative fallback. */
export const INK_LITERALS = {
  "accent-ink": "#FFFFFF", // --accent-ink: 0 0% 100%
  "accent-soft-ink": "#1D34A5", // --accent-soft-ink: 230 70% 38%
  "ok-ink": "#FAFDFA", // --ok-ink: 120 40% 98%
  "danger-ink": "#FFFFFF", // --danger-ink: 0 0% 100%
};

/* Inline SVG for a usage. `colorLiteral` optional: when omitted the SVG uses
   currentColor (correct for web — the tile sets `color:`); when provided it is
   baked in (used by the rasterizer). */
export function iconFor(use, colorLiteral) {
  const u = ICON_USES[use];
  if (!u) throw new Error(`icons.js: unknown use "${use}"`);
  const def = LUCIDE[u.icon];
  const paint = colorLiteral || "currentColor";
  const attrs = def.fill
    ? `fill="${paint}" stroke="none"`
    : `fill="none" stroke="${paint}" stroke-width="${def.stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg class="gi gi-${u.icon}" data-gi="${use}" width="${u.px}" height="${u.px}" viewBox="0 0 24 24" ${attrs} aria-hidden="true">${def.body}</svg>`;
}

/* Swap every <svg.gi data-gi="use"> in an HTML string for its Canvas <img>.
   Call this inside canvas-build.js AFTER section→div normalization and BEFORE
   the class→data-class rename. `pngHref(use)` returns the src for a use. */
export function svgToCanvasImg(html, pngHref) {
  return html.replace(/<svg\b[^>]*\bdata-gi="([^"]+)"[^>]*>[\s\S]*?<\/svg>/g, (_m, use) => {
    const u = ICON_USES[use];
    return `<img src="${pngHref(use)}" width="${u.px}" height="${u.px}" alt="" style="display:block">`;
  });
}

/* Rasterize all five usages to <outDir>/<use>@3x.png (transparent, color baked).
   Needs @resvg/resvg-js. `resolve(token)` → CSS color literal; pass one that
   reads grid-tokens.css if you have it, else defaults to INK_LITERALS. */
export async function rasterizeAll({ outDir, resolve } = {}) {
  const { Resvg } = await import("@resvg/resvg-js");
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const SCALE = 3;
  mkdirSync(outDir, { recursive: true });
  for (const [use, u] of Object.entries(ICON_USES)) {
    const literal = (resolve && resolve(u.color)) || INK_LITERALS[u.color];
    // HTML-inline SVG omits xmlns; resvg is a strict XML parser and needs it.
    const svg = iconFor(use, literal).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
    const png = new Resvg(svg, {
      fitTo: { mode: "width", value: u.px * SCALE },
      background: "rgba(0,0,0,0)",
    })
      .render()
      .asPng();
    writeFileSync(join(outDir, `${use}@3x.png`), png);
  }
  return Object.keys(ICON_USES).map((u) => `${u}@3x.png`);
}
