import { test, expect } from "@playwright/test"

// ─────────────────────────────────────────────────────────────────────────────
// Global Search Dropdown — empty state & external link tests
//
// Covers:
//   1. Clicking the global search input opens the dropdown.
//   2. The empty-state footer shows "Search for pages, users, and more".
//   3. "Tell me more about search" link opens a new tab pointing to atlassian.com.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:3000/home"

test.describe("Global Search Dropdown", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
    // Wait for the page to be ready
    await page.waitForLoadState("networkidle")
  })

  test("opens dropdown when search input is clicked", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search Jira"]').first()
    await searchInput.click()

    // Dropdown should be visible with the Jira tab content
    await expect(page.getByText("View all issues")).toBeVisible()
  })

  test("empty state shows 'Search for pages, users, and more'", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search Jira"]').first()
    await searchInput.click()

    // Ensure input is empty
    await expect(searchInput).toHaveValue("")

    // The hint text should be visible in the footer
    await expect(page.getByText("Search for pages, users, and more")).toBeVisible()
  })

  test("'Tell me more about search' link opens a new tab with atlassian.com URL", async ({
    page,
    context,
  }) => {
    const searchInput = page.locator('input[placeholder="Search Jira"]').first()
    await searchInput.click()

    // Wait for the dropdown to appear
    await expect(page.getByText("Tell me more about search")).toBeVisible()

    // Capture the new tab opened by the link click
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("link", { name: "Tell me more about search" }).click(),
    ])

    await newPage.waitForLoadState("domcontentloaded")

    expect(newPage.url()).toContain("atlassian.com")
    await newPage.close()
  })

  test("'Tell me more about search' link has correct href and target attributes", async ({
    page,
  }) => {
    const searchInput = page.locator('input[placeholder="Search Jira"]').first()
    await searchInput.click()

    const link = page.getByRole("link", { name: "Tell me more about search" })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", "https://support.atlassian.com/jira-work-management/docs/search-for-issues/")
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  test("dropdown closes when clicking outside", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search Jira"]').first()
    await searchInput.click()

    await expect(page.getByText("View all issues")).toBeVisible()

    // Click outside to close
    await page.mouse.click(10, 10)

    await expect(page.getByText("View all issues")).not.toBeVisible()
  })
})
