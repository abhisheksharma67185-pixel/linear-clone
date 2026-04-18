import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"
const PAGE = `${BASE}/goals/archived`
const EXPECTED_HREF =
  "https://support.atlassian.com/platform-experiences/docs/sync-the-manager-attribute-into-atlassian-home/"

test.describe("Reporting line popover – Show me how link", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    // activate the chip if not already active, then open the popover
    if (!(await page.getByTestId("reporting-filter-chip").isVisible())) {
      await page.getByTestId("filter-btn-reporting").click()
    }
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
  })

  test("Show me how link has the exact correct href", async ({ page }) => {
    const href = await page.getByTestId("show-me-how-btn").getAttribute("href")
    expect(href).toBe(EXPECTED_HREF)
  })

  test("clicking Show me how opens the correct Atlassian support page in a new tab", async ({
    page,
    context,
  }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByTestId("show-me-how-btn").click(),
    ])
    await newPage.waitForLoadState("domcontentloaded", { timeout: 15000 })
    // the new tab should land on (or redirect within) the expected support URL
    expect(newPage.url()).toContain("support.atlassian.com")
    await newPage.close()
  })
})
