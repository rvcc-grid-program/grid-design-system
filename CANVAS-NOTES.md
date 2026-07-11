# Canvas notes — the sanitizer, the allowlist, and every gotcha we've hit

Working reference for anyone styling content that ships into Canvas LMS.
Everything here was **verified empirically** against a real Canvas instance
(raritanval.instructure.com, June 2026) by pasting fragments into the page
HTML editor, saving, and inspecting what survived — both the re-opened
editor HTML and the rendered page's computed styles. Canvas's sanitizer is
server-side and can change without notice; re-run the specimen paste test
(see "Testing methodology") when something looks off.

The one-sentence mental model: **designing for Canvas is designing for
email.** Inline styles only, a property allowlist, no interactivity, and a
host page you don't control.

## 1. The CSS property allowlist

Canvas keeps the `style` attribute but filters it property-by-property.
Verdicts below are from paste tests on 2026-06-11/12, 2026-07-06, and
2026-07-07.

**Amber highlight utilities — Verified 2026-07-07** (Accent v2 paste test,
instructor-confirmed). `.hl` / `.hl-highlighter` (amber wash: `hsl()` alpha
background behind ink text), `.hl-pill` and `.tag` (solid `hsl()` amber-soft
background + deep-amber `hsl()` ink, `border-radius`) all survive the paste —
they reuse only already-verified properties, so nothing new was at risk.
`.tag`'s `letter-spacing`/`text-transform` strip/bake as expected (label still
reads uppercase). The indigo Accent v2 token swap changes only color values,
not which properties are used — no regression to the survives/stripped tables
below.

### Verified — survives

| Property                                                               | Notes                                                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `display: flex`, `gap`                                                 | Whole rows depend on these (masthead, video meta) — they held                                                       |
| `margin-left: auto`                                                    | Right-aligns the term pill inside flex                                                                              |
| positive `margin`, `padding`                                           | The system's entire spacing rhythm                                                                                  |
| `border`, `border-radius`                                              | Borders do ALL structural work in this system                                                                       |
| `background`, incl. `linear-gradient(…)`                               | The brand-mark gradient survives                                                                                    |
| Modern `hsl()` syntax, **including alpha** (`hsl(230 76% 52% / 0.42)`) | Alpha colors are the sanctioned substitute for `opacity`                                                            |
| `overflow: hidden`                                                     |                                                                                                                     |
| `font-family`, `font-size`, `line-height`, `text-align`                | but NOT `font-weight` — see STRIPPED (2026-07-06)                                                                   |
| `font:` shorthand                                                      | Expanded to longhands on save, **weight included** — the sanctioned way to bold a styled span (term chip proves it) |
| `text-decoration`                                                      |                                                                                                                     |
| `max-width`, `width`, `height` on block elements                       |                                                                                                                     |
| `flex` shorthand (`none`, `0 0 6.5rem`, `1 1 70%`), `flex-wrap`        | The data-list rows and every tile depend on these (2026-07-06)                                                      |

### Verified — STRIPPED

