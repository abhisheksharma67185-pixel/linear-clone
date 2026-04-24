/**
 * Playwright E2E for the Team Settings Hub.
 */
import { expect, test } from "@playwright/test"

const TEAM_KEY = "PLT"
const HUB_URL = `/settings/teams/${TEAM_KEY}`

const SECTIONS: { label: string; id: string }[] = [
  { label: "General", id: "general" },
  { label: "Members", id: "members" },
  { label: "Slack notifications", id: "notifications" },
  { label: "Issue labels", id: "issue-labels" },
  { label: "Templates", id: "templates" },
  { label: "Recurring issues", id: "recurring-issues" },
  { label: "Issue statuses", id: "statuses" },
  { label: "Workflows & automations", id: "workflow" },
  { label: "Triage", id: "triage" },
  { label: "Cycles", id: "cycles" },
  { label: "Agents", id: "agents" },
  { label: "Discussion summaries", id: "discussion-summaries" },
]

test.describe("Team Settings Hub", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HUB_URL)
  })

  for (const { label, id } of SECTIONS) {
    test(`${label} row navigates to /${id}`, async ({ page }) => {
      const row = page.getByRole("link", {
        name: `Open ${label} settings`,
      })
      await expect(row).toBeVisible()
      const href = await row.getAttribute("href")
      expect(href).not.toBe("#")
      expect(href).toMatch(
        new RegExp(`/settings/teams/${TEAM_KEY}/${id}$`)
      )
      await row.click()
      await expect(page).toHaveURL(
        new RegExp(`/settings/teams/${TEAM_KEY}/${id}$`)
      )
      await page.goBack()
    })
  }

  test("breadcrumb routes back to Teams", async ({ page }) => {
    const back = page.getByRole("link", { name: "Back to Teams" })
    await expect(back).toBeVisible()
    await expect(back).toHaveAttribute(
      "href",
      /\/settings\?section=teams/
    )
  })

  test("Delete modal requires typing the team name before enabling", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Delete…" }).click()
    const dialog = page.getByRole("dialog")
    const confirm = dialog.getByRole("button", { name: "Delete" })
    await expect(confirm).toBeDisabled()
    await dialog
      .getByLabel(/Team name to confirm deletion/i)
      .fill("wrong-name")
    await expect(confirm).toBeDisabled()
    await dialog
      .getByLabel(/Team name to confirm deletion/i)
      .fill("Platform")
    await expect(confirm).toBeEnabled()
  })
})
