import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

function loadHtml(relPath) {
  const html = readFileSync(resolve(root, relPath), "utf8");
  const window = new Window({ url: "https://alpha.example/gallery/" });
  window.document.write(html);
  return { html, window, document: window.document };
}

describe("gallery collection page", () => {
  it("shows Silicon Bayou title and 198 swamp gator cards", async () => {
    const { html, document, window } = loadHtml("gallery/index.html");
    await window.happyDOM.waitUntilComplete();

    expect(html).toMatch(/Silicon Bayou/);
    expect(document.querySelector("h1")?.textContent).toMatch(/Silicon Bayou/);

    const cards = document.querySelectorAll(".card");
    expect(cards.length).toBe(198);
    expect(document.querySelector("#token-1 img")?.getAttribute("src")).toMatch(
      /art\/swamp-222\/1\.png/,
    );
    expect(document.querySelector("#token-198 img")?.getAttribute("src")).toMatch(
      /art\/swamp-222\/198\.png/,
    );
    const text = document.body.textContent;
    expect(text).toMatch(/Silicon Bayou #1/);
    expect(text).toMatch(/Silicon Bayou #198/);
    expect(text).toMatch(/Swamp 198/);
    expect(text).toMatch(/Gator Parish/);
    expect(html).not.toMatch(/metadata\/images\/1\.png/);
    expect(html).toMatch(/Engineering/);
    expect(html).toMatch(/Testing/);
    expect(html).toMatch(/Construction/);
    expect(html).toMatch(/Capital/);
  });

  it("does not claim guaranteed yield", () => {
    const { html } = loadHtml("gallery/index.html");
    expect(html.toLowerCase()).not.toMatch(/guaranteed yield/);
    expect(html.toLowerCase()).not.toMatch(/guaranteed return/);
    expect(html.toLowerCase()).not.toMatch(/guaranteed apy/);
  });
});

describe("cash-out page", () => {
  it("shows connect/skip and the 3-step Get USD copy", async () => {
    const { document, window } = loadHtml("gallery/cashout.html");
    await window.happyDOM.waitUntilComplete();

    expect(document.querySelector("#connect-wallet")).toBeTruthy();
    expect(document.querySelector("#skip-wallet")).toBeTruthy();
    const text = document.body.textContent;
    expect(text).toMatch(/Get USD/i);
    expect(text).toMatch(/Robinhood/i);
    expect(text).toMatch(/Coinbase/i);
    expect(text).toMatch(/Step 1/i);
    expect(text).toMatch(/Step 2/i);
    expect(text).toMatch(/Step 3/i);
    expect(text).toMatch(/Do not send real money/i);
    expect(document.body.innerHTML.toLowerCase()).not.toMatch(/guaranteed yield/);
  });
});

describe("bounty board page", () => {
  it("lists open bounties and first-merge-wins", async () => {
    const { document, window } = loadHtml("gallery/bounties.html");
    await window.happyDOM.waitUntilComplete();

    const cards = document.querySelectorAll("[data-bounty]");
    expect(cards.length).toBeGreaterThanOrEqual(3);
    const text = document.body.textContent;
    expect(text).toMatch(/first.merge.wins/i);
    expect(text).toMatch(/GitHub/i);
    expect(text).toMatch(/BAYOU-1/);
  });
});

describe("zero-trust gallery edges", () => {
  it("external links use rel=noopener and pages ship a CSP meta", () => {
    for (const relPath of ["gallery/index.html", "gallery/bounties.html", "gallery/cashout.html", "gallery/get.html"]) {
      const { html, document } = loadHtml(relPath);
      expect(html).toMatch(/Content-Security-Policy/);
      const externals = [...document.querySelectorAll('a[href^="http"]')];
      expect(externals.length).toBeGreaterThan(0);
      for (const a of externals) {
        expect(a.getAttribute("rel") || "").toMatch(/noopener/);
      }
    }
  });

  it("does not innerHTML untrusted GitHub issue titles", () => {
    const { html } = loadHtml("gallery/bounties.html");
    expect(html).toMatch(/api\.github\.com/);
    expect(html).toMatch(/textContent/);
    expect(html).not.toMatch(/innerHTML\s*=/);
  });

  it("wallet connect checks Robinhood chain 4663 and never treats balances as payouts", () => {
    const { html } = loadHtml("gallery/cashout.html");
    expect(html).toMatch(/0x1237/);
    expect(html).toMatch(/4663/);
    expect(html).toMatch(/not used for payouts|never pays out/i);
    expect(html).not.toMatch(/eth_getBalance/);
  });

  it("see-your-gator page adds Robinhood Chain and links OpenSea", () => {
    const { html } = loadHtml("gallery/get.html");
    expect(html).toMatch(/wallet_addEthereumChain/);
    expect(html).toMatch(/0x1237/);
    expect(html).toMatch(/opensea\.io\/collection\/silicon-bayou/);
    expect(html).toMatch(/exchange deposit/i);
    expect(html).not.toMatch(/eth_getBalance/);
  });

  it("gallery escapes interpolated token fields", () => {
    const { html } = loadHtml("gallery/index.html");
    expect(html).toMatch(/function escapeHtml/);
  });
});

describe("deploy hold", () => {
  it("keeps GENESIS_ART_READY as a hard stop", () => {
    const src = readFileSync(resolve(root, "scripts/deploy.js"), "utf8");
    expect(src).toMatch(/GENESIS_ART_READY/);
    expect(src).toMatch(/HOLD/);
  });

  it("points OpenSea JSON at live GitHub HTTPS, not ipfs://REPLACE_ME", () => {
    for (const n of [1, 2, 3, 4]) {
      const json = JSON.parse(readFileSync(resolve(root, `metadata/${n}.json`), "utf8"));
      expect(json.image).toMatch(/^https:\/\//);
      expect(json.animation_url).toMatch(/^https:\/\//);
      expect(json.image).not.toMatch(/REPLACE_ME/);
      expect(json.animation_url).not.toMatch(/REPLACE_ME/);
    }
  });

  it("caps SiliconBayou at 198", () => {
    const src = readFileSync(resolve(root, "contracts/SiliconBayou.sol"), "utf8");
    expect(src).toMatch(/MAX_SUPPLY = 198/);
  });
});
