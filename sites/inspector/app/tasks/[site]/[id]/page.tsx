/**
 * Task detail (`/tasks/[site]/[id]`)
 *
 * PURPOSE  Full task definition for one task on one site: title, goal,
 *          retrieval rubric (question / ground truth / variations), eval
 *          checks, reward profile, max steps, tags, and the raw JSON
 *          straight from the engine.
 * USAGE    Reached from a row click on /tasks, from a "Browse tasks"
 *          button on the Overview, or by direct link. The "Start episode"
 *          button at the top routes to /episodes/new with the task
 *          pre-selected.
 * DATA     /api/sim/tasks/{id} (full TaskDefinition, with evalChecks
 *          which the list endpoint trims off). Falls back to scanning
 *          /api/sim/tasks for sites without the per-id route.
 */

"use client"

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  IconArrowLeft,
  IconPlayerPlay,
  IconAlertTriangle,
  IconClock,
  IconStairs,
  IconTags,
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
import { Separator } from "@/components/ui/separator"
import { JsonView } from "@/components/json-view"
import { PageShell } from "@/components/page-shell"
import { useSitesStore } from "@/lib/sites-store"
import { api, ApiError } from "@/lib/api-client"
import { qk } from "@/lib/query-keys"
import { difficultyVariant } from "@/lib/format"
import type { TasksResponse, TaskSummary } from "@/lib/types"
import type { TaskDefinition, EvalCheck } from "@thetabench/core"

type Params = Promise<{ site: string; id: string }>

// We try the per-id endpoint first (jira/shopify-admin have it). If the site
// only exposes the list endpoint, fall back to that and trim down.
type FetchedTask =
  | { kind: "full"; task: TaskDefinition }
  | { kind: "summary"; task: TaskSummary }

async function fetchTask(
  site: { id: string; url: string },
  id: string
): Promise<FetchedTask> {
  try {
    const task = await api.get<TaskDefinition>(site, `/api/sim/tasks/${id}`)
    return { kind: "full", task }
  } catch (err) {
    // 404 from the per-id endpoint, OR the route doesn't exist on this site.
    if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
      const list = await api.get<TasksResponse>(site, "/api/sim/tasks")
      const summary = list.tasks.find((t) => t.id === id)
      if (!summary) throw new ApiError("Task not found", 404, null)
      return { kind: "summary", task: summary }
    }
    throw err
  }
}

function CheckCard({ check, idx }: { check: EvalCheck; idx: number }) {
  return (
    <div className="space-y-2 rounded-md border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="font-mono">
          #{idx + 1} · {check.type}
        </Badge>
        <Badge variant="secondary">weight {check.weight}</Badge>
      </div>
      <p className="text-sm">{check.description}</p>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
        {check.entity && (
          <>
            <dt className="text-muted-foreground">entity</dt>
            <dd className="font-mono">{check.entity}</dd>
          </>
        )}
        {check.id && (
          <>
            <dt className="text-muted-foreground">id</dt>
            <dd className="font-mono">{check.id}</dd>
          </>
        )}
        {check.field && (
          <>
            <dt className="text-muted-foreground">field</dt>
            <dd className="font-mono">{check.field}</dd>
          </>
        )}
        {check.predicate && (
          <>
            <dt className="text-muted-foreground">predicate</dt>
            <dd className="font-mono">{check.predicate}</dd>
          </>
        )}
        {check.expected !== undefined && (
          <>
            <dt className="text-muted-foreground">expected</dt>
            <dd className="font-mono break-all">
              {JSON.stringify(check.expected)}
            </dd>
          </>
        )}
      </dl>
    </div>
  )
}

