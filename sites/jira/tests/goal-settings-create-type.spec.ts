import { test, expect, request as pwRequest } from "@playwright/test"

const BASE = "http://localhost:3000"
const TYPES_URL = `${BASE}/goals/settings?tab=types`
const CREATE_URL = `${BASE}/goals/settings?tab=types&form=createGoalType`

// ── Helpers ──────────────────────────────────────────────────────────────────

async function resetTypes() {
  const ctx = await pwRequest.newContext({ baseURL: BASE })
  await ctx.delete("/api/data/goal-types")
  await ctx.dispose()
}

async function getTypeCount(): Promise<number> {
  const ctx = await pwRequest.newContext({ baseURL: BASE })
  const res = await ctx.get("/api/data/goal-types")
  const types = await res.json()
  await ctx.dispose()
  return types.length
}

// ── Section A: "Create type" button & navigation ─────────────────────────────

test.describe("SA: Create type button", () => {
  test.beforeAll(resetTypes)

  test("SA01 – types tab shows Create type button", async ({ page }) => {
    await page.goto(TYPES_URL)
    await expect(page.getByTestId("create-type-btn")).toBeVisible()
  })

  test("SA02 – Create type button text is correct", async ({ page }) => {
    await page.goto(TYPES_URL)
    await expect(page.getByTestId("create-type-btn")).toHaveText("Create type")
  })

  test("SA03 – clicking Create type navigates to create form URL", async ({ page }) => {
    await page.goto(TYPES_URL)
    await page.getByTestId("create-type-btn").click()
    await expect(page).toHaveURL(/form=createGoalType/)
  })

  test("SA04 – create form URL is accessible directly", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByRole("heading", { name: "Create goal type" })).toBeVisible()
  })

  test("SA05 – goal-types-count badge shows correct initial count", async ({ page }) => {
    await page.goto(TYPES_URL)
    const initialCount = await getTypeCount()
    await expect(page.getByTestId("goal-types-count")).toHaveText(String(initialCount))
  })
})

// ── Section B: Form structure ─────────────────────────────────────────────────

test.describe("SB: Create form structure", () => {
  test("SB01 – breadcrumb is visible", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByRole("button", { name: "Goal settings" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Create goal type" })).toBeVisible()
  })

  test("SB02 – breadcrumb 'Goal settings' link navigates back", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByRole("button", { name: "Goal settings" }).click()
    await expect(page).toHaveURL(/tab=types/)
    await expect(page).not.toHaveURL(/form=createGoalType/)
  })

  test("SB03 – back arrow button is visible", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("create-type-back-btn")).toBeVisible()
  })

  test("SB04 – back arrow navigates to types tab", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-back-btn").click()
    await expect(page).toHaveURL(/tab=types/)
    await expect(page).not.toHaveURL(/form=createGoalType/)
  })

  test("SB05 – Name label is present", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByText(/^Name\s*\*?$/).first()).toBeVisible()
  })

  test("SB06 – Name input is present", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("create-type-name-input")).toBeVisible()
  })

  test("SB07 – Description label is present", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByText("Description").first()).toBeVisible()
  })

  test("SB08 – Description input is present", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("create-type-desc-input")).toBeVisible()
  })

  test("SB09 – Add success measure card is present", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("add-success-measure-btn")).toBeVisible()
  })

  test("SB10 – Add success measure card text is correct", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("add-success-measure-btn")).toContainText("Add a success measure")
  })

  test("SB11 – Enable toggle is present", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("create-type-enable-toggle")).toBeVisible()
  })

  test("SB12 – Create button is present", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("create-type-submit-btn")).toBeVisible()
  })

  test("SB13 – Cancel button is present", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("create-type-cancel-btn")).toBeVisible()
  })
})

// ── Section C: Name field ─────────────────────────────────────────────────────

