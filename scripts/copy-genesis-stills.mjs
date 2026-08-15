#!/usr/bin/env node
/**
 * Freeze hybrid painted PFPs as genesis stills.
 * Copies art/gators/{class}-gator.png → still + metadata/images/N.png
 * and into merged-website public/bayou when that sibling exists.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const gators = join(root, "art", "gators");
const images = join(root, "metadata", "images");
mkdirSync(images, { recursive: true });
mkdirSync(gators, { recursive: true });

const MAP = [
  { src: "engineering-gator.png", still: "engineering-gator-still.png", n: 1 },
  { src: "testing-gator.png", still: "testing-gator-still.png", n: 2 },
  { src: "construction-gator.png", still: "construction-gator-still.png", n: 3 },
  { src: "capital-gator.png", still: "capital-gator-still.png", n: 4 },
];

const dest = "C:\\Users\\gdozi\\OneDrive\\Desktop\\CLIENTS\\MERGED\\Merged-Inc\\merged-website\\public\\bayou";
const websiteRoot = "C:\\Users\\gdozi\\OneDrive\\Desktop\\CLIENTS\\MERGED\\Merged-Inc\\merged-website";
if (existsSync(websiteRoot)) mkdirSync(dest, { recursive: true });

const missing = [];
for (const row of MAP) {
  const from = join(gators, row.src);
  if (!existsSync(from)) {
    missing.push(from);
    continue;
  }
  copyFileSync(from, join(gators, row.still));
  copyFileSync(from, join(images, `${row.n}.png`));
  const htmlSrc = join(images, `${row.n}.html`);
  if (existsSync(websiteRoot) && existsSync(htmlSrc)) {
    copyFileSync(from, join(dest, `${row.n}.png`));
    copyFileSync(htmlSrc, join(dest, `${row.n}.html`));
  }
  console.log("froze", row.src, "→", row.still, `and metadata/images/${row.n}.png`);
}

if (missing.length) {
  console.error("Missing hero files:\n" + missing.join("\n"));
  process.exit(1);
}
