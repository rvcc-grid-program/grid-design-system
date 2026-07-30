/* wikilink label distinction — regression test.

   `[[slug]]` and `[[slug|Label]]` are the same link but not the same kind of
   text: a bare slug is literal (mono), a label is prose (sans). CSS can't
   tell them apart, so markdown.js emits `wikilink-labeled` on the alias form
   and `css/grid-components.css` styles off that (DECISIONS.md 25).

   This pins the class contract and the href/text split that consumers rely
   on — idmx-225 rewrites the href to its own URL space and must never touch
   the link text.

   Run: pnpm test */

import test from "node:test";
import assert from "node:assert/strict";
import * as cheerio from "cheerio";
import { md } from "../pipeline/markdown.js";

function link(markdown) {
  return cheerio.load(md.render(markdown))("a").eq(0);
}

test("a bare wikilink keeps the mono chip class only", () => {
  const a = link("Read [[web-dev-file-naming-rules-2]] first.");
  assert.equal(a.attr("class"), "wikilink");
  assert.equal(a.attr("href"), "web-dev-file-naming-rules-2");
  assert.equal(a.text(), "web-dev-file-naming-rules-2");
});

test("an aliased wikilink adds wikilink-labeled and shows the label", () => {
  const a = link("Read [[web-dev-file-naming-rules-2|File Naming Rules]] first.");
  assert.equal(a.attr("class"), "wikilink wikilink-labeled");
  assert.equal(a.attr("href"), "web-dev-file-naming-rules-2", "href stays the raw slug");
  assert.equal(a.text(), "File Naming Rules");
});

test("whitespace around the slug and label is trimmed", () => {
  const a = link("See [[ some-slug | Some Label ]].");
  assert.equal(a.attr("href"), "some-slug");
  assert.equal(a.text(), "Some Label");
  assert.equal(a.attr("class"), "wikilink wikilink-labeled");
});

test("an empty label falls back to the slug and stays a bare chip", () => {
  /* `[[slug|]]` is an authoring slip. Rendering an empty chip would be a
     silent content loss, so it degrades to the bare form. */
  const a = link("See [[some-slug|]].");
  assert.equal(a.attr("class"), "wikilink");
  assert.equal(a.text(), "some-slug");
});
