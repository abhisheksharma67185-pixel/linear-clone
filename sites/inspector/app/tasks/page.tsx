"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useQueries } from "@tanstack/react-query"
import { IconSearch, IconAlertTriangle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageShell } from "@/components/page-shell"
import { useSitesStore } from "@/lib/sites-store"
import { api, ApiError } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { difficultyVariant } from "@/lib/format"
import type { TasksResponse, TaskSummary, SiteConnection } from "@/lib/types"

const ALL = "__all__"

const DOMAINS = [
  "navigation",
  "products",
  "orders",
  "customers",
  "discounts",
  "settings",
  "search",
  "retrieval",
  "impossible",
  "multi-domain",
  "issues",
  "projects",
  "cycles",
  "labels",
  "views",
  "teams",
  "messages",
  "channels",
  "dms",
]

const DIFFICULTIES = ["easy", "medium", "hard", "expert"]
const TYPES = ["action", "retrieval", "action_retrieval", "no_action"]
const STAGES = Array.from({ length: 10 }, (_, i) => String(i + 1))

interface EnrichedTask extends TaskSummary {
  _siteId: string
  _siteName: string
  _siteUrl: string
}

export default function TasksPage() {
  const router = useRouter()
  const params = useSearchParams()
  const sites = useSitesStore((s) => s.sites)
  const hydrated = useSitesStore((s) => s.hydrated)

  // Read filters from URL so the page is sharable.
  const urlSite = params.get("site") ?? ALL
  const urlDomain = params.get("domain") ?? ALL
  const urlDifficulty = params.get("difficulty") ?? ALL
  const urlType = params.get("type") ?? ALL
  const urlStage = params.get("stage") ?? ALL
  const urlSearch = params.get("q") ?? ""

  const [search, setSearch] = React.useState(urlSearch)

  const setParam = React.useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (!value || value === ALL) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      router.replace(`/tasks${next.toString() ? `?${next.toString()}` : ""}`)
    },
    [params, router],
  )

  // Debounce text search → URL.
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (search !== urlSearch) setParam("q", search || null)
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const targetedSites: SiteConnection[] = React.useMemo(
    () =>
      urlSite === ALL ? sites : sites.filter((s) => s.id === urlSite),
    [sites, urlSite],
  )

  // Run one query per site, in parallel.
  const queries = useQueries({
    queries: targetedSites.map((site) => ({
      queryKey: [
        ...qk.tasks(site.id),
        {
          domain: urlDomain === ALL ? undefined : urlDomain,
          difficulty: urlDifficulty === ALL ? undefined : urlDifficulty,
          type: urlType === ALL ? undefined : urlType,
          stage: urlStage === ALL ? undefined : urlStage,
        },
      ] as const,
      staleTime: 5 * 60_000,
      queryFn: () =>
        api.get<TasksResponse>(site, "/api/sim/tasks", {
          domain: urlDomain === ALL ? undefined : urlDomain,
          difficulty: urlDifficulty === ALL ? undefined : urlDifficulty,
          type: urlType === ALL ? undefined : urlType,
          stage: urlStage === ALL ? undefined : urlStage,
        }),
    })),
  })

  const allLoaded = queries.every((q) => !q.isLoading)
  const someError = queries.some((q) => q.isError)
  const allError = queries.length > 0 && queries.every((q) => q.isError)

  const tasks: EnrichedTask[] = React.useMemo(() => {
    const out: EnrichedTask[] = []
    queries.forEach((q, i) => {
      const site = targetedSites[i]
      if (!site || !q.data) return
      for (const t of q.data.tasks) {
        out.push({
          ...t,
          _siteId: site.id,
          _siteName: site.name,
          _siteUrl: site.url,
        })
      }
    })

    const needle = search.trim().toLowerCase()
    return needle
      ? out.filter(
          (t) =>
            t.id.toLowerCase().includes(needle) ||
            t.title.toLowerCase().includes(needle) ||
            t.goal.toLowerCase().includes(needle),
        )
      : out
  }, [queries, targetedSites, search])

  const [pageSize] = React.useState(50)
  const [pageIdx, setPageIdx] = React.useState(0)
  React.useEffect(() => {
    setPageIdx(0)
  }, [
    urlSite,
    urlDomain,
    urlDifficulty,
    urlType,
    urlStage,
    search,
    tasks.length,
  ])
  const pageCount = Math.max(1, Math.ceil(tasks.length / pageSize))
  const pagedTasks = tasks.slice(pageIdx * pageSize, pageIdx * pageSize + pageSize)

  return (
    <PageShell
      title="Tasks"
      description="Browse all tasks from every configured site. Click a row to inspect."
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="grid gap-3 pt-6 md:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="task-search">Search</Label>
              <div className="relative">
                <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  id="task-search"
                  className="pl-7"
                  placeholder="Title, ID, or goal…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <FilterSelect
              label="Site"
              value={urlSite}
              onChange={(v) => setParam("site", v)}
              options={[{ value: ALL, label: "All sites" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
            />
            <FilterSelect
              label="Domain"
              value={urlDomain}
              onChange={(v) => setParam("domain", v)}
              options={[{ value: ALL, label: "All domains" }, ...DOMAINS.map((d) => ({ value: d, label: d }))]}
            />
            <FilterSelect
              label="Difficulty"
              value={urlDifficulty}
              onChange={(v) => setParam("difficulty", v)}
              options={[
                { value: ALL, label: "All difficulties" },
                ...DIFFICULTIES.map((d) => ({ value: d, label: d })),
              ]}
            />
            <FilterSelect
              label="Type"
              value={urlType}
              onChange={(v) => setParam("type", v)}
              options={[{ value: ALL, label: "All types" }, ...TYPES.map((d) => ({ value: d, label: d }))]}
            />
            <FilterSelect
              label="Stage"
              value={urlStage}
              onChange={(v) => setParam("stage", v)}
              options={[{ value: ALL, label: "All stages" }, ...STAGES.map((d) => ({ value: d, label: `Stage ${d}` }))]}
            />
          </CardContent>
        </Card>

        {!hydrated ? (
          <Skeleton className="h-96 w-full" />
        ) : sites.length === 0 ? (
          <Alert>
            <IconAlertTriangle className="size-4" />
            <AlertTitle>No sites configured</AlertTitle>
            <AlertDescription>
              Add a site on the{" "}
              <Link className="underline" href="/sites">
                Sites page
              </Link>
              .
            </AlertDescription>
          </Alert>
        ) : allError ? (
          <Alert variant="destructive">
            <IconAlertTriangle className="size-4" />
            <AlertTitle>No sites are reachable</AlertTitle>
            <AlertDescription>
              Start a site dev server and refresh, e.g.{" "}
              <code className="font-mono">pnpm --filter shopify-admin dev</code>.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>
                  {tasks.length} task{tasks.length === 1 ? "" : "s"}
                </span>
                {someError && (
                  <Badge variant="destructive">
                    {queries.filter((q) => q.isError).length} site
                    {queries.filter((q) => q.isError).length === 1 ? "" : "s"} unreachable
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Showing{" "}
                {tasks.length === 0
                  ? 0
                  : pageIdx * pageSize + 1}
                –{Math.min(tasks.length, (pageIdx + 1) * pageSize)} of{" "}
                {tasks.length}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!allLoaded ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No tasks match these filters.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Steps</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedTasks.map((t) => (
                        <TableRow
                          key={`${t._siteId}:${t.id}`}
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/tasks/${encodeURIComponent(t._siteId)}/${encodeURIComponent(t.id)}`,
                            )
                          }
                        >
                          <TableCell className="max-w-[420px]">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <Link
                                href={`/tasks/${encodeURIComponent(t._siteId)}/${encodeURIComponent(t.id)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-medium hover:underline truncate"
                              >
                                {t.title}
                              </Link>
                              <span className="text-[11px] font-mono text-muted-foreground truncate">
                                {t.id}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{t._siteName}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{t.domain}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={difficultyVariant(t.difficulty)}>
                              {t.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs font-mono">
                            {t.type}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {t.curriculum_stage}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {t.max_steps}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {pageCount > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground">
                        Page {pageIdx + 1} of {pageCount}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
                          disabled={pageIdx === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPageIdx((p) => Math.min(pageCount - 1, p + 1))
                          }
                          disabled={pageIdx === pageCount - 1}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {someError && !allError && (
                <Alert className="mt-4" variant="destructive">
                  <AlertTitle>Some sites unreachable</AlertTitle>
                  <AlertDescription>
                    {queries
                      .map((q, i) => ({ q, site: targetedSites[i] }))
                      .filter(({ q }) => q.isError)
                      .map(({ q, site }) => (
                        <div key={site.id} className="text-xs">
                          <span className="font-mono">{site.id}</span>:{" "}
                          {q.error instanceof ApiError ? q.error.message : String(q.error)}
                        </div>
                      ))}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? ALL)}>
        <SelectTrigger>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
