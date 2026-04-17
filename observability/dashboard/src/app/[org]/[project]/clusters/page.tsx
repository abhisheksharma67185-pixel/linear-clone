import { Boxes } from "lucide-react";
import { listClusters } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug, listProjectsForOrg } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { ProjectSwitcher } from "@/components/org-switcher";
import { ClustersGrid } from "./clusters-grid";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function ClustersPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();

  let clusters: Awaited<ReturnType<typeof listClusters>> = [];
  try {
    clusters = await listClusters(currentProject.id);
  } catch (e) {
    console.error("listClusters failed:", e);
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
        <Boxes className="size-3.5 text-muted-foreground" />
        <h1 className="text-sm font-semibold">Clusters</h1>
        <span className="ml-auto text-[0.625rem] text-muted-foreground tabular-nums">
          {clusters.length} clusters
        </span>
      </header>
      <ClustersGrid
        clusters={clusters}
        projectId={currentProject.id}
        orgSlug={currentOrg.slug}
        projectSlug={currentProject.slug}
      />
    </>
  );
}
