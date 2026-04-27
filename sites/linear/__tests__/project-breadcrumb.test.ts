/**
 * Unit tests for the project breadcrumb derivation helper.
 *
 * The spec's regression: the breadcrumb varied based on entry path
 * (direct nav vs from-list). The fix is to derive the crumbs purely
 * from the loaded project + team — never from transient client
 * state. These tests pin the contract.
 */
import { describe, expect, it } from "vitest"

import { buildProjectBreadcrumb } from "../lib/project-breadcrumb"

describe("buildProjectBreadcrumb", () => {
  it("renders Team › Project when team is known", () => {
    const crumbs = buildProjectBreadcrumb(
      { id: "p1", name: "Bbkbk" },
      { name: "Abhishek", key: "ABH" }
    )
    expect(crumbs).toEqual([
      { label: "Abhishek", href: "/teams/abh/issues" },
      { label: "Bbkbk" },
    ])
  })

  it("falls back to 'Projects' as root when team is null (race / unknown)", () => {
    const crumbs = buildProjectBreadcrumb({ id: "p1", name: "Bbkbk" }, null)
    expect(crumbs).toEqual([
      { label: "Projects", href: "/projects" },
      { label: "Bbkbk" },
    ])
  })

  it("the leaf crumb has no href (it's the current page)", () => {
    const crumbs = buildProjectBreadcrumb(
      { id: "p1", name: "Leaf" },
      { name: "T", key: "T" }
    )
    expect(crumbs[crumbs.length - 1].href).toBeUndefined()
  })

  it("renders the same crumb regardless of where the user navigated from", () => {
    // The function is pure — it has no notion of "entry path". Two
    // identical inputs MUST produce identical outputs. This test
    // exists to make the entry-path-independence contract explicit.
    const inputs = [
      ["p1", "Bbkbk", "Abhishek", "ABH"],
      ["p1", "Bbkbk", "Abhishek", "ABH"],
    ] as const
    const [a, b] = inputs.map(([id, pname, tname, key]) =>
      buildProjectBreadcrumb({ id, name: pname }, { name: tname, key })
    )
    expect(a).toEqual(b)
  })

  it("team href uses lowercase key (route convention)", () => {
    const crumbs = buildProjectBreadcrumb(
      { id: "p1", name: "Bbkbk" },
      { name: "Platform", key: "PLT" }
    )
    expect(crumbs[0].href).toBe("/teams/plt/issues")
  })
})
