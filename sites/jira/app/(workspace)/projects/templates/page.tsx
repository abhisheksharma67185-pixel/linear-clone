"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Layers01Icon } from "@hugeicons/core-free-icons"

const allTemplates = [
  {
    name: "Scrum",
    description:
      "Sprint toward your project goals with a board, backlog, and timeline.",
    category: "Software development",
    color: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    name: "Work requests",
    description:
      "Set up a service desk to manage and track incoming work requests from your team.",
    category: "Service management",
    badge: "TRY",
    color: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  {
    name: "IT service",
    description:
      "Manage IT service requests, incidents, problems, and changes with an ITIL-ready project.",
    category: "Service management",
    badge: "TRY",
    color: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
  {
    name: "Kanban",
    description:
      "Visualize and advance your project forward using issues on a powerful board.",
    category: "Software development",
    color: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600",
    borderColor: "border-teal-200",
  },
  {
    name: "Personal tasks",
    description:
      "Track your personal tasks and to-dos in a simple, focused project just for you.",
    category: "Personal",
    color: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600",
    borderColor: "border-orange-200",
  },
  {
    name: "Business project",
    description:
      "Manage activities like budgets, goals, and tasks with a calendar and list view.",
    category: "Business",
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200",
  },
  {
    name: "Top-level planning",
    description:
      "Plan, track, and manage work across multiple teams and projects from a single view.",
    category: "Planning",
    badge: "PREMIUM",
    color: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
  },
  {
    name: "Bug tracking",
    description:
      "Track and manage bugs with a streamlined workflow and prioritization.",
    category: "Software development",
    color: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600",
    borderColor: "border-red-200",
  },
  {
    name: "Content management",
    description:
      "Plan, create, and manage your content calendar and editorial workflow.",
    category: "Marketing",
    color: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-200",
  },
  {
    name: "Recruitment",
    description:
      "Manage your hiring pipeline from sourcing to offer with a structured workflow.",
    category: "Human resources",
    color: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200",
  },
  {
    name: "Go-to-market",
    description:
      "Coordinate your product launch across marketing, sales, and engineering teams.",
    category: "Marketing",
    color: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600",
    borderColor: "border-cyan-200",
  },
  {
    name: "Design project",
    description: "Manage design requests, feedback cycles, and asset delivery.",
    category: "Design",
    color: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600",
    borderColor: "border-violet-200",
  },
  {
    name: "Product launch",
    description:
      "Plan and execute your product launch with cross-functional coordination.",
    category: "Product management",
    color: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600",
    borderColor: "border-rose-200",
  },
  {
    name: "Sprint retrospective",
    description:
      "Run effective retrospectives to continuously improve your team processes.",
    category: "Software development",
    color: "bg-sky-100 dark:bg-sky-900/30",
    iconColor: "text-sky-600",
    borderColor: "border-sky-200",
  },
  {
    name: "DevOps",
    description:
      "Streamline your CI/CD pipeline, deployments, and infrastructure management.",
    category: "Software development",
    badge: "TRY",
    color: "bg-lime-100 dark:bg-lime-900/30",
    iconColor: "text-lime-600",
    borderColor: "border-lime-200",
  },
]

const categories = [...new Set(allTemplates.map((t) => t.category))]

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedName, setSelectedName] = useState("")
  const [newSpaceName, setNewSpaceName] = useState("")
  const [newSpaceKey, setNewSpaceKey] = useState("")

  const filtered = allTemplates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !activeCategory || t.category === activeCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-2">
        <Link
          href="/projects"
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
            />
          </svg>
          Back to Spaces
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a template to get started quickly with a pre-configured
          project.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mt-6 flex items-center gap-4">
        <div className="relative w-[300px]">
          <svg
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
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
          <Input
            placeholder="Search templates"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              !activeCategory
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tmpl) => (
          <button
            key={tmpl.name}
            onClick={() => {
              setSelectedName(tmpl.name)
              setCreateOpen(true)
            }}
            className={`group rounded-lg border ${tmpl.borderColor} bg-card p-5 text-left transition-all hover:border-blue-400 hover:shadow-md`}
          >
            <div className="mb-3 flex items-start gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-md ${tmpl.color}`}
              >
                <HugeiconsIcon
                  icon={Layers01Icon}
                  className={`size-5 ${tmpl.iconColor}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {tmpl.name}
                  </span>
                  {tmpl.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-bold ${
                        tmpl.badge === "PREMIUM"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      }`}
                    >
                      {tmpl.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {tmpl.category}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tmpl.description}
            </p>
            <div className="mt-3 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-sm font-medium text-blue-600">
                Use template →
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No templates match your search.
          </p>
        </div>
      )}

      {/* Create space from template dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create space from template</DialogTitle>
            <DialogDescription>
              Using the <strong>{selectedName}</strong> template. Enter a name
              for your new space.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" htmlFor="tpl-space-name">
                Space name <span className="text-red-500">*</span>
              </label>
              <Input
                id="tpl-space-name"
                value={newSpaceName}
                onChange={(e) => {
                  setNewSpaceName(e.target.value)
                  setNewSpaceKey(
                    e.target.value
                      .replace(/[^a-zA-Z]/g, "")
                      .toUpperCase()
                      .slice(0, 5)
                  )
                }}
                placeholder="e.g. Marketing"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" htmlFor="tpl-space-key">
                Key
              </label>
              <Input
                id="tpl-space-key"
                value={newSpaceKey}
                onChange={(e) => setNewSpaceKey(e.target.value.toUpperCase())}
                placeholder="e.g. MARK"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false)
                setNewSpaceName("")
                setNewSpaceKey("")
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!newSpaceName.trim()}
              onClick={() => {
                setCreateOpen(false)
                setNewSpaceName("")
                setNewSpaceKey("")
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
