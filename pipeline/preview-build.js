#!/usr/bin/env node
/* Build a styled HTML preview of a wiki markdown page (classes + <style>).
   Usage: node preview-build.js <page.md>  (or: pnpm run preview <page.md>) */

import { writeFileSync } from "node:fs";
import * as cheerio from "cheerio";
import { renderPage } from "./markdown.js";
import { previewPage } from "./templates.js";
import { enhance, loadSystemCss } from "./enhance.js";
import { loadConfig } from "./config.js";

const src = process.argv[2];
if (!src) {
  console.error("usage: node preview-build.js <page.md>");
  process.exit(1);
}
const out = src.replace(/\.md$/, ".html");

const { data, html } = renderPage(src);
const doc = previewPage({
  title: data.title ?? src,
  moduleTitle: data.module_title,
  bodyHtml: html,
  css: loadSystemCss(),
  config: loadConfig(),
});

writeFileSync(out, (await enhance(cheerio.load(doc))).html());
console.log(`built ${out}`);
