import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/teams/directory"

test.describe("Teams directory – tab navigation & empty state", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("'Your teams' tab shows 'Team Member is Abhishek Sharma' filter chip", async ({ page }) => {
    await page.getByTestId("tab-your-teams").click()
    const chip = page.getByTestId("filter-chip-member")
    await expect(chip).toBeVisible()
    await expect(chip).toContainText("Team Member is")
    await expect(chip).toContainText("Abhishek Sharma")
  })

  test("'Your teams' tab puts filter bar in active state", async ({ page }) => {
    await page.getByTestId("tab-your-teams").click()
    await expect(page.getByTestId("teams-reset-btn")).toBeVisible()
    await expect(page.getByTestId("add-filter-btn")).toBeVisible()
    await expect(page.getByTestId("filter-btn-project")).not.toBeVisible()
  })

  test("'Archived' tab shows 0 teams and empty state", async ({ page }) => {
    await page.getByTestId("tab-archived").click()
    await expect(page.getByTestId("teams-count")).toContainText("0 teams")
    await expect(page.getByTestId("teams-empty-state")).toBeVisible()
    await expect(page.locator("text=We couldn't find any teams matching your search")).toBeVisible()
    await expect(page.getByTestId("clear-all-filters-btn")).toBeVisible()
  })

  test("Empty state shows footer note about team visibility", async ({ page }) => {
    await page.getByTestId("tab-archived").click()
    await expect(page.locator("text=Some teams may not be found on this site")).toBeVisible()
  })

  test("'Clear all filters' from empty state restores 'All teams' tab and grid", async ({ page }) => {
    await page.getByTestId("tab-archived").click()
    await expect(page.getByTestId("teams-empty-state")).toBeVisible()

    await page.getByTestId("clear-all-filters-btn").click()

    // Tab switches back to All teams
    await expect(page.getByTestId("tab-all-teams")).toHaveClass(/border-blue-600/)
    // Empty state gone
    await expect(page.getByTestId("teams-empty-state")).not.toBeVisible()
    // Teams grid is back
    const count = await page.getByTestId("team-name").count()
    expect(count).toBeGreaterThan(0)
  })

  test("switching back to 'All teams' from 'Your teams' resets filter chip", async ({ page }) => {
    await page.getByTestId("tab-your-teams").click()
    await expect(page.getByTestId("filter-chip-member")).toBeVisible()

    await page.getByTestId("tab-all-teams").click()
    await expect(page.getByTestId("filter-chip-member")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
  })
})
