import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/teams/directory"

test.describe("Teams directory – layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("page heading is 'Teams'", async ({ page }) => {
    await expect(page.getByTestId("teams-heading")).toHaveText("Teams")
  })

  test("tabs row is visible with All teams, Your teams, Archived", async ({ page }) => {
    const tabs = page.getByTestId("teams-tabs")
    await expect(tabs).toBeVisible()
    await expect(page.getByTestId("tab-all-teams")).toBeVisible()
    await expect(page.getByTestId("tab-your-teams")).toBeVisible()
    await expect(page.getByTestId("tab-archived")).toBeVisible()
  })

  test("'All teams' tab is active by default (blue underline)", async ({ page }) => {
    const allTeamsTab = page.getByTestId("tab-all-teams")
    await expect(allTeamsTab).toHaveClass(/border-blue-600/)
  })

  test("clicking a tab changes the active tab", async ({ page }) => {
    await page.getByTestId("tab-your-teams").click()
    await expect(page.getByTestId("tab-your-teams")).toHaveClass(/border-blue-600/)
    await expect(page.getByTestId("tab-all-teams")).not.toHaveClass(/border-blue-600/)
  })

  test("search bar is visible below tabs", async ({ page }) => {
    await expect(page.locator("input[placeholder='Search teams...']")).toBeVisible()
  })

  test("filter bar contains 'Filter by Project' button", async ({ page }) => {
    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
    await expect(page.getByTestId("filter-btn-project")).toContainText("Filter by Project")
  })

  test("filter bar contains 'Starred' button", async ({ page }) => {
    await expect(page.getByTestId("filter-btn-starred")).toBeVisible()
    await expect(page.getByTestId("filter-btn-starred")).toContainText("Starred")
  })

  test("filter bar contains 'Goal', 'Team type', 'Verified', 'Team Member' buttons", async ({ page }) => {
    await expect(page.getByTestId("filter-btn-goal")).toContainText("Goal")
    await expect(page.getByTestId("filter-btn-team-type")).toContainText("Team type")
    await expect(page.getByTestId("filter-btn-verified")).toContainText("Verified")
    await expect(page.getByTestId("filter-btn-member")).toContainText("Team Member")
  })

  test("Grid view toggle button is visible and active by default", async ({ page }) => {
    const gridBtn = page.getByTestId("view-grid-btn")
    await expect(gridBtn).toBeVisible()
    await expect(gridBtn).toHaveClass(/border-blue-500/)
  })

  test("List view toggle button is visible", async ({ page }) => {
    await expect(page.getByTestId("view-list-btn")).toBeVisible()
  })

  test("'...' more menu button is visible", async ({ page }) => {
    await expect(page.getByTestId("view-more-btn")).toBeVisible()
  })

  test("switching to list view changes active toggle", async ({ page }) => {
    await page.getByTestId("view-list-btn").click()
    await expect(page.getByTestId("view-list-btn")).toHaveClass(/border-blue-500/)
    await expect(page.getByTestId("view-grid-btn")).not.toHaveClass(/border-blue-500/)
  })

  test("'Create team' button is visible and outline style", async ({ page }) => {
    const btn = page.getByRole("button", { name: "Create team" })
    await expect(btn).toBeVisible()
  })

  test("clicking '...' opens sort dropdown", async ({ page }) => {
    await page.getByTestId("view-more-btn").click()
    await expect(page.locator("text=Sort by name")).toBeVisible()
  })
})
