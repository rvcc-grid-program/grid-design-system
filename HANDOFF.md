# GRID design system — handoff

The authoritative spec for the GRID course-content design system. Sibling of
the invite-app claim-flow handoff (`invite-app/design/design_handoff_grid_claim_flow`):
same Console tokens, different problem — long-form instructional content
flowing through an automated pipeline to three targets.

Component decisions come from the Claude Design options canvas
(`design-history/claude-design-exploration`) as adjudicated in
`DECISIONS.md`. Component inventory comes from the 122-file content audit
(`idmx-225-wiki/reports/content-pattern-audit-for-canvas-design-system.md`).

## Files

| File                                      | Role                                                                                                                                                                                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `css/grid-tokens.css`                     | LOCKED Console tokens, light + dark, plus `--font-*`/`--weight-*` type tokens. Extend only with a DECISIONS.md entry.                                                                                                                                            |
| `css/grid-fonts.css`                      | `@font-face` for the three OFL webfonts (woff2 + ttf). Concatenated first by `loadSystemCss` (not `@import`). Canvas drops it.                                                                                                                                   |
| `fonts/`                                  | Self-hosted font binaries (woff2 primary + ttf fallback) + SIL OFL 1.1 license text. Ships in the package tarball.                                                                                                                                               |
| `css/grid-components.css`                 | Every component + base typography + `@media print`.                                                                                                                                                                                                              |
| `specimen/specimen.md`                    | Exercises every component. THE regression test — rebuild after any CSS change.                                                                                                                                                                                   |
| `specimen/specimen.html` / `.canvas.html` | Built outputs (preview / Canvas fragment).                                                                                                                                                                                                                       |
| `CONTRAST.md`                             | Generated AA verification (`pnpm run contrast`).                                                                                                                                                                                                                 |
| `DECISIONS.md`                            | Why things are the way they are.                                                                                                                                                                                                                                 |
| `pipeline/`                               | The builds: `markdown.js` (THE markdown contract), `enhance.js`, `templates.js`, `config.js`, `icons.js`/`build-icons.js`, `tokens.js` (THE single reader of `grid-tokens.css` — contrast + icons derive from it), `site-build.js` (Pages site: builds `docs/index.html`, copies specimen pages + `/fonts` → `docs/fonts`, rewrites font paths for the docs web root), two CLI bins (`grid-preview`, `grid-canvas`). |

Consumers install this repo as a pnpm git dependency pinned to a release
tag and put a `grid.config.json` (program/term/course) in their repo root —
see README "Using it from a content repo".

## Render targets

1. **Preview / future 11ty site** — full CSS in `<style>`, light/dark via
   `prefers-color-scheme`, built by `pipeline/preview-build.js`.
2. **Canvas LMS** (primary) — CSS inlined to `style=""`, light only, classes
   renamed to `data-class` (except Canvas-native classes like
   `inline_disabled`), uppercase baked into text, built by
   `pipeline/canvas-build.js`.
3. **Print/PDF** — print the preview; `@media print` lives in the components
   file (page-break protection, shadows off, URL after video/plain links).

The pipeline's `enhance.js` runs on BOTH HTML targets so they never diverge.

## Authoring contract (what instructors write)

Plain markdown everywhere, plus exactly these constructs:

| Component           | Author writes                                                                                                    | Pipeline produces                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Video block         | The existing thumbnail-link line: `[![Video](https://img.youtube.com/vi/ID/hqdefault.jpg)](https://youtu.be/ID)` | `.video-card` plate (poster + play tile + meta bar) — zero migration                                                                                                        |
| Estimated time      | The existing bold line: `**Estimated time: 25-30 minutes.**`                                                     | `.est-chip` pill — zero migration                                                                                                                                           |
| Learning objectives | `::: objectives` around stem + list                                                                              | `.objectives` wrapper with kicker                                                                                                                                           |
| Warning callout     | `::: callout-warning` around text                                                                                | `.callout` with head row (triangle-alert icon + WARNING)                                                                                                                    |
| Note callout        | `::: callout-note` around text                                                                                   | `.callout` with head row (info icon + NOTE)                                                                                                                                 |
| Checkpoint          | `::: checkpoint` around text                                                                                     | `.checkpoint` row (check icon + CHECKPOINT label)                                                                                                                           |
| Featured link       | `::: link-row` around ONE markdown link                                                                          | row with arrow-up-right tile, bold link, auto URL line                                                                                                                      |
| Other links         | plain markdown list                                                                                              | plain list (bullets get accent markers in preview)                                                                                                                          |
| Internal link       | `[[page-slug]]`                                                                                                  | `.wikilink` monospace chip                                                                                                                                                  |
| Steps               | `### Steps` heading + ordered list                                                                               | styled ordered list                                                                                                                                                         |
| Key-value data      | `::: data-list` around `- **key** — value` items (blank line before the closing `:::`)                           | semantic `<dl>` with chip keys, dt/dd as DIRECT dl children (Canvas unwraps any wrapper div — DECISIONS.md 19), rows via flex-wrap — NEVER a `<table>` (zero-tables policy) |
| Prose highlight     | `[key phrase]{.hl}` (or `.hl-highlighter`)                                                                       | `.hl` amber wash behind ink text — loudest in-sentence emphasis; `.hl` and `.hl-highlighter` are identical                                                                  |
| Soft-pill highlight | `[key phrase]{.hl-pill}`                                                                                         | `.hl-pill` rounded amber-soft tint + deep-amber ink — quieter inline emphasis for a value or term                                                                           |
| Label pill          | `<span class="tag">NEW</span>` (inline HTML)                                                                     | `.tag` uppercase mono pill (NEW / BETA / DUE SOON)                                                                                                                          |
| Code                | standard fenced block / inline backticks                                                                         | `.content pre` / inline `code` chip                                                                                                                                         |
| Keys                | `<kbd>Cmd</kbd>` (inline HTML)                                                                                   | keycap style                                                                                                                                                                |

