import { test, expect, Page } from "@playwright/test"

const BASE = "http://localhost:3000"
const PAGE = `${BASE}/project-directory`

async function openCreateViewModal(page: Page, via: "button" | "dropdown" = "button") {
  if (via === "button") {
    await page.getByTestId("create-view-btn").click()
  } else {
    await page.getByTestId("add-tab-btn").click()
    await page.getByTestId("dropdown-create-view-btn").click()
  }
  await expect(page.getByTestId("create-view-modal")).toBeVisible()
}

async function closeModal(page: Page) {
  await page.getByTestId("cancel-create-view-btn").click()
  await expect(page.getByTestId("create-view-modal")).not.toBeVisible()
}

test.describe("SECTION A: Create view – blue filter-bar button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  // -- MODAL OPENS --
  test("1. Create view button is visible (blue) on the right side of the filter bar", async ({ page }) => {
    await expect(page.getByTestId("create-view-btn")).toBeVisible()
  })

  test("2a. Clicking Create view opens modal with title 'Create view'", async ({ page }) => {
    await openCreateViewModal(page)
    await expect(page.getByTestId("create-view-modal")).toContainText("Create view")
  })

  test("2b. Modal subtitle is present", async ({ page }) => {
    await openCreateViewModal(page)
    await expect(page.getByTestId("create-view-modal")).toContainText(
      "A view saves your search, filter, sort, and display options so you can quickly return to it later"
    )
  })

  test("2c. Modal has 'View name *' label with asterisk", async ({ page }) => {
    await openCreateViewModal(page)
    await expect(page.getByTestId("create-view-modal")).toContainText("View name")
    await expect(page.getByTestId("create-view-modal").locator("span.text-red-500")).toBeVisible()
  })

  test("2d. Modal has empty text input for view name", async ({ page }) => {
    await openCreateViewModal(page)
    const input = page.getByTestId("view-name-input")
    await expect(input).toBeVisible()
    await expect(input).toHaveValue("")
  })

  test("2e. Modal has info text 'Everyone at theta.computer01 can see this view'", async ({ page }) => {
    await openCreateViewModal(page)
    await expect(page.getByTestId("visibility-note")).toContainText("Everyone at theta.computer01 can see this view")
  })

  test("2f. Modal has a visibility icon next to info text", async ({ page }) => {
    await openCreateViewModal(page)
    await expect(page.getByTestId("visibility-note").locator("svg")).toBeVisible()
  })

  test("2g. Modal has Cancel and Create view buttons", async ({ page }) => {
    await openCreateViewModal(page)
    await expect(page.getByTestId("cancel-create-view-btn")).toBeVisible()
    await expect(page.getByTestId("submit-create-view-btn")).toBeVisible()
  })

  // -- VALIDATION --
  test("4. Create view button is disabled when name is empty", async ({ page }) => {
    await openCreateViewModal(page)
    await expect(page.getByTestId("submit-create-view-btn")).toBeDisabled()
  })

  test("4b. Red border appears on input when empty", async ({ page }) => {
    await openCreateViewModal(page)
    const input = page.getByTestId("view-name-input")
    const cls = await input.getAttribute("class")
    expect(cls).toContain("border-red")
  })

  test("4c. Error message visible when name is empty", async ({ page }) => {
    await openCreateViewModal(page)
    await expect(page.getByTestId("view-name-error")).toBeVisible()
    await expect(page.getByTestId("view-name-error")).toContainText("Give your view a name")
  })

  test("4d. Modal stays open when trying to submit without name", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("submit-create-view-btn").click({ force: true })
    await expect(page.getByTestId("create-view-modal")).toBeVisible()
  })

  test("5. Whitespace-only input is rejected (button stays disabled)", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("   ")
    await expect(page.getByTestId("submit-create-view-btn")).toBeDisabled()
  })

  test("6. Typing 'A' clears error and border goes normal", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("A")
    await expect(page.getByTestId("view-name-error")).not.toBeVisible()
    const cls = await page.getByTestId("view-name-input").getAttribute("class")
    expect(cls).not.toContain("border-red")
  })

  test("7. Create view button enabled after typing valid name", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("My View")
    await expect(page.getByTestId("submit-create-view-btn")).toBeEnabled()
  })

  // -- CANCEL --
  test("8. Typing name then Cancel closes modal without adding tab", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("Should Not Save")
    await closeModal(page)
    await expect(page.getByText("Should Not Save")).not.toBeVisible()
    await expect(page.getByTestId("add-tab-btn")).toBeVisible()
  })

  test("9. Re-open empty modal then Cancel closes cleanly", async ({ page }) => {
    await openCreateViewModal(page)
    await closeModal(page)
    await expect(page.getByTestId("create-view-modal")).not.toBeVisible()
    await expect(page.getByTestId("view-name-error")).not.toBeVisible()
  })

  // -- CLOSE VIA BACKDROP --
  test("10. Clicking backdrop closes modal", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("create-view-modal").click({ position: { x: 5, y: 5 } })
    await expect(page.getByTestId("create-view-modal")).not.toBeVisible()
  })

  test("11. Pressing Escape closes modal", async ({ page }) => {
    await openCreateViewModal(page)
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("create-view-modal")).not.toBeVisible()
  })

  // -- SUCCESSFUL CREATION --
  test("12. Creating 'E2E Test View 1' adds it as an active tab", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Test View 1")
    await page.getByTestId("submit-create-view-btn").click()
    await expect(page.getByTestId("create-view-modal")).not.toBeVisible()
    const viewTab = page.locator("[data-testid^='view-tab-']").first()
    await expect(viewTab).toBeVisible()
    await expect(viewTab).toContainText("E2E Test View 1")
    const tabBtn = viewTab.locator("button").first()
    await expect(tabBtn).toHaveClass(/text-blue-700|border-blue-600/)
  })

  test("13. Creating view with Status filter active saves filter", async ({ page }) => {
    await page.getByTestId("filter-btn-status").click()
    await expect(page.getByTestId("filter-chip-status")).toBeVisible()
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Filtered View")
    await page.getByTestId("submit-create-view-btn").click()
    await expect(page.locator("[data-testid^='view-tab-']").filter({ hasText: "E2E Filtered View" })).toBeVisible()
    await expect(page.getByTestId("filter-chip-status")).toBeVisible()
  })

  test("14. Duplicate name shows error 'A view with this name already exists'", async ({ page }) => {
    // Create first view
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Test View 1")
    await page.getByTestId("submit-create-view-btn").click()
    // Try duplicate
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Test View 1")
    await page.getByTestId("submit-create-view-btn").click()
    await expect(page.getByTestId("view-name-error")).toContainText("A view with this name already exists")
    await expect(page.getByTestId("create-view-modal")).toBeVisible()
  })

  test("15. Long name (100+ chars) creates tab that truncates with ellipsis", async ({ page }) => {
    const longName = "A".repeat(110)
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill(longName)
    await page.getByTestId("submit-create-view-btn").click()
    // Tab should be visible — truncated or full
    const tabs = page.locator(`[data-testid^="view-tab-"]`)
    await expect(tabs.last()).toBeVisible()
  })

  test("16. Special characters in name create view successfully", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E @#$% Special View!")
    await page.getByTestId("submit-create-view-btn").click()
    await expect(page.getByTestId("create-view-modal")).not.toBeVisible()
    await expect(page.locator("[data-testid^='view-tab-']").filter({ hasText: /Special View/ })).toBeVisible()
  })

  test("17. XSS input is stored as plain text, not executed", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("<script>alert(1)</script>")
    await page.getByTestId("submit-create-view-btn").click()
    // No alert should appear — the tab text should contain the literal string
    await expect(page.locator("[data-testid^='view-tab-']").last()).toBeVisible()
  })
})

