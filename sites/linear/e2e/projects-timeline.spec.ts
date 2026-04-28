/**
 * Playwright E2E for the Projects timeline view.
 *
 * Acceptance criteria from the spec:
 *   - Project rows persist across all four zoom modes without reload.
 *   - Project labels never truncate when the column has free space.
 *   - A single source-of-truth for "today" — every pill shows the
 *     same date string.
 *   - Header labels never render partially / overlap the today pill.
 *   - Dateless projects appear in an "Unscheduled" lane.
 *   - Persistent "New project" CTA visible when timeline is empty.
 *
 * See e2e/applications.spec.ts for install/run instructions.
 */
import { expect, test, type Page } from "@playwright/test"

const PROJECTS_URL = "/projects"

async function gotoTimeline(page: Page) {
  await page.goto(PROJECTS_URL)
  // Switch to the Timeline view via the view-type controls.
  await page
    .getByRole("button", { name: /^Timeline$/i })
    .first()
    .click()
  await expect(page.getByTestId("timeline-canvas")).toBeVisible()
}

test.describe("Projects timeline", () => {
  test.beforeEach(gotoTimeline)

  /**
   * Project rows persist across all four zoom modes.
   *
   * Cycles Year → Quarter → Month → Week → Year and asserts the row
   * count is identical at each step. The previous bug made rows
   * disappear when zoom changed because the row state was coupled to
   * the timeline rendering state.
   */
  test("project rows persist across all four zoom modes", async ({ page }) => {
    const allRowsLocator = page.locator(
      '[data-testid="timeline-scheduled-row"], [data-testid="timeline-unscheduled-row"]'
    )
    // Capture the initial count.
    await expect(allRowsLocator.first()).toBeVisible()
    const initialCount = await allRowsLocator.count()
    expect(initialCount).toBeGreaterThan(0)

    const zooms = ["Year", "Month", "Quarter", "Week", "Year"] as const
    for (const z of zooms) {
      // Open the zoom popover and select the zoom mode.
      await page
        .getByRole("button", { name: /^(Year|Quarter|Month|Week)$/ })
        .first()
        .click()
      await page.getByRole("button", { name: new RegExp(`^${z}$`) }).click()
      const count = await allRowsLocator.count()
      expect(
        count,
        `row count must remain ${initialCount} after zoom → ${z}`
      ).toBe(initialCount)
    }
  })

  /**
   * Single source-of-truth for "today" — every pill on the page that
   * shows today shows the SAME string. Catches drift between
   * components that each call `new Date()` independently.
   */
  test("every today pill shows the same date string", async ({ page }) => {
    const pills = page.getByTestId("today-pill")
    const count = await pills.count()
    expect(count).toBeGreaterThanOrEqual(1)
    const texts = await pills.evaluateAll((els) =>
      els.map((el) => (el.textContent ?? "").trim())
    )
    // All pill labels must be identical.
    expect(new Set(texts).size).toBe(1)
    // And match the "MMM D" pattern (e.g. "APR 25").
    expect(texts[0]).toMatch(/^[A-Z]{3}\s+\d{1,2}$/)
  })

  /**
   * Dateless projects appear in an Unscheduled lane.
   *
   * The fixture data may or may not include a dateless project; we
   * only assert the lane infrastructure is correct. If at least one
   * dateless project exists, the lane label and at least one row are
   * visible. If none exist, the lane is absent (no false header).
   */
  test("dateless projects render in the Unscheduled lane (or no lane if none)", async ({
    page,
  }) => {
    const laneLabel = page.getByTestId("timeline-unscheduled-lane-label")
    const laneRows = page.getByTestId("timeline-unscheduled-row")
    if ((await laneLabel.count()) > 0) {
      await expect(laneLabel).toBeVisible()
      expect(await laneRows.count()).toBeGreaterThan(0)
    } else {
      // No dateless projects in the fixture — that's fine, just verify
      // we don't render an empty Unscheduled header.
      expect(await laneRows.count()).toBe(0)
    }
  })

  /**
   * Persistent "New project" CTA when no scheduled bars are visible.
   *
   * We can't easily empty the projects list mid-test (the data is
   * server-seeded), so we exercise the contract: when at least one
   * scheduled project is rendered, the CTA card is NOT visible. The
   * inverse (CTA visible when empty) is covered by the unit tests on
   * the empty-state CTA logic.
   */
  test("empty-state CTA is hidden when scheduled bars exist", async ({
    page,
  }) => {
    const scheduledRows = page.getByTestId("timeline-scheduled-row")
    const cta = page.getByTestId("timeline-empty-cta")
    if ((await scheduledRows.count()) > 0) {
      await expect(cta).toHaveCount(0)
    } else {
      await expect(cta).toBeVisible()
      await expect(
        cta.getByRole("button", { name: /Create new project/i })
      ).toBeVisible()
    }
  })

  /**
   * Project labels in the sticky left column don't render with an
   * ellipsis when the column has free space — the rendered text must
   * equal the project's full name (no "…" insertion).
   */
  test("short project labels render in full without truncation", async ({
    page,
  }) => {
    const labels = page.locator(
      '[data-testid^="timeline-project-label-"] span[title]'
    )
    const count = await labels.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < Math.min(count, 5); i++) {
      const label = labels.nth(i)
      const fullName = await label.getAttribute("title")
      const visible = await label.innerText()
      expect(fullName).not.toBeNull()
      // The visible text must match the title (full name) — no
      // ellipsis insertion when there's room.
      if (fullName && fullName.length <= 20) {
        expect(visible.trim()).toBe(fullName)
      }
    }
  })
})
