import { BarChart3, Binary, BrainCircuit, Sparkles, Target } from "lucide-react";
import { listMetrics, listMetricEvents } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug, listProjectsForOrg } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProjectSwitcher } from "@/components/org-switcher";
import { MetricsGrid } from "./metrics-grid";
import { formatNumber } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function MetricsPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();

  let metrics: Awaited<ReturnType<typeof listMetrics>> = [];
  const eventsMap: Record<string, Awaited<ReturnType<typeof listMetricEvents>>> = {};

  try {
    metrics = await listMetrics(currentProject.id);
    await Promise.all(
      metrics.map(async (m) => {
        try {
          eventsMap[m.id] = await listMetricEvents(m.id, 50);
        } catch {
          eventsMap[m.id] = [];
        }
      })
    );
  } catch (e) {
    console.error("listMetrics failed:", e);
  }

  const orgProjects = await listProjectsForOrg(currentOrg.id);
  const automatedCount = metrics.filter((metric) => metric.type === "automated").length;
  const observedCount = metrics.filter((metric) => metric.type === "observed").length;
  const totalEvaluations = Object.values(eventsMap).reduce((sum, events) => sum + events.length, 0);
  const passRates = Object.values(eventsMap)
    .map((events) => {
      const withPassed = events.filter((event) => event.passed !== undefined);
      if (withPassed.length === 0) return null;
      const passed = withPassed.filter((event) => event.passed).length;
      return Math.round((passed / withPassed.length) * 100);
    })
    .filter((value): value is number => value !== null);
  const averagePassRate = passRates.length
    ? Math.round(passRates.reduce((sum, value) => sum + value, 0) / passRates.length)
    : null;

  return (
    <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4 md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6">
        <section className="rounded-xl border bg-card px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground">Evaluation control</p>
                <Badge variant="outline" className="gap-1.5">
                  <Sparkles className="size-3" />
                  {formatNumber(totalEvaluations)} events tracked
                </Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Metrics for {currentProject.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review automated and observed metrics side by side, then drill into the
                event stream to see whether quality is drifting or holding steady.
              </p>
              <div className="mt-5">
                <ProjectSwitcher
                  orgId={currentOrg.id}
                  currentSlug={currentProject.slug}
                  orgSlug={currentOrg.slug}
                  projects={orgProjects.map((p) => ({ slug: p.slug, name: p.name }))}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricOverviewStat label="Metrics" value={formatNumber(metrics.length)} icon={BarChart3} />
              <MetricOverviewStat label="Automated" value={formatNumber(automatedCount)} icon={BrainCircuit} />
              <MetricOverviewStat label="Observed" value={formatNumber(observedCount)} icon={Binary} />
              <MetricOverviewStat
                label="Avg pass rate"
                value={averagePassRate === null ? "–" : `${averagePassRate}%`}
                icon={Target}
              />
            </div>
          </div>
        </section>

        <div className="flex-1">
          <MetricsGrid
            metrics={metrics}
            eventsMap={eventsMap}
          />
        </div>
      </div>
    </div>
  );
}

function MetricOverviewStat({
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
