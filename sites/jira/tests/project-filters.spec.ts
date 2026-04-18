import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"
const PAGE = `${BASE}/project-directory`

test.describe("Project directory – filter chips", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("Status filter button is visible by default", async ({ page }) => {
    await expect(page.getByTestId("filter-btn-status")).toBeVisible()
  })

  test("clicking Status filter button opens dropdown with 'Choose a status' placeholder", async ({ page }) => {
    await page.getByTestId("filter-btn-status").click()
    await expect(page.getByTestId("filter-dropdown-status")).toBeVisible()
    await expect(page.getByPlaceholder("Choose a status")).toBeVisible()
  })

  test("Status dropdown contains styled ON TRACK badge", async ({ page }) => {
    await page.getByTestId("filter-btn-status").click()
    const dropdown = page.getByTestId("filter-dropdown-status")
    await expect(dropdown).toBeVisible()
    await expect(dropdown.getByText("ON TRACK")).toBeVisible()
  })

  test("clicking Status button immediately shows chip with 'Status is' text", async ({ page }) => {
    await page.getByTestId("filter-btn-status").click()
    const chip = page.getByTestId("filter-chip-status")
    await expect(chip).toBeVisible()
    await expect(chip).toContainText("Status is")
  })

  test("selecting a status value updates chip to 'Status is ON TRACK'", async ({ page }) => {
    await page.getByTestId("filter-btn-status").click()
    await page.getByTestId("filter-dropdown-status").getByText("ON TRACK").click()
    const chip = page.getByTestId("filter-chip-status")
    await expect(chip).toBeVisible()
    await expect(chip).toContainText("Status is ON TRACK")
  })

  test("other filter buttons hide when a chip is active", async ({ page }) => {
    await page.getByTestId("filter-btn-status").click()
    // Other buttons should no longer be visible
    await expect(page.getByTestId("filter-btn-tag")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-goal")).not.toBeVisible()
  })

  test("Reset button appears when chip is active and clears all chips", async ({ page }) => {
    await page.getByTestId("filter-btn-status").click()
    await expect(page.getByText("Reset")).toBeVisible()
    await page.getByText("Reset").click()
    await expect(page.getByTestId("filter-btn-status")).toBeVisible()
    await expect(page.getByTestId("filter-chip-status")).not.toBeVisible()
  })

  test("clicking the X on a chip removes it and restores filter buttons", async ({ page }) => {
    await page.getByTestId("filter-btn-status").click()
    const chip = page.getByTestId("filter-chip-status")
    await expect(chip).toBeVisible()
    // Click the X inside the chip
    await chip.getByRole("button").click()
    await expect(chip).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-status")).toBeVisible()
  })
})
