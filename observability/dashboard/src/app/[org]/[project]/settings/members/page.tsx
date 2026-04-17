import { getOrgBySlug } from "@/lib/workspace";
import { listMembers } from "@/lib/api";
import { MembersTable } from "@/components/settings/members-table";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function MembersPage({ params }: Props) {
  const { org } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const members = await listMembers(currentOrg.id);
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">Settings</p>
          <h1 className="mt-1 text-xl font-semibold">Members</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage your organization&apos;s teammates and their roles.
          </p>
        </div>
        <InviteMemberDialog orgId={currentOrg.id} />
      </header>
      <section className="p-6">
        <div className="rounded-lg border border-border bg-card">
          <MembersTable members={members} />
        </div>
      </section>
    </div>
  );
}
