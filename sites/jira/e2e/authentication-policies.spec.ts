import { test, expect } from "@playwright/test"

const PAGE_URL = "/admin/security/user-security/authentication-policies"

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_URL)
})

// ─── PAGE LOAD ──────────────────────────────────────────────────────────────

test.describe("Page Load", () => {
  test("loads with status 200", async ({ page }) => {
    const response = await page.goto(PAGE_URL)
    expect(response?.status()).toBe(200)
  })

  test("has correct URL path", async ({ page }) => {
    expect(new URL(page.url()).pathname).toBe(PAGE_URL)
  })

  // BUG (fixed): Page <title> was empty, then generic "Jira Clone" on all pages,
  //   then doubled "Administration - Jira Clone - Jira Clone".
  //   Now uses per-page metadata with admin template: "%s | Administration".
  test("page title is page-specific and not doubled", async ({ page }) => {
    const title = await page.title()
    expect(title).toContain("Authentication policies")
    expect(title).toContain("Administration")
    // Must NOT contain doubled suffix
    expect(title).not.toContain("Jira Clone - Jira Clone")
    expect(title).not.toContain("Jira Clone | Jira Clone")
  })

  test("main heading is visible with correct text", async ({ page }) => {
    const heading = page.getByRole("heading", {
      name: "Before you can set up authentication policies",
    })
    await expect(heading).toBeVisible()
  })
})

// ─── CONTENT ────────────────────────────────────────────────────────────────

test.describe("Content", () => {
  test("lock/key icon is rendered as SVG", async ({ page }) => {
    // Target the large lock illustration SVG in the main content (not header icons)
    const svg = page.locator("main svg, [class*='min-h'] svg").first()
    await expect(svg).toBeVisible()
  })

  test("description text is present", async ({ page }) => {
    const description = page.getByText(
      "verify ownership of your company domain",
      { exact: false },
    )
    await expect(description).toBeVisible()
  })

  test('"Verify domain" button is visible and enabled', async ({ page }) => {
    const button = page.locator('a[href="/admin/domains"]')
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
  })

  test('"Explore authentication policies" link is visible', async ({
    page,
  }) => {
    const link = page.locator('a[target="_blank"]')
    await expect(link).toBeVisible()
  })
})

// ─── INTERACTIONS ───────────────────────────────────────────────────────────

test.describe("Interactions", () => {
  // BUG: "Verify domain" was a bare <Button> with no onClick or href — did nothing on click
  //      (fixed: wrapped in <Link href="/admin/domains">)
  test('"Verify domain" navigates to /admin/domains', async ({ page }) => {
    const link = page.locator('a[href="/admin/domains"]')
    await link.click()
    await page.waitForURL("**/admin/domains")
    expect(page.url()).toContain("/admin/domains")
  })

  test('Domains page has correct heading after navigation', async ({ page }) => {
    const link = page.locator('a[href="/admin/domains"]')
    await link.click()
    await page.waitForURL("**/admin/domains")

    const heading = page.getByRole("heading").first()
    await expect(heading).toBeVisible()
    const text = (await heading.textContent()) ?? ""
    expect(text.match(/Domains|Level up your organization/)).toBeTruthy()
  })

  // BUG: "Explore authentication policies" was a <button> with no href or action
  //      (fixed: replaced with <a href="https://support.atlassian.com/..." target="_blank">)
  test('"Explore authentication policies" opens external link in new tab', async ({
    page,
  }) => {
    const link = page.locator('a[target="_blank"]')
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute("rel", /noopener/)
    await expect(link).toHaveAttribute("href", /atlassian\.com/)
  })
})

// ─── SIDEBAR NAVIGATION ────────────────────────────────────────────────────

test.describe("Sidebar Navigation", () => {
  test('"Overview" links to /admin', async ({ page }) => {
    const link = page.getByRole("link", { name: "Overview", exact: true })
    await expect(link).toHaveAttribute("href", "/admin")
  })

  test('"Security" section is expanded with sub-items', async ({ page }) => {
    const sidebar = page.locator("aside")
    // Sidebar sub-items have bullet prefixes (e.g. "•Authentication policies")
    // and some have badges appended, so use non-exact substring matching
    for (const item of [
      "Authentication policies",
      "External users",
      "Access policies",
      "Identity providers",
    ]) {
      await expect(sidebar.getByText(item).first()).toBeVisible()
    }
  })

  test('"Authentication policies" is highlighted as active with aria-current', async ({
    page,
  }) => {
    const activeLink = page.locator(
      'aside a[href="/admin/security/user-security/authentication-policies"]',
    )
    await expect(activeLink).toBeVisible()
    await expect(activeLink).toHaveClass(/blue/)
    await expect(activeLink).toHaveAttribute("aria-current", "page")
  })

  test('"External users" navigates to /admin/security/user-security/external-users', async ({
    page,
  }) => {
    const link = page.locator(
      'aside a[href="/admin/security/user-security/external-users"]',
    )
    await link.click()
    await page.waitForURL("**/external-users")
    expect(page.url()).toContain("/admin/security/user-security/external-users")
  })

  test('"Access policies" has "NEW" badge and correct href', async ({
    page,
  }) => {
    const link = page.locator(
      'aside a[href="/admin/security/user-security/access-policies"]',
    )
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute(
      "href",
      "/admin/security/user-security/access-policies",
    )
    // The badge text "NEW" is rendered inside or adjacent to the link
    await expect(link.getByText("NEW")).toBeVisible()
  })

  test('"Identity providers" navigates and renders provider cards', async ({
    page,
  }) => {
    const link = page.locator(
      'aside a[href="/admin/security/user-security/identity-providers"]',
    )
    await link.click()
    await page.waitForURL("**/identity-providers")
    expect(page.url()).toContain(
      "/admin/security/user-security/identity-providers",
    )
    // The page should render a grid of provider cards
    const cards = page.locator('[class*="grid"] [class*="border"][class*="rounded"]')
    expect(await cards.count()).toBeGreaterThanOrEqual(1)
  })

  test('"Billing" has href /admin/billing', async ({ page }) => {
    const link = page.getByRole("link", { name: "Billing", exact: true })
    await expect(link).toHaveAttribute("href", "/admin/billing")
  })
})