test.describe("SC: Name field validation", () => {
  test("SC01 – Create button disabled when name is empty", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("create-type-submit-btn")).toBeDisabled()
  })

  test("SC02 – Create button enabled after typing a name", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Sprint")
    await expect(page.getByTestId("create-type-submit-btn")).toBeEnabled()
  })

  test("SC03 – Name input accepts up to 25 characters", async ({ page }) => {
    await page.goto(CREATE_URL)
    const input = page.getByTestId("create-type-name-input")
    await input.fill("A".repeat(30))
    const val = await input.inputValue()
    expect(val.length).toBeLessThanOrEqual(25)
  })

  test("SC04 – Name hint text mentions max 25 characters", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByText(/Max length of 25 characters/).first()).toBeVisible()
  })

  test("SC05 – Clearing name re-disables Create button", async ({ page }) => {
    await page.goto(CREATE_URL)
    const input = page.getByTestId("create-type-name-input")
    await input.fill("Test")
    await expect(page.getByTestId("create-type-submit-btn")).toBeEnabled()
    await input.fill("")
    await expect(page.getByTestId("create-type-submit-btn")).toBeDisabled()
  })

  test("SC06 – Whitespace-only name keeps Create button disabled", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("   ")
    await expect(page.getByTestId("create-type-submit-btn")).toBeDisabled()
  })
})

// ── Section D: Description field ──────────────────────────────────────────────

test.describe("SD: Description field", () => {
  test("SD01 – Description input accepts text", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-desc-input").fill("My custom type")
    await expect(page.getByTestId("create-type-desc-input")).toHaveValue("My custom type")
  })

  test("SD02 – Description input accepts up to 75 characters", async ({ page }) => {
    await page.goto(CREATE_URL)
    const input = page.getByTestId("create-type-desc-input")
    await input.fill("D".repeat(80))
    const val = await input.inputValue()
    expect(val.length).toBeLessThanOrEqual(75)
  })

  test("SD03 – Description hint mentions max 75 characters", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByText(/Max length of 75 characters/).first()).toBeVisible()
  })

  test("SD04 – Description is optional (Create enabled without it)", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Q Plan")
    await expect(page.getByTestId("create-type-submit-btn")).toBeEnabled()
  })
})

// ── Section E: Success measure expand/collapse ────────────────────────────────

test.describe("SE: Success measure section", () => {
  test("SE01 – SM inputs not visible by default", async ({ page }) => {
    await page.goto(CREATE_URL)
    await expect(page.getByTestId("sm-name-input")).not.toBeVisible()
    await expect(page.getByTestId("sm-name-plural-input")).not.toBeVisible()
  })

  test("SE02 – clicking Add a success measure expands the section", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("add-success-measure-btn").click()
    await expect(page.getByTestId("sm-name-input")).toBeVisible()
    await expect(page.getByTestId("sm-name-plural-input")).toBeVisible()
    await expect(page.getByTestId("sm-desc-input")).toBeVisible()
  })

  test("SE03 – expanded section shows Remove success measure button", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("add-success-measure-btn").click()
    await expect(page.getByTestId("remove-success-measure-btn")).toBeVisible()
  })

  test("SE04 – clicking Remove collapses success measure section", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("add-success-measure-btn").click()
    await page.getByTestId("remove-success-measure-btn").click()
    await expect(page.getByTestId("sm-name-input")).not.toBeVisible()
    await expect(page.getByTestId("add-success-measure-btn")).toBeVisible()
  })

  test("SE05 – SM name accepts up to 25 characters", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("add-success-measure-btn").click()
    const input = page.getByTestId("sm-name-input")
    await input.fill("X".repeat(30))
    const val = await input.inputValue()
    expect(val.length).toBeLessThanOrEqual(25)
  })

  test("SE06 – SM name plural accepts up to 25 characters", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("add-success-measure-btn").click()
    const input = page.getByTestId("sm-name-plural-input")
    await input.fill("X".repeat(30))
    const val = await input.inputValue()
    expect(val.length).toBeLessThanOrEqual(25)
  })

  test("SE07 – SM description accepts up to 75 characters", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("add-success-measure-btn").click()
    const input = page.getByTestId("sm-desc-input")
    await input.fill("D".repeat(80))
    const val = await input.inputValue()
    expect(val.length).toBeLessThanOrEqual(75)
  })

  test("SE08 – Remove clears SM name input", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("add-success-measure-btn").click()
    await page.getByTestId("sm-name-input").fill("Milestone")
    await page.getByTestId("remove-success-measure-btn").click()
    await page.getByTestId("add-success-measure-btn").click()
    await expect(page.getByTestId("sm-name-input")).toHaveValue("")
  })
})

