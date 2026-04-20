import type { ListTracesFilters, TraceMetadataFilter, TraceSummary } from "@/lib/types";

export function applyTraceFilters(
  traces: TraceSummary[],
  filters: ListTracesFilters
): TraceSummary[] {
  let list = traces;
  const q = filters.search?.toLowerCase().trim();
  if (q) {
    list = list.filter(
      (t) =>
        t.trace_id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.user_id?.toLowerCase().includes(q)
    );
  }
  if (filters.status?.length) list = list.filter((t) => filters.status!.includes(t.status));
  if (filters.platform?.length) {
    list = list.filter((t) => t.platform && filters.platform!.includes(t.platform));
  }
  if (filters.model?.length) {
    list = list.filter((t) => t.model && filters.model!.includes(t.model));
  }
  if (filters.run_type?.length) {
    list = list.filter((t) => t.run_type && filters.run_type!.includes(t.run_type));
  }
  if (filters.use_case?.length) {
    list = list.filter((t) => t.use_case && filters.use_case!.includes(t.use_case));
  }
  if (filters.user_id) list = list.filter((t) => t.user_id?.includes(filters.user_id!));
  if (filters.run_id) list = list.filter((t) => t.run_id?.includes(filters.run_id!));
  if (filters.group) list = list.filter((t) => t.group?.includes(filters.group!));
  if (filters.metadata?.length) {
    list = list.filter((trace) => matchesMetadataFilters(trace, filters.metadata ?? []));
  }

  const sorted = [...list];
  switch (filters.sort) {
    case "oldest":
      sorted.sort((a, b) => +new Date(a.started_at) - +new Date(b.started_at));
      break;
    case "slowest":
      sorted.sort((a, b) => (b.latency_ms ?? 0) - (a.latency_ms ?? 0));
      break;
    case "most_expensive":
      sorted.sort((a, b) => (b.cost_usd ?? 0) - (a.cost_usd ?? 0));
      break;
    default:
      sorted.sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at));
  }
  return sorted;
}

export function collectMetadataKeys(
  metadata: Record<string, unknown> | undefined,
  prefix = ""
): string[] {
  if (!metadata) return [];

  const keys: string[] = [];
  for (const [key, value] of Object.entries(metadata)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      keys.push(path);
      keys.push(...collectMetadataKeys(value, path));
      continue;
    }
    keys.push(path);
  }
  return keys;
}

function matchesMetadataFilters(
  trace: TraceSummary,
  filters: TraceMetadataFilter[]
): boolean {
  return filters.every((filter) => {
    const expected = filter.value.trim().toLowerCase();
    if (!expected) return true;
    const values = getMetadataValues(trace.metadata, filter.key);
    return values.some((value) => value.toLowerCase() === expected);
  });
}

function getMetadataValues(
  metadata: Record<string, unknown> | undefined,
  keyPath: string
): string[] {
  if (!metadata || !keyPath.trim()) return [];

  const parts = keyPath
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return [];

  let current: unknown = metadata;
  for (const part of parts) {
    if (!isPlainObject(current) || !(part in current)) {
      return [];
    }
    current = current[part];
  }

  return normalizeMetadataValues(current);
}

function normalizeMetadataValues(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeMetadataValues(item));
  }
  if (typeof value === "object") {
    return [JSON.stringify(value)];
  }
  return [String(value)];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
