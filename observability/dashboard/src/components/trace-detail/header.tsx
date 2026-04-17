"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Braces, Flag, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "@/components/trace-list/status";
import { flagTraceAction } from "@/actions/traces";
import { formatCost, formatLatency, formatNumber, formatRelative } from "@/lib/utils";
import type { Trace } from "@/lib/types";

export function TraceHeader({
  trace,
  showJson,
  onToggleJson,
}: {
  trace: Trace;
  showJson: boolean;
  onToggleJson: (v: boolean) => void;
}) {
  const meta = STATUS_META[trace.status];
  const [pending, startTransition] = React.useTransition();

  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-2 px-6 py-4">
        <Button asChild variant="ghost" size="icon-sm">
          <Link href="../traces">
            <ArrowLeft className="size-3.5" />
          </Link>
        </Button>
        <meta.Icon className={`size-4 ${meta.color}`} />
        <h1 className="text-sm font-semibold">{trace.name}</h1>
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <span className="font-mono text-[0.625rem] text-muted-foreground">{trace.trace_id}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await flagTraceAction(trace.trace_id);
                toast.success("Flagged for review");
              });
            }}
          >
            <Flag className="size-3" /> Flag for review
          </Button>
          <Button variant="outline" size="sm" onClick={() => location.reload()}>
            <RefreshCw className="size-3" /> Refresh
          </Button>
          <Button
            variant={showJson ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleJson(!showJson)}
          >
            <Braces className="size-3" /> JSON
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5 border-t border-border bg-muted/30 px-6 py-3 text-[0.625rem] text-muted-foreground">
        <Stat label="latency" value={formatLatency(trace.latency_ms)} />
        <Stat label="tokens" value={formatNumber(trace.token_usage?.total)} />
        <Stat label="cost" value={formatCost(trace.cost_usd)} />
        <Stat label="steps" value={String(trace.step_count ?? trace.steps?.length ?? 0)} />
        {trace.model && <Stat label="model" value={trace.model} mono />}
        {trace.platform && <Stat label="platform" value={trace.platform} />}
        {trace.run_id && <Stat label="run" value={trace.run_id} mono />}
        {trace.user_id && <Stat label="user" value={trace.user_id} mono />}
        <span className="ml-auto">
          {formatRelative(trace.started_at)} · {new Date(trace.started_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="uppercase tracking-wider">{label}</span>
      <span
        className={`text-foreground ${mono ? "font-mono" : "font-medium"} tabular-nums`}
      >
        {value}
      </span>
    </span>
  );
}
