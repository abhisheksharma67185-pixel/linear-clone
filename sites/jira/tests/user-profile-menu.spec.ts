import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/teams"

test.describe("User Profile dropdown menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
    // Open the profile dropdown by clicking the AS avatar button
    await page.getByTestId("profile-avatar-btn").click()
    await expect(page.getByTestId("profile-dropdown")).toBeVisible()
  })

  test("dropdown opens when avatar is clicked", async ({ page }) => {
    await expect(page.getByTestId("profile-dropdown")).toBeVisible()
    await expect(page.getByTestId("profile-dropdown")).toContainText("Abhishek Sharma")
  })

  test("Profile navigates to /home/profile", async ({ page }) => {
    await page.getByTestId("profile-menu-profile").click()
    await expect(page).toHaveURL(/\/home\/profile/)
  })

  test("Account settings navigates to /home/account-settings", async ({ page }) => {
    await page.getByTestId("profile-menu-account-settings").click()
    await expect(page).toHaveURL(/\/home\/account-settings/)
  })

  test("Theme toggles the app theme", async ({ page }) => {
    const html = page.locator("html")
    const before = await html.getAttribute("class")
    await page.getByTestId("profile-menu-theme").click()
    // After toggling, the class list on <html> should change (dark added or removed)
    const after = await html.getAttribute("class")
    expect(after).not.toBe(before)
  })

  test("Switch account navigates to /switch-account", async ({ page }) => {
    await page.getByTestId("profile-menu-switch-account").click()
    await expect(page).toHaveURL(/\/switch-account/)
  })

  test("Log out navigates to /login", async ({ page }) => {
    await page.getByTestId("profile-menu-logout").click()
    await expect(page).toHaveURL(/\/login/)
  })

  test("Browse all teams navigates to /teams/directory", async ({ page }) => {
    await page.getByTestId("profile-menu-browse-teams").click()
    await expect(page).toHaveURL(/\/teams\/directory/)
  })
})
