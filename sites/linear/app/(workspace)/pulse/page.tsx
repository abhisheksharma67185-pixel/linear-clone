"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Issue, Member, Team } from "@/app/lib/mock-data"
import { statusStyle, priorityStyle } from "@/lib/status-styles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FilterIcon,
  PanelRightIcon,
  Activity03Icon,
  BubbleChatIcon,
  CheckmarkCircle02Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons"

type ActivityKind = "status" | "comment" | "created" | "completed"

interface ActivityItem {
  id: string
  kind: ActivityKind
  issue: Issue
  actor: Member
  at: string
}

function timeAgo(iso: string, now: Date): string {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d`
  const months = Math.round(days / 30)
  return `${months}mo`
}

function buildFeed(issues: Issue[], members: Member[]): ActivityItem[] {
  const byId = new Map(members.map((m) => [m.id, m]))
  const feed: ActivityItem[] = []
  for (const issue of issues) {
    const actor = byId.get(issue.assigneeId ?? issue.creatorId)
    if (!actor) continue
    let kind: ActivityKind = "status"
    if (issue.status === "done") kind = "completed"
    else if (issue.createdAt === issue.updatedAt) kind = "created"
    else if (issue.priority === "urgent" || issue.priority === "high")
      kind = "comment"
    feed.push({
      id: `${issue.id}-${issue.updatedAt}`,
      kind,
      issue,
      actor,
      at: issue.updatedAt,
    })
  }
  return feed.sort((a, b) => (a.at < b.at ? 1 : -1))
}

export default function PulsePage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [now] = useState(() => new Date("2026-04-22T12:00:00.000Z"))

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

  const feed = useMemo(() => buildFeed(issues, members), [issues, members])
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between px-6 py-3">
        <h1 className="text-sm font-medium">Pulse</h1>
        <div className="text-muted-foreground flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="size-7">
            <HugeiconsIcon icon={FilterIcon} className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7">
            <HugeiconsIcon icon={PanelRightIcon} className="size-4" />
          </Button>
        </div>
      </header>

      <Tabs
        defaultValue="following"
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="px-4">
          <TabsList className="h-10 gap-1 bg-transparent p-0">
            <TabPill value="following">Following</TabPill>
            <TabPill value="for-you">For you</TabPill>
            <TabPill value="all">All</TabPill>
          </TabsList>
        </div>

        <TabsContent value="following" className="m-0 flex-1 overflow-auto">
          {loading ? (
            <LoadingRows />
          ) : feed.length === 0 ? (
            <EmptyState />
          ) : (
            <FeedList items={feed.slice(0, 30)} teamById={teamById} now={now} />
          )}
        </TabsContent>

        <TabsContent value="for-you" className="m-0 flex-1 overflow-auto">
          {loading ? (
            <LoadingRows />
          ) : (
            <FeedList items={feed.slice(0, 12)} teamById={teamById} now={now} />
          )}
        </TabsContent>

        <TabsContent value="all" className="m-0 flex-1 overflow-auto">
          {loading ? (
            <LoadingRows />
          ) : (
            <FeedList items={feed} teamById={teamById} now={now} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TabPill({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return (
    <TabsTrigger
      value={value}
      className="text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground rounded-full border-0 bg-transparent px-3 py-1 text-xs font-medium shadow-none data-[state=active]:shadow-none"
    >
      {children}
    </TabsTrigger>
  )
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-2 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-md" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 py-24 text-sm">
      <HugeiconsIcon icon={Activity03Icon} className="size-8 opacity-60" />
      <p>No recent activity</p>
    </div>
  )
}

function FeedList({
  items,
  teamById,
  now,
}: {
  items: ActivityItem[]
  teamById: Map<string, Team>
  now: Date
}) {
  return (
    <ul className="divide-y">
      {items.map((item) => {
        const team = teamById.get(item.issue.teamId)
        return (
          <li key={item.id}>
            <Link
              href={`/issues/${item.issue.identifier}`}
              className="hover:bg-accent/50 flex items-start gap-3 px-6 py-3 transition-colors"
            >
              <Avatar className="size-7 shrink-0">
                <AvatarImage src={item.actor.avatar} alt={item.actor.name} />
                <AvatarFallback className="text-[10px]">
                  {item.actor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium">{item.actor.name}</span>
                  <span className="text-muted-foreground">
                    {verbFor(item.kind, item.issue.status)}
                  </span>
                  <KindIcon kind={item.kind} />
                  <span className="text-muted-foreground ml-auto shrink-0">
                    {timeAgo(item.at, now)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-xs">
                    {item.issue.identifier}
                  </span>
                  <span className="flex-1 truncate text-sm">
                    {item.issue.title}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${statusStyle[item.issue.status]}`}
                  >
                    {item.issue.status.charAt(0).toUpperCase() +
                      item.issue.status.slice(1).replace("_", " ")}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${priorityStyle[item.issue.priority]}`}
                  >
                    {item.issue.priority}
                  </Badge>
                  {team && (
                    <span className="bg-muted text-muted-foreground rounded-sm px-1.5 py-0.5 font-mono text-[10px]">
                      {team.key}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function verbFor(kind: ActivityKind, status: string): string {
  switch (kind) {
    case "completed":
      return "completed"
    case "created":
      return "created"
    case "comment":
      return "commented on"
    case "status":
      return `changed status to ${status.replace("_", " ")}`
  }
}

function KindIcon({ kind }: { kind: ActivityKind }) {
  switch (kind) {
    case "completed":
      return (
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className="size-3 text-emerald-500"
        />
      )
    case "comment":
      return (
        <HugeiconsIcon
          icon={BubbleChatIcon}
          className="text-muted-foreground size-3"
        />
      )
    case "created":
      return (
        <HugeiconsIcon
          icon={ArrowUp01Icon}
          className="text-muted-foreground size-3"
        />
      )
    case "status":
      return (
        <HugeiconsIcon
          icon={Activity03Icon}
          className="text-muted-foreground size-3"
        />
      )
  }
}
