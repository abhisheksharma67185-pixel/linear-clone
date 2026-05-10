"use client"

/**
 * /views/new — inline "Create view" editor.
 *
 * Renders a full-page editor with the same layout Linear uses when
 * you press "+" on the Views index: a breadcrumb header pinned to
 * the team scope, a name + description input row with Save/Cancel,
 * a tabs + filter/display toolbar, and a live preview of the
 * issues that will be in the view (grouped by status). Saving
 * routes back to /views — persistence is intentionally a no-op for
 * now to match the rest of the mock.
 */

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Issue, Member, Team } from "@/app/lib/mock-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusIcon, PriorityIcon } from "@/components/status-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Layers01Icon,
  Link04Icon,
  PlusSignIcon,
  UserIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import {
  FilterSortIcon,
  VerticalAdjustmentsIcon,
} from "@/components/circular-icon-toolbar"
import { IconPickerPopover } from "@/components/icon-picker-popover"
import { STATUS_TO_TYPE, type IssueStatus } from "@/lib/issue-status-types"

const STATUS_ORDER: readonly IssueStatus[] = [
  "in_progress",
  "todo",
  "backlog",
  "done",
  "cancelled",
] as const

const STATUS_LABEL: Record<IssueStatus, string> = {
  in_progress: "In Progress",
  todo: "Todo",
  backlog: "Backlog",
  done: "Done",
  cancelled: "Canceled",
}

