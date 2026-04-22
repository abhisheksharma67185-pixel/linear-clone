import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  command,
  header,
  parseIntFlag,
  printJson,
  reportErrorAndExit,
  resolveBaseUrl,
  truncate,
} from "./util.js";
import { HttpError } from "./client/http.js";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe("resolveBaseUrl", () => {
  it("prefers an explicit flag URL", () => {
    process.env.THETA_URL = "http://env.test";
    expect(resolveBaseUrl("http://flag.test")).toBe("http://flag.test");
  });

  it("falls back to THETA_URL when no flag is supplied", () => {
    process.env.THETA_URL = "http://env.test";
    expect(resolveBaseUrl(undefined)).toBe("http://env.test");
  });

  it("falls back to the default base URL when nothing is set", () => {
    delete process.env.THETA_URL;
    expect(resolveBaseUrl(undefined)).toBe("http://localhost:3000");
  });
});

describe("truncate", () => {
  it("returns the string unchanged when below the limit", () => {
    expect(truncate("abc", 10)).toBe("abc");
  });

  it("truncates and appends an ellipsis when over the limit", () => {
    expect(truncate("abcdef", 4)).toBe("abc…");
  });

  it("handles maxLen of 0 gracefully", () => {
    expect(truncate("abc", 0)).toBe("…");
  });

  it("handles maxLen of 1", () => {
    expect(truncate("abc", 1)).toBe("…");
  });

  it("handles an empty input", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("parseIntFlag", () => {
  it("returns undefined for undefined input", () => {
    expect(parseIntFlag("limit", undefined)).toBeUndefined();
  });

  it("parses non-negative integers", () => {
    expect(parseIntFlag("limit", "0")).toBe(0);
    expect(parseIntFlag("limit", "42")).toBe(42);
  });

  it("rejects negative numbers", () => {
    expect(() => parseIntFlag("limit", "-1")).toThrow(/non-negative integer/);
  });

  it("rejects floats", () => {
    expect(() => parseIntFlag("limit", "3.14")).toThrow(/non-negative integer/);
  });

  it("rejects non-numeric strings", () => {
    expect(() => parseIntFlag("limit", "abc")).toThrow(/Invalid --limit/);
  });

  it("includes the offending raw value in the error message", () => {
    expect(() => parseIntFlag("seed", "x")).toThrow(/"x"/);
  });
});

describe("header", () => {
  it("includes the title text", () => {
    const h = header("Hello");
    expect(h).toContain("Hello");
  });

  it("renders an underline whose length matches the title (capped at 80)", () => {
    const longTitle = "x".repeat(100);
    const h = header(longTitle);
    // The underline char is ─ (U+2500). Count occurrences.
    const dashCount = (h.match(/─/g) ?? []).length;
    expect(dashCount).toBe(80);
  });

  it("uses a dash count equal to title length when shorter than 80", () => {
    const h = header("Hi");
    const dashCount = (h.match(/─/g) ?? []).length;
    expect(dashCount).toBe(2);
  });
});

describe("printJson", () => {
  it("writes pretty-printed JSON followed by a newline", () => {
    const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    printJson({ a: 1, b: [2, 3] });
    expect(writeSpy).toHaveBeenCalledOnce();
    const arg = writeSpy.mock.calls[0]![0] as string;
    expect(arg.endsWith("\n")).toBe(true);
    expect(JSON.parse(arg)).toEqual({ a: 1, b: [2, 3] });
  });
});

describe("command wrapper", () => {
  it("invokes the inner function with the same args", async () => {
    const inner = vi.fn().mockResolvedValue(undefined);
    const wrapped = command(inner);
    await wrapped("a", 1);
    expect(inner).toHaveBeenCalledWith("a", 1);
  });

  it("funnels thrown errors through reportErrorAndExit (process.exit)", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(((_code?: number) => undefined) as never);
    const writeSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    const wrapped = command(async () => {
      throw new Error("boom");
    });
    await wrapped();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(writeSpy).toHaveBeenCalled();
    const written = writeSpy.mock.calls.map((c) => String(c[0])).join("");
    expect(written).toMatch(/boom/);
  });
});

describe("reportErrorAndExit", () => {
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let writeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(((_code?: number) => undefined) as never);
    writeSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  function written(): string {
    return writeSpy.mock.calls.map((c) => String(c[0])).join("");
  }

  it("formats HttpError with status tag and URL", () => {
    reportErrorAndExit(new HttpError("http://x.test/api/health", 404, "not found"));
    expect(exitSpy).toHaveBeenCalledWith(1);
    const out = written();
    expect(out).toMatch(/HTTP 404/);
    expect(out).toMatch(/not found/);
    expect(out).toMatch(/http:\/\/x\.test\/api\/health/);
  });

  it("uses 'network' tag for status=0", () => {
    reportErrorAndExit(new HttpError("http://x.test/", 0, "Connection refused"));
    expect(written()).toMatch(/network/);
  });

  it("includes a small body preview when there is structured body data", () => {
    reportErrorAndExit(
      new HttpError("http://x.test/", 400, "bad", { error: "bad", detail: "x" }),
    );
    expect(written()).toMatch(/body:/);
    expect(written()).toMatch(/"error": "bad"/);
  });

  it("omits the body block when body is empty/array/null", () => {
    reportErrorAndExit(new HttpError("http://x.test/", 500, "boom", []));
    expect(written()).not.toMatch(/body:/);
  });

  it("formats plain Error", () => {
    reportErrorAndExit(new Error("oops"));
    expect(written()).toMatch(/oops/);
  });

  it("handles non-Error throws by stringifying", () => {
    reportErrorAndExit("just a string");
    expect(written()).toMatch(/just a string/);
  });

  it("appends the stack trace when DEBUG=1", () => {
    process.env.DEBUG = "1";
    const e = new Error("dbg");
    e.stack = "Error: dbg\n  at line";
    reportErrorAndExit(e);
    expect(written()).toMatch(/at line/);
  });
});