Anything not in this table is plain typography. Do not invent new fenced-div
names without adding them here and to the CSS.

**Raw-HTML guard.** `html: true` lets the constructs above through, but a tag
typed loose in prose (a bare `<iframe>`, `<video>`, `<style>`, or a stray
`<section>`) passes through too — swallowing the rest of the page or vanishing
silently. `markdown.js` warns (`file:line`, warn-only) on raw HTML outside a
small hand-writable allowlist (`kbd`, `span`, `br`, `sub`/`sup`, `abbr`,
`b`/`i`/`em`/`strong`, …; `iframe` only with a YouTube `src`). If you meant a
tag as text, backtick it; the warning never blocks the build. See DECISIONS.md
"Raw-HTML prose guard".

## DOM contracts (what the pipeline emits)

Structured containers are emitted by `markdown.js` — authors never write
this markup, but every consumer (future 11ty shortcodes included) must
reproduce it exactly.

```html
<!-- video block (enhance.js, from the thumbnail-link markdown) -->
<div class="video-card">
  <a class="video-poster" href="https://youtu.be/ID"><img src="…hqdefault.jpg" alt="…" /></a>
  <div class="video-meta">
    <span class="play-tile" aria-hidden="true"><svg class="gi" data-gi="play-tile">…</svg></span>
    <div class="video-text">
      <span class="video-kicker">Video · YouTube</span>
      <a class="video-title" href="https://youtu.be/ID">Watch on YouTube</a>
    </div>
  </div>
</div>

<!-- callout (markdown.js container render; -note variant swaps ico/label) -->
<div class="callout callout-warning">
  <div class="callout-head">
    <span class="callout-ico" aria-hidden="true"
      ><svg class="gi" data-gi="callout-warning">…</svg></span
    >
    <span class="callout-title">Warning</span>
  </div>
  <div class="callout-body"><p>…</p></div>
</div>

<!-- checkpoint -->
<div class="checkpoint">
  <span class="checkpoint-mark" aria-hidden="true"
    ><svg class="gi" data-gi="checkpoint-mark">…</svg></span
  >
  <div class="checkpoint-body">
    <span class="checkpoint-title">Checkpoint</span>
    <p>…</p>
  </div>
</div>

<!-- objectives -->
<div class="objectives">
  <span class="objectives-kicker">Learning objectives</span>
  <p>When you have completed…</p>
  <ul>
    <li>…</li>
  </ul>
</div>

<!-- data-list (enhance.js, from the ::: data-list markdown list).
     dt/dd MUST be direct children of the dl — Canvas unwraps any wrapper
     div (DECISIONS.md 19). Rows come from CSS flex-wrap; the chip is the
     inner .data-key span, never the dt itself. -->
<dl class="data-list">
  <dt><span class="data-key">A</span></dt>
  <dd>90–100</dd>
  <dt><span class="data-key">B+</span></dt>
  <dd>85–89</dd>
</dl>

<!-- featured link row (URL line added by enhance.js from the href) -->
<div class="link-row">
  <span class="link-ico" aria-hidden="true"><svg class="gi" data-gi="link-ico">…</svg></span>
  <div class="link-body">
    <p><a href="…">Label</a><span class="link-url">host/path</span></p>
  </div>
</div>

<!-- amber highlights (inline span utilities; authored as [text]{.class} or
     raw <span>, passed through untouched — no markdown container). -->
<span class="hl">case-sensitive</span>
<span class="hl-highlighter">lowercase everything</span>
<span class="hl-pill">my-file.html</span>
<span class="tag">NEW</span>

<!-- masthead (templates.js; module label from frontmatter module_title,
     program/term/course from the consumer's grid.config.json) -->
<div class="brand">
  <span class="mark" aria-hidden="true"><!-- 2×2 bm-dot spans, one lit three .dim --></span>
  <span class="wordmark"><b>GRID</b> · Fall 2026</span>
  <span class="term">IDMX-225</span>
</div>
```

