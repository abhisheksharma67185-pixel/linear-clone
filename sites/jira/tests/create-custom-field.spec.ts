import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"
const PAGE = `${BASE}/project-directory`

test.describe("Project directory – Create a new field", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("Columns button is visible", async ({ page }) => {
    await expect(page.getByText("Columns")).toBeVisible()
  })

  test("clicking Columns opens the dropdown", async ({ page }) => {
    await page.getByText("Columns").click()
    await expect(page.getByRole("dialog")).toBeVisible()
  })

  test("'Create a new field' button is visible in the Columns dropdown", async ({ page }) => {
    await page.getByText("Columns").click()
    await expect(page.getByTestId("create-new-field-btn")).toBeVisible()
  })

  test("clicking 'Create a new field' opens the Create Field modal", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await expect(page.getByTestId("create-field-modal")).toBeVisible()
  })

  test("Create Field modal contains a Field Name input", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await expect(page.getByTestId("field-name-input")).toBeVisible()
  })

  test("Create Field modal contains a Field Type select", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await expect(page.getByTestId("field-type-select")).toBeVisible()
  })

  test("Create Field modal has Cancel and Create field buttons", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await expect(page.getByTestId("cancel-create-field-btn")).toBeVisible()
    await expect(page.getByTestId("submit-create-field-btn")).toBeVisible()
  })

  test("Create field button is disabled when Field Name is empty", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await expect(page.getByTestId("submit-create-field-btn")).toBeDisabled()
  })

  test("typing a Field Name enables the Create field button", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await page.getByTestId("field-name-input").fill("Target Quarter")
    await expect(page.getByTestId("submit-create-field-btn")).toBeEnabled()
  })

  test("Cancel closes the modal", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await expect(page.getByTestId("create-field-modal")).toBeVisible()
    await page.getByTestId("cancel-create-field-btn").click()
    await expect(page.getByTestId("create-field-modal")).not.toBeVisible()
  })

  test("full flow: fill name, select type, click Create — modal closes", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await page.getByTestId("field-name-input").fill("Target Quarter")
    await page.getByTestId("field-type-select").selectOption("number")
    await page.getByTestId("submit-create-field-btn").click()
    await expect(page.getByTestId("create-field-modal")).not.toBeVisible()
  })

  test("created field appears in Columns dropdown", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await page.getByTestId("field-name-input").fill("Target Quarter")
    await page.getByTestId("field-type-select").selectOption("number")
    await page.getByTestId("submit-create-field-btn").click()
    // Reopen columns dropdown
    await page.getByText("Columns").click()
    await expect(page.getByRole("dialog")).toContainText("Target Quarter")
  })

  test("created field shows its type badge in Columns dropdown", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await page.getByTestId("field-name-input").fill("Budget Estimate")
    await page.getByTestId("field-type-select").selectOption("number")
    await page.getByTestId("submit-create-field-btn").click()
    await page.getByText("Columns").click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toContainText("Budget Estimate")
    await expect(dialog).toContainText("number")
  })

  test("clicking backdrop closes the modal", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    await expect(page.getByTestId("create-field-modal")).toBeVisible()
    await page.click("body", { position: { x: 10, y: 10 } })
    await expect(page.getByTestId("create-field-modal")).not.toBeVisible()
  })

  test("Field Type dropdown contains Short text option", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    const select = page.getByTestId("field-type-select")
    await expect(select.locator("option[value='text']")).toHaveText("Short text")
  })

  test("Field Type dropdown contains Number option", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    const select = page.getByTestId("field-type-select")
    await expect(select.locator("option[value='number']")).toHaveText("Number")
  })

  test("Field Type dropdown contains Date option", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    const select = page.getByTestId("field-type-select")
    await expect(select.locator("option[value='date']")).toHaveText("Date")
  })

  test("Field Type dropdown contains Dropdown option", async ({ page }) => {
    await page.getByText("Columns").click()
    await page.getByTestId("create-new-field-btn").click()
    const select = page.getByTestId("field-type-select")
    await expect(select.locator("option[value='select']")).toHaveText("Dropdown")
  })
})
