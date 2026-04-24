import { describe, expect, it } from "vitest"
import {
  COPY_FROM_NONE_VALUE,
  DEFAULT_TEAM_ICON,
  DEFAULT_TIMEZONE_ID,
  NEW_TEAM_COPY,
  buildTimezoneOption,
  buildTimezoneOptions,
  findTimezoneOption,
  formatOffset,
  validateNewTeamForm,
} from "../lib/new-team"

describe("formatOffset", () => {
  it("renders GMT±HH:MM", () => {
    expect(formatOffset(0)).toBe("GMT+00:00")
    expect(formatOffset(330)).toBe("GMT+05:30")
    expect(formatOffset(-300)).toBe("GMT-05:00")
    expect(formatOffset(540)).toBe("GMT+09:00")
  })
})

describe("buildTimezoneOption", () => {
  it("produces the canonical label shape for Asia/Kolkata", () => {
    const o = buildTimezoneOption("Asia/Kolkata")
    expect(o.city).toBe("Kolkata")
    expect(o.offsetLabel).toBe("GMT+05:30")
    // Label follows "GMT±HH:MM — <Zone> — <City>" for all zones.
    expect(o.label).toMatch(/^GMT\+05:30 — .+ — Kolkata$/)
    expect(o.label).toContain("Kolkata")
    expect(o.search).toContain(o.label.toLowerCase())
  })

  it("underscores in city names are replaced with spaces", () => {
    const o = buildTimezoneOption("America/Los_Angeles")
    expect(o.city).toBe("Los Angeles")
  })

  it("UTC has a zero offset", () => {
    const o = buildTimezoneOption("UTC")
    expect(o.offsetLabel).toBe("GMT+00:00")
  })
})

describe("buildTimezoneOptions", () => {
  const options = buildTimezoneOptions()

  it("includes the default timezone", () => {
    expect(findTimezoneOption(options, DEFAULT_TIMEZONE_ID)).toBeTruthy()
  })

  it("is sorted by offset ascending", () => {
    const offsets = options.map((o) => o.offsetMinutes)
    for (let i = 1; i < offsets.length; i++) {
      expect(offsets[i]).toBeGreaterThanOrEqual(offsets[i - 1])
    }
  })

  it("each option has a non-empty label and searchable haystack", () => {
    for (const o of options) {
      expect(o.label.length).toBeGreaterThan(0)
      expect(o.search).toContain(o.id.toLowerCase())
    }
  })
})

describe("validateNewTeamForm", () => {
  const usedKeys = new Set(["PLT"])

  it("requires team name", () => {
    const e = validateNewTeamForm({ name: "", identifier: "ENG", usedKeys })
    expect(e.name).toBe("Team name is required")
  })

  it("requires identifier", () => {
    const e = validateNewTeamForm({ name: "Eng", identifier: "", usedKeys })
    expect(e.identifier).toMatch(/required/i)
  })

  it("rejects identifiers that don't match the pattern", () => {
    const e = validateNewTeamForm({
      name: "Eng",
      identifier: "Eng",
      usedKeys,
    })
    expect(e.identifier).toMatch(/2–6 uppercase/i)
  })

  it("rejects identifiers that collide with existing teams", () => {
    const e = validateNewTeamForm({
      name: "Platform 2",
      identifier: "PLT",
      usedKeys,
    })
    expect(e.identifier).toMatch(/already in use/)
  })

  it("accepts a minimally-valid form", () => {
    const e = validateNewTeamForm({
      name: "Eng",
      identifier: "ENG",
      usedKeys,
    })
    expect(e).toEqual({})
  })
})

describe("single source of truth", () => {
  it("exposes the exact Copy-from-team 'Don't copy' label", () => {
    expect(NEW_TEAM_COPY.copyFromNoneLabel).toBe("Don't copy")
  })

  it("has a default icon color + emoji for initial render", () => {
    expect(DEFAULT_TEAM_ICON.colorId).toBeTruthy()
    expect(DEFAULT_TEAM_ICON.emoji).toBeTruthy()
  })

  it("COPY_FROM_NONE_VALUE is distinct from any team key", () => {
    expect(COPY_FROM_NONE_VALUE).toBe("none")
  })
})
