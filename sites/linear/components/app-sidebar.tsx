"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InboxIcon,
  CheckListIcon,
  Layers01Icon,
  FilterIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PencilEdit02Icon,
  Contact02Icon,
  UserMultiple02Icon,
  Search01Icon,
  ArrowDown01Icon,
  InboxDownloadIcon,
  UserAdd01Icon,
  Github01Icon,
  HelpCircleIcon,
  Activity03Icon,
  Target01Icon,
  TaskEdit01Icon,
  Progress01Icon,
  Settings02Icon,
  Logout03Icon,
  Download01Icon,
  KeyboardIcon,
  Moon01Icon,
  PlusSignIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import type { Team } from "@/app/lib/mock-data"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import { CreateTeamDialog } from "@/components/create-team-dialog"
import { ImportIssuesDialog } from "@/components/import-issues-dialog"
import { InvitePeopleDialog } from "@/components/invite-people-dialog"
import { DownloadAppDialog } from "@/components/download-app-dialog"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then(setTeams)
      .catch(() => setTeams([]))
  }, [])

  const isActive = (href: string) => pathname === href

  return (
    <>
      <Sidebar>
        <SidebarHeader className="gap-0 pb-0">
          <div className="flex items-center gap-0.5 px-1 py-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-sidebar-accent data-[popup-open]:bg-sidebar-accent"
                  />
                }
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-semibold text-white">
                  AB
                </div>
                <span className="truncate text-sm font-semibold">Abhishek</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={6} className="w-60">
                <DropdownMenuItem render={<Link href="/settings" />}>
                  <span>Settings</span>
                  <DropdownMenuShortcut>G then S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInviteOpen(true)}>
                  <span>Invite and manage members</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDownloadOpen(true)}>
                  <span>Download desktop app</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span>Switch workspace</span>
                    <DropdownMenuShortcut className="me-1">O then W</DropdownMenuShortcut>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    <DropdownMenuItem className="gap-2">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded bg-teal-500 text-[9px] font-semibold text-white">
                        TE
                      </div>
                      <span className="flex-1 truncate">Theta Engineering</span>
                      <HugeiconsIcon icon={Tick02Icon} className="text-muted-foreground" />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => setCreateTeamOpen(true)}
                    >
                      <HugeiconsIcon icon={PlusSignIcon} />
                      <span>Create or join a workspace</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/")
                  }}
                >
                  <span>Log out</span>
                  <DropdownMenuShortcut>⌥⇧Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              aria-label="Search"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <HugeiconsIcon icon={Search01Icon} className="size-4" />
            </button>
            <button
              type="button"
              aria-label="New issue"
              onClick={() => setCreateOpen(true)}
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
            </button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/pulse")}
                  render={<Link href="/pulse" />}
                >
                  <HugeiconsIcon icon={Activity03Icon} />
                  <span>Pulse</span>
                  <span className="ml-auto rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    2
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/inbox")}
                  render={<Link href="/inbox" />}
                >
                  <HugeiconsIcon icon={InboxIcon} />
                  <span>Inbox</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/my-issues")}
                  render={<Link href="/my-issues" />}
                >
                  <HugeiconsIcon icon={CheckListIcon} />
                  <span>My issues</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <Collapsible defaultOpen className="group/label">
            <SectionLabel>Workspace</SectionLabel>
            <CollapsibleContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/projects")}
                  render={<Link href="/projects" />}
                >
                  <HugeiconsIcon icon={Layers01Icon} />
                  <span>Projects</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/views")}
                  render={<Link href="/views" />}
                >
                  <HugeiconsIcon icon={FilterIcon} />
                  <span>Views</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton isActive={isActive("/teams")} />
                    }
                  >
                    <HugeiconsIcon icon={MoreHorizontalIcon} />
                    <span>More</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="w-56"
                  >
                    <DropdownMenuItem className="gap-2" render={<Link href="/teams" />}>
                      <HugeiconsIcon icon={Contact02Icon} />
                      <span>Teams</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" render={<Link href="/settings" />}>
                      <HugeiconsIcon icon={UserMultiple02Icon} />
                      <span>Members</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2">
                      <HugeiconsIcon icon={PencilEdit02Icon} />
                      <span>Customize sidebar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
            </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          <SidebarGroup>
            <Collapsible defaultOpen className="group/label">
            <div className="flex items-center">
              <SectionLabel>Your teams</SectionLabel>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Add team"
                      className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-foreground"
                    />
                  }
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4} className="w-56">
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => setCreateTeamOpen(true)}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} />
                    <span>Create new team</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" render={<Link href="/teams" />}>
                    <HugeiconsIcon icon={Contact02Icon} />
                    <span>Browse all teams</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CollapsibleContent>
            <SidebarMenu>
              {teams.map((team) => (
                <Collapsible key={team.id} defaultOpen className="group/team">
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<CollapsibleTrigger />}>
                      <div
                        className={`flex size-4 items-center justify-center rounded-sm text-[9px] font-semibold text-white ${teamIconColor(team.key)}`}
                      >
                        {team.key.slice(0, 2)}
                      </div>
                      <span className="truncate">{team.name}</span>
                      <TriangleCaret className="transition-transform group-data-[closed]/team:-rotate-90" />
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      showOnHover
                      aria-label={`${team.name} options`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
                    </SidebarMenuAction>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link href={`/projects/${team.key}/backlog`} />}
                          >
                            <HugeiconsIcon icon={TaskEdit01Icon} className="size-3.5" />
                            <span>Issues</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link href={`/projects?team=${team.key}`} />}
                          >
                            <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
                            <span>Projects</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton render={<Link href="/views" />}>
                            <HugeiconsIcon icon={FilterIcon} className="size-3.5" />
                            <span>Views</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
            </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          <SidebarGroup>
            <Collapsible defaultOpen className="group/label">
            <SectionLabel>Try</SectionLabel>
            <CollapsibleContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setImportOpen(true)}>
                  <HugeiconsIcon icon={InboxDownloadIcon} />
                  <span>Import issues</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setInviteOpen(true)}>
                  <HugeiconsIcon icon={PlusSignIcon} />
                  <span>Invite people</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/settings?tab=integrations" />}
                >
                  <HugeiconsIcon icon={Github01Icon} />
                  <span>Connect GitHub</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              aria-label="Help"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <HugeiconsIcon icon={HelpCircleIcon} className="size-4" />
            </button>
            <div className="flex items-center gap-1.5 rounded-full border border-sidebar-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Free plan</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <CreateIssueDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CreateTeamDialog
        open={createTeamOpen}
        onOpenChange={setCreateTeamOpen}
        onCreated={(team) => setTeams((prev) => [...prev, team])}
      />
      <ImportIssuesDialog open={importOpen} onOpenChange={setImportOpen} />
      <InvitePeopleDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <DownloadAppDialog open={downloadOpen} onOpenChange={setDownloadOpen} />
    </>
  )
}

function teamIconColor(key: string): string {
  const palette = [
    "bg-violet-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-fuchsia-500",
    "bg-cyan-500",
    "bg-orange-500",
  ]
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <SidebarGroupLabel
      render={<CollapsibleTrigger />}
      className="group/label flex flex-1 items-center gap-1 text-left"
    >
      <span>{children}</span>
      <TriangleCaret className="transition-transform group-data-[closed]/label:-rotate-90" />
    </SidebarGroupLabel>
  )
}

function TriangleCaret({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 8 8"
      aria-hidden="true"
      className={`size-2 shrink-0 fill-current text-muted-foreground/70 ${className ?? ""}`}
    >
      <path d="M1 2 L7 2 L4 6 Z" />
    </svg>
  )
}
