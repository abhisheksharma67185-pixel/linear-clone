import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("joins simple class strings", () => {
    expect(cn("a", "b")).toBe("a b")
  })

  it("filters falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b")
  })

  it("expands arrays and nested arrays (clsx behavior)", () => {
    expect(cn(["a", ["b", false, "c"]])).toBe("a b c")
  })

  it("dedupes and resolves Tailwind class conflicts (twMerge)", () => {
    // padding-x conflict: later wins
    expect(cn("px-2", "px-4")).toBe("px-4")
    // text-color conflict: later wins
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("preserves non-conflicting Tailwind classes", () => {
    const out = cn("flex", "items-center", "gap-2", "text-sm")
    for (const cls of ["flex", "items-center", "gap-2", "text-sm"]) {
      expect(out).toContain(cls)
    }
  })

  it("accepts conditional object form", () => {
    const out = cn("base", { active: true, disabled: false })
    expect(out).toContain("base")
    expect(out).toContain("active")
    expect(out).not.toContain("disabled")
  })

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("")
  })
})
