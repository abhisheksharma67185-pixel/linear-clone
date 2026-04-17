"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCost, formatLatency, formatNumber, formatRelative } from "@/lib/utils";
import { STATUS_META } from "./status";
import type { TraceSummary } from "@/lib/types";

export function TraceRow({
  trace,
  orgSlug,
  projectSlug,
  style,
}: {
  trace: TraceSummary;
  orgSlug: string;
  projectSlug: string;
  style?: React.CSSProperties;
}) {
  const meta = STATUS_META[trace.status];
  const shortId = trace.trace_id.length > 20
    ? trace.trace_id.slice(0, 8) + "…" + trace.trace_id.slice(-6)
    : trace.trace_id;

  return (
    <Link
      href={`/${orgSlug}/${projectSlug}/traces/${trace.trace_id}`}
      style={style}
      className="flex h-full items-center px-1"
    >
      <div className="flex w-full items-center gap-4 rounded-[1.4rem] border border-border/65 bg-card/78 px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.45)_inset] transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card hover:shadow-[0_22px_44px_-32px_color-mix(in_oklab,var(--primary)_55%,transparent)]">
        <div className="flex shrink-0 items-center">
          <div className={`grid size-10 place-items-center rounded-full ${meta.bg ?? "bg-muted"}`}>
            <meta.Icon className={`size-4 ${meta.color}`} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{trace.name}</span>
            <Badge variant={meta.variant}>{meta.label}</Badge>
            <span className="shrink-0 rounded-full bg-muted/65 px-2 py-1 font-mono text-[0.66rem] text-muted-foreground/75">
              {shortId}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {trace.user_id && (
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground/55">user</span> {trace.user_id}
              </span>
            )}
            {trace.run_type && (
              <Badge variant="outline" className="h-5 px-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em]">
                {trace.run_type}
              </Badge>
            )}
            {trace.model && (
              <span className="font-mono text-[0.7rem] text-muted-foreground/72">{trace.model}</span>
            )}
            {trace.platform && (
              <span className="capitalize text-muted-foreground/72">{trace.platform}</span>
            )}
            {trace.tags?.slice(0, 3).map((t) => (
              <Badge key={t} variant="ghost" className="h-5 px-2 text-[0.58rem] uppercase tracking-[0.12em]">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-3 text-xs xl:flex">
          <TraceMetric label="Latency" value={formatLatency(trace.latency_ms)} emphasized />
          <TraceMetric label="Tokens" value={formatNumber(trace.total_tokens)} />
          <TraceMetric label="Cost" value={formatCost(trace.cost_usd)} />
          <TraceMetric label="Started" value={formatRelative(trace.started_at)} />
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 text-xs xl:hidden">
          <TraceMetric label="Latency" value={formatLatency(trace.latency_ms)} emphasized />
          <TraceMetric label="Started" value={formatRelative(trace.started_at)} />
        </div>
      </div>
    </Link>
  );
}

function TraceMetric({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="min-w-[5.25rem] rounded-[1rem] bg-muted/55 px-3 py-2 text-right">
      <div
        className={`tabular-nums ${emphasized ? "text-sm font-semibold text-foreground" : "text-sm text-foreground/88"}`}
      >
        {value}
      </div>
      <div className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