// ─── RESPONSIVE ─────────────────────────────────────────────────────────────

test.describe("Responsive", () => {
  test("at 768px, heading is still visible", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await page.goto(PAGE_URL)

    await expect(
      page.getByRole("heading", {
        name: "Before you can set up authentication policies",
      }),
    ).toBeVisible()
  })

  test("at 768px, Verify domain button is still visible", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await page.goto(PAGE_URL)

    await expect(
      page.locator('a[href="/admin/domains"]'),
    ).toBeVisible()
  })

  test("at 768px, sidebar is still visible (no collapse at this breakpoint)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await page.goto(PAGE_URL)

    const sidebar = page.locator("aside")
    await expect(sidebar).toBeVisible()
    await expect(sidebar.getByText("Overview", { exact: true })).toBeVisible()
  })

  test("at 1280px, sidebar is visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(PAGE_URL)

    const sidebar = page.locator("aside")
    await expect(sidebar).toBeVisible()
    await expect(
      sidebar.getByText("Overview", { exact: true }),
    ).toBeVisible()
  })

  // BUG (fixed): No hamburger/collapse on mobile — sidebar and content used to squish side-by-side.
  //   Now sidebar is hidden by default at ≤480px with a hamburger toggle.
  test("at 480px, heading is still visible", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    await page.goto(PAGE_URL)

    await expect(
      page.getByRole("heading", {
        name: "Before you can set up authentication policies",
      }),
    ).toBeVisible()
  })

  test("at 480px, Verify domain button is still visible", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    await page.goto(PAGE_URL)

    await expect(
      page.locator('a[href="/admin/domains"]'),
    ).toBeVisible()
  })

  test("at 480px, sidebar is hidden by default", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    await page.goto(PAGE_URL)

    const sidebar = page.locator("aside")
    await expect(sidebar).toBeHidden()
  })

  test("at 480px, hamburger button is visible with aria-label", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    await page.goto(PAGE_URL)

    const hamburger = page.getByLabel("Toggle navigation menu")
    await expect(hamburger).toBeVisible()
  })

  test("at 480px, hamburger opens sidebar overlay and updates aria-expanded", async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    await page.goto(PAGE_URL)

    const hamburger = page.getByLabel("Toggle navigation menu")
    await expect(hamburger).toHaveAttribute("aria-expanded", "false")

    await hamburger.click()
    await page.waitForTimeout(300)

    await expect(hamburger).toHaveAttribute("aria-expanded", "true")
    const sidebar = page.locator("aside")
    await expect(sidebar).toBeVisible()
    await expect(sidebar.getByText("Overview", { exact: true })).toBeVisible()
  })

  test("at 480px, clicking a sidebar link closes the overlay", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 480, height: 900 })
    await page.goto(PAGE_URL)

    const hamburger = page.getByLabel("Toggle navigation menu")
    await hamburger.click()
    await page.waitForTimeout(300)

    const sidebar = page.locator("aside")
    await expect(sidebar).toBeVisible()

    // Click a nav link
    await sidebar.getByText("Overview", { exact: true }).click()
    await page.waitForTimeout(300)
    await expect(sidebar).toBeHidden()
  })
})

// ─── ACCESS POLICIES PAGE CRASH ─────────────────────────────────────────────

