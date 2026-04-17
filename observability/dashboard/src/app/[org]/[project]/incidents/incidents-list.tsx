"use client";

import * as React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { triggerIncidentDetectionAction } from "@/actions/incidents";
import type { Incident } from "@/lib/types";

const STATUS_VARIANT: Record<Incident["status"], "destructive" | "warning" | "success" | "ghost"> = {
  open: "destructive",
  investigating: "warning",
  resolved: "success",
  dismissed: "ghost",
};

const SEVERITY_VARIANT: Record<Incident["severity"], "destructive" | "warning" | "default" | "ghost"> = {
  critical: "destructive",
  high: "warning",
  medium: "default",
  low: "ghost",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function IncidentsList({
  incidents,
  projectId,
  orgSlug,
  projectSlug,
}: {
  incidents: Incident[];
  projectId: string;
  orgSlug: string;
  projectSlug: string;
}) {
  const [detecting, setDetecting] = React.useState(false);

  async function handleDetect() {
    setDetecting(true);
    try {
      await triggerIncidentDetectionAction(projectId);
    } catch (e) {
      console.error("Detection failed:", e);
    } finally {
      setDetecting(false);
    }
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10">
        <div className="text-center">
          <p className="text-sm font-medium">No incidents detected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Run detection to scan recent traces for anomalies.
          </p>
        </div>
        <Button onClick={handleDetect} disabled={detecting} size="sm">
          <Zap className="size-3" />
          {detecting ? "Detecting..." : "Detect now"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3">
        <Button onClick={handleDetect} disabled={detecting} variant="outline" size="xs">
          <Zap className="size-3" />
          {detecting ? "Detecting..." : "Detect now"}
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Traces</TableHead>
              <TableHead>First seen</TableHead>
              <TableHead>Last seen</TableHead>
              <TableHead>Root cause</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((inc) => (
              <TableRow key={inc.id}>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[inc.status]}>{inc.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={SEVERITY_VARIANT[inc.severity]}>{inc.severity}</Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/${orgSlug}/${projectSlug}/incidents/${inc.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {inc.title}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">{inc.trace_count}</TableCell>
                <TableCell className="text-muted-foreground">{timeAgo(inc.first_seen_at)}</TableCell>
                <TableCell className="text-muted-foreground">{timeAgo(inc.last_seen_at)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {inc.root_cause?.slice(0, 100) ?? "--"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
