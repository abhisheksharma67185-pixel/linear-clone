"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { triggerClusterDiscoveryAction } from "@/actions/clusters";
import type { Cluster } from "@/lib/types";

const CATEGORY_VARIANT: Record<Cluster["category"], "default" | "destructive" | "warning" | "ghost"> = {
  input: "default",
  behavior: "warning",
  error: "destructive",
  unknown: "ghost",
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

export function ClustersGrid({
  clusters,
  projectId,
  orgSlug,
  projectSlug,
}: {
  clusters: Cluster[];
  projectId: string;
  orgSlug: string;
  projectSlug: string;
}) {
  const [discovering, setDiscovering] = React.useState(false);

  async function handleDiscover() {
    setDiscovering(true);
    try {
      await triggerClusterDiscoveryAction(projectId);
    } catch (e) {
      console.error("Discovery failed:", e);
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3">
        <Button onClick={handleDiscover} disabled={discovering} variant="outline" size="xs">
          <Sparkles className="size-3" />
          {discovering ? "Discovering..." : "Discover now"}
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {clusters.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-10">
            <div className="text-center">
              <p className="text-sm font-medium">No clusters discovered yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Run discovery to group traces by semantic similarity.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clusters.map((cluster) => (
              <Link
                key={cluster.id}
                href={`/${orgSlug}/${projectSlug}/clusters/${cluster.id}`}
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <CardTitle className="text-sm">{cluster.label}</CardTitle>
                    <Badge variant={CATEGORY_VARIANT[cluster.category]}>
                      {cluster.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cluster.description && (
                      <p className="text-[0.625rem] text-muted-foreground line-clamp-3">
                        {cluster.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[0.625rem] text-muted-foreground">
                      <span className="tabular-nums font-medium text-foreground">
                        {cluster.trace_count} traces
                      </span>
                      <span>Last seen {timeAgo(cluster.last_seen_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