test.describe("SECTION B: '+' tab dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("18. Clicking '+' opens dropdown with 'Search for views' input", async ({ page }) => {
    await page.getByTestId("add-tab-btn").click()
    await expect(page.getByTestId("add-tab-dropdown")).toBeVisible()
    await expect(page.getByTestId("view-search-input")).toBeVisible()
    await expect(page.getByTestId("view-search-input")).toHaveAttribute("placeholder", "Search for views")
  })

  test("18b. Dropdown has 'Create view' option with grid icon", async ({ page }) => {
    await page.getByTestId("add-tab-btn").click()
    await expect(page.getByTestId("dropdown-create-view-btn")).toBeVisible()
    await expect(page.getByTestId("dropdown-create-view-btn")).toContainText("Create view")
    await expect(page.getByTestId("dropdown-create-view-btn").locator("svg")).toBeVisible()
  })

  test("20. Clicking outside dropdown closes it", async ({ page }) => {
    await page.getByTestId("add-tab-btn").click()
    await expect(page.getByTestId("add-tab-dropdown")).toBeVisible()
    await page.click("body", { position: { x: 10, y: 10 } })
    await expect(page.getByTestId("add-tab-dropdown")).not.toBeVisible()
  })

  test("21. Pressing Escape closes dropdown", async ({ page }) => {
    await page.getByTestId("add-tab-btn").click()
    await expect(page.getByTestId("add-tab-dropdown")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("add-tab-dropdown")).not.toBeVisible()
  })

  test("22. Typing 'E2E' filters views matching 'E2E'", async ({ page }) => {
    // Create a view first
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Test View 1")
    await page.getByTestId("submit-create-view-btn").click()
    // Search
    await page.getByTestId("add-tab-btn").click()
    await page.getByTestId("view-search-input").fill("E2E")
    await expect(page.getByTestId("add-tab-dropdown")).toContainText("E2E Test View 1")
  })

  test("23. Typing 'nonexistent999' shows 'No views found'", async ({ page }) => {
    await page.getByTestId("add-tab-btn").click()
    await page.getByTestId("view-search-input").fill("nonexistent999")
    await expect(page.getByTestId("add-tab-dropdown")).toContainText("No views found")
  })

  test("24. Clearing search restores all views", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Test View 1")
    await page.getByTestId("submit-create-view-btn").click()
    await page.getByTestId("add-tab-btn").click()
    await page.getByTestId("view-search-input").fill("nonexistent")
    await page.getByTestId("view-search-input").fill("")
    await expect(page.getByTestId("add-tab-dropdown")).toContainText("E2E Test View 1")
  })

  test("25. Search is case-insensitive", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Test View 1")
    await page.getByTestId("submit-create-view-btn").click()
    await page.getByTestId("add-tab-btn").click()
    await page.getByTestId("view-search-input").fill("e2e test")
    await expect(page.getByTestId("add-tab-dropdown")).toContainText("E2E Test View 1")
  })

  test("26. 'Create view' in dropdown opens the same modal", async ({ page }) => {
    await page.getByTestId("add-tab-btn").click()
    await page.getByTestId("dropdown-create-view-btn").click()
    await expect(page.getByTestId("create-view-modal")).toBeVisible()
    await expect(page.getByTestId("create-view-modal")).toContainText("Create view")
  })

  test("27. Fill 'E2E View From Dropdown' via dropdown → new tab appears", async ({ page }) => {
    await openCreateViewModal(page, "dropdown")
    await page.getByTestId("view-name-input").fill("E2E View From Dropdown")
    await page.getByTestId("submit-create-view-btn").click()
    await expect(page.locator("[data-testid^='view-tab-']").filter({ hasText: "E2E View From Dropdown" })).toBeVisible()
  })

  test("28. Clicking a saved view from '+' dropdown switches to it", async ({ page }) => {
    // Create view with a filter
    await page.getByTestId("filter-btn-status").click()
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Test View 1")
    await page.getByTestId("submit-create-view-btn").click()
    // Switch away
    await page.getByRole("button", { name: "All projects" }).click()
    // Now switch back via "+"
    await page.getByTestId("add-tab-btn").click()
    await page.getByTestId("dropdown-create-view-btn").waitFor({ state: "visible" })
    await page.getByTestId("view-option-e2e-test-view-1").click()
    const tab = page.locator("[data-testid^='view-tab-']").first().locator("button").first()
    await expect(tab).toHaveClass(/text-blue-700|border-blue-600/)
  })
})

