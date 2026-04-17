import { Boxes } from "lucide-react";
import { getCluster } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug, listProjectsForOrg } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { ProjectSwitcher } from "@/components/org-switcher";
import { ClusterDetail } from "./cluster-detail";

interface Props {
  params: Promise<{ org: string; project: string; id: string }>;
}

export default async function ClusterDetailPage({ params }: Props) {
  const { org, project, id } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();

  let cluster: Awaited<ReturnType<typeof getCluster>> | null = null;
  try {
    cluster = await getCluster(id);
  } catch (e) {
    console.error("getCluster failed:", e);
  }

  if (!cluster) notFound();

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
        <Boxes className="size-3.5 text-muted-foreground" />
        <h1 className="text-sm font-semibold">Cluster</h1>
      </header>
      <ClusterDetail
        cluster={cluster}
        orgSlug={currentOrg.slug}
        projectSlug={currentProject.slug}
      />
    </>
  );
}
