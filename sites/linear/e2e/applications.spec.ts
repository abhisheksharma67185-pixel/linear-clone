/**
 * Playwright E2E for the Applications settings page.
 *
 * Runs against a live Next.js dev server. To execute:
 *   pnpm add -D @playwright/test
 *   pnpm exec playwright install --with-deps chromium
 *   pnpm exec playwright test
 *
 * Start the dev server separately (`pnpm dev`) or rely on the `webServer`
 * block in playwright.config.ts, which launches it on port 3000.
 */
import { expect, test } from "@playwright/test"

const SETTINGS_URL = "/settings?section=applications"

test.describe("Applications settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SETTINGS_URL)
  })

  test("Docs link has a real href and target=_blank", async ({ page }) => {
    const docs = page.getByRole("link", {
      name: /Third-party application approvals docs/i,
    })
    await expect(docs).toBeVisible()
    const href = await docs.getAttribute("href")
    expect(href).not.toBe("#")
    expect(href).toMatch(/^https?:\/\//)
    await expect(docs).toHaveAttribute("target", "_blank")
    await expect(docs).toHaveAttribute("rel", /noopener/)
  })

  test("document.title is exactly 'Applications'", async ({ page }) => {
    await expect(page).toHaveTitle("Applications")
  })

  test("sidebar renders top-level items on initial load", async ({ page }) => {
    // The sidebar resets scrollTop to 0 on mount, so the top-most entry
    // (Preferences) must be in the viewport without scrolling.
    const preferences = page.getByRole("link", { name: /^Preferences$/ })
    await expect(preferences).toBeVisible()
    await expect(preferences).toBeInViewport()
  })

  test("layout fills the viewport width", async ({ page }) => {
    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()
    if (!viewport) return

    // The outermost settings wrapper sets `absolute inset-0 flex` and should
    // occupy the full viewport width.
    const wrapper = page.locator("main, body > *").first()
    const box = await wrapper.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return
    expect(box.width).toBeGreaterThanOrEqual(viewport.width - 1)

    // The content column (sibling of the sidebar) should be the dominant
    // region, not a narrow max-width column.
    const content = page.locator("h1", { hasText: "Applications" })
    const contentBox = await content.boundingBox()
    expect(contentBox).not.toBeNull()
    if (!contentBox) return
    // Content + sidebar combined equal the viewport; the content column
    // must be meaningfully wider than the sidebar (~224px).
    expect(contentBox.x).toBeGreaterThan(200)
  })
})
