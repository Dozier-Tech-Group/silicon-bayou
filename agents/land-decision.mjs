/**
 * Pure merge-lander decisions. No gh, no network.
 *
 * Skip strings, deny-list paths, and CI rules live here so they stay visible
 * in this public repo and so vitest can cover them without mocking GitHub.
 */

export const DEFAULT_BRANCHES = new Set(["main", "master"]);

/**
 * Only org-trusted authors on same-repo branches may auto-merge. Everything
 * else — fork PRs, first-time contributors, bots (Dependabot included), and
 * PRs where authorship could not be determined — waits for a human. Fail
 * closed: a missing/unknown association is treated as external.
 */
export const TRUSTED_AUTHOR_ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

export const MARKERS = {
  SKIP_DO_NOT_MERGE: "skipped-do-not-merge",
  SKIP_WIP: "skipped-wip",
  SKIP_COUNSEL: "skipped-counsel",
  SKIP_CUTOVER: "skipped-cutover",
  SKIP_OPERATOR: "skipped-needs-operator",
  SKIP_DENY: "skipped-deny-list",
  SKIP_EXTERNAL: "skipped-external-author",
  BLOCK_CI: "blocked-ci",
  BLOCK_PAT: "blocked-missing-DTG_CI_PAT",
  BLOCK_CONFLICTS: "blocked-conflicts",
  BLOCK_REVIEWS: "blocked-reviews",
  MERGED: "merged",
};

/** Title / body / label haystack. First match wins. */
export const SKIP_TEXT_RULES = [
  {
    id: MARKERS.SKIP_DO_NOT_MERGE,
    re: /do[\s-]*not[\s-]*merge|donotmerge/i,
    comment: "Gator lander: skipped: DO NOT MERGE",
    reason: "DO NOT MERGE",
  },
  {
    id: MARKERS.SKIP_COUNSEL,
    re: /\bcounsel\b/i,
    comment: "Gator lander: skipped: counsel",
    reason: "counsel",
  },
  {
    id: MARKERS.SKIP_WIP,
    re: /\bwip\b/i,
    comment: "Gator lander: skipped: WIP",
    reason: "WIP",
  },
  {
    id: MARKERS.SKIP_CUTOVER,
    re: /\bcutover\b/i,
    comment: "Gator lander: skipped: cutover",
    reason: "cutover",
  },
  {
    id: MARKERS.SKIP_OPERATOR,
    re: /needs (?:operator|human review)/i,
    comment: "Gator lander: skipped: needs operator",
    reason: "needs operator",
  },
];

const SECRET_FAIL_RE = /DTG_CI_PAT|DTG_MERGE_PAT|secret.*not (?:configured|supplied|set)|input required and not supplied:\s*token/i;

const SUPPLY_URI_RE = /\bMAX_SUPPLY\b|uriFrozen|freezeURI|\bfreeze\s*\(|setBaseURI|_baseURI\s*=/;

const APY_CLAIM_RE = /(?:guaranteed|passive)\s+(?:yield|return|apy)|staking\s+apy/i;
const APY_NEGATION_RE = /\bno\b.{0,24}(?:yield|apy)|not (?:a )?yield|never.{0,40}(?:yield|apy)/i;

const PLAN_IMPL_RE = /implement(?:ing)?\s+PLAN\.md|full (?:PLAN\.md )?implementation/i;

const OUT_OF_SCOPE_RE = /sbir engine|crew staking|10k pixel|full kyc|fake bridges|reward tokens|public sale/i;

const PENDING_STATUS = new Set([
  "QUEUED",
  "IN_PROGRESS",
  "PENDING",
  "WAITING",
  "REQUESTED",
  "EXPECTED",
]);

const PASS_CONCLUSION = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);

export function markerHtml(id) {
  return `<!-- gator-lander:${id} -->`;
}

export function formatComment(marker, text) {
  return `${markerHtml(marker)}\n${text}`;
}

export function hasMarker(commentBodies, marker) {
  if (!marker) return false;
  const needle = markerHtml(marker);
  return (commentBodies || []).some((body) => String(body).includes(needle));
}