// BUG (mitigated): Access-policies page intermittently returned 503.
//   Added loading.tsx, error.tsx error boundary with Retry button, and
//   fixed <a><button> nesting that could cause hydration errors.
test.describe("Access Policies Page", () => {
  test("page responds within 10 seconds", async ({ page }) => {
    test.slow()
    await page.goto("/admin/security/user-security/access-policies", {
      waitUntil: "networkidle",
      timeout: 10_000,
    })
    await page.waitForLoadState("domcontentloaded", { timeout: 10_000 })
    const heading = page.getByRole("heading", { name: "Access policies", exact: true })
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test("no interactive elements nested inside links", async ({ page }) => {
    await page.goto("/admin/security/user-security/access-policies", {
      waitUntil: "networkidle",
    })
    const nested = page.locator("a button, a [role='button']")
    expect(await nested.count()).toBe(0)
  })

  test("Learn more link navigates to security guide", async ({ page }) => {
    await page.goto("/admin/security/user-security/access-policies", {
      waitUntil: "networkidle",
    })
    const link = page.getByRole("link", { name: "Learn more" })
    await expect(link).toBeVisible()
    await link.click()
    await page.waitForURL("**/security-guide")
    expect(page.url()).toContain("/admin/security/security-guide")
  })
})

// ─── SEARCH BAR ────────────────────────────────────────────────────────────

// BUG (fixed): Search bar previously accepted input but showed no dropdown.
//   Now filters admin nav items and renders a role="listbox" dropdown.
test.describe("Search Bar", () => {
  test("search input is visible in the header", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search")
    await expect(searchInput).toBeVisible()
  })

  test("clicking search input gives it focus", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search")
    await searchInput.click()
    await expect(searchInput).toBeFocused()
  })

  test('typing "auth" puts text in the input', async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search")
    await searchInput.click()
    await searchInput.fill("auth")
    await expect(searchInput).toHaveValue("auth")
  })

  test('typing "auth" shows results dropdown with matching items', async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search")
    await searchInput.click()
    await searchInput.fill("auth")
    await page.waitForTimeout(300)

    const listbox = page.locator('[role="listbox"]')
    await expect(listbox).toBeVisible()
    await expect(listbox.getByRole("option")).toHaveCount(1)
    await expect(
      listbox.getByRole("option").first(),
    ).toContainText("Authentication policies")
  })

  test("clicking a search result navigates to that page", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Search")
    await searchInput.click()
    await searchInput.fill("Billing")
    await page.waitForTimeout(300)

    const option = page.locator('[role="option"]').first()
    await option.click()
    await page.waitForURL("**/admin/billing")
    expect(page.url()).toContain("/admin/billing")
  })

  test("pressing Escape closes the dropdown", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search")
    await searchInput.click()
    await searchInput.fill("users")
    await page.waitForTimeout(300)
    await expect(page.locator('[role="listbox"]')).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator('[role="listbox"]')).not.toBeVisible()
  })

  test("clicking outside closes the dropdown", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search")
    await searchInput.click()
    await searchInput.fill("users")
    await page.waitForTimeout(300)
    await expect(page.locator('[role="listbox"]')).toBeVisible()

    // Click the page heading (outside the search bar)
    await page.getByRole("heading").first().click()
    await expect(page.locator('[role="listbox"]')).not.toBeVisible()
  })
})

// ─── ACCESSIBILITY ──────────────────────────────────────────────────────────

test.describe("Accessibility", () => {
  test('"Verify domain" has accessible text', async ({ page }) => {
    const link = page.locator('a[href="/admin/domains"]')
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("aria-label", /verify/i)
  })

  test("page has at least one heading", async ({ page }) => {
    const headings = page.getByRole("heading")
    expect(await headings.count()).toBeGreaterThanOrEqual(1)
  })

  test("no images with missing alt text", async ({ page }) => {
    const imgsMissingAlt = page.locator("img:not([alt])")
    expect(await imgsMissingAlt.count()).toBe(0)
  })

  // BUG: "Verify domain" was a <button> nested inside <a> (invalid HTML per W3C spec).
  //      Clicks on the inner <button> did not bubble to the <a>, so navigation never fired.
  //      (fixed: replaced with a single <Link> styled as a button)
  test("no interactive elements nested inside links (valid HTML)", async ({
    page,
  }) => {
    const nestedButtons = page.locator("a button, a [role='button']")
    expect(await nestedButtons.count()).toBe(0)
  })

  // BUG (fixed): Zero aria-label attributes existed on interactive elements.
  //   Added aria-labels to all icon-only header controls.
  test("header icon buttons have aria-labels", async ({ page }) => {
    const header = page.locator("header")

    for (const label of [
      "Toggle navigation menu",
      "Go back",
      "Go forward",
      "App switcher",
      "Search administration",
      "Notifications",
      "Help",
      "User profile",
    ]) {
      await expect(header.locator(`[aria-label="${label}"]`)).toHaveCount(1)
    }
  })

  test("sidebar collapse button has aria-label", async ({ page }) => {
    const collapseBtn = page.locator("header").locator(
      '[aria-label="Collapse sidebar"], [aria-label="Expand sidebar"]',
    )
    await expect(collapseBtn).toHaveCount(1)
  })

  // BUG (fixed): "Verify domain" and "Explore authentication policies" links had aria-label=null
  test("page content links have aria-labels", async ({ page }) => {
    const verifyLink = page.locator('a[href="/admin/domains"]')
    await expect(verifyLink).toHaveAttribute("aria-label", /verify/i)

    const exploreLink = page.locator('a[target="_blank"]')
    await expect(exploreLink).toHaveAttribute("aria-label", /authentication policies/i)
  })
})
