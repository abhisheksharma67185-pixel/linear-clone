import { AlertTriangle, BellRing, TimerReset } from "lucide-react";
import { notFound } from "next/navigation";
import { CreateMonitorDialog } from "@/components/monitors/create-monitor-dialog";
import { MonitorsTable } from "@/components/monitors/monitors-table";
import { ProjectSwitcher } from "@/components/org-switcher";
import { Badge } from "@/components/ui/badge";
import { listMonitorConfigs } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug, listProjectsForOrg } from "@/lib/workspace";
import { formatNumber } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function MonitorsPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();

  const monitors = await listMonitorConfigs(currentProject.id);
  const orgProjects = await listProjectsForOrg(currentOrg.id);

  const activeCount = monitors.filter((monitor) => monitor.active).length;
  const criticalCount = monitors.filter((monitor) => monitor.latest_evaluation?.state === "critical").length;
  const warnCount = monitors.filter((monitor) => monitor.latest_evaluation?.state === "warn").length;
  const averageWindowMinutes = monitors.length
    ? Math.round(monitors.reduce((sum, monitor) => sum + monitor.window_minutes, 0) / monitors.length)
    : 0;

  return (
    <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4 md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6">
        <section className="rounded-xl border bg-card px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground">Alerting</p>
                <Badge variant="outline" className="gap-1.5">
                  <BellRing className="size-3" />
                  {formatNumber(activeCount)} active monitors
                </Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Monitor configs for {currentProject.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Define threshold-based alerts over latency, errors, cost, or any mapped signal key.
                Keep these policies attached to the project that owns the traces.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <ProjectSwitcher
                  orgId={currentOrg.id}
                  currentSlug={currentProject.slug}
                  orgSlug={currentOrg.slug}
                  projects={orgProjects.map((item) => ({ slug: item.slug, name: item.name }))}
                />
                <CreateMonitorDialog projectId={currentProject.id} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MonitorStat label="Configs" value={formatNumber(monitors.length)} icon={BellRing} />
              <MonitorStat label="Critical" value={formatNumber(criticalCount)} icon={AlertTriangle} />
              <MonitorStat label="Warn" value={formatNumber(warnCount)} icon={AlertTriangle} />
              <MonitorStat label="Avg window" value={`${averageWindowMinutes || 0} min`} icon={TimerReset} />
            </div>
          </div>
        </section>

        <MonitorsTable monitors={monitors} />
      </div>
    </div>
  );
}

function MonitorStat({
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
