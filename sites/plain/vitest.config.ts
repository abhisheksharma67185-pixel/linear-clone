import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, ".")}/`,
      "@thetabench/core": path.resolve(
        __dirname,
        "../../packages/thetabench-core/src/index.ts"
      ),
    },
  },
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    globals: false,
    // Engine + smoke tests land alongside the panel build; vitest must
    // not fail the pre-push gate while the suite is empty.
    passWithNoTests: true,
  },
})
