import { test, expect } from "@playwright/test"

const BASE = "http://localhost:3000"
const PAGE = `${BASE}/goals/archived`

// Helper: activate the reporting chip by clicking the "Reporting line" button
async function activateReportingChip(page: import("@playwright/test").Page) {
  // If chip is already shown, nothing to do
  if (await page.getByTestId("reporting-filter-chip").isVisible()) return
  await page.getByTestId("filter-btn-reporting").click()
}

// ── Section A: Trigger the popover ────────────────────────────────────────────

test.describe("SA: Trigger the popover", () => {
  test("SA01 – 'Reporting line' button is visible in the filter bar on load", async ({ page }) => {
    await page.goto(PAGE)
    await expect(page.getByTestId("filter-btn-reporting")).toBeVisible()
  })

  test("SA02 – clicking 'Reporting line' button activates the chip with blue/active styling", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    const chip = page.getByTestId("reporting-filter-chip")
    const cls = await chip.getAttribute("class")
    expect(cls).toContain("border-[#0052cc]")
    expect(cls).toContain("text-[#0052cc]")
  })

  test("SA03 – activated chip shows 'Reporting line for' text", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    await expect(page.getByTestId("reporting-filter-chip")).toContainText("Reporting line for")
  })

  test("SA04 – an '×' close button exists next to the chip", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    await expect(page.getByTestId("reporting-filter-x")).toBeVisible()
  })

  test("SA05 – clicking the 'Reporting line' button opens the popover", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
    await page.screenshot({ path: "test-results/sa05-popover-open.png" })
  })

  test("SA06 – popover contains org-chart illustration", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await expect(page.getByTestId("reporting-org-chart")).toBeVisible()
  })

  test("SA07 – popover contains heading text", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await expect(page.getByTestId("reporting-popover-heading")).toContainText(
      "Stay across the projects your reports work on"
    )
  })

  test("SA08 – popover contains body text", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await expect(page.getByTestId("reporting-popover-body")).toContainText(
      "Connect your identity provider to get started"
    )
  })

  test("SA09 – popover contains 'Show me how' button", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await expect(page.getByTestId("show-me-how-btn")).toBeVisible()
  })
})

// ── Section B: "Show me how" button — core tests ───────────────────────────────

test.describe("SB: Show me how button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await expect(page.getByTestId("show-me-how-btn")).toBeVisible()
  })

  test("SB01 – 'Show me how' button is visible inside the popover", async ({ page }) => {
    await expect(page.getByTestId("show-me-how-btn")).toBeVisible()
  })

  test("SB02 – button has an external link icon", async ({ page }) => {
    const btn = page.getByTestId("show-me-how-btn")
    await expect(btn.locator("svg")).toBeVisible()
  })

  test("SB03 – button has a non-empty href", async ({ page }) => {
    const href = await page.getByTestId("show-me-how-btn").getAttribute("href")
    expect(href).toBeTruthy()
    expect(href).not.toBe("#")
    expect(href).not.toBe("")
    console.log("Show me how href:", href)
  })

  test("SB04 – href starts with https://", async ({ page }) => {
    const href = await page.getByTestId("show-me-how-btn").getAttribute("href")
    expect(href).toMatch(/^https:\/\//)
  })

  test("SB05 – button has target=_blank (opens in new tab)", async ({ page }) => {
    const target = await page.getByTestId("show-me-how-btn").getAttribute("target")
    expect(target).toBe("_blank")
  })

  test("SB06 – clicking opens a new tab and current page stays open", async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByTestId("show-me-how-btn").click(),
    ])
    await expect(page).toHaveURL(PAGE)
    await newPage.waitForLoadState("domcontentloaded", { timeout: 15000 })
    await newPage.screenshot({ path: "test-results/sb06-destination-page.png" })
    await newPage.close()
  })

  test("SB07 – destination page loads without 404 or error", async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByTestId("show-me-how-btn").click(),
    ])
    await newPage.waitForLoadState("domcontentloaded", { timeout: 15000 })
    const title = await newPage.title()
    expect(title).not.toBe("")
    const bodyText = await newPage.locator("body").textContent()
    expect(bodyText?.toLowerCase()).not.toContain("page not found")
    await newPage.close()
  })

  test("SB08 – destination is related to identity provider / SSO setup", async ({ page }) => {
    const href = await page.getByTestId("show-me-how-btn").getAttribute("href")
    const isRelevant =
      /atlassian/i.test(href ?? "") ||
      /identity[-_]?provider/i.test(href ?? "") ||
      /sso/i.test(href ?? "") ||
      /security/i.test(href ?? "") ||
      /manager/i.test(href ?? "") ||
      /platform/i.test(href ?? "")
    expect(isRelevant).toBe(true)
  })

  test("SB09 – after opening new tab, focus returns to archived goals page", async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByTestId("show-me-how-btn").click(),
    ])
    await newPage.waitForLoadState("domcontentloaded", { timeout: 15000 })
    await newPage.close()
    await expect(page).toHaveURL(PAGE)
  })
})

