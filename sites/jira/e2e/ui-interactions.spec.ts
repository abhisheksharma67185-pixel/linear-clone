import { test, expect } from "@playwright/test"

// Regression tests for UI interactions that were silently broken:
//   - /projects Name column sort was decorative (no onClick, no state)
//   - /projects filter chips "X" removed the chip but didn't filter rows
//   - /dashboard activity tabs Viewed + Worked on both returned slices of
//     the same sorted feed, so switching tabs produced identical content
//
// Also locks in the selector discipline for /dashboard tabs — both the
// sidebar and the dashboard have a "Starred" button, so a naive
// `getByRole("button", { name: "Starred" })` grabs the sidebar one.

test.describe("/projects list interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects")
    // Wait for the spaces table to render.
    await expect(page.getByRole("heading", { name: "Spaces", exact: true })).toBeVisible()
    await expect(page.locator("tbody tr").first()).toBeVisible()
  })

  test("Name column header sorts alphabetically and toggles direction", async ({ page }) => {
    // The header button has visible text "Name" inside a <th>. The page
    // only has one such button so we can target it by role.
    const nameHeader = page.locator("th button", { hasText: "Name" })
    await expect(nameHeader).toBeVisible()

    const getNames = () =>
      page.locator("tbody tr td:nth-child(2) a").evaluateAll((nodes) =>
        (nodes as HTMLElement[]).map((el) =>
          el.textContent?.replace(/^[A-Z]{2}/, "").trim() ?? "",
        ),
      )

    // Default state: sortDir = "asc", so rows are already in ascending order.
    const initial = await getNames()
    expect(initial, "default asc order").toEqual(
      [...initial].sort((a, b) => a.localeCompare(b)),
    )

    // First click toggles to descending — reverse of initial.
    await nameHeader.click()
    const desc = await getNames()
    expect(desc, "descending after first click").toEqual([...initial].reverse())

    // Second click toggles back to ascending.
    await nameHeader.click()
    const ascAgain = await getNames()
    expect(ascAgain, "ascending after second click").toEqual(initial)

    // Sanity: desc and asc differ (no-op sort would fail this).
    expect(desc).not.toEqual(ascAgain)
  })

  test("filter chip X buttons actually filter the row list", async ({ page }) => {
    // Initial state: both chips active → all projects shown.
    const rows = page.locator("tbody tr")
    const initialCount = await rows.count()
    expect(initialCount, "seed has 9 projects visible").toBeGreaterThan(5)

    // Chip markup: <span>{label}<button><svg/></button></span>. Target the
    // span first so we can hide-assert on it after removal, then its button.
    const softwareChip = page
      .locator("span")
      .filter({ hasText: /^Jira - software spaces$/ })
    const softwareX = softwareChip.locator("button")
    const businessChip = page
      .locator("span")
      .filter({ hasText: /^Jira - business spaces$/ })
    const businessX = businessChip.locator("button")

    // Remove "software" chip → row count drops (only business/kanban projects remain).
    await softwareX.click()
    await expect(softwareChip).toBeHidden()
    const afterSoftware = await rows.count()
    expect(afterSoftware, "row count decreases when software chip removed").toBeLessThan(initialCount)
    // Every remaining row's Type cell should read "Team-managed business".
    const remainingTypes = await page.locator("tbody tr td:nth-child(4)").allInnerTexts()
    expect(remainingTypes.every((t) => /business/i.test(t))).toBe(true)

    // Remove "business" chip too → 0 data rows, only the empty-state row remains.
    await businessX.click()
    await expect(businessChip).toBeHidden()
    // The table shows an empty-state row; no tbody rows with project anchors.
    const remainingProjectLinks = await page.locator("tbody tr td:nth-child(2) a").count()
    expect(remainingProjectLinks, "no project rows when both chips removed").toBe(0)
  })
})

test.describe("/dashboard activity tabs", () => {
  // Selector note: there are TWO "Starred" buttons on /dashboard — one in the
  // sidebar that expands/collapses the Starred section, and one that's the
  // dashboard's activity tab. We target the tab specifically by its
  // `border-b-2` class (the tab button style). A naive
  // `getByRole("button", { name: "Starred" })` hits the sidebar button first.
  const tab = (page: ReturnType<typeof test.extend> extends never ? never : any, name: string) =>
    page.locator("button.border-b-2", { hasText: new RegExp(`^${name}$`) })

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.getByRole("heading", { name: "For you" })).toBeVisible()
    // Wait for the issue list to populate from /api/data/issues.
    await expect(page.locator('main [class*="cursor-pointer"]').first()).toBeVisible()
  })

  test("each of the 5 activity tabs renders different content", async ({ page }) => {
    const tabNames = ["Worked on", "Viewed", "Assigned to me", "Starred", "Boards"] as const

    // Capture issue keys visible in the main content after each tab click.
    // Boards tab shows project cards (no issue keys), so its fingerprint is empty.
    const captureKeys = async () =>
      page
        .locator('main p')
        .evaluateAll((nodes) =>
          (nodes as HTMLElement[])
            .map((p) => {
              const m = /^([A-Z]+-\d+) - /.exec(p.textContent?.trim() ?? "")
              return m ? m[1] : null
            })
            .filter((k): k is string => k !== null)
            .slice(0, 10),
        )

    const fingerprints: Record<string, string[]> = {}
    for (const name of tabNames) {
      const t = page.locator("button.border-b-2", { hasText: new RegExp(`^${name}$`) })
      await expect(t, `tab "${name}" visible`).toBeVisible()
      await t.click()
      // Give React a tick to re-render the activity feed.
      await page.waitForTimeout(300)
      fingerprints[name] = await captureKeys()
    }

    // All 5 tabs must produce distinct content fingerprints.
    const distinct = new Set(Object.values(fingerprints).map((v) => JSON.stringify(v)))
    expect(
      distinct.size,
      `expected 5 distinct tab fingerprints, got:\n${JSON.stringify(fingerprints, null, 2)}`,
    ).toBe(5)

    // Specific content checks tied to the seed data.
    // Worked on: user is assignee or reporter → should include SCRUM items.
    expect(fingerprints["Worked on"].some((k) => k.startsWith("SCRUM-"))).toBe(true)
    // Viewed: global recency feed → should include LCRM items (most recently updated).
    expect(fingerprints["Viewed"].some((k) => k.startsWith("LCRM-"))).toBe(true)
    // Assigned to me: only assignee=usr-1 (seed: SCRUM-1, SCRUM-2, SCRUM-3 are the only ones).
    expect(fingerprints["Assigned to me"].every((k) => k.startsWith("SCRUM-"))).toBe(true)
    // Starred: reporter=usr-1 AND assignee≠usr-1 → includes PLAT items where user reported.
    expect(fingerprints["Starred"].some((k) => k.startsWith("PLAT-"))).toBe(true)
    // Boards: no issue keys at all (project cards instead).
    expect(fingerprints["Boards"]).toEqual([])
  })
})
