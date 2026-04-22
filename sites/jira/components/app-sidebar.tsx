"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Layers01Icon, Add01Icon } from "@hugeicons/core-free-icons"
import { AppSwitcher } from "@/components/app-switcher"

// ─── Shared Icons ───────────────────────────────────────────────────────────

const ChevronRightIcon = (
  <svg className="ml-auto size-3.5" viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
    />
  </svg>
)

const ThreeDotsIcon = (
  <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
  </svg>
)

const ExternalLinkIcon = (
  <svg
    className="ml-auto size-3.5 text-muted-foreground"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const ListIcon = (
  <svg
    className="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

// ─── Recent Dropdown ─────────────────────────────────────────────────────────
function RecentDropdown() {
  const [search, setSearch] = useState("")

  return (
    <Popover>
      <PopoverTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>Recent</span>
        {ChevronRightIcon}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Recent</h3>
          <div className="relative mb-3">
            <svg
              className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              placeholder="Search recent items"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg
                  className="size-3.5"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            )}
          </div>
          <p className="mb-2 text-[11px] font-semibold text-muted-foreground uppercase">
            Today
          </p>
          <div className="flex flex-col gap-0.5">
            <Link
              href="/projects/SCRUM/board"
              className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
            >
              <div className="flex size-7 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                <HugeiconsIcon
                  icon={Layers01Icon}
                  className="size-4 text-blue-600"
                />
              </div>
              <div>
                <p className="text-sm font-medium">My Scrum Project</p>
                <p className="text-xs text-muted-foreground">
                  Your first project &bull; 8 minutes ago
                </p>
              </div>
            </Link>
            <Link
              href="/projects/SCRUM/board"
              className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
            >
              <div className="flex size-7 items-center justify-center rounded bg-muted">
                <svg
                  className="size-4 text-muted-foreground"
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
              </div>
              <div>
                <p className="text-sm font-medium">SCRUM board</p>
                <p className="text-xs text-muted-foreground">8 minutes ago</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="border-t px-4 py-3">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {ListIcon}
            View all recent items
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Starred Dropdown ────────────────────────────────────────────────────────
function StarredDropdown() {
  return (
    <Popover>
      <PopoverTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span>Starred</span>
        {ChevronRightIcon}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="p-4">
          <h3 className="mb-6 text-sm font-semibold">Starred</h3>
          <div className="flex flex-col items-center px-4 pb-4 text-center">
            <svg
              className="size-20 text-amber-400"
              viewBox="0 0 80 80"
              fill="none"
            >
              <circle cx="40" cy="45" r="20" fill="#FCD34D" opacity="0.3" />
              <polygon
                points="40,15 46,32 64,32 50,42 55,58 40,48 25,58 30,42 16,32 34,32"
                fill="#FBBF24"
                stroke="#F59E0B"
                strokeWidth="1"
              />
              <circle cx="25" cy="20" r="3" fill="#93C5FD" />
              <circle cx="58" cy="22" r="2" fill="#93C5FD" />
              <circle cx="62" cy="35" r="2.5" fill="#93C5FD" />
            </svg>
            <p className="mb-1 text-sm font-semibold">
              You haven&apos;t starred anything yet
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Mark items that are important to you with a star to quickly access
              them. You&apos;ll see those items here.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── More Spaces Popover ────────────────────────────────────────────────────
function MoreSpacesPopover() {
  const [search, setSearch] = useState("")

  return (
    <Popover>
      <PopoverTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <svg
          className="size-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
        <span className="text-sm text-muted-foreground">More spaces</span>
        {ChevronRightIcon}
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-72 p-0"
        sideOffset={4}
      >
        <div className="p-3">
          <div className="relative mb-2">
            <svg
              className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              placeholder="Search all spaces"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
          >
            {ListIcon}
            View all spaces
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Customize Sidebar Dialog ───────────────────────────────────────────────

function CustomizeSidebarDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const jiraNavItems = [
    { name: "For you", icon: "compass", alwaysOn: true, defaultChecked: true },
    { name: "Filters", icon: "filter", alwaysOn: false, defaultChecked: false },
    {
      name: "Dashboards",
      icon: "dashboard",
      alwaysOn: false,
      defaultChecked: false,
    },
    { name: "Recent", icon: "clock", alwaysOn: false, defaultChecked: true },
    { name: "Starred", icon: "star", alwaysOn: false, defaultChecked: true },
    { name: "Apps", icon: "grid", alwaysOn: false, defaultChecked: true },
    { name: "Plans", icon: "book", alwaysOn: false, defaultChecked: true },
    { name: "Spaces", icon: "globe", alwaysOn: false, defaultChecked: true },
  ]

  const appShortcuts = [
    { name: "Goals", icon: "target", defaultChecked: false },
    { name: "Teams", icon: "users", defaultChecked: true },
    { name: "Projects", icon: "folder", defaultChecked: false },
  ]

  const [jiraChecked, setJiraChecked] = useState(
    jiraNavItems.map((item) => item.defaultChecked)
  )
  const [appChecked, setAppChecked] = useState(
    appShortcuts.map((item) => item.defaultChecked)
  )

  const navIconMap: Record<string, React.ReactNode> = {
    compass: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    filter: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
    ),
    dashboard: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
    clock: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    star: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    grid: (
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
    book: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    globe: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    target: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    users: (
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
    folder: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  }

  const DragHandle = () => (
    <svg
      className="size-4 cursor-grab text-muted-foreground/50"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M5 3h2v2H5zm4 0h2v2H9zM5 7h2v2H5zm4 0h2v2H9zM5 11h2v2H5zm4 0h2v2H9z" />
    </svg>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Customize your sidebar</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            Selected items will always be visible in the sidebar. You can still
            access unselected items from the{" "}
            <span className="font-semibold text-foreground">More</span> menu in
            the sidebar.
          </p>
          <p>
            The changes you make here only affect you and not anyone else on
            your site.
          </p>
        </div>

        {/* Jira navigation */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold">Jira navigation</h3>
          <p className="mt-0.5 mb-3 text-xs text-muted-foreground">
            The following navigation items are available in Jira.
          </p>

          <div className="flex flex-col gap-1">
            {jiraNavItems.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-md px-1 py-1.5 hover:bg-accent/50"
              >
                {item.alwaysOn ? <div className="w-4" /> : <DragHandle />}
                {item.alwaysOn ? (
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M13.485 1.929a.5.5 0 0 1 0 .707L6.95 9.172a.25.25 0 0 1-.354 0L3.515 6.091a.5.5 0 1 1 .707-.707L6.773 7.94l5.998-6.012a.5.5 0 0 1 .714.001z" />
                  </svg>
                ) : (
                  <Checkbox
                    checked={jiraChecked[i]}
                    onCheckedChange={(checked) => {
                      const next = [...jiraChecked]
                      next[i] = !!checked
                      setJiraChecked(next)
                    }}
                  />
                )}
                <span className="text-muted-foreground">
                  {navIconMap[item.icon]}
                </span>
                <span className="flex-1 text-sm">{item.name}</span>
                {!item.alwaysOn && (
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const next = [...jiraChecked]
                      next[i] = !next[i]
                      setJiraChecked(next)
                    }}
                    title="Toggle visibility"
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* App shortcuts */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold">App shortcuts</h3>
          <p className="mt-0.5 mb-3 text-xs text-muted-foreground">
            The following Atlassian apps are available for your organization.
          </p>

          <div className="flex flex-col gap-1">
            {appShortcuts.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-md px-1 py-1.5 hover:bg-accent/50"
              >
                <DragHandle />
                <Checkbox
                  checked={appChecked[i]}
                  onCheckedChange={(checked) => {
                    const next = [...appChecked]
                    next[i] = !!checked
                    setAppChecked(next)
                  }}
                />
                <span className="text-muted-foreground">
                  {navIconMap[item.icon]}
                </span>
                <span className="flex-1 text-sm">{item.name}</span>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const next = [...appChecked]
                    next[i] = !next[i]
                    setAppChecked(next)
                  }}
                  title="Toggle visibility"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onOpenChange(false)}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MoreMenuPopover() {
  const pathname = usePathname()
  const [customizeOpen, setCustomizeOpen] = useState(false)

  return (
    <>
      <Popover>
        <PopoverTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          {ThreeDotsIcon}
          <span className="text-sm">More</span>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-52 p-1"
          sideOffset={4}
        >
          <div className="flex flex-col">
            <Link
              href="/filters"
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${pathname === "/filters" ? "bg-accent font-medium" : ""}`}
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filters
            </Link>
            <Link
              href="/dashboards"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              Dashboards
            </Link>

            <div className="my-1 border-t" />

            <Link
              href="/goals"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Goals
            </Link>
            <Link
              href="/project-directory"
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Projects
            </Link>

            <div className="my-1 border-t" />

            <button
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              onClick={() => setCustomizeOpen(true)}
            >
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Customize sidebar
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <CustomizeSidebarDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
      />
    </>
  )
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()
  const [appsOpen, setAppsOpen] = useState(false)
  const [appsHidden, setAppsHidden] = useState(false)
  const [plansOpen, setPlansOpen] = useState(pathname.startsWith("/plans"))
  const [plansHidden, setPlansHidden] = useState(false)
  const [spacesOpen, setSpacesOpen] = useState(true)
  const [spacesHidden, setSpacesHidden] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(
    pathname.startsWith("/filters")
  )
  const [defaultFiltersOpen, setDefaultFiltersOpen] = useState(true)
  const [dashboardsOpen, setDashboardsOpen] = useState(
    pathname.startsWith("/dashboards")
  )

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader>
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-2">
            {/* App switcher */}
            <AppSwitcher />
            {/* Jira logo — blue square with white J chevron */}
            <Link href="/projects" className="flex items-center gap-2">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  background:
                    "linear-gradient(180deg, #357DE8 0%, #1D68D9 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 32 32"
                  fill="none"
                  style={{ pointerEvents: "none" }}
                >
                  <path
                    d="M27.55 15.1L17.29 4.47 16 3.13 6.45 13.01l-2.14 2.2a.73.73 0 000 1.02l6.97 7.17L16 28.87l5.35-5.5.39-.4 5.81-5.98a.73.73 0 000-1.02zM16 20.28l-4.07-4.18L16 11.92l4.07 4.18L16 20.28z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight">Jira</span>
            </Link>
          </div>
          <button
            onClick={toggleSidebar}
            className="group/collapse relative rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Collapse sidebar (Ctrl+B)"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
            <span className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-[11px] whitespace-nowrap text-background opacity-0 transition-opacity group-hover/collapse:opacity-100">
              Collapse sidebar{" "}
              <kbd className="ml-1 rounded border border-background/20 px-1 text-[10px]">
                Ctrl+B
              </kbd>
            </span>
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {/* For you */}
            <SidebarMenuItem>
              <Link
                href="/dashboard"
                className={`flex w-full items-center gap-2 rounded-md p-2 text-xs transition-colors ${
                  pathname === "/dashboard" || pathname.startsWith("/issue/")
                    ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <svg
                  className={`size-4 ${pathname === "/dashboard" || pathname.startsWith("/issue/") ? "text-blue-600" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span>For you</span>
              </Link>
            </SidebarMenuItem>

            {/* Recent */}
            <RecentDropdown />

            {/* Starred */}
            <StarredDropdown />

            {/* Apps - expandable */}
            {!appsHidden && (
              <>
                <SidebarMenuItem>
                  <div className="group/apps flex items-center">
                    <SidebarMenuButton
                      className="flex-1"
                      onClick={() => setAppsOpen(!appsOpen)}
                    >
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
                      <span>Apps</span>
                    </SidebarMenuButton>
                    <Popover>
                      <PopoverTrigger className="mr-1 rounded p-0.5 text-muted-foreground opacity-0 group-hover/apps:opacity-100 hover:bg-accent hover:text-foreground">
                        {ThreeDotsIcon}
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[220px] p-1"
                        align="start"
                        side="bottom"
                      >
                        <Link
                          href="/admin/manage-apps"
                          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                          Manage apps
                        </Link>
                        <Link
                          href="/admin/insights/audit-log"
                          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                          App audit logs
                        </Link>
                        <Link
                          href="/admin/user-requests"
                          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" />
                            <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                            <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                            <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                            <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
                          </svg>
                          View app requests
                        </Link>
                        <div className="my-1 border-t" />
                        <button
                          onClick={() => {
                            setAppsHidden(true)
                            setAppsOpen(false)
                          }}
                          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                          Hide from sidebar
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </SidebarMenuItem>
                {appsOpen && (
                  <div className="ml-4 border-l py-1 pl-3">
                    <Link
                      href="/apps"
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-blue-600 hover:bg-accent"
                    >
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      Explore more apps
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Plans - expandable section */}
            {!plansHidden && (
              <>
                <SidebarMenuItem>
                  <div className="group/plans flex items-center">
                    <SidebarMenuButton
                      className="flex-1"
                      onClick={() => setPlansOpen(!plansOpen)}
                      isActive={pathname === "/plans"}
                    >
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      <span>Plans</span>
                    </SidebarMenuButton>
                    <div className="mr-1 flex items-center gap-0.5 opacity-0 group-hover/plans:opacity-100">
                      <Link
                        href="/plans"
                        className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Create plan"
                      >
                        <HugeiconsIcon icon={Add01Icon} className="size-4" />
                      </Link>
                      <Popover>
                        <PopoverTrigger className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                          {ThreeDotsIcon}
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[220px] p-1"
                          align="start"
                          side="bottom"
                        >
                          <Link
                            href="/plans"
                            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                          >
                            <svg
                              className="size-4 text-muted-foreground"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6" />
                            </svg>
                            Create demo plan
                          </Link>
                          <Link
                            href="/admin/settings"
                            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                          >
                            <svg
                              className="size-4 text-muted-foreground"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="3" />
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            Admin configuration
                          </Link>
                          <div className="my-1 border-t" />
                          <button
                            onClick={() => {
                              setPlansHidden(true)
                              setPlansOpen(false)
                            }}
                            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                          >
                            <svg
                              className="size-4 text-muted-foreground"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                            Hide from sidebar
                          </button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </SidebarMenuItem>
                {plansOpen && (
                  <div className="ml-4 border-l py-1 pl-3">
                    <p className="px-2 py-1 text-xs leading-relaxed text-muted-foreground">
                      Once you open or create plans, they&apos;ll show up here.
                    </p>
                    <Link
                      href="/plans"
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                        pathname === "/plans"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                          : "text-blue-600 hover:bg-accent"
                      }`}
                    >
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                      View all plans
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Spaces - collapsible section */}
            {!spacesHidden && (
              <SidebarMenuItem>
                <div className="group/spaces flex items-center">
                  <SidebarMenuButton
                    className="flex-1"
                    onClick={() => setSpacesOpen(!spacesOpen)}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>Spaces</span>
                    <svg
                      className={`ml-auto size-3.5 transition-transform ${spacesOpen ? "rotate-90" : ""}`}
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                      />
                    </svg>
                  </SidebarMenuButton>
                  <div className="mr-1 flex items-center gap-0.5 opacity-0 group-hover/spaces:opacity-100">
                    <Link
                      href="/projects"
                      className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      title="Create space"
                    >
                      <HugeiconsIcon icon={Add01Icon} className="size-4" />
                    </Link>
                    <Popover>
                      <PopoverTrigger className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                        {ThreeDotsIcon}
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[220px] p-1"
                        align="start"
                        side="bottom"
                      >
                        <Link
                          href="/projects"
                          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                          Manage spaces
                        </Link>
                        <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent">
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Change view
                        </button>
                        <div className="my-1 border-t" />
                        <button
                          onClick={() => {
                            setSpacesHidden(true)
                            setSpacesOpen(false)
                          }}
                          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                          Hide from sidebar
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {/* Spaces expanded content */}
        {spacesOpen && !spacesHidden && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#6B778C",
                }}
              >
                Recent
              </SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/projects/SCRUM/board" />}
                  >
                    <div className="flex size-5 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/30">
                      <HugeiconsIcon
                        icon={Layers01Icon}
                        className="size-3 text-blue-600"
                      />
                    </div>
                    <span className="text-sm">My Scrum Project</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <MoreSpacesPopover />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Recommended */}
            <SidebarGroup>
              <SidebarGroupLabel
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#6B778C",
                }}
              >
                Recommended
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link href="/plans" />}>
                      <div
                        className="flex size-5 items-center justify-center rounded"
                        style={{ background: "#EAE6FF" }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#5243AA"
                          strokeWidth="2"
                        >
                          <path d="M9 12h6M9 8h6M9 16h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                        </svg>
                      </div>
                      <span className="text-sm">Collect IT requests</span>
                      <span
                        className="ml-auto"
                        style={{
                          background: "#EAE6FF",
                          color: "#403294",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 5px",
                          borderRadius: 3,
                        }}
                      >
                        TRY
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator />

        {/* Filters - expandable */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="group/filters flex items-center">
                  <SidebarMenuButton
                    className="flex-1"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    isActive={pathname.startsWith("/filters")}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                      <line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                    <span className="text-sm">Filters</span>
                  </SidebarMenuButton>
                  <Link
                    href="/filters"
                    className="mr-1 rounded p-0.5 text-muted-foreground opacity-0 group-hover/filters:opacity-100 hover:bg-accent hover:text-foreground"
                    title="View all filters"
                  >
                    {ThreeDotsIcon}
                  </Link>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filtersOpen && (
          <SidebarGroup className="-mt-2">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <svg
                      className="size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="text-sm text-muted-foreground">
                      Search work items
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              <div className="px-2 pt-1">
                <button
                  onClick={() => setDefaultFiltersOpen(!defaultFiltersOpen)}
                  className="flex w-full items-center gap-1 py-1 text-[11px] font-semibold text-muted-foreground/70"
                >
                  <svg
                    className={`size-3 transition-transform ${defaultFiltersOpen ? "" : "-rotate-90"}`}
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                  Default filters
                </button>
              </div>

              {defaultFiltersOpen && (
                <SidebarMenu>
                  {[
                    { name: "My open work items", slug: "my-open-work-items" },
                    { name: "Reported by me", slug: "reported-by-me" },
                    { name: "All work items", slug: "all-work-items" },
                    { name: "Open work items", slug: "open-work-items" },
                    { name: "Done work items", slug: "done-work-items" },
                    { name: "Viewed recently", slug: "viewed-recently" },
                    { name: "Created recently", slug: "created-recently" },
                    { name: "Resolved recently", slug: "resolved-recently" },
                    { name: "Updated recently", slug: "updated-recently" },
                  ].map((filter) => (
                    <SidebarMenuItem key={filter.slug}>
                      <div className="group/filter-item flex items-center">
                        <SidebarMenuButton
                          render={<Link href={`/filters/${filter.slug}`} />}
                          isActive={pathname === `/filters/${filter.slug}`}
                          className="flex-1"
                        >
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                          </svg>
                          <span className="truncate text-sm">
                            {filter.name}
                          </span>
                        </SidebarMenuButton>
                        <Link
                          href={`/filters/${filter.slug}`}
                          className="mr-1 rounded p-0.5 text-muted-foreground opacity-0 group-hover/filter-item:opacity-100 hover:bg-accent hover:text-foreground"
                          title="Open filter"
                        >
                          {ThreeDotsIcon}
                        </Link>
                      </div>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href="/filters" />}
                      isActive={pathname === "/filters"}
                    >
                      <svg
                        className="size-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                      <span className="text-sm">View all filters</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarSeparator />

        {/* Dashboards - expandable */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="group/dashboards flex items-center">
                  <SidebarMenuButton
                    className="flex-1"
                    onClick={() => setDashboardsOpen(!dashboardsOpen)}
                    isActive={pathname.startsWith("/dashboards")}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                    <span className="text-sm">Dashboards</span>
                  </SidebarMenuButton>
                  <div className="mr-1 flex items-center gap-0.5 opacity-0 group-hover/dashboards:opacity-100">
                    <Link
                      href="/dashboards"
                      className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      title="Create dashboard"
                    >
                      <HugeiconsIcon icon={Add01Icon} className="size-4" />
                    </Link>
                    <Link
                      href="/dashboards"
                      className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      title="View all dashboards"
                    >
                      {ThreeDotsIcon}
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {dashboardsOpen && (
          <SidebarGroup className="-mt-2">
            <SidebarGroupContent>
              <div className="px-4 py-1">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Once you visit or create dashboards, they&apos;ll show up
                  here.
                </p>
              </div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboards" />}
                    isActive={pathname === "/dashboards"}
                  >
                    <svg
                      className="size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <span
                      className={`text-sm ${pathname === "/dashboards" ? "font-medium text-blue-600" : ""}`}
                    >
                      View all dashboards
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Goals */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <Link
                      href="/jira/goals"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="text-sm">Goals</span>
                  {ExternalLinkIcon}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Teams */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/teams" />}>
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
                  <span className="text-sm">Teams</span>
                  {ExternalLinkIcon}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* More */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <MoreMenuPopover />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
