import { test, expect, Page } from "@playwright/test"

// ─────────────────────────────────────────────────────────────────────────────
// User-profile dropdown regression tests.
//
// Pins the behavior of the premium Jira-style avatar dropdown implemented in
// components/user-profile-dropdown.tsx and wired into the Goals layout. The
// dropdown must contain — in order — Profile, Account settings, Theme,
// (divider), Switch account, Log out, each paired with a Lucide-style icon.
//
// Covered behaviors:
//   • Avatar click opens the dropdown
//   • All five items + their icons are visible
//   • Theme toggles Tailwind's `dark` class on <html>
//   • Log out POSTs to /api/auth/logout and redirects to /login
// ─────────────────────────────────────────────────────────────────────────────

const START_URL = "/goals/settings"

/** Open the user-profile popover and return the popover (role=dialog) locator. */
async function openUserDropdown(page: Page) {
  const trigger = page.getByRole("button", { name: "User profile", exact: true })
  await expect(trigger).toBeVisible()
  await trigger.click()
  const popover = page.getByRole("dialog")
  await expect(popover).toBeVisible()
  return popover
}

test.describe("User profile dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(START_URL)
    await expect(page.getByRole("heading", { level: 1, name: "Goal settings" })).toBeVisible()
    // Each test starts on a fresh, light-mode page. next-themes stores the
    // choice in localStorage; clear it so dark-mode assertions are reliable.
    await page.evaluate(() => {
      window.localStorage.removeItem("theme")
      document.documentElement.classList.remove("dark")
      if (!document.documentElement.classList.contains("light")) {
        document.documentElement.classList.add("light")
      }
    })
  })

  test("clicking the avatar opens the dropdown", async ({ page }) => {
    const popover = await openUserDropdown(page)
    // Header block with user info.
    await expect(popover.getByText("Abhishek Sharma", { exact: true })).toBeVisible()
    await expect(popover.getByText(/abhisheksharma.*@gmail\.com/)).toBeVisible()
  })

  test("all five menu items are visible in the correct order with icons", async ({ page }) => {
    const popover = await openUserDropdown(page)

    // The five interactive rows are the <a>/<button> descendants of the
    // popover (the avatar header block is a plain <div>, not interactive).
    const items = popover.locator("a, button")
    await expect(items).toHaveCount(5)

    const expectedOrder: Array<{ label: string; iconTestId: string; href?: string }> = [
      { label: "Profile",          iconTestId: "icon-profile",          href: "/home/profile" },
      { label: "Account settings", iconTestId: "icon-account-settings", href: "/home/account-settings" },
      { label: "Theme",            iconTestId: "icon-theme" },
      { label: "Switch account",   iconTestId: "icon-switch-account",   href: "/switch-account" },
      { label: "Log out",          iconTestId: "icon-logout" },
    ]

    for (let i = 0; i < expectedOrder.length; i++) {
      const { label, iconTestId, href } = expectedOrder[i]
      const row = items.nth(i)
      await expect(row, `row ${i} should show "${label}"`).toContainText(label)
      // Its paired icon is a descendant with the expected data-testid.
      await expect(
        row.locator(`[data-testid="${iconTestId}"]`),
        `row ${i} ("${label}") should render its icon`,
      ).toBeVisible()
      if (href) {
        await expect(row).toHaveAttribute("href", href)
      }
    }

    // Theme row additionally has a right-facing chevron.
    const themeRow = popover.getByRole("button", { name: "Theme", exact: true })
    await expect(themeRow.locator('[data-testid="icon-theme-chevron"]')).toBeVisible()
  })

  test("a divider is rendered above Switch account", async ({ page }) => {
    const popover = await openUserDropdown(page)

    // `border-t` <div> elements are the visual dividers. Between the Theme
    // row (button) and the Switch-account row (link) there must be at least
    // one divider — find the Switch-account row and confirm an immediately
    // preceding sibling with a border-t class exists in the popover.
    const dividerCount = await popover.locator("div.border-t").count()
    // Header divider + mid-section divider == at least 2.
    expect(dividerCount).toBeGreaterThanOrEqual(2)

    // Tighter check: the parent group of the Switch-account link must be
    // preceded by a `border-t` sibling.
    const precedingDivider = popover.locator(
      "xpath=.//a[normalize-space()='Switch account']/parent::*/preceding-sibling::div[contains(@class,'border-t')][1]",
    )
    await expect(precedingDivider).toHaveCount(1)
  })

  test("clicking Theme toggles Tailwind's `dark` class on <html>", async ({ page }) => {
    // Baseline: not dark.
    await expect.poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("dark"))
    ).toBe(false)

    const popover = await openUserDropdown(page)
    await popover.getByRole("button", { name: "Theme", exact: true }).click()

    // After clicking Theme, <html> should carry the `dark` class.
    await expect.poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("dark")),
    {
      message: "<html> should have the `dark` class after toggling Theme",
    }).toBe(true)

    // And next-themes has persisted the choice.
    await expect.poll(() =>
      page.evaluate(() => window.localStorage.getItem("theme"))
    ).toBe("dark")
  })

  test("clicking Theme a second time returns to light mode", async ({ page }) => {
    const popover = await openUserDropdown(page)
    const themeBtn = popover.getByRole("button", { name: "Theme", exact: true })

    // First click: light → dark.
    await themeBtn.click()
    await expect.poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("dark"))
    ).toBe(true)

    // The Theme button's icon swaps from Moon to Sun on the re-render, so
    // wait for it to settle before clicking again.
    await expect(popover.locator('[data-testid="icon-theme"]')).toBeVisible()

    // Second click: dark → light.
    await themeBtn.click()
    await expect.poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("dark"))
    ).toBe(false)
  })

  test("Profile link navigates to /home/profile", async ({ page }) => {
    const popover = await openUserDropdown(page)
    await popover.getByRole("link", { name: "Profile", exact: true }).click()
    await expect(page).toHaveURL(/\/home\/profile$/)
  })

  test("Account settings link navigates to /home/account-settings", async ({ page }) => {
    const popover = await openUserDropdown(page)
    await popover.getByRole("link", { name: "Account settings", exact: true }).click()
    await expect(page).toHaveURL(/\/home\/account-settings$/)
  })

  test("clicking Log out POSTs /api/auth/logout and redirects to /login", async ({ page }) => {
    // Track the logout request so we can prove the handler fired.
    const logoutRequest = page.waitForRequest(
      (req) => req.url().endsWith("/api/auth/logout") && req.method() === "POST",
    )

    const popover = await openUserDropdown(page)
    await popover.getByRole("button", { name: "Log out", exact: true }).click()

    await logoutRequest
    await expect(page).toHaveURL(/\/login$/)
  })
})
