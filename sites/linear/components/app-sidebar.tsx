"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
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
import { HugeiconsIcon } from "@hugeicons/react"
import {
  InboxIcon,
  CheckListIcon,
  Layers01Icon,
  FilterIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
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
} from "@hugeicons/core-free-icons"
import type { Team } from "@/app/lib/mock-data"
import { CreateIssueDialog } from "@/components/create-issue-dialog"

export function AppSidebar() {
  const pathname = usePathname()
  const [createOpen, setCreateOpen] = useState(false)
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
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-sidebar-accent"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded bg-teal-500 text-[10px] font-semibold text-white">
                TE
              </div>
              <span className="truncate text-sm font-semibold">Theta Engineering</span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className="size-3.5 shrink-0 text-muted-foreground"
              />
            </button>
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
            <SectionLabel>Workspace</SectionLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/initiatives")}
                  render={<Link href="/initiatives" />}
                >
                  <HugeiconsIcon icon={Target01Icon} />
                  <span>Initiatives</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                <SidebarMenuButton
                  isActive={isActive("/teams")}
                  render={<Link href="/teams" />}
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} />
                  <span>More</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SectionLabel>Your teams</SectionLabel>
            <SidebarMenu>
              {teams.map((team) => (
                <Collapsible key={team.id} defaultOpen>
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<CollapsibleTrigger />}>
                      <div className="flex size-4 items-center justify-center rounded-sm bg-muted text-[9px] font-semibold text-muted-foreground">
                        {team.key.slice(0, 2)}
                      </div>
                      <span className="truncate">{team.name}</span>
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="ml-auto size-3.5 text-muted-foreground"
                      />
                    </SidebarMenuButton>
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

                        <Collapsible defaultOpen>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton render={<CollapsibleTrigger />}>
                              <HugeiconsIcon icon={Progress01Icon} className="size-3.5" />
                              <span>Cycles</span>
                              <HugeiconsIcon
                                icon={ArrowDown01Icon}
                                className="ml-auto size-3 text-muted-foreground"
                              />
                            </SidebarMenuSubButton>
                            <CollapsibleContent>
                              <ul className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-2">
                                <li>
                                  <Link
                                    href="/cycles"
                                    className="block rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                                  >
                                    Current
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/cycles"
                                    className="block rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                                  >
                                    Upcoming
                                  </Link>
                                </li>
                              </ul>
                            </CollapsibleContent>
                          </SidebarMenuSubItem>
                        </Collapsible>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link href={`/projects/${team.key}/board`} />}
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
          </SidebarGroup>

          <SidebarGroup>
            <SectionLabel>Try</SectionLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={InboxDownloadIcon} />
                  <span>Import issues</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={UserAdd01Icon} />
                  <span>Invite people</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={Github01Icon} />
                  <span>Connect GitHub</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
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
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <SidebarGroupLabel className="group/label flex items-center gap-1">
      <span>{children}</span>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        className="size-3 opacity-0 transition-opacity group-hover/label:opacity-100"
      />
    </SidebarGroupLabel>
  )
}
