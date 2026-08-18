#!/usr/bin/env node
/**
 * Gator Works runner — executes ONE funded open task as a holder's agent.
 *
 * Designed for CI (.github/workflows/gator-agents.yml) but runs anywhere:
 *
 *   DRY_RUN=1 node agents/run-agent.mjs            # plan only, no side effects
 *   node agents/run-agent.mjs --agent <github>     # run for a specific agent
 *   node agents/run-agent.mjs --task 1001          # run a specific task
 *
 * Requires in real runs: ANTHROPIC_API_KEY, gh CLI authenticated, git identity.
 * The agent works on a branch gator/<tokenId>/task-<issueId> and opens a PR
 * titled "[Gator #N] <title>" whose body carries the holder wallet + issueId
 * so the oracle can settle the bounty after merge.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.env.DRY_RUN === "1";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

function sh(cmd, opts = {}) {
  if (DRY) {
    console.log("  [dry-run] " + cmd);
    return "";
  }
  return execSync(cmd, { stdio: ["ignore", "pipe", "inherit"], encoding: "utf8", ...opts }).trim();
}

const registry = JSON.parse(readFileSync(join(ROOT, "agents", "registry.json"), "utf8"));
const queue = JSON.parse(readFileSync(join(ROOT, "agents", "tasks.json"), "utf8"));

const agentName = arg("agent");
const agent = agentName
  ? registry.agents.find((a) => a.github === agentName)
  : registry.agents[0];
if (!agent) {
  console.log(agentName ? `No verified agent '${agentName}' in registry.` : "Registry has no verified agents yet — nothing to run.");
  process.exit(0);
}

const taskId = arg("task") ? Number(arg("task")) : null;
const task = queue.tasks.find(
  (t) => (taskId ? t.issueId === taskId : true) && t.status === "open" && (t.funded || DRY)
);
if (!task) {
  console.log(taskId ? `Task ${taskId} is not open+funded.` : "No open funded tasks. (Unfunded tasks run only under DRY_RUN=1.)");
  process.exit(0);
}

const tokenId = agent.tokenIds?.[0] ?? 0;
const branch = `gator/${tokenId}/task-${task.issueId}`;
const title = `[Gator #${tokenId}] ${task.title}`;

console.log(`Gator Works: agent=${agent.github} wallet=${agent.wallet}`);
console.log(`Task ${task.issueId} (${task.repo}): ${task.title} — ${task.rewardMC} MC${task.funded ? "" : " (UNFUNDED, dry-run only)"}`);
console.log(`Branch ${branch}\n`);

// 1. workspace: this repo, or a clone of the target repo
let cwd = ROOT;
if (task.repo !== "Dozier-Tech-Group/silicon-bayou") {
  cwd = join(ROOT, ".gator-work", task.repo.split("/")[1]);
  sh(`gh repo clone ${task.repo} "${cwd}" -- --depth 1`);
}
sh(`git -C "${cwd}" checkout -b ${branch}`);

// 2. the agent does the work (headless Claude Code, edits auto-accepted,
//    bounded turns so a stuck task cannot burn unlimited budget)
const prompt = `${task.prompt}\n\nYou are working as Silicon Bayou Gator #${tokenId} on bounty issue ${task.issueId}. Keep the diff minimal and the repo's tests green.`;
sh(`npx --yes @anthropic-ai/claude-code -p ${JSON.stringify(prompt)} --permission-mode acceptEdits --max-turns 40`, { cwd, stdio: "inherit" });

// 3. commit + PR with the gator identity; the oracle settles from this body
const status = DRY ? "" : sh(`git -C "${cwd}" status --porcelain`);
if (!DRY && !status) {
  console.log("Agent produced no changes; nothing to open.");
  process.exit(0);
}
sh(`git -C "${cwd}" add -A`);
sh(`git -C "${cwd}" commit -m ${JSON.stringify(title)} -m ${JSON.stringify("Gator Works task " + task.issueId + " for holder " + agent.wallet)}`);
sh(`git -C "${cwd}" push -u origin ${branch}`);
const body = [
  `Automated Gator Works submission.`,
  ``,
  `- Bounty issueId: **${task.issueId}** (${task.rewardMC} MC)`,
  `- Gator: **#${tokenId}** held by \`${agent.wallet}\``,
  `- Agent operator: @${agent.github}`,
  ``,
  `Human review required. If this PR merges first, the oracle settles the bounty:`,
  `\`npm run settle -- --issue ${task.issueId} --winner ${agent.wallet}\``,
].join("\n");
sh(`gh pr create --repo ${task.repo} --head ${branch} --title ${JSON.stringify(title)} --body ${JSON.stringify(body)}`, { cwd });
console.log(DRY ? "\nDry run complete — no changes made." : "\nPR opened.");
