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
    semantic `<dl>` with flex rows — dl/dt/dd are on Canvas's official
    allowlist; empirical probe pending). The course schedule converts to
    per-week structure. Escape hatch: a real table treatment may be
    designed ONLY when genuine 3+-column record data shows up in content —
    zero exists today, so none is built.

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
    explicitly out of scope (Phase 2). Paste test pending (see Still open).

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

## Still open

- a YouTube `<iframe>` embed (for the option-C opt-in)
- alpha-background dim dots (fix shipped 2026-06-12; confirm on next paste)
- dl/dt/dd elements and the data-list flex rows (new in v1.1.0)
- content-icon PNG `<img>` swaps surviving a real Canvas paste (new
  2026-07-04; URLs 404 until the commit is pushed and Pages deploys)
