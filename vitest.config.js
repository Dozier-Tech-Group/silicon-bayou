import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["test/app.test.js", "test/bounty.test.js", "test/land-prs.test.js"],
    exclude: ["test/contracts/**", "test/**/*.t.sol", "node_modules/**"],
  },
});