export function matchSkipText(title, body, labels = []) {
  const haystack = [title || "", body || "", ...(labels || [])].join("\n");
  for (const rule of SKIP_TEXT_RULES) {
    if (rule.re.test(haystack)) return rule;
  }
  if (PLAN_IMPL_RE.test(haystack) || OUT_OF_SCOPE_RE.test(haystack)) {
    return {
      id: MARKERS.SKIP_DENY,
      comment: "Gator lander: skipped: deny-list (PLAN.md / out of scope)",
      reason: "PLAN.md / out of scope",
    };
  }
  return null;
}

export function denyPathReason(filename) {
  const p = String(filename || "").replace(/\\/g, "/");
  if (p === ".env" || (p.startsWith(".env.") && p !== ".env.example")) return ".env";
  if (p === "metadata/swamp" || p.startsWith("metadata/swamp/")) return "metadata/swamp/";
  if (p === "art/swamp-222" || p.startsWith("art/swamp-222/")) return "art/swamp-222/";
  return null;
}

function patchLines(patch) {
  if (!patch) return [];
  return String(patch)
    .split("\n")
    .filter((line) => (line.startsWith("+") || line.startsWith("-")) && !line.startsWith("+++") && !line.startsWith("---"))
    .map((line) => line.slice(1));
}

function addedLines(patch) {
  if (!patch) return [];
  return String(patch)
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1));
}

export function denyContentReason(file) {
  const filename = String(file?.filename || "").replace(/\\/g, "/");
  const patch = file?.patch || "";
  const lines = patchLines(patch);
  const added = addedLines(patch);

  if (filename.endsWith("contracts/SiliconBayou.sol") || filename === "contracts/SiliconBayou.sol") {
    if (lines.some((line) => SUPPLY_URI_RE.test(line))) {
      return "contracts/SiliconBayou.sol supply/URI";
    }
  }

  const looksLikeDoc = /\.(md|txt)$/i.test(filename);
  if (!looksLikeDoc && added.some((line) => line.includes("deploy:mainnet"))) {
    return "deploy:mainnet";
  }

  if (added.some((line) => APY_CLAIM_RE.test(line) && !APY_NEGATION_RE.test(line))) {
    return "yield/APY claim";
  }

  return null;
}

export function matchDenyFiles(files = []) {
  for (const file of files) {
    const pathHit = denyPathReason(file.filename);
    if (pathHit) {
      return {
        id: MARKERS.SKIP_DENY,
        comment: `Gator lander: skipped: deny-list files (${pathHit})`,
        reason: `deny-list files (${pathHit})`,
      };
    }
    const contentHit = denyContentReason(file);
    if (contentHit) {
      return {
        id: MARKERS.SKIP_DENY,
        comment: `Gator lander: skipped: deny-list (${contentHit})`,
        reason: `deny-list (${contentHit})`,
      };
    }
  }
  return null;
}

export function summarizeChecks(checks = []) {
  const pending = [];
  const failed = [];
  for (const check of checks) {
    const status = String(check.status || "").toUpperCase();
    const conclusion = String(check.conclusion || check.state || "").toUpperCase();
    const name = check.name || check.context || "check";
    const mappedState = String(check.state || "").toLowerCase();

    if (PENDING_STATUS.has(status) || ["pending", "queued", "in_progress"].includes(mappedState)) {
      pending.push(name);
      continue;
    }
    if (PASS_CONCLUSION.has(conclusion) || mappedState === "pass" || mappedState === "skipping" || mappedState === "skipped") {
      continue;
    }
    if (["fail", "failure", "cancelled", "timed_out", "action_required", "startup_failure"].includes(mappedState) || (conclusion && !PASS_CONCLUSION.has(conclusion))) {
      failed.push(name);
    }
  }
  return { pending, failed };
}

export function looksLikeMissingSecret(checks, haystack) {
  if (SECRET_FAIL_RE.test(haystack || "")) return true;
  return (checks || []).some((check) => SECRET_FAIL_RE.test(`${check.name || ""} ${check.description || ""} ${check.conclusion || ""} ${check.state || ""}`));
}

