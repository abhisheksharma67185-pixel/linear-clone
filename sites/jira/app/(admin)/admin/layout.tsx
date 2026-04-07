"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
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
  { name: "Overview", href: "/admin", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
  { name: "Directory", href: "/admin/users", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>, expandable: true },
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

const siteItems = [
  { name: "abhisheksharma67185", href: "/admin/sites" },
]

const rovoItems = [
  { name: "Rovo access", href: "/admin/rovo-access" },
  { name: "Rovo MCP server", href: "/admin/rovo-mcp" },
  { name: "Rovo insights", href: "/admin/rovo-insights", badge: "BETA" },
  { name: "Rovo settings", href: "/admin/rovo-settings" },
]

const userSecurityItems = [
  { name: "Authentication policies", href: "/admin/security/user-security/authentication-policies" },
  { name: "External users", href: "/admin/security/user-security/external-users" },
  { name: "Access policies", href: "/admin/security/user-security/access-policies", badge: "NEW" },
  { name: "Identity providers", href: "/admin/security/user-security/identity-providers" },
]

const dataProtectionItems = [
  { name: "Data classification", href: "/admin/security/data-protection/data-classification" },
  { name: "Data security policy", href: "/admin/security/data-protection/data-security-policy" },
  { name: "Encryption", href: "/admin/security/data-protection/encryption" },
  { name: "HIPAA compliance", href: "/admin/security/data-protection/hipaa-compliance" },
]

const deviceSecurityItems = [
  { name: "IP allowlists", href: "/admin/security/device-security/ip-allowlists" },
  { name: "Mobile app policies", href: "/admin/security/device-security/mobile-app-policies" },
]

const dataManagementItems = [
  { name: "Data transfer", href: "/admin/data-management/data-transfer", badge: "NEW" },
  { name: "Backup and restore", href: "/admin/data-management/backup-and-restore", badge: "NEW" },
  { name: "Data residency", href: "/admin/data-management/data-residency" },
  { name: "Link fixing", href: "/admin/data-management/link-fixing" },
]

const dataSourcesItems = [
  { name: "Connected sources", href: "/admin/data-management/data-sources/connected-sources" },
  { name: "Application tunnels", href: "/admin/data-management/data-sources/application-tunnels" },
]

const insightsItems = [
  { name: "Analytics", href: "/admin/insights/analytics" },
  { name: "Platform usage", href: "/admin/insights/platform-usage", badge: "NEW" },
  { name: "Audit log", href: "/admin/insights/audit-log" },
  { name: "System health", href: "/admin/insights/system-health", badge: "BETA" },
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
  { name: "Security", href: "/admin/security/security-guide", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
  { name: "Data management", href: "#", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg> },
  { name: "Insights", href: "#", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
  { name: "Billing", href: "/admin/billing", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg> },
  { name: "Organization settings", href: "#", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" /></svg> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isDirectoryPage = directoryItems.some((i) => pathname === i.href)
  const isAppsPage = appsSubItems.some((i) => pathname === i.href) || pathname === "/admin/platform-experiences" || releaseItems.some((i) => pathname === i.href) || shadowItems.some((i) => pathname === i.href) || pathname === "/admin/sites"
  const isRovoPage = rovoItems.some((i) => pathname === i.href)
  const isReleasePage = releaseItems.some((i) => pathname === i.href)
  const isShadowPage = shadowItems.some((i) => pathname === i.href)
  const isUserSecurityPage = userSecurityItems.some((i) => pathname === i.href)
  const isDataProtectionPage = dataProtectionItems.some((i) => pathname === i.href)
  const isDeviceSecurityPage = deviceSecurityItems.some((i) => pathname === i.href)
  const isSecurityPage = pathname.startsWith("/admin/security")
  const isDataManagementPage = dataManagementItems.some((i) => pathname === i.href) || dataSourcesItems.some((i) => pathname === i.href)
  const isDataSourcesPage = dataSourcesItems.some((i) => pathname === i.href)
  const isInsightsPage = insightsItems.some((i) => pathname === i.href)
  const isOrgSettingsPage = orgSettingsItems.some((i) => pathname === i.href)
  const [directoryOpen, setDirectoryOpen] = useState(isDirectoryPage || pathname === "/admin/users")
  const [appsOpen, setAppsOpen] = useState(isAppsPage)
  const [rovoOpen, setRovoOpen] = useState(isRovoPage)
  const [releaseOpen, setReleaseOpen] = useState(isReleasePage)
  const [securityOpen, setSecurityOpen] = useState(isSecurityPage)
  const [userSecurityOpen, setUserSecurityOpen] = useState(isUserSecurityPage)
  const [dataProtectionOpen, setDataProtectionOpen] = useState(isDataProtectionPage)
  const [deviceSecurityOpen, setDeviceSecurityOpen] = useState(isDeviceSecurityPage)
  const [dataManagementOpen, setDataManagementOpen] = useState(isDataManagementPage)
  const [dataSourcesOpen, setDataSourcesOpen] = useState(isDataSourcesPage)
  const [insightsOpen, setInsightsOpen] = useState(isInsightsPage)
  const [orgSettingsOpen, setOrgSettingsOpen] = useState(isOrgSettingsPage)
  const [shadowOpen, setShadowOpen] = useState(isShadowPage)
  const [sitesOpen, setSitesOpen] = useState(pathname === "/admin/sites")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileOpen])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="group relative rounded p-1 text-muted-foreground hover:bg-accent"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />{sidebarCollapsed && <polyline points="13 8 16 12 13 16" />}{!sidebarCollapsed && <polyline points="16 8 13 12 16 16" />}</svg>
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </button>
          <div className="flex items-center">
            <button
              onClick={() => { router.back(); router.refresh() }}
              className="rounded p-1 text-muted-foreground hover:bg-accent transition-colors"
              title="Go back"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              onClick={() => { router.forward(); router.refresh() }}
              className="rounded p-1 text-muted-foreground hover:bg-accent transition-colors"
              title="Go forward"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <button
            onClick={() => setAppSwitcherOpen(!appSwitcherOpen)}
            className={`rounded p-1 transition-colors ${appSwitcherOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          </button>
          <button
            onClick={() => { router.push("/admin"); router.refresh() }}
            className="flex items-center gap-2 rounded-full bg-muted/80 px-3 py-1.5 transition-colors hover:bg-muted"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>
            <span className="text-sm font-semibold">Administration</span>
          </button>
        </div>
        <div className="relative w-full max-w-lg mx-4">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <Input placeholder="Search" className="h-9 pl-9 bg-muted/50" />
        </div>
        <div className="flex items-center gap-2">
          <button
            ref={bellRef}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`rounded-full p-1.5 transition-colors ${notificationsOpen ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600 dark:bg-blue-900/30" : "text-muted-foreground hover:bg-accent"}`}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </button>
          <button
            onClick={() => {
              if (helpOpen || searchOpen) { setHelpOpen(false); setSearchOpen(false) } else { setHelpOpen(true); setSearchOpen(false) }
            }}
            className="group relative rounded-full p-1.5 text-muted-foreground hover:bg-accent"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">Help</span>
          </button>
          <div className="relative" ref={profileRef}>
            <Avatar className="size-8 cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}><AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">AS</AvatarFallback></Avatar>
            {profileOpen && (
              <div className="absolute right-0 top-10 z-50 w-72 rounded-lg border bg-background py-3 shadow-lg">
                <div className="flex items-center gap-3 px-4 pb-3 border-b">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">AS</div>
                  <div>
                    <p className="text-sm font-semibold">Abhishek Sharma</p>
                    <p className="text-xs text-muted-foreground">abhisheksharma67185@gmail.com</p>
                  </div>
                </div>
                <div className="flex flex-col py-1">
                  <button className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent text-left transition-colors">
                    <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09" /></svg>
                    Account settings
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent text-left transition-colors">
                    <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    Theme
                    <svg className="ml-auto size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
                <div className="border-t py-1">
                  <button className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent text-left w-full transition-colors">
                    <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    Switch account
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent text-left w-full transition-colors">
                    <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {!sidebarCollapsed && (
        <aside className="w-56 shrink-0 border-r overflow-y-auto transition-all duration-200">
          <div className="p-3">
            {/* Org name */}
            <div className="flex items-center gap-2 rounded-md px-3 py-2 mb-2">
              <svg className="size-5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></svg>
              <span className="text-sm font-medium">abhisheksharma67185</span>
            </div>

            {/* Overview */}
            <Link href="/admin" className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${pathname === "/admin" ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-foreground hover:bg-accent"}`}>
              {mainItems[0].icon}
              Overview
            </Link>

            {/* Directory */}
            <button
              onClick={() => setDirectoryOpen(!directoryOpen)}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${isDirectoryPage ? "text-foreground font-medium" : "text-foreground hover:bg-accent"}`}
            >
              {mainItems[1].icon}
              Directory
            </button>

            {directoryOpen && (
              <div className="ml-4 flex flex-col gap-0.5 py-1">
                {directoryItems.map((item) => (
                  <Link key={item.href} href={item.href} className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Apps - expandable */}
            <button
              onClick={() => setAppsOpen(!appsOpen)}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${isAppsPage ? "text-foreground font-medium" : "text-foreground hover:bg-accent"}`}
            >
              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              Apps
            </button>

            {appsOpen && (
              <div className="ml-4 flex flex-col gap-0.5 py-1">
                {appsSubItems.map((item) => (
                  <Link key={item.href} href={item.href} className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                    {item.name}
                  </Link>
                ))}
                <Link href="/admin/platform-experiences" className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === "/admin/platform-experiences" ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                  Platform experiences
                </Link>

                {/* Release management - expandable */}
                <button onClick={() => setReleaseOpen(!releaseOpen)} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground text-left">
                  <svg className={`size-3 shrink-0 transition-transform ${releaseOpen ? "" : "-rotate-90"}`} viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                  Release management
                </button>
                {releaseOpen && (
                  <div className="ml-5 flex flex-col gap-0.5">
                    {releaseItems.map((item) => (
                      <Link key={item.href} href={item.href} className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                        • {item.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Shadow IT - expandable */}
                <button onClick={() => setShadowOpen(!shadowOpen)} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground text-left">
                  <svg className={`size-3 shrink-0 transition-transform ${shadowOpen ? "" : "-rotate-90"}`} viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                  Shadow IT
                </button>
                {shadowOpen && (
                  <div className="ml-5 flex flex-col gap-0.5">
                    {shadowItems.map((item) => (
                      <Link key={item.href} href={item.href} className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                        • {item.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Sites - expandable */}
                <button onClick={() => setSitesOpen(!sitesOpen)} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground text-left">
                  <svg className={`size-3 shrink-0 transition-transform ${sitesOpen ? "" : "-rotate-90"}`} viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                  Sites
                </button>
                {sitesOpen && (
                  <div className="ml-5 flex flex-col gap-0.5">
                    {siteItems.map((item) => (
                      <Link key={item.href} href={item.href} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                        <div className="flex size-4 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                          <svg className="size-2.5 text-white" viewBox="0 0 32 32" fill="white"><path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" /></svg>
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
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${isRovoPage ? "text-foreground font-medium" : "text-foreground hover:bg-accent"}`}
            >
              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
              Rovo
            </button>
            {rovoOpen && (
              <div className="ml-4 flex flex-col gap-0.5 py-1">
                {rovoItems.map((item) => (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                    {item.name}
                    {item.badge && <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">{item.badge}</span>}
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom items */}
            <div className="mt-2 flex flex-col gap-0.5">
              {/* Security - expandable */}
              <button
                onClick={() => setSecurityOpen(!securityOpen)}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${isSecurityPage ? "text-foreground font-medium" : "text-foreground hover:bg-accent"}`}
              >
                <span className="text-muted-foreground">{bottomItems[0].icon}</span>
                Security
              </button>
              {securityOpen && (
                <div className="ml-4 flex flex-col gap-0.5 py-1">
                  <Link href="/admin/security/security-guide" className={`rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === "/admin/security/security-guide" ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                    Security guide
                  </Link>

                  {/* User security - expandable */}
                  <button onClick={() => setUserSecurityOpen(!userSecurityOpen)} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-left ${isUserSecurityPage ? "text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                    <svg className={`size-3 shrink-0 transition-transform ${userSecurityOpen ? "" : "-rotate-90"}`} viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                    User security
                  </button>
                  {userSecurityOpen && (
                    <div className="ml-5 flex flex-col gap-0.5">
                      {userSecurityItems.map((item) => (
                        <Link key={item.href} href={item.href} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                          <span className="mr-1">•</span>
                          {item.name}
                          {item.badge && <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">{item.badge}</span>}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Data protection - expandable */}
                  <button onClick={() => setDataProtectionOpen(!dataProtectionOpen)} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-left ${isDataProtectionPage ? "text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                    <svg className={`size-3 shrink-0 transition-transform ${dataProtectionOpen ? "" : "-rotate-90"}`} viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                    Data protection
                  </button>
                  {dataProtectionOpen && (
                    <div className="ml-5 flex flex-col gap-0.5">
                      {dataProtectionItems.map((item) => (
                        <Link key={item.href} href={item.href} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                          <span className="mr-1">•</span>
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Device security - expandable */}
                  <button onClick={() => setDeviceSecurityOpen(!deviceSecurityOpen)} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-left ${isDeviceSecurityPage ? "text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                    <svg className={`size-3 shrink-0 transition-transform ${deviceSecurityOpen ? "" : "-rotate-90"}`} viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                    Device security
                  </button>
                  {deviceSecurityOpen && (
                    <div className="ml-5 flex flex-col gap-0.5">
                      {deviceSecurityItems.map((item) => (
                        <Link key={item.href} href={item.href} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
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
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${isDataManagementPage ? "text-foreground font-medium" : "text-foreground hover:bg-accent"}`}
              >
                <span className="text-muted-foreground">{bottomItems[1].icon}</span>
                Data management
              </button>
              {dataManagementOpen && (
                <div className="ml-4 flex flex-col gap-0.5 py-1">
                  {dataManagementItems.map((item) => (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                      {item.name}
                      {item.badge && <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">{item.badge}</span>}
                    </Link>
                  ))}

                  {/* Data sources - expandable */}
                  <button onClick={() => setDataSourcesOpen(!dataSourcesOpen)} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-left ${isDataSourcesPage ? "text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                    <svg className={`size-3 shrink-0 transition-transform ${dataSourcesOpen ? "" : "-rotate-90"}`} viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                    Data sources
                  </button>
                  {dataSourcesOpen && (
                    <div className="ml-5 flex flex-col gap-0.5">
                      {dataSourcesItems.map((item) => (
                        <Link key={item.href} href={item.href} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
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
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${isInsightsPage ? "text-foreground font-medium" : "text-foreground hover:bg-accent"}`}
              >
                <span className="text-muted-foreground">{bottomItems[2].icon}</span>
                Insights
              </button>
              {insightsOpen && (
                <div className="ml-4 flex flex-col gap-0.5 py-1">
                  {insightsItems.map((item) => (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                      {item.name}
                      {item.badge && <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">{item.badge}</span>}
                    </Link>
                  ))}
                </div>
              )}
              {/* Billing */}
              <Link href="/admin/billing" className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${pathname === "/admin/billing" ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-foreground hover:bg-accent"}`}>
                <span className="text-muted-foreground">{bottomItems[3].icon}</span>
                Billing
              </Link>
              {/* Organization settings - expandable */}
              <button
                onClick={() => setOrgSettingsOpen(!orgSettingsOpen)}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-left ${isOrgSettingsPage ? "text-foreground font-medium" : "text-foreground hover:bg-accent"}`}
              >
                <span className="text-muted-foreground">{bottomItems[4].icon}</span>
                Organization settings
              </button>
              {orgSettingsOpen && (
                <div className="ml-4 flex flex-col gap-0.5 py-1">
                  {orgSettingsItems.map((item) => (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                      {item.name}
                      {item.badge && <span className="ml-auto rounded border px-1 py-0.5 text-[9px] font-bold">{item.badge}</span>}
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
          <div className="flex flex-col items-center gap-1 py-3 px-1.5 bg-background">
            <button
              onClick={() => {
                if (helpOpen) { setHelpOpen(false) } else { setHelpOpen(true); setSearchOpen(false) }
              }}
              className={`flex flex-col items-center gap-0.5 rounded-lg p-2.5 transition-colors ${helpOpen ? "border-2 border-blue-600 bg-background text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              <span className="text-[10px] font-medium">Help</span>
            </button>
            <button
              onClick={() => {
                if (searchOpen) { setSearchOpen(false) } else { setSearchOpen(true); setHelpOpen(false) }
              }}
              className={`flex flex-col items-center gap-0.5 rounded-lg p-2.5 transition-colors ${searchOpen ? "border-2 border-blue-600 bg-background text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <span className="text-[10px] font-medium">Search</span>
            </button>
          </div>

          {/* Help Panel */}
          <AdminHelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />

          {/* Search Panel */}
          <AdminSearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
        )}

        {/* Notifications Panel */}
        <AdminNotificationsPanel
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          anchorRef={bellRef}
        />

        {/* App Switcher */}
        <AdminAppSwitcher open={appSwitcherOpen} onClose={() => setAppSwitcherOpen(false)} />
      </div>
    </div>
  )
}
