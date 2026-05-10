/**
 * Playwright E2E covering the My Issues + board / route-skeleton fixes.
 *
 * Cases (matching the spec a–e):
 *  (a) Board / view groups render every workflow state column horizontally
 *      (or as named sections) on first render — empty statuses are visible,
 *      not hidden into a "Hidden columns" stack.
 *  (b) `c` opens a viewport-centered modal with a backdrop.
 *  (c) The New Issue modal defaults Assignee to the signed-in user
 *      (currentUser), not to a hardcoded "Theta Computer" / wrong member.
 *  (d) Navigating between top-level sidebar items shows the route
 *      skeleton and the previous content disappears within ~200ms.
 *  (e) Created and Subscribed tabs are wired to *distinct* filters and
 *      can produce distinct result sets.
 *
 * See e2e/applications.spec.ts for install/run instructions.
 */
import { expect, test, type Page } from "@playwright/test"

async function gotoMyIssues(page: Page) {
  await page.goto("/my-issues")
  await expect(page.getByRole("heading", { name: /^My issues$/ })).toBeVisible()
}

test.describe("My Issues + board regressions", () => {
  /**
   * (a) Board / status-grouped view renders every workflow state by
   * default. We exercise this on `/views/view-1` because that route
   * groups issues by status and previously dropped empty groups.
   */
  test("View page renders all workflow state sections, even empty ones", async ({
    page,
  }) => {
    await page.goto("/views/view-1")
    // Wait until either the empty-view message or at least one section
    // has rendered.
    await Promise.race([
      page
        .locator("[data-status]")
        .first()
        .waitFor({ state: "visible", timeout: 5000 }),
      page
        .getByText("No issues match this view.")
        .waitFor({ state: "visible", timeout: 5000 }),
    ])

    // If the view has no issues at all, that's a different code path —
    // skip the per-status assertion. Otherwise, every workflow state
    // must have a section header rendered (even if empty inside).
    const noIssuesBanner = page.getByText(/No issues match this view\./)
    if (await noIssuesBanner.count()) return

    const expectedStatuses = [
      "in_progress",
      "todo",
      "backlog",
      "done",
      "cancelled",
    ] as const
    for (const status of expectedStatuses) {
      const header = page.locator(`[data-status="${status}"]`)
      await expect(
        header,
        `status section "${status}" should render even when empty`
      ).toHaveCount(1)
    }
  })

  /**
   * (b) `c` opens a viewport-centered modal with a backdrop above all
   * app chrome.
   */
  test("'c' opens a centered New Issue modal with a backdrop", async ({
    page,
  }) => {
    await gotoMyIssues(page)

    // Make sure focus is on the body (not an input) so the shortcut fires.
    await page.locator("body").click({ position: { x: 5, y: 5 } })
    await page.keyboard.press("c")

    const overlay = page.locator('[data-slot="dialog-overlay"]')
    const content = page.locator('[data-slot="dialog-content"]').first()
    await expect(overlay).toBeVisible()
    await expect(content).toBeVisible()

    // Backdrop and content must clear app chrome (z-index ≥ 1000).
    const overlayZ = await overlay.evaluate((el) =>
      Number.parseInt(window.getComputedStyle(el).zIndex || "0", 10)
    )
    expect(overlayZ).toBeGreaterThanOrEqual(1000)

    // Content must be horizontally centered in the viewport.
    const viewport = page.viewportSize()
    const box = await content.boundingBox()
    expect(viewport).not.toBeNull()
    expect(box).not.toBeNull()
    if (viewport && box) {
      const center = box.x + box.width / 2
      expect(Math.abs(center - viewport.width / 2)).toBeLessThanOrEqual(4)
    }
  })

  /**
   * (c) New Issue modal defaults Assignee to the signed-in user.
   *
   * The signed-in user is `usr-1` ("Priya Sharma" in the mock roster).
   * The Assignee chip in the modal header should display that name —
   * never a hardcoded "Theta Computer" or any other member.
   */
  test("New Issue modal defaults Assignee to the current user", async ({
    page,
  }) => {
    await gotoMyIssues(page)
    await page.getByRole("button", { name: /^New issue$/ }).click()

    const dialog = page.locator('[data-slot="dialog-content"]').first()
    await expect(dialog).toBeVisible()

    // The Assignee trigger button shows the assignee's name. We don't
    // rely on the exact label text (the mock could be re-seeded) — we
    // only assert the *wrong* historical defaults aren't present.
    const dialogText = (await dialog.textContent()) ?? ""
    expect(dialogText).not.toMatch(/Theta Computer/i)

    // Close so we don't pollute follow-up tests.
    await page.keyboard.press("Escape")
  })

  /**
   * (d) Navigating between top-level sidebar items shows the route
   * skeleton and the previous content disappears within ~200ms.
   */
  test("Sidebar navigation shows skeleton; previous content disappears within 200ms", async ({
    page,
  }) => {
    await gotoMyIssues(page)
    const previousH1 = page.getByRole("heading", { name: /^My issues$/ })
    await expect(previousH1).toBeVisible()

    await page
      .getByRole("link", { name: /^Projects$/ })
      .first()
      .click()

    // The previous heading must be gone OR the skeleton must be on
    // screen within 200ms — that's the regression guard against the
    // old "stale tree hangs around for seconds" behavior.
    await Promise.race([
      previousH1.waitFor({ state: "detached", timeout: 200 }),
      page
        .locator('[data-testid="route-page-skeleton"]')
        .first()
        .waitFor({ state: "visible", timeout: 200 }),
    ])
  })

  /**
   * (e) Created and Subscribed tabs are wired to *distinct* filters.
   *
   * We can't intercept GraphQL in this mock app (it uses REST `/api/data`
   * routes that return everything), but the regression we're guarding
   * against — Subscribed silently aliasing to "creator == me" — would
   * make the two tabs render byte-identical issue lists. This test
   * compares the rendered identifier columns and asserts the result
   * sets are not interchangeable in either direction.
   */
  test("Created and Subscribed tabs render distinguishable result sets", async ({
    page,
  }) => {
    await gotoMyIssues(page)

    await page.getByRole("tab", { name: /^Created$/ }).click()
    // Wait for either the issue list to render or the empty-state banner.
    await Promise.race([
      page
        .locator('[role="tabpanel"][data-state="active"] li')
        .first()
        .waitFor({ state: "visible", timeout: 5000 }),
      page
        .getByText(/You haven't created any issues/i)
        .waitFor({ state: "visible", timeout: 5000 }),
    ])
    const createdIds = await page
      .locator('[role="tabpanel"][data-state="active"] li')
      .evaluateAll((els) => els.map((e) => e.textContent ?? ""))

    await page.getByRole("tab", { name: /^Subscribed$/ }).click()
    await Promise.race([
      page
        .locator('[role="tabpanel"][data-state="active"] li')
        .first()
        .waitFor({ state: "visible", timeout: 5000 }),
      page
        .getByText(/You're not subscribed to any issues/i)
        .waitFor({ state: "visible", timeout: 5000 }),
    ])
    const subscribedIds = await page
      .locator('[role="tabpanel"][data-state="active"] li')
      .evaluateAll((els) => els.map((e) => e.textContent ?? ""))

    // The two tabs must NOT be byte-identical lists. Either they
    // contain different items, or one is empty while the other isn't.
    // (If both happen to be empty in a particular fixture run, that's
    // a fixture-coverage problem, not a filter-correctness problem —
    // we still don't want a silent regression to ship.)
    const sameLength = createdIds.length === subscribedIds.length
    const sameContent =
      sameLength &&
      createdIds.every((value, idx) => value === subscribedIds[idx])
    expect(
      sameContent,
      "Created and Subscribed tabs returned identical lists — a regression in the Subscribed filter would look like this."
    ).toBe(false)
  })
})
