import { AlertTriangle } from "lucide-react";
import { listIncidents } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug, listProjectsForOrg } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { ProjectSwitcher } from "@/components/org-switcher";
import { IncidentsList } from "./incidents-list";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function IncidentsPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();

  let incidents: Awaited<ReturnType<typeof listIncidents>> = [];
  try {
    incidents = await listIncidents(currentProject.id);
  } catch (e) {
    console.error("listIncidents failed:", e);
  }

  const orgProjects = await listProjectsForOrg(currentOrg.id);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        <ProjectSwitcher
          orgId={currentOrg.id}
          currentSlug={currentProject.slug}
          orgSlug={currentOrg.slug}
          projects={orgProjects.map((p) => ({ slug: p.slug, name: p.name }))}
        />
        <AlertTriangle className="size-3.5 text-muted-foreground" />
        <h1 className="text-sm font-semibold">Incidents</h1>
        <span className="ml-auto text-[0.625rem] text-muted-foreground tabular-nums">
          {incidents.length} incidents
        </span>
      </header>
      <IncidentsList
        incidents={incidents}
        projectId={currentProject.id}
        orgSlug={currentOrg.slug}
        projectSlug={currentProject.slug}
      />
    </>
  );
}
