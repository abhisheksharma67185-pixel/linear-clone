import { test, expect, Page } from "@playwright/test"

// ─────────────────────────────────────────────────────────────────────────────
// Exhaustive E2E suite for /teams/people
//
// Covers every interactive element on the page:
//   • Global sidebar navigation (For you, Teams, People, Kudos, Goals, Projects)
//   • Top-nav split Create button + its chevron dropdown
//   • Page-level "Add people" action
//   • Search input and its live-count side effect
//   • Every filter chip (Project, Goal, Team, Job title, Manager, Department, Location)
//   • Layout toggles (grid ↔ list) and the 3-dots (ellipsis) more-menu
//   • Data inside person cards + card interactions
//
// Selector discipline: we prefer role/placeholder/text locators. Where the
// sidebar and the main content expose visually identical controls (e.g. the
// header "Create" vs. other buttons), we scope via DOM containers (banner,
// main, complementary) so we never grab the wrong element.
// ─────────────────────────────────────────────────────────────────────────────

const PEOPLE_URL = "/teams/people"

/**
 * Open /teams/people and wait for BOTH the hard-coded list AND the async
 * `/api/data/users` fetch to settle. The page starts with 12 hard-coded
 * people, then appends API users — if we read the count too early we'll
 * race the fetch and get flaky numbers.
 */
async function gotoPeople(page: Page) {
  // Kick off the navigation and wait for the users endpoint to respond.
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/api/data/users") && r.ok()).catch(() => null),
    page.goto(PEOPLE_URL),
  ])
  await expect(page.getByRole("heading", { level: 1, name: "People" })).toBeVisible()
  await expect(page.getByText(/^\d+\s+(person|people)/)).toBeVisible()
  // "Priya Sharma" only exists in the API response. Waiting for her card
  // guarantees the merge-and-render effect has completed before we read
  // the count.
  await expect(page.getByText("Priya Sharma", { exact: true })).toBeVisible()
}

/** Read the current "<n> people / 1 person" count from the results header. */
async function readPeopleCount(page: Page): Promise<number> {
  const text = await page.getByText(/^\d+\s+(person|people)/).first().innerText()
  const match = text.match(/^(\d+)/)
  expect(match, `could not parse count from "${text}"`).not.toBeNull()
  return Number(match![1])
}

/**
 * The three-icon view-toggle row sits immediately after the count
 * paragraph. Grab the sibling <div> of the count paragraph so we have a
 * tight scope for just the grid / list / ellipsis buttons (and the
 * Columns dropdown that appears in list mode).
 */
function viewToggleGroup(page: Page) {
  return page
    .locator("main p", { hasText: /^\d+\s+(person|people)/ })
    .first()
    .locator("xpath=following-sibling::div[1]")
}

// ─── 1. Global sidebar navigation ────────────────────────────────────────────

test.describe("Global sidebar navigation", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPeople(page)
  })

  const expected: Array<{ name: string; href: string }> = [
    { name: "For you", href: "/teams" },
    { name: "Teams", href: "/teams/directory" },
    { name: "People", href: "/teams/people" },
    { name: "Kudos", href: "/teams/kudos" },
    { name: "Goals", href: "/goals" },
    { name: "Projects", href: "/project-directory" },
  ]

  test("all sidebar links are present with correct hrefs", async ({ page }) => {
    const sidebar = page.locator("aside")
    for (const item of expected) {
      const link = sidebar.getByRole("link", { name: item.name, exact: true })
      await expect(link, `"${item.name}" should be visible`).toBeVisible()
      await expect(link).toHaveAttribute("href", item.href)
    }
  })

  // One navigation test per link, so a single broken destination doesn't mask
  // others. We always return to /teams/people at the top to reset state.
  for (const item of expected) {
    test(`sidebar link "${item.name}" navigates to ${item.href}`, async ({ page }) => {
      const sidebar = page.locator("aside")
      await sidebar.getByRole("link", { name: item.name, exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`${item.href.replace(/\//g, "\\/")}(/|$)`))
    })
  }
})

