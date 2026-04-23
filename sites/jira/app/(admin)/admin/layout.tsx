"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AdminHelpPanel } from "@/components/admin-help-panel"
import { AdminSearchPanel } from "@/components/admin-search-panel"
import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"
import { AdminAppSwitcher } from "@/components/admin-app-switcher"

const directoryItems = [
  { name: "Users", href: "/admin/users" },
  { name: "Groups", href: "/admin/groups" },
  { name: "Teams", href: "/admin/admin-teams" },
  { name: "Managed accounts", href: "/admin/managed-accounts" },
  { name: "Service accounts", href: "/admin/service-accounts" },
  { name: "Domains", href: "/admin/domains" },
]

const mainItems = [
  {
    name: "Overview",
    href: "/admin",
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
  {
    name: "Directory",
    href: "/admin/users",
    icon: (
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
    expandable: true,
  },
]

const appsSubItems = [
  { name: "Atlassian apps", href: "/admin/atlassian-apps" },
  { name: "App access settings", href: "/admin/app-access-settings" },
  { name: "User requests", href: "/admin/user-requests" },
  { name: "App URLs", href: "/admin/app-urls" },
  { name: "User counts", href: "/admin/user-counts" },
  { name: "Sandboxes", href: "/admin/sandboxes" },
]

const releaseItems = [
  { name: "App updates", href: "/admin/app-updates" },
  { name: "Release tracks", href: "/admin/release-tracks" },
]

const shadowItems = [
  { name: "Shadow IT apps", href: "/admin/shadow-it-apps" },
  { name: "Shadow IT controls", href: "/admin/shadow-it-controls" },
]

const siteItems = [{ name: "abhisheksharma67185", href: "/admin/sites" }]

const rovoItems = [
  { name: "Rovo access", href: "/admin/rovo-access" },
  { name: "Rovo MCP server", href: "/admin/rovo-mcp" },
  { name: "Rovo insights", href: "/admin/rovo-insights", badge: "BETA" },
  { name: "Rovo settings", href: "/admin/rovo-settings" },
]

const userSecurityItems = [
  {
    name: "Authentication policies",
    href: "/admin/security/user-security/authentication-policies",
  },
  {
    name: "External users",
    href: "/admin/security/user-security/external-users",
  },
  {
    name: "Access policies",
    href: "/admin/security/user-security/access-policies",
    badge: "NEW",
  },
  {
    name: "Identity providers",
    href: "/admin/security/user-security/identity-providers",
  },
]

const dataProtectionItems = [
  {
    name: "Data classification",
    href: "/admin/security/data-protection/data-classification",
  },
  {
    name: "Data security policy",
    href: "/admin/security/data-protection/data-security-policy",
  },
  { name: "Encryption", href: "/admin/security/data-protection/encryption" },
  {
    name: "HIPAA compliance",
    href: "/admin/security/data-protection/hipaa-compliance",
  },
]

const deviceSecurityItems = [
  {
    name: "IP allowlists",
    href: "/admin/security/device-security/ip-allowlists",
  },
  {
    name: "Mobile app policies",
    href: "/admin/security/device-security/mobile-app-policies",
  },
]

const dataManagementItems = [
  {
    name: "Data transfer",
    href: "/admin/data-management/data-transfer",
    badge: "NEW",
  },
  {
    name: "Backup and restore",
    href: "/admin/data-management/backup-and-restore",
    badge: "NEW",
  },
  { name: "Data residency", href: "/admin/data-management/data-residency" },
  { name: "Link fixing", href: "/admin/data-management/link-fixing" },
]

const dataSourcesItems = [
  {
    name: "Connected sources",
    href: "/admin/data-management/data-sources/connected-sources",
  },
  {
    name: "Application tunnels",
    href: "/admin/data-management/data-sources/application-tunnels",
  },
]

const insightsItems = [
  { name: "Analytics", href: "/admin/insights/analytics" },
  {
    name: "Platform usage",
    href: "/admin/insights/platform-usage",
    badge: "NEW",
  },
  { name: "Audit log", href: "/admin/insights/audit-log" },
  {
    name: "System health",
    href: "/admin/insights/system-health",
    badge: "BETA",
  },
  { name: "Portfolio insights", href: "/admin/insights/portfolio-insights" },
  { name: "API token activity", href: "/admin/insights/api-token-activity" },
]

const orgSettingsItems = [
  { name: "Profile", href: "/admin/settings/profile" },
  { name: "Emails", href: "/admin/settings/emails" },
  { name: "Contacts", href: "/admin/settings/contacts" },
  { name: "Login page", href: "/admin/settings/login-page", badge: "NEW" },
  { name: "API keys", href: "/admin/settings/api-keys" },
]

const bottomItems = [
  {
    name: "Security",
    href: "/admin/security/security-guide",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    name: "Data management",
    href: "#",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    name: "Insights",
    href: "#",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    name: "Billing",
    href: "/admin/billing",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    name: "Organization settings",
    href: "#",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" />
      </svg>
    ),
  },
]

const searchableItems = [
  { name: "Overview", href: "/admin" },
  { name: "Users", href: "/admin/users" },
  { name: "Groups", href: "/admin/groups" },
  { name: "Teams", href: "/admin/admin-teams" },
  { name: "Managed accounts", href: "/admin/managed-accounts" },
  { name: "Service accounts", href: "/admin/service-accounts" },
  { name: "Domains", href: "/admin/domains" },
  {
    name: "Authentication policies",
    href: "/admin/security/user-security/authentication-policies",
  },
  {
    name: "External users",
    href: "/admin/security/user-security/external-users",
  },
  {
    name: "Access policies",
    href: "/admin/security/user-security/access-policies",
  },
  {
    name: "Identity providers",
    href: "/admin/security/user-security/identity-providers",
  },
  { name: "Security guide", href: "/admin/security/security-guide" },
  { name: "Billing", href: "/admin/billing" },
  { name: "Organization settings", href: "/admin/settings" },
  { name: "Atlassian apps", href: "/admin/atlassian-apps" },
  { name: "Audit log", href: "/admin/insights/audit-log" },
  { name: "Platform usage", href: "/admin/insights/platform-usage" },
]

function AdminSearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const results = query.trim()
    ? searchableItems.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    : []

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  return (
    <div className="relative mx-4 w-full max-w-lg" ref={ref}>
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
      <input
        type="text"
        placeholder="Search"
        aria-label="Search administration"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (query.trim()) setOpen(true)
        }}
        className="h-9 w-full rounded-md border bg-muted/50 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
      {open && results.length > 0 && (
        <div
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border bg-popover shadow-lg"
        >
          {results.map((item) => (
            <div
              key={item.href}
              role="option"
              aria-selected={false}
              onClick={() => {
                setOpen(false)
                setQuery("")
                router.push(item.href)
              }}
              className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <span>{item.name}</span>
              <span className="ml-4 max-w-[200px] truncate text-xs text-muted-foreground">
                {item.href}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isDirectoryPage = directoryItems.some((i) => pathname === i.href)
  const isAppsPage =
    appsSubItems.some((i) => pathname === i.href) ||
    pathname === "/admin/platform-experiences" ||
    releaseItems.some((i) => pathname === i.href) ||
    shadowItems.some((i) => pathname === i.href) ||
    pathname === "/admin/sites"
  const isRovoPage = rovoItems.some((i) => pathname === i.href)
  const isReleasePage = releaseItems.some((i) => pathname === i.href)
  const isShadowPage = shadowItems.some((i) => pathname === i.href)
  const isUserSecurityPage = userSecurityItems.some((i) => pathname === i.href)
  const isDataProtectionPage = dataProtectionItems.some(
    (i) => pathname === i.href
  )
  const isDeviceSecurityPage = deviceSecurityItems.some(
    (i) => pathname === i.href
  )
  const isSecurityPage = pathname.startsWith("/admin/security")
  const isDataManagementPage =
    dataManagementItems.some((i) => pathname === i.href) ||
    dataSourcesItems.some((i) => pathname === i.href)
  const isDataSourcesPage = dataSourcesItems.some((i) => pathname === i.href)
  const isInsightsPage = insightsItems.some((i) => pathname === i.href)
  const isOrgSettingsPage = orgSettingsItems.some((i) => pathname === i.href)
  const [directoryOpen, setDirectoryOpen] = useState(
    isDirectoryPage || pathname === "/admin/users"
  )
  const [appsOpen, setAppsOpen] = useState(isAppsPage)
  const [rovoOpen, setRovoOpen] = useState(isRovoPage)
  const [releaseOpen, setReleaseOpen] = useState(isReleasePage)
  const [securityOpen, setSecurityOpen] = useState(isSecurityPage)
  const [userSecurityOpen, setUserSecurityOpen] = useState(isUserSecurityPage)
  const [dataProtectionOpen, setDataProtectionOpen] =
    useState(isDataProtectionPage)
  const [deviceSecurityOpen, setDeviceSecurityOpen] =
    useState(isDeviceSecurityPage)
  const [dataManagementOpen, setDataManagementOpen] =
    useState(isDataManagementPage)
  const [dataSourcesOpen, setDataSourcesOpen] = useState(isDataSourcesPage)
  const [insightsOpen, setInsightsOpen] = useState(isInsightsPage)
  const [orgSettingsOpen, setOrgSettingsOpen] = useState(isOrgSettingsPage)
  const [shadowOpen, setShadowOpen] = useState(isShadowPage)
  const [sitesOpen, setSitesOpen] = useState(pathname === "/admin/sites")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close mobile sidebar on route change (external sync: pathname → UI).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [profileOpen])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger — visible only at sm and below */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            className="block rounded p-1 text-muted-foreground hover:bg-accent sm:hidden"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {/* Desktop sidebar toggle — hidden on mobile */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="group relative hidden rounded p-1 text-muted-foreground hover:bg-accent sm:block"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              {sidebarCollapsed && <polyline points="13 8 16 12 13 16" />}
              {!sidebarCollapsed && <polyline points="16 8 13 12 16 16" />}
            </svg>
            <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background opacity-0 transition-opacity group-hover:opacity-100">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </button>
          <div className="flex items-center">
            <button
              onClick={() => {
                router.back()
                router.refresh()
              }}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
              title="Go back"
              aria-label="Go back"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => {
                router.forward()
                router.refresh()
              }}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
              title="Go forward"
              aria-label="Go forward"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setAppSwitcherOpen(!appSwitcherOpen)}
            aria-label="App switcher"
            className={`rounded p-1 transition-colors ${appSwitcherOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"}`}
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
          </button>
          <button
            onClick={() => {
              router.push("/admin")
              router.refresh()
            }}
            className="flex items-center gap-2 rounded-full bg-muted/80 px-3 py-1.5 transition-colors hover:bg-muted"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
            </svg>
            <span className="text-sm font-semibold">Administration</span>
          </button>
        </div>
        <AdminSearchBar />
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="17" y1="11" x2="23" y2="11" />
            </svg>
            Invite users
          </Link>
          <button
            ref={bellRef}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
            className={`rounded-full p-1.5 transition-colors ${notificationsOpen ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-accent"}`}
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (helpOpen || searchOpen) {
                setHelpOpen(false)
                setSearchOpen(false)
              } else {
                setHelpOpen(true)
                setSearchOpen(false)
              }
            }}
            aria-label="Help"
            className="group relative rounded-full p-1.5 text-muted-foreground hover:bg-accent"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background opacity-0 transition-opacity group-hover:opacity-100">
              Help
            </span>
          </button>
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="User profile"
              className="rounded-full"
            >
              <Avatar className="size-8 cursor-pointer">
                <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                  AS
                </AvatarFallback>
              </Avatar>
            </button>
            {profileOpen && (
              <div className="absolute top-full right-0 z-[9999] mt-2 w-72 rounded-lg border bg-popover shadow-lg">
                <div className="flex items-center gap-3 border-b px-4 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    AS
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Abhishek Sharma</p>
                    <p className="truncate text-xs text-muted-foreground">
                      abhisheksharma67185@gmail.com
                    </p>
                  </div>
                </div>
                <div className="flex flex-col py-1">
                  <Link
                    href="/home/account-settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09" />
                    </svg>
                    Account settings
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    Theme
                    <svg
                      className="ml-auto size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </div>
                <div className="border-t py-1">
                  <Link
                    href="/switch-account"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-4 text-muted-foreground"
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
                    Switch account
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <svg
                      className="size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Mobile overlay backdrop */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
        {!sidebarCollapsed && (
          <aside
            className={`w-56 shrink-0 overflow-y-auto border-r transition-all duration-200 ${
              mobileNavOpen
                ? "fixed inset-y-14 left-0 z-50 bg-background shadow-lg sm:relative sm:inset-auto sm:z-auto sm:shadow-none"
                : "hidden sm:block"
            }`}
            onClick={(e) => {
              // Close mobile nav when a link is clicked
              if ((e.target as HTMLElement).closest("a"))
                setMobileNavOpen(false)
            }}
          >
            <div className="p-3">
              {/* Org name */}
              <div className="mb-2 flex items-center gap-2 rounded-md px-3 py-2">
                <svg
                  className="size-5 shrink-0 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                </svg>
                <span className="text-sm font-medium">abhisheksharma67185</span>
              </div>

              {/* Overview */}
              <Link
                href="/admin"
                aria-current={pathname === "/admin" ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${pathname === "/admin" ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-foreground hover:bg-accent"}`}
              >
                {mainItems[0].icon}
                Overview
              </Link>

              {/* Directory */}
              <button
                onClick={() => setDirectoryOpen(!directoryOpen)}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${isDirectoryPage ? "font-medium text-foreground" : "text-foreground hover:bg-accent"}`}
              >
                {mainItems[1].icon}
                Directory
              </button>

              {directoryOpen && (
                <div className="ml-4 flex flex-col gap-0.5 py-1">
                  {directoryItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Apps - expandable */}
              <button
                onClick={() => setAppsOpen(!appsOpen)}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${isAppsPage ? "font-medium text-foreground" : "text-foreground hover:bg-accent"}`}
              >
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
                Apps
              </button>

              {appsOpen && (
                <div className="ml-4 flex flex-col gap-0.5 py-1">
                  {appsSubItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    href="/admin/platform-experiences"
                    aria-current={
                      pathname === "/admin/platform-experiences"
                        ? "page"
                        : undefined
                    }
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === "/admin/platform-experiences" ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                  >
                    Platform experiences
                  </Link>

                  {/* Release management - expandable */}
                  <button
                    onClick={() => setReleaseOpen(!releaseOpen)}
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <svg
                      className={`size-3 shrink-0 transition-transform ${releaseOpen ? "" : "-rotate-90"}`}
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                    Release management
                  </button>
                  {releaseOpen && (
                    <div className="ml-5 flex flex-col gap-0.5">
                      {releaseItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={
                            pathname === item.href ? "page" : undefined
                          }
                          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                        >
                          • {item.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Shadow IT - expandable */}
                  <button
                    onClick={() => setShadowOpen(!shadowOpen)}
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <svg
                      className={`size-3 shrink-0 transition-transform ${shadowOpen ? "" : "-rotate-90"}`}
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                    Shadow IT
                  </button>
                  {shadowOpen && (
                    <div className="ml-5 flex flex-col gap-0.5">
                      {shadowItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={
                            pathname === item.href ? "page" : undefined
                          }
                          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                        >
                          • {item.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Sites - expandable */}
                  <button
                    onClick={() => setSitesOpen(!sitesOpen)}
                    className="flex items-center gap-1 rounded-md px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <svg
                      className={`size-3 shrink-0 transition-transform ${sitesOpen ? "" : "-rotate-90"}`}
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                    Sites
                  </button>
                  {sitesOpen && (
                    <div className="ml-5 flex flex-col gap-0.5">
                      {siteItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                        >
                          <div className="flex size-4 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                            <svg
                              className="size-2.5 text-white"
                              viewBox="0 0 32 32"
                              fill="white"
                            >
                              <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                            </svg>
                          </div>
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rovo - expandable */}
              <button
                onClick={() => setRovoOpen(!rovoOpen)}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${isRovoPage ? "font-medium text-foreground" : "text-foreground hover:bg-accent"}`}
              >
                <svg
                  className="size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
                Rovo
              </button>
              {rovoOpen && (
                <div className="ml-4 flex flex-col gap-0.5 py-1">
                  {rovoItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      {item.name}
                      {item.badge && (
                        <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* Bottom items */}
              <div className="mt-2 flex flex-col gap-0.5">
                {/* Security - expandable */}
                <button
                  onClick={() => setSecurityOpen(!securityOpen)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${isSecurityPage ? "font-medium text-foreground" : "text-foreground hover:bg-accent"}`}
                >
                  <span className="text-muted-foreground">
                    {bottomItems[0].icon}
                  </span>
                  Security
                </button>
                {securityOpen && (
                  <div className="ml-4 flex flex-col gap-0.5 py-1">
                    <Link
                      href="/admin/security/security-guide"
                      aria-label="Security guide"
                      aria-current={
                        pathname === "/admin/security/security-guide"
                          ? "page"
                          : undefined
                      }
                      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === "/admin/security/security-guide" ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      Security guide
                    </Link>

                    {/* User security - expandable */}
                    <button
                      onClick={() => setUserSecurityOpen(!userSecurityOpen)}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-left text-sm ${isUserSecurityPage ? "font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      <svg
                        className={`size-3 shrink-0 transition-transform ${userSecurityOpen ? "" : "-rotate-90"}`}
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                      User security
                    </button>
                    {userSecurityOpen && (
                      <div className="ml-5 flex flex-col gap-0.5">
                        {userSecurityItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            aria-current={
                              pathname === item.href ? "page" : undefined
                            }
                            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                          >
                            <span className="mr-1">•</span>
                            {item.name}
                            {item.badge && (
                              <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Data protection - expandable */}
                    <button
                      onClick={() => setDataProtectionOpen(!dataProtectionOpen)}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-left text-sm ${isDataProtectionPage ? "font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      <svg
                        className={`size-3 shrink-0 transition-transform ${dataProtectionOpen ? "" : "-rotate-90"}`}
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                      Data protection
                    </button>
                    {dataProtectionOpen && (
                      <div className="ml-5 flex flex-col gap-0.5">
                        {dataProtectionItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            aria-current={
                              pathname === item.href ? "page" : undefined
                            }
                            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                          >
                            <span className="mr-1">•</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Device security - expandable */}
                    <button
                      onClick={() => setDeviceSecurityOpen(!deviceSecurityOpen)}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-left text-sm ${isDeviceSecurityPage ? "font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      <svg
                        className={`size-3 shrink-0 transition-transform ${deviceSecurityOpen ? "" : "-rotate-90"}`}
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                      Device security
                    </button>
                    {deviceSecurityOpen && (
                      <div className="ml-5 flex flex-col gap-0.5">
                        {deviceSecurityItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            aria-current={
                              pathname === item.href ? "page" : undefined
                            }
                            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                          >
                            <span className="mr-1">•</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* Data management - expandable */}
                <button
                  onClick={() => setDataManagementOpen(!dataManagementOpen)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${isDataManagementPage ? "font-medium text-foreground" : "text-foreground hover:bg-accent"}`}
                >
                  <span className="text-muted-foreground">
                    {bottomItems[1].icon}
                  </span>
                  Data management
                </button>
                {dataManagementOpen && (
                  <div className="ml-4 flex flex-col gap-0.5 py-1">
                    {dataManagementItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={
                          pathname === item.href ? "page" : undefined
                        }
                        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                      >
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}

                    {/* Data sources - expandable */}
                    <button
                      onClick={() => setDataSourcesOpen(!dataSourcesOpen)}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-left text-sm ${isDataSourcesPage ? "font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                    >
                      <svg
                        className={`size-3 shrink-0 transition-transform ${dataSourcesOpen ? "" : "-rotate-90"}`}
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                      Data sources
                    </button>
                    {dataSourcesOpen && (
                      <div className="ml-5 flex flex-col gap-0.5">
                        {dataSourcesItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            aria-current={
                              pathname === item.href ? "page" : undefined
                            }
                            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                          >
                            <span className="mr-1">•</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* Insights - expandable */}
                <button
                  onClick={() => setInsightsOpen(!insightsOpen)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${isInsightsPage ? "font-medium text-foreground" : "text-foreground hover:bg-accent"}`}
                >
                  <span className="text-muted-foreground">
                    {bottomItems[2].icon}
                  </span>
                  Insights
                </button>
                {insightsOpen && (
                  <div className="ml-4 flex flex-col gap-0.5 py-1">
                    {insightsItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={
                          pathname === item.href ? "page" : undefined
                        }
                        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                      >
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
                {/* Billing */}
                <Link
                  href="/admin/billing"
                  aria-current={
                    pathname === "/admin/billing" ? "page" : undefined
                  }
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${pathname === "/admin/billing" ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-foreground hover:bg-accent"}`}
                >
                  <span className="text-muted-foreground">
                    {bottomItems[3].icon}
                  </span>
                  Billing
                </Link>
                {/* Organization settings - expandable */}
                <button
                  onClick={() => setOrgSettingsOpen(!orgSettingsOpen)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${isOrgSettingsPage ? "font-medium text-foreground" : "text-foreground hover:bg-accent"}`}
                >
                  <span className="text-muted-foreground">
                    {bottomItems[4].icon}
                  </span>
                  Organization settings
                </button>
                {orgSettingsOpen && (
                  <div className="ml-4 flex flex-col gap-0.5 py-1">
                    {orgSettingsItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={
                          pathname === item.href ? "page" : undefined
                        }
                        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                      >
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Right toolbar + panels */}
        {(helpOpen || searchOpen) && (
          <div className="flex shrink-0 border-l">
            {/* Tab toolbar */}
            <div className="flex flex-col items-center gap-1 bg-background px-1.5 py-3">
              <button
                onClick={() => {
                  if (helpOpen) {
                    setHelpOpen(false)
                  } else {
                    setHelpOpen(true)
                    setSearchOpen(false)
                  }
                }}
                className={`flex flex-col items-center gap-0.5 rounded-lg p-2.5 transition-colors ${helpOpen ? "border-2 border-blue-600 bg-background text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="text-[10px] font-medium">Help</span>
              </button>
              <button
                onClick={() => {
                  if (searchOpen) {
                    setSearchOpen(false)
                  } else {
                    setSearchOpen(true)
                    setHelpOpen(false)
                  }
                }}
                className={`flex flex-col items-center gap-0.5 rounded-lg p-2.5 transition-colors ${searchOpen ? "border-2 border-blue-600 bg-background text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="text-[10px] font-medium">Search</span>
              </button>
            </div>

            {/* Help Panel */}
            <AdminHelpPanel
              open={helpOpen}
              onClose={() => setHelpOpen(false)}
            />

            {/* Search Panel */}
            <AdminSearchPanel
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
            />
          </div>
        )}

        {/* Notifications Panel */}
        <AdminNotificationsPanel
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          anchorRef={bellRef}
        />

        {/* App Switcher */}
        <AdminAppSwitcher
          open={appSwitcherOpen}
          onClose={() => setAppSwitcherOpen(false)}
        />
      </div>
    </div>
  )
}
