import { defineConfig, devices } from "@playwright/test"

/**
 * Config for the Applications E2E suite. Keeping this isolated from the
 * Vitest unit tests so the two can be run independently.
 *
 * Install once: pnpm add -D @playwright/test && pnpm exec playwright install
 *
 * Targeting an already-running dev server: set `PLAYWRIGHT_BASE_URL`
 * (e.g. `PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test`).
 * When set, the harness skips spawning its own `pnpm dev` and just
 * points at the existing server.
 */
const EXTERNAL_BASE_URL = process.env.PLAYWRIGHT_BASE_URL
const BASE_URL = EXTERNAL_BASE_URL ?? "http://localhost:3000"

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  // When pointing at an existing dev server (Turbopack JIT), 5 parallel
  // workers oversubscribe the single Next.js process and a lot of
  // navigation timeouts surface as "test failures" that pass cleanly
  // when run in isolation. Cap to 2 in that mode; CI / production
  // builds keep the default.
  workers: EXTERNAL_BASE_URL ? 2 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : EXTERNAL_BASE_URL ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    // Slightly longer expect window when the dev server is the target —
    // Turbopack's first compile of a route can blow past the 5s default.
    ...(EXTERNAL_BASE_URL ? { actionTimeout: 10_000 } : {}),
  },
  ...(EXTERNAL_BASE_URL
    ? { expect: { timeout: 10_000 }, timeout: 60_000 }
    : {}),
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Disable CSS transitions/animations so Playwright's element-stability
        // check completes quickly. Without this, sidebar items with
        // `transition: opacity/max-height` delay locator.click() by 500–700 ms,
        // causing the workspace-regressions:39 URL-change budget to be exceeded.
        // The globals.css @media(prefers-reduced-motion) rule already sets
        // `transition: none` for `.sidebar-item-animated` elements.
        reducedMotion: "reduce",
      },
    },
  ],
  webServer: EXTERNAL_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