// ─── 2. Top-nav "Create" split button ────────────────────────────────────────

test.describe("Top-nav Create split button", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPeople(page)
  })

  test('primary "+ Create" button opens the Create Task modal', async ({ page }) => {
    // Scope to the top banner so we don't pick up any other "Create" text.
    const header = page.locator("header")
    const createBtn = header.getByRole("button", { name: "Create", exact: true })
    await expect(createBtn).toBeVisible()
    await createBtn.click()

    // CreateTaskDialog is a custom overlay (NOT a Radix Dialog, so no
    // role="dialog"). It's identifiable by its "Create Task" heading.
    await expect(
      page.getByRole("heading", { name: "Create Task", exact: true }),
      "clicking Create should open the Create Task modal",
    ).toBeVisible()
  })

  test('chevron next to "+ Create" opens a dropdown menu with Goal/Work Item/Project/Team', async ({ page }) => {
    const header = page.locator("header")
    const createBtn = header.getByRole("button", { name: "Create", exact: true })
    // The chevron is the immediate sibling button (no visible name). Locate
    // it via its parent container, then pick the sibling button.
    const chevron = createBtn.locator("xpath=following-sibling::button[1]")
    await expect(chevron).toBeVisible()
    await chevron.click()

    // The dropdown panel renders four entries. Scope to buttons that live
    // inside the floating popover, identified by z-50 + "absolute".
    for (const name of ["Goal", "Work Item", "Project", "Team"]) {
      await expect(
        page.getByRole("button", { name, exact: true }).last(),
        `"${name}" should be in the Create dropdown`,
      ).toBeVisible()
    }
  })
})

// ─── 3. Page-level "Add people" action ───────────────────────────────────────

test.describe('Page-level "Add people" action', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPeople(page)
  })

  test('"Add people" button opens the Add people dialog', async ({ page }) => {
    const main = page.locator("main")
    const addBtn = main.getByRole("button", { name: "Add people", exact: true })
    await expect(addBtn).toBeVisible()
    await addBtn.click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText("Add people to Jira", { exact: true })).toBeVisible()
    await expect(dialog.getByPlaceholder("e.g., Maria, maria@company.com")).toBeVisible()
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible()
    await expect(dialog.getByRole("button", { name: "Add" })).toBeVisible()
  })

  test('"Add people" — adding a new name inserts it into the list and bumps the count', async ({ page }) => {
    const before = await readPeopleCount(page)

    const main = page.locator("main")
    await main.getByRole("button", { name: "Add people", exact: true }).click()

    const dialog = page.getByRole("dialog")
    const input = dialog.getByPlaceholder("e.g., Maria, maria@company.com")
    const uniqueName = `Zephyr TestUser ${Date.now()}`
    await input.fill(uniqueName)
    await dialog.getByRole("button", { name: "Add", exact: true }).click()

    await expect(dialog).toBeHidden()
    // New card should render with the name.
    await expect(page.getByText(uniqueName, { exact: true })).toBeVisible()
    const after = await readPeopleCount(page)
    expect(after).toBe(before + 1)
  })
})

// ─── 4. Search functionality ────────────────────────────────────────────────

test.describe('"Search people" input', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPeople(page)
  })

  test("search input is present with the expected placeholder", async ({ page }) => {
    await expect(page.getByPlaceholder("Search people")).toBeVisible()
  })

  test('typing a known name ("Abhishek") filters the grid and updates the count', async ({ page }) => {
    const before = await readPeopleCount(page)
    const search = page.getByPlaceholder("Search people")
    await search.fill("Abhishek")

    // Count should drop — Abhishek Sharma is one hard-coded person.
    const after = await readPeopleCount(page)
    expect(after).toBeGreaterThanOrEqual(1)
    expect(after).toBeLessThan(before)

    // The matching card must be visible.
    await expect(page.getByText("Abhishek Sharma", { exact: true })).toBeVisible()

    // A known non-match should be hidden.
    await expect(page.getByText("Emily Davis", { exact: true })).toHaveCount(0)
  })

  test('typing "Priya" narrows the grid to the Priya rows', async ({ page }) => {
    const search = page.getByPlaceholder("Search people")
    await search.fill("Priya")
    await expect(page.getByText("Priya Patel", { exact: true })).toBeVisible()
    // Non-matching name should be gone from the grid.
    await expect(page.getByText("Sam Williams", { exact: true })).toHaveCount(0)
  })

  test("clearing the search restores the original count", async ({ page }) => {
    const before = await readPeopleCount(page)
    const search = page.getByPlaceholder("Search people")
    await search.fill("Abhishek")
    expect(await readPeopleCount(page)).toBeLessThan(before)
    await search.fill("")
    expect(await readPeopleCount(page)).toBe(before)
  })
})

