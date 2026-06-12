# Decision log — GRID design system

Each entry: the decision, the source, one-line rationale. The Claude Design
options canvas (canvas-template-test/calude-design/grid-brand) proposed
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
