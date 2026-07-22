"use client"

import * as React from "react"
import {
  FILTER_LABEL,
  type FilterKind,
  type FilterState,
} from "@/app/lib/my-issues-filter-state"
import type { Member, Label, Project } from "@/app/lib/mock-data"

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In Progress",
  todo: "Todo",
  backlog: "Backlog",
  done: "Completed",
  cancelled: "Canceled",
}

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No priority",
}

interface Props {
  filters: FilterState
  members: Member[]
  labels: Label[]
  projects: Project[]
  onRemove: (kind: FilterKind) => void
  onEdit: (kind: FilterKind) => void
}

export function MyIssuesFilterChips({
  filters,
  members,
  labels,
  projects,
  onRemove,
  onEdit,
}: Props) {
  const entries = (Object.keys(filters) as FilterKind[]).filter(
    (k) => (filters[k] ?? []).length > 0
  )
  if (entries.length === 0) return null

  const formatValue = (kind: FilterKind, values: string[]): string => {
    if (kind === "status") {
      return values.map((v) => STATUS_LABEL[v] ?? v).join(", ")
    }
    if (kind === "priority") {
      return values.map((v) => PRIORITY_LABEL[v] ?? v).join(", ")
    }
    if (kind === "assignee") {
      return values
        .map((id) => {
          if (id === "unassigned") return "No assignee"
          return members.find((m) => m.id === id)?.name ?? id
        })
        .join(", ")
    }
    if (kind === "creator") {
      return values
        .map((id) => members.find((m) => m.id === id)?.name ?? id)
        .join(", ")
    }
    if (kind === "labels") {
      return values
        .map((id) => labels.find((l) => l.id === id)?.name ?? id)
        .join(", ")
    }
    if (kind === "project") {
      return values
        .map((id) => {
          if (id === "none") return "No project"
          return projects.find((p) => p.id === id)?.name ?? id
        })
        .join(", ")
    }
    if (kind === "template") {
      return values.map((v) => (v === "none" ? "No template" : v)).join(", ")
    }
    if (values[0] === "__stub__") return "any"
    return values.join(", ")
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-6 py-2">
      {entries.map((kind) => {
        const values = filters[kind] ?? []
        const display = formatValue(kind, values)
        return (
          <div
            key={kind}
            className="bg-muted/60 flex items-center gap-1 overflow-hidden rounded-md border text-xs"
          >
            <button
              type="button"
              onClick={() => onEdit(kind)}
              className="hover:bg-muted flex items-center gap-1 px-2 py-1"
            >
              <span className="text-muted-foreground">
                {FILTER_LABEL[kind]}
              </span>
              <span className="text-muted-foreground">is</span>
              <span className="max-w-40 truncate">{display}</span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(kind)}
              aria-label={`Remove ${FILTER_LABEL[kind]} filter`}
              className="hover:bg-muted text-muted-foreground hover:text-foreground flex h-full items-center px-1.5"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <path d="M2 2 L8 8 M8 2 L2 8" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
