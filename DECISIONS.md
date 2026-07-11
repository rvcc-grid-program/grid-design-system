# Decision log — GRID design system

Each entry: the decision, the source, one-line rationale. The Claude Design
options canvas (design-history/claude-design-exploration) proposed
recommendations; entries marked "canvas ★" accept them, others record where
and why we diverged.

## Component decisions

1. **Video block = option B (plate card), iframe as opt-in** — canvas ★.
   Built entirely from Canvas-verified properties; in-place playback (option
   C) stays available as a per-video future opt-in since Canvas allows
   YouTube iframes.
2. **Headings = option A (hairline rule under h2, 26/20/16 scale)** —
   canvas ★, converted px → rem (1.625/1.25/1) for user font scaling. The
   hairline is the only section cue that survives inlining.
3. **Learning objectives = option A (surface-2 wrapper + mono kicker)** —
   canvas ★. Students re-find this block when self-assessing; the quiet tint
   keeps it below callouts in attention order.
4. **Resources = option B (featured `::: link-row` + plain list)** —
   canvas ★. Rows signal "required"; plain lists keep 10-link pages
   scannable; authors choose per link.
5. **Estimated time = option A (mono chip)** — canvas ★, BUT authored as the
   existing bold line (`**Estimated time: …**`), auto-detected by
   enhance.js. Zero migration for the 7 corpus instances; no new authoring
   construct to teach.
6. **Checkpoint = keep** — canvas ★ with their caveat accepted: cut it at
   the first semester review if instructors haven't written any.

## Divergences from the options canvas

7. **Brand mark restores "one lit, three dimmed"** — the canvas prototype
   showed four equal dots; the invite-app icon's top-left-lit cell is the
   brand story ("your spot in the grid") and costs one opacity rule.
