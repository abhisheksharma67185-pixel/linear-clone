"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Issue, Member, Team } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  UserCircleIcon,
  SlidersHorizontalIcon,
  Layers01Icon,
} from "@hugeicons/core-free-icons"
import {
  filterIssuesByTab,
  type IssueStatus,
  type IssueTab,
} from "@/lib/issue-status-types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TAB_LABELS: Record<IssueTab, string> = {
  all: "All issues",
  active: "Active",
  backlog: "Backlog",
}

const STATUS_ORDER: readonly IssueStatus[] = [
  "in_progress",
  "todo",
  "backlog",
  "done",
  "cancelled",
] as const

const STATUS_LABEL: Record<IssueStatus, string> = {
  in_progress: "In Progress",
  todo: "Todo",
  backlog: "Backlog",
  done: "Done",
  cancelled: "Canceled",
}

type GroupBy = "status" | "team"

function formatShortDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function IssueRow({
  issue,
  assignee,
  teamKey,
}: {
  issue: Issue
  assignee: Member | null
  teamKey?: string
}) {
  return (
    <Link
      href={`/issues/${issue.identifier}`}
      className="group hover:bg-accent/40 flex items-center gap-3 border-b border-transparent px-5 py-2 transition-colors"
    >
      <span
        aria-hidden="true"
        className="border-muted-foreground/40 size-3.5 shrink-0 rounded-[3px] border opacity-0 transition-opacity group-hover:opacity-100"
      />
      <PriorityIcon priority={issue.priority} className="size-3.5 shrink-0" />
      <span className="text-muted-foreground w-16 shrink-0 font-mono text-xs">
        {issue.identifier}
      </span>
      <StatusIcon status={issue.status} className="size-3.5 shrink-0" />
      <span className="flex-1 truncate text-sm">{issue.title}</span>
      {teamKey && (
        <span className="text-muted-foreground/70 ring-border/60 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] ring-1">
          {teamKey}
        </span>
      )}
      {assignee ? (
        <Avatar className="size-5 shrink-0">
          <AvatarImage src={assignee.avatar} alt={assignee.name} />
          <AvatarFallback className="bg-violet-600 text-[9px] text-white">
            {assignee.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span
          aria-label="Unassigned"
          className="text-muted-foreground/60 flex size-5 shrink-0 items-center justify-center"
        >
          <HugeiconsIcon icon={UserCircleIcon} className="size-4" />
        </span>
      )}
      <span className="text-muted-foreground w-12 shrink-0 text-right font-mono text-xs">
        {formatShortDate(issue.createdAt)}
      </span>
    </Link>
  )
}

function StatusSection({
  status,
  items,
  memberById,
  teamById,
  showTeam,
}: {
  status: IssueStatus
  items: Issue[]
  memberById: Map<string, Member>
  teamById: Map<string, Team>
  showTeam: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  if (items.length === 0) return null
  return (
    <div>
      <div className="group bg-muted/30 flex items-center gap-2 px-5 py-1.5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className={`text-muted-foreground/70 size-2 shrink-0 fill-current transition-transform ${collapsed ? "-rotate-90" : ""}`}
          >
            <path d="M1 2 L7 2 L4 6 Z" />
          </svg>
          <StatusIcon status={status} className="size-3.5" />
          <span>{STATUS_LABEL[status]}</span>
          <span className="text-muted-foreground ml-0.5 text-xs font-normal">
            {items.length}
          </span>
        </button>
      </div>
      {!collapsed &&
        items.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            assignee={memberById.get(issue.assigneeId ?? "") ?? null}
            teamKey={showTeam ? teamById.get(issue.teamId)?.key : undefined}
          />
        ))}
    </div>
  )
}

