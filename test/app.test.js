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
  it("shows Silicon Bayou title and four gator cards", async () => {
    const { html, document, window } = loadHtml("gallery/index.html");
    await window.happyDOM.waitUntilComplete();

    expect(html).toMatch(/Silicon Bayou/);
    expect(document.querySelector("h1")?.textContent).toMatch(/Silicon Bayou/);

    const cards = document.querySelectorAll(".card");
    expect(cards.length).toBe(4);
    const text = document.body.textContent;
    expect(text).toMatch(/Engineering Gator/);
    expect(text).toMatch(/Testing Gator/);
    expect(text).toMatch(/Construction Gator/);
    expect(text).toMatch(/Capital Gator/);
    expect(text).toMatch(/Software & Electrical Systems/);
    expect(text).toMatch(/Inspection & Quality Assurance/);
    expect(text).toMatch(/Field Construction & Welding/);
    expect(text).toMatch(/Project Finance & Investment/);
    expect(text).toMatch(/Engineering/);
    expect(text).toMatch(/Testing/);
    expect(text).toMatch(/Construction/);
    expect(text).toMatch(/Capital/);
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
