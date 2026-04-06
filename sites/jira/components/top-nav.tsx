"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import type { Project, User, Sprint, Epic } from "@/app/lib/mock-data"

// ─── Settings Dropdown ──────────────────────────────────────────────────────

function SettingsDropdown() {
  return (
    <Popover>
      <PopoverTrigger
        className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-[420px] p-0">
        <div className="p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Personal Jira settings</h3>
            <span className="flex items-center gap-1 rounded border px-2 py-1 text-xs text-muted-foreground">
              Search (
              <kbd className="font-mono text-[10px]">⌘</kbd>
              <span className="text-[10px]">+</span>
              <kbd className="font-mono text-[10px]">K</kbd>
              )
            </span>
          </div>

          {/* Personal Settings */}
          <div className="flex flex-col gap-0.5">
            <SettingsItem
              icon={<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>}
              title="General settings"
              description="Manage language, time zone, and other personal preferences"
            />
            <SettingsItem
              icon={<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>}
              title="Notification settings"
              description="Manage email and in-app notifications from Jira"
            />
          </div>

          {/* Jira Admin Settings */}
          <p className="mt-5 mb-2 text-[11px] font-semibold text-muted-foreground">Jira admin settings</p>
          <div className="flex flex-col gap-0.5">
            <SettingsItem
              icon={<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 9h6M9 13h6M9 17h4" /></svg>}
              title="System"
              description="Manage general configuration, security, automation, user interface, and more"
            />
            <SettingsItem
              icon={<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
              title="Jira apps"
              description="Manage access, settings, and integrations across Jira"
            />
            <SettingsItem
              icon={<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>}
              title="Spaces"
              description="Manage space settings, categories, and more"
            />
            <SettingsItem
              icon={<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>}
              title="Work items"
              description="Configure work types, workflows, screens, fields, and more"
            />
            <SettingsItem
              icon={<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>}
              title="Marketplace apps"
              description="Add and manage Jira Marketplace apps and integrations"
            />
          </div>

          {/* Atlassian Admin Settings */}
          <p className="mt-5 mb-2 text-[11px] font-semibold text-muted-foreground">Atlassian admin settings</p>
          <div className="flex flex-col gap-0.5">
            <SettingsItem
              icon={<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
              title="User management"
              description="Manage users, groups, and access requests"
              external
            />
            <SettingsItem
              icon={<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>}
              title="Billing"
              description="Update your billing details, manage subscriptions, and more"
              external
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SettingsItem({
  icon,
  title,
  description,
  external,
}: {
  icon: React.ReactNode
  title: string
  description: string
  external?: boolean
}) {
  return (
    <button className="flex items-start gap-3 rounded-md px-2 py-2.5 text-left hover:bg-accent transition-colors w-full">
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
    </button>
  )
}

// ─── Notifications Panel ────────────────────────────────────────────────────

function NotificationsPanel() {
  const [activeTab, setActiveTab] = useState<"direct" | "watching">("direct")

  return (
    <Popover>
      <PopoverTrigger
        className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" sideOffset={8} className="w-[460px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Only show unread
              <Switch size="sm" />
            </label>
            <button className="text-muted-foreground hover:text-foreground">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
            <button className="text-muted-foreground hover:text-foreground">
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b px-5">
          <button
            onClick={() => setActiveTab("direct")}
            className={`pb-2.5 text-sm font-medium transition-colors ${
              activeTab === "direct"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setActiveTab("watching")}
            className={`pb-2.5 text-sm font-medium transition-colors ${
              activeTab === "watching"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Watching
          </button>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center px-8 py-12">
          {/* Blue flag illustration */}
          <svg className="mb-4 size-28" viewBox="0 0 120 120" fill="none">
            <rect x="25" y="20" width="70" height="55" rx="4" fill="#4C9AFF" />
            <rect x="30" y="25" width="60" height="45" rx="2" fill="#2684FF" />
            <path d="M30 25h60v10H30z" fill="#0052CC" />
            <rect x="38" y="42" width="20" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="38" y="50" width="35" height="3" rx="1.5" fill="white" opacity="0.4" />
            <rect x="38" y="58" width="15" height="3" rx="1.5" fill="white" opacity="0.3" />
            <line x1="22" y1="18" x2="22" y2="95" stroke="#0052CC" strokeWidth="3" strokeLinecap="round" />
            <circle cx="95" cy="15" r="6" fill="#FFAB00" />
          </svg>
          <p className="text-sm text-muted-foreground text-center">
            You have no notifications from<br />the last 30 days.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="mx-0.5 rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↓</kbd>{" "}
            <kbd className="mx-0.5 rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">↑</kbd>{" "}
            to move through notifications.
          </p>
          <button className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors">
            See all shortcuts
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Help Panel ─────────────────────────────────────────────────────────────

function HelpPanel() {
  const [open, setOpen] = useState(false)

  const helpLinks = [
    { label: "Find out what's changed in Jira", external: true, icon: "lightbulb" },
    { label: "Read about the new navigation", external: true, icon: "doc" },
    { label: "Browse complete documentation", external: true, icon: "file" },
    { label: "Build skills with Atlassian Learning", external: true, icon: "graduation" },
    { label: "Ask our Community forums", external: true, icon: "chat" },
    { label: "Contact support", external: true, icon: "warning" },
    { label: "Give feedback about Jira", external: false, icon: "feedback" },
    { label: "Keyboard shortcuts", external: false, icon: "keyboard" },
    { label: "Get Jira Mobile", external: true, icon: "mobile" },
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
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    keyboard: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <line x1="6" y1="10" x2="6" y2="10" />
        <line x1="10" y1="10" x2="10" y2="10" />
        <line x1="14" y1="10" x2="14" y2="10" />
        <line x1="18" y1="10" x2="18" y2="10" />
        <line x1="8" y1="14" x2="16" y2="14" />
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
        className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
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
              {helpLinks.map((link) => (
                <button
                  key={link.label}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors w-full"
                >
                  <span className="text-muted-foreground shrink-0">
                    {iconMap[link.icon]}
                  </span>
                  <span className="flex-1">{link.label}</span>
                  {link.external && (
                    <svg className="size-3.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-5 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <button className="hover:text-foreground hover:underline">About Jira</button>
              <button className="hover:text-foreground hover:underline">Terms of use</button>
              <button className="hover:text-foreground hover:underline">Privacy policy</button>
              <button className="hover:text-foreground hover:underline">Notice at collection</button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

// ─── Create Issue Dialog ────────────────────────────────────────────────────

function CreateIssueDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [saving, setSaving] = useState(false)

  // Form state
  const [projectId, setProjectId] = useState("")
  const [issueType, setIssueType] = useState("task")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [assigneeId, setAssigneeId] = useState("__none__")
  const [sprintId, setSprintId] = useState("__none__")
  const [epicId, setEpicId] = useState("__none__")
  const [storyPoints, setStoryPoints] = useState("")

  useEffect(() => {
    if (!open) return
    Promise.all([
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/sprints").then((r) => r.json()),
      fetch("/api/data/epics").then((r) => r.json()),
    ]).then(([p, u, s, e]) => {
      setProjects(p)
      setUsers(u)
      setSprints(s)
      setEpics(e)
      if (p.length > 0 && !projectId) setProjectId(p[0].id)
    })
  }, [open, projectId])

  const resetForm = () => {
    setSummary("")
    setDescription("")
    setIssueType("task")
    setPriority("medium")
    setAssigneeId("__none__")
    setSprintId("__none__")
    setEpicId("__none__")
    setStoryPoints("")
  }

  const handleCreate = async () => {
    if (!summary.trim()) return
    setSaving(true)
    const res = await fetch("/api/data/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: summary.trim(),
        description,
        type: issueType,
        priority,
        projectId: projectId || undefined,
        assigneeId: assigneeId === "__none__" ? null : assigneeId,
        reporterId: "usr-1",
        sprintId: sprintId === "__none__" ? null : sprintId,
        epicId: epicId === "__none__" ? null : epicId,
        storyPoints: storyPoints ? Number(storyPoints) : null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      const issue = await res.json()
      resetForm()
      setOpen(false)
      router.push(`/issue/${issue.key}`)
    }
  }

  return (
    <>
      <Button
        size="sm"
        className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={Add01Icon} className="size-4" />
        Create
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Create issue</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Project */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Project <span className="text-red-500">*</span></Label>
              <Select value={projectId} onValueChange={(v) => v && setProjectId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.key})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Issue Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Issue type <span className="text-red-500">*</span></Label>
              <Select value={issueType} onValueChange={(v) => v && setIssueType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="subtask">Sub-task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Summary <span className="text-red-500">*</span></Label>
              <Input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            {/* Two-column row: Priority + Assignee */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Priority</Label>
                <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highest">Highest</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="lowest">Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Assignee</Label>
                <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Two-column row: Sprint + Epic */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Sprint</Label>
                <Select value={sprintId} onValueChange={(v) => v && setSprintId(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Sprint</SelectItem>
                    {sprints.filter((s) => s.state !== "closed").map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Epic</Label>
                <Select value={epicId} onValueChange={(v) => v && setEpicId(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Epic</SelectItem>
                    {epics.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Story Points */}
            <div className="space-y-1.5 w-1/2">
              <Label className="text-xs font-medium">Story Points</Label>
              <Input
                type="number"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleCreate}
              disabled={!summary.trim() || saving}
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Top Nav ────────────────────────────────────────────────────────────────

export function TopNav() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      {/* Left - Search */}
      <div className="relative w-full max-w-md">
        <svg
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <Input placeholder="Search" className="h-9 pl-9 bg-muted/50" />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Create Issue */}
        <CreateIssueDialog />

        <span className="ml-1 rounded border px-2 py-0.5 text-[11px] font-medium text-blue-600">
          Premium trial
        </span>

        {/* Notifications */}
        <NotificationsPanel />

        {/* Help */}
        <HelpPanel />

        {/* Settings */}
        <SettingsDropdown />

        {/* User Avatar */}
        <Avatar className="size-8 cursor-pointer">
          <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
            AS
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
