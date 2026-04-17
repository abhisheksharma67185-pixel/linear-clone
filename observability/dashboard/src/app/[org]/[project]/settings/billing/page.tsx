import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUsage } from "@/lib/api";
import { getOrgBySlug, getProjectBySlug } from "@/lib/workspace";
import { formatNumber } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function BillingPage({ params }: Props) {
  const { org, project } = await params;
  const currentOrg = await getOrgBySlug(org);
  if (!currentOrg) notFound();
  const currentProject = await getProjectBySlug(currentOrg.id, project);
  if (!currentProject) notFound();
  const usage = await getUsage(currentOrg.id).catch(() => null);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="border-b border-border px-6 py-4">
        <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="mt-1 text-xl font-semibold">Billing</h1>
      </header>
      <section className="grid gap-4 p-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">Current plan</p>
            <Badge>{currentOrg.plan}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Project: {currentProject.name}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/pricing">Change plan</Link>
          </Button>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-semibold">Usage this period</p>
          <dl className="mt-3 grid gap-2 text-xs">
            <Row
              label="Events ingested"
              value={usage ? formatNumber(usage.events_ingested) : "Unavailable"}
            />
            <Row
              label="Media storage (bytes)"
              value={usage ? formatNumber(usage.media_bytes) : "Unavailable"}
            />
            <Row
              label="API requests"
              value={usage ? formatNumber(usage.api_requests) : "Unavailable"}
            />
            <Row
              label="Billing window"
              value={
                usage
                  ? `${new Date(usage.period_start).toLocaleDateString()} - ${new Date(usage.period_end).toLocaleDateString()}`
                  : "Unavailable"
              }
            />
          </dl>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
