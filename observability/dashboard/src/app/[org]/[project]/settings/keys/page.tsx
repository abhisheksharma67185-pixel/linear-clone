import { getOrgBySlug, getProjectBySlug } from "@/lib/workspace";
import { listApiKeys } from "@/lib/api";
import { ApiKeyTable } from "@/components/settings/api-key-table";
import { CreateKeyDialog } from "@/components/settings/create-key-dialog";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function KeysPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();
  const keys = await listApiKeys(currentProject.id);
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">Settings</p>
          <h1 className="mt-1 text-xl font-semibold">API keys</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Scoped to this project. Rotate any time.
          </p>
        </div>
        <CreateKeyDialog projectId={currentProject.id} />
      </header>
      <section className="p-6">
        <div className="rounded-lg border border-border bg-card">
          <ApiKeyTable projectId={currentProject.id} keys={keys} />
        </div>
      </section>
    </div>
  );
}
