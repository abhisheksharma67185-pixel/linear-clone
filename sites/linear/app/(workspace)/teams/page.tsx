"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Team, Member, Issue } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  Search01Icon,
  Layers01Icon,
  UserMultiple02Icon,
  CubeIcon,
  SlidersHorizontalIcon,
  MoreHorizontalIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortOrder = "name-asc" | "name-desc" | "members-desc" | "members-asc"

const SORT_LABELS: Record<SortOrder, string> = {
  "name-asc": "Name · A → Z",
  "name-desc": "Name · Z → A",
  "members-desc": "Most members",
  "members-asc": "Fewest members",
}

const SORT_OPTIONS = Object.entries(SORT_LABELS) as [SortOrder, string][]

/** User-toggleable display-property chips inside the Display Options
 *  popover. Each chip controls visibility of one piece of card content. */
const DISPLAY_PROPERTIES = [
  { key: "lead", label: "Lead", default: true },
  { key: "memberCount", label: "Member count", default: true },
  { key: "active", label: "Active issues", default: true },
  { key: "description", label: "Description", default: true },
  { key: "key", label: "Team key badge", default: true },
] as const

type DisplayPropertyKey = (typeof DISPLAY_PROPERTIES)[number]["key"]

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [sort, setSort] = useState<SortOrder>("name-asc")
  // Unified Display Options popover (Ordering + Display properties).
  // Controlled `open` so both Escape AND outside-click route through
  // the same `setDisplayOpen(false)` close path — the regression fix
  // for "Escape doesn't close the Display options popover".
  const [displayOpen, setDisplayOpen] = useState(false)
  const [activeDisplayProps, setActiveDisplayProps] = useState<
    Set<DisplayPropertyKey>
  >(
    () =>
      new Set(
        DISPLAY_PROPERTIES.filter((p) => p.default).map((p) => p.key)
      )
  )
  const toggleDisplayProp = (key: DisplayPropertyKey) =>
    setActiveDisplayProps((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  useEffect(() => {
    Promise.all([
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
    ]).then(([t, m, i]) => {
      setTeams(t)
      setMembers(m)
      setIssues(i)
      setLoading(false)
    })
  }, [])

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  )

  // Active issues per team — proxy for "active projects" used by the
  // empty-state helper. When the sum across all teams is zero we
  // surface a "Create your first project" CTA below the grid.
  const activeByTeam = useMemo(() => {
    const counts = new Map<string, number>()
    for (const issue of issues) {
      if (issue.status === "done" || issue.status === "cancelled") continue
      counts.set(issue.teamId, (counts.get(issue.teamId) ?? 0) + 1)
    }
    return counts
  }, [issues])
  const totalActiveIssues = useMemo(
    () => Array.from(activeByTeam.values()).reduce((a, b) => a + b, 0),
    [activeByTeam]
  )

  // Visible teams — filter then sort. Both are pure derivations of
  // (teams, filter, sort) so the list always agrees with the count
  // displayed in the header.
  const visibleTeams = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const filtered = q
      ? teams.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.key.toLowerCase().includes(q) ||
            (t.description ?? "").toLowerCase().includes(q)
        )
      : teams
    const arr = [...filtered]
    arr.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "members-desc":
          return b.memberIds.length - a.memberIds.length
        case "members-asc":
          return a.memberIds.length - b.memberIds.length
      }
    })
    return arr
  }, [teams, filter, sort])

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Teams</h1>
          <p className="text-muted-foreground text-sm">
            All teams in your organization.{" "}
            <span className="text-muted-foreground/70" data-testid="teams-count">
              {loading ? "…" : `${visibleTeams.length} of ${teams.length}`}
            </span>
          </p>
        </div>

        {/* Toolbar: filter + sort + create */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <HugeiconsIcon
              icon={Search01Icon}
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2"
            />
            <Input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter teams…"
              aria-label="Filter teams"
              data-testid="teams-filter"
              className="h-8 pl-7 text-xs"
            />
          </div>

          <Popover open={displayOpen} onOpenChange={setDisplayOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="teams-display-options-trigger"
                  aria-label="Display options"
                  className="h-8 gap-2 text-xs"
                />
              }
            >
              <HugeiconsIcon
                icon={SlidersHorizontalIcon}
                className="size-3.5"
              />
              <span>Display</span>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={4}
              data-testid="teams-display-options-popover"
              className="w-72 gap-0 p-3"
            >
              {/* Ordering */}
              <div className="mb-3 flex flex-col gap-2">
                <div className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                  Ordering
                </div>
                <div className="flex flex-col gap-0.5">
                  {SORT_OPTIONS.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSort(value)}
                      data-testid={`teams-sort-option-${value}`}
                      className={`hover:bg-accent flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs ${
                        sort === value ? "text-foreground font-medium" : ""
                      }`}
                    >
                      <span>{label}</span>
                      {sort === value && (
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display properties */}
              <div className="border-border border-t pt-3">
                <div className="text-muted-foreground mb-2 text-[11px] font-semibold uppercase tracking-wide">
                  Display properties
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DISPLAY_PROPERTIES.map((p) => {
                    const active = activeDisplayProps.has(p.key)
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => toggleDisplayProp(p.key)}
                        data-testid={`teams-display-chip-${p.key}`}
                        aria-pressed={active}
                        className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                          active
                            ? "border-foreground/20 bg-muted text-foreground"
                            : "border-border text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex-1" />

          <Button
            asChild
            size="sm"
            data-testid="teams-new"
            className="h-8 gap-2 bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700"
          >
            <Link href="/settings/new-team" aria-label="Create a new team">
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              New team
            </Link>
          </Button>
        </div>

        {loading ? (
          <TeamsGridSkeleton />
        ) : visibleTeams.length === 0 ? (
          <p
            className="text-muted-foreground text-sm"
            data-testid="teams-empty"
          >
            {filter.trim()
              ? "No teams match your filter."
              : "No teams found."}
          </p>
        ) : (
          <div
            data-testid="teams-grid"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visibleTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                lead={team.leadId ? memberById.get(team.leadId) : undefined}
                memberById={memberById}
                activeCount={activeByTeam.get(team.id) ?? 0}
                displayProps={activeDisplayProps}
              />
            ))}
          </div>
        )}

        {/* Empty-state helper card: surfaced when the workspace has no
            active issues across all teams. We use active-issue count
            as a proxy for "active project work" — both signals are
            zero in a brand-new workspace. */}
        {!loading && totalActiveIssues === 0 && teams.length > 0 && (
          <ZeroProjectsHelperCard />
        )}
      </div>
    </TooltipProvider>
  )
}

