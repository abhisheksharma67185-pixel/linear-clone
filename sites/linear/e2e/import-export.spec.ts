/**
 * Playwright E2E for the Import & Export settings page.
 *
 * See e2e/applications.spec.ts for install/run instructions.
 */
import { expect, test } from "@playwright/test"

const SETTINGS_URL = "/settings?section=import-export"
const IMPORTERS = ["Asana", "Shortcut", "GitHub", "Jira", "Linear", "Trello"]

test.describe("Import & Export settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SETTINGS_URL)
  })

  for (const name of IMPORTERS) {
    test(`${name} importer row navigates to the migration assistant`, async ({
      page,
    }) => {
      const row = page.getByRole("link", { name: `Import from ${name}` })
      await expect(row).toBeVisible()

      const href = await row.getAttribute("href")
      expect(href).not.toBe("#")
      expect(href).toMatch(
        new RegExp(
          `^/settings/import-export/migration-assistant\\?service=${name.toLowerCase()}$`
        )
      )

      await row.click()
      await expect(page).toHaveURL(
        new RegExp(
          `/settings/import-export/migration-assistant\\?service=${name.toLowerCase()}`
        )
      )
      await expect(
        page.getByRole("heading", { level: 1, name: `Migrate from ${name}` })
      ).toBeVisible()

      await page.goto(SETTINGS_URL)
    })
  }

  test("Docs + CLI links open externally with noopener", async ({ page }) => {
    const docs = page.getByRole("link", {
      name: /Import issues documentation/i,
    })
    await expect(docs).toHaveAttribute("href", /linear\.app\/docs\/import-issues/)
    await expect(docs).toHaveAttribute("target", "_blank")
    await expect(docs).toHaveAttribute("rel", /noopener/)

    const cli = page.getByRole("link", {
      name: /Open the CLI importer on GitHub/i,
    })
    await expect(cli).toHaveAttribute(
      "href",
      /github\.com\/linear\/linear\/tree\/master\/packages\/import/
    )
    await expect(cli).toHaveAttribute("target", "_blank")
    await expect(cli).toHaveAttribute("rel", /noopener/)
  })

  test("Export dialog opens, submits, and shows success toast", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Export issue data" }).click()
    const dialog = page.getByRole("dialog", { name: "Export issue data" })
    await expect(dialog).toBeVisible()
    await dialog.getByRole("button", { name: "Export" }).click()
    await expect(
      page.getByText(/We'll email you a link to download the CSV/i)
    ).toBeVisible()
  })
})
