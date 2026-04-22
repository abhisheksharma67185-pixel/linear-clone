import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSitesStore, DEFAULT_SITES } from "./sites-store";

// jsdom provides localStorage; reset it before each test so persistence
// doesn't leak between cases.
beforeEach(() => {
  localStorage.clear();
  // Restore the in-memory state to defaults — Zustand stores are module-level
  // singletons, so each test starts from a known baseline.
  useSitesStore.setState({
    sites: [...DEFAULT_SITES],
    history: [],
    hydrated: true,
  });
});

afterEach(() => {
  localStorage.clear();
});

const get = () => useSitesStore.getState();

describe("DEFAULT_SITES", () => {
  it("has the four conventional sites on their conventional ports", () => {
    expect(DEFAULT_SITES).toHaveLength(4);
    const ports = DEFAULT_SITES.map((s) => new URL(s.url).port);
    expect(ports).toEqual(["3000", "3001", "3002", "3003"]);
    expect(DEFAULT_SITES.map((s) => s.id)).toEqual([
      "shopify-admin",
      "linear",
      "jira",
      "slack",
    ]);
  });
});

describe("addSite", () => {
  it("appends a site and slugifies the name when no id is supplied", () => {
    get().addSite({ name: "My Cool Site", url: "http://localhost:9999" });
    const site = get().sites.at(-1);
    expect(site?.id).toBe("my-cool-site");
    expect(site?.name).toBe("My Cool Site");
    expect(site?.url).toBe("http://localhost:9999");
  });

  it("respects an explicit id when supplied and unique", () => {
    get().addSite({ id: "custom", name: "Custom", url: "http://x" });
    expect(get().sites.find((s) => s.id === "custom")).toBeDefined();
  });

  it("avoids overwriting an existing id by appending a random suffix", () => {
    // 'jira' already exists in defaults
    get().addSite({ id: "jira", name: "Other Jira", url: "http://other" });
    const jiraEntries = get().sites.filter((s) => s.id.startsWith("jira"));
    // original jira + the suffixed one
    expect(jiraEntries.length).toBeGreaterThanOrEqual(2);
    // original 'jira' is preserved exactly
    expect(get().sites.find((s) => s.id === "jira")?.name).toBe("Jira");
  });

  it("falls back to a synthetic id when the slug is empty (e.g., emoji-only name)", () => {
    get().addSite({ name: "🚀🚀", url: "http://x" });
    const site = get().sites.at(-1);
    expect(site?.id).toMatch(/^site-/);
  });
});

describe("updateSite", () => {
  it("patches name/url but never overwrites the id", () => {
    get().updateSite("jira", { name: "Renamed Jira", url: "http://new" });
    const site = get().sites.find((s) => s.id === "jira");
    expect(site?.name).toBe("Renamed Jira");
    expect(site?.url).toBe("http://new");
    expect(site?.id).toBe("jira");
  });

  it("ignores an attempted id rewrite", () => {
    get().updateSite("jira", { id: "hacked" } as Partial<{ id: string }>);
    expect(get().sites.find((s) => s.id === "jira")).toBeDefined();
    expect(get().sites.find((s) => s.id === "hacked")).toBeUndefined();
  });

  it("is a no-op when the id does not exist", () => {
    const before = JSON.stringify(get().sites);
    get().updateSite("nonexistent", { name: "x" });
    expect(JSON.stringify(get().sites)).toBe(before);
  });
});

describe("removeSite", () => {
  it("removes the matching site", () => {
    expect(get().sites.find((s) => s.id === "slack")).toBeDefined();
    get().removeSite("slack");
    expect(get().sites.find((s) => s.id === "slack")).toBeUndefined();
    expect(get().sites).toHaveLength(DEFAULT_SITES.length - 1);
  });

  it("is a no-op for an unknown id", () => {
    const before = get().sites.length;
    get().removeSite("nope");
    expect(get().sites.length).toBe(before);
  });
});

describe("resetDefaults", () => {
  it("restores the default site list, dropping any user additions", () => {
    get().addSite({ name: "Custom", url: "http://x" });
    get().removeSite("jira");
    get().resetDefaults();
    expect(get().sites).toEqual(DEFAULT_SITES);
  });
});

describe("episode history", () => {
  const entry = (episodeId: string) => ({
    episodeId,
    siteId: "jira",
    taskId: "t1",
    taskTitle: "T1",
    startedAt: new Date().toISOString(),
    status: "running" as const,
  });

  it("pushHistory inserts at the head", () => {
    get().pushHistory(entry("a"));
    get().pushHistory(entry("b"));
    expect(get().history.map((h) => h.episodeId)).toEqual(["b", "a"]);
  });

  it("pushHistory dedupes by episodeId (re-inserting moves it to the head)", () => {
    get().pushHistory(entry("a"));
    get().pushHistory(entry("b"));
    get().pushHistory(entry("a"));
    expect(get().history.map((h) => h.episodeId)).toEqual(["a", "b"]);
    expect(get().history).toHaveLength(2);
  });

  it("pushHistory caps history length to 50", () => {
    for (let i = 0; i < 60; i++) get().pushHistory(entry(`e${i}`));
    expect(get().history).toHaveLength(50);
    // The newest entries are kept
    expect(get().history[0]?.episodeId).toBe("e59");
  });

  it("updateHistory patches a matching entry", () => {
    get().pushHistory(entry("a"));
    get().updateHistory("a", { taskTitle: "Renamed" });
    expect(get().history.find((h) => h.episodeId === "a")?.taskTitle).toBe("Renamed");
  });

  it("updateHistory is a no-op for unknown episodeId", () => {
    get().pushHistory(entry("a"));
    const before = JSON.stringify(get().history);
    get().updateHistory("zzz", { taskTitle: "x" });
    expect(JSON.stringify(get().history)).toBe(before);
  });

  it("clearHistory empties the list", () => {
    get().pushHistory(entry("a"));
    get().pushHistory(entry("b"));
    get().clearHistory();
    expect(get().history).toEqual([]);
  });
});
