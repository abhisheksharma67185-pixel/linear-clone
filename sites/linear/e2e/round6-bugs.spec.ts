import { test, expect } from "@playwright/test"

// Bug 1 — "Manage" Allowed MCP servers link in Linear Agent detail page
// must target a workspace-admin route, not the user's personal page.
test('Linear Agent → "Manage allowed MCP servers" navigates to admin', async ({
  page,
}) => {
  await page.goto("/settings?section=ai-agents&sub=linear-agent", {
    waitUntil: "load",
  })
  await page.locator('a[aria-label="Manage allowed MCP servers"]').click()
  // Workspace-scoped policy lives under Administration → Security.
  await page.waitForURL(/\/settings\?section=admin-security/, {
    timeout: 5000,
  })
})

// Bug 2 — Plan upgrade buttons on /settings/billing/upgrade must do
// something user-visible, not silently no-op.
test("Billing upgrade buttons surface a toast (no silent no-op)", async ({
  page,
}) => {
  await page.goto("/settings/billing/upgrade", {
    waitUntil: "load",
  })
  await page.locator('button[aria-label="Upgrade to Basic"]').click()
  await expect(
    page.locator("text=Basic plan checkout coming soon")
  ).toBeVisible({ timeout: 5000 })
})

// Bug 3 — Help popover search input filters items live by name.
test("Help popover search filters items by name", async ({ page }) => {
  await page.goto("/settings?section=preferences", {
    waitUntil: "load",
  })
  // Open the help popover via the bottom-left "?" trigger.
  await page.locator('button[aria-label="Help"]').click()
  await expect(page.locator('input[aria-label="Search help"]')).toBeVisible()

  // Type "key" — only items containing "key" should remain.
  await page.locator('input[aria-label="Search help"]').fill("key")
  // The Keyboard shortcuts row matches; Docs / Settings / Linear status
  // do not.
  await expect(page.locator("text=Keyboard shortcuts")).toBeVisible()
  await expect(page.locator("text=Linear status")).toHaveCount(0)
  await expect(page.locator("text=Download apps")).toHaveCount(0)
})

// Bug 4 — Global keyboard shortcuts.
test("`?` opens the Help popover from anywhere in the app", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" })
  // Ensure no popover open initially.
  await expect(page.locator('input[aria-label="Search help"]')).toHaveCount(0)
  await page.keyboard.press("Shift+/")
  await expect(page.locator('input[aria-label="Search help"]')).toBeVisible({
    timeout: 5000,
  })
})

test("`Cmd+/` opens the Help popover", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" })
  await page.keyboard.press("Meta+/")
  await expect(page.locator('input[aria-label="Search help"]')).toBeVisible({
    timeout: 5000,
  })
})

test("`g s` navigates to /settings", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" })
  await page.keyboard.press("g")
  await page.keyboard.press("s")
  await page.waitForURL(/\/settings/, { timeout: 5000 })
})

test("Shortcuts ignored while focus is in an input", async ({ page }) => {
  await page.goto("/settings?section=profile", {
    waitUntil: "load",
  })
  // Profile mounts a hidden <input type="file"> first (avatar upload),
  // so target the visible Full-name <Input> by data-slot. <Input> from
  // components/ui/input.tsx renders without an explicit `type` attr,
  // so a `type=text` selector wouldn't match.
  const input = page.locator('input[data-slot="input"]').first()
  await input.click()
  await input.fill("")
  await page.keyboard.press("g")
  await page.keyboard.press("s")
  await page.waitForTimeout(300)
  expect(page.url()).toContain("section=profile")
  await expect(input).toHaveValue("gs")
})

// Bug 5 — AI & Agents upsell CTA is now plan-gated, matching SLAs/Asks
// pattern. When the workspace is on a trial, the page shows the trial
// banner instead of the always-on stub CTA.
test("AI & Agents shows trial-aware status (not always-on stub CTA)", async ({
  page,
}) => {
  // Force the mock plan to "trial" via the trial endpoint, then verify
  // the page renders the trial banner instead of the upsell CTA.
  await page.request.post("/api/billing/trial")
  await page.goto("/settings?section=ai-agents", {
    waitUntil: "networkidle",
  })
  await page.waitForTimeout(400)
  // Trial banner is visible; the gated upsell card is hidden.
  await expect(page.locator("text=Trial active")).toBeVisible()
  await expect(
    page.locator(
      "text=Linear Agent and AI automations are available on Business"
    )
  ).toHaveCount(0)
})
