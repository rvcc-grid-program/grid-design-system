# Design brief — GRID course-content design system

A design session consumes this brief and produces a handoff package (spec at
the end). The system styles course content pages for the IDMX-225 course wiki
as they flow through an automated pipeline to three render targets, the
primary one being Canvas LMS pages.

This is the content-side sibling of `invite-app/design/design_handoff_grid_claim_flow`
(the claim-flow handoff). Same brand, same tokens, different problem: long-form
instructional content instead of an app flow.

---

## Evidence base — read these first

- **Content audit** (counts, examples, cleanup debt):
  `~/Documents/Teaching/summer-2026/idmx-225-wiki/reports/content-pattern-audit-for-canvas-design-system.md`
- **Corpus**: 122 markdown files at `~/Documents/Teaching/summer-2026/idmx-225-wiki/`
  (52 topic/helper pages, 32 assignments, 15 module indexes, 9 quizzes, 5 discussions)
- **Current v1 stylesheet** (your starting point, not your ceiling):
  `canvas-template-test/console-canvas.css`
- **Brand source / locked tokens**:
  `invite-app/design/design_handoff_grid_claim_flow/` (HANDOFF.md + index.shell.html)
- **Working pipeline + sample outputs**: `canvas-template-test/`
  (`markdown.js` is the authoring contract; `topic-file-system-basics-2.html`
  is the preview target, `topic-file-system-basics-2.canvas.html` the Canvas
  target — both generated, both viewable in a browser)

---

## Locked decisions — do not re-litigate

1. **Console tokens are given.** The full light + dark token sets from the
   invite-app handoff: colors (all `hsl()`), radii (8/14/22/999), shadow
   recipes, system-sans + monospace stacks, verified AA contrast. Extend if a
   component truly needs a new token; never alter existing values.
2. **Brand continuity.** Students see one brand from the claim page through
   every course page: the GRID mark, wordmark row, term pill, module label.
   The masthead pattern in v1 is approved in spirit; refine, don't replace.
3. **The pipeline architecture.** Markdown → classed HTML (one stylesheet) →
   per-target transforms. The design deliverable is the _classed_ layer; the
   Canvas inlining is mechanical and already built. Design components as
   classes, not as inline styles.
4. **Markdown is the authoring format.** Every component must be expressible
   in the contract syntax (plain markdown, a heading convention, or a
   `::: fenced-div`). If a component can't be authored in markdown by a
   non-designer colleague, it's wrong.
5. **Accessibility floor**: WCAG 2.2 AA. 4.5:1 body contrast, semantic HTML,
   alt text on meaningful images, no information by color alone, nothing
   below 14px.

---

## Render targets and their constraints

### Target A — web preview (and future 11ty site)

Full CSS in a `<style>` tag. Light/dark via `prefers-color-scheme`. Hover,
focus-visible, media queries, pseudo-elements all available. This is the
design's native habitat; design here first.

### Target B — Canvas LMS page body (PRIMARY target, email-like constraints)

The classed HTML is inlined to `style=""` attributes and pasted/imported into
Canvas. Empirically verified constraints (from real paste tests, June 2026):

