"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Issue, Member } from "@/app/lib/mock-data"
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
  BarChartIcon,
} from "@hugeicons/core-free-icons"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import { ViewOptionsPopover } from "@/components/view-options-popover"

const CURRENT_USER = "usr-1"

export default function MyIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
    ]).then(([i, m]) => {
      setIssues(i)
      setMembers(m)
      setLoading(false)
    })
  }, [])

  const assigned = issues.filter(
    (i) =>
      i.assigneeId === CURRENT_USER &&
      i.status !== "done" &&
      i.status !== "cancelled"
  )
  const created = issues.filter((i) => i.creatorId === CURRENT_USER)

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center justify-between px-6 py-3">
          <h1 className="text-sm font-medium">My issues</h1>
          <div className="text-muted-foreground flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-7">
              <HugeiconsIcon icon={FilterIcon} className="size-4" />
            </Button>
            <ViewOptionsPopover />
            <Button variant="ghost" size="icon" className="size-7">
              <HugeiconsIcon icon={BarChartIcon} className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-7">
              <HugeiconsIcon icon={PanelRightIcon} className="size-4" />
            </Button>
          </div>
        </header>

        <Tabs
          defaultValue="assigned"
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="px-4">
            <TabsList className="h-10 gap-1 bg-transparent p-0">
              <TabPill value="assigned">Assigned</TabPill>
              <TabPill value="created">Created</TabPill>
              <TabPill value="subscribed">Subscribed</TabPill>
              <TabPill value="activity">Activity</TabPill>
            </TabsList>
          </div>

          <TabsContent value="assigned" className="m-0 flex-1 overflow-auto">
            {loading ? (
              <LoadingRows />
            ) : assigned.length === 0 ? (
              <EmptyState
                label="No issues assigned to you"
                onCreate={() => setCreateOpen(true)}
              />
            ) : (
              <IssueList issues={assigned} members={members} />
            )}
          </TabsContent>

          <TabsContent value="created" className="m-0 flex-1 overflow-auto">
            {loading ? (
              <LoadingRows />
            ) : created.length === 0 ? (
              <EmptyState
                label="You haven't created any issues"
                onCreate={() => setCreateOpen(true)}
              />
            ) : (
              <IssueList issues={created} members={members} />
            )}
          </TabsContent>

          <TabsContent value="subscribed" className="m-0 flex-1 overflow-auto">
            <EmptyState
              label="You're not subscribed to any issues"
              onCreate={() => setCreateOpen(true)}
            />
          </TabsContent>

          <TabsContent value="activity" className="m-0 flex-1 overflow-auto">
            <EmptyState
              label="No recent activity"
              onCreate={() => setCreateOpen(true)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateIssueDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
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
        <Skeleton key={i} className="h-9 rounded-md" />
      ))}
    </div>
  )
}

function EmptyState({
  label,
  onCreate,
}: {
  label: string
  onCreate: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 py-24">
      <EmptyIllustration />
      <p className="text-muted-foreground text-sm">{label}</p>
      <Button
        onClick={onCreate}
        className="h-8 rounded-full bg-violet-600 px-4 text-xs font-medium text-white hover:bg-violet-700"
      >
        Create new issue
      </Button>
    </div>
  )
}

function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="text-muted-foreground h-24 w-32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g opacity="0.35">
        <ellipse cx="80" cy="38" rx="22" ry="6" />
        <path d="M52 34 Q40 38 40 46" />
        <path d="M108 34 Q120 38 120 46" />
      </g>
      <g opacity="0.9">
        <ellipse cx="80" cy="60" rx="22" ry="6" />
        <path d="M52 56 Q36 60 36 70" />
        <path d="M108 56 Q124 60 124 70" />
        <path d="M30 58 Q16 62 16 74" opacity="0.5" />
        <path d="M130 58 Q144 62 144 74" opacity="0.5" />
      </g>
      <g opacity="0.5">
        <path d="M58 82 Q80 92 102 82" />
        <path d="M48 86 Q80 100 112 86" opacity="0.5" />
      </g>
    </svg>
  )
}

function IssueList({
  issues,
  members,
}: {
  issues: Issue[]
  members: Member[]
}) {
  return (
    <ul className="divide-y">
      {issues.map((issue) => {
        const assignee = members.find((m) => m.id === issue.assigneeId)
        return (
          <li key={issue.id}>
            <Link
              href={`/issues/${issue.identifier}`}
              className="hover:bg-accent/50 flex items-center gap-3 px-6 py-2.5 transition-colors"
            >
              <Badge
                variant="secondary"
                className={`min-w-14 justify-center text-[10px] ${priorityStyle[issue.priority]}`}
              >
                {issue.priority}
              </Badge>
              <span className="text-muted-foreground w-16 font-mono text-xs">
                {issue.identifier}
              </span>
              <span className="flex-1 truncate text-sm">{issue.title}</span>
              <Badge
                variant="secondary"
                className={`text-[10px] ${statusStyle[issue.status]}`}
              >
                {issue.status.charAt(0).toUpperCase() +
                  issue.status.slice(1).replace("_", " ")}
              </Badge>
              {assignee && (
                <Avatar className="size-6">
                  <AvatarImage src={assignee.avatar} alt={assignee.name} />
                  <AvatarFallback className="text-[10px]">
                    {assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
