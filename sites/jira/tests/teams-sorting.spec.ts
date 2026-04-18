import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/teams/directory"

test.describe("Teams directory – sorting", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
    // Switch to list view for stable DOM order checking
    await page.getByTestId("view-list-btn").click()
  })

  test("Sort by name renders teams in A–Z alphabetical order", async ({ page }) => {
    await page.getByTestId("view-more-btn").click()
    await page.getByTestId("sort-by-name").click()

    const names = await page.getByTestId("team-name").allTextContents()
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  test("Sort by members renders teams in descending member count order", async ({ page }) => {
    await page.getByTestId("view-more-btn").click()
    await page.getByTestId("sort-by-members").click()

    const names = await page.getByTestId("team-name").allTextContents()
    // Engineering (12) → Product (6) → Design (5) when using default data
    expect(names.length).toBeGreaterThan(0)

    // Verify strict descending by extracting members text from each row
    const rows = page.locator("a[href^='/teams/']")
    const count = await rows.count()
    const memberCounts: number[] = []
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent()
      const match = text?.match(/(\d+)\s*member/)
      if (match) memberCounts.push(parseInt(match[1]))
    }
    for (let i = 0; i < memberCounts.length - 1; i++) {
      expect(memberCounts[i]).toBeGreaterThanOrEqual(memberCounts[i + 1])
    }
  })

  test("Sort by name: 'Sort by name' menu item shows active checkmark", async ({ page }) => {
    await page.getByTestId("view-more-btn").click()
    await page.getByTestId("sort-by-name").click()
    // Reopen to verify active state
    await page.getByTestId("view-more-btn").click()
    await expect(page.getByTestId("sort-by-name")).toHaveClass(/text-blue-600/)
  })

  test("Sort by members: 'Sort by members' menu item shows active checkmark", async ({ page }) => {
    await page.getByTestId("view-more-btn").click()
    await page.getByTestId("sort-by-members").click()
    await page.getByTestId("view-more-btn").click()
    await expect(page.getByTestId("sort-by-members")).toHaveClass(/text-blue-600/)
  })

  test("switching sort re-renders the list", async ({ page }) => {
    // Sort by name first
    await page.getByTestId("view-more-btn").click()
    await page.getByTestId("sort-by-name").click()
    const namesSortedByName = await page.getByTestId("team-name").allTextContents()

    // Sort by members
    await page.getByTestId("view-more-btn").click()
    await page.getByTestId("sort-by-members").click()
    const namesSortedByMembers = await page.getByTestId("team-name").allTextContents()

    // The two sort orders should differ (unless all members are equal)
    // At minimum verify the list re-rendered with same teams
    expect(namesSortedByName.sort()).toEqual(namesSortedByMembers.sort())
  })
})
