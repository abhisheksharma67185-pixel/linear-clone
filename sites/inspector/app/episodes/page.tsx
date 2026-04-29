"use client"

import Link from "next/link"
import { useQueries } from "@tanstack/react-query"
import { IconHistory, IconPlus, IconActivity } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
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
import { relativeTime } from "@/lib/format"
import type { SiteConnection } from "@/lib/types"

interface ServerEpisode {
  active: boolean
  episodeId?: string
  siteId: string
  siteName: string
  taskId?: string
  taskTitle?: string
  stepCount?: number
  maxSteps?: number
  elapsedSeconds?: number
}

export default function EpisodesIndexPage() {
  const history = useSitesStore((s) => s.history)
  const sites = useSitesStore((s) => s.sites)
  const hydrated = useSitesStore((s) => s.hydrated)

  // Each site reports at most one active episode (the engine is single-tenant
  // per site). Polling every 5s keeps the live list fresh.
  const liveQueries = useQueries({
    queries: sites.map((site: SiteConnection) => ({
      queryKey: [...qk.episode(site.id), "summary"] as const,
      enabled: hydrated,
      staleTime: 5_000,
      refetchInterval: 5_000,
      retry: false,
      queryFn: async (): Promise<ServerEpisode> => {
        try {
          const data = await api.get<Record<string, unknown>>(
            site,
            "/api/sim/episode"
          )
          // Different sites have used slightly different shapes; normalize.
          const active = Boolean(
            data.active ?? (data.episode_id || data.episodeId)
          )
          return {
            active,
            episodeId: (data.episode_id ?? data.episodeId) as
              | string
              | undefined,
            siteId: site.id,
            siteName: site.name,
            taskId: (data.task_id ?? data.taskId) as string | undefined,
            taskTitle: (data.task_title ?? data.taskTitle) as
              | string
              | undefined,
            stepCount: (data.step_count ?? data.stepCount) as
              | number
              | undefined,
            maxSteps: (data.max_steps ?? data.maxSteps) as number | undefined,
            elapsedSeconds: (data.elapsed_seconds ?? data.elapsedSeconds) as
              | number
              | undefined,
          }
        } catch {
          return { active: false, siteId: site.id, siteName: site.name }
        }
      },
    })),
  })

  const liveEpisodes = liveQueries
    .map((q) => q.data)
    .filter((e): e is ServerEpisode => !!e && e.active)

  return (
    <PageShell
      title="Episodes"
      description="Recent episodes you've started from this browser."
      actions={
        <Button asChild>
          <Link href="/episodes/new">
            <IconPlus className="size-4" /> New episode
          </Link>
        </Button>
      }
    >
      {!hydrated ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-6">
          {liveEpisodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconActivity className="size-4 text-emerald-500" /> Live
                  episodes ({liveEpisodes.length})
                </CardTitle>
                <CardDescription>
                  Polled from each site&apos;s <code>/api/sim/episode</code>{" "}
                  every 5s. Each site runs at most one episode at a time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {liveEpisodes.map((ep) => (
                    <li
                      key={`${ep.siteId}:${ep.episodeId}`}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/episodes/${encodeURIComponent(ep.siteId)}/${encodeURIComponent(ep.episodeId ?? "")}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {ep.taskTitle ?? ep.taskId ?? "(unnamed task)"}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{ep.siteName}</Badge>
                          {ep.stepCount !== undefined &&
                            ep.maxSteps !== undefined && (
                              <span>
                                step {ep.stepCount}/{ep.maxSteps}
                              </span>
                            )}
                          {ep.elapsedSeconds !== undefined && (
                            <span>· {ep.elapsedSeconds.toFixed(1)}s</span>
                          )}
                          {ep.episodeId && (
                            <span className="font-mono">{ep.episodeId}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="success">active</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {history.length === 0 ? (
            <Alert>
              <IconHistory className="size-4" />
              <AlertTitle>No browser-recorded episodes yet</AlertTitle>
              <AlertDescription>
                Episodes you start from the inspector will appear here.{" "}
                <Button asChild size="sm" className="mt-2">
                  <Link href="/episodes/new">Start your first episode</Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {history.length} browser-recorded episode
                  {history.length === 1 ? "" : "s"}
                </CardTitle>
                <CardDescription>
                  Stored locally in this tab; cleared when you wipe browser
                  data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {history.map((entry) => (
                    <li
                      key={entry.episodeId}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/episodes/${encodeURIComponent(entry.siteId)}/${encodeURIComponent(entry.episodeId)}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {entry.taskTitle}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{entry.siteId}</Badge>
                          <span>{relativeTime(entry.startedAt)}</span>
                          {entry.score !== undefined && (
                            <span>· score {entry.score.toFixed(2)}</span>
                          )}
                          <span className="font-mono">{entry.episodeId}</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          entry.status === "completed"
                            ? "success"
                            : entry.status === "failed" ||
                                entry.status === "timeout"
                              ? "destructive"
                              : "default"
                        }
                      >
                        {entry.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </PageShell>
  )
}
