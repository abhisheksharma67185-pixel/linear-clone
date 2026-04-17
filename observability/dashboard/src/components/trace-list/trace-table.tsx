"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCost, formatLatency, formatNumber, formatRelative } from "@/lib/utils";
import type { TraceSummary } from "@/lib/types";
import { STATUS_META } from "./status";
import { TRACE_COLUMN_LABELS, type TraceColumn, type TraceDensity } from "./view-config";

export function TraceTable({
  traces,
  orgSlug,
  projectSlug,
  columns,
  density,
}: {
  traces: TraceSummary[];
  orgSlug: string;
  projectSlug: string;
  columns: TraceColumn[];
  density: TraceDensity;
}) {
  if (traces.length === 0) {
    return (
      <div className="grid min-h-72 place-items-center p-10">
        <div className="text-center">
          <p className="text-sm font-medium">No traces match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust filters, widen the time range, or clear search.
          </p>
        </div>
      </div>
    );
  }

  const show = (column: TraceColumn) => columns.includes(column);
  const cellClassName = cn(density === "compact" ? "py-2" : "py-4");
  const nameClassName = cn("min-w-[240px]", density === "compact" ? "py-2" : "py-4");

  return (
    <div className="overflow-hidden rounded-b-xl">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column}
                className={cn(
                  (column === "latency" ||
                    column === "tokens" ||
                    column === "cost" ||
                    column === "started") &&
                    "text-right"
                )}
              >
                {TRACE_COLUMN_LABELS[column]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {traces.map((trace) => {
            const meta = STATUS_META[trace.status];

            return (
              <TableRow key={trace.trace_id}>
                {show("name") && (
                  <TableCell className={nameClassName}>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/${orgSlug}/${projectSlug}/traces/${trace.trace_id}`}
                        className="font-medium hover:underline"
                      >
                        {trace.name}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground">
                        {trace.trace_id}
                      </span>
                    </div>
                  </TableCell>
                )}
                {show("status") && (
                  <TableCell className={cellClassName}>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </TableCell>
                )}
                {show("metadata") && (
                  <TableCell className={cellClassName}>
                    <div className="flex flex-wrap gap-1.5">
                      {trace.run_type && <Badge variant="outline">{trace.run_type}</Badge>}
                      {trace.platform && <Badge variant="ghost">{trace.platform}</Badge>}
                      {trace.model && (
                        <span className="truncate font-mono text-xs text-muted-foreground">
                          {trace.model}
                        </span>
                      )}
                    </div>
                  </TableCell>
                )}
                {show("latency") && (
                  <TableCell className={cn(cellClassName, "text-right tabular-nums")}>
                    {formatLatency(trace.latency_ms)}
                  </TableCell>
                )}
                {show("tokens") && (
                  <TableCell className={cn(cellClassName, "text-right tabular-nums")}>
                    {formatNumber(trace.total_tokens)}
                  </TableCell>
                )}
                {show("cost") && (
                  <TableCell className={cn(cellClassName, "text-right tabular-nums")}>
                    {formatCost(trace.cost_usd)}
                  </TableCell>
                )}
                {show("started") && (
                  <TableCell className={cn(cellClassName, "text-right text-muted-foreground")}>
                    {formatRelative(trace.started_at)}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
