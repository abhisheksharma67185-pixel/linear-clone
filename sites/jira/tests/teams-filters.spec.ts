import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/teams/directory"

test.describe("Teams directory – filter bar default state", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("all filter buttons are visible in default state", async ({ page }) => {
    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
    await expect(page.getByTestId("filter-btn-goal")).toBeVisible()
    await expect(page.getByTestId("filter-btn-team-type")).toBeVisible()
    await expect(page.getByTestId("filter-btn-starred")).toBeVisible()
    await expect(page.getByTestId("filter-btn-verified")).toBeVisible()
    await expect(page.getByTestId("filter-btn-member")).toBeVisible()
  })

  test("Reset button is NOT visible in default state", async ({ page }) => {
    await expect(page.getByTestId("teams-reset-btn")).not.toBeVisible()
  })

  test("Add filter button is NOT visible in default state", async ({ page }) => {
    await expect(page.getByTestId("add-filter-btn")).not.toBeVisible()
  })
})

test.describe("Teams directory – Filter by Project dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("clicking 'Filter by Project' opens dropdown", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await expect(page.locator("input[placeholder='Choose a project']")).toBeVisible()
  })

  test("dropdown search input has correct placeholder", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await expect(page.locator("input[placeholder='Choose a project']")).toBeVisible()
  })

  test("dropdown lists mock projects", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await expect(page.locator("text=SCRUM Project")).toBeVisible()
    await expect(page.locator("text=Mobile App")).toBeVisible()
  })
})

test.describe("Teams directory – active filter state after selecting project", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
    // Select a project from dropdown
    await page.getByTestId("filter-btn-project").click()
    await page.locator("text=SCRUM Project").click()
  })

  test("active chip shows 'Project is SCRUM Project'", async ({ page }) => {
    await expect(page.getByTestId("filter-chip-project")).toBeVisible()
    await expect(page.getByTestId("filter-chip-project")).toContainText("Project is")
    await expect(page.getByTestId("filter-chip-project")).toContainText("SCRUM Project")
  })

  test("'Add filter +' button appears", async ({ page }) => {
    await expect(page.getByTestId("add-filter-btn")).toBeVisible()
  })

  test("'Reset' button appears", async ({ page }) => {
    await expect(page.getByTestId("teams-reset-btn")).toBeVisible()
  })

  test("other generic filter buttons are hidden when a filter is active", async ({ page }) => {
    await expect(page.getByTestId("filter-btn-team-type")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-member")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-goal")).not.toBeVisible()
  })

  test("clicking × on chip removes it and returns to default state", async ({ page }) => {
    await page.getByTestId("filter-chip-project").getByRole("button").click()
    await expect(page.getByTestId("filter-chip-project")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
    await expect(page.getByTestId("teams-reset-btn")).not.toBeVisible()
  })

  test("clicking Reset returns to default state", async ({ page }) => {
    await page.getByTestId("teams-reset-btn").click()
    await expect(page.getByTestId("filter-chip-project")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
    await expect(page.getByTestId("teams-reset-btn")).not.toBeVisible()
    await expect(page.getByTestId("add-filter-btn")).not.toBeVisible()
  })
})

test.describe("Teams directory – Add filter + button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
    await page.getByTestId("filter-btn-project").click()
    await page.locator("text=SCRUM Project").click()
  })

  test("'Add filter +' opens a dropdown with remaining filters", async ({ page }) => {
    await page.getByTestId("add-filter-btn").click()
    await expect(page.getByRole("button", { name: "Goal" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Team type" })).toBeVisible()
  })

  test("selecting a second filter from 'Add filter +' shows two chips", async ({ page }) => {
    await page.getByTestId("add-filter-btn").click()
    await page.locator("text=Starred").click()
    await expect(page.getByTestId("filter-chip-project")).toBeVisible()
    await expect(page.getByTestId("filter-chip-starred")).toBeVisible()
  })
})
