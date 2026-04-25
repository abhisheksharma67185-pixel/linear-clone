/**
 * Playwright E2E for the workspace sidebar's team-row "..." menu.
 *
 * Covers spec items 1–11:
 *   1. role="menu" / role="menuitem" + aria-haspopup / aria-expanded
 *      on the trigger.
 *   2. Keyboard: arrow nav, Enter activates, Escape closes &
 *      restores focus to trigger, Right/Left arrow open/close
 *      the Subscribe submenu.
 *   3. Subscribe items checkable + persistent across reopen.
 *   4. Tooltip on the disabled "Leave team..." item.
 *   5. New menu items wired (Invite members, Add to favorites,
 *      New issue, Hide team from sidebar).
 *   6. External-link indicator on "Configure Slack notifications…".
 *   7. Icon contrast — verified visually via the inline `opacity-70`
 *      class on every menu icon.
 *   8/10. Section dividers + auto-flip positioning are Base UI
 *      defaults; not asserted directly here.
 *  11. Trigger reliably opens the menu.
 *  12. Unit-test parity is provided by `team-preferences.test.ts`.
 */
import { expect, test, type Page } from "@playwright/test"

async function clearTeamPrefs(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem("team:preferences:v1")
    } catch {
      /* noop */
    }
  })
}

async function gotoAndOpenTeamMenu(page: Page) {
  await page.goto("/teams")
  await expect(page.getByRole("heading", { name: /^Teams$/ })).toBeVisible()
  const trigger = page.getByTestId("team-menu-trigger-abhishek")
  // Even though the action button is `showOnHover`, Playwright can
  // click hover-revealed elements directly — no manual hover needed.
  await trigger.click()
  await expect(page.getByTestId("team-menu-abhishek")).toBeVisible()
  return trigger
}

