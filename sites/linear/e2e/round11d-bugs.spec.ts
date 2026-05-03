import { test, expect } from "@playwright/test"

// Bug 16 — every KNOWN_SECTIONS entry must be reachable both as
// `?section=<key>` (the canonical form) and as `/settings/<key>`
// (path-routed). The path form 307s to the canonical form via the new
// `[section]/page.tsx` server route. The legacy `/settings/billing`
// 404 was the headline failure; spot-checking a few keys keeps the
// fix honest.
for (const section of [
  "billing",
  "preferences",
  "notifications",
  "security",
  "applications",
  "profile",
]) {
  test(`/settings/${section} redirects to ?section=${section}`, async ({
    page,
  }) => {
    const response = await page.goto(
      `http://localhost:3000/settings/${section}`
    )
    expect(response?.ok()).toBeTruthy()
    expect(page.url()).toBe(`http://localhost:3000/settings?section=${section}`)
  })
}

// Bug 17 — top-level workspace pages render data, not endless skeletons.
// /projects, /views, /my-issues, /teams, /pulse fetch from the same
// /api/data/* endpoints that /cycles, /inbox, /initiatives use; assert
// each renders meaningful content within a reasonable budget.
for (const { path, marker } of [
  { path: "/projects", marker: "Auth Service" },
  { path: "/views", marker: "Personal views" },
  { path: "/my-issues", marker: "Assigned" },
  { path: "/teams", marker: "All teams" },
  { path: "/pulse", marker: "Following" },
]) {
  test(`${path} resolves data into UI (no permanent skeleton)`, async ({
    page,
  }) => {
    await page.goto(`http://localhost:3000${path}`, {
      waitUntil: "networkidle",
    })
    await page.waitForTimeout(300)
    // Skeleton must NOT still be visible after data has settled.
    const skeletonCount = await page.locator(".animate-pulse").count()
    expect(skeletonCount).toBe(0)
    // Page-specific content marker (real data, not a stub).
    await expect(page.locator(`text=${marker}`).first()).toBeVisible()
  })
}

// Bug 18 — template-create flow gates the primary action when required
// fields are empty. Each editor (issue / document / project) disables
// the Create button until the user has entered something to save, so
// the click no longer silently no-ops.
for (const { path, label } of [
  { path: "/settings/templates/issue/new", label: /create template/i },
  {
    path: "/settings/templates/document/new",
    label: /create document template/i,
  },
  {
    path: "/settings/templates/project/new",
    label: /create project template/i,
  },
]) {
  test(`${path} disables Create until fields are valid`, async ({ page }) => {
    await page.goto(`http://localhost:3000${path}`, {
      waitUntil: "networkidle",
    })
    await page.waitForTimeout(300)
    const btn = page.getByRole("button", { name: label })
    await expect(btn.first()).toBeDisabled()
  })
}

// Bug 19 — integration sub-pages no longer render the empty preview
// tiles between the header card and Overview section. The screenshot
// carousel relied on remote webassets URLs that QA's environment
// rendered as blank grey boxes, so the cleanest fix was to drop the
// tiles entirely (real Linear has them but the assets aren't served
// from this clone).
for (const slug of ["slack", "github"]) {
  test(`/settings/integrations/${slug} has no empty image tiles`, async ({
    page,
  }) => {
    await page.goto(`http://localhost:3000/settings/integrations/${slug}`, {
      waitUntil: "networkidle",
    })
    await page.waitForTimeout(300)
    // The placeholder tiles previously embedded webassets.linear.app
    // images. None should remain.
    const tiles = await page.locator('img[src*="webassets.linear.app"]').count()
    expect(tiles).toBe(0)
    // Sanity: the rest of the page (Overview heading) still renders.
    await expect(
      page.getByRole("heading", { name: "Overview", level: 2 }).first()
    ).toBeVisible()
  })
}

// Bug 20 — pages should not log React hydration / duplicate-key errors
// to the browser console. Both errors surfaced as the Next.js dev red
// "N Issues" badge in the bottom-right of the UI.
test("/cycles renders without nested-button hydration error", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  await page.goto("http://localhost:3000/cycles", { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  // The previous code put `<Button>` (a native <button>) inside a
  // `<CollapsibleTrigger>` (also a native <button>); that's invalid
  // HTML and React/Next.js logged "<button> cannot be a descendant of
  // <button>" / "<button> cannot contain a nested <button>".
  const nestedBtn = errors.filter(
    (e) => e.includes("button") && e.includes("descendant")
  )
  expect(
    nestedBtn,
    `unexpected nested-button errors: ${JSON.stringify(nestedBtn)}`
  ).toHaveLength(0)
})

test("/settings?section=slas has no duplicate-key warnings", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  await page.goto("http://localhost:3000/settings?section=slas", {
    waitUntil: "networkidle",
  })
  await page.waitForTimeout(500)
  // SlaPolicyDialog + AutomationRuleDialog are siblings; both
  // previously fell back to the bare `"closed"` key when their target
  // was null, colliding with each other. The fix prefixed each one's
  // key namespace.
  const dupKey = errors.filter((e) =>
    e.includes("two children with the same key")
  )
  expect(
    dupKey,
    `unexpected duplicate-key warnings: ${JSON.stringify(dupKey)}`
  ).toHaveLength(0)
})

// Bug 21 — team seed-data hygiene. createTeam now rejects duplicate
// names (not just keys). Empirically the runtime team list has 5
// canonical entries — Platform / Frontend / Infra / Legacy / Abhishek
// — without any "QA Test Team*" or "Pre-existing" artefacts that
// prior round-tests had stacked into in-memory state.
test("Team seed list has no duplicate or QA-artefact entries", async ({
  request,
}) => {
  const res = await request.get("http://localhost:3000/api/data/teams")
  expect(res.ok()).toBeTruthy()
  const teams = (await res.json()) as Array<{ id: string; name: string }>
  const names = teams.map((t) => t.name.toLowerCase())
  // No duplicates.
  expect(new Set(names).size).toBe(names.length)
  // No leaked test artefacts.
  for (const n of names) {
    expect(n).not.toBe("pre-existing")
    expect(n).not.toContain("qa test team")
  }
})

test("createTeam rejects duplicate name", async ({ request }) => {
  // Pick a known seed name and try to recreate it under a fresh key.
  const res = await request.post("http://localhost:3000/api/data/teams", {
    data: { name: "Platform", key: "PLT2" },
  })
  expect(res.status()).toBe(400)
  const body = (await res.json()) as { error?: string }
  expect(body.error?.toLowerCase()).toContain("name already exists")
})

// Bug 22 — Billing page reads the live plan and renders the matching
// plan title. On trial the title reads "Free trial" + "{n} days
// remaining"; the previous code hardcoded "Free plan".
test("Billing page reflects live plan API on trial", async ({ page }) => {
  await page.request.post("http://localhost:3000/api/billing/trial")
  await page.goto("http://localhost:3000/settings?section=billing", {
    waitUntil: "networkidle",
  })
  await page.waitForTimeout(300)

  // The "Current plan" card shows the live title — Free trial + days
  // remaining — and crucially does NOT still read "Free plan".
  await expect(page.locator("text=Free trial").first()).toBeVisible()
  await expect(page.locator("text=/days remaining/").first()).toBeVisible()
  // Sanity: the static "Free plan" hard-code is gone.
  await expect(page.locator("text=/^Free plan$/").first()).toHaveCount(0)
})
