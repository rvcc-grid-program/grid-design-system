/* templates.js — page shells for the two build targets.
   PoC: plain JS template literals. When the wiki becomes an 11ty site these
   become .njk layouts; the markup below is the spec for that port. */

/* GRID mark: 2×2 dots, top-left lit, three dimmed ("your spot in the grid")
   — same brand story as the invite-app icon, built from plain elements so it
   survives Canvas (no svg, nothing empty). */
const GRID_MARK_DOTS =
  `<span class="bm-row"><span class="bm-dot">&nbsp;</span><span class="bm-dot dim">&nbsp;</span></span>` +
  `<span class="bm-row"><span class="bm-dot dim">&nbsp;</span><span class="bm-dot dim">&nbsp;</span></span>`;

/* GRID favicon — the same inlined SVG data URI the invite app ships
   (gradient squircle, top-left cell lit). Self-contained, no asset file. */
const FAVICON_LINK = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><defs><linearGradient id='t' x1='96' y1='40' x2='416' y2='472' gradientUnits='userSpaceOnUse'><stop offset='0' stop-color='%23A4B2FF'/><stop offset='1' stop-color='%235C6CDE'/></linearGradient><linearGradient id='l' x1='86' y1='86' x2='236' y2='236' gradientUnits='userSpaceOnUse'><stop offset='0' stop-color='%23EEF2FF'/><stop offset='1' stop-color='%23C2CCFF'/></linearGradient></defs><rect width='512' height='512' rx='132' fill='url(%23t)'/><rect x='86' y='86' width='150' height='150' rx='40' fill='url(%23l)'/><rect x='276' y='86' width='150' height='150' rx='40' fill='%231E2A57'/><rect x='86' y='276' width='150' height='150' rx='40' fill='%231E2A57'/><rect x='276' y='276' width='150' height='150' rx='40' fill='%231E2A57'/></svg>" />
<meta name="theme-color" content="#5C6CDE" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0E1322" media="(prefers-color-scheme: dark)" />
<link rel="apple-touch-icon" href="icons/apple-touch-icon-180.png" />`;

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");

/* Theme toggle (preview targets only — never sent to Canvas). Same pattern
   and localStorage key as the invite app: system default, user override
   persisted to grid-theme-mode. SVG is fine here; this never meets the
   Canvas sanitizer. */
const THEME_TOGGLE_BUTTON = `<button type="button" id="theme-toggle" class="theme-toggle" aria-label="Switch to dark theme">
      <svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
      <svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>
    </button>`;

/* Runs in <head>, before first paint: apply a saved theme override so a
   dark-preferring visitor never sees a light flash (and vice versa). The
   main toggle script below re-reads the same key; this is just the early
   application. */
const THEME_HEAD_SCRIPT = `<script>
try { var m = localStorage.getItem("grid-theme-mode"); if (m === "light" || m === "dark") document.documentElement.setAttribute("data-mode", m); } catch (e) {}
</script>`;

const THEME_TOGGLE_SCRIPT = `<script>
(function () {
  var root = document.documentElement, KEY = "grid-theme-mode";
  var btn = document.getElementById("theme-toggle");
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function effective() { return root.getAttribute("data-mode") || (mq.matches ? "dark" : "light"); }
  function sync() {
    var e = effective();
    btn.setAttribute("data-eff", e);
    btn.setAttribute("aria-label", e === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  try { var saved = localStorage.getItem(KEY); if (saved === "light" || saved === "dark") root.setAttribute("data-mode", saved); } catch (e) {}
  sync();
  btn.addEventListener("click", function () {
    var next = effective() === "dark" ? "light" : "dark";
    root.setAttribute("data-mode", next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    sync();
  });
  mq.addEventListener && mq.addEventListener("change", function () { if (!root.getAttribute("data-mode")) sync(); });
})();
</script>`;

function brandRow({ withToggle = false } = {}) {
  return `<div class="brand">
    <span class="mark" aria-hidden="true">${GRID_MARK_DOTS}</span>
    <span class="wordmark"><b>GRID</b> · Fall 2026</span>
    <span class="term">IDMX-225</span>
    ${withToggle ? THEME_TOGGLE_BUTTON : ""}
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
${FAVICON_LINK}
${THEME_HEAD_SCRIPT}
<style>
${css}
</style>
</head>
<body>
<div class="page">
<div class="shell">

<header class="masthead">
  ${brandRow({ withToggle: true })}
${moduleTitle ? `  <p class="module-label">${esc(moduleTitle)}</p>\n` : ""}  <h1 class="page-title">${esc(title)}</h1>
</header>

<main>
<div class="content">
${bodyHtml}
</div>
</main>

</div>
</div>
${THEME_TOGGLE_SCRIPT}
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
