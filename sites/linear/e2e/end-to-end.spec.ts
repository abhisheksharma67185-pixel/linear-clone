/**
 * End-to-end Playwright sweep covering both:
 *
 *   A. Creation flows (deep) — exercise the buttons that actually
 *      create things: issue (sidebar trigger → CreateIssueDialog),
 *      team (`/settings/new-team` form → POST /api/data/teams),
 *      project (CreateProjectDialog from /projects), view
 *      (`/views/new` inline editor → routes back).
 *
 *   B. Route smoke (wide) — visit every workspace route, assert the
 *      primary heading or empty-state renders so we catch
 *      build-time / hydration regressions across the whole app at
 *      once.
 *
 * No /api/sim/reset is issued — the mock backend keys all state on
 * a shared "default" session, and parallel resets race with each
 * other (a reset from one test wipes another test's freshly-created
 * row in between submit and assertion). Each creation test instead
 * uses a unique identifier (timestamp + random suffix) so its
 * assertion is independent of what other rows happen to exist.
 */
import { expect, test, type Page } from "@playwright/test"

// ----------------------------------------------------------------------------
// A. Creation flows
// ----------------------------------------------------------------------------

test.describe("Creation flows", () => {
  test("sidebar 'New issue' button opens the dialog and creates an issue", async ({
    page,
  }) => {
    await page.goto("/my-issues")

    // The dialog populates `teamId` only after `/api/data/teams`
    // resolves; CreateIssueDialog.handleCreate bails early when
    // `teamId` is null, so we wait for that fetch to complete
    // before the Create click. Triggering the click and the wait
    // together avoids a race in either direction.
    const teamsLoaded = page.waitForResponse((r) =>
      r.url().includes("/api/data/teams")
    )
    await page.getByRole("button", { name: "New issue", exact: true }).click()
    await teamsLoaded
    const titleInput = page.getByPlaceholder("Issue title")
    await expect(titleInput).toBeVisible()
    // Random title so this assertion is independent of parallel tests
    // (which share the "default" sim session and can reset state
    // mid-run). We check that *this* title surfaces in the API,
    // rather than comparing total counts.
    const title = `E2E sidebar issue ${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`
    await titleInput.fill(title)

    await page.getByRole("button", { name: "Create issue" }).click()

    // Dialog dismisses after success.
    await expect(titleInput).toHaveCount(0)

    // The mock backend persists the issue — poll the API until our
    // unique title appears.
    await expect
      .poll(
        async () => {
          const list = await fetchIssues(page)
          return list.some((i) => i.title === title)
        },
        { timeout: 5_000 }
      )
      .toBe(true)
  })

  test("`/settings/new-team` form creates a team and surfaces it on /teams", async ({
    page,
  }) => {
    await page.goto("/settings/new-team")
    // The auto-generated identifier is derived from the name; we
    // override it to a deterministic value the test owns.
    const suffix = String(Date.now()).slice(-4)
    const teamName = `E2E Team ${suffix}`
    const teamKey = `E${suffix}`.slice(0, 5)

    await page.getByLabel("Team name").fill(teamName)
    // Identifier field uses a <div> heading instead of <label
    // htmlFor>, and its placeholder ("e.g. ENG") is a substring of
    // the team-name placeholder ("e.g. Engineering"), so target it
    // by its DOM id. Clear-then-fill so we overwrite the
    // auto-generated identifier the form derives from the name as
    // it's typed.
    const idInput = page.locator("#team-identifier")
    await idInput.fill("")
    await idInput.fill(teamKey)

    const create = page.getByRole("button", { name: "Create team" })
    await expect(create).toBeEnabled()
    await create.click()

    // Form redirects to the new team — assert the URL changed and the
    // team is present on the /teams index.
    await page.waitForURL(/\/teams\//, { timeout: 10_000 })
    await page.goto("/teams")
    await expect(
      page.getByTestId("teams-grid").getByText(teamName).first()
    ).toBeVisible()
  })

  test("/projects '+' button opens CreateProjectDialog and submits", async ({
    page,
  }) => {
    await page.goto("/projects")
    // The "+" button in the header is the only icon-only button in
    // the projects header row — use the dialog's appearance as the
    // assertion rather than the trigger's selector.
    await page
      .locator("header button:has(svg)")
      .filter({ has: page.locator("svg") })
      .first()
      .click()

    const nameInput = page.getByPlaceholder("Project name")
    await expect(nameInput).toBeVisible()
    const projectName = `E2E project ${Date.now()}`
    await nameInput.fill(projectName)
    await page.getByPlaceholder("Add a short summary...").fill("smoke test")

    // CreateProjectDialog's submit is non-persistent in the mock — we
    // assert that the button is reachable and the dialog dismisses on
    // click. (The same pattern matches Linear's onboarding mock.)
    await page.getByRole("button", { name: "Create project" }).click()
    await expect(nameInput).toHaveCount(0)
  })

  test("/views/new inline editor save/cancel both route back to /views", async ({
    page,
  }) => {
    // Save path.
    await page.goto("/views/new")
    await page.getByTestId("new-view-name").fill(`E2E view ${Date.now()}`)
    await page.getByTestId("new-view-description").fill("smoke")
    await page.getByTestId("new-view-save").click()
    await page.waitForURL(/\/views$/, { timeout: 10_000 })

    // Cancel path.
    await page.goto("/views/new")
    await page.getByTestId("new-view-cancel").click()
    await page.waitForURL(/\/views$/, { timeout: 10_000 })
  })

  test("`?` filter dropdown on /teams/abh/archive can stack and clear filters", async ({
    page,
  }) => {
    await page.goto("/teams/abh/archive")
    // Open the filter popover via the filter pill on the header.
    await page.getByTestId("archive-filter").click()
    // Hover Status, then check "In Progress".
    await page.getByRole("button", { name: /^Status$/ }).hover()
    await page.getByRole("button", { name: /^In Progress$/ }).click()
    await page.keyboard.press("Escape")

    // Pill row appears with the Status chip.
    const pillBar = page.getByTestId("archive-filter-pillbar")
    await expect(pillBar).toBeVisible()
    await expect(pillBar.getByText("Status")).toBeVisible()

    // Remove the chip — pill bar disappears once empty.
    await page.getByRole("button", { name: /^Remove Status filter$/ }).click()
    await expect(page.getByTestId("archive-filter-pillbar")).toHaveCount(0)
  })
})

// ----------------------------------------------------------------------------
// B. Route smoke — every primary route renders without 500ing.
// ----------------------------------------------------------------------------
//
// Each entry: the URL to visit + a locator that proves the page hydrated.
// Locators avoid h1 text where possible (page titles are loose strings —
// `data-testid` and ARIA roles are sturdier). For pages with no stable
// testid we fall back to a known piece of header copy.

const ROUTE_SMOKE: { url: string; assert: (page: Page) => Promise<void> }[] = [
  {
    url: "/my-issues",
    assert: async (p) =>
      await expect(p.getByRole("button", { name: "New issue" })).toBeVisible(),
  },
  {
    url: "/inbox",
    assert: async (p) =>
      await expect(p.getByRole("heading", { name: /Inbox/i })).toBeVisible(),
  },
  {
    url: "/projects",
    assert: async (p) =>
      await expect(
        p.getByRole("heading", { name: "Projects", exact: true })
      ).toBeVisible(),
  },
  {
    url: "/views",
    assert: async (p) =>
      await expect(p.getByTestId("views-header-title")).toBeVisible(),
  },
  {
    url: "/cycles",
    assert: async (p) =>
      await expect(p.getByRole("heading", { name: /Cycles/i })).toBeVisible(),
  },
  {
    url: "/initiatives",
    assert: async (p) =>
      // Either the empty-state CTA or a populated grid is fine —
      // proving hydration is the goal.
      await expect(
        p
          .getByTestId("initiatives-empty-create")
          .or(p.getByRole("heading", { name: /Initiatives/i }))
      ).toBeVisible(),
  },
  {
    url: "/pulse",
    assert: async (p) =>
      await expect(p.getByRole("heading", { name: /Pulse/i })).toBeVisible(),
  },
  {
    url: "/teams",
    assert: async (p) => await expect(p.getByTestId("teams-new")).toBeVisible(),
  },
  {
    url: "/teams/abh/issues",
    assert: async (p) =>
      await expect(
        p.getByRole("heading", { name: /Issues|Active|Backlog/i }).first()
      ).toBeVisible(),
  },
  {
    url: "/teams/abh/archive",
    assert: async (p) =>
      await expect(p.getByTestId("archive-title")).toBeVisible(),
  },
  {
    url: "/search",
    assert: async (p) =>
      // Search route renders a search input — use its placeholder.
      await expect(p.getByPlaceholder(/search/i).first()).toBeVisible(),
  },
  {
    url: "/settings",
    assert: async (p) =>
      await expect(
        p
          .getByRole("heading", { name: /Settings|Preferences|Account/i })
          .first()
      ).toBeVisible(),
  },
  {
    url: "/settings/new-team",
    assert: async (p) => await expect(p.getByLabel("Team name")).toBeVisible(),
  },
]

test.describe("Route smoke", () => {
  for (const { url, assert } of ROUTE_SMOKE) {
    test(`${url} renders without errors`, async ({ page }) => {
      const responsePromise = page
        .waitForResponse(
          (r) =>
            r.url().endsWith(url) && r.request().resourceType() === "document",
          { timeout: 10_000 }
        )
        .catch(() => null)
      await page.goto(url)
      const doc = await responsePromise
      // 200/304 are healthy. 404 is acceptable for some templated
      // routes but not for the index pages we exercise here.
      if (doc) {
        const status = doc.status()
        expect(status, `${url} returned ${status}`).toBeLessThan(400)
      }
      await assert(page)
    })
  }
})

// ----------------------------------------------------------------------------
// C. Sidebar nav buttons — every primary nav row routes to its target.
// ----------------------------------------------------------------------------

test.describe("Sidebar navigation", () => {
  const NAV: { name: RegExp; url: RegExp }[] = [
    { name: /^Inbox$/, url: /\/inbox/ },
    { name: /^My issues$/, url: /\/my-issues/ },
    { name: /^Projects$/, url: /\/projects/ },
    { name: /^Views$/, url: /\/views/ },
  ]

  for (const { name, url } of NAV) {
    test(`clicking '${name.source}' navigates to ${url.source}`, async ({
      page,
    }) => {
      await page.goto("/my-issues")
      // Sidebar buttons render as <a> rendered through SidebarMenuButton.
      await page.getByRole("link", { name }).first().click()
      await expect(page).toHaveURL(url)
    })
  }

  test("'More' dropdown surfaces Members / Initiatives / Teams links", async ({
    page,
  }) => {
    await page.goto("/my-issues")
    await page.getByRole("button", { name: /^More$/ }).click()
    await expect(
      page.getByRole("menuitem", { name: /^Members$/ })
    ).toBeVisible()
    await expect(
      page.getByRole("menuitem", { name: /^Initiatives$/ })
    ).toBeVisible()
    await expect(page.getByRole("menuitem", { name: /^Teams$/ })).toBeVisible()
    // Click Initiatives — it routes.
    await page.getByRole("menuitem", { name: /^Initiatives$/ }).click()
    await expect(page).toHaveURL(/\/initiatives/)
  })

  test("Search button opens the search dialog", async ({ page }) => {
    await page.goto("/my-issues")
    await page.getByRole("button", { name: "Search", exact: true }).click()
    // SearchDialog renders an input with a "Search" placeholder.
    await expect(page.getByPlaceholder(/search/i).first()).toBeVisible()
    await page.keyboard.press("Escape")
  })
})

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

type IssueRecord = { id: string; title: string }

async function fetchIssues(page: Page): Promise<IssueRecord[]> {
  const res = await page.request.get("/api/data/issues")
  expect(res.ok()).toBe(true)
  return (await res.json()) as IssueRecord[]
}
