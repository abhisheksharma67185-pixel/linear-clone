/**
 * Regression: the invite dialog used to accept malformed addresses
 * like `hvkvkvk@234234gmail.com` because its email regex was the
 * naive `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. The new regex (HTML5-strict
 * + length bounds) plus the inline `aria-invalid` + error message
 * surface a visible rejection.
 *
 * Tests:
 *   1. A clearly malformed string is rejected, the input is marked
 *      `aria-invalid`, and an `[role="alert"]` error appears.
 *   2. A clearly valid email IS accepted (commits to a chip).
 */
import { expect, test } from "@playwright/test"

async function openInviteDialog(page: import("@playwright/test").Page) {
  // The Invite People dialog is reachable from the sidebar's Try
  // section. We open it directly here by mounting the dialog through
  // the workspace layout — go to /teams, then click the sidebar Try
  // → Invite people item.
  await page.goto("/teams")
  await expect(page.getByRole("heading", { name: /^Teams$/ })).toBeVisible()
  // The Try section may or may not be present depending on persisted
  // dismiss state. If hidden, force-show it by clearing localStorage
  // and reloading.
  const tryVisible = await page
    .getByTestId("sidebar-try-section")
    .isVisible()
    .catch(() => false)
  if (!tryVisible) {
    await page.evaluate(() =>
      window.localStorage.removeItem("sidebar:try-section-dismissed")
    )
    await page.reload()
    await expect(page.getByTestId("sidebar-try-section")).toBeVisible()
  }
  await page.getByRole("button", { name: /Invite people/i }).click()
  await expect(
    page.getByRole("dialog", { name: /Invite people/i })
  ).toBeVisible()
}

test.describe("Invite dialog rejects invalid emails", () => {
  test("malformed address surfaces an inline error and aria-invalid", async ({
    page,
  }) => {
    await openInviteDialog(page)
    const input = page.getByTestId("invite-emails-input")
    await input.fill("not-an-email")
    // Commit via Enter — the dialog runs validation on commit.
    await input.press("Enter")

    // The error region must announce the failure.
    const error = page.getByTestId("invite-emails-error")
    await expect(error).toBeVisible()
    await expect(error).toContainText(/not a valid email/i)

    // Input is flagged for assistive tech.
    await expect(input).toHaveAttribute("aria-invalid", "true")

    // No chip was created — the malformed input wasn't silently kept.
    const chip = page
      .getByRole("button", { name: /Remove not-an-email/ })
    await expect(chip).toHaveCount(0)
  })

  test("valid email commits to a chip and clears the input", async ({
    page,
  }) => {
    await openInviteDialog(page)
    const input = page.getByTestId("invite-emails-input")
    await input.fill("priya@theta.internal")
    await input.press("Enter")

    // No error.
    await expect(page.getByTestId("invite-emails-error")).toHaveCount(0)
    // Input cleared.
    await expect(input).toHaveValue("")
    // Chip created with a Remove button.
    await expect(
      page.getByRole("button", { name: /Remove priya@theta\.internal/ })
    ).toBeVisible()
  })
})