Labels ("Warning", "Video · YouTube", kickers) are written in normal case
and uppercased by `text-transform` — the Canvas build bakes the uppercase
into the text because Canvas strips `text-transform`. Never hard-code
uppercase in source markup.

### Content icons (pipeline/icons.js)

The five tile glyphs are Lucide icons rendered from a single registry
(`ICON_USES` in `pipeline/icons.js`): play (filled), arrow-up-right, check,
triangle-alert, info. Web/PDF targets get an inline `<svg class="gi"
data-gi="<use>">` using `currentColor` (the tile's CSS `color:` paints it).
Canvas strips `<svg>`, so `canvas-build.js` swaps each for
`<img src="…/icons/generated/<use>@3x.png" alt="">` — transparent PNGs with
the light-theme ink color baked in, generated by `pnpm run build:icons`
(runs automatically before `pnpm run canvas`) and committed under
`docs/icons/generated/` so the Pages site hosts them. The base URL is
overridable via `iconBase` in a consumer's `grid.config.json`. Icons are
decorative: always `aria-hidden="true"` tile + empty `alt`, next to a real
text label. New icon usages require a design-owner decision — never pick
one ad hoc.

## Canvas degradation notes (per component)

- **Everything**: no hover, no focus ring, no dark theme, no `::marker`
  accent bullets — all preview-only garnish; meaning never depends on them.
  Canvas also strips `box-shadow`, `letter-spacing`, `opacity`, negative
  margins, `aspect-ratio`, `object-fit`, and `text-transform` (all verified
  2026-06-12) — none of these may carry meaning or structure.
- **Video card**: the build HEAD-checks YouTube's true-16:9
  `maxresdefault.jpg` per video; the `hqdefault` fallback gets
  `.letterboxed` (negative-margin crop — preview/print only; Canvas shows
  that fallback's bars). Both links get Canvas's `inline_disabled` class to
  suppress its auto-player (confirmed working).
- **Brand mark**: dot spans contain `&nbsp;` (Canvas drops empty elements);
  the `.dim` dots use an alpha background color, not `opacity` — alpha
  survives, opacity doesn't.
- **Amber highlights** (`.hl` / `.hl-highlighter` / `.hl-pill` / `.tag`):
  built from solid `hsl()` + `hsl()` alpha + `border-radius` only — all
  survive Canvas inlining. `.tag`'s `letter-spacing` and `text-transform`
  are stripped/baked (the label still reads uppercase); no `box-shadow` or
  `opacity` on any of them, so the amber wash and pill tints carry through.
- **Shadows**: stripped in Canvas — only ever decorative; borders carry
  the structure everywhere.
- **Spacing is margin-based** by design: if flex were ever stripped, content
  still reads top-to-bottom. Flex appears only in rows (brand, video-meta,
  link-row, callout-head, checkpoint) where stacking is an acceptable
  degradation.

## Type voice and heading scale (the standard)

Three self-hosted OFL webfonts, wired through `--font-*` tokens in
`grid-tokens.css` (faces in `css/grid-fonts.css`, binaries in `/fonts/`,
woff2 primary + ttf fallback):

- `--font-display` → **Schibsted Grotesk** — `h1.page-title`, `.content h2/h3/h4`.
- `--font-sans` → **Hanken Grotesk** — body, UI, captions (inherited).
- `--font-mono` → **Space Mono** — chips, kickers, code, filenames.

Every stack keeps system fallbacks, so Canvas (which drops `@font-face` —
see CANVAS-NOTES.md) degrades to a sane system font; the fonts are a
preview/web/site enhancement, never load-bearing.

Scale: h1.page-title `clamp(1.55rem,5vw,2rem)` weight 800. h2 = 1.625rem,
**weight 700** (recalibrated from 800 for Schibsted's heavier cut — DECISIONS
"typographic voice"), hairline rule below — THE section divider. h3 = 1.25rem,
weight 700. h4 = 1rem, weight 700. Section headings standardize on h2. Body
1rem/1.6. Nothing below 0.875rem (14px). Heading `font:` shorthand carries the
weight into Canvas (decision-20); only the family falls back there.

## Verification loop

After any change: `pnpm run contrast` (must stay 0 failures), rebuild the
specimen both ways, eyeball the preview in light AND dark, paste the
specimen's `.canvas.html` into the Canvas sandbox page, reopen its HTML
editor, and diff — the probe list lives in DECISIONS.md.
