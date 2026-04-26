/**
 * Regression: at narrow viewports the Members table previously
 * squished its right-hand columns (Joined / Teams / Last seen) so
 * tightly that values were unreadable — and any future "drop column
 * on small viewport" fix would risk hiding those columns from the
 * DOM entirely.
 *
 * The fix wraps the table in `overflow-x-auto` and pins the inner
 * grid to `min-w-[760px]` so:
 *   1. Every column stays in the DOM at every viewport.
 *   2. When the viewport is narrower than ~760px, the table
 *      horizontally scrolls within its container instead of
 *      dropping or squishing columns.
 *
 * This spec asserts both invariants at a 700px viewport — narrower
 * than the table's min-width but wide enough to reveal the leftmost
 * columns without scroll.
 */
import { expect, test, type Page } from "@playwright/test"

const MEMBERS_URL = "/settings?section=members"
const NARROW_WIDTH = 700

async function gotoMembersAtWidth(page: Page, width: number) {
  await page.setViewportSize({ width, height: 800 })
  await page.goto(MEMBERS_URL)
  await expect(page.getByRole("heading", { name: /^Members$/ })).toBeVisible()
  await Promise.race([
    page.getByTestId("members-rows").waitFor({ state: "visible" }),
    page.getByTestId("members-empty").waitFor({ state: "visible" }),
  ])
}

test.describe("Members responsive layout", () => {
  test("every column stays in the DOM at narrow viewport (700px)", async ({
    page,
  }) => {
    await gotoMembersAtWidth(page, NARROW_WIDTH)

    // All six sortable column headers must be in the DOM regardless
    // of viewport — no display:none / hidden tricks.
    for (const col of [
      "Name",
      "Email",
      "Status",
      "Teams",
      "Joined",
      "Last seen",
    ]) {
      const header = page
        .getByRole("columnheader", { name: new RegExp(col) })
        .first()
      await expect(
        header,
        `column "${col}" must remain in the DOM at ${NARROW_WIDTH}px`
      ).toHaveCount(1)
    }
  })

  test("table is horizontally scrollable when viewport is narrower than its min-width", async ({
    page,
  }) => {
    await gotoMembersAtWidth(page, NARROW_WIDTH)

    const table = page.getByTestId("members-table")
    // The wrapper has scrollWidth > clientWidth at narrow viewports,
    // which is exactly what proves the table is scroll-paged rather
    // than column-dropping or content-squishing.
    const { scrollWidth, clientWidth } = await table.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    expect(
      scrollWidth,
      `table scrollWidth (${scrollWidth}px) must exceed clientWidth (${clientWidth}px) at narrow viewport`
    ).toBeGreaterThan(clientWidth)
  })

  test("columns that start off-screen are reachable by horizontal scroll", async ({
    page,
  }) => {
    await gotoMembersAtWidth(page, NARROW_WIDTH)

    const lastSeenHeader = page
      .getByRole("columnheader", { name: /Last seen/ })
      .first()
    // Scroll the last column into view inside its scrollable parent
    // (programmatic scrollIntoView). After this it MUST be visible
    // — proving the column wasn't dropped, just off-screen.
    await lastSeenHeader.scrollIntoViewIfNeeded()
    await expect(lastSeenHeader).toBeInViewport()
  })

  test("at a wide viewport (1280px) no horizontal scroll is needed", async ({
    page,
  }) => {
    await gotoMembersAtWidth(page, 1280)
    const table = page.getByTestId("members-table")
    const { scrollWidth, clientWidth } = await table.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))
    // Allow 1px of float rounding between scroll and client widths.
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})
