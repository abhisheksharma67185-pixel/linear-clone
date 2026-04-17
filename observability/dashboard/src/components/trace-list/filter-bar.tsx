"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Tag,
  Users,
  Clock,
  ArrowDownWideNarrow,
  X,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  ListTracesFilters,
  Platform,
  RunType,
  TraceMetadataFilter,
  TraceStatus,
} from "@/lib/types";
import {
  DEFAULT_TRACE_COLUMNS,
  DEFAULT_TRACE_DENSITY,
  TRACE_COLUMNS,
  TRACE_COLUMN_LABELS,
  type TraceColumn,
  type TraceDensity,
} from "./view-config";

const STATUS: TraceStatus[] = ["success", "error", "running"];
const TIME_RANGES: { label: string; value: ListTracesFilters["time_range"] }[] = [
  { label: "Last hour", value: "1h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All time", value: "all" },
];

export interface FilterBarProps {
  filters: ListTracesFilters;
  onChange: (next: ListTracesFilters) => void;
  platformOptions: Platform[];
  modelOptions: string[];
  runTypeOptions: RunType[];
  useCaseOptions: string[];
  metadataKeyOptions: string[];
  annotationLabelOptions: string[];
  columns: TraceColumn[];
  density: TraceDensity;
  onColumnsChange: (next: TraceColumn[]) => void;
  onDensityChange: (next: TraceDensity) => void;
  semanticSearchActive?: boolean;
  onSemanticSearchToggle?: (active: boolean) => void;
  onExportCsv?: () => void;
}

function looksLikeNaturalLanguage(query: string): boolean {
  if (!query.trim()) return false;
  const words = query.trim().split(/\s+/);
  // More than 3 words and doesn't look like filter syntax (no colons like "status:error")
  return words.length > 3 && !query.includes(":");
}

