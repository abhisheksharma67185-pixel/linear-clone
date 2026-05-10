import { test, expect } from "@playwright/test"

const PAGES = [
  {
    name: "Customer requests",
    section: "customer-requests",
    storageKey: "linear:customerRequests:enabled",
    nearText: "Enable Customer requests",
  },
  {
    name: "Initiatives",
    section: "initiatives",
    storageKey: "linear:initiatives:enabled",
    nearText: "Enable Initiatives",
  },
  {
    name: "Pulse",
    section: "pulse",
    storageKey: "linear:pulse:enabled",
    nearText: "Enable Pulse",
  },
]

for (const p of PAGES) {
  test(`${p.name} Enable toggle persists (data-checked + aria-checked)`, async ({
    page,
  }) => {
    await page.context().clearCookies()
    await page.goto(`/settings?section=${p.section}`)
    await page.evaluate((k) => window.localStorage.removeItem(k), p.storageKey)
    await page.reload()

    const row = page.locator("div", { hasText: p.nearText }).first()
    const toggle = row.locator('[data-slot="switch"]').first()
    await expect(toggle).toBeVisible({ timeout: 5000 })

    await toggle.click()

    const after = await page.evaluate(
      (k) => window.localStorage.getItem(k),
      p.storageKey
    )
    console.log(`[${p.name}] storage after click: ${JSON.stringify(after)}`)
    expect(after).toBe("true")

    // Full reload, then assert BOTH the data-checked attribute and the
    // ARIA state. Round-5 verification protocol explicitly demands
    // `aria-checked="true"` because that's what the user inspects in
    // the browser console — separate assertion to catch any regression
    // where data-checked updates but aria-checked lags behind.
    await page.reload()
    const reloadRow = page.locator("div", { hasText: p.nearText }).first()
    const reloadToggle = reloadRow.locator('[data-slot="switch"]').first()
    await expect(reloadToggle).toHaveAttribute("data-checked", "", {
      timeout: 5000,
    })
    await expect(reloadToggle).toHaveAttribute("aria-checked", "true", {
      timeout: 5000,
    })

    // Round-5 protocol: also assert the FIRST `[role="switch"]` on the
    // page (what `document.querySelector('[role=switch]')` returns in
    // the user's manual repro) reads aria-checked="true". On all three
    // sections under test, the Enable-* toggle is the first switch in
    // DOM order, so this catches the user's exact failure signal.
    const firstSwitchAria = await page.evaluate(() =>
      document.querySelector('[role="switch"]')?.getAttribute("aria-checked")
    )
    expect(firstSwitchAria).toBe("true")
  })
}

test("Profile Full name input persists", async ({ page }) => {
  await page.goto("/settings?section=profile")
  await page.evaluate(() =>
    window.localStorage.removeItem("linear:profile:name")
  )
  await page.reload()

  const input = page.locator('input[type="text"], input:not([type])').nth(0)
  await expect(input).toBeVisible({ timeout: 5000 })
  await input.fill("Persistence Test")
  await input.blur()

  const stored = await page.evaluate(() =>
    window.localStorage.getItem("linear:profile:name")
  )
  console.log(`[Profile name] storage after blur: ${JSON.stringify(stored)}`)
  expect(stored).toContain("Persistence Test")

  await page.reload()
  const reloaded = page.locator('input[type="text"], input:not([type])').nth(0)
  await expect(reloaded).toHaveValue("Persistence Test", { timeout: 5000 })
})
