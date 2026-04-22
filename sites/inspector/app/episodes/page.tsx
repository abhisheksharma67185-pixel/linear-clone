"use client"

import Link from "next/link"
import { IconHistory, IconPlus } from "@tabler/icons-react"
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
import { relativeTime } from "@/lib/format"

export default function EpisodesIndexPage() {
  const history = useSitesStore((s) => s.history)
  const hydrated = useSitesStore((s) => s.hydrated)

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
      ) : history.length === 0 ? (
        <Alert>
          <IconHistory className="size-4" />
          <AlertTitle>No episodes yet</AlertTitle>
          <AlertDescription>
            <Button asChild className="mt-2">
              <Link href="/episodes/new">Start your first episode</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{history.length} episodes</CardTitle>
            <CardDescription>
              Stored locally; cleared when you wipe browser data.
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
    </PageShell>
  )
}
