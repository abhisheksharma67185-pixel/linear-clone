/**
 * Overview page (`/`)
 *
 * PURPOSE  Landing page. One <SiteCard> per configured site shows live
 *          health: task / domain / curriculum-stage counts pulled from
 *          /api/health, plus quick links to Browse tasks, Start episode,
 *          and open the site itself.
 * USAGE    The first place you go after starting a sim site locally.
 *          Cards turn green when the proxy can reach the site, red when
 *          the upstream fetch fails. <RecentEpisodes> below lists the
 *          last 8 episodes started from this browser tab.
 * DATA     useHealth(site) → /api/health (per-site, refetch every 30s).
 *          useSitesStore for the configured site list + episode history.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconPlus,
  IconExternalLink,
  IconCheck,
  IconAlertTriangle,
  IconHistory,
} from "@tabler/icons-react"
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
import { StatusDot } from "@/components/status-dot"
import { PageShell } from "@/components/page-shell"
import { useSitesStore } from "@/lib/sites-store"
import { useHealth } from "@/lib/hooks"
import { compactNumber, relativeTime } from "@/lib/format"
import type { SiteConnection } from "@/lib/types"

function SiteCard({ site }: { site: SiteConnection }) {
  const { data, isLoading, isError, dataUpdatedAt, error, refetch } =
    useHealth(site)

  const status = isLoading
    ? "loading"
    : isError
      ? "error"
      : data?.status === "ok"
        ? "ok"
        : "warn"

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <StatusDot status={status} />
            <span className="truncate">{site.name}</span>
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px]">
            {site.id}
          </Badge>
        </div>
        <CardDescription className="truncate font-mono text-xs">
          {site.url}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
        {isError && (
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-destructive">Site unreachable</p>
            <p className="mt-1 font-mono break-words">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}
        {data && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xl font-semibold">
                {compactNumber(data.tasks)}
              </div>
              <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
                tasks
              </div>
            </div>
            <div>
              <div className="text-xl font-semibold">{data.domains}</div>
              <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
                domains
              </div>
            </div>
            <div>
              <div className="text-xl font-semibold">
                {data.curriculum_stages}
              </div>
              <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
                stages
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            last seen:{" "}
            {dataUpdatedAt
              ? relativeTime(new Date(dataUpdatedAt).toISOString())
              : "—"}
          </span>
          <button
            onClick={() => refetch()}
            className="transition-colors hover:text-foreground"
          >
            refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/tasks?site=${encodeURIComponent(site.id)}`}>
              Browse tasks
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/episodes/new?site=${encodeURIComponent(site.id)}`}>
              Start episode
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Open site in new tab"
          >
            <a href={site.url} target="_blank" rel="noopener noreferrer">
              <IconExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentEpisodes() {
  const history = useSitesStore((s) => s.history)
  const hydrated = useSitesStore((s) => s.hydrated)

  if (!hydrated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconHistory className="size-4" /> Recent episodes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconHistory className="size-4" /> Recent episodes
          </CardTitle>
          <CardDescription>
            Episodes you start from the inspector show up here. Stored locally;
            cleared on browser data wipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/episodes/new">Start your first episode</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconHistory className="size-4" /> Recent episodes
        </CardTitle>
        <CardDescription>From your local history.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {history.slice(0, 8).map((entry) => (
            <li
              key={entry.episodeId}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/episodes/${encodeURIComponent(entry.siteId)}/${encodeURIComponent(entry.episodeId)}`}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {entry.taskTitle}
                </Link>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{entry.siteId}</span>
                  <span>·</span>
                  <span>{relativeTime(entry.startedAt)}</span>
                  {entry.score !== undefined && (
                    <>
                      <span>·</span>
                      <span>score {entry.score.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge
                variant={
                  entry.status === "completed"
                    ? "success"
                    : entry.status === "failed" || entry.status === "timeout"
                      ? "destructive"
                      : entry.status === "running"
                        ? "default"
                        : "secondary"
                }
              >
                {entry.status}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const sites = useSitesStore((s) => s.sites)
  const hydrated = useSitesStore((s) => s.hydrated)

  return (
    <PageShell
      title="Overview"
      description={
        <>
          Live engine state across {sites.length} configured site
          {sites.length === 1 ? "" : "s"}. Click a card to drill in.
        </>
      }
      actions={
        <Button asChild>
          <Link href="/sites">
            <IconPlus className="size-4" /> Add site
          </Link>
        </Button>
      }
    >
      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <Alert>
          <IconAlertTriangle className="size-4" />
          <AlertTitle>No sites configured</AlertTitle>
          <AlertDescription>
            Add a site to start inspecting the engine.
            <Button asChild size="sm" className="mt-2">
              <Link href="/sites">Add a site</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
          <div className="mt-8">
            <RecentEpisodes />
          </div>
          <Alert className="mt-8">
            <IconCheck className="size-4" />
            <AlertTitle>Tip</AlertTitle>
            <AlertDescription>
              Run a site with{" "}
              <code className="font-mono">pnpm --filter &lt;site&gt; dev</code>{" "}
              and refresh — the card flips green and the task counts populate.
            </AlertDescription>
          </Alert>
        </>
      )}
    </PageShell>
  )
}
