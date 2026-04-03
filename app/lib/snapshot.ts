import * as store from "./store";
import type {
  Product,
  Order,
  Customer,
  Discount,
  StoreSettings,
} from "./mock-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoreSnapshot {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  discounts: Discount[];
  settings: StoreSettings;
  capturedAt: string;
}

export interface FieldDiff {
  path: string;
  entity: string;
  id?: string;
  field: string;
  before: unknown;
  after: unknown;
}

export interface EntityRef {
  entity: string;
  id: string;
  item: Record<string, unknown>;
}

export interface StateDiff {
  added: EntityRef[];
  removed: { entity: string; id: string }[];
  modified: FieldDiff[];
}

// ---------------------------------------------------------------------------
// Snapshot capture
// ---------------------------------------------------------------------------

export function captureSnapshot(): StoreSnapshot {
  return JSON.parse(
    JSON.stringify({
      products: store.getProducts(),
      orders: store.getOrders(),
      customers: store.getCustomers(),
      discounts: store.getDiscounts(),
      settings: store.getSettings(),
      capturedAt: new Date().toISOString(),
    }),
  );
}

// ---------------------------------------------------------------------------
// Diff computation
// ---------------------------------------------------------------------------

const COLLECTIONS = ["products", "orders", "customers", "discounts"] as const;
type CollectionName = (typeof COLLECTIONS)[number];

function diffCollection(
  colName: CollectionName,
  before: { id: string }[],
  after: { id: string }[],
  diff: StateDiff,
): void {
  const beforeMap = new Map(before.map((item) => [item.id, item]));
  const afterMap = new Map(after.map((item) => [item.id, item]));

  // Added entities
  for (const [id, item] of afterMap) {
    if (!beforeMap.has(id)) {
      diff.added.push({
        entity: colName,
        id,
        item: item as Record<string, unknown>,
      });
    }
  }

  // Removed entities
  for (const [id] of beforeMap) {
    if (!afterMap.has(id)) {
      diff.removed.push({ entity: colName, id });
    }
  }

  // Modified entities — field-level comparison
  for (const [id, afterItem] of afterMap) {
    const beforeItem = beforeMap.get(id);
    if (!beforeItem) continue;

    const afterRecord = afterItem as Record<string, unknown>;
    const beforeRecord = beforeItem as Record<string, unknown>;

    for (const key of Object.keys(afterRecord)) {
      const bVal = beforeRecord[key];
      const aVal = afterRecord[key];
      if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
        diff.modified.push({
          path: `${colName}.${id}.${key}`,
          entity: colName,
          id,
          field: key,
          before: bVal,
          after: aVal,
        });
      }
    }
  }
}

function diffSettings(
  before: StoreSettings,
  after: StoreSettings,
  diff: StateDiff,
): void {
  const beforeRecord = before as unknown as Record<string, unknown>;
  const afterRecord = after as unknown as Record<string, unknown>;

  for (const key of Object.keys(afterRecord)) {
    if (JSON.stringify(beforeRecord[key]) !== JSON.stringify(afterRecord[key])) {
      diff.modified.push({
        path: `settings.${key}`,
        entity: "settings",
        field: key,
        before: beforeRecord[key],
        after: afterRecord[key],
      });
    }
  }
}

export function computeDiff(
  before: StoreSnapshot,
  after: StoreSnapshot,
): StateDiff {
  const diff: StateDiff = { added: [], removed: [], modified: [] };

  for (const col of COLLECTIONS) {
    diffCollection(
      col,
      before[col] as { id: string }[],
      after[col] as { id: string }[],
      diff,
    );
  }

  diffSettings(before.settings, after.settings, diff);

  return diff;
}

// ---------------------------------------------------------------------------
// Utility: get nested field from an object by dot-path
// ---------------------------------------------------------------------------

export function getNestedField(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce(
      (current, key) =>
        current != null ? (current as Record<string, unknown>)[key] : undefined,
      obj,
    );
}
