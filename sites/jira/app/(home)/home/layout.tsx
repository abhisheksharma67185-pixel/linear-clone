"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AppSwitcher } from "@/components/app-switcher"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

const homeNavItems = [
  { id: "recent", name: "Recent", enabled: true },
  { id: "starred", name: "Starred", enabled: true },
  { id: "notifications", name: "Notifications", enabled: true },
  { id: "status", name: "Status updates", enabled: true },
  { id: "tags", name: "Tags", enabled: true },
  { id: "kudos", name: "Kudos", enabled: true },
]

const appShortcutItems = [
  { id: "jira", name: "Jira", enabled: true },
  { id: "teams", name: "Teams", enabled: true },
  { id: "goals", name: "Goals", enabled: true },
  { id: "projects", name: "Projects", enabled: true },
]

function CustomizeSidebarDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [navItems, setNavItems] = useState(homeNavItems)
  const [appItems, setAppItems] = useState(appShortcutItems)

  const toggleNav = (id: string) => {
    setNavItems((prev) => prev.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item))
  }

  const toggleApp = (id: string) => {
    setAppItems((prev) => prev.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item))
  }

  const navIcons: Record<string, React.ReactNode> = {
    recent: <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    starred: <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    notifications: <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    status: <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    tags: <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>,
    kudos: <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  }

  const appIcons: Record<string, React.ReactNode> = {
    jira: <div className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700"><svg className="size-3 text-white" viewBox="0 0 32 32" fill="white"><path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" /></svg></div>,
    teams: <div className="flex size-5 items-center justify-center rounded bg-teal-100"><svg className="size-3 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg></div>,
    goals: <div className="flex size-5 items-center justify-center rounded bg-purple-100"><svg className="size-3 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg></div>,
    projects: <div className="flex size-5 items-center justify-center rounded bg-pink-100"><svg className="size-3 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div>,
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent className="sm:max-w-[540px] max-h-[80vh] overflow-y-auto p-0" showCloseButton>
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg">Customize your sidebar</DialogTitle>
          <DialogDescription>
            The changes you make here only affect you and not anyone else on your site.
          </DialogDescription>
        </DialogHeader>

        {/* Home navigation */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold mb-1">Home navigation</h3>
          <p className="text-xs text-muted-foreground mb-3">The following navigation items are available in Home.</p>

          {/* For you - always on */}
          <div className="flex items-center gap-3 py-2 px-1">
            <Checkbox checked disabled className="size-5" />
            <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
            <span className="text-sm">For you</span>
          </div>

          {navItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 px-1">
              <svg className="size-4 text-muted-foreground cursor-grab" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" /></svg>
              <Checkbox
                checked={item.enabled}
                onCheckedChange={() => toggleNav(item.id)}
                className="size-5"
              />
              {navIcons[item.id]}
              <span className="flex-1 text-sm">{item.name}</span>
            </div>
          ))}
        </div>

        {/* App shortcuts */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold mb-1">App shortcuts</h3>
          <p className="text-xs text-muted-foreground mb-3">The following Atlassian apps are available for your organization.</p>

          {appItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 px-1">
              <svg className="size-4 text-muted-foreground cursor-grab" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" /></svg>
              <Checkbox
                checked={item.enabled}
                onCheckedChange={() => toggleApp(item.id)}
                className="size-5"
              />
              {appIcons[item.id]}
              <span className="flex-1 text-sm">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={onClose}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const sidebarNav = [
  { name: "For you", href: "/home", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg> },
  { name: "Recent", href: "/home/recent", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
  { name: "Starred", href: "/home/starred", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
  { name: "Notifications", href: "/home/notifications", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
  { name: "Status updates", href: "/home/status-updates", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
  { name: "Tags", href: "/home/tags", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg> },
  { name: "Kudos", href: "/teams/kudos", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
]

const appLinks = [
  { name: "Jira", href: "/dashboard", icon: <div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700"><svg className="size-3.5 text-white" viewBox="0 0 32 32" fill="white"><path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" /></svg></div> },
  { name: "Teams", href: "/teams", icon: <div className="flex size-6 items-center justify-center rounded bg-teal-100 dark:bg-teal-900/30"><svg className="size-3.5 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg></div> },
  { name: "Goals", href: "/goals", icon: <div className="flex size-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30"><svg className="size-3.5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg></div> },
  { name: "Projects", href: "/project-directory", icon: <div className="flex size-6 items-center justify-center rounded bg-pink-100 dark:bg-pink-900/30"><svg className="size-3.5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div> },
]

function CreateDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button size="sm" className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Create
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>
          Work item
        </DropdownMenuItem>
        <DropdownMenuItem>
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
          Project
        </DropdownMenuItem>
        <DropdownMenuItem>
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
          Goal
        </DropdownMenuItem>
        <DropdownMenuItem>
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [customizeOpen, setCustomizeOpen] = useState(false)

  return (
    <>
    <CustomizeSidebarDialog open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
    <div className="flex h-screen flex-col" suppressHydrationWarning>
      <header className="flex h-14 items-center justify-between border-b px-4 shrink-0">
        <div className="flex items-center gap-3">
          <AppSwitcher />
          <div className="flex items-center gap-2">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            <span className="text-sm font-semibold">Home</span>
          </div>
          <button className="rounded p-1 text-muted-foreground hover:bg-accent">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
          </button>
        </div>
        <div className="flex flex-1 items-center gap-2 mx-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <Input placeholder="Search" className="h-9 pl-9 bg-muted/50" />
          </div>
          <CreateDropdown />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/home/notifications" className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg></Link>
          <Link href="/home" className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></Link>
          <Popover>
            <PopoverTrigger render={
              <button className="rounded-full p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" /></svg>
              </button>
            } />
            <PopoverContent align="end" className="w-80 p-0 py-2">
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Atlassian Home settings</p>
              <button className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent">
                <svg className="mt-0.5 size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                <div>
                  <p className="text-sm font-medium">Workspace settings</p>
                  <p className="text-xs text-muted-foreground">Manage workspace name, domains, user groups and time zone</p>
                </div>
              </button>
              <button className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent">
                <svg className="mt-0.5 size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <div>
                  <p className="text-sm font-medium">Personal settings</p>
                  <p className="text-xs text-muted-foreground">Manage notification preferences and themes</p>
                </div>
              </button>

              <div className="my-1 border-t" />

              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Atlassian admin settings</p>
              <Link href="/admin/users" className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent">
                <svg className="mt-0.5 size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <div>
                  <p className="text-sm font-medium">User management</p>
                  <p className="text-xs text-muted-foreground">Manage users, groups, and access requests</p>
                </div>
              </Link>
              <button className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent">
                <svg className="mt-0.5 size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /></svg>
                <div>
                  <p className="text-sm font-medium">Licensing</p>
                  <p className="text-xs text-muted-foreground">Server and Data Center licensing</p>
                </div>
              </button>
              <Link href="/admin/billing" className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent">
                <svg className="mt-0.5 size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                <div>
                  <p className="text-sm font-medium">Billing</p>
                  <p className="text-xs text-muted-foreground">Update your billing details, manage subscriptions, and more</p>
                </div>
              </Link>
            </PopoverContent>
          </Popover>
          <Avatar className="size-8 cursor-pointer"><AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">AS</AvatarFallback></Avatar>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-64 shrink-0 border-r overflow-y-auto flex flex-col">
          <nav className="flex flex-col gap-0.5 p-2">
            {sidebarNav.map((item) => (
              <Link key={item.name} href={item.href} className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400" : "text-foreground hover:bg-accent"}`}>
                <span className={pathname === item.href ? "text-blue-600" : "text-muted-foreground"}>{item.icon}</span>
                {item.name}
              </Link>
            ))}

            <div className="my-2 border-t" />

            {appLinks.map((app) => (
              <Link key={app.name} href={app.href} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent">
                {app.icon}
                {app.name}
                <svg className="ml-auto size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </Link>
            ))}

            <Link href="/home/apps" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent">
              <div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600"><svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
              Jira Service Management
              <span className="ml-auto rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">TRY</span>
              <svg className="size-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
            </Link>

            <Link href="/home/apps" className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${pathname === "/home/apps" ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              View all apps
            </Link>

            <button
              onClick={() => setCustomizeOpen(true)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" /></svg>
              Customize sidebar
            </button>
          </nav>

          <div className="mt-auto border-t p-3">
            <Link href="/home/notifications" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Give feedback on the new navigation
            </Link>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
    </>
  )
}
