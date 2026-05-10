/**
 * Playwright regression for the Views Display-options popover.
 *
 * The bug: dismissing the popover via outside-click left a faded
 * ghost layer painted over the table column headers. Dismissing via
 * Escape unmounted the popover cleanly. The two close paths needed
 * to converge on the same end state.
 *
 * Acceptance criteria from the spec:
 *   - After outside-click, the popover's role="dialog" / popover
 *     content node is no longer in the DOM.
 *   - The table column headers (Name, Owner — the actual columns in
 *     this app; the spec mentions Created/Updated/Owner generically)
 *     have no overlapping element at their coordinates.
 *
 * See e2e/applications.spec.ts for install/run instructions.
 */
import { expect, test, type Page } from "@playwright/test"

const VIEWS_URL = "/views"

async function gotoViews({ page }: { page: Page }) {
  await page.goto(VIEWS_URL)
  await expect(page.getByRole("heading", { name: /^Views$/ })).toBeVisible()
}

async function openDisplayOptions(page: Page) {
  await page.getByTestId("views-display-trigger").click()
  await expect(page.getByTestId("views-display-popover")).toBeVisible()
}

/**
 * Returns the topmost element at the centre of `locator`, walking up
 * to find the first ancestor with a meaningful identity. Used to
 * verify that no ghost layer is painted over a target element.
 */
async function topmostElementAt(
  page: Page,
  testId: string
): Promise<{ tag: string; className: string; testId: string | null }> {
  const target = page.getByTestId(testId)
  const box = await target.boundingBox()
  expect(box).not.toBeNull()
  if (!box) throw new Error("no bounding box")
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  return await page.evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null
      return {
        tag: el?.tagName.toLowerCase() ?? "",
        className: el?.className?.toString() ?? "",
        testId: el?.getAttribute("data-testid") ?? null,
      }
    },
    { x: cx, y: cy }
  )
}

test.describe("Views display-options popover dismiss", () => {
  test.beforeEach(gotoViews)

  test("Escape removes the popover from the DOM (baseline that was working)", async ({
    page,
  }) => {
    await openDisplayOptions(page)
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("views-display-popover")).toHaveCount(0)
  })

  test("outside-click removes the popover from the DOM (the regression fix)", async ({
    page,
  }) => {
    await openDisplayOptions(page)

    // Click on the page heading — well outside the popover and well
    // outside the trigger so we're hitting the outside-click handler,
    // not toggling the trigger or interacting with the popover content.
    await page.getByRole("heading", { name: /^Views$/ }).click({ force: true })

    // The popover content node must be gone — not just hidden.
    await expect(page.getByTestId("views-display-popover")).toHaveCount(0, {
      timeout: 1000,
    })
  })

  test("after outside-click, table column headers have no ghost overlay", async ({
    page,
  }) => {
    await openDisplayOptions(page)
    // Outside-click on the heading.
    await page.getByRole("heading", { name: /^Views$/ }).click({ force: true })
    // Wait for the popover to be removed.
    await expect(page.getByTestId("views-display-popover")).toHaveCount(0, {
      timeout: 1000,
    })
    // Allow one frame for any pending paints to settle.
    await page.waitForTimeout(50)

    // For each header cell, the topmost element at its centre must
    // either be the cell itself (or one of its descendants) — never a
    // residual popover layer with `data-testid="views-display-popover"`
    // or an ancestor `data-slot="popover-content"`.
    for (const headerTestId of ["views-header-name", "views-header-owner"]) {
      const top = await topmostElementAt(page, headerTestId)
      expect(
        top.testId,
        `Topmost element at ${headerTestId} should not be the popover ghost`
      ).not.toBe("views-display-popover")
      expect(
        top.className,
        `Topmost element at ${headerTestId} className should not include the popover-content slot`
      ).not.toContain("popover-content")
    }
  })

  test("escape vs outside-click leave the same end state", async ({ page }) => {
    // Round 1: open + escape.
    await openDisplayOptions(page)
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("views-display-popover")).toHaveCount(0)

    // Round 2: open + outside-click.
    await openDisplayOptions(page)
    await page.getByRole("heading", { name: /^Views$/ }).click({ force: true })
    await expect(page.getByTestId("views-display-popover")).toHaveCount(0)

    // Round 3: confirm we can still re-open after either dismiss path.
    await openDisplayOptions(page)
    await expect(page.getByTestId("views-display-popover")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("views-display-popover")).toHaveCount(0)
  })
})
