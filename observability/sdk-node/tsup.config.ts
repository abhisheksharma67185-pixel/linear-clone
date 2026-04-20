import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/integrations/openai.ts",
    "src/integrations/anthropic.ts",
    "src/integrations/openclaw.ts",
    "src/integrations/langchain.ts",
    "src/integrations/next.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  target: "node20",
  outDir: "dist",
  treeshake: true,
});
