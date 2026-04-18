import { test, expect } from "@playwright/test"

const PAGE = "http://localhost:3000/project-directory"
const EXPECTED_URL =
  "https://support.atlassian.com/platform-experiences/docs/sync-the-manager-attribute-into-atlassian-home/"

async function openReportingPopover(page: import("@playwright/test").Page) {
  await page.getByTestId("more-filters-btn").click()
  await page.getByTestId("more-filter-reporting-line").click()
  await page.getByTestId("reporting-popover").waitFor({ state: "visible" })
}

test.describe("Project directory – Reporting line filter popover", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForLoadState("networkidle")
  })

  test("opens the Reporting line popover via '...' button", async ({ page }) => {
    await openReportingPopover(page)
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
  })

  test("popover contains 'Stay across the projects your reports work on'", async ({ page }) => {
    await openReportingPopover(page)
    await expect(page.getByTestId("reporting-popover")).toContainText(
      "Stay across the projects your reports work on"
    )
  })

  test("popover contains identity provider text", async ({ page }) => {
    await openReportingPopover(page)
    await expect(page.getByTestId("reporting-popover")).toContainText("Connect your identity provider")
  })

  test("'Show me how' button has correct href attribute", async ({ page }) => {
    await openReportingPopover(page)
    const href = await page.getByTestId("show-me-how-btn").getAttribute("href")
    expect(href).toBe(EXPECTED_URL)
  })

  test("'Show me how' button has target=_blank", async ({ page }) => {
    await openReportingPopover(page)
    const target = await page.getByTestId("show-me-how-btn").getAttribute("target")
    expect(target).toBe("_blank")
  })

  test("'Show me how' opens a new tab when clicked", async ({ page, context }) => {
    await openReportingPopover(page)

    const pagePromise = context.waitForEvent("page")
    await page.getByTestId("show-me-how-btn").click()
    const newPage = await pagePromise

    // A new page/tab was successfully opened
    expect(newPage).toBeTruthy()
    await newPage.close()
  })

  test("new tab's initial URL contains the Atlassian domain (href-based check)", async ({ page }) => {
    await openReportingPopover(page)
    // Verify the destination URL via the href attribute — external nav is not loaded in test env
    const href = await page.getByTestId("show-me-how-btn").getAttribute("href")
    expect(href).toContain("support.atlassian.com")
    expect(href).toContain("atlassian.com")
  })
})
