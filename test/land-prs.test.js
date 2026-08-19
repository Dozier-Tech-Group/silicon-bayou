import { describe, expect, it } from "vitest";
import {
  decideLand,
  denyPathReason,
  formatComment,
  hasMarker,
  MARKERS,
  matchSkipText,
  pickMergeMethod,
  summarizeChecks,
} from "../agents/land-decision.mjs";

function greenPr(overrides = {}) {
  return {
    isDraft: false,
    title: "docs: fix typo in README",
    body: "Small copy edit.",
    labels: [],
    baseRefName: "main",
    mergeable: "MERGEABLE",
    mergeStateStatus: "CLEAN",
    reviewDecision: "",
    files: [{ filename: "README.md", patch: "@@\n+clarified the gallery URL\n" }],
    checks: [{ name: "test", status: "COMPLETED", conclusion: "SUCCESS" }],
    commentBodies: [],
    autoMergeRequest: null,
    ...overrides,
  };
}

describe("skip text", () => {
  it("catches DO NOT MERGE, do not merge yet, and DONOTMERGE", () => {
    expect(matchSkipText("x (DO NOT MERGE)", "", []).id).toBe(MARKERS.SKIP_DO_NOT_MERGE);
    expect(matchSkipText("Cut over", "**Do not merge yet.** DNS is missing.", []).id).toBe(
      MARKERS.SKIP_DO_NOT_MERGE,
    );
    expect(matchSkipText("feat", "DONOTMERGE until counsel signs", []).id).toBe(MARKERS.SKIP_DO_NOT_MERGE);
  });

  it("catches WIP, counsel, cutover, and needs human review", () => {
    expect(matchSkipText("WIP: experiments", "", []).id).toBe(MARKERS.SKIP_WIP);
    expect(matchSkipText("scrub", "outside counsel still blocking", []).id).toBe(MARKERS.SKIP_COUNSEL);
    expect(matchSkipText("Runbook for the mergedpublic.com cutover", "", []).id).toBe(MARKERS.SKIP_CUTOVER);
    expect(matchSkipText("ledger", "still needs human review before merge", []).id).toBe(
      MARKERS.SKIP_OPERATOR,
    );
  });

  it("does not skip ordinary titles", () => {
    expect(matchSkipText("Show the live 198 swamp tokens", "Gallery grids art/swamp-222.", [])).toBeNull();
  });
});

describe("deny-list files", () => {
  it("blocks frozen swamp metadata, live art, and .env but not .env.example", () => {
    expect(denyPathReason("metadata/swamp/1.json")).toBe("metadata/swamp/");
    expect(denyPathReason("art/swamp-222/1.png")).toBe("art/swamp-222/");
    expect(denyPathReason(".env")).toBe(".env");
    expect(denyPathReason(".env.local")).toBe(".env");
    expect(denyPathReason(".env.example")).toBeNull();
    expect(denyPathReason("gallery/index.html")).toBeNull();
  });
});