function safeCheckName(name) {
  return String(name || "check").replace(/[`\r\n]/g, " ").slice(0, 80);
}

function alreadyCommented(commentBodies, spec) {
  if (hasMarker(commentBodies, spec.id)) {
    return {
      action: "skip",
      reason: `${spec.reason} (already commented)`,
      marker: spec.id,
      comment: null,
    };
  }
  return {
    action: "comment",
    reason: spec.reason,
    marker: spec.id,
    comment: formatComment(spec.id, spec.comment),
  };
}

/**
 * Decide what the lander should do with one PR.
 *
 * @returns {{ action: "merge"|"wait"|"skip"|"comment", reason: string, marker: string|null, comment: string|null }}
 */
export function decideLand(pr) {
  const title = pr.title || "";
  const body = pr.body || "";
  const labels = (pr.labels || []).map((label) => (typeof label === "string" ? label : label.name)).filter(Boolean);
  const files = pr.files || [];
  const checks = pr.checks || [];
  const commentBodies = pr.commentBodies || [];
  const haystack = [title, body, ...labels].join("\n");

  if (pr.isDraft) {
    return { action: "skip", reason: "draft", marker: null, comment: null };
  }

  if (pr.baseRefName && !DEFAULT_BRANCHES.has(pr.baseRefName)) {
    return { action: "skip", reason: `base ${pr.baseRefName}`, marker: null, comment: null };
  }

  if (pr.isCrossRepository || !TRUSTED_AUTHOR_ASSOCIATIONS.has(pr.authorAssociation)) {
    return alreadyCommented(commentBodies, {
      id: MARKERS.SKIP_EXTERNAL,
      comment: "Gator lander: skipped: external or unverified author — a human must review and merge",
      reason: `external author (${pr.authorAssociation || "unknown"}${pr.isCrossRepository ? ", fork" : ""})`,
    });
  }

  const textSkip = matchSkipText(title, body, labels);
  if (textSkip) return alreadyCommented(commentBodies, textSkip);

  const deny = matchDenyFiles(files);
  if (deny) return alreadyCommented(commentBodies, deny);

  if (pr.mergeable === "CONFLICTING" || pr.mergeStateStatus === "DIRTY") {
    return alreadyCommented(commentBodies, {
      id: MARKERS.BLOCK_CONFLICTS,
      comment: "Gator lander: blocked: merge conflicts",
      reason: "merge conflicts",
    });
  }

  const { pending, failed } = summarizeChecks(checks);
  if (pending.length) {
    return {
      action: "wait",
      reason: `pending checks: ${pending.join(", ")}`,
      marker: null,
      comment: null,
    };
  }
  if (failed.length) {
    if (looksLikeMissingSecret(checks, haystack)) {
      return alreadyCommented(commentBodies, {
        id: MARKERS.BLOCK_PAT,
        comment: "Gator lander: blocked: missing DTG_CI_PAT",
        reason: "missing DTG_CI_PAT",
      });
    }
    return alreadyCommented(commentBodies, {
      id: MARKERS.BLOCK_CI,
      comment: `Gator lander: blocked: failing check \`${safeCheckName(failed[0])}\``,
      reason: `CI red: ${failed.join(", ")}`,
    });
  }

  if (pr.reviewDecision === "CHANGES_REQUESTED") {
    return alreadyCommented(commentBodies, {
      id: MARKERS.BLOCK_REVIEWS,
      comment: "Gator lander: blocked: changes requested",
      reason: "changes requested",
    });
  }

  if (pr.mergeable === "UNKNOWN" || pr.mergeStateStatus === "UNKNOWN") {
    return { action: "wait", reason: "mergeability unknown", marker: null, comment: null };
  }

  if (pr.mergeStateStatus === "BLOCKED") {
    return alreadyCommented(commentBodies, {
      id: MARKERS.BLOCK_REVIEWS,
      comment: "Gator lander: blocked: reviews or branch protection",
      reason: "reviews or branch protection",
    });
  }

  if (pr.autoMergeRequest) {
    return { action: "wait", reason: "auto-merge already enabled", marker: null, comment: null };
  }

  if (pr.mergeable !== "MERGEABLE") {
    return { action: "wait", reason: `not mergeable (${pr.mergeable || "empty"})`, marker: null, comment: null };
  }

  return {
    action: "merge",
    reason: "green and mergeable",
    marker: MARKERS.MERGED,
    comment: formatComment(MARKERS.MERGED, "Gator lander: merged"),
  };
}

export function pickMergeMethod(repo) {
  if (repo?.squashMergeAllowed !== false) return "squash";
  if (repo?.mergeCommitAllowed) return "merge";
  if (repo?.rebaseMergeAllowed) return "rebase";
  return "squash";
}
