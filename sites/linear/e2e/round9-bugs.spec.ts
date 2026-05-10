import { test, expect } from "@playwright/test"

// Round 9 — every "use client" route under /settings (and the broader
// workspace) must carry an SSR `<title>` so the browser tab doesn't
// fall back to the URL during the F5 → JS-load gap. Round 7 fixed
// /settings/integrations/[slug]; round 8 fixed the workspace top-level
// routes; this round closes the remaining gaps under /settings.
//
// Each entry: a path, plus the literal `<title>` to expect from the
// initial SSR HTML response. Dynamic-segment routes use a synthetic
// id ("abc", "ABH") that the layout's generateMetadata accepts.
const ROUTES: Array<{ path: string; expected: string }> = [
  // Template editors — six routes (document/project/issue × new/edit).
  {
    path: "/settings/templates/document/new",
    expected: "New document template",
  },
  {
    path: "/settings/templates/document/abc",
    expected: "Edit document template",
  },
  {
    path: "/settings/templates/project/new",
    expected: "New project template",
  },
  {
    path: "/settings/templates/project/abc",
    expected: "Edit project template",
  },
  { path: "/settings/templates/issue/new", expected: "New issue template" },
  { path: "/settings/templates/issue/abc", expected: "Edit issue template" },

  // Team-hub routes — generateMetadata derives the title from the
  // [key] segment so the tab disambiguates multiple open hubs.
  { path: "/settings/teams/ABH", expected: "ABH · Team settings" },
  { path: "/settings/teams/ABH/templates", expected: "ABH · Team settings" },

  // Import & export migration-assistant detail page.
  {
    path: "/settings/import-export/migration-assistant",
    expected: "Migration assistant",
  },
]

for (const { path, expected } of ROUTES) {
  test(`tab title for ${path} reads "${expected}"`, async ({ page }) => {
    const response = await page.goto(`${path}`, {
      waitUntil: "commit",
    })
    expect(response?.ok()).toBeTruthy()
    const html = await response!.text()
    const m = html.match(/<title[^>]*>([^<]*)<\/title>/)
    expect(m, `SSR HTML for ${path} must contain <title>`).not.toBeNull()
    expect(m![1]).toBe(expected)
  })
}
