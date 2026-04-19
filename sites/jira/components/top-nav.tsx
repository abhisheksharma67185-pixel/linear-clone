"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
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

export function SearchBar({ isBlue = true, defaultTab = "jira" }: { isBlue?: boolean; defaultTab?: "jira" | "home" }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"jira" | "home">(defaultTab)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [recentIssues, setRecentIssues] = useState<Issue[]>([])
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    fetch("/api/data/issues")
      .then((r) => r.json())
      .then((data: Issue[]) => {
        const sorted = [...data].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        setRecentIssues(sorted.slice(0, 3))
      })
      .catch(() => {})
    fetch("/api/data/projects")
      .then((r) => r.json())
      .then((data: Project[]) => setRecentProjects(data.slice(0, 2)))
      .catch(() => {})
    fetch("/api/data/users")
      .then((r) => r.json())
      .then((data: User[]) => setRecentUsers(data.slice(0, 2)))
      .catch(() => {})
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); setResults(null) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery(""); setResults(null)
      }
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

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
    setOpen(false); setQuery(""); setResults(null)
    router.push(href)
  }

  const hasResults = results && (results.issues.length > 0 || results.projects.length > 0 || results.users.length > 0)

  const IssueTypeIcon = ({ type }: { type: string }) => {
    const bg = type === "bug" ? "bg-red-500" : type === "story" ? "bg-green-500" : "bg-blue-500"
    return (
      <div className={`flex size-6 shrink-0 items-center justify-center rounded-md ${bg}`}>
        <svg className="size-3.5 text-white" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,7 5.5,10.5 12,3.5" /></svg>
      </div>
    )
  }

  const BoardGridIcon = () => (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background">
      <svg className="size-3.5 text-foreground" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="1" width="6" height="6" rx="0.5" /><rect x="9" y="1" width="6" height="6" rx="0.5" /><rect x="1" y="9" width="6" height="6" rx="0.5" /><rect x="9" y="9" width="6" height="6" rx="0.5" />
      </svg>
    </div>
  )

  const JiraProjectIcon = ({ color = "bg-violet-600" }: { color?: string }) => (
    <div className={`flex size-6 shrink-0 items-center justify-center rounded-md ${color}`}>
      <svg className="size-3.5 text-white" viewBox="0 0 32 32" fill="white"><path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" /></svg>
    </div>
  )

  const ProjectIcon = ({ color = "bg-blue-500" }: { color?: string }) => (
    <div className={`flex size-6 shrink-0 items-center justify-center rounded-md ${color}`}>
      <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v4H3zm0 6h18v4H3zm0 6h18v4H3z" /></svg>
    </div>
  )

  const TeamIcon = ({ color = "bg-blue-500" }: { color?: string }) => (
    <div className={`flex size-6 shrink-0 items-center justify-center rounded-md ${color}`}>
      <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    </div>
  )

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", maxWidth: 600 }}>
      {/* Trigger input */}
      <div style={{ position: "relative" }}>
        <svg
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#6B778C", width: 16, height: 16, pointerEvents: "none" }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        {open ? (
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`)
            }}
            placeholder="Search Jira"
            style={{ width: "100%", height: 36, paddingLeft: 34, paddingRight: 12, border: "2px solid #0052CC", borderRadius: 4, fontSize: 14, color: "#172B4D", background: "white", outline: "none" }}
          />
        ) : (
          <input
            type="text"
            placeholder="Search Jira"
            readOnly
            onClick={() => setOpen(true)}
            style={{ width: "100%", height: 36, paddingLeft: 34, paddingRight: 12, border: "1px solid #DFE1E6", borderRadius: 4, fontSize: 14, color: "#172B4D", background: "#FAFBFC", outline: "none", cursor: "pointer" }}
          />
        )}
        {loading && open && (
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}>
            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full bg-popover rounded-md border shadow-xl overflow-hidden" style={{ minWidth: 680 }}>
          {/* Tabs — order follows defaultTab */}
          <div className="flex border-b px-4 pt-1">
            {(defaultTab === "home" ? ["home", "jira"] : ["jira", "home"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "jira" | "home")}
                className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ── Jira tab ── */}
          {activeTab === "jira" && (
            <div>
              {!query.trim() ? (
                <>
                  {/* View all issues row */}
                  <button onClick={() => go("/filters/all-work-items")} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-accent transition-colors border-b">
                    <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <span className="flex-1 text-sm font-medium">View all issues</span>
                    <span className="text-xs text-muted-foreground border rounded px-1 py-0.5">↵</span>
                  </button>

                  {/* Recently viewed issues */}
                  <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Recently viewed issues
                  </div>
                  {recentIssues.length > 0 ? recentIssues.map((issue) => (
                    <button key={issue.id} onClick={() => go(`/issue/${issue.key}`)} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors">
                      <IssueTypeIcon type={issue.type} />
                      <span className="flex-1 text-sm truncate">{issue.key} {issue.summary}</span>
                      <span className="text-xs text-muted-foreground shrink-0 w-24 text-right">My Team</span>
                      <span className="text-xs text-muted-foreground shrink-0 w-28 text-right">Recently viewed</span>
                    </button>
                  )) : (
                    <>
                      {[{ key: "SCRUM-6", summary: "wxdxadxax" }, { key: "SCRUM-5", summary: "vijay" }, { key: "SCRUM-1", summary: "Task 1" }].map((item) => (
                        <button key={item.key} onClick={() => go(`/issue/${item.key}`)} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors">
                          <IssueTypeIcon type="task" />
                          <span className="flex-1 text-sm truncate">{item.key} {item.summary}</span>
                          <span className="text-xs text-muted-foreground shrink-0 w-24 text-right">My Team</span>
                          <span className="text-xs text-muted-foreground shrink-0 w-28 text-right">Recently viewed</span>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Recent projects and filters */}
                  <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent projects and filters
                  </div>
                  {recentProjects.length > 0 ? recentProjects.map((proj) => (
                    <button key={proj.id} onClick={() => go(`/projects/${proj.key}/board`)} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors">
                      <BoardGridIcon />
                      <span className="flex-1 text-sm truncate">{proj.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">My Team</span>
                    </button>
                  )) : (
                    <>
                      <button onClick={() => go("/projects/SCRUM/board")} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors">
                        <BoardGridIcon />
                        <span className="flex-1 text-sm">SCRUM board</span>
                        <span className="text-xs text-muted-foreground shrink-0">My Team</span>
                      </button>
                      <button onClick={() => go("/projects")} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors">
                        <JiraProjectIcon color="bg-violet-600" />
                        <span className="flex-1 text-sm">My Team (SCRUM)</span>
                      </button>
                    </>
                  )}

                  {/* Footer — pill buttons */}
                  <div className="flex items-center gap-2 px-4 py-3 border-t mt-1">
                    <span className="text-sm text-muted-foreground shrink-0">Go to all:</span>
                    {[
                      { label: "Issues", href: "/filters/all-work-items" },
                      { label: "Projects", href: "/projects" },
                      { label: "Filters", href: "/filters" },
                      { label: "People", href: "/teams/people" },
                    ].map(({ label, href }) => (
                      <button key={label} onClick={() => go(href)} className="px-3 py-1 text-sm border rounded hover:bg-accent transition-colors font-medium">
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Search for pages hint + help link */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-t bg-muted/30">
                    <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <span className="text-xs text-muted-foreground flex-1">Search for pages, users, and more</span>
                    <a
                      href="https://support.atlassian.com/jira-work-management/docs/search-for-issues/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Tell me more about search
                    </a>
                  </div>
                </>
              ) : (
                /* Search results */
                <div>
                  {!hasResults && !loading && (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</div>
                  )}
                  {results && results.issues.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recently viewed issues</div>
                      {results.issues.map((issue) => (
                        <button key={issue.id} onClick={() => go(`/issue/${issue.key}`)} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors">
                          <IssueTypeIcon type={issue.type} />
                          <span className="flex-1 text-sm truncate">{issue.key} {issue.summary}</span>
                          <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">My Team</span>
                          <span className="text-xs text-muted-foreground shrink-0 w-28 text-right">Recently viewed</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {results && results.projects.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recent projects and filters</div>
                      {results.projects.map((project) => (
                        <button key={project.id} onClick={() => go(`/projects/${project.key}/board`)} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors">
                          <BoardGridIcon />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{project.name}</span>
                            <span className="text-xs text-muted-foreground">{project.key}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {results && results.users.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">People</div>
                      {results.users.map((user) => (
                        <button key={user.id} onClick={() => go("/teams/people")} className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-accent transition-colors">
                          <Avatar className="size-[22px]">
                            <AvatarFallback className="text-[9px] bg-teal-500 text-white">{(user.displayName ?? user.name).charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{user.displayName ?? user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Footer */}
                  <div className="flex items-center gap-2 px-4 py-3 border-t">
                    <span className="text-sm text-muted-foreground shrink-0">Go to all:</span>
                    {[
                      { label: "Issues", href: "/filters/all-work-items" },
                      { label: "Projects", href: "/projects" },
                      { label: "Filters", href: "/filters" },
                      { label: "People", href: "/teams/people" },
                    ].map(({ label, href }) => (
                      <button key={label} onClick={() => go(href)} className="px-3 py-1 text-xs border rounded-sm hover:bg-accent transition-colors font-medium">
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Home tab ── */}
          {activeTab === "home" && (
            <div className="max-h-[520px] overflow-y-auto">
              {/* Recent projects */}
              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recent projects</div>
              {recentProjects.length > 0 ? recentProjects.map((proj) => (
                <button key={proj.id} onClick={() => go(`/projects/${proj.key}/board`)} className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                  <ProjectIcon color="bg-blue-500" />
                  <span className="text-sm">{proj.name}</span>
                </button>
              )) : (
                <button onClick={() => go("/projects")} className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                  <ProjectIcon color="bg-orange-400" />
                  <span className="text-sm">vijay</span>
                </button>
              )}

              {/* Recent goals */}
              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recent goals</div>
              {["geeta", "geeta", "geeta"].map((name, i) => (
                <button key={i} onClick={() => go("/goals")} className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                  <ProjectIcon color="bg-blue-400" />
                  <span className="text-sm">{name}</span>
                </button>
              ))}

              {/* Recent people */}
              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recent people</div>
              {recentUsers.length > 0 ? recentUsers.map((user) => (
                <button key={user.id} onClick={() => go("/teams/people")} className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                  <Avatar className="size-[22px]">
                    <AvatarFallback className="text-[9px] bg-teal-500 text-white">{(user.displayName ?? user.name).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.displayName ?? user.name}</span>
                </button>
              )) : (
                <>
                  <button onClick={() => go("/teams/people")} className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                    <Avatar className="size-[22px]"><AvatarFallback className="text-[9px] bg-teal-500 text-white">TC</AvatarFallback></Avatar>
                    <span className="text-sm">Theta Computer</span>
                  </button>
                  <button onClick={() => go("/teams/people")} className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                    <Avatar className="size-[22px]"><AvatarFallback className="text-[9px] bg-orange-500 text-white">V</AvatarFallback></Avatar>
                    <span className="text-sm">vijay2</span>
                  </button>
                </>
              )}

              {/* Recently viewed teams */}
              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recently viewed teams</div>
              {[
                { name: "geeta", color: "bg-blue-500" },
                { name: "geeta", color: "bg-pink-500" },
                { name: "geeta2", color: "bg-pink-600" },
              ].map(({ name, color }, i) => (
                <button key={i} onClick={() => go("/teams")} className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-accent transition-colors">
                  <TeamIcon color={color} />
                  <span className="text-sm">{name}</span>
                  <svg className="size-4 text-blue-500 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
              ))}
              <div className="h-3" />
            </div>
          )}
        </div>
      )}
    </div>
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
      {/* Split Create button: primary action + chevron dropdown */}
      <div className="relative flex items-stretch">
        <button
          aria-label="Create"
          onClick={() => setOpen(true)}
          style={{ background: "#0052CC", color: "white", border: "none", borderRadius: "3px 0 0 3px", padding: "0 12px", height: 32, fontSize: 14, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0747A6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#0052CC")}
        >
          Create
        </button>
        <button
          aria-label="Create menu"
          onClick={() => setMenuOpen((v) => !v)}
          style={{ background: "#0052CC", color: "white", border: "none", borderLeft: "1px solid rgba(255,255,255,0.3)", borderRadius: "0 3px 3px 0", padding: "0 6px", height: 32, cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#0747A6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#0052CC")}
        >
          <svg className="size-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 11L3 6h10z"/></svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-48 rounded-md border bg-popover shadow-lg py-1"
            style={{ minWidth: 160 }}>
            {[
              { label: "Goal", action: () => { setMenuOpen(false); setGoalOpen(true) } },
              { label: "Work Item", action: () => { setMenuOpen(false); setOpen(true) } },
              { label: "Project", action: () => { setMenuOpen(false); setProjectOpen(true) } },
              { label: "Team", action: () => { setMenuOpen(false); setTeamOpen(true) } },
            ].map(({ label, action }) => (
              <button key={label} onClick={action}
                className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                {label}
              </button>
            ))}
          </div>
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
  const [isTrial, setIsTrial] = useState(false)
  const [openPanel, setOpenPanel] = useState<"notifications" | "help" | "settings" | "user" | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const toggle = (panel: "notifications" | "help" | "settings" | "user") =>
    setOpenPanel((prev) => (prev === panel ? null : panel))

  useEffect(() => {
    fetch("/api/jira/notifications")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.unreadCount ?? 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/atlassian/license")
      .then((r) => r.json())
      .then((data) => {
        const plan = data?.applications?.[0]?.plan
        const trial = plan === "FREE" || data?.isTrial === true
        setIsTrial(trial)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenPanel(null) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <header className="flex h-12 items-center justify-between gap-3 px-3 border-b bg-background" style={{ position: "relative", zIndex: 100 }}>
      {/* Left: sidebar toggle + app switcher + Jira logo */}
      <div className="flex items-center gap-1.5 shrink-0">
        <SidebarTrigger className="size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent" />
        <AppSwitcherIcon />
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
      </div>

      {/* Center: full-width search bar (BUG 2) */}
      <div className="flex-1 flex justify-center">
        <SearchBar isBlue={false} />
      </div>

      {/* Right: [Premium trial badge] + Create + bell + ? + gear + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", position: "relative" }}>
        {isTrial && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EAE6FF', color: '#403294', borderRadius: 3, padding: '4px 10px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Premium trial
          </div>
        )}
        <CreateIssueDialog isBlue={false} />

        {/* Bell */}
        <button
          aria-label="Notifications"
          onClick={() => setOpenPanel((prev) => prev === "notifications" ? null : "notifications")}
          style={{
            position: "relative",
            width: 32, height: 32, borderRadius: 4,
            background: openPanel === "notifications" ? "#DEEBFF" : "none",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: openPanel === "notifications" ? "#0052CC" : "#42526E",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (openPanel !== "notifications") e.currentTarget.style.background = "#F4F5F7" }}
          onMouseLeave={(e) => { if (openPanel !== "notifications") e.currentTarget.style.background = "none" }}
        >
          <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 2, right: 2,
              minWidth: 16, height: 16, borderRadius: 8,
              background: "#DE350B", color: "white",
              fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px",
              pointerEvents: "none",
            }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Help */}
        <IconBtn active={openPanel === "help"} onClick={() => toggle("help")} label="Help">
          <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </IconBtn>

        {/* Settings */}
        <IconBtn active={openPanel === "settings"} onClick={() => toggle("settings")} label="Settings">
          <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </IconBtn>

        {/* Avatar */}
        <div
          onClick={() => toggle("user")}
          style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", cursor: "pointer", border: openPanel === "user" ? "2px solid #0052CC" : "2px solid transparent", flexShrink: 0 }}
        >
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0052CC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "white", userSelect: "none" }}>AS</div>
        </div>

        {/* Render active panel */}
        {openPanel === "notifications" && <NotificationsPanel onClose={() => setOpenPanel(null)} />}
        {openPanel === "help" && <HelpSidePanel onClose={() => setOpenPanel(null)} />}
        {openPanel === "settings" && <SettingsPanel onClose={() => setOpenPanel(null)} />}
        {openPanel === "user" && <UserDropdown onClose={() => setOpenPanel(null)} />}
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

// ─── Icon Button helper ──────────────────────────────────────────────────────

function IconBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 4, background: active ? "#DEEBFF" : "none", border: "none", cursor: "pointer", color: active ? "#0052CC" : "#42526E", flexShrink: 0 }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F4F5F7" }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "none" }}
    >
      {children}
    </button>
  )
}

// ─── Notifications Panel ────────────────────────────────────────────────────

type Notification = {
  id: string
  text: string
  meta: string
  timeAgo: string
  read: boolean
  type: "Direct" | "Watching"
  actorInitials?: string
  actorColor?: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    read: false,
    actorInitials: "PP",
    actorColor: "#6554C0",
    text: "Priya Patel assigned SCRUM-5 to you",
    meta: "SCRUM-5 · Jira",
    timeAgo: "2h ago",
    type: "Direct",
  },
  {
    id: "2",
    read: true,
    actorInitials: "AS",
    actorColor: "#FF7452",
    text: "You were mentioned in SCRUM-8",
    meta: "SCRUM-8 · Jira",
    timeAgo: "2d ago",
    type: "Direct",
  },
]

function EmptyNotifications() {
  return (
    <div style={{ padding: "48px 16px", textAlign: "center" }}>
      <svg width="100" height="90" viewBox="0 0 100 90" style={{ marginBottom: 16 }}>
        <rect x="30" y="12" width="4" height="60" fill="#FFC400" rx="2"/>
        <rect x="34" y="12" width="50" height="36" fill="#0052CC" rx="3"/>
        <path d="M47 24 L56 32 L47 40 Z" fill="white" opacity="0.9"/>
        <ellipse cx="32" cy="72" rx="10" ry="5" fill="#C1C7D0"/>
      </svg>
      <p style={{ fontSize: 14, color: "#172B4D", margin: "0 0 4px 0" }}>You have no notifications from</p>
      <p style={{ fontSize: 14, color: "#172B4D", margin: 0 }}>the last 30 days.</p>
    </div>
  )
}

function NotificationRow({ notification }: { notification: Notification }) {
  const isUnread = !notification.read
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start",
        padding: "12px 16px",
        background: isUnread ? "#DEEBFF" : "white",
        borderBottom: "1px solid #F4F5F7",
        cursor: "pointer", position: "relative",
        gap: 12,
      }}
      onMouseEnter={(e) => { if (!isUnread) e.currentTarget.style.background = "#F4F5F7" }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isUnread ? "#DEEBFF" : "white" }}
    >
      {isUnread && (
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0052CC", flexShrink: 0, marginTop: 8 }} />
      )}
      {!isUnread && <div style={{ width: 8, flexShrink: 0 }} />}

      <div style={{ width: 32, height: 32, borderRadius: "50%", background: notification.actorColor || "#6554C0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
        {notification.actorInitials || "??"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, color: "#172B4D", margin: "0 0 4px 0", lineHeight: 1.4 }}>
          {notification.text}
        </p>
        <p style={{ fontSize: 12, color: "#6B778C", margin: 0 }}>
          {notification.meta} · {notification.timeAgo}
        </p>
      </div>
    </div>
  )
}

function AtlassianFlagIllustration() {
  return (
    <svg width="120" height="110" viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="38" y="15" width="5" height="72" fill="#FFC400" rx="2"/>
      <rect x="43" y="15" width="62" height="46" fill="#0052CC" rx="3"/>
      <path d="M67 48 L74 28 L81 48" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M62 42 L86 42" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="40" cy="88" rx="12" ry="6" fill="#C1C7D0"/>
    </svg>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{ width: 36, height: 20, borderRadius: 10, background: value ? "#0052CC" : "#DFE1E6", position: "relative", cursor: "pointer", transition: "background 0.15s ease", flexShrink: 0 }}
    >
      <div style={{ position: "absolute", top: 2, left: value ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.15s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  )
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("Direct")
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    fetch("/api/jira/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications ?? [])
        setLoading(false)
      })
      .catch(() => {
        setNotifications(MOCK_NOTIFICATIONS)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const displayed = onlyUnread
    ? notifications.filter((n) => !n.read)
    : notifications

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, zIndex: 299, background: "transparent" }} />

      {/* Panel with slide-in */}
      <div style={{
        position: "fixed", top: 48, right: 0,
        width: 480, height: "calc(100vh - 48px)",
        background: "white", borderLeft: "1px solid #DFE1E6",
        boxShadow: "-4px 0 8px rgba(9,30,66,0.15)",
        zIndex: 300, display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: visible ? "transform 0.2s ease-out" : "transform 0.2s ease-in",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #F4F5F7", flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: "#172B4D" }}>Notifications</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#6B778C" }}>Only show unread</span>
            <div
              onClick={() => setOnlyUnread(!onlyUnread)}
              style={{ width: 36, height: 20, borderRadius: 10, background: onlyUnread ? "#0052CC" : "#DFE1E6", position: "relative", cursor: "pointer", transition: "background 0.15s", flexShrink: 0 }}
            >
              <div style={{ position: "absolute", top: 2, left: onlyUnread ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
            <a href="/jira/settings/notifications" style={{ color: "#6B778C", display: "flex", alignItems: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#6B778C", padding: "0 2px" }}>⋮</button>
            <button
              onClick={handleClose}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6B778C", lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #F4F5F7", flexShrink: 0 }}>
          {["Direct", "Watching"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none", border: "none",
                borderBottom: activeTab === tab ? "2px solid #0052CC" : "2px solid transparent",
                padding: "12px 16px", fontSize: 14,
                color: activeTab === tab ? "#0052CC" : "#42526E",
                fontWeight: activeTab === tab ? 500 : 400,
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "32px 16px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 64, background: "#F4F5F7", borderRadius: 4, marginBottom: 8 }} />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <EmptyNotifications />
          ) : (
            displayed.map((notif) => (
              <NotificationRow key={notif.id} notification={notif} />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderTop: "1px solid #F4F5F7",
          background: "#FAFBFC", flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: "#6B778C" }}>Press ↓ ↑ to move through notifications.</span>
          <button style={{ background: "none", border: "none", color: "#0052CC", fontSize: 12, cursor: "pointer", padding: 0 }} onClick={() => setShortcutsOpen(true)}>
            See all shortcuts
          </button>
        </div>
      </div>

      <KeyboardShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  )
}

// ─── Help Panel ─────────────────────────────────────────────────────────────

function HelpSidePanel({ onClose }: { onClose: () => void }) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const ico = (d: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />

  const helpItems: { icon: React.ReactNode; label: string; href?: string; external?: boolean; onClick?: () => void }[] = [
    { icon: ico('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'), label: "Find out what's changed in Jira", href: "https://confluence.atlassian.com/jirasoftwarecloud/release-notes", external: true },
    { icon: ico('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'), label: "Read about the new navigation", href: "https://support.atlassian.com/jira-software-cloud/docs/navigate-jira/", external: true },
    { icon: ico('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'), label: "Browse complete documentation", href: "https://support.atlassian.com/jira-software-cloud/", external: true },
    { icon: ico('<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'), label: "Build skills with Atlassian Learning", href: "https://university.atlassian.com/", external: true },
    { icon: ico('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'), label: "Ask our Community forums", href: "https://community.atlassian.com/", external: true },
    { icon: ico('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'), label: "Contact support", href: "https://support.atlassian.com/contact/", external: true },
    { icon: ico('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'), label: "Give feedback about Jira", external: false, onClick: () => {} },
    { icon: ico('<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6" y2="10"/><line x1="10" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="14" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/>'), label: "Keyboard shortcuts", external: false, onClick: () => { onClose(); setShortcutsOpen(true) } },
    { icon: ico('<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'), label: "Get Jira Mobile", href: "https://www.atlassian.com/software/jira/mobile-app", external: true },
  ]

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={onClose} />

      {/* Panel */}
      <div style={{ position: "fixed", top: 48, right: 0, width: 320, height: "calc(100vh - 48px)", background: "white", borderLeft: "1px solid #DFE1E6", zIndex: 200, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #F4F5F7" }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Help</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6B778C" }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {helpItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", minHeight: 52, fontSize: 14, color: "#172B4D", textDecoration: "none", borderBottom: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F5F7")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                <span style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </span>
                <span style={{ color: "#6B778C", fontSize: 12 }}>↗</span>
              </a>
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px 16px", minHeight: 52, background: "none", border: "none", borderBottom: "none", fontSize: 14, color: "#172B4D", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F5F7")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #F4F5F7", padding: "12px 16px", fontSize: 12, color: "#6B778C", display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
          <a href="https://www.atlassian.com/software/jira" target="_blank" rel="noopener noreferrer" style={{ color: "#6B778C", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>About Jira</a>
          <a href="https://www.atlassian.com/legal/cloud-terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: "#6B778C", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>Terms of use</a>
          <a href="https://www.atlassian.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "#6B778C", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>Privacy policy</a>
          <a href="https://www.atlassian.com/legal/privacy-policy#notice-at-collection" target="_blank" rel="noopener noreferrer" style={{ color: "#6B778C", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")} onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}>Notice at collection</a>
        </div>
      </div>

      <KeyboardShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  )
}

// ─── Settings Panel ─────────────────────────────────────────────────────────

const SETTINGS_SECTIONS: { title: string; items: { icon: React.ReactNode; label: string; description: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Personal settings",
    items: [
      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: "General settings", description: "Manage language, time zone, and other personal preferences", href: "/jira/settings/general" },
      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, label: "Notification settings", description: "Manage email and in-app notifications from Jira", href: "/jira/settings/notifications" },
    ],
  },
  {
    title: "Jira admin settings",
    items: [
      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, label: "System", description: "Manage general configuration, security, automation, user interface, and more", href: "/jira/admin/system" },
      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, label: "Jira apps", description: "Manage access, settings, and integrations across Jira", href: "/jira/admin/apps" },
      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>, label: "Spaces", description: "Manage space settings, categories, and more", href: "/jira/admin/spaces" },
      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></svg>, label: "Work items", description: "Configure work types, workflows, screens, fields, and more", href: "/jira/admin/issues" },
      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, label: "Marketplace apps", description: "Add and manage Jira Marketplace apps and integrations", href: "/jira/admin/marketplace" },
    ],
  },
  {
    title: "Atlassian admin settings",
    items: [
      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: "User management", description: "Manage users, groups, and access requests", href: "https://admin.atlassian.com/o/users", external: true },
      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: "Billing", description: "Update your billing details, manage subscriptions, and more", href: "https://admin.atlassian.com/billing", external: true },
    ],
  },
]

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("settings-search")?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const ALL_ITEMS = SETTINGS_SECTIONS.flatMap((s) => s.items.map((i) => ({ ...i, section: s.title })))
  const displayed = searchQuery.trim()
    ? ALL_ITEMS.filter((i) =>
        i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  const sections = displayed
    ? [{ title: "Results", items: displayed }]
    : SETTINGS_SECTIONS

  return (
    <div
      style={{ position: "absolute", top: 56, right: 0, width: 420, background: "white", border: "1px solid #DFE1E6", borderRadius: 4, boxShadow: "rgba(9,30,66,0.25) 0px 4px 8px -2px, rgba(9,30,66,0.31) 0px 0px 1px 0px", zIndex: 200, overflow: "visible", paddingBottom: 8 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with search — BUG 4: heading 16px, BUG 2: styled search box */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #F4F5F7" }}>
        <span style={{ fontWeight: 500, fontSize: 16, color: "#172B4D" }}>Personal Jira settings</span>
        <div
          style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #DFE1E6", borderRadius: 3, padding: "4px 10px", minWidth: 160, background: "white", cursor: "text" }}
          onClick={() => document.getElementById("settings-search")?.focus()}
        >
          <input
            id="settings-search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: "none", outline: "none", fontSize: 13, color: "#172B4D", flex: 1, minWidth: 80, background: "transparent" }}
          />
          <kbd style={{ fontSize: 10, color: "#6B778C", background: "#F4F5F7", border: "1px solid #DFE1E6", borderRadius: 2, padding: "1px 4px", whiteSpace: "nowrap" }}>⌘ K</kbd>
        </div>
      </div>

      {/* Sections — BUG 1: hr dividers, BUG 5: section header top padding, BUG 6: hover */}
      {sections.map((section, idx) => (
        <div key={section.title}>
          <div style={{ padding: idx === 0 ? "8px 16px 4px" : "12px 16px 4px", fontSize: 11, fontWeight: 700, color: "#6B778C", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {section.title}
          </div>
          {section.items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", textDecoration: "none", color: "inherit", background: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F4F5F7" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white" }}
              onClick={onClose}
            >
              <span style={{ lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#172B4D", marginBottom: 2 }}>{item.label}</span>
                  {item.external && (
                    <svg style={{ width: 12, height: 12, color: "#6B778C", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#6B778C", margin: 0, lineHeight: 1.4 }}>{item.description}</div>
              </div>
            </a>
          ))}
          {idx < sections.length - 1 && (
            <hr style={{ border: "none", borderTop: "1px solid #F4F5F7", margin: "4px 0" }} />
          )}
        </div>
      ))}
      <div style={{ height: 8 }} />
    </div>
  )
}

// ─── User Dropdown (inline positioned) ──────────────────────────────────────

function UserDropdown({ onClose }: { onClose: () => void }) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
    onClose()
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch { /* no-op */ }
    router.push("/login")
  }

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Match system" },
  ] as const

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={onClose} />
      <div
        style={{ position: "absolute", top: 40, right: 0, width: 320, background: "white", border: "1px solid #DFE1E6", borderRadius: 4, boxShadow: "0 4px 8px rgba(9,30,66,0.25)", zIndex: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile header */}
        <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F4F5F7" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#0052CC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600, color: "white", flexShrink: 0, userSelect: "none" }}>AS</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 14, color: "#172B4D" }}>{USER.name}</div>
            <div style={{ fontSize: 12, color: "#6B778C", wordBreak: "break-all" }}>{USER.email}</div>
          </div>
        </div>

        {themeMenuOpen ? (
          <div style={{ padding: 4 }}>
            <button onClick={() => setThemeMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", fontSize: 14, color: "#172B4D", cursor: "pointer" }}>
              <svg style={{ width: 16, height: 16, color: "#6B778C" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              Theme
            </button>
            <div style={{ height: 1, background: "#F4F5F7", margin: "4px 0" }} />
            {themeOptions.map((opt) => (
              <button key={opt.value} onClick={() => { setTheme(opt.value); setThemeMenuOpen(false) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", fontSize: 14, color: "#172B4D", cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F5F7")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                <span style={{ width: 16, display: "flex", justifyContent: "center" }}>{theme === opt.value && <svg style={{ width: 14, height: 14, color: "#0052CC" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}</span>
                {opt.label}
                {opt.value === "system" && <span style={{ marginLeft: "auto", fontSize: 11, color: "#6B778C" }}>default</span>}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Bug 2: SVG icons on menu items */}
            <div style={{ padding: 4 }}>
              <a href="https://id.atlassian.com/manage-profile/profile-and-visibility" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 14, color: "#172B4D", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F5F7")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#42526E"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                Profile
              </a>
              <a href="https://id.atlassian.com/manage-profile/email" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 14, color: "#172B4D", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F5F7")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Account settings
              </a>
              <button onClick={() => setThemeMenuOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between", width: "100%", padding: "8px 12px", background: "none", border: "none", fontSize: 14, color: "#172B4D", cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F5F7")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#44546F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  Theme
                </span>
                <svg style={{ width: 14, height: 14, color: "#6B778C" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
            {/* Bug 3: divider between Theme and Switch account */}
            <div style={{ height: 1, background: "#F4F5F7", margin: "4px 0" }} />
            <div style={{ padding: 4 }}>
              <button onClick={() => { onClose(); setShortcutsOpen(true) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", fontSize: 14, color: "#172B4D", cursor: "pointer", textAlign: "left" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F5F7")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>Switch account</button>
              <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", fontSize: 14, color: "#172B4D", cursor: "pointer", textAlign: "left" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F5F7")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>Log out</button>
            </div>
          </>
        )}
      </div>
      <KeyboardShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  )
}

// ─── User Menu ──────────────────────────────────────────────────────────────

const USER = {
  name: "Abhishek Sharma",
  email: "abhisheksharma67185@gmail.com",
  avatar: "https://secure.gravatar.com/avatar/10b46d63e79de739c076bd558f67570a?s=96&d=mm",
  initials: "AS",
}

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={USER.avatar} alt={USER.name} className="size-8 rounded-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
            <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
              {USER.initials}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" sideOffset={8} className="w-[320px] p-0">
          {/* Profile header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={USER.avatar} alt={USER.name} className="size-12 rounded-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                <AvatarFallback className="bg-blue-600 text-sm font-semibold text-white">{USER.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{USER.name}</p>
                <p className="text-xs text-muted-foreground break-all">{USER.email}</p>
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
                <a href="https://id.atlassian.com/manage-profile/profile-and-visibility" target="_blank" rel="noopener noreferrer" aria-label="Go to your profile" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                  <svg aria-hidden="true" className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>
                  Profile
                </a>
                <a href="https://id.atlassian.com/manage-profile/email" target="_blank" rel="noopener noreferrer" aria-label="Go to account settings" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                  <svg aria-hidden="true" className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  Account settings
                </a>
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
