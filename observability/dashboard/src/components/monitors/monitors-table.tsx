"use client";

import * as React from "react";
import { BellRing, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteMonitorConfigAction, updateMonitorConfigAction } from "@/actions/monitors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MonitorConfig, MonitorEvaluation } from "@/lib/types";
import { formatNumber, formatRelative } from "@/lib/utils";

function thresholdSummary(monitor: MonitorConfig): string {
  const warn = monitor.warn_threshold !== undefined ? `warn ${monitor.warn_threshold}` : null;
  const critical =
    monitor.critical_threshold !== undefined ? `critical ${monitor.critical_threshold}` : null;
  return [warn, critical].filter(Boolean).join(" · ") || "No thresholds";
}

function stateBadgeVariant(state: MonitorEvaluation["state"] | undefined) {
  switch (state) {
    case "critical":
      return "destructive";
    case "warn":
      return "warning";
    case "ok":
      return "success";
    default:
      return "secondary";
  }
}

function formatMonitorValue(monitor: MonitorConfig): string {
  const value = monitor.latest_evaluation?.value;
  if (value === undefined) {
    return "—";
  }
  switch (monitor.signal_key) {
    case "latency_ms":
      return `${Math.round(value)} ms`;
    case "error_rate":
    case "success_rate":
      return `${value.toFixed(1)}%`;
    case "cost_usd":
      return `$${value.toFixed(4)}`;
    case "trace_count":
    case "total_tokens":
      return formatNumber(Math.round(value));
    default:
      return value.toFixed(2);
  }
}

function evaluationLabel(monitor: MonitorConfig): string {
  const state = monitor.latest_evaluation?.state;
  switch (state) {
    case "critical":
      return "Critical";
    case "warn":
      return "Warn";
    case "ok":
      return "Healthy";
    case "paused":
      return "Paused";
    case "no_data":
      return "No data";
    case "unsupported":
      return "Unsupported";
    case "error":
      return "Query error";
    default:
      return "Unknown";
  }
}

export function MonitorsTable({ monitors }: { monitors: MonitorConfig[] }) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function toggle(monitorId: string, active: boolean) {
    setPendingId(monitorId);
    try {
      await updateMonitorConfigAction(monitorId, { active });
      toast.success(active ? "Monitor enabled" : "Monitor paused");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update monitor");
    } finally {
      setPendingId(null);
    }
  }

  async function remove(monitorId: string) {
    setPendingId(monitorId);
    try {
      await deleteMonitorConfigAction(monitorId);
      toast.success("Monitor deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete monitor");
    } finally {
      setPendingId(null);
    }
  }

  if (monitors.length === 0) {
    return (
      <div className="rounded-xl border bg-card px-6 py-12">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BellRing className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No monitors yet</EmptyTitle>
            <EmptyDescription>
              Create latency, error-rate, or cost thresholds and keep them scoped to this project.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Monitor</TableHead>
            <TableHead>Signal</TableHead>
            <TableHead>Current</TableHead>
            <TableHead>Thresholds</TableHead>
            <TableHead>Window</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-40 text-right">State</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monitors.map((monitor) => (
            <TableRow key={monitor.id}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{monitor.name}</span>
                    <Badge variant={monitor.active ? "success" : "secondary"}>
                      {monitor.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  {monitor.description ? (
                    <p className="max-w-[24rem] text-xs text-muted-foreground">{monitor.description}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{monitor.signal_key}</span>
                  <p className="text-xs text-muted-foreground">
                    {monitor.operator}
                    {monitor.group_by ? ` · grouped by ${monitor.group_by}` : ""}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{formatMonitorValue(monitor)}</span>
                  <p className="text-xs text-muted-foreground">
                    {monitor.latest_evaluation
                      ? `${formatNumber(monitor.latest_evaluation.sample_size)} traces in window`
                      : "No recent evaluation"}
                  </p>
                  {monitor.latest_evaluation?.group_states?.length ? (
                    <p className="text-xs text-muted-foreground">
                      Top group {monitor.latest_evaluation.group_states[0].group}
                    </p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{thresholdSummary(monitor)}</TableCell>
              <TableCell className="text-muted-foreground">{monitor.window_minutes} min</TableCell>
              <TableCell className="text-muted-foreground">{formatRelative(monitor.updated_at)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Badge variant={stateBadgeVariant(monitor.latest_evaluation?.state)}>
                    {evaluationLabel(monitor)}
                  </Badge>
                  <Switch
                    checked={monitor.active}
                    disabled={pendingId === monitor.id}
                    onCheckedChange={(checked) => void toggle(monitor.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={pendingId === monitor.id}
                    onClick={() => void remove(monitor.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
