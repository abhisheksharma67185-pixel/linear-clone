import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/teams/people"

test.describe("Admin Settings (gear) dropdown menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
    await page.getByTestId("admin-settings-btn").click()
    await expect(page.getByTestId("admin-dropdown")).toBeVisible()
  })

  test("dropdown opens and shows 'Atlassian admin settings'", async ({ page }) => {
    await expect(page.getByTestId("admin-dropdown")).toContainText("Atlassian admin settings")
  })

  test("Teams settings navigates to /admin/teams", async ({ page }) => {
    await page.getByTestId("admin-menu-teams-settings").click()
    await expect(page).toHaveURL(/\/admin\/teams/)
  })

  test("User management navigates to /admin/users", async ({ page }) => {
    await page.getByTestId("admin-menu-user-management").click()
    await expect(page).toHaveURL(/\/admin\/users/)
  })

  test("Licensing navigates to /admin/licensing", async ({ page }) => {
    await page.getByTestId("admin-menu-licensing").click()
    await expect(page).toHaveURL(/\/admin\/licensing/)
  })

  test("Billing navigates to /admin/billing", async ({ page }) => {
    await page.getByTestId("admin-menu-billing").click()
    await expect(page).toHaveURL(/\/admin\/billing/)
  })
})
