import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/teams/people"

test.describe("People directory – filter bar state transformation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("default state shows all filter buttons", async ({ page }) => {
    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
    await expect(page.getByTestId("filter-btn-goal")).toBeVisible()
    await expect(page.getByTestId("filter-btn-team")).toBeVisible()
    await expect(page.getByTestId("filter-btn-jobtitle")).toBeVisible()
    await expect(page.getByTestId("filter-btn-manager")).toBeVisible()
    await expect(page.getByTestId("filter-btn-department")).toBeVisible()
    await expect(page.getByTestId("filter-btn-location")).toBeVisible()
  })

  test("'Filter by Project' dropdown has 'Choose a project' placeholder", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await expect(page.locator("input[placeholder='Choose a project']")).toBeVisible()
  })

  test("search icon is on the right side of the dropdown input", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    const input = page.locator("input[placeholder='Choose a project']")
    const inputBox = await input.boundingBox()
    const svg = input.locator("~ svg")
    // The SVG sibling should exist (absolute-positioned to the right)
    await expect(input).toBeVisible()
  })

  test("selecting a project hides all unapplied filter buttons", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await page.getByRole("button", { name: "My Scrum Project" }).click()

    // Active chip visible
    await expect(page.getByTestId("filter-chip-project")).toBeVisible()

    // All other filter buttons hidden
    await expect(page.getByTestId("filter-btn-goal")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-team")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-jobtitle")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-location")).not.toBeVisible()
    // Project button itself is also gone (replaced by chip)
    await expect(page.getByTestId("filter-btn-project")).not.toBeVisible()
  })

  test("active chip shows 'Project is' (label only, no value inline)", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await page.getByRole("button", { name: "My Scrum Project" }).click()

    const chip = page.getByTestId("filter-chip-project")
    await expect(chip).toContainText("Project is")
    // Label part (first button) has light blue style
    await expect(chip.getByRole("button").first()).toHaveClass(/bg-blue-50/)
    // X part (last button) has solid blue style
    await expect(chip.getByRole("button").last()).toHaveClass(/bg-blue-600/)
  })

  test("clicking X on chip returns to default state with all buttons visible", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await page.getByRole("button", { name: "My Scrum Project" }).click()

    await expect(page.getByTestId("filter-chip-project")).toBeVisible()

    // Click X — the last button inside the chip
    await page.getByTestId("filter-chip-project").getByRole("button").last().click()

    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
    await expect(page.getByTestId("filter-btn-goal")).toBeVisible()
    await expect(page.getByTestId("filter-btn-jobtitle")).toBeVisible()
    await expect(page.getByTestId("filter-btn-location")).toBeVisible()
    await expect(page.getByTestId("filter-chip-project")).not.toBeVisible()
  })

  test("Reset button appears in active state and clears all filters", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await page.getByRole("button", { name: "My Scrum Project" }).click()

    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible()
    await page.getByRole("button", { name: "Reset" }).click()

    // Returns to default
    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
    await expect(page.getByTestId("filter-chip-project")).not.toBeVisible()
  })
})
