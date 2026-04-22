import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
  },
  format: ["esm"],
  target: "node20",
  platform: "node",
  dts: true,
  clean: true,
  sourcemap: true,
  // Force `.js` extensions so the `bin` entry stays predictable across versions.
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  // `@thetabench/core` ships source-only (no `main`/`exports` field), so we
  // inline it into our bundle. Everything else stays external — npm will pull
  // the right versions at install time.
  deps: {
    alwaysBundle: ["@thetabench/core"],
    neverBundle: [
      "commander",
      "picocolors",
      "ora",
      "@clack/prompts",
      "cli-table3",
    ],
  },
  outputOptions: {
    banner: (chunk) =>
      chunk.fileName === "cli.js" ? "#!/usr/bin/env node" : "",
  },
})
