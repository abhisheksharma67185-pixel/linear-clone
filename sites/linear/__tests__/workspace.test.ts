import { afterEach, describe, expect, it } from "vitest"

import {
  peekDeletionCode,
  resetDeletionCode,
  sendDeletionCode,
  updateWorkspace,
  validateName,
  validateSlug,
  verifyDeletion,
  workspace,
} from "../lib/workspace-mocks"

afterEach(() => {
  workspace.name = "Abhishek"
  workspace.slug = "abhishek2007"
  workspace.logoDataUrl = null
  workspace.fiscalYearStartMonth = "january"
  resetDeletionCode()
})

describe("validateSlug", () => {
  it("accepts lowercase letters, numbers, and hyphens", () => {
    expect(validateSlug("abhishek").success).toBe(true)
    expect(validateSlug("theta-rl").success).toBe(true)
    expect(validateSlug("theta-2007").success).toBe(true)
  })

  it("rejects empty values", () => {
    expect(validateSlug("").success).toBe(false)
    expect(validateSlug("   ").success).toBe(false)
  })

  it("rejects spaces and symbols", () => {
    expect(validateSlug("ab hishek").success).toBe(false)
    expect(validateSlug("abhishek!").success).toBe(false)
  })

  it("rejects leading or trailing hyphens", () => {
    expect(validateSlug("-abc").success).toBe(false)
    expect(validateSlug("abc-").success).toBe(false)
  })

  it("normalises uppercase to lowercase on success", () => {
    // Users pasting mixed-case slugs should be silently lowercased rather
    // than rejected — the slug field is lossless for the user's intent.
    const r = validateSlug("Abhishek")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("abhishek")
  })
})

describe("validateName", () => {
  it("rejects empty names", () => {
    expect(validateName("").success).toBe(false)
    expect(validateName("   ").success).toBe(false)
  })

  it("accepts and trims valid names", () => {
    const r = validateName("  Theta Labs  ")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("Theta Labs")
  })
})

describe("updateWorkspace", () => {
  it("rejects empty name", () => {
    const r = updateWorkspace({ name: "" })
    expect(r.success).toBe(false)
  })

  it("rejects invalid slug", () => {
    const r = updateWorkspace({ slug: "Invalid Slug!" })
    expect(r.success).toBe(false)
  })

  it("applies a valid patch", () => {
    const r = updateWorkspace({ name: "Theta", slug: "theta-rl" })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.name).toBe("Theta")
      expect(r.data.slug).toBe("theta-rl")
    }
  })
})

describe("deletion flow", () => {
  it("requires a code to be issued first", () => {
    const r = verifyDeletion({ code: "123456", acknowledged: true })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toMatch(/request/i)
  })

  it("requires acknowledgement", () => {
    sendDeletionCode()
    const code = peekDeletionCode()?.code
    const r = verifyDeletion({ code, acknowledged: false })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toMatch(/acknowledge/i)
  })

  it("rejects wrong code", () => {
    sendDeletionCode()
    const r = verifyDeletion({ code: "000000", acknowledged: true })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toMatch(/incorrect/i)
  })

  it("accepts correct code + acknowledgement", () => {
    sendDeletionCode()
    const code = peekDeletionCode()?.code
    const r = verifyDeletion({ code, acknowledged: true })
    expect(r.success).toBe(true)
  })
})
