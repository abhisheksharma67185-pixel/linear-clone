import { describe, it, expect } from "vitest";
import { captureSnapshot, computeDiff, getNestedField } from "./snapshot";

describe("captureSnapshot", () => {
  it("deep-clones state and stamps capturedAt", () => {
    const state = { products: [{ id: "1", price: "29.99" }] };
    const snap = captureSnapshot(() => state);
    expect(snap.products).toEqual(state.products);
    expect(typeof snap.capturedAt).toBe("string");
    // Mutating original must not affect snapshot
    (state.products[0] as { price: string }).price = "9.99";
    expect((snap.products as { price: string }[])[0].price).toBe("29.99");
  });
});

describe("computeDiff (collections)", () => {
  const before = {
    capturedAt: "t0",
    products: [
      { id: "1", title: "A", price: "10" },
      { id: "2", title: "B", price: "20" },
    ],
  };

  it("detects added items", () => {
    const after = {
      capturedAt: "t1",
      products: [...before.products, { id: "3", title: "C", price: "30" }],
    };
    const diff = computeDiff(before, after, ["products"]);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].id).toBe("3");
    expect(diff.removed).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);
  });

  it("detects removed items", () => {
    const after = { capturedAt: "t1", products: [before.products[0]] };
    const diff = computeDiff(before, after, ["products"]);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].id).toBe("2");
  });

  it("detects modified fields", () => {
    const after = {
      capturedAt: "t1",
      products: [
        { id: "1", title: "A", price: "11" },
        { id: "2", title: "B", price: "20" },
      ],
    };
    const diff = computeDiff(before, after, ["products"]);
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0]).toMatchObject({
      entity: "products",
      id: "1",
      field: "price",
      before: "10",
      after: "11",
    });
  });

  it("ignores collections present in only one snapshot (defensive)", () => {
    const after = { capturedAt: "t1" };
    const diff = computeDiff(before, after, ["products"]);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);
  });

  it("handles deep object equality via JSON.stringify (no false positives)", () => {
    const beforeArr = {
      capturedAt: "t0",
      products: [{ id: "1", tags: ["a", "b"] }],
    };
    const afterArr = {
      capturedAt: "t1",
      products: [{ id: "1", tags: ["a", "b"] }],
    };
    const diff = computeDiff(beforeArr, afterArr, ["products"]);
    expect(diff.modified).toHaveLength(0);
  });

  it("detects changes in nested arrays as field modifications", () => {
    const beforeArr = { capturedAt: "t0", products: [{ id: "1", tags: ["a"] }] };
    const afterArr = { capturedAt: "t1", products: [{ id: "1", tags: ["a", "b"] }] };
    const diff = computeDiff(beforeArr, afterArr, ["products"]);
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].field).toBe("tags");
  });
});

describe("computeDiff (singletons)", () => {
  it("detects modified singleton fields", () => {
    const before = { capturedAt: "t0", settings: { storeName: "Old", currency: "USD" } };
    const after = { capturedAt: "t1", settings: { storeName: "New", currency: "USD" } };
    const diff = computeDiff(before, after, [], ["settings"]);
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0]).toMatchObject({
      entity: "settings",
      field: "storeName",
      before: "Old",
      after: "New",
    });
  });

  it("detects field deletions in singletons", () => {
    const before = { capturedAt: "t0", settings: { storeName: "Old", currency: "USD" } };
    const after = { capturedAt: "t1", settings: { storeName: "Old" } };
    const diff = computeDiff(before, after, [], ["settings"]);
    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].field).toBe("currency");
  });
});

describe("getNestedField", () => {
  const obj = { a: { b: { c: 42 } }, x: null as unknown };

  it("returns nested value for valid path", () => {
    expect(getNestedField(obj, "a.b.c")).toBe(42);
  });

  it("returns undefined for missing path", () => {
    expect(getNestedField(obj, "a.b.missing")).toBeUndefined();
  });

  it("returns undefined when traversing through null", () => {
    expect(getNestedField(obj, "x.foo")).toBeUndefined();
  });

  it("returns the object itself for empty-segment trailing dot is undefined-ish", () => {
    // not a contract guarantee but documents current behavior
    expect(getNestedField({}, "missing")).toBeUndefined();
  });
});
