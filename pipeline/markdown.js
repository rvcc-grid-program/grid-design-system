/* markdown.js — THE markdown contract for the wiki→Canvas pipeline.
   Every consumer (preview build, Canvas build, future 11ty site) must parse
   wiki markdown through this exact configuration. If a construct isn't
   supported here, it isn't supported, period.

   Supported beyond CommonMark:
   - YAML frontmatter (gray-matter)
   - ::: name … :::  fenced divs → <div class="name"> (nest with more colons)
   - ### Heading {.class}  attributes on blocks (markdown-it-attrs)
   - [text]{.class}  classed inline spans (markdown-it-bracketed-spans)
   - [[slug]] / [[slug|label]]  wikilinks → <a class="wikilink" href="slug">
   - auto heading ids (markdown-it-anchor)
   - typographer quotes/dashes (parity with pandoc smart punctuation)

   Also: a warn-only raw-HTML guard (lintRawHtml, run by renderPage) flags tags
   an author typed loose in prose — see the ALLOWED_RAW_TAGS block below.       */

import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import attrs from "markdown-it-attrs";
import bracketedSpans from "markdown-it-bracketed-spans";
import anchor from "markdown-it-anchor";
import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { iconFor } from "./icons.js";

/* [[slug]] / [[slug|label]] — small inline rule instead of a dependency so
   the Canvas build can later resolve slugs against the wiki itself. */
function wikilinks(md) {
  md.inline.ruler.before("link", "wikilink", (state, silent) => {
    const src = state.src;
    if (src.charCodeAt(state.pos) !== 0x5b /* [ */ || src.charCodeAt(state.pos + 1) !== 0x5b)
      return false;
    const end = src.indexOf("]]", state.pos + 2);
    if (end === -1) return false;
    const inner = src.slice(state.pos + 2, end);
    if (!inner || /[\[\]\n]/.test(inner)) return false;
    if (!silent) {
      const [slug, label] = inner.split("|");
      let token = state.push("link_open", "a", 1);
      token.attrs = [
        ["href", slug.trim()],
        ["class", "wikilink"],
      ];
      token = state.push("text", "", 0);
      token.content = (label ?? slug).trim();
      state.push("link_close", "a", -1);
    }
    state.pos = end + 2;
    return true;
  });
}

/* Structured containers emit their full DOM contract (grid-design-system
   HANDOFF.md) so authors only write the fenced div. Everything else falls
   through to a plain classed <div>. */
const STRUCTURED = {
  "callout-warning": {
    open:
      `<div class="callout callout-warning">` +
      `<div class="callout-head"><span class="callout-ico" aria-hidden="true">${iconFor("callout-warning")}</span>` +
      `<span class="callout-title">Warning</span></div><div class="callout-body">\n`,
    close: "</div></div>\n",
  },
  "callout-note": {
    open:
      `<div class="callout callout-note">` +
      `<div class="callout-head"><span class="callout-ico" aria-hidden="true">${iconFor("callout-note")}</span>` +
      `<span class="callout-title">Note</span></div><div class="callout-body">\n`,
    close: "</div></div>\n",
  },
  checkpoint: {
    open:
      `<div class="checkpoint"><span class="checkpoint-mark" aria-hidden="true">${iconFor("checkpoint-mark")}</span>` +
      `<div class="checkpoint-body"><span class="checkpoint-title">Checkpoint</span>\n`,
    close: "</div></div>\n",
  },
  objectives: {
    open:
      `<div class="objectives">` + `<span class="objectives-kicker">Learning objectives</span>\n`,
    close: "</div>\n",
  },
  "link-row": {
    open:
      `<div class="link-row"><span class="link-ico" aria-hidden="true">${iconFor("link-ico")}</span>` +
      `<div class="link-body">\n`,
    close: "</div></div>\n",
  },
};

export const md = new MarkdownIt({ html: true, typographer: true })
  .use(bracketedSpans)
  .use(attrs)
  .use(anchor)
  .use(wikilinks)
  .use(container, "dynamic", {
    // accept any single-word name: ::: card, ::: callout-warning, …
    validate: (params) => /^[\w-]+$/.test(params.trim()),
    render: (tokens, idx, _opts, env) => {
      env._containerStack ??= [];
      if (tokens[idx].nesting === 1) {
        const name = tokens[idx].info.trim();
        env._containerStack.push(name);
        return STRUCTURED[name]?.open ?? `<div class="${name}">\n`;
      }
      const name = env._containerStack.pop();
      return STRUCTURED[name]?.close ?? "</div>\n";
    },
  });

