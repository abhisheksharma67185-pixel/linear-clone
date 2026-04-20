"use client";

import * as React from "react";
import { Activity, AlertTriangle, Wallet, Workflow } from "lucide-react";
import { FilterBar } from "@/components/trace-list/filter-bar";
import { SavedViews } from "@/components/trace-list/saved-views";
import { TraceTable } from "@/components/trace-list/trace-table";
import { SemanticSearchResults } from "@/components/trace-list/semantic-search-results";
import {
  DEFAULT_TRACE_COLUMNS,
  DEFAULT_TRACE_DENSITY,
  type TraceColumn,
  type TraceDensity,
} from "@/components/trace-list/view-config";
import { semanticSearchAction } from "@/actions/traces";
import {
  listAnnotationLabelsAction,
  listProjectAnnotationsAction,
} from "@/actions/annotations";
import {
  listSavedFiltersAction,
  createSavedFilterAction,
  deleteSavedFilterAction,
} from "@/actions/filters";
import { formatCost, formatLatency, formatNumber } from "@/lib/utils";
import type {
  Annotation,
  ListTracesFilters,
  Platform,
  RunType,
  SavedFilter,
  SearchResult,
  TraceMetadataFilter,
  TraceSummary,
} from "@/lib/types";

export function TracesClient({
  initial,
  orgSlug,
  projectSlug,
  projectId,
  initialFilters,
}: {
  initial: TraceSummary[];
  orgSlug: string;
  projectSlug: string;
  projectId?: string;
  initialFilters?: ListTracesFilters;
}) {
  const [filters, setFilters] = React.useState<ListTracesFilters>(() => ({
    time_range: "24h",
    sort: "newest",
    ...initialFilters,
  }));
  const [semanticSearchActive, setSemanticSearchActive] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [columns, setColumns] = React.useState<TraceColumn[]>(DEFAULT_TRACE_COLUMNS);
  const [density, setDensity] = React.useState<TraceDensity>(DEFAULT_TRACE_DENSITY);
  const [annotationLabelOptions, setAnnotationLabelOptions] = React.useState<string[]>([]);
  const [annotationsByTrace, setAnnotationsByTrace] = React.useState<
    Record<string, Annotation[]>
  >({});
  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([]);
  const [activeFilterId, setActiveFilterId] = React.useState<string | undefined>(undefined);

  const viewStorageKey = React.useMemo(
    () => `theta.trace-view:${orgSlug}:${projectSlug}`,
    [orgSlug, projectSlug]
  );

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(viewStorageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        columns?: TraceColumn[];
        density?: TraceDensity;
      };

      if (parsed.columns?.length) {
        const nextColumns = DEFAULT_TRACE_COLUMNS.filter((column) =>
          parsed.columns?.includes(column)
        );
        if (nextColumns.length > 0) {
          setColumns(nextColumns);
        }
      }

      if (parsed.density === "comfortable" || parsed.density === "compact") {
        setDensity(parsed.density);
      }
    } catch (error) {
      console.error("Failed to load trace view preferences:", error);
    }
  }, [viewStorageKey]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        viewStorageKey,
        JSON.stringify({
          columns,
          density,
        })
      );
    } catch (error) {
      console.error("Failed to save trace view preferences:", error);
    }
  }, [columns, density, viewStorageKey]);

  // Fetch annotation labels and annotations for filtering.
  React.useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const labels = await listAnnotationLabelsAction(projectId);
        if (!cancelled) setAnnotationLabelOptions(labels);
      } catch (e) {
        console.error("Failed to load annotation labels:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  // Fetch saved filters on mount.
  React.useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const items = await listSavedFiltersAction(projectId);
        if (!cancelled) {
          setSavedFilters(items);
          const defaultFilter = items.find((f) => f.is_default);
          if (defaultFilter && !initialFilters?.status?.length && !initialFilters?.search) {
            setFilters((prev) => ({ ...prev, ...defaultFilter.filters }));
            setActiveFilterId(defaultFilter.id);
          }
        }
      } catch (e) {
        console.error("Failed to load saved filters:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplySavedFilter = React.useCallback(
    (appliedFilters: ListTracesFilters, filterId?: string) => {
      setFilters((prev) => ({
        time_range: prev.time_range,
        sort: prev.sort,
        ...appliedFilters,
      }));
      setActiveFilterId(filterId);
    },
    []
  );

  const handleSaveFilter = React.useCallback(
    async (name: string, filterState: ListTracesFilters, color?: string) => {
      if (!projectId) return;
      try {
        const created = await createSavedFilterAction(projectId, name, filterState, color);
        setSavedFilters((prev) => [...prev, created]);
        setActiveFilterId(created.id);
      } catch (e) {
        console.error("Failed to save filter:", e);
      }
    },
    [projectId]
  );

  const handleDeleteFilter = React.useCallback(
    async (filterId: string) => {
      try {
        await deleteSavedFilterAction(filterId);
        setSavedFilters((prev) => prev.filter((f) => f.id !== filterId));
        if (activeFilterId === filterId) {
          setActiveFilterId(undefined);
        }
      } catch (e) {
        console.error("Failed to delete saved filter:", e);
      }
    },
    [activeFilterId]
  );

  // When annotation label filters are active, fetch project annotations to map trace_ids.
  React.useEffect(() => {
    if (!projectId || !filters.annotation_labels?.length) {
      setAnnotationsByTrace({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const annotations = await listProjectAnnotationsAction(projectId, { limit: 500 });
        if (cancelled) return;
        const byTrace: Record<string, Annotation[]> = {};
        for (const ann of annotations) {
          if (!byTrace[ann.trace_id]) byTrace[ann.trace_id] = [];
          byTrace[ann.trace_id].push(ann);
        }
        setAnnotationsByTrace(byTrace);
      } catch (e) {
        console.error("Failed to load annotations for filtering:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, filters.annotation_labels]);

  // Trigger semantic search when active and query changes
  React.useEffect(() => {
    if (!semanticSearchActive || !projectId || !filters.search?.trim()) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setSearching(true);
      try {
        const results = await semanticSearchAction(projectId, filters.search!.trim());
        if (!cancelled) setSearchResults(results);
      } catch (e) {
        console.error("Semantic search failed:", e);
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    };
    const timer = setTimeout(run, 300); // debounce
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [semanticSearchActive, filters.search, projectId]);

  // Turn off semantic search if query no longer looks like NL
  const handleSemanticToggle = React.useCallback((active: boolean) => {
    setSemanticSearchActive(active);
    if (!active) setSearchResults([]);
  }, []);

  const filtered = React.useMemo(() => {
    let list = initial;
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
    if (filters.platform?.length)
      list = list.filter((t) => t.platform && filters.platform!.includes(t.platform));
    if (filters.model?.length)
      list = list.filter((t) => t.model && filters.model!.includes(t.model));
    if (filters.run_type?.length)
      list = list.filter((t) => t.run_type && filters.run_type!.includes(t.run_type));
    if (filters.use_case?.length)
      list = list.filter((t) => t.use_case && filters.use_case!.includes(t.use_case));
    if (filters.user_id) list = list.filter((t) => t.user_id?.includes(filters.user_id!));
    if (filters.run_id) list = list.filter((t) => t.run_id?.includes(filters.run_id!));
    if (filters.group) list = list.filter((t) => t.group?.includes(filters.group!));
    if (filters.metadata?.length) {
      list = list.filter((trace) => matchesMetadataFilters(trace, filters.metadata ?? []));
    }
    if (filters.annotation_labels?.length) {
      const requiredLabels = filters.annotation_labels;
      list = list.filter((t) => {
        const traceAnns = annotationsByTrace[t.trace_id];
        if (!traceAnns?.length) return false;
        return requiredLabels.some((lbl) =>
          traceAnns.some((a) => a.label === lbl)
        );
      });
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
  }, [initial, filters, annotationsByTrace]);

  const summary = React.useMemo(() => {
    const totalCost = filtered.reduce((sum, trace) => sum + (trace.cost_usd ?? 0), 0);
    const totalLatency = filtered.reduce((sum, trace) => sum + (trace.latency_ms ?? 0), 0);
    const avgLatency = filtered.length ? Math.round(totalLatency / filtered.length) : null;
    const errorCount = filtered.filter((trace) => trace.status === "error").length;
    const runningCount = filtered.filter((trace) => trace.status === "running").length;

    return {
      totalCost,
      avgLatency,
      errorCount,
      runningCount,
    };
  }, [filtered]);

  const platformOptions = React.useMemo(
    () => uniq(initial.map((trace) => trace.platform).filter(Boolean)) as Platform[],
    [initial]
  );
  const modelOptions = React.useMemo(
    () => uniq(initial.map((trace) => trace.model).filter(Boolean)),
    [initial]
  );
  const runTypeOptions = React.useMemo(
    () => uniq(initial.map((trace) => trace.run_type).filter(Boolean)) as RunType[],
    [initial]
  );
  const useCaseOptions = React.useMemo(
    () => uniq(initial.map((trace) => trace.use_case).filter(Boolean)),
    [initial]
  );
  const metadataKeyOptions = React.useMemo(
    () =>
      uniq(
        initial.flatMap((trace) => collectMetadataKeys(trace.metadata)).filter(Boolean)
      ),
    [initial]
  );

  const exportCsv = React.useCallback(() => {
    if (filtered.length === 0) return;

    const headers = [
      "trace_id",
      "name",
      "status",
      "user_id",
      "model",
      "platform",
      "run_type",
      "latency_ms",
      "total_tokens",
      "cost_usd",
      "started_at",
      "metadata",
    ];
    const escape = (value: string | number | null | undefined) =>
      `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;

    const rows = filtered.map((trace) =>
      [
        trace.trace_id,
        trace.name,
        trace.status,
        trace.user_id,
        trace.model,
        trace.platform,
        trace.run_type,
        trace.latency_ms,
        trace.total_tokens,
        trace.cost_usd,
        trace.started_at,
        trace.metadata ? JSON.stringify(trace.metadata) : undefined,
      ]
        .map(escape)
        .join(",")
    );

    const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectSlug}-traces.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filtered, projectSlug]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          platformOptions={platformOptions}
          modelOptions={modelOptions}
          runTypeOptions={runTypeOptions}
          useCaseOptions={useCaseOptions}
          metadataKeyOptions={metadataKeyOptions}
          annotationLabelOptions={annotationLabelOptions}
          columns={columns}
          density={density}
          onColumnsChange={setColumns}
          onDensityChange={setDensity}
          semanticSearchActive={semanticSearchActive}
          onSemanticSearchToggle={handleSemanticToggle}
          onExportCsv={exportCsv}
        />
        <SavedViews
          traces={initial}
          filters={filters}
          onChange={setFilters}
          projectId={projectId}
          savedFilters={savedFilters}
          activeFilterId={activeFilterId}
          onApply={handleApplySavedFilter}
          onSave={handleSaveFilter}
          onDelete={handleDeleteFilter}
        />
        {semanticSearchActive && searchResults.length > 0 ? (
          <SemanticSearchResults
            results={searchResults}
            searching={searching}
            orgSlug={orgSlug}
            projectSlug={projectSlug}
          />
        ) : (
          <TraceTable
            traces={filtered}
            orgSlug={orgSlug}
            projectSlug={projectSlug}
            columns={columns}
            density={density}
          />
        )}
      </div>
    </div>
  );
}

function uniq<T>(values: (T | undefined)[]): T[] {
  return [...new Set(values.filter((value): value is T => Boolean(value)))];
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

function collectMetadataKeys(
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

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card px-4 py-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="grid size-8 place-items-center rounded-md bg-muted text-foreground">
          <Icon className="size-4" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