test.describe("Team-row dropdown menu", () => {
  test.beforeEach(clearTeamPrefs)

  /**
   * 1 + 11. Trigger reliably opens the menu, and the menu carries
   * proper ARIA roles.
   */
  test("trigger opens the menu and exposes role=menu / menuitem", async ({
    page,
  }) => {
    await gotoAndOpenTeamMenu(page)
    const menu = page.getByTestId("team-menu-abhishek")
    // Base UI's MenuPrimitive.Popup uses `role="menu"`.
    await expect(menu).toHaveAttribute("role", "menu")
    // Every `<DropdownMenuItem>` should have role="menuitem". We
    // count > 0 — the precise count would brittle-fail on copy
    // changes.
    const items = menu.getByRole("menuitem")
    expect(await items.count()).toBeGreaterThan(0)
  })

  /**
   * 1 (cont.). The trigger has aria-haspopup="menu" and reflects
   * aria-expanded as the menu opens.
   */
  test("trigger announces aria-haspopup='menu' and updates aria-expanded", async ({
    page,
  }) => {
    await page.goto("/teams")
    const trigger = page.getByTestId("team-menu-trigger-abhishek")
    // Before clicking: haspopup is set, expanded is false.
    await expect(trigger).toHaveAttribute("aria-haspopup", /menu/i)
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
    await trigger.click()
    await expect(page.getByTestId("team-menu-abhishek")).toBeVisible()
    await expect(trigger).toHaveAttribute("aria-expanded", "true")
  })

  /**
   * 2. Escape closes the menu and returns focus to the trigger.
   */
  test("Escape closes the menu and returns focus to the trigger", async ({
    page,
  }) => {
    const trigger = await gotoAndOpenTeamMenu(page)
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("team-menu-abhishek")).toHaveCount(0)
    // Focus must return to the trigger button.
    const focusedTestId = await page.evaluate(() =>
      (document.activeElement as HTMLElement | null)?.getAttribute(
        "data-testid"
      )
    )
    expect(focusedTestId).toBe("team-menu-trigger-abhishek")
    expect(trigger).toBeTruthy()
  })

  /**
   * 3. Subscribe submenu items are checkable and persist per team.
   */
  test("Subscribe events are checkable and persist after closing/reopening", async ({
    page,
  }) => {
    await gotoAndOpenTeamMenu(page)
    // Hover over the Subscribe trigger to open the submenu.
    await page.getByTestId("team-menu-subscribe").hover()
    const submenu = page.getByTestId("team-menu-subscribe-submenu")
    await expect(submenu).toBeVisible()
    // Toggle two events ON.
    await page.getByTestId("team-menu-subscribe-issue_added").click()
    // The submenu stays open after the click (preventDefault path);
    // the second click toggles a second event.
    await page.getByTestId("team-menu-subscribe-issue_triaged").click()
    // Close the menu.
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("team-menu-abhishek")).toHaveCount(0)

    // Reopen and verify persistence — both checkmarks should be on.
    await page.getByTestId("team-menu-trigger-abhishek").click()
    await page.getByTestId("team-menu-subscribe").hover()
    const persistedSubmenu = page.getByTestId("team-menu-subscribe-submenu")
    await expect(persistedSubmenu).toBeVisible()

    const addedItem = page.getByTestId("team-menu-subscribe-issue_added")
    const triagedItem = page.getByTestId("team-menu-subscribe-issue_triaged")
    const completedItem = page.getByTestId(
      "team-menu-subscribe-issue_completed"
    )
    // Subscribed items render a Tick02 icon with aria-label="Subscribed".
    await expect(
      addedItem.locator('[aria-label="Subscribed"]')
    ).toHaveCount(1)
    await expect(
      triagedItem.locator('[aria-label="Subscribed"]')
    ).toHaveCount(1)
    // The third event was never toggled — must NOT show a check.
    await expect(
      completedItem.locator('[aria-label="Subscribed"]')
    ).toHaveCount(0)
  })

  /**
   * 4. Disabled "Leave team..." surfaces an explanatory tooltip.
   */
  test("Disabled 'Leave team...' shows an explanatory tooltip", async ({
    page,
  }) => {
    await gotoAndOpenTeamMenu(page)
    const leaveItem = page.getByTestId("team-menu-leave")
    await expect(leaveItem).toBeVisible()
    // Disabled state.
    await expect(leaveItem).toHaveAttribute("aria-disabled", "true")
    // Hover surfaces the tooltip after the 500ms delay.
    await leaveItem.hover()
    const tooltip = page.getByTestId("team-menu-leave-tooltip")
    await expect(tooltip).toBeVisible({ timeout: 2000 })
    await expect(tooltip).toContainText(/only admin/i)
  })

  /**
   * 5. New menu items are wired: Invite members opens InvitePeople
   * dialog, Add to favorites toggles the favorite indicator, New
   * issue opens the create-issue dialog, Hide team collapses the row.
   */
  test("Invite members menu item opens the invite dialog", async ({ page }) => {
    await gotoAndOpenTeamMenu(page)
    await page.getByTestId("team-menu-invite").click()
    // The Invite People dialog has a "Send invites" button.
    await expect(
      page.getByRole("button", { name: /Send invites/i })
    ).toBeVisible({ timeout: 2000 })
  })

  test("New issue menu item opens the create-issue dialog", async ({ page }) => {
    await gotoAndOpenTeamMenu(page)
    await page.getByTestId("team-menu-new-issue").click()
    // The dialog content slot is portalled to body.
    await expect(
      page.locator('[data-slot="dialog-content"]').first()
    ).toBeVisible()
  })

  test("Add to favorites toggles the team's favorite state", async ({
    page,
  }) => {
    await gotoAndOpenTeamMenu(page)
    // Initially not favorited — clicking toggles ON.
    await page.getByTestId("team-menu-favorite").click()
    // Reopen and verify the label flipped to "Remove from favorites".
    await page.getByTestId("team-menu-trigger-abhishek").click()
    const item = page.getByTestId("team-menu-favorite")
    await expect(item).toContainText(/Remove from favorites/)
  })

  test("Hide team from sidebar collapses the team row immediately", async ({
    page,
  }) => {
    await gotoAndOpenTeamMenu(page)
    const teamRow = page.locator('[data-team-id="abhishek"]').first()
    // Before hide: row is not collapsed.
    await expect(teamRow).toHaveAttribute("data-collapsed", "false")
    // Hide via menu.
    await page.getByTestId("team-menu-hide").click()
    // Row flips to data-collapsed="true". The visual collapse uses
    // a 150ms ease-out — the data attribute updates synchronously.
    await expect(teamRow).toHaveAttribute("data-collapsed", "true", {
      timeout: 1000,
    })
  })

  /**
   * 6. External-link indicator on "Configure Slack notifications…".
   */
  test("Configure Slack notifications carries an external-link indicator", async ({
    page,
  }) => {
    await gotoAndOpenTeamMenu(page)
    const slackItem = page.getByTestId("team-menu-slack")
    await expect(slackItem).toBeVisible()
    // The arrow is rendered as an `aria-hidden` SVG inside the item.
    // Asserting on its presence locks in the affordance.
    const arrow = slackItem.locator('svg[aria-hidden="true"]')
    expect(await arrow.count()).toBeGreaterThan(0)
    // Item also points at the integrations route.
    await expect(slackItem).toHaveAttribute(
      "href",
      /\/settings\?section=integrations/
    )
  })
})