// ── Section F: Enable toggle ──────────────────────────────────────────────────

test.describe("SF: Enable toggle", () => {
  test("SF01 – toggle is off by default", async ({ page }) => {
    await page.goto(CREATE_URL)
    const toggle = page.getByTestId("create-type-enable-toggle")
    const cls = await toggle.getAttribute("class")
    expect(cls).not.toContain("bg-green-500")
  })

  test("SF02 – clicking toggle turns it on", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-enable-toggle").click()
    const cls = await page.getByTestId("create-type-enable-toggle").getAttribute("class")
    expect(cls).toContain("bg-green-500")
  })

  test("SF03 – clicking toggle twice returns to off", async ({ page }) => {
    await page.goto(CREATE_URL)
    const toggle = page.getByTestId("create-type-enable-toggle")
    await toggle.click()
    await toggle.click()
    const cls = await toggle.getAttribute("class")
    expect(cls).not.toContain("bg-green-500")
  })
})

// ── Section G: Creation flows & validation ────────────────────────────────────

test.describe("SG: Goal type creation", () => {
  test.beforeEach(resetTypes)

  test("SG01 – Cancel navigates back without creating a type", async ({ page }) => {
    await page.goto(CREATE_URL)
    const countBefore = await getTypeCount()
    await page.getByTestId("create-type-name-input").fill("Should not exist")
    await page.getByTestId("create-type-cancel-btn").click()
    await expect(page).toHaveURL(/tab=types/)
    const countAfter = await getTypeCount()
    expect(countAfter).toBe(countBefore)
  })

  test("SG02 – successful creation navigates back to types tab", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Initiative")
    await page.getByTestId("create-type-submit-btn").click()
    await expect(page).toHaveURL(/tab=types/)
    await expect(page).not.toHaveURL(/form=createGoalType/)
  })

  test("SG03 – created type card appears in the list", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Initiative")
    await page.getByTestId("create-type-submit-btn").click()
    await page.waitForURL(/tab=types/)
    await expect(page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Initiative" })).toBeVisible()
  })

  test("SG04 – goal-types-count badge increments after creation", async ({ page }) => {
    const before = await getTypeCount()
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Initiative")
    await page.getByTestId("create-type-submit-btn").click()
    await expect(page.getByTestId("goal-types-count")).toHaveText(String(before + 1))
  })

  test("SG05 – creation with description stores description", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Milestone")
    await page.getByTestId("create-type-desc-input").fill("Track project milestones")
    await page.getByTestId("create-type-submit-btn").click()
    await expect(page.getByText("Track project milestones")).toBeVisible()
  })

  test("SG06 – creation with enable toggle makes type show ENABLED badge", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Sprint")
    await page.getByTestId("create-type-enable-toggle").click()
    await page.getByTestId("create-type-submit-btn").click()
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Sprint" })
    await expect(card.getByText("ENABLED")).toBeVisible()
  })

  test("SG07 – creation with success measure shows child row in card", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("OKR Type")
    await page.getByTestId("add-success-measure-btn").click()
    await page.getByTestId("sm-name-input").fill("Key Result")
    await page.getByTestId("sm-name-plural-input").fill("Key Results")
    await page.getByTestId("create-type-submit-btn").click()
    await page.waitForURL(/tab=types/)
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "OKR Type" })
    await expect(card).toBeVisible()
    await expect(card.getByText("Key Result", { exact: true })).toBeVisible()
  })

  test("SG08 – creation without success measure shows no child row", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Simple Type")
    await page.getByTestId("create-type-submit-btn").click()
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Simple Type" })
    await expect(card).toBeVisible()
    // no border-l child section
    await expect(card.locator(".border-l-2")).toHaveCount(0)
  })

  test("SG09 – created type has Edit button", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Editable")
    await page.getByTestId("create-type-submit-btn").click()
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Editable" })
    const id = await card.getAttribute("data-testid").then((v) => v?.replace("goal-type-card-", ""))
    await expect(page.getByTestId(`edit-type-btn-${id}`)).toBeVisible()
  })

  test("SG10 – created (non-seeded) type has Delete button", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Deletable")
    await page.getByTestId("create-type-submit-btn").click()
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Deletable" })
    const id = await card.getAttribute("data-testid").then((v) => v?.replace("goal-type-card-", ""))
    await expect(page.getByTestId(`delete-type-btn-${id}`)).toBeVisible()
  })
})

