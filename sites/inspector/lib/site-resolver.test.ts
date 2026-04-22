import { afterEach, describe, expect, it, vi } from "vitest";

// Mock next/headers — the real implementation requires a Next.js request context.
const headersMock = vi.fn();
vi.mock("next/headers", () => ({
  headers: () => Promise.resolve({ get: headersMock }),
}));

// Import after vi.mock so the module picks up the mock.
const { resolveSiteBaseUrl, DEFAULT_PROXY_MAP } = await import("./site-resolver");

describe("DEFAULT_PROXY_MAP", () => {
  it("includes the conventional sites on their conventional ports", () => {
    expect(DEFAULT_PROXY_MAP["shopify-admin"]).toBe("http://localhost:3000");
    expect(DEFAULT_PROXY_MAP.linear).toBe("http://localhost:3001");
    expect(DEFAULT_PROXY_MAP.jira).toBe("http://localhost:3002");
    expect(DEFAULT_PROXY_MAP.slack).toBe("http://localhost:3003");
    expect(DEFAULT_PROXY_MAP.zendesk).toBe("http://localhost:3004");
  });
});

describe("resolveSiteBaseUrl", () => {
  afterEach(() => {
    headersMock.mockReset();
  });

  it("returns the mapped URL for a known site when no override header is present", async () => {
    headersMock.mockReturnValue(null);
    const url = await resolveSiteBaseUrl("jira");
    expect(url).toBe("http://localhost:3002");
  });

  it("returns null for an unknown site when no override header is present", async () => {
    headersMock.mockReturnValue(null);
    expect(await resolveSiteBaseUrl("nonexistent")).toBeNull();
  });

  it("uses the x-inspector-site-url header override when present", async () => {
    headersMock.mockReturnValue("https://my-deploy.vercel.app");
    expect(await resolveSiteBaseUrl("anything")).toBe("https://my-deploy.vercel.app");
  });

  it("strips path/query from the override (returns origin only)", async () => {
    headersMock.mockReturnValue("https://my-deploy.vercel.app/some/path?x=1");
    expect(await resolveSiteBaseUrl("anything")).toBe("https://my-deploy.vercel.app");
  });

  it("falls back to the default map when the override is not a valid URL", async () => {
    headersMock.mockReturnValue("not a url");
    expect(await resolveSiteBaseUrl("linear")).toBe("http://localhost:3001");
  });

  it("returns null when override is invalid AND site is unknown", async () => {
    headersMock.mockReturnValue("garbage");
    expect(await resolveSiteBaseUrl("nope")).toBeNull();
  });

  it("preserves protocol from override (http vs https)", async () => {
    headersMock.mockReturnValue("http://192.168.1.42:8080");
    expect(await resolveSiteBaseUrl("x")).toBe("http://192.168.1.42:8080");
  });
});
