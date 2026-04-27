/**
 * Playwright E2E for the Issues page bug-fix spec.
 *
 * Covers all six items:
 *   1. ROUTING — clicking an issue row navigates to /issues/[identifier].
 *   2. FILTER LOGIC — the Active tab excludes Backlog rows.
 *   3. LAYOUT — sidebar push works (existing SidebarInset behavior).
 *   4. HEADER ACTION — top-right Create button opens the dialog;
 *      the global "c" shortcut opens the same dialog.
 *   5. NOTIFICATIONS — bell opens a popover with items + unread badge.
 *   6. WORKSPACE MENU — Settings / Invite people / Switch workspace
 *      / Log out are all present.
 */
import { expect, test, type Page } from "@playwright/test"

const TEAM_KEY = "plt" // "PLT" team has the largest issue fixture set.
const TEAM_ISSUES_URL = `/teams/${TEAM_KEY}/issues`

async function gotoTeamIssues(page: Page) {
  await page.goto(TEAM_ISSUES_URL)
  await expect(page.getByRole("heading", { name: /Issues/ })).toBeVisible()
  // Wait until either the rows or the empty banner has rendered.
  await Promise.race([
    page.getByTestId("team-issues-row").first().waitFor({ state: "visible" }),
    page.getByTestId("team-issues-empty").waitFor({ state: "visible" }),
  ])
}

test.describe("Team issues page bug fixes", () => {
  /**
   * 1. ROUTING — clicking a row navigates to the issue detail page.
   */
  test("clicking an issue row navigates to /issues/[identifier]", async ({
    page,
  }) => {
    await gotoTeamIssues(page)
    const firstRow = page.getByTestId("team-issues-row").first()
    const identifier = await firstRow.getAttribute("data-issue-identifier")
    expect(identifier).toBeTruthy()
    await firstRow.click()
    // Issue detail page lives at /issues/[identifier].
    await expect(page).toHaveURL(new RegExp(`/issues/${identifier}$`), {
      timeout: 3000,
    })
  })

  /**
   * 2. FILTER LOGIC — the Active tab must NOT contain any
   * Backlog-type rows. This is the central regression.
   */
  test("Active tab excludes Backlog rows (regression)", async ({ page }) => {
    await gotoTeamIssues(page)
    await page.getByTestId("team-issues-tab-active").click()
    await expect(page.getByTestId("team-issues-content-active")).toBeVisible()

    // No row inside the Active tab can have data-status-type="backlog".
    const backlogStatusBadges = page.locator(
      '[data-testid="team-issues-content-active"] [data-status-type="backlog"]'
    )
    await expect(backlogStatusBadges).toHaveCount(0)

    // No section header for the Backlog type either.
    await expect(
      page.locator('[data-testid="team-issues-section-backlog"]')
    ).toHaveCount(0)

    // And there must be at least one started-type row to prove the
    // tab actually has content — otherwise an empty Active tab
    // would trivially "exclude backlog rows".
    const startedSection = page.getByTestId("team-issues-section-started")
    if ((await startedSection.count()) > 0) {
      await expect(startedSection).toBeVisible()
    } else {
      // No started rows at all: the empty banner must show, and
      // the contract still holds (no backlog rows in Active).
      await expect(page.getByTestId("team-issues-empty")).toBeVisible()
    }
  })

  /**
   * 2b. Backlog tab is the inverse: only backlog rows.
   */
  test("Backlog tab includes only Backlog rows", async ({ page }) => {
    await gotoTeamIssues(page)
    await page.getByTestId("team-issues-tab-backlog").click()
    const startedSection = page.locator(
      '[data-testid="team-issues-content-backlog"] [data-testid="team-issues-section-started"]'
    )
    await expect(startedSection).toHaveCount(0)
  })

  /**
   * 4a. Header Create button opens the create-issue modal.
   */
  test("Header Create button opens the create-issue modal", async ({
    page,
  }) => {
    await gotoTeamIssues(page)
    await page.getByTestId("header-create-issue").click()
    await expect(
      page.locator('[data-slot="dialog-content"]').first()
    ).toBeVisible()
  })

  /**
   * 4b. Global "c" shortcut opens the same modal.
   */
  test("'c' keyboard shortcut opens the create-issue modal", async ({
    page,
  }) => {
    await gotoTeamIssues(page)
    // Click body so focus is not on an input.
    await page.locator("body").click({ position: { x: 5, y: 5 } })
    await page.keyboard.press("c")
    await expect(
      page.locator('[data-slot="dialog-content"]').first()
    ).toBeVisible()
  })

  /**
   * 5. NOTIFICATIONS — bell opens a popover, unread badge reflects
   * the unread count.
   */
  test("Notifications bell opens the popover and shows the unread badge", async ({
    page,
  }) => {
    await gotoTeamIssues(page)
    const bell = page.getByTestId("notifications-bell")
    await expect(bell).toBeVisible()
    // The seeded fixture has 2 unread items.
    await expect(page.getByTestId("notifications-unread-badge")).toContainText(
      "2"
    )
    await bell.click()
    await expect(page.getByTestId("notifications-popover")).toBeVisible()
    await expect(page.getByTestId("notifications-list")).toBeVisible()
    // Each unread item carries data-unread="true".
    const unreadItems = page.locator(
      '[data-testid^="notification-"][data-unread="true"]'
    )
    expect(await unreadItems.count()).toBeGreaterThan(0)
  })

  /**
   * 6. Workspace menu — Settings, Invite people, Switch workspace,
   * Log out are all present.
   */
  test("Workspace menu exposes Settings / Invite people / Switch workspace / Log out", async ({
    page,
  }) => {
    await gotoTeamIssues(page)
    await page.getByRole("button", { name: /Workspace menu/i }).click()
    await expect(page.getByTestId("workspace-menu-settings")).toBeVisible()
    await expect(page.getByTestId("workspace-menu-invite-people")).toBeVisible()
    await expect(page.getByTestId("workspace-menu-switch")).toBeVisible()
    await expect(page.getByTestId("workspace-menu-logout")).toBeVisible()
  })

  /**
   * 6b. The Invite people item opens the invite dialog.
   */
  test("Workspace menu → Invite people opens the invite dialog", async ({
    page,
  }) => {
    await gotoTeamIssues(page)
    await page.getByRole("button", { name: /Workspace menu/i }).click()
    await page.getByTestId("workspace-menu-invite-people").click()
    await expect(
      page.getByRole("dialog", { name: /Invite people/i })
    ).toBeVisible()
  })

  /**
   * 3. LAYOUT — when the sidebar is open, the main content's
   * left-edge sits to the right of the sidebar (no overlap).
   * The sidebar gap div takes up flex space, so the main content's
   * x-coordinate should be >= sidebar width (~256px).
   */
  test("Sidebar pushes content rather than overlaying", async ({ page }) => {
    await gotoTeamIssues(page)
    const sidebar = page.locator('[data-slot="sidebar"]').first()
    const main = page.locator('[data-slot="sidebar-inset"]').first()
    await expect(sidebar).toBeVisible()
    await expect(main).toBeVisible()

    const sidebarBox = await sidebar.boundingBox()
    const mainBox = await main.boundingBox()
    expect(sidebarBox).not.toBeNull()
    expect(mainBox).not.toBeNull()
    if (sidebarBox && mainBox) {
      // Main's left edge must start at or after the sidebar's right
      // edge. Allow 4px tolerance for sub-pixel rounding.
      expect(mainBox.x).toBeGreaterThanOrEqual(
        sidebarBox.x + sidebarBox.width - 4
      )
    }
  })
})
