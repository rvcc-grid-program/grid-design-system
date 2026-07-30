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

## Reading measure on text, wrapper as container cap — 2026-07-27

From an idmx-225 handoff (`handoff/canvas-styling-corrections.md`): a shipped
Canvas page read too narrow, and a `::: data-list` with sentence-length keys
rendered as tall stacks of centred monospace text with gaps beside them.

**New token `--measure: 54ch`** (light `:root` only, after `--r-pill`). Tokens
are locked, so this entry is the authorization. `--measure` is a length, so no
contrast pair changes; the dark blocks carry colors and shadows only, exactly
like `--r-*` and `--font-*`, so `readTokenBlocks()`'s drift guard is not
involved.

**The 720px wrapper was the reading measure implemented on the wrong element.**
Measured on the live Canvas page by counting characters per rendered line box:
720px wrapper → 666px paragraph → 71–75 characters (textbook); 900px → 846px →
88–95 characters, past the 80-character ceiling in WCAG 1.4.8 (AAA); 1200px →
1146px → 133 characters. So the width complaint could not be answered by
changing one number. The measure moved onto the seven text rules that hold prose
(`.content h2/h3/h4/p/li`, `.intro`, `.footnote`) and both wrappers became
container caps at 900px — `.shell` (preview) and `.page-wrap` (the Canvas
wrapper grid-canvas inlines). Changing only one of those two is the trap.

**Units, because they produced a wrong conclusion once:** `ch` is the advance
width of `0`, roughly 1.3× the average character, so a 70ch line carries ~92
characters — far more than the accessibility target counts. `.intro`'s existing
`max-width: 52ch` was the one place in the repo already in the right
neighbourhood, and the token replaced it. **The 54ch shipped here was still too
loose; corrected to 50ch in v1.7.1 below — read that before touching the
value.**

The measure is deliberately NOT applied per component. `.objectives p`,
`.checkpoint-body p` and `.callout-body p` declare no `max-width` and so inherit
from `.content p`; adding rules for them is redundant. It is NOT applied to
`.link-row` and children, `.video-meta`, or `.video-text` — flex children that
rely on `flex-grow` to define their row, which a `max-width` removes. `.est-chip`
is a chip, not prose. `blockquote` has no rule in this repo and the consumer
corpus contains zero blockquotes; skipped.

**data-list restacked.** The fixed key column is gone: every `dt` and `dd` takes
`flex: 1 1 100%`, so keys sit above values at any length. `align-items: baseline`
is removed (nothing to align one-per-row, and it produced the
value-aligned-to-the-key's-last-line gaps in the report); the border moves to the
`dd` only, so the rule sits under each value instead of drawing a stub under each
key; the `dd`'s `padding-left` goes; the chip drops `min-width: 5.5rem` and
`text-align: center`, which had forced a chip wider than short keys like `.css`.
The rejected alternative was an auto-width `dt` — it renders wrong, because the
old rows depended on the `dd` growing to fill its line to force the next `dt` to
wrap, and the measure on the `dd` removes that growth (observed: key 1 alone on
row 1, then value 1 sharing row 2 with key 2). The 100% basis on both is what
makes the chosen version safe. CSS grid would also solve it, but `display: grid`
is on neither list in CANVAS-NOTES.md; the stacked version needs only
paste-verified properties. Accepted, consumer-approved costs: short-key lists
take two lines each and lose the two-column scan, and the separator spans the
measure (~650px) rather than the plate's full width.

**Content images capped at `min(100%, 720px)`.** An editorial ceiling, not a
repair — nothing was upscaling (`max-width` only shrinks and the emitted `<img>`
carries no `width`). A bare `720px` is wrong: `max-width` alone does not shrink
an image into a narrower container, and a Canvas description measures 691px at a
~1075px column, so a 3416px screenshot would overflow. 720px is a judgement
against the consumer's 53 raster images (min 53px, p25 860px, median 1166px, p75
1848px, max 3416px — retina captures with pixels to spare). Callout/checkpoint
icons carry `width="16"` and inline style, so the cap cannot reach them.

**The key chip moves from mono to sans.** `.data-key` keeps its tint, radius,
padding, size and weight, and only swaps `--font-mono` → `--font-sans`. The
stacked layout is what made sentence-length keys possible, and a sentence set in
monospace reads as literal text to be typed rather than as a label — mono's job
in this system is to mark something as code (`.wikilink`, `.est-chip`, `.tag`,
`code`, filenames), and a sentence is not code. Prompted by `fi` looking crowded
in "filename" at chip size: Space Mono draws the `f`'s hook into the following
`i`'s tittle, measurably (ascender-band ink gap at 64px: `fi` 10px vs `ni` 14,
`ti` 12, `ri` 11, `li` 21). That is glyph design, **not a ligature** —
`font-variant-ligatures: none` renders pixel-identically, so no CSS lever exists,
and it would have been invisible to students anyway (Canvas drops `@font-face`,
so the fragment falls back to Menlo/Consolas). The crowding was the symptom; mono
on prose was the defect. No contrast pair changes — the
`accent-soft-ink`/`accent-soft` pairing is untouched.

