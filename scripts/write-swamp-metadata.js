#!/usr/bin/env node
const { mkdirSync, writeFileSync } = require("fs");
const { join } = require("path");

const N = 198;
const outDir = join(__dirname, "..", "metadata", "swamp");
const IMAGE =
  "https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/art/swamp-222";

mkdirSync(outDir, { recursive: true });

for (let n = 1; n <= N; n++) {
  const json = {
    name: `Silicon Bayou #${n}`,
    description:
      "Swamp gator of Silicon Bayou — capability layer for merged (Merged, Inc.), the open source institutional network. A Louisiana alligator from Gator Parish. Cryptographic identity; not a legal contract.",
    image: `${IMAGE}/${n}.png`,
    external_url: "https://www.mergedpublic.com",
    attributes: [
      { trait_type: "Region", value: "Gator Parish" },
      { trait_type: "Drop", value: "Swamp 198" },
      { trait_type: "Token", value: n, display_type: "number", max_value: N },
    ],
  };
  writeFileSync(join(outDir, `${n}.json`), JSON.stringify(json, null, 2) + "\n");
}

console.log(`Wrote ${N} metadata files to ${outDir}`);
