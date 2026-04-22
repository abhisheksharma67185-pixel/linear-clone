"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const sidebarSections = [
  {
    title: "Site settings",
    items: [
      { id: "access-requests", label: "Access requests" },
      { id: "site-access", label: "Site access" },
      { id: "emoji", label: "Emoji" },
      { id: "connected-apps", label: "Connected apps" },
      { id: "storage", label: "Storage" },
      { id: "audit-log", label: "Audit log" },
    ],
  },
  { title: "Jira Service Management", items: [] },
  { title: "Explore", items: [] },
]

const connectedApps = [
  {
    name: "Atlassian Assist",
    author: "Atlassian",
    icon: "assist",
    connections: 1,
    installedBy: "System",
  },
  {
    name: "Atlassian Home for Jira Cloud",
    author: "Atlassian",
    icon: "home",
    connections: 1,
    installedBy: "System",
  },
  {
    name: "Jira Cloud for Slack",
    author: "Atlassian",
    icon: "slack",
    connections: 1,
    installedBy: "System",
  },
  {
    name: "Automation for Jira",
    author: "Atlassian",
    icon: "automation",
    connections: 1,
    installedBy: "System",
  },
  {
    name: "Jira Cloud for Microsoft Teams",
    author: "Atlassian",
    icon: "teams",
    connections: 1,
    installedBy: "System",
  },
  {
    name: "Jira Cloud for Outlook",
    author: "Atlassian",
    icon: "outlook",
    connections: 1,
    installedBy: "System",
  },
  {
    name: "Jira Service Management Widget",
    author: "Atlassian",
    icon: "jsm",
    connections: 1,
    installedBy: "System",
  },
  {
    name: "Jira Cloud for Spreadsheets",
    author: "Atlassian",
    icon: "sheets",
    connections: 1,
    installedBy: "System",
  },
  {
    name: "Opsgenie",
    author: "Atlassian",
    icon: "opsgenie",
    connections: 1,
    installedBy: "System",
  },
  {
    name: "Statuspage for Jira",
    author: "Atlassian",
    icon: "statuspage",
    connections: 1,
    installedBy: "System",
  },
]

function AppIconCircle({ name }: { name: string }) {
  const colors: Record<string, string> = {
    assist: "bg-blue-500",
    home: "bg-blue-700",
    slack: "bg-blue-600",
    automation: "bg-yellow-500",
    teams: "bg-purple-600",
    outlook: "bg-blue-500",
    jsm: "bg-purple-500",
    sheets: "bg-green-600",
    opsgenie: "bg-purple-500",
    statuspage: "bg-green-500",
  }
  return (
    <div
      className={`flex size-8 items-center justify-center rounded ${colors[name] || "bg-gray-400"}`}
    >
      <svg className="size-4" viewBox="0 0 32 32" fill="white">
        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
      </svg>
    </div>
  )
}

// ── Connected Apps Filter Dropdown ─────────────────────────────────
function FilterSelect({
  label,
  options,
  selected,
  onToggle,
  open,
  onOpenChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm transition-colors ${open ? "border-blue-600 text-blue-600" : selected.length > 0 ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
      >
        {label}{" "}
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-lg border bg-background py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent/50"
                onClick={() => onToggle(opt)}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => {}}
                  className="size-4 rounded border accent-blue-600"
                />
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Page Content Components ────────────────────────────────────────
function AccessRequestsContent() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <svg className="mb-6 size-28" viewBox="0 0 120 120" fill="none">
        <polygon
          points="60,20 90,50 75,50 75,80 45,80 45,50 30,50"
          fill="#84CC16"
        />
        <polygon points="60,20 45,50 75,50" fill="#1E3A5F" />
        <rect x="48" y="55" width="24" height="20" rx="2" fill="#A855F7" />
      </svg>
      <h2 className="mb-3 text-xl font-semibold">
        View your access requests in one place
      </h2>
      <p className="mb-4 max-w-md text-sm text-muted-foreground">
        We&apos;ve moved all access requests to your organization. You&apos;ll
        have better visibility and control of access to your Atlassian apps.
      </p>
      <button className="mb-4 text-sm text-blue-600 hover:underline">
        How to manage access requests
      </button>
      <Link href="/admin/user-requests">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Go to access requests
        </Button>
      </Link>
    </div>
  )
}

function SiteAccessContent() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Site access</h1>
      <div className="flex flex-col items-center py-12 text-center">
        <svg className="mb-6 size-28" viewBox="0 0 120 120" fill="none">
          <polygon
            points="60,15 95,55 80,55 80,85 40,85 40,55 25,55"
            fill="#84CC16"
          />
          <polygon points="60,15 40,55 80,55" fill="#1E3A5F" />
          <rect x="45" y="60" width="30" height="18" rx="3" fill="#A855F7" />
        </svg>
        <h2 className="mb-3 text-xl font-semibold">
          Site access has been moved to your organization
        </h2>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          We&apos;ve moved the site access settings to your organization to
          provide you with better visibility and granular control of who can
          access your Atlassian apps across all sites.
        </p>
        <div className="flex gap-2">
          <Link href="/admin/app-access-settings">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Take me there
            </Button>
          </Link>
          <Button variant="outline">Learn more</Button>
        </div>
      </div>
    </div>
  )
}

