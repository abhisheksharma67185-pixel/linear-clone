"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import {
  IconAlertTriangle,
  IconPlayerPlay,
  IconSearch,
} from "@tabler/icons-react"
import { toast } from "sonner"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageShell } from "@/components/page-shell"
import { useSitesStore } from "@/lib/sites-store"
import { useTasks } from "@/lib/hooks"
import { api, ApiError } from "@/lib/api-client"
import { difficultyVariant } from "@/lib/format"
import type { StartEpisodeResponse } from "@/lib/types"

export default function NewEpisodePage() {
  const router = useRouter()
  const search = useSearchParams()
  const sites = useSitesStore((s) => s.sites)
  const hydrated = useSitesStore((s) => s.hydrated)
  const pushHistory = useSitesStore((s) => s.pushHistory)

  const initialSite = search.get("site") ?? sites[0]?.id ?? ""
  const initialTask = search.get("task") ?? ""

  const [siteId, setSiteId] = React.useState<string>(initialSite)
  React.useEffect(() => {
    // If sites finish hydrating after initial render, pick the first one.
    if (hydrated && !siteId && sites.length > 0) {
      setSiteId(sites[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sites.length])

  const [taskId, setTaskId] = React.useState<string>(initialTask)
  const [seed, setSeed] = React.useState<string>("")
  const [taskQuery, setTaskQuery] = React.useState<string>("")

  const site = sites.find((s) => s.id === siteId)
  const tasksQuery = useTasks(site)

  const filteredTasks = React.useMemo(() => {
    const list = tasksQuery.data?.tasks ?? []
    const needle = taskQuery.trim().toLowerCase()
    if (!needle) return list
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(needle) ||
        t.id.toLowerCase().includes(needle) ||
        t.goal.toLowerCase().includes(needle)
    )
  }, [tasksQuery.data, taskQuery])

  const start = useMutation({
    mutationFn: async () => {
      if (!site) throw new Error("Pick a site")
      if (!taskId) throw new Error("Pick a task")
      const seedNum = seed.trim() ? Number(seed.trim()) : undefined
      if (seedNum !== undefined && (!isFinite(seedNum) || seedNum < 0)) {
        throw new Error("Seed must be a non-negative number")
      }
      return api.post<StartEpisodeResponse>(site, "/api/sim/config", {
        task_id: taskId,
        seed: seedNum,
      })
    },
    onSuccess: (resp) => {
      if (!site) return
      pushHistory({
        siteId: site.id,
        episodeId: resp.episode_id,
        taskId: resp.task.id,
        taskTitle: resp.task.title,
        startedAt: new Date().toISOString(),
        status: "running",
      })
      toast.success("Episode started")
      router.push(
        `/episodes/${encodeURIComponent(site.id)}/${encodeURIComponent(resp.episode_id)}`
      )
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to start")
    },
  })

  return (
    <PageShell
      title="Start a new episode"
      description="Pick a site and task, then launch. The runner streams observations live."
    >
      {!hydrated ? (
        <Skeleton className="h-96 w-full max-w-2xl" />
      ) : sites.length === 0 ? (
        <Alert>
          <IconAlertTriangle className="size-4" />
          <AlertTitle>No sites configured</AlertTitle>
          <AlertDescription>
            <Link className="underline" href="/sites">
              Add a site
            </Link>{" "}
            first.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Episode setup</CardTitle>
            <CardDescription>
              Episodes are server-side; only one runs per site at a time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                start.mutate()
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ep-site">Site</Label>
                  <Select
                    value={siteId}
                    onValueChange={(v) => {
                      setSiteId(v ?? "")
                      setTaskId("")
                    }}
                  >
                    <SelectTrigger id="ep-site">
                      <SelectValue placeholder="Pick a site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ep-seed">Seed (optional)</Label>
                  <Input
                    id="ep-seed"
                    inputMode="numeric"
                    placeholder="0"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ep-task-search">Task</Label>
                <div className="relative">
                  <IconSearch className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="ep-task-search"
                    className="pl-7"
                    placeholder="Search tasks…"
                    value={taskQuery}
                    onChange={(e) => setTaskQuery(e.target.value)}
                    disabled={!site || tasksQuery.isLoading}
                  />
                </div>
                <div className="max-h-72 overflow-y-auto rounded-md border bg-background">
                  {tasksQuery.isLoading && (
                    <div className="space-y-2 p-3">
                      {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  )}
                  {tasksQuery.isError && (
                    <p className="p-3 text-xs text-destructive">
                      Couldn&apos;t load tasks:{" "}
                      {tasksQuery.error instanceof Error
                        ? tasksQuery.error.message
                        : "unknown error"}
                    </p>
                  )}
                  {tasksQuery.data && filteredTasks.length === 0 && (
                    <p className="p-3 text-xs text-muted-foreground">
                      No tasks match.
                    </p>
                  )}
                  {tasksQuery.data && filteredTasks.length > 0 && (
                    <ul className="divide-y">
                      {filteredTasks.slice(0, 200).map((t) => {
                        const selected = t.id === taskId
                        return (
                          <li key={t.id}>
                            <button
                              type="button"
                              onClick={() => setTaskId(t.id)}
                              className={`flex w-full items-start gap-3 p-2.5 text-left text-sm transition-colors ${
                                selected
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-muted/60"
                              }`}
                              aria-pressed={selected}
                            >
                              <input
                                type="radio"
                                checked={selected}
                                readOnly
                                className="mt-1"
                                aria-hidden
                              />
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">
                                  {t.title}
                                </div>
                                <div className="truncate font-mono text-[11px] text-muted-foreground">
                                  {t.id}
                                </div>
                              </div>
                              <div className="flex shrink-0 flex-wrap gap-1">
                                <Badge variant="secondary">{t.domain}</Badge>
                                <Badge
                                  variant={difficultyVariant(t.difficulty)}
                                >
                                  {t.difficulty}
                                </Badge>
                              </div>
                            </button>
                          </li>
                        )
                      })}
                      {filteredTasks.length > 200 && (
                        <li className="p-2 text-center text-[11px] text-muted-foreground">
                          Showing first 200 of {filteredTasks.length}; refine
                          the search.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {start.error && (
                <Alert variant="destructive">
                  <IconAlertTriangle className="size-4" />
                  <AlertTitle>Couldn&apos;t start episode</AlertTitle>
                  <AlertDescription>
                    {start.error instanceof ApiError
                      ? start.error.message
                      : start.error instanceof Error
                        ? start.error.message
                        : "Unknown error"}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button asChild variant="outline" type="button">
                  <Link href="/tasks">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={!site || !taskId || start.isPending}
                >
                  <IconPlayerPlay className="size-4" />
                  {start.isPending ? "Starting…" : "Start episode"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </PageShell>
  )
}
