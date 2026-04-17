import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/lib/auth";
import { getOrgBySlug, listOrgsForUser, listProjectsForOrg } from "@/lib/workspace";

interface Props {
  params: Promise<{ org: string }>;
  children: React.ReactNode;
}

export default async function OrgLayout({ params, children }: Props) {
  const { org } = await params;
  const current = await getOrgBySlug(org);
  if (!current) notFound();
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  const orgs = userId ? await listOrgsForUser(userId) : [current];
  const projects = await listProjectsForOrg(current.id);
  const defaultProject = projects[0]?.slug;
  return (
    <div className="min-h-dvh bg-background">
      <div className="flex min-h-dvh flex-col md:flex-row">
      <AppSidebar
        org={{ slug: current.slug, name: current.name, plan: current.plan }}
        orgs={orgs.map((o) => ({ slug: o.slug, name: o.name, plan: o.plan }))}
        projectSlug={defaultProject}
      />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col md:overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