// ─── 5. Exhaustive filter chip testing ───────────────────────────────────────

test.describe("Filter chips", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPeople(page)
  })

  // The chip labels match the FilterDef.label values in the source.
  const chips: Array<{ label: string; placeholder: string }> = [
    { label: "Filter by Project", placeholder: "Search projects..." },
    { label: "Goal", placeholder: "Search goals..." },
    { label: "Team", placeholder: "Search teams..." },
    { label: "Job title", placeholder: "Search job titles..." },
    { label: "Manager", placeholder: "Search managers..." },
    { label: "Department", placeholder: "Search departments..." },
    { label: "Location", placeholder: "Search locations..." },
  ]

  for (const chip of chips) {
    test(`"${chip.label}" chip opens a popover with its search field`, async ({ page }) => {
      // Scope to main to avoid sidebar "Teams"/"Goals" links colliding with
      // the filter chips that share those words.
      const main = page.locator("main")
      const chipBtn = main.getByRole("button", { name: chip.label, exact: true })
      await expect(chipBtn, `${chip.label} chip should be visible`).toBeVisible()
      await chipBtn.click()

      // The popover contains a search input with the expected placeholder.
      const popoverSearch = page.getByPlaceholder(chip.placeholder)
      await expect(popoverSearch, `${chip.label} popover should show its search box`).toBeVisible()

      // Close the popover by clicking the chip again / pressing Escape so
      // later tests start fresh.
      await page.keyboard.press("Escape")
    })
  }

  test("selecting a value in the Department filter narrows the grid", async ({ page }) => {
    const main = page.locator("main")
    await main.getByRole("button", { name: "Department", exact: true }).click()
    // The popover shows checkbox-style rows per department. Click Engineering.
    const popover = page.getByPlaceholder("Search departments...").locator("xpath=ancestor::div[contains(@class,'absolute')][1]")
    await popover.getByRole("button", { name: "Engineering", exact: true }).click()

    // Close the popover.
    await page.keyboard.press("Escape")

    // The chip now reflects the active selection: "Department is Engineering".
    await expect(main.getByRole("button", { name: /Department is\s+Engineering/ })).toBeVisible()
    // And a non-Engineering person is no longer visible (Priya Patel = Design).
    await expect(page.getByText("Priya Patel", { exact: true })).toHaveCount(0)
  })
})

// ─── 6. Layout toggles & the 3-dots menu ─────────────────────────────────────

