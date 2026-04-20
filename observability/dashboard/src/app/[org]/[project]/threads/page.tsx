import { Link2, MessageSquareText, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { ProjectSwitcher } from "@/components/org-switcher";
import { CreateThreadDialog } from "@/components/threads/create-thread-dialog";
import { ThreadsTable } from "@/components/threads/threads-table";
import { Badge } from "@/components/ui/badge";
import { listConversationThreads } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug, listProjectsForOrg } from "@/lib/workspace";
import { formatNumber } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function ThreadsPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();

  const threads = await listConversationThreads(currentProject.id);
  const orgProjects = await listProjectsForOrg(currentOrg.id);

  const linkedTraceCount = threads.reduce((sum, thread) => sum + thread.trace_count, 0);
  const uniqueUsers = new Set(threads.map((thread) => thread.user_id).filter(Boolean)).size;
  const activeSessions = new Set(threads.map((thread) => thread.session_id).filter(Boolean)).size;

  return (
    <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4 md:px-8 md:pb-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6">
        <section className="rounded-xl border bg-card px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground">Correlation</p>
                <Badge variant="outline" className="gap-1.5">
                  <Link2 className="size-3" />
                  {formatNumber(linkedTraceCount)} linked traces
                </Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Conversation threads for {currentProject.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Group traces into durable customer or workflow conversations so you can inspect a
                full session instead of isolated runs.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <ProjectSwitcher
                  orgId={currentOrg.id}
                  currentSlug={currentProject.slug}
                  orgSlug={currentOrg.slug}
                  projects={orgProjects.map((item) => ({ slug: item.slug, name: item.name }))}
                />
                <CreateThreadDialog projectId={currentProject.id} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ThreadStat label="Threads" value={formatNumber(threads.length)} icon={MessageSquareText} />
              <ThreadStat label="Users" value={formatNumber(uniqueUsers)} icon={Users} />
              <ThreadStat label="Sessions" value={formatNumber(activeSessions)} icon={Link2} />
            </div>
          </div>
        </section>

        <ThreadsTable threads={threads} />
      </div>
    </div>
  );
}

function ThreadStat({
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
