import { notFound } from "next/navigation";
import { CreateWebhookDialog } from "@/components/settings/create-webhook-dialog";
import { WebhooksTable } from "@/components/settings/webhooks-table";
import { listWebhooks } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug } from "@/lib/workspace";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function WebhooksPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();
  const webhooks = await listWebhooks(currentProject.id);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">Settings</p>
          <h1 className="mt-1 text-xl font-semibold">Webhooks</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Send real-time events to your own endpoints.
          </p>
        </div>
        <CreateWebhookDialog projectId={currentProject.id} />
      </header>
      <section className="p-6">
        <WebhooksTable projectId={currentProject.id} webhooks={webhooks} />
      </section>
    </div>
  );
}
