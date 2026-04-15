import { test, expect, type APIRequestContext } from "@playwright/test"

// Regression test for the issue-counter collision bug, where new issues
// could be created with ids/keys that duplicated seeded data:
//   - `_nextIssueId` started at a literal 27, but seeded ids run to iss-379.
//   - `_nextIssueCounters` only knew SCRUM/KANB and fell back to 1 for real
//     project keys, so the first new PLAT issue got "PLAT-1" (clashing with
//     the seed conceptually) and `iss-27` (clashing exactly with seed iss-27).
// Fix: derive both counters from existing issues at module init.

const BOARD_PATH = "/projects/PLAT/board"

type Issue = {
  id: string
  key: string
  summary: string
  status: string
  projectId: string
}

async function resetStore(request: APIRequestContext) {
  const res = await request.post("/api/rl/reset", { data: {} })
  expect(res.ok(), "store reset must succeed").toBeTruthy()
}

async function fetchAllIssues(request: APIRequestContext): Promise<Issue[]> {
  const res = await request.get("/api/data/issues")
  expect(res.ok()).toBeTruthy()
  return (await res.json()) as Issue[]
}

function findDuplicates<T>(values: T[]): T[] {
  const seen = new Set<T>()
  const dups = new Set<T>()
  for (const v of values) {
    if (seen.has(v)) dups.add(v)
    else seen.add(v)
  }
  return [...dups]
}

test.beforeEach(async ({ request }) => {
  await resetStore(request)
})

