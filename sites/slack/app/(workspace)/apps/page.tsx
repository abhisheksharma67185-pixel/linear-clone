"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Boxes,
  Calendar,
  Cloud,
  Code2,
  FileText,
  GitMerge,
  Globe2,
  HelpCircle,
  Mic,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UserAvatar } from "@/components/user-avatar"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Curated app catalog. Apps are static metadata; install state lives on the
// per-session preferences slot (preferences.installedAppIds: string[]) so
// it resets between rollouts via /api/sim/reset.
// ---------------------------------------------------------------------------

type AppCategory =
  | "Productivity"
  | "Developer"
  | "Communication"
  | "AI"
  | "Automation"

type AppEntry = {
  id: string
  name: string
  description: string
  category: AppCategory
  icon: LucideIcon
  iconBg: string
}

const CATALOG: AppEntry[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "See your day at a glance and respond to invites in Slack.",
    category: "Productivity",
    icon: Calendar,
    iconBg: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "github",
    name: "GitHub",
    description: "PR notifications, code reviews, and issue triage.",
    category: "Developer",
    icon: Code2,
    iconBg:
      "bg-zinc-700/10 text-zinc-700 dark:bg-zinc-200/10 dark:text-zinc-200",
  },
  {
    id: "jira",
    name: "Jira Cloud",
    description: "Create and track Jira issues without leaving Slack.",
    category: "Developer",
    icon: GitMerge,
    iconBg: "bg-blue-700/10 text-blue-700",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Start a Zoom meeting from any channel with /zoom.",
    category: "Communication",
    icon: Video,
    iconBg: "bg-sky-500/10 text-sky-500",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Share docs and sheets with channel previews.",
    category: "Productivity",
    icon: Cloud,
    iconBg: "bg-yellow-500/10 text-yellow-600",
  },
  {
    id: "loom",
    name: "Loom",
    description: "Record and share video messages directly in Slack.",
    category: "Communication",
    icon: Mic,
    iconBg: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "polly",
    name: "Polly",
    description: "Run polls, surveys, and async standups in any channel.",
    category: "Productivity",
    icon: HelpCircle,
    iconBg: "bg-orange-500/10 text-orange-500",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Pull issues into messages and create new ones with /linear.",
    category: "Developer",
    icon: Code2,
    iconBg: "bg-indigo-500/10 text-indigo-500",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Unfurl Notion pages inline and share docs in channels.",
    category: "Productivity",
    icon: FileText,
    iconBg: "bg-zinc-500/10 text-zinc-500",
  },
  {
    id: "claude",
    name: "Claude",
    description: "Summarize threads, draft replies, and ask anything.",
    category: "AI",
    icon: Sparkles,
    iconBg: "bg-fuchsia-500/10 text-fuchsia-500",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automate workflows across thousands of apps.",
    category: "Automation",
    icon: Zap,
    iconBg: "bg-amber-500/10 text-amber-500",
  },
  {
    id: "webhook",
    name: "Incoming Webhooks",
    description: "Post messages from external services into Slack.",
    category: "Developer",
    icon: Globe2,
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
]

const CATEGORIES: ("All" | AppCategory)[] = [
  "All",
  "Productivity",
  "Developer",
  "Communication",
  "AI",
  "Automation",
]

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
  isBot?: boolean
  title?: string
}

export default function AppsPage() {
  const [installedIds, setInstalledIds] = useState<string[]>([])
  const [bots, setBots] = useState<User[]>([])
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All")
  const [tab, setTab] = useState<"installed" | "browse">("installed")

  useEffect(() => {
    fetch("/api/data/preferences")
      .then((r) => r.json())
      .then((p) =>
        setInstalledIds(
          Array.isArray(p?.installedAppIds)
            ? (p.installedAppIds as string[])
            : []
        )
      )
      .catch(() => {})
    fetch("/api/data/users")
      .then((r) => r.json())
      .then((u: User[]) => setBots(u.filter((x) => x.isBot)))
      .catch(() => {})
  }, [])

  const installedSet = useMemo(() => new Set(installedIds), [installedIds])

  const persistInstalled = async (ids: string[]) => {
    setInstalledIds(ids)
    await fetch("/api/data/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installedAppIds: ids }),
    })
  }

  const install = async (id: string) => {
    if (installedSet.has(id)) return
    const next = [...installedIds, id]
    await persistInstalled(next)
    const app = CATALOG.find((a) => a.id === id)
    toast.success(`${app?.name ?? id} added`)
  }

  const uninstall = async (id: string) => {
    const next = installedIds.filter((x) => x !== id)
    await persistInstalled(next)
    const app = CATALOG.find((a) => a.id === id)
    toast.success(`${app?.name ?? id} removed`)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CATALOG.filter((a) => {
      if (category !== "All" && a.category !== category) return false
      if (!q) return true
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      )
    })
  }, [query, category])

  const installed = filtered.filter((a) => installedSet.has(a.id))
  const available = filtered.filter((a) => !installedSet.has(a.id))

  const totalInstalled = installedIds.length + bots.length

  return (
    <>
      <SimplePageHeader
        title="Apps"
        subtitle={`${totalInstalled} ${totalInstalled === 1 ? "app" : "apps"} in this workspace`}
      />
      <div className="flex flex-col gap-4 p-4">
        {/* Search + filter */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps"
              className="h-9 pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "ghost"}
                onClick={() => setCategory(c)}
                className="h-7 rounded-full px-2.5 text-xs"
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "installed" | "browse")}
        >
          <TabsList>
            <TabsTrigger value="installed">
              Installed
              <Badge variant="secondary" className="ml-2">
                {installed.length + bots.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="browse">
              Browse
              <Badge variant="secondary" className="ml-2">
                {available.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="mt-4 space-y-6">
            {/* Bot users (workspace bots like Slackbot) */}
            {bots.length > 0 ? (
              <section>
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Workspace bots
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {bots.map((bot) => (
                    <div
                      key={bot.id}
                      className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
                    >
                      <UserAvatar
                        name={bot.name}
                        src={bot.avatar}
                        presence={bot.presence}
                        size="md"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-bold">{bot.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {bot.title ?? "Workspace bot"}
                        </span>
                      </div>
                      <Badge variant="secondary">Built-in</Badge>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Installed apps
              </h3>
              {installed.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No apps installed yet.{" "}
                  <button
                    type="button"
                    onClick={() => setTab("browse")}
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Browse the directory
                  </button>{" "}
                  to add one.
                </div>
              ) : (
                <AppGrid
                  apps={installed}
                  action={(a) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => uninstall(a.id)}
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  )}
                />
              )}
            </section>
          </TabsContent>

          <TabsContent value="browse" className="mt-4">
            {available.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {query
                  ? `No apps match "${query}"`
                  : "Every app in this category is already installed."}
              </div>
            ) : (
              <AppGrid
                apps={available}
                action={(a) => (
                  <Button size="sm" onClick={() => install(a.id)}>
                    <Plus className="size-3.5" />
                    Add
                  </Button>
                )}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

function AppGrid({
  apps,
  action,
}: {
  apps: AppEntry[]
  action: (a: AppEntry) => React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {apps.map((a) => {
        const Icon = a.icon
        return (
          <div
            key={a.id}
            className="flex flex-col gap-3 rounded-md border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex size-10 items-center justify-center rounded-md ${a.iconBg}`}
              >
                <Icon className="size-5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-bold">{a.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {a.category}
                </span>
              </div>
              <Boxes className="size-4 text-muted-foreground" />
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {a.description}
            </p>
            <div className="mt-auto flex items-center justify-end">
              {action(a)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
