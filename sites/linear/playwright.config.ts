import { defineConfig, devices } from "@playwright/test"

/**
 * Config for the Applications E2E suite. Keeping this isolated from the
 * Vitest unit tests so the two can be run independently.
 *
 * Install once: pnpm add -D @playwright/test && pnpm exec playwright install
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
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
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
