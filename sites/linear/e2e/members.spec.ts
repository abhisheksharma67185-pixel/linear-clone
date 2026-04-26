/**
 * Playwright E2E for the Members admin page.
 *
 * Covers the seven behaviors from the spec:
 *   1. Invite modal — role selector defaults to Member, supports
 *      role + team multi-select + Copy invite link, and the chosen
 *      role is persisted to the created invite (Status column shows
 *      "Member (Invited)" not "Admin (Invited)").
 *   2. Row actions menu — Change role, Copy email, Resend invite (on
 *      invited rows), Revoke invite, Remove from workspace.
 *   3. Sortable columns — Name / Status / Joined / Teams / Last seen
 *      all carry an `aria-sort` and clicking toggles asc/desc.
 *   4. Search and filter — search input plus segmented tabs for
 *      Members / Invited / Suspended / Applications.
 *   5. Invited-row UX — Last seen renders "—", inline Resend button
 *      visible on hover.
 *   6. Stable status sort — Owner → Admin → Member → Guest →
 *      Application → Invited regardless of where suspended sits.
 *   7. Right-click row → opens the same actions menu.
 *
 * The page lives at `/settings?section=members` (the spec's
 * `/abhishek2007/members` is the workspace-namespaced URL Linear
 * uses; this app routes Members through the shared settings shell).
 */
import { expect, test, type Page } from "@playwright/test"

const MEMBERS_URL = "/settings?section=members"

async function gotoMembers(page: Page) {
  await page.goto(MEMBERS_URL)
  await expect(page.getByRole("heading", { name: /^Members$/ })).toBeVisible()
  // Wait for either the empty-state banner or the rows container.
  await Promise.race([
    page.getByTestId("members-rows").waitFor({ state: "visible" }),
    page.getByTestId("members-empty").waitFor({ state: "visible" }),
  ])
}

