import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/project-directory/following"

async function openRowMenu(page: import("@playwright/test").Page, rowText: string) {
  const row = page.locator("[data-testid='project-row']").filter({ hasText: rowText })
  await row.hover()
  await row.getByTestId("row-menu-btn").click()
  await page.getByTestId("row-menu-dropdown").waitFor({ state: "visible" })
}

test.describe("Following page – row-level actions (SCRUM Project)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("ellipsis button opens dropdown with Star, Archive project, Copy project", async ({ page }) => {
    await openRowMenu(page, "SCRUM Project")
    const dropdown = page.getByTestId("row-menu-dropdown")
    await expect(dropdown).toBeVisible()
    await expect(dropdown.getByTestId("row-action-star")).toContainText("Star")
    await expect(dropdown.getByTestId("row-action-archive")).toContainText("Archive project")
    await expect(dropdown.getByTestId("row-action-copy")).toContainText("Copy project")
  })

  test("clicking outside dropdown closes it", async ({ page }) => {
    await openRowMenu(page, "SCRUM Project")
    await page.click("body", { position: { x: 10, y: 10 } })
    await expect(page.getByTestId("row-menu-dropdown")).not.toBeVisible()
  })

  test("Star: shows toast and menu item changes to Unstar", async ({ page }) => {
    await openRowMenu(page, "SCRUM Project")
    await page.getByTestId("row-action-star").click()
    // Toast appears with starred message
    await expect(page.locator("text=starred list")).toBeVisible()
    // Reopen — should now say Unstar
    await openRowMenu(page, "SCRUM Project")
    await expect(page.getByTestId("row-action-star")).toContainText("Unstar")
  })

  test("Star then Unstar: menu item reverts to Star", async ({ page }) => {
    await openRowMenu(page, "SCRUM Project")
    await page.getByTestId("row-action-star").click()
    await openRowMenu(page, "SCRUM Project")
    await page.getByTestId("row-action-star").click() // Unstar
    await openRowMenu(page, "SCRUM Project")
    await expect(page.getByTestId("row-action-star")).toContainText("Star")
  })

  test("Archive project: row disappears from the table", async ({ page }) => {
    await expect(page.locator("[data-testid='project-row']").filter({ hasText: "SCRUM Project" })).toBeVisible()
    await openRowMenu(page, "SCRUM Project")
    await page.getByTestId("row-action-archive").click()
    await expect(page.locator("[data-testid='project-row']").filter({ hasText: "SCRUM Project" })).not.toBeVisible()
  })

  test("Archive project: shows success toast", async ({ page }) => {
    await openRowMenu(page, "SCRUM Project")
    await page.getByTestId("row-action-archive").click()
    await expect(page.getByText('"SCRUM Project" archived', { exact: false })).toBeVisible()
  })

  test("Copy project: opens copy modal pre-filled with project name", async ({ page }) => {
    await openRowMenu(page, "SCRUM Project")
    await page.getByTestId("row-action-copy").click()
    await expect(page.locator("text=Copy project").first()).toBeVisible()
    const input = page.locator("[data-testid='row-menu-dropdown']").or(page.locator("text=Copy project")).locator("..").locator("input").first()
    // Modal has input pre-filled with "SCRUM Project (copy)"
    const modal = page.locator("text=Copy project").locator("..").locator("..")
    await expect(modal.locator("input").first()).toHaveValue("SCRUM Project (copy)")
  })

  test("Copy project: Submit adds duplicate row to table", async ({ page }) => {
    const initialCount = await page.locator("[data-testid='project-row']").count()
    await openRowMenu(page, "SCRUM Project")
    await page.getByTestId("row-action-copy").click()
    // Click Submit in the modal
    await page.getByRole("button", { name: "Submit" }).click()
    const newCount = await page.locator("[data-testid='project-row']").count()
    expect(newCount).toBeGreaterThan(initialCount)
  })

  test("Copy project: Cancel closes modal without adding row", async ({ page }) => {
    const initialCount = await page.locator("[data-testid='project-row']").count()
    await openRowMenu(page, "SCRUM Project")
    await page.getByTestId("row-action-copy").click()
    await page.getByRole("button", { name: "Cancel" }).click()
    await expect(page.locator("text=Copy project")).not.toBeVisible()
    const newCount = await page.locator("[data-testid='project-row']").count()
    expect(newCount).toBe(initialCount)
  })
})
