import { test, expect } from "@playwright/test"

// Round 11a — six small targeted fixes for the settings shell. All of
// the production wiring lives in app/(workspace)/settings/settings-client.tsx;
// these tests just exercise the user-visible contract for each bug so
// regressions surface as a failing test, not a screenshot review.

// Bug 1 — Customer requests "Manage customers" used to navigate to
// /customers (a route that doesn't exist) and 404'd. It now opens an
// inline Dialog scoped to the settings panel.
test("Manage customers opens a Dialog, no longer 404s on /customers", async ({
  page,
}) => {
  await page.goto("/settings?section=customer-requests", {
    waitUntil: "load",
  })
  // The downstream rows are gated behind the Enable toggle, so flip it
  // on first.
  await page.locator('[aria-label="Enable Customer requests"]').click()
  await page.waitForTimeout(150)

  const before = page.url()
  await page.locator('button[aria-label="Manage customers"]').click()
  await page.waitForTimeout(200)

  // URL must NOT have changed to /customers.
  expect(page.url()).toBe(before)
  // The Dialog mounts an explicit role="dialog" wrapper; assert against
  // that to disambiguate from the section's own "Manage customers"
  // button label and description text.
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator("text=No customers")).toBeVisible()
})

// Bug 2 — Issue Labels table now shows Description and Issues column
// headers (previously only Name / Last applied / Created).
test("Issue Labels table headers include Description and Issues", async ({
  page,
}) => {
  await page.goto("/settings?section=issue-labels", {
    waitUntil: "load",
  })
  await page.waitForTimeout(400)

  // Headers live in a div above the rows. Match exact text so we don't
  // hit the sidebar's "Issues" group title etc.
  const headerRow = page.locator("text=Last applied").locator("..")
  await expect(headerRow.locator("text=/^Description$/")).toBeVisible()
  await expect(headerRow.locator("text=/^Issues$/")).toBeVisible()
})

// Bug 3 — Agent Personalization Guidance textarea exposes the
// placeholder copy real Linear ships.
test("Agent personalization guidance textarea exposes a placeholder", async ({
  page,
}) => {
  await page.goto("/settings?section=agent-personalization", {
    waitUntil: "load",
  })
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(300)

  const placeholder = await page
    .locator("#guidance")
    .getAttribute("placeholder")
  expect(placeholder).toBe(
    "Enter personal guidance for the Linear Agent (optional)…"
  )
})

// Bug 4 — Skills section empty state shows the explanatory text and
// the Create skill button (the previous render was a bare grey box).
test("Agent personalization Skills empty state has Create skill CTA", async ({
  page,
}) => {
  await page.goto("/settings?section=agent-personalization", {
    waitUntil: "load",
  })
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(300)

  await expect(
    page.locator("text=You haven't added any skills yet")
  ).toBeVisible()
  await expect(
    page.locator('button:has-text("Create skill")').first()
  ).toBeVisible()
})

// Bug 5 — Default team Select trigger reads "Select a team" before
// the user picks a team, instead of rendering an empty trigger.
test("CR Default team Select shows 'Select a team' placeholder", async ({
  page,
}) => {
  await page.goto("/settings?section=customer-requests", {
    waitUntil: "load",
  })
  await page.locator('[aria-label="Enable Customer requests"]').click()
  await page.waitForTimeout(150)

  const trigger = page.locator(
    'button[aria-label="Default team for customer requests"]'
  )
  await expect(trigger).toBeVisible()
  const text = (await trigger.textContent())?.trim()
  expect(text).toBe("Select a team")
})

// Bug 6 — Pulse description copy mentions "project and initiative
// updates", not just "project updates".
test("Pulse description mentions 'project and initiative updates'", async ({
  page,
}) => {
  await page.goto("/settings?section=pulse", {
    waitUntil: "load",
  })
  await expect(
    page.locator("text=project and initiative updates")
  ).toBeVisible()
})
