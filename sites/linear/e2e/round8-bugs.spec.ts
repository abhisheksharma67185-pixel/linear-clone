import { test, expect } from "@playwright/test"

// Bug 1 — Create-team button silently disabled when the auto-generated
// identifier collides with an existing team key. The form now (a)
// auto-suffixes to dodge collisions and (b) surfaces the error when
// the user has typed anything (auto-population implies "touched").
test("Create-team auto-deduplicates identifier and shows conflict error", async ({
  page,
}) => {
  // Seed a team that will collide with the auto-generated key for
  // "Collision Team" → "COL".
  await page.request.post("http://localhost:3000/api/data/teams", {
    data: { name: "Pre-existing", key: "COL" },
  })

  await page.goto("http://localhost:3000/settings/new-team", {
    waitUntil: "load",
  })
  // Wait for /api/data/teams to settle so `usedKeys` is populated by
  // the time we trigger auto-generation. Without this the dedup loop
  // runs against an empty Set and "COL" looks free.
  await page.waitForResponse(
    (r) => r.url().includes("/api/data/teams") && r.status() === 200,
    { timeout: 5000 }
  )

  await page.locator('input[id="team-name"]').fill("Collision Team")
  await page.waitForTimeout(200)

  const idInput = page.locator('input[id="team-identifier"]')
  const idValue = await idInput.inputValue()
  // Auto-generation should have suffixed past the collision.
  expect(idValue).not.toBe("COL")
  expect(idValue).toMatch(/^COL\d+$/)

  // Create button is enabled because the auto-suffixed identifier is
  // free.
  const createBtn = page.locator('button:has-text("Create team")')
  await expect(createBtn).toBeEnabled()
})

test("Create-team surfaces identifier-conflict error before submit", async ({
  page,
}) => {
  // Seed a team under a fresh name so we don't collide with the
  // round-11d name-uniqueness check (createTeam now rejects duplicate
  // names too — round 8's previous "Pre-existing"/"DUPE" pair would
  // have failed the seed POST against the prior test's seed).
  const seedName = `R8 Conflict ${Date.now()}`
  await page.request.post("http://localhost:3000/api/data/teams", {
    data: { name: seedName, key: "DUPE" },
  })

  await page.goto("http://localhost:3000/settings/new-team", {
    waitUntil: "load",
  })
  await page.locator('input[id="team-name"]').fill("Different name")
  // User overwrites the auto-generated identifier with one that clashes.
  const idInput = page.locator('input[id="team-identifier"]')
  await idInput.fill("DUPE")
  await page.waitForTimeout(150)

  await expect(page.locator("text=already in use")).toBeVisible()
  await expect(page.locator('button:has-text("Create team")')).toBeDisabled()
})

// Bug 2 — `?section=security-access` resolves to Security & access, not
// the generic Preferences fallback.
test("?section=security-access resolves to Security & access", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=security-access", {
    waitUntil: "load",
  })
  await page.waitForURL("http://localhost:3000/settings?section=security", {
    timeout: 5000,
  })
  await expect(page.locator('h1:has-text("Security")')).toBeVisible()
})

// Bug 3 — `?section=project-statuses` redirects to the path-routed
// project-statuses page rather than dropping the user on Preferences.
test("?section=project-statuses redirects to /settings/project-statuses", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=project-statuses", {
    waitUntil: "load",
  })
  await page.waitForURL("http://localhost:3000/settings/project-statuses", {
    timeout: 5000,
  })
})

// Bug 7 — Project labels "+ New label" no longer dead-ends. The
// `?section=project-labels` URL hack now redirects to the path-routed
// `/settings/project-labels` page (which has the wired-up inline-edit
// flow); previously it landed on the embedded stub whose buttons were
// silent no-ops.
test('?section=project-labels redirects + "+ New label" works', async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=project-labels", {
    waitUntil: "load",
  })
  await page.waitForURL("http://localhost:3000/settings/project-labels", {
    timeout: 5000,
  })

  // The path-routed page exposes "New label" / "New label group" with
  // their own onClick wiring (inline draft row).
  const newLabelBtn = page.locator('button[aria-label="New label"]')
  await expect(newLabelBtn).toBeEnabled()
  await newLabelBtn.click()
  // Inline-edit input becomes visible.
  await expect(page.locator('input[placeholder*="Label name"]')).toBeVisible({
    timeout: 5000,
  })
})

// Bug 9 — Project templates "+ New template" navigates to the project
// template editor (was a silent no-op).
test('Project templates "+ New template" navigates to editor', async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=project-templates", {
    waitUntil: "load",
  })
  // Same query→path redirect as project-labels.
  await page.waitForURL("http://localhost:3000/settings/project-templates", {
    timeout: 5000,
  })
  await page.locator('button[aria-label="New project template"]').click()
  await page.waitForURL(
    "http://localhost:3000/settings/templates/project/new",
    { timeout: 5000 }
  )
})

// Bug 10 — Tab title for top-level workspace routes reads the route
// name from SSR HTML (browser tab is correct on F5).
for (const { path, expected } of [
  { path: "/initiatives", expected: "Initiatives" },
  { path: "/my-issues", expected: "My issues" },
  { path: "/inbox", expected: "Inbox" },
  { path: "/projects", expected: "Projects" },
  { path: "/views", expected: "Views" },
  { path: "/cycles", expected: "Cycles" },
  { path: "/teams", expected: "Teams" },
  { path: "/search", expected: "Search" },
  { path: "/pulse", expected: "Pulse" },
]) {
  test(`tab title for ${path} reads "${expected}"`, async ({ page }) => {
    const response = await page.goto(`http://localhost:3000${path}`, {
      waitUntil: "commit",
    })
    expect(response?.ok()).toBeTruthy()
    const html = await response!.text()
    const m = html.match(/<title[^>]*>([^<]*)<\/title>/)
    expect(m, "SSR HTML must contain <title>").not.toBeNull()
    expect(m![1]).toBe(expected)
  })
}