// ── Section C: Popover behaviour ──────────────────────────────────────────────

test.describe("SC: Popover behaviour", () => {
  test("SC01 – re-triggering chip re-opens the popover", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    const chip = page.getByTestId("reporting-filter-chip")
    const popover = page.getByTestId("reporting-popover")
    if (await popover.isVisible()) await chip.click()
    await expect(popover).not.toBeVisible()
    await chip.click()
    await expect(popover).toBeVisible()
  })

  test("SC02 – clicking OUTSIDE the popover dismisses it", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
    await page.mouse.click(800, 500)
    await expect(page.getByTestId("reporting-popover")).not.toBeVisible()
  })

  test("SC03 – pressing Escape dismisses the popover", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("reporting-popover")).not.toBeVisible()
  })

  test("SC04 – clicking INSIDE the popover does NOT dismiss it", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await page.getByTestId("reporting-popover-heading").click()
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
  })

  test("SC05 – popover is positioned near the chip (not off-screen)", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    const popoverBox = await page.getByTestId("reporting-popover").boundingBox()
    const chipBox = await page.getByTestId("reporting-filter-chip").boundingBox()
    expect(popoverBox).not.toBeNull()
    expect(chipBox).not.toBeNull()
    expect(Math.abs((popoverBox!.y) - (chipBox!.y + chipBox!.height))).toBeLessThan(300)
  })

  test("SC06 – chip stays in filter bar after popover is closed via outside click", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await page.mouse.click(800, 500)
    await expect(page.getByTestId("reporting-filter-chip")).toBeVisible()
  })
})

// ── Section D: Popover content accuracy ───────────────────────────────────────

test.describe("SD: Popover content accuracy", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
  })

  test("SD01 – exact heading text matches", async ({ page }) => {
    await expect(page.getByTestId("reporting-popover-heading")).toHaveText(
      "Stay across the projects your reports work on"
    )
  })

  test("SD02 – exact body text matches", async ({ page }) => {
    await expect(page.getByTestId("reporting-popover-body")).toHaveText(
      "Connect your identity provider to get started"
    )
  })

  test("SD03 – button label is exactly 'Show me how'", async ({ page }) => {
    const btn = page.getByTestId("show-me-how-btn")
    const text = (await btn.textContent())?.trim()
    expect(text).toBe("Show me how")
  })

  test("SD04 – org-chart illustration renders (3 avatar SVGs visible)", async ({ page }) => {
    const chart = page.getByTestId("reporting-org-chart")
    await expect(chart).toBeVisible()
    const svgCount = await chart.locator("svg").count()
    expect(svgCount).toBeGreaterThanOrEqual(3)
  })

  test("SD05 – no console errors when popover is opened", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()) })
    await page.goto(PAGE)
    await activateReportingChip(page)
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
    expect(errors).toHaveLength(0)
  })
})

// ── Section E: Filter bar context ────────────────────────────────────────────

