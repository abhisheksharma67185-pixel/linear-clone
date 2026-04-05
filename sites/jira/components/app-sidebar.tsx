"use client"

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
  DashboardSquare01Icon,
  FolderLibraryIcon,
  FilterIcon,
  ArrowDown01Icon,
  Layers01Icon,
  Add01Icon,
  TaskEdit01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1">
          <div className="flex size-7 items-center justify-center rounded bg-blue-600 text-white">
            <HugeiconsIcon icon={Menu01Icon} className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Jira</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/dashboard" />}>
                <HugeiconsIcon icon={DashboardSquare01Icon} />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/projects" />}>
                <HugeiconsIcon icon={FolderLibraryIcon} />
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/filters" />}>
                <HugeiconsIcon icon={FilterIcon} />
                <span>Filters</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible defaultOpen>
              <SidebarMenuItem>
                <SidebarMenuButton render={<CollapsibleTrigger />}>
                  <HugeiconsIcon icon={Layers01Icon} />
                  <span>PROJ - Product Development</span>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="ml-auto" />
                </SidebarMenuButton>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/PROJ/board" />}>
                        <HugeiconsIcon icon={DashboardSquare01Icon} />
                        <span>Board</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/PROJ/backlog" />}>
                        <HugeiconsIcon icon={TaskEdit01Icon} />
                        <span>Backlog</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/PROJ/settings" />}>
                        <HugeiconsIcon icon={FilterIcon} />
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
                  <span>KANB - Marketing Kanban</span>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="ml-auto" />
                </SidebarMenuButton>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/KANB/board" />}>
                        <HugeiconsIcon icon={DashboardSquare01Icon} />
                        <span>Board</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/KANB/backlog" />}>
                        <HugeiconsIcon icon={TaskEdit01Icon} />
                        <span>Backlog</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton render={<Link href="/projects/KANB/settings" />}>
                        <HugeiconsIcon icon={FilterIcon} />
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
                <SidebarMenuButton render={<Link href="/projects/PROJ/board" />}>
                  <HugeiconsIcon icon={Add01Icon} />
                  <span>Create Issue</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/projects/PROJ/backlog" />}>
                  <HugeiconsIcon icon={TaskEdit01Icon} />
                  <span>Backlog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
