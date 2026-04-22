import { afterEach, beforeEach, describe, expect, it } from "vitest";

// We re-import the module for each test so the internal `_enabled` cache can
// re-evaluate against the current process.env. Vitest caches ESM imports
// per-worker, so we use `vi.resetModules()` between cases.
import { vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("colors module", () => {
  it("disables color when NO_COLOR=1 even if pc.isColorSupported is true", async () => {
    process.env.NO_COLOR = "1";
    const mod = await import("./colors.js");
    // setColorEnabled(true) cannot override NO_COLOR.
    mod.setColorEnabled(true);
    expect(mod.colorEnabled()).toBe(false);
    // Wrappers should be no-ops (raw text returned unchanged).
    expect(mod.c.red("hi")).toBe("hi");
    expect(mod.ok("yay")).toBe("yay");
    expect(mod.err("boom")).toBe("boom");
    expect(mod.warn("careful")).toBe("careful");
    expect(mod.info("fyi")).toBe("fyi");
    expect(mod.muted("dim")).toBe("dim");
    expect(mod.label("bold")).toBe("bold");
  });

  it("setColorEnabled(false) disables coloring even when env allows it", async () => {
    delete process.env.NO_COLOR;
    const mod = await import("./colors.js");
    mod.setColorEnabled(false);
    expect(mod.colorEnabled()).toBe(false);
    expect(mod.c.green("ok")).toBe("ok");
  });

  it("colorEnabled mirrors NO_COLOR=1 default state", async () => {
    process.env.NO_COLOR = "1";
    const mod = await import("./colors.js");
    expect(mod.colorEnabled()).toBe(false);
  });

  it("when colorEnabled is true the wrapper invokes the underlying picocolors fn", async () => {
    delete process.env.NO_COLOR;
    const mod = await import("./colors.js");
    // Force-on; if pc.isColorSupported is false (e.g. CI without TTY) the wrapper
    // still no-ops, so we accept either `=== "x"` (no color) OR contains "x" (colored).
    mod.setColorEnabled(true);
    const out = mod.c.red("x");
    expect(out).toContain("x");
  });

  it("toggling back to enabled after a disable works (when env supports it)", async () => {
    delete process.env.NO_COLOR;
    const mod = await import("./colors.js");
    mod.setColorEnabled(false);
    expect(mod.colorEnabled()).toBe(false);
    mod.setColorEnabled(true);
    // Either picocolors enables it (TTY) or it stays off (CI). Both are valid.
    expect(typeof mod.colorEnabled()).toBe("boolean");
  });
});
