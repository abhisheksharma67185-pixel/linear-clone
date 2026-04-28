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
  CubeIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  PencilEdit02Icon,
  Contact02Icon,
  UserMultiple02Icon,
  Search01Icon,
  ArrowDown01Icon,
  InboxDownloadIcon,
  Github01Icon,
  HelpCircleIcon,
  TaskEdit01Icon,
  Settings02Icon,
  PlusSignIcon,
  Tick02Icon,
  UserIcon,
  CopyLinkIcon,
  Archive01Icon,
  Notification01Icon,
  SlackIcon,
  Logout01Icon,
  Cancel01Icon,
  StarIcon,
  ViewOffSlashIcon,
  ArrowUpRight01Icon,
  Satellite01Icon,
} from "@hugeicons/core-free-icons"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import { CreateTeamDialog } from "@/components/create-team-dialog"
import { InvitePeopleDialog } from "@/components/invite-people-dialog"
import { DownloadAppDialog } from "@/components/download-app-dialog"
import { SearchDialog } from "@/components/search-dialog"
import { CustomizeSidebarDialog } from "@/components/customize-sidebar-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ALL_SUBSCRIBE_EVENTS,
  isFavoriteTeam,
  isSubscribed,
  isTeamHidden,
  saveTeamPreferences,
  setTeamHidden,
  SUBSCRIBE_EVENT_LABELS,
  toggleFavoriteTeam,
  toggleSubscribeEvent,
  useTeamPreferences,
  type TeamSubscribeEvent,
} from "@/lib/team-preferences"
import {
  shouldRenderSidebarItem,
  useSidebarCustomization,
  type SidebarVisibility,
} from "@/lib/sidebar-customization"
import {
  removeFavorite,
  useFavorites,
  type FavoriteIcon,
} from "@/lib/view-favorites"

/**
 * localStorage key for the dismissable "Try" onboarding section in
 * the sidebar. Stored as "1" once dismissed; absent or any other
 * value means visible. Persisting client-side (rather than per-user
 * server-side) is fine because dismissal is a UI preference, not
 * authoritative data — and avoids round-tripping a tiny boolean.
 */
