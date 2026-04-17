import { test, expect, Page } from "@playwright/test"

// ─────────────────────────────────────────────────────────────────────────────
// Functional coverage for the 5 user-menu items in the avatar dropdown.
//
// Each test opens the dropdown in a fresh page context, clicks one menu item,
// and asserts the associated behavior (navigation, theme toggle, or auth
// reset + redirect). Uses getByRole / getByText locators — no CSS selectors.
//
// Implementation under test: components/user-profile-dropdown.tsx, integrated
// into app/(goals)/goals/layout.tsx. The dropdown is visible on any /goals/*
// page; we enter via /goals/settings where the top-nav is guaranteed to
// render.
// ─────────────────────────────────────────────────────────────────────────────

const ENTRY_URL = "/goals/settings"

/**
 * Seed a mock auth state on the client, then open the user dropdown. We seed
 * BEFORE opening so the Log-out test can prove that clicking "Log out"
 * actually clears it. Returns the popover locator (role=dialog) for chaining.
 */
async function openUserMenu(page: Page) {
  await page.goto(ENTRY_URL)
  await expect(page.getByRole("heading", { level: 1, name: "Goal settings" })).toBeVisible()

  // Reset and seed client-side state.
  await page.evaluate(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.localStorage.setItem("jira-auth", "mock-token-123")
    window.localStorage.setItem("jira-session", "active")
    // Make sure we're starting in light mode.
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")
  })

  const trigger = page.getByRole("button", { name: "User profile", exact: true })
  await expect(trigger, "avatar should be visible in the top nav").toBeVisible()
  await trigger.click()

  const popover = page.getByRole("dialog")
  await expect(popover, "dropdown should open after clicking the avatar").toBeVisible()
  return popover
}

test.describe("User menu — functional behaviors", () => {
  test("Profile → navigates to the profile route", async ({ page }) => {
    const popover = await openUserMenu(page)
    await popover.getByRole("link", { name: "Profile", exact: true }).click()

    // The handler points at /home/profile — that route's path contains
    // "/profile" per the spec.
    await expect(page).toHaveURL(/\/profile(\/|$)/)
  })

  test("Account settings → navigates to the account/settings route", async ({ page }) => {
    const popover = await openUserMenu(page)
    await popover.getByRole("link", { name: "Account settings", exact: true }).click()

    // /home/account-settings — the path contains both "account" and "settings".
    await expect(page).toHaveURL(/account|settings/)
    await expect(page).toHaveURL(/\/(account|settings)[^/]*(\/|$)/)
  })

  test("Theme → toggles Tailwind's `dark` class on <html>", async ({ page }) => {
    const popover = await openUserMenu(page)

    // Sanity: not currently in dark mode.
    await expect.poll(() =>
      page.evaluate(() => document.documentElement.classList.contains("dark"))
    ).toBe(false)

    await popover.getByRole("button", { name: "Theme", exact: true }).click()

    await expect.poll(
      () => page.evaluate(() => document.documentElement.classList.contains("dark")),
      { message: "<html> should carry the `dark` class after clicking Theme" },
    ).toBe(true)
  })

  test("Switch account → navigates to the account selection route", async ({ page }) => {
    const popover = await openUserMenu(page)
    await popover.getByRole("link", { name: "Switch account", exact: true }).click()

    // URL path includes "switch-account" and the destination page renders
    // the "Choose or add another account" heading.
    await expect(page).toHaveURL(/\/switch-account$/)
    await expect(
      page.getByRole("heading", { name: /choose.*add.*account/i }),
    ).toBeVisible()
  })

  test("Log out → redirects to /login and clears mock auth state", async ({ page }) => {
    const popover = await openUserMenu(page)

    // Confirm the mock auth state we seeded is actually present.
    const before = await page.evaluate(() => ({
      authToken: window.localStorage.getItem("jira-auth"),
      session:   window.localStorage.getItem("jira-session"),
    }))
    expect(before.authToken).toBe("mock-token-123")
    expect(before.session).toBe("active")

    // Prove the handler fires the logout request AND routes to /login.
    const logoutRequest = page.waitForRequest(
      (req) => req.url().endsWith("/api/auth/logout") && req.method() === "POST",
    )
    await popover.getByRole("button", { name: "Log out", exact: true }).click()
    await logoutRequest
    await expect(page).toHaveURL(/\/login$/)

    // Mock auth state has been cleared.
    const after = await page.evaluate(() => ({
      authToken: window.localStorage.getItem("jira-auth"),
      session:   window.localStorage.getItem("jira-session"),
    }))
    expect(after.authToken).toBeNull()
    expect(after.session).toBeNull()
  })
})
