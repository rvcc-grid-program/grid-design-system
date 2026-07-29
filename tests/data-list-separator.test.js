/* data-list separator tolerance — regression test.

   The separator between `**key**` and the value is author-facing sugar, not
   syntax students see (DECISIONS.md 24). enhance.js strips ONE optional
   leading em dash, en dash, hyphen, or colon from the value, so all four —
   and no separator at all — produce byte-identical <dd> text.

   This pins that tolerance: a refactor that tightens the regex at
   enhance.js:117 to only the em dash fails here instead of silently
   breaking human-authored consumer pages (handoff from idmx-225,
   2026-07-29).

   Run: pnpm test */

import test from "node:test";
import assert from "node:assert/strict";
import * as cheerio from "cheerio";
import { md } from "../pipeline/markdown.js";
import { enhance } from "../pipeline/enhance.js";

/* Each case: the separator as authored, and the label used in failures.
   The value text is identical across cases on purpose — the assertion is
   that the separator leaves no trace whatsoever. */
const SEPARATORS = [
  { label: "em dash", sep: "— " },
  { label: "en dash", sep: "– " },
  { label: "hyphen", sep: "- " },
  { label: "colon", sep: ": " },
  { label: "no separator", sep: "" },
];

const VALUE = "value text.";

function page(cases) {
  const items = cases.map((c, i) => `- **Key ${i}** ${c.sep}${VALUE}`);
  return ["::: data-list", "", ...items, "", ":::", ""].join("\n");
}

async function dataList(markdown) {
  const $ = await enhance(cheerio.load(md.render(markdown)));
  return $("dl.data-list");
}

test("every separator variant yields the same clean <dd>", async () => {
  const dl = await dataList(page(SEPARATORS));
  const dds = dl.find("> dd");

  assert.equal(
    dds.length,
    SEPARATORS.length,
    "one <dd> per authored item, as direct children of the <dl>",
  );

  SEPARATORS.forEach((c, i) => {
    const text = dds.eq(i).text();
    assert.equal(
      text,
      VALUE,
      `${c.label}: <dd> must start at the value with no leading punctuation or space`,
    );
  });
});

test("the bold lead becomes the key chip, whatever the separator", async () => {
  const dl = await dataList(page(SEPARATORS));
  const dts = dl.find("> dt");

  assert.equal(dts.length, SEPARATORS.length);
  SEPARATORS.forEach((c, i) => {
    assert.equal(
      dts.eq(i).find("span.data-key").text(),
      `Key ${i}`,
      `${c.label}: key text lands in the .data-key chip`,
    );
  });
});

test("only ONE separator is consumed — a second dash is content", async () => {
  /* Guards against a greedy rewrite (e.g. `[—–\-:]+`) eating punctuation the
     author meant to keep, such as a value that legitimately opens with a
     dash-led aside. */
  const dl = await dataList(["::: data-list", "", "- **Key** - - kept.", "", ":::", ""].join("\n"));
  assert.equal(dl.find("> dd").eq(0).text(), "- kept.");
});

test("dt and dd are DIRECT children of the dl (Canvas unwraps wrappers)", async () => {
  const dl = await dataList(page(SEPARATORS));
  const children = dl
    .children()
    .toArray()
    .map((el) => el.tagName);
  assert.deepEqual(
    new Set(children),
    new Set(["dt", "dd"]),
    "no wrapper element may sit between <dl> and its dt/dd (DECISIONS.md 19)",
  );
});
