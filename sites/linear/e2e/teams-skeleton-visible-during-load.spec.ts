/**
 * Regression: hard-navigating to /teams used to render a fully blank
 * page for the duration of the data fetch (~1s on first paint).
 * The fix is `<TeamsGridSkeleton>` — six placeholder cards that
 * render while `loading` is true, swapped out for the real grid
 * once `/api/data/teams` and `/api/data/members` resolve.
 *
 * Combined with the workspace layout's `<Suspense fallback=
 * {<RoutePageSkeleton>}>` boundary, the user always sees structure,
 * never a black screen.
 *
 * This test stalls the teams API so the skeleton is observable.
 */
import { expect, test } from "@playwright/test"

test.describe("Teams page skeleton is visible during load", () => {
  test("skeleton renders before the data resolves, then is replaced", async ({
    page,
  }) => {
    // Stall the teams response just long enough to assert the
    // skeleton. 400ms is the same delay we use elsewhere.
    await page.route("**/api/data/teams", async (route) => {
      await new Promise((r) => setTimeout(r, 400))
      await route.continue()
    })

    await page.goto("/teams")
    // Skeleton appears (data-testid hook from TeamsGridSkeleton).
    await expect(page.getByTestId("teams-grid-skeleton")).toBeVisible({
      timeout: 1000,
    })
    // Real grid is NOT yet visible while loading.
    await expect(page.getByTestId("teams-grid")).toHaveCount(0)

    // Once the response lands, skeleton is removed and grid mounts.
    await expect(page.getByTestId("teams-grid")).toBeVisible({
      timeout: 5000,
    })
    await expect(page.getByTestId("teams-grid-skeleton")).toHaveCount(0)
  })
})
