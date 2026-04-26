"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Settings02Icon,
  UserIcon,
  Notification01Icon,
  SecurityLockIcon,
  Link01Icon,
  AiBrain01Icon,
  LabelIcon,
  FileAddIcon,
  FireIcon,
  CheckmarkCircle02Icon,
  Chart01Icon,
  UserMultiple02Icon,
  Plug01Icon,
  HelpCircleIcon,
  SmileIcon,
  Building03Icon,
  Group01Icon,
  Shield01Icon,
  SourceCodeIcon,
  AppStoreIcon,
  CreditCardAcceptIcon,
  BookUploadIcon,
  Flag03Icon,
  DocumentValidationIcon,
  CustomerSupportIcon,
  ActivitySparkIcon,
} from "@hugeicons/core-free-icons"

type NavItem = { key: string; label: string; icon: IconSvgElement | null }
type NavGroup = { title?: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    items: [
      { key: "preferences", label: "Preferences", icon: Settings02Icon },
      { key: "profile", label: "Profile", icon: UserIcon },
      { key: "notifications", label: "Notifications", icon: Notification01Icon },
      { key: "security", label: "Security & access", icon: SecurityLockIcon },
      { key: "connected", label: "Connected accounts", icon: Link01Icon },
      { key: "agents", label: "Agent personalization", icon: AiBrain01Icon },
    ],
  },
  {
    title: "Issues",
    items: [
      { key: "issue-labels", label: "Labels", icon: LabelIcon },
      { key: "issue-templates", label: "Templates", icon: FileAddIcon },
      { key: "slas", label: "SLAs", icon: FireIcon },
    ],
  },
  {
    title: "Projects",
    items: [
      { key: "project-labels", label: "Labels", icon: LabelIcon },
      { key: "project-templates", label: "Templates", icon: FileAddIcon },
      { key: "statuses", label: "Statuses", icon: CheckmarkCircle02Icon },
      { key: "updates", label: "Updates", icon: Chart01Icon },
    ],
  },
  {
    title: "Features",
    items: [
      { key: "ai-agents", label: "AI & Agents", icon: AiBrain01Icon },
      { key: "initiatives", label: "Initiatives", icon: Flag03Icon },
      { key: "documents", label: "Documents", icon: DocumentValidationIcon },
      {
        key: "customer-requests",
        label: "Customer requests",
        icon: CustomerSupportIcon,
      },
      { key: "pulse", label: "Pulse", icon: ActivitySparkIcon },
      { key: "asks", label: "Asks", icon: HelpCircleIcon },
      { key: "emojis", label: "Emojis", icon: SmileIcon },
      { key: "integrations", label: "Integrations", icon: Plug01Icon },
    ],
  },
  {
    title: "Administration",
    items: [
      { key: "workspace", label: "Workspace", icon: Building03Icon },
      { key: "teams", label: "Teams", icon: Group01Icon },
      { key: "members", label: "Members", icon: UserMultiple02Icon },
      { key: "admin-security", label: "Security", icon: Shield01Icon },
      { key: "api", label: "API", icon: SourceCodeIcon },
      { key: "applications", label: "Applications", icon: AppStoreIcon },
      { key: "billing", label: "Billing", icon: CreditCardAcceptIcon },
      { key: "import-export", label: "Import & export", icon: BookUploadIcon },
    ],
  },
]

const PATH_ROUTED_SECTIONS: Record<string, string> = {
  "project-labels": "/settings/project-labels",
  "project-templates": "/settings/project-templates",
  statuses: "/settings/project-statuses",
}

const PATHNAME_TO_SECTION: Record<string, string> = {
  "/settings/project-labels": "project-labels",
  "/settings/project-templates": "project-templates",
  "/settings/project-statuses": "statuses",
}

function sectionHref(key: string): string {
  return PATH_ROUTED_SECTIONS[key] ?? `/settings?section=${key}`
}

// Sub-routes that should be wrapped with the settings sidebar. Other
// path-based settings routes (new-team, template editors, etc.) are
// focused flows that intentionally render full-bleed without the nav.
const SHELL_WRAPPED_PATHS = new Set([
  "/settings/project-labels",
  "/settings/project-templates",
  "/settings/project-statuses",
  "/settings/new-team",
])

const TEAM_HUB_PATTERN = /^\/settings\/teams\/[^/]+(?:\/[^/]+)?$/

function shouldWrap(pathname: string): boolean {
  if (SHELL_WRAPPED_PATHS.has(pathname)) return true
  if (TEAM_HUB_PATTERN.test(pathname)) return true
  return false
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  if (!shouldWrap(pathname)) return <>{children}</>
  return <SettingsShell>{children}</SettingsShell>
}

function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const navScrollRef = useRef<HTMLElement>(null)

  const section =
    PATHNAME_TO_SECTION[pathname] ??
    searchParams.get("section") ??
    "preferences"

  useEffect(() => {
    if (navScrollRef.current) navScrollRef.current.scrollTop = 0
  }, [])

  const onBackToApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    let returnTo: string | null = null
    try {
      returnTo = sessionStorage.getItem("settings:returnTo")
    } catch {}
    if (returnTo && !returnTo.startsWith("/settings")) {
      e.preventDefault()
      router.push(returnTo)
      return
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault()
      router.back()
    }
  }

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      <aside className="border-sidebar-border bg-sidebar flex w-56 shrink-0 flex-col border-r">
        <nav
          ref={navScrollRef}
          aria-label="Settings navigation"
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pt-3 pb-2"
        >
          <Link
            href="/"
            onClick={onBackToApp}
            className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground mb-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
            Back to app
          </Link>

          {NAV.map((group, gi) => (
            <div key={gi} className="mb-1">
              {group.title && (
                <div className="text-muted-foreground/60 mb-0.5 px-2 py-1 text-[11px] font-medium">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const active = section === item.key
                return (
                  <Link
                    key={item.key}
                    href={sectionHref(item.key)}
                    scroll={false}
                    aria-label={
                      group.title
                        ? `${item.label} (${group.title})`
                        : item.label
                    }
                    title={
                      group.title
                        ? `${item.label} (${group.title})`
                        : item.label
                    }
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                      active
                        ? "bg-sidebar-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                    }`}
                  >
                    {item.icon && (
                      <HugeiconsIcon
                        icon={item.icon}
                        className="size-3.5 shrink-0"
                      />
                    )}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col items-center overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