// ── Section H: Cleanup & persistent state ─────────────────────────────────────

test.describe("SH: Delete & cleanup", () => {
  test.beforeEach(resetTypes)

  test("SH01 – seeded type (Goal) has no Delete button", async ({ page }) => {
    await page.goto(TYPES_URL)
    await expect(page.getByTestId("delete-type-btn-goal")).not.toBeVisible()
  })

  test("SH02 – seeded type (Objective) has no Delete button", async ({ page }) => {
    await page.goto(TYPES_URL)
    await expect(page.getByTestId("delete-type-btn-objective")).not.toBeVisible()
  })

  test("SH03 – delete button opens confirmation dialog", async ({ page }) => {
    // create a type first
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Temp Type")
    await page.getByTestId("create-type-submit-btn").click()
    await page.waitForURL(/tab=types/)
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Temp Type" })
    const id = await card.getAttribute("data-testid").then((v) => v?.replace("goal-type-card-", ""))
    await page.getByTestId(`delete-type-btn-${id}`).click()
    await expect(page.getByTestId("delete-type-confirm-btn")).toBeVisible()
    await expect(page.getByTestId("delete-type-cancel-btn")).toBeVisible()
  })

  test("SH04 – cancel on delete dialog keeps type in list", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Stays Here")
    await page.getByTestId("create-type-submit-btn").click()
    await page.waitForURL(/tab=types/)
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Stays Here" })
    const id = await card.getAttribute("data-testid").then((v) => v?.replace("goal-type-card-", ""))
    await page.getByTestId(`delete-type-btn-${id}`).click()
    await page.getByTestId("delete-type-cancel-btn").click()
    await expect(page.getByTestId(`goal-type-card-${id}`)).toBeVisible()
  })

  test("SH05 – confirming delete removes type from list", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Remove Me")
    await page.getByTestId("create-type-submit-btn").click()
    await page.waitForURL(/tab=types/)
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Remove Me" })
    const id = await card.getAttribute("data-testid").then((v) => v?.replace("goal-type-card-", ""))
    await page.getByTestId(`delete-type-btn-${id}`).click()
    await page.getByTestId("delete-type-confirm-btn").click()
    await expect(page.getByTestId(`goal-type-card-${id}`)).not.toBeVisible()
  })

  test("SH06 – deleting type decrements goal-types-count badge", async ({ page }) => {
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Count Check")
    await page.getByTestId("create-type-submit-btn").click()
    await page.waitForURL(/tab=types/)
    const countBefore = parseInt(await page.getByTestId("goal-types-count").innerText(), 10)
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Count Check" })
    const id = await card.getAttribute("data-testid").then((v) => v?.replace("goal-type-card-", ""))
    await page.getByTestId(`delete-type-btn-${id}`).click()
    await page.getByTestId("delete-type-confirm-btn").click()
    await expect(page.getByTestId("goal-types-count")).toHaveText(String(countBefore - 1))
  })

  test("SH07 – after cleanup only seeded types remain", async ({ page }) => {
    // create a custom type then delete it
    await page.goto(CREATE_URL)
    await page.getByTestId("create-type-name-input").fill("Ephemeral")
    await page.getByTestId("create-type-submit-btn").click()
    await page.waitForURL(/tab=types/)
    const card = page.locator("[data-testid^='goal-type-card-']").filter({ hasText: "Ephemeral" })
    const id = await card.getAttribute("data-testid").then((v) => v?.replace("goal-type-card-", ""))
    await page.getByTestId(`delete-type-btn-${id}`).click()
    await page.getByTestId("delete-type-confirm-btn").click()
    // seeded types still present
    await expect(page.getByTestId("goal-type-card-goal")).toBeVisible()
    await expect(page.getByTestId("goal-type-card-objective")).toBeVisible()
    await expect(page.getByTestId(`goal-type-card-${id}`)).not.toBeVisible()
  })
})
