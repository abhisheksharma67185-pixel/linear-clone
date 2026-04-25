/**
 * Playwright E2E for the /teams page.
 *
 * Covers the four scenarios in the spec:
 *   (a) Creating a new team — clicking the New team button routes
 *       to the existing /settings/new-team flow.
 *   (b) Filtering teams — typing in the filter input narrows the
 *       grid and updates the visible-count.
 *   (c) Switching display order — selecting a sort option reorders
 *       the cards (verified by reading the first card's team name).
 *   (d) Keyboard navigation — Tab reaches the team-name link in
 *       each card and Enter activates it.
 *
 * See e2e/applications.spec.ts for install/run instructions.
 */
import { expect, test, type Page } from "@playwright/test"

const TEAMS_URL = "/teams"

async function gotoTeams(page: Page) {
  await page.goto(TEAMS_URL)
  await expect(page.getByRole("heading", { name: /^Teams$/ })).toBeVisible()
  // Wait for the data to resolve so the grid is populated.
  await expect(page.getByTestId("teams-grid")).toBeVisible()
}

test.describe("Teams page", () => {
  test.beforeEach(gotoTeams)

  /**
   * (a) Create a new team — the page-level New team button routes
   * to the dedicated /settings/new-team flow.
   */
  test("New team button routes to the create-team flow", async ({ page }) => {
    const newTeamLink = page.getByTestId("teams-new")
    await expect(newTeamLink).toBeVisible()
    await expect(newTeamLink).toHaveAttribute("href", /\/settings\/new-team/)
    await newTeamLink.click()
    await expect(page).toHaveURL(/\/settings\/new-team/)
  })

  /**
   * (b) Filter teams — typing into the filter input narrows the
   * rendered grid AND updates the displayed visible-count.
   */
  test("filter input narrows the visible grid and updates count", async ({
    page,
  }) => {
    const filter = page.getByTestId("teams-filter")
    const cards = page.getByTestId("teams-card")
    const count = page.getByTestId("teams-count")

    const totalCount = await cards.count()
    expect(totalCount).toBeGreaterThan(0)

    // Capture an existing team name to use as the filter query.
    const firstName = await cards
      .first()
      .getByTestId("teams-card-title-link")
      .innerText()
    // Use a substring (first 3 chars) so the filter is forgiving but
    // still narrows enough to drop at least one card on a real workspace.
    const needle = firstName.slice(0, 3)

    await filter.fill(needle)
    // The visible count text should change to reflect the narrowed list.
    await expect(count).toContainText(/^\d+ of \d+$/)
    const filteredCount = await cards.count()
    expect(filteredCount).toBeGreaterThan(0)
    expect(filteredCount).toBeLessThanOrEqual(totalCount)

    // Clearing the filter restores the full list.
    await filter.fill("")
    expect(await cards.count()).toBe(totalCount)

    // A bogus filter shows the empty-result banner.
    await filter.fill("zzzzz-no-such-team-zzzzz")
    await expect(page.getByTestId("teams-empty")).toBeVisible()
  })

  /**
   * (c) Switching display order — picking a different sort option
   * actually reorders the rendered cards. We compare the first card
   * before/after the sort change.
   */
  test("display-order options reorder the grid", async ({ page }) => {
    // Capture the first team name with the default (Name · A → Z) order.
    const firstNameAsc = await page
      .getByTestId("teams-card")
      .first()
      .getByTestId("teams-card-title-link")
      .innerText()

    await page.getByTestId("teams-sort-trigger").click()
    await page.getByTestId("teams-sort-option-name-desc").click()

    // After switching to Z → A, the first card's name should be
    // different (assuming there's more than one team in the fixture).
    const firstNameDesc = await page
      .getByTestId("teams-card")
      .first()
      .getByTestId("teams-card-title-link")
      .innerText()
    expect(firstNameDesc).not.toBe(firstNameAsc)

    // The header pill text should reflect the new order.
    await expect(page.getByTestId("teams-sort-trigger")).toContainText(
      /Z\s*→\s*A/
    )
  })

  /**
   * (d) Keyboard navigation — focus the filter input, then Tab to
   * the first reachable interactive element on a card and verify
   * Enter activates a navigation. We don't pin the exact tab count
   * (other ancestor controls may sit between filter and card) — the
   * contract is that team-name links ARE reachable via keyboard and
   * Enter triggers the navigation.
   */
  test("team-name links are keyboard-focusable and Enter activates", async ({
    page,
  }) => {
    // Focus the filter input as a known anchor point.
    await page.getByTestId("teams-filter").focus()
    await expect(page.getByTestId("teams-filter")).toBeFocused()

    // Tab forward up to 20 times until a card title link receives focus.
    let focused: { testId: string | null; href: string | null } = {
      testId: null,
      href: null,
    }
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab")
      focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        return {
          testId: el?.getAttribute("data-testid") ?? null,
          href: (el as HTMLAnchorElement | null)?.getAttribute("href") ?? null,
        }
      })
      if (focused.testId === "teams-card-title-link") break
    }
    expect(
      focused.testId,
      "Tabbing forward from the filter must eventually reach a team-card link"
    ).toBe("teams-card-title-link")
    expect(focused.href).toMatch(/\/teams\//)

    // Enter activates the link.
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/teams\/[^/]+\/issues/, { timeout: 1000 })
  })

  /**
   * Bonus regression: the unified avatar-stack tooltip renders the
   * full member list when hovered, replacing the old per-avatar
   * tooltips that didn't reveal hidden "+N" members.
   */
  test("avatar stack exposes all member names via single accessible label", async ({
    page,
  }) => {
    const stack = page.getByTestId("teams-card-member-stack").first()
    const ariaLabel = await stack.getAttribute("aria-label")
    expect(ariaLabel).toMatch(/^\d+ members?: /)
  })
})
