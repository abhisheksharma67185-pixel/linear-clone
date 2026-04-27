import { describe, expect, it } from "vitest"
import { buildExportRequest, privateTeamsLabel } from "../lib/export-issues"

describe("buildExportRequest", () => {
  it("produces { includePrivateTeams: 'none' } when value is 'none'", () => {
    expect(buildExportRequest("none")).toEqual({
      includePrivateTeams: "none",
    })
  })

  it("produces { includePrivateTeams: 'all' } when value is 'all'", () => {
    expect(buildExportRequest("all")).toEqual({
      includePrivateTeams: "all",
    })
  })

  it("defaults to 'none' for anything else", () => {
    expect(buildExportRequest(undefined)).toEqual({
      includePrivateTeams: "none",
    })
    expect(buildExportRequest(null)).toEqual({
      includePrivateTeams: "none",
    })
    expect(buildExportRequest("All")).toEqual({
      includePrivateTeams: "none",
    })
    expect(buildExportRequest(42)).toEqual({
      includePrivateTeams: "none",
    })
  })
})

describe("privateTeamsLabel", () => {
  it("title-cases the dropdown label", () => {
    expect(privateTeamsLabel("none")).toBe("None")
    expect(privateTeamsLabel("all")).toBe("All")
  })
})
