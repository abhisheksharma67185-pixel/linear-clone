"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import type { Issue, Project } from "@/app/lib/mock-data"
import { formatStatus } from "@/lib/badge-styles"

const STATUS_BADGE: Record<string, string> = {
  to_do: "bg-gray-100 text-gray-700 border border-gray-300",
  in_progress: "bg-blue-100 text-blue-700 border border-blue-300",
  in_review: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  done: "bg-green-100 text-green-700 border border-green-300",
}

type RecentItem = {
  id: string
  key: string
  title: string
  subtitle: string
  status: string
  statusLabel: string
  updatedAt: string
  href: string
  kind: "issue" | "project"
  issueType?: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`
}

function getTimeGroup(dateStr: string): "Today" | "This week" | "This month" {
  const now = new Date()
  const date = new Date(dateStr)

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  if (date >= startOfToday) return "Today"

  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1))
  if (date >= startOfWeek) return "This week"

  return "This month"
}

function IssueTypeIcon({ type }: { type?: string }) {
  if (type === "bug") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-red-100">
        <svg
          className="size-4 text-red-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
    )
  }
  if (type === "story") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
        <svg
          className="size-4 text-green-600"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 2h14a1 1 0 011 1v18a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1zm1 2v16h12V4H6z" />
        </svg>
      </div>
    )
  }
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
      <svg
        className="size-4 text-blue-600"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </div>
  )
}

function ProjectIcon() {
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-purple-100">
      <svg
        className="size-4 text-purple-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    </div>
  )
}

export default function RecentPage() {
  const [tab, setTab] = useState<"worked" | "viewed">("worked")
  const [search, setSearch] = useState("")
  const [items, setItems] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
    ]).then(([issues, projects]: [Issue[], Project[]]) => {
      const projectMap = new Map(projects.map((p) => [p.id, p]))

      const issueItems: RecentItem[] = issues.map((issue) => {
        const project = projectMap.get(issue.projectId)
        const typeName =
          issue.type.charAt(0).toUpperCase() + issue.type.slice(1)
        return {
          id: issue.id,
          key: issue.key,
          title: issue.summary,
          subtitle: `${typeName} · ${project?.name ?? "Project"} · ${issue.key}`,
          status: issue.status,
          statusLabel: formatStatus(issue.status),
          updatedAt: issue.updatedAt,
          href: `/issue/${issue.key}`,
          kind: "issue" as const,
          issueType: issue.type,
        }
      })

      const projectItems: RecentItem[] = projects.map((project) => ({
        id: project.id,
        key: project.key,
        title: project.name,
        subtitle: `Project · Projects · ${project.key}`,
        status: "PENDING",
        statusLabel: "PENDING",
        updatedAt: project.createdAt,
        href: `/projects/${project.key}/board`,
        kind: "project" as const,
      }))

      const all = [...issueItems, ...projectItems].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )

      setItems(all)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((item) => item.title.toLowerCase().includes(q))
  }, [items, search])

  const grouped = useMemo(() => {
    const groups: { label: string; items: RecentItem[] }[] = []
    const map = new Map<string, RecentItem[]>()
    const order = ["Today", "This week", "This month"]

    for (const item of filtered) {
      const group = getTimeGroup(item.updatedAt)
      if (!map.has(group)) map.set(group, [])
      map.get(group)!.push(item)
    }

    for (const label of order) {
      const groupItems = map.get(label)
      if (groupItems && groupItems.length > 0) {
        groups.push({ label, items: groupItems })
      }
    }

    return groups
  }, [filtered])

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Recent</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b">
        <button
          onClick={() => setTab("worked")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            tab === "worked"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Worked on
        </button>
        <button
          onClick={() => setTab("viewed")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            tab === "viewed"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Viewed
        </button>
      </div>

      {/* Search filter */}
      <div className="mb-6">
        <div className="relative w-56">
          <svg
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            placeholder="Filter by title"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="size-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            {search
              ? "No items match your search."
              : "You\u2019re all done for now. Check back soon to find out what\u2019s next."}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.label}
              </p>
              <div className="flex flex-col">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 rounded-md border-b px-2 py-3 transition-colors last:border-b-0 hover:bg-accent/50"
                  >
                    {/* Icon */}
                    <div className="shrink-0">
                      {item.kind === "project" ? (
                        <ProjectIcon />
                      ) : (
                        <IssueTypeIcon type={item.issueType} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Status badge + time */}
                    <div className="flex shrink-0 items-center gap-3">
                      {item.kind === "issue" ? (
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            STATUS_BADGE[item.status] || STATUS_BADGE.to_do
                          }`}
                        >
                          {item.statusLabel}
                        </span>
                      ) : (
                        <span className="rounded border border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 uppercase">
                          PENDING
                        </span>
                      )}
                      <span className="text-xs whitespace-nowrap text-muted-foreground">
                        {timeAgo(item.updatedAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