function TeamSection({
  team,
  items,
  memberById,
  tab,
}: {
  team: Team
  items: Issue[]
  memberById: Map<string, Member>
  tab: IssueTab
}) {
  const [collapsed, setCollapsed] = useState(false)
  const filtered = useMemo(() => filterIssuesByTab(items, tab), [items, tab])
  const grouped = useMemo(() => {
    const out = {} as Record<IssueStatus, Issue[]>
    for (const s of STATUS_ORDER) out[s] = []
    for (const issue of filtered) out[issue.status].push(issue)
    return out
  }, [filtered])

  if (filtered.length === 0) return null

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 border-b px-5 py-2">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className={`text-muted-foreground/70 size-2 shrink-0 fill-current transition-transform ${collapsed ? "-rotate-90" : ""}`}
          >
            <path d="M1 2 L7 2 L4 6 Z" />
          </svg>
          {team.name}
          <span className="text-muted-foreground ml-0.5 font-mono text-xs font-normal">
            {team.key}
          </span>
          <span className="text-muted-foreground text-xs font-normal">
            {filtered.length}
          </span>
        </button>
      </div>
      {!collapsed &&
        STATUS_ORDER.map((s) =>
          grouped[s].length > 0 ? (
            <StatusSection
              key={s}
              status={s}
              items={grouped[s]}
              memberById={memberById}
              teamById={new Map([[team.id, team]])}
              showTeam={false}
            />
          ) : null
        )}
    </div>
  )
}

export default function AllIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<IssueTab>("all")
  const [groupBy, setGroupBy] = useState<GroupBy>("status")
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([i, m, t]) => {
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setLoading(false)
    })
  }, [])

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  )
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])

  const filtered = useMemo(
    () => filterIssuesByTab(issues, activeTab),
    [issues, activeTab]
  )

  const grouped = useMemo(() => {
    const out = {} as Record<IssueStatus, Issue[]>
    for (const s of STATUS_ORDER) out[s] = []
    for (const issue of filtered) out[issue.status].push(issue)
    return out
  }, [filtered])

  const openCreate = useCallback(() => setCreateOpen(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "c" && e.key !== "C") return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName.toLowerCase()
      if (tag === "input" || tag === "textarea") return
      if (document.querySelector('[data-state="open"][role="dialog"]')) return
      e.preventDefault()
      openCreate()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openCreate])

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex h-11 shrink-0 items-center justify-between border-b px-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="flex h-9 items-center gap-3 border-b px-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
        <div className="space-y-2 p-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold">All Issues</h1>
            <span className="text-muted-foreground text-xs">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Group by toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
                  />
                }
              >
                <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
                Group: {groupBy === "status" ? "Status" : "Team"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setGroupBy("status")}>
                  By status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("team")}>
                  By team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
            >
              <HugeiconsIcon
                icon={SlidersHorizontalIcon}
                className="size-3.5"
              />
              Filter
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              New issue
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex h-9 shrink-0 items-center border-b px-5">
          {(["all", "active", "backlog"] as IssueTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`mr-4 border-b-2 py-2 text-xs transition-colors ${
                activeTab === tab
                  ? "border-foreground text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Issue list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-muted-foreground text-sm font-medium">
                No issues
              </p>
              <p className="text-muted-foreground/60 mt-1 text-xs">
                {activeTab === "active"
                  ? "No active issues at the moment."
                  : activeTab === "backlog"
                    ? "The backlog is clear."
                    : "Create your first issue."}
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="bg-primary text-primary-foreground mt-4 flex items-center gap-1.5 rounded px-3 py-1.5 text-xs"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                New issue
              </button>
            </div>
          ) : groupBy === "status" ? (
            STATUS_ORDER.map((s) => (
              <StatusSection
                key={s}
                status={s}
                items={grouped[s]}
                memberById={memberById}
                teamById={teamById}
                showTeam
              />
            ))
          ) : (
            teams.map((team) => (
              <TeamSection
                key={team.id}
                team={team}
                items={issues.filter((i) => i.teamId === team.id)}
                memberById={memberById}
                tab={activeTab}
              />
            ))
          )}
        </div>
      </div>

      <CreateIssueDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            // Refresh issues after creating
            fetch("/api/data/issues")
              .then((r) => r.json())
              .then(setIssues)
          }
        }}
      />
    </>
  )
}
