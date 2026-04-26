/**
 * Regression: toggling a Display Options chip used to mutate the
 * activeProps state but the renderer ignored it, so the user could
 * "enable" a property and see no change.
 *
 * The fix wires the `displayProps` Set from the page state into
 * `<TeamCard>` and the card conditionally renders fields based on
 * `displayProps.has(key)`. This test exercises that contract on the
 * "Description" chip — toggling off removes the description text
 * from the rendered card; toggling on re-adds it.
 */
import { expect, test } from "@playwright/test"

test.describe("Display Options chips affect rendered columns", () => {
  test("toggling a chip changes which fields render on the card", async ({
    page,
  }) => {
    await page.goto("/teams")
    await expect(page.getByTestId("teams-grid")).toBeVisible()
    const firstCard = page.getByTestId("teams-card").first()

    // The Description chip defaults to ON, so the card body must
    // contain a description paragraph (line-clamp-2). We assert
    // visibility before toggling.
    const description = firstCard.locator("p.line-clamp-2")
    await expect(description).toBeVisible()

    // Open the popover, toggle Description off.
    await page.getByTestId("teams-display-options-trigger").click()
    await expect(
      page.getByTestId("teams-display-options-popover")
    ).toBeVisible()

    const descChip = page.getByTestId("teams-display-chip-description")
    await expect(descChip).toHaveAttribute("aria-pressed", "true")
    await descChip.click()
    await expect(descChip).toHaveAttribute("aria-pressed", "false")

    // Close the popover; the description should now be removed from
    // every card.
    await page.keyboard.press("Escape")
    await expect(
      page.getByTestId("teams-display-options-popover")
    ).toHaveCount(0)
    await expect(description).toHaveCount(0)

    // Toggle it back on; description re-appears.
    await page.getByTestId("teams-display-options-trigger").click()
    await page.getByTestId("teams-display-chip-description").click()
    await page.keyboard.press("Escape")
    await expect(firstCard.locator("p.line-clamp-2")).toBeVisible()
  })

  test("Team key badge chip controls the key badge visibility", async ({
    page,
  }) => {
    await page.goto("/teams")
    await expect(page.getByTestId("teams-grid")).toBeVisible()
    const firstCard = page.getByTestId("teams-card").first()
    // Badge is rendered as a `<Badge>` inside the card header.
    const badge = firstCard.locator('[data-slot="badge"]').first()
    await expect(badge).toBeVisible()

    await page.getByTestId("teams-display-options-trigger").click()
    await page.getByTestId("teams-display-chip-key").click()
    await page.keyboard.press("Escape")
    await expect(badge).toHaveCount(0)
  })
})
