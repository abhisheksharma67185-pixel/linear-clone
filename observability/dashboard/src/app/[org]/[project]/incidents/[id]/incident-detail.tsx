"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateIncidentStatusAction } from "@/actions/incidents";
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

export function IncidentDetail({
  incident,
  orgSlug,
  projectSlug,
}: {
  incident: Incident;
  orgSlug: string;
  projectSlug: string;
}) {
  const [status, setStatus] = React.useState(incident.status);
  const [updating, setUpdating] = React.useState(false);

  async function handleStatusChange(newStatus: "resolved" | "dismissed") {
    setUpdating(true);
    try {
      await updateIncidentStatusAction(
        incident.id,
        newStatus,
        `/${orgSlug}/${projectSlug}/incidents/${incident.id}`
      );
      setStatus(newStatus);
    } catch (e) {
      console.error("Status update failed:", e);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      {/* Header info */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 space-y-1">
          <h2 className="text-lg font-semibold">{incident.title}</h2>
          {incident.summary && (
            <p className="text-xs text-muted-foreground">{incident.summary}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
          <Badge variant={SEVERITY_VARIANT[incident.severity]}>{incident.severity}</Badge>
          <span className="text-xs text-muted-foreground tabular-nums">
            {incident.trace_count} traces
          </span>
        </div>
      </div>

      {/* Actions */}
      {(status === "open" || status === "investigating") && (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            disabled={updating}
            onClick={() => handleStatusChange("resolved")}
          >
            <CheckCircle2 className="size-3" />
            {updating ? "Updating..." : "Resolve"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={updating}
            onClick={() => handleStatusChange("dismissed")}
          >
            <XCircle className="size-3" />
            Dismiss
          </Button>
        </div>
      )}

      {/* Root cause */}
      {incident.root_cause && (
        <Card>
          <CardHeader>
            <CardTitle>Root cause</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-xs font-mono text-muted-foreground leading-relaxed">
              {incident.root_cause}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Error pattern */}
      {incident.error_pattern && (
        <Card>
          <CardHeader>
            <CardTitle>Error pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xs font-mono text-destructive bg-destructive/5 px-1.5 py-0.5 rounded">
              {incident.error_pattern}
            </code>
          </CardContent>
        </Card>
      )}

      {/* Time range */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-muted-foreground">
          <p>First seen: {new Date(incident.first_seen_at).toLocaleString()}</p>
          <p>Last seen: {new Date(incident.last_seen_at).toLocaleString()}</p>
          <p>Created: {new Date(incident.created_at).toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Linked traces */}
      {incident.trace_ids && incident.trace_ids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linked traces ({incident.trace_ids.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trace ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incident.trace_ids.map((tid) => (
                  <TableRow key={tid}>
                    <TableCell>
                      <Link
                        href={`/${orgSlug}/${projectSlug}/traces/${tid}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {tid}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
