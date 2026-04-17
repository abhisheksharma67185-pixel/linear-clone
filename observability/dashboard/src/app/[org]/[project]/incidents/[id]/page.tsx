import { AlertTriangle } from "lucide-react";
import { getIncident } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug, listProjectsForOrg } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { ProjectSwitcher } from "@/components/org-switcher";
import { IncidentDetail } from "./incident-detail";

interface Props {
  params: Promise<{ org: string; project: string; id: string }>;
}

export default async function IncidentDetailPage({ params }: Props) {
  const { org, project, id } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();

  let incident: Awaited<ReturnType<typeof getIncident>> | null = null;
  try {
    incident = await getIncident(id);
  } catch (e) {
    console.error("getIncident failed:", e);
  }

  if (!incident) notFound();

  const orgProjects = await listProjectsForOrg(currentOrg.id);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <ProjectSwitcher
          orgId={currentOrg.id}
          currentSlug={currentProject.slug}
          orgSlug={currentOrg.slug}
          projects={orgProjects.map((p) => ({ slug: p.slug, name: p.name }))}
        />
        <AlertTriangle className="size-3.5 text-muted-foreground" />
        <h1 className="text-sm font-semibold">Incident</h1>
      </header>
      <IncidentDetail
        incident={incident}
        orgSlug={currentOrg.slug}
        projectSlug={currentProject.slug}
      />
    </>
  );
}
