/**
 * Regression: some popovers in earlier iterations didn't close on
 * Escape, leaving the user stuck with an open dropdown. Base UI's
 * defaults handle Escape correctly, but the contract had drifted
 * over time across custom popovers built outside the shared
 * `Popover` / `DropdownMenu` shells.
 *
 * This test exercises Escape on every popover/dropdown surface we
 * can reach from the workspace shell, asserting each one unmounts
 * (not just hides). If a future popover is added that swallows
 * Escape, the test fails on it specifically.
 */
import { expect, test, type Page } from "@playwright/test"

async function openAndExpectGone(
  page: Page,
  open: () => Promise<void>,
  contentSelector: string,
  label: string
) {
  await open()
  const content = page.locator(contentSelector).first()
  await expect(content, `${label} should open`).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(content, `${label} should fully unmount on Escape`).toHaveCount(
    0,
    { timeout: 1000 }
  )
}

test.describe("Escape closes every popover/dropdown surface", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/teams")
    await expect(page.getByRole("heading", { name: /^Teams$/ })).toBeVisible()
  })

  test("Display Options popover (Popover)", async ({ page }) => {
    await openAndExpectGone(
      page,
      async () =>
        await page.getByTestId("teams-display-options-trigger").click(),
      '[data-testid="teams-display-options-popover"]',
      "Display Options popover"
    )
  })

  test("Team card More menu (DropdownMenu)", async ({ page }) => {
    await openAndExpectGone(
      page,
      async () => await page.getByTestId("teams-card-more").first().click(),
      '[data-slot="dropdown-menu-content"]',
      "Team More dropdown"
    )
  })

  test("Workspace switcher (DropdownMenu)", async ({ page }) => {
    await openAndExpectGone(
      page,
      async () =>
        await page.getByRole("button", { name: /Workspace menu/ }).click(),
      '[data-slot="dropdown-menu-content"]',
      "Workspace switcher dropdown"
    )
  })
})
