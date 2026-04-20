"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateOrgDialog } from "@/components/create-org-dialog";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface OrgSwitcherItem {
  slug: string;
  name: string;
  plan: string;
}

export function OrgSwitcher({
  current,
  orgs,
}: {
  current: OrgSwitcherItem;
  orgs: OrgSwitcherItem[];
}) {
  const router = useRouter();
  const [createOrgOpen, setCreateOrgOpen] = React.useState(false);

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group/org flex w-full items-center gap-3 rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
        >
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <span className="text-xs font-semibold">
              {current.name[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{current.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{current.plan} plan</p>
          </div>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {orgs.map((o) => (
          <DropdownMenuItem key={o.slug} onSelect={() => router.push(`/${o.slug}`)}>
            <div className="flex flex-1 items-center gap-2">
              <div className="grid size-5 place-items-center rounded bg-muted text-[0.6rem] font-semibold">
                {o.name[0]?.toUpperCase()}
              </div>
              <span className="flex-1 truncate">{o.name}</span>
              {o.slug === current.slug && <Check className="size-3 text-primary" />}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e?.preventDefault();
            setCreateOrgOpen(true);
          }}
        >
          <Plus className="size-3" /> Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <CreateOrgDialog open={createOrgOpen} onOpenChange={setCreateOrgOpen} />
    </>
  );
}

export function ProjectSwitcher({
  orgId,
  currentSlug,
  orgSlug,
  projects,
}: {
  orgId: string;
  currentSlug: string;
  orgSlug: string;
  projects: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [createProjectOpen, setCreateProjectOpen] = React.useState(false);

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent"
        >
          <span className="truncate">
            {projects.find((p) => p.slug === currentSlug)?.name ?? currentSlug}
          </span>
          <ChevronsUpDown className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        {projects.map((p) => (
          <DropdownMenuItem
            key={p.slug}
            onSelect={() => router.push(`/${orgSlug}/${p.slug}/traces`)}
          >
            <div className="flex flex-1 items-center gap-2">
              <span className={cn("flex-1 truncate", p.slug === currentSlug && "font-semibold")}>
                {p.name}
              </span>
              {p.slug === currentSlug && <Check className="size-3 text-primary" />}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e?.preventDefault();
            setCreateProjectOpen(true);
          }}
        >
          <Plus className="size-3" /> New project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <CreateProjectDialog
      orgId={orgId}
      orgSlug={orgSlug}
      open={createProjectOpen}
      onOpenChange={setCreateProjectOpen}
    />
    </>
  );
}