8. **Term pill keeps the invite-app treatment** (accent-soft fill, not the
   prototype's outlined version) — brand continuity with the claim page
   students see first.
9. **Spacing is margin-based, not flex-gap** — the prototype zeroed margins
   and spaced the content card with flex column gap; if any client strips
   flex, zero-margin content collapses. Margins degrade gracefully; flex is
   reserved for rows where stacking is acceptable degradation.
10. **Code blocks: tokens only, no syntax highlighting** — Canvas gets one
    inlined color scheme; a highlighter would emit hundreds of styled spans
    per block for marginal benefit at this course's code volume.

## Standing pipeline decisions (pre-dating this system)

11. **`class` → `data-class` in Canvas output** — inert semantic markers
    that survive Canvas, enable round-tripping, and can't collide with
    Canvas's own stylesheet classes. Canvas-native classes
    (`inline_disabled`) ride a sentinel attribute through the rename.
12. **Uppercase is baked into text for Canvas** — Canvas strips
    `text-transform`. Source markup stays normal-case.
13. **Attribute order: `style` first, `class`/`data-class` last** — matches
    how Canvas re-serializes saved pages, so sent vs saved diffs cleanly.
14. **markdown-it (not pandoc) is the converter** — one parser shared with
    the future 11ty site; dependencies pinned in package.json; pnpm-only
    repos.
15. **Preview targets get the invite-app theme toggle** (2026-06-12) —
    system default + user override on `:root[data-mode]`, persisted to the
    same `localStorage` key the claim app uses (`grid-theme-mode`). Token
    VALUES unchanged; the dark block is duplicated for the override
    selector (keep the two in sync). Canvas never receives the button or
    script — its template omits both.
16. **Consumption model** (2026-06-12, first release v1.0.0) — this repo is
    the org's single source of design truth; changes land here first.
    Content repos (first: rvcc-grid-program/idmx-225) install it as a pnpm
    git dependency pinned to a release tag; the package exposes the
    `grid-preview`/`grid-canvas` CLIs and importable subpaths
    (`markdown`/`enhance`/`templates`/`config`/`css/*`) for the future 11ty
    site. Masthead branding comes from the consumer's `grid.config.json`
    (GRID defaults preserved). The invite app is a MIRROR, not a dependency
    — it is self-contained by design (zero deps, strict CSP); token/brand
    changes flow to it as reviewed PRs. No GitHub App anywhere: consumption
    is plain package management; future live Canvas publishing would be a
    Canvas API question, not a GitHub one.

17. **Zero-tables policy + data-list component** (2026-06-12, v1.1.0) — no
    `<table>` element in authored markdown, ever. Corpus evidence: all 13
    export-era table blobs are either layout abuse (→ callouts, cards,
    galleries) or key-value data (→ the new `::: data-list`, rendered as a
    semantic `<dl>` with flex rows — the original div-row nesting was
    unwrapped by Canvas's stricter-than-spec dl content model, probes
    2026-07-06; markup fixed by decision 19). The course schedule
    converts to per-week structure. Escape hatch: a real table treatment
    may be designed ONLY when genuine 3+-column record data shows up in
    content — zero exists today, so none is built.

18. **Lucide content-icon system, SVG source → Canvas PNG** (2026-07-04) —
    the five content-icon tiles drop their Unicode glyphs (`▶ ↗ ✓ ! i`) for
    Lucide icons from a single registry (`pipeline/icons.js`): play
    (filled, 22px), arrow-up-right (20px), check (stroke 2.25, 20px),
    triangle-alert (16px), info (16px) — mapping, sizes, and colors fixed
    by the design owner (external handoff, implemented verbatim). Warning
    upgrades `!` → triangle-alert and note `i` → info deliberately. Web/PDF
    render inline `<svg class="gi">` with `currentColor`; Canvas gets
    transparent PNGs (`docs/icons/generated/<use>@3x.png`, committed like
    the favicons so Pages hosts them), colors resolved from the light
    `grid-tokens.css` at build time (`pnpm run build:icons`, deterministic,
    auto-runs before `pnpm run canvas`). PNG base URL defaults to the Pages
    site, overridable via `iconBase` in a consumer's `grid.config.json`.
    New dep: `@resvg/resvg-js` (dev-only rasterizer, prebuilt binaries, no
    install scripts). Tile geometry, tokens, and contrast pairs unchanged;
    tiles now center via inline-flex. Brand icons and dashboard-app icons
    explicitly out of scope (Phase 2). Paste-test verified 2026-07-06.

19. **data-list emits strict-conformant dl** (2026-07-06) — after the dl
    probe (results below) proved Canvas keeps dl/dt/dd only as direct
    parent/child, the design owner chose fix (a): `enhance.js` emits
    `<dt><span class="data-key">…</span></dt><dd>…</dd>` as DIRECT
    children of the dl — no wrapper div (HTML5-legal, but Canvas unwraps
    it). Rows are CSS-only: the dl is flex + wrap + baseline, dt is
    `flex: 0 0 6.5rem`, dd is `flex: 1 1 70%` — the dd fills the rest of
    its line, forcing the next dt to wrap, so each pair reads as a row.
    The key chip moved from the dt itself to an inner `.data-key` span
    (the dt now carries structural padding + border-bottom, which a pill
    background can't). Every primitive is probe-verified (flex shorthand,
    wrap, borders, spans; `:last-of-type` inlines statically via juice).
    Same markup for ALL targets — no Canvas-only divergence. Visual result
    is identical to the v1.1.0 design in light and dark. Known limit: keys
    wider than ~6.5rem overflow into the dd padding — keys are short by
    design (`- **key** — value`).

20. **Weighted spans use the `font:` shorthand** (2026-07-06) — Canvas
    strips the `font-weight` longhand but keeps the `font:` shorthand
    (expanded to longhands on save, weight included — probe #2 below), so
    the design owner chose the shorthand fix: every Canvas-visible
    weighted rule (`wordmark`, `module-label`, h2/h3/h4, `video-title`,
    `objectives-kicker`, `link-body a`, `est-chip` + its strong,
    `checkpoint-title`, `callout-title`, `data-key`) declares
    `font: <weight> <size>/<line-height> <family>` with all three
    components explicit (the shorthand resets omitted longhands, so
    size/family/line-height can never be left to inheritance). Deliberate
    exceptions: `.content strong` keeps `font-weight: 680` (shorthand
    would force a size onto an element that must inherit it; Canvas falls
    back to the element-default bold 700 — acceptable), `h1.page-title`
    (760, preview-only, clamp() size) and `li::marker`/print rules
    (preview/print-only). The wordmark keeps a `font-size` longhand
    fallback before its shorthand (750 was unprobed at the time).
    Paste-confirmed same day, all weights including 750 — probe #3 below.

## Probe results — specimen paste tests, 2026-06-12 (verified via saved DOM)

STRIPPED by Canvas: `aspect-ratio`, `object-fit`, **negative margins**,
**`opacity`**, **`box-shadow`**, **`letter-spacing`** (plus the previously
known `text-transform`). SURVIVES: `display:flex`, `gap`, `border-radius`,
borders, `linear-gradient`, hsl colors **including alpha**, `overflow`.
`data-class` (44/44) and `inline_disabled` (no duplicate auto-player)
confirmed working.

Consequences applied:

- **Video thumbnail**: every CSS crop technique is strippable, so the crop
  moved to build time — `enhance.js` HEAD-checks YouTube's true-16:9
  `maxresdefault.jpg` per video and falls back to `hqdefault` (adding
  `.letterboxed`, whose negative-margin crop works in preview/print; Canvas
  shows that fallback's bars). Offline builds fall back the same way.
- **Dim brand-mark dots**: `opacity: 0.42` → `background:
hsl(var(--accent-ink) / 0.42)` — alpha colors survive where opacity
  doesn't.
- **Shadows and tracking**: box-shadow and letter-spacing are now known
  preview-only garnish. The wordmark/kicker tracking flattens in Canvas;
  accepted — nothing structural depends on it.

## Probe results — specimen paste test, 2026-07-06

Verified via saved DOM: `specimen/speciment-canvas-test.html`.

- **Content-icon PNG swaps: PASS.** All five
  `<img src="…icons/generated/<use>@3x.png">` survive save-and-reopen with
  `src`, `alt=""`, `width`/`height`, and `display:block` intact; zero
  `<svg>` in the saved DOM. The icon system (decision 18) is verified
  end-to-end.
- **Alpha-background dim dots: PASS.** The three `.dim` mark dots keep
  `background: hsl(0 0% 100% / 0.42)` — the 2026-06-12 fix is confirmed.
- **data-list as shipped: FAIL.** The dt/dd tags were unwrapped and their
  text merged with no separation (".htmlHTML document, the page itself");
  the styled `.data-row` divs survived. Root cause identified by the
  targeted follow-up probe below — the v1.1.0 `::: data-list` component is
  broken in Canvas output as shipped and must not be used in Canvas-bound
  content until the fix lands.

## Probe results — targeted dl probe, 2026-07-06

Five cases, verified via saved DOM: `tmp/dl-probe/dl-probe-save.html`.

Canvas does NOT strip definition lists — the official allowlist is
accurate. The sanitizer enforces a **strict dl content model** (stricter
than the HTML5 spec, which permits a div grouping wrapper inside dl):

- Plain `<dl><dt><dd>` (dt/dd direct children): **INTACT**, inline
  styles and `data-class` attributes included.
- v1.1.0 markup (dt/dd inside `div.data-row` inside dl — HTML5-legal but
  rejected by Canvas): **UNWRAPPED**, tags removed.
- dt/dd with no `<dl>` ancestor: **UNWRAPPED**.
- Div/span fallback with identical styling: **INTACT**.

Two viable fixes were identified: (a) emit dt/dd as direct dl children
with CSS-only rows, or (b) rename dl/dt/dd → div/span in the Canvas build
post-inlining. The design owner chose (a) — see decision 19.

## Probe results — specimen paste test #2, 2026-07-06

Verified via saved DOM (second save of `specimen/speciment-canvas-test.html`),
pasted after the decision-19 data-list fix.

- **decision-19 data-list: PASS.** The assembled component survives:
  `<dl>` with flex-wrap styles, all four dt/dd pairs as direct children
  with their flex/padding/border styles, `.data-key` chip spans styled,
  `:last-of-type` border removal intact.
- **NEW: `font-weight` (longhand) is STRIPPED.** The sent fragment
  carried 21 `font-weight` declarations (600/700/750/800); exactly one
  survived — the term chip, the only element styled with the `font:`
  shorthand, which Canvas expands to longhands and keeps. Every other
  bold label (callout/checkpoint titles, video/link titles, wordmark
  size spans, est-chip, data-key) flattens to normal weight in Canvas.
  Retro-check: the same stripping is visible in the first 2026-07-06
  specimen save — this has been true all along, unnoticed because weight
  loss is subtle at small mono sizes. `<b>` is rewritten to `<strong>`
  (bold survives as markup). Remediation is a design decision: move
  weighted span styles to the `font:` shorthand (verified survivor),
  wrap labels in `<strong>`, or accept the flattening per label.

## Probe results — specimen paste test #3, 2026-07-06

Verified via saved DOM (third save of `specimen/speciment-canvas-test.html`),
pasted after the decision-20 shorthand conversion.

- **decision-20 `font:` shorthand: PASS, all weights.** Every shorthand
  survived, expanded by Canvas into longhands with the weight kept:
  600 ×9, 700 ×9 (normalized to the keyword `bold`), **750** (the
  wordmark — the nonstandard numeric weight survives too), 800 ×3.
  Line-heights and families intact. The deliberate `.content strong`
  `font-weight: 680` longhand was stripped as expected (element-default
  bold applies). The wordmark's `font-size` longhand fallback proved
  unnecessary but is harmless — kept.

## Runbooks folder, 2026-07-06

Added tracked `runbooks/` for executable probe/verification procedures:
move-by-move plans with an expected observation per step, stop conditions
(sandbox-only, human-eyes steps named), and a verification section. First
entry: `runbooks/probe-youtube-iframe.md`, which settles the open YouTube
`<iframe>` question below when run. Rationale: probe methodology lived
only in CANVAS-NOTES.md §6 prose; a runbook makes each probe repeatable
and blind-executable. Note `reports/` and `tmp/` stay gitignored —
runbooks are procedures (public, reusable), not session artifacts.

## Probe results — YouTube iframe paste test, 2026-07-06

Ran `runbooks/probe-youtube-iframe.md`. Sent a standard YouTube embed
iframe (`tmp/probe-iframe.html`) into a **sandbox** Canvas page's HTML
editor, saved, reopened the editor, and diffed sent vs survived.

**Route A — survives intact.** The iframe was kept, with only cosmetic
normalization; no Canvas media wrapper (`data-media`/`instructure` did not
fire). Survived line verbatim:

```html
<p>
  <iframe
    title="Probe: YouTube embed survival"
    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
    width="560"
    height="315"
    loading="lazy"
    allowfullscreen="allowfullscreen"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  ></iframe>
</p>
```

Diff from sent: Canvas added `loading="lazy"`, expanded bare
`allowfullscreen` to `allowfullscreen="allowfullscreen"`, reordered
attributes, and wrapped the iframe in a `<p>`. The meaningful attributes
(`src`, `title`, `width`/`height`, `allow`, `allowfullscreen`) all
survived. Instructor confirmed the embed renders and plays on the live
sandbox page.

**Meaning for the video option-C opt-in:** a pasted YouTube iframe is a
viable embed path — a future, separate change may propose the authoring
construct per the new-construct checklist. Paste-vs-imscc-import parity is
still untested; do not assume it.

## Accent v2 — Indigo primary + Amber highlight, 2026-07-07

Primary accent switched blue → **Indigo-Violet** (`--accent: 256 60% 56%`,
light) to echo the brand mark; `--link`, `--accent-soft*`, `--focus`, and
`--glow` retuned to the indigo hue. Dark scopes updated in lockstep (both
the `prefers-color-scheme` block and the `[data-mode="dark"]` block — the
two dark blocks this repo keeps in sync).

New secondary **Amber** accent added as `--accent-2*` (`--accent-2`,
`--accent-2-ink`, `--accent-2-soft`, `--accent-2-soft-ink`,
`--accent-2-line`), **HIGHLIGHT ONLY** — labels and prose highlights,
never a primary button, link, or focus ring. The guardrail is structural:
**no white-on-amber token exists**, so a compliant amber primary cannot be
assembled from the system. Shipped two utilities in `grid-components.css`:
`.hl` (prose highlight, amber wash behind ink text) and `.tag` (uppercase
mono label pill).

Surfaces, ink, `ok`, and `danger` unchanged. All new pairings verified
≥ AA (see CONTRAST.md, regenerated this turn). LOCKED token values; this
entry authorizes them.

## Amber highlight variants — highlighter + soft pill, 2026-07-07

The amber highlight family gained a second prose weight and an explicit
name for the first. `.hl` now also answers to **`.hl-highlighter`** (same
amber wash behind ink text — the loud, full-swash emphasis); `.hl` remains
the shorthand so existing authored content is unaffected.

New **`.hl-pill`** is a _soft pill_ inline highlight: rounded,
`--accent-2-soft` tint with `--accent-2-soft-ink` deep-amber ink — the
same pairing `.tag` uses — but flowing as prose rather than an uppercase
label. It is the quieter of the two: use it to tint a value or term; use
the highlighter (`.hl` / `.hl-highlighter`) for the loudest in-sentence
emphasis. No tokens changed — both variants reuse existing `--accent-2*`
values, so light and dark inherit automatically and the
amber-as-highlight-only guardrail is untouched.

## Token values are mirrored in four places, 2026-07-07

Surfaced during the Accent v2 change: editing `css/grid-tokens.css` is not a
single-file edit. The same token values are duplicated by hand in **four**
spots, none of which the CSS updates automatically:

1. `grid-tokens.css` light `:root` — the source of truth.
2. `grid-tokens.css` dark block #1 — `@media (prefers-color-scheme: dark)`.
3. `grid-tokens.css` dark block #2 — `:root[data-mode="dark"]` (identical to #1).
4. `scripts/contrast.js` — hardcoded `light`/`dark` triplet objects. Its
   generated CONTRAST.md header says the values come from `grid-tokens.css`,
   but the script never reads the CSS. Left unsynced it silently reports the
   OLD ratios (this is exactly what happened mid-change and was caught).
5. `pipeline/icons.js` `INK_LITERALS` — a light-`:root` hex mirror used as the
   rasterizer fallback. `build-icons.js` reads the real CSS, so shipped PNGs
   are correct; the fallback still goes stale.

Decision (superseded same day — see below): originally we kept the mirrors and
just documented the coupling. Revisited immediately and removed the footgun
instead.

## Single token source — pipeline/tokens.js, 2026-07-07

Killed the four-place coupling above. New `pipeline/tokens.js` is the ONLY
reader of `css/grid-tokens.css`; it parses the light `:root` and both dark
scopes and exposes `readTokenBlocks()` / `tripletsOf()` / `hslStringToHex()`.

- `scripts/contrast.js` no longer hardcodes triplets — it derives `light`/
  `dark` from `readTokenBlocks()`, so CONTRAST.md can never again report stale
  ratios (its header claim "from css/grid-tokens.css" is now true).
- `pipeline/build-icons.js` and `pipeline/icons.js` drop their inline parser
  and the `INK_LITERALS` hex table; the rasterizer defaults its ink colors
  from `tokens.js`.
- Bonus guard: `readTokenBlocks()` **throws** if the two dark blocks drift, so
  the "keep them in sync" rule is now mechanically enforced, not just a comment.

Behavior-preserving: regenerating CONTRAST.md and the PNGs after the refactor
produced byte-identical output (empty git diff). Remaining hand-sync surface is
just the two dark blocks inside `grid-tokens.css` — and even those are now
guarded.

## Raw-HTML prose guard (warn-only) — 2026-07-07

Prompted by a cross-repo handoff from idmx-225 (a consumer): a bare `<iframe>`
typed in prose passed through `html: true` as a real element, and because
`<iframe>` has a raw-text content model with no close tag, it swallowed the
rest of the document. `<video>`/`<audio>`/`<style>` do the same; ordinary tags
(`<section>`, `<h2>`) silently vanish. The consumer found 60 such lines across
19 files (Canvas-export debt) once a strict-enough renderer (ours) exposed it.

Decision: add a **warn-only** guard in `pipeline/markdown.js` (`lintRawHtml`,
run inside `renderPage`, so every consumer inherits it via the shared
contract). Chosen over the handoff's other options:

- **Layer:** the markdown-it **token stream**, not a post-render regex. Raw
  HTML the author typed is `html_block`/`html_inline`; our own constructs
  (container divs, bracketed spans, attrs, wikilinks) are other token types —
  so the guard separates "author typed a tag" from "our plugin emitted one"
  with no allowlist needed for the intentional constructs.
- **Allowlist = the authoring contract:** a small set of hand-writable inline
  tags (`kbd`, `span`, `br`, `sub`/`sup`, `abbr`, `b`/`i`/`em`/`strong`, …);
  `iframe` allowed ONLY with a YouTube `src` (the one blessed embed). Anything
  else warns `file:line` to stderr.
- **Warn, not escape.** Escaping non-allowlisted raw HTML changes output for
  any page relying on passthrough → a breaking (minor/major) bump and probe
  re-pin coordination. Warn-only is additive: no output change (verified — the
  specimen builds byte-identically), no throw. Escaping stays a future,
  separate decision once warnings are quiet across consumers.

We already ship `cheerio` (→ `parse5`/`htmlparser2`) and `enhance.js` parses
the full page every build, so the handoff's "well-formedness assert" option is
cheap and remains available as a later belt-and-suspenders pass; the
token-layer check catches the actual failure mode more precisely. Fixture:
`pipeline/raw-html-guard.fixture.md` (no test runner here — verify by running
`lintRawHtml` on it).

Two things the first run surfaced: (1) `matter()` strips frontmatter, so token
lines needed a `lineOffset` to point back at the original file — `renderPage`
computes it. (2) The guard immediately caught a real raw `<div class=
"icon-grid">` — the docs-site icon gallery in `docs/index.md`, which is
intentional bespoke HTML. Blessed via `ALLOWED_RAW_BLOCKS` (keyed by class), so
genuinely-authored raw blocks are permitted while stray prose tags still warn.

## Typographic voice — self-hosted OFL fonts, 2026-07-07

Replaced the `system-ui`-only stack with three self-hosted SIL OFL 1.1
webfonts, from a Claude Design changeset (revised — see below):

- `--font-display` → **Schibsted Grotesk** (variable) — headings, title cards.
- `--font-sans` → **Hanken Grotesk** (variable) — body, UI, captions.
- `--font-mono` → **Space Mono** (static R/B) — chips, kickers, code, filenames.

Faces in `css/grid-fonts.css`; binaries in `/fonts/` (woff2 primary + ttf
fallback); `--font-*` and `--weight-*` tokens added to `grid-tokens.css`.
Every stack keeps system fallbacks.

**Why the delivered changeset was revised, not applied.** It was built against
a pre-Accent-v2 `main`: its full-file `grid-tokens.css` reverted the indigo +
amber system (old blue `230 76% 52%`, no `--accent-2*`). We integrated the font
tokens surgically onto current `main` instead — LOCKED color/dark values
untouched. Its Canvas plan (base64-inline the ttf) rests on a false premise and
was dropped (see below). Its heading patch didn't apply (our file moved for
amber); heading edits redone by hand.

**Canvas gets system fallback, by design.** `@font-face` cannot survive Canvas
(at-rule, not inlinable; `<style>` stripped; `juice removeStyleTags`). No base64
inliner — it can't work. The heading `font:` shorthand still carries weight into
Canvas (decision-20); only the family falls back. Recorded in CANVAS-NOTES.md.

**woff2.** Converted the ttf to woff2 (Brotli; installed `brotli` as a
build-time tool — outputs ship, tool does not). ~61% smaller (506 KB → 198 KB).
`@font-face` lists woff2 first, ttf fallback. Browser-verified loading woff2.

**Heading recalibration.** For Schibsted's heavier cut, `.content h2` weight
**800 → 700** (and tracking/line-height polish per the design owner). This
changes the documented heading-scale standard — HANDOFF.md updated in step.
Contrast unaffected (colors unchanged; `pnpm run contrast` still 0 failures).

**`url()` path.** `../fonts/` resolves for local preview and package consumers.
The deployed Pages site serves `docs/` as web root, so that relative path would
escape it and 404. Site wiring (2026-07-11): `pnpm run site` now runs
`pipeline/site-build.js`, which builds `docs/index.html`, copies the specimen
pages (including `specimen.webpage.html`, the semantic full-page preview),
copies `/fonts` → `docs/fonts/` (binaries + OFL licenses), and rewrites the
inlined `url("../fonts/")` → `url("fonts/")` in every `docs/*.html`. Chosen
over emitting a special CSS build: the rewrite is a mechanical, verifiable
post-step and the source CSS stays single-form. Browser-verified over HTTP.

**Downstream objective:** grid-video-studio is a vendoring consumer (copies
`grid-tokens.css`, currently stale v1.1.0) that uses `--font-sans`/`--font-mono`
in video output and loads no fonts yet. Since video rendering supports
`@font-face`, adopting these fonts there (re-vendor tokens + wire font loading)
is a tracked follow-up in that repo. Scope + plan: reports/ "GRID typographic
voice". Ships as **v1.5.0**.

## Video light-ground tokens — card marker + soft-tint ink roles, 2026-07-11

Added three additive color tokens for the Phase 6c video light-ground direction
(videos moved off the dark cinematic background onto the dashboard's pale
ground), from a Claude Design handoff (tmp/2026-july-11/video-lightground-handoff):

- **`--card-line`** (light `222 22% 32%`) — a general design-system token: a dark
  border that marks card-ness on the white surface. Reused by the video `Card`
  primitive, code panels, and split-compare shells; available to any card in the
  system. Border role only — never text or fill. (Design explored ink-hairline /
  70%-ink / indigo-tinted; 70%-ink chosen.)
- **`--ok-soft-ink`** (light `150 60% 22%`) — dark green text role on `--ok-soft`.
- **`--danger-soft-ink`** (light `358 65% 34%`) — dark red text role on `--danger-soft`.

The soft-tint ink roles complete the pattern `--accent-soft-ink` already set, so
compare panels carry **dark text on pastel tints** (never light-on-pastel).

No existing token changed; the amber highlight-only guardrail is untouched (no
white-on-amber token added). Dark-scope values are provisional — the videos are
light-only (`data-mode="light"` forced) and never render them; they exist for set
coherence and to keep the dark blocks complete. All new pairings verified ≥ AA by
`pnpm run contrast` (24 pairs now): card-line/surface 8.79 (3:1 border rule),
ok-soft-ink/ok-soft 7.36, danger-soft-ink/danger-soft 7.75 — matching the design
handoff's computed values exactly. Ships as **v1.6.0**; grid-video-studio bumps
its dependency after the release (its Phase 6c implementation is gated on it).

## Still open

- YouTube `<iframe>` embed via **imscc import** — paste path verified
  2026-07-06 (survives, Route A); import parity untested.
