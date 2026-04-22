"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconRefresh,
} from "@tabler/icons-react"
import { computeDiff } from "@thetabench/core"
import type { StateDiff, GenericSnapshot } from "@thetabench/core"
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
import { Separator } from "@/components/ui/separator"
import { JsonView } from "@/components/json-view"
import { PageShell } from "@/components/page-shell"
import { useSitesStore } from "@/lib/sites-store"
import { api } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"

type Params = Promise<{ site: string; episodeId: string }>

// Distinguish collection arrays (arrays of items with string `id`) from
// singletons. We infer from the state shape so we don't need a site-specific
// schema.
function classifyState(state: Record<string, unknown> | undefined): {
  collections: string[]
  singletons: string[]
} {
  if (!state) return { collections: [], singletons: [] }
  const collections: string[] = []
  const singletons: string[] = []
  for (const [k, v] of Object.entries(state)) {
    if (k === "capturedAt") continue
    if (Array.isArray(v)) {
      const sample = v[0]
      if (
        sample &&
        typeof sample === "object" &&
        !Array.isArray(sample) &&
        typeof (sample as Record<string, unknown>).id === "string"
      ) {
        collections.push(k)
      }
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      singletons.push(k)
    }
  }
  return { collections, singletons }
}

function DiffSection({
  title,
  count,
  tone,
  children,
}: {
  title: string
  count: number
  tone: "added" | "removed" | "modified"
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(count > 0)
  const toneCls: Record<typeof tone, string> = {
    added: "bg-emerald-500/10 border-emerald-500/30",
    removed: "bg-red-500/10 border-red-500/30",
    modified: "bg-amber-500/10 border-amber-500/30",
  }
  return (
    <div className={`rounded-md border p-3 ${toneCls[tone]}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-medium"
        aria-expanded={open}
      >
        <span className="capitalize">
          {title} <span className="text-muted-foreground">({count})</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {open ? "collapse" : "expand"}
        </span>
      </button>
      {open && count > 0 && <div className="mt-3">{children}</div>}
    </div>
  )
}

function AddedList({ items }: { items: StateDiff["added"] }) {
  const byEntity = groupBy(items, (i) => i.entity)
  return (
    <div className="space-y-4">
      {Object.entries(byEntity).map(([entity, rows]) => (
        <div key={entity}>
          <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {entity} · {rows.length}
          </div>
          <div className="space-y-1.5">
            {rows.map((r) => (
              <details key={r.id} className="rounded border bg-background">
                <summary className="flex cursor-pointer items-center gap-2 px-2 py-1 font-mono text-xs">
                  <Badge variant="success">+</Badge>
                  {r.id}
                </summary>
                <div className="px-2 pb-2">
                  <JsonView
                    data={r.item}
                    defaultCollapsedDepth={2}
                    copyable={false}
                  />
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function RemovedList({ items }: { items: StateDiff["removed"] }) {
  const byEntity = groupBy(items, (i) => i.entity)
  return (
    <div className="space-y-4">
      {Object.entries(byEntity).map(([entity, rows]) => (
        <div key={entity}>
          <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {entity} · {rows.length}
          </div>
          <ul className="space-y-1 font-mono text-xs">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <Badge variant="destructive">−</Badge>
                {r.id}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function ModifiedList({ items }: { items: StateDiff["modified"] }) {
  const byEntity = groupBy(items, (i) => i.entity)
  return (
    <div className="space-y-4">
      {Object.entries(byEntity).map(([entity, rows]) => (
        <div key={entity}>
          <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {entity} · {rows.length}
          </div>
          <div className="space-y-2">
            {rows.map((m, i) => (
              <div
                key={`${m.path}-${i}`}
                className="space-y-1 rounded border bg-background p-2 text-xs"
              >
                <div className="flex items-center gap-2 font-mono text-muted-foreground">
                  <Badge variant="warning">~</Badge>
                  {m.path}
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      before
                    </div>
                    <pre className="max-h-32 overflow-auto rounded bg-red-500/10 p-1.5 font-mono">
                      {stringify(m.before)}
                    </pre>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      after
                    </div>
                    <pre className="max-h-32 overflow-auto rounded bg-emerald-500/10 p-1.5 font-mono">
                      {stringify(m.after)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function groupBy<T, K extends string | number>(
  items: T[],
  key: (item: T) => K
): Record<string, T[]> {
  const out: Record<string, T[]> = {}
  for (const item of items) {
    const k = String(key(item))
    out[k] ??= []
    out[k].push(item)
  }
  return out
}

function stringify(v: unknown): string {
  if (v === undefined) return "undefined"
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

export default function SnapshotPage({ params }: { params: Params }) {
  const { site: siteId, episodeId } = use(params)
  const sites = useSitesStore((s) => s.sites)
  const hydrated = useSitesStore((s) => s.hydrated)
  const site = sites.find((s) => s.id === siteId)

  const snapshotQuery = useQuery({
    queryKey: site ? qk.snapshot(site.id) : ["snapshot", "none"],
    enabled: !!site,
    staleTime: 0,
    queryFn: () => api.get<Record<string, unknown>>(site!, "/api/sim/snapshot"),
  })

  const stateQuery = useQuery({
    queryKey: site ? qk.state(site.id) : ["state", "none"],
    enabled: !!site,
    staleTime: 0,
    queryFn: () => api.get<Record<string, unknown>>(site!, "/api/sim/state"),
  })

  const { collections, singletons } = React.useMemo(
    () => classifyState(stateQuery.data),
    [stateQuery.data]
  )

  const diff: StateDiff | null = React.useMemo(() => {
    if (!snapshotQuery.data || !stateQuery.data) return null
    const initial = snapshotQuery.data as GenericSnapshot
    const current = stateQuery.data as GenericSnapshot
    return computeDiff(initial, current, collections, singletons)
  }, [snapshotQuery.data, stateQuery.data, collections, singletons])

  const refreshAll = () => {
    snapshotQuery.refetch()
    stateQuery.refetch()
  }

  if (hydrated && !site) {
    return (
      <PageShell title="Snapshot diff" description="Site not found.">
        <Alert variant="destructive">
          <IconAlertTriangle className="size-4" />
          <AlertTitle>Unknown site</AlertTitle>
          <AlertDescription>
            No site with ID <code className="font-mono">{siteId}</code>{" "}
            configured.
          </AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Snapshot diff"
      description={
        site && (
          <span className="font-mono text-xs">
            {site.id} · episode {episodeId}
          </span>
        )
      }
      actions={
        <>
          <Button asChild variant="outline">
            <Link
              href={`/episodes/${encodeURIComponent(siteId)}/${encodeURIComponent(episodeId)}`}
            >
              <IconArrowLeft className="size-4" /> Back to runner
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={snapshotQuery.isFetching || stateQuery.isFetching}
          >
            <IconRefresh
              className={
                snapshotQuery.isFetching || stateQuery.isFetching
                  ? "size-4 animate-spin"
                  : "size-4"
              }
            />
            Refresh
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {(snapshotQuery.isError || stateQuery.isError) && (
          <Alert variant="destructive">
            <IconAlertTriangle className="size-4" />
            <AlertTitle>Couldn&apos;t load snapshots</AlertTitle>
            <AlertDescription className="space-y-1">
              {snapshotQuery.isError && (
                <div>
                  initial:{" "}
                  {snapshotQuery.error instanceof Error
                    ? snapshotQuery.error.message
                    : "unknown"}
                </div>
              )}
              {stateQuery.isError && (
                <div>
                  current:{" "}
                  {stateQuery.error instanceof Error
                    ? stateQuery.error.message
                    : "unknown"}
                </div>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                Snapshots require an active episode on the site.
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Diff summary</CardTitle>
            <CardDescription>
              Computed locally with{" "}
              <code className="font-mono">computeDiff</code> from{" "}
              <code className="font-mono">@thetabench/core</code>. Collections
              detected:{" "}
              {collections.length > 0 ? (
                collections.map((c) => (
                  <Badge key={c} variant="outline" className="ml-1">
                    {c}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">none</span>
              )}
              {singletons.length > 0 && (
                <>
                  {" · singletons: "}
                  {singletons.map((c) => (
                    <Badge key={c} variant="outline" className="ml-1">
                      {c}
                    </Badge>
                  ))}
                </>
              )}
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            {snapshotQuery.isLoading || stateQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !diff ? (
              <p className="text-sm text-muted-foreground">
                No diff available yet.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">added {diff.added.length}</Badge>
                  <Badge variant="destructive">
                    removed {diff.removed.length}
                  </Badge>
                  <Badge variant="warning">
                    modified {diff.modified.length}
                  </Badge>
                </div>

                <DiffSection
                  title="Added"
                  count={diff.added.length}
                  tone="added"
                >
                  <AddedList items={diff.added} />
                </DiffSection>

                <DiffSection
                  title="Removed"
                  count={diff.removed.length}
                  tone="removed"
                >
                  <RemovedList items={diff.removed} />
                </DiffSection>

                <DiffSection
                  title="Modified"
                  count={diff.modified.length}
                  tone="modified"
                >
                  <ModifiedList items={diff.modified} />
                </DiffSection>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Initial snapshot</CardTitle>
              <CardDescription>
                <code className="font-mono">GET /api/sim/snapshot</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {snapshotQuery.isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : snapshotQuery.data ? (
                <JsonView data={snapshotQuery.data} defaultCollapsedDepth={1} />
              ) : (
                <p className="text-sm text-muted-foreground">Unavailable.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Current state</CardTitle>
              <CardDescription>
                <code className="font-mono">GET /api/sim/state</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stateQuery.isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : stateQuery.data ? (
                <JsonView data={stateQuery.data} defaultCollapsedDepth={1} />
              ) : (
                <p className="text-sm text-muted-foreground">Unavailable.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />
      <p className="text-xs text-muted-foreground">
        Episode ID <code className="font-mono">{episodeId}</code> is displayed
        for reference. The engine serves one episode at a time per site — the
        snapshot endpoints return whichever is active.
      </p>
    </PageShell>
  )
}
