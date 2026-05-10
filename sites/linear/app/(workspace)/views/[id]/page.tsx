"use client"

/**
 * View detail route — `/views/[id]`.
 *
 * Renders a saved view as a fully-interactive issue list, matching the
 * layout of the team-issues page (compact breadcrumb header + circular
 * toolbar + status-grouped collapsible sections + per-issue rows). The
 * earlier rendition of this route used a stripped-down `Badge`-based
 * row layout that didn't match the rest of the app and gave the view
 * detail page a "demo screen" feel — this version brings it in line so
 * a view click feels like opening any other issue list in Linear.
 *
 * The data layer (filterIssuesForView + grouping) is unchanged; only
 * the presentation is refreshed.
 */

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type {
  View,
  Issue,
  Member,
  Team,
  Cycle,
  Label,
} from "@/app/lib/mock-data"
import { filterIssuesForView } from "@/lib/view-filter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PanelRightIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
  ArrowDown01Icon,
  UserIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

type IssueStatus = Issue["status"]

const STATUS_ORDER: IssueStatus[] = [
  "in_progress",
  "todo",
  "backlog",
  "done",
  "cancelled",
]

const STATUS_LABEL: Record<IssueStatus, string> = {
  in_progress: "In Progress",
  todo: "Todo",
  backlog: "Backlog",
  done: "Done",
  cancelled: "Canceled",
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function ViewDetailPage() {
  const params = useParams<{ id: string }>()
  const viewId = params.id

  const [views, setViews] = useState<View[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/views").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
      fetch("/api/data/cycles").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
    ]).then(([v, i, m, t, c, l]) => {
      setViews(v)
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setCycles(c)
      setLabels(Array.isArray(l) ? l : [])
      setLoading(false)
    })
  }, [])

  const view = views.find((v) => v.id === viewId) ?? null
  const team = useMemo(
    () => (view ? teams.find((t) => t.id === view.teamId) : null),
    [view, teams]
  )

  const filtered = useMemo(() => {
    if (!view) return []
    return filterIssuesForView(view, issues, { labels, cycles })
  }, [view, issues, labels, cycles])

  const grouped = useMemo(() => {
    const map = new Map<IssueStatus, Issue[]>()
    for (const status of STATUS_ORDER) map.set(status, [])
    for (const issue of filtered) {
      map.get(issue.status)?.push(issue)
    }
    return map
  }, [filtered])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  if (!view) {
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 py-24 text-sm">
        <p>View not found.</p>
        <Link href="/views" className="text-xs underline">
          Back to views
        </Link>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col">
        {/* Compact breadcrumb header — team chip › view chip + favorite + ⋯ */}
        <header className="flex items-center justify-between gap-3 px-6 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-pink-500/15 text-pink-500">
              <HugeiconsIcon icon={UserIcon} className="size-3" />
            </span>
            <span className="truncate font-medium">
              {team?.name ?? "Workspace"}
            </span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="text-muted-foreground/60 size-3 shrink-0"
            />
            <ViewBreadcrumbIcon className="size-3.5 shrink-0 text-pink-500" />
            <span className="truncate font-medium">{view.name}</span>
            <button
              type="button"
              aria-label={
                favorited ? "Remove from favorites" : "Add to favorites"
              }
              aria-pressed={favorited}
              onClick={() => setFavorited((v) => !v)}
              data-testid="view-favorite-toggle"
              className="text-muted-foreground hover:text-foreground ml-1 flex size-5 shrink-0 items-center justify-center rounded"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className={`size-3.5 ${favorited ? "fill-amber-400 text-amber-400" : "fill-none"}`}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              >
                <path d="M8 2 L9.8 6 L14 6.5 L10.8 9.4 L11.7 13.6 L8 11.4 L4.3 13.6 L5.2 9.4 L2 6.5 L6.2 6 Z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="More options"
              className="text-muted-foreground hover:text-foreground flex size-5 shrink-0 items-center justify-center rounded"
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
            </button>
          </div>
        </header>

        {/* Toolbar — issue count on the left, circular icon controls on the right */}
        <div className="flex items-center justify-between border-b px-6 py-2">
          <span
            data-testid="view-issue-count"
            className="text-muted-foreground text-xs"
          >
            {filtered.length} {filtered.length === 1 ? "issue" : "issues"}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Filter results"
              className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.25 3a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5h12.5ZM4 8a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 8Zm2.75 3.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Display options"
              className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7 2.5C8.11933 2.5 9.06613 3.23584 9.38477 4.25H14.75C15.1642 4.25 15.5 4.58579 15.5 5C15.5 5.41421 15.1642 5.75 14.75 5.75H9.38477C9.06613 6.76416 8.11933 7.5 7 7.5C5.88067 7.5 4.93387 6.76416 4.61523 5.75H2.25C1.83579 5.75 1.5 5.41421 1.5 5C1.5 4.58579 1.83579 4.25 2.25 4.25H4.61523C4.93387 3.23584 5.88067 2.5 7 2.5ZM7 4C6.44772 4 6 4.44772 6 5C6 5.55228 6.44772 6 7 6C7.55228 6 8 5.55228 8 5C8 4.44772 7.55228 4 7 4Z"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 13.5C8.88067 13.5 7.93387 12.7642 7.61523 11.75H2.25C1.83579 11.75 1.5 11.4142 1.5 11C1.5 10.5858 1.83579 10.25 2.25 10.25H7.61523C7.93387 9.23584 8.88067 8.5 10 8.5C11.1193 8.5 12.0661 9.23584 12.3848 10.25H14.75C15.1642 10.25 15.5 10.5858 15.5 11C15.5 11.4142 15.1642 11.75 14.75 11.75H12.3848C12.0661 12.7642 11.1193 13.5 10 13.5ZM10 12C10.5523 12 11 11.5523 11 11C11 10.4477 10.5523 10 10 10C9.44772 10 9 10.4477 9 11C9 11.5523 9.44772 12 10 12Z"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Toggle right panel"
              aria-pressed={panelOpen}
              onClick={() => setPanelOpen((v) => !v)}
              className={`flex size-7 items-center justify-center rounded-full transition-colors ${
                panelOpen
                  ? "bg-zinc-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={PanelRightIcon} className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Issue list — status-grouped collapsibles */}
        <div className="min-h-0 flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 py-24 text-sm">
              <p>No issues match this view.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {STATUS_ORDER.map((status) => {
                const items = grouped.get(status) ?? []
                return (
                  <Collapsible key={status} defaultOpen>
                    <CollapsibleTrigger
                      data-status={status}
                      className="bg-muted/40 hover:bg-muted/60 group flex w-full items-center gap-2 border-b px-6 py-2 text-xs font-medium transition-colors"
                    >
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="text-muted-foreground/70 size-3 shrink-0 transition-transform group-data-[state=closed]:-rotate-90"
                      />
                      <StatusIcon status={status} className="size-3.5" />
                      <span>{STATUS_LABEL[status]}</span>
                      <span className="text-muted-foreground">
                        {items.length}
                      </span>
                      <span
                        role="button"
                        aria-label={`Add ${STATUS_LABEL[status]} issue`}
                        className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex size-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul>
                        {items.map((issue) => (
                          <IssueRow
                            key={issue.id}
                            issue={issue}
                            members={members}
                          />
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

function IssueRow({ issue, members }: { issue: Issue; members: Member[] }) {
  const assignee = members.find((m) => m.id === issue.assigneeId) ?? null
  return (
    <li>
      <Link
        href={`/issues/${issue.identifier}`}
        className="hover:bg-accent/40 flex items-center gap-2.5 border-b px-6 py-2 text-sm transition-colors"
      >
        <PriorityIcon
          priority={issue.priority}
          className="text-muted-foreground/70 size-3.5 shrink-0"
        />
        <span className="text-muted-foreground w-14 shrink-0 font-mono text-xs">
          {issue.identifier}
        </span>
        <StatusIcon status={issue.status} className="size-3.5 shrink-0" />
        <span className="flex-1 truncate">{issue.title}</span>
        {assignee ? (
          <Tooltip>
            <TooltipTrigger
              render={<span className="size-5 shrink-0" />}
              aria-label={assignee.name}
            >
              <Avatar className="size-5">
                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                <AvatarFallback className="text-[9px]">
                  {assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{assignee.name}</TooltipContent>
          </Tooltip>
        ) : (
          <span
            aria-hidden="true"
            className="border-muted-foreground/40 size-5 shrink-0 rounded-full border border-dashed"
          />
        )}
        <span className="text-muted-foreground w-12 shrink-0 text-right text-xs">
          {formatDate(issue.updatedAt ?? issue.createdAt)}
        </span>
      </Link>
    </li>
  )
}

/**
 * Inline copy of the sidebar's `ViewsIcon` glyph — kept here (rather
 * than imported) so this route doesn't take a dependency on the
 * sidebar component file. The two should stay visually identical;
 * if you change one, change the other.
 */
function ViewBreadcrumbIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      role="img"
      focusable="false"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.93213 2.21398C7.66484 1.90793 8.49512 1.93032 9.21389 2.28028L14.28 4.74739C15.2242 5.20709 15.2441 6.55895 14.3138 7.04673L9.2874 9.6826C8.48012 10.1058 7.51988 10.1058 6.7126 9.6826L1.68618 7.04673C0.75589 6.55895 0.775786 5.20709 1.71995 4.74739L6.78611 2.28028L6.93213 2.21398ZM8.55132 3.67054C8.24643 3.52213 7.89768 3.50303 7.58179 3.61428L7.44868 3.67054L2.83947 5.91363L7.41491 8.31243C7.7819 8.50486 8.2181 8.50486 8.58509 8.31243L13.1595 5.91363L8.55132 3.67054Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.9045 10.0768C14.272 9.90435 14.7242 10.0333 14.9153 10.365C15.1063 10.6966 14.9634 11.1047 14.5959 11.2772L9.49912 13.6693C8.55934 14.1102 7.44077 14.1102 6.50099 13.6693L1.40417 11.2772L1.33776 11.2428C1.01976 11.0547 0.905685 10.676 1.08483 10.365C1.26402 10.054 1.67295 9.92085 2.02626 10.0477L2.0956 10.0768L7.19241 12.468L7.38675 12.5464C7.84801 12.7022 8.36492 12.6757 8.80769 12.468L13.9045 10.0768Z"
      />
    </svg>
  )
}
