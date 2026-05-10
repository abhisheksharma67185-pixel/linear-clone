import { request, chromium } from "@playwright/test"

/**
 * Resets the default in-memory session before any tests run.
 * Without this, teams created by round8 tests ("Pre-existing", "R8 Conflict*")
 * accumulate in the shared server state and pollute round11d's seed check.
 *
 * Also pre-warms frequently-navigated routes so that client-side navigation
 * in E2E tests isn't delayed by on-demand Next.js compilation. Without
 * warming, the first navigation to /inbox (etc.) triggers a fresh compile
 * that can exceed the 500ms budget checked by workspace-regressions:39.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"

async function globalSetup() {
  const ctx = await request.newContext({ baseURL: BASE_URL })
  try {
    await ctx.post("/api/sim/reset")
  } catch {
    // Server may not yet be listening; the webServer block ensures it starts
    // before tests run, but in some environments startup takes a moment.
  } finally {
    await ctx.dispose()
  }

  // Warm up routes that are navigated to via client-side Link clicks in tests.
  // Visiting them now causes Next.js to compile and cache the route chunks so
  // subsequent client-side navigations are fast enough to meet the 500ms budget.
  const routesToWarm = ["/my-issues", "/inbox", "/projects", "/views"]
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    for (const route of routesToWarm) {
      try {
        await page.goto(`${BASE_URL}${route}`, {
          waitUntil: "networkidle",
          timeout: 30_000,
        })
      } catch {
        // Non-fatal: if a route fails to warm (e.g. 404), tests still run.
      }
    }
    await page.close()
  } finally {
    await browser.close()
  }
}

export default globalSetup