const TRY_SECTION_DISMISSED_KEY = "sidebar:try-section-dismissed"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  // Try-section dismiss state. Read from localStorage on mount so
  // the section stays hidden across page reloads, then write on
  // every change. SSR-safe: starts as `false` (visible) on the
  // server; the effect reconciles to the persisted value on the
  // client without a flash because the section's content is short.
  const [tryDismissed, setTryDismissed] = useState(false)
  useEffect(() => {
    // Reading localStorage is the textbook "syncing external state
    // into React" use case for useEffect — the rule lint flags it
    // because the body calls setState, but we only do it once on
    // mount with a stable value, so cascading renders aren't a risk.
    try {
      const stored = window.localStorage.getItem(TRY_SECTION_DISMISSED_KEY)
      if (stored === "1") {
        /* eslint-disable react-hooks/set-state-in-effect */
        setTryDismissed(true)
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // ignore — Safari private mode etc.
    }
  }, [])
  const dismissTrySection = () => {
    setTryDismissed(true)
    try {
      window.localStorage.setItem(TRY_SECTION_DISMISSED_KEY, "1")
    } catch {
      // ignore
    }
  }

  const isActive = (href: string) => pathname === href

  // Read the user's sidebar customisation. The hook subscribes to
  // localStorage + same-tab change events so toggling visibility in
  // the Customize sidebar modal updates this view instantly.
  const customization = useSidebarCustomization()
  // Per-team preferences — favorites, hide-from-sidebar, and the
  // checkable Subscribe submenu state. Same subscribe pattern as
  // useSidebarCustomization (CustomEvent-driven).
  const teamPrefs = useTeamPreferences()
  const favorites = useFavorites()
  // Per-item badge counts. Inbox is the only badge-bearing row in
  // this mock; others have no count, so a "Show when badged" rule
  // collapses them. The values would come from real APIs in
  // production.
  const ITEM_BADGE_COUNTS: Record<string, number> = { inbox: 1 }
  const visibilityFor = (key: string): SidebarVisibility => {
    return (
      customization.items.find((i) => i.key === key)?.visibility ?? "always"
    )
  }
  const isItemRendered = (key: string): boolean =>
    shouldRenderSidebarItem(
      visibilityFor(key),
      (ITEM_BADGE_COUNTS[key] ?? 0) > 0
    )

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
                    aria-label="Workspace menu"
                    className="hover:bg-sidebar-accent data-[popup-open]:bg-sidebar-accent flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left"
                  />
                }
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-semibold text-white">
                  AB
                </div>
                <span className="truncate text-sm font-semibold">Abhishek</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className="text-muted-foreground size-3.5 shrink-0"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="w-60"
              >
                <DropdownMenuItem
                  render={<Link href="/settings" />}
                  data-testid="workspace-menu-settings"
                >
                  <span>Settings</span>
                  <DropdownMenuShortcut>G then S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/settings?section=members" />}
                >
                  <span>Invite and manage members</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDownloadOpen(true)}>
                  <span>Download desktop app</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger data-testid="workspace-menu-switch">
                    <span>Switch workspace</span>
                    <DropdownMenuShortcut className="me-1">
                      O then W
                    </DropdownMenuShortcut>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-64">
                    {/* Email header — plain div, not a GroupLabel */}
                    <div className="text-muted-foreground pointer-events-none truncate px-2 py-2 text-[11px] select-none">
                      theta.computer01@gmail.c...
                    </div>

                    {/* Current workspace row */}
                    <DropdownMenuItem className="gap-2.5 px-2 py-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-semibold text-white">
                        AB
                      </div>
                      <span className="flex-1 truncate font-medium">
                        Abhishek
                      </span>
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        className="text-foreground size-3.5"
                      />
                      <span className="bg-muted/80 text-muted-foreground ml-1 flex size-4 items-center justify-center rounded-full text-[10px]">
                        1
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Account section label — plain div */}
                    <div className="text-muted-foreground pointer-events-none px-2 pt-2 pb-1 text-[11px] select-none">
                      Account
                    </div>

                    {/* Create or join */}
                    <DropdownMenuItem
                      render={<Link href="/create-workspace" />}
                      className="px-2 py-2"
                    >
                      <span>Create or join a workspace...</span>
                    </DropdownMenuItem>

                    {/* Add an account */}
                    <DropdownMenuItem
                      render={<Link href="/add-account" />}
                      className="px-2 py-2"
                    >
                      <span>Add an account...</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  data-testid="workspace-menu-logout"
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
              onClick={() => router.push("/search")}
              className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-md"
            >
              <HugeiconsIcon icon={Search01Icon} className="size-4" />
            </button>
            <button
              type="button"
              aria-label="New issue"
              onClick={() => setCreateOpen(true)}
              className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-md"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
            </button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem
                data-sidebar-item="inbox"
                data-collapsed={!isItemRendered("inbox")}
                className="sidebar-item-animated"
              >
                <SidebarMenuButton
                  isActive={isActive("/inbox")}
                  render={<Link href="/inbox" />}
                >
                  <HugeiconsIcon icon={InboxIcon} />
                  <span>Inbox</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem
                data-sidebar-item="my-issues"
                data-collapsed={!isItemRendered("my-issues")}
                className="sidebar-item-animated"
              >
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
                  <SidebarMenuItem
                    data-sidebar-item="projects"
                    data-collapsed={!isItemRendered("projects")}
                    className="sidebar-item-animated"
                  >
                    <SidebarMenuButton
                      isActive={isActive("/projects")}
                      render={<Link href="/projects" />}
                    >
                      <HugeiconsIcon icon={CubeIcon} />
                      <span>Projects</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem
                    data-sidebar-item="views"
                    data-collapsed={!isItemRendered("views")}
                    className="sidebar-item-animated"
                  >
                    <SidebarMenuButton
                      isActive={isActive("/views")}
                      render={<Link href="/views" />}
                    >
                      <ViewsIcon />
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
                        {/*
                          Order matches Linear's production "More"
                          dropdown: Members → Initiatives → Teams,
                          then a divider and Customize sidebar.
                        */}
                        <DropdownMenuItem
                          className="gap-2"
                          render={<Link href="/settings?section=members" />}
                        >
                          <HugeiconsIcon icon={UserMultiple02Icon} />
                          <span>Members</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          render={<Link href="/initiatives" />}
                        >
                          <HugeiconsIcon icon={Satellite01Icon} />
                          <span>Initiatives</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          render={<Link href="/teams" />}
                        >
                          <HugeiconsIcon icon={Contact02Icon} />
                          <span>Teams</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => setCustomizeOpen(true)}
                        >
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

          {favorites.length > 0 && (
            <SidebarGroup data-testid="sidebar-favorites">
              <Collapsible defaultOpen className="group/label">
                <SectionLabel>Favorites</SectionLabel>
                <CollapsibleContent>
                  <SidebarMenu>
                    {favorites.map((fav) => (
                      <SidebarMenuItem key={fav.key}>
                        <SidebarMenuButton
                          isActive={isActive(fav.href)}
                          render={<Link href={fav.href} />}
                        >
                          <FavoriteIconGlyph icon={fav.icon} />
                          <span>{fav.label}</span>
                        </SidebarMenuButton>
                        <SidebarMenuAction
                          aria-label={`Remove ${fav.label} from favorites`}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            removeFavorite(fav.key)
                          }}
                          showOnHover
                        >
                          <HugeiconsIcon icon={Cancel01Icon} />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <Collapsible defaultOpen className="group/label">
              <div className="flex items-center">
                <SectionLabel>Your teams</SectionLabel>
                <button
                  type="button"
                  aria-label="Add team"
                  className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground ml-auto flex size-5 shrink-0 items-center justify-center rounded-md"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                </button>
              </div>
              <CollapsibleContent>
                <SidebarMenu>
                  {[{ id: "abhishek", name: "Abhishek", key: "ABH" }].map(
                    (team) => {
                      const teamHidden = isTeamHidden(teamPrefs, team.id)
                      const teamFavorited = isFavoriteTeam(teamPrefs, team.id)
                      // Mock-only: there's only one team in the
                      // sidebar, so "you're the only admin" is
                      // always true and Leave team... is disabled.
                      // Real app would derive from member-count.
                      const leaveDisabled = true
                      const leaveDisabledReason =
                        "You're the only admin — you can't leave this team"
                      return (
                        <Collapsible
                          key={team.id}
                          defaultOpen
                          className="group/team"
                        >
                          <SidebarMenuItem
                            data-team-id={team.id}
                            data-collapsed={teamHidden}
                            className="sidebar-item-animated"
                          >
                            <SidebarMenuButton render={<CollapsibleTrigger />}>
                              <span className="flex size-3.5 shrink-0 items-center justify-center rounded-sm border border-pink-500/70 text-pink-500">
                                <HugeiconsIcon
                                  icon={UserIcon}
                                  className="size-2.5"
                                />
                              </span>
                              <span className="truncate">{team.name}</span>
                              {teamFavorited && (
                                <HugeiconsIcon
                                  icon={StarIcon}
                                  className="size-3 text-amber-400"
                                  aria-label="Favorited"
                                />
                              )}
                              <TriangleCaret className="transition-transform group-data-[closed]/team:-rotate-90" />
                            </SidebarMenuButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <SidebarMenuAction
                                    showOnHover
                                    aria-label={`${team.name} options`}
                                    data-testid={`team-menu-trigger-${team.id}`}
                                    // stopPropagation prevents the
                                    // CollapsibleTrigger above from
                                    // toggling open/closed when the
                                    // user clicks the "..." button.
                                    // Base UI's Menu uses pointer-down
                                    // semantics that already win the
                                    // race against an outside-click
                                    // listener — this stop is purely
                                    // for the Collapsible parent.
                                    onClick={(e) => {
                                      e.stopPropagation()
                                    }}
                                  />
                                }
                              >
                                <HugeiconsIcon
                                  icon={MoreHorizontalIcon}
                                  className="size-3.5"
                                />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                side="bottom"
                                align="start"
                                sideOffset={4}
                                data-testid={`team-menu-${team.id}`}
                                className="w-64"
                              >
                                <DropdownMenuItem
                                  className="gap-2"
                                  render={<Link href="/settings" />}
                                  data-testid="team-menu-settings"
                                >
                                  <HugeiconsIcon
                                    icon={Settings02Icon}
                                    className="size-4 opacity-70"
                                  />
                                  <span>Team settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <HugeiconsIcon
                                    icon={CopyLinkIcon}
                                    className="size-4 opacity-70"
                                  />
                                  <span>Copy link</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <HugeiconsIcon
                                    icon={Archive01Icon}
                                    className="size-4 opacity-70"
                                  />
                                  <span>Open archive</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  data-testid="team-menu-new-issue"
                                  onClick={() => setCreateOpen(true)}
                                >
                                  <HugeiconsIcon
                                    icon={PencilEdit01Icon}
                                    className="size-4 opacity-70"
                                  />
                                  <span>New issue</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2"
                                  data-testid="team-menu-favorite"
                                  onClick={() => {
                                    saveTeamPreferences(
                                      toggleFavoriteTeam(teamPrefs, team.id)
                                    )
                                  }}
                                >
                                  <HugeiconsIcon
                                    icon={StarIcon}
                                    className={`size-4 ${
                                      teamFavorited
                                        ? "text-amber-400"
                                        : "opacity-70"
                                    }`}
                                  />
                                  <span>
                                    {teamFavorited
                                      ? "Remove from favorites"
                                      : "Add to favorites"}
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger
                                    className="gap-2"
                                    data-testid="team-menu-subscribe"
                                  >
                                    <HugeiconsIcon
                                      icon={Notification01Icon}
                                      className="size-4 opacity-70"
                                    />
                                    <span>Subscribe</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent
                                    className="w-56"
                                    data-testid="team-menu-subscribe-submenu"
                                  >
                                    {ALL_SUBSCRIBE_EVENTS.map((event) => {
                                      const checked = isSubscribed(
                                        teamPrefs,
                                        team.id,
                                        event
                                      )
                                      return (
                                        <DropdownMenuItem
                                          key={event}
                                          data-testid={`team-menu-subscribe-${event}`}
                                          // Manual checkbox semantics:
                                          // we render a check on the
                                          // right when subscribed and
                                          // toggle on click. Multi-
                                          // select stays open via
                                          // event.preventDefault.
                                          onClick={(e) => {
                                            e.preventDefault()
                                            saveTeamPreferences(
                                              toggleSubscribeEvent(
                                                teamPrefs,
                                                team.id,
                                                event as TeamSubscribeEvent
                                              )
                                            )
                                          }}
                                          className="flex items-center justify-between gap-2"
                                        >
                                          <span>
                                            {SUBSCRIBE_EVENT_LABELS[event]}
                                          </span>
                                          {checked && (
                                            <HugeiconsIcon
                                              icon={Tick02Icon}
                                              className="size-3.5 shrink-0"
                                              aria-label="Subscribed"
                                            />
                                          )}
                                        </DropdownMenuItem>
                                      )
                                    })}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem
                                  className="gap-2"
                                  render={
                                    <Link href="/settings?section=integrations" />
                                  }
                                  data-testid="team-menu-slack"
                                >
                                  <HugeiconsIcon
                                    icon={SlackIcon}
                                    className="size-4 opacity-70"
                                  />
                                  <span className="flex-1">
                                    Configure Slack notifications...
                                  </span>
                                  {/* External-link arrow — matches
                                    Linear's convention of marking
                                    items that leave the current
                                    view (here: navigates to
                                    integrations settings). */}
                                  <HugeiconsIcon
                                    icon={ArrowUpRight01Icon}
                                    className="text-muted-foreground size-3 shrink-0 opacity-70"
                                    aria-hidden="true"
                                  />
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  data-testid="team-menu-invite"
                                  onClick={() => setInviteOpen(true)}
                                >
                                  <HugeiconsIcon
                                    icon={UserMultiple02Icon}
                                    className="size-4 opacity-70"
                                  />
                                  <span>Invite members...</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2"
                                  data-testid="team-menu-hide"
                                  onClick={() => {
                                    saveTeamPreferences(
                                      setTeamHidden(teamPrefs, team.id, true)
                                    )
                                  }}
                                >
                                  <HugeiconsIcon
                                    icon={ViewOffSlashIcon}
                                    className="size-4 opacity-70"
                                  />
                                  <span>Hide team from sidebar</span>
                                </DropdownMenuItem>
                                {/* "Leave team..." carries an
                                  explanatory tooltip when disabled
                                  — Tooltip wraps the menu item via
                                  TooltipTrigger render so the
                                  trigger's role/keyboard semantics
                                  are preserved. 500ms delay matches
                                  Linear's other long-form tooltips. */}
                                <TooltipProvider delay={500}>
                                  <Tooltip>
                                    <TooltipTrigger
                                      render={
                                        <DropdownMenuItem
                                          className="text-muted-foreground/60 gap-2"
                                          disabled={leaveDisabled}
                                          data-testid="team-menu-leave"
                                          // Even though the item is
                                          // aria-disabled, we keep it
                                          // focusable so screen
                                          // readers announce the
                                          // tooltip — Base UI's Menu
                                          // doesn't strip focus from
                                          // disabled items.
                                        >
                                          <HugeiconsIcon
                                            icon={Logout01Icon}
                                            className="size-4 opacity-70"
                                          />
                                          <span>Leave team...</span>
                                        </DropdownMenuItem>
                                      }
                                    />
                                    {leaveDisabled && (
                                      <TooltipContent
                                        side="right"
                                        data-testid="team-menu-leave-tooltip"
                                      >
                                        {leaveDisabledReason}
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton
                                    render={
                                      <Link
                                        href={`/teams/${team.key.toLowerCase()}/issues`}
                                      />
                                    }
                                  >
                                    <HugeiconsIcon
                                      icon={TaskEdit01Icon}
                                      className="size-3.5"
                                    />
                                    <span>Issues</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton
                                    render={<Link href="/projects" />}
                                  >
                                    <HugeiconsIcon
                                      icon={CubeIcon}
                                      className="size-3.5"
                                    />
                                    <span>Projects</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton
                                    render={<Link href="/views" />}
                                  >
                                    <ViewsIcon className="size-3.5" />
                                    <span>Views</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      )
                    }
                  )}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          {!tryDismissed && (
            <SidebarGroup data-testid="sidebar-try-section">
              <Collapsible defaultOpen className="group/label">
                <SectionLabel>Try</SectionLabel>
                <CollapsibleContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link href="/settings?section=import-export" />}
                      >
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
                        render={
                          <Link href="/settings?section=integrations&provider=github" />
                        }
                      >
                        <HugeiconsIcon icon={Github01Icon} />
                        <span>Connect GitHub</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center px-1">
            <button
              type="button"
              aria-label="Help"
              className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground flex size-7 items-center justify-center rounded-md"
            >
              <HugeiconsIcon icon={HelpCircleIcon} className="size-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CreateIssueDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CreateTeamDialog
        open={createTeamOpen}
        onOpenChange={setCreateTeamOpen}
        // Creating a team is a strong signal the user has finished
        // basic onboarding — auto-collapse the Try section so it
        // stops taking sidebar real estate.
        onCreated={() => dismissTrySection()}
      />
      <InvitePeopleDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <DownloadAppDialog open={downloadOpen} onOpenChange={setDownloadOpen} />
      <CustomizeSidebarDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
      />
    </>
  )
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
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`text-muted-foreground/70 size-3 shrink-0 fill-current ${className ?? ""}`}
    >
      <g transform="rotate(90 8 8)">
        <path d="M7.00194 10.6239C6.66861 10.8183 6.25 10.5779 6.25 10.192V5.80802C6.25 5.42212 6.66861 5.18169 7.00194 5.37613L10.7596 7.56811C11.0904 7.76105 11.0904 8.23895 10.7596 8.43189L7.00194 10.6239Z" />
      </g>
    </svg>
  )
}

function FavoriteIconGlyph({ icon }: { icon: FavoriteIcon }) {
  return (
    <HugeiconsIcon icon={icon === "issues" ? TaskEdit01Icon : Layers01Icon} />
  )
}

/**
 * Sidebar "Views" glyph — Linear's stacked-layers mark (top rhombus
 * representing the front layer, plus a curved bottom path suggesting a
 * second layer behind it). We inline the SVG instead of pulling a
 * Hugeicons match because the brand icon doesn't have a 1:1 free-set
 * equivalent.
 *
 * Uses `currentColor` so it inherits the sidebar's text color states
 * (default / hover / active) the same way HugeiconsIcon does.
 */
function ViewsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      role="img"
      focusable="false"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.93213 2.21398C7.66484 1.90793 8.49512 1.93032 9.21389 2.28028L14.28 4.74739C15.2242 5.20709 15.2441 6.55895 14.3138 7.04673L9.2874 9.6826C8.48012 10.1058 7.51988 10.1058 6.7126 9.6826L1.68618 7.04673C0.75589 6.55895 0.775786 5.20709 1.71995 4.74739L6.78611 2.28028L6.93213 2.21398ZM8.55132 3.67054C8.24643 3.52213 7.89768 3.50303 7.58179 3.61428L7.44868 3.67054L2.83947 5.91363L7.41491 8.31243C7.7819 8.50486 8.2181 8.50486 8.58509 8.31243L13.1595 5.91363L8.55132 3.67054Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9045 10.0768C14.272 9.90435 14.7242 10.0333 14.9153 10.365C15.1063 10.6966 14.9634 11.1047 14.5959 11.2772L9.49912 13.6693C8.55934 14.1102 7.44077 14.1102 6.50099 13.6693L1.40417 11.2772L1.33776 11.2428C1.01976 11.0547 0.905685 10.676 1.08483 10.365C1.26402 10.054 1.67295 9.92085 2.02626 10.0477L2.0956 10.0768L7.19241 12.468L7.38675 12.5464C7.84801 12.7022 8.36492 12.6757 8.80769 12.468L13.9045 10.0768Z"
      />
    </svg>
  )
}
