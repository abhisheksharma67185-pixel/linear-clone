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
import type { MonitorConfig } from "@/lib/types";
import { formatRelative } from "@/lib/utils";

function thresholdSummary(monitor: MonitorConfig): string {
  const warn = monitor.warn_threshold !== undefined ? `warn ${monitor.warn_threshold}` : null;
  const critical =
    monitor.critical_threshold !== undefined ? `critical ${monitor.critical_threshold}` : null;
  return [warn, critical].filter(Boolean).join(" · ") || "No thresholds";
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
            <TableHead>Thresholds</TableHead>
            <TableHead>Window</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-24 text-right">State</TableHead>
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
              <TableCell className="text-muted-foreground">{thresholdSummary(monitor)}</TableCell>
              <TableCell className="text-muted-foreground">{monitor.window_minutes} min</TableCell>
              <TableCell className="text-muted-foreground">{formatRelative(monitor.updated_at)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
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
