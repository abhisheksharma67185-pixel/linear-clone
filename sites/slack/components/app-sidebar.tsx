"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AtSign,
  Bell,
  Bookmark,
  ChevronRight,
  FileText,
  Grid3x3,
  HelpCircle,
  Home,
  Inbox,
  LayoutList,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Users,
  Video,
  Workflow,
  SquarePen,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { ChannelListItem } from "./channel-list-item"
import { DmListItem } from "./dm-list-item"
import { UserAvatar } from "./user-avatar"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
  status: { emoji: string; text: string; expiresAt: string | null }
}

type Channel = {
  id: string
  name: string
  type: "public" | "private"
  isArchived: boolean
  isShared: boolean
}

type DirectMessage = {
  id: string
  participantIds: string[]
  isGroup: boolean
}

type ReadState = {
  channelId: string | null
  dmId: string | null
  unreadCount: number
  unreadMentions: number
}

type Workspace = { name: string }

const CURRENT_USER_ID = "usr-1"

const nav = [
  { href: "/activity", label: "Activity", icon: Bell },
  { href: "/threads", label: "Threads", icon: MessageCircle },
  { href: "/dms", label: "DMs", icon: AtSign },
  { href: "/mentions", label: "Mentions", icon: AtSign },
  { href: "/later", label: "Later", icon: Bookmark },
  { href: "/drafts", label: "Drafts & sent", icon: Send },
]

const moreItems = [
  { href: "/people", label: "People", icon: Users },
  { href: "/files", label: "Files", icon: FileText },
  { href: "/canvases", label: "Canvases", icon: FileText },
  { href: "/lists", label: "Lists", icon: LayoutList },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/huddles", label: "Huddles", icon: Video },
  { href: "/connect", label: "Slack Connect", icon: Grid3x3 },
  { href: "/apps", label: "Apps", icon: Grid3x3 },
  { href: "/user-groups", label: "User groups", icon: Users },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [workspace, setWorkspace] = useState<Workspace>({ name: "Theta HQ" })
  const [users, setUsers] = useState<User[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [dms, setDms] = useState<DirectMessage[]>([])
  const [readStates, setReadStates] = useState<ReadState[]>([])
  const currentUser = users.find((u) => u.id === CURRENT_USER_ID)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/workspace").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
      fetch("/api/data/dms").then((r) => r.json()),
      fetch(`/api/data/read-states?userId=${CURRENT_USER_ID}`).then((r) =>
        r.json()
      ),
    ])
      .then(([ws, usrs, chs, ds, rs]) => {
        setWorkspace(ws)
        setUsers(usrs)
        setChannels(chs)
        setDms(ds)
        setReadStates(rs)
      })
      .catch(() => {})
  }, [pathname])

  const visibleChannels = channels.filter((c) => !c.isArchived)
  const channelsByUnread = [...visibleChannels].sort(
    (a, b) =>
      (unread(a.id, readStates) > 0 ? -1 : 0) -
      (unread(b.id, readStates) > 0 ? -1 : 0)
  )
  const sortedDms = [...dms].sort(
    (a, b) => unreadDm(b.id, readStates) - unreadDm(a.id, readStates)
  )

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="gap-0 bg-sidebar px-0 pt-0">
        <div className="flex items-center justify-between px-3 pt-2">
          <WorkspaceSwitcher name={workspace.name} />
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <SquarePen className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>New message</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-sidebar pt-1">
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/"}
                  size="sm"
                  render={
                    <Link href="/">
                      <Home className="size-4" />
                      Home
                    </Link>
                  }
                />
              </SidebarMenuItem>
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    size="sm"
                    render={
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        {item.label}
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
              <Collapsible>
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton size="sm" className="group/more">
                        <MoreHorizontal className="size-4" />
                        More
                        <ChevronRight className="ml-auto size-3 transition-transform group-data-[state=open]/more:rotate-90" />
                      </SidebarMenuButton>
                    }
                  />
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {moreItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={pathname === item.href}
                          size="sm"
                          render={
                            <Link href={item.href}>
                              <item.icon className="size-4" />
                              {item.label}
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen className="group/channels">
          <SidebarGroup className="py-0">
            <CollapsibleTrigger className="flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase hover:text-sidebar-foreground">
              <ChevronRight className="size-3 transition-transform group-data-[state=open]/channels:rotate-90" />
              Channels
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {channelsByUnread.map((ch) => (
                    <ChannelListItem
                      key={ch.id}
                      channel={ch}
                      unreadCount={unread(ch.id, readStates)}
                      unreadMentions={unreadMentions(ch.id, readStates)}
                    />
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      size="sm"
                      className="text-sidebar-foreground/70"
                    >
                      <span className="flex size-4 items-center justify-center rounded bg-sidebar-accent">
                        <Plus className="size-3" />
                      </span>
                      Add channels
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/dms">
          <SidebarGroup className="py-0">
            <CollapsibleTrigger className="flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase hover:text-sidebar-foreground">
              <ChevronRight className="size-3 transition-transform group-data-[state=open]/dms:rotate-90" />
              Direct messages
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sortedDms.map((dm) => (
                    <DmListItem
                      key={dm.id}
                      dm={dm}
                      users={users}
                      currentUserId={CURRENT_USER_ID}
                      unreadCount={unreadDm(dm.id, readStates)}
                    />
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      size="sm"
                      className="text-sidebar-foreground/70"
                    >
                      <span className="flex size-4 items-center justify-center rounded bg-sidebar-accent">
                        <Plus className="size-3" />
                      </span>
                      New message
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible className="group/apps">
          <SidebarGroup className="py-0">
            <CollapsibleTrigger className="flex w-full items-center gap-1 px-3 py-1 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase hover:text-sidebar-foreground">
              <ChevronRight className="size-3 transition-transform group-data-[state=open]/apps:rotate-90" />
              Apps
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="sm">
                      <Inbox className="size-4" />
                      Slackbot
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-2">
              {currentUser ? (
                <UserAvatar
                  name={currentUser.name}
                  src={currentUser.avatar}
                  presence={currentUser.presence}
                  size="sm"
                  showPresence
                />
              ) : (
                <div className="size-7 rounded-md bg-sidebar-accent" />
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs font-semibold">
                  {currentUser?.name ?? "You"}
                </span>
                {currentUser?.status.text ? (
                  <span className="truncate text-[10px] text-sidebar-foreground/60">
                    {currentUser.status.emoji} {currentUser.status.text}
                  </span>
                ) : (
                  <span className="truncate text-[10px] text-sidebar-foreground/60">
                    Free plan · Update status
                  </span>
                )}
              </div>
              <HelpCircle className="size-4 text-sidebar-foreground/60" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function unread(channelId: string, readStates: ReadState[]) {
  return readStates.find((rs) => rs.channelId === channelId)?.unreadCount ?? 0
}
function unreadMentions(channelId: string, readStates: ReadState[]) {
  return (
    readStates.find((rs) => rs.channelId === channelId)?.unreadMentions ?? 0
  )
}
function unreadDm(dmId: string, readStates: ReadState[]) {
  return readStates.find((rs) => rs.dmId === dmId)?.unreadCount ?? 0
}
