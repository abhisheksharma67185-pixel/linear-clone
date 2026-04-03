import type { StateDiff } from "./types";

// ---------------------------------------------------------------------------
// Generic snapshot — works with any site's state shape
// A snapshot is just a Record<string, unknown> deep-cloned at a point in time
// ---------------------------------------------------------------------------

export type GenericSnapshot = Record<string, unknown> & { capturedAt: string };

// ---------------------------------------------------------------------------
// Capture a deep-cloned snapshot from any state getter
// ---------------------------------------------------------------------------

export function captureSnapshot(getState: () => Record<string, unknown>): GenericSnapshot {
  const state = getState();
  return JSON.parse(
    JSON.stringify({
      ...state,
      capturedAt: new Date().toISOString(),
    }),
  );
}

// ---------------------------------------------------------------------------
// Diff computation — compares two snapshots at field level
// ---------------------------------------------------------------------------

function diffCollection(
  colName: string,
  before: { id: string }[],
  after: { id: string }[],
  diff: StateDiff,
): void {
  const beforeMap = new Map(before.map((item) => [item.id, item]));
  const afterMap = new Map(after.map((item) => [item.id, item]));

  for (const [id, item] of afterMap) {
    if (!beforeMap.has(id)) {
      diff.added.push({ entity: colName, id, item: item as Record<string, unknown> });
    }
  }

  for (const [id] of beforeMap) {
    if (!afterMap.has(id)) {
      diff.removed.push({ entity: colName, id });
    }
  }

  for (const [id, afterItem] of afterMap) {
    const beforeItem = beforeMap.get(id);
    if (!beforeItem) continue;

    const afterRecord = afterItem as Record<string, unknown>;
    const beforeRecord = beforeItem as Record<string, unknown>;

    for (const key of Object.keys(afterRecord)) {
      if (JSON.stringify(beforeRecord[key]) !== JSON.stringify(afterRecord[key])) {
        diff.modified.push({
          path: `${colName}.${id}.${key}`,
          entity: colName,
          id,
          field: key,
          before: beforeRecord[key],
          after: afterRecord[key],
        });
      }
    }
  }
}

function diffSingleton(
  entityName: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  diff: StateDiff,
): void {
  for (const key of Object.keys(after)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff.modified.push({
        path: `${entityName}.${key}`,
        entity: entityName,
        field: key,
        before: before[key],
        after: after[key],
      });
    }
  }
}

export function computeDiff(
  before: GenericSnapshot,
  after: GenericSnapshot,
  collections: string[],
  singletons: string[] = [],
): StateDiff {
  const diff: StateDiff = { added: [], removed: [], modified: [] };

  for (const col of collections) {
    const bArr = before[col] as { id: string }[] | undefined;
    const aArr = after[col] as { id: string }[] | undefined;
    if (bArr && aArr) {
      diffCollection(col, bArr, aArr, diff);
    }
  }

  for (const single of singletons) {
    const bObj = before[single] as Record<string, unknown> | undefined;
    const aObj = after[single] as Record<string, unknown> | undefined;
    if (bObj && aObj) {
      diffSingleton(single, bObj, aObj, diff);
    }
  }

  return diff;
}

// ---------------------------------------------------------------------------
// Utility: get nested field from an object by dot-path
// ---------------------------------------------------------------------------

export function getNestedField(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce(
      (current, key) => (current != null ? (current as Record<string, unknown>)[key] : undefined),
      obj,
    );
}
