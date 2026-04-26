/**
 * Unit tests for the initials-avatar pure helpers.
 *
 * The spec requires deterministic colours from user id/email so the
 * same user always gets the same disc colour everywhere. These
 * tests pin:
 *   - The hash → palette index mapping is stable across calls.
 *   - Initials extraction handles single-name, multi-name, empty,
 *     and unicode-ish inputs.
 *   - Two distinct seeds reliably hit (mostly) different colours
 *     across the small palette — sanity check, not a uniqueness
 *     guarantee.
 */
import { describe, expect, it } from "vitest"

import {
  AVATAR_PALETTE,
  colorForSeed,
  hashStringToIndex,
  initialsFromName,
  specForUser,
} from "../lib/initials-avatar"

describe("hashStringToIndex", () => {
  it("returns a non-negative integer < modulo", () => {
    for (const seed of ["a", "abcdef", "user-1", ""]) {
      const idx = hashStringToIndex(seed, AVATAR_PALETTE.length)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(AVATAR_PALETTE.length)
    }
  })

  it("is deterministic — same input → same output", () => {
    const a = hashStringToIndex("priya@theta.internal", 8)
    const b = hashStringToIndex("priya@theta.internal", 8)
    expect(a).toBe(b)
  })

  it("handles modulo=0 by returning 0 (no division-by-zero)", () => {
    expect(hashStringToIndex("anything", 0)).toBe(0)
  })
})

describe("colorForSeed", () => {
  it("returns one of the documented palette colours", () => {
    for (const seed of ["usr-1", "usr-2", "usr-3", "anything"]) {
      const color = colorForSeed(seed)
      expect(AVATAR_PALETTE).toContain(color)
    }
  })

  it("is deterministic across calls", () => {
    expect(colorForSeed("usr-7")).toBe(colorForSeed("usr-7"))
  })

  it("different seeds usually produce different colours (variety check)", () => {
    const seeds = ["usr-1", "usr-2", "usr-3", "usr-4", "usr-5", "usr-6"]
    const colors = new Set(seeds.map(colorForSeed))
    // At least 2 distinct colours across 6 seeds — the palette is
    // 8-wide so collisions happen, but everyone landing on one
    // colour would mean the hash is broken.
    expect(colors.size).toBeGreaterThanOrEqual(2)
  })
})

describe("initialsFromName", () => {
  it("extracts the first letter for a single-word name", () => {
    expect(initialsFromName("Priya")).toBe("PR")
  })

  it("extracts first + last initial for multi-word names", () => {
    expect(initialsFromName("Priya Sharma")).toBe("PS")
    expect(initialsFromName("Mary Jane Watson")).toBe("MW")
  })

  it("uppercases the result", () => {
    expect(initialsFromName("alice bob")).toBe("AB")
  })

  it("falls back to the seed's first letter when name is empty", () => {
    expect(initialsFromName("", "abhishek")).toBe("A")
  })

  it("returns '?' when both name and seed are empty", () => {
    expect(initialsFromName("", "")).toBe("?")
  })

  it("strips extra whitespace", () => {
    expect(initialsFromName("  Priya   Sharma  ")).toBe("PS")
  })
})

describe("specForUser", () => {
  it("packages initials + color for a given (name, seed) pair", () => {
    const spec = specForUser("Priya Sharma", "usr-1")
    expect(spec.initials).toBe("PS")
    expect(AVATAR_PALETTE).toContain(spec.backgroundColor)
  })

  it("falls back to name as the seed when seed is empty", () => {
    const spec = specForUser("Priya Sharma", "")
    expect(spec.backgroundColor).toBe(colorForSeed("Priya Sharma"))
  })
})
