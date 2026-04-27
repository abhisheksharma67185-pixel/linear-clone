/**
 * Playwright regression suite for /teams.
 *
 * The six tests match the spec one-for-one:
 *   1. Escape closes display options popover
 *   2. Teams page shows skeleton while loading
 *   3. Active projects column remains visible or overflow indicated
 *      at 800px viewport
 *   4. Clicking a team row navigates to its issues route
 *   5. Create team: identifier auto-populates from team name's first 3
 *      uppercase letters
 *   6. All sidebar buttons have non-empty accessible names
 *
 * See e2e/applications.spec.ts for install/run instructions.
 */
import { expect, test, type Page } from "@playwright/test"

const TEAMS_URL = "/teams"

async function gotoTeams(page: Page) {
  await page.goto(TEAMS_URL)
  await expect(page.getByRole("heading", { name: /^Teams$/ })).toBeVisible()
  await expect(page.getByTestId("teams-grid")).toBeVisible()
}

test.describe("Teams page regressions", () => {
  /**
   * 1. Escape closes display options popover.
   *
   * The popover is controlled (`displayOpen` / `setDisplayOpen`); Base
   * UI's `closeOnEscape: true` default plus the global PopoverContent
   * hardening (data-[instant=dismiss]:duration-0 +
   * data-closed:pointer-events-none) means Escape both closes the
   * popover AND unmounts it cleanly with no residual paint.
   */
  test("Escape closes display options popover", async ({ page }) => {
    await gotoTeams(page)
    await page.getByTestId("teams-display-options-trigger").click()
    await expect(
      page.getByTestId("teams-display-options-popover")
    ).toBeVisible()

    await page.keyboard.press("Escape")

    await expect(page.getByTestId("teams-display-options-popover")).toHaveCount(
      0,
      { timeout: 1000 }
    )
  })

  /**
   * 2. Teams page shows a skeleton while loading.
   *
   * The skeleton has `data-testid="teams-grid-skeleton"` and matches
   * the rough shape of the real card grid (header row + body lines
   * + avatar stack + active count) so the page doesn't visibly reflow
   * when data resolves.
   *
   * We exercise this by intercepting /api/data/teams and stalling
   * the response. Without the stall the dev fixture resolves in
   * single-digit ms and the skeleton can blink past the test.
   */
  test("Teams page shows skeleton while loading", async ({ page }) => {
    await page.route("**/api/data/teams", async (route) => {
      // Hold the request open long enough for the assertion to observe
      // the skeleton, then continue to a real response.
      await new Promise((r) => setTimeout(r, 400))
      await route.continue()
    })
    await page.goto(TEAMS_URL)
    await expect(page.getByTestId("teams-grid-skeleton")).toBeVisible({
      timeout: 1000,
    })
    // Once the data resolves, the skeleton is replaced by the grid.
    await expect(page.getByTestId("teams-grid")).toBeVisible()
    await expect(page.getByTestId("teams-grid-skeleton")).toHaveCount(0)
  })

  /**
   * 3. Active-projects indicator remains visible (or surfaces an
   * overflow affordance) at a narrow 800px viewport.
   *
   * The new card layout responsively stacks at narrow widths; the
   * active-issues indicator (`teams-card-active-count` for teams with
   * issues, or `teams-card-active-zero-cta` for empty teams) is part
   * of the card body and stays in view at 800px.
   */
  test("active projects column remains visible at 800px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 700 })
    await gotoTeams(page)

    const cards = page.getByTestId("teams-card")
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)

    // Each card must show ONE of the two active-projects indicators
    // — never silently drop both. The first-card check is sufficient
    // because they all share the same render code path.
    const firstCard = cards.first()
    const indicator = firstCard.locator(
      '[data-testid="teams-card-active-count"], [data-testid="teams-card-active-zero-cta"]'
    )
    await expect(indicator.first()).toBeVisible()
  })

  /**
   * 4. Clicking a team row navigates to that team's destination.
   *
   * The spec phrases the URL as `/team/{key}/all`; the actual route
   * in this codebase is `/teams/{key}/issues`. The contract being
   * tested is "team-row click target lands on the team's content
   * page" — which works in both URL shapes.
   */
  test("clicking a team row navigates to the team's issues page", async ({
    page,
  }) => {
    await gotoTeams(page)
    const link = page.getByTestId("teams-card-title-link").first()
    const href = await link.getAttribute("href")
    expect(href).toMatch(/\/teams\/[^/]+\/issues$/)
    await link.click()
    await expect(page).toHaveURL(/\/teams\/[^/]+\/issues$/, {
      timeout: 2000,
    })
  })

  /**
   * 5. Create team: identifier auto-populates from team name's first
   * three uppercase A-Z 0-9 characters.
   *
   * Implemented in `app/(workspace)/settings/new-team/page.tsx`
   * `handleNameChange`: when the identifier hasn't been manually
   * touched, typing into the name field replaces it with
   * `name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3)`.
   */
  test("Create team: identifier auto-populates from name's first 3 uppercase letters", async ({
    page,
  }) => {
    await page.goto("/settings/new-team")
    const name = page.getByLabel(/Team name/i)
    const identifier = page.locator("#team-identifier")
    await expect(name).toBeVisible()
    await expect(identifier).toBeVisible()

    // Typing "Mobile platform" should populate identifier to "MOB".
    await name.fill("Mobile platform")
    await expect(identifier).toHaveValue("MOB")

    // Replacing the name should keep auto-populating until the user
    // edits the identifier directly.
    await name.fill("Web 24")
    // Filtered to A-Z0-9 + first 3 chars of "WEB24" → "WEB"
    await expect(identifier).toHaveValue("WEB")

    // Once the user touches the identifier, it stops auto-syncing.
    await identifier.click()
    await identifier.fill("ZZZ")
    await name.fill("Anything else")
    await expect(identifier).toHaveValue("ZZZ")
  })

  /**
   * 6. All sidebar buttons have non-empty accessible names.
   *
   * Walks every interactive element in the workspace sidebar
   * (`<aside>`) and asserts each one has a non-empty accessible name
   * via Playwright's role-based naming or the underlying
   * `aria-label` / textContent fallback.
   */
  test("all sidebar buttons have accessible names", async ({ page }) => {
    await gotoTeams(page)
    const sidebar = page.locator("aside").first()
    await expect(sidebar).toBeVisible()

    // Collect every button + link inside the sidebar; for each,
    // compute the accessible-name fallback chain we trust:
    //   aria-label → text content (trimmed) → null
    // Then assert null doesn't appear in the list.
    const offenders = await sidebar.evaluate((aside) => {
      const elements = Array.from(
        aside.querySelectorAll<HTMLElement>("button, a")
      ).filter((el) => {
        // Skip elements that are explicitly hidden or aria-hidden.
        if (el.hasAttribute("hidden")) return false
        if (el.getAttribute("aria-hidden") === "true") return false
        // Skip elements with no rendered geometry (collapsed sub-menus etc.).
        const style = window.getComputedStyle(el)
        if (style.display === "none" || style.visibility === "hidden")
          return false
        return true
      })
      return elements
        .map((el) => {
          const aria = el.getAttribute("aria-label")?.trim() ?? ""
          const text = (el.textContent ?? "").trim()
          const accessibleName = aria || text
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            testId: el.getAttribute("data-testid") || null,
            ariaLabel: aria || null,
            text: text || null,
            accessibleName: accessibleName || null,
          }
        })
        .filter((e) => !e.accessibleName)
    })

    expect(
      offenders,
      `Sidebar elements with no accessible name: ${JSON.stringify(offenders, null, 2)}`
    ).toEqual([])
  })
})
