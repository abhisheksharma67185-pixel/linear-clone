"use client";

import Link from "next/link";
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
import type { Cluster } from "@/lib/types";

const CATEGORY_VARIANT: Record<Cluster["category"], "default" | "destructive" | "warning" | "ghost"> = {
  input: "default",
  behavior: "warning",
  error: "destructive",
  unknown: "ghost",
};

export function ClusterDetail({
  cluster,
  orgSlug,
  projectSlug,
}: {
  cluster: Cluster;
  orgSlug: string;
  projectSlug: string;
}) {
  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      {/* Header info */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 space-y-1">
          <h2 className="text-lg font-semibold">{cluster.label}</h2>
          {cluster.description && (
            <p className="text-xs text-muted-foreground">{cluster.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={CATEGORY_VARIANT[cluster.category]}>
            {cluster.category}
          </Badge>
          <span className="text-xs text-muted-foreground tabular-nums">
            {cluster.trace_count} traces
          </span>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-xs text-muted-foreground">
          <p>First seen: {new Date(cluster.first_seen_at).toLocaleString()}</p>
          <p>Last seen: {new Date(cluster.last_seen_at).toLocaleString()}</p>
          <p>Created: {new Date(cluster.created_at).toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Representative trace */}
      {cluster.representative_trace_id && (
        <Card>
          <CardHeader>
            <CardTitle>Representative trace</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/${orgSlug}/${projectSlug}/traces/${cluster.representative_trace_id}`}
              className="font-mono text-xs text-primary hover:underline"
            >
              {cluster.representative_trace_id}
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Traces with distances */}
      {cluster.traces && cluster.traces.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Traces ({cluster.traces.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trace ID</TableHead>
                  <TableHead className="text-right">Distance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cluster.traces.map((t) => (
                  <TableRow key={t.trace_id}>
                    <TableCell>
                      <Link
                        href={`/${orgSlug}/${projectSlug}/traces/${t.trace_id}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {t.trace_id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {t.distance.toFixed(3)}
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
