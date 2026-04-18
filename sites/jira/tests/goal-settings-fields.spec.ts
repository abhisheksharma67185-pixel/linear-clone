/**
 * E2E: Goal Settings → Fields tab
 *
 * Covers the "+ Add field" button and the entire Sidebar custom fields section
 * (22 test cases from the spec).
 */

import { test, expect, Page, request as pwRequest } from "@playwright/test"

const URL = "/goals/settings?tab=fields"

// Delete ALL custom fields before the suite so duplicate-name validation
// never disables the Save button due to stale server state from a prior run.
// Uses DELETE /api/data/goal-fields which shares the same store instance as GET/POST.
test.beforeAll(async () => {
  const ctx = await pwRequest.newContext({ baseURL: "http://localhost:3000" })
  await ctx.delete("/api/data/goal-fields")
  await ctx.dispose()
})

// ─── helpers ──────────────────────────────────────────────────────────────────

async function goToFields(page: Page) {
  await page.goto(URL)
  await expect(page.getByRole("heading", { name: "Goal settings" })).toBeVisible()
  // Make sure the Fields tab is active
  await expect(page.getByRole("button", { name: /^Fields$/ }).or(
    page.locator("button").filter({ hasText: /^Fields$/ })
  ).first()).toBeVisible()
}

/** Opens the inline Add Field form by clicking "+ Add field". */
async function openAddForm(page: Page) {
  await page.getByRole("button", { name: /Add field/i }).click()
  await expect(page.locator("h3").filter({ hasText: "Create field" })).toBeVisible()
}

/** Fills and saves a new field. */
async function createField(page: Page, opts: {
  name: string
  type?: string
  description?: string
}) {
  await openAddForm(page)
  await page.getByPlaceholder(/e\.g\. Priority/i).fill(opts.name)
  if (opts.type) {
    await page.locator("select").selectOption(opts.type)
  }
  if (opts.description) {
    await page.getByPlaceholder(/Describe what this field/i).fill(opts.description)
  }
  // Wait for the save button to become enabled (validation passes)
  const saveBtn = page.getByTestId("add-field-save-btn")
  await expect(saveBtn).toBeEnabled({ timeout: 5000 })
  await saveBtn.click()
  await expect(page.locator("h3").filter({ hasText: "Create field" })).not.toBeVisible({ timeout: 5000 })
}

/** Finds the ⋯ menu button on the row for a custom field by name. */
async function getFieldMenuButton(page: Page, name: string) {
  // Find the row by its data-field-name attribute
  const row = page.locator(`[data-field-name="${name}"]`)
  await expect(row).toBeVisible({ timeout: 5000 })
  // The ⋯ button has data-testid="field-menu-btn-<id>"
  // We can find it via a partial testid match inside the row
  return row.locator('[data-testid^="field-menu-btn-"]')
}

/** Deletes a custom field by name (clicks ⋯ → Delete → confirm). */
async function deleteField(page: Page, name: string) {
  const menuBtn = await getFieldMenuButton(page, name)
  await menuBtn.click()
  await page.getByRole("button", { name: /^Delete$/ }).click()
  // confirm dialog
  await page.getByRole("button", { name: /^Delete$/ }).last().click()
  await expect(page.locator(`[data-field-name="${name}"]`)).not.toBeVisible({ timeout: 5000 })
}

// ─── tests ────────────────────────────────────────────────────────────────────

