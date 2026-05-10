/**
 * Playwright E2E for the global help (?) popover rendered in the
 * sidebar footer. Covers:
 *   1. Trigger opens the popover and renders the search input,
 *      core item list, and "What's new" group.
 *   2. Search input filters items case-insensitively.
 *   3. A search query with no matches surfaces "No results".
 *   4. "Settings" is an internal link to /settings and closes the
 *      popover when clicked.
 *   5. External items (Docs, Slack community, …) carry
 *      target="_blank" and rel="noopener noreferrer".
 *   6. The "Keyboard shortcuts" row opens the shortcuts side panel
 *      and dismisses the help popover.
 *   7. The custom `linear:open-help` window event opens the popover
 *      without clicking the trigger (covers `?` / `⌘/` shortcut).
 *   8. Escape closes the popover.
 */
import { expect, test, type Page } from "@playwright/test"

async function openHelp(page: Page) {
  await page.goto("/my-issues")
  const trigger = page.getByRole("button", { name: "Help", exact: true })
  await expect(trigger).toBeVisible()
  await trigger.click()
  // Search input is the first focused element in the open popover.
  await expect(page.getByPlaceholder("Help with…")).toBeVisible()
  return trigger
}

test.describe("Help popover", () => {
  test("trigger opens the popover with all sections", async ({ page }) => {
    await openHelp(page)

    // Core items.
    await expect(page.getByRole("link", { name: /^Docs$/ })).toBeVisible()
    await expect(page.getByRole("link", { name: /^Contact us$/ })).toBeVisible()
    await expect(
      page.getByRole("button", { name: /^Keyboard shortcuts/ })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /^Linear status$/ })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /^Download apps$/ })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: /^Settings/ })).toBeVisible()
    await expect(
      page.getByRole("link", { name: /^Slack community$/ })
    ).toBeVisible()

    // What's new heading + entries.
    await expect(page.getByText("What's new")).toBeVisible()
    await expect(page.getByRole("link", { name: /^Releases$/ })).toBeVisible()
    await expect(
      page.getByRole("link", { name: /^Linear Agent MCP support$/ })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /^Full changelog$/ })
    ).toBeVisible()

    // Visible shortcut hints on the rows that advertise them.
    await expect(
      page.getByRole("button", { name: /Keyboard shortcuts/ })
    ).toContainText("⌘/")
    await expect(page.getByRole("link", { name: /^Settings/ })).toContainText(
      "G then S"
    )
  })

  test("search input filters items case-insensitively", async ({ page }) => {
    await openHelp(page)
    const search = page.getByPlaceholder("Help with…")
    await search.fill("set")
    // "Settings" survives.
    await expect(page.getByRole("link", { name: /^Settings/ })).toBeVisible()
    // Items that don't match are gone.
    await expect(page.getByRole("link", { name: /^Docs$/ })).toHaveCount(0)
    await expect(
      page.getByRole("link", { name: /^Slack community$/ })
    ).toHaveCount(0)
    // Non-matching What's-new section is fully filtered out.
    await expect(page.getByText("What's new")).toHaveCount(0)
  })

  test("no-match query renders the 'No results' empty state", async ({
    page,
  }) => {
    await openHelp(page)
    await page.getByPlaceholder("Help with…").fill("zzznothing")
    await expect(page.getByText("No results")).toBeVisible()
    // No item rows render in either group.
    await expect(page.getByRole("link", { name: /^Docs$/ })).toHaveCount(0)
    await expect(page.getByRole("link", { name: /^Releases$/ })).toHaveCount(0)
  })

  test("Settings row navigates to /settings and closes the popover", async ({
    page,
  }) => {
    await openHelp(page)
    const settingsLink = page.getByRole("link", { name: /^Settings/ })
    // Internal link uses a relative href — Next.js handles the navigation.
    await expect(settingsLink).toHaveAttribute("href", "/settings")
    await settingsLink.click()
    await expect(page).toHaveURL(/\/settings/)
    // Popover closes on navigation; search input must be detached.
    await expect(page.getByPlaceholder("Help with…")).toHaveCount(0)
  })

  test("external rows carry target=_blank and rel=noopener noreferrer", async ({
    page,
  }) => {
    await openHelp(page)
    for (const name of [
      /^Docs$/,
      /^Contact us$/,
      /^Linear status$/,
      /^Download apps$/,
      /^Slack community$/,
      /^Releases$/,
      /^Linear Agent MCP support$/,
      /^Full changelog$/,
    ]) {
      const link = page.getByRole("link", { name })
      await expect(link).toHaveAttribute("target", "_blank")
      await expect(link).toHaveAttribute("rel", /noopener/)
      await expect(link).toHaveAttribute("rel", /noreferrer/)
    }
  })

  /**
   * Functional check for every external row: clicking actually opens a new
   * tab pointed at the documented URL. Both onClick handlers in the
   * component (`HelpRow` for items, the inline anchor for "What's new")
   * call `window.open` — this proves both code paths fire.
   *
   * Each entry is run in its own freshly-opened popover so a failure in
   * one row doesn't cascade into the next.
   */
  const EXTERNAL_ROWS: { name: RegExp; url: string }[] = [
    { name: /^Docs$/, url: "https://linear.app/docs" },
    { name: /^Contact us$/, url: "https://linear.app/contact" },
    { name: /^Linear status$/, url: "https://linearstatus.com" },
    { name: /^Download apps$/, url: "https://linear.app/download" },
    { name: /^Slack community$/, url: "https://linear.app/join-slack" },
    { name: /^Releases$/, url: "https://linear.app/releases" },
    {
      name: /^Linear Agent MCP support$/,
      url: "https://linear.app/changelog/linear-agent-mcp",
    },
    { name: /^Full changelog$/, url: "https://linear.app/changelog" },
  ]

  for (const { name, url } of EXTERNAL_ROWS) {
    test(`clicking '${url}' row opens a new tab to the right URL`, async ({
      page,
      context,
    }) => {
      await openHelp(page)
      const link = page.getByRole("link", { name })
      // Stub window.open so we can read what URL the row tried to open
      // without depending on real network egress in CI. The component's
      // click handler calls window.open BEFORE setOpen(false), so the
      // call lands on the original window object.
      const opened = await page.evaluateHandle(() => {
        const target: { url?: string; features?: string } = {}
        const original = window.open
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.open = ((u?: string | URL, _name?: string, f?: string) => {
          target.url = typeof u === "string" ? u : u?.toString()
          target.features = f
          return { closed: false } as Window
        }) as typeof window.open
        ;(window as unknown as { __restoreOpen: () => void }).__restoreOpen =
          () => {
            window.open = original
          }
        return target
      })
      await link.click()
      const captured = await opened.jsonValue()
      expect(captured.url).toBe(url)
      // Component requests a fresh, sandboxed tab.
      expect(captured.features).toContain("noopener")
      expect(captured.features).toContain("noreferrer")
      // Popover dismisses after navigation.
      await expect(page.getByPlaceholder("Help with…")).toHaveCount(0)
      await page.evaluate(() =>
        (window as unknown as { __restoreOpen?: () => void }).__restoreOpen?.()
      )
      // Suppress unused-binding lint without altering behavior.
      expect(context).toBeTruthy()
    })
  }

  test("Keyboard shortcuts row opens the shortcuts panel and dismisses the popover", async ({
    page,
  }) => {
    await openHelp(page)
    await page.getByRole("button", { name: /Keyboard shortcuts/ }).click()
    // Help popover dismisses…
    await expect(page.getByPlaceholder("Help with…")).toHaveCount(0)
    // …and the side panel comes up.
    await expect(page.getByTestId("keyboard-shortcuts-panel")).toBeVisible()
  })

  test("the linear:open-help event opens the popover without clicking the trigger", async ({
    page,
  }) => {
    await page.goto("/my-issues")
    // Sanity: popover starts closed.
    await expect(page.getByPlaceholder("Help with…")).toHaveCount(0)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("linear:open-help"))
    })
    await expect(page.getByPlaceholder("Help with…")).toBeVisible()
  })

  test("Escape closes the popover", async ({ page }) => {
    await openHelp(page)
    await page.keyboard.press("Escape")
    await expect(page.getByPlaceholder("Help with…")).toHaveCount(0)
  })
})
