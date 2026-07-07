# Probe runbook: does a YouTube iframe survive the Canvas sanitizer?

> **Executor instructions.** Work the moves in order. Each move: do it,
> compare against the _Expect_ line, proceed only on a match; on a
> mismatch apply _If not_. At a **hard stop**, stop and report — never
> improvise. **CHECK FIRST** items are unverified assumptions; run the
> stated check before relying on them. You are done only when every check
> in the Verification section passes.
>
> This runbook is a **probe**: it cannot fail, it can only conclude. A
> stripped iframe is a verdict, not a defect — there is nothing to repair
> and no repair loop is allocated.

## Written against

- Date: 2026-07-06. This repo at v1.2.0, clean `main`.
- The open question this probe settles: CANVAS-NOTES.md §7, first bullet —
  "`<iframe>` YouTube embed end-to-end (allowed per Canvas docs; untested
  by us) — needed for the video option-C opt-in."
- Methodology source: CANVAS-NOTES.md §6 (paste → save → **reopen the
  HTML editor** → diff sent vs kept; computed styles for rendering
  questions).
- Staleness check before starting: `rg -n "iframe" CANVAS-NOTES.md` still
  shows the §7 open bullet. If it's gone, someone already ran this probe —
  stop and read their verdict instead.

## Purpose and non-goals

Running this runbook produces a **dated verdict** on whether a standard
YouTube embed iframe survives a paste into the Canvas RCE HTML editor,
recorded in DECISIONS.md and CANVAS-NOTES.md, closing (or concretely
re-scoping) the §7 open question.

