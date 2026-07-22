"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import type { Issue, Project } from "@/app/lib/mock-data"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  CheckListIcon,
  CubeIcon,
} from "@hugeicons/core-free-icons"

type Tab = "all" | "issues" | "projects" | "documents"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<Tab>("all")
  const [issues, setIssues] = useState<Issue[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset query/tab when dialog closes; focus input when it opens.
  // open → UI sync — exactly what useEffect is for.
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      /* eslint-disable react-hooks/set-state-in-effect */
      setQuery("")
      setTab("all")
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open])

  // Lazy-load issue + project lists the first time the dialog opens.
  // Loading on mount would burn the request on every page nav even if
  // the user never opens search.
  useEffect(() => {
    if (!open) return
    if (issues.length > 0 || projects.length > 0) return
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
    ])
      .then(([i, p]) => {
        setIssues(i as Issue[])
        setProjects(p as Project[])
      })
      .catch(() => {
        /* Non-fatal: results render empty until the user retries. */
      })
  }, [open, issues.length, projects.length])

  const tabs: { value: Tab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "issues", label: "Issues" },
    { value: "projects", label: "Projects" },
    { value: "documents", label: "Documents" },
  ]

  const issueMatches = useMemo(() => {
    if (query.trim() === "") return []
    if (tab !== "all" && tab !== "issues") return []
    const q = query.trim().toLowerCase()
    return issues
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.identifier.toLowerCase().includes(q)
      )
      .slice(0, 50)
  }, [query, tab, issues])

  const projectMatches = useMemo(() => {
    if (query.trim() === "") return []
    if (tab !== "all" && tab !== "projects") return []
    const q = query.trim().toLowerCase()
    return projects.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 50)
  }, [query, tab, projects])

  const total = issueMatches.length + projectMatches.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        // Default DialogContent has `sm:max-w-sm` (384px) which would
        // clamp this side-panel layout. `sm:max-w-none` overrides at
        // the sm+ breakpoint so the inline width / right-pin styles
        // below take effect on real viewports.
        className="flex max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
        style={{
          width: "calc(100vw - var(--sidebar-width, 240px))",
          marginLeft: "auto",
          marginRight: 0,
          transform: "none",
          left: "auto",
          right: 0,
          top: 0,
          bottom: 0,
          borderRadius: 0,
          height: "100vh",
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-5 py-3.5">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground size-4 shrink-0"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, projects, and documents..."
            aria-label="Search query"
            className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b px-4 py-1.5">
          <div className="flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  tab === t.value
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div
          className="flex-1 overflow-auto"
          data-testid="search-dialog-results"
        >
          {query.trim() === "" ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground/50 text-xs">Type to search</p>
            </div>
          ) : total === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-xs">
                No results for &quot;{query}&quot;
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {issueMatches.length > 0 && (
                <ResultGroup label="Issues">
                  {issueMatches.map((i) => (
                    <ResultRow
                      key={i.id}
                      icon={CheckListIcon}
                      primary={i.title}
                      secondary={i.identifier}
                      href={`/issues/${i.identifier}`}
                      onSelect={() => onOpenChange(false)}
                    />
                  ))}
                </ResultGroup>
              )}
              {projectMatches.length > 0 && (
                <ResultGroup label="Projects">
                  {projectMatches.map((p) => (
                    <ResultRow
                      key={p.id}
                      icon={CubeIcon}
                      primary={p.name}
                      secondary={p.status.replace("_", " ")}
                      href={`/projects/${p.id}`}
                      onSelect={() => onOpenChange(false)}
                    />
                  ))}
                </ResultGroup>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ResultGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-muted-foreground/70 px-5 pt-3 pb-1 text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  )
}

function ResultRow({
  icon,
  primary,
  secondary,
  href,
  onSelect,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  primary: string
  secondary?: string
  href: string
  onSelect?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="hover:bg-accent/50 flex items-center gap-3 px-5 py-2 text-sm"
    >
      <HugeiconsIcon
        icon={icon}
        className="text-muted-foreground size-3.5 shrink-0"
        aria-hidden="true"
      />
      <span className="text-foreground flex-1 truncate">{primary}</span>
      {secondary && (
        <span className="text-muted-foreground text-xs">{secondary}</span>
      )}
    </Link>
  )
}
