import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"
const PAGE = `${BASE}/project-directory`

test.describe("Project directory – '...' more-filters dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("'...' button is always visible (no chips active)", async ({ page }) => {
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

test.describe("Project directory – Starred filter end-to-end", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("selecting Starred from '...' shows the Starred chip", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await expect(page.getByTestId("filter-chip-starred")).toBeVisible()
    await expect(page.getByTestId("filter-chip-starred")).toContainText("Starred")
  })

  test("dropdown closes after selecting Starred", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await expect(page.getByTestId("more-filters-dropdown")).not.toBeVisible()
  })

  test("Starred option disappears from dropdown after chip is active", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await page.getByTestId("more-filters-btn").click()
    await expect(page.getByTestId("more-filters-dropdown")).toBeVisible()
    await expect(page.getByTestId("more-filter-starred")).not.toBeVisible()
  })

  test("clicking X on Starred chip removes it", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    const chip = page.getByTestId("filter-chip-starred")
    await expect(chip).toBeVisible()
    await chip.getByRole("button").click()
    await expect(chip).not.toBeVisible()
  })

  test("Reset button clears Starred chip", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await expect(page.getByTestId("filter-chip-starred")).toBeVisible()
    await page.getByTestId("reset-btn").click()
    await expect(page.getByTestId("filter-chip-starred")).not.toBeVisible()
  })
})

test.describe("Project directory – Reporting line filter end-to-end", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("selecting Reporting line shows the chip and opens popover", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await expect(page.getByTestId("reporting-filter-chip")).toBeVisible()
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
  })

  test("popover heading contains expected text", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await expect(page.getByTestId("reporting-popover")).toContainText("Stay across the projects your reports work on")
  })

  test("popover body contains identity provider text", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await expect(page.getByTestId("reporting-popover")).toContainText("Connect your identity provider")
  })

  test("Show me how link has the correct href", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    const href = await page.getByTestId("show-me-how-btn").getAttribute("href")
    expect(href).toBe(
      "https://support.atlassian.com/platform-experiences/docs/sync-the-manager-attribute-into-atlassian-home/"
    )
  })

  test("clicking chip again toggles popover closed", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
    await page.getByTestId("reporting-filter-chip").click()
    await expect(page.getByTestId("reporting-popover")).not.toBeVisible()
  })

  test("Reporting line option disappears from dropdown after chip is active", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await page.getByTestId("more-filters-btn").click()
    await expect(page.getByTestId("more-filters-dropdown")).toBeVisible()
    await expect(page.getByTestId("more-filter-reporting-line")).not.toBeVisible()
  })

  test("clicking X on Reporting line chip removes it", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    const chip = page.getByTestId("reporting-filter-chip")
    await expect(chip).toBeVisible()
    await chip.getByRole("button").click()
    await expect(chip).not.toBeVisible()
  })

  test("Reset button clears Reporting line chip", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await expect(page.getByTestId("reporting-filter-chip")).toBeVisible()
    await page.getByTestId("reset-btn").click()
    await expect(page.getByTestId("reporting-filter-chip")).not.toBeVisible()
  })
})

test.describe("Project directory – dropdown re-open behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("both Starred and Reporting line active shows 'No more filters'", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await page.getByTestId("more-filters-btn").click()
    await expect(page.getByTestId("more-filters-dropdown")).toBeVisible()
    await expect(page.getByTestId("more-filters-dropdown")).toContainText("No more filters")
  })

  test("'...' button is still visible when both special chips are active", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-reporting-line").click()
    await expect(page.getByTestId("more-filters-btn")).toBeVisible()
  })
})

test.describe("Project directory – filter bar with special chips", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("standard filter buttons are still visible alongside Starred chip", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await expect(page.getByTestId("filter-btn-status")).toBeVisible()
  })

  test("standard filter chip can be combined with Starred chip", async ({ page }) => {
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await page.getByTestId("filter-btn-status").click()
    await expect(page.getByTestId("filter-chip-starred")).toBeVisible()
    await expect(page.getByTestId("filter-chip-status")).toBeVisible()
  })
})

test.describe("Project directory – Reset button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("Reset button is always visible", async ({ page }) => {
    await expect(page.getByTestId("reset-btn")).toBeVisible()
  })

  test("Reset clears all active chips including Starred and Reporting line", async ({ page }) => {
    await page.getByTestId("filter-btn-status").click()
    await page.getByTestId("more-filters-btn").click()
    await page.getByTestId("more-filter-starred").click()
    await page.getByTestId("reset-btn").click()
    await expect(page.getByTestId("filter-chip-status")).not.toBeVisible()
    await expect(page.getByTestId("filter-chip-starred")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-status")).toBeVisible()
  })
})

test.describe("Project directory – Create view button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("Create view button is always visible", async ({ page }) => {
    await expect(page.getByTestId("create-view-btn")).toBeVisible()
  })

  test("clicking Create view opens the modal", async ({ page }) => {
    await page.getByTestId("create-view-btn").click()
    await expect(page.getByTestId("create-view-modal")).toBeVisible()
  })

  test("Create view modal has a name input", async ({ page }) => {
    await page.getByTestId("create-view-btn").click()
    await expect(page.getByTestId("create-view-modal").locator("input")).toBeVisible()
  })

  test("clicking Cancel closes the modal", async ({ page }) => {
    await page.getByTestId("create-view-btn").click()
    await page.getByTestId("create-view-modal").getByRole("button", { name: "Cancel" }).click()
    await expect(page.getByTestId("create-view-modal")).not.toBeVisible()
  })

  test("Create view button is disabled when name is empty", async ({ page }) => {
    await page.getByTestId("create-view-btn").click()
    const createBtn = page.getByTestId("create-view-modal").getByRole("button", { name: "Create view" })
    await expect(createBtn).toBeDisabled()
  })

  test("typing a name enables the Create view button", async ({ page }) => {
    await page.getByTestId("create-view-btn").click()
    await page.getByTestId("create-view-modal").locator("input").fill("My test view")
    const createBtn = page.getByTestId("create-view-modal").getByRole("button", { name: "Create view" })
    await expect(createBtn).toBeEnabled()
  })

  test("clicking backdrop closes the modal", async ({ page }) => {
    await page.getByTestId("create-view-btn").click()
    await expect(page.getByTestId("create-view-modal")).toBeVisible()
    await page.click("body", { position: { x: 10, y: 10 } })
    await expect(page.getByTestId("create-view-modal")).not.toBeVisible()
  })
})

test.describe("Project directory – project rows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("project rows are visible", async ({ page }) => {
    await expect(page.locator("text=New employee onboarding update").first()).toBeVisible()
  })
})