export function FilterBar({
  filters,
  onChange,
  platformOptions,
  modelOptions,
  runTypeOptions,
  useCaseOptions,
  metadataKeyOptions,
  annotationLabelOptions,
  columns,
  density,
  onColumnsChange,
  onDensityChange,
  semanticSearchActive,
  onSemanticSearchToggle,
  onExportCsv,
}: FilterBarProps) {
  const setField = <K extends keyof ListTracesFilters>(k: K, v: ListTracesFilters[K]) =>
    onChange({ ...filters, [k]: v });

  const activeCount = countActive(filters);
  const showSemanticToggle = looksLikeNaturalLanguage(filters.search ?? "");

  return (
    <div className="flex flex-col gap-4 border-b px-4 py-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium">Filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Narrow by status, run type, user, model, or natural language when you need semantic recall.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() =>
                onChange({ search: filters.search, sort: filters.sort, time_range: filters.time_range })
              }
            >
              <X data-icon="inline-start" /> Clear {activeCount}
            </Button>
          )}
          <SinglePill
            label="Sort"
            icon={ArrowDownWideNarrow}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "slowest", label: "Slowest" },
              { value: "most_expensive", label: "Most expensive" },
            ]}
            selected={filters.sort ?? "newest"}
            onChange={(v) => setField("sort", v as ListTracesFilters["sort"])}
          />
          <ViewConfigPill
            columns={columns}
            density={density}
            onColumnsChange={onColumnsChange}
            onDensityChange={onDensityChange}
          />
          {onExportCsv && (
            <Button variant="outline" size="xs" onClick={onExportCsv}>
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1 min-w-[240px] max-w-2xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search traces by name, ID, user, or ask a natural-language question…"
            value={filters.search ?? ""}
            onChange={(e) => setField("search", e.target.value)}
          />
        </div>
        {showSemanticToggle && onSemanticSearchToggle && (
          <Button
            type="button"
            variant={semanticSearchActive ? "default" : "outline"}
            onClick={() => onSemanticSearchToggle(!semanticSearchActive)}
          >
            <Sparkles data-icon="inline-start" />
            Semantic search
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MultiPill
          label="Status"
          icon={Filter}
          options={STATUS.map((s) => ({ value: s, label: s }))}
          selected={filters.status ?? []}
          onChange={(v) => setField("status", v as TraceStatus[])}
        />
        <MultiPill
          label="Platform"
          options={platformOptions.map((value) => ({ value, label: value }))}
          selected={filters.platform ?? []}
          onChange={(v) => setField("platform", v as Platform[])}
        />
        <MultiPill
          label="Model"
          options={modelOptions.map((value) => ({ value, label: value }))}
          selected={filters.model ?? []}
          onChange={(v) => setField("model", v)}
        />
        <SinglePill
          label="Time"
          icon={Clock}
          options={TIME_RANGES.map((t) => ({
            value: t.value ?? "all",
            label: t.label,
          }))}
          selected={filters.time_range ?? "24h"}
          onChange={(v) => setField("time_range", v as ListTracesFilters["time_range"])}
        />
        <InputPill
          label="Group"
          icon={Layers}
          value={filters.group ?? ""}
          onChange={(v) => setField("group", v || undefined)}
        />
        <InputPill
          label="User ID"
          icon={Users}
          value={filters.user_id ?? ""}
          onChange={(v) => setField("user_id", v || undefined)}
        />
        <InputPill
          label="Run ID"
          value={filters.run_id ?? ""}
          onChange={(v) => setField("run_id", v || undefined)}
        />
        <MultiPill
          label="Run type"
          options={runTypeOptions.map((value) => ({ value, label: value }))}
          selected={filters.run_type ?? []}
          onChange={(v) => setField("run_type", v as RunType[])}
        />
        <MultiPill
          label="Use case"
          options={useCaseOptions.map((value) => ({ value, label: value }))}
          selected={filters.use_case ?? []}
          onChange={(v) => setField("use_case", v)}
        />
        <MultiPill
          label="Annotation"
          icon={Tag}
          options={annotationLabelOptions.map((value) => ({ value, label: value }))}
          selected={filters.annotation_labels ?? []}
          onChange={(v) => setField("annotation_labels", v.length > 0 ? v : undefined)}
        />
        <MetadataPill
          metadataFilters={filters.metadata ?? []}
          metadataKeyOptions={metadataKeyOptions}
          onChange={(metadata) => setField("metadata", metadata.length > 0 ? metadata : undefined)}
        />
      </div>
    </div>
  );
}

function countActive(f: ListTracesFilters): number {
  let n = 0;
  if (f.status?.length) n++;
  if (f.platform?.length) n++;
  if (f.model?.length) n++;
  if (f.user_id) n++;
  if (f.run_id) n++;
  if (f.run_type?.length) n++;
  if (f.use_case?.length) n++;
  if (f.group) n++;
  if (f.metadata?.length) n++;
  if (f.annotation_labels?.length) n++;
  return n;
}

function PillLabel({
  icon: Icon,
  label,
  count,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  children?: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      {Icon && <Icon className="size-3 text-muted-foreground" />}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="h-4 px-1.5 text-[0.55rem]">
          {count}
        </Badge>
      )}
      {children}
    </span>
  );
}