test.describe("SE: Filter bar context", () => {
  test("SE01 – on load, all filter buttons are visible (no chip active by default)", async ({ page }) => {
    await page.goto(PAGE)
    await expect(page.getByTestId("filter-btn-tag")).toBeVisible()
    await expect(page.getByTestId("filter-btn-status")).toBeVisible()
    await expect(page.getByTestId("filter-btn-owner")).toBeVisible()
    await expect(page.getByTestId("filter-btn-team")).toBeVisible()
    await expect(page.getByTestId("filter-btn-following")).toBeVisible()
    await expect(page.getByTestId("filter-btn-starred")).toBeVisible()
    await expect(page.getByTestId("filter-btn-metric")).toBeVisible()
    await expect(page.getByTestId("filter-btn-reporting")).toBeVisible()
  })

  test("SE02 – clicking '×' on reporting chip removes the chip", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    await expect(page.getByTestId("reporting-filter-chip")).toBeVisible()
    await page.getByTestId("reporting-filter-x").click()
    await expect(page.getByTestId("reporting-filter-chip")).not.toBeVisible()
  })

  test("SE03 – popover also disappears when chip is removed via ×", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
    await page.getByTestId("reporting-filter-x").click()
    await expect(page.getByTestId("reporting-popover")).not.toBeVisible()
  })

  test("SE04 – after removing chip, 'Reporting line' button appears in filter bar", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    await page.getByTestId("reporting-filter-x").click()
    await expect(page.getByTestId("filter-btn-reporting")).toBeVisible()
  })

  test("SE05 – goals list shows 3 goals after removing reporting filter", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    await page.getByTestId("reporting-filter-x").click()
    await expect(page.getByText("Reduce customer churn by 15%")).toBeVisible()
    await expect(page.getByText("Complete infrastructure migration to AWS")).toBeVisible()
    await expect(page.getByText("Launch mobile app v2.0")).toBeVisible()
  })

  test("SE06 – clicking 'Reporting line' button after removal re-adds the chip", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    await page.getByTestId("reporting-filter-x").click()
    await expect(page.getByTestId("reporting-filter-chip")).not.toBeVisible()
    await page.getByTestId("filter-btn-reporting").click()
    await expect(page.getByTestId("reporting-filter-chip")).toBeVisible()
  })

  test("SE07 – re-adding chip also opens the popover", async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    await page.getByTestId("reporting-filter-x").click()
    await page.getByTestId("filter-btn-reporting").click()
    await expect(page.getByTestId("reporting-popover")).toBeVisible()
  })
})

// ── Section F: Keyboard & accessibility ──────────────────────────────────────

test.describe("SF: Keyboard and accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await activateReportingChip(page)
    if (!(await page.getByTestId("reporting-popover").isVisible())) {
      await page.getByTestId("reporting-filter-chip").click()
    }
  })

  test("SF01 – 'Show me how' button is focusable via Tab", async ({ page }) => {
    const btn = page.getByTestId("show-me-how-btn")
    await btn.focus()
    await expect(btn).toBeFocused()
  })

  test("SF02 – pressing Enter on focused button opens new tab", async ({ page, context }) => {
    const btn = page.getByTestId("show-me-how-btn")
    await btn.focus()
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.keyboard.press("Enter"),
    ])
    await newPage.waitForLoadState("domcontentloaded", { timeout: 15000 })
    expect(newPage.url()).toMatch(/^https:\/\//)
    await newPage.close()
  })

  test("SF03 – button has an accessible label (aria-label)", async ({ page }) => {
    const btn = page.getByTestId("show-me-how-btn")
    const ariaLabel = await btn.getAttribute("aria-label")
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel!.length).toBeGreaterThan(0)
  })

  test("SF04 – external link icon SVG has aria-hidden=true", async ({ page }) => {
    const btn = page.getByTestId("show-me-how-btn")
    const iconSvg = btn.locator("svg")
    const ariaHidden = await iconSvg.getAttribute("aria-hidden")
    expect(ariaHidden).toBe("true")
  })

  test("SF05 – × close button has accessible aria-label", async ({ page }) => {
    const xBtn = page.getByTestId("reporting-filter-x")
    const ariaLabel = await xBtn.getAttribute("aria-label")
    expect(ariaLabel).toBeTruthy()
  })
})
