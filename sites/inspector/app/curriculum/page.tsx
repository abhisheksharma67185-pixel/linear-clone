"use client"

import * as React from "react"
import Link from "next/link"
import { useQueries } from "@tanstack/react-query"
import { IconAlertTriangle, IconStairs } from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageShell } from "@/components/page-shell"
import { useSitesStore } from "@/lib/sites-store"
import { api } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import type { TasksResponse, TaskSummary } from "@/lib/types"

// Static stage metadata. We mirror this from packages/thetabench-core's
// curriculum.ts so the inspector renders the same labels even if a site
// doesn't expose its curriculum endpoint.
const STAGE_DEFS: { stage: number; title: string; description: string }[] = [
  {
    stage: 1,
    title: "Navigation Basics",
    description: "Navigate between pages and identify content",
  },
  {
    stage: 2,
    title: "Single Field Reads & Updates",
    description: "Read data and modify one field on existing entities",
  },
  { stage: 3, title: "Entity Creation", description: "Create new entities" },
  {
    stage: 4,
    title: "Order Operations",
    description: "Fulfill orders, capture payments, issue refunds",
  },
  {
    stage: 5,
    title: "Multi-Field Operations",
    description: "Update multiple fields in one operation",
  },
  {
    stage: 6,
    title: "Search & Information Retrieval",
    description: "Find specific data using search and calculation",
  },
  {
    stage: 7,
    title: "Conditional Logic",
    description: "Tasks requiring inspection before action",
  },
  {
    stage: 8,
    title: "Error Recognition & Multi-Step",
    description: "Impossible tasks and multi-step workflows",
  },
  {
    stage: 9,
    title: "Cross-Domain Workflows",
    description: "Tasks spanning multiple domains",
  },
  {
    stage: 10,
    title: "Expert Scenarios",
    description: "Complex real-world scenarios with multiple objectives",
  },
]

export default function CurriculumPage() {
  const sites = useSitesStore((s) => s.sites)
  const hydrated = useSitesStore((s) => s.hydrated)

  // For each site, just pull the task list (which has curriculum_stage on
  // every task). Aggregating client-side keeps the UI uniform across sites.
  const queries = useQueries({
    queries: sites.map((site) => ({
      queryKey: qk.tasks(site.id),
      staleTime: 5 * 60_000,
      queryFn: () => api.get<TasksResponse>(site, "/api/sim/tasks"),
    })),
  })

  // stage → siteId → taskCount
  const counts: Record<number, Record<string, number>> = React.useMemo(() => {
    const out: Record<number, Record<string, number>> = {}
    for (const def of STAGE_DEFS) out[def.stage] = {}
    queries.forEach((q, i) => {
      const site = sites[i]
      if (!site || !q.data) return
      for (const t of q.data.tasks as TaskSummary[]) {
        const stage = t.curriculum_stage
        if (!out[stage]) out[stage] = {}
        out[stage][site.id] = (out[stage][site.id] ?? 0) + 1
      }
    })
    return out
  }, [queries, sites])

  const allLoaded = queries.every((q) => !q.isLoading)
  const allError = queries.length > 0 && queries.every((q) => q.isError)

  return (
    <PageShell
      title="Curriculum"
      description="The 10-stage progression. Each card lists task counts contributed by every running site."
    >
      {!hydrated || !allLoaded ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STAGE_DEFS.map((s) => (
            <Skeleton key={s.stage} className="h-44 w-full" />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <Alert>
          <IconAlertTriangle className="size-4" />
          <AlertTitle>No sites configured</AlertTitle>
          <AlertDescription>
            Add a site to see how its tasks distribute across the curriculum.
          </AlertDescription>
        </Alert>
      ) : allError ? (
        <Alert variant="destructive">
          <IconAlertTriangle className="size-4" />
          <AlertTitle>No reachable sites</AlertTitle>
          <AlertDescription>
            Start at least one site dev server so we can pull task counts.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STAGE_DEFS.map((def) => {
            const total = Object.values(counts[def.stage] ?? {}).reduce(
              (a, b) => a + b,
              0
            )
            return (
              <Card key={def.stage} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                        {def.stage}
                      </span>
                      <span>{def.title}</span>
                    </CardTitle>
                    <Badge variant="outline">
                      <IconStairs className="size-3" /> {total}
                    </Badge>
                  </div>
                  <CardDescription>{def.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {sites.length === 0 ? null : (
                    <div className="flex flex-wrap gap-1.5">
                      {sites.map((site, i) => {
                        const q = queries[i]
                        const c = counts[def.stage]?.[site.id] ?? 0
                        if (q.isError) {
                          return (
                            <Badge
                              key={site.id}
                              variant="outline"
                              className="opacity-60"
                            >
                              {site.name}: down
                            </Badge>
                          )
                        }
                        return (
                          <Link
                            key={site.id}
                            href={`/tasks?site=${encodeURIComponent(site.id)}&stage=${def.stage}`}
                          >
                            <Badge
                              variant={c > 0 ? "secondary" : "outline"}
                              className="cursor-pointer transition-colors hover:bg-accent"
                            >
                              {site.name}: {c}
                            </Badge>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
