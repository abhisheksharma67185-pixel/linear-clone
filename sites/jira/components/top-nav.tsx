"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import type { Issue, Project, User } from "@/app/lib/mock-data"
import { useIssueDrawer } from "@/components/issue-drawer-provider"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { useTheme } from "next-themes"

// ─── Search Bar ─────────────────────────────────────────────────────────────

interface SearchResults {
  issues: Issue[]
  projects: Project[]
  users: User[]
}

function SearchBar({ isBlue = true }: { isBlue?: boolean }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load recent issues when dialog opens
  useEffect(() => {
    if (!dialogOpen) return
    fetch("/api/data/issues")
      .then((r) => r.json())
      .then((data: Issue[]) => {
        const sorted = [...data].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        setRecentIssues(sorted.slice(0, 5))
      })
      .catch(() => {})
  }, [dialogOpen])

  // Keyboard shortcut: / to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setDialogOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    fetch(`/api/data/search?q=${encodeURIComponent(q.trim())}`)
      .then((r) => r.json())
      .then((data: SearchResults) => { setResults(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleInput = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 200)
  }

  const go = (href: string) => {
    setDialogOpen(false)
    setQuery("")
    setResults(null)
    router.push(href)
  }

  const hasResults = results && (results.issues.length > 0 || results.projects.length > 0 || results.users.length > 0)

  return (
    <>
      {/* Search icon — click to open dropdown */}
      <button
        onClick={() => setDialogOpen(true)}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Search (press /)"
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </button>

      {/* Search dropdown — inline from top like real Jira */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50" onClick={() => { setDialogOpen(false); setQuery(""); setResults(null) }}>
          <div className="fixed left-0 right-0 top-0 z-10 bg-background border-b shadow-lg" onClick={(e) => e.stopPropagation()}>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-2.5 max-w-2xl">
            <svg className="size-5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              autoFocus
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setDialogOpen(false); setQuery(""); setResults(null) }
                if (e.key === "Enter" && query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`)
              }}
              placeholder="Search Jira"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {loading && (
              <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
            )}
          </div>

          {/* Results area */}
          <div className="max-h-[400px] overflow-y-auto border-t max-w-2xl">
            {/* Breadcrumb */}
            <div className="px-4 py-2 text-xs text-muted-foreground">
              Jira &gt; Home
            </div>

            {/* No query — show recent items like real Jira */}
            {!query.trim() && (
              <div>
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Recently viewed
                </div>
                {recentIssues.slice(0, 3).map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => go(`/issue/${issue.key}`)}
                    className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-accent transition-colors"
                  >
                    <div className={`flex size-5 shrink-0 items-center justify-center rounded-sm ${
                      issue.type === "bug" ? "bg-red-500" : issue.type === "story" ? "bg-green-500" : "bg-blue-500"
                    }`}>
                      <svg className="size-3 text-white" viewBox="0 0 16 16" fill="currentColor">
                        {issue.type === "bug" ? <circle cx="8" cy="8" r="4" /> : <path d="M3 3h10v10H3z" />}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{issue.key} {issue.summary}</span>
                      <p className="text-xs text-muted-foreground">Task · Recently visited</p>
                    </div>
                  </button>
                ))}

                <div className="px-4 py-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Recent boards, projects, filters and plans
                </div>
                <button onClick={() => go("/projects/SCRUM/board")} className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-blue-100 dark:bg-blue-900/30">
                    <svg className="size-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">SCRUM board</span>
                    <p className="text-xs text-muted-foreground">Board · My Scrum Project</p>
                  </div>
                </button>
                <button onClick={() => go("/projects/SCRUM/board")} className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-blue-100 dark:bg-blue-900/30">
                    <svg className="size-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">My Team (SCRUM)</span>
                    <p className="text-xs text-muted-foreground">Team-managed software project</p>
                  </div>
                </button>

                {/* Go to all links */}
                <div className="px-4 py-2 mt-1 text-xs text-muted-foreground">
                  Go to all: {" "}
                  <button onClick={() => go("/projects")} className="text-blue-600 hover:underline">Boards</button>
                  <span className="mx-1">·</span>
                  <button onClick={() => go("/projects")} className="text-blue-600 hover:underline">Projects</button>
                  <span className="mx-1">·</span>
                  <button onClick={() => go("/filters")} className="text-blue-600 hover:underline">Filters</button>
                  <span className="mx-1">·</span>
                  <button onClick={() => go("/teams/people")} className="text-blue-600 hover:underline">People</button>
                </div>

                {/* View all work items */}
                <div className="border-t px-4 py-2.5">
                  <button onClick={() => go("/filters/all-work-items")} className="text-sm text-blue-600 hover:underline">
                    View all work items
                  </button>
                </div>
              </div>
            )}

            {/* Query entered but no results */}
            {query.trim() && !hasResults && !loading && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {/* Issues results */}
            {results && results.issues.length > 0 && (
              <div>
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                  Issues
                </div>
                {results.issues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => go(`/issue/${issue.key}`)}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors"
                  >
                    <div className={`flex size-5 shrink-0 items-center justify-center rounded-sm ${
                      issue.type === "bug" ? "bg-red-500" : issue.type === "story" ? "bg-green-500" : "bg-blue-500"
                    }`}>
                      <svg className="size-3 text-white" viewBox="0 0 16 16" fill="currentColor">
                        {issue.type === "bug" ? <circle cx="8" cy="8" r="4" /> : <path d="M3 3h10v10H3z" />}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{issue.summary}</span>
                      <span className="text-xs text-muted-foreground">{issue.key}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Projects results */}
            {results && results.projects.length > 0 && (
              <div>
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                  Spaces
                </div>
                {results.projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => go(`/projects/${project.key}/board`)}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors"
                  >
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-blue-100 dark:bg-blue-900/30">
                      <svg className="size-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{project.name}</span>
                      <span className="text-xs text-muted-foreground">{project.key}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* People results */}
            {results && results.users.length > 0 && (
              <div>
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                  People
                </div>
                {results.users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => go("/teams/people")}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors"
                  >
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {(user.displayName ?? user.name).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{user.displayName ?? user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          </div>
        </div>
      )}
    </>
  )
}

// ─── Settings Dropdown ──────────────────────────────────────────────────────

function SettingsDropdown({ isBlue = true }: { isBlue?: boolean }) {
  const [open, setOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className={`rounded-full p-1.5 ${isBlue ? "text-white/80 hover:bg-white/15 hover:text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 z-50 w-[380px] rounded-lg border bg-popover shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Personal Jira settings</h3>
              </div>

              {/* Personal */}
              <div className="flex flex-col gap-0.5">
                <Link href="/home/account-settings" onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-accent transition-colors">
                  <svg className="size-5 mt-0.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>
                  <div><p className="text-sm font-medium">Personal settings</p><p className="text-xs text-muted-foreground">Language, time zone, preferences</p></div>
                </Link>
                <Link href="/admin/settings" onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-accent transition-colors">
                  <svg className="size-5 mt-0.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6M9 13h6M9 17h4" /></svg>
                  <div><p className="text-sm font-medium">Jira settings</p><p className="text-xs text-muted-foreground">General configuration, security, automation</p></div>
                </Link>
                <button onClick={() => { setOpen(false); setShortcutsOpen(true) }} className="flex items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-accent transition-colors w-full">
                  <svg className="size-5 mt-0.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2" /><line x1="6" y1="10" x2="6" y2="10" /><line x1="10" y1="10" x2="10" y2="10" /><line x1="14" y1="10" x2="14" y2="10" /><line x1="18" y1="10" x2="18" y2="10" /><line x1="8" y1="14" x2="16" y2="14" /></svg>
                  <div><p className="text-sm font-medium">Keyboard shortcuts</p><p className="text-xs text-muted-foreground">View all keyboard shortcuts</p></div>
                </button>
              </div>

              <div className="my-3 border-t" />

              {/* Jira admin */}
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Jira admin</p>
              <div className="flex flex-col gap-0.5">
                <Link href="/admin/manage-apps" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors">
                  <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  Jira apps
                </Link>
                <Link href="/projects" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors">
                  <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                  Spaces
                </Link>
                <Link href="/apps" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors">
                  <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  Marketplace apps
                </Link>
              </div>

              <div className="my-3 border-t" />

              {/* Atlassian admin */}
              <p className="mb-2 text-[11px] font-semibold text-muted-foreground">Atlassian admin</p>
              <div className="flex flex-col gap-0.5">
                <Link href="/admin/users" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors">
                  <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  User management
                </Link>
                <Link href="/admin/billing" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors">
                  <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                  Billing
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts dialog */}
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { section: "Global", shortcuts: [
                { keys: ["C"], desc: "Create issue" },
                { keys: ["/"], desc: "Focus search" },
                { keys: ["G", "then", "D"], desc: "Go to dashboard" },
                { keys: ["G", "then", "B"], desc: "Go to board" },
                { keys: ["G", "then", "K"], desc: "Go to backlog" },
                { keys: ["?"], desc: "Open keyboard shortcuts" },
              ]},
              { section: "Board", shortcuts: [
                { keys: ["N"], desc: "Next column" },
                { keys: ["P"], desc: "Previous column" },
                { keys: ["T"], desc: "Toggle detail view" },
              ]},
              { section: "Issue", shortcuts: [
                { keys: ["A"], desc: "Assign to me" },
                { keys: ["E"], desc: "Edit" },
                { keys: ["M"], desc: "Comment" },
              ]},
            ].map((s) => (
              <div key={s.section}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{s.section}</h4>
                {s.shortcuts.map((sc) => (
                  <div key={sc.desc} className="flex items-center justify-between py-1.5">
                    <span className="text-sm">{sc.desc}</span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((k, i) => (
                        k === "then" ? <span key={i} className="text-xs text-muted-foreground mx-0.5">then</span> :
                        <kbd key={i} className="rounded border bg-muted px-1.5 py-0.5 text-[11px] font-mono">{k}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SettingsItem({
  icon,
  title,
  description,
  external,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  external?: boolean
  href?: string
}) {
  const content = (
    <>
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-snug">{description}</p>
      </div>
      {external && (
        <svg className="size-4 text-muted-foreground mt-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )}
    </>
  )
  if (href) {
    return (
      <Link href={href} className="flex items-start gap-3 rounded-md px-2 py-2.5 text-left hover:bg-accent transition-colors w-full">
        {content}
      </Link>
    )
  }
  return (
    <button className="flex items-start gap-3 rounded-md px-2 py-2.5 text-left hover:bg-accent transition-colors w-full">
      {content}
    </button>
  )
}

// ─── Notifications Panel ────────────────────────────────────────────────────

function NotificationsPanel({ isBlue = true }: { isBlue?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"direct" | "watching">("direct")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const [notifications, setNotifications] = useState([
    { id: "n1", text: "Priya Patel assigned SCRUM-5 to you", issueKey: "SCRUM-5", time: "2 hours ago", category: "direct" as const, read: false, initials: "PP", color: "bg-violet-500" },
    { id: "n2", text: "Ravi Kumar commented on SCRUM-3", issueKey: "SCRUM-3", time: "5 hours ago", category: "watching" as const, read: false, initials: "RK", color: "bg-emerald-500" },
    { id: "n3", text: "Sprint 'Sprint 13' has been started", issueKey: "SCRUM-1", time: "1 day ago", category: "watching" as const, read: false, initials: "JS", color: "bg-blue-500" },
    { id: "n4", text: "You were mentioned in SCRUM-8", issueKey: "SCRUM-8", time: "2 days ago", category: "direct" as const, read: true, initials: "AS", color: "bg-orange-500" },
    { id: "n5", text: "Liam Chen changed SCRUM-12 to Done", issueKey: "SCRUM-12", time: "3 days ago", category: "watching" as const, read: true, initials: "LC", color: "bg-rose-500" },
  ])

  const filteredNotifs = notifications
    .filter((n) => activeTab === "direct" ? n.category === "direct" : n.category === "watching")
    .filter((n) => !showUnreadOnly || !n.read)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  useEffect(() => {
    if (!moreMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setMoreMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [moreMenuOpen])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative rounded-full p-1.5 ${isBlue ? "text-white/80 hover:bg-white/15 hover:text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[400px] rounded-lg border bg-popover shadow-xl">
          {/* Header — matches real Jira: title, "Only show unread" toggle, expand icon, three-dot menu */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-base font-semibold">Notifications</h3>
            <div className="flex items-center gap-3">
              {/* Only show unread toggle */}
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                Only show unread
                <button
                  type="button"
                  role="switch"
                  aria-checked={showUnreadOnly}
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${showUnreadOnly ? "bg-blue-600" : "bg-muted-foreground/30"}`}
                >
                  <span className={`inline-block size-3 rounded-full bg-white transition-transform ${showUnreadOnly ? "translate-x-[14px]" : "translate-x-[2px]"}`} />
                </button>
              </label>
              {/* Expand icon — open full notifications page */}
              <Link href="/home/notifications" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors" title="Open notifications">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6" />
                  <path d="M10 14L21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                </svg>
              </Link>
              {/* Three-dot menu */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="rounded p-1 text-muted-foreground hover:bg-accent transition-colors"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
                {moreMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-popover shadow-lg py-1">
                    <button
                      type="button"
                      onClick={() => setMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                    >
                      <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      Give feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b px-4">
            <button
              onClick={() => setActiveTab("direct")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "direct" ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setActiveTab("watching")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "watching" ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Watching
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-[380px] overflow-y-auto">
            {filteredNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                {/* Atlassian flag illustration — matches real Jira empty state */}
                <svg className="mb-4 size-28" viewBox="0 0 120 120" fill="none">
                  {/* Flag pole */}
                  <rect x="36" y="18" width="4" height="90" rx="2" fill="#FFC400" />
                  {/* Orange dot on pole top */}
                  <circle cx="38" cy="16" r="5" fill="#FF8B00" />
                  {/* Back flag (darker blue, rotated) */}
                  <g transform="translate(40, 28) rotate(8)">
                    <path d="M0 0L48 8L42 40L0 48Z" fill="#0747A6" rx="3" />
                  </g>
                  {/* Front flag (blue) */}
                  <g transform="translate(40, 22) rotate(-4)">
                    <path d="M0 0L50 6L46 42L0 48Z" fill="#2684FF" rx="3" />
                    {/* Atlassian logo mark on flag */}
                    <path d="M16 28c-1-1.6-2.8-1.4-3.4.4l-5 12c-.3.6 0 1.2.6 1.2h7.4c.3 0 .6-.2.7-.5 1.2-3 .6-8.6-0.3-13.1z" fill="rgba(255,255,255,0.6)" />
                    <path d="M22 16c-3.6 6.4-3.8 14-.4 20.4l4.2 8c.2.3.5.5.8.5h7.4c.6 0 .9-.7.6-1.2L23.4 16c-.3-.6-1-.6-1.4 0z" fill="rgba(255,255,255,0.8)" />
                  </g>
                </svg>
                <p className="text-sm text-muted-foreground text-center">
                  You have no notifications from
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  the last 30 days.
                </p>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { markRead(n.id); setOpen(false); router.push(`/issue/${n.issueKey}`) }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${!n.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                >
                  <Avatar className="size-7 shrink-0 mt-0.5">
                    <AvatarFallback className={`text-[9px] font-medium text-white ${n.color}`}>{n.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "font-medium" : ""}`}>{n.text}</p>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  {!n.read && <div className="mt-2 size-2 shrink-0 rounded-full bg-blue-600" />}
                </button>
              ))
            )}
          </div>

          {/* Footer — matches real Jira: keyboard hint + "See all shortcuts" */}
          <div className="border-t px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Press
              <kbd className="inline-flex min-w-[20px] items-center justify-center rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↓</kbd>
              <kbd className="inline-flex min-w-[20px] items-center justify-center rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↑</kbd>
              to move through notifications.
            </div>
            <Link href="/home/notifications" onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1 hover:bg-accent transition-colors">
              See all shortcuts
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Help Panel ─────────────────────────────────────────────────────────────

function HelpPanel({ isBlue = true }: { isBlue?: boolean }) {
  const [open, setOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const helpLinks = [
    { label: "Find out what's changed in Jira", external: true, icon: "lightbulb", href: "/products" },
    { label: "Read about the new navigation", external: true, icon: "doc", href: "/products" },
    { label: "Browse complete documentation", external: true, icon: "file", href: "/products" },
    { label: "Build skills with Atlassian Learning", external: true, icon: "graduation", href: "/products" },
    { label: "Ask our Community forums", external: true, icon: "chat", href: "/teams" },
    { label: "Contact support", external: true, icon: "warning", href: "/admin" },
    { label: "Give feedback about Jira", external: false, icon: "feedback", href: "/home/notifications" },
    { label: "Keyboard shortcuts", external: false, icon: "keyboard", href: "" },
    { label: "Get Jira Mobile", external: true, icon: "mobile", href: "/products" },
  ]

  const iconMap: Record<string, React.ReactNode> = {
    lightbulb: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.73V17h8v-2.27A7 7 0 0 0 12 2z" />
      </svg>
    ),
    doc: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    file: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
    graduation: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    chat: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    warning: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    feedback: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8l-4 4" />
        <path d="M14 10l-4 0" />
        <path d="M14 7l-4 0" />
      </svg>
    ),
    keyboard: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    mobile: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`rounded-full p-1.5 ${isBlue ? "text-white/80 hover:bg-white/15 hover:text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-sm flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-4">
            <SheetTitle className="text-base font-semibold">Help</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-2">
            <div className="flex flex-col gap-0.5">
              {helpLinks.map((link) => {
                const cls = "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors w-full"
                const children = (
                  <>
                    <span className="text-muted-foreground shrink-0">{iconMap[link.icon]}</span>
                    <span className="flex-1">{link.label}</span>
                    {link.external && (
                      <svg className="size-3.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    )}
                  </>
                )
                if (link.label === "Keyboard shortcuts") {
                  return <button key={link.label} onClick={() => { setOpen(false); setShortcutsOpen(true) }} className={cls}>{children}</button>
                }
                return <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className={cls}>{children}</Link>
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-5 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <Link href="/products" className="hover:text-foreground hover:underline">About Jira</Link>
              <Link href="/admin/settings" className="hover:text-foreground hover:underline">Terms of use</Link>
              <Link href="/admin/security" className="hover:text-foreground hover:underline">Privacy policy</Link>
              <Link href="/admin/security/data-protection" className="hover:text-foreground hover:underline">Notice at collection</Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <KeyboardShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  )
}

// ─── Create Issue Dialog ────────────────────────────────────────────────────

function CreateIssueDialog({ isBlue = true }: { isBlue?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Dropdown menu state
  const [menuOpen, setMenuOpen] = useState(false)
  // Goal/Project/Team creation states
  const [goalOpen, setGoalOpen] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [projectOpen, setProjectOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectKey, setProjectKey] = useState("")
  const [projectEmoji, setProjectEmoji] = useState("")
  const [projectSearchApps, setProjectSearchApps] = useState("")
  const [projectPrivate, setProjectPrivate] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [teamMemberSearch, setTeamMemberSearch] = useState("")
  const [teamPrivate, setTeamPrivate] = useState(false)

  const handleCreateGoal = async () => {
    if (!goalName.trim()) return
    await fetch("/api/data/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: goalName.trim(), owner: "usr-1" }) }).catch(() => null)
    setGoalOpen(false); setGoalName("")
    router.push("/goals")
  }

  const handleCreateProject = async () => {
    if (!projectName.trim()) return
    const key = projectKey.trim() || projectName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "PROJ"
    await fetch("/api/data/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: projectName.trim(), key, type: "scrum" }) }).catch(() => null)
    setProjectOpen(false); setProjectName(""); setProjectKey(""); setProjectEmoji(""); setProjectSearchApps(""); setProjectPrivate(false)
    router.push("/projects")
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return
    await fetch("/api/data/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: teamName.trim(), description: teamDescription.trim() }) }).catch(() => null)
    setTeamOpen(false); setTeamName(""); setTeamDescription(""); setTeamMemberSearch(""); setTeamPrivate(false)
    window.dispatchEvent(new CustomEvent("team-created"))
    router.push("/teams")
  }

  return (
    <>
      {/* Split Create button: main = open task dialog, chevron = dropdown */}
      <div className="relative flex">
        <button
          onClick={() => setOpen(true)}
          className={`flex items-center gap-1.5 rounded-l-md px-3 py-1.5 text-sm font-medium transition-colors ${isBlue ? "bg-white/20 text-white hover:bg-white/30" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Create
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex items-center rounded-r-md px-1.5 py-1.5 transition-colors border-l ${isBlue ? "bg-white/20 text-white hover:bg-white/30 border-white/30" : "bg-blue-600 text-white hover:bg-blue-700 border-blue-500"}`}
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border bg-popover shadow-lg py-1">
              <button onClick={() => { setMenuOpen(false); setGoalOpen(true); setGoalName("") }} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left">
                <svg className="size-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
                Goal
              </button>
              <button onClick={() => { setMenuOpen(false); setOpen(true) }} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left">
                <svg className="size-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>
                Work Item
              </button>
              <button onClick={() => { setMenuOpen(false); setProjectOpen(true); setProjectName(""); setProjectKey(""); setProjectEmoji(""); setProjectSearchApps(""); setProjectPrivate(false) }} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left">
                <svg className="size-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                Project
              </button>
              <button onClick={() => { setMenuOpen(false); setTeamOpen(true); setTeamName(""); setTeamDescription(""); setTeamMemberSearch(""); setTeamPrivate(false) }} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left">
                <svg className="size-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Team
              </button>
            </div>
          </>
        )}
      </div>

      {/* Goal creation dialog */}
      {goalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]" onClick={() => setGoalOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-[420px] rounded-lg border bg-popover shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-6 pt-5 pb-2">
              <svg className="size-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
              <span className="text-lg font-semibold">Create goal</span>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name <span className="text-red-500">*</span></label>
                <input value={goalName} onChange={(e) => setGoalName(e.target.value)} autoFocus placeholder="e.g. Increase revenue by 20%"
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateGoal(); if (e.key === "Escape") setGoalOpen(false) }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t">
              <Button variant="outline" size="sm" onClick={() => setGoalOpen(false)}>Cancel</Button>
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={!goalName.trim()} onClick={handleCreateGoal}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Project creation dialog */}
      {projectOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={() => setProjectOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-[420px] rounded-lg border bg-popover shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center gap-2.5 px-6 pt-5 pb-1">
              <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
              <span className="text-base font-semibold">Project</span>
            </div>
            <p className="px-6 pt-1 pb-3 text-xs text-muted-foreground">Required fields are marked with an asterisk <span className="text-red-500">*</span></p>

            {/* Form */}
            <div className="max-h-[55vh] overflow-y-auto px-6 pb-4 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block">Name <span className="text-red-500">*</span></label>
                <input
                  value={projectName}
                  onChange={(e) => { setProjectName(e.target.value); setProjectKey(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4)) }}
                  autoFocus
                  placeholder="e.g. Marketing"
                  onKeyDown={(e) => { if (e.key === "Enter" && projectName.trim()) handleCreateProject(); if (e.key === "Escape") setProjectOpen(false) }}
                  className="w-full rounded-md border border-input bg-input/20 px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 dark:bg-input/30"
                />
              </div>

              {/* Choose an emoji */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block">Choose an emoji</label>
                <div className="flex items-center gap-1">
                  {["📋", "🚀", "💻", "🎯", "📊", "🔧", "📦", "🌟"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setProjectEmoji(projectEmoji === emoji ? "" : emoji)}
                      className={`flex size-8 items-center justify-center rounded-md text-base transition-colors ${projectEmoji === emoji ? "bg-blue-100 ring-2 ring-blue-500 dark:bg-blue-900/40" : "hover:bg-accent"}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link to an existing Jira app */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block">Link to an existing Jira app</label>
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  <input
                    value={projectSearchApps}
                    onChange={(e) => setProjectSearchApps(e.target.value)}
                    placeholder="Search apps"
                    className="w-full rounded-md border border-input bg-input/20 pl-8 pr-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 dark:bg-input/30"
                  />
                </div>
              </div>

              {/* Privacy controls */}
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Privacy controls</label>
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-xs text-muted-foreground leading-relaxed">Only contributors or people you share with can view a private project.</p>
                  <button
                    type="button"
                    onClick={() => setProjectPrivate(!projectPrivate)}
                    className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${projectPrivate ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <span className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${projectPrivate ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-3 border-t">
              <Button variant="ghost" size="sm" onClick={() => setProjectOpen(false)}>Cancel</Button>
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={!projectName.trim()} onClick={handleCreateProject}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Team creation dialog */}
      {teamOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={() => setTeamOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-[420px] rounded-lg border bg-popover shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center gap-2.5 px-6 pt-5 pb-1">
              <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              <span className="text-base font-semibold">Team</span>
            </div>
            <p className="px-6 pt-1 pb-3 text-xs text-muted-foreground">Required fields are marked with an asterisk <span className="text-red-500">*</span></p>

            {/* Form */}
            <div className="max-h-[55vh] overflow-y-auto px-6 pb-4 space-y-4">
              {/* Team name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block">Team name <span className="text-red-500">*</span></label>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  autoFocus
                  placeholder="e.g. Engineering"
                  onKeyDown={(e) => { if (e.key === "Enter" && teamName.trim()) handleCreateTeam(); if (e.key === "Escape") setTeamOpen(false) }}
                  className="w-full rounded-md border border-input bg-input/20 px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 dark:bg-input/30"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block">Description</label>
                <textarea
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="What does this team work on?"
                  rows={3}
                  className="w-full resize-none rounded-md border border-input bg-input/20 px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 dark:bg-input/30"
                />
              </div>

              {/* Add members */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold block">Add members</label>
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  <input
                    value={teamMemberSearch}
                    onChange={(e) => setTeamMemberSearch(e.target.value)}
                    placeholder="Search people"
                    className="w-full rounded-md border border-input bg-input/20 pl-8 pr-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 dark:bg-input/30"
                  />
                </div>
              </div>

              {/* Privacy controls */}
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Privacy controls</label>
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-xs text-muted-foreground leading-relaxed">Only members can see who is on the team and what they are working on.</p>
                  <button
                    type="button"
                    onClick={() => setTeamPrivate(!teamPrivate)}
                    className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${teamPrivate ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <span className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${teamPrivate ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-3 border-t">
              <Button variant="ghost" size="sm" onClick={() => setTeamOpen(false)}>Cancel</Button>
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" disabled={!teamName.trim()} onClick={handleCreateTeam}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Work item (issue) creation dialog */}
      <CreateTaskDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

// ─── Exported Create Button (reusable in other layouts) ─────────────────────

export function CreateButton({ isBlue = false }: { isBlue?: boolean }) {
  return <CreateIssueDialog isBlue={isBlue} />
}

// ─── Chevron Icon ───────────────────────────────────────────────────────────

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className ?? "size-3.5"} viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 6l4 4 4-4" />
    </svg>
  )
}

// ─── Nav Dropdown ───────────────────────────────────────────────────────────

function NavDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 rounded px-2.5 py-1.5 text-[13px] font-medium text-white/90 hover:bg-white/15 hover:text-white transition-colors">
        {label}
        <ChevronDown className="size-3 text-white/60" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" sideOffset={4} className="w-[280px] p-0">
        {children}
      </PopoverContent>
    </Popover>
  )
}

// ─── Primary Nav ────────────────────────────────────────────────────────────

function PrimaryNav() {
  return (
    <nav className="hidden md:flex items-center gap-0.5">
      {/* Your Work */}
      <NavDropdown label="Your work">
        <div className="py-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent</div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
            For you
          </Link>
          <Link href="/home/recent" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Recent
          </Link>
          <Link href="/home/starred" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            Starred
          </Link>
        </div>
        <div className="border-t px-3 py-2">
          <Link href="/dashboard" className="text-xs text-blue-600 hover:underline">Go to Your Work</Link>
        </div>
      </NavDropdown>

      {/* Projects */}
      <NavDropdown label="Projects">
        <div className="py-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent</div>
          <ProjectsNavList />
        </div>
        <div className="border-t px-3 py-2 flex items-center justify-between">
          <Link href="/projects" className="text-xs text-blue-600 hover:underline">View all projects</Link>
          <Link href="/projects/templates" className="text-xs text-blue-600 hover:underline">Create project</Link>
        </div>
      </NavDropdown>

      {/* Filters */}
      <NavDropdown label="Filters">
        <div className="py-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Starred</div>
          <div className="px-3 py-3 text-xs text-muted-foreground text-center">No starred filters</div>
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent</div>
          <Link href="/filters/my-open-work-items" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            My open work items
          </Link>
          <Link href="/filters/reported-by-me" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            Reported by me
          </Link>
          <Link href="/filters/all-work-items" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            All work items
          </Link>
        </div>
        <div className="border-t px-3 py-2 flex items-center justify-between">
          <Link href="/filters" className="text-xs text-blue-600 hover:underline">View all filters</Link>
        </div>
      </NavDropdown>

      {/* Dashboards */}
      <NavDropdown label="Dashboards">
        <div className="py-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Starred</div>
          <div className="px-3 py-3 text-xs text-muted-foreground text-center">No starred dashboards</div>
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent</div>
          <Link href="/dashboards/dash-1" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
            Default dashboard
          </Link>
        </div>
        <div className="border-t px-3 py-2 flex items-center justify-between">
          <Link href="/dashboards" className="text-xs text-blue-600 hover:underline">View all dashboards</Link>
          <Link href="/dashboards" className="text-xs text-blue-600 hover:underline">Create dashboard</Link>
        </div>
      </NavDropdown>

      {/* Teams */}
      <NavDropdown label="Teams">
        <div className="py-1">
          <Link href="/teams" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Your team
          </Link>
          <Link href="/teams/people" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            People
          </Link>
          <Link href="/teams/directory" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            Team directory
          </Link>
        </div>
        <div className="border-t px-3 py-2">
          <Link href="/teams" className="text-xs text-blue-600 hover:underline">Search people and teams</Link>
        </div>
      </NavDropdown>

      {/* Plans */}
      <NavDropdown label="Plans">
        <div className="py-1">
          <Link href="/plans" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            View all plans
          </Link>
        </div>
        <div className="border-t px-3 py-2">
          <Link href="/plans" className="text-xs text-blue-600 hover:underline">Create plan</Link>
        </div>
      </NavDropdown>

      {/* Apps */}
      <NavDropdown label="Apps">
        <div className="py-1">
          <Link href="/apps" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            Explore apps
          </Link>
          <Link href="/applications" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9" /></svg>
            Manage apps
          </Link>
        </div>
        <div className="border-t px-3 py-2">
          <Link href="/apps" className="text-xs text-blue-600 hover:underline">View all apps</Link>
        </div>
      </NavDropdown>
    </nav>
  )
}

// ─── Projects nav list (fetches recent projects for the dropdown) ───────────

function ProjectsNavList() {
  const [projects, setProjects] = useState<Project[]>([])
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    fetch("/api/data/projects")
      .then((r) => r.json())
      .then((data: Project[]) => setProjects(data.slice(0, 5)))
      .catch(() => {})
  }, [])

  if (projects.length === 0) {
    return <div className="px-3 py-3 text-xs text-muted-foreground text-center">No recent projects</div>
  }

  return (
    <>
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/projects/${p.key}/board`}
          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {p.key.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-sm truncate">{p.name}</div>
            <div className="text-[11px] text-muted-foreground">{p.type === "scrum" ? "Scrum" : "Kanban"} project</div>
          </div>
        </Link>
      ))}
    </>
  )
}

// ─── App Switcher Icon (grid) ───────────────────────────────────────────────

function AppSwitcherIcon() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border bg-popover shadow-xl p-0">
            {/* Main apps */}
            <div className="p-3 space-y-0.5">
              {[
                { name: "Home", href: "/home", color: "bg-blue-600", icon: <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
                { name: "Jira", href: "/projects", color: "bg-gradient-to-br from-blue-500 to-blue-700", icon: <svg className="size-3.5 text-white" viewBox="0 0 32 32" fill="white"><path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" /></svg> },
                { name: "Goals", href: "/goals", color: "bg-purple-600", icon: <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg> },
                { name: "Projects", href: "/project-directory", color: "bg-green-600", icon: <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg> },
                { name: "Teams", href: "/teams", color: "bg-teal-600", icon: <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
                { name: "Administration", href: "/admin", color: "bg-gray-600", icon: <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9" /></svg> },
              ].map((app) => (
                <Link key={app.name} href={app.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors">
                  <div className={`flex size-8 items-center justify-center rounded-md ${app.color}`}>{app.icon}</div>
                  <span className="text-sm font-medium">{app.name}</span>
                </Link>
              ))}
            </div>

            {/* Recommended section */}
            <div className="border-t px-3 py-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">Recommended for your team</p>
              <div className="space-y-0.5">
                <Link href="/apps" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors">
                  <div className="flex size-8 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-900/30">
                    <svg className="size-4 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">1 collection, 4 tools</span>
                      <span className="rounded bg-blue-100 px-1 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">NEW</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Run your whole team seamlessly</span>
                  </div>
                  <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
                </Link>
                <Link href="/apps" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors">
                  <div className="flex size-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                    <svg className="size-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">Work requests</span>
                    <p className="text-xs text-muted-foreground">Set up a place to manage requests</p>
                  </div>
                </Link>
                <Link href="/plans" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors">
                  <div className="flex size-8 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
                    <svg className="size-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">Product roadmap</span>
                    <p className="text-xs text-muted-foreground">Map out product with custom roadmaps</p>
                  </div>
                </Link>
                <Link href="/apps" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors">
                  <div className="flex size-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                    <svg className="size-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">More Atlassian apps</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Manage list */}
            <div className="border-t px-3 py-2">
              <button onClick={() => setOpen(false)} className="w-full rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                Manage list
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Three Dots Menu (notifications, help, settings, profile) ───────────────

function ThreeDotsMenu() {
  const [open, setOpen] = useState(false)
  const [themeSubOpen, setThemeSubOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const themeChoices = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Match system" },
  ] as const

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); setThemeSubOpen(false) }} aria-label="Account menu" title="Account menu" className="flex size-8 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setThemeSubOpen(false) }} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-popover shadow-lg py-1">
            {themeSubOpen ? (
              <>
                <button onClick={() => setThemeSubOpen(false)} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-left hover:bg-accent transition-colors">
                  <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                  Theme
                </button>
                <div className="border-t my-1" />
                {themeChoices.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setTheme(option.value); setOpen(false); setThemeSubOpen(false) }}
                    aria-label={`Set theme to ${option.label}`}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                  >
                    <span className="flex size-4 items-center justify-center">
                      {theme === option.value && (
                        <svg className="size-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </span>
                    {option.label}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: "Notifications", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>, action: () => router.push("/home/notifications") },
                  { label: "Help", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>, action: () => {} },
                  { label: "Settings", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>, action: () => router.push("/admin") },
                  { label: "Premium trial", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>, action: () => {} },
                ].map((item) => (
                  <button key={item.label} onClick={() => { setOpen(false); item.action() }} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-left hover:bg-accent transition-colors">
                    <span className="text-muted-foreground">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="border-t my-1" />
                <button onClick={() => setThemeSubOpen(true)} aria-label="Change theme" className="flex w-full items-center gap-3 px-3 py-2 text-sm text-left hover:bg-accent transition-colors">
                  <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                  Theme
                  <svg className="size-4 text-muted-foreground ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
                <div className="border-t my-1" />
                <button onClick={() => { setOpen(false); router.push("/home/profile") }} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-left hover:bg-accent transition-colors">
                  <Avatar className="size-5"><AvatarFallback className="bg-blue-600 text-[8px] font-semibold text-white">AS</AvatarFallback></Avatar>
                  Profile
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Top Nav ────────────────────────────────────────────────────────────────

export function TopNav() {
  useSidebar() // keep sidebar context connected

  return (
    <header className="flex h-12 items-center justify-between px-3 border-b bg-background">
      {/* Left */}
      <div className="flex items-center gap-1.5 min-w-0">
        {/* Sidebar collapse/expand toggle */}
        <SidebarTrigger className="size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent" />

        {/* App switcher grid */}
        <AppSwitcherIcon />

        {/* Jira logo — blue background app icon like real Jira */}
        <Link href="/projects" className="flex size-8 items-center justify-center shrink-0 rounded-lg bg-gradient-to-b from-[#357DE8] to-[#1D68D9] hover:opacity-90 transition-opacity">
          <svg className="size-5 pointer-events-none" viewBox="0 0 32 32" fill="none">
            <path d="M27.55 15.1L17.29 4.47 16 3.13 6.45 13.01l-2.14 2.2a.73.73 0 000 1.02l6.97 7.17L16 28.87l5.35-5.5.39-.4 5.81-5.98a.73.73 0 000-1.02zM16 20.28l-4.07-4.18L16 11.92l4.07 4.18L16 20.28z" fill="white"/>
            <defs>
              <linearGradient id="jira-grad-1" x1="20.87" y1="4.58" x2="12.19" y2="13.7">
                <stop offset="0.18" stopColor="white" stopOpacity="0" />
                <stop offset="1" stopColor="white" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="jira-grad-2" x1="11.28" y1="27.56" x2="19.96" y2="18.44">
                <stop offset="0.18" stopColor="white" stopOpacity="0" />
                <stop offset="1" stopColor="white" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path d="M16 11.92a6.03 6.03 0 01-.04-8.46l-9.51 9.78 6.52 6.7L16 16.1l-.04-4.18z" fill="url(#jira-grad-1)"/>
            <path d="M20.11 16.06L16 20.28a6.03 6.03 0 01.04 8.46l9.51-9.78-5.44-2.9z" fill="url(#jira-grad-2)"/>
          </svg>
        </Link>

        {/* Search icon */}
        <SearchBar isBlue={false} />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Create Issue */}
        <CreateIssueDialog isBlue={false} />

        {/* Three-dot menu */}
        <ThreeDotsMenu />

        {/* User avatar & theme menu */}
        <UserMenu />
      </div>
    </header>
  )
}

// ─── Keyboard shortcuts dialog ──────────────────────────────────────────────

const SHORTCUT_SECTIONS = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["C"], description: "Create issue" },
      { keys: ["/"], description: "Focus search" },
      { keys: ["G", "then", "D"], description: "Go to dashboard" },
      { keys: ["G", "then", "B"], description: "Go to board" },
      { keys: ["G", "then", "K"], description: "Go to backlog" },
      { keys: ["?"], description: "Open keyboard shortcuts" },
    ],
  },
  {
    title: "Board",
    shortcuts: [
      { keys: ["J"], description: "Select next issue" },
      { keys: ["K"], description: "Select previous issue" },
      { keys: ["T"], description: "Change status" },
      { keys: ["A"], description: "Assign to me" },
    ],
  },
  {
    title: "Issue detail",
    shortcuts: [
      { keys: ["E"], description: "Edit summary" },
      { keys: ["M"], description: "Add comment" },
      { keys: ["⌘", "+", "Enter"], description: "Save comment" },
      { keys: ["Esc"], description: "Close panel" },
    ],
  },
]

function KeyboardShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[540px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{section.title}</h3>
              <div className="space-y-1.5">
                {section.shortcuts.map((s) => (
                  <div key={s.description} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-foreground">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        k === "then" || k === "+" ? (
                          <span key={i} className="text-xs text-muted-foreground">{k}</span>
                        ) : (
                          <kbd key={i} className="inline-flex h-6 min-w-6 items-center justify-center rounded border bg-muted px-1.5 text-[11px] font-mono font-medium text-muted-foreground">
                            {k}
                          </kbd>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── User Menu ──────────────────────────────────────────────────────────────

function UserMenu() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // no-op — redirect to login regardless
    }
    router.push("/login")
  }

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Match system" },
  ] as const

  return (
    <>
      <Popover onOpenChange={(open) => { if (!open) setThemeMenuOpen(false) }}>
        <PopoverTrigger
          className="rounded-full"
          aria-label="Account menu"
          role="button"
          title="Account menu"
        >
          <Avatar className="size-8 cursor-pointer hover:ring-2 hover:ring-white/50 hover:ring-offset-1 hover:ring-offset-[#0052CC] transition-all">
            <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
              AS
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" sideOffset={8} className="w-[280px] p-0">
          {/* Profile header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-blue-600 text-sm font-semibold text-white">AS</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">Abhishek Sharma</p>
                <p className="text-xs text-muted-foreground">abhisheksharma67185@gmail.com</p>
              </div>
            </div>
          </div>

          {themeMenuOpen ? (
            /* Theme sub-menu */
            <div className="p-1">
              <button
                onClick={() => setThemeMenuOpen(false)}
                aria-label="Back to menu"
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors w-full"
              >
                <svg aria-hidden="true" className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                Theme
              </button>
              <div className="border-t my-1" />
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value)
                    setThemeMenuOpen(false)
                  }}
                  aria-label={`Set theme to ${option.label}`}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors w-full"
                >
                  <span className="flex size-4 items-center justify-center">
                    {theme === option.value && (
                      <svg aria-hidden="true" className="size-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </span>
                  {option.label}
                  {option.value === "system" && (
                    <span className="ml-auto text-xs text-muted-foreground">default</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Menu items */}
              <div className="p-1">
                <Link href="/home/profile" aria-label="Go to your profile" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                  <svg aria-hidden="true" className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>
                  Profile
                </Link>
                <Link href="/home/account-settings" aria-label="Go to account settings" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                  <svg aria-hidden="true" className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  Account settings
                </Link>
                <button
                  onClick={() => setThemeMenuOpen(true)}
                  aria-label="Change theme"
                  aria-haspopup="true"
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors w-full"
                >
                  <svg aria-hidden="true" className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                  Theme
                  <svg aria-hidden="true" className="size-4 text-muted-foreground ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>

              <div className="border-t p-1">
                <Link href="/switch-account" aria-label="Switch to another account" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                  <svg aria-hidden="true" className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>
                  Switch account
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label="Log out of your account"
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors w-full"
                >
                  <svg aria-hidden="true" className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  Log out
                </button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>

      <KeyboardShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  )
}
