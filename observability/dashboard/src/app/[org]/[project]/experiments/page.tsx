import { ArrowRightLeft, Beaker, FlaskConical, ShieldCheck, TimerReset } from "lucide-react";
import { getOrgBySlug, getProjectBySlug, listProjectsForOrg } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ProjectSwitcher } from "@/components/org-switcher";
import { ExperimentsTable } from "./experiments-table";
import { formatNumber } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function ExperimentsPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();

  const orgProjects = await listProjectsForOrg(currentOrg.id);
  const experimentStats = {
    total: 3,
    improved: 2,
    regressed: 1,
    metricsCompared: 4,
  };

  return (
    <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4 md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6">
        <section className="rounded-xl border bg-card px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <ProjectSwitcher
                  orgId={currentOrg.id}
                  currentSlug={currentProject.slug}
                  orgSlug={currentOrg.slug}
                  projects={orgProjects.map((p) => ({ slug: p.slug, name: p.name }))}
                />
                <Badge variant="outline" className="gap-1.5">
                  <FlaskConical className="size-3" />
                  Experiments
                </Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Baseline vs experiment runs for {currentProject.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Compare prompt variants and model changes, then jump straight into the
                underlying trace runs for investigation.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ExperimentStat label="Comparisons" value={formatNumber(experimentStats.total)} icon={Beaker} />
              <ExperimentStat label="Improved" value={formatNumber(experimentStats.improved)} icon={ShieldCheck} />
              <ExperimentStat label="Regressed" value={formatNumber(experimentStats.regressed)} icon={TimerReset} />
              <ExperimentStat label="Metrics tracked" value={formatNumber(experimentStats.metricsCompared)} icon={ArrowRightLeft} />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-6 py-4">
            <p className="text-sm font-medium">Experiment feed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Each row links to the exact baseline and experiment runs inside the trace feed.
            </p>
          </div>
          <ExperimentsTable
            orgSlug={currentOrg.slug}
            projectSlug={currentProject.slug}
          />
        </section>
      </div>
    </div>
  );
}

function ExperimentStat({
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
