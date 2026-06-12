# GRID design system

The design system for the GRID program's course content: design tokens,
component CSS, specimen, and verification tooling. Built from a 122-file
content audit of the IDMX-225 course wiki and a Claude Design exploration,
on the locked Console theme shared with the GRID invite app.

**See it live: [rvcc-grid-program.github.io/grid-design-system](https://rvcc-grid-program.github.io/grid-design-system/)**
— the specimen page with every component, rendered by the pipeline in this
repo. It follows your OS light/dark setting and carries the print styles.

## What lives where

- `css/grid-tokens.css` — Console tokens (locked), light + dark
- `css/grid-components.css` — components, base typography, print styles
- `specimen/specimen.md` — one page using every component; its two built
  outputs are the regression test for all CSS changes
- `HANDOFF.md` — component specs, DOM contracts, the authoring table
- `CANVAS-NOTES.md` — Canvas's property allowlist and every gotcha, with
  verified verdicts and the paste-test methodology
- `DECISIONS.md` — decision log + open Canvas probes
- `docs/icons/` — the GRID brand icon set (master `grid-icon.svg`, favicons,
  apple-touch, maskable, PNG rasters, webmanifest), identical to the set the
  invite app ships. Versioned here AND served by the Pages site, so other
  GRID properties can reference
  `https://rvcc-grid-program.github.io/grid-design-system/icons/…`. The
  webmanifest is the claim app's, kept verbatim as the asset of record.
- `pipeline/` — the wiki→HTML builds: `markdown.js` (the markdown contract),
  `enhance.js` (shared DOM transforms), `templates.js` (page shells),
  `config.js` (consumer branding), and the two CLI entry points
- `design-history/` — provenance: the design brief, the Claude Design
  context package, and the options-canvas exploration the decisions cite
- `CONTRAST.md` — generated WCAG AA verification
- `scripts/contrast.js` — regenerates CONTRAST.md from the token values

## Using it from a content repo (the normal way)

This repo is an installable package. A wiki pins a release tag and gets the
two CLIs:

```bash
pnpm add "github:rvcc-grid-program/grid-design-system#v1.0.0"

pnpm exec grid-preview modules/week-01/some-topic.md   # styled HTML preview
pnpm exec grid-canvas  modules/week-01/some-topic.md   # Canvas-ready fragment
```

Branding for the masthead (program, term, course) comes from a
`grid.config.json` in the consumer's repo root:

```json
{ "program": "GRID", "term": "Fall 2026", "course": "IDMX-225" }
```

Missing file or fields fall back to the GRID defaults. First real consumer:
[rvcc-grid-program/idmx-225](https://github.com/rvcc-grid-program/idmx-225)
(the IDMX-225 course wiki). Updating to a new design release is a one-line
version bump — review the tag diff, `pnpm install`, rebuild.

For the future 11ty site, the package exports the same brain the CLIs use:

```js
import { md } from "grid-design-system/markdown"; // eleventyConfig.setLibrary("md", md)
import { enhance, loadSystemCss } from "grid-design-system/enhance"; // addTransform
import { previewPage, canvasPage } from "grid-design-system/templates"; // .njk spec
```

`pipeline/markdown.js` is the markdown contract — every consumer (preview,
Canvas, 11ty) parses wiki markdown through that exact configuration, so the
contract physically cannot fork.

## Working on the system itself

From this repo's root, the same commands run against local files:

```bash
pnpm install
pnpm run preview <page.md>   # styled HTML, light/dark, <style> tag
pnpm run canvas <page.md>    # Canvas-ready inline-styled fragment
pnpm run contrast            # regenerate CONTRAST.md (must stay 0 failures)
pnpm run site                # rebuild the Pages site in docs/
```

## How design truth flows

Design changes land HERE first — tokens with a `DECISIONS.md` entry and a
contrast regeneration, components with a specimen update and a Canvas paste
test. Then:

- **Content repos (the wiki)** consume releases by bumping the pinned tag.
- **The invite app** is a mirror, not a dependency — it is self-contained
  by design (zero deps, strict CSP, inline styles), so token/brand changes
  propagate to it as small reviewed PRs.
- **Published Canvas content consumes nothing at runtime** — every byte of
  design is baked in at build time; old pages keep rendering no matter what
  happens here.

## The verification loop

1. `pnpm run contrast` — must report 0 failures
2. Rebuild `specimen/specimen.md` both ways; view the preview in light and
   dark
3. Paste `specimen/specimen.canvas.html` into the Canvas sandbox page, save,
   reopen the HTML editor, and check the probe list in `DECISIONS.md`

## Beginner's guide

Want a styled Canvas page? Write plain markdown. Want a warning box? Wrap
the text in `::: callout-warning` … `:::`. The full list of constructs an
author may use is the authoring table in `HANDOFF.md` — if it's not in that
table, it's plain markdown. You never write HTML and you never write inline
styles; the pipeline does both.

## Contributing

Token changes require a `DECISIONS.md` entry and a contrast regeneration.
New components require corpus evidence (see the content audit) or a stated
pedagogical rationale, plus: CSS, a HANDOFF.md row + DOM contract, a
specimen addition, and a Canvas paste test.

Releasing: bump `version` in `package.json`, run the verification loop,
tag (`git tag v1.x.y && git push origin v1.x.y`), then bump the pinned tag
in consumer repos.

## License

MIT © Cynthia Teeters