export default function NewViewPage() {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tab, setTab] = useState<"issues" | "projects">("issues")

  useEffect(() => {
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ]).then(([i, m, t]) => {
      setIssues(i)
      setMembers(m)
      setTeams(t)
      setLoading(false)
    })
  }, [])

  // Default scope is the first team — same fallback CreateIssueDialog
  // uses. The "Save to" pill in the header surfaces this so the user
  // knows where the view lands, matching Linear's create flow.
  const team = teams[0] ?? null
  const teamIssues = useMemo(
    () => (team ? issues.filter((i) => i.teamId === team.id) : issues),
    [issues, team]
  )
  const grouped = useMemo(() => {
    const out: Record<IssueStatus, Issue[]> = {
      in_progress: [],
      todo: [],
      backlog: [],
      done: [],
      cancelled: [],
    }
    for (const issue of teamIssues) out[issue.status].push(issue)
    return out
  }, [teamIssues])
  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  )

  const [saving, setSaving] = useState(false)
  const onCancel = () => router.push("/views")
  const onSave = async () => {
    if (saving) return
    const trimmed = name.trim() || "All issues"
    setSaving(true)
    try {
      const res = await fetch("/api/data/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: description.trim(),
          // The store requires a non-empty filterQuery. The editor
          // doesn't expose one yet — send the same default the
          // header chip implies ("all issues for the active team").
          filterQuery: "team:abh",
          teamId: team?.id,
        }),
      })
      if (!res.ok) {
        toast.error("Failed to save view")
        setSaving(false)
        return
      }
      router.push("/views")
    } catch {
      toast.error("Failed to save view")
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Breadcrumb header */}
      <header className="flex shrink-0 items-center justify-between px-4 py-2.5">
        <nav
          aria-label="Breadcrumb"
          data-testid="views-breadcrumb"
          className="text-muted-foreground flex items-center gap-1.5 text-sm"
        >
          <span className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-pink-500/70 text-pink-500">
            <HugeiconsIcon icon={UserIcon} className="size-2.5" />
          </span>
          <span className="text-foreground font-medium">Abhishek</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-3"
            aria-hidden="true"
          />
          {/*
            Default breadcrumb current text is the literal "All issues"
            placeholder — it mirrors the name input below so the user
            sees what they're naming. Crucially, it does NOT inherit
            the previously-viewed view's title (the bug the e2e
            guards against): even with prior navigation cached, this
            stays deterministic until the user types.
          */}
          <span data-testid="views-breadcrumb-current">
            {name.trim() || "All issues"}
          </span>
        </nav>
        <button
          type="button"
          aria-label="Copy link"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href)
              toast.success("Link copied")
            } catch {
              toast.error("Could not copy link")
            }
          }}
          className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
        >
          <HugeiconsIcon icon={Link04Icon} className="size-3.5" />
        </button>
      </header>

      {/* Editor */}
      <div className="px-6 pt-2 pb-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 shrink-0">
            <IconPickerPopover
              triggerClassName="bg-accent text-muted-foreground hover:bg-accent/80 flex size-7 shrink-0 items-center justify-center rounded-md"
              trigger={
                <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
              }
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="All issues"
                aria-label="View name"
                data-testid="new-view-name"
                className="placeholder:text-muted-foreground/70 flex-1 bg-transparent text-base font-medium outline-none"
              />
              <span className="text-muted-foreground text-xs">Save to</span>
              <span
                data-testid="new-view-save-to"
                className="bg-accent text-foreground flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
              >
                <span className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-pink-500/70 text-pink-500">
                  <HugeiconsIcon icon={UserIcon} className="size-2.5" />
                </span>
                Abhishek
              </span>
              <button
                type="button"
                onClick={onCancel}
                data-testid="new-view-cancel"
                className="text-muted-foreground hover:text-foreground rounded px-3 py-1 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                data-testid="new-view-save"
                disabled={saving}
                className="bg-accent text-foreground hover:bg-accent/80 rounded px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              aria-label="View description"
              data-testid="new-view-description"
              className="placeholder:text-muted-foreground/70 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs + toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-0.5">
          {(["issues", "projects"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-2.5 py-1 text-[13px] font-medium transition-colors ${
                tab === t
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="text-muted-foreground flex items-center gap-1">
          <button
            type="button"
            aria-label="Filter view"
            className="hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
          >
            <FilterSortIcon />
          </button>
          <button
            type="button"
            aria-label="Display options"
            className="hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
          >
            <VerticalAdjustmentsIcon />
          </button>
        </div>
      </div>

      {/* Issue preview */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-1 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        ) : tab === "projects" ? (
          <div className="text-muted-foreground py-16 text-center text-sm">
            No projects in this view.
          </div>
        ) : (
          STATUS_ORDER.map((status) => {
            const items = grouped[status]
            if (items.length === 0) return null
            return (
              <PreviewStatusSection
                key={status}
                status={status}
                items={items}
                memberById={memberById}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function PreviewStatusSection({
  status,
  items,
  memberById,
}: {
  status: IssueStatus
  items: Issue[]
  memberById: Map<string, Member>
}) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div data-testid={`new-view-section-${status}`}>
      <div className="bg-muted/30 group flex items-center gap-2 px-5 py-1.5">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className={`text-muted-foreground/70 size-2 shrink-0 fill-current transition-transform ${
              collapsed ? "-rotate-90" : ""
            }`}
          >
            <path d="M1 2 L7 2 L4 6 Z" />
          </svg>
          <StatusIcon status={status} className="size-3.5" />
          <span>{STATUS_LABEL[status]}</span>
          <span className="text-muted-foreground ml-0.5 text-xs font-normal">
            {items.length}
          </span>
        </button>
        <button
          type="button"
          aria-label={`Add issue to ${STATUS_LABEL[status]}`}
          className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex size-5 items-center justify-center rounded"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
        </button>
      </div>
      {!collapsed &&
        items.map((issue) => (
          <PreviewIssueRow
            key={issue.id}
            issue={issue}
            assignee={memberById.get(issue.assigneeId ?? "") ?? null}
          />
        ))}
    </div>
  )
}

function PreviewIssueRow({
  issue,
  assignee,
}: {
  issue: Issue
  assignee: Member | null
}) {
  return (
    <Link
      href={`/issues/${issue.identifier}`}
      data-testid="new-view-row"
      data-issue-identifier={issue.identifier}
      data-status-type={STATUS_TO_TYPE[issue.status]}
      className="group hover:bg-accent/40 flex items-center gap-3 border-b border-transparent px-5 py-2 transition-colors"
    >
      <span
        aria-hidden="true"
        className="border-muted-foreground/40 size-3.5 shrink-0 rounded-[3px] border opacity-0 transition-opacity group-hover:opacity-100"
      />
      <PriorityIcon priority={issue.priority} className="size-3.5 shrink-0" />
      <span className="text-muted-foreground w-14 shrink-0 font-mono text-xs">
        {issue.identifier}
      </span>
      <StatusIcon status={issue.status} className="size-3.5 shrink-0" />
      <span className="flex-1 truncate text-sm">{issue.title}</span>
      {assignee ? (
        <Avatar className="size-5 shrink-0">
          <AvatarImage src={assignee.avatar} alt={assignee.name} />
          <AvatarFallback className="bg-violet-600 text-[9px] text-white">
            {assignee.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span
          aria-label="Unassigned"
          className="text-muted-foreground/60 flex size-5 shrink-0 items-center justify-center"
        >
          <HugeiconsIcon icon={UserCircleIcon} className="size-4" />
        </span>
      )}
      <span className="text-muted-foreground w-12 shrink-0 text-right font-mono text-xs">
        {formatShortDate(issue.createdAt)}
      </span>
    </Link>
  )
}

function formatShortDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
