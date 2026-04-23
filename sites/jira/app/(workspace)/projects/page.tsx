"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Layers01Icon } from "@hugeicons/core-free-icons"
import { CreateSpaceModal } from "@/components/CreateSpaceModal"

// Shape returned by /api/jira/projects (Atlassian REST API proxy)
interface JiraProject {
  id: string
  key: string
  name: string
  projectTypeKey: "software" | "business" | "service_desk"
  simplified: boolean
  avatarUrls: {
    "32x32": string
    "24x24": string
    "48x48": string
    "16x16": string
  }
  lead?: {
    displayName: string
    avatarUrls: { "24x24": string; "32x32": string; "48x48": string }
  }
}

const AVATAR_URL =
  "https://api.atlassian.com/ex/jira/bef43714-49b9-43e9-9f83-3e75487b6553/rest/api/3/universal_avatar/view/type/project/avatar/10415?size=medium"
const LEAD_AS = {
  displayName: "Abhishek Sharma",
  avatarUrls: { "24x24": "", "32x32": "", "48x48": "" },
}
const mkAvatar = () => ({
  "16x16": AVATAR_URL,
  "24x24": AVATAR_URL,
  "32x32": AVATAR_URL,
  "48x48": AVATAR_URL,
})

const FALLBACK_PROJECTS: JiraProject[] = [
  {
    id: "10000",
    key: "SCRUM",
    name: "My Scrum Project",
    projectTypeKey: "software",
    simplified: true,
    avatarUrls: mkAvatar(),
    lead: LEAD_AS,
  },
  {
    id: "10035",
    key: "BVJWBEF",
    name: "bvjwbefeow",
    projectTypeKey: "software",
    simplified: true,
    avatarUrls: mkAvatar(),
    lead: LEAD_AS,
  },
  {
    id: "10033",
    key: "IJDAIP",
    name: "hcu",
    projectTypeKey: "software",
    simplified: true,
    avatarUrls: mkAvatar(),
    lead: LEAD_AS,
  },
  {
    id: "10034",
    key: "KHFIYF",
    name: "khfiyfifiyfy",
    projectTypeKey: "software",
    simplified: true,
    avatarUrls: mkAvatar(),
    lead: LEAD_AS,
  },
  {
    id: "10037",
    key: "PLAT",
    name: "Platform Engineering",
    projectTypeKey: "software",
    simplified: false,
    avatarUrls: mkAvatar(),
    lead: LEAD_AS,
  },
  {
    id: "10038",
    key: "FAPP",
    name: "Frontend App",
    projectTypeKey: "software",
    simplified: false,
    avatarUrls: mkAvatar(),
    lead: LEAD_AS,
  },
  {
    id: "10039",
    key: "BUSOPS",
    name: "Business Operations",
    projectTypeKey: "business",
    simplified: true,
    avatarUrls: mkAvatar(),
    lead: LEAD_AS,
  },
  {
    id: "10040",
    key: "MKTG",
    name: "Marketing",
    projectTypeKey: "business",
    simplified: true,
    avatarUrls: mkAvatar(),
    lead: LEAD_AS,
  },
  {
    id: "10041",
    key: "ONBOARD",
    name: "Onboarding",
    projectTypeKey: "business",
    simplified: false,
    avatarUrls: mkAvatar(),
    lead: LEAD_AS,
  },
]

function getProjectType(p: JiraProject): string {
  if (p.projectTypeKey === "service_desk") return "Service management"
  const managed = p.simplified ? "Team-managed" : "Company-managed"
  const type = p.projectTypeKey === "software" ? "software" : "business"
  return `${managed} ${type}`
}

