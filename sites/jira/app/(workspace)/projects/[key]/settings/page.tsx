"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Project, User } from "@/app/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Tab =
  | "details"
  | "access"
  | "notifications"
  | "features"
  | "board"
  | "automation"
  | "apps"

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "details",
    label: "Details",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  {
    key: "access",
    label: "Access",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    key: "features",
    label: "Features",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    key: "board",
    label: "Board",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="18" rx="1" />
        <rect x="14" y="3" width="7" height="12" rx="1" />
      </svg>
    ),
  },
  {
    key: "automation",
    label: "Automation",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    key: "apps",
    label: "Apps",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
]

export default function ProjectSettingsPage() {
  const params = useParams<{ key: string }>()
  const projectKey = params.key

  const [project, setProject] = useState<Project | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("details")

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [lead, setLead] = useState("")
  const [type, setType] = useState<"scrum" | "kanban">("scrum")

  useEffect(() => {
    Promise.all([
      fetch(`/api/data/projects/${projectKey}`).then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([p, u]) => {
      setProject(p)
      setUsers(u)
      setName(p.name ?? "")
      setDescription(p.description ?? "")
      setLead(p.lead ?? "")
      setType(p.type ?? "scrum")
      setLoading(false)
    })
  }, [projectKey])

  const handleSave = async () => {
    if (!project) return
    setSaving(true)
    setSaved(false)
    await fetch(`/api/data/projects/${projectKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, lead, type }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!project || project.error) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Project not found.
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 overflow-y-auto border-r p-4">
        <div className="mb-4">
          <Link
            href={`/projects/${projectKey}/board`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            &larr; Back to project
          </Link>
        </div>
        <div className="mb-5 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
            <svg
              className="size-4 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
          <div>
            <p className="text-sm leading-none font-medium">{project.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {type === "scrum" ? "Scrum" : "Kanban"} project
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <span
                className={
                  activeTab === tab.key
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                }
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ── Details tab ── */}
        {activeTab === "details" && (
          <div className="max-w-xl">
            <h2 className="mb-1 text-lg font-semibold">Details</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Manage project name, description, lead, and type.
            </p>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Key</Label>
                <Input
                  value={projectKey}
                  disabled
                  className="bg-muted/50 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Project Lead</Label>
                <Select value={lead} onValueChange={(v) => v && setLead(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem
                        key={u.id}
                        value={u.id}
                        label={u.displayName ?? u.name}
                      >
                        {u.displayName ?? u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Project Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => v && setType(v as "scrum" | "kanban")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scrum">Scrum</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                {saved && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Saved
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Access tab ── */}
        {activeTab === "access" && (
          <div className="max-w-xl">
            <h2 className="mb-1 text-lg font-semibold">Access</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Manage who can view and edit this project.
            </p>

            <div className="mb-6 rounded-lg border">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h3 className="text-sm font-medium">Project access</h3>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Open project</p>
                    <p className="text-xs text-muted-foreground">
                      Anyone in the organization can view
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Allow external sharing
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Share with people outside the organization
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                <h3 className="text-sm font-medium">Members</h3>
                <Button size="sm" variant="outline">
                  Add people
                </Button>
              </div>
              <div className="divide-y">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar className="size-7">
                      <AvatarFallback className="bg-blue-100 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {(u.displayName ?? u.name).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {u.displayName ?? u.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {u.id === lead ? "Lead" : u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Notifications tab ── */}
        {activeTab === "notifications" && (
          <div className="max-w-xl">
            <h2 className="mb-1 text-lg font-semibold">Notifications</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Configure notification preferences for this project.
            </p>

            <div className="rounded-lg border">
              <div className="divide-y">
                {[
                  {
                    label: "Issue created",
                    desc: "When a new issue is created in this project",
                  },
                  {
                    label: "Issue assigned",
                    desc: "When an issue is assigned to you",
                  },
                  {
                    label: "Issue updated",
                    desc: "When an issue you're watching is updated",
                  },
                  {
                    label: "Comment added",
                    desc: "When someone comments on an issue you're watching",
                  },
                  { label: "Sprint started", desc: "When a sprint is started" },
                  {
                    label: "Sprint completed",
                    desc: "When a sprint is completed",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Features tab ── */}
        {activeTab === "features" && (
          <div className="max-w-xl">
            <h2 className="mb-1 text-lg font-semibold">Features</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Enable or disable project features.
            </p>

            <div className="rounded-lg border">
              <div className="divide-y">
                {[
                  {
                    label: "Board",
                    desc: "Visualize and manage work on a board",
                    enabled: true,
                  },
                  {
                    label: "Backlog",
                    desc: "Plan and prioritize work in a backlog",
                    enabled: true,
                  },
                  {
                    label: "Sprints",
                    desc: "Organize work into time-boxed iterations",
                    enabled: type === "scrum",
                  },
                  {
                    label: "Reports",
                    desc: "Track progress with charts and reports",
                    enabled: true,
                  },
                  {
                    label: "Epics",
                    desc: "Group related stories and tasks into epics",
                    enabled: true,
                  },
                  {
                    label: "Story points",
                    desc: "Estimate effort using story points",
                    enabled: true,
                  },
                  {
                    label: "Time tracking",
                    desc: "Log and track time spent on issues",
                    enabled: false,
                  },
                  {
                    label: "Roadmap",
                    desc: "Plan long-term with a visual roadmap",
                    enabled: false,
                  },
                ].map((feat) => (
                  <div
                    key={feat.label}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{feat.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {feat.desc}
                      </p>
                    </div>
                    <Switch defaultChecked={feat.enabled} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Board tab ── */}
        {activeTab === "board" && (
          <div className="max-w-xl">
            <h2 className="mb-1 text-lg font-semibold">Board</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Configure board columns and card layout.
            </p>

            <div className="mb-6 rounded-lg border">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h3 className="text-sm font-medium">Columns</h3>
              </div>
              <div className="space-y-2 p-4">
                {["TO DO", "IN PROGRESS", "IN REVIEW", "DONE"].map((col, i) => (
                  <div
                    key={col}
                    className="flex items-center gap-3 rounded-md border px-3 py-2"
                  >
                    <svg
                      className="size-4 cursor-grab text-muted-foreground"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M3 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                    </svg>
                    <span className="flex-1 text-sm font-medium">{col}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Column {i + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="border-b bg-muted/30 px-4 py-3">
                <h3 className="text-sm font-medium">Card layout</h3>
              </div>
              <div className="space-y-3 p-4">
                {[
                  { label: "Show assignee avatar", enabled: true },
                  { label: "Show priority icon", enabled: true },
                  { label: "Show story points", enabled: true },
                  { label: "Show epic label", enabled: true },
                  { label: "Show issue type icon", enabled: true },
                ].map((opt) => (
                  <div
                    key={opt.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{opt.label}</span>
                    <Switch defaultChecked={opt.enabled} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Automation tab ── */}
        {activeTab === "automation" && (
          <div className="max-w-xl">
            <h2 className="mb-1 text-lg font-semibold">Automation</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Set up rules to automate repetitive tasks.
            </p>

            <div className="mb-4 rounded-lg border">
              <div className="divide-y">
                {[
                  {
                    name: "Auto-assign on transition",
                    desc: "Assign to reporter when moved to In Review",
                    enabled: true,
                  },
                  {
                    name: "Close stale issues",
                    desc: "Auto-close issues with no activity for 30 days",
                    enabled: false,
                  },
                  {
                    name: "Notify on high priority",
                    desc: "Send Slack message when a Highest priority issue is created",
                    enabled: true,
                  },
                ].map((rule) => (
                  <div
                    key={rule.name}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{rule.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {rule.desc}
                      </p>
                    </div>
                    <Switch defaultChecked={rule.enabled} />
                  </div>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm">
              <svg
                className="mr-1.5 size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create rule
            </Button>
          </div>
        )}

        {/* ── Apps tab ── */}
        {activeTab === "apps" && (
          <div className="max-w-xl">
            <h2 className="mb-1 text-lg font-semibold">Apps</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Manage app integrations for this project.
            </p>

            <div className="mb-4 rounded-lg border">
              <div className="divide-y">
                {[
                  {
                    name: "Slack",
                    desc: "Send notifications to Slack channels",
                    icon: "#",
                  },
                  {
                    name: "GitHub",
                    desc: "Link commits and pull requests",
                    icon: "GH",
                  },
                  {
                    name: "Figma",
                    desc: "Embed Figma designs in issues",
                    icon: "F",
                  },
                ].map((app) => (
                  <div
                    key={app.name}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                      {app.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{app.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.desc}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/apps"
              className="text-sm text-blue-600 hover:underline"
            >
              Browse marketplace apps
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
