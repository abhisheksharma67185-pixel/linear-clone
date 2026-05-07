"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit3,
  FileText,
  Grip,
  Hash,
  Headphones,
  HelpCircle,
  Hourglass,
  Inbox,
  LayoutList,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Send,
  Settings as SettingsIcon,
  SquarePen,
  Star,
  Users,
  Video,
  Workflow,
  type LucideIcon,
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
import { ChannelListItem } from "./channel-list-item"
import { DmListItem } from "./dm-list-item"
import { UserAvatar } from "./user-avatar"
import { CreateChannelDialog } from "./create-channel-dialog"
import { NewDmDialog } from "./new-dm-dialog"
import { InvitePeopleDialog } from "./invite-people-dialog"
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
  status: { emoji: string; text: string; expiresAt: string | null }
  isBot?: boolean
  title?: string
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

type Preferences = {
  starredChannelIds?: string[]
}

const CURRENT_USER_ID = "usr-1"

// Top-of-sidebar primary nav, matching real Slack's order with the global
// rail in place. Activity / DMs / Files / Home all live in the rail; the
// sidebar focuses on collaborative surfaces (threads, huddles, drafts,
// directories) plus channel + DM browsing.
type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
}

const moreItems: NavItem[] = [
  { href: "/mentions", label: "Mentions & reactions", icon: Inbox },
  { href: "/later", label: "Later", icon: Bookmark },
  { href: "/canvases", label: "Canvases", icon: FileText },
  { href: "/lists", label: "Lists", icon: LayoutList },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/connect", label: "Slack Connect", icon: Plus },
  { href: "/apps", label: "Apps", icon: Plus },
  { href: "/user-groups", label: "User groups", icon: Users },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [workspace, setWorkspace] = useState<Workspace>({ name: "Theta HQ" })
  const [users, setUsers] = useState<User[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [dms, setDms] = useState<DirectMessage[]>([])
  const [readStates, setReadStates] = useState<ReadState[]>([])
  const [scheduledCount, setScheduledCount] = useState(0)
  const [starredIds, setStarredIds] = useState<string[]>([])
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  const [newDmOpen, setNewDmOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const currentUser = users.find((u) => u.id === CURRENT_USER_ID)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    Promise.all([
      fetch("/api/data/workspace").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
      fetch("/api/data/dms").then((r) => r.json()),
      fetch(`/api/data/read-states?userId=${CURRENT_USER_ID}`).then((r) =>
        r.json()
      ),
      fetch("/api/data/scheduled").then((r) => r.json()),
      fetch("/api/data/preferences").then((r) => r.json()),
    ])
      .then(([ws, usrs, chs, ds, rs, sched, prefs]) => {
        setWorkspace(ws)
        setUsers(usrs as User[])
        setChannels(chs as Channel[])
        setDms(ds as DirectMessage[])
        setReadStates(rs as ReadState[])
        setScheduledCount(Array.isArray(sched) ? sched.length : 0)
        setStarredIds(
          Array.isArray((prefs as Preferences)?.starredChannelIds)
            ? ((prefs as Preferences).starredChannelIds as string[])
            : []
        )
      })
      .catch(() => {})
  }, [pathname, refreshTick])
  /* eslint-enable react-hooks/set-state-in-effect */

  const visibleChannels = channels.filter((c) => !c.isArchived)
  const starredSet = new Set(starredIds)
  const starredChannels = visibleChannels.filter((c) => starredSet.has(c.id))
  const otherChannels = visibleChannels
    .filter((c) => !starredSet.has(c.id))
    .sort(
      (a, b) =>
        (unread(a.id, readStates) > 0 ? -1 : 0) -
        (unread(b.id, readStates) > 0 ? -1 : 0)
    )
  const sortedDms = [...dms].sort(
    (a, b) => unreadDm(b.id, readStates) - unreadDm(a.id, readStates)
  )

  // Top-of-sidebar nav: items with route + optional badge.
  const topNav: NavItem[] = [
    { href: "/threads", label: "Threads", icon: MessageSquare },
    { href: "/huddles", label: "Huddles", icon: Headphones },
    {
      href: "/drafts",
      label: "Drafts & sent",
      icon: Send,
      badge: scheduledCount,
    },
    { href: "/people", label: "Directories", icon: Users },
  ]

  return (
    <Sidebar
      collapsible="offcanvas"
      // shadcn's Sidebar inner container is `fixed left-0` which would
      // overlap the GlobalRail. Push it right by the rail's width so the
      // rail stays visible on the left edge. The conditional default
      // `data-[side=left]:border-r` in the primitive needs the bang
      // override or it leaves a 1px light border at the seam.
      className="!border-r-0 data-[side=left]:!left-[68px]"
    >
      <SidebarHeader className="gap-0 bg-sidebar px-0 pt-0">
        <div className="flex items-center justify-between gap-1 px-2 pt-2">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-1 rounded-md px-1.5 py-1 text-left hover:bg-sidebar-accent"
            aria-label="Switch workspace"
          >
            <span className="truncate text-base font-extrabold tracking-tight text-sidebar-foreground">
              {workspace.name}
            </span>
            <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/70" />
          </button>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/admin"
                    aria-label="Workspace settings"
                    className="inline-flex size-7 items-center justify-center rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <SettingsIcon className="size-4" />
                  </Link>
                }
              />
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setNewDmOpen(true)}
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

        {/* Trial banner — distinct lighter purple block. Static for the mock;
            real Slack uses workspace.plan + trialEnds metadata. */}
        <Link
          href="/admin"
          className="mx-2 mt-2 flex items-center gap-2 rounded-md bg-sidebar-accent/80 px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Hourglass className="size-3.5 shrink-0 opacity-80" />
          <span className="flex-1 truncate">15 days left in trial</span>
          <ChevronRight className="size-3.5 shrink-0 opacity-70" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-sidebar pt-1">
        {/* Primary sidebar nav (not in rail). */}
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {topNav.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      size="sm"
                      render={
                        <Link href={item.href}>
                          <Icon className="size-4" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && item.badge > 0 ? (
                            <span className="rounded bg-sidebar-foreground/15 px-1.5 text-[10px] font-semibold text-sidebar-foreground/90">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                )
              })}
              <Collapsible className="group/more">
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton size="sm">
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

        {/* Starred — empty state shows a placeholder; populated when the
            channel header's star is toggled (writes to preferences). */}
        <Collapsible defaultOpen className="group/starred">
          <SidebarGroup className="py-0">
            <SectionHeader
              icon={Star}
              label="Starred"
              groupName="starred"
              iconClassName="fill-none"
            />
            <CollapsibleContent>
              <SidebarGroupContent>
                {starredChannels.length === 0 ? (
                  <p className="px-3 pt-1 pb-2 text-[13px] leading-snug text-sidebar-foreground/55">
                    Drag and drop important stuff here
                  </p>
                ) : (
                  <SidebarMenu>
                    {starredChannels.map((ch) => (
                      <ChannelListItem
                        key={ch.id}
                        channel={ch}
                        unreadCount={unread(ch.id, readStates)}
                        unreadMentions={unreadMentions(ch.id, readStates)}
                      />
                    ))}
                  </SidebarMenu>
                )}
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Channels. */}
        <Collapsible defaultOpen className="group/channels">
          <SidebarGroup className="py-0">
            <SectionHeader
              icon={Hash}
              label="Channels"
              groupName="channels"
              onAdd={() => setCreateChannelOpen(true)}
              addLabel="Add channels"
            />
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {otherChannels.map((ch) => (
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
                      onClick={() => setCreateChannelOpen(true)}
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

        {/* Direct messages. */}
        <Collapsible defaultOpen className="group/dms">
          <SidebarGroup className="py-0">
            <SectionHeader
              icon={MessageSquare}
              label="Direct messages"
              groupName="dms"
              onAdd={() => setNewDmOpen(true)}
              addLabel="New message"
            />
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
                      onClick={() => setInviteOpen(true)}
                      className="text-sidebar-foreground/70"
                    >
                      <span className="flex size-4 items-center justify-center rounded bg-sidebar-accent">
                        <Plus className="size-3" />
                      </span>
                      Invite people
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Apps — workspace bots only. The app catalog lives at /apps. */}
        <Collapsible defaultOpen className="group/apps">
          <SidebarGroup className="py-0">
            <SectionHeader
              icon={Grip}
              label="Apps"
              groupName="apps"
              onAddHref="/apps"
              addLabel="Add apps"
            />
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {users
                    .filter((u) => u.isBot)
                    .slice(0, 8)
                    .map((bot) => (
                      <SidebarMenuItem key={bot.id}>
                        <SidebarMenuButton
                          size="sm"
                          render={
                            <Link href={`/people/${bot.id}`}>
                              <span className="flex size-4 items-center justify-center rounded bg-sidebar-accent text-[10px] font-bold">
                                {bot.name[0]?.toUpperCase() ?? "B"}
                              </span>
                              {bot.name}
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    ))}
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

      <CreateChannelDialog
        open={createChannelOpen}
        onOpenChange={setCreateChannelOpen}
        onCreated={() => setRefreshTick((n) => n + 1)}
      />
      <NewDmDialog
        open={newDmOpen}
        onOpenChange={setNewDmOpen}
        onCreated={() => setRefreshTick((n) => n + 1)}
      />
      <InvitePeopleDialog open={inviteOpen} onOpenChange={setInviteOpen} />
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

// Suppress unused-import warnings from the icon module — these are kept
// because the previous version referenced them and keeping them lets future
// menu items add icons without re-importing.
const _unused = { Edit3, ChevronUp, Video, ChevronRight }
void _unused

// Real Slack section headers show a category icon by default and swap it
// for a chevron-down on hover. The "+" and overflow buttons only appear
// while the row is hovered.
function SectionHeader({
  icon: Icon,
  label,
  iconClassName,
  onAdd,
  onAddHref,
  addLabel,
}: {
  icon: LucideIcon
  label: string
  groupName?: string
  iconClassName?: string
  onAdd?: () => void
  onAddHref?: string
  addLabel?: string
}) {
  return (
    <div className="group/section flex w-full items-center gap-1 rounded-md py-0.5 pr-1 pl-2 text-[13px] font-semibold text-sidebar-foreground/85 hover:bg-sidebar-accent/40">
      <CollapsibleTrigger
        className={cn(
          "group/trigger relative flex min-w-0 flex-1 items-center gap-1.5 py-1 text-left",
          "focus-visible:outline-none"
        )}
        aria-label={`Toggle ${label}`}
      >
        {/* Icon swap: category icon by default, chevron-down on hover. */}
        <span className="relative flex size-4 shrink-0 items-center justify-center text-sidebar-foreground/70">
          <Icon
            className={cn(
              "size-3.5 transition-opacity group-hover/section:opacity-0",
              iconClassName
            )}
          />
          <ChevronDown className="absolute size-3.5 opacity-0 transition-transform group-hover/section:opacity-100 group-data-[state=closed]/trigger:-rotate-90" />
        </span>
        <span className="truncate">{label}</span>
      </CollapsibleTrigger>
      {onAdd || onAddHref ? (
        <Tooltip>
          <TooltipTrigger
            render={
              onAddHref ? (
                <Link
                  href={onAddHref}
                  aria-label={addLabel ?? `Add to ${label}`}
                  className="hidden size-6 items-center justify-center rounded text-sidebar-foreground/80 group-hover/section:inline-flex hover:bg-sidebar-accent"
                >
                  <Plus className="size-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onAdd}
                  aria-label={addLabel ?? `Add to ${label}`}
                  className="hidden size-6 items-center justify-center rounded text-sidebar-foreground/80 group-hover/section:inline-flex hover:bg-sidebar-accent"
                >
                  <Plus className="size-3.5" />
                </button>
              )
            }
          />
          <TooltipContent>{addLabel ?? `Add to ${label}`}</TooltipContent>
        </Tooltip>
      ) : null}
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label={`${label} options`}
              className="hidden size-6 items-center justify-center rounded text-sidebar-foreground/80 group-hover/section:inline-flex hover:bg-sidebar-accent"
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          }
        />
        <TooltipContent>More options</TooltipContent>
      </Tooltip>
    </div>
  )
}