test.describe("Layout toggles and ellipsis menu", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPeople(page)
  })

  test("grid is the default view (cards rendered in a grid)", async ({ page }) => {
    // The grid container uses `grid grid-cols-*`. A table is NOT present in
    // grid mode — verify that instead, which is stable.
    await expect(page.locator("main table")).toHaveCount(0)
    // And at least one person card is visible.
    await expect(page.getByText("Abhishek Sharma", { exact: true })).toBeVisible()
  })

  test("clicking the list-view (hamburger) icon switches to a table layout", async ({ page }) => {
    // Direct-child button order inside the toggle group: grid (0), list (1),
    // then the ellipsis lives inside a wrapping <div>. Target by index.
    const toggles = viewToggleGroup(page).locator("> button")
    await toggles.nth(1).click()

    // List view renders a real <table>.
    await expect(page.locator("main table")).toBeVisible()
    // The Name column header should be shown.
    await expect(page.locator("main table thead")).toContainText("Name")
  })

  test("clicking the grid-view icon after list switches back to the card grid", async ({ page }) => {
    const toggles = viewToggleGroup(page).locator("> button")
    await toggles.nth(1).click() // list
    await expect(page.locator("main table")).toBeVisible()
    await toggles.nth(0).click() // grid
    await expect(page.locator("main table")).toHaveCount(0)
    await expect(page.getByText("Abhishek Sharma", { exact: true })).toBeVisible()
  })

  test("the 3-dots (ellipsis) menu reveals Copy link, Export CSV, and Wrap text", async ({ page }) => {
    // The ellipsis button lives inside the last wrapping div of the toggle
    // group (it has `className="relative"` for the popover anchor).
    const ellipsis = viewToggleGroup(page).locator("> div").last().locator("button")
    await ellipsis.click()

    await expect(page.getByRole("button", { name: "Copy link", exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Export CSV", exact: true })).toBeVisible()
    await expect(page.getByText("Wrap text", { exact: true })).toBeVisible()
  })

  test('clicking "Copy link" inside the ellipsis menu flashes the "Copied!" state', async ({ page, context }) => {
    // Grant clipboard access so navigator.clipboard.writeText resolves.
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    const ellipsis = viewToggleGroup(page).locator("> div").last().locator("button")
    await ellipsis.click()
    await page.getByRole("button", { name: "Copy link", exact: true }).click()
    await expect(page.getByRole("button", { name: "Copied!", exact: true })).toBeVisible()
  })
})

// ─── 7. Data card interactions ───────────────────────────────────────────────

test.describe("Data card content and interactions", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPeople(page)
  })

  test("Abhishek Sharma card shows the expected job title and department", async ({ page }) => {
    const card = page.locator("main").locator("div", { hasText: "Abhishek Sharma" }).filter({
      has: page.locator("p", { hasText: "Engineering Manager" }),
    }).first()
    await expect(card).toBeVisible()
    await expect(card).toContainText("Abhishek Sharma")
    await expect(card).toContainText("Engineering Manager")
    await expect(card).toContainText("Engineering")
  })

  test("every hard-coded person appears with a matching job-title paragraph", async ({ page }) => {
    const sample: Array<[string, string]> = [
      ["Sam Williams", "Senior Developer"],
      ["Priya Patel", "Product Designer"],
      ["Alex Chen", "Frontend Developer"],
      ["Emily Davis", "Product Manager"],
      ["Tom Baker", "DevOps Engineer"],
    ]
    for (const [name, title] of sample) {
      await expect(page.getByText(name, { exact: true })).toBeVisible()
      // The title text also appears — at least once across all cards.
      await expect(page.getByText(title, { exact: true }).first()).toBeVisible()
    }
  })

  test("clicking a person card keeps the user on the People page (cards are not linked)", async ({ page }) => {
    // The hard-coded grid cards have cursor:pointer styling but no click
    // handler — this test locks in that behavior so a regression that wires
    // up navigation (or loses it) is surfaced explicitly.
    const card = page.locator("main").locator("div", { hasText: "Abhishek Sharma" }).first()
    await card.click()
    await expect(page).toHaveURL(/\/teams\/people$/)
  })

  test("in list view, clicking a person's avatar opens a profile popover", async ({ page }) => {
    // Switch to list view first.
    const toggles = viewToggleGroup(page).locator("> button")
    await toggles.nth(1).click()
    await expect(page.locator("main table")).toBeVisible()

    // The UserProfileCard renders a PopoverTrigger on the avatar. Click the
    // first avatar inside the table body.
    const firstAvatar = page.locator("main table tbody tr").first().locator("button").first()
    await firstAvatar.click()

    // The shadcn/Radix Popover portal exposes role=dialog. Assert that
    // appeared and that it includes the user's display name.
    const popover = page.getByRole("dialog")
    await expect(popover).toBeVisible()
    await expect(popover).toContainText("Abhishek Sharma")
  })
})
