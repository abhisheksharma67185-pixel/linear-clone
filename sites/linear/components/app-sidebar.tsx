"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckListIcon,
  Layers01Icon,
  FilterIcon,
  UserMultiple02Icon,
  ArrowDown01Icon,
  TaskEdit01Icon,
  Calendar03Icon,
  Add01Icon,
  DashboardSquare01Icon,
  Tag01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"
import { CreateIssueDialog } from "@/components/create-issue-dialog"

export function AppSidebar() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1">
          <div className="flex size-7 items-center justify-center rounded bg-violet-600 text-white">
            <HugeiconsIcon icon={Layers01Icon} className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Linear</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/my-issues" />}>
                <HugeiconsIcon icon={CheckListIcon} />
                <span>My Issues</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/issues" />}>
                <HugeiconsIcon icon={TaskEdit01Icon} />
                <span>Issues</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/projects" />}>
                <HugeiconsIcon icon={Layers01Icon} />
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/views" />}>
                <HugeiconsIcon icon={FilterIcon} />
                <span>Views</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/teams" />}>
                <HugeiconsIcon icon={UserMultiple02Icon} />
                <span>Teams</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Your Teams</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible defaultOpen>
              <SidebarMenuItem>
                <SidebarMenuButton render={<CollapsibleTrigger />}>
                  <HugeiconsIcon icon={Layers01Icon} />
                  <span>ENG - Engineering</span>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="ml-auto" />
                </SidebarMenuButton>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/ENG/board" />}>
                        <HugeiconsIcon icon={DashboardSquare01Icon} />
                        <span>Board</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/ENG/backlog" />}>
                        <HugeiconsIcon icon={TaskEdit01Icon} />
                        <span>Backlog</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/cycles" />}>
                        <HugeiconsIcon icon={Calendar03Icon} />
                        <span>Cycles</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/ENG/settings" />}>
                        <HugeiconsIcon icon={Tag01Icon} />
                        <span>Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <Collapsible defaultOpen>
              <SidebarMenuItem>
                <SidebarMenuButton render={<CollapsibleTrigger />}>
                  <HugeiconsIcon icon={Layers01Icon} />
                  <span>DES - Design</span>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="ml-auto" />
                </SidebarMenuButton>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/DES/board" />}>
                        <HugeiconsIcon icon={DashboardSquare01Icon} />
                        <span>Board</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/DES/backlog" />}>
                        <HugeiconsIcon icon={TaskEdit01Icon} />
                        <span>Backlog</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/DES/settings" />}>
                        <HugeiconsIcon icon={Tag01Icon} />
                        <span>Settings</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setCreateOpen(true)}>
                  <HugeiconsIcon icon={Add01Icon} />
                  <span>Create Issue</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/projects/ENG/backlog" />}>
                  <HugeiconsIcon icon={TaskEdit01Icon} />
                  <span>Backlog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/settings" />}>
                  <HugeiconsIcon icon={Settings01Icon} />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <CreateIssueDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
