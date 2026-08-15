#!/usr/bin/env node
/**
 * Pin Silicon Bayou GENESIS assets only:
 *   metadata/images/1.png … 4.png  (hybrid hero portraits — NOT photoreal, NOT pixel)
 *   metadata/1.json … 4.json
 *
 * HOLD: do not pin until hybrid art is approved and GENESIS_ART_READY=1.
 * NEVER pin generator/out (rejected pixel pipeline).
 * NEVER pin the current photoreal cinematic gators unless art is marked ready.
 *
 * Unblock with ONE of:
 *   PINATA_JWT
 *   NFT_STORAGE_KEY
 *   WEB3_STORAGE_TOKEN
 *   LIGHTHOUSE_API_KEY
 *
 * Usage (PowerShell):
 *   $env:PINATA_JWT="eyJ..."
 *   node scripts/pin.mjs
 */
import { createReadStream, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const imagesDir = join(root, "metadata", "images");
const metaDir = join(root, "metadata");
const outDir = join(root, "deployments");

if (process.env.GENESIS_ART_READY !== "1") {
  console.error(`
HOLD: hybrid genesis art is not marked ready.
Do not pin the current photoreal cinematic gators.
Do not pin generator/out pixel JPGs.
When the new art/gators/*.png (and metadata/images/1-4.png) land:

  $env:GENESIS_ART_READY="1"
  $env:PINATA_JWT="..."   # or NFT_STORAGE_KEY / WEB3_STORAGE_TOKEN / LIGHTHOUSE_API_KEY
  node scripts/pin.mjs
`);
  process.exit(2);
}

const FORBIDDEN = ["generator/out", "generator\\out"];

function assertSafe(p) {
  const norm = p.replace(/\\/g, "/").toLowerCase();
  for (const bad of FORBIDDEN) {
    if (norm.includes(bad.replace(/\\/g, "/"))) {
      throw new Error(`Refusing to pin ${p} — genesis uses HD portraits only, not generator/out`);
    }
  }
}

const imageFiles = [1, 2, 3, 4].flatMap((n) => [
  join(imagesDir, `${n}.png`),
  join(imagesDir, `${n}.html`),
]);
const jsonFiles = [1, 2, 3, 4].map((n) => join(metaDir, `${n}.json`));

for (const f of [...imageFiles, ...jsonFiles]) {
  assertSafe(f);
  if (!existsSync(f)) {
    throw new Error(`Missing genesis file: ${f}`);
  }
}

const pinataJwt = process.env.PINATA_JWT;
const nftStorageKey = process.env.NFT_STORAGE_KEY;
const web3StorageToken = process.env.WEB3_STORAGE_TOKEN;
const lighthouseKey = process.env.LIGHTHOUSE_API_KEY;

function writeIpfsRecord(record) {
  mkdirSync(outDir, { recursive: true });
  const dest = join(outDir, "ipfs.json");
  writeFileSync(dest, JSON.stringify(record, null, 2) + "\n");
  console.log("Wrote", dest);
}

function rewriteMetadataImages(imageCid) {
  for (const n of [1, 2, 3, 4]) {
    const path = join(metaDir, `${n}.json`);
    const json = JSON.parse(readFileSync(path, "utf8"));
    json.image = `ipfs://${imageCid}/${n}.png`;
    json.animation_url = `ipfs://${imageCid}/${n}.html`;
    writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
  }
}

async function pinPinataFolder(files, name) {
  const form = new FormData();
  for (const filePath of files) {
    const buf = readFileSync(filePath);
    form.append("file", new Blob([buf]), `${name}/${basename(filePath)}`);
  }
  form.append("pinataMetadata", JSON.stringify({ name: `silicon-bayou-${name}` }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1, wrapWithDirectory: true }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${pinataJwt}` },
    body: form,
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Pinata ${name} failed (${res.status}): ${body}`);
  }
  const data = JSON.parse(body);
  return data.IpfsHash;
}

async function pinNftStorageFile(filePath, key) {
  const buf = readFileSync(filePath);
  const res = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/octet-stream",
    },
    body: buf,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`nft.storage failed: ${JSON.stringify(data)}`);
  }
  return data.value.cid;
}

async function pinWeb3StorageFile(filePath, token) {
  const buf = readFileSync(filePath);
  const res = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Name": basename(filePath),
    },
    body: buf,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`web3.storage failed: ${JSON.stringify(data)}`);
  }
  return data.cid;
}

