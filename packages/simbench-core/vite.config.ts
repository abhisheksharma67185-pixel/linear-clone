import { defineConfig } from "vite-plus";

export default defineConfig({
  // Library build with tsdown
  pack: {
    entry: ["src/index.ts"],
    dts: true,
    format: ["esm", "cjs"],
    sourcemap: true,
    clean: true,
  },

  // Unified format + lint + typecheck
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },

  // Vitest
  test: {
    include: ["src/**/*.test.ts"],
  },
});