| Property                 | Discovered because                                                                                                                                                                                                                         | Workaround                                                                                                                                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text-transform`         | Uppercase labels rendered lowercase                                                                                                                                                                                                        | Build bakes uppercase into the text itself                                                                                                                                                                                                                                                                     |
| `box-shadow`             | Cards rendered flat                                                                                                                                                                                                                        | None needed — shadows are decoration; borders carry structure                                                                                                                                                                                                                                                  |
| `letter-spacing`         | Wordmark tracking flattened                                                                                                                                                                                                                | Accepted; nothing structural depends on tracking                                                                                                                                                                                                                                                               |
| `opacity`                | Dimmed brand dots rendered full-strength                                                                                                                                                                                                   | Alpha color values (`hsl(… / 0.42)`) instead                                                                                                                                                                                                                                                                   |
| **negative margins**     | The thumbnail letterbox crop silently became 0                                                                                                                                                                                             | Solve at build time, not in CSS (see §4 video)                                                                                                                                                                                                                                                                 |
| `aspect-ratio`           | Letterbox bars appeared                                                                                                                                                                                                                    | Build-time thumbnail selection                                                                                                                                                                                                                                                                                 |
| `object-fit`             | (same)                                                                                                                                                                                                                                     | (same)                                                                                                                                                                                                                                                                                                         |
| `font-weight` (longhand) | Specimen paste 2026-07-06: 21 sent, 1 survived — every bold label (callout/checkpoint titles, video/link titles, chips) flattened to normal. The lone survivor came from a `font:` shorthand, which Canvas expands to longhands and keeps. | Use the `font:` shorthand for weighted spans, or real `<strong>` (survives; `<b>` is rewritten to `<strong>`). Fixed 2026-07-06 (DECISIONS.md 20): all Canvas-visible weighted rules converted to the shorthand. Paste-confirmed same day: 600/700/750/800 all survive (700 comes back as the keyword `bold`). |

### Impossible by nature (inline styles can't express them)

Media queries (so: **no dark mode, no responsive breakpoints, no
print styles**), `:hover`, `:focus`, `::before`/`::after`, `::marker`,
`@keyframes`/animations, CSS custom properties as a cascade (the build
resolves every `var(--token)` to a literal before inlining).

Design consequence: every component must read correctly as a **static,
light-theme, pseudo-element-free** rendering. Anything else is
preview-only garnish.

## 2. Elements and attributes

- **Stripped elements**: `<style>`, `<script>`, `<svg>`. The GRID brand mark is
  built from styled `<span>` dots for exactly this reason. Icons must be
  hosted images — never inline SVG. As of 2026-07-04 the five content-icon
  tiles use baked-color transparent PNGs hosted on the Pages site
  (`docs/icons/generated/<use>@3x.png`, generated by `pnpm run build:icons`);
  the Canvas build swaps every `<svg class="gi">` for the matching `<img>`.
  **Verified 2026-07-06** (specimen paste, saved DOM re-inspected): all
  five `<img>` swaps survive with `src`, `alt=""`, width/height, and
  `display:block` intact.
- **Self-hosted webfonts do NOT reach Canvas** (design fact, 2026-07-07): the
  three GRID fonts (Schibsted/Hanken/Space Mono) are delivered via `@font-face`
  in `css/grid-fonts.css`. `@font-face` is an at-rule, not a property, so it
  cannot be inlined onto an element — and `<style>` (where it would otherwise
  live) is stripped, plus the Canvas build's `juice` inlining runs with
  `removeStyleTags: true`. So Canvas renders each `--font-*` stack's **system
  fallback**, not the custom face. This is intentional; do NOT add a base64
  font inliner (it can't work — there's no `<style>` for the rule). The heading
  `font:` shorthand still carries the weight into Canvas (decision-20); only the
  family name falls back. The type voice is a preview/web/site enhancement only.
  Paste-verified 2026-07-11 (v1.5.0 specimen): headings/body/chips fall back to
  the system stacks cleanly; nothing surprising.
- **The sanitizer enforces a strict dl content model** (targeted dl-probe,
  2026-07-06): `<dl>`/`<dt>`/`<dd>` SURVIVE intact — including their
  inline styles and `data-*` attributes — but ONLY when dt/dd are direct
  children of a `<dl>`. Anything else is unwrapped on save: dt/dd inside a
  `<div>` row inside the dl (the original v1.1.0 data-list markup — note
  this div-in-dl grouping IS legal HTML5; Canvas is stricter than the
  spec), or dt/dd with no dl ancestor, lose their tags and merge into the
  parent's text. Div/span equivalents of the same layout survive verbatim.
  Consequence shipped 2026-07-06: data-list emits dt/dd as direct dl
  children, rows via flex-wrap, key chip on an inner span (all
  probe-verified primitives). Assume similarly strict content models for
  other structured elements (table-adjacent, figure, etc.) until probed.
- **Empty elements are dropped entirely.** A `<span>` with only a style
  attribute vanishes on save. Every decorative-box element carries
  `&nbsp;` content.
- **Allowed elements we rely on**: `div`, `span`, `p`, headings, lists,
  `a`, `img`, `code`, `pre`, `kbd`, `strong`, `em`, `blockquote`, `iframe`
  (from allowed sources — YouTube works).
- **`section`/`header` are normalized to `div` by our build** before
  pasting — plain divs are the safest container, and pandoc-era testing
  showed HTML5 sectioning elements are riskier.
- **`data-*` attributes survive** — the foundation of our `data-class`
  round-trip scheme (§3).
- **`id` attributes survive** (heading anchors work).
- **Attribute order is rewritten on save**: Canvas serializes `style`
  first and `class` after it. The build emits the same order so sent vs
  saved HTML diffs cleanly.

## 3. The class-name trap, and `data-class`

`class` attributes survive the sanitizer — but **real class names are
dangerous in Canvas**:

1. Canvas's own application CSS styles common names (`alert`, `btn`,
   `label`, …) inside page content, so your component picks up Canvas's
   styling on top of your inline styles.
2. Institution theme CSS (admin-uploaded) can target any class, now or
   after a future theme update.

So the build renames every `class` to `data-class` — guaranteed inert,
while preserving the semantic name for round-tripping (strip `style`,
rename back, and you have clean classed HTML again).

**Exception — Canvas's own classes are kept as real classes** when we
_want_ Canvas behavior. Currently one: `inline_disabled` (§4). The build
routes these through a sentinel attribute so the global rename skips them.

## 4. Behavioral gotchas (not sanitizer — Canvas being helpful)

- **YouTube auto-embed**: Canvas appends its own video preview player below
  any YouTube link. With our styled video card that meant the video
  appeared twice. Fix: `class="inline_disabled"` on YouTube links — the
  Canvas-native marker for "text link, don't embed." Verified working.
- **External-link icons**: Canvas appends a small icon to every external
  link. Harmless; design around its existence.
- **The page title is Canvas's**: Canvas renders the page title above your
  content. Don't ship an `<h1>` in the fragment — our masthead starts at
  the brand row, and headings inside content start at `h2`.
- **Host chrome**: your fragment lives on Canvas's white page, in a
  Lato-font world. The `page-wrap` paper panel exists to give the design a
  controlled background; the font stack is set inline on the wrapper.
- **Canvas Student app dark mode** rewrites inline colors with its own
  transforms. Light-theme colors must not carry meaning through subtle
  tint differences alone; spot-check new components on a phone.
- **YouTube `<iframe>` embed survives the paste (Verified 2026-07-06)**: a
  standard `https://www.youtube.com/embed/<id>` iframe pasted into the RCE
  HTML editor survives intact (Route A of `runbooks/probe-youtube-iframe.md`).
  Canvas normalizes it cosmetically — adds `loading="lazy"`, expands bare
  `allowfullscreen` to `allowfullscreen="allowfullscreen"`, reorders
  attributes, wraps it in a `<p>` — but does **not** rewrite it into its own
  `data-media`/`instructure` media wrapper. `src`, `title`, `width`/`height`,
  and `allow` are kept; the embed renders and plays. This is a real embed
  path (distinct from the auto-embed of a plain YouTube _link_ above). Import
  parity is untested — see §7.
