/**
 * Regression: navigating directly to /search used to render a blank
 * page because the route didn't exist — only a SearchDialog mounted
 * by the sidebar's Search button. Deep-linking to /search produced
 * an empty `<SidebarInset>`.
 *
 * The fix adds a real route at `app/(workspace)/search/page.tsx`
 * that always renders the input + tabs + empty-state UI, regardless
 * of whether a query has been typed.
 */
import { expect, test } from "@playwright/test"

test.describe("/search route renders the input UI on first paint", () => {
  test("hard-navigating to /search shows the search input immediately", async ({
    page,
  }) => {
    await page.goto("/search")
    // Page wrapper is mounted.
    await expect(page.getByTestId("search-page")).toBeVisible()
    // Input is present and focused.
    const input = page.getByTestId("search-page-input")
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()

    // Tabs are rendered, with "All" selected by default.
    await expect(page.getByTestId("search-page-tabs")).toBeVisible()
    const allTab = page.getByTestId("search-page-tab-all")
    await expect(allTab).toHaveAttribute("aria-selected", "true")

    // Empty-state copy is rendered before any query.
    await expect(page.getByTestId("search-page-empty")).toBeVisible()
  })

  test("typing a query swaps the empty state for a no-results banner", async ({
    page,
  }) => {
    await page.goto("/search")
    const input = page.getByTestId("search-page-input")
    await input.fill("nonexistent")
    await expect(page.getByTestId("search-page-empty")).toHaveCount(0)
    await expect(page.getByTestId("search-page-no-results")).toBeVisible()
    await expect(page.getByTestId("search-page-no-results")).toContainText(
      /nonexistent/
    )
  })

  test("?q= deep-links pre-fill the input", async ({ page }) => {
    await page.goto("/search?q=billing")
    await expect(page.getByTestId("search-page-input")).toHaveValue("billing")
  })
})
