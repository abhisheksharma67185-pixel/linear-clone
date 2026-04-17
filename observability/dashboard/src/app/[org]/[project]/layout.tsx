import { notFound } from "next/navigation";
import { getOrgBySlug, getProjectBySlug } from "@/lib/workspace";

interface Props {
  params: Promise<{ org: string; project: string }>;
  children: React.ReactNode;
}

// Project layout is a pass-through — the sidebar is rendered by [org]/layout.tsx.
// This layout just validates that the project exists.
export default async function ProjectLayout({ params, children }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();
  return <>{children}</>;
}
