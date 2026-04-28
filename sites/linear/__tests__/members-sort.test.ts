/**
 * Unit tests for the Members table comparator.
 *
 * The spec requires "treat null Last seen as the SMALLEST value to
 * keep ordering deterministic". The MembersSection previously had
 * an inline comparator whose comment claimed "treat as smallest" but
 * whose code returned `+1 * direction` on the null side — which is
 * "treat as largest". These tests pin the corrected contract so that
 * regression cannot reach production again.
 *
 * Two invariants we lock in:
 *   1. Direction-aware: nulls land at the top on ascending and at
 *      the bottom on descending.
 *   2. Antisymmetric: compare(a, b) === -compare(b, a) for any pair,
 *      which is what Array.sort relies on for stability.
 */
import { describe, expect, it } from "vitest"

import {
  compareByMembersColumn,
  compareNullSmallest,
} from "../lib/members-sort"

describe("compareNullSmallest", () => {
  it("treats null as smaller than any value (ascending: null first)", () => {
    expect(compareNullSmallest(null, "anything", 1)).toBeLessThan(0)
    expect(compareNullSmallest("anything", null, 1)).toBeGreaterThan(0)
    expect(compareNullSmallest(null, 0, 1)).toBeLessThan(0)
  })

  it("flips on descending (null last)", () => {
    expect(compareNullSmallest(null, "anything", -1)).toBeGreaterThan(0)
    expect(compareNullSmallest("anything", null, -1)).toBeLessThan(0)
  })

  it("returns 0 when both sides are null", () => {
    expect(compareNullSmallest(null, null, 1)).toBe(0)
    expect(compareNullSmallest(null, null, -1)).toBe(0)
  })

  it("compares numbers numerically (not lexicographically)", () => {
    // "10" vs "9" via localeCompare would put "10" before "9" — wrong.
    expect(compareNullSmallest(9, 10, 1)).toBeLessThan(0)
    expect(compareNullSmallest(10, 9, 1)).toBeGreaterThan(0)
    expect(compareNullSmallest(9, 10, -1)).toBeGreaterThan(0)
  })

  it("compares strings via localeCompare", () => {
    expect(compareNullSmallest("abc", "abd", 1)).toBeLessThan(0)
    expect(compareNullSmallest("abd", "abc", 1)).toBeGreaterThan(0)
  })

  it("is antisymmetric: compare(a,b) === -compare(b,a)", () => {
    const cases: [string | number | null, string | number | null][] = [
      ["alpha", "beta"],
      [null, "x"],
      [3, 7],
      [null, null],
      ["same", "same"],
    ]
    for (const [a, b] of cases) {
      for (const dir of [1, -1] as const) {
        const ab = compareNullSmallest(a, b, dir)
        const ba = compareNullSmallest(b, a, dir)
        // Use `===` rather than Math.sign-then-toBe because Vitest's
        // toBe is Object.is-strict, which distinguishes +0 from -0.
        // For an equal pair both sides return 0; for an unequal pair
        // the signs must oppose.
        const ok = ab === 0 ? ba === 0 : Math.sign(ab) === -Math.sign(ba)
        expect(
          ok,
          `antisymmetry broken for compare(${JSON.stringify(a)}, ${JSON.stringify(b)}) at dir=${dir}: got ab=${ab}, ba=${ba}`
        ).toBe(true)
      }
    }
  })

  it("sorting an array of nulls + values is deterministic", () => {
    // Two passes of the same input must produce the same output. If
    // the comparator is non-deterministic (e.g. a == null returning
    // different signs depending on order), `Array.sort` produces
    // different results across runs.
    const input = ["zebra", null, "apple", null, "mango"] as (string | null)[]
    const sortedAsc1 = [...input].sort((a, b) => compareNullSmallest(a, b, 1))
    const sortedAsc2 = [...input].sort((a, b) => compareNullSmallest(a, b, 1))
    expect(sortedAsc1).toEqual(sortedAsc2)
    // Nulls are smallest → top on ascending.
    expect(sortedAsc1.slice(0, 2)).toEqual([null, null])
    expect(sortedAsc1.slice(2)).toEqual(["apple", "mango", "zebra"])

    const sortedDesc = [...input].sort((a, b) => compareNullSmallest(a, b, -1))
    // Nulls float to the bottom on descending.
    expect(sortedDesc.slice(-2)).toEqual([null, null])
    expect(sortedDesc.slice(0, 3)).toEqual(["zebra", "mango", "apple"])
  })
})

describe("compareByMembersColumn", () => {
  type Row = {
    name: string
    email: string
    status: string
    teamCount: number
    joinedAt: string
    lastSeenAt: string | null
  }

  const rows: Row[] = [
    {
      name: "Priya",
      email: "priya@x",
      status: "active",
      teamCount: 3,
      joinedAt: "2024-01-01",
      lastSeenAt: "2026-04-25",
    },
    {
      name: "Arjun",
      email: "arjun@x",
      status: "active",
      teamCount: 1,
      joinedAt: "2024-06-15",
      lastSeenAt: null, // invited / never logged in
    },
    {
      name: "Meera",
      email: "meera@x",
      status: "invited",
      teamCount: 0,
      joinedAt: "2026-04-20",
      lastSeenAt: null,
    },
  ]

  it("sorts by lastSeenAt with nulls at the top on ascending", () => {
    const out = [...rows].sort((a, b) =>
      compareByMembersColumn(a, b, "lastSeenAt", 1)
    )
    // Both nulls first, then Priya's real date.
    expect(out.map((r) => r.name)).toEqual(["Arjun", "Meera", "Priya"])
  })

  it("sorts by teamCount numerically (descending)", () => {
    const out = [...rows].sort((a, b) =>
      compareByMembersColumn(a, b, "teamCount", -1)
    )
    expect(out.map((r) => r.teamCount)).toEqual([3, 1, 0])
  })

  it("sorts by name alphabetically (ascending)", () => {
    const out = [...rows].sort((a, b) =>
      compareByMembersColumn(a, b, "name", 1)
    )
    expect(out.map((r) => r.name)).toEqual(["Arjun", "Meera", "Priya"])
  })
})
