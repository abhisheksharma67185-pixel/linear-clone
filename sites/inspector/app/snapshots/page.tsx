"use client"

import * as React from "react"
import Link from "next/link"
import { IconGitCompare, IconHistory } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { PageShell } from "@/components/page-shell"
import { useSitesStore } from "@/lib/sites-store"
import { relativeTime } from "@/lib/format"

export default function SnapshotsIndexPage() {
  const history = useSitesStore((s) => s.history)
  const hydrated = useSitesStore((s) => s.hydrated)

  return (
    <PageShell
      title="Snapshots"
      description="Open a snapshot diff for any episode you started from this browser."
    >
      {!hydrated ? (
        <Skeleton className="h-48 w-full" />
      ) : history.length === 0 ? (
        <Alert>
          <IconGitCompare className="size-4" />
          <AlertTitle>No episodes yet</AlertTitle>
          <AlertDescription>
            Start an episode first — the snapshot diff is computed from{" "}
            <code className="font-mono">/api/sim/snapshot</code> and{" "}
            <code className="font-mono">/api/sim/state</code> on the active
            episode.
            <Button asChild size="sm" className="mt-2">
              <Link href="/episodes/new">Start an episode</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconHistory className="size-4" /> Recent episodes
            </CardTitle>
            <CardDescription>
              Newest first. Note: only the currently-active episode on a site
              has live snapshot data.
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
                      href={`/snapshots/${encodeURIComponent(entry.siteId)}/${encodeURIComponent(entry.episodeId)}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {entry.taskTitle}
                    </Link>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <Badge variant="outline">{entry.siteId}</Badge>
                      <span>{relativeTime(entry.startedAt)}</span>
                      <span className="font-mono">{entry.episodeId}</span>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/snapshots/${encodeURIComponent(entry.siteId)}/${encodeURIComponent(entry.episodeId)}`}
                    >
                      <IconGitCompare className="size-4" /> Diff
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </PageShell>
  )
}
