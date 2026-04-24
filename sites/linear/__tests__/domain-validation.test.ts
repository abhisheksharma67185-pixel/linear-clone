import { describe, expect, it } from "vitest"
import { addDomain, validateDomain } from "../lib/domain-validation"

describe("validateDomain", () => {
  it("accepts plain domains", () => {
    expect(validateDomain("example.com").success).toBe(true)
    expect(validateDomain("foo.bar.co.uk").success).toBe(true)
    expect(validateDomain("a-b.dev").success).toBe(true)
  })

  it("lowercases and strips leading '@' input", () => {
    const r = validateDomain("@Example.COM")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("example.com")
  })

  it("rejects empty input", () => {
    expect(validateDomain("").success).toBe(false)
    expect(validateDomain("   ").success).toBe(false)
  })

  it("rejects URLs, paths, ports, whitespace", () => {
    expect(validateDomain("https://example.com").success).toBe(false)
    expect(validateDomain("example.com/path").success).toBe(false)
    expect(validateDomain("example.com:3000").success).toBe(false)
    expect(validateDomain("exa mple.com").success).toBe(false)
  })

  it("rejects domains without a TLD or with bad labels", () => {
    expect(validateDomain("example").success).toBe(false)
    expect(validateDomain(".example.com").success).toBe(false)
    expect(validateDomain("-example.com").success).toBe(false)
    expect(validateDomain("example-.com").success).toBe(false)
    expect(validateDomain("example.c").success).toBe(false)
  })
})

describe("addDomain", () => {
  it("rejects duplicates case-insensitively", () => {
    const r = addDomain(["example.com"], "Example.com")
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error).toMatch(/already/i)
  })

  it("returns the normalised value on success", () => {
    const r = addDomain(["foo.com"], "Example.COM")
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("example.com")
  })
})
