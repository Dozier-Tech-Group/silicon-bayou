/**
 * First-merge-wins bounty claims for closed-alpha unit tests.
 * Not a live payout system. No real money.
 */

function createBoard(issues) {
  const open = Array.isArray(issues) ? issues.map((issue) => ({ ...issue })) : [];
  const claims = new Map();

  return {
    issues: open,
    claim(issueId, github, wallet) {
      if (!issueId || !github || !wallet) {
        throw new Error("issueId, github, and wallet are required");
      }
      const issue = open.find((row) => row.id === issueId);
      if (!issue) {
        throw new Error(`unknown issue: ${issueId}`);
      }
      if (claims.has(issueId)) {
        return {
          ok: false,
          reason: "first-merge-wins",
          winner: claims.get(issueId),
        };
      }
      const record = { github, wallet, at: Date.now() };
      claims.set(issueId, record);
      issue.status = "claimed";
      return { ok: true, claim: record };
    },
    winner(issueId) {
      return claims.get(issueId) || null;
    },
  };
}

module.exports = { createBoard };
