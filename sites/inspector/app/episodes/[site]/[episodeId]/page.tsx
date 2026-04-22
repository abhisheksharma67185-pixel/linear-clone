"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconGitCompare,
  IconFlag,
  IconRefresh,
  IconX,
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { JsonView } from "@/components/json-view"
import { PageShell } from "@/components/page-shell"
import { useSitesStore } from "@/lib/sites-store"
import { useRLObservation, useEpisodeMeta, useActionSpace } from "@/lib/hooks"
import { api, ApiError } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import type {
  RLStepResponse,
  ActionHistoryEntry,
  FinishEpisodeResponse,
} from "@/lib/types"

type Params = Promise<{ site: string; episodeId: string }>

export default function EpisodeRunnerPage({ params }: { params: Params }) {
  const { site: siteId, episodeId } = use(params)
  const router = useRouter()
  const sites = useSitesStore((s) => s.sites)
  const hydrated = useSitesStore((s) => s.hydrated)
  const updateHistory = useSitesStore((s) => s.updateHistory)
  const site = sites.find((s) => s.id === siteId)
  const queryClient = useQueryClient()

  const [autoRefresh, setAutoRefresh] = React.useState(true)
  const [actionInput, setActionInput] = React.useState(
    JSON.stringify({ action: "navigate", target: "/" }, null, 2)
  )
  const [history, setHistory] = React.useState<ActionHistoryEntry[]>([])
  const [finishOpen, setFinishOpen] = React.useState(false)
  const [agentResponse, setAgentResponse] = React.useState("")
  const [finishResult, setFinishResult] =
    React.useState<FinishEpisodeResponse | null>(null)

  const obsQuery = useRLObservation(site)
  const epMeta = useEpisodeMeta(site)
  const actionSpace = useActionSpace(site)

  // Auto-refresh observation while the episode is active.
  React.useEffect(() => {
    if (!autoRefresh || !site || finishResult) return
    const interval = setInterval(() => {
      obsQuery.refetch()
      epMeta.refetch()
    }, 3000)
    return () => clearInterval(interval)
  }, [autoRefresh, site, finishResult, obsQuery, epMeta])

  const stepMutation = useMutation({
    mutationFn: async (action: Record<string, unknown>) => {
      if (!site) throw new Error("Site not configured")
      return api.post<RLStepResponse>(site, "/api/rl", action)
    },
    onSuccess: (resp, action) => {
      setHistory((h) => [
        {
          at: new Date().toISOString(),
          action,
          reward: resp.reward,
          done: resp.done,
          truncated: resp.truncated,
          info: resp.info,
        },
        ...h,
      ])
      // Bust observation/state caches.
      if (site) {
        queryClient.invalidateQueries({ queryKey: qk.rlObs(site.id) })
        queryClient.invalidateQueries({ queryKey: qk.episode(site.id) })
        queryClient.invalidateQueries({ queryKey: qk.state(site.id) })
        queryClient.invalidateQueries({ queryKey: qk.snapshot(site.id) })
      }
      if (resp.done || resp.truncated) {
        toast.message(
          resp.done ? "Episode reports done" : "Episode reports truncated"
        )
      }
    },
    onError: (err, action) => {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Step failed"
      setHistory((h) => [
        {
          at: new Date().toISOString(),
          action,
          reward: 0,
          done: false,
          truncated: false,
          info: {},
          error: message,
        },
        ...h,
      ])
      toast.error(message)
    },
  })

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!site) throw new Error("Site not configured")
      return api.post<FinishEpisodeResponse>(site, "/api/sim/finish", {
        agent_response: agentResponse || undefined,
      })
    },
    onSuccess: (resp) => {
      setFinishResult(resp)
      setFinishOpen(false)
      updateHistory(episodeId, {
        status:
          resp.status === "completed"
            ? "completed"
            : resp.status === "failed"
              ? "failed"
              : resp.status === "timeout"
                ? "timeout"
                : "completed",
        score: resp.score,
      })
      toast.success(`Episode finished — score ${resp.score?.toFixed(2)}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Finish failed")
    },
  })

  const onStep = () => {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(actionInput)
    } catch (e) {
      toast.error(
        `Invalid JSON: ${e instanceof Error ? e.message : "unknown error"}`
      )
      return
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      toast.error("Action must be a JSON object")
      return
    }
    if (!parsed.action) {
      toast.error('Action object must have an "action" string field')
      return
    }
    stepMutation.mutate(parsed)
  }

  if (hydrated && !site) {
    return (
      <PageShell title="Episode" description="Site not found.">
        <Alert variant="destructive">
          <IconAlertTriangle className="size-4" />
          <AlertTitle>Unknown site</AlertTitle>
          <AlertDescription>
            No site with ID <code className="font-mono">{siteId}</code>.{" "}
            <Link href="/sites" className="underline">
              Add it
            </Link>{" "}
            to continue.
          </AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Episode runner"
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
              href={`/snapshots/${encodeURIComponent(siteId)}/${encodeURIComponent(episodeId)}`}
            >
              <IconGitCompare className="size-4" /> Diff snapshot
            </Link>
          </Button>
          <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="default"
                  disabled={!!finishResult || finishMutation.isPending}
                >
                  <IconFlag className="size-4" /> Finish episode
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Finish episode</DialogTitle>
                <DialogDescription>
                  Submits an optional final agent response to{" "}
                  <code className="font-mono">/api/sim/finish</code>. The engine
                  evaluates state diff and rubric checks, then returns a score.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="finish-resp">Agent response (optional)</Label>
                <Textarea
                  id="finish-resp"
                  rows={4}
                  value={agentResponse}
                  onChange={(e) => setAgentResponse(e.target.value)}
                  placeholder="For retrieval tasks: paste the agent's final answer."
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setFinishOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => finishMutation.mutate()}
                  disabled={finishMutation.isPending}
                >
                  {finishMutation.isPending ? "Finishing…" : "Finish"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      {finishResult && (
        <Alert className="mb-6">
          <IconCheck className="size-4" />
          <AlertTitle>
            Episode {finishResult.status} · score{" "}
            {finishResult.score?.toFixed(3)}
          </AlertTitle>
          <AlertDescription>
            {finishResult.steps} step{finishResult.steps === 1 ? "" : "s"} ·
            total reward {finishResult.total_reward?.toFixed(3)} ·{" "}
            {finishResult.wall_time_seconds?.toFixed(1)}s wall time
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="observation">
        <TabsList>
          <TabsTrigger value="observation">Observation</TabsTrigger>
          <TabsTrigger value="step">Step</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          <TabsTrigger value="action-space">Action space</TabsTrigger>
          {finishResult && <TabsTrigger value="result">Result</TabsTrigger>}
        </TabsList>

        <TabsContent value="observation">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Live observation</CardTitle>
                  <CardDescription>
                    From <code className="font-mono">GET /api/rl</code>.{" "}
                    {epMeta.data && (
                      <>
                        Active:{" "}
                        <Badge variant="secondary">
                          {String(epMeta.data.active ?? "?")}
                        </Badge>
                      </>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    Auto-refresh every 3s
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => obsQuery.refetch()}
                    disabled={obsQuery.isFetching}
                  >
                    <IconRefresh
                      className={
                        obsQuery.isFetching ? "size-4 animate-spin" : "size-4"
                      }
                    />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {obsQuery.isLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : obsQuery.isError ? (
                <Alert variant="destructive">
                  <IconAlertTriangle className="size-4" />
                  <AlertTitle>Couldn&apos;t fetch observation</AlertTitle>
                  <AlertDescription>
                    {obsQuery.error instanceof Error
                      ? obsQuery.error.message
                      : String(obsQuery.error)}
                  </AlertDescription>
                </Alert>
              ) : (
                <JsonView data={obsQuery.data} defaultCollapsedDepth={3} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step">
          <Card>
            <CardHeader>
              <CardTitle>Step</CardTitle>
              <CardDescription>
                POST a JSON action to <code className="font-mono">/api/rl</code>
                . Must include an <code className="font-mono">action</code>{" "}
                string.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={10}
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder='{"action": "navigate", "target": "/board"}'
              />
              <div className="flex items-center gap-2">
                <Button onClick={onStep} disabled={stepMutation.isPending}>
                  <IconArrowRight className="size-4" />
                  {stepMutation.isPending ? "Stepping…" : "Step"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActionInput(
                      JSON.stringify(
                        { action: "navigate", target: "/" },
                        null,
                        2
                      )
                    )
                  }
                >
                  Reset to navigate
                </Button>
                <span className="text-xs text-muted-foreground">
                  Tip: peek at the Action space tab for examples per site.
                </span>
              </div>

              {history[0] && (
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={history[0].error ? "destructive" : "secondary"}
                    >
                      latest
                    </Badge>
                    <span className="font-mono text-xs">
                      reward {history[0].reward.toFixed(3)}
                    </span>
                    {history[0].done && <Badge variant="success">done</Badge>}
                    {history[0].truncated && (
                      <Badge variant="warning">truncated</Badge>
                    )}
                    {history[0].error && (
                      <span className="text-xs text-destructive">
                        {history[0].error}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Action timeline</CardTitle>
              <CardDescription>
                Inspector keeps this in memory for the current tab — refresh to
                clear. The engine&apos;s own action log is returned with{" "}
                <code className="font-mono">/api/sim/finish</code>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No steps yet. Try one in the Step tab.
                </p>
              ) : (
                <ol className="space-y-3">
                  {history.map((h, i) => (
                    <li
                      key={`${h.at}-${i}`}
                      className="space-y-2 rounded-md border bg-card p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-muted-foreground">
                          {history.length - i}
                        </span>
                        <Badge
                          variant={
                            h.error
                              ? "destructive"
                              : h.reward >= 0
                                ? "success"
                                : "warning"
                          }
                        >
                          {h.error ? "error" : `reward ${h.reward.toFixed(3)}`}
                        </Badge>
                        {h.done && <Badge variant="success">done</Badge>}
                        {h.truncated && (
                          <Badge variant="warning">truncated</Badge>
                        )}
                        <span className="ml-auto text-muted-foreground">
                          {new Date(h.at).toLocaleTimeString()}
                        </span>
                      </div>
                      <JsonView
                        data={h.action}
                        defaultCollapsedDepth={2}
                        copyable={false}
                        className="[&>pre]:max-h-40"
                      />
                      {h.error && (
                        <p className="flex items-center gap-1 text-xs text-destructive">
                          <IconX className="size-3" /> {h.error}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action-space">
          <Card>
            <CardHeader>
              <CardTitle>Action space</CardTitle>
              <CardDescription>
                <code className="font-mono">GET /api/rl/action-space</code>.
                Click an example to load it into the Step input.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionSpace.isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : actionSpace.isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Couldn&apos;t fetch action space</AlertTitle>
                  <AlertDescription>
                    {actionSpace.error instanceof Error
                      ? actionSpace.error.message
                      : String(actionSpace.error)}
                  </AlertDescription>
                </Alert>
              ) : (
                <ActionSpaceList
                  data={actionSpace.data}
                  onUseExample={(ex) =>
                    setActionInput(JSON.stringify(ex, null, 2))
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {finishResult && (
          <TabsContent value="result">
            <Card>
              <CardHeader>
                <CardTitle>Final result</CardTitle>
                <CardDescription>
                  Returned by{" "}
                  <code className="font-mono">POST /api/sim/finish</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="status" value={finishResult.status} />
                  <Stat label="score" value={finishResult.score?.toFixed(3)} />
                  <Stat
                    label="reward"
                    value={finishResult.total_reward?.toFixed(3)}
                  />
                  <Stat label="steps" value={String(finishResult.steps)} />
                </div>
                <JsonView data={finishResult} defaultCollapsedDepth={2} />
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/episodes/new">Start another</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link
                      href={`/snapshots/${encodeURIComponent(siteId)}/${encodeURIComponent(episodeId)}`}
                    >
                      View diff
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    type="button"
                  >
                    <IconArrowLeft className="size-4" /> Back to overview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </PageShell>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="font-mono text-lg">{value}</div>
    </div>
  )
}

interface ActionSpaceItem {
  name: string
  description?: string
  example?: unknown
}

function ActionSpaceList({
  data,
  onUseExample,
}: {
  data: unknown
  onUseExample: (ex: unknown) => void
}) {
  const actions: ActionSpaceItem[] = React.useMemo(() => {
    if (!data || typeof data !== "object") return []
    const arr = (data as Record<string, unknown>).actions
    if (!Array.isArray(arr)) return []
    return arr.filter(
      (a): a is ActionSpaceItem =>
        !!a &&
        typeof a === "object" &&
        typeof (a as ActionSpaceItem).name === "string"
    )
  }, [data])

  if (actions.length === 0) {
    return <JsonView data={data} defaultCollapsedDepth={2} />
  }

  return (
    <ul className="grid gap-2 md:grid-cols-2">
      {actions.map((a) => (
        <li
          key={a.name}
          className="flex flex-col gap-1.5 rounded-md border bg-card p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold">{a.name}</span>
            {a.example !== undefined && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onUseExample(a.example)}
              >
                Use example
              </Button>
            )}
          </div>
          {a.description && (
            <p className="text-xs text-muted-foreground">{a.description}</p>
          )}
          {a.example !== undefined && (
            <JsonView
              data={a.example}
              defaultCollapsedDepth={1}
              copyable={false}
              className="[&>pre]:max-h-32 [&>pre]:text-[10px]"
            />
          )}
        </li>
      ))}
    </ul>
  )
}
