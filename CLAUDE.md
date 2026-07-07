# CLAUDE.md — grid-design-system

The GRID org's single source of design truth. Design changes land HERE
first, then flow out (content repos bump the pinned tag; the invite app
mirrors tokens/brand via reviewed PRs). pnpm only, node only — never bun or
npm install.

## The doc set — docs ship with the change

This repo is documentation-dense ON PURPOSE; a stale doc here misleads
every consumer. Any change to `css/`, `pipeline/`, or `specimen/` must, in
the same commit, update every item in this list that mentions what changed:

- `README.md` — orientation, consumer install, design-truth flow, release process
- `HANDOFF.md` — authoring table, DOM contracts, Canvas degradation notes
- `CANVAS-NOTES.md` — verified sanitizer verdicts (date every new verdict)
- `DECISIONS.md` — every decision, same turn it's made; probe results
- `CONTRAST.md` — generated; rerun `pnpm run contrast` after ANY token change
- `docs/` (the public Pages site) — rerun `pnpm run site` after CSS,
  template, or landing-page changes; it deploys on push
- `runbooks/` — executable probe/verification procedures; update any
  runbook whose steps, paths, or Expect lines the change made stale
- this file

Before any commit: grep the doc set for paths, commands, names, and claims
the change made stale.

## Verification loop (run before declaring anything done)

1. `pnpm run contrast` — must report 0 failures
2. `pnpm run preview specimen/specimen.md` + `pnpm run canvas specimen/specimen.md`
   — the specimen is THE regression test; eyeball the preview light AND dark
3. `pnpm run site` if css/templates/docs changed
4. Anything touching Canvas output behavior needs a real paste test
   (methodology in CANVAS-NOTES.md §6); record verdicts with dates

## Rules that aren't obvious from the code

- `css/grid-tokens.css` values are LOCKED (shipped Console theme). Extending
  requires a DECISIONS.md entry. The dark token block exists TWICE (media
  query + `[data-mode]` override) — keep them in sync.
- Token values are MIRRORED by hand in two scripts, and both drift silently
  when `grid-tokens.css` changes. After ANY token edit, update and re-run
  both: `scripts/contrast.js` (hardcodes light+dark triplets — its output
  claims to come from the CSS but does NOT read it; add a pair when a new
  token gets a text/background usage) and `pipeline/icons.js` `INK_LITERALS`
  (a fallback hex mirror of the light `:root`; `build-icons.js` reads the CSS
  for real, so the shipped PNGs are correct, but the fallback still rots).
  Counting the two dark blocks above, a token change touches up to four
  places.
- The dark theme, hover states, shadows, letter-spacing, and pseudo-elements
  are preview-only garnish — Canvas strips them (verified list in
  CANVAS-NOTES.md). Never let them carry meaning or structure.
- `pipeline/markdown.js` is the markdown contract shared by every consumer.
  New authoring constructs need: the container/rule here, CSS, a HANDOFF.md
  row + DOM contract, a specimen addition, and a paste test.
- Consumers call the CLIs from their own repos (`pnpm exec grid-canvas`);
  branding comes from THEIR `grid.config.json` — never hardcode course text
  in `templates.js`.
- Releases: bump `version` in package.json, run the loop, tag `v1.x.y`,
  push the tag, then bump consumers (first consumer:
  github.com/rvcc-grid-program/idmx-225).
- This repo and its Pages site are PUBLIC. No student data, no secrets, no
  institution-internal URLs beyond the Canvas instance hostname already in
  CANVAS-NOTES.md.
