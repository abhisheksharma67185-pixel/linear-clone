"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { View, Member, Issue, Cycle, Label } from "@/app/lib/mock-data"
import { filterIssuesForView } from "@/lib/view-filter"
import { CreateViewDialog } from "@/components/create-view-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ViewsPage() {
  const [views, setViews] = useState<View[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/views").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/cycles").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
    ]).then(([v, m, i, c, l]) => {
      setViews(v)
      setMembers(m)
      setIssues(i)
      setCycles(c)
      setLabels(Array.isArray(l) ? l : [])
      setLoading(false)
    })
  }, [])

  const countsByView = useMemo(() => {
    const map = new Map<string, number>()
    for (const view of views) {
      map.set(view.id, filterIssuesForView(view, issues, { labels, cycles }).length)
    }
    return map
  }, [views, issues, labels, cycles])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-24" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Views</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Saved filters and custom views.
            </p>
          </div>

          <Button onClick={() => setDialogOpen(true)}>New View</Button>
        </div>

        <CreateViewDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreated={(created) => setViews((prev) => [...prev, created])}
        />

        {views.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No views yet. Create one to get started.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {views.map((view) => {
              const owner = members.find((m) => m.id === view.ownerId)
              const count = countsByView.get(view.id) ?? 0
              return (
                <Link key={view.id} href={`/views/${view.id}`}>
                  <div className="group flex h-full flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <ViewIcon name={view.name} />
                        <span className="truncate text-sm font-medium">
                          {view.name}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px] tabular-nums"
                      >
                        {count}
                      </Badge>
                    </div>
                    {view.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {view.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                      <code className="truncate rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {view.filterQuery}
                      </code>
                      {owner && (
                        <Tooltip>
                          <TooltipTrigger render={<span className="shrink-0" />}>
                            <Avatar className="size-5 ring-2 ring-card">
                              <AvatarImage src={owner.avatar} alt={owner.name} />
                              <AvatarFallback className="text-[9px]">
                                {owner.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>{owner.name}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

function ViewIcon({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-violet-500 to-indigo-500 text-[10px] font-semibold text-white">
      {initials}
    </div>
  )
}
