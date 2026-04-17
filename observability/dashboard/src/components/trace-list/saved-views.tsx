"use client";

import * as React from "react";
import { AlertTriangle, Plus, Star, Workflow, X, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ListTracesFilters, SavedFilter, TraceSummary } from "@/lib/types";

const DEFAULT_TIME_RANGE: ListTracesFilters["time_range"] = "24h";

const COLOR_OPTIONS = [
  { name: "blue", class: "bg-blue-500" },
  { name: "green", class: "bg-green-500" },
  { name: "red", class: "bg-red-500" },
  { name: "purple", class: "bg-purple-500" },
  { name: "orange", class: "bg-orange-500" },
] as const;

function colorDotClass(color?: string): string {
  switch (color) {
    case "blue":
      return "bg-blue-500";
    case "green":
      return "bg-green-500";
    case "red":
      return "bg-red-500";
    case "purple":
      return "bg-purple-500";
    case "orange":
      return "bg-orange-500";
    default:
      return "bg-muted-foreground";
  }
}

interface SavedViewsProps {
  traces: TraceSummary[];
  filters: ListTracesFilters;
  onChange: (next: ListTracesFilters) => void;
  projectId?: string;
  savedFilters: SavedFilter[];
  activeFilterId?: string;
  onApply: (filters: ListTracesFilters, filterId?: string) => void;
  onSave: (name: string, filters: ListTracesFilters, color?: string) => void;
  onDelete: (filterId: string) => void;
}

export function SavedViews({
  traces,
  filters,
  onChange,
  savedFilters,
  activeFilterId,
  onApply,
  onSave,
  onDelete,
}: SavedViewsProps) {
  const timeRange = filters.time_range ?? DEFAULT_TIME_RANGE;

  const builtInViews = [
    {
      name: "All traces",
      icon: Workflow,
      count: traces.length,
      active: !activeFilterId && isDefaultView(filters),
      next: { time_range: timeRange, sort: "newest" } satisfies ListTracesFilters,
    },
    {
      name: "Errors",
      icon: AlertTriangle,
      count: traces.filter((trace) => trace.status === "error").length,
      active: !activeFilterId && isSimpleStatusView(filters, "error"),
      next: {
        time_range: timeRange,
        sort: "newest",
        status: ["error"],
      } satisfies ListTracesFilters,
    },
    {
      name: "Running",
      icon: Zap,
      count: traces.filter((trace) => trace.status === "running").length,
      active: !activeFilterId && isSimpleStatusView(filters, "running"),
      next: {
        time_range: timeRange,
        sort: "newest",
        status: ["running"],
      } satisfies ListTracesFilters,
    },
    {
      name: "Prod",
      icon: Star,
      count: traces.filter((trace) => trace.run_type === "prod").length,
      active: !activeFilterId && isSimpleRunTypeView(filters, "prod"),
      next: {
        time_range: timeRange,
        sort: "newest",
        run_type: ["prod"],
      } satisfies ListTracesFilters,
    },
  ];

  const [saveName, setSaveName] = React.useState("");
  const [saveColor, setSaveColor] = React.useState<string | undefined>(undefined);
  const [saveOpen, setSaveOpen] = React.useState(false);

  const handleSave = () => {
    const trimmed = saveName.trim();
    if (!trimmed) return;
    onSave(trimmed, filters, saveColor);
    setSaveName("");
    setSaveColor(undefined);
    setSaveOpen(false);
  };

  return (
    <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto border-b px-4 py-3">
      {/* Built-in views */}
      {builtInViews.map((view) => (
        <button
          key={view.name}
          type="button"
          onClick={() => {
            onChange(view.next);
            onApply(view.next, undefined);
          }}
          className={`group/view inline-flex h-8 shrink-0 items-center gap-2 rounded-md border px-3 text-xs transition-colors ${
            view.active
              ? "border-primary/20 bg-accent text-accent-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <view.icon className="size-3" />
          {view.name}
          <Badge variant="secondary" className="h-5 px-1.5 text-[0.65rem]">
            {view.count}
          </Badge>
        </button>
      ))}

      {/* Saved filter pills */}
      {savedFilters.map((sf) => (
        <button
          key={sf.id}
          type="button"
          onClick={() => onApply(sf.filters, sf.id)}
          className={`group/sf relative inline-flex h-8 shrink-0 items-center gap-2 rounded-md border px-3 pr-7 text-xs transition-colors ${
            activeFilterId === sf.id
              ? "border-primary/20 bg-accent text-accent-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <span
            className={`size-2 shrink-0 rounded-full ${colorDotClass(sf.color)}`}
          />
          {sf.name}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sf.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onDelete(sf.id);
              }
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover/sf:opacity-100"
          >
            <X className="size-3" />
          </span>
        </button>
      ))}

      {/* Save current filter button */}
      <Popover open={saveOpen} onOpenChange={setSaveOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-xs text-muted-foreground"
          >
            <Plus className="size-3" />
            Save filter
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 space-y-3 p-3">
          <p className="text-xs font-medium">Save current filters</p>
          <Input
            placeholder="Filter name"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            className="h-8 text-xs"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Color:</span>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() =>
                  setSaveColor(saveColor === c.name ? undefined : c.name)
                }
                className={`size-5 rounded-full border-2 transition-colors ${c.class} ${
                  saveColor === c.name
                    ? "border-foreground"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
              />
            ))}
          </div>
          <Button
            size="sm"
            className="h-8 w-full text-xs"
            disabled={!saveName.trim()}
            onClick={handleSave}
          >
            Save
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function isDefaultView(filters: ListTracesFilters) {
  return (
    !filters.search &&
    !filters.status?.length &&
    !filters.platform?.length &&
    !filters.model?.length &&
    !filters.user_id &&
    !filters.run_id &&
    !filters.run_type?.length &&
    !filters.use_case?.length &&
    !filters.group &&
    !filters.metadata?.length
  );
}

function isSimpleStatusView(
  filters: ListTracesFilters,
  status: "error" | "running"
) {
  return (
    filters.status?.length === 1 &&
    filters.status[0] === status &&
    !filters.search &&
    !filters.platform?.length &&
    !filters.model?.length &&
    !filters.user_id &&
    !filters.run_id &&
    !filters.run_type?.length &&
    !filters.use_case?.length &&
    !filters.group &&
    !filters.metadata?.length
  );
}

function isSimpleRunTypeView(filters: ListTracesFilters, runType: "prod") {
  return (
    filters.run_type?.length === 1 &&
    filters.run_type[0] === runType &&
    !filters.search &&
    !filters.status?.length &&
    !filters.platform?.length &&
    !filters.model?.length &&
    !filters.user_id &&
    !filters.run_id &&
    !filters.use_case?.length &&
    !filters.group &&
    !filters.metadata?.length
  );
}
