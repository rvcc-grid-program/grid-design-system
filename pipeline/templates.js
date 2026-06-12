/* templates.js — page shells for the two build targets.
   PoC: plain JS template literals. When the wiki becomes an 11ty site these
   become .njk layouts; the markup below is the spec for that port. */

/* GRID mark: 2×2 dots, top-left lit, three dimmed ("your spot in the grid")
   — same brand story as the invite-app icon, built from plain elements so it
   survives Canvas (no svg, nothing empty). */
const GRID_MARK_DOTS =
  `<span class="bm-row"><span class="bm-dot">&nbsp;</span><span class="bm-dot dim">&nbsp;</span></span>` +
  `<span class="bm-row"><span class="bm-dot dim">&nbsp;</span><span class="bm-dot dim">&nbsp;</span></span>`;

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");

function brandRow() {
  return `<div class="brand">
    <span class="mark" aria-hidden="true">${GRID_MARK_DOTS}</span>
    <span class="wordmark"><b>GRID</b> · Fall 2026</span>
    <span class="term">IDMX-225</span>
  </div>`;
}

/* Standalone preview: full document, theme in a <style> tag, real h1. */
export function previewPage({ title, moduleTitle, bodyHtml, css }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} · GRID</title>
<style>
${css}
</style>
</head>
<body>
<div class="page">
<div class="shell">

<header class="masthead">
  ${brandRow()}
${moduleTitle ? `  <p class="module-label">${esc(moduleTitle)}</p>\n` : ""}  <h1 class="page-title">${esc(title)}</h1>
</header>

<main>
<div class="content">
${bodyHtml}
</div>
</main>

</div>
</div>
</body>
</html>
`;
}

/* Canvas target: body only (extracted later), no h1 (Canvas shows the page
   title itself). The dot mark needs no svg, so both targets share it. */
export function canvasPage({ moduleTitle, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body>
<div class="page-wrap">

<header class="masthead">
  ${brandRow()}
${moduleTitle ? `  <p class="module-label">${esc(moduleTitle)}</p>\n` : ""}</header>

<div class="content">
${bodyHtml}
</div>

</div>
</body>
</html>
`;
}
