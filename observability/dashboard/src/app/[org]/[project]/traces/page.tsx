import { listTraces } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { TracesClient } from "./traces-client";
import type { ListTracesFilters, Platform, RunType, TraceStatus } from "@/lib/types";

interface Props {
  params: Promise<{ org: string; project: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const TRACE_STATUSES: TraceStatus[] = ["success", "error", "running"];
const PLATFORMS: Platform[] = ["web", "mobile", "desktop", "api", "robotics", "voice"];
const RUN_TYPES: RunType[] = ["prod", "dev", "eval", "debug"];
const TIME_RANGES: NonNullable<ListTracesFilters["time_range"]>[] = ["1h", "24h", "7d", "30d", "all"];
const SORTS: NonNullable<ListTracesFilters["sort"]>[] = ["newest", "oldest", "slowest", "most_expensive"];

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

  return (
    <TracesClient
      initial={data}
      orgSlug={currentOrg.slug}
      projectSlug={currentProject.slug}
      projectId={currentProject.id}
      initialFilters={initialFilters}
    />
  );
}

function parseTraceFilters(
  searchParams: Record<string, string | string[] | undefined> | undefined
): ListTracesFilters {
  if (!searchParams) {
    return { time_range: "all", sort: "newest" };
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
    .map((key, index) => ({ key, value: metaValues[index] ?? "" }))
    .filter((f) => f.key && f.value);

  return {
    search: getString("q") ?? getString("search") ?? undefined,
    status: getArray("status").filter((v): v is TraceStatus => TRACE_STATUSES.includes(v as TraceStatus)),
    platform: getArray("platform").filter((v): v is Platform => PLATFORMS.includes(v as Platform)),
    model: getArray("model"),
    run_type: getArray("run_type").filter((v): v is RunType => RUN_TYPES.includes(v as RunType)),
    use_case: getArray("use_case"),
    user_id: getString("user_id") ?? undefined,
    run_id: getString("run_id") ?? undefined,
    group: getString("group") ?? undefined,
    metadata,
    time_range: TIME_RANGES.includes(timeRange as NonNullable<ListTracesFilters["time_range"]>)
      ? (timeRange as NonNullable<ListTracesFilters["time_range"]>)
      : "all",
    sort: SORTS.includes(sort as NonNullable<ListTracesFilters["sort"]>)
      ? (sort as NonNullable<ListTracesFilters["sort"]>)
      : "newest",
  };
}
