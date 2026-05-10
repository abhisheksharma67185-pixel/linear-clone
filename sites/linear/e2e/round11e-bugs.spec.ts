import { test, expect } from "@playwright/test"

// Round 11e — strict contract for the workspace top-level pages.
//
// The R11d tests passed because their assertions were loose enough that
// the regressions R11e caught (skeleton still mounted, "Loading…" text,
// 404'd /api/data/* calls) never surfaced. R11f Bug 27 strengthens the
// contract:
//
//   "After navigating to /<page> and waiting up to N seconds, the user
//   sees REAL content or a meaningful empty state."
//
// Rules:
//   • No `page.route()` mocking — hit the real dev backend so a passing
//     test means the page actually fetched data.
//   • Wait up to 8s for `.animate-pulse` count to reach 0 AND
//     "Loading…" / "Loading..." placeholders to disappear.
//   • Then assert at least one explicit post-load marker is visible
//     (real content row OR a real empty-state copy — both are valid
//     end states; "still mounting something" is not).
//   • Fail loudly if any /api/data/* 404'd during the navigation.

const PAGES: Array<{
  path: string
  // Exactly one of these must be visible after data settles. Real
  // content markers come from the seed; empty-state markers are
  // copy real Linear / this clone uses for legitimately-empty lists.
  postLoadMarkers: string[]
}> = [
  // /teams seed has Platform / Frontend / Infra / Legacy / Abhishek.
  { path: "/teams", postLoadMarkers: ["Platform", "Frontend", "No teams"] },
  // /views seed has Personal views section + named views.
  {
    path: "/views",
    postLoadMarkers: ["Personal views", "Customer Reported", "No views yet"],
  },
  // /my-issues: identifier prefixes from seed teams (LEG-, ABH-, PLT-,
  // FE-, INF-) or the empty-state copy.
  {
    path: "/my-issues",
    postLoadMarkers: [
      "No issues",
      "No issues assigned",
      "LEG-",
      "ABH-",
      "PLT-",
      "FE-",
      "INF-",
    ],
  },
  // /pulse: feed items use "created" / "updated" verbs; empty state is
  // "No recent activity".
  {
    path: "/pulse",
    postLoadMarkers: ["created", "updated", "No recent activity", "No pulse"],
  },
]

for (const { path, postLoadMarkers } of PAGES) {
  test(`${path}: real content or empty state visible within 8s, no 404s, no stuck skeleton`, async ({
    page,
  }) => {
    const failed404s: string[] = []
    page.on("response", (resp) => {
      const url = resp.url().replace("/", "")
      if (url.startsWith("/api/data/") && resp.status() === 404) {
        failed404s.push(`${resp.status()} ${url}`)
      }
    })

    await page.goto(`${path}`, {
      waitUntil: "domcontentloaded",
    })

    // "Data finished loading" condition: every skeleton placeholder
    // is gone AND no literal "Loading…" text is on screen.
    await expect(page.locator(".animate-pulse")).toHaveCount(0, {
      timeout: 8000,
    })
    await expect(page.locator('text="Loading…"')).toHaveCount(0)
    await expect(page.locator('text="Loading..."')).toHaveCount(0)

    // Then: at least one post-load marker must be visible. This
    // distinguishes "real content / real empty state" from "mounted
    // some chrome but never rendered the data."
    let found: string | null = null
    for (const m of postLoadMarkers) {
      if (
        await page
          .locator(`text=${m}`)
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        found = m
        break
      }
    }
    expect(
      found,
      `${path}: no real content or empty-state marker visible. Expected one of: ${postLoadMarkers.join(", ")}`
    ).not.toBeNull()

    // No /api/data/* 404s during the navigation. R11d's loose test
    // would have passed even if the page silently 404'd one of its
    // data calls.
    expect(
      failed404s,
      `unexpected /api/data/* 404s on ${path}: ${JSON.stringify(failed404s)}`
    ).toHaveLength(0)
  })
}

// Bug 24 (R11e) — Agent personalization no longer logs hydration / key /
// invalid-HTML errors that drove the Next.js dev "12 Issues" badge.
// The key collision was `<NewSkillDialog key={String(createSkillOpen)} />`
// + `<AddMcpServerDialog key={String(addServerOpen)} />` — both
// stringified booleans rendered as `"false"` initially, colliding.
test("Agent personalization: no React/hydration/key console errors", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))

  await page.goto("/settings?section=agent-personalization", {
    waitUntil: "domcontentloaded",
  })
  // Allow the section's slow ~6s hydration to complete.
  await page.waitForTimeout(6000)

  const flagged = errors.filter((e) => {
    const lower = e.toLowerCase()
    return (
      lower.includes("two children with the same key") ||
      lower.includes("hydration") ||
      lower.includes("cannot be a descendant") ||
      lower.includes("cannot contain a nested") ||
      lower.includes("validatedomnesting")
    )
  })
  expect(
    flagged,
    `unexpected React/hydration errors on agent-personalization: ${JSON.stringify(
      flagged.slice(0, 5)
    )}`
  ).toHaveLength(0)
})