**Two deviations from the handoff, both found by measuring the built specimen in
a browser rather than reading the CSS:**

1. **`.video-poster img` opts out of the image cap** (`max-width: 100%`). It sets
   `width: 100%` and declared no `max-width`, so the new `.content img` ceiling
   clamped the poster to 720px inside an 846px card and left a gutter down the
   right of every video plate. The poster is full-bleed card chrome, not a
   content image — the same category as the `width="16"` callout icons the
   handoff already carved out, which it simply did not enumerate.
2. **Image-only paragraphs get `.figure`** (`enhance.js` step 5) and
   `.content p.figure { max-width: none }`. Markdown wraps a standalone image in
   a `<p>`, and Phase 3 put the measure on `.content p` — so the measure, not
   720px, was the effective image cap (measured: a 1280px image rendered 484px
   at the preview's 16px root). Phase 5 was unreachable as specified. A class
   rather than `:has()`, because `:has()` is on neither list in CANVAS-NOTES.md
   while the inliner resolves a class to a plain `max-width: none` on both
   targets (verified in `specimen.canvas.html`). This adds the one authoring-table
   row and DOM contract the handoff did not scope; authors change nothing.

The specimen gained a **long-key data-list case** — it previously exercised the
component only with short extensions, which is why this defect shipped unnoticed —
and an **oversized content image** (1280px), because the specimen contained no
plain content image at all, leaving the new cap untested by the regression test.

**Paste-tested 2026-07-27, before the tag** (verdict table in CANVAS-NOTES.md
§6). Every declaration this release depends on survives the sanitizer verbatim —
`min(100%, 720px)`, `max-width: 900px`, `54ch` (42 occurrences), `max-width: none`
on `.figure`, the poster's `100%` opt-out, and `flex: 1 1 100%` on all 14 dt/dd,
still alternating as direct `dl` children. **The `max-width: 85%` fallback was
never needed** — a stripped `min()` was the gating risk, since it would have left
images with no cap at all. One thing the saved-DOM method cannot settle stays
open: whether `54ch` *resolves* to the same pixel width in Canvas, which drops
`@font-face` and falls back to `system-ui`. Survival is proven; resolution parity
still rests on a single macOS measurement (12.04px `0` advance on both surfaces),
so it wants a Windows check. Fallback if it ever diverges: bake to ~650px. Ships
as **v1.7.0**.

## Measure calibrated to 50ch — 2026-07-27

`--measure: 54ch` → **`50ch`**. One token value; nothing else changes. From an
idmx-225 addendum (`handoff/addendum-01-measure-calibration.md`) written after
test-shipping v1.7.0 to sandbox course 3872257 — import migration clean, all nine
structural probes surviving, and **both original defects confirmed fixed**: the
wrapper renders 948px as predicted, the data-list is stacked with unambiguous
pairing (`dt` 846px, `dd` 674px), and three content images of intrinsic width
1546/1502/2000px all render at 722px (720 + border) with no overflow. The
`.content p.figure { max-width: none }` addition made here was confirmed
necessary — without it the paragraph's measure would have clamped images to 674px
before the 720px ceiling could bind.

**Why 54ch was wrong.** Counting characters per rendered line box across 27 lines
of real prose on the shipped page: min 52, **median 74, max 83**, with 10 of 27
lines over 75 and one past the 80-character WCAG 1.4.8 (AAA) ceiling this change
set out to respect. Not one outlier — the top quartile genuinely ran 76–83. 50ch
computes to ~624px for a median of ~69 and a max of ~77, inside the 65–75 band
with headroom. (49ch would satisfy 65–75 strictly on every line; 50ch was chosen
because 76–77 is ordinary typographic tolerance.)

**Do not recompute this from a font metric — this is the trap that produced the
bad value.** 54ch came from a probe measuring the `0` advance at 12.041px and
expecting ~650px. The rule actually computed **674.291px**, implying 12.487px per
`ch`; a probe span placed *inside* those same paragraphs on the shipped Canvas
page still reported 12.041px. `getComputedStyle().maxWidth` and a rendered-text
probe disagree about what a `ch` is **on the same element** — presumably a
webfont-fallback timing artifact in when the `ch` was resolved. The acceptance
criterion says count characters per rendered line box precisely because
arithmetic here is untrustworthy, and counting is what caught it.

**Verification gotcha, recorded for the next person:** Canvas adds
`loading="lazy"` to content images. Measured immediately after load they report
`naturalWidth: 0` and a rendered width of 2px — the border box of an unloaded
image, which reads exactly like a broken image. Scroll them into view, wait, then
measure.

No `CANVAS-NOTES.md` change: no new sanitizer behaviour. No contrast change: a
length token touches no pair. Ships as **v1.7.1** (patch).

## data-list separator tolerance, pinned by a test — 2026-07-29

**The decision:** the separator between a data-list key and its value is
author-facing sugar, not syntax anyone reads. `**key**` becomes the `<dt>`;
one optional leading em dash, en dash, hyphen, or colon is consumed off the
value and never renders. The pipeline accepts all four (and none) rather than
policing one, so a human writing the natural `- **key** - value` gets output
byte-identical to the machine-written `- **key** — value`.

The behavior already shipped — `enhance.js` has stripped
`/^\s*(—|–|-|:)?\s*/` since the v1.1.0 component. What changed is that it is
now *documented* (the `HANDOFF.md` authoring row said em dash only, so a
consumer reading the contract strictly believed the hyphen was unsupported)
and *pinned*. Raised by idmx-225, the first consumer, whose data-list items
move from machine-written to human-authored this term
(`handoff/data-list-separator-tolerance.md`).

**Why a test and not just prose.** An undocumented tolerance is an
implementation detail, and a refactor tightening that regex would break
consumer pages with nothing failing. `tests/data-list-separator.test.js`
renders a data-list through `md` + `enhance` with all four separators plus a
no-separator item and asserts every `<dd>` starts at the value; it also pins
that only ONE separator is consumed (a value legitimately opening with a dash
keeps it) and that dt/dd stay direct children of the dl (decision 19).
Mutation-checked: tightening the group to `(—)?` fails the suite.

**No output change and no new dependency.** The optional group stays optional
(consumer pages already have items whose value begins right after the bold
key), the `<dl>` structure and `.data-key` chip are untouched, and no paste
test is needed — nothing about the emitted HTML moved.

**This repo now has a test runner:** `pnpm test` → `node --test tests/*.test.js`,
Node's built-in, zero dependencies added. It joins the verification loop as
step 2 in `README.md`, `CLAUDE.md`, and this file. The pre-existing
`pipeline/raw-html-guard.fixture.md` stays a manual fixture for now; folding it
into `tests/` is a later, separate cleanup.

No `CANVAS-NOTES.md` change and no paste test: the emitted HTML is unchanged,
so no sanitizer behaviour is in play. No contrast change. Ships as **v1.7.2**
(patch) — documentation and a test pin only, no consumer-visible output
difference; idmx-225 bumps its pinned tag to pick up the documented contract.

## Labeled wikilinks are sans, bare wikilinks stay mono — 2026-07-30

`[[slug|Label]]` has worked in `pipeline/markdown.js` since the inline rule was
written, but it was never documented and emitted the same `class="wikilink"` as
a bare slug. idmx-225 reached for it while converting a Quick Links block to
`::: data-list` and got a monospace pill reading "Welcome to the Class" that
wrapped mid-pill, each half carrying its own border.

**The wrapping was the symptom; mono on prose was the defect** — the same defect
`.data-key` had (decision above, 2026-07-27), arriving through a different door.
Mono's job in this system is to mark something as code, and a sentence is not
code. A bare `[[slug]]` genuinely IS literal text — it's the raw slug, the thing
an author would type — so it keeps the mono chip. An aliased label is the
author's prose and gets `--font-sans` at `1em`.

CSS cannot separate the two cases (same class, same element), so the
distinction is emitted in the pipeline: the alias form now adds a
`wikilink-labeled` modifier. Everything else about the chip — tint, border,
radius, padding, the `accent-soft-ink`/`accent-soft` pairing — is untouched, so
**no contrast pair changes**.

**`overflow-wrap: normal` on the labeled rule** undoes the `anywhere` the base
`a` rule sets. That `anywhere` is there for bare URLs, and every wikilink
inherited it by accident; a prose label should break at spaces if it must, never
mid-word.

**Rejected: `white-space: nowrap` to make the pill atomic.** It converts "breaks
awkwardly" into "cannot break at all," so a long label overflows a narrow Canvas
column instead — and it would make short labels an implicit authoring contract
enforced by nothing. Sans runs narrower than Space Mono, which dissolves most of
the original complaint on its own; the residual risk is documented as authoring
guidance in the HANDOFF.md row instead of enforced in CSS. If real pages still
wrap badly, revisit with a paste test first.

**Canvas: no paste test needed for this change, and one still owed.** Canvas
drops `@font-face` either way, so the labeled chip falls back to a system sans
and the bare chip to a system mono — the distinction survives, the specific
faces don't. `font-family` and `font-size` are already Canvas-verified.
`overflow-wrap` has no CANVAS-NOTES.md verdict in either direction; if the
sanitizer strips it, a labeled chip can still break mid-word there, which is the
pre-existing behavior and not a regression — so the improvement is
preview-and-site-certain, Canvas-partial. Logged as an open item below.

**Shipped ahead of that paste test, deliberately.** The gating question is
whether an already-broken chip stays broken in Canvas, not whether anything
regresses there, so the tag does not wait on it. idmx-225 owns the test and will
run it against this version as part of its own work; the verdict comes back here
as a dated CANVAS-NOTES.md entry. If `overflow-wrap` turns out to be stripped,
the fix is a follow-up patch, not a revert — the sans/mono correction stands on
its own regardless of the wrapping verdict.

Pinned by `tests/wikilink-labeled.test.js` (class contract, href/text split,
trimming, and the `[[slug|]]` empty-label fallback to the bare form — an empty
chip would be silent content loss). `specimen/specimen.md` gains an aliased
wikilink beside the bare one so the regression surface covers both.

Ships as **v1.8.0** (minor) — a new authoring construct is documented and the
emitted HTML for the alias form changes.

### Amended same day — the pill goes too (v1.8.1)

v1.8.0 was pinned in idmx-225 and **the chip still broke mid-pill**: "Welcome
to the / Class", each half carrying its own border and tint. Sans bought
margin, not a fix — exactly what the paragraph above predicted ("fits a line
more often"). *More often* was the operative phrase, and the only remaining
guard was an authoring instruction to keep labels short that nothing enforced.

**The reframe: a wrapping link is not a defect, a wrapping pill is.** An
ordinary link that breaks across two lines is unremarkable — plenty do, and
nobody notices. What made the labeled chip look damaged was the `background` +
`border` turning one line break into two visible fragments. The wrapping was
never the root cause. The pill was.

**So v1.8.0 went halfway on its own reasoning.** It decided a label is prose,
not code, then acted on that by changing only the font while keeping the tint,
border, radius, and padding. But a bordered tinted pill *is* code-chip styling
here — it is precisely what `.est-chip`, `.tag`, and the bare `.wikilink` use
to say "this is literal text." Changing mono→sans while keeping the chrome said
prose and code in the same breath. Finishing the thought: a labeled wikilink
looks like what it is, a link. Resets plus `color: hsl(var(--link))` and
`text-decoration: underline`. `a.wikilink:hover` is scoped to
`:not(.wikilink-labeled)` — there is no border left to recolor.

Bare `[[slug]]` is untouched. A raw slug IS literal text and correctly keeps
the mono pill.

**Also rejected, recorded so they stay rejected:** a dotted accent underline
marking internal links (prototyped, declined on the merits — whether a link
leaves the site is artificial to most readers; also `text-decoration-style` and
`-color` are unverified for Canvas and would need the shorthand, mirroring the
`font:` workaround for `font-weight`), and an icon cue (`::before`/`::after`
are impossible by nature in Canvas, so it would mean emitting a real character
from the pipeline — a much larger change for a cue nobody asked for). **Losing
the internal-vs-external cue is a deliberate human call, not an oversight; do
not reintroduce a cue to "fix" it.**

**This de-escalates the `overflow-wrap` open question** rather than adding one.
With no pill, `overflow-wrap` stops being load-bearing — it stays as a nicety,
and its failure mode is now invisible instead of visibly broken. The item stays
open below because it is still genuinely unverified, but it no longer blocks
closing this decision. **It also deletes an unenforceable authoring contract:**
"keep labels short" was guidance no checker could hold anyone to, and it would
have broken the first time someone linked a page with a long title.

CSS-only — no `markdown.js` change, no new class, no new construct, and
`tests/wikilink-labeled.test.js` is unaffected (it pins the class/href/text
contract, none of which moved). **No new contrast pair:** the labeled link
stops using `accent-soft-ink` on `accent-soft` and starts using the link color
on the card, already covered by the `["Links on content card", "link",
"surface"]` pair. Every property used is in the CANVAS-NOTES verified-survives
table, so no new Canvas risk.

Ships as **v1.8.1** (patch) — CSS only, no emitted HTML change, no construct
added. The rendered appearance of an existing construct does change visibly,
which argued for a minor; the human called it a patch.

## Still open

- YouTube `<iframe>` embed via **imscc import** — paste path verified
  2026-07-06 (survives, Route A); import parity untested.
- `overflow-wrap` / `white-space` through the Canvas sanitizer — no verdict in
  either direction. **No longer blocking:** v1.8.1 dropped the labeled-wikilink
  pill, so `overflow-wrap` is a nicety rather than load-bearing and nothing
  looks broken if it's stripped. Still worth settling before anyone reaches for
  `nowrap` on an inline chip, or relies on either property structurally.
