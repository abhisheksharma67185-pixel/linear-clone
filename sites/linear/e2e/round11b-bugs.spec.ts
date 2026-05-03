import { test, expect } from "@playwright/test"

// Round 11b — three behaviors gating consistency between SLAs, Asks,
// and the Workspace settings shell. The fixes themselves live in
// app/(workspace)/settings/settings-client.tsx (SLAsSection,
// AsksSection, WorkspaceSection).

// Bug 7 — SLAs page on trial plan shows the Trial banner + SLA policies
// section + Automation rules section together on initial load. Round-11a
// shipped without those gated correctly so the policies/banner only
// appeared after clicking Add rule (the click looked like it caused the
// reveal). The R11d Bug-22 work also tightened plan-fetching, so this
// path may already be covered — the assertions here keep the contract
// pinned even if the rendering layer changes again.
test("SLAs initial load shows Trial banner + SLA policies + Automation rules", async ({
  page,
}) => {
  // Force trial plan so the Trial banner is the expected state.
  await page.request.post("http://localhost:3000/api/billing/trial")

  await page.goto("http://localhost:3000/settings?section=slas", {
    waitUntil: "load",
  })
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(300)

  // All three sections must be visible without any further interaction.
  await expect(page.locator("text=Trial active").first()).toBeVisible()
  await expect(
    page.locator('button[aria-label="New SLA policy"]')
  ).toBeVisible()
  await expect(
    page.locator('button[aria-label="Add automation rule"]')
  ).toBeVisible()
  await expect(page.locator('h2:has-text("SLA policies")')).toBeVisible()
  await expect(page.locator("text=/^Automation rules$/").first()).toBeVisible()
})

// Bug 8 — Workspace skeleton no longer flashes a partial layout when
// the form mounts. The skeleton mirrors all four cards
// (Logo/Name/URL + Time & region + Welcome + Danger) so the swap to
// the real form is layout-stable. Round-7 left out the trailing
// sections, which is what made the brief skeleton-to-form transition
// feel like a flash on hard reload.
test("Workspace skeleton has matching layout — no card-pop on hydration", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=workspace", {
    waitUntil: "domcontentloaded",
  })
  // The skeleton renders ≥4 card containers; the original was 1 card.
  const cardCount = await page.evaluate(
    () => document.querySelectorAll(".divide-y, .rounded-lg.border").length
  )
  expect(cardCount).toBeGreaterThanOrEqual(4)
  // The form should hydrate cleanly into the same vertical space.
  await page.waitForLoadState("networkidle")
  await expect(page.locator('input[id="workspace-name"]')).toBeVisible()
})

// Bug 9 — Asks renders a "Trial active" banner using the same
// primary-tinted treatment the SLAs page uses, so the trial UX is
// consistent across all Business-gated pages.
test("Asks shows the same Trial active banner styling as SLAs on trial plan", async ({
  page,
}) => {
  await page.request.post("http://localhost:3000/api/billing/trial")

  await page.goto("http://localhost:3000/settings?section=asks", {
    waitUntil: "load",
  })
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(300)

  // Banner reads "Trial active" and uses the primary-tinted surface.
  const banner = page.locator('[role="status"]').first()
  await expect(banner).toBeVisible()
  await expect(banner.locator("text=Trial active")).toBeVisible()
  const className = (await banner.getAttribute("class")) ?? ""
  expect(className).toContain("border-primary/40")
  expect(className).toContain("bg-primary/10")

  // Feature cards still render — trial grants access.
  await expect(page.locator("text=Slack intake")).toBeVisible()
})

// Bug 9 — both SLAs and Asks show the "Trial active" banner when the
// live plan is "trial". Reuses /api/billing/plan as the source of
// truth (R11d Bug 22 unified that endpoint).
test("SLAs and Asks both show Trial active banner on trial plan", async ({
  page,
}) => {
  await page.request.post("http://localhost:3000/api/billing/trial")

  await page.goto("http://localhost:3000/settings?section=slas", {
    waitUntil: "networkidle",
  })
  await expect(
    page.locator('[role="status"]').filter({ hasText: "Trial active" })
  ).toBeVisible()

  await page.goto("http://localhost:3000/settings?section=asks", {
    waitUntil: "networkidle",
  })
  await expect(
    page.locator('[role="status"]').filter({ hasText: "Trial active" })
  ).toBeVisible()
})

// Bug 9 — when plan === "free", Asks renders the gate card from real
// Linear ("Asks intake is available on Business or Enterprise plans" +
// Start free trial CTA) and does NOT render the trial-only banner. The
// /api/billing/plan endpoint is mocked here so the test stays
// hermetic — the dev server's in-memory plan state may already be
// flipped to "trial" by the tests above.
test("Asks shows the gate card (not feature-only UI) when plan === 'free'", async ({
  page,
}) => {
  await page.route("**/api/billing/plan", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ plan: "free", trialDaysRemaining: null }),
    })
  )

  await page.goto("http://localhost:3000/settings?section=asks", {
    waitUntil: "networkidle",
  })
  await page.waitForTimeout(300)

  // Gate card is visible.
  await expect(
    page.locator(
      "text=Asks intake is available on Business or Enterprise plans"
    )
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: /start free trial/i }).first()
  ).toBeVisible()
  // No Trial banner.
  await expect(
    page.locator('[role="status"]').filter({ hasText: "Trial active" })
  ).toHaveCount(0)
})