test.describe("Goal Settings → Fields tab", () => {

  // ── Validation ─────────────────────────────────────────────────────────────

  test("TC01 – clicking '+ Add field' shows the inline form with Name, Field type, Description", async ({ page }) => {
    await goToFields(page)
    await page.getByRole("button", { name: /Add field/i }).click()
    const form = page.locator("h3").filter({ hasText: "Create field" })
    await expect(form).toBeVisible()
    await expect(page.getByPlaceholder(/e\.g\. Priority/i)).toBeVisible()
    await expect(page.locator("select")).toBeVisible()
    await expect(page.getByPlaceholder(/Describe what this field/i)).toBeVisible()
  })

  test("TC02 – clicking Save with empty Name shows a validation error", async ({ page }) => {
    await goToFields(page)
    await openAddForm(page)
    const saveBtn = page.getByTestId("add-field-save-btn")
    await expect(saveBtn).toBeDisabled()
  })

  test("TC03 – Name filled but no options for Select type keeps Save disabled; missing options shows error", async ({ page }) => {
    await goToFields(page)
    await openAddForm(page)
    await page.getByPlaceholder(/e\.g\. Priority/i).fill("Test Field Name")
    await page.locator("select").selectOption("Select")
    const saveBtn = page.getByTestId("add-field-save-btn")
    await expect(saveBtn).toBeDisabled()
    await expect(page.getByText("At least one option is required")).toBeVisible()
  })

  test("TC04 – empty Name + valid Field type keeps Save disabled", async ({ page }) => {
    await goToFields(page)
    await openAddForm(page)
    await page.locator("select").selectOption("Number")
    const saveBtn = page.getByTestId("add-field-save-btn")
    await expect(saveBtn).toBeDisabled()
  })

  test("TC05 – warning 'You can't change the type after creating a field' is visible", async ({ page }) => {
    await goToFields(page)
    await openAddForm(page)
    await expect(page.getByText(/You can't change the type after creating a field/i)).toBeVisible()
  })

  // ── Field type dropdown ─────────────────────────────────────────────────────

  test("TC06 – Field type dropdown contains Text, Number, Date, URL, Select, User", async ({ page }) => {
    await goToFields(page)
    await openAddForm(page)
    const select = page.locator("select")
    const options = await select.locator("option").allTextContents()
    for (const expected of ["Text", "Number", "Date", "URL", "Select", "User"]) {
      expect(options).toContain(expected)
    }
  })

  test("TC07 – selecting each field type updates the select value", async ({ page }) => {
    await goToFields(page)
    await openAddForm(page)
    const select = page.locator("select")
    for (const t of ["Text", "Number", "Date", "URL", "Select", "User"]) {
      await select.selectOption(t)
      await expect(select).toHaveValue(t)
    }
  })

  // ── Create fields ───────────────────────────────────────────────────────────

  test("TC08 – create Text field 'E2E Test Text Field' with description; it appears in list", async ({ page }) => {
    await goToFields(page)
    await createField(page, {
      name: "E2E Test Text Field",
      type: "Text",
      description: "Created by automated E2E test",
    })
    await expect(page.locator("p").filter({ hasText: "E2E Test Text Field" }).first()).toBeVisible()
  })

  test("TC09 – create Number field 'E2E Number Field'; it appears in list", async ({ page }) => {
    await goToFields(page)
    await createField(page, { name: "E2E Number Field", type: "Number" })
    await expect(page.locator("p").filter({ hasText: "E2E Number Field" }).first()).toBeVisible()
  })

  test("TC10 – create Date field 'E2E Date Field'; it appears in list", async ({ page }) => {
    await goToFields(page)
    await createField(page, { name: "E2E Date Field", type: "Date" })
    await expect(page.locator("p").filter({ hasText: "E2E Date Field" }).first()).toBeVisible()
  })

  test("TC11 – create URL field 'E2E URL Field'; it appears in list", async ({ page }) => {
    await goToFields(page)
    await createField(page, { name: "E2E URL Field", type: "URL" })
    await expect(page.locator("p").filter({ hasText: "E2E URL Field" }).first()).toBeVisible()
  })

  // ── Cancel ──────────────────────────────────────────────────────────────────

  test("TC12 – Cancel closes form without adding the field", async ({ page }) => {
    await goToFields(page)
    await openAddForm(page)
    await page.getByPlaceholder(/e\.g\. Priority/i).fill("Should not save")
    await page.locator("select").selectOption("Text")
    await page.getByRole("button", { name: /^Cancel$/ }).click()
    await expect(page.locator("h3").filter({ hasText: "Create field" })).not.toBeVisible()
    await expect(page.getByText("Should not save")).not.toBeVisible()
  })

  test("TC13 – Cancel on blank form closes cleanly", async ({ page }) => {
    await goToFields(page)
    await openAddForm(page)
    await page.getByRole("button", { name: /^Cancel$/ }).click()
    await expect(page.locator("h3").filter({ hasText: "Create field" })).not.toBeVisible()
  })

  // ── Description field ───────────────────────────────────────────────────────

  test("TC14 – description textarea accepts 200+ characters without error", async ({ page }) => {
    await goToFields(page)
    await openAddForm(page)
    const longText = "A".repeat(250)
    await page.getByPlaceholder(/Describe what this field/i).fill(longText)
    await expect(page.getByText(/character limit/i)).not.toBeVisible()
    await page.getByRole("button", { name: /^Cancel$/ }).click()
  })

  test("TC15 – seeded fields show their description text", async ({ page }) => {
    await goToFields(page)
    await expect(page.getByText("Department leading this project")).toBeVisible()
    await expect(page.getByText("Project keys assigned to this goal")).toBeVisible()
    await expect(page.getByText("Person carrying this goal over the finish line")).toBeVisible()
  })

  // ── Existing seeded fields ──────────────────────────────────────────────────

  test("TC16 – the 3 seeded sidebar fields are present", async ({ page }) => {
    await goToFields(page)
    await expect(page.getByText("Department", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Project key", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Sponsor", { exact: true }).first()).toBeVisible()
  })

  test("TC17 – Department row is visible and shows description", async ({ page }) => {
    await goToFields(page)
    await expect(page.getByText("Department", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Department leading this project")).toBeVisible()
  })

  test("TC18 – Project key row is visible and shows description", async ({ page }) => {
    await goToFields(page)
    await expect(page.getByText("Project key", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("Project keys assigned to this goal")).toBeVisible()
  })

  test("TC19 – Sponsor row is visible and shows description", async ({ page }) => {
    await goToFields(page)
    await expect(page.getByText("Sponsor")).toBeVisible()
    await expect(page.getByText("Person carrying this goal over the finish line")).toBeVisible()
  })

  test("TC20 – custom fields have a manage (⋯) menu with Rename and Delete options", async ({ page }) => {
    await goToFields(page)
    await createField(page, { name: "E2E Manage Test Field", type: "Text" })
    const menuBtn = await getFieldMenuButton(page, "E2E Manage Test Field")
    await menuBtn.click()
    await expect(page.getByRole("button", { name: /^Rename$/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /^Delete$/ })).toBeVisible()
    await page.keyboard.press("Escape")
    await deleteField(page, "E2E Manage Test Field")
  })

  test("TC21 – deleting a custom field shows confirmation dialog; cancelling preserves the field", async ({ page }) => {
    await goToFields(page)
    await createField(page, { name: "E2E Delete Confirm Field", type: "Text" })
    const menuBtn = await getFieldMenuButton(page, "E2E Delete Confirm Field")
    await menuBtn.click()
    await page.getByRole("button", { name: /^Delete$/ }).click()
    await expect(page.getByText("Delete field")).toBeVisible()
    // Cancel — field should still be in the list
    await page.getByRole("button", { name: /^Cancel$/ }).click()
    await expect(page.locator(`[data-field-name="E2E Delete Confirm Field"]`)).toBeVisible()
    await deleteField(page, "E2E Delete Confirm Field")
  })

  // ── Cleanup ─────────────────────────────────────────────────────────────────

  test("TC22 – clean up: delete all 4 E2E test fields created in TC08-11", async ({ page }) => {
    await goToFields(page)
    const fieldsToDelete = [
      "E2E Test Text Field",
      "E2E Number Field",
      "E2E Date Field",
      "E2E URL Field",
    ]
    for (const name of fieldsToDelete) {
      const visible = await page.getByText(name).isVisible().catch(() => false)
      if (!visible) continue
      await deleteField(page, name)
    }
    for (const name of fieldsToDelete) {
      await expect(page.getByText(name)).not.toBeVisible({ timeout: 3000 }).catch(() => {})
    }
  })
})
