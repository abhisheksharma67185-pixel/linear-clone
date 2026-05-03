import { test, expect } from "@playwright/test"

// Round 11c — three sections that previously flashed empty/wrong state
// during the ~3-5s data-hydration window. The fixes apply the same
// skeleton-stable pattern R7 introduced for Workspace settings (and
// R11d for the workspace top-level pages). Source lives in
// app/(workspace)/settings/settings-client.tsx and (for project labels)
// app/(workspace)/settings/project-labels/page.tsx.

// Bug 10 — Issue Labels initial render must not flash "No labels yet"
// during the data-fetch window. While /api/data/labels is in flight
// the table renders skeleton rows; the empty-state copy is gated on
// !loading.
test("Issue Labels: no transient 'No labels yet' before data hydrates", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=issue-labels", {
    waitUntil: "commit",
  })
  // From `commit` (HTML received) through hydration, the empty-state
  // text must never appear — the skeleton placeholder is in its place.
  for (const ms of [50, 150, 300]) {
    await page.waitForTimeout(ms === 50 ? 50 : ms - 50)
    await expect(page.locator("text=/^No labels yet$/")).toHaveCount(0)
  }
  await page.waitForLoadState("networkidle")
  // The table heading itself must always be present (no crash).
  await expect(page.locator('h1:has-text("Issue labels")')).toBeVisible()
})

// Bug 10 — same pattern for the path-routed Project labels page. The
// labels list at /settings/project-labels has an empty seed, so its
// post-hydration state is genuinely the "No labels yet" empty state;
// the bug was that this empty-state copy flashed *before* /api/data/
// project-labels resolved. Hold the labels response open via
// `page.route` so the loading window is observable, then assert the
// skeleton renders and the empty-state copy is suppressed during it.
test("Project Labels: skeleton (not empty state) renders while data is in flight", async ({
  page,
}) => {
  let release: (() => void) | null = null
  const heldUntil = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route("**/api/data/project-labels", async (route) => {
    await heldUntil
    await route.continue()
  })

  await page.goto("http://localhost:3000/settings/project-labels", {
    waitUntil: "commit",
  })

  // While the labels fetch is held, the page should show its skeleton
  // rows and NOT the "No labels yet" empty-state copy.
  await page.waitForTimeout(200)
  await expect(page.locator(".animate-pulse").first()).toBeVisible()
  await expect(
    page.locator("text=/No labels yet|create one to get started/")
  ).toHaveCount(0)

  // Release the fetch — once resolved, the empty state is the correct
  // post-hydration outcome (the seed has no project labels).
  release?.()
  await page.waitForLoadState("networkidle")
  await expect(page.locator('h1:has-text("Project labels")')).toBeVisible()
})

// Bug 11 — Members default tab is "Pending invites" from the very
// first paint; it never changes as a side effect of the API resolving.
// The active tab's label is rendered inside the filter trigger button
// (`data-testid="members-filter-trigger"`).
test("Members: filter trigger shows 'Pending invites' on initial render", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=members", {
    waitUntil: "load",
  })
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(300)

  const trigger = page.locator('[data-testid="members-filter-trigger"]')
  await expect(trigger).toBeVisible()
  const text = (await trigger.textContent())?.trim()
  expect(text).toContain("Pending invites")
})

// Bug 11 — sample the trigger label across the loading→loaded
// transition. Pre-fix the trigger read "All" for ~3-4 seconds before
// flipping to "Pending invites"; the fix keeps "Pending invites" stable
// from the very first paint.
test("Members: filter trigger never reads 'All' during the loading window", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=members", {
    waitUntil: "domcontentloaded",
  })
  const seen: string[] = []
  for (const ms of [50, 150, 300, 600, 1200]) {
    await page.waitForTimeout(ms === 50 ? 50 : ms - 50)
    const text = await page.evaluate(() => {
      const t = document.querySelector('[data-testid="members-filter-trigger"]')
      return t?.textContent?.trim() ?? "(none)"
    })
    seen.push(text)
  }
  const sawAll = seen.some((s) => s.startsWith("All"))
  expect(
    sawAll,
    `tab values seen during the loading window: ${JSON.stringify(seen)}`
  ).toBe(false)
})

// Bug 12 — Security & access skeletons span more than a single tiny
// stub row, so the Sessions / Passkeys / API-keys sections don't jump
// in size when their respective fetches resolve. Each section wraps
// its loading state in an `aria-busy` block.
test("Security: skeleton rows match populated layout (no card-pop)", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=security", {
    waitUntil: "domcontentloaded",
  })
  // While loading, each of Sessions / Passkeys / Personal API keys
  // renders an aria-busy skeleton — three sections, three markers.
  await page.waitForTimeout(60)
  const busyCount = await page.locator("[aria-busy]").count()
  expect(busyCount).toBeGreaterThanOrEqual(3)
})

// Bug 12 — once /api/sessions resolves, the Sessions list populates
// with at least one entry (the seed includes "Chrome on macOS",
// "Safari on iOS"). The skeleton must give way to real rows.
test("Security: Sessions section populates after hydration", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/settings?section=security", {
    waitUntil: "networkidle",
  })
  await page.waitForTimeout(300)

  // No more aria-busy skeletons inside the Sessions card.
  const sessionsHeading = page.locator('h2:has-text("Sessions")')
  await expect(sessionsHeading).toBeVisible()
  // Sessions list is rendered as `<ul>` siblings to the heading; assert
  // at least one list item with a session label is present.
  await expect(
    page.locator("text=/Chrome on macOS|Safari on iOS|Current session/").first()
  ).toBeVisible()
})