export default function TaskDetailPage({ params }: { params: Params }) {
  const { site: siteId, id } = use(params)
  const sites = useSitesStore((s) => s.sites)
  const hydrated = useSitesStore((s) => s.hydrated)
  const site = sites.find((s) => s.id === siteId)

  const { data, isLoading, error } = useQuery({
    queryKey: site ? qk.task(site.id, id) : ["task", "none"],
    enabled: !!site,
    staleTime: 5 * 60_000,
    queryFn: () => fetchTask(site!, id),
  })

  if (hydrated && !site) {
    return (
      <PageShell title="Task" description="Site not found.">
        <Alert variant="destructive">
          <IconAlertTriangle className="size-4" />
          <AlertTitle>Unknown site</AlertTitle>
          <AlertDescription>
            No site with ID <code className="font-mono">{siteId}</code> is
            configured. Add it on the{" "}
            <Link className="underline" href="/sites">
              Sites page
            </Link>
            .
          </AlertDescription>
        </Alert>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={data?.kind === "full" ? data.task.title : (data?.task.title ?? id)}
      description={
        site && (
          <span className="font-mono text-xs">
            {site.id} · {id}
          </span>
        )
      }
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/tasks">
              <IconArrowLeft className="size-4" /> All tasks
            </Link>
          </Button>
          {site && (
            <Button asChild>
              <Link
                href={`/episodes/new?site=${encodeURIComponent(site.id)}&task=${encodeURIComponent(id)}`}
              >
                <IconPlayerPlay className="size-4" /> Start episode
              </Link>
            </Button>
          )}
        </>
      }
    >
      {!hydrated || isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <IconAlertTriangle className="size-4" />
          <AlertTitle>Couldn&apos;t load task</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Unknown error"}
          </AlertDescription>
        </Alert>
      ) : !data ? null : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {data.kind === "full" ? data.task.domain : data.task.domain}
                  </Badge>
                  <Badge
                    variant={difficultyVariant(
                      data.kind === "full"
                        ? data.task.difficulty
                        : data.task.difficulty
                    )}
                  >
                    {data.kind === "full"
                      ? data.task.difficulty
                      : data.task.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    type:{" "}
                    {data.kind === "full" ? data.task.type : data.task.type}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <IconStairs className="size-3" /> stage{" "}
                    {data.kind === "full"
                      ? data.task.curriculumStage
                      : data.task.curriculum_stage}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <IconClock className="size-3" /> max{" "}
                    {data.kind === "full"
                      ? data.task.maxSteps
                      : data.task.max_steps}{" "}
                    steps
                  </Badge>
                </div>
                <CardTitle className="pt-2 text-xl">
                  {data.kind === "full" ? data.task.title : data.task.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Goal
                </h3>
                <p className="mt-1 text-sm leading-relaxed">
                  {data.kind === "full" ? data.task.goal : data.task.goal}
                </p>
                {data.kind === "full" && data.task.hint && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Hint
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed">
                      {data.task.hint}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {data.kind === "summary" && (
              <Alert>
                <AlertTitle>Limited view</AlertTitle>
                <AlertDescription>
                  This site doesn&apos;t expose{" "}
                  <code className="font-mono">/api/sim/tasks/[id]</code>, so
                  detailed checks, reward profile and rubric aren&apos;t
                  available here. The summary above and the full task list still
                  work.
                </AlertDescription>
              </Alert>
            )}

            {data.kind === "full" && (
              <>
                {data.task.evalChecks?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Eval checks ({data.task.evalChecks.length})
                      </CardTitle>
                      <CardDescription>
                        Conditions evaluated when the episode finishes. Total
                        weight:{" "}
                        {data.task.evalChecks.reduce(
                          (a, c) => a + (c.weight ?? 0),
                          0
                        )}
                        .
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {data.task.evalChecks.map((c, i) => (
                        <CheckCard key={i} check={c} idx={i} />
                      ))}
                    </CardContent>
                  </Card>
                )}

                {data.task.retrievalRubric && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Retrieval rubric</CardTitle>
                      <CardDescription>
                        Used by the LLM judge to score retrieval responses.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <div className="text-xs tracking-wide text-muted-foreground uppercase">
                          Question
                        </div>
                        <p className="mt-0.5">
                          {data.task.retrievalRubric.question}
                        </p>
                      </div>
                      <div>
                        <div className="text-xs tracking-wide text-muted-foreground uppercase">
                          Ground truth
                        </div>
                        <p className="mt-0.5 rounded bg-muted/40 p-2 font-mono text-xs">
                          {data.task.retrievalRubric.groundTruth}
                        </p>
                      </div>
                      {data.task.retrievalRubric.acceptableVariations?.length >
                        0 && (
                        <div>
                          <div className="text-xs tracking-wide text-muted-foreground uppercase">
                            Acceptable variations
                          </div>
                          <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
                            {data.task.retrievalRubric.acceptableVariations.map(
                              (v, i) => (
                                <li key={i} className="font-mono text-xs">
                                  {v}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      <div>
                        <div className="text-xs tracking-wide text-muted-foreground uppercase">
                          Rubric
                        </div>
                        <p className="mt-0.5 text-xs">
                          {data.task.retrievalRubric.rubric}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {data.task.impossibilityReason && (
                  <Alert variant="destructive">
                    <AlertTitle>Impossible task</AlertTitle>
                    <AlertDescription>
                      {data.task.impossibilityReason}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            {data.kind === "full" && (
              <Card>
                <CardHeader>
                  <CardTitle>Reward profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">completion</dt>
                    <dd className="text-right font-mono">
                      {data.task.rewardProfile.completion}
                    </dd>
                    <dt className="text-muted-foreground">step penalty</dt>
                    <dd className="text-right font-mono">
                      {data.task.rewardProfile.stepPenalty}
                    </dd>
                    <dt className="text-muted-foreground">invalid penalty</dt>
                    <dd className="text-right font-mono">
                      {data.task.rewardProfile.invalidActionPenalty}
                    </dd>
                    <dt className="text-muted-foreground">partial</dt>
                    <dd className="text-right">
                      <Badge
                        variant={
                          data.task.rewardProfile.partialPerCheck
                            ? "success"
                            : "secondary"
                        }
                      >
                        {data.task.rewardProfile.partialPerCheck ? "yes" : "no"}
                      </Badge>
                    </dd>
                  </dl>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconTags className="size-4" /> Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {(data.kind === "full" ? data.task.tags : data.task.tags).map(
                  (t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  )
                )}
                {(data.kind === "full" ? data.task.tags : data.task.tags)
                  .length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    No tags.
                  </span>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Raw definition</CardTitle>
                <CardDescription>As returned by the engine.</CardDescription>
              </CardHeader>
              <CardContent>
                <JsonView data={data.task} defaultCollapsedDepth={2} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  )
}
