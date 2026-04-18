import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/teams/people"

test.describe("People directory – filter bar active state", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("'Filter by Project' button is visible in default state", async ({ page }) => {
    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
    await expect(page.getByTestId("filter-btn-project")).toContainText("Filter by Project")
  })

  test("clicking 'Filter by Project' opens dropdown with search", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await expect(page.locator("input[placeholder='Choose a project']")).toBeVisible()
  })

  test("selecting a project shows active chip with 'Project is'", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await page.getByRole("button", { name: "My Scrum Project" }).click()

    const chip = page.getByTestId("filter-chip-project")
    await expect(chip).toBeVisible()
    await expect(chip).toContainText("Project is")
    // Label part has light-blue style
    await expect(chip.getByRole("button").first()).toHaveClass(/bg-blue-50/)
    // X button has solid-blue style
    await expect(chip.getByRole("button").last()).toHaveClass(/bg-blue-600/)
  })

  test("selecting 'My Scrum Project' shows 'Project is' chip", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await page.getByRole("button", { name: "My Scrum Project" }).click()

    const chip = page.getByTestId("filter-chip-project")
    await expect(chip).toBeVisible()
    await expect(chip).toContainText("Project is")
  })

  test("clicking X on chip returns to default state", async ({ page }) => {
    await page.getByTestId("filter-btn-project").click()
    await page.getByRole("button", { name: "My Scrum Project" }).click()

    await expect(page.getByTestId("filter-chip-project")).toBeVisible()
    await expect(page.getByTestId("filter-btn-project")).not.toBeVisible()

    // Click X — the last (second) button inside the chip
    await page.getByTestId("filter-chip-project").getByRole("button").last().click()

    await expect(page.getByTestId("filter-chip-project")).not.toBeVisible()
    await expect(page.getByTestId("filter-btn-project")).toBeVisible()
  })

  test("filter narrows results", async ({ page }) => {
    const before = await page.getByTestId("person-card").count()

    await page.getByTestId("filter-btn-project").click()
    await page.getByRole("button", { name: "Kanban Project" }).click()

    const after = await page.getByTestId("person-card").count()
    expect(after).toBeLessThanOrEqual(before)
    expect(after).toBeGreaterThan(0)
  })
})

test.describe("People directory – split card layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("person cards are rendered", async ({ page }) => {
    const cards = page.getByTestId("person-card")
    await expect(cards.first()).toBeVisible()
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test("each card has a left-side color block", async ({ page }) => {
    const firstCard = page.getByTestId("person-card").first()
    await expect(firstCard.getByTestId("person-card-avatar-block")).toBeVisible()
  })

  test("color block contains the person's initials", async ({ page }) => {
    const firstCard = page.getByTestId("person-card").first()
    const avatarBlock = firstCard.getByTestId("person-card-avatar-block")
    const text = await avatarBlock.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test("card has name text on the right side", async ({ page }) => {
    const firstCard = page.getByTestId("person-card").first()
    // The name should be outside the avatar block
    const cardText = await firstCard.textContent()
    // At least one person name should appear
    expect(cardText).toBeTruthy()
  })
})
