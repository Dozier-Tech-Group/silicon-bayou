#!/usr/bin/env node
/**
 * Gator lander — merge green, non-skipped PRs onto default branches
 * (main / master) across Dozier-Tech-Group.
 *
 * Designed for CI (.github/workflows/land-prs.yml) but runs anywhere gh is
 * authenticated:
 *
 *   DRY_RUN=1 node agents/land-prs.mjs
 *   node agents/land-prs.mjs --dry-run
 *   node agents/land-prs.mjs --org Dozier-Tech-Group
 *
 * Never force-pushes. Never deletes branches. Never reruns failed workflows.
 * Skip rules: agents/land-decision.mjs (visible in this public repo).
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  decideLand,
  formatComment,
  MARKERS,
  pickMergeMethod,
} from "./land-decision.mjs";

const ORG = arg("org") || process.env.LAND_ORG || "Dozier-Tech-Group";
const DRY = process.env.DRY_RUN === "1" || process.argv.includes("--dry-run");

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function gh(args, opts = {}) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
}

function ghJson(args, fallback = null) {
  try {
    const out = gh(args);
    return out ? JSON.parse(out) : fallback;
  } catch (err) {
    if (fallback !== null) return fallback;
    throw err;
  }
}

function stderrMessage(err) {
  const extra = err?.stderr ? String(err.stderr) : "";
  return `${err?.message || err}\n${extra}`.trim();
}

function listRepos() {
  const rows = ghJson(["repo", "list", ORG, "--limit", "200", "--json", "nameWithOwner,isArchived"], []);
  return rows.filter((row) => row?.nameWithOwner && !row.isArchived).map((row) => row.nameWithOwner);
}

function listOpenPrs(repo) {
  return ghJson(
    ["pr", "list", "--repo", repo, "--state", "open", "--limit", "100", "--json", "number,title,isDraft,baseRefName"],
    [],
  );
}

function loadPr(repo, number) {
  const pr = ghJson([
    "pr",
    "view",
    String(number),
    "--repo",
    repo,
    "--json",
    "number,title,body,isDraft,baseRefName,mergeable,mergeStateStatus,reviewDecision,labels,autoMergeRequest,url,statusCheckRollup",
  ]);
  const files = ghJson(["api", "--paginate", `repos/${repo}/pulls/${number}/files`], []);
  const comments = ghJson(["api", "--paginate", `repos/${repo}/issues/${number}/comments`], []);
  const checks = (pr.statusCheckRollup || []).map((check) => ({
    name: check.name || check.context || "check",
    status: check.status,
    conclusion: check.conclusion,
    state: check.conclusion || check.status,
    description: check.description || "",
  }));
  return {
    ...pr,
    labels: (pr.labels || []).map((label) => label.name || label),
    files: (Array.isArray(files) ? files : []).map((file) => ({
      filename: file.filename,
      patch: file.patch || "",
    })),
    checks,
    commentBodies: (Array.isArray(comments) ? comments : []).map((c) => c.body || ""),
  };
}

function repoMergeSettings(repo) {
  return ghJson(
    ["repo", "view", repo, "--json", "squashMergeAllowed,mergeCommitAllowed,rebaseMergeAllowed,autoMergeAllowed"],
    { squashMergeAllowed: true, mergeCommitAllowed: true, rebaseMergeAllowed: false, autoMergeAllowed: false },
  );
}

function postComment(repo, number, body) {
  gh(["pr", "comment", String(number), "--repo", repo, "--body", body]);
}

function tryMerge(repo, number, method, useAuto) {
  const args = ["pr", "merge", String(number), "--repo", repo, `--${method}`];
  if (useAuto) args.push("--auto");
  gh(args);
}

function mergePr(repo, number, settings) {
  const method = pickMergeMethod(settings);
  try {
    tryMerge(repo, number, method, false);
    return method;
  } catch (err) {
    const msg = stderrMessage(err).toLowerCase();
    if (settings.autoMergeAllowed || /merge queue|enable auto-merge|auto.merge/.test(msg)) {
      tryMerge(repo, number, method, true);
      return `${method} --auto`;
    }
    throw err;
  }
}

function act(repo, number, decision, settings) {
  if (DRY) {
    console.log(`    [dry-run] ${decision.action}: ${decision.reason}`);
    return decision.action;
  }
  if (decision.action === "comment" && decision.comment) {
    postComment(repo, number, decision.comment);
    console.log(`    commented: ${decision.reason}`);
    return "comment";
  }
  if (decision.action === "merge") {
    const how = mergePr(repo, number, settings);
    try {
      postComment(repo, number, decision.comment || formatComment(MARKERS.MERGED, "Gator lander: merged"));
    } catch (err) {
      console.log(`    merged (${how}) but comment failed: ${stderrMessage(err).split("\n")[0]}`);
      return "merge";
    }
    console.log(`    merged (${how})`);
    return "merge";
  }
  console.log(`    ${decision.action}: ${decision.reason}`);
  return decision.action;
}

export async function runLander() {
  console.log(`Gator lander: org=${ORG} dryRun=${DRY}`);
  const summary = { merged: 0, commented: 0, skipped: 0, waited: 0, errors: 0 };

  let repos;
  try {
    repos = listRepos();
  } catch (err) {
    console.log(`Could not list ${ORG} repos: ${stderrMessage(err)}`);
    console.log("Gator lander: aborting this run (auth or gh failure).");
    return { ...summary, errors: 1, repos: 0 };
  }
  console.log(`  ${repos.length} repos`);

  const mergeSettings = new Map();

  for (const repo of repos) {
    let prs;
    try {
      prs = listOpenPrs(repo);
    } catch (err) {
      console.log(`  ${repo}: list failed — ${stderrMessage(err).split("\n")[0]}`);
      summary.errors += 1;
      continue;
    }

    const candidates = prs.filter((pr) => !pr.isDraft && (pr.baseRefName === "main" || pr.baseRefName === "master"));
    if (!candidates.length) continue;

    if (!mergeSettings.has(repo)) {
      try {
        mergeSettings.set(repo, repoMergeSettings(repo));
      } catch {
        mergeSettings.set(repo, { squashMergeAllowed: true, mergeCommitAllowed: true, autoMergeAllowed: false });
      }
    }

    for (const stub of candidates) {
      const id = `${repo}#${stub.number}`;
      try {
        const pr = loadPr(repo, stub.number);
        const decision = decideLand(pr);
        console.log(`  ${id} "${pr.title}" → ${decision.action} (${decision.reason})`);
        const result = act(repo, stub.number, decision, mergeSettings.get(repo));
        if (result === "merge") summary.merged += 1;
        else if (result === "comment") summary.commented += 1;
        else if (result === "wait") summary.waited += 1;
        else summary.skipped += 1;
      } catch (err) {
        console.log(`  ${id}: error — ${stderrMessage(err).split("\n")[0]}`);
        summary.errors += 1;
      }
    }
  }

  console.log(
    `Summary: merged=${summary.merged} commented=${summary.commented} skipped=${summary.skipped} waited=${summary.waited} errors=${summary.errors}`,
  );
  return summary;
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
  } catch {
    return path.basename(process.argv[1]) === "land-prs.mjs";
  }
}

if (isDirectRun()) {
  runLander().catch((err) => {
    console.error(err);
    process.exit(0);
  });
}