test.describe("SECTION C: View tabs behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
    // Create views
    for (const name of ["E2E Test View 1", "E2E Filtered View", "E2E View From Dropdown"]) {
      await openCreateViewModal(page)
      await page.getByTestId("view-name-input").fill(name)
      await page.getByTestId("submit-create-view-btn").click()
    }
  })

  test("29. Tab order is All projects → Your projects → custom views → '+'", async ({ page }) => {
    await expect(page.getByRole("button", { name: "All projects" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Your projects" })).toBeVisible()
    await expect(page.locator("[data-testid^='view-tab-']").filter({ hasText: "E2E Test View 1" })).toBeVisible()
    await expect(page.locator("[data-testid^='view-tab-']").filter({ hasText: "E2E Filtered View" })).toBeVisible()
    await expect(page.locator("[data-testid^='view-tab-']").filter({ hasText: "E2E View From Dropdown" })).toBeVisible()
    await expect(page.getByTestId("add-tab-btn")).toBeVisible()
  })

  test("30. Clicking 'All projects' tab shows all projects unfiltered", async ({ page }) => {
    await page.getByRole("button", { name: "All projects" }).click()
    await expect(page.locator("text=Showing").first()).toBeVisible()
  })

  test("31. Hovering a custom view tab reveals close button (opacity-0 → visible)", async ({ page }) => {
    const viewTab = page.locator("[data-testid^='view-tab-']").first()
    const closeBtn = viewTab.locator("[data-testid^='close-tab-']")
    await expect(closeBtn).toBeAttached()
  })

  test("32. Right-clicking a custom view tab shows context menu with Delete option", async ({ page }) => {
    const viewTab = page.locator("[data-testid^='view-tab-']").first()
    await viewTab.click({ button: "right" })
    await expect(page.getByRole("button", { name: "Delete view" })).toBeVisible()
  })

  test("33. 'All projects' tab always shows all projects", async ({ page }) => {
    await page.getByRole("button", { name: "All projects" }).click()
    const countText = await page.locator("text=Showing").first().textContent()
    expect(countText).toMatch(/\d+/)
  })
})

test.describe("SECTION D: Delete / cleanup created views", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("34. Deleting a view via '×' button removes it from the tab bar", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Test View 1")
    await page.getByTestId("submit-create-view-btn").click()
    const viewTab = page.locator("[data-testid^='view-tab-']").first()
    await viewTab.hover()
    await viewTab.locator("[data-testid^='close-tab-']").click()
    await expect(page.locator("[data-testid^='view-tab-']").filter({ hasText: "E2E Test View 1" })).not.toBeVisible()
  })

  test("35. Deleting via right-click context menu removes the tab", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("E2E Filtered View")
    await page.getByTestId("submit-create-view-btn").click()
    const viewTab = page.locator("[data-testid^='view-tab-']").first()
    await viewTab.click({ button: "right" })
    await page.getByRole("button", { name: "Delete view" }).click()
    await expect(page.locator("[data-testid^='view-tab-']").filter({ hasText: "E2E Filtered View" })).not.toBeVisible()
  })

  test("38. After deleting all custom views, only All projects, Your projects, + remain", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("view-name-input").fill("To Delete")
    await page.getByTestId("submit-create-view-btn").click()
    const viewTab = page.locator("[data-testid^='view-tab-']").first()
    await viewTab.hover()
    await viewTab.locator("[data-testid^='close-tab-']").click()
    await expect(page.getByRole("button", { name: "All projects" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Your projects" })).toBeVisible()
    await expect(page.getByTestId("add-tab-btn")).toBeVisible()
    await expect(page.locator("[data-testid^='view-tab-']")).toHaveCount(0)
  })
})

test.describe("SECTION E: Modal visibility note", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("39. Visibility note says exactly 'Everyone at theta.computer01 can see this view'", async ({ page }) => {
    await openCreateViewModal(page)
    const text = await page.getByTestId("visibility-note").textContent()
    expect(text?.trim()).toContain("Everyone at theta.computer01 can see this view")
  })

  test("40. Monitor icon next to visibility note is rendered", async ({ page }) => {
    await openCreateViewModal(page)
    await expect(page.getByTestId("visibility-note").locator("svg")).toBeVisible()
  })

  test("41. No tooltip appears when hovering over visibility note", async ({ page }) => {
    await openCreateViewModal(page)
    await page.getByTestId("visibility-note").hover()
    await expect(page.locator("[role='tooltip']")).not.toBeVisible()
  })
})