function SpaceActionsDropdown({
  projectKey,
  projectName,
}: {
  projectKey: string
  projectName: string
}) {
  const [open, setOpen] = useState(false)
  const [trashOpen, setTrashOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [actionDone, setActionDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="text-muted-foreground hover:text-foreground"
        >
          <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full right-0 z-50 mt-1 w-44 rounded-md border bg-popover py-1 shadow-md">
            <button
              className="flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              onClick={() => {
                setOpen(false)
                router.push(`/projects/${projectKey}/settings`)
              }}
            >
              Space settings
            </button>
            <button
              className="flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              onClick={() => {
                setOpen(false)
                setTrashOpen(true)
              }}
            >
              Move to trash
            </button>
            <button
              className="flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              onClick={() => {
                setOpen(false)
                setArchiveOpen(true)
              }}
            >
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Move to trash dialog — manual modal */}
      {trashOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTrashOpen(false)
          }}
        >
          <div
            className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Move to trash</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to move <strong>{projectName}</strong> to
              trash? The space will be deleted after 60 days if not restored.
            </p>
            {actionDone ? (
              <div className="mt-2 flex flex-col items-center gap-2 py-3">
                <svg
                  className="size-8 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-sm font-medium">Moved to trash</p>
              </div>
            ) : (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTrashOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionDone(true)
                    setTimeout(() => {
                      setTrashOpen(false)
                      setActionDone(false)
                    }, 1500)
                  }}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
                >
                  Move to trash
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Archive dialog — manual modal */}
      {archiveOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setArchiveOpen(false)
          }}
        >
          <div
            className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Archive space</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to archive <strong>{projectName}</strong>?
              Archived spaces are read-only and hidden from navigation.
            </p>
            {actionDone ? (
              <div className="mt-2 flex flex-col items-center gap-2 py-3">
                <svg
                  className="size-8 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p className="text-sm font-medium">Space archived</p>
              </div>
            ) : (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setArchiveOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionDone(true)
                    setTimeout(() => {
                      setArchiveOpen(false)
                      setActionDone(false)
                    }, 1500)
                  }}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                >
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const templateList = [
  {
    name: "Scrum",
    description: "Deliver work in short time blocks",
    fullDescription:
      "Sprint toward your project goals with a board, backlog, and timeline.",
    color: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
    previewColor: "from-green-400 to-green-600",
  },
  {
    name: "Work requests",
    description: "Quickly manage incoming requests",
    fullDescription:
      "Set up a service desk to manage and track incoming work requests from your team.",
    badge: "TRY",
    color: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600",
    previewColor: "from-purple-400 to-purple-600",
  },
  {
    name: "IT service",
    description: "Manage requests and incidents",
    fullDescription:
      "Manage IT service requests, incidents, problems, and changes with an ITIL-ready project.",
    badge: "TRY",
    color: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600",
    previewColor: "from-teal-400 to-teal-600",
  },
  {
    name: "Kanban",
    description: "Visualize your work on a board",
    fullDescription:
      "Visualize and advance your project forward using issues on a powerful board.",
    color: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600",
    previewColor: "from-blue-400 to-blue-600",
  },
  {
    name: "Personal tasks",
    description: "Create your to-do list",
    fullDescription:
      "Track your personal tasks and to-dos in a simple, focused project just for you.",
    color: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600",
    previewColor: "from-orange-400 to-orange-600",
  },
  {
    name: "Business project",
    description: "Manage tasks with due dates",
    fullDescription:
      "Manage activities like budgets, goals, and tasks with a calendar and list view.",
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
    previewColor: "from-emerald-400 to-emerald-600",
  },
  {
    name: "Top-level planning",
    description: "Monitor work from many projects",
    fullDescription:
      "Plan, track, and manage work across multiple teams and projects from a single view.",
    badge: "PREMIUM",
    color: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600",
    previewColor: "from-pink-400 to-pink-600",
  },
]

const ALL_FILTER_OPTIONS = [
  "Jira - business spaces",
  "Jira - software spaces",
  "Jira Service Management",
  "Jira Product Discovery",
  "Customer Service Management",
]

const filterChips = ["Jira - software spaces", "Jira - business spaces"]

