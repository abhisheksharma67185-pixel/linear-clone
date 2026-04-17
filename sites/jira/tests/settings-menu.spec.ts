import { test, expect, Page } from "@playwright/test"

// ─────────────────────────────────────────────────────────────────────────────
// E2E coverage for the Atlassian-style Settings menu (components/settings-menu.tsx).
//
// Validates:
//   • Opening the menu surfaces both category headers
//   • All 6 items are visible with their descriptions
//   • The 4 internal items navigate in-place to the correct route
//   • The 2 external items (Workspace settings, Personal settings) open in a
//     new tab (target="_blank") instead of routing the current page
// ─────────────────────────────────────────────────────────────────────────────

const ENTRY_URL = "/goals/settings"

async function openSettingsMenu(page: Page) {
  await page.goto(ENTRY_URL)
  await expect(page.getByRole("heading", { level: 1, name: "Goal settings" })).toBeVisible()
  const trigger = page.getByRole("button", { name: "Settings", exact: true })
  await expect(trigger).toBeVisible()
  await trigger.click()
  const menu = page.getByRole("dialog")
  await expect(menu).toBeVisible()
  return menu
}

test.describe("Settings menu", () => {
  test("opens with both Atlassian category headers visible", async ({ page }) => {
    const menu = await openSettingsMenu(page)
    await expect(menu.getByText("Atlassian Home settings", { exact: true })).toBeVisible()
    await expect(menu.getByText("Atlassian admin settings", { exact: true })).toBeVisible()
  })

  test("renders all 6 items with titles and descriptions", async ({ page }) => {
    const menu = await openSettingsMenu(page)

    const expected: Array<{ title: string; description: string }> = [
      { title: "Goal settings",       description: "Manage goal custom fields and scoring method" },
      { title: "Workspace settings",  description: "Manage workspace name, domains, user groups and time zone" },
      { title: "Personal settings",   description: "Manage notification preferences and themes" },
      { title: "User management",     description: "Manage users, groups, and access requests" },
      { title: "Licensing",           description: "Server and Data Center licensing" },
      { title: "Billing",             description: "Update your billing details, manage subscriptions, and more" },
    ]

    for (const { title, description } of expected) {
      await expect(menu.getByText(title, { exact: true })).toBeVisible()
      await expect(menu.getByText(description, { exact: true })).toBeVisible()
    }
  })

  // ── 4 internal links — navigate in-place ───────────────────────────────────

  const internalLinks: Array<{ title: string; expectedUrl: RegExp }> = [
    { title: "Goal settings",   expectedUrl: /\/goals\/settings$/ },
    { title: "User management", expectedUrl: /\/admin\/users(\/|$)/ },
    { title: "Licensing",       expectedUrl: /\/admin\/licensing(\/|$)/ },
    { title: "Billing",         expectedUrl: /\/admin\/billing(\/|$)/ },
  ]

  for (const { title, expectedUrl } of internalLinks) {
    test(`internal link "${title}" navigates in-place to ${expectedUrl.source}`, async ({ page }) => {
      const menu = await openSettingsMenu(page)
      const link = menu.getByRole("link", { name: new RegExp(`^${title}`) })
      // The internal links must NOT have target="_blank".
      await expect(link).not.toHaveAttribute("target", "_blank")
      await link.click()
      await expect(page).toHaveURL(expectedUrl)
    })
  }

  // ── 2 external links — open in a new tab ──────────────────────────────────

  const externalLinks: Array<{ title: string; expectedHref: RegExp }> = [
    { title: "Workspace settings", expectedHref: /\/admin\/organization-settings/ },
    { title: "Personal settings",  expectedHref: /\/home\/account-settings/ },
  ]

  for (const { title, expectedHref } of externalLinks) {
    test(`external link "${title}" opens in a new tab`, async ({ page, context }) => {
      const menu = await openSettingsMenu(page)
      const link = menu.getByRole("link", { name: new RegExp(`^${title}`) })

      // Pre-flight: the anchor advertises target="_blank" so the browser
      // opens a new tab instead of navigating the current page.
      await expect(link).toHaveAttribute("target", "_blank")
      await expect(link).toHaveAttribute("href", expectedHref)

      // Race: clicking should spawn a new page in the same context rather
      // than changing the current URL.
      const popupPromise = context.waitForEvent("page")
      await link.click()
      const newPage = await popupPromise

      await newPage.waitForLoadState("domcontentloaded")
      expect(newPage.url()).toMatch(expectedHref)

      // The original tab should still be on /goals/settings — external
      // links must not hijack the current page.
      await expect(page).toHaveURL(/\/goals\/settings$/)

      await newPage.close()
    })
  }
})
