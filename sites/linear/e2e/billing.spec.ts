/**
 * Playwright E2E for the Billing settings page.
 *
 * See e2e/applications.spec.ts for install/run instructions.
 */
import { expect, test } from "@playwright/test"

const SETTINGS_URL = "/settings?section=billing"

test.describe("Billing settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SETTINGS_URL)
  })

  test("renders exactly one <h1> with text 'Billing'", async ({ page }) => {
    const h1s = page.locator("h1")
    await expect(h1s).toHaveCount(1)
    await expect(h1s).toHaveText("Billing")
  })

  test("document.title is exactly 'Billing'", async ({ page }) => {
    await expect(page).toHaveTitle("Billing")
  })

  test("contact us / All plans / View all plans / Upgrade now are wired", async ({
    page,
  }) => {
    const contactUs = page.getByRole("link", {
      name: /Contact Linear support/i,
    })
    await expect(contactUs).toHaveAttribute("href", /^https?:\/\//)
    await expect(contactUs).toHaveAttribute("target", "_blank")

    const allPlans = page.getByRole("link", { name: /^All plans/i })
    await expect(allPlans).toHaveAttribute("href", /^https?:\/\//)
    await expect(allPlans).toHaveAttribute("target", "_blank")

    const viewAllPlans = page.getByRole("link", { name: "View all plans" })
    const viewHref = await viewAllPlans.getAttribute("href")
    expect(viewHref).not.toBe("#")
    expect(viewHref).toMatch(/\/settings\/billing\/upgrade/)

    const upgradeNow = page.getByRole("link", { name: "Upgrade now" })
    const upgradeHref = await upgradeNow.getAttribute("href")
    expect(upgradeHref).not.toBe("#")
    expect(upgradeHref).toMatch(/\/settings\/billing\/upgrade/)

    // Clicking "Upgrade now" should actually land us on the upgrade page —
    // this also catches the "broken link opens chat widget" regression.
    await upgradeNow.click()
    await expect(page).toHaveURL(/\/settings\/billing\/upgrade/)
  })

  test("top-level sidebar item (Preferences) is visible on initial render", async ({
    page,
  }) => {
    const preferences = page.getByRole("link", { name: /^Preferences$/ })
    await expect(preferences).toBeVisible()
    await expect(preferences).toBeInViewport()
  })

  test("content width equals viewport width minus the sidebar width", async ({
    page,
  }) => {
    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()
    if (!viewport) return

    const sidebar = page.getByRole("navigation", {
      name: "Settings navigation",
    })
    const sidebarBox = await sidebar.boundingBox()
    expect(sidebarBox).not.toBeNull()
    if (!sidebarBox) return

    // The content column is the flex sibling; locate it via the Billing h1.
    const h1 = page.getByRole("heading", { name: "Billing", level: 1 })
    const h1Box = await h1.boundingBox()
    expect(h1Box).not.toBeNull()
    if (!h1Box) return

    // The content column must start right after the sidebar and extend
    // to the right edge of the viewport.
    expect(h1Box.x).toBeGreaterThanOrEqual(sidebarBox.width - 1)
    expect(h1Box.x).toBeLessThan(sidebarBox.width + 40) // only padding in between
  })
})
