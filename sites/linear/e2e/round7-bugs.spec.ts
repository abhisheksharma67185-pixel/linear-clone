import { test, expect } from "@playwright/test"

// Bug 1 — Profile picture must persist across F5. The previous
// implementation used `URL.createObjectURL` (an in-memory blob URL)
// without writing to localStorage, so reloading lost the avatar.
test("Profile picture upload persists across F5", async ({ page }) => {
  await page.goto("/settings?section=profile", {
    waitUntil: "load",
  })
  await page.evaluate(() =>
    window.localStorage.removeItem("linear:profile:avatar")
  )
  await page.reload({ waitUntil: "load" })

  // Tiny PNG payload (1×1 transparent) — enough to validate the
  // upload + persistence round-trip without external assets.
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
  const fileChooserPromise = page.waitForEvent("filechooser")
  await page.locator('button[aria-label="Upload profile picture"]').click()
  const fc = await fileChooserPromise
  await fc.setFiles({
    name: "avatar.png",
    mimeType: "image/png",
    buffer: Buffer.from(pngBase64, "base64"),
  })
  // Wait for the upload to flush to localStorage.
  await page.waitForFunction(
    () => window.localStorage.getItem("linear:profile:avatar") !== null,
    null,
    { timeout: 5000 }
  )

  await page.reload({ waitUntil: "load" })
  await page.waitForTimeout(300)
  // After reload, the avatar `<img>` inside the profile-picture button
  // should be present (the placeholder initials show otherwise).
  await expect(
    page.locator('button[aria-label="Upload profile picture"] img')
  ).toBeVisible({ timeout: 5000 })
})

// Bug 3 — Workspace section: name + URL must hydrate from /api/workspace
// before either input becomes editable. No "URL is required" alert
// flashes during the loading window.
test("Workspace name+URL hydrate from API; no validation flash", async ({
  page,
}) => {
  await page.goto("/settings?section=workspace", {
    waitUntil: "domcontentloaded",
  })
  // Sample early — the loading skeleton must NOT show "URL is required".
  for (const ms of [50, 150, 300]) {
    await page.waitForTimeout(ms === 50 ? 50 : ms - 50)
    const text = await page.locator("body").innerText()
    expect(text).not.toContain("URL is required")
  }
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(300)

  // After load, both inputs are populated from the API response.
  const name = page.locator('input[id="workspace-name"]')
  await expect(name).toBeVisible()
  const nameValue = await name.inputValue()
  expect(nameValue.length).toBeGreaterThan(0)

  const slug = page.locator('input[id="workspace-url"]')
  await expect(slug).toBeVisible()
  const slugValue = await slug.inputValue()
  expect(slugValue.length).toBeGreaterThan(0)

  // No validation error on a freshly-loaded form.
  await expect(page.locator("body")).not.toContainText("URL is required")
})

// Bug 5 — Tab title for `/settings/integrations/<slug>` reads the
// integration's display name from SSR HTML (browser shows it
// immediately on F5, before any client JS runs).
for (const { slug, expected } of [
  { slug: "github", expected: "GitHub · Integrations" },
  { slug: "slack", expected: "Slack · Integrations" },
  { slug: "figma", expected: "Figma · Integrations" },
  { slug: "notion", expected: "Notion · Integrations" },
]) {
  test(`tab title for /settings/integrations/${slug} reads "${expected}"`, async ({
    page,
  }) => {
    const response = await page.goto(`/settings/integrations/${slug}`, {
      waitUntil: "commit",
    })
    expect(response?.ok()).toBeTruthy()
    const html = await response!.text()
    const m = html.match(/<title[^>]*>([^<]*)<\/title>/)
    expect(m, "SSR HTML must contain <title>").not.toBeNull()
    expect(m![1]).toBe(expected)
  })
}
