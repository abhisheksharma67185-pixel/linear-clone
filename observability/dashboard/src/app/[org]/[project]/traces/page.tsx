import { Activity, Radio, ShieldAlert, TimerReset, Wallet } from "lucide-react";
import { listTraces } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { TracesClient } from "./traces-client";
import { Badge } from "@/components/ui/badge";
import { formatCost, formatLatency, formatNumber } from "@/lib/utils";
import type { ListTracesFilters, Platform, RunType, TraceStatus } from "@/lib/types";

interface Props {
  params: Promise<{ org: string; project: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const TRACE_STATUSES: TraceStatus[] = ["success", "error", "running"];
const PLATFORMS: Platform[] = ["web", "mobile", "desktop", "api", "robotics", "voice"];
const RUN_TYPES: RunType[] = ["prod", "dev", "eval", "debug"];
const TIME_RANGES: NonNullable<ListTracesFilters["time_range"]>[] = ["1h", "24h", "7d", "30d", "all"];
const SORTS: NonNullable<ListTracesFilters["sort"]>[] = [
  "newest",
  "oldest",
  "slowest",
  "most_expensive",
];

export default async function TracesPage({ params, searchParams }: Props) {
  const { org, project } = await params;
  const query = searchParams ? await searchParams : undefined;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();
  const initialFilters = parseTraceFilters(query);

  let data: Awaited<ReturnType<typeof listTraces>>["data"] = [];
  try {
    const r = await listTraces(currentProject.id, { limit: 200 });
    data = r.data ?? [];
  } catch (e) {
    console.error("listTraces failed:", e);
  }

  const totalCost = data.reduce((sum, trace) => sum + (trace.cost_usd ?? 0), 0);
  const avgLatency = data.length
    ? Math.round(
        data.reduce((sum, trace) => sum + (trace.latency_ms ?? 0), 0) / Math.max(data.length, 1)
      )
    : null;
  const errorCount = data.filter((trace) => trace.status === "error").length;

  return (
    <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4 md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6">
        <section className="rounded-xl border bg-card px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground">Trace observatory</p>
                <Badge variant="success" className="gap-1.5">
                  <Radio className="size-2.5 animate-pulse" />
                  Real-time
                </Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Live traces for {currentProject.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Scan execution quality, latency, and cost from one feed. Search feels like
                search, but the surface is tuned for operational triage.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <TraceHeroStat label="Loaded" value={formatNumber(data.length)} icon={Activity} />
              <TraceHeroStat label="Errors" value={formatNumber(errorCount)} icon={ShieldAlert} />
              <TraceHeroStat label="Avg latency" value={formatLatency(avgLatency)} icon={TimerReset} />
              <TraceHeroStat label="Spend" value={formatCost(totalCost)} icon={Wallet} />
            </div>
          </div>
        </section>

      <TracesClient
        initial={data}
        orgSlug={currentOrg.slug}
        projectSlug={currentProject.slug}
        projectId={currentProject.id}
        initialFilters={initialFilters}
      />
      </div>
    </div>
  );
}

function TraceHeroStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function parseTraceFilters(
  searchParams: Record<string, string | string[] | undefined> | undefined
): ListTracesFilters {
  if (!searchParams) {
    return {
      time_range: "24h",
      sort: "newest",
    };
  }

  const getString = (key: string) => {
    const value = searchParams[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const getArray = (key: string) => {
    const value = searchParams[key];
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const timeRange = getString("time_range");
  const sort = getString("sort");
  const metaKeys = getArray("meta_key");
  const metaValues = getArray("meta_value");
  const metadata = metaKeys
    .map((key, index) => ({
      key,
      value: metaValues[index] ?? "",
    }))
    .filter((filter) => filter.key && filter.value);

  return {
    search: getString("q") ?? getString("search") ?? undefined,
    status: getArray("status").filter((value): value is TraceStatus =>
      TRACE_STATUSES.includes(value as TraceStatus)
    ),
    platform: getArray("platform").filter((value): value is Platform =>
      PLATFORMS.includes(value as Platform)
    ),
    model: getArray("model"),
    run_type: getArray("run_type").filter((value): value is RunType =>
      RUN_TYPES.includes(value as RunType)
    ),
    use_case: getArray("use_case"),
    user_id: getString("user_id") ?? undefined,
    run_id: getString("run_id") ?? undefined,
    group: getString("group") ?? undefined,
    metadata,
    time_range: TIME_RANGES.includes(timeRange as NonNullable<ListTracesFilters["time_range"]>)
      ? (timeRange as NonNullable<ListTracesFilters["time_range"]>)
      : "24h",
    sort: SORTS.includes(sort as NonNullable<ListTracesFilters["sort"]>)
      ? (sort as NonNullable<ListTracesFilters["sort"]>)
      : "newest",
  };
}
