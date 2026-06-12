---
title: "GRID design system"
module_title: "RVCC GRID program"
---

The design system for GRID course content: one set of Console tokens and
components flowing from wiki markdown to a styled web page, a Canvas LMS
fragment, and print. **This page is built by the pipeline it documents** —
everything you're looking at is the system rendering its own markdown.

::: callout-note
Specs, decisions, and source live in
[the repository](https://github.com/rvcc-grid-program/grid-design-system) —
start with `HANDOFF.md` for the authoring contract and `CANVAS-NOTES.md`
for the Canvas sanitizer findings.
:::

## See it

::: link-row
[The specimen — every component, live](specimen.html)
:::

The specimen exercises every component in the system. It follows your OS
light/dark setting — or use the sun/moon toggle in the header (your choice
sticks). Narrow the window to phone width, and print-preview it to see the
print styles.

- [The Canvas fragment](specimen.canvas.html) — the same specimen as Canvas
  receives it: every style inlined, classes renamed to `data-class`,
  uppercase baked into text. View source to see what the sanitizer gets.

## How it reads

A few of the components, doing their jobs:

::: objectives

When you have completed this page you will be able to:

- Recognize the Console theme shared with the GRID claim app
- Know where the specimen and the Canvas fragment live
- Find the spec documents in the repository

:::

::: callout-warning
Canvas strips `box-shadow`, `letter-spacing`, `opacity`, negative margins,
and `text-transform`. Every component here is designed to survive that —
borders carry structure, shadows are garnish, and uppercase is baked in at
build time.
:::

::: checkpoint
If this page looks consistent with the claim app students use on day one,
the system is doing its job — one brand from first login to final project.
:::

## For maintainers

The repository holds the full spec: `HANDOFF.md` for component DOM
contracts and the authoring table, `CANVAS-NOTES.md` for the verified
Canvas sanitizer findings, `DECISIONS.md` for why everything is the way it
is, and `CONTRAST.md` for the generated accessibility verification. Build
this site with `pnpm run site`.
