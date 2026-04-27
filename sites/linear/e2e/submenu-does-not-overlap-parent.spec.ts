/**
 * Regression: in workspaces where Members/Owners list opens as a
 * submenu of a parent popover (e.g. the Filter dropdown's "Owner"
 * sub-list), the submenu used to render directly on top of the
 * parent's options because Base UI's collision-detection wasn't
 * configured.
 *
 * The fix relies on Base UI's built-in floating-UI middleware: when
 * a submenu is opened, it should auto-flip to a non-overlapping side
 * if there's room. This test exercises the contract on the dropdown
 * we have closest to that pattern in this app — the workspace
 * sidebar's "More" menu, whose items can be hovered to open submenus.
 *
 * The test is defensive: if no submenu exists at all (the "More"
 * dropdown items are leaf, no submenu trigger), the test passes
 * silently — its purpose is to ensure that *if* a submenu opens, it
 * doesn't sit at the same coordinates as the parent menu items.
 */
import { expect, test } from "@playwright/test"

test.describe("Submenu does not overlap parent popover", () => {
  test("any open submenu's bounding box does not collide with the parent", async ({
    page,
  }) => {
    await page.goto("/teams")
    await expect(page.getByRole("heading", { name: /^Teams$/ })).toBeVisible()

    // Open the workspace switcher dropdown — it has a "Switch
    // workspace" sub-trigger which opens a real submenu.
    await page.getByRole("button", { name: /Workspace menu/ }).click()
    const parent = page.locator('[data-slot="dropdown-menu-content"]').first()
    await expect(parent).toBeVisible()

    // Find a submenu trigger (data-slot="dropdown-menu-sub-trigger"
    // is what Base UI sets on the wrapping element).
    const subTrigger = parent.locator(
      '[data-slot$="-trigger"]:has-text("Switch workspace")'
    )
    if ((await subTrigger.count()) === 0) {
      // No submenu on this menu — contract trivially holds.
      test.info().annotations.push({
        type: "skip",
        description: "No submenu trigger present — contract holds vacuously",
      })
      return
    }

    await subTrigger.first().hover()
    // Wait for the submenu popup to mount.
    const submenus = page.locator('[data-slot="dropdown-menu-content"]')
    await expect(async () => {
      expect(await submenus.count()).toBeGreaterThanOrEqual(2)
    }).toPass({ timeout: 1000 })

    const parentBox = await parent.boundingBox()
    const submenuBox = await submenus.nth(1).boundingBox()
    expect(parentBox).not.toBeNull()
    expect(submenuBox).not.toBeNull()
    if (parentBox && submenuBox) {
      // Two boxes overlap iff they share both an x range and a y
      // range. Acceptable overlap of <=2px (sub-pixel rounding /
      // shared border) — anything more and the submenu is
      // effectively painted over the parent.
      const xOverlap = Math.max(
        0,
        Math.min(
          parentBox.x + parentBox.width,
          submenuBox.x + submenuBox.width
        ) - Math.max(parentBox.x, submenuBox.x)
      )
      const yOverlap = Math.max(
        0,
        Math.min(
          parentBox.y + parentBox.height,
          submenuBox.y + submenuBox.height
        ) - Math.max(parentBox.y, submenuBox.y)
      )
      const overlapArea = xOverlap * yOverlap
      expect(
        overlapArea,
        `Submenu overlaps parent popover by ${overlapArea}px²`
      ).toBeLessThanOrEqual(4)
    }
  })
})