async function pinLighthouseFile(filePath, key) {
  const form = new FormData();
  const buf = readFileSync(filePath);
  form.append("file", new Blob([buf]), basename(filePath));
  const res = await fetch("https://node.lighthouse.storage/api/v0/add", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const data = await res.json();
  if (!res.ok && !data.Hash) {
    throw new Error(`Lighthouse failed: ${JSON.stringify(data)}`);
  }
  return data.Hash;
}

function printUnblockCommands() {
  console.log(`
No pin key found. Genesis pin is HD-only (metadata/images/1-4.png + metadata/*.json).
Do NOT upload generator/out.

PowerShell — pick ONE key, then run node scripts/pin.mjs:

  $env:PINATA_JWT="eyJ..."
  node scripts/pin.mjs

  $env:NFT_STORAGE_KEY="..."
  node scripts/pin.mjs

  $env:WEB3_STORAGE_TOKEN="..."
  node scripts/pin.mjs

  $env:LIGHTHOUSE_API_KEY="..."
  node scripts/pin.mjs

Pinata (folder wrap, preferred):
  curl.exe -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \`
    -H "Authorization: Bearer $env:PINATA_JWT" \`
    -F "file=@metadata/images/1.png;filename=images/1.png" \`
    -F "file=@metadata/images/2.png;filename=images/2.png" \`
    -F "file=@metadata/images/3.png;filename=images/3.png" \`
    -F "file=@metadata/images/4.png;filename=images/4.png"

Then rewrite metadata image fields to ipfs://<IMAGES_CID>/N.png and pin the four JSON files
the same way (filenames 1.json … 4.json at the folder root). Set:

  $env:BASE_URI="ipfs://<JSON_CID>/"
  npm run set-base-uri

Interim public URL (already committed JSON + images on GitHub):
  https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/
`);
}

async function main() {
  if (pinataJwt) {
    console.log("Pinning HD images 1-4 via Pinata (not generator/out)…");
    const imageCid = await pinPinataFolder(imageFiles, "images");
    console.log("Images CID:", imageCid);
    rewriteMetadataImages(imageCid);
    console.log("Pinning metadata JSON 1-4 via Pinata…");
    const jsonCid = await pinPinataFolder(jsonFiles, "metadata");
    const baseURI = `ipfs://${jsonCid}/`;
    writeIpfsRecord({
      imagesCid: imageCid,
      metadataCid: jsonCid,
      baseURI,
      gateway: `https://gateway.pinata.cloud/ipfs/${jsonCid}/`,
      source: "metadata/images/1-4.png + metadata/*.json",
      excluded: "generator/out",
    });
    console.log("BASE_URI=", baseURI);
    console.log("tokenURI(1)=", `${baseURI}1.json`);
    return;
  }

  if (nftStorageKey || web3StorageToken || lighthouseKey) {
    const label = nftStorageKey ? "nft.storage" : web3StorageToken ? "web3.storage" : "lighthouse";
    const pinOne = nftStorageKey
      ? (p) => pinNftStorageFile(p, nftStorageKey)
      : web3StorageToken
        ? (p) => pinWeb3StorageFile(p, web3StorageToken)
        : (p) => pinLighthouseFile(p, lighthouseKey);

    console.log(`Pinning HD files individually via ${label} (directory CID needs Pinata wrap).`);
    const images = {};
    for (const n of [1, 2, 3, 4]) {
      const cid = await pinOne(join(imagesDir, `${n}.png`));
      images[n] = cid;
      console.log(`  ${n}.png => ipfs://${cid}`);
    }
    for (const n of [1, 2, 3, 4]) {
      const path = join(metaDir, `${n}.json`);
      const json = JSON.parse(readFileSync(path, "utf8"));
      json.image = `ipfs://${images[n]}`;
      writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
    }
    const metas = {};
    for (const n of [1, 2, 3, 4]) {
      const cid = await pinOne(join(metaDir, `${n}.json`));
      metas[n] = cid;
      console.log(`  ${n}.json => ipfs://${cid}`);
    }
    writeIpfsRecord({
      provider: label,
      images,
      metadata: metas,
      note: "Per-file CIDs. Prefer PINATA_JWT so tokenURI can be ipfs://<dirCid>/N.json. Or set a custom tokenURI mapper.",
      excluded: "generator/out",
    });
    console.log("Per-file pin done. Pinata JWT gives a single directory CID for BASE_URI.");
    return;
  }

  printUnblockCommands();
  writeIpfsRecord({
    status: "blocked_no_pin_key",
    interimBaseURI:
      "https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/",
    source: "metadata/images/1-4.png + metadata/*.json",
    excluded: "generator/out",
  });
  process.exitCode = 2;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
