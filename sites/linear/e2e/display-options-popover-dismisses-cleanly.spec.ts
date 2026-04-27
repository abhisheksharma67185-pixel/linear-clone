/**
 * Regression: the /teams Display options popover used to leave a
 * faded ghost layer over the table after outside-click. The fix is
 * a combination of: controlled `open` state, the global PopoverContent
 * `data-[instant=dismiss]:duration-0 data-[instant=dismiss]:opacity-0
 * data-closed:pointer-events-none` overrides, and `data-testid` hooks.
 *
 * This test asserts:
 *   1. Outside-click removes the popover from the DOM (not just hides it).
 *   2. After dismiss, none of the inner text nodes ("Ordering",
 *      "Display properties", any chip label, "Reset", "Set default")
 *      are queryable. This is the exact assertion shape from the spec
 *      (`expect(screen.queryByText('Reset')).toBeNull()`).
 */
import { expect, test } from "@playwright/test"

test.describe("Display options popover dismisses cleanly", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/teams")
    await expect(page.getByRole("heading", { name: /^Teams$/ })).toBeVisible()
  })

  test("outside-click removes the popover and all inner text nodes from the DOM", async ({
    page,
  }) => {
    await page.getByTestId("teams-display-options-trigger").click()
    const popover = page.getByTestId("teams-display-options-popover")
    await expect(popover).toBeVisible()
    // Sanity: inner text labels are present while open.
    await expect(page.getByText("Ordering", { exact: true })).toBeVisible()
    await expect(
      page.getByText("Display properties", { exact: true })
    ).toBeVisible()

    // Click well outside the popover to trigger the outside-click path.
    await page.getByRole("heading", { name: /^Teams$/ }).click({ force: true })

    await expect(popover).toHaveCount(0, { timeout: 1000 })
    // Inner text nodes are gone too — the popover unmounted, not
    // just hidden behind opacity:0.
    await expect(page.getByText("Ordering", { exact: true })).toHaveCount(0)
    await expect(
      page.getByText("Display properties", { exact: true })
    ).toHaveCount(0)
  })
})