function MultiPill({
  label,
  icon,
  options,
  selected,
  onChange,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-md border bg-background px-3 text-xs text-foreground transition-colors hover:bg-accent",
            selected.length > 0 && "border-primary/20 bg-accent"
          )}
        >
          <PillLabel label={label} icon={icon} count={selected.length} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0">
        <ul className="max-h-56 overflow-y-auto p-1">
          {options.length === 0 ? (
            <li className="px-2 py-3 text-xs text-muted-foreground">No values available yet.</li>
          ) : (
            options.map((o) => {
              const active = selected.includes(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        active ? selected.filter((v) => v !== o.value) : [...selected, o.value]
                      )
                    }
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-muted"
                  >
                    <Checkbox checked={active} />
                    <span className="flex-1 text-left">{o.label}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function SinglePill({
  label,
  icon,
  options,
  selected,
  onChange,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  options: { value: string; label: string }[];
  selected: string;
  onChange: (v: string) => void;
}) {
  const current = options.find((o) => o.value === selected);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1 rounded-md border bg-background px-3 text-xs text-foreground transition-colors hover:bg-accent"
        >
          <PillLabel label={`${label}: ${current?.label ?? selected}`} icon={icon} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <ul className="p-1">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => onChange(o.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-muted",
                  selected === o.value && "bg-muted font-medium"
                )}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function InputPill({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-md border bg-background px-3 text-xs text-foreground transition-colors hover:bg-accent",
            value && "border-primary/20 bg-accent"
          )}
        >
          <PillLabel
            label={value ? `${label}: ${value}` : label}
            icon={icon}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <Input
          autoFocus
          placeholder={`Filter by ${label.toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </PopoverContent>
    </Popover>
  );
}

function MetadataPill({
  metadataFilters,
  metadataKeyOptions,
  onChange,
}: {
  metadataFilters: TraceMetadataFilter[];
  metadataKeyOptions: string[];
  onChange: (next: TraceMetadataFilter[]) => void;
}) {
  const [draftKey, setDraftKey] = React.useState("");
  const [draftValue, setDraftValue] = React.useState("");

  const addFilter = () => {
    const key = draftKey.trim();
    const value = draftValue.trim();
    if (!key || !value) return;
    onChange([...metadataFilters, { key, value }]);
    setDraftKey("");
    setDraftValue("");
  };

  const removeFilter = (index: number) => {
    onChange(metadataFilters.filter((_, current) => current !== index));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-md border bg-background px-3 text-xs text-foreground transition-colors hover:bg-accent",
            metadataFilters.length > 0 && "border-primary/20 bg-accent"
          )}
        >
          <PillLabel label="Metadata" icon={Layers} count={metadataFilters.length} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium">Metadata filters</p>
            <p className="text-xs text-muted-foreground">
              Pick a discovered key or type a new JSON path like <code>workflow.stage</code>.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {metadataFilters.length === 0 ? (
              <p className="text-xs text-muted-foreground">No metadata filters added yet.</p>
            ) : (
              metadataFilters.map((filter, index) => (
                <div
                  key={`${filter.key}:${filter.value}:${index}`}
                  className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2 py-2"
                >
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="truncate font-medium">{filter.key}</p>
                    <p className="truncate text-muted-foreground">{filter.value}</p>
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeFilter(index)}
                    aria-label={`Remove metadata filter ${filter.key}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-lg border bg-background p-2">
            <Input
              list="trace-metadata-key-options"
              placeholder="Metadata key or JSON path"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
            />
            <datalist id="trace-metadata-key-options">
              {metadataKeyOptions.map((key) => (
                <option key={key} value={key} />
              ))}
            </datalist>
            <Input
              placeholder="Value to match"
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addFilter();
                }
              }}
            />
            <Button type="button" size="xs" onClick={addFilter}>
              <Plus data-icon="inline-start" />
              Add filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ViewConfigPill({
  columns,
  density,
  onColumnsChange,
  onDensityChange,
}: {
  columns: TraceColumn[];
  density: TraceDensity;
  onColumnsChange: (next: TraceColumn[]) => void;
  onDensityChange: (next: TraceDensity) => void;
}) {
  const toggleColumn = (column: TraceColumn) => {
    const active = columns.includes(column);
    if (active && columns.length === 1) return;
    if (active) {
      onColumnsChange(columns.filter((value) => value !== column));
      return;
    }
    onColumnsChange(
      TRACE_COLUMNS.filter((value) => value === column || columns.includes(value))
    );
  };

  const resetView = () => {
    onColumnsChange(DEFAULT_TRACE_COLUMNS);
    onDensityChange(DEFAULT_TRACE_DENSITY);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-md border bg-background px-3 text-xs text-foreground transition-colors hover:bg-accent",
            (density !== DEFAULT_TRACE_DENSITY ||
              columns.length !== DEFAULT_TRACE_COLUMNS.length) &&
              "border-primary/20 bg-accent"
          )}
        >
          <PillLabel label="View" icon={SlidersHorizontal} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Table view</p>
              <p className="text-xs text-muted-foreground">Tune density and visible columns.</p>
            </div>
            <Button variant="ghost" size="xs" onClick={resetView}>
              Reset
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
              Density
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="xs"
                variant={density === "comfortable" ? "default" : "outline"}
                onClick={() => onDensityChange("comfortable")}
              >
                Comfortable
              </Button>
              <Button
                type="button"
                size="xs"
                variant={density === "compact" ? "default" : "outline"}
                onClick={() => onDensityChange("compact")}
              >
                Compact
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
              Columns
            </p>
            <div className="grid gap-1">
              {TRACE_COLUMNS.map((column) => {
                const checked = columns.includes(column);

                return (
                  <button
                    key={column}
                    type="button"
                    onClick={() => toggleColumn(column)}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-muted"
                  >
                    <Checkbox checked={checked} disabled={checked && columns.length === 1} />
                    <span className="flex-1">{TRACE_COLUMN_LABELS[column]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
