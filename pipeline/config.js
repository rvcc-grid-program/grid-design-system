/* config.js — consumer branding for the page shells.
   A wiki (or any consumer) puts grid.config.json in its repo root; the CLIs
   read it from the working directory. Missing file or fields fall back to
   the GRID defaults so the design system's own specimen builds unchanged. */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULTS = {
  program: "GRID",
  term: "Fall 2026",
  course: "IDMX-225",
};

export function loadConfig(cwd = process.cwd()) {
  try {
    const raw = JSON.parse(readFileSync(join(cwd, "grid.config.json"), "utf8"));
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}