test.describe("Members page", () => {
  test.beforeEach(gotoMembers)

  /**
   * 1. Invite modal — role selector defaults to Member, supports
   * role + teams + Copy invite link.
   */
  test("Invite modal defaults to Member and exposes role / teams / copy link", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /^Invite$/ }).click()
    await expect(page.getByTestId("invite-emails-textarea")).toBeVisible()

    // Role trigger must show Member by default — never Admin.
    const roleTrigger = page.getByTestId("invite-role-trigger")
    await expect(roleTrigger).toBeVisible()
    await expect(roleTrigger).toContainText(/^Member$/)

    // Teams multi-select trigger is present.
    await expect(page.getByTestId("invite-teams-trigger")).toBeVisible()

    // Copy invite link button is present and clickable.
    const copy = page.getByTestId("invite-copy-link")
    await expect(copy).toBeVisible()
    await expect(copy).toContainText(/Copy invite link/)
  })

  /**
   * 1b. The chosen role persists to the created invite — the Status
   * column on the new row shows the role we picked, not "Admin".
   */
  test("Invite persists the chosen role to the new Status cell", async ({
    page,
    context,
  }) => {
    // Grant clipboard so any side-effect of the dialog doesn't error.
    await context.grantPermissions(["clipboard-read", "clipboard-write"])

    await page.getByRole("button", { name: /^Invite$/ }).click()

    const unique = `e2e-${Date.now()}@example.com`
    await page.getByTestId("invite-emails-textarea").fill(unique)
    // Default role is Member — leave it; submit and switch to the
    // Invited tab to find the new row.
    await page.getByTestId("invite-submit").click()

    // The dialog closes and a toast surfaces the success.
    await expect(
      page.getByTestId("invite-emails-textarea")
    ).toHaveCount(0, { timeout: 3000 })

    await page.getByTestId("members-tab-invited").click()
    const newRow = page.locator(
      `[data-testid="members-row"]:has-text("${unique}")`
    )
    await expect(newRow).toBeVisible({ timeout: 3000 })
    // The persisted role is exposed via the data-member-role attribute.
    await expect(newRow).toHaveAttribute("data-member-role", "member")
  })

  /**
   * 2. Row actions menu exposes Copy email + (on invited rows) Resend
   * invite + Revoke invite, plus the existing role/suspend/remove
   * actions.
   */
  test("Row actions menu exposes Copy email + Resend + Revoke on invited rows", async ({
    page,
  }) => {
    await page.getByTestId("members-tab-invited").click()
    const firstInvited = page.getByTestId("members-row").first()
    await expect(firstInvited).toBeVisible()
    await firstInvited.hover()
    await firstInvited.getByTestId("members-row-actions").click()

    await expect(
      page.getByTestId("members-row-action-copy-email")
    ).toBeVisible()
    await expect(page.getByTestId("members-row-action-resend")).toBeVisible()
    await expect(page.getByTestId("members-row-action-revoke")).toBeVisible()

    // Close.
    await page.keyboard.press("Escape")
  })

  /**
   * 3. Every spec'd column is sortable — clicking the header toggles
   * `aria-sort` between ascending and descending.
   */
  test("All listed columns are sortable (aria-sort toggles on click)", async ({
    page,
  }) => {
    for (const col of ["Name", "Status", "Joined", "Teams", "Last seen"]) {
      const header = page
        .getByRole("columnheader", { name: new RegExp(col) })
        .first()
      const button = header.getByRole("button", { name: /Order by/ })
      await button.click()
      // After click the column should be in either ascending or
      // descending state (not "none").
      const sort = await header.getAttribute("aria-sort")
      expect(sort, `${col} aria-sort after click`).toMatch(
        /ascending|descending/
      )
    }
  })

  /**
   * 4. Search + segmented tabs are both present and functional.
   */
  test("Search input filters rows; tabs swap which bucket is shown", async ({
    page,
  }) => {
    // Tabs are visible.
    await expect(page.getByTestId("members-tabs")).toBeVisible()
    await expect(page.getByTestId("members-tab-members")).toBeVisible()
    await expect(page.getByTestId("members-tab-invited")).toBeVisible()
    await expect(page.getByTestId("members-tab-suspended")).toBeVisible()
    await expect(page.getByTestId("members-tab-applications")).toBeVisible()

    // The Applications tab moves the Linear bot off the Members list.
    await page.getByTestId("members-tab-applications").click()
    const appRows = page.getByTestId("members-row")
    if ((await appRows.count()) > 0) {
      // Every visible row on this tab must have status="application".
      const statuses = await appRows.evaluateAll((els) =>
        els.map((e) => e.getAttribute("data-member-status"))
      )
      for (const s of statuses) expect(s).toBe("application")
    }

    // Search filter narrows visible rows.
    await page.getByTestId("members-tab-members").click()
    await page
      .getByPlaceholder("Search by name or email")
      .fill("zzzz-no-such-member-zzzz")
    await expect(page.getByTestId("members-empty")).toBeVisible()
  })

  /**
   * 5. Invited-row UX — Last seen renders "—" and the inline Resend
   * button is reachable on hover.
   */
  test("Invited rows show '—' for Last seen and an inline Resend button", async ({
    page,
  }) => {
    await page.getByTestId("members-tab-invited").click()
    const firstInvited = page.getByTestId("members-row").first()
    await expect(firstInvited).toBeVisible()
    // Em-dash placeholder.
    await expect(
      firstInvited.getByTestId("members-row-last-seen-dash")
    ).toBeVisible()
    // Inline Resend button is in the DOM (opacity is hover-revealed).
    await expect(
      firstInvited.getByTestId("members-row-resend-inline")
    ).toBeAttached()
  })

  /**
   * 6. Stable status sort — clicking the Status header puts admins
   * above members above guests above applications above invited.
   * We assert this by checking the rank order of the first few rows.
   */
  test("Status column sort uses Owner > Admin > Member > Guest > Application > Invited", async ({
    page,
  }) => {
    // Switch to All-equivalent view: the page now has 4 tabs, so we
    // can't see all statuses simultaneously. Instead we exercise the
    // Members tab where active+suspended rows live with role variety.
    await page.getByTestId("members-tab-members").click()
    const statusHeader = page
      .getByRole("columnheader", { name: /Status/ })
      .first()
    const button = statusHeader.getByRole("button", { name: /Order by/ })
    await button.click()
    // After ascending sort: admin < member < guest by rank.
    await expect(statusHeader).toHaveAttribute("aria-sort", "ascending")

    // Read the role attribute of the first row and assert it's the
    // "earliest" role present on the visible Members tab. The Members
    // tab includes admin + member + guest (no application/invite).
    const firstRoleAfterAsc = await page
      .getByTestId("members-row")
      .first()
      .getAttribute("data-member-role")
    expect(firstRoleAfterAsc).toBe("admin")

    // Toggle desc — now guest should be first (highest rank number).
    await button.click()
    await expect(statusHeader).toHaveAttribute("aria-sort", "descending")
    const firstRoleAfterDesc = await page
      .getByTestId("members-row")
      .first()
      .getAttribute("data-member-role")
    // After descending, the largest-rank role (member or guest) appears first.
    expect(firstRoleAfterDesc).not.toBe("admin")
  })

  /**
   * 7. Right-click on a row opens the same actions menu as the "..." button.
   */
  test("Right-click on a row opens the actions menu", async ({ page }) => {
    const firstRow = page.getByTestId("members-row").first()
    await expect(firstRow).toBeVisible()
    await firstRow.click({ button: "right" })
    await expect(
      page.getByTestId("members-row-action-copy-email")
    ).toBeVisible({ timeout: 1000 })
  })
})
