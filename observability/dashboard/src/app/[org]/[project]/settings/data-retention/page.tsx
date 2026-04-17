import { notFound } from "next/navigation";
import { getOrgBySlug, getProjectBySlug } from "@/lib/workspace";
import { RetentionForm } from "@/components/settings/retention-form";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function RetentionPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="border-b border-border px-6 py-4">
        <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="mt-1 text-xl font-semibold">Data retention</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Control how long project traces remain available in Theta.
        </p>
      </header>
      <section className="p-6">
        <RetentionForm
          projectId={currentProject.id}
          initialDays={currentProject.retention_days}
        />
      </section>
    </div>
  );
}