test.describe("Issue creation — id and key uniqueness", () => {
  test("UI: creating 3 issues from the board produces no duplicate ids or keys", async ({
    page,
    request,
  }) => {
    await page.goto(BOARD_PATH)
    await expect(page.getByText("OPEN").first()).toBeVisible()

    const summaries = [
      "UI uniqueness test — alpha",
      "UI uniqueness test — bravo",
      "UI uniqueness test — charlie",
    ]

    for (const summary of summaries) {
      // The small "+" button in the OPEN column header opens the inline-create modal.
      await page.getByLabel("Create issue in OPEN").click()
      const input = page.getByPlaceholder("What needs to be done?")
      await expect(input).toBeVisible()
      await input.fill(summary)
      await input.press("Enter")
      // Modal closes after a successful create.
      await expect(input).toBeHidden()
      // New card appears in the OPEN column.
      await expect(
        page.locator('[data-column="Open"]').getByText(summary, { exact: true }),
      ).toBeVisible()
    }

    const issues = await fetchAllIssues(request)
    const ids = issues.map((i) => i.id)
    const keys = issues.map((i) => i.key)

    expect(findDuplicates(ids), "no duplicate issue ids").toEqual([])
    expect(findDuplicates(keys), "no duplicate issue keys").toEqual([])

    const created = issues.filter((i) => summaries.includes(i.summary))
    expect(created, "all 3 created issues are persisted").toHaveLength(3)
    // Each created issue must have a unique id and a unique key relative to the
    // entire store (already implied by the duplicate check, but assert directly
    // so a regression message points at the new issues).
    expect(new Set(created.map((i) => i.id)).size).toBe(3)
    expect(new Set(created.map((i) => i.key)).size).toBe(3)
  })

  test("API: creating 10 issues in one project yields unique ids and keys", async ({
    request,
  }) => {
    const created: Issue[] = []
    for (let i = 0; i < 10; i++) {
      const res = await request.post("/api/data/issues", {
        data: {
          summary: `API uniqueness test #${i}`,
          projectId: "proj-4",
          status: "Open",
        },
      })
      expect(res.ok(), `POST #${i} must succeed`).toBeTruthy()
      created.push((await res.json()) as Issue)
    }

    const ids = created.map((i) => i.id)
    const keys = created.map((i) => i.key)
    expect(findDuplicates(ids), "newly created ids unique among themselves").toEqual([])
    expect(findDuplicates(keys), "newly created keys unique among themselves").toEqual([])

    const all = await fetchAllIssues(request)
    expect(findDuplicates(all.map((i) => i.id)), "no duplicate ids in store").toEqual([])
    expect(findDuplicates(all.map((i) => i.key)), "no duplicate keys in store").toEqual([])
  })

  test("Counters resume past seeded data — first new PLAT issue is PLAT-80 / iss-380", async ({
    request,
  }) => {
    // Sanity-check the seeded baseline so this test's expectations stay
    // honest if the seed is ever regrown. Only consider numeric `iss-N` ids
    // and `PREFIX-N` keys — the seed also contains synthetic ids like
    // `iss-scrum-N` which the store's counter intentionally ignores.
    const seeded = await fetchAllIssues(request)
    const platKeys = seeded
      .filter((i) => i.projectId === "proj-4")
      .map((i) => /^PLAT-(\d+)$/.exec(i.key)?.[1])
      .filter((n): n is string => n !== undefined)
      .map(Number)
    const issIds = seeded
      .map((i) => /^iss-(\d+)$/.exec(i.id)?.[1])
      .filter((n): n is string => n !== undefined)
      .map(Number)
    const expectedNextKey = `PLAT-${Math.max(...platKeys) + 1}`
    const expectedNextId = `iss-${Math.max(...issIds) + 1}`

    const res = await request.post("/api/data/issues", {
      data: {
        summary: "first after seed",
        projectId: "proj-4",
        status: "Open",
      },
    })
    expect(res.ok()).toBeTruthy()
    const issue = (await res.json()) as Issue
    expect(issue.key).toBe(expectedNextKey)
    expect(issue.id).toBe(expectedNextId)
  })

  test("Multi-project: per-project keys and global ids both stay unique across projects", async ({
    request,
  }) => {
    // Each project's status must be valid for its own workflow, since the
    // store's createIssue defaults to "Open" which only PLAT accepts.
    const projects = [
      { id: "proj-4", expectedPrefix: "PLAT", status: "Open" },
      { id: "proj-5", expectedPrefix: "FAPP", status: "Backlog" },
      { id: "proj-6", expectedPrefix: "MOB", status: "Backlog" },
    ] as const

    const created: Issue[] = []
    for (const project of projects) {
      for (let i = 0; i < 3; i++) {
        const res = await request.post("/api/data/issues", {
          data: {
            summary: `multi-project ${project.expectedPrefix} #${i}`,
            projectId: project.id,
            status: project.status,
          },
        })
        expect(res.ok(), `POST ${project.expectedPrefix}#${i} must succeed`).toBeTruthy()
        const issue = (await res.json()) as Issue
        expect(issue.key.startsWith(`${project.expectedPrefix}-`)).toBeTruthy()
        created.push(issue)
      }
    }

    expect(created).toHaveLength(9)
    expect(findDuplicates(created.map((i) => i.id))).toEqual([])
    expect(findDuplicates(created.map((i) => i.key))).toEqual([])

    const all = await fetchAllIssues(request)
    expect(findDuplicates(all.map((i) => i.id)), "store has no duplicate ids").toEqual([])
    expect(findDuplicates(all.map((i) => i.key)), "store has no duplicate keys").toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Same regression class — every other entity in the store had a hard-coded
// `_nextXId` literal that could collide with seeded data. The fix derives
// each counter from existing items at module init and on reset, plus a
// defensive while-loop guard in each create function. These tests prove the
// fix and lock in the contract.
// ---------------------------------------------------------------------------

type WithId = { id: string }

async function fetchAll<T extends WithId>(
  request: APIRequestContext,
  endpoint: string,
): Promise<T[]> {
  const res = await request.get(`/api/data/${endpoint}`)
  expect(res.ok(), `GET /api/data/${endpoint} must succeed`).toBeTruthy()
  return (await res.json()) as T[]
}

function maxNumericSuffix<T extends WithId>(items: T[], prefix: string): number {
  const re = new RegExp(`^${prefix}-(\\d+)$`)
  let max = 0
  for (const item of items) {
    const m = re.exec(item.id)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n > max) max = n
    }
  }
  return max
}

test.describe("Goal creation — id uniqueness", () => {
  test("creating 5 goals yields unique ids that resume past seeded data", async ({
    request,
  }) => {
    const seeded = await fetchAll<WithId & { name: string }>(request, "goals")
    const seededMax = maxNumericSuffix(seeded, "goal")

    const created: WithId[] = []
    for (let i = 0; i < 5; i++) {
      const res = await request.post("/api/data/goals", {
        data: { name: `goal uniqueness test #${i}`, owner: "usr-1" },
      })
      expect(res.ok(), `POST goal #${i} must succeed`).toBeTruthy()
      created.push((await res.json()) as WithId)
    }

    // First new goal id must be greater than every seeded id.
    expect(parseInt(created[0].id.replace("goal-", ""), 10)).toBeGreaterThan(seededMax)
    // All 5 created ids unique.
    expect(findDuplicates(created.map((g) => g.id))).toEqual([])
    // Store-wide: no duplicate goal ids.
    const all = await fetchAll<WithId>(request, "goals")
    expect(findDuplicates(all.map((g) => g.id)), "no duplicate goal ids").toEqual([])
  })
})

test.describe("Team creation — id uniqueness", () => {
  test("creating 5 teams yields unique ids that resume past seeded data", async ({
    request,
  }) => {
    const seeded = await fetchAll<WithId & { name: string }>(request, "teams")
    const seededMax = maxNumericSuffix(seeded, "team")

    const created: WithId[] = []
    for (let i = 0; i < 5; i++) {
      const res = await request.post("/api/data/teams", {
        data: { name: `team uniqueness test #${i}` },
      })
      expect(res.ok(), `POST team #${i} must succeed`).toBeTruthy()
      created.push((await res.json()) as WithId)
    }

    expect(parseInt(created[0].id.replace("team-", ""), 10)).toBeGreaterThan(seededMax)
    expect(findDuplicates(created.map((t) => t.id))).toEqual([])
    const all = await fetchAll<WithId>(request, "teams")
    expect(findDuplicates(all.map((t) => t.id)), "no duplicate team ids").toEqual([])
  })
})

test.describe("Project creation — id uniqueness", () => {
  test("creating 3 projects yields unique ids that resume past seeded data", async ({
    request,
  }) => {
    const seeded = await fetchAll<WithId & { key: string }>(request, "projects")
    const seededMax = maxNumericSuffix(seeded, "proj")

    // Project keys must be globally unique — supply distinct keys per request
    // so the `Project key already exists` validation doesn't reject any.
    const created: (WithId & { key: string })[] = []
    for (let i = 0; i < 3; i++) {
      const res = await request.post("/api/data/projects", {
        data: {
          name: `project uniqueness test #${i}`,
          key: `PUT${i}`,
          type: "scrum",
        },
      })
      expect(res.ok(), `POST project #${i} must succeed`).toBeTruthy()
      created.push((await res.json()) as WithId & { key: string })
    }

    expect(parseInt(created[0].id.replace("proj-", ""), 10)).toBeGreaterThan(seededMax)
    expect(findDuplicates(created.map((p) => p.id))).toEqual([])
    expect(findDuplicates(created.map((p) => p.key))).toEqual([])
    const all = await fetchAll<WithId & { key: string }>(request, "projects")
    expect(findDuplicates(all.map((p) => p.id)), "no duplicate project ids").toEqual([])
    expect(findDuplicates(all.map((p) => p.key)), "no duplicate project keys").toEqual([])
  })
})

test.describe("Sprint creation — id uniqueness", () => {
  test("creating 4 sprints yields unique ids that resume past seeded data", async ({
    request,
  }) => {
    const seeded = await fetchAll<WithId & { name: string }>(request, "sprints")
    const seededMax = maxNumericSuffix(seeded, "sprint")

    const created: WithId[] = []
    for (let i = 0; i < 4; i++) {
      const res = await request.post("/api/data/sprints", {
        data: { name: `sprint uniqueness test #${i}`, projectId: "proj-4" },
      })
      expect(res.ok(), `POST sprint #${i} must succeed`).toBeTruthy()
      created.push((await res.json()) as WithId)
    }

    expect(parseInt(created[0].id.replace("sprint-", ""), 10)).toBeGreaterThan(seededMax)
    expect(findDuplicates(created.map((s) => s.id))).toEqual([])
    const all = await fetchAll<WithId>(request, "sprints")
    expect(findDuplicates(all.map((s) => s.id)), "no duplicate sprint ids").toEqual([])
  })
})
