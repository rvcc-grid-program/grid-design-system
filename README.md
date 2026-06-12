# GRID design system

The design system for the GRID program's course content: design tokens,
component CSS, specimen, and verification tooling. Built from a 122-file
content audit of the IDMX-225 course wiki and a Claude Design exploration,
on the locked Console theme shared with the
[invite app](../invite-app/design/design_handoff_grid_claim_flow/).

## What lives where

- `css/grid-tokens.css` — Console tokens (locked), light + dark
- `css/grid-components.css` — components, base typography, print styles
- `specimen/specimen.md` — one page using every component; its two built
  outputs are the regression test for all CSS changes
- `HANDOFF.md` — component specs, DOM contracts, the authoring table
- `CANVAS-NOTES.md` — Canvas's property allowlist and every gotcha, with
  verified verdicts and the paste-test methodology
- `DECISIONS.md` — decision log + open Canvas probes
- `CONTRAST.md` — generated WCAG AA verification
- `scripts/contrast.js` — regenerates CONTRAST.md from the token values

## Consumers

The build pipeline in [`../canvas-template-test/`](../canvas-template-test/)
reads `css/*` directly (tokens + components concatenated):

```bash
cd ../canvas-template-test
pnpm run preview <page.md>   # styled HTML, light/dark, <style> tag
pnpm run canvas <page.md>    # Canvas-ready inline-styled fragment
```

A future 11ty wiki site is the third consumer: same CSS, same DOM contracts
(HANDOFF.md), shortcodes/layouts replacing `templates.js`.

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

## License

MIT © Cynthia Teeters