function EmojiContent() {
  const [emojiName, setEmojiName] = useState("")
  const [allowCustom, setAllowCustom] = useState(true)
  const [allowPublic, setAllowPublic] = useState(true)
  const [search, setSearch] = useState("")

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Custom emojis</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Custom emojis can be added by your users and will be available to
        everyone on the site.
      </p>

      <h2 className="mb-3 text-lg font-semibold">Upload custom emojis</h2>
      <div className="mb-1">
        <p className="mb-2 text-sm text-muted-foreground">Add your own emoji</p>
        <div className="mb-1 flex items-center gap-2">
          <Input
            placeholder="gauged"
            value={emojiName}
            onChange={(e) => setEmojiName(e.target.value)}
            className="max-w-xs"
          />
          <button className="text-muted-foreground hover:text-foreground">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <Button variant="outline" size="sm">
            Choose file
          </Button>
        </div>
        <p className="mb-6 text-xs text-muted-foreground">
          JPG, PNG or GIF. Max size 1 MB.
        </p>
      </div>

      <div className="mb-2">
        <p className="mb-2 text-sm font-medium">
          Allow people to add custom emojis
        </p>
        <Switch checked={allowCustom} onCheckedChange={setAllowCustom} />
      </div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium">
          Allow custom emojis on publicly shared content
        </p>
        <Switch checked={allowPublic} onCheckedChange={setAllowPublic} />
      </div>

      <h2 className="mb-3 text-lg font-semibold">Manage custom emojis</h2>
      <div className="relative mb-4 max-w-xs">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} />
        <svg
          className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] font-medium">Emoji</TableHead>
              <TableHead className="font-medium">
                Name{" "}
                <svg
                  className="ml-1 inline size-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12l7-7 7 7" />
                </svg>
              </TableHead>
              <TableHead className="font-medium">Added on</TableHead>
              <TableHead className="font-medium">Added by</TableHead>
              <TableHead className="w-[80px] font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="py-16">
                <div className="flex flex-col items-center text-center">
                  <svg
                    className="mb-4 size-20 text-muted-foreground/30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="8" x2="14" y2="14" />
                    <line x1="14" y1="8" x2="8" y2="14" />
                  </svg>
                  <p className="text-sm font-semibold">
                    No custom emojis have been added yet.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ConnectionInfoCell({ appName }: { appName: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative flex items-center gap-1.5 text-sm">
      1 connection
      <button
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-blue-600"
      >
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 z-50 mt-1 w-72 rounded-lg border bg-background p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                <svg className="size-4" viewBox="0 0 32 32" fill="white">
                  <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">Jira Apps</span>
                  <span className="rounded border px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground uppercase">
                    REQUIRED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  https://abhisheksharma67185.atlassian.net
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AppActionsCell({ appName }: { appName: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const hasMenu = [
    "Atlassian Home for Jira Cloud",
    "Jira Cloud for Slack",
    "Automation for Jira",
    "Jira Cloud for Microsoft Teams",
  ].includes(appName)
  return (
    <div className="flex items-center gap-2">
      <button className="text-sm text-blue-600 hover:underline">
        View app details
      </button>
      {hasMenu && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`rounded p-1 text-muted-foreground hover:bg-accent ${menuOpen ? "bg-accent" : ""}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute top-full right-0 z-50 mt-1 w-36 rounded-lg border bg-background py-1 shadow-lg">
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent/50"
                  onClick={() => setMenuOpen(false)}
                >
                  Configure
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ConnectedAppsContent() {
  const [activeTab, setActiveTab] = useState("installed")
  const [searchName, setSearchName] = useState("")
  const [installedByFilter, setInstalledByFilter] = useState<string[]>([])
  const [connectionsFilter, setConnectionsFilter] = useState<string[]>([])
  const [openFilter, setOpenFilter] = useState<string | null>(null)

  const filtered = connectedApps.filter((app) => {
    if (
      searchName &&
      !app.name.toLowerCase().includes(searchName.toLowerCase())
    )
      return false
    if (
      installedByFilter.length > 0 &&
      !installedByFilter.includes(app.installedBy)
    )
      return false
    return true
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Connected apps</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Give feedback
          </button>
          <Button variant="outline">
            Explore apps{" "}
            <svg
              className="ml-1 size-3"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </Button>
        </div>
      </div>
      <p className="mb-1 text-sm text-muted-foreground">
        View apps installed within your site, manage settings for your apps, and
        view additional details for each app.
      </p>
      <button className="mb-4 block text-sm text-blue-600 hover:underline">
        Learn how to build your own app
      </button>

      {/* Tabs */}
      <div className="mb-4 flex gap-4 border-b">
        {["Installed apps", "Requested apps", "Settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
            className={`pb-2.5 text-sm font-medium transition-colors ${activeTab === tab.toLowerCase().replace(" ", "-") ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "installed-apps" && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative max-w-xs">
              <svg
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <Input
                placeholder="Search by name"
                className="pl-9"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <FilterSelect
              label="Installed by"
              options={["Admin", "User", "System"]}
              selected={installedByFilter}
              onToggle={(v) =>
                setInstalledByFilter(
                  installedByFilter.includes(v)
                    ? installedByFilter.filter((x) => x !== v)
                    : [...installedByFilter, v]
                )
              }
              open={openFilter === "installed"}
              onOpenChange={(v) => setOpenFilter(v ? "installed" : null)}
            />
            <FilterSelect
              label="Connections"
              options={["Jira Apps", "Confluence", "Compass"]}
              selected={connectionsFilter}
              onToggle={(v) =>
                setConnectionsFilter(
                  connectionsFilter.includes(v)
                    ? connectionsFilter.filter((x) => x !== v)
                    : [...connectionsFilter, v]
                )
              }
              open={openFilter === "connections"}
              onOpenChange={(v) => setOpenFilter(v ? "connections" : null)}
            />
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">App</TableHead>
                  <TableHead className="w-[80px] font-medium">
                    Edition
                  </TableHead>
                  <TableHead className="w-[100px] font-medium">
                    Installed by
                  </TableHead>
                  <TableHead className="w-[120px] font-medium">
                    Connections
                  </TableHead>
                  <TableHead className="w-[140px] font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((app) => (
                  <TableRow key={app.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AppIconCircle name={app.icon} />
                        <div>
                          <p className="text-sm font-medium">{app.name}</p>
                          <p className="text-xs text-muted-foreground">
                            by {app.author}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">-</TableCell>
                    <TableCell className="text-sm">{app.installedBy}</TableCell>
                    <TableCell>
                      <ConnectionInfoCell appName={app.name} />
                    </TableCell>
                    <TableCell>
                      <AppActionsCell appName={app.name} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {activeTab === "requested-apps" && (
        <div className="py-12 text-center text-sm text-muted-foreground italic">
          No requested apps.
        </div>
      )}
      {activeTab === "settings" && (
        <div className="py-12 text-center text-sm text-muted-foreground italic">
          No settings to configure.
        </div>
      )}
    </div>
  )
}

function StorageContent() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Storage</h1>
      <p className="text-sm text-muted-foreground">
        Storage management for your site.
      </p>
    </div>
  )
}

function AuditLogContent() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Audit log</h1>
      <p className="text-sm text-muted-foreground">
        View audit logs for your site.
      </p>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────
export default function SiteSettingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const params = useParams()
  const [activePage, setActivePage] = useState("access-requests")
  const [siteSettingsOpen, setSiteSettingsOpen] = useState(true)

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-56 shrink-0 overflow-y-auto border-r px-3 py-4">
        <Link
          href="/admin/sites"
          className="mb-4 flex items-center gap-1.5 text-sm hover:text-foreground"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Site settings</span>
        </Link>

        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="flex size-7 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
            <svg className="size-3.5" viewBox="0 0 32 32" fill="white">
              <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">abhisheksharma67185</p>
            <p className="text-xs text-muted-foreground">Site</p>
          </div>
        </div>

        {sidebarSections.map((section) => (
          <div key={section.title} className="mb-2">
            <button
              onClick={() =>
                section.title === "Site settings"
                  ? setSiteSettingsOpen(!siteSettingsOpen)
                  : undefined
              }
              className="flex w-full items-center gap-1 rounded px-1 py-1.5 text-left text-sm font-medium hover:bg-accent/50"
            >
              <svg
                className={`size-3.5 transition-transform ${section.title === "Site settings" && siteSettingsOpen ? "rotate-90" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              {section.title}
            </button>
            {section.title === "Site settings" && siteSettingsOpen && (
              <div className="mt-0.5 ml-2">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors ${activePage === item.id ? "border-l-2 border-blue-600 bg-blue-50 font-medium text-blue-600 dark:bg-blue-950/30" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activePage === "access-requests" && <AccessRequestsContent />}
        {activePage === "site-access" && <SiteAccessContent />}
        {activePage === "emoji" && <EmojiContent />}
        {activePage === "connected-apps" && <ConnectedAppsContent />}
        {activePage === "storage" && <StorageContent />}
        {activePage === "audit-log" && <AuditLogContent />}
      </div>
    </div>
  )
}
