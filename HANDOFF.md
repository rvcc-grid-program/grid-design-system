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

| File                                      | Role                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| `css/grid-tokens.css`                     | LOCKED Console tokens, light + dark. Extend only with a DECISIONS.md entry.    |
| `css/grid-components.css`                 | Every component + base typography + `@media print`.                            |
| `specimen/specimen.md`                    | Exercises every component. THE regression test — rebuild after any CSS change. |
| `specimen/specimen.html` / `.canvas.html` | Built outputs (preview / Canvas fragment).                                     |
| `CONTRAST.md`                             | Generated AA verification (`pnpm run contrast`).                               |
| `DECISIONS.md`                            | Why things are the way they are.                                               |

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

| Component           | Author writes                                                                                                    | Pipeline produces                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Video block         | The existing thumbnail-link line: `[![Video](https://img.youtube.com/vi/ID/hqdefault.jpg)](https://youtu.be/ID)` | `.video-card` plate (poster + play tile + meta bar) — zero migration |
| Estimated time      | The existing bold line: `**Estimated time: 25-30 minutes.**`                                                     | `.est-chip` pill — zero migration                                    |
| Learning objectives | `::: objectives` around stem + list                                                                              | `.objectives` wrapper with kicker                                    |
| Warning callout     | `::: callout-warning` around text                                                                                | `.callout` with head row (! icon + WARNING)                          |
| Note callout        | `::: callout-note` around text                                                                                   | `.callout` with head row (i icon + NOTE)                             |
| Checkpoint          | `::: checkpoint` around text                                                                                     | `.checkpoint` row (✓ mark + CHECKPOINT label)                        |
| Featured link       | `::: link-row` around ONE markdown link                                                                          | row with ↗ tile, bold link, auto URL line                            |
| Other links         | plain markdown list                                                                                              | plain list (bullets get accent markers in preview)                   |
| Internal link       | `[[page-slug]]`                                                                                                  | `.wikilink` monospace chip                                           |
| Steps               | `### Steps` heading + ordered list                                                                               | styled ordered list                                                  |
| Code                | standard fenced block / inline backticks                                                                         | `.content pre` / inline `code` chip                                  |
| Keys                | `<kbd>Cmd</kbd>` (inline HTML)                                                                                   | keycap style                                                         |

Anything not in this table is plain typography. Do not invent new fenced-div
names without adding them here and to the CSS.

## DOM contracts (what the pipeline emits)

Structured containers are emitted by `markdown.js` — authors never write
this markup, but every consumer (future 11ty shortcodes included) must
reproduce it exactly.

```html
<!-- video block (enhance.js, from the thumbnail-link markdown) -->
<div class="video-card">
  <a class="video-poster" href="https://youtu.be/ID"><img src="…hqdefault.jpg" alt="…" /></a>
  <div class="video-meta">
    <span class="play-tile" aria-hidden="true">▶</span>
    <div class="video-text">
      <span class="video-kicker">Video · YouTube</span>
      <a class="video-title" href="https://youtu.be/ID">Watch on YouTube</a>
    </div>
  </div>
</div>

<!-- callout (markdown.js container render; -note variant swaps ico/label) -->
<div class="callout callout-warning">
  <div class="callout-head">
    <span class="callout-ico" aria-hidden="true">!</span>
    <span class="callout-title">Warning</span>
  </div>
  <div class="callout-body"><p>…</p></div>
</div>

<!-- checkpoint -->
<div class="checkpoint">
  <span class="checkpoint-mark" aria-hidden="true">✓</span>
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

<!-- featured link row (URL line added by enhance.js from the href) -->
<div class="link-row">
  <span class="link-ico" aria-hidden="true">↗</span>
  <div class="link-body">
    <p><a href="…">Label</a><span class="link-url">host/path</span></p>
  </div>
</div>

<!-- masthead (templates.js, from frontmatter title/module_title) -->
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
- **Shadows**: stripped in Canvas — only ever decorative; borders carry
  the structure everywhere.
- **Spacing is margin-based** by design: if flex were ever stripped, content
  still reads top-to-bottom. Flex appears only in rows (brand, video-meta,
  link-row, callout-head, checkpoint) where stacking is an acceptable
  degradation.

## Heading scale (the standard)

h2 = 1.625rem, weight 800, hairline rule below — THE section divider.
h3 = 1.25rem, weight 700. h4 = 1rem, weight 700. Section headings on all
pages standardize on h2 (the corpus cleanup pass normalizes weeks 1-3).
Body 1rem/1.6. Nothing below 0.875rem (14px).

## Verification loop

After any change: `pnpm run contrast` (must stay 0 failures), rebuild the
specimen both ways, eyeball the preview in light AND dark, paste the
specimen's `.canvas.html` into the Canvas sandbox page, reopen its HTML
editor, and diff — the probe list lives in DECISIONS.md.
