import { test, expect } from "@playwright/test"

// ─────────────────────────────────────────────────────────────────────────────
// Top-navigation regression tests for /goals/settings
//
// Prior bug: the Goals layout (`app/(goals)/goals/layout.tsx`) rendered the
// Notification bell, Help "?", Settings gear, and user-profile avatar as bare
// <button>/<Avatar> elements with NO onClick/href. On /goals/settings they
// appeared to do nothing — the Settings gear was a <Link> pointing back to
// /goals/settings, so clicking while already on the page was a visible no-op
// too.
//
// The fix converts each to a shadcn Popover with an `aria-label` trigger, so
// every icon now surfaces a dropdown. These tests pin that behavior so a
// regression (missing onClick, href to self, or a CSS overlay swallowing
// pointer events) surfaces immediately.
// ─────────────────────────────────────────────────────────────────────────────

const SETTINGS_URL = "/goals/settings"

test.describe("/goals/settings top navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SETTINGS_URL)
    // The page renders the "Goal settings" h1 once the layout mounts.
    await expect(page.getByRole("heading", { level: 1, name: "Goal settings" })).toBeVisible()
  })

  test("all four icon triggers exist and are reachable in the header", async ({ page }) => {
    const header = page.locator("header")
    for (const label of ["Notifications", "Help", "Settings", "User profile"]) {
      const trigger = header.getByRole("button", { name: label, exact: true })
      await expect(trigger, `"${label}" trigger should be visible`).toBeVisible()
      await expect(trigger).toBeEnabled()
    }
  })

  test("Notification bell opens the Notifications popover", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Notifications", exact: true })
    await trigger.click()

    const popover = page.getByRole("dialog")
    await expect(popover).toBeVisible()
    // Distinctive content — heading + empty-state copy.
    await expect(popover.getByText("Notifications", { exact: true })).toBeVisible()
    await expect(popover.getByText("You're all caught up.", { exact: true })).toBeVisible()
    // And a "View all" link out to /home/notifications.
    const viewAll = popover.getByRole("link", { name: "View all", exact: true })
    await expect(viewAll).toBeVisible()
    await expect(viewAll).toHaveAttribute("href", "/home/notifications")
  })

  test("Help button opens the Help popover with support links", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Help", exact: true })
    await trigger.click()

    const popover = page.getByRole("dialog")
    await expect(popover).toBeVisible()
    await expect(popover.getByText("Help", { exact: true })).toBeVisible()
    for (const item of ["Documentation", "Keyboard shortcuts", "Contact support"]) {
      await expect(
        popover.getByRole("link", { name: item, exact: true }),
        `"${item}" should appear in the Help popover`,
      ).toBeVisible()
    }
  })

  test("Settings gear opens the Atlassian-style Settings menu (not a self-navigation)", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Settings", exact: true })
    await trigger.click()

    const popover = page.getByRole("dialog")
    await expect(popover).toBeVisible()
    // Category headers from the rich settings menu.
    await expect(popover.getByText("Atlassian Home settings", { exact: true })).toBeVisible()
    await expect(popover.getByText("Atlassian admin settings", { exact: true })).toBeVisible()
    // Item 1 lives under no header.
    await expect(popover.getByText("Goal settings", { exact: true })).toBeVisible()

    // And the URL hasn't changed — this is a popover, not navigation.
    await expect(page).toHaveURL(/\/goals\/settings$/)
  })

  test("AS avatar opens the User profile popover with account menu", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "User profile", exact: true })
    await trigger.click()

    const popover = page.getByRole("dialog")
    await expect(popover).toBeVisible()
    // User info block.
    await expect(popover.getByText("Abhishek Sharma", { exact: true })).toBeVisible()
    await expect(popover.getByText(/abhisheksharma.*@gmail\.com/)).toBeVisible()

    // Navigation items are real <a> links with routes.
    const expectedLinks: Array<{ name: string; href: string }> = [
      { name: "Profile", href: "/home/profile" },
      { name: "Account settings", href: "/home/account-settings" },
      { name: "Switch account", href: "/switch-account" },
    ]
    for (const item of expectedLinks) {
      const link = popover.getByRole("link", { name: item.name, exact: true })
      await expect(link, `"${item.name}" link should be in the profile popover`).toBeVisible()
      await expect(link).toHaveAttribute("href", item.href)
    }

    // Theme and Log out are buttons (they execute handlers rather than
    // navigating), not links — assert their presence via role=button.
    await expect(popover.getByRole("button", { name: "Theme", exact: true })).toBeVisible()
    await expect(popover.getByRole("button", { name: "Log out", exact: true })).toBeVisible()
  })

  test("only one popover is open at a time (clicking another icon swaps, not stacks)", async ({ page }) => {
    await page.getByRole("button", { name: "Notifications", exact: true }).click()
    await expect(page.getByRole("dialog")).toHaveCount(1)

    await page.getByRole("button", { name: "Help", exact: true }).click()
    // Radix Popover closes the previous one when a different trigger activates.
    await expect(page.getByRole("dialog")).toHaveCount(1)
    await expect(page.getByRole("dialog").getByText("Help", { exact: true })).toBeVisible()
  })
})
