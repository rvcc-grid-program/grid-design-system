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
   - typographer quotes/dashes (parity with pandoc smart punctuation)        */

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

/* Read a wiki page: { data: frontmatter, html: rendered body }. */
export function renderPage(path) {
  const { data, content } = matter(readFileSync(path, "utf8"));
  return { data, html: md.render(content) };
}
