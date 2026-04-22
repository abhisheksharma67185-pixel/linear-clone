import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { StatusDot } from "./status-dot"

afterEach(cleanup)

describe("StatusDot", () => {
  it("renders an accessible status element", () => {
    render(<StatusDot status="ok" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it.each(["ok", "warn", "error", "loading", "unknown"] as const)(
    "uses the kind '%s' as the aria-label when no label prop is given",
    (kind) => {
      render(<StatusDot status={kind} />)
      expect(screen.getByRole("status")).toHaveAttribute("aria-label", kind)
    }
  )

  it("renders the label text when provided", () => {
    render(<StatusDot status="ok" label="Healthy" />)
    expect(screen.getByText("Healthy")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Healthy")
  })

  it("does not render any visible label text when label is omitted", () => {
    const { container } = render(<StatusDot status="ok" />)
    // Only the dot span should be present (no text content beyond aria).
    expect(container.textContent?.trim() ?? "").toBe("")
  })

  it("forwards the className to the wrapper", () => {
    const { container } = render(
      <StatusDot status="ok" className="my-extra-class" />
    )
    expect(container.firstChild).toHaveClass("my-extra-class")
  })

  it("applies status-specific color classes", () => {
    const cases = [
      { kind: "ok", expected: "bg-emerald-500" },
      { kind: "warn", expected: "bg-amber-500" },
      { kind: "error", expected: "bg-red-500" },
    ] as const

    for (const { kind, expected } of cases) {
      const { container, unmount } = render(<StatusDot status={kind} />)
      // The inner span (aria-hidden) carries the color class.
      const dot = container.querySelector("span[aria-hidden]")
      expect(dot).not.toBeNull()
      expect(dot!.className).toContain(expected)
      unmount()
    }
  })

  it("uses pulse animation for loading state", () => {
    const { container } = render(<StatusDot status="loading" />)
    const dot = container.querySelector("span[aria-hidden]")
    expect(dot?.className).toContain("animate-pulse")
  })
})
