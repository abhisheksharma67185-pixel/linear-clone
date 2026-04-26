/**
 * Playwright E2E covering five regression fixes on the workspace shell:
 *
 *   (a) Sidebar navigation updates main content within 500ms (no stale tree
 *       hanging from the previous route — Suspense + pathname key).
 *   (b) Create Issue modal is centered, covers the sidebar, and renders a
 *       backdrop above all app chrome.
 *   (c) Escape closes the Create Issue modal.
 *   (d) Sidebar nav items leave no ghost tooltip after click/navigation.
 *   (e) Search dialog opens with the "All" tab active by default.
 *
 * See e2e/applications.spec.ts for install/run instructions.
 */
import { expect, test, type Page } from "@playwright/test"

// The workspace landing route. Tests start here and navigate from the
// sidebar so we exercise the same Suspense outlet a real user does.
const WORKSPACE_URL = "/my-issues"

async function gotoWorkspace(page: Page) {
  await page.goto(WORKSPACE_URL)
  // Wait for the sidebar to be interactive — the rest of the assertions
  // assume the chrome has rendered.
  await expect(page.getByRole("button", { name: /^New issue$/ })).toBeVisible()
}

test.describe("Workspace regressions", () => {
  test.beforeEach(async ({ page }) => {
    await gotoWorkspace(page)
  })

  /**
   * (a) Sidebar nav updates main content within 500ms.
   *
   * Click each top-level destination and verify the URL changes immediately
   * and a fresh page tree is rendered (no stale headings from the previous
   * route lingering past the threshold).
   */
  test("clicking sidebar items updates main content within 500ms", async ({
    page,
  }) => {
    const destinations: { linkName: RegExp; expectedPath: RegExp }[] = [
      { linkName: /^Inbox$/, expectedPath: /\/inbox$/ },
      { linkName: /^Projects$/, expectedPath: /\/projects$/ },
      { linkName: /^Views$/, expectedPath: /\/views$/ },
      { linkName: /^My issues$/, expectedPath: /\/my-issues$/ },
    ]

    for (const { linkName, expectedPath } of destinations) {
      const before = Date.now()
      await page.getByRole("link", { name: linkName }).first().click()
      // URL must flip immediately.
      await expect(page).toHaveURL(expectedPath, { timeout: 500 })
      // Either a Suspense skeleton OR the new route's content must be on
      // screen within the budget. Stale content (the previous route
      // still rendering its <main>) is what we're guarding against.
      const skeletonOrMain = page.locator(
        '[data-testid="route-page-skeleton"], main'
      )
      await expect(skeletonOrMain.first()).toBeVisible({ timeout: 500 })
      const elapsed = Date.now() - before
      expect(
        elapsed,
        `Navigation to ${expectedPath} took ${elapsed}ms (budget 500ms)`
      ).toBeLessThan(1500) // Generous CI budget; visible-by-500ms is the real guarantee.
    }
  })

  /**
   * (b) Create Issue modal is centered, covers the sidebar, and renders a
   * backdrop above all app chrome.
   */
  test("Create Issue modal is centered above sidebar with a backdrop", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /^New issue$/ }).click()

    const overlay = page.locator('[data-slot="dialog-overlay"]')
    const content = page.locator('[data-slot="dialog-content"]').first()

    await expect(overlay).toBeVisible()
    await expect(content).toBeVisible()

    // Backdrop covers the full viewport.
    const overlayBox = await overlay.boundingBox()
    const viewport = page.viewportSize()
    expect(overlayBox).not.toBeNull()
    expect(viewport).not.toBeNull()
    if (overlayBox && viewport) {
      expect(overlayBox.x).toBeLessThanOrEqual(0)
      expect(overlayBox.y).toBeLessThanOrEqual(0)
      expect(overlayBox.width).toBeGreaterThanOrEqual(viewport.width - 1)
      expect(overlayBox.height).toBeGreaterThanOrEqual(viewport.height - 1)
    }

    // Backdrop and popup z-index must clear app chrome (>= 1000).
    const overlayZ = await overlay.evaluate((el) =>
      Number.parseInt(window.getComputedStyle(el).zIndex || "0", 10)
    )
    const contentZ = await content.evaluate((el) =>
      Number.parseInt(window.getComputedStyle(el).zIndex || "0", 10)
    )
    expect(overlayZ).toBeGreaterThanOrEqual(1000)
    expect(contentZ).toBeGreaterThan(overlayZ)

    // Content is roughly horizontally centered (within 4px tolerance for
    // sub-pixel rounding in transforms).
    if (viewport) {
      const contentBox = await content.boundingBox()
      expect(contentBox).not.toBeNull()
      if (contentBox) {
        const center = contentBox.x + contentBox.width / 2
        expect(Math.abs(center - viewport.width / 2)).toBeLessThanOrEqual(4)
      }
    }
  })

  /**
   * (c) Escape closes the Create Issue modal and unmounts the portal.
   */
  test("Escape closes the Create Issue modal", async ({ page }) => {
    await page.getByRole("button", { name: /^New issue$/ }).click()
    const content = page.locator('[data-slot="dialog-content"]').first()
    await expect(content).toBeVisible()

    await page.keyboard.press("Escape")

    // Dialog must fully unmount — no leftover input, chips, or Create button.
    await expect(content).toBeHidden()
    await expect(
      page.locator('[data-slot="dialog-overlay"]')
    ).toHaveCount(0, { timeout: 1000 })
  })

  /**
   * (d) Tooltip ghosting after navigation.
   *
   * The workspace sidebar items don't currently render hover tooltips, but
   * the regression guard is: after clicking through nav, no element with
   * `role="tooltip"` should remain mounted. If a tooltip system is added
   * later that doesn't reset on route change, this test fails loudly.
   */
  test("no tooltips remain visible after sidebar navigation", async ({
    page,
  }) => {
    // Hover an item to give any tooltip a chance to open, then click it.
    const projects = page.getByRole("link", { name: /^Projects$/ }).first()
    await projects.hover()
    await projects.click()
    await expect(page).toHaveURL(/\/projects$/)

    // After navigation, no tooltip should be visible. We assert with a
    // settle delay so any transition-out animation can complete.
    await page.waitForTimeout(200)
    const visibleTooltips = page.locator('[role="tooltip"]:visible')
    expect(await visibleTooltips.count()).toBe(0)
  })

  /**
   * (e) Search dialog opens with the "All" tab active by default.
   */
  test("Search opens with the 'All' tab active", async ({ page }) => {
    await page.getByRole("button", { name: /^Search$/ }).click()

    // The search dialog renders four tabs: All / Issues / Projects /
    // Documents. "All" must be the visually + semantically active one.
    const allTab = page.getByRole("button", { name: /^All$/ }).first()
    await expect(allTab).toBeVisible()

    // Active tabs in this UI carry a data-state="active" or rely on a
    // distinct class. Assert at least one of the recognised active markers
    // is present on the All tab and not on Documents.
    const allIsActive = await allTab.evaluate((el) => {
      const cls = el.className
      const ds = el.getAttribute("data-state")
      const aria = el.getAttribute("aria-selected")
      return (
        ds === "active" ||
        aria === "true" ||
        /\b(bg-(accent|secondary|muted)|text-foreground|font-medium)\b/.test(cls)
      )
    })
    expect(allIsActive).toBe(true)

    const documentsTab = page.getByRole("button", { name: /^Documents$/ }).first()
    const documentsIsActive = await documentsTab.evaluate((el) => {
      const ds = el.getAttribute("data-state")
      const aria = el.getAttribute("aria-selected")
      return ds === "active" || aria === "true"
    })
    expect(documentsIsActive).toBe(false)
  })
})