function FilterBar({
  search,
  onSearch,
  activeFilters,
  onRemoveFilter,
  onClearFilters,
  onToggleFilter,
}: {
  search: string
  onSearch: (v: string) => void
  activeFilters: string[]
  onRemoveFilter: (f: string) => void
  onClearFilters: () => void
  onToggleFilter: (f: string) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [dropdownOpen])

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Search box */}
      <div style={{ position: "relative", width: 240 }}>
        <svg
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6B778C",
            width: 16,
            height: 16,
            pointerEvents: "none",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search spaces"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          style={{
            width: "100%",
            height: 36,
            paddingLeft: 32,
            paddingRight: 12,
            border: "1px solid #DFE1E6",
            borderRadius: 3,
            fontSize: 14,
            color: "#172B4D",
            outline: "none",
            background: "white",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#0052CC")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#DFE1E6")}
        />
      </div>

      {/* Type filter multi-select */}
      <div ref={ref} style={{ position: "relative" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            minHeight: 36,
            padding: "4px 4px 4px 8px",
            border: `1px solid ${dropdownOpen ? "#0052CC" : "#DFE1E6"}`,
            borderRadius: 3,
            background: "white",
            cursor: "default",
            flexWrap: "wrap",
          }}
        >
          {/* Chips */}
          {activeFilters.map((f) => (
            <span
              key={f}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "white",
                border: "1px solid #DFE1E6",
                borderRadius: 2,
                padding: "1px 6px",
                fontSize: 13,
                color: "#172B4D",
                whiteSpace: "nowrap",
              }}
            >
              {f}
              <button
                onClick={() => onRemoveFilter(f)}
                aria-label={`Remove ${f} filter`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                  color: "#6B778C",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}

          {/* Separator + clear + chevron */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginLeft: 2,
            }}
          >
            {activeFilters.length > 0 && (
              <>
                <span
                  style={{
                    width: 1,
                    height: 18,
                    background: "#DFE1E6",
                    display: "inline-block",
                  }}
                />
                <button
                  onClick={onClearFilters}
                  title="Clear all"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 4px",
                    color: "#6B778C",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 4px",
                color: "#6B778C",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{
                  transform: dropdownOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.15s",
                }}
              >
                <path
                  d="M4 6l4 4 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              minWidth: 280,
              background: "white",
              border: "1px solid #DFE1E6",
              borderRadius: 4,
              boxShadow: "0 4px 8px rgba(9,30,66,0.25)",
              zIndex: 100,
            }}
          >
            {ALL_FILTER_OPTIONS.map((opt) => {
              const checked = activeFilters.includes(opt)
              return (
                <label
                  key={opt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#172B4D",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F4F5F7")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleFilter(opt)}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#0052CC",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                  {opt}
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SpacesPage() {
  return (
    <Suspense fallback={null}>
      <SpacesPageInner />
    </Suspense>
  )
}

function SpacesPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<JiraProject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([...filterChips])
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") ?? "ASC").toUpperCase() === "DESC"
      ? "desc"
      : "asc"
  )
  const [starredProjects, setStarredProjects] = useState<Set<string>>(new Set())
  const refetchTrigger = 0
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const spaceToast: string | null = null

  const activeTemplate = templateList.find((t) => t.name === selectedTemplate)

  const toggleStar = (projectId: string) => {
    setStarredProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const params = new URLSearchParams({
          orderBy: "name",
          sortOrder: sortDir === "desc" ? "DESC" : "ASC",
        })
        const res = await fetch(`/api/jira/projects?${params}`)
        if (!res.ok) throw new Error(`${res.status}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        const list = data.values ?? []
        setProjects(list.length > 0 ? list : FALLBACK_PROJECTS)
      } catch {
        setProjects(FALLBACK_PROJECTS)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [sortDir, refetchTrigger])

  const toggleSort = () => {
    const next = sortDir === "asc" ? "desc" : "asc"
    setSortDir(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set("sortKey", "name")
    params.set("sortOrder", next === "asc" ? "ASC" : "DESC")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
  }

  const softwareActive = activeFilters.includes("Jira - software spaces")
  const businessActive = activeFilters.includes("Jira - business spaces")
  const serviceActive = activeFilters.includes("Jira Service Management")
  const hasTypeFilter = activeFilters.length > 0

  const filteredProjects = projects
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.key.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      if (!hasTypeFilter) return false
      if (p.projectTypeKey === "software" && softwareActive) return true
      if (p.projectTypeKey === "business" && businessActive) return true
      if (p.projectTypeKey === "service_desk" && serviceActive) return true
      return false
    })
    .sort((a, b) => {
      const cmp = a.name.localeCompare(b.name)
      return sortDir === "asc" ? cmp : -cmp
    })

  if (loading) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 48,
              background: "#F4F5F7",
              borderRadius: 3,
              marginBottom: 1,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header - always visible */}
        {!activeTemplate && (
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/templates")}
                style={{
                  background: "#1868DB",
                  color: "white",
                  border: "none",
                  borderRadius: 3,
                  padding: "0 12px",
                  height: 32,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1558B0"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1868DB"
                }}
              >
                Create space
              </button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTemplates(!showTemplates)
                  setSelectedTemplate(null)
                }}
              >
                Templates
              </Button>
            </div>
          </div>
        )}

        {/* Template Preview */}
        {activeTemplate ? (
          <div className="flex flex-col items-center justify-center py-12">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="mb-8 flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
              </svg>
              Back to Spaces
            </button>
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              {activeTemplate.name}
            </h2>
            <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
              {activeTemplate.fullDescription}
            </p>
            {/* Template illustration */}
            <div
              className={`h-[320px] w-[480px] rounded-xl bg-gradient-to-br ${activeTemplate.previewColor} p-1 shadow-lg`}
            >
              <div className="h-full w-full overflow-hidden rounded-lg bg-white p-4 dark:bg-card">
                {/* Fake backlog/board UI */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Backlog
                  </span>
                  <div className="flex gap-1">
                    <div className="size-3 rounded-sm bg-blue-200" />
                    <div className="size-3 rounded-sm bg-green-200" />
                    <div className="size-3 rounded-sm bg-orange-200" />
                  </div>
                </div>
                <div className="mb-2 rounded-md border bg-[#f9fafb] p-3 dark:bg-muted/30">
                  <div className="mb-2 text-xs text-muted-foreground">
                    2 Sep – 15 Sep
                  </div>
                  {[
                    {
                      colors: [
                        "bg-blue-500",
                        "bg-blue-300",
                        "bg-pink-400",
                        "bg-green-400",
                      ],
                      pts: 3,
                    },
                    {
                      colors: ["bg-green-500", "bg-green-300", "bg-orange-400"],
                      pts: 2,
                    },
                    {
                      colors: [
                        "bg-blue-500",
                        "bg-blue-300",
                        "bg-orange-400",
                        "bg-purple-300",
                        "bg-gray-300",
                      ],
                      pts: 5,
                    },
                    {
                      colors: ["bg-green-500", "bg-green-300", "bg-pink-400"],
                      pts: 2,
                    },
                    {
                      colors: ["bg-blue-400", "bg-gray-300", "bg-gray-200"],
                      pts: 1,
                    },
                  ].map((row, i) => (
                    <div key={i} className="mb-1.5 flex items-center gap-1.5">
                      {row.colors.map((c, j) => (
                        <div key={j} className={`h-4 flex-1 rounded-sm ${c}`} />
                      ))}
                      <span className="w-4 text-right text-[10px] text-muted-foreground">
                        {row.pts}
                      </span>
                      <div className="size-3 rounded-full border border-muted-foreground/30" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex size-12 items-center justify-center rounded-full border-2 border-muted-foreground/20">
                    <svg
                      className="size-6 text-muted-foreground/40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <Button
              className="mt-8 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                setSelectedTemplate(null)
                setCreateOpen(true)
              }}
            >
              Use template
            </Button>
          </div>
        ) : (
          <>
            {/* Spaces list content below */}

            {/* Search + Type filter row */}
            <FilterBar
              search={search}
              onSearch={setSearch}
              activeFilters={activeFilters}
              onRemoveFilter={removeFilter}
              onClearFilters={clearAllFilters}
              onToggleFilter={(f) =>
                setActiveFilters((prev) =>
                  prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
                )
              }
            />

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow
                    style={{
                      background: "white",
                      borderBottom: "2px solid #DFE1E6",
                      height: 40,
                    }}
                    className="hover:bg-transparent"
                  >
                    <TableHead
                      style={{
                        width: 32,
                        padding: "0 8px",
                        textAlign: "center",
                        color: "#5E6C84",
                      }}
                    />
                    <TableHead
                      style={{
                        width: "35%",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#5E6C84",
                        padding: "0 12px",
                        height: 40,
                      }}
                    >
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#172B4D",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                        onClick={toggleSort}
                      >
                        Name
                        <svg
                          style={{
                            width: 14,
                            height: 14,
                            color: "#6B778C",
                            transform:
                              sortDir === "desc" ? "rotate(180deg)" : "none",
                            transition: "transform 0.15s",
                          }}
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M8 3v10M4 9l4 4 4-4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </TableHead>
                    <TableHead
                      style={{
                        width: 120,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#5E6C84",
                        padding: "0 12px",
                        height: 40,
                      }}
                    >
                      Key
                    </TableHead>
                    <TableHead
                      style={{
                        width: "25%",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#5E6C84",
                        padding: "0 12px",
                        height: 40,
                      }}
                    >
                      Type
                    </TableHead>
                    <TableHead
                      style={{
                        width: "20%",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#5E6C84",
                        padding: "0 12px",
                        height: 40,
                      }}
                    >
                      Lead
                    </TableHead>
                    <TableHead
                      style={{
                        width: 80,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#5E6C84",
                        padding: "0 12px",
                        height: 40,
                        textAlign: "right",
                      }}
                    >
                      Space URL
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow
                      key={project.id}
                      className="group"
                      style={{
                        height: 48,
                        borderBottom: "1px solid #F4F5F7",
                        fontSize: 14,
                        color: "#172B4D",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F4F5F7")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <TableCell
                        style={{
                          width: 32,
                          padding: "0 8px",
                          textAlign: "center",
                        }}
                      >
                        <button
                          onClick={() => toggleStar(project.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            color: starredProjects.has(project.id)
                              ? "#FFC400"
                              : "#C1C7D0",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={
                              starredProjects.has(project.id)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      </TableCell>
                      <TableCell style={{ padding: "0 12px" }}>
                        <Link
                          href={`/projects/${project.key}/board`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            color: "#0052CC",
                            textDecoration: "none",
                            fontWeight: "normal",
                            fontSize: 14,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.textDecoration = "underline")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.textDecoration = "none")
                          }
                        >
                          {project.avatarUrls?.["32x32"] && (
                            <Image
                              src={project.avatarUrls["32x32"]}
                              width={24}
                              height={24}
                              style={{ borderRadius: 3, flexShrink: 0 }}
                              alt={project.name}
                              unoptimized
                            />
                          )}
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell
                        style={{
                          padding: "0 12px",
                          fontSize: 14,
                          color: "#172B4D",
                        }}
                      >
                        {project.key}
                      </TableCell>
                      <TableCell
                        style={{
                          padding: "0 12px",
                          fontSize: 14,
                          color: "#172B4D",
                        }}
                      >
                        {getProjectType(project)}
                      </TableCell>
                      <TableCell style={{ padding: "0 12px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {project.lead?.avatarUrls?.["24x24"] && (
                            <Image
                              src={project.lead.avatarUrls["24x24"]}
                              width={20}
                              height={20}
                              style={{ borderRadius: "50%", flexShrink: 0 }}
                              alt={project.lead.displayName}
                              unoptimized
                            />
                          )}
                          <span style={{ fontSize: 14, color: "#172B4D" }}>
                            {project.lead?.displayName ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        style={{
                          width: 80,
                          textAlign: "right",
                          padding: "0 8px",
                        }}
                      >
                        <div className="invisible flex justify-end group-hover:visible">
                          <SpaceActionsDropdown
                            projectKey={project.key}
                            projectName={project.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredProjects.length === 0 && !loading && (
              <div style={{ padding: "80px 0", textAlign: "center" }}>
                <p style={{ fontSize: 16, color: "#172B4D" }}>
                  No projects found
                </p>
                <p style={{ fontSize: 14, color: "#6B778C" }}>
                  Create a project to get started.
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-center gap-1">
              <button
                className="rounded p-1.5 text-muted-foreground hover:bg-accent"
                disabled
              >
                <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                </svg>
              </button>
              <button className="flex size-8 items-center justify-center rounded border bg-blue-50 text-sm font-medium text-blue-600 dark:bg-blue-900/20">
                1
              </button>
              <button
                className="rounded p-1.5 text-muted-foreground hover:bg-accent"
                disabled
              >
                <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                  />
                </svg>
              </button>
            </div>
            {/* Close the spaces list conditional */}
          </>
        )}
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="w-72 border-l bg-card p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-semibold">Templates</h2>
            <button
              onClick={() => {
                setShowTemplates(false)
                setSelectedTemplate(null)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="size-5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            Preview a template for your next space
          </p>

          <div className="flex flex-col gap-1">
            {templateList.map((tmpl) => (
              <button
                key={tmpl.name}
                onMouseEnter={() => setSelectedTemplate(tmpl.name)}
                onClick={() => setSelectedTemplate(tmpl.name)}
                className={`flex items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors ${
                  selectedTemplate === tmpl.name
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-accent"
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-md ${tmpl.color}`}
                >
                  <HugeiconsIcon
                    icon={Layers01Icon}
                    className={`size-4 ${tmpl.iconColor}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{tmpl.name}</span>
                    {tmpl.badge && (
                      <span
                        className={`rounded px-1 py-0.5 text-[10px] leading-none font-bold ${
                          tmpl.badge === "PREMIUM"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}
                      >
                        {tmpl.badge}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {tmpl.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Link
            href="/templates"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            More templates
          </Link>
        </div>
      )}

      {/* Create space modal */}
      {createOpen && <CreateSpaceModal onClose={() => setCreateOpen(false)} />}

      {/* Toast */}
      {spaceToast && (
        <div className="fixed top-4 right-4 z-[10000] flex animate-in items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg fade-in slide-in-from-top-2">
          <svg
            className="size-4 shrink-0 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {spaceToast}
        </div>
      )}
    </div>
  )
}
