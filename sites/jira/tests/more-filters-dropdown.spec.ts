import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/project-directory/following"

test.describe("Following page – '...' more-filters dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("'...' button is visible in the filter bar", async ({ page }) => {
    await expect(page.getByTestId("more-filters-btn")).toBeVisible()
  })

  test("clicking '...' opens the more-filters dropdown", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await expect(page.getByTestId("more-filters-dropdown")).toBeVisible()
  })

  test("dropdown contains Starred option", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await expect(page.getByTestId("more-filter-starred")).toBeVisible()
    await expect(page.getByTestId("more-filter-starred")).toContainText("Starred")
  })

  test("dropdown contains Reporting line option", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await expect(page.getByTestId("more-filter-reporting-line")).toBeVisible()
    await expect(page.getByTestId("more-filter-reporting-line")).toContainText("Reporting line")
  })

  test("clicking outside closes the dropdown", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await expect(page.getByTestId("more-filters-dropdown")).toBeVisible()
    await page.click("body", { position: { x: 10, y: 10 } })
    await expect(page.getByTestId("more-filters-dropdown")).not.toBeVisible()
  })
})

test.describe("Following page – Starred filter via '...'", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("selecting Starred shows the Starred chip and hides inactive filters", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await expect(page.getByTestId("filter-chip-starred")).toBeVisible()
    await expect(page.getByTestId("filter-chip-starred")).toContainText("Starred is")
    // Inactive filter buttons should be hidden
    await expect(page.getByTestId("more-filters-btn")).not.toBeVisible()
  })

  test("dropdown closes after selecting Starred", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await expect(page.getByTestId("more-filters-dropdown")).not.toBeVisible()
  })

  test("clicking × on Starred chip removes it and restores filter buttons", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    const chip = page.getByTestId("filter-chip-starred")
    await expect(chip).toBeVisible()
    await chip.getByRole("button").click()
    await expect(chip).not.toBeVisible()
    await expect(page.getByTestId("more-filters-btn")).toBeVisible()
  })

  test("Reset button clears the Starred chip", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await expect(page.getByTestId("filter-chip-starred")).toBeVisible()
    await page.getByTestId("reset-btn").click()
    await expect(page.getByTestId("filter-chip-starred")).not.toBeVisible()
  })
})

test.describe("Following page – Reporting line filter via '...'", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("selecting Reporting line shows the Reporting line chip", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await expect(page.getByTestId("filter-chip-reporting")).toBeVisible()
    await expect(page.getByTestId("filter-chip-reporting")).toContainText("Reporting line is")
  })

  test("dropdown closes after selecting Reporting line", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await expect(page.getByTestId("more-filters-dropdown")).not.toBeVisible()
  })

  test("clicking × on Reporting line chip removes it", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    const chip = page.getByTestId("filter-chip-reporting")
    await expect(chip).toBeVisible()
    await chip.getByRole("button").click()
    await expect(chip).not.toBeVisible()
  })

  test("Reset button clears the Reporting line chip", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await expect(page.getByTestId("filter-chip-reporting")).toBeVisible()
    await page.getByTestId("reset-btn").click()
    await expect(page.getByTestId("filter-chip-reporting")).not.toBeVisible()
  })
})