describe("decideLand", () => {
  it("skips drafts and non-default bases without commenting", () => {
    expect(decideLand(greenPr({ isDraft: true })).action).toBe("skip");
    expect(decideLand(greenPr({ baseRefName: "develop" })).reason).toMatch(/base develop/);
  });

  it("does not merge counsel DO NOT MERGE even when CI is green", () => {
    const decision = decideLand(
      greenPr({
        title: "Public-readiness scrub (DO NOT MERGE)",
        body: "Do not merge yet. Counsel gates remain open.",
        mergeStateStatus: "CLEAN",
        checks: [{ name: "Verify", status: "COMPLETED", conclusion: "SUCCESS" }],
      }),
    );
    expect(decision.action).toBe("comment");
    expect(decision.marker).toBe(MARKERS.SKIP_DO_NOT_MERGE);
    expect(decision.comment).toMatch(/skipped: DO NOT MERGE/);
  });

  it("does not merge a CLEAN cutover PR with no checks", () => {
    const decision = decideLand(
      greenPr({
        title: "Runbook and architecture map for the mergedpublic.com cutover",
        body: "Nothing in this runbook has been executed.",
        checks: [],
        mergeStateStatus: "CLEAN",
      }),
    );
    expect(decision.action).toBe("comment");
    expect(decision.marker).toBe(MARKERS.SKIP_CUTOVER);
  });

  it("waits on pending checks and comments once on red CI", () => {
    const pending = decideLand(
      greenPr({
        checks: [{ name: "test", status: "IN_PROGRESS", conclusion: null }],
      }),
    );
    expect(pending.action).toBe("wait");

    const red = decideLand(
      greenPr({
        mergeStateStatus: "UNSTABLE",
        checks: [{ name: "build", status: "COMPLETED", conclusion: "FAILURE" }],
      }),
    );
    expect(red.action).toBe("comment");
    expect(red.comment).toMatch(/failing check `build`/);
  });

  it("comments missing DTG_CI_PAT once and does not ask for a rerun", () => {
    const decision = decideLand(
      greenPr({
        body: "CI is expected to fail until DTG_CI_PAT exists on this repo.",
        mergeStateStatus: "UNSTABLE",
        checks: [{ name: "Step bindings resolve", status: "COMPLETED", conclusion: "FAILURE" }],
      }),
    );
    expect(decision.action).toBe("comment");
    expect(decision.marker).toBe(MARKERS.BLOCK_PAT);
    expect(decision.comment).toMatch(/blocked: missing DTG_CI_PAT/);
    expect(decision.comment).not.toMatch(/rerun/);
  });

  it("is idempotent: does not spam an existing lander comment", () => {
    const existing = formatComment(MARKERS.SKIP_DO_NOT_MERGE, "Gator lander: skipped: DO NOT MERGE");
    expect(hasMarker([existing], MARKERS.SKIP_DO_NOT_MERGE)).toBe(true);
    const decision = decideLand(
      greenPr({
        title: "feat (DO NOT MERGE)",
        commentBodies: [existing],
      }),
    );
    expect(decision.action).toBe("skip");
    expect(decision.comment).toBeNull();
  });

  it("does not treat a docs warning about deploy:mainnet as a deny-list hit", () => {
    const decision = decideLand(
      greenPr({
        files: [{ filename: "AGENTS.md", patch: "@@\n+Do not run `deploy:mainnet`.\n" }],
      }),
    );
    expect(decision.action).toBe("merge");
  });

  it("skips deny-list supply/URI edits and yield claims", () => {
    const supply = decideLand(
      greenPr({
        files: [
          {
            filename: "contracts/SiliconBayou.sol",
            patch: "@@\n-uint256 public constant MAX_SUPPLY = 198;\n+uint256 public constant MAX_SUPPLY = 10000;\n",
          },
        ],
      }),
    );
    expect(supply.action).toBe("comment");
    expect(supply.reason).toMatch(/supply\/URI/);

    const yieldClaim = decideLand(
      greenPr({
        files: [{ filename: "README.md", patch: "@@\n+Holders earn guaranteed yield via staking APY.\n" }],
      }),
    );
    expect(yieldClaim.reason).toMatch(/yield\/APY/);
  });

  it("merges a green, mergeable PR that is not skipped", () => {
    const decision = decideLand(greenPr());
    expect(decision.action).toBe("merge");
    expect(decision.comment).toMatch(/Gator lander: merged/);
    expect(decision.marker).toBe(MARKERS.MERGED);
  });

  it("prefers squash when the repo allows it", () => {
    expect(pickMergeMethod({ squashMergeAllowed: true, mergeCommitAllowed: true })).toBe("squash");
    expect(pickMergeMethod({ squashMergeAllowed: false, mergeCommitAllowed: true })).toBe("merge");
  });
});

describe("summarizeChecks", () => {
  it("treats an empty rollup as green", () => {
    expect(summarizeChecks([])).toEqual({ pending: [], failed: [] });
  });
});
