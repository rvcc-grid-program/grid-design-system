#!/usr/bin/env node
/* Build the public Pages site in docs/ (pnpm run site).
   docs/ is the deployed web root, so the inlined @font-face url("../fonts/")
   from grid-fonts.css would escape it and 404. This script:
   1. builds docs/index.html from docs/index.md (same preview pipeline),
   2. copies the specimen pages in (specimen.html, specimen.canvas.html,
      and specimen.webpage.html = the semantic full-page preview),
   3. copies /fonts → docs/fonts (binaries + OFL licenses),
   4. rewrites url("../fonts/") → url("fonts/") in every docs/*.html so the
      fonts resolve from the served root. See DECISIONS.md "typographic voice". */

import { execFileSync } from "node:child_process";
import { cpSync, copyFileSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");

// 1. landing page
execFileSync(
  process.execPath,
  [join(root, "pipeline", "preview-build.js"), join(docs, "index.md")],
  {
    stdio: "inherit",
  },
);

// 2. specimen pages
copyFileSync(join(root, "specimen", "specimen.html"), join(docs, "specimen.html"));
copyFileSync(join(root, "specimen", "specimen.canvas.html"), join(docs, "specimen.canvas.html"));
copyFileSync(join(root, "specimen", "specimen.html"), join(docs, "specimen.webpage.html"));

// 3. font binaries + licenses
cpSync(join(root, "fonts"), join(docs, "fonts"), { recursive: true });

// 4. rewrite the inlined font paths for the docs web root
for (const name of readdirSync(docs).filter((f) => f.endsWith(".html"))) {
  const file = join(docs, name);
  const html = readFileSync(file, "utf8");
  const fixed = html.replaceAll('url("../fonts/', 'url("fonts/');
  if (fixed !== html) writeFileSync(file, fixed);
}
console.log("site built in docs/ (fonts copied, paths rewritten)");
