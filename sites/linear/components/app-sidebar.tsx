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
  UserIcon,
  CopyLinkIcon,
  Archive01Icon,
  Notification01Icon,
  SlackIcon,
  Logout01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import type { Team } from "@/app/lib/mock-data"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import { CreateTeamDialog } from "@/components/create-team-dialog"
import { ImportIssuesDialog } from "@/components/import-issues-dialog"
import { InvitePeopleDialog } from "@/components/invite-people-dialog"
import { DownloadAppDialog } from "@/components/download-app-dialog"
import { SearchDialog } from "@/components/search-dialog"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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
                <DropdownMenuItem render={<Link href="/settings?section=members" />}>
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
                  <DropdownMenuSubContent className="w-64">
                    {/* Email header — plain div, not a GroupLabel */}
                    <div className="truncate px-2 py-2 text-[11px] text-muted-foreground pointer-events-none select-none">
                      theta.computer01@gmail.c...
                    </div>

                    {/* Current workspace row */}
                    <DropdownMenuItem className="gap-2.5 px-2 py-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-semibold text-white">
                        AB
                      </div>
                      <span className="flex-1 truncate font-medium">Abhishek</span>
                      <HugeiconsIcon icon={Tick02Icon} className="size-3.5 text-foreground" />
                      <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-muted/80 text-[10px] text-muted-foreground">
                        1
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Account section label — plain div */}
                    <div className="px-2 pb-1 pt-2 text-[11px] text-muted-foreground pointer-events-none select-none">
                      Account
                    </div>

                    {/* Create or join */}
                    <DropdownMenuItem render={<Link href="/create-workspace" />} className="px-2 py-2">
                      <span>Create or join a workspace...</span>
                    </DropdownMenuItem>

                    {/* Add an account */}
                    <DropdownMenuItem render={<Link href="/add-account" />} className="px-2 py-2">
                      <span>Add an account...</span>
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
              onClick={() => setSearchOpen(true)}
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
                  isActive={isActive("/inbox")}
                  render={<Link href="/inbox" />}
                >
                  <HugeiconsIcon icon={InboxIcon} />
                  <span>Inbox</span>
                  <span className="ml-auto flex size-4 items-center justify-center rounded-full bg-muted-foreground/20 text-[10px] font-medium text-muted-foreground">1</span>
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
              <button
                type="button"
                aria-label="Add team"
                className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              </button>
            </div>
            <CollapsibleContent>
            <SidebarMenu>
              {[{ id: "abhishek", name: "Abhishek", key: "ABH" }].map((team) => (
                <Collapsible key={team.id} defaultOpen className="group/team">
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<CollapsibleTrigger />}>
                      <span className="flex size-3.5 shrink-0 items-center justify-center rounded-sm border border-pink-500/70 text-pink-500">
                        <HugeiconsIcon icon={UserIcon} className="size-2.5" />
                      </span>
                      <span className="truncate">{team.name}</span>
                      <TriangleCaret className="transition-transform group-data-[closed]/team:-rotate-90" />
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <SidebarMenuAction
                            showOnHover
                            aria-label={`${team.name} options`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                      >
                        <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" align="start" sideOffset={4} className="w-60">
                        <DropdownMenuItem className="gap-2" render={<Link href="/settings" />}>
                          <HugeiconsIcon icon={Settings02Icon} className="size-4" />
                          <span>Team settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <HugeiconsIcon icon={CopyLinkIcon} className="size-4" />
                          <span>Copy link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <HugeiconsIcon icon={Archive01Icon} className="size-4" />
                          <span>Open archive</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="gap-2">
                            <HugeiconsIcon icon={Notification01Icon} className="size-4" />
                            <span>Subscribe</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="w-48">
                            <DropdownMenuItem>All activity</DropdownMenuItem>
                            <DropdownMenuItem>My activity only</DropdownMenuItem>
                            <DropdownMenuItem>Unsubscribe</DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem className="gap-2">
                          <HugeiconsIcon icon={SlackIcon} className="size-4" />
                          <span>Configure Slack notifications...</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-muted-foreground/50" disabled>
                          <HugeiconsIcon icon={Logout01Icon} className="size-4" />
                          <span>Leave team...</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton render={<Link href={`/teams/${team.key.toLowerCase()}/issues`} />}>
                            <HugeiconsIcon icon={TaskEdit01Icon} className="size-3.5" />
                            <span>Issues</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton render={<Link href="/projects" />}>
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
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
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
      className="group/label flex flex-1 items-center gap-1 text-left text-[11px]"
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
      className={`size-1 shrink-0 fill-current text-muted-foreground/70 ${className ?? ""}`}
    >
      <path d="M1 2 L7 2 L4 6 Z" />
    </svg>
  )
}
