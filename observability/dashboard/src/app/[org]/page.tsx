import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CircleDollarSign,
  FolderKanban,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Zap,
} from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { LatencyHistogram } from "@/components/charts/latency-histogram";
import { TokenCostOverTime } from "@/components/charts/token-cost-over-time";
import { STATUS_META } from "@/components/trace-list/status";
import { listTraces } from "@/lib/api";
import { getOrgBySlug, listProjectsForOrg } from "@/lib/workspace";
import { formatCost, formatLatency, formatNumber, formatRelative } from "@/lib/utils";
import type { TraceSummary } from "@/lib/types";

interface Props {
  params: Promise<{ org: string }>;
}

export default async function OrgOverview({ params }: Props) {
  const { org } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();

  const projects = await listProjectsForOrg(currentOrg.id);
  const defaultProject = projects[0];

  let traces: TraceSummary[] = [];
  if (defaultProject) {
    try {
      const r = await listTraces(defaultProject.id, { limit: 120 });
      traces = r.data ?? [];
    } catch {}
  }

  const totalTokens = traces.reduce((sum, trace) => sum + (trace.total_tokens ?? 0), 0);
  const totalCost = traces.reduce((sum, trace) => sum + (trace.cost_usd ?? 0), 0);
  const successCount = traces.filter((trace) => trace.status === "success").length;
  const successRate = traces.length ? Math.round((successCount / traces.length) * 100) : null;
  const p95Latency = percentile(
    traces.map((trace) => trace.latency_ms ?? 0).filter((latency) => latency > 0),
    0.95
  );

  const tokenSeries = buildTokenSeries(traces);
  const latencyBuckets = buildLatencyBuckets(traces);
  const recentTraces = traces.slice(0, 8);
  const traceFeedHref = defaultProject
    ? `/${currentOrg.slug}/${defaultProject.slug}/traces`
    : null;

  return (
    <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4 md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6">
        <section className="rounded-xl border bg-card px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_22rem]">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Organization overview</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {currentOrg.name}
                </h1>
                <Badge variant="outline" className="capitalize">
                  {currentOrg.plan} plan
                </Badge>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Operational view across traces, spend, and latency for your primary project.
                The shell is tuned for fast scanning, not dashboard wallpaper.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {traceFeedHref ? (
                  <Button asChild size="lg">
                    <Link href={traceFeedHref}>
                      Open live traces
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" disabled>
                    Open live traces
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                )}
                <CreateProjectDialog
                  orgId={currentOrg.id}
                  orgSlug={currentOrg.slug}
                  trigger={
                    <Button variant="outline" size="lg">
                      Create project
                    </Button>
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <SignalTile
                label="Projects"
                value={formatNumber(projects.length)}
                hint="Live in this org"
                icon={FolderKanban}
              />
              <SignalTile
                label="Success rate"
                value={successRate === null ? "–" : `${successRate}%`}
                hint={traces.length ? `${traces.length} traces sampled` : "No traces yet"}
                icon={ShieldCheck}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Traces sampled"
            value={formatNumber(traces.length)}
            detail={defaultProject ? `Project · ${defaultProject.name}` : "No active project"}
            icon={Activity}
          />
          <StatCard
            label="Tokens"
            value={formatNumber(totalTokens)}
            detail="From recent trace volume"
            icon={Zap}
          />
          <StatCard
            label="Spend"
            value={formatCost(totalCost)}
            detail="Estimated trace cost"
            icon={CircleDollarSign}
          />
          <StatCard
            label="p95 latency"
            value={formatLatency(p95Latency)}
            detail="Tail latency for sampled runs"
            icon={TimerReset}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Spend trajectory</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Tokens and cost over recent activity
                </h2>
              </div>
              <Badge variant="outline" className="shrink-0">
                <Sparkles />
                Derived from latest traces
              </Badge>
            </div>
            <TokenCostOverTime data={tokenSeries} />
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="mb-5">
              <p className="text-sm font-medium text-muted-foreground">Latency profile</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Distribution across fast and slow paths
              </h2>
            </div>
            <LatencyHistogram data={latencyBuckets} />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-2 pb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent traces</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {defaultProject
                  ? "Latest executions from the active project"
                  : "Create a project to start collecting traces"}
              </h2>
            </div>
            {traceFeedHref && (
              <Button asChild variant="outline">
                <Link href={traceFeedHref}>View full trace feed</Link>
              </Button>
            )}
          </div>

          {recentTraces.length === 0 ? (
            <div className="grid min-h-56 place-items-center px-6 py-10 text-center">
              <div>
                <p className="text-base font-semibold">
                  {defaultProject ? "No traces yet" : "No project yet"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {defaultProject
                    ? "Send data from the SDKs and this feed becomes your operational baseline."
                    : "Create a project first, then send data from the SDKs to populate this feed."}
                </p>
                {!defaultProject && (
                  <div className="mt-4 flex justify-center">
                    <CreateProjectDialog
                      orgId={currentOrg.id}
                      orgSlug={currentOrg.slug}
                      trigger={
                        <Button>Create first project</Button>
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ul className="mt-2 space-y-2">
              {recentTraces.map((trace) => {
                const meta = STATUS_META[trace.status];
                return (
                  <li key={trace.trace_id}>
                    <Link
                      href={`/${currentOrg.slug}/${defaultProject.slug}/traces/${trace.trace_id}`}
                      className="flex flex-col gap-3 rounded-lg border px-4 py-4 transition-colors hover:bg-accent/40 md:flex-row md:items-center"
                    >
                      <div className={`grid size-10 shrink-0 place-items-center rounded-md ${meta.bg}`}>
                        <meta.Icon className={`size-4 ${meta.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold">{trace.name}</span>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {trace.model && <span>{trace.model}</span>}
                          {trace.user_id && <span>{trace.user_id}</span>}
                          {trace.platform && <span className="capitalize">{trace.platform}</span>}
                          {trace.run_type && <span className="uppercase tracking-[0.14em]">{trace.run_type}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs md:w-[22rem]">
                        <MetricCell label="Latency" value={formatLatency(trace.latency_ms)} />
                        <MetricCell label="Cost" value={formatCost(trace.cost_usd)} />
                        <MetricCell label="Started" value={formatRelative(trace.started_at)} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function SignalTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card px-5 py-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="grid size-8 place-items-center rounded-md bg-muted text-foreground">
          <Icon className="size-4" />
        </div>
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2 text-right">
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[index] ?? null;
}

function buildTokenSeries(traces: TraceSummary[]) {
  const byDay = new Map<string, { tokens: number; cost: number }>();

  for (const trace of traces) {
    const day = trace.started_at.slice(0, 10);
    const current = byDay.get(day) ?? { tokens: 0, cost: 0 };
    current.tokens += trace.total_tokens ?? 0;
    current.cost += trace.cost_usd ?? 0;
    byDay.set(day, current);
  }

  const items = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([day, value]) => ({
      t: day.slice(5),
      tokens: value.tokens,
      cost: Number(value.cost.toFixed(2)),
    }));

  if (items.length > 0) return items;

  return Array.from({ length: 8 }, (_, index) => ({
    t: `D-${8 - index}`,
    tokens: 0,
    cost: 0,
  }));
}

function buildLatencyBuckets(traces: TraceSummary[]) {
  const buckets = [
    { bucket: "<250ms", max: 250, count: 0 },
    { bucket: "250-500", max: 500, count: 0 },
    { bucket: "500ms-1s", max: 1000, count: 0 },
    { bucket: "1-2s", max: 2000, count: 0 },
    { bucket: "2-5s", max: 5000, count: 0 },
    { bucket: "5-10s", max: 10000, count: 0 },
    { bucket: "10s+", max: Number.POSITIVE_INFINITY, count: 0 },
  ];

  for (const trace of traces) {
    const latency = trace.latency_ms ?? 0;
    const bucket = buckets.find((candidate) => latency < candidate.max);
    if (bucket) bucket.count += 1;
  }

  return buckets.map(({ bucket, count }) => ({ bucket, count }));
}
