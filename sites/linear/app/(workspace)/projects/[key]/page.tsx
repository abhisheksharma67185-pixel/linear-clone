"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Project, Issue, Member, Team } from "@/app/lib/mock-data"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CubeIcon,
  StarIcon,
  PlusSignIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"

type Tab = "overview" | "activity" | "issues"

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
  const pct = useMemo(() => {
    if (!projectIssues.length) return 0
    const done = projectIssues.filter(
      (i) => i.status === "done" || i.status === "cancelled"
    ).length
    return Math.round((done / projectIssues.length) * 100)
  }, [projectIssues])

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

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── Header breadcrumb + actions ── */}
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-sm">
          <Link
            href="/projects"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="text-muted-foreground/50 size-3"
          />
          <div className="flex items-center gap-1.5">
            <div className="flex size-4 items-center justify-center rounded-sm bg-violet-500/20">
              <HugeiconsIcon
                icon={CubeIcon}
                className="size-3 text-violet-400"
              />
            </div>
            <span className="font-medium">{project.name}</span>
          </div>
          <button
            type="button"
            className="text-muted-foreground/40 ml-1 transition-colors hover:text-yellow-400"
          >
            <HugeiconsIcon icon={StarIcon} className="size-3.5" />
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded"
          >
            <svg viewBox="0 0 12 12" className="size-3" fill="currentColor">
              <circle cx="2" cy="6" r="1" />
              <circle cx="6" cy="6" r="1" />
              <circle cx="10" cy="6" r="1" />
            </svg>
          </button>
        </div>

        {/* Right actions */}
        <div className="text-muted-foreground flex items-center gap-1">
          {/* Chat */}
          <button
            type="button"
            className="hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none">
              <path
                d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v7A1.5 1.5 0 0112.5 12H9l-3 2v-2H3.5A1.5 1.5 0 012 10.5v-7z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {/* Layout */}
          <button
            type="button"
            className="hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none">
              <rect
                x="2"
                y="2"
                width="12"
                height="12"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path d="M9 2v12" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
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
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left: main content */}
          <div className="flex-1 overflow-auto px-12 py-8">
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

          {/* Right: Properties panel */}
          <div className="w-64 shrink-0 overflow-auto border-l px-0 py-0">
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
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="bg-muted rounded px-1 py-0.5 text-[9px] font-semibold">
                          HV
                        </span>
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
    </div>
  )
}