function TeamsGridSkeleton() {
  // Mirrors the shape of the real card (header row + description +
  // avatars + active count) so the page doesn't visibly reflow when
  // the data resolves. Six placeholders fill the typical viewport.
  return (
    <div
      data-testid="teams-grid-skeleton"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="size-5 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ZeroProjectsHelperCard() {
  return (
    <div
      data-testid="teams-zero-projects-helper"
      className="border-border bg-card mt-2 flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
          <HugeiconsIcon icon={CubeIcon} className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium">
            No active projects in this workspace yet
          </p>
          <p className="text-muted-foreground text-xs">
            Create your first project to start tracking work for any team.
          </p>
        </div>
      </div>
      <Button
        asChild
        size="sm"
        data-testid="teams-zero-projects-cta"
        className="h-8 bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700"
      >
        <Link href="/projects" aria-label="Create your first project">
          Create your first project
        </Link>
      </Button>
    </div>
  )
}

function TeamCard({
  team,
  lead,
  memberById,
  activeCount,
  displayProps,
}: {
  team: Team
  lead: Member | undefined
  memberById: Map<string, Member>
  activeCount: number
  displayProps: Set<DisplayPropertyKey>
}) {
  const allMembers = team.memberIds
    .map((id) => memberById.get(id))
    .filter((m): m is Member => Boolean(m))
  const visibleMembers = allMembers.slice(0, 4)
  const extra = allMembers.length - visibleMembers.length
  const showLead = displayProps.has("lead")
  const showMemberCount = displayProps.has("memberCount")
  const showActive = displayProps.has("active")
  const showDescription = displayProps.has("description")
  const showKey = displayProps.has("key")

  return (
    <Card
      data-testid="teams-card"
      data-team-key={team.key}
      // The card itself is no longer a click target — it's a visual
      // container. The primary "open team" link lives on the team
      // name (with full keyboard support); the secondary actions
      // (Members, Projects, More) are explicit icon buttons with
      // visible affordances. The separation fixes the mis-click bug
      // where clicking an inline icon also triggered the card-level
      // navigation.
      className="hover:bg-accent/30 group h-full transition-colors"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <div className="bg-muted text-foreground flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold">
              {team.key.slice(0, 2)}
            </div>
            <CardTitle className="text-base font-medium">
              <Link
                href={`/teams/${team.key.toLowerCase()}/issues`}
                data-testid="teams-card-title-link"
                aria-label={`Open ${team.name} issues`}
                className="hover:underline focus-visible:underline focus-visible:outline-none"
              >
                {team.name}
              </Link>
            </CardTitle>
          </div>
          {showKey && (
            <Badge variant="outline" className="font-mono text-[10px]">
              {team.key}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showDescription && (
          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
            {team.description}
          </p>
        )}
        {(showLead || showMemberCount) && (
          <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs">
            {showLead && lead && (
              <>
                <Avatar className="size-4">
                  <AvatarImage src={lead.avatar} />
                  <AvatarFallback className="text-[8px]">
                    {lead.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>Lead: {lead.name}</span>
                {showMemberCount && <span className="text-border">|</span>}
              </>
            )}
            {showMemberCount && (
              <span>
                {allMembers.length}{" "}
                {allMembers.length === 1 ? "member" : "members"}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <MemberStack
            allMembers={allMembers}
            visibleMembers={visibleMembers}
            extra={extra}
          />

          <div className="flex items-center gap-2">
            {showActive && (
              <ActiveIssuesIndicator
                team={team}
                activeCount={activeCount}
              />
            )}

            {/* Inline action buttons. Each has its own hover background
                so the click targets are visually discrete. The leading
                divider plus the More dropdown match Linear's pattern
                of "primary text link, then a separated actions group". */}
            <div className="border-border ml-1 flex items-center gap-0.5 border-l pl-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      href="/settings?section=members"
                      data-testid="teams-card-members"
                      aria-label={`Members of ${team.name}`}
                      className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded opacity-70 transition-opacity hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={UserMultiple02Icon}
                    className="size-3.5"
                  />
                </TooltipTrigger>
                <TooltipContent>Members</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      href={`/projects/${team.key.toLowerCase()}/board`}
                      data-testid="teams-card-projects"
                      aria-label={`Projects board for ${team.name}`}
                      className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded opacity-70 transition-opacity hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
                    />
                  }
                >
                  <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>Projects board</TooltipContent>
              </Tooltip>
              <TeamMoreDropdown team={team} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActiveIssuesIndicator({
  team,
  activeCount,
}: {
  team: Team
  activeCount: number
}) {
  // When the count is zero, render an inline "Create first project"
  // link instead of a dead "0 active issues" string. Goes straight
  // to the team's project board where the create-project flow lives.
  if (activeCount === 0) {
    return (
      <Link
        href={`/projects/${team.key.toLowerCase()}/board`}
        data-testid="teams-card-active-zero-cta"
        aria-label={`Create the first project for ${team.name}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded text-xs hover:underline"
      >
        <HugeiconsIcon icon={CubeIcon} className="size-3 opacity-60" />
        <span>Create first project</span>
      </Link>
    )
  }
  return (
    <span
      data-testid="teams-card-active-count"
      className="text-muted-foreground text-xs"
    >
      {activeCount} active {activeCount === 1 ? "issue" : "issues"}
    </span>
  )
}

function TeamMoreDropdown({ team }: { team: Team }) {
  // The "..." button is the regression target: in the previous
  // iteration it had no aria-label and no tooltip, so users couldn't
  // tell it was distinct from the row-level title link. Now it has
  // both, plus a hover background that makes the click target
  // visually obvious.
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  data-testid="teams-card-more"
                  aria-label="Team actions"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-6 items-center justify-center rounded opacity-70 transition-opacity hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
                />
              }
            />
          }
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent>More actions</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          render={<Link href={`/teams/${team.key.toLowerCase()}/issues`} />}
          data-testid="teams-card-more-issues"
        >
          <HugeiconsIcon icon={CubeIcon} className="size-3.5" />
          <span>View issues</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href={`/projects/${team.key.toLowerCase()}/board`} />}
          data-testid="teams-card-more-projects"
        >
          <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
          <span>Projects board</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href={`/settings/teams/${team.key}`} />}
          data-testid="teams-card-more-settings"
        >
          <HugeiconsIcon icon={Settings02Icon} className="size-3.5" />
          <span>Team settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MemberStack({
  allMembers,
  visibleMembers,
  extra,
}: {
  allMembers: Member[]
  visibleMembers: Member[]
  extra: number
}) {
  // Single tooltip on the entire stack listing every member name +
  // total count. Replaces the previous per-avatar tooltips which
  // required users to hover each avatar separately and gave no
  // indication of who the "+N" hidden members were.
  const tooltipText = (
    <div className="max-w-xs">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
        {allMembers.length}{" "}
        {allMembers.length === 1 ? "member" : "members"}
      </p>
      <ul className="flex flex-col gap-0.5">
        {allMembers.map((m) => (
          <li key={m.id} className="text-xs">
            {m.name}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            data-testid="teams-card-member-stack"
            aria-label={`${allMembers.length} members: ${allMembers.map((m) => m.name).join(", ")}`}
            className="hover:bg-accent/40 -m-1 flex items-center rounded p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          />
        }
      >
        <div className="flex -space-x-1.5">
          {visibleMembers.map((m) => (
            <Avatar key={m.id} className="ring-card size-5 ring-2">
              <AvatarImage src={m.avatar} />
              <AvatarFallback className="text-[8px]">
                {m.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
          {extra > 0 && (
            <span
              data-testid="teams-card-member-extra"
              className="bg-muted text-muted-foreground ring-card z-10 flex size-5 items-center justify-center rounded-full text-[9px] font-medium ring-2"
            >
              +{extra}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">{tooltipText}</TooltipContent>
    </Tooltip>
  )
}