- **YouTube thumbnails are letterboxed**: `hqdefault.jpg` is 4:3 with black
  bars around 16:9 content, and Canvas strips every CSS cropping technique
  (negative margins, `aspect-ratio`, `object-fit`). Fix lives in the build:
  HEAD-check the true-16:9 `maxresdefault.jpg` per video, fall back to
  `hqdefault` (bars show in Canvas; preview/print still crop via the
  `.letterboxed` negative-margin rule).

## 5. Pipeline-side consequences (what canvas-build.js does and why)

1. Resolve every `var(--token)` to a literal (no custom-property cascade).
2. Strip `@media` blocks (dark theme, print) — light theme only.
3. Drop the universal `* { box-sizing }` rule; set box-sizing only where
   width and padding interact (avoids inlining noise onto every element).
4. Inline with juice; no width/height attribute generation.
5. Bake uppercase into text wherever the style had `text-transform:
uppercase`.
6. Add `inline_disabled` to YouTube links (sentinel attribute).
7. Normalize `section`/`header` → `div`.
8. Rename `class` → `data-class`; restore sentinel Canvas classes.
9. Reorder attributes: `style` first, `class`/`data-class` last.
10. Emit a body fragment only (no doctype/head — Canvas wants a fragment).

Spacing strategy: **margins, not flex-gap, for content flow.** Flex did
survive testing, but if it's ever stripped, margin-spaced content degrades
to readable stacking while zero-margin flex-gap content collapses. Flex is
used only in rows where stacking is an acceptable failure mode.

## 6. Testing methodology

The only authority is a real paste test. The loop:

1. Build the specimen from the repo root: `pnpm run canvas specimen/specimen.md`
   (in a consumer repo the same build is `pnpm exec grid-canvas <page.md>`).
2. Paste the fragment into a sandbox Canvas page's HTML editor; save.
3. **Reopen the HTML editor** — diff what Canvas kept against what you
   sent (grep for the property you're probing).
4. For rendering questions, inspect the _live page's computed styles_
   (browser devtools or scripted): `getComputedStyle(el).marginTop` tells
   you the truth even when the saved HTML is ambiguous.
5. Record the verdict in this file and `DECISIONS.md` with the date.

Screenshots catch layout failures; only saved-HTML/computed-style checks
catch silent property stripping — a stripped property usually fails
_quietly_ (the letterbox crop became `margin: 0` with no error anywhere).

## 7. Open questions

- Whether the allowlist differs between paste-into-RCE and **imscc import**
  (the eventual delivery path). Re-run the specimen test on the first
  imported package before trusting parity.
- Alpha-background dim dots: fix shipped 2026-06-12, awaiting visual
  confirmation on the next paste.

## Scope caveat

All verdicts are from one institution's hosted Canvas instance in June 2026.
Instructure's official doc is
[Canvas HTML Editor Allowlist](https://community.instructure.com/en/kb/articles/387066-canvas-html-editor-allowlist)
(Instructure Community, article 387066; also mirrored as a
[PDF](https://tr-learncanvas.s3.amazonaws.com/docs/Canvas_HTML_Editor_Allowlist.pdf)).
Treat it as the map and the paste test as the territory — the gap runs both
directions: the doc allows elements we conservatively avoid (`header`,
`article`, `aside`), and our tests caught stripping the doc doesn't mention
(`letter-spacing`, `opacity`, negative margins).
