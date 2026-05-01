import { test, expect } from "@playwright/test"

// Bug 1 — `?section=labels` (and any other unknown slug) must NOT
// render the generic "settings coming soon" stub. `labels` is an alias
// for Issues→Labels. Unknown keys collapse to Preferences.
test("?section=labels resolves to Issues→Labels content", async ({ page }) => {
  await page.goto("http://localhost:3000/settings?section=labels", {
    waitUntil: "load",
  })
  // The client-side resolver fires `router.replace` in a useEffect
  // after first paint — wait for the URL to actually update rather than
  // sleeping for a fixed timeout.
  await page.waitForURL("http://localhost:3000/settings?section=issue-labels", {
    timeout: 5000,
  })
  await expect(page.locator("body")).not.toContainText("settings coming soon")
})

test("?section=foo-bar-nonexistent redirects to Preferences", async ({
  page,
}) => {
  await page.goto(
    "http://localhost:3000/settings?section=foo-bar-nonexistent",
    { waitUntil: "load" }
  )
  await page.waitForURL("http://localhost:3000/settings?section=preferences", {
    timeout: 5000,
  })
  await expect(page.locator("body")).not.toContainText("settings coming soon")
  await expect(page.locator('h1:has-text("Preferences")')).toBeVisible()
})

// Bug 2 — Customer requests "Default team" Select must show the team
// name in the trigger after selection, not the team id.
test("CR Default team Select trigger shows team name, not id", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=customer-requests", {
    waitUntil: "load",
  })

  // Customer-requests sub-options are gated behind the Enable toggle.
  // Flip it on first so the team Select is interactive.
  await page.locator('[aria-label="Enable Customer requests"]').click()

  const trigger = page.locator(
    'button[aria-label="Default team for customer requests"]'
  )
  await expect(trigger).toBeEnabled({ timeout: 5000 })
  await trigger.click()

  // Pick the first team option from the dropdown.
  const firstOption = page.locator('[role="option"]').first()
  const expectedName = (await firstOption.textContent())?.trim() ?? ""
  await firstOption.click()

  await page.waitForTimeout(150)
  const triggerText = (await trigger.textContent())?.trim() ?? ""
  expect(triggerText).toBe(expectedName)
  expect(triggerText).not.toMatch(/^team-\d+$/)
})

// Bug 3 — Updates / Initiatives schedule Select trigger must show the
// friendly cadence label while editing, not the raw key.
for (const { section, label, ariaLabel } of [
  {
    section: "updates",
    label: "Update schedule",
    ariaLabel: "Update schedule",
  },
  {
    section: "initiatives",
    label: "Initiative update schedule",
    ariaLabel: "Initiative update schedule",
  },
]) {
  test(`${label} edit-mode trigger shows friendly label`, async ({ page }) => {
    await page.goto(`http://localhost:3000/settings?section=${section}`, {
      waitUntil: "load",
    })
    // Initiatives schedule is gated behind the Enable toggle. Updates
    // page has no gate but flipping a non-existent Enable toggle is a
    // no-op, so this branch is safe to run unconditionally.
    if (section === "initiatives") {
      await page.locator('[aria-label="Enable Initiatives"]').click()
      await page.waitForTimeout(150)
    }
    await page.locator('button:has-text("Edit")').first().click()

    const trigger = page.locator(`button[aria-label="${ariaLabel}"]`)
    await expect(trigger).toBeVisible()
    const initial = (await trigger.textContent())?.trim() ?? ""
    // Initial draft is "none" → must read "No expectation for updates".
    expect(initial).toBe("No expectation for updates")

    // Pick "Every 2 weeks" and verify the trigger updates to that label.
    await trigger.click()
    await page.locator('[role="option"]:has-text("Every 2 weeks")').click()
    await page.waitForTimeout(150)
    const after = (await trigger.textContent())?.trim() ?? ""
    expect(after).toBe("Every 2 weeks")
  })
}

// Bug 4 — full row of a Notifications channel should be the click
// target, not just the chevron icon. Clicking the channel label or
// status text must navigate to the channel detail page.
test("Notifications: clicking channel label navigates to channel detail", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=notifications", {
    waitUntil: "load",
  })
  // Target the row's accessible button explicitly so this doesn't pick
  // up unrelated "Desktop" text elsewhere on the page (e.g. the
  // Preferences "Desktop application" card if the user navigated past
  // it). Click the "Disabled" status text deep inside the button —
  // explicitly testing that the row, not the chevron, is the click
  // target.
  const row = page.locator(
    'button[aria-label="Configure Desktop notifications"]'
  )
  await row.locator("text=Disabled").click()
  await page.waitForURL(/channel=desktop/, { timeout: 5000 })
})