| Verified              | Behavior                                                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Survives              | `display:flex`, `gap`, `margin-left:auto`, `border-radius`, modern `hsl()` incl. `/ alpha`, `linear-gradient`, `letter-spacing`                                                     |
| Stripped              | `<style>`, `<script>`, `<svg>`, `text-transform` (build bakes uppercase into text instead), empty elements (build inserts `&nbsp;`)                                                 |
| Unavailable by nature | media queries, `:hover`, `:focus`, `::before/::after`, `::marker`, animations — inline styles only                                                                                  |
| Canvas adds           | its own chrome (Lato, white page, its own page title above our content), auto-embed players on YouTube links (suppressed via Canvas's `inline_disabled` class), external-link icons |
| Unverified            | `box-shadow` (assume it may be stripped; shadows must be decorative-only, never structural)                                                                                         |
| Mobile caveat         | the Canvas Student app applies its own dark-mode color transforms to inline styles — light-theme colors must degrade acceptably under naive inversion                               |

Consequences for design: **light theme only** in Canvas; every state must be
static (no hover affordances that carry meaning); borders do structural work,
shadows are garnish; the page-wrap paper panel stands in for page background.

### Target C — PDF

Printed from Target A via browser/headless Chrome. Needs an `@media print`
block: force light tokens, drop shadows/gradients, sensible page-break rules
(`break-inside: avoid` on cards/callouts), URLs maybe shown after links.

---

## Component inventory — ranked by evidence

Frequencies are file counts from the audit. Design the top of this list
hardest; the bottom can be conventions rather than designed components.

1. **Video block** (45 files, 164 instances — the signature element).
   Currently: heading `### Video N: Title (~X mins)` + YouTube thumbnail
   link. OPEN DESIGN DECISION: styled thumbnail-link card vs real YouTube
   `<iframe>` embed (Canvas allows YouTube iframes). Consider: title, duration
   chip, play affordance, what it looks like in print (PDF target).
2. **Step sequence** (~29 assignment files). Numbered steps, sometimes with
   sub-bullets and inline screenshots. Audit found two competing source
   conventions; the contract will standardize on `### Steps` + ordered list.
   Design the ordered-list treatment: number styling, spacing rhythm,
   step-with-image layout.
3. **Callout family** (~25 files): `callout-warning` and `callout-note` ONLY
   (audit shows two real variants, not five). Replaces ⚠️-emoji and
   `**Note:**` conventions. Needs: title row, body, link styling inside the
   tinted background at AA contrast (danger-soft/accent-soft backgrounds).
4. **Learning objectives** (~24 topic pages). Heading + stem sentence +
   bullet list. Decide whether it gets a designed wrapper (`::: learning-objectives`)
   or is just well-set typography under a standard heading.
5. **Resource / link list** (~23 files). Lists of external links. The v1
   `link-row` (icon tile + bold link + muted path) is a candidate treatment —
   decide whether every resource list gets rows or only featured links do.
6. **Assignment pointers** (~20 topic pages). End-of-page `## Assignments`
   wikilink list. Wikilinks already render as monospace chips in v1; design
   the full pointer row (chip + description).
7. **Code block** (NEW — invisible in naive counts; 8-10 assignments have
   code as plain prose awaiting fencing, 2 have real fences). Needs: fenced
   `pre` block (CSS/HTML/shell), inline code span (v1 chip exists). Inline
   styles only in Canvas — no syntax highlighting dependency; design a
   single-color treatment that works inlined.
8. **Estimated-time chip** (7 files). Small metadata line after the intro.
   Candidate: pill/chip in the accent-soft family.
9. **Masthead** (every page — already built in v1: mark, wordmark, term pill,
   module label). Refine; also spec the variant WITHOUT the page h1 (Canvas
   shows its own title) vs with (preview shows ours).
10. **Existing v1 patterns to keep, refine, or cut**: `card`, `checkpoint`,
    `term-pill`, `intro`, `footnote`, `page-wrap`, `content` card, `wikilink`
    chip. The checkpoint (success panel) has no corpus evidence yet — keep it
    only if it earns a place as a deliberate pedagogical pattern.

### Explicitly out of scope

- **Quizzes** — import to Canvas as QTI XML, not HTML pages. Different
  pipeline, later project.
- **Module `_index.md` files** — they are the imscc packaging manifest, not
  styled pages.
- **One-offs** listed in audit §6 (syllabus, glossary, transcript, etc.) —
  they get the base typography, no bespoke components.

---

## Page templates to spec

Compose the components into three full-page templates:

1. **Topic page** — masthead → intro → estimated-time → learning objectives →
   video block(s) → reading/resources → assignment pointers.
2. **Assignment** — masthead → overview/goal → video block(s) → step
   sequence (with callouts and code blocks interleaved) → submission note.
3. **Discussion** — masthead → overview → numbered prompts → closing note.
   (Smallest; mostly base typography.)

A standing typography decision to make and document: **section heading level
is h2** (the audit found weeks 1-3 use h3, weeks 5+ use h2 for identical
sections; the cleanup pass will normalize to whatever this design specifies —
recommend h2). Design the h2/h3/h4 scale for long-form reading, tested on a
real long page, not a snippet.

---

## Deliverables (mirror the claim-flow handoff format)

1. **`HANDOFF.md`** — per component: purpose, DOM contract (exact markup +
   class names), the markdown-contract construct that authors write, states
   if any, and Canvas-target notes (what degrades, what's baked at build).
2. **`console-canvas.css` v2** — drop-in replacement: same token foundation,
   full component layer, `@media print` block. Element-agnostic class
   selectors (pipeline wraps things in divs).
3. **Specimen page** — one markdown file exercising EVERY component +
   its three built outputs (preview HTML light/dark, Canvas fragment).
   The specimen is the regression test for all future CSS changes.
4. **Decision log** — the open decisions (video embed strategy, heading
   scale, resource-row policy, checkpoint keep/cut) with the chosen answer
   and one-line rationale each.
5. **Verified contrast table** — every text/background pair the components
   introduce, light theme (Canvas) and both themes (preview).

---

## What NOT to do

- No new colors, fonts, or radii without extending the token set explicitly.
- No components without corpus evidence or a stated pedagogical rationale.
- No hover-dependent meaning, no animation-dependent meaning (Canvas).
- No markdown tables in authored content patterns (house rule; the corpus has
  2 tables total — treat tables as out of contract).
- Don't design the cleanup (bold-in-headings etc.) — that's a separate
  scripted pass; design for the post-cleanup corpus.
