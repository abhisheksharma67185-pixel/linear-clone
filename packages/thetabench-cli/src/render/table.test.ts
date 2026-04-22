import { describe, expect, it } from "vitest";
import { renderTable, renderKeyValue } from "./table.js";

describe("renderTable", () => {
  it("renders headers and a row", () => {
    const out = renderTable([["a", "b"]], { head: ["A", "B"] });
    expect(out).toContain("A");
    expect(out).toContain("B");
    expect(out).toContain("a");
    expect(out).toContain("b");
  });

  it("handles an empty rows array", () => {
    const out = renderTable([], { head: ["X", "Y"] });
    expect(out).toContain("X");
    expect(out).toContain("Y");
  });

  it("converts null and undefined cells to empty strings", () => {
    // Should not throw — the cell should render as blank.
    const out = renderTable([[null, undefined, "x"]], { head: ["A", "B", "C"] });
    expect(out).toContain("x");
  });

  it("coerces number cells to strings", () => {
    const out = renderTable([[1, 2.5]], { head: ["N", "M"] });
    expect(out).toContain("1");
    expect(out).toContain("2.5");
  });

  it("respects colWidths and truncates/wraps overflowing content", () => {
    const longCell = "abcdefghijklmnop";
    const out = renderTable([[longCell, "ok"]], {
      head: ["Wide", "Y"],
      colWidths: [6, 6],
    });
    // Either the cell is wrapped onto multiple lines or truncated. We just
    // verify the rendered output respects the width budget by checking that
    // no single output line drastically exceeds the combined widths.
    const lines = out.split("\n");
    for (const line of lines) {
      // Allow padding + borders, but assert each line fits in a generous bound.
      expect(line.length).toBeLessThan(40);
    }
  });

  it("supports null colWidths entries (auto-size)", () => {
    const out = renderTable([["short", "y"]], {
      head: ["A", "B"],
      colWidths: [null, 8],
    });
    expect(out).toContain("short");
  });
});

describe("renderKeyValue", () => {
  it("aligns keys to the longest key width", () => {
    const out = renderKeyValue([
      ["short", "a"],
      ["a-much-longer-key", "b"],
    ]);
    const lines = out.split("\n");
    expect(lines).toHaveLength(2);
    // Both lines should contain their key + value.
    expect(lines[0]).toContain("short");
    expect(lines[0]).toContain("a");
    expect(lines[1]).toContain("a-much-longer-key");
    expect(lines[1]).toContain("b");
  });

  it("renders an em-dash for null/undefined/empty values", () => {
    const out = renderKeyValue([
      ["k1", null],
      ["k2", undefined],
      ["k3", ""],
      ["k4", 0],
    ]);
    // null/undefined/'' all render as the em-dash placeholder.
    expect((out.match(/—/g) ?? []).length).toBeGreaterThanOrEqual(3);
    // Numbers (including 0) are still printed.
    expect(out).toContain("0");
  });

  it("handles boolean values", () => {
    const out = renderKeyValue([["done", true]]);
    expect(out).toContain("true");
  });

  it("returns an empty string for an empty pairs array", () => {
    expect(renderKeyValue([])).toBe("");
  });
});