Non-goals: no pipeline or CSS changes (probe first, build later — if the
verdict is "survives," a future, separate change proposes the authoring
construct per CLAUDE.md's new-construct checklist); no imscc-import
testing (§7's paste-vs-import parity question stays open and this runbook
must not claim otherwise).

## Stop conditions

- Repair loops allocated: **zero** (probes conclude; they don't repair).
- **Sandbox Canvas page only.** Never paste into a page of the live/real
  course. If the page you're on isn't clearly the sandbox, hard stop.
- The paste, save, and verdict-reading are **human-eyes steps** (standing
  hard stop): the instructor performs them, or explicitly supervises a
  browser session doing them. The executor never clicks through Canvas
  alone.
- No edits to this repo except the two dated verdict entries
  (DECISIONS.md, CANVAS-NOTES.md) written in Moves 6–7 — and those only
  after the human confirms the observed results.
- This repo is public: the fragment and verdicts must contain no student
  data and no internal URLs beyond the Canvas hostname already present in
  CANVAS-NOTES.md.

## CHECK FIRST register

- **DECISIONS.md probe-entry format.** Probe results are `##` sections
  titled "Probe results — <what>, <date>" placed above the "Still open"
  section (verified 2026-07-06). Check: match the two most recent probe
  sections before writing.
- **Sandbox page URL.** Only the instructor knows the sandbox course/page.
  Check: ask at Move 3 (this is the one question this runbook is allowed
  to ask, because it is environment, not plan).
- **Does saving the RCE rewrite iframes into Canvas's media wrapper?**
  Unknown; not settleable before the paste. The Move 5 grep set is
  designed to detect it either way.

## Moves

**Move 1 — Build the probe fragment.**
_Do:_ Write `tmp/probe-iframe.html` (repo-local `tmp/` is gitignored)
containing exactly:

```html
<p>PROBE-CANARY-TOP iframe probe 2026-07-06</p>
<iframe
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  title="Probe: YouTube embed survival"
  width="560"
  height="315"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
<p>PROBE-CANARY-BOTTOM if you can read both canaries, the paste kept structure</p>
```

_Expect:_ File exists; `rg -c "PROBE-CANARY" tmp/probe-iframe.html`
prints `2`.
_If not:_ Transcription slip — fix freely (own artifact; this is hygiene,
not a repair loop).

**Move 2 — Record the "sent" baseline.**
_Do:_ `rg -o 'src="[^"]*"|title="[^"]*"|allowfullscreen|width="[^"]*"' tmp/probe-iframe.html`
_Expect:_ Matches for src, title, width (560), and allowfullscreen. Save
this output; it is the "sent" half of sent-vs-survived.
_If not:_ The fragment drifted from Move 1's block; redo Move 1.

**Move 3 — Confirm the sandbox (human).**
_Do:_ The instructor opens the sandbox Canvas course and creates or picks
a scratch page for the probe.
_Expect:_ The page is in the sandbox course (check the course name in the
breadcrumb — it must NOT be the live course).
_If not:_ Wrong course visible → stop condition 2. Do not proceed on
"probably the sandbox."

**Move 4 — Paste and save (human-eyes).**
_Do:_ Open the page's HTML editor (`</>` view), paste the entire fragment
from Move 1, save the page.
_Expect:_ The page saves without an error banner, and the rendered view
shows at least the two canary paragraphs.
_If not:_ Save rejected outright → that IS a verdict ("RCE refuses the
fragment") — skip to Move 6 and record it. Canaries missing → note it;
proceed to Move 5, the saved HTML is still the authority.

**Move 5 — Read what survived (human-eyes + grep).**
_Do:_ **Reopen the HTML editor** (per §6 — never trust the first render).
Copy the saved HTML out into `tmp/probe-iframe-survived.html`. Then run
the same grep as Move 2 against it, plus:
`rg -o '<iframe[^>]*>|data-media|instructure' tmp/probe-iframe-survived.html`
_Expect (this is the probe's fork; all three routes are conclusions):_

- **Route A — survives intact:** `<iframe` present; src/title/
  allowfullscreen match the sent baseline. Verdict: survives.
- **Route B — survives rewritten:** `<iframe` present but attributes
  changed or wrapped in Canvas media markup (the `data-media`/
  `instructure` matches fire). Verdict: survives with rewrites — record
  the exact diff; the rewrites ARE the finding.
- **Route C — stripped:** no `<iframe` in the saved HTML (canaries
  present or not). Verdict: stripped; the option-C video opt-in cannot
  use pasted iframes.

_If not:_ There is no "if not" — every observation lands in A, B, or C.
For Route A/B additionally: does the video actually render and play on
the live page? (Human-eyes; a kept-but-dead iframe is Route B with a
note.)

**Move 6 — Record the verdict in DECISIONS.md.**
_Do:_ Add a section in the house style — `## Probe results — YouTube
iframe paste test, <today's date>` — above the "Still open" section,
containing: what was sent (the Move 1 fragment, or a pointer here), the
route taken (A/B/C), the survived HTML's iframe line verbatim (Route A/B)
or its absence (Route C), and one sentence on what this means for the
video option-C opt-in. Update the "Still open" line about the iframe to
reflect the new state.
_Expect:_ `rg -n "YouTube iframe paste test" DECISIONS.md` finds the new
section; "Still open" no longer lists the iframe question as untested.
_If not:_ Formatting mismatch with house style → match the two most
recent probe sections (CHECK FIRST item 1) and adjust.

**Move 7 — Record the verdict in CANVAS-NOTES.md (same turn — docs ship together).**
_Do:_ Move the §7 first bullet to the appropriate verified section with
the dated verdict, in the same style as existing dated entries ("Verified
<date>" phrasing). Leave §7's paste-vs-imscc parity bullet untouched —
this probe did not test import.
_Expect:_ `rg -n "iframe" CANVAS-NOTES.md` shows the verdict with today's
date, and the parity question still open.
_If not:_ Self-evident from the diff.

**Move 8 — Clean up and report.**
_Do:_ Delete `tmp/probe-iframe.html` and `tmp/probe-iframe-survived.html`
(own artifacts; `tmp/` is gitignored regardless). Leave the changes
**uncommitted** for the instructor's review (docs-only diff: DECISIONS.md

- CANVAS-NOTES.md). Report: the route taken, the survived-HTML evidence,
  and the recommended next step (Route A/B → a future, separate change may
  propose the authoring construct; Route C → option-C needs a link-out
  design instead).
  _Expect:_ `git status --short` shows exactly ` M DECISIONS.md` and
  ` M CANVAS-NOTES.md` (plus any pre-existing untracked noise, unchanged).

## Verification

1. Sent baseline was recorded before the paste (Move 2 output present in
   the session). PASS = the final report quotes it.
2. The saved-HTML grep ran against `probe-iframe-survived.html`, not
   against the fragment we sent. PASS = the report shows both and they
   are distinguishable.
3. `rg -n "YouTube iframe paste test" DECISIONS.md` → PASS = 1 section,
   dated today.
4. `rg -n "iframe" CANVAS-NOTES.md` → PASS = dated verdict present; imscc
   parity bullet still open.
5. `git status --short` → PASS = exactly the two doc files modified,
   nothing else changed.
6. The live course was never touched. PASS = the instructor confirms the
   paste happened on the sandbox page only (human check — the executor
   reports it as confirmed-by-human, not verified-by-me).
