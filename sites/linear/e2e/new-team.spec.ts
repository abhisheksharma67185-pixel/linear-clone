/**
 * Playwright E2E for the Create a new team page.
 */
import { expect, test } from "@playwright/test"

const NEW_TEAM_URL = "/settings/new-team"

test.describe("Create a new team", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(NEW_TEAM_URL)
  })

  test("submitting an empty Team name surfaces an inline error", async ({
    page,
  }) => {
    const create = page.getByRole("button", { name: "Create team" })
    await expect(create).toBeDisabled()
    const name = page.getByLabel("Team name")
    await name.focus()
    await name.blur()
    await expect(page.getByText("Team name is required")).toBeVisible()
  })

  test("Copy-from-team shows 'Don't copy' by default", async ({ page }) => {
    const trigger = page.getByRole("button", {
      name: /Copy settings from team/i,
    })
    await expect(trigger).toContainText("Don't copy")
    await trigger.click()
    // Option list also uses the identical label.
    await expect(
      page.getByRole("option", { name: "Don't copy" })
    ).toBeVisible()
  })

  test("Timezone trigger defaults to a human-readable Kolkata label", async ({
    page,
  }) => {
    const tz = page.getByRole("button", { name: /^Timezone:/ })
    await expect(tz).toContainText(/GMT\+05:30/)
    await expect(tz).toContainText("Kolkata")
  })

  test("Timezone picker is searchable", async ({ page }) => {
    await page.getByRole("button", { name: /^Timezone:/ }).click()
    const search = page.getByLabel("Search timezones")
    await search.fill("Tokyo")
    const tokyoOption = page
      .getByRole("option")
      .filter({ hasText: "Tokyo" })
      .first()
    await expect(tokyoOption).toBeVisible()
    await tokyoOption.click()
    await expect(
      page.getByRole("button", { name: /^Timezone:/ })
    ).toContainText("Tokyo")
  })

  test("Make team private section is rendered", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Make team private", level: 2 })
    ).toBeVisible()
    await expect(page.getByText(/Private teams and their issues/i)).toBeVisible()
    await expect(
      page.getByRole("button", { name: /Available on Business/i }).last()
    ).toBeVisible()
  })
})
