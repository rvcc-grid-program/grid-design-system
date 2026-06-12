# Design request — GRID course-content design system

You are designing a small design system for community-college course content
pages. The pages are authored in markdown, rendered to HTML by an automated
pipeline, and delivered to three targets — a styled web page, a Canvas LMS
page (severe constraints, detailed below), and print/PDF. You design the
classed HTML + CSS layer; the pipeline handles everything downstream
(including inlining styles for Canvas). Everything in this document is
evidence from a real 122-file course corpus and verified Canvas paste tests.

## What to produce

1. **A specimen page**: one self-contained HTML file (embedded `<style>`)
   exercising every component below with realistic course content, light and
   dark themes via `prefers-color-scheme`, plus an `@media print` block.
   Element-agnostic class selectors (the pipeline wraps content in `<div
class="...">` — never assume `p.intro`, always `.intro`).
2. **Handoff notes** (markdown): per component — purpose, exact DOM contract
   (markup + class names), the markdown construct an author writes, and
   Canvas-target degradation notes.
3. **A decision log**: each open decision below, your answer, one-line why.
4. **A contrast table**: every text/background pair you introduce, with
   ratios, both themes.

## Locked foundation — do not change these

This system extends an existing, shipped brand ("Console" theme from the
program's student claim app). Tokens are final. All colors `hsl()`.

```css
:root {
  --r-sm: 8px;
  --r-md: 14px;
  --r-lg: 22px;
  --r-pill: 999px;
  --shadow-1: 0 1px 2px hsl(220 30% 10% / 0.06), 0 2px 8px hsl(220 30% 10% / 0.06);
  --shadow-2: 0 8px 24px hsl(220 30% 10% / 0.12), 0 2px 8px hsl(220 30% 10% / 0.08);
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono:
    ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  /* light */
  --paper: 220 26% 96%;
  --surface: 0 0% 100%;
  --surface-2: 220 30% 94%;
  --ink: 222 34% 13%;
  --ink-muted: 220 14% 37%;
  --line: 220 22% 85%;
  --line-strong: 220 20% 70%;
  --accent: 230 76% 52%;
  --link: 230 80% 45%;
  --accent-soft: 226 84% 94%;
  --accent-soft-ink: 230 70% 38%;
  --focus: 230 88% 48%;
  --glow: 215 95% 60%;
  --ok: 150 55% 30%;
  --ok-ink: 120 40% 98%;
  --ok-soft: 150 52% 93%;
  --ok-line: 150 42% 70%;
  --danger: 358 62% 44%;
  --danger-soft: 358 82% 96%;
  --danger-line: 358 58% 78%;
}
/* dark (preview target only — Canvas gets light only) */
@media (prefers-color-scheme: dark) {
  :root {
    --paper: 224 32% 8%;
    --surface: 223 28% 11%;
    --surface-2: 222 26% 15%;
    --ink: 220 32% 94%;
    --ink-muted: 220 16% 71%;
    --line: 222 20% 24%;
    --line-strong: 222 18% 38%;
    --accent: 226 92% 72%;
    --link: 226 94% 78%;
    --accent-soft: 228 42% 20%;
    --accent-soft-ink: 226 88% 82%;
    --focus: 210 96% 66%;
    --glow: 215 96% 64%;
    --ok: 150 56% 60%;
    --ok-ink: 150 40% 9%;
    --ok-soft: 150 28% 16%;
    --ok-line: 150 28% 36%;
    --danger: 358 88% 74%;
    --danger-soft: 358 36% 17%;
    --danger-line: 358 46% 42%;
  }
}
```

Existing approved patterns to build on (keep the spirit, refine freely):
a masthead with a 40px gradient brand mark + uppercase tracked wordmark
("GRID · Fall 2026") + monospace term pill ("IDMX-225") + uppercase muted
module label; content sits on a white `.content` card (22px radius, hairline
border, 3px accent top strip) over the paper background; wikilinks (internal
cross-references) render as small monospace chips on accent-soft.

Hard rules: WCAG 2.2 AA (4.5:1 body text), nothing below 14px, semantic
HTML, no information carried by color alone, no markdown tables in authored
patterns, monospace for filenames/code/class-codes.

## Render targets — design for all three

**A. Web preview (native habitat).** Full CSS, light/dark, hover/focus
available. Design here first.

**B. Canvas LMS page (PRIMARY target — think "designing for email").**
The pipeline inlines your CSS into `style=""` attributes and the result is
pasted into Canvas, whose sanitizer we have tested empirically:

- SURVIVES: `display:flex`, `gap`, `margin-left:auto`, `border-radius`,
  modern `hsl()` incl. alpha, `linear-gradient`, `letter-spacing`.
- STRIPPED: `<style>`, `<script>`, `<svg>`, `text-transform` (our build bakes
  uppercase into the text instead — you may still use it), empty elements
  (build inserts `&nbsp;`).
- IMPOSSIBLE INLINE: media queries, `:hover`, `:focus`, `::before/::after`,
  `::marker`, animations. Every component must read correctly as a static,
  light-theme, pseudo-element-free rendering. Pseudo-elements are allowed
  only as progressive garnish for the web target.
- UNVERIFIED: `box-shadow` — use shadows as garnish, never structure;
  borders must do the structural work.
- CONTEXT: Canvas renders our fragment inside its own chrome (Lato font,
  white page, Canvas's own page title ABOVE our content — so no h1 in the
  body; our masthead + module label is the top of the fragment). The Canvas
  mobile app applies naive color transforms in its dark mode — light-theme
  colors should not catastrophically invert (avoid meaning carried by subtle
  tint differences).

**C. Print/PDF.** Printed from target A. `@media print`: force light tokens,
drop shadows/gradients, `break-inside: avoid` on cards/callouts/video blocks,
show link URLs where it helps (resource lists), hide nothing a student needs.

## Authoring constraint

Every component must be writable in markdown by a non-designer instructor,
as one of: plain markdown, a heading convention, or a fenced div like:

```markdown
::: callout-warning
Don't edit files on github.com directly.
:::
```

The pipeline turns `::: name` into `<div class="name">`. Inline spans:
`[text]{.class}`. Heading attrs: `## Title {.class}`. Internal links:
`[[page-slug]]` → `<a class="wikilink" href="...">`. If your DOM contract for
a component can't be produced from those primitives, simplify it.

## Component inventory — ranked by corpus evidence (file counts from a 122-file audit)

1. **Video block** — 45 files, 164 instances. THE signature element.
   Currently: `### Video 1: File System Basics (~15min)` heading + a YouTube
   thumbnail link `[![Video](https://img.youtube.com/vi/ID/hqdefault.jpg)](https://youtu.be/ID)`.
   DECIDE: styled thumbnail-link card vs real YouTube iframe (Canvas allows
   YouTube iframes). Wants: title, duration chip, play affordance, sane print
   fallback.
2. **Step sequence** — ~29 assignment files. Ordered list of instructions,
   sometimes with sub-bullets and screenshots between steps. Design the
   number treatment, rhythm, and a step-with-image layout.
3. **Callout family** — ~25 files. Exactly two variants: `callout-warning`
   (danger family) and `callout-note` (accent family). Title row + body;
   links inside tinted backgrounds must hold AA.
4. **Learning objectives** — ~24 topic pages. Heading + stem sentence ("When
   you have completed this topic you will be able to:") + bullet list.
   Decide: designed wrapper vs pure typography.
5. **Resource / link list** — ~23 files. Lists of external links. An existing
   "link-row" pattern (34px icon tile + bold link + muted monospace URL path)
   is a candidate; decide whether all resource links get rows or only
   featured ones (a row per link gets heavy at 10+ links).
6. **Assignment pointers** — ~20 topic pages. End-of-page `## Assignments`
   list of wikilink chips + short descriptions.
7. **Code block** — corpus has CSS/HTML/shell snippets in ~10 assignment
   files. Fenced `pre` block + inline code span. NO syntax highlighting
   (Canvas gets one inline-styled color scheme); design a single-tone
   treatment that stays readable.
8. **Estimated-time chip** — 7 files. Small metadata line after the intro
   ("Estimated time: 25-30 minutes").
9. **Masthead** — every page (described under locked foundation).
10. **Base typography** — h2/h3/h4 long-form scale (DECIDE the scale; section
    headings standardize on h2), paragraphs, nested lists, images with
    rounded borders, external links, `kbd` if you want it. Tested against a
    long page, not a snippet.

Optional, no corpus evidence — keep only with pedagogical rationale: a
"checkpoint" success panel (green family) for self-check moments.

## Page templates

Compose components into three templates (specimen page may show one full
template + the remaining components in sections):

- **Topic page**: masthead → intro → estimated-time → learning objectives →
  video block(s) → reading/resources → assignment pointers.
- **Assignment**: masthead → overview → video block → step sequence with
  callouts and code blocks interleaved → submission note.
- **Discussion**: masthead → overview → numbered prompts → closing note.

## Real sample content (use this in the specimen)

A genuine topic page from the corpus (frontmatter `title: "Topic: File
System Basics"`, `module_title: "Week 1: File Systems & How the Web Works"`):

```markdown
### Topic Overview

In this topic we will be discussing what files and folders are on a computer
system. Web developers must be both experienced and confident with naming,
renaming, finding, copying, moving, deleting, downloading, and uploading
files. Web developers must also understand and be able to manage folders.

**Estimated time: 25-30 minutes.**

### Learning Objectives

When you have completed this topic you will be able to:

- Understand how the folder and file system works on your computer
- Understand the importance of filename extensions
- Know the file naming rules for web development

### Video 1: File System Basics (~15min)

[![Video](https://img.youtube.com/vi/hw7TwIf1rOw/hqdefault.jpg)](https://youtu.be/hw7TwIf1rOw)

## Reading

### Working With Files

You should choose the reading assignment for the computer(s) you will be
using for your web development assignments this semester.

- Windows Basics - Working with Files https://edu.gcfglobal.org/en/windowsbasics/working-with-files/1/
- OS X Basics - Working with Files https://edu.gcfglobal.org/en/osxbasics/working-with-files/1/

### Naming Web Development Files

Read the page [[web-dev-file-naming-rules-2]] and be ready to be tested on
its content.
```

For the assignment template, invent realistic content: a "Style your About
Me page" assignment with an overview, one video, six steps including one
screenshot placeholder, one callout-warning ("commit before you experiment"),
and one CSS code block.

## Open decisions for your decision log

1. Video: thumbnail-card vs iframe (and the print fallback either way).
2. Heading scale: the h2/h3/h4 sizes and the h2 section-divider treatment.
3. Resource links: rows always, or rows for featured + plain list otherwise.
4. Learning objectives: designed wrapper or typography only.
5. Checkpoint panel: keep or cut.
6. Estimated-time: chip, or styled text line.

## What NOT to do

- No new colors/fonts/radii outside the token set (extend tokens explicitly
  if truly needed, stating why).
- No hover-dependent or animation-dependent meaning (Canvas is static).
- No components beyond this list — the inventory is evidence-based.
- No `<svg>` in component DOM contracts (Canvas strips it; unicode glyphs or
  hosted images only).
- No dark-mode-only design decisions — dark is preview-only garnish.