/* Raw-HTML prose guard (warn-only).
   `html: true` is load-bearing (it passes our container divs and the allowed
   YouTube iframe embed), but it ALSO passes tags an author accidentally types
   in a sentence — a bare `<iframe>`/`<video>`/`<style>` swallows the rest of
   the document, and ordinary tags (`<section>`, `<h2>`) silently vanish. We
   catch this at the token layer, not with a regex: raw HTML the author typed
   becomes `html_block`/`html_inline` tokens, while OUR constructs (container
   divs, bracketed spans, attrs, wikilinks) are different token types — so this
   cleanly separates "author typed a tag" from "our plugin emitted one," with
   no allowlist needed for the intentional constructs.

   The allowlist below is the authoring contract (HANDOFF.md): the inline tags
   an author may legitimately hand-write. Anything else warns; iframe is
   allowed ONLY with a YouTube src (the one blessed embed — CANVAS-NOTES.md).
   Warn-only: never throws, never changes output. Escaping non-allowlisted raw
   HTML would be a breaking change (separate decision). */
const ALLOWED_RAW_TAGS = new Set([
  "kbd",
  "span",
  "br",
  "sub",
  "sup",
  "abbr",
  "b",
  "i",
  "em",
  "strong",
  "mark",
  "small",
  "cite",
  "code",
]);
const YOUTUBE_SRC = /\bsrc\s*=\s*["']https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\//i;

/* Blessed authored raw *blocks* — bespoke HTML that can't be expressed as
   markdown and is deliberately hand-written, keyed by a class on the opening
   element. Currently just the docs-site icon gallery (docs/index.md). */
const ALLOWED_RAW_BLOCKS = new Set(["icon-grid"]);

function classTokens(attrs) {
  const m = attrs.match(/\bclass\s*=\s*["']([^"']*)["']/i);
  return m ? m[1].trim().split(/\s+/) : [];
}

function tagAllowed(name, attrs) {
  if (name === "iframe") return YOUTUBE_SRC.test(attrs);
  if (ALLOWED_RAW_TAGS.has(name)) return true;
  return classTokens(attrs).some((c) => ALLOWED_RAW_BLOCKS.has(c));
}

/* Return [{ line, tag, why }] for raw HTML that isn't an allowed construct.
   `lineOffset` maps token lines back to the original file (renderPage passes
   the frontmatter length gray-matter stripped). Exported so a fixture can
   exercise it (the repo has no test runner). */
export function lintRawHtml(content, lineOffset = 0) {
  const warnings = [];
  const check = (fragment, line) => {
    // opening / self-closing tags only; a stray close tag warns via its open
    const m = fragment.match(/^<([a-zA-Z][\w-]*)\b([^>]*)>/);
    if (!m) return;
    const name = m[1].toLowerCase();
    if (tagAllowed(name, m[2])) return;
    const why =
      name === "iframe"
        ? "raw <iframe> without a YouTube src — collapses page structure"
        : `raw <${name}> in prose is not an allowed construct — did you mean to backtick it?`;
    warnings.push({ line, tag: name, why });
  };
  const walk = (tokens) => {
    for (const t of tokens) {
      const line = t.map ? t.map[0] + 1 + lineOffset : null;
      if (t.type === "html_block") check(t.content.trimStart(), line);
      if (t.type === "inline" && t.children) {
        for (const c of t.children) {
          if (c.type === "html_inline") check(c.content, line);
        }
      }
    }
  };
  walk(md.parse(content, {}));
  return warnings;
}

/* Read a wiki page: { data: frontmatter, html: rendered body }.
   Prints raw-HTML warnings to stderr (warn-only; the render proceeds). */
export function renderPage(path) {
  const raw = readFileSync(path, "utf8");
  const { data, content } = matter(raw);
  // gray-matter strips the frontmatter block; offset token lines back to the
  // original file so warnings point at the right line.
  const lineOffset = raw.split("\n").length - content.split("\n").length;
  for (const w of lintRawHtml(content, lineOffset)) {
    process.stderr.write(`⚠ grid raw-HTML: ${path}:${w.line ?? "?"} — ${w.why}\n`);
  }
  return { data, html: md.render(content) };
}
