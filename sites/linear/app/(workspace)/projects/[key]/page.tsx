"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Project, Issue, Member, Team } from "@/app/lib/mock-data"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CubeIcon,
  StarIcon,
  PlusSignIcon,
  ArrowRight01Icon,
  PencilEdit01Icon,
  PanelRightIcon,
} from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CreateIssueDialog } from "@/components/create-issue-dialog"
import {
  NotificationsPopover,
  type NotificationItem,
} from "@/components/notifications-popover"
import { InitialsAvatar } from "@/components/initials-avatar"
import { buildProjectBreadcrumb } from "@/lib/project-breadcrumb"

type Tab = "overview" | "activity" | "issues"

/**
 * Seed notifications shared across project detail pages. A real
 * implementation would fetch per-user; the seed keeps the bell's
 * unread badge testable.
 */
const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Project lead changed",
    meta: "5m ago",
    read: false,
  },
  {
    id: "n2",
    title: "New milestone added: M1",
    meta: "1h ago",
    read: true,
  },
]

function isProject(r: unknown): r is Project {
  return (
    !!r && typeof r === "object" && "leadId" in (r as Record<string, unknown>)
  )
}

export default function ProjectDetailPage() {
  const params = useParams<{ key: string }>()
  const key = params.key

  const [project, setProject] = useState<Project | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState<Tab>("overview")
  const [createOpen, setCreateOpen] = useState(false)
  // Right Properties panel — collapsible. Width animates via CSS
  // grid-template-columns transition so toggling expands/shrinks
  // the main column smoothly instead of snapping.
  const [panelOpen, setPanelOpen] = useState(true)

  // Global "c" hotkey — same contract as the team-issues page.
  // Skipped while typing or while another dialog is already open.
  const openCreate = useCallback(() => setCreateOpen(true), [])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "c" && event.key !== "C") return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const tag = target?.tagName.toLowerCase()
      if (
        tag === "input" ||
        tag === "textarea" ||
        target?.isContentEditable
      ) {
        return
      }
      if (document.querySelector('[data-state="open"][role="dialog"]')) return
      event.preventDefault()
      openCreate()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openCreate])

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${key}`).then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([p, i, m, t]) => {
      if (isProject(p)) setProject(p)
      else setNotFound(true)
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setLoading(false)
    })
  }, [key])

  const lead = useMemo(
    () =>
      project ? (members.find((m) => m.id === project.leadId) ?? null) : null,
    [project, members]
  )
  const team = useMemo(
    () =>
      project ? (teams.find((t) => t.id === project.teamId) ?? null) : null,
    [project, teams]
  )
  const projectIssues = useMemo(
    () => (project ? issues.filter((i) => i.projectId === project.id) : []),
    [project, issues]
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-2 w-full max-w-md" />
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 text-sm">
        <p>Project not found.</p>
        <Link href="/projects" className="text-xs underline">
          Back to projects
        </Link>
      </div>
    )
  }

  // Breadcrumb is derived from route params + the loaded project +
  // its team — never from transient client state. So a hard-nav and
  // a click-from-list produce the same crumb hierarchy.
  const crumbs = buildProjectBreadcrumb(project, team)

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── Header breadcrumb + actions ── */}
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-2.5">
        <nav
          aria-label="Breadcrumb"
          data-testid="project-breadcrumb"
          className="flex items-center gap-1.5 text-sm"
        >
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    aria-hidden="true"
                    className="text-muted-foreground/50 size-3"
                  />
                )}
                {isLast ? (
                  <span className="flex items-center gap-1.5">
                    <span className="flex size-4 items-center justify-center rounded-sm bg-violet-500/20">
                      <HugeiconsIcon
                        icon={CubeIcon}
                        className="size-3 text-violet-400"
                      />
                    </span>
                    <span
                      data-testid="project-breadcrumb-current"
                      className="font-medium"
                    >
                      {crumb.label}
                    </span>
                  </span>
                ) : (
                  <Link
                    href={crumb.href ?? "/projects"}
                    data-testid={`project-breadcrumb-${i}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            )
          })}
          <button
            type="button"
            aria-label="Toggle favorite"
            className="text-muted-foreground/40 ml-1 transition-colors hover:text-yellow-400"
          >
            <HugeiconsIcon icon={StarIcon} className="size-3.5" />
          </button>
        </nav>

        {/* Right actions */}
        <div className="text-muted-foreground flex items-center gap-1">
          {/* Header Create button — opens the create-issue modal,
              same handler as the global "c" shortcut and any in-list
              "+" buttons. */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-testid="project-header-create"
            aria-label="Create new issue"
            onClick={openCreate}
            className="size-7"
          >
            <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
          </Button>
          {/* Properties panel toggle — only shown on the Overview
              tab where the panel actually exists. Animated width
              transition lives on the grid container below. */}
          {tab === "overview" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-testid="project-panel-toggle"
              aria-label={panelOpen ? "Close properties panel" : "Open properties panel"}
              aria-pressed={panelOpen}
              onClick={() => setPanelOpen((v) => !v)}
              className="size-7"
            >
              <HugeiconsIcon icon={PanelRightIcon} className="size-4" />
            </Button>
          )}
          <NotificationsPopover items={SEED_NOTIFICATIONS} />
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="flex shrink-0 items-center gap-0 border-b px-4">
        {(["overview", "activity", "issues"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === t
                ? "text-foreground after:bg-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:rounded-t"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "issues" && projectIssues.length > 0 && (
              <span className="bg-muted text-muted-foreground ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]">
                {projectIssues.length}
              </span>
            )}
          </button>
        ))}
        {/* Layers icon */}
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-foreground ml-1 flex size-6 items-center justify-center rounded"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
            <path
              d="M8 2l6 3-6 3-6-3 6-3zM2 10l6 3 6-3M2 7l6 3 6-3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ── Body ── */}
      {tab === "overview" && (
        <div
          data-testid="project-overview-grid"
          data-panel-open={panelOpen}
          className="grid min-h-0 flex-1 overflow-hidden transition-[grid-template-columns] duration-200 ease-out"
          style={{
            gridTemplateColumns: panelOpen ? "1fr 360px" : "1fr 0fr",
          }}
        >
          {/* Left: main content */}
          <div className="overflow-auto px-12 py-8">
            {/* Project icon */}
            <div className="bg-muted mb-4 flex size-10 items-center justify-center rounded-lg">
              <HugeiconsIcon
                icon={CubeIcon}
                className="text-muted-foreground size-6"
              />
            </div>

            {/* Project name */}
            <h1 className="text-foreground mb-1 text-2xl font-semibold">
              {project.name}
            </h1>
            <p className="text-muted-foreground/60 mb-6 text-sm">
              Add a short summary...
            </p>

            {/* Inline properties row */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {/* Status */}
              <button
                type="button"
                className="border-border/50 text-muted-foreground hover:bg-accent flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="size-3.5 text-orange-400"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="1 2.5"
                    strokeLinecap="round"
                  />
                </svg>
                Backlog
              </button>
              {/* Priority */}
              <button
                type="button"
                className="border-border/50 text-muted-foreground hover:bg-accent flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
              >
                <span className="flex items-center gap-[2px]">
                  <span className="bg-muted-foreground/60 block size-[3px] rounded-full" />
                  <span className="bg-muted-foreground/60 block size-[3px] rounded-full" />
                  <span className="bg-muted-foreground/60 block size-[3px] rounded-full" />
                </span>
                No priority
              </button>
              {/* Lead */}
              {lead ? (
                <button
                  type="button"
                  className="border-border/50 text-muted-foreground hover:bg-accent flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  <div className="flex size-4 items-center justify-center rounded-full bg-violet-500 text-[8px] font-semibold text-white">
                    {lead.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  {lead.name}
                </button>
              ) : (
                <button
                  type="button"
                  className="border-border/50 text-muted-foreground hover:bg-accent flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                    <circle
                      cx="8"
                      cy="6"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M3 14c0-2.5 2.2-4 5-4s5 1.5 5 4"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  No lead
                </button>
              )}
              {/* Members */}
              <button
                type="button"
                className="border-border/50 text-muted-foreground hover:bg-accent flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
              >
                <div className="flex size-4 items-center justify-center rounded-full bg-blue-500/20 text-[8px] font-semibold text-blue-400">
                  TC
                </div>
              </button>
              {/* Target date */}
              <button
                type="button"
                className="border-border/50 text-muted-foreground hover:bg-accent flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
              >
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                  <rect
                    x="2"
                    y="2.5"
                    width="12"
                    height="11"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M5 1.5v2M11 1.5v2M2 6h12"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                {project.targetDate
                  ? new Date(project.targetDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Target date"}
              </button>
              {/* Team */}
              {team && (
                <button
                  type="button"
                  className="border-border/50 text-muted-foreground hover:bg-accent flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
                >
                  <div className="flex size-4 items-center justify-center rounded-sm bg-pink-500/20 text-[8px] font-semibold text-pink-400">
                    {team.name.charAt(0)}
                  </div>
                  {team.name}
                </button>
              )}
              <button
                type="button"
                className="text-muted-foreground/40 hover:bg-accent hover:text-muted-foreground flex size-5 items-center justify-center rounded"
              >
                <svg viewBox="0 0 12 12" className="size-3" fill="currentColor">
                  <circle cx="2" cy="6" r="1" />
                  <circle cx="6" cy="6" r="1" />
                  <circle cx="10" cy="6" r="1" />
                </svg>
              </button>
            </div>

            {/* Resources */}
            <div className="mb-6">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Resources
              </p>
              <button
                type="button"
                className="text-muted-foreground/60 hover:text-muted-foreground flex items-center gap-1.5 text-xs transition-colors"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
                Add document or link...
              </button>
            </div>

            {/* Write first update */}
            <div className="border-border/50 bg-muted/10 mb-6 flex items-center justify-center rounded-xl border py-8">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none">
                  <path
                    d="M12 2l2 2-8 8H4v-2l8-8z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Write first project update
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Description
              </p>
              <p className="text-muted-foreground/40 text-sm">
                Add description...
              </p>
            </div>

            {/* Milestones */}
            <button
              type="button"
              className="text-muted-foreground/60 hover:text-muted-foreground flex items-center gap-1.5 text-xs transition-colors"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              Milestone
            </button>
          </div>

          {/* Right: Properties panel — grid column 2. Width comes
              from `grid-template-columns` above so the transition
              between open (360px) and closed (0fr) animates the
              main column's reflow at the same time. */}
          <div
            data-testid="project-properties-panel"
            aria-hidden={!panelOpen}
            className="overflow-auto border-l px-0 py-0"
          >
            {/* Properties section */}
            <div className="border-b px-4 py-3">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  className="text-foreground flex items-center gap-1 text-xs font-medium"
                >
                  Properties
                  <svg
                    viewBox="0 0 10 10"
                    className="size-2.5 fill-current opacity-50"
                  >
                    <path d="M5 7L1 3h8z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
                </button>
              </div>

              <div className="flex flex-col gap-0">
                {[
                  {
                    label: "Status",
                    content: (
                      <div className="flex items-center gap-1.5 text-xs">
                        <svg
                          viewBox="0 0 16 16"
                          className="size-3.5 text-orange-400"
                          fill="none"
                        >
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeDasharray="1 2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Backlog
                      </div>
                    ),
                  },
                  {
                    label: "Priority",
                    content: (
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <span className="flex items-center gap-[2px]">
                          <span className="block size-[3px] rounded-full bg-current" />
                          <span className="block size-[3px] rounded-full bg-current" />
                          <span className="block size-[3px] rounded-full bg-current" />
                        </span>
                        No priority
                      </div>
                    ),
                  },
                  {
                    label: "Lead",
                    content: lead ? (
                      <div
                        data-testid="project-lead-cell"
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <InitialsAvatar
                          name={lead.name}
                          seed={lead.id}
                          size={18}
                        />
                        <span className="text-muted-foreground truncate text-xs">
                          {lead.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs">
                        No lead
                      </span>
                    ),
                  },
                  {
                    label: "Members",
                    content: (
                      <div className="flex items-center gap-1">
                        <div className="flex size-5 items-center justify-center rounded-full bg-blue-500/20 text-[8px] font-semibold text-blue-400">
                          TC
                        </div>
                        <span className="text-muted-foreground text-xs">
                          Theta Computer
                        </span>
                      </div>
                    ),
                  },
                  {
                    label: "Dates",
                    content: (
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <svg
                          viewBox="0 0 16 16"
                          className="size-3.5"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="2.5"
                            width="12"
                            height="11"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M5 1.5v2M11 1.5v2M2 6h12"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Start
                        <svg
                          viewBox="0 0 12 12"
                          className="size-2.5"
                          fill="none"
                        >
                          <path
                            d="M2 6h8M7 3l3 3-3 3"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <svg
                          viewBox="0 0 16 16"
                          className="size-3.5"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="2.5"
                            width="12"
                            height="11"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M5 1.5v2M11 1.5v2M2 6h12"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Target
                      </div>
                    ),
                  },
                  {
                    label: "Teams",
                    content: team ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex size-4 items-center justify-center rounded-sm bg-pink-500/20 text-[8px] font-semibold text-pink-400">
                          {team.name.charAt(0)}
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {team.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs">
                        No team
                      </span>
                    ),
                  },
                  {
                    label: "Slack",
                    content: (
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        {/* Slack hash icon */}
                        <svg
                          viewBox="0 0 16 16"
                          className="size-3.5"
                          fill="none"
                        >
                          <path
                            d="M5 3v10M11 3v10M2 6h12M2 10h12"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Slack channel
                      </div>
                    ),
                  },
                  {
                    label: "Labels",
                    content: (
                      <button
                        type="button"
                        className="text-muted-foreground/60 hover:text-muted-foreground flex items-center gap-1 text-xs transition-colors"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
                        Add label
                      </button>
                    ),
                  },
                ].map(({ label, content }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-muted-foreground/70 w-20 shrink-0 text-xs">
                      {label}
                    </span>
                    <div className="flex-1">{content}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones section */}
            <div className="border-b px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  className="text-foreground flex items-center gap-1 text-xs font-medium"
                >
                  Milestones
                  <svg
                    viewBox="0 0 10 10"
                    className="size-2.5 fill-current opacity-50"
                  >
                    <path d="M5 7L1 3h8z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
                </button>
              </div>
              <p className="text-muted-foreground/60 text-[11px] leading-relaxed">
                Add milestones to organize work within your project and break it
                into more granular stages.{" "}
                <span className="hover:text-muted-foreground cursor-pointer underline">
                  Learn more
                </span>
              </p>
            </div>

            {/* Activity section */}
            <div className="px-4 py-3">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  className="text-foreground flex items-center gap-1 text-xs font-medium"
                >
                  Activity
                  <svg
                    viewBox="0 0 10 10"
                    className="size-2.5 fill-current opacity-50"
                  >
                    <path d="M5 7L1 3h8z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground text-[11px] transition-colors"
                >
                  See all
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  {
                    text: "Theta Computer added member",
                    sub: "hvkvkvk@234234gmail.com · Apr 23",
                    icon: "members",
                  },
                  {
                    text: "Theta Computer set lead to hvkvkvk@234234gmail.com",
                    sub: "· Apr 23",
                    icon: "lead",
                  },
                  {
                    text: "Theta Computer added themselves as a member",
                    sub: "Apr 22",
                    icon: "members",
                  },
                  {
                    text: "Theta Computer created the project",
                    sub: "Apr 22",
                    icon: "project",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                      <svg
                        viewBox="0 0 16 16"
                        className="size-3.5 text-blue-400"
                        fill="none"
                      >
                        {item.icon === "members" ? (
                          <>
                            <circle
                              cx="6"
                              cy="6"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <path
                              d="M1 14c0-2.5 2-4 5-4s5 1.5 5 4"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M11 4v4M13 6h-4"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </>
                        ) : item.icon === "lead" ? (
                          <>
                            <circle
                              cx="8"
                              cy="6"
                              r="3"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <path
                              d="M2 14c0-3 2.5-5 6-5s6 2 6 5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </>
                        ) : (
                          <>
                            <circle
                              cx="8"
                              cy="8"
                              r="6"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                            <path
                              d="M8 5v4M8 11v.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </>
                        )}
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-[11px] leading-relaxed">
                        {item.text}
                      </p>
                      <p className="text-muted-foreground text-[10px]">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="flex-1 overflow-auto px-12 py-8">
          <p className="text-muted-foreground text-sm">No activity yet.</p>
        </div>
      )}

      {tab === "issues" && (
        <div className="flex-1 overflow-auto">
          {projectIssues.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 py-24 text-sm">
              <p>No issues in this project yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {projectIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.identifier}`}
                  className="hover:bg-accent/40 flex items-center gap-3 border-b px-6 py-2.5 text-sm transition-colors"
                >
                  <span className="text-muted-foreground w-16 shrink-0 font-mono text-xs">
                    {issue.identifier}
                  </span>
                  <span className="flex-1 truncate">{issue.title}</span>
                  <span className="text-muted-foreground text-xs capitalize">
                    {issue.status.replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <CreateIssueDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultTeamId={team?.id}
      />
    </div>
  )
}
