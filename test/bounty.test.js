import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createBoard } from "../testers/bounty.js";

const fixtures = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../testers/fixtures.json"), "utf8"),
);

describe("closed-alpha tester fixtures", () => {
  it("has 3 mock wallets and 3 GitHub usernames", () => {
    expect(fixtures.testers).toHaveLength(3);
    const wallets = new Set(fixtures.testers.map((t) => t.wallet));
    const logins = new Set(fixtures.testers.map((t) => t.github));
    expect(wallets.size).toBe(3);
    expect(logins.size).toBe(3);
    for (const tester of fixtures.testers) {
      expect(tester.wallet).toMatch(/^0x[0-9a-fA-F]{40}$/);
      expect(tester.github).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe("bounty first-merge-wins", () => {
  it("lets the first of 3 fixture testers claim; later claims lose", () => {
    const [pat, jordan, sam] = fixtures.testers;
    const board = createBoard(fixtures.bounties);
    const first = board.claim("BAYOU-1", jordan.github, jordan.wallet);
    expect(first.ok).toBe(true);
    expect(first.claim.github).toBe("jordan-bayou-alpha");

    const second = board.claim("BAYOU-1", pat.github, pat.wallet);
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("first-merge-wins");
    expect(second.winner.github).toBe(jordan.github);
    expect(board.winner("BAYOU-1").wallet).toBe(jordan.wallet);

    const other = board.claim("BAYOU-3", sam.github, sam.wallet);
    expect(other.ok).toBe(true);
    expect(board.winner("BAYOU-3").github).toBe("sam-parish-alpha");
  });

  it("rejects unknown issues and missing identity", () => {
    const board = createBoard(fixtures.bounties);
    const [pat] = fixtures.testers;
    expect(() => board.claim("BAYOU-99", pat.github, pat.wallet)).toThrow(/unknown issue/);
    expect(() => board.claim("BAYOU-1", "", pat.wallet)).toThrow(/required/);
  });
});
