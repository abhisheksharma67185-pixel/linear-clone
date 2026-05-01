"use client"

import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import type { Label as LabelType, Member } from "@/app/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { BrowserIcon, detectBrowser } from "@/lib/browser-detect"
import {
  SlackLogo,
  GitHubLogo,
  GitLabLogo,
  GoogleCalendarLogo,
  NotionLogo,
  ExternalLinkGlyph,
  ClaudeLogo,
  CopilotLogo,
  CursorLogo,
  DevinLogo,
  FactoryLogo,
  OpenAILogo,
  VSCodeLogo,
  AsanaLogo,
  ShortcutLogo,
  JiraLogo,
  LinearLogo,
  TrelloLogo,
} from "@/components/provider-icons"
import { TeamSettingsHub } from "@/components/team-settings-hub"
import { CustomizeSidebarDialog } from "@/components/customize-sidebar-dialog"
import { HelpPopover } from "@/components/help-popover"
import { compareNullSmallest } from "@/lib/members-sort"
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
  PlusSignIcon,
  ArrowRight01Icon,
  Search01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Tick02Icon,
  Copy01Icon,
  MoreHorizontalIcon,
  Delete01Icon,
  Archive01Icon,
  PencilEdit01Icon,
  Cancel01Icon,
  Flag03Icon,
  DocumentValidationIcon,
  CustomerSupportIcon,
  ActivitySparkIcon,
} from "@hugeicons/core-free-icons"

export default function SettingsClient() {
  return (
    <Suspense fallback={null}>
      <SettingsPageInner />
    </Suspense>
  )
}

type SectionKey = string

interface NavItem {
  key: SectionKey
  label: string
  icon: IconSvgElement | null
}

/**
 * base-ui Select's onValueChange is `(value: string | null, eventDetails) => void`.
 * Most consumers pipe into a `Dispatch<SetStateAction<string>>`. This helper
 * drops the `null` case so the setter always gets a real string.
 */
function onSelectChange(
  setter: Dispatch<SetStateAction<string>>
): (value: string | null) => void {
  return (value) => {
    if (value !== null) setter(value)
  }
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    items: [
      { key: "preferences", label: "Preferences", icon: Settings02Icon },
      { key: "profile", label: "Profile", icon: UserIcon },
      {
        key: "notifications",
        label: "Notifications",
        icon: Notification01Icon,
      },
      { key: "security", label: "Security & access", icon: SecurityLockIcon },
      {
        key: "connected-accounts",
        label: "Connected accounts",
        icon: Link01Icon,
      },
      {
        key: "agent-personalization",
        label: "Agent personalization",
        icon: AiBrain01Icon,
      },
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

// Some sections have been promoted to path-based routes (better deep-linking,
// unique URLs). Keep the sidebar key stable so the selected-state highlight
// still works with the existing `?section=...` state model.
const PATH_ROUTED_SECTIONS: Record<string, string> = {
  "project-labels": "/settings/project-labels",
  "project-templates": "/settings/project-templates",
  statuses: "/settings/project-statuses",
}

function sectionHref(key: SectionKey): string {
  return PATH_ROUTED_SECTIONS[key] ?? `/settings?section=${key}`
}

function sectionDisplayLabel(key: SectionKey): string {
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.key === key) return item.label
    }
  }
  if (key.startsWith("team-hub-")) return "Team settings"
  // Fallback for bespoke sections like "create-team", "security".
  return key
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
}

// Bare slugs that older docs / external links sometimes used. Linear's
// current sidebar splits these into Issues / Projects variants, so a
// `?section=labels` deep-link should always land on Issues→Labels and
// `?section=templates` on Issues→Templates rather than rendering the
// generic "settings coming soon" stub.
const SECTION_ALIASES: Record<string, string> = {
  labels: "issue-labels",
  templates: "issue-templates",
}

// Every section key the resolver below knows how to render. Anything
// not in here (and not a `team-hub-*` slug) is treated as unknown and
// redirected to Preferences so a typo'd or stale URL never silently
// shows the empty stub.
const KNOWN_SECTIONS = new Set<string>([
  "workspace",
  "teams",
  "members",
  "admin-security",
  "api",
  "applications",
  "billing",
  "import-export",
  "issue-labels",
  "issue-templates",
  "slas",
  "project-labels",
  "project-templates",
  "statuses",
  "updates",
  "ai-agents",
  "initiatives",
  "documents",
  "customer-requests",
  "pulse",
  "asks",
  "emojis",
  "integrations",
  "preferences",
  "coding-tools",
  "profile",
  "notifications",
  "security",
  "connected-accounts",
  "agent-personalization",
  "create-team",
])

function SettingsPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // Treat absent OR empty `?section=` as Preferences. Don't read any
  // last-visited fallback from storage — Linear's contract is that a
  // bare `/settings` URL always lands on Preferences regardless of
  // prior navigation.
  const sectionParam = searchParams.get("section")
  const rawSection =
    sectionParam && sectionParam.length > 0 ? sectionParam : "preferences"
  // Linear's sidebar splits Templates and Labels into Issues→… and
  // Projects→… variants; there are no bare "Templates" / "Labels"
  // surfaces. Resolve obvious aliases immediately so the sidebar
  // highlights correctly and no "coming soon" stub flashes, and also
  // rewrite the URL below so refreshing lands on the resolved slug.
  const aliased = SECTION_ALIASES[rawSection] ?? rawSection
  // Anything that isn't a known section key collapses to Preferences —
  // matches the bare `/settings` default and prevents a deep-link with
  // a typo'd or stale slug from rendering the generic stub page.
  const section =
    aliased === "" ||
    KNOWN_SECTIONS.has(aliased) ||
    aliased.startsWith("team-hub-")
      ? aliased
      : "preferences"
  const navScrollRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Rewrite alias / unknown-key URLs so a reload lands on the
    // resolved slug instead of the original (potentially stub-routed)
    // value. Skip the rewrite when nothing changed to avoid an infinite
    // replace loop.
    if (rawSection !== section) {
      const target =
        section === "preferences"
          ? "/settings?section=preferences"
          : `/settings?section=${section}`
      router.replace(target, { scroll: false })
    }
  }, [rawSection, section, router])

  const [teams, setTeams] = useState<
    { id: string; name: string; key: string }[]
  >([])
  useEffect(() => {
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then(setTeams)
      .catch(() => {})
  }, [])

  // Keep the browser tab title in sync with the active section so a deep link
  // into e.g. /settings?section=applications shows just "Applications".
  useEffect(() => {
    document.title = sectionDisplayLabel(section)
  }, [section])

  // Start the sidebar scrolled to the top on first mount so top-level items
  // (Preferences, Profile, ...) are visible without a scroll.
  useEffect(() => {
    if (navScrollRef.current) navScrollRef.current.scrollTop = 0
  }, [])

  const onBackToApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prefer the last app route the user was on; fall back to browser history,
    // then "/" as a safety net (e.g. deep-linked directly to /settings).
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
    // Else: let the Link's href="/" handle it.
  }

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      {/* Sidebar — scrollable nav + pinned footer */}
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

          {/* Your teams */}
          <div className="mt-1 mb-1">
            <div className="text-muted-foreground/60 mb-0.5 px-2 py-1 text-[11px] font-medium">
              Your teams
            </div>
            {teams
              .filter((t) => t.name.toLowerCase() === "abhishek")
              .map((t) => {
                const sectionKey = `team-hub-${t.key}`
                const active = section === sectionKey
                return (
                  <Link
                    key={t.id}
                    href={sectionHref(sectionKey)}
                    scroll={false}
                    aria-label={t.name}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                      active
                        ? "bg-sidebar-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                    }`}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-pink-500/60 text-pink-500">
                      <HugeiconsIcon icon={UserIcon} className="size-3" />
                    </span>
                    <span className="flex-1 truncate">{t.name}</span>
                  </Link>
                )
              })}
            <Link
              href="/settings/new-team"
              scroll={false}
              aria-label="Create a team"
              className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors"
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                className="size-3.5 shrink-0"
              />
              <span>Create a team</span>
            </Link>
          </div>
        </nav>

        <SettingsSidebarFooter />
      </aside>

      {/* Content */}
      <div
        data-settings-scroll-container
        className="flex min-w-0 flex-1 flex-col items-center overflow-y-auto"
      >
        <SectionContent section={section} teams={teams} />
      </div>
    </div>
  )
}

function SettingsSidebarFooter() {
  return (
    <HelpPopover
      trigger={
        <button
          type="button"
          aria-label="Help"
          style={{
            position: "fixed",
            bottom: "12px",
            left: "12px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 50,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: 1,
              display: "block",
              transform: "translateX(0.5px)",
            }}
          >
            ?
          </span>
        </button>
      }
    />
  )
}

function SectionContent({
  section,
  teams,
}: {
  section: string
  teams: { id: string; name: string; key: string }[]
}) {
  if (section === "workspace") return <WorkspaceSection />
  if (section === "teams") return <TeamsAdminSection />
  if (section === "members") return <MembersSection />
  if (section === "admin-security") return <AdminSecuritySection />
  if (section === "api") return <ApiSection />
  if (section === "applications") return <ApplicationsSection />
  if (section === "billing") return <BillingSection />
  if (section === "import-export") return <ImportExportSection />
  if (section === "issue-labels") return <IssueLabelsSection />
  if (section === "issue-templates") return <IssueTemplatesSection />
  if (section === "slas") return <SLAsSection />
  if (section === "project-labels") return <ProjectLabelsSection />
  if (section === "project-templates") return <ProjectTemplatesSection />
  if (section === "statuses") return <ProjectStatusesSection />
  if (section === "updates") return <ProjectUpdatesSection />
  if (section === "ai-agents") return <AIAgentsSection />
  if (section === "initiatives") return <InitiativesSection />
  if (section === "documents") return <DocumentsSection />
  if (section === "customer-requests") return <CustomerRequestsSection />
  if (section === "pulse") return <PulseSection />
  if (section === "asks") return <AsksSection />
  if (section === "emojis") return <EmojisSection />
  if (section === "integrations") return <IntegrationsSection />
  if (section === "preferences") return <PreferencesSection />
  if (section === "coding-tools") return <CodingToolsSection />
  if (section === "profile") return <ProfileSection />
  if (section === "notifications") return <NotificationsSection />
  if (section === "security") return <SecuritySection />
  if (section === "connected-accounts") return <ConnectedAccountsSection />
  if (section === "agent-personalization")
    return <AgentPersonalizationSection />
  if (section === "create-team") return <CreateTeamPage teams={teams} />
  if (section.startsWith("team-hub-")) {
    const teamKey = section.replace("team-hub-", "")
    const team = teams.find(
      (t) => t.key.toUpperCase() === teamKey.toUpperCase()
    )
    return (
      <TeamSettingsHubSection
        team={team ?? { id: teamKey, name: teamKey, key: teamKey }}
      />
    )
  }

  // Unknown section keys are upstream-redirected to Preferences by
  // SettingsPageInner's resolver, so this fallback should never render
  // for an end user. Render Preferences as a defensive backstop in
  // case a new code path forgets to register its section here.
  return <PreferencesSection />
}

// ─── Sections ────────────────────────────────────────────────────────────────

// Theme entries — each option in the Interface theme dropdown is shown with
// an "Aa" sample swatch and a color-dot indicator that previews the palette.
const THEME_OPTIONS: Array<{
  value: string
  label: string
  swatchClass: string
  dotClass: string
}> = [
  {
    value: "system",
    label: "System preference",
    swatchClass:
      "bg-gradient-to-r from-neutral-100 to-neutral-900 text-neutral-700",
    dotClass: "bg-gradient-to-r from-sky-400 to-violet-500",
  },
  {
    value: "light",
    label: "Light",
    swatchClass: "bg-neutral-100 text-neutral-900 ring-1 ring-neutral-200",
    dotClass: "bg-sky-400",
  },
  {
    value: "pure-light",
    label: "Pure Light",
    swatchClass: "bg-white text-neutral-900 ring-1 ring-neutral-300",
    dotClass: "bg-white ring-1 ring-neutral-300",
  },
  {
    value: "dark",
    label: "Dark",
    swatchClass: "bg-neutral-900 text-neutral-100 ring-1 ring-white/10",
    dotClass: "bg-violet-500",
  },
  {
    value: "magic-blue",
    label: "Magic Blue",
    swatchClass: "bg-[#0a1532] text-sky-200 ring-1 ring-sky-500/30",
    dotClass: "bg-sky-500",
  },
  {
    value: "classic-dark",
    label: "Classic Dark",
    swatchClass: "bg-[#1a1a1a] text-neutral-100 ring-1 ring-white/10",
    dotClass: "bg-neutral-500",
  },
  {
    value: "custom",
    label: "Custom",
    swatchClass:
      "bg-[conic-gradient(at_50%_50%,#f87171,#fbbf24,#34d399,#60a5fa,#a78bfa,#f472b6,#f87171)] text-neutral-900 ring-1 ring-white/10",
    dotClass:
      "bg-[conic-gradient(at_50%_50%,#f87171,#fbbf24,#34d399,#60a5fa,#a78bfa,#f472b6,#f87171)]",
  },
]

// Maps each Linear-style theme picker value to the underlying
// next-themes class ("light"/"dark"/"system"). Custom variants don't
// have their own CSS yet — they collapse to their nearest base. Kept
// here in addition to the provider's copy so the picker handler
// doesn't have to import from the provider module (avoids a circular
// import between the settings page and the workspace-wide provider).
const LINEAR_THEME_TO_NEXT_THEME: Record<string, string> = {
  system: "system",
  light: "light",
  "pure-light": "light",
  dark: "dark",
  "magic-blue": "dark",
  "classic-dark": "dark",
  custom: "dark",
}

const FONT_SIZE_SCALE: Record<string, number> = {
  smaller: 0.875,
  small: 0.9375,
  default: 1,
  large: 1.0625,
  larger: 1.125,
}

// Base UI's Select.Value renders the raw `value` unless given a render fn —
// these maps drive the trigger label so users see "My issues" not "my-issues".
const HOME_VIEW_LABELS: Record<string, string> = {
  "linear-agent": "Linear Agent",
  inbox: "Inbox",
  "my-issues": "My issues",
  "all-issues": "All issues",
  "active-issues": "Active issues",
  "current-cycle": "Current cycle",
  projects: "Projects",
  initiatives: "Initiatives",
}

const DISPLAY_NAMES_LABELS: Record<string, string> = {
  fullname: "Full name",
  username: "Username",
}

const FIRST_DAY_LABELS: Record<string, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
}

const SEND_COMMENT_LABELS: Record<string, string> = {
  enter: "Enter",
  "cmd-enter": "⌘+Enter",
}

const FONT_SIZE_LABELS: Record<string, string> = {
  smaller: "Smaller",
  small: "Small",
  default: "Default",
  large: "Large",
  larger: "Larger",
}

function PreferencesSection() {
  const router = useRouter()
  const [homeView, setHomeView] = usePersistedState(
    "linear:default-home-view",
    "active-issues"
  )
  const [displayNames, setDisplayNames] = useState("fullname")
  const [firstDay, setFirstDay] = useState("monday")
  // Toggles on this page must round-trip through localStorage — Linear
  // persists these across reloads. The dropdowns above (homeView,
  // fontSize) already use usePersistedState; bringing the toggles in
  // line keeps the persistence contract consistent.
  const [textEmoticons, setTextEmoticons] = usePersistedState(
    "linear:pref:textEmoticons",
    true
  )
  const [sendOn, setSendOn] = useState("enter")
  const [fontSize, setFontSize] = usePersistedState(
    "linear:font-size",
    "default"
  )
  const [pointerCursors, setPointerCursors] = usePersistedState(
    "linear:pref:pointerCursors",
    false
  )
  const [theme, setTheme] = usePersistedState("linear:theme", "system")
  // Mirror picker selection into next-themes so the page actually
  // recolors. The provider's LinearThemeSync handles initial-load
  // application; this effect handles in-session changes.
  const { setTheme: setAppliedTheme } = useTheme()
  useEffect(() => {
    const next = LINEAR_THEME_TO_NEXT_THEME[theme]
    if (next) setAppliedTheme(next)
  }, [theme, setAppliedTheme])
  const [desktopApp, setDesktopApp] = usePersistedState(
    "linear:pref:desktopApp",
    false
  )
  const [autoAssign, setAutoAssign] = usePersistedState(
    "linear:pref:autoAssign",
    false
  )
  const [gitFormat, setGitFormat] = useState("title")
  const [gitBranchMove, setGitBranchMove] = usePersistedState(
    "linear:pref:gitBranchMove",
    false
  )
  const [codingToolMove, setCodingToolMove] = usePersistedState(
    "linear:pref:codingToolMove",
    false
  )
  const [startedAssign, setStartedAssign] = usePersistedState(
    "linear:pref:startedAssign",
    false
  )
  const [customizeOpen, setCustomizeOpen] = useState(false)

  // Wire the Font size dropdown into the root font-size scale CSS variable so
  // every text-* utility resizes together. Cleanup resets to the page default
  // when the user navigates away.
  useEffect(() => {
    if (typeof document === "undefined") return
    const scale = FONT_SIZE_SCALE[fontSize] ?? 1
    document.documentElement.style.setProperty(
      "--font-size-scale",
      String(scale)
    )
  }, [fontSize])

  const goToCodingTools = () =>
    router.push("/settings?section=coding-tools", { scroll: false })

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Preferences</h1>
      </div>

      {/* General */}
      <SettingsCard title="General">
        <SettingsRow
          label="Default home view"
          description="Select which view to display when launching Linear"
        >
          <Select value={homeView} onValueChange={onSelectChange(setHomeView)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue>
                {(v) => HOME_VIEW_LABELS[v as string] ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear-agent">Linear Agent</SelectItem>
              <SelectItem value="inbox">Inbox</SelectItem>
              <SelectItem value="my-issues">My issues</SelectItem>
              <SelectItem value="all-issues">All issues</SelectItem>
              <SelectItem value="active-issues">Active issues</SelectItem>
              <SelectItem value="current-cycle">Current cycle</SelectItem>
              <SelectItem value="projects">Projects</SelectItem>
              <SelectItem value="initiatives">Initiatives</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="Display names"
          description="Select how names are displayed in the Linear interface"
        >
          <Select
            value={displayNames}
            onValueChange={onSelectChange(setDisplayNames)}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue>
                {(v) => DISPLAY_NAMES_LABELS[v as string] ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fullname">Full name</SelectItem>
              <SelectItem value="username">Username</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="First day of the week"
          description="Used for date pickers"
        >
          <Select value={firstDay} onValueChange={onSelectChange(setFirstDay)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue>
                {(v) => FIRST_DAY_LABELS[v as string] ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sunday">Sunday</SelectItem>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="tuesday">Tuesday</SelectItem>
              <SelectItem value="wednesday">Wednesday</SelectItem>
              <SelectItem value="thursday">Thursday</SelectItem>
              <SelectItem value="friday">Friday</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="Convert text emoticons into emojis"
          description="Strings like :) will be converted to 🙂"
        >
          <Switch checked={textEmoticons} onCheckedChange={setTextEmoticons} />
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="Send comment on…"
          description="Choose which key press is used to submit a comment"
        >
          <Select value={sendOn} onValueChange={onSelectChange(setSendOn)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue>
                {(v) => SEND_COMMENT_LABELS[v as string] ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enter">Enter</SelectItem>
              <SelectItem value="cmd-enter">⌘+Enter</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsCard>

      {/* Interface and theme */}
      <SettingsCard title="Interface and theme">
        <SettingsRow
          label="App sidebar"
          description="Customize sidebar item visibility, ordering, and badge style"
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setCustomizeOpen(true)}
          >
            Customize
          </Button>
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="Font size"
          description="Adjust the size of text across the app"
        >
          <Select value={fontSize} onValueChange={onSelectChange(setFontSize)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue>
                {(v) => FONT_SIZE_LABELS[v as string] ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smaller">Smaller</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="larger">Larger</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="Use pointer cursors"
          description="Change the cursor to a pointer when hovering over any interactive elements"
        >
          <Switch
            checked={pointerCursors}
            onCheckedChange={setPointerCursors}
          />
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="Interface theme"
          description="Select or customize your interface color scheme"
        >
          <Select value={theme} onValueChange={onSelectChange(setTheme)}>
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue>
                {(v) => {
                  const opt = THEME_OPTIONS.find((o) => o.value === v)
                  if (!opt) return v
                  return (
                    <>
                      <span
                        aria-hidden
                        className={`inline-flex h-4 w-5 shrink-0 items-center justify-center rounded text-[9px] font-medium ${opt.swatchClass}`}
                      >
                        Aa
                      </span>
                      <span>{opt.label}</span>
                    </>
                  )
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span
                    aria-hidden
                    className={`inline-flex h-4 w-5 shrink-0 items-center justify-center rounded text-[9px] font-medium ${opt.swatchClass}`}
                  >
                    Aa
                  </span>
                  <span
                    aria-hidden
                    className={`inline-block size-2 shrink-0 rounded-full ${opt.dotClass}`}
                  />
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsCard>

      {/* Desktop application */}
      <SettingsCard title="Desktop application">
        <SettingsRow
          label="Open in desktop app"
          description="Automatically open links in desktop app when possible"
        >
          <Switch checked={desktopApp} onCheckedChange={setDesktopApp} />
        </SettingsRow>
      </SettingsCard>

      {/* Coding tools */}
      <SettingsCard title="Coding tools">
        <Link
          href="/settings?section=coding-tools"
          scroll={false}
          onClick={(e) => {
            if (
              e.metaKey ||
              e.ctrlKey ||
              e.shiftKey ||
              e.altKey ||
              e.button !== 0
            ) {
              return
            }
            e.preventDefault()
            goToCodingTools()
          }}
          className="flex w-full items-center justify-between py-0.5 text-left transition-colors hover:opacity-70"
        >
          <div className="min-w-0">
            <div className="text-sm font-medium">Configure coding tools</div>
            <div className="text-muted-foreground text-xs">
              Configure tools which can be opened from Linear
            </div>
          </div>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="text-muted-foreground size-3.5"
          />
        </Link>
      </SettingsCard>

      {/* Automations and workflows */}
      <SettingsCard title="Automations and workflows">
        <SettingsRow
          label="Auto-assign to self"
          description="When creating new issues, always assign them to yourself by default"
        >
          <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="Git attachment format"
          description="The format of GitHub/GitLab attachments on issues"
        >
          <Select
            value={gitFormat}
            onValueChange={onSelectChange(setGitFormat)}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="title-repo">Title + Repository</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="On git branch copy, move issue to started status"
          description="After copying the git branch name, issue status is moved to the team’s first started workflow status. Hold ⌥ to disable."
        >
          <Switch checked={gitBranchMove} onCheckedChange={setGitBranchMove} />
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="On open in coding tool, move issue to started status"
          description="After opening an issue in a coding tool or copying as prompt, issue status is moved to the team’s first started workflow status. Hold ⌥ to disable."
        >
          <Switch
            checked={codingToolMove}
            onCheckedChange={setCodingToolMove}
          />
        </SettingsRow>
        <Separator />
        <SettingsRow
          label="On move to started status, assign to yourself"
          description="When you move an unassigned issue to started, it will be automatically assigned to you"
        >
          <Switch checked={startedAssign} onCheckedChange={setStartedAssign} />
        </SettingsRow>
      </SettingsCard>

      <CustomizeSidebarDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
      />
    </div>
  )
}

type CodingToolRow = {
  key: string
  label: string
  description: string
  /** Brand-logo SVG to render inside the icon tile. */
  Logo?: (props: { className?: string }) => React.ReactElement
  /** Tile background — used as a backdrop for either the logo or `abbr`. */
  tileClass: string
  /** Two-letter fallback shown when the tool has no dedicated logo. */
  abbr?: string
  /** Whether the tool is enabled by default in the mock. */
  defaultEnabled?: boolean
}

const CODING_TOOLS: readonly CodingToolRow[] = [
  {
    key: "amp",
    label: "Amp",
    description: "Opens in your terminal. Requires the desktop app.",
    tileClass: "bg-amber-500",
    abbr: "AM",
  },
  {
    key: "claude-code",
    label: "Claude Code",
    description: "Opens in your terminal. Requires the desktop app.",
    Logo: ClaudeLogo,
    tileClass: "bg-[#cc785c]",
  },
  {
    key: "codex-cli",
    label: "Codex CLI",
    description: "Opens in your terminal. Requires the desktop app.",
    Logo: OpenAILogo,
    tileClass: "bg-black",
  },
  {
    key: "codex-desktop",
    label: "Codex desktop",
    description: "Opens in the Codex desktop app.",
    Logo: OpenAILogo,
    tileClass: "bg-black",
  },
  {
    key: "conductor",
    label: "Conductor",
    description: "Opens in the Conductor desktop app.",
    tileClass: "bg-blue-600",
    abbr: "CN",
  },
  {
    key: "cursor",
    label: "Cursor",
    description: "Opens in the Cursor desktop app.",
    Logo: CursorLogo,
    tileClass: "bg-neutral-900",
  },
  {
    key: "devin",
    label: "Devin",
    description: "Opens on devin.ai.",
    Logo: DevinLogo,
    tileClass: "bg-violet-600",
  },
  {
    key: "factory",
    label: "Factory",
    description: "Opens in the Factory desktop app.",
    Logo: FactoryLogo,
    tileClass: "bg-emerald-700",
  },
  {
    key: "copilot",
    label: "GitHub Copilot",
    description: "Opens in VS Code.",
    Logo: CopilotLogo,
    tileClass: "bg-neutral-800",
  },
  {
    key: "lovable",
    label: "Lovable",
    description: "Opens on lovable.dev.",
    tileClass: "bg-rose-500",
    abbr: "LO",
  },
  {
    key: "github",
    label: "GitHub",
    description: "Link commits, branches, and pull requests.",
    Logo: GitHubLogo,
    tileClass: "bg-[#24292e]",
    defaultEnabled: true,
  },
  {
    key: "gitlab",
    label: "GitLab",
    description: "Link commits, branches, and merge requests.",
    Logo: GitLabLogo,
    tileClass: "bg-[#FC6D26]",
  },
  {
    key: "vscode",
    label: "VS Code",
    description: "Open issues in VS Code.",
    Logo: VSCodeLogo,
    tileClass: "bg-[#1f6feb]",
  },
  {
    key: "zed",
    label: "Zed",
    description: "Open issues in Zed.",
    tileClass: "bg-emerald-600",
    abbr: "ZD",
  },
] as const

function CodingToolsSection() {
  const [enabled, setEnabled] = usePersistedState<Record<string, boolean>>(
    "linear:coding-tools-enabled",
    Object.fromEntries(
      CODING_TOOLS.map((tool) => [tool.key, tool.defaultEnabled ?? false])
    )
  )

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Coding tools</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tools enabled here can be used to work on issues from the issue page.
        </p>
      </div>

      <div className="flex flex-col rounded-lg border">
        {CODING_TOOLS.map((tool, index) => (
          <div
            key={tool.key}
            className={`flex items-center justify-between gap-4 px-4 py-3${
              index !== CODING_TOOLS.length - 1 ? "border-b" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white ${tool.tileClass}`}
                aria-hidden
              >
                {tool.Logo ? <tool.Logo className="size-5" /> : tool.abbr}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{tool.label}</div>
                <div className="text-muted-foreground text-xs">
                  {tool.description}
                </div>
              </div>
            </div>
            <Switch
              checked={enabled[tool.key] ?? false}
              onCheckedChange={(checked) =>
                setEnabled((prev) => ({ ...prev, [tool.key]: checked }))
              }
              aria-label={`${tool.label} enabled`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileSection() {
  // Profile name + username persist locally so refreshing /settings
  // doesn't lose what the user typed. Linear writes these to its
  // backend; the clone has no profile API, so localStorage is the
  // pragmatic equivalent.
  const [name, setName] = usePersistedState(
    "linear:profile:name",
    "Theta Computer"
  )
  const [username, setUsername] = usePersistedState(
    "linear:profile:username",
    "theta.computer01"
  )
  const email = "theta.computer01@gmail.com"
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [changeEmailOpen, setChangeEmailOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
    e.target.value = ""
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
      </div>

      <div className="divide-border divide-y rounded-lg border">
        {/* Profile picture */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium">Profile picture</span>
          <div className="group/avatar flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-border text-muted-foreground hover:text-foreground bg-background pointer-events-none flex h-7 items-center rounded-md border px-2 text-xs opacity-0 transition-opacity group-hover/avatar:pointer-events-auto group-hover/avatar:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
              aria-label="Upload an avatar"
            >
              Upload an avatar
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload profile picture"
              className="hover:ring-foreground/20 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white transition-all select-none hover:ring-2"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium">Email</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{email}</span>
            <button
              type="button"
              onClick={() => setChangeEmailOpen(true)}
              aria-label="Change email"
              className="bg-muted/40 text-muted-foreground hover:bg-muted flex size-6 items-center justify-center rounded-md border"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-3 fill-current"
                aria-hidden="true"
              >
                <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354zm.132 3.387L11.12 4.435 4.275 11.28a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.25.25 0 0 0 .108-.065z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Full name */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium">Full name</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-52 text-sm"
          />
        </div>

        {/* Username */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm font-medium">Username</div>
            <div className="text-muted-foreground text-xs">
              One word, like a nickname or first name
            </div>
          </div>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-9 w-52 text-sm"
          />
        </div>
      </div>

      {/* Workspace access */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Workspace access</h2>
        <div className="rounded-lg border px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Remove yourself from workspace
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive h-8 text-xs"
            >
              Leave workspace
            </Button>
          </div>
        </div>
      </div>

      <ChangeEmailDialog
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
        currentEmail={email}
      />
    </div>
  )
}

function ChangeEmailDialog({
  open,
  onOpenChange,
  currentEmail,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEmail: string
}) {
  const [newEmail, setNewEmail] = useState("")

  const handleOpenChange = (next: boolean) => {
    if (!next) setNewEmail("")
    onOpenChange(next)
  }

  const isValid =
    newEmail.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim()) &&
    newEmail.trim().toLowerCase() !== currentEmail.toLowerCase()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
        </DialogHeader>
        <div className="text-muted-foreground flex flex-col gap-2 text-xs/relaxed">
          <p>
            If you&apos;d like to change the email address for your account,
            we&apos;ll send a verification link to your new email address. This
            change will apply across all workspaces that you are a member of.
          </p>
          <p>
            Please check if the new email address is tied to an existing account
            before proceeding with the change.
          </p>
        </div>
        <div className="flex flex-col gap-2 py-1">
          <Label htmlFor="change-email-input" className="text-xs font-medium">
            Enter the new email address you&apos;d like to use.
          </Label>
          <Input
            id="change-email-input"
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            className="h-9 text-sm"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!isValid} onClick={() => handleOpenChange(false)}>
            Check for existing account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const NOTIFICATION_CHANNELS = [
  {
    key: "desktop",
    label: "Desktop",
    status: "Disabled",
    enabled: false,
    subheading:
      "Applies across all your desktop devices with notifications enabled",
  },
  {
    key: "mobile",
    label: "Mobile",
    status: "Enabled for all notifications",
    enabled: true,
    subheading:
      "Applies across all your mobile devices with notifications enabled",
  },
  {
    key: "email",
    label: "Email",
    status: "Enabled for all notifications",
    enabled: true,
    subheading: "Notifications sent to your email address",
  },
  {
    key: "slack",
    label: "Slack",
    status: "Disabled",
    enabled: false,
    subheading: "Notifications delivered via Slack",
  },
] as const

type NotificationChannelKey = (typeof NOTIFICATION_CHANNELS)[number]["key"]

const NOTIFICATION_CATEGORIES = [
  {
    key: "assignments",
    label: "Assignments",
    description: "Assignments, unassignments, and membership changes",
  },
  {
    key: "status",
    label: "Status changes",
    description:
      "Changes to the status, priority, and blocking relationships of issues",
  },
  {
    key: "comments",
    label: "Comments and replies",
    description: "Comments, replies, and thread resolutions",
  },
  {
    key: "mentions",
    label: "Mentions",
    description: "Mentions in comments or content",
  },
  {
    key: "reactions",
    label: "Reactions",
    description: "Emoji reactions to your content",
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    description:
      "Issues, projects, initiatives, teams, and views you're subscribed to",
  },
  {
    key: "documents",
    label: "Document changes",
    description: "Changes to document content, location, and subscriptions",
  },
  {
    key: "updates",
    label: "Updates",
    description:
      "New project & initiative updates and reminders to post an update",
  },
  {
    key: "reminders",
    label: "Reminders and deadlines",
    description: "Reminders, due dates, and SLA updates",
  },
  {
    key: "apps",
    label: "Apps and integrations",
    description: "Notifications from apps and integrations you've installed",
  },
] as const

function useChannelToggles(channel: NotificationChannelKey) {
  const storageKey = `linear.notif.${channel}`
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c.key, true]))
  )
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, boolean>
        // eslint-disable-next-line react-hooks/set-state-in-effect -- load on mount
        setToggles((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
    setHydrated(true)
  }, [storageKey])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(toggles))
    } catch {}
  }, [storageKey, toggles, hydrated])

  const setToggle = (key: string, value: boolean) =>
    setToggles((prev) => ({ ...prev, [key]: value }))

  return { toggles, setToggle }
}

function NotificationsSection() {
  const searchParams = useSearchParams()
  const channelParam = searchParams.get("channel")
  const channel = NOTIFICATION_CHANNELS.find((c) => c.key === channelParam)

  if (channel) {
    return <NotificationChannelDetail channel={channel} />
  }
  return <NotificationsListView />
}

function NotificationsListView() {
  const router = useRouter()
  // Per-toggle persistence so flipping any of these survives reload.
  const [showSidebar, setShowSidebar] = usePersistedState(
    "linear:notif:showSidebar",
    true
  )
  const [newsletter, setNewsletter] = usePersistedState(
    "linear:notif:newsletter",
    false
  )
  const [marketing, setMarketing] = usePersistedState(
    "linear:notif:marketing",
    true
  )
  const [inviteAccepted, setInviteAccepted] = usePersistedState(
    "linear:notif:inviteAccepted",
    true
  )
  const [privacyUpdates, setPrivacyUpdates] = usePersistedState(
    "linear:notif:privacyUpdates",
    true
  )
  const [dpa, setDpa] = usePersistedState("linear:notif:dpa", false)

  const openChannel = (key: NotificationChannelKey) => {
    router.push(`/settings?section=notifications&channel=${key}`, {
      scroll: false,
    })
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Notifications</h1>
      </div>

      {/* Notification channels */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Notification channels</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Choose how to be notified for workspace activity. Notifications will
          always go to your Linear inbox.
        </p>
        <div className="divide-border divide-y rounded-lg border">
          {NOTIFICATION_CHANNELS.map((ch) => (
            <button
              key={ch.key}
              type="button"
              onClick={() => openChannel(ch.key)}
              aria-label={`Configure ${ch.label} notifications`}
              className="hover:bg-accent/30 flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors"
            >
              <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                <ChannelIcon type={ch.key} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{ch.label}</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${ch.enabled ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
                  />
                  <span className="text-muted-foreground text-xs">
                    {ch.status}
                  </span>
                </div>
              </div>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="text-muted-foreground/50 size-4 shrink-0"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Updates from Linear */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Updates from Linear</h2>
        <p className="text-muted-foreground mb-4 text-xs">
          Subscribe to product announcements and important changes from the
          Linear team
        </p>

        <div className="mb-2 text-sm font-medium">Changelog</div>
        <div className="divide-border mb-4 divide-y rounded-lg border">
          <NotifToggleRow
            label="Show updates in sidebar"
            description="Highlight new features and improvements in the app sidebar"
            checked={showSidebar}
            onCheckedChange={setShowSidebar}
          />
          <NotifToggleRow
            label="Changelog newsletter"
            description="Receive an email twice a month highlighting new features and improvements"
            checked={newsletter}
            onCheckedChange={setNewsletter}
          />
        </div>

        <div className="mb-2 text-sm font-medium">Marketing</div>
        <div className="divide-border mb-4 divide-y rounded-lg border">
          <NotifToggleRow
            label="Marketing and onboarding"
            description="Occasional emails to help you get the most out of Linear"
            checked={marketing}
            onCheckedChange={setMarketing}
          />
        </div>

        <div className="mb-2 text-sm font-medium">Other updates</div>
        <div className="divide-border divide-y rounded-lg border">
          <NotifToggleRow
            label="Invite accepted"
            description="Email when invitees accept an invite"
            checked={inviteAccepted}
            onCheckedChange={setInviteAccepted}
          />
          <NotifToggleRow
            label="Privacy and legal updates"
            description="Email when privacy policies or terms of service change"
            checked={privacyUpdates}
            onCheckedChange={setPrivacyUpdates}
          />
          <NotifToggleRow
            label="Data processing agreement (DPA)"
            description="Email when our DPA changes"
            checked={dpa}
            onCheckedChange={setDpa}
          />
        </div>
      </div>
    </div>
  )
}

function NotificationChannelDetail({
  channel,
}: {
  channel: (typeof NOTIFICATION_CHANNELS)[number]
}) {
  const router = useRouter()
  const { toggles, setToggle } = useChannelToggles(channel.key)

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <button
        type="button"
        onClick={() =>
          router.push("/settings?section=notifications", { scroll: false })
        }
        className="text-muted-foreground hover:text-foreground -ml-1 flex w-fit items-center gap-1 rounded-md px-1 py-0.5 text-xs transition-colors"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Notifications
      </button>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{channel.label}</h1>
        <p className="text-muted-foreground text-xs">{channel.subheading}</p>
      </div>

      {channel.key === "desktop" && (
        <div className="border-border bg-muted/30 flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
          <span className="text-muted-foreground text-xs">
            Desktop notifications require an installation of Linear Desktop
          </span>
          <a
            href="https://linear.app/download"
            target="_blank"
            rel="noreferrer noopener"
            className="text-foreground inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap hover:opacity-70"
          >
            Get Linear Desktop
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
          </a>
        </div>
      )}

      {channel.key === "slack" && (
        <div className="border-border bg-muted/30 flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
          <span className="text-muted-foreground text-xs">
            Connect Slack to receive notifications in your workspace
          </span>
          <button
            type="button"
            className="text-foreground inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap hover:opacity-70"
          >
            Connect Slack
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
          </button>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold">General notifications</h2>
        <div className="divide-border divide-y rounded-lg border">
          {NOTIFICATION_CATEGORIES.map((cat) => (
            <NotifToggleRow
              key={cat.key}
              label={cat.label}
              description={cat.description}
              checked={toggles[cat.key] ?? true}
              onCheckedChange={(v) => setToggle(cat.key, v)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function NotifToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-muted-foreground text-xs">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function ChannelIcon({ type }: { type: string }) {
  if (type === "desktop")
    return (
      <svg
        viewBox="0 0 20 20"
        className="text-muted-foreground size-4 fill-current"
        aria-hidden="true"
      >
        <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h13A1.5 1.5 0 0 1 18 4.5v8A1.5 1.5 0 0 1 16.5 14H12v1.5h1a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1 0-1.5h1V14H3.5A1.5 1.5 0 0 1 2 12.5v-8Zm1.5 0v8h13v-8h-13Z" />
      </svg>
    )
  if (type === "mobile")
    return (
      <svg
        viewBox="0 0 20 20"
        className="text-muted-foreground size-4 fill-current"
        aria-hidden="true"
      >
        <path d="M7 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm0 1.5h6a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5ZM10 15a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
      </svg>
    )
  if (type === "email")
    return (
      <svg
        viewBox="0 0 20 20"
        className="text-muted-foreground size-4 fill-current"
        aria-hidden="true"
      >
        <path d="M3 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3Zm0 1.5h14a.5.5 0 0 1 .5.5v.51l-7.5 4.875L2.5 6.51V6a.5.5 0 0 1 .5-.5ZM2.5 8.25l7.13 4.635a.75.75 0 0 0 .74 0L17.5 8.25V14a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V8.25Z" />
      </svg>
    )
  if (type === "slack")
    return (
      <svg
        viewBox="0 0 20 20"
        className="text-muted-foreground size-4 fill-current"
        aria-hidden="true"
      >
        <path d="M7.077 11.227a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h1.34v1.34Zm.67 0a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34v-3.35Zm1.34-4.704a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v1.34H9.087Zm0 .67a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H5.737a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35Zm4.703 1.34a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H12.45V8.533Zm-.67 0a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V5.183a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35Zm-1.34 4.704a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V12.9h1.34Zm0-.67a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H11.78Z" />
      </svg>
    )
  return null
}

type SecuritySession = {
  id: string
  userAgent: string
  city: string
  countryCode: string
  isCurrent: boolean
  lastSeenAt: string
}

type SecurityPasskey = {
  id: string
  name: string
  createdAt: string
}

type SecurityApiKey = {
  id: string
  name: string
  lastFour: string
  expiresAt: string | null
  createdAt: string
  // token is only populated on the freshly-created key; never rendered from list.
  token?: string
}

function SecuritySection() {
  const [sessions, setSessions] = useState<SecuritySession[]>([])
  const [passkeys, setPasskeys] = useState<SecurityPasskey[]>([])
  const [apiKeys, setApiKeys] = useState<SecurityApiKey[]>([])
  const [newApiKeyOpen, setNewApiKeyOpen] = useState(false)
  const [revealedKey, setRevealedKey] = useState<SecurityApiKey | null>(null)
  const [registering, setRegistering] = useState(false)
  // `loading` gates the empty-state copy in each section so we don't
  // briefly flash "No active sessions" / "No passkeys registered" /
  // "No API keys created" before the parallel fetches resolve.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [s, p, k] = await Promise.all([
          fetch("/api/sessions").then((r) => r.json()),
          fetch("/api/passkeys").then((r) => r.json()),
          fetch("/api/personal-api-keys").then((r) => r.json()),
        ])
        if (cancelled) return
        setSessions(s)
        setPasskeys(p)
        setApiKeys(k)
      } catch {
        /* ignore — keep empty state */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogoutSession = async (id: string, label: string) => {
    const prev = sessions
    setSessions((s) => s.filter((x) => x.id !== id))
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success(`Signed out of ${label}`)
    } catch {
      setSessions(prev)
      toast.error("Failed to sign out")
    }
  }

  const handleRegisterPasskey = async () => {
    if (registering) return
    setRegistering(true)
    try {
      const optsRes = await fetch("/api/passkeys/register/options", {
        method: "POST",
      })
      if (!optsRes.ok) throw new Error("options")
      const opts = await optsRes.json()

      const publicKey: PublicKeyCredentialCreationOptions = {
        ...opts,
        challenge: base64UrlToBuffer(opts.challenge),
        user: {
          ...opts.user,
          id: base64UrlToBuffer(opts.user.id),
        },
      }

      const cred = (await navigator.credentials.create({
        publicKey,
      })) as PublicKeyCredential | null
      if (!cred) throw new Error("no-credential")

      const saveRes = await fetch("/api/passkeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId: cred.id }),
      })
      if (!saveRes.ok) throw new Error("save")
      const pk = (await saveRes.json()) as SecurityPasskey
      setPasskeys((list) => [...list, pk])
      toast.success("Passkey registered")
    } catch {
      toast.error("Registration cancelled or timed out")
    } finally {
      setRegistering(false)
    }
  }

  const handleRevokePasskey = async (id: string) => {
    const prev = passkeys
    setPasskeys((list) => list.filter((p) => p.id !== id))
    try {
      const res = await fetch(`/api/passkeys/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Passkey removed")
    } catch {
      setPasskeys(prev)
      toast.error("Failed to remove passkey")
    }
  }

  const handleCreateApiKey = async (name: string, expiresAt: string | null) => {
    const res = await fetch("/api/personal-api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, expiresAt }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || "Failed to create key")
    }
    const key = (await res.json()) as SecurityApiKey
    setApiKeys((list) => [...list, { ...key, token: undefined }])
    setRevealedKey(key)
    setNewApiKeyOpen(false)
    toast.success("API key created")
  }

  const handleRevokeApiKey = async (id: string, name: string) => {
    const prev = apiKeys
    setApiKeys((list) => list.filter((k) => k.id !== id))
    try {
      const res = await fetch(`/api/personal-api-keys/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success(`Revoked "${name}"`)
    } catch {
      setApiKeys(prev)
      toast.error("Failed to revoke API key")
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-xl font-semibold">Security &amp; access</h1>
      </div>

      {/* Sessions */}
      <section>
        <h2 className="mb-1 text-sm font-semibold">Sessions</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Devices logged into your account
        </p>
        <div className="divide-border divide-y rounded-lg border">
          {loading ? (
            <div className="flex flex-col gap-1 p-3">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ) : (
            <>
              {sessions.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  onLogout={handleLogoutSession}
                />
              ))}
              {sessions.length === 0 && (
                <div className="text-muted-foreground px-4 py-3 text-sm">
                  No active sessions
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Passkeys */}
      <section>
        <h2 className="mb-1 text-sm font-semibold">Passkeys</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Passkeys are a secure way to sign in to your Linear account
        </p>
        <div className="rounded-lg border">
          {loading ? (
            <div className="flex flex-col gap-1 p-3">
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ) : passkeys.length === 0 ? (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground text-sm">
                No passkeys registered
              </span>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Register a new passkey"
                disabled={registering}
                onClick={handleRegisterPasskey}
                className="h-8 text-xs font-medium"
              >
                {registering ? "Registering…" : "New passkey"}
              </Button>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {passkeys.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-muted-foreground text-xs">
                      Created {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove passkey ${p.name}`}
                    onClick={() => handleRevokePasskey(p.id)}
                    className="text-destructive hover:text-destructive h-7 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex justify-end px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Register a new passkey"
                  disabled={registering}
                  onClick={handleRegisterPasskey}
                  className="h-7 text-xs font-medium"
                >
                  {registering ? "Registering…" : "New passkey"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Personal API keys */}
      <section>
        <h2 className="mb-1 text-sm font-semibold">Personal API keys</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Use Linear&apos;s GraphQL API to build your own integrations
        </p>
        <div className="rounded-lg border">
          {loading ? (
            <div className="flex flex-col gap-1 p-3">
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground text-sm">
                No API keys created
              </span>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Create a new API key"
                onClick={() => setNewApiKeyOpen(true)}
                className="h-8 text-xs font-medium"
              >
                New API key
              </Button>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {apiKeys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium">{k.name}</div>
                    <div className="text-muted-foreground text-xs">
                      ••••{k.lastFour} · Created{" "}
                      {new Date(k.createdAt).toLocaleDateString()}
                      {k.expiresAt
                        ? ` · Expires ${new Date(k.expiresAt).toLocaleDateString()}`
                        : ""}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Revoke API key ${k.name}`}
                    onClick={() => handleRevokeApiKey(k.id, k.name)}
                    className="text-destructive hover:text-destructive h-7 text-xs"
                  >
                    Revoke
                  </Button>
                </div>
              ))}
              <div className="flex justify-end px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Create a new API key"
                  onClick={() => setNewApiKeyOpen(true)}
                  className="h-7 text-xs font-medium"
                >
                  New API key
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Authorized applications */}
      <section>
        <h2 className="mb-1 text-sm font-semibold">Authorized applications</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          OAuth applications you&apos;ve approved
        </p>
        <div className="rounded-lg border px-4 py-3">
          <p className="text-muted-foreground text-sm">
            No applications have been authorized to connect with your account.
          </p>
        </div>
      </section>

      <NewApiKeyDialog
        // Remount on open transition so local form state resets fresh.
        key={String(newApiKeyOpen)}
        open={newApiKeyOpen}
        onOpenChange={setNewApiKeyOpen}
        onCreate={handleCreateApiKey}
      />
      <RevealApiKeyDialog
        key={revealedKey?.id ?? "closed"}
        apiKey={revealedKey}
        onClose={() => setRevealedKey(null)}
      />
    </div>
  )
}

function SessionRow({
  session,
  onLogout,
}: {
  session: SecuritySession
  onLogout: (id: string, label: string) => void
}) {
  // Browser/OS detected from the session's userAgent (server-provided), not
  // from window.navigator, so the row reflects the actual device that's logged
  // in rather than the one viewing this page.
  const info = detectBrowser(session.userAgent)
  const location = [session.city, session.countryCode]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="group/session flex items-center gap-3 px-4 py-3">
      <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <BrowserIcon browser={info.browser} className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{info.label}</div>
        <div
          className="mt-0.5 flex items-center gap-1"
          role="status"
          aria-live="polite"
        >
          <span
            className={`size-1.5 rounded-full ${session.isCurrent ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
            aria-hidden="true"
          />
          <span
            className={`text-xs ${session.isCurrent ? "text-emerald-500" : "text-muted-foreground"}`}
          >
            {session.isCurrent ? "Current session" : "Signed in"}
          </span>
          {location && (
            <span className="text-muted-foreground text-xs">
              &nbsp;· {location}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Log out of ${info.label}`}
        onClick={() => onLogout(session.id, info.label)}
        className="text-muted-foreground hover:text-foreground h-7 text-xs opacity-0 transition-opacity group-hover/session:opacity-100 focus-visible:opacity-100"
      >
        Log out
      </Button>
    </div>
  )
}

function NewApiKeyDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, expiresAt: string | null) => Promise<void>
}) {
  const [name, setName] = useState("")
  const [expiration, setExpiration] = useState<"30" | "90" | "365" | "never">(
    "90"
  )
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    try {
      const expiresAt =
        expiration === "never"
          ? null
          : new Date(
              Date.now() + Number(expiration) * 24 * 60 * 60 * 1000
            ).toISOString()
      await onCreate(name.trim(), expiresAt)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create key")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New API key</DialogTitle>
          <DialogDescription>
            Create a personal API key to authenticate against Linear&apos;s
            GraphQL API.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-api-key-label" className="text-xs font-medium">
              Label
            </Label>
            <Input
              id="new-api-key-label"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Local scripts"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-api-key-expiry" className="text-xs font-medium">
              Expiration
            </Label>
            <Select
              value={expiration}
              onValueChange={(v) =>
                setExpiration(v as "30" | "90" | "365" | "never")
              }
            >
              <SelectTrigger id="new-api-key-expiry" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="never">No expiration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || submitting}>
            {submitting ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RevealApiKeyDialog({
  apiKey,
  onClose,
}: {
  apiKey: SecurityApiKey | null
  onClose: () => void
}) {
  // Parent passes a key tied to the apiKey id, so `copied` resets fresh
  // whenever a new token is revealed (and on close).
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!apiKey?.token) return
    try {
      await navigator.clipboard.writeText(apiKey.token)
      setCopied(true)
      toast.success("API key copied to clipboard")
    } catch {
      toast.error("Failed to copy — select the token manually")
    }
  }

  return (
    <Dialog open={!!apiKey} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API key created</DialogTitle>
          <DialogDescription>
            Copy your new API key now. For security reasons, it won&apos;t be
            shown again.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="border-border bg-muted/40 flex items-center gap-2 rounded-md border px-3 py-2">
            <code className="text-foreground flex-1 truncate font-mono text-xs">
              {apiKey?.token}
            </code>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy API key"
              onClick={copy}
              className="shrink-0"
            >
              <HugeiconsIcon
                icon={Copy01Icon}
                className="size-3.5"
                strokeWidth={2}
              />
            </Button>
          </div>
          {copied && (
            <p className="text-muted-foreground text-xs">Copied to clipboard</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function base64UrlToBuffer(value: string): ArrayBuffer {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4))
  const base64 = (value + pad).replace(/-/g, "+").replace(/_/g, "/")
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

type Provider = {
  id: "slack" | "github" | "gcal" | "notion"
  name: string
  description: string
  iconNode: React.ReactNode
  iconBg: string
  connectType: "oauth" | "internal"
  connectUrl: string
  connectLabel: string
}

const OAUTH_URLS = {
  slack:
    process.env.NEXT_PUBLIC_OAUTH_SLACK_URL ??
    "https://slack.com/oauth/v2/authorize?client_id=DEMO&scope=users:read",
  gcal:
    process.env.NEXT_PUBLIC_OAUTH_GCAL_URL ??
    "https://accounts.google.com/o/oauth2/v2/auth?client_id=DEMO&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly",
  notion:
    process.env.NEXT_PUBLIC_OAUTH_NOTION_URL ??
    "https://api.notion.com/v1/oauth/authorize?client_id=DEMO&response_type=code&owner=user",
} as const

const PROVIDERS: Provider[] = [
  {
    id: "slack",
    name: "Slack",
    description:
      "Sync attribution of your messages, and optionally receive notifications in Slack",
    iconNode: <SlackLogo className="size-4" />,
    // Muted dark plum at ~90% opacity — matches Linear's restrained tone.
    iconBg: "bg-[#4A154B]/90",
    connectType: "oauth",
    connectUrl: OAUTH_URLS.slack,
    connectLabel: "Connect",
  },
  {
    id: "github",
    name: "GitHub",
    description: "First, your workspace needs to be connected to GitHub",
    iconNode: <GitHubLogo className="size-4 text-white" />,
    iconBg: "bg-[#24292F]",
    connectType: "internal",
    connectUrl: "/settings?section=integrations&provider=github",
    connectLabel: "Connect workspace",
  },
  {
    id: "gcal",
    name: "Google Calendar",
    description: "Sync your calendar out-of-office status to Linear",
    iconNode: <GoogleCalendarLogo className="size-5" />,
    iconBg: "bg-white",
    connectType: "oauth",
    connectUrl: OAUTH_URLS.gcal,
    connectLabel: "Connect",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Preview issues, projects, and views within Notion",
    iconNode: <NotionLogo className="text-foreground size-4" />,
    iconBg: "bg-[#F6F5F4] dark:bg-neutral-700",
    connectType: "oauth",
    connectUrl: OAUTH_URLS.notion,
    connectLabel: "Connect",
  },
]

type IntegrationRecord = {
  provider: Provider["id"]
  status: "connected" | "disconnected"
  accountHandle: string | null
  connectedAt: string | null
}

function ConnectedAccountsSection() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [records, setRecords] = useState<
    Record<Provider["id"], IntegrationRecord>
  >({
    slack: {
      provider: "slack",
      status: "disconnected",
      accountHandle: null,
      connectedAt: null,
    },
    github: {
      provider: "github",
      status: "disconnected",
      accountHandle: null,
      connectedAt: null,
    },
    gcal: {
      provider: "gcal",
      status: "disconnected",
      accountHandle: null,
      connectedAt: null,
    },
    notion: {
      provider: "notion",
      status: "disconnected",
      accountHandle: null,
      connectedAt: null,
    },
  })
  const [pendingDisconnect, setPendingDisconnect] = useState<Provider | null>(
    null
  )

  useEffect(() => {
    let cancelled = false
    fetch("/api/integrations")
      .then((r) => r.json())
      .then((list: IntegrationRecord[]) => {
        if (cancelled) return
        setRecords((prev) => {
          const next = { ...prev }
          for (const r of list) {
            if (r.provider in next) {
              next[r.provider as Provider["id"]] = r
            }
          }
          return next
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // OAuth return handler — reads ?connected=<provider> or ?oauth_error=<provider>
  // from the URL (as an OAuth redirect would leave it), surfaces a toast, then
  // strips those params so reloads don't re-fire the toast.
  useEffect(() => {
    const connected = searchParams.get("connected")
    const error = searchParams.get("oauth_error")
    if (!connected && !error) return

    if (connected) {
      const p = PROVIDERS.find((x) => x.id === connected)
      if (p) toast.success(`Connected to ${p.name}`)
    }
    if (error) {
      const p = PROVIDERS.find((x) => x.id === error)
      toast.error(p ? `Failed to connect to ${p.name}` : "Connection failed")
    }

    const cleaned = new URLSearchParams(searchParams.toString())
    cleaned.delete("connected")
    cleaned.delete("oauth_error")
    router.replace(`/settings?${cleaned.toString()}`, { scroll: false })
  }, [searchParams, router])

  const confirmDisconnect = async () => {
    if (!pendingDisconnect) return
    const provider = pendingDisconnect
    const prevRecord = records[provider.id]
    setRecords((prev) => ({
      ...prev,
      [provider.id]: {
        ...prev[provider.id],
        status: "disconnected",
        accountHandle: null,
        connectedAt: null,
      },
    }))
    setPendingDisconnect(null)
    try {
      const res = await fetch(`/api/integrations/${provider.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success(`Disconnected from ${provider.name}`)
    } catch {
      setRecords((prev) => ({ ...prev, [provider.id]: prevRecord }))
      toast.error(`Failed to disconnect from ${provider.name}`)
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Connected accounts</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect your user accounts to sync attribution of your actions between
          apps
        </p>
      </div>

      <ul role="list" className="flex flex-col gap-2">
        {PROVIDERS.map((provider) => {
          const record = records[provider.id]
          return (
            <li key={provider.id}>
              <article className="bg-card flex items-center gap-3 rounded-lg border px-4 py-3">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${provider.iconBg}`}
                >
                  {provider.iconNode}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-medium">{provider.name}</h2>
                  {record.status === "connected" && record.accountHandle ? (
                    <div className="text-muted-foreground text-xs">
                      Connected as{" "}
                      <span className="text-foreground font-medium">
                        {record.accountHandle}
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-xs">
                      {provider.description}
                    </div>
                  )}
                </div>

                {record.status === "connected" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Disconnect ${provider.name}`}
                    onClick={() => setPendingDisconnect(provider)}
                    className="text-destructive hover:text-destructive focus-visible:ring-primary/50 focus-visible:ring-offset-background h-8 text-xs font-medium focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <ConnectAction provider={provider} />
                )}
              </article>
            </li>
          )
        })}
      </ul>

      <ConfirmDisconnectDialog
        provider={pendingDisconnect}
        onCancel={() => setPendingDisconnect(null)}
        onConfirm={confirmDisconnect}
      />
    </div>
  )
}

function ConnectAction({ provider }: { provider: Provider }) {
  const className =
    "text-foreground hover:opacity-70 focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex shrink-0 items-center gap-0 rounded-md text-sm font-medium transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
  const label = `${provider.connectLabel} ${provider.name} account`

  if (provider.connectType === "oauth") {
    // The clone has no real OAuth handshake — clicking the underlying
    // demo OAuth URL just shows a third-party error page, which feels
    // like a silent no-op to the user. Surface the same toast the
    // Integrations Featured card shows so the action is acknowledged
    // and the user knows where to look next.
    return (
      <button
        type="button"
        onClick={() =>
          toast.info(`${provider.name} OAuth connect flow coming soon`)
        }
        aria-label={label}
        className={className}
      >
        {provider.connectLabel}
        <ExternalLinkGlyph className="ml-1 size-3.5" />
      </button>
    )
  }

  // Internal nav — client-side router Link, right-arrow glyph.
  return (
    <Link
      href={provider.connectUrl}
      aria-label={`Connect workspace to ${provider.name}`}
      className={className}
    >
      {provider.connectLabel}
      <svg
        viewBox="0 0 14 14"
        className="ml-1 size-3.5 fill-current"
        aria-hidden="true"
      >
        <path
          d="M3 7h8M8 4l3 3-3 3"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  )
}

function ConfirmDisconnectDialog({
  provider,
  onCancel,
  onConfirm,
}: {
  provider: Provider | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={!!provider} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Disconnect {provider?.name}?</DialogTitle>
          <DialogDescription>
            Actions in Linear will stop syncing to your {provider?.name}{" "}
            account. You can reconnect at any time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AgentSkill = {
  id: string
  name: string
  slashCommand: string
  promptTemplate: string
  autoSelectRules: string
  lastUsedAt: string | null
  createdAt: string
}

type AgentMcpServer = {
  id: string
  name: string
  url: string
  status: "connected" | "error"
  addedAt: string
}

const GUIDANCE_MAX_CHARS = 10_000

type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error" }

function AgentPersonalizationSection() {
  const [loading, setLoading] = useState(true)
  const [guidance, setGuidanceValue] = useState("")
  const [skills, setSkills] = useState<AgentSkill[]>([])
  const [mcpServers, setMcpServers] = useState<AgentMcpServer[]>([])
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: "idle" })
  const [createSkillOpen, setCreateSkillOpen] = useState(false)
  const [skillToDelete, setSkillToDelete] = useState<AgentSkill | null>(null)
  const [addServerOpen, setAddServerOpen] = useState(false)
  const [serverToDisconnect, setServerToDisconnect] =
    useState<AgentMcpServer | null>(null)

  const lastSavedRef = useRef<string>("")
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedClearRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [g, s, m] = await Promise.all([
          fetch("/api/agent-personalization").then((r) => r.json()),
          fetch("/api/skills").then((r) => r.json()),
          fetch("/api/mcp-servers").then((r) => r.json()),
        ])
        if (cancelled) return
        setGuidanceValue(g.guidance ?? "")
        lastSavedRef.current = g.guidance ?? ""
        setSkills(s)
        setMcpServers(m)
      } catch {
        if (!cancelled) toast.error("Failed to load agent settings")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const saveGuidance = useCallback(async (value: string) => {
    setSaveStatus({ kind: "saving" })
    try {
      const res = await fetch("/api/agent-personalization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guidance: value }),
      })
      if (!res.ok) throw new Error()
      lastSavedRef.current = value
      setSaveStatus({ kind: "saved" })
      if (savedClearRef.current) clearTimeout(savedClearRef.current)
      savedClearRef.current = setTimeout(
        () => setSaveStatus({ kind: "idle" }),
        2000
      )
    } catch {
      setSaveStatus({ kind: "error" })
    }
  }, [])

  const handleGuidanceChange = (value: string) => {
    const clipped = value.slice(0, GUIDANCE_MAX_CHARS)
    setGuidanceValue(clipped)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      if (clipped !== lastSavedRef.current) saveGuidance(clipped)
    }, 500)
  }

  const retrySave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveGuidance(guidance)
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (savedClearRef.current) clearTimeout(savedClearRef.current)
    }
  }, [])

  const handleCreateSkill = async (input: {
    name: string
    slashCommand: string
    promptTemplate: string
    autoSelectRules: string
  }) => {
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || "Failed to create skill")
    }
    const skill = (await res.json()) as AgentSkill
    setSkills((list) => [...list, skill])
    toast.success(`Skill "${skill.name}" created`)
  }

  const confirmDeleteSkill = async () => {
    if (!skillToDelete) return
    const skill = skillToDelete
    const prev = skills
    setSkills((list) => list.filter((s) => s.id !== skill.id))
    setSkillToDelete(null)
    try {
      const res = await fetch(`/api/skills/${skill.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success(`Deleted "${skill.name}"`)
    } catch {
      setSkills(prev)
      toast.error("Failed to delete skill")
    }
  }

  const handleAddServer = async (input: {
    name: string
    url: string
    authToken: string
  }) => {
    const res = await fetch("/api/mcp-servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || "Failed to add server")
    }
    const server = (await res.json()) as AgentMcpServer
    setMcpServers((list) => [...list, server])
    toast.success(`Connected ${server.name}`)
  }

  const confirmDisconnectServer = async () => {
    if (!serverToDisconnect) return
    const server = serverToDisconnect
    const prev = mcpServers
    setMcpServers((list) => list.filter((s) => s.id !== server.id))
    setServerToDisconnect(null)
    try {
      const res = await fetch(`/api/mcp-servers/${server.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success(`Disconnected ${server.name}`)
    } catch {
      setMcpServers(prev)
      toast.error("Failed to disconnect server")
    }
  }

  return (
    <TooltipProvider>
      <div className="flex max-w-2xl flex-col gap-8 p-6">
        <div>
          <h1 className="text-xl font-semibold">Agent personalization</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your personal settings for Linear Agent
          </p>
        </div>

        {/* Guidance */}
        <section className="-mt-2">
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="guidance" className="text-sm font-semibold">
              Guidance
            </label>
            <SaveStatusIndicator status={saveStatus} onRetry={retrySave} />
          </div>
          <p
            id="guidance-description"
            className="text-muted-foreground mb-3 text-xs"
          >
            Provide personal instructions and context for the Linear Agent when
            responding to conversations
          </p>
          {loading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : (
            <textarea
              id="guidance"
              value={guidance}
              maxLength={GUIDANCE_MAX_CHARS}
              onChange={(e) => handleGuidanceChange(e.target.value)}
              aria-describedby="guidance-description"
              placeholder="Enter personal guidance for the Linear Agent (optional)..."
              rows={7}
              className="bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          )}
          <div className="text-muted-foreground mt-1.5 flex justify-end text-xs tabular-nums">
            {guidance.length.toLocaleString()} /{" "}
            {GUIDANCE_MAX_CHARS.toLocaleString()}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="mb-1 text-sm font-semibold">Skills</h2>
          <p className="text-muted-foreground mb-3 text-xs">
            Reusable prompts auto-selected by the agent or invoked via slash
            commands
          </p>
          {loading ? (
            <Skeleton className="h-28 w-full rounded-lg" />
          ) : skills.length === 0 ? (
            <div className="bg-card flex flex-col items-center justify-center gap-3 rounded-lg border px-4 py-10">
              <p className="text-muted-foreground text-sm">
                You haven&apos;t added any skills yet
              </p>
              <CreateSkillButton onClick={() => setCreateSkillOpen(true)} />
            </div>
          ) : (
            <div className="bg-card rounded-lg border">
              <ul role="list" className="divide-border divide-y">
                {skills.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    onDelete={() => setSkillToDelete(skill)}
                  />
                ))}
              </ul>
              <div className="flex justify-end border-t px-4 py-2">
                <CreateSkillButton onClick={() => setCreateSkillOpen(true)} />
              </div>
            </div>
          )}
        </section>

        {/* MCP servers */}
        <section>
          <h2 className="mb-1 text-sm font-semibold">MCP servers</h2>
          <p className="text-muted-foreground mb-3 text-xs">
            Connect to MCP servers for use with the Linear Agent. Available
            servers are managed by workspace admins in{" "}
            <Link
              href="/settings?section=admin-security"
              className="text-foreground underline underline-offset-3 hover:opacity-70"
            >
              security settings
            </Link>
            .
          </p>
          {loading ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : mcpServers.length === 0 ? (
            <div className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="text-muted-foreground text-sm">
                No servers connected
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Add an MCP server"
                onClick={() => setAddServerOpen(true)}
                className="focus-visible:ring-primary/50 focus-visible:ring-offset-background h-8 text-xs font-medium focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <span className="text-muted-foreground mr-1">+</span>
                Add server
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-lg border">
              <ul role="list" className="divide-border divide-y">
                {mcpServers.map((server) => (
                  <li
                    key={server.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{server.name}</div>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${server.status === "connected" ? "bg-emerald-500" : "bg-destructive"}`}
                          aria-hidden="true"
                        />
                        <span
                          className={`text-xs ${server.status === "connected" ? "text-emerald-500" : "text-destructive"}`}
                          role="status"
                        >
                          {server.status === "connected"
                            ? "Connected"
                            : "Error"}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          · {server.url}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Disconnect ${server.name}`}
                      onClick={() => setServerToDisconnect(server)}
                      className="text-destructive hover:text-destructive focus-visible:ring-primary/50 focus-visible:ring-offset-background h-7 text-xs focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      Disconnect
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end border-t px-4 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Add an MCP server"
                  onClick={() => setAddServerOpen(true)}
                  className="focus-visible:ring-primary/50 focus-visible:ring-offset-background h-7 text-xs font-medium focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <span className="text-muted-foreground mr-1">+</span>
                  Add server
                </Button>
              </div>
            </div>
          )}
        </section>

        <NewSkillDialog
          key={String(createSkillOpen)}
          open={createSkillOpen}
          onOpenChange={setCreateSkillOpen}
          onCreate={handleCreateSkill}
        />
        <ConfirmDeleteSkillDialog
          skill={skillToDelete}
          onCancel={() => setSkillToDelete(null)}
          onConfirm={confirmDeleteSkill}
        />
        <AddMcpServerDialog
          key={String(addServerOpen)}
          open={addServerOpen}
          onOpenChange={setAddServerOpen}
          onAdd={handleAddServer}
        />
        <ConfirmDisconnectServerDialog
          server={serverToDisconnect}
          onCancel={() => setServerToDisconnect(null)}
          onConfirm={confirmDisconnectServer}
        />
      </div>
    </TooltipProvider>
  )
}

function CreateSkillButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            aria-label="Create skill"
            className="bg-muted/60 text-foreground hover:bg-muted focus-visible:ring-primary/50 focus-visible:ring-offset-background flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <SkillStickerIcon className="text-muted-foreground size-3.5" />
            Create skill
          </button>
        }
      />
      <TooltipContent>New prompt template</TooltipContent>
    </Tooltip>
  )
}

function SkillStickerIcon({ className }: { className?: string }) {
  // Document-with-folded-corner glyph, matching Linear's skill/template sticker.
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.5 1.5h5.3L11.5 4.2v7.3c0 .4-.3.75-.75.75h-7.25a.75.75 0 0 1-.75-.75V2.25c0-.4.3-.75.75-.75Zm5 .7v2.3h2.3L8.5 2.2Z"
      />
    </svg>
  )
}

function SaveStatusIndicator({
  status,
  onRetry,
}: {
  status: SaveStatus
  onRetry: () => void
}) {
  if (status.kind === "idle") return null
  if (status.kind === "saving") {
    return (
      <span className="text-muted-foreground text-xs" aria-live="polite">
        Saving…
      </span>
    )
  }
  if (status.kind === "saved") {
    return (
      <span
        className="text-muted-foreground inline-flex items-center gap-1 text-xs"
        aria-live="polite"
      >
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          strokeWidth={2}
          className="size-3 text-emerald-500"
        />
        Saved
      </span>
    )
  }
  return (
    <span
      className="text-destructive inline-flex items-center gap-2 text-xs"
      aria-live="assertive"
    >
      Failed to save
      <button
        type="button"
        onClick={onRetry}
        className="underline underline-offset-3 hover:opacity-70 focus-visible:outline-none"
      >
        Retry
      </button>
    </span>
  )
}

function SkillRow({
  skill,
  onDelete,
}: {
  skill: AgentSkill
  onDelete: () => void
}) {
  const lastUsed = skill.lastUsedAt
    ? new Date(skill.lastUsedAt).toLocaleDateString()
    : "Never used"
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{skill.name}</span>
          <code className="bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[11px]">
            {skill.slashCommand}
          </code>
        </div>
        <div className="text-muted-foreground mt-0.5 text-xs">{lastUsed}</div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Edit skill ${skill.name}`}
        className="focus-visible:ring-primary/50 focus-visible:ring-offset-background h-7 text-xs focus-visible:ring-2 focus-visible:ring-offset-2"
        onClick={() => toast.info("Skill editing is not wired yet")}
      >
        Edit
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Delete skill ${skill.name}`}
        className="text-destructive hover:text-destructive focus-visible:ring-primary/50 focus-visible:ring-offset-background h-7 text-xs focus-visible:ring-2 focus-visible:ring-offset-2"
        onClick={onDelete}
      >
        Delete
      </Button>
    </li>
  )
}

function NewSkillDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (input: {
    name: string
    slashCommand: string
    promptTemplate: string
    autoSelectRules: string
  }) => Promise<void>
}) {
  // Parent passes a key tied to `open` so this component remounts on each
  // open transition; local form state is therefore always fresh.
  const [name, setName] = useState("")
  const [slash, setSlash] = useState("")
  const [template, setTemplate] = useState("")
  const [rules, setRules] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!name.trim() || !slash.trim() || submitting) return
    setSubmitting(true)
    try {
      await onCreate({
        name: name.trim(),
        slashCommand: slash.trim(),
        promptTemplate: template,
        autoSelectRules: rules,
      })
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create skill")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New skill</DialogTitle>
          <DialogDescription>
            Create a reusable prompt the agent can invoke via a slash command.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-skill-name" className="text-xs font-medium">
              Name
            </Label>
            <Input
              id="new-skill-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Triage"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-skill-slash" className="text-xs font-medium">
              Slash command
            </Label>
            <Input
              id="new-skill-slash"
              value={slash}
              onChange={(e) => setSlash(e.target.value)}
              placeholder="/triage"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-skill-template" className="text-xs font-medium">
              Prompt template
            </Label>
            <textarea
              id="new-skill-template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={4}
              placeholder="Describe what the agent should do when this skill is invoked…"
              className="bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-skill-rules" className="text-xs font-medium">
              Auto-select rules{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <textarea
              id="new-skill-rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={2}
              placeholder="When should the agent pick this skill automatically?"
              className="bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!name.trim() || !slash.trim() || submitting}
          >
            {submitting ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmDeleteSkillDialog({
  skill,
  onCancel,
  onConfirm,
}: {
  skill: AgentSkill | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={!!skill} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete skill?</DialogTitle>
          <DialogDescription>
            The skill{" "}
            <span className="text-foreground font-medium">{skill?.name}</span>{" "}
            will be removed from your agent. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddMcpServerDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdd: (input: {
    name: string
    url: string
    authToken: string
  }) => Promise<void>
}) {
  // Parent passes a key tied to `open` so this component remounts on each
  // open transition; local form state is therefore always fresh.
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [authToken, setAuthToken] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!name.trim() || !url.trim() || submitting) return
    setSubmitting(true)
    try {
      await onAdd({ name: name.trim(), url: url.trim(), authToken })
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add server")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add MCP server</DialogTitle>
          <DialogDescription>
            Connect a Model Context Protocol server so the agent can call its
            tools.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-mcp-name" className="text-xs font-medium">
              Name
            </Label>
            <Input
              id="new-mcp-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Internal docs"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-mcp-url" className="text-xs font-medium">
              URL
            </Label>
            <Input
              id="new-mcp-url"
              value={url}
              type="url"
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://mcp.example.com"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-mcp-token" className="text-xs font-medium">
              Auth token{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="new-mcp-token"
              value={authToken}
              type="password"
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Bearer token"
              className="h-9 text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!name.trim() || !url.trim() || submitting}
          >
            {submitting ? "Connecting…" : "Add server"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmDisconnectServerDialog({
  server,
  onCancel,
  onConfirm,
}: {
  server: AgentMcpServer | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={!!server} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Disconnect server?</DialogTitle>
          <DialogDescription>
            The agent will no longer be able to use{" "}
            <span className="text-foreground font-medium">{server?.name}</span>.
            You can reconnect at any time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const FISCAL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

// Mirror of lib/workspace-mocks' SLUG_PATTERN so the client can give inline
// feedback without a round-trip.
const WORKSPACE_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/

type WorkspaceSaveStatus = "idle" | "saving" | "saved" | "error"

type WorkspaceData = {
  name: string
  slug: string
  logoDataUrl: string | null
  fiscalYearStartMonth: string
}

function titleCase(month: string): string {
  if (!month) return ""
  return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()
}

function WorkspaceSection() {
  const [loading, setLoading] = useState(true)
  const [workspace, setWorkspace] = useState<WorkspaceData>({
    name: "Abhishek",
    slug: "abhishek2007",
    logoDataUrl: null,
    fiscalYearStartMonth: "january",
  })
  const [nameDraft, setNameDraft] = useState("")
  const [slugDraft, setSlugDraft] = useState("")
  const [nameStatus, setNameStatus] = useState<WorkspaceSaveStatus>("idle")
  const [slugStatus, setSlugStatus] = useState<WorkspaceSaveStatus>("idle")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/workspace")
      .then((r) => r.json())
      .then((w: WorkspaceData) => {
        if (cancelled) return
        setWorkspace(w)
        setNameDraft(w.name)
        setSlugDraft(w.slug)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const patch = useCallback(
    async (body: Partial<WorkspaceData>): Promise<WorkspaceData | null> => {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Save failed")
      }
      const data = (await res.json()) as WorkspaceData
      setWorkspace(data)
      return data
    },
    []
  )

  const onNameBlur = async () => {
    const next = nameDraft.trim()
    if (next === workspace.name) return
    if (next.length === 0) {
      toast.error("Name is required")
      setNameDraft(workspace.name)
      return
    }
    setNameStatus("saving")
    try {
      await patch({ name: next })
      setNameStatus("saved")
      window.setTimeout(
        () => setNameStatus((s) => (s === "saved" ? "idle" : s)),
        1500
      )
    } catch (err) {
      setNameStatus("error")
      toast.error(err instanceof Error ? err.message : "Save failed")
    }
  }

  // Validate while typing so the user sees errors before blurring. Pure
  // derived state — no effect needed.
  const slugError = ((): string | null => {
    const trimmed = slugDraft.trim()
    if (trimmed === workspace.slug) return null
    if (trimmed.length === 0) return "URL is required"
    if (!WORKSPACE_SLUG_PATTERN.test(trimmed.toLowerCase())) {
      return "URL can only contain lowercase letters, numbers, and hyphens"
    }
    return null
  })()

  const onSlugBlur = async () => {
    const next = slugDraft.trim().toLowerCase()
    if (next === workspace.slug) return
    if (slugError) return // Block save while invalid.
    setSlugStatus("saving")
    try {
      await patch({ slug: next })
      setSlugDraft(next)
      setSlugStatus("saved")
      window.setTimeout(
        () => setSlugStatus((s) => (s === "saved" ? "idle" : s)),
        1500
      )
    } catch (err) {
      setSlugStatus("error")
      toast.error(err instanceof Error ? err.message : "Save failed")
    }
  }

  const onFiscalYearChange = async (month: string) => {
    const prev = workspace.fiscalYearStartMonth
    setWorkspace({ ...workspace, fiscalYearStartMonth: month })
    try {
      await patch({ fiscalYearStartMonth: month })
    } catch {
      setWorkspace({ ...workspace, fiscalYearStartMonth: prev })
      toast.error("Failed to save fiscal year")
    }
  }

  const onLogoFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image")
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = String(reader.result)
      try {
        await patch({ logoDataUrl: dataUrl })
        toast.success("Logo updated")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Logo upload failed")
      }
    }
    reader.readAsDataURL(file)
  }

  const initials = workspace.name.slice(0, 2).toUpperCase() || "WS"

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Workspace</h1>

      {/* Logo / Name / URL card */}
      <div className="divide-border divide-y overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm font-medium">Logo</div>
            <div className="text-muted-foreground text-xs">
              Recommended size is 256×256px
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload workspace logo"
            className="focus-visible:ring-ring flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-violet-600 text-sm font-semibold text-white transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
          >
            {workspace.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={workspace.logoDataUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              initials
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onLogoFile(f)
              e.target.value = ""
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <label htmlFor="workspace-name" className="text-sm font-medium">
            Name
          </label>
          <div className="flex items-center gap-2">
            <SaveStatusBadge status={nameStatus} />
            <Input
              id="workspace-name"
              value={nameDraft}
              onChange={(e) => {
                setNameDraft(e.target.value)
                if (nameStatus !== "idle") setNameStatus("idle")
              }}
              onBlur={onNameBlur}
              disabled={loading}
              aria-invalid={nameDraft.trim().length === 0 ? true : undefined}
              className="h-8 w-52 text-sm"
            />
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 px-4 py-3">
          <label htmlFor="workspace-url" className="text-sm font-medium">
            URL
          </label>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <SaveStatusBadge status={slugStatus} />
              <div
                className={`focus-within:ring-ring flex items-center overflow-hidden rounded-md border focus-within:ring-2 ${
                  slugError ? "border-destructive" : ""
                }`}
              >
                <span className="bg-muted/40 text-muted-foreground border-r px-2.5 py-1.5 text-xs">
                  linear.app/
                </span>
                <input
                  id="workspace-url"
                  value={slugDraft}
                  onChange={(e) => {
                    setSlugDraft(e.target.value)
                    if (slugStatus !== "idle") setSlugStatus("idle")
                  }}
                  onBlur={onSlugBlur}
                  disabled={loading}
                  aria-invalid={!!slugError}
                  aria-describedby={
                    slugError ? "workspace-url-error" : undefined
                  }
                  className="w-36 bg-transparent px-2.5 py-1.5 text-sm outline-none"
                />
              </div>
            </div>
            {slugError && (
              <p
                id="workspace-url-error"
                role="alert"
                className="text-destructive text-xs"
              >
                {slugError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Time & region */}
      <div>
        <h2 className="mb-2 text-sm font-semibold">Time &amp; region</h2>
        <div className="divide-border divide-y overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">
                First month of the fiscal year
              </div>
              <div className="text-muted-foreground text-xs">
                Used when grouping projects and issues quarterly, half-yearly,
                and yearly
              </div>
            </div>
            <Select
              value={workspace.fiscalYearStartMonth}
              onValueChange={(v) => {
                if (typeof v === "string") void onFiscalYearChange(v)
              }}
            >
              <SelectTrigger className="h-8 w-32 text-xs capitalize">
                <SelectValue>
                  {titleCase(workspace.fiscalYearStartMonth)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {FISCAL_MONTHS.map((m) => (
                  <SelectItem key={m.toLowerCase()} value={m.toLowerCase()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Region</div>
              <div className="text-muted-foreground text-xs">
                Set when a workspace is created and cannot be changed.{" "}
                <a
                  href="https://linear.app/docs/security#data-regions"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Read more about data regions (opens in new tab)"
                  className="text-foreground font-medium underline-offset-2 hover:underline"
                >
                  Read more <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
            <span className="text-muted-foreground text-sm">United States</span>
          </div>
        </div>
      </div>

      {/* Welcome message */}
      <div>
        <h2 className="mb-2 text-sm font-semibold">Welcome message</h2>
        <div className="bg-muted/20 flex items-center justify-between rounded-lg border px-4 py-3">
          <span className="text-muted-foreground text-sm">
            Configure welcome message
          </span>
          <Link
            href="/settings?section=billing"
            scroll={false}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
          >
            Available on Enterprise
          </Link>
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <h2 className="mb-2 text-sm font-semibold">Danger zone</h2>
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <div className="text-sm font-medium">Delete workspace</div>
            <div className="text-muted-foreground text-xs">
              Schedule workspace to be permanently deleted
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="focus-visible:ring-ring rounded text-sm font-medium text-rose-500 transition-colors hover:text-rose-400 focus-visible:ring-2 focus-visible:outline-none"
          >
            Delete workspace
          </button>
        </div>
      </div>

      <DeleteWorkspaceDialog
        key={String(deleteOpen)}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        workspaceName={workspace.name}
      />
    </div>
  )
}

function SaveStatusBadge({ status }: { status: WorkspaceSaveStatus }) {
  if (status === "idle") return null
  if (status === "saving") {
    return (
      <span className="text-muted-foreground text-[11px]" role="status">
        Saving…
      </span>
    )
  }
  if (status === "saved") {
    return (
      <span
        role="status"
        className="flex items-center gap-1 text-[11px] text-emerald-500"
      >
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
        Saved
      </span>
    )
  }
  return (
    <span role="alert" className="text-destructive text-[11px]">
      Error
    </span>
  )
}

function DeleteWorkspaceDialog({
  open,
  onOpenChange,
  workspaceName,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  workspaceName: string
}) {
  // Parent passes a key tied to `open` so this component remounts on each
  // open transition; local form state is therefore always fresh.
  const [code, setCode] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSendCode = async () => {
    setSending(true)
    try {
      const res = await fetch("/api/workspace/deletion-code", {
        method: "POST",
      })
      if (!res.ok) throw new Error()
      const body = (await res.json()) as { devCode?: string }
      setCodeSent(true)
      if (body.devCode) setDevCode(body.devCode)
      toast.success("Deletion code sent to your email")
    } catch {
      toast.error("Could not send deletion code")
    } finally {
      setSending(false)
    }
  }

  const canSubmit =
    codeSent && acknowledged && code.trim().length > 0 && !submitting

  const onSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/workspace/deletion-code", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), acknowledged: true }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Verification failed")
      }
      toast.success("Workspace deletion scheduled")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify workspace deletion request</DialogTitle>
          <DialogDescription>
            Deleting{" "}
            <span className="text-foreground font-medium">{workspaceName}</span>{" "}
            is permanent and cannot be undone. All projects, issues,
            integrations, and member access will be removed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-code">Deletion code</Label>
            <div className="flex gap-2">
              <Input
                id="delete-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                autoComplete="off"
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onSendCode}
                disabled={sending}
              >
                {sending ? "Sending…" : codeSent ? "Resend" : "Send code"}
              </Button>
            </div>
            {codeSent && devCode && (
              <p className="text-muted-foreground text-[11px]">
                Mock email: <span className="font-mono">{devCode}</span>
              </p>
            )}
            {!codeSent && (
              <p className="text-muted-foreground text-xs">
                We will email a single-use code to your account.
              </p>
            )}
          </div>

          <label className="flex items-start gap-2 text-xs leading-5">
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(v) => setAcknowledged(v === true)}
              aria-labelledby="delete-ack-label"
              className="mt-0.5"
            />
            <span id="delete-ack-label">
              I acknowledge that all of the workspace data will be deleted and
              want to proceed.
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {submitting ? "Deleting…" : "Delete my workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type MemberRole = "admin" | "member" | "guest"
type MemberStatus = "active" | "invited" | "suspended" | "application"

type MemberSummary = {
  id: string
  name: string
  email: string
  avatar: string
  username: string
  role: MemberRole
  status: MemberStatus
  joinedAt: string
  lastSeenAt: string | null
  teamCount: number
  isApplication: boolean
  isInvite: boolean
}

type MembersSortKey =
  | "name"
  | "email"
  | "status"
  | "teamCount"
  | "joinedAt"
  | "lastSeenAt"
type MembersSortDir = "asc" | "desc"

/**
 * Segmented tabs (Members / Invited / Suspended / Applications) shown
 * above the table. The "Members" tab includes both active humans AND
 * guests so the Linear application bot stays out of the human list —
 * Applications has its own tab. The first three tab keys map directly
 * to a `MemberStatus`; "members" is a higher-level UI concept that
 * gets its own filter predicate downstream.
 */
type MembersTabKey =
  | "all"
  | "members"
  | "applications"
  | "invited"
  | "suspended"
  | "left"

const MEMBERS_TABS: { key: MembersTabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "members", label: "Members" },
  { key: "applications", label: "Applications" },
  { key: "invited", label: "Pending invites" },
  { key: "suspended", label: "Suspended" },
  { key: "left", label: "Left workspace" },
]

/**
 * Stable, deterministic ordering for the Status column.
 *
 * Linear's production behavior shows owners first, then admins, then
 * regular members and guests, with system rows (applications) and
 * pending invites at the bottom. The previous implementation used
 * `String(av).localeCompare` which sorted alphabetically — producing
 * Application → Invited → Member → … which doesn't match production
 * and reorders unpredictably across re-renders if any field is null.
 *
 * `STATUS_RANK` is read by `compareMemberStatus` for both ascending
 * and descending sort. Reverse direction simply negates the rank
 * delta — same items keep their relative order so the sort is
 * actually stable, not just consistent on first click.
 */
const STATUS_RANK: Record<string, number> = {
  // Lower number = higher in the list.
  // We don't model "Owner" as a separate role yet (admins double as
  // owners in the mock), but the rank table is keyed so that the
  // future "owner" status would slot in at 0.
  owner: 0,
  admin: 1,
  member: 2,
  guest: 3,
  application: 4,
  invited: 5,
}

/** Rank a row by its status+role combination. Invited beats role. */
function rankMemberStatus(m: MemberSummary): number {
  if (m.status === "invited") return STATUS_RANK.invited
  if (m.status === "application") return STATUS_RANK.application
  if (m.status === "suspended") return STATUS_RANK.member + 100 // suspended sinks
  // Active: rank by role.
  return STATUS_RANK[m.role] ?? STATUS_RANK.member
}

function compareMemberStatus(
  a: MemberSummary,
  b: MemberSummary,
  direction: 1 | -1
): number {
  const delta = rankMemberStatus(a) - rankMemberStatus(b)
  if (delta !== 0) return delta * direction
  // Tiebreak by name for a stable order within a status bucket.
  return a.name.localeCompare(b.name) * direction
}

const MEMBERS_SORTABLE_COLUMNS: {
  key: MembersSortKey
  label: string
}[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "teamCount", label: "Teams" },
  { key: "joinedAt", label: "Joined" },
  { key: "lastSeenAt", label: "Last seen" },
]

const ROLE_LABEL: Record<MemberRole, string> = {
  admin: "Admin",
  member: "Member",
  guest: "Guest",
}

function parseMembersSort(raw: string | null): {
  key: MembersSortKey
  dir: MembersSortDir
} {
  if (!raw) return { key: "name", dir: "asc" }
  const [k, d] = raw.split("-")
  const key = (MEMBERS_SORTABLE_COLUMNS.find((c) => c.key === k)?.key ??
    "name") as MembersSortKey
  const dir: MembersSortDir = d === "desc" ? "desc" : "asc"
  return { key, dir }
}

function formatMemberLastSeen(lastSeenAt: string | null): {
  label: string
  online: boolean
} {
  if (!lastSeenAt) return { label: "Never", online: false }
  const d = new Date(lastSeenAt)
  const diffMs = Date.now() - d.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 5) return { label: "Online", online: true }
  if (minutes < 60) return { label: `${minutes}m ago`, online: false }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return { label: `${hours}h ago`, online: false }
  const days = Math.floor(hours / 24)
  if (days === 1) return { label: "Yesterday", online: false }
  if (days < 7) return { label: `${days}d ago`, online: false }
  return {
    label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    online: false,
  }
}

function formatJoined(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

function useDebounced<T>(value: T, delay = 150): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(t)
  }, [value, delay])
  return debounced
}

function MembersSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sort = parseMembersSort(searchParams.get("msort"))

  const [summaries, setSummaries] = useState<MemberSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const debouncedFilter = useDebounced(filter, 150)
  const [tab, setTab] = useState<MembersTabKey>("all")
  const [exporting, setExporting] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [confirm, setConfirm] = useState<{
    member: MemberSummary
    action: "suspend" | "unsuspend" | "remove"
  } | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/members")
      if (!res.ok) throw new Error()
      setSummaries((await res.json()) as MemberSummary[])
    } catch {
      toast.error("Failed to load members")
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/members")
        if (!res.ok) throw new Error()
        const data = (await res.json()) as MemberSummary[]
        if (!cancelled) setSummaries(data)
      } catch {
        if (!cancelled) toast.error("Failed to load members")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // After the first load, mirror Linear's behavior: if any pending
  // invites are in the workspace, open with the "Pending invites"
  // chip selected; otherwise stay on "All". The ref guard makes this
  // a one-shot — once the user clicks any chip we never override
  // their choice on a subsequent re-fetch.
  const defaultTabAppliedRef = useRef(false)
  useEffect(() => {
    if (loading || defaultTabAppliedRef.current) return
    defaultTabAppliedRef.current = true
    if (summaries.some((m) => m.isInvite)) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTab("invited")
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [loading, summaries])

  // Tab → predicate: each tab decides which `MemberSummary` rows
  // belong on it. "members" = human users (active + suspended) that
  // aren't applications and aren't pending invites. "applications"
  // moves the Linear application bot off the human list.
  const tabMatches = useMemo(() => {
    const matchers: Record<MembersTabKey, (m: MemberSummary) => boolean> = {
      all: () => true,
      members: (m) =>
        !m.isApplication && !m.isInvite && m.status !== "suspended",
      applications: (m) => m.isApplication,
      invited: (m) => m.isInvite,
      suspended: (m) => m.status === "suspended",
      left: () => false,
    }
    return matchers
  }, [])

  // Apply tab filter then text filter.
  const filtered = useMemo(() => {
    const q = debouncedFilter.trim().toLowerCase()
    return summaries.filter((m) => {
      if (!tabMatches[tab](m)) return false
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q)
      )
    })
  }, [summaries, debouncedFilter, tab, tabMatches])

  const sorted = useMemo(() => {
    const direction = sort.dir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      // Status column gets the deterministic rank-based comparator
      // so the sort matches Linear's production order and is stable
      // (Owner → Admin → Member → Guest → Application → Invited).
      if (sort.key === "status") {
        return compareMemberStatus(a, b, direction)
      }
      // `compareNullSmallest` lives in `lib/members-sort.ts` and is
      // unit-tested directly. It encodes the spec's "null is the
      // smallest value" rule (nulls top on asc, bottom on desc) plus
      // the antisymmetry property `compare(a,b) === -compare(b,a)`
      // which keeps Array.sort stable across re-renders.
      return compareNullSmallest(
        a[sort.key] as string | number | null,
        b[sort.key] as string | number | null,
        direction
      )
    })
  }, [filtered, sort])

  const onSortClick = (key: MembersSortKey) => {
    const nextDir: MembersSortDir =
      sort.key === key && sort.dir === "asc" ? "desc" : "asc"
    const params = new URLSearchParams(searchParams.toString())
    params.set("section", "members")
    params.set("msort", `${key}-${nextDir}`)
    router.replace(`/settings?${params.toString()}`, { scroll: false })
  }

  const onExport = async () => {
    setExporting(true)
    try {
      const res = await fetch("/api/members/export")
      if (!res.ok) throw new Error()
      const csv = await res.text()
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const today = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `members-abhishek-${today}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Members exported")
    } catch {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  const onRowAction = async (
    member: MemberSummary,
    action:
      | "suspend"
      | "unsuspend"
      | "remove"
      | "resend-invite"
      | "revoke-invite"
      | "copy-email"
      | { type: "set-role"; role: MemberRole }
  ) => {
    // Client-side action: copy email to clipboard. No server call.
    if (action === "copy-email") {
      try {
        await navigator.clipboard.writeText(member.email)
        toast.success(`Copied ${member.email}`)
      } catch {
        toast.error("Couldn't copy email")
      }
      return
    }

    // Revoking an invite is just removing the row; the server uses
    // the same DELETE-equivalent path as `remove` for invited rows.
    if (action === "revoke-invite") {
      try {
        const res = await fetch(`/api/members/${member.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove" }),
        })
        if (!res.ok)
          throw new Error((await res.json()).error || "Revoke failed")
        toast.success(`Revoked invite for ${member.email}`)
        await refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Revoke failed")
      }
      return
    }

    const url = `/api/members/${member.id}`
    const body =
      typeof action === "string"
        ? { action }
        : { action: "set-role", role: action.role }
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Action failed")
      const verb =
        action === "suspend"
          ? "Suspended"
          : action === "unsuspend"
            ? "Reactivated"
            : action === "remove"
              ? "Removed"
              : action === "resend-invite"
                ? "Invite resent to"
                : `Role set to ${ROLE_LABEL[action.role]} for`
      toast.success(`${verb} ${member.name}`)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed")
    }
  }

  // Track widths of header + row grids together. The min-width floor
  // (760px = 472px of fixed columns + ~288px for Name/Email at
  // readable widths) keeps every column legible. Below that width,
  // the wrapper scrolls horizontally rather than dropping columns
  // from the DOM. Linear's production page does the same — narrow
  // viewports get a scroll affordance, not a truncated column set.
  const COL = "grid-cols-[2fr_2fr_160px_80px_90px_110px_32px]"
  const TABLE_MIN_WIDTH = "min-w-[760px]"

  return (
    <TooltipProvider>
      <div className="flex max-w-5xl flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold">Members</h1>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search members"
              className="placeholder:text-muted-foreground/60 focus:ring-ring h-8 w-full rounded-md border bg-transparent pr-8 pl-8 text-sm outline-none focus:ring-2"
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter("")}
                aria-label="Clear filter"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm focus-visible:ring-2 focus-visible:outline-none"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  data-testid="members-filter-trigger"
                  aria-label="Filter members"
                  className="hover:bg-accent/40 inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs"
                >
                  <span>
                    {MEMBERS_TABS.find((t) => t.key === tab)?.label ?? "All"}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className="text-muted-foreground size-3"
                  />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              {MEMBERS_TABS.map((t) => (
                <DropdownMenuItem
                  key={t.key}
                  data-testid={`members-filter-${t.key}`}
                  onClick={() => setTab(t.key)}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span>{t.label}</span>
                  {tab === t.key && (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      className="size-3.5"
                      aria-label="Selected"
                    />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={exporting}
              className="h-8 text-xs"
            >
              {exporting ? "Exporting…" : "Export CSV"}
            </Button>
            <Button
              size="sm"
              onClick={() => setInviteOpen(true)}
              className="h-8 px-4 text-xs"
            >
              Invite
            </Button>
          </div>
        </div>

        {/* Table — horizontal scroll wrapper guarantees every column
            stays in the DOM at narrow viewports. The inner
            `min-w-[760px]` keeps Joined / Teams / Last seen at
            readable widths even as the page narrows; the user can
            scroll the table sideways inside its container. */}
        <div
          role="table"
          data-testid="members-table"
          aria-label="Workspace members"
          className="overflow-x-auto rounded-lg border"
        >
          {/* Header row */}
          <div
            role="row"
            data-testid="members-table-header"
            className={`text-muted-foreground grid ${COL} ${TABLE_MIN_WIDTH} border-b px-4 py-2 text-xs font-medium`}
          >
            {MEMBERS_SORTABLE_COLUMNS.map((c) => {
              const active = sort.key === c.key
              return (
                <div
                  key={c.key}
                  role="columnheader"
                  aria-sort={
                    active
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() => onSortClick(c.key)}
                    aria-label={`Order by ${c.label}`}
                    className="hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span>{c.label}</span>
                    {active && (
                      <HugeiconsIcon
                        icon={
                          sort.dir === "asc" ? ArrowUp01Icon : ArrowDown01Icon
                        }
                        className="size-3"
                      />
                    )}
                  </button>
                </div>
              )
            })}
            <div />
          </div>

          {loading ? (
            <div
              className={`flex flex-col gap-1 p-4 ${TABLE_MIN_WIDTH}`}
              role="status"
              aria-label="Loading members"
              data-testid="members-loading"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div
              data-testid="members-empty"
              className={`text-muted-foreground py-16 text-center text-sm ${TABLE_MIN_WIDTH}`}
            >
              No members match your filter.
            </div>
          ) : (
            // The active tab pre-filters rows by status, so render
            // them as a flat list — no in-table per-status grouping
            // headers (those duplicated info already in the tabs).
            // The min-width matches the header so rows don't shrink
            // narrower than the header on small viewports — together
            // they form a single horizontally-scrollable surface.
            <div data-testid="members-rows" className={TABLE_MIN_WIDTH}>
              {sorted.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  onAction={(action) => {
                    if (action === "suspend" || action === "remove") {
                      setConfirm({ member: m, action })
                      return
                    }
                    void onRowAction(m, action)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <InviteMembersDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          onInvited={async () => {
            await refresh()
          }}
        />

        <MemberActionConfirmDialog
          key={confirm ? `${confirm.member.id}-${confirm.action}` : "closed"}
          confirm={confirm}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            if (!confirm) return
            await onRowAction(confirm.member, confirm.action)
            setConfirm(null)
          }}
        />
      </div>
    </TooltipProvider>
  )
}

function MemberRow({
  member,
  onAction,
}: {
  member: MemberSummary
  onAction: (
    action:
      | "suspend"
      | "unsuspend"
      | "remove"
      | "resend-invite"
      | "revoke-invite"
      | "copy-email"
      | { type: "set-role"; role: MemberRole }
  ) => void
}) {
  const COL = "grid-cols-[2fr_2fr_160px_80px_90px_110px_32px]"
  const joined = formatJoined(member.joinedAt)
  const lastSeen = formatMemberLastSeen(member.lastSeenAt)
  const roleLabel = ROLE_LABEL[member.role]
  // Controlled dropdown state — needed so the right-click context
  // menu can open the same menu without going through its trigger
  // button. Linear's production behavior matches the menu shown by
  // either click target on the row.
  const [menuOpen, setMenuOpen] = useState(false)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  return (
    <Link
      href={`/profiles/${member.username}`}
      role="row"
      data-testid="members-row"
      data-member-id={member.id}
      data-member-status={member.status}
      data-member-role={member.role}
      aria-label={`Open ${member.name}'s profile`}
      onContextMenu={(e) => {
        // Right-click shows the same actions menu instead of the
        // browser's default context menu — production parity with
        // Linear's row UX.
        e.preventDefault()
        // Programmatically click the trigger so Base UI anchors the
        // menu correctly. Setting `open` directly would float the
        // menu away from the row.
        menuTriggerRef.current?.click()
      }}
      className={`group grid ${COL} hover:bg-accent/40 focus-visible:ring-ring items-center border-b px-4 py-2.5 transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:outline-none`}
    >
      <div role="cell" className="flex min-w-0 items-center gap-2.5">
        {member.isApplication ? (
          <div
            aria-hidden="true"
            className="bg-muted/40 flex size-7 shrink-0 items-center justify-center rounded-full border"
          >
            <svg
              viewBox="0 0 16 16"
              className="text-muted-foreground size-4"
              fill="none"
            >
              <circle
                cx="8"
                cy="8"
                r="5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
            </svg>
          </div>
        ) : (
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={member.avatar} alt="" />
            <AvatarFallback
              className="bg-violet-500 text-[10px] text-white"
              aria-label={`${member.name} avatar`}
            >
              {member.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{member.name}</div>
          <div className="text-muted-foreground truncate font-mono text-xs">
            @{member.username}
          </div>
        </div>
      </div>
      <div role="cell" className="text-muted-foreground truncate text-sm">
        {member.email}
      </div>
      <div role="cell">
        <div className="flex items-center gap-1.5">
          <MemberStatusBadge status={member.status} />
          <MemberRoleBadge
            role={member.role}
            label={roleLabel}
            disabled={member.isApplication || member.isInvite}
            onChangeRole={(role) => onAction({ type: "set-role", role })}
          />
        </div>
      </div>
      <div role="cell" className="text-muted-foreground text-sm">
        {member.teamCount === 0
          ? "—"
          : `${member.teamCount} team${member.teamCount === 1 ? "" : "s"}`}
      </div>
      <div role="cell" className="text-muted-foreground text-sm">
        {joined}
      </div>
      <div
        role="cell"
        className="text-muted-foreground flex items-center gap-1.5 text-sm"
      >
        {/* Last seen: invited rows have no real value yet, so we
            render an em-dash (per spec) rather than the previous
            "Never" placeholder which read like a stale stat. */}
        {member.isInvite ? (
          <span
            data-testid="members-row-last-seen-dash"
            aria-label="No last-seen yet"
          >
            —
          </span>
        ) : (
          <>
            {lastSeen.online && (
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-emerald-500"
              />
            )}
            <span>{lastSeen.label}</span>
          </>
        )}
      </div>
      <div role="cell" className="flex items-center justify-end gap-1">
        {/* Inline Resend invite button on invited rows — matches the
            production "one-click resend" affordance that Linear shows
            on hover. The same action is available from the row menu
            for keyboard users. */}
        {member.isInvite && (
          <button
            type="button"
            data-testid="members-row-resend-inline"
            aria-label={`Resend invite to ${member.email}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAction("resend-invite")
            }}
            className="text-muted-foreground hover:bg-accent hover:text-foreground rounded px-1.5 py-0.5 text-[11px] opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            Resend
          </button>
        )}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger
            render={
              <button
                ref={menuTriggerRef}
                type="button"
                data-testid="members-row-actions"
                aria-label={`Actions for ${member.name}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                className="text-muted-foreground hover:bg-accent flex size-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            {/* Always-available action: copy email to clipboard. */}
            <DropdownMenuItem
              data-testid="members-row-action-copy-email"
              className="text-xs"
              onClick={() => onAction("copy-email")}
            >
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(["admin", "member", "guest"] as MemberRole[]).map((r) => (
              <DropdownMenuItem
                key={r}
                disabled={member.isApplication || member.role === r}
                onClick={() => onAction({ type: "set-role", role: r })}
                className="text-xs"
              >
                Change role to {ROLE_LABEL[r]}
                {member.role === r && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="ml-auto size-3.5"
                  />
                )}
              </DropdownMenuItem>
            ))}
            {member.isInvite && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-testid="members-row-action-resend"
                  className="text-xs"
                  onClick={() => onAction("resend-invite")}
                >
                  Resend invite
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid="members-row-action-revoke"
                  className="text-destructive focus:text-destructive text-xs"
                  onClick={() => onAction("revoke-invite")}
                >
                  Revoke invite
                </DropdownMenuItem>
              </>
            )}
            {!member.isInvite && (
              <>
                <DropdownMenuSeparator />
                {member.status === "suspended" ? (
                  <DropdownMenuItem
                    className="text-xs"
                    onClick={() => onAction("unsuspend")}
                  >
                    Reactivate
                  </DropdownMenuItem>
                ) : (
                  !member.isApplication && (
                    <DropdownMenuItem
                      className="text-xs"
                      onClick={() => onAction("suspend")}
                    >
                      Suspend member
                    </DropdownMenuItem>
                  )
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive text-xs"
                  onClick={() => onAction("remove")}
                >
                  Remove from workspace
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  )
}

function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const classes: Record<MemberStatus, string> = {
    active: "bg-emerald-500/15 text-emerald-500",
    invited: "bg-sky-500/15 text-sky-500",
    suspended: "bg-amber-500/15 text-amber-500",
    application: "bg-violet-500/15 text-violet-400",
  }
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] leading-none font-medium ${classes[status]}`}
    >
      {label}
    </span>
  )
}

function MemberRoleBadge({
  role,
  label,
  disabled,
  onChangeRole,
}: {
  role: MemberRole
  label: string
  disabled: boolean
  onChangeRole: (role: MemberRole) => void
}) {
  if (disabled) {
    return (
      <span className="bg-muted/60 text-muted-foreground rounded-full px-2 py-0.5 text-[10px] leading-none font-medium">
        {label}
      </span>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Change role from ${label}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="bg-muted/60 hover:bg-accent focus-visible:ring-ring rounded-full px-2 py-0.5 text-[10px] leading-none font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {label}
          </button>
        }
      />
      <DropdownMenuContent align="start" className="w-36">
        {(["admin", "member", "guest"] as MemberRole[]).map((r) => (
          <DropdownMenuItem
            key={r}
            disabled={role === r}
            onClick={() => onChangeRole(r)}
            className="flex items-center justify-between text-xs"
          >
            {ROLE_LABEL[r]}
            {role === r && (
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-3.5"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function InviteMembersDialog({
  open,
  onOpenChange,
  onInvited,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onInvited: () => Promise<void> | void
}) {
  const [emails, setEmails] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Role defaults to "member" — Linear's production default. The
  // previous default was "admin" both in the UI copy AND in the
  // server-side fallback, which produced the "Admin (Invited)"
  // status-column bug.
  const [role, setRole] = useState<MemberRole>("member")
  const [roleOpen, setRoleOpen] = useState(false)
  // Team multi-select state. Stored as a Set for O(1) toggle.
  const [teams, setTeams] = useState<
    { id: string; name: string; key: string }[]
  >([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set())
  const [teamsOpen, setTeamsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setEmails("")
      setError(null)
      setSubmitting(false)
      setRole("member")
      setSelectedTeamIds(new Set())
      setRoleOpen(false)
      setTeamsOpen(false)
      setCopied(false)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open])

  // Load teams once when the dialog first opens; cheap, won't change
  // mid-dialog.
  useEffect(() => {
    if (!open || teams.length > 0) return
    let cancelled = false
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then((data: { id: string; name: string; key: string }[]) => {
        if (!cancelled) setTeams(data)
      })
      .catch(() => {
        /* not fatal — team multi-select is optional */
      })
    return () => {
      cancelled = true
    }
  }, [open, teams.length])

  // Live validation — keep the user from hitting submit on junk.
  useEffect(() => {
    if (!emails.trim()) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setError(null)
      /* eslint-enable react-hooks/set-state-in-effect */
      return
    }
    const parts = emails
      .split(/[\s,;\n]+/)
      .map((p) => p.trim())
      .filter(Boolean)
    const bad = parts.filter((p) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p))

    setError(
      bad.length
        ? `Invalid email${bad.length === 1 ? "" : "s"}: ${bad.join(", ")}`
        : null
    )
  }, [emails])

  const toggleTeam = (id: string) =>
    setSelectedTeamIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const canSubmit = !submitting && emails.trim().length > 0 && !error

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/abhishek?token=demo`
      : "/invite/abhishek?token=demo"

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy invite link")
    }
  }

  const onSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails,
          // The two new fields the backend now reads. Persisting role
          // is the spec's primary contract for this dialog.
          role,
          teamIds: Array.from(selectedTeamIds),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Invite failed")
      }
      const body = (await res.json()) as { invited: { email: string }[] }
      toast.success(
        `Invited ${body.invited.length} member${
          body.invited.length === 1 ? "" : "s"
        }`
      )
      onOpenChange(false)
      await onInvited()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed")
      setSubmitting(false)
    }
  }

  const teamButtonLabel =
    selectedTeamIds.size === 0
      ? "Select teams (optional)"
      : selectedTeamIds.size === 1
        ? (teams.find((t) => selectedTeamIds.has(t.id))?.name ?? "1 team")
        : `${selectedTeamIds.size} teams`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded bg-violet-600 text-[11px] font-semibold text-white">
              AB
            </span>
            Invite to your workspace
          </DialogTitle>
          <DialogDescription>
            Invitees join as {ROLE_LABEL[role]} by default. You can change their
            role any time.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-emails">Emails</Label>
            <textarea
              id="invite-emails"
              data-testid="invite-emails-textarea"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="email@gmail.com, email2@gmail.com…"
              rows={4}
              aria-invalid={!!error}
              aria-describedby={error ? "invite-emails-error" : undefined}
              className="placeholder:text-muted-foreground/60 focus:ring-ring min-h-24 w-full resize-y rounded-md border bg-transparent p-2.5 text-sm outline-none focus:ring-2"
            />
            {error ? (
              <p
                id="invite-emails-error"
                role="alert"
                className="text-destructive text-xs"
              >
                {error}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Separate multiple emails with commas, spaces, or new lines.
              </p>
            )}
          </div>

          {/* Role + Teams row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <DropdownMenu open={roleOpen} onOpenChange={setRoleOpen}>
                <DropdownMenuTrigger
                  render={
                    <button
                      id="invite-role"
                      type="button"
                      data-testid="invite-role-trigger"
                      aria-label={`Role: ${ROLE_LABEL[role]}`}
                      className="hover:bg-accent/40 focus-visible:ring-ring flex h-8 items-center justify-between gap-2 rounded-md border px-2.5 text-xs focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span>{ROLE_LABEL[role]}</span>
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="text-muted-foreground size-3"
                      />
                    </button>
                  }
                />
                <DropdownMenuContent align="start" className="w-40">
                  {(["member", "admin", "guest"] as MemberRole[]).map((r) => (
                    <DropdownMenuItem
                      key={r}
                      data-testid={`invite-role-option-${r}`}
                      onClick={() => {
                        setRole(r)
                        setRoleOpen(false)
                      }}
                      className="flex items-center justify-between text-xs"
                    >
                      {ROLE_LABEL[r]}
                      {role === r && (
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="size-3.5"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-teams">Teams</Label>
              <DropdownMenu open={teamsOpen} onOpenChange={setTeamsOpen}>
                <DropdownMenuTrigger
                  render={
                    <button
                      id="invite-teams"
                      type="button"
                      data-testid="invite-teams-trigger"
                      aria-label={`Add to teams: ${teamButtonLabel}`}
                      className="hover:bg-accent/40 focus-visible:ring-ring flex h-8 items-center justify-between gap-2 rounded-md border px-2.5 text-xs focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span className="truncate">{teamButtonLabel}</span>
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="text-muted-foreground size-3 shrink-0"
                      />
                    </button>
                  }
                />
                <DropdownMenuContent
                  align="start"
                  className="max-h-60 w-56 overflow-y-auto"
                >
                  {teams.length === 0 ? (
                    <div className="text-muted-foreground px-2 py-2 text-xs">
                      No teams to add
                    </div>
                  ) : (
                    teams.map((t) => {
                      const checked = selectedTeamIds.has(t.id)
                      return (
                        <DropdownMenuItem
                          key={t.id}
                          data-testid={`invite-team-option-${t.id}`}
                          // Multi-select: closeOnSelect=false would be
                          // ideal but Base UI's MenuItem closes by
                          // default; toggling and re-opening would feel
                          // janky. We stop the close by re-opening
                          // immediately via setTeamsOpen(true) on the
                          // next tick (microtask) so multiple toggles
                          // feel like one continuous interaction.
                          onClick={(e) => {
                            e.preventDefault()
                            toggleTeam(t.id)
                            queueMicrotask(() => setTeamsOpen(true))
                          }}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="truncate">{t.name}</span>
                          {checked && (
                            <HugeiconsIcon
                              icon={CheckmarkCircle02Icon}
                              className="size-3.5 shrink-0"
                            />
                          )}
                        </DropdownMenuItem>
                      )
                    })
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Copy invite link — secondary action */}
          <div className="bg-muted/40 flex items-center justify-between gap-2 rounded-md border p-2 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <HugeiconsIcon
                icon={Link01Icon}
                className="text-muted-foreground size-3.5 shrink-0"
              />
              <span className="text-muted-foreground truncate">
                {inviteLink}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              data-testid="invite-copy-link"
              onClick={copyInviteLink}
              className="h-6 shrink-0 px-2 text-xs"
            >
              {copied ? "Copied" : "Copy invite link"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            data-testid="invite-submit"
          >
            {submitting ? "Sending…" : "Send invites"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MemberActionConfirmDialog({
  confirm,
  onCancel,
  onConfirm,
}: {
  confirm: {
    member: MemberSummary
    action: "suspend" | "unsuspend" | "remove"
  } | null
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}) {
  // Parent passes a key tied to the confirm target so this component
  // remounts (and `submitting` resets) whenever a new confirmation appears.
  const [submitting, setSubmitting] = useState(false)

  if (!confirm) {
    return (
      <Dialog open={false} onOpenChange={onCancel}>
        <DialogContent />
      </Dialog>
    )
  }

  const { member, action } = confirm
  const titles: Record<typeof action, string> = {
    suspend: `Suspend ${member.name}?`,
    unsuspend: `Reactivate ${member.name}?`,
    remove: `Remove ${member.name} from workspace?`,
  }
  const descriptions: Record<typeof action, string> = {
    suspend:
      "Suspended members lose access immediately but their data is preserved. You can reactivate them later.",
    unsuspend:
      "The member will regain access to the workspace with their previous role.",
    remove:
      "The member loses all access. Issues, comments, and history remain attributed to them.",
  }
  const cta: Record<typeof action, string> = {
    suspend: "Suspend",
    unsuspend: "Reactivate",
    remove: "Remove",
  }

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{titles[action]}</DialogTitle>
          <DialogDescription>{descriptions[action]}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setSubmitting(true)
              await onConfirm()
            }}
            disabled={submitting}
            className={
              action === "remove"
                ? "bg-destructive hover:bg-destructive/90 text-white"
                : undefined
            }
          >
            {submitting ? "Working…" : cta[action]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type TeamSummary = {
  id: string
  key: string
  name: string
  description: string
  visibility: "workspace" | "private"
  createdAt: string
  memberCount: number
  issueCount: number
  status: "active" | "retired" | "recently-deleted"
  currentUserIsMember: boolean
}

type TeamsSortKey =
  | "name"
  | "visibility"
  | "memberCount"
  | "issueCount"
  | "createdAt"
type TeamsSortDir = "asc" | "desc"

const TEAM_SORTABLE_COLUMNS: {
  key: TeamsSortKey
  label: string
  className: string
  align?: "left" | "right"
}[] = [
  { key: "name", label: "Name", className: "justify-self-start" },
  { key: "visibility", label: "Visibility", className: "justify-self-start" },
  { key: "memberCount", label: "Members", className: "justify-self-start" },
  { key: "issueCount", label: "Issues", className: "justify-self-start" },
  { key: "createdAt", label: "Created", className: "justify-self-start" },
]

const STATUS_FILTERS: {
  key: "active" | "retired" | "recently-deleted"
  label: string
}[] = [
  { key: "active", label: "Active" },
  { key: "retired", label: "Retired" },
  { key: "recently-deleted", label: "Recently deleted" },
]

function parseSortParam(raw: string | null): {
  key: TeamsSortKey
  dir: TeamsSortDir
} {
  if (!raw) return { key: "name", dir: "asc" }
  const [k, d] = raw.split("-")
  const key = (TEAM_SORTABLE_COLUMNS.find((c) => c.key === k)?.key ??
    "name") as TeamsSortKey
  const dir: TeamsSortDir = d === "desc" ? "desc" : "asc"
  return { key, dir }
}

function TeamsAdminSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sort = parseSortParam(searchParams.get("sort"))

  const [summaries, setSummaries] = useState<TeamSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [status, setStatus] = useState<
    "active" | "retired" | "recently-deleted"
  >("active")
  const [statusOpen, setStatusOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    team: TeamSummary
    x: number
    y: number
  } | null>(null)
  const [confirm, setConfirm] = useState<{
    team: TeamSummary
    action: "archive" | "delete" | "leave"
  } | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/teams/summary")
      if (!res.ok) throw new Error()
      const data = (await res.json()) as TeamSummary[]
      setSummaries(data)
    } catch {
      toast.error("Failed to load teams")
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/teams/summary")
        if (!res.ok) throw new Error()
        const data = (await res.json()) as TeamSummary[]
        if (!cancelled) setSummaries(data)
      } catch {
        if (!cancelled) toast.error("Failed to load teams")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Close context menu on any outside click / escape.
  useEffect(() => {
    if (!contextMenu) return
    const onClick = () => setContextMenu(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null)
    }
    window.addEventListener("click", onClick)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("click", onClick)
      window.removeEventListener("keydown", onKey)
    }
  }, [contextMenu])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return summaries.filter((t) => {
      if (t.status !== status) return false
      if (!q) return true
      return t.name.toLowerCase().includes(q)
    })
  }, [summaries, filter, status])

  const sorted = useMemo(() => {
    const direction = sort.dir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      const av = a[sort.key] as string | number
      const bv = b[sort.key] as string | number
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * direction
      }
      return String(av).localeCompare(String(bv)) * direction
    })
  }, [filtered, sort])

  const onSortClick = (key: TeamsSortKey) => {
    const nextDir: TeamsSortDir =
      sort.key === key && sort.dir === "asc" ? "desc" : "asc"
    const params = new URLSearchParams(searchParams.toString())
    params.set("section", "teams")
    params.set("sort", `${key}-${nextDir}`)
    router.replace(`/settings?${params.toString()}`, { scroll: false })
  }

  const runAction = async (
    team: TeamSummary,
    action: "archive" | "delete" | "leave"
  ) => {
    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      toast.success(
        action === "archive"
          ? `Archived ${team.name}`
          : action === "delete"
            ? `Deleted ${team.name}`
            : `Left ${team.name}`
      )
      await refresh()
    } catch {
      toast.error("Action failed")
    }
  }

  const COL = "grid-cols-[1fr_120px_80px_80px_100px_32px]"
  const activeStatusLabel = STATUS_FILTERS.find((s) => s.key === status)!.label

  return (
    <div className="flex max-w-5xl flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Teams</h1>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name…"
            aria-label="Filter teams"
            className="placeholder:text-muted-foreground/60 focus:ring-ring h-8 w-full rounded-md border bg-transparent pr-8 pl-8 text-sm outline-none focus:ring-2"
          />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter("")}
              aria-label="Clear filter"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
            </button>
          )}
        </div>

        <DropdownMenu open={statusOpen} onOpenChange={setStatusOpen}>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Filter by team status"
                aria-haspopup="menu"
                className="text-muted-foreground hover:bg-accent/40 focus-visible:ring-ring flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs focus-visible:ring-2 focus-visible:outline-none"
              >
                {activeStatusLabel}
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-40">
            {STATUS_FILTERS.map((s) => (
              <DropdownMenuItem
                key={s.key}
                onClick={() => {
                  setStatus(s.key)
                  setStatusOpen(false)
                }}
                className="flex items-center justify-between text-xs"
              >
                {s.label}
                {status === s.key && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="size-3.5"
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto">
          <Button size="sm" className="h-8 gap-1.5 text-xs" asChild>
            <Link href="/settings/new-team">
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              Create team
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        role="table"
        aria-label={`${activeStatusLabel} teams`}
        className="overflow-hidden rounded-lg border"
      >
        <div
          role="row"
          className={`text-muted-foreground grid ${COL} border-b px-4 py-2 text-xs font-medium`}
        >
          {TEAM_SORTABLE_COLUMNS.map((c) => {
            const active = sort.key === c.key
            return (
              <div
                key={c.key}
                role="columnheader"
                aria-sort={
                  active
                    ? sort.dir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className={c.className}
              >
                <button
                  type="button"
                  onClick={() => onSortClick(c.key)}
                  aria-label={`Order by ${c.label}`}
                  className="hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span>{c.label}</span>
                  {active && (
                    <HugeiconsIcon
                      icon={
                        sort.dir === "asc" ? ArrowUp01Icon : ArrowDown01Icon
                      }
                      className="size-3"
                    />
                  )}
                </button>
              </div>
            )
          })}
          <div />
        </div>

        <div className="bg-muted/20 text-muted-foreground/80 border-b px-4 py-1 text-[11px] font-medium tracking-wide uppercase">
          {activeStatusLabel} · {sorted.length}
        </div>

        {loading ? (
          <div
            role="status"
            aria-label="Loading teams"
            className="flex flex-col gap-1 p-4"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <HugeiconsIcon
              icon={Group01Icon}
              className="text-muted-foreground/60 size-6"
              aria-hidden="true"
            />
            <p className="text-foreground text-sm font-medium">
              No teams match your filter
            </p>
            <p className="text-muted-foreground max-w-xs text-xs">
              Adjust the search or status filter above to see other teams.
            </p>
          </div>
        ) : (
          sorted.map((team) => (
            <TeamRow
              key={team.id}
              team={team}
              onContextMenu={(e) => {
                e.preventDefault()
                setContextMenu({ team, x: e.clientX, y: e.clientY })
              }}
            />
          ))
        )}
      </div>

      {/* Context menu (native right-click) */}
      {contextMenu && (
        <div
          role="menu"
          aria-label={`Actions for ${contextMenu.team.name}`}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="bg-popover fixed z-50 min-w-[180px] rounded-md border p-1 text-xs shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const key = contextMenu.team.key
              setContextMenu(null)
              router.push(`/settings/teams/${key}`)
            }}
            className="hover:bg-accent block w-full rounded-sm px-2 py-1.5 text-left"
          >
            Edit team
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const t = contextMenu.team
              setContextMenu(null)
              setConfirm({ team: t, action: "archive" })
            }}
            className="hover:bg-accent block w-full rounded-sm px-2 py-1.5 text-left"
          >
            Archive team
          </button>
          {contextMenu.team.currentUserIsMember && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const t = contextMenu.team
                setContextMenu(null)
                setConfirm({ team: t, action: "leave" })
              }}
              className="hover:bg-accent block w-full rounded-sm px-2 py-1.5 text-left"
            >
              Leave team
            </button>
          )}
          <DropdownMenuSeparator />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const t = contextMenu.team
              setContextMenu(null)
              setConfirm({ team: t, action: "delete" })
            }}
            className="hover:bg-destructive/10 text-destructive block w-full rounded-sm px-2 py-1.5 text-left"
          >
            Delete team
          </button>
        </div>
      )}

      <TeamActionConfirmDialog
        key={confirm ? `${confirm.team.id}-${confirm.action}` : "closed"}
        confirm={confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return
          await runAction(confirm.team, confirm.action)
          setConfirm(null)
        }}
      />
    </div>
  )
}

function TeamRow({
  team,
  onContextMenu,
}: {
  team: TeamSummary
  onContextMenu: (e: React.MouseEvent) => void
}) {
  const COL = "grid-cols-[1fr_120px_80px_80px_100px_32px]"
  const created = team.createdAt
    ? new Date(team.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—"

  return (
    <Link
      key={team.id}
      href={`/settings/teams/${team.key}`}
      scroll={false}
      role="row"
      onContextMenu={onContextMenu}
      className={`group grid ${COL} hover:bg-accent/40 focus-visible:ring-ring items-center border-b px-4 py-2.5 transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:outline-none`}
      aria-label={`Open ${team.name} settings`}
    >
      <div role="cell" className="flex items-center gap-2.5">
        <div
          className={`flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white ${teamColor(team.key)}`}
        >
          {team.key.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-sm font-medium">{team.name}</span>
        <span className="text-muted-foreground font-mono text-xs">
          {team.key.toUpperCase()}
        </span>
      </div>
      <div role="cell" className="text-muted-foreground text-sm capitalize">
        {team.visibility}
      </div>
      <div role="cell" className="text-sm">
        {team.memberCount}
      </div>
      <div role="cell" className="text-sm">
        <Link
          href={`/team/${team.key.toLowerCase()}/all`}
          onClick={(e) => e.stopPropagation()}
          className="hover:text-foreground focus-visible:ring-ring text-foreground underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
          aria-label={`View ${team.name} issues`}
        >
          {team.issueCount}
        </Link>
      </div>
      <div role="cell" className="text-muted-foreground text-sm">
        {created}
      </div>
      <div role="cell" className="flex justify-end">
        <HugeiconsIcon
          icon={MoreHorizontalIcon}
          className="text-muted-foreground/60 size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
    </Link>
  )
}

function TeamActionConfirmDialog({
  confirm,
  onCancel,
  onConfirm,
}: {
  confirm: {
    team: TeamSummary
    action: "archive" | "delete" | "leave"
  } | null
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}) {
  // Parent passes a key tied to the confirm target so this component
  // remounts (and `submitting` resets) whenever a new confirmation appears.
  const [submitting, setSubmitting] = useState(false)

  if (!confirm) {
    return (
      <Dialog open={false} onOpenChange={onCancel}>
        <DialogContent />
      </Dialog>
    )
  }

  const { team, action } = confirm
  const titles: Record<typeof action, string> = {
    archive: `Archive ${team.name}?`,
    delete: `Delete ${team.name}?`,
    leave: `Leave ${team.name}?`,
  }
  const descriptions: Record<typeof action, string> = {
    archive:
      "Archived teams are hidden from the default list and moved to Retired. You can restore them later.",
    delete:
      "Deleted teams are moved to Recently deleted for 30 days before permanent removal.",
    leave: "You will lose access to team-only views and issues.",
  }
  const cta: Record<typeof action, string> = {
    archive: "Archive",
    delete: "Delete",
    leave: "Leave",
  }

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{titles[action]}</DialogTitle>
          <DialogDescription>{descriptions[action]}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setSubmitting(true)
              await onConfirm()
            }}
            disabled={submitting}
            className={
              action === "delete"
                ? "bg-destructive hover:bg-destructive/90 text-white"
                : undefined
            }
          >
            {submitting ? "Working…" : cta[action]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// localStorage-backed state that survives refresh.
//
// Backed by `useSyncExternalStore` so React handles the SSR↔client
// boundary correctly: the server snapshot returns `initial` (matching
// the SSR HTML), the client snapshot reads localStorage. React detects
// the mismatch and triggers a re-render with the client value
// immediately after hydration — the user sees the stored value on the
// first paint after JS loads, not after a separate useEffect tick.
function usePersistedState<T>(
  key: string,
  initial: T
): [T, Dispatch<SetStateAction<T>>] {
  const subscribe = useCallback(
    (callback: () => void) => {
      const onStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) callback()
      }
      const onLocal = (e: Event) => {
        if ((e as CustomEvent).detail === key) callback()
      }
      window.addEventListener("storage", onStorage)
      window.addEventListener(LOCAL_STORAGE_LOCAL_EVENT, onLocal)
      return () => {
        window.removeEventListener("storage", onStorage)
        window.removeEventListener(LOCAL_STORAGE_LOCAL_EVENT, onLocal)
      }
    },
    [key]
  )

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }, [key])

  const getServerSnapshot = useCallback(() => null, [])

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const value: T = useMemo(() => {
    if (raw === null) return initial
    try {
      return JSON.parse(raw) as T
    } catch {
      return initial
    }
  }, [raw, initial])

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      const nextValue =
        typeof next === "function" ? (next as (prev: T) => T)(value) : next
      try {
        window.localStorage.setItem(key, JSON.stringify(nextValue))
      } catch {}
      // Notify same-tab subscribers (the native `storage` event only
      // fires across tabs, not within the same window).
      window.dispatchEvent(
        new CustomEvent(LOCAL_STORAGE_LOCAL_EVENT, { detail: key })
      )
    },
    [key, value]
  )

  return [value, setValue]
}

const LOCAL_STORAGE_LOCAL_EVENT = "linear:persisted-state"

const PERMISSION_OPTIONS = [
  { value: "all-members", label: "All members" },
  { value: "only-admins", label: "Only admins" },
  { value: "admins-and-members", label: "Admins & members" },
]

function permissionLabel(value: string): string {
  return (
    PERMISSION_OPTIONS.find((o) => o.value === value)?.label ??
    value.replace(/-/g, " ")
  )
}

function AdminSecuritySection() {
  const [inviteLinks, setInviteLinks] = usePersistedState(
    "security:inviteLinks",
    false
  )
  const [googleAuth, setGoogleAuth] = usePersistedState(
    "security:googleAuth",
    true
  )
  const [emailAuth, setEmailAuth] = usePersistedState(
    "security:emailAuth",
    true
  )
  const [apiKeyPerm, setApiKeyPerm] = usePersistedState(
    "security:apiKeyPerm",
    "all-members"
  )
  const [agentGuidancePerm, setAgentGuidancePerm] = usePersistedState(
    "security:agentGuidancePerm",
    "only-admins"
  )
  const [improveAi, setImproveAi] = usePersistedState(
    "security:improveAi",
    false
  )
  const [agentWebSearch, setAgentWebSearch] = usePersistedState(
    "security:agentWebSearch",
    false
  )
  const [enableAgentMcp, setEnableAgentMcp] = usePersistedState(
    "security:enableAgentMcp",
    true
  )
  const [allowedMcpServers, setAllowedMcpServers] = usePersistedState<string>(
    "security:allowedMcpServers",
    "all-servers"
  )
  const [approvedDomains, setApprovedDomains] = usePersistedState<string[]>(
    "security:approvedDomains",
    []
  )

  const removeDomain = (d: string) =>
    setApprovedDomains((prev) => prev.filter((x) => x !== d))

  return (
    <div className="flex max-w-2xl flex-col gap-8 p-6">
      <h1 className="text-xl font-semibold">Security</h1>

      {/* Workspace access */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Workspace access</h2>

        <div>
          <div className="mb-1 text-sm font-medium">Invite links</div>
          <div className="text-muted-foreground mb-2 text-xs">
            A uniquely generated invite link allows anyone with the link to join
            your workspace
          </div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <label htmlFor="security-invite-links" className="text-sm">
              Enable invite links
            </label>
            <Switch
              id="security-invite-links"
              checked={inviteLinks}
              onCheckedChange={setInviteLinks}
              aria-label="Enable invite links"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">
            Workspace login and restrictions
          </div>
          <div className="text-muted-foreground mb-2 text-xs">
            Anyone with an email address at these domains is allowed to sign up
            for this workspace.{" "}
            <a
              href="https://linear.app/docs/workspace-login"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Workspace login docs (opens in new tab)"
              className="text-foreground font-medium underline-offset-2 hover:underline"
            >
              Docs <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
          <div className="flex items-start justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="min-w-0 flex-1">
              {approvedDomains.length === 0 ? (
                <span className="text-muted-foreground text-sm">
                  No approved email domains
                </span>
              ) : (
                <ul
                  className="flex flex-wrap gap-1.5"
                  aria-label="Approved email domains"
                >
                  {approvedDomains.map((d) => (
                    <li
                      key={d}
                      className="bg-muted/60 text-foreground flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 text-xs"
                    >
                      <span>@{d}</span>
                      <button
                        type="button"
                        onClick={() => removeDomain(d)}
                        aria-label={`Remove ${d}`}
                        className="hover:bg-background focus-visible:ring-ring flex size-4 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <AddDomainPopover
              existing={approvedDomains}
              onAdd={(domain) =>
                setApprovedDomains((prev) => [...prev, domain])
              }
            />
          </div>
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">Authentication methods</div>
          <div className="text-muted-foreground mb-2 text-xs">
            Admins and guests can always authenticate via Google and
            email/passkeys—even when disabled for members.
          </div>
          <div className="divide-border divide-y overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">Google authentication</div>
                <div className="text-muted-foreground text-xs">
                  When enabled, this is available to all workspace members and
                  guests
                </div>
              </div>
              <Switch
                checked={googleAuth}
                onCheckedChange={setGoogleAuth}
                aria-label="Google authentication"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">
                  Email &amp; passkey authentication
                </div>
                <div className="text-muted-foreground text-xs">
                  When enabled, this is available to all workspace members and
                  guests
                </div>
              </div>
              <Switch
                checked={emailAuth}
                onCheckedChange={setEmailAuth}
                aria-label="Email and passkey authentication"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-muted-foreground text-sm font-medium">
                  SAML &amp; SCIM
                </div>
                <div className="text-muted-foreground text-xs">
                  Manage logins via an identity provider&apos;s SSO
                </div>
              </div>
              <span className="text-muted-foreground text-xs">
                Available on Enterprise
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace management */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Workspace management</h2>

        {/* Plan-gated rows */}
        <div className="divide-border divide-y overflow-hidden rounded-lg border">
          {[
            {
              label: "New user invitations",
              desc: "Who can invite new members to the workspace",
              badge: "Available on Basic",
            },
            {
              label: "Team creation",
              desc: "Who can create new teams",
              badge: "Available on Business",
            },
            {
              label: "Manage workspace labels",
              desc: "Who can create, update, and delete workspace labels",
              badge: "Available on Business",
            },
            {
              label: "Manage workspace templates",
              desc: "Who can manage workspace templates and recurring issues",
              badge: "Available on Business",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <div className="text-muted-foreground text-sm font-medium">
                  {row.label}
                </div>
                <div className="text-muted-foreground text-xs">{row.desc}</div>
              </div>
              <span className="text-muted-foreground text-xs">{row.badge}</span>
            </div>
          ))}
        </div>

        {/* API key creation + Modify agent guidance share a card */}
        <div className="divide-border divide-y overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">API key creation</div>
              <div className="text-muted-foreground text-xs">
                Who can create API keys to interact with the Linear API on their
                behalf
              </div>
            </div>
            <Select
              value={apiKeyPerm}
              onValueChange={onSelectChange(setApiKeyPerm)}
            >
              <SelectTrigger
                aria-label="API key creation permission"
                className="h-8 w-44 text-xs"
              >
                <SelectValue>{permissionLabel(apiKeyPerm)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Modify agent guidance</div>
              <div className="text-muted-foreground text-xs">
                Who can modify workspace-level agent guidance prompts
              </div>
            </div>
            <Select
              value={agentGuidancePerm}
              onValueChange={onSelectChange(setAgentGuidancePerm)}
            >
              <SelectTrigger
                aria-label="Modify agent guidance permission"
                className="h-8 w-44 text-xs"
              >
                <SelectValue>{permissionLabel(agentGuidancePerm)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Restrict file uploads gets its own card */}
        <div className="overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-muted-foreground text-sm font-medium">
                Restrict file uploads
              </div>
              <div className="text-muted-foreground text-xs">
                Only allow specific file types to be uploaded
              </div>
            </div>
            <span className="text-muted-foreground text-xs">
              Available on Enterprise
            </span>
          </div>
        </div>
      </div>

      {/* Integrations & applications */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">
          Integrations &amp; applications
        </h2>
        <div className="divide-border divide-y overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-muted-foreground text-sm">
                Review third-party applications
              </div>
              <div className="text-muted-foreground text-xs">
                Control which applications can be installed to your workspace.{" "}
                <a
                  href="https://linear.app/docs/third-party-applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Third-party applications docs (opens in new tab)"
                  className="text-foreground font-medium underline-offset-2 hover:underline"
                >
                  Docs <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
            <span className="text-muted-foreground text-xs">
              Available on Enterprise
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-muted-foreground text-sm">
                Reduce personal information from support integrations
              </div>
              <div className="text-muted-foreground text-xs">
                Personal information from support integrations won&apos;t be
                stored
              </div>
            </div>
            <span className="text-muted-foreground text-xs">
              Available on Enterprise
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-muted-foreground text-sm">
                Prevent guests from interacting with agents in the workspace
              </div>
              <div className="text-muted-foreground text-xs">
                Restrict agent invocation to full workspace members only
              </div>
            </div>
            <span className="text-muted-foreground text-xs">
              Available on Basic
            </span>
          </div>
        </div>
      </div>

      {/* AI & Agents */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">AI &amp; Agents</h2>
        <div className="divide-border divide-y overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">
                Improve AI features by sharing usage data
              </div>
              <div className="text-muted-foreground text-xs">
                Feedback on AI results is used to enhance functionality and will
                not be used to train models
              </div>
            </div>
            <Switch
              checked={improveAi}
              onCheckedChange={setImproveAi}
              aria-label="Improve AI features by sharing usage data"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">
                Enable Linear Agent web search
              </div>
              <div className="text-muted-foreground text-xs">
                Allow Linear Agent to search the public web for current
                information and cite sources
              </div>
            </div>
            <Switch
              checked={agentWebSearch}
              onCheckedChange={setAgentWebSearch}
              aria-label="Enable Linear Agent web search"
            />
          </div>
        </div>
      </div>

      {/* MCP Servers */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">MCP Servers</h2>
        <div className="divide-border divide-y overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">
                Enable Linear Agent MCP servers
              </div>
              <div className="text-muted-foreground text-xs">
                Allow Linear Agent to use connected MCP servers
              </div>
            </div>
            <Switch
              checked={enableAgentMcp}
              onCheckedChange={setEnableAgentMcp}
              aria-label="Enable Linear Agent MCP servers"
            />
          </div>
          <Link
            href="/settings/mcp-servers"
            scroll={false}
            className="hover:bg-accent/40 focus-visible:ring-ring flex items-center justify-between gap-3 px-4 py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Review connected MCP servers"
          >
            <div>
              <div className="text-sm font-medium">Connected MCP servers</div>
              <div className="text-muted-foreground text-xs">
                Review existing MCP server connections from all workspace
                members
              </div>
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="text-muted-foreground size-4"
            />
          </Link>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Allowed MCP servers</div>
              <div className="text-muted-foreground text-xs">
                Choose whether Linear Agent can use all connected servers or
                only specific server URLs
              </div>
            </div>
            <Select
              value={allowedMcpServers}
              onValueChange={onSelectChange(setAllowedMcpServers)}
            >
              <SelectTrigger
                aria-label="Allowed MCP servers"
                className="h-8 w-44 text-xs"
              >
                <SelectValue>
                  {allowedMcpServers === "all-servers"
                    ? "All servers"
                    : "Specific servers"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-servers">All servers</SelectItem>
                <SelectItem value="specific-servers">
                  Specific servers
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Compliance</h2>
        <div className="divide-border divide-y overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-muted-foreground text-sm">
                HIPAA compliance
              </div>
              <div className="text-muted-foreground text-xs">
                Enable privacy and security measures to ensure that Protected
                Health Information (PHI) is appropriately safeguarded
              </div>
            </div>
            <span className="text-muted-foreground text-xs">
              Available on Enterprise
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddDomainPopover({
  existing,
  onAdd,
}: {
  existing: string[]
  onAdd: (domain: string) => void
}) {
  const [open, setOpenRaw] = useState(false)
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const setOpen = useCallback((next: boolean) => {
    setOpenRaw(next)
    if (!next) {
      setValue("")
      setError(null)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    // Autofocus when the popover opens.
    const t = window.setTimeout(() => inputRef.current?.focus(), 10)
    return () => window.clearTimeout(t)
  }, [open])

  const onSubmit = () => {
    // Inline validation is duplicated here because the helper lives in
    // a pure module; keep the messaging identical.
    const trimmed = value.trim().toLowerCase().replace(/^@+/, "")
    if (!trimmed) {
      setError("Domain is required")
      return
    }
    if (/[\s\/]|:[0-9]+$/.test(trimmed) || trimmed.includes("://")) {
      setError("Enter a plain domain, without https:// or paths")
      return
    }
    const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/
    if (!DOMAIN_RE.test(trimmed)) {
      setError("Enter a valid domain like example.com")
      return
    }
    if (existing.includes(trimmed)) {
      setError("Domain already approved")
      return
    }
    onAdd(trimmed)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Add approved email domain"
            aria-expanded={open}
            aria-haspopup="dialog"
            className="focus-visible:ring-ring flex shrink-0 items-center gap-1 text-sm font-medium hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
            Add domain
          </button>
        }
      />
      <PopoverContent
        align="end"
        role="dialog"
        aria-label="Add approved email domain"
        className="w-72 p-3"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="approved-domain-input" className="text-xs">
            Approved email domain
          </Label>
          <div className="focus-within:ring-ring flex items-center overflow-hidden rounded-md border focus-within:ring-2">
            <span className="bg-muted/40 text-muted-foreground border-r px-2.5 py-1.5 text-xs">
              @
            </span>
            <input
              id="approved-domain-input"
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (error) setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onSubmit()
                }
              }}
              placeholder="example.com"
              aria-invalid={!!error}
              aria-describedby={error ? "approved-domain-error" : undefined}
              className="placeholder:text-muted-foreground/60 w-full bg-transparent px-2.5 py-1.5 text-sm outline-none"
            />
          </div>
          {error && (
            <p
              id="approved-domain-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={onSubmit}>
              Add domain
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const SLACK_COMMUNITY_URL = "https://linear.app/join-slack"
const OAUTH_DOCS_URL = "https://linear.app/docs/oauth-2-0-authentication"
const WEBHOOKS_DOCS_URL = "https://linear.app/docs/webhooks"

type OAuthApp = {
  id: string
  name: string
  description: string
  redirectUris: string[]
  scopes: string[]
  iconDataUrl: string | null
  clientId: string
  clientSecret: string
  createdAt: string
}

type Webhook = {
  id: string
  url: string
  resources: string[]
  teamId: string | null
  secret: string
  createdAt: string
}

const OAUTH_SCOPE_OPTIONS = [
  "read",
  "write",
  "admin",
  "issues:create",
  "comments:create",
] as const

const WEBHOOK_RESOURCES: { value: string; label: string }[] = [
  { value: "issues", label: "Issues" },
  { value: "comments", label: "Comments" },
  { value: "projects", label: "Projects" },
  { value: "project-updates", label: "Project updates" },
  { value: "cycles", label: "Cycles" },
  { value: "labels", label: "Labels" },
  { value: "reactions", label: "Reactions" },
  { value: "initiatives", label: "Initiatives" },
  { value: "documents", label: "Documents" },
  { value: "customer-requests", label: "Customer requests" },
  { value: "issue-attachments", label: "Issue attachments" },
]

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

function generateClientSideSecret(): string {
  const bytes = new Uint8Array(32)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++)
      bytes[i] = Math.floor(Math.random() * 256)
  }
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return typeof btoa === "function" ? btoa(binary) : ""
}

function ApiSection() {
  const [apiKeyPerm, setApiKeyPerm] = usePersistedState(
    "security:apiKeyPerm",
    "all-members"
  )
  const [oauthApps, setOauthApps] = useState<OAuthApp[]>([])
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [teams, setTeams] = useState<
    { id: string; name: string; key: string }[]
  >([])
  const [oauthOpen, setOauthOpen] = useState(false)
  const [oauthEdit, setOauthEdit] = useState<OAuthApp | null>(null)
  const [webhookOpen, setWebhookOpen] = useState(false)
  const [webhookEdit, setWebhookEdit] = useState<Webhook | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch("/api/oauth-apps").then((r) => r.json()),
      fetch("/api/webhooks").then((r) => r.json()),
      fetch("/api/data/teams").then((r) => r.json()),
    ])
      .then(([a, w, t]) => {
        if (cancelled) return
        setOauthApps(a as OAuthApp[])
        setWebhooks(w as Webhook[])
        setTeams(t as { id: string; name: string; key: string }[])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex max-w-2xl flex-col gap-12 p-6">
      <div>
        <h1 className="text-xl font-semibold">API</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Linear&apos;s GraphQL API provides a programmable interface to your
          data. Use our API to build public or private apps, workflows, and
          integrations for Linear.{" "}
          <a
            href={SLACK_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our Slack community (opens in new tab)"
            className="text-foreground font-semibold underline-offset-2 hover:underline"
          >
            Join our Slack
          </a>{" "}
          for help and questions.
        </p>
        <a
          href={OAUTH_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="API documentation (opens in new tab)"
          className="text-foreground mt-1 inline-flex items-center gap-1 text-sm font-semibold underline-offset-2 hover:underline"
        >
          Docs <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>

      {/* OAuth Applications */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">OAuth Applications</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Manage your organization&apos;s OAuth applications.{" "}
          <a
            href={OAUTH_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OAuth documentation (opens in new tab)"
            className="text-foreground font-semibold underline-offset-2 hover:underline"
          >
            Docs <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </p>
        <div className="bg-card overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            {oauthApps.length === 0 ? (
              <span className="text-muted-foreground text-sm">
                No OAuth applications
              </span>
            ) : (
              <span className="text-muted-foreground text-xs">
                {oauthApps.length} OAuth{" "}
                {oauthApps.length === 1 ? "application" : "applications"}
              </span>
            )}
            <button
              type="button"
              onClick={() => setOauthOpen(true)}
              className="focus-visible:ring-ring flex items-center gap-1 rounded-sm text-sm font-medium hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New
              OAuth application
            </button>
          </div>
          {oauthApps.length > 0 && (
            <ul className="divide-border divide-y border-t">
              {oauthApps.map((app) => (
                <OAuthAppRow
                  key={app.id}
                  app={app}
                  onEdit={() => setOauthEdit(app)}
                  onRotated={(next) =>
                    setOauthApps((prev) =>
                      prev.map((a) => (a.id === next.id ? next : a))
                    )
                  }
                  onDeleted={(id) =>
                    setOauthApps((prev) => prev.filter((a) => a.id !== id))
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Webhooks */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Webhooks</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Webhooks allow you to receive HTTP requests when an entity is created,
          updated, or deleted.{" "}
          <a
            href={WEBHOOKS_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Webhooks documentation (opens in new tab)"
            className="text-foreground font-semibold underline-offset-2 hover:underline"
          >
            Docs <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </p>
        <div className="bg-card overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            {webhooks.length === 0 ? (
              <span className="text-muted-foreground text-sm">No webhooks</span>
            ) : (
              <span className="text-muted-foreground text-xs">
                {webhooks.length} webhook{webhooks.length === 1 ? "" : "s"}
              </span>
            )}
            <button
              type="button"
              onClick={() => setWebhookOpen(true)}
              className="focus-visible:ring-ring flex items-center gap-1 rounded-sm text-sm font-medium hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New
              webhook
            </button>
          </div>
          {webhooks.length > 0 && (
            <ul className="divide-border divide-y border-t">
              {webhooks.map((w) => (
                <WebhookRow
                  key={w.id}
                  webhook={w}
                  teamName={teams.find((t) => t.id === w.teamId)?.name}
                  onEdit={() => setWebhookEdit(w)}
                  onRotated={(next) =>
                    setWebhooks((prev) =>
                      prev.map((x) => (x.id === next.id ? next : x))
                    )
                  }
                  onDeleted={(id) =>
                    setWebhooks((prev) => prev.filter((x) => x.id !== id))
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Member API keys */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Member API keys</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Members of your workspace can create API keys to interact with the
          Linear API on their behalf. View your personal API keys from your{" "}
          <Link
            href="/settings?section=security-and-access"
            scroll={false}
            className="text-foreground font-semibold underline-offset-2 hover:underline"
          >
            security &amp; access settings
          </Link>
          .
        </p>
        <div className="bg-card overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">API key creation</div>
              <div className="text-muted-foreground text-xs">
                Who can create API keys to interact with the Linear API on their
                behalf
              </div>
            </div>
            <Select
              value={apiKeyPerm}
              onValueChange={onSelectChange(setApiKeyPerm)}
            >
              <SelectTrigger
                aria-label="API key creation permission"
                className="h-8 w-44 text-xs"
              >
                <SelectValue>{permissionLabel(apiKeyPerm)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t px-4 py-3">
            <span className="text-muted-foreground text-sm">
              No API keys have been created yet
            </span>
          </div>
        </div>
      </div>

      <OAuthAppDialog
        key={`create-${oauthOpen}`}
        mode="create"
        open={oauthOpen}
        onOpenChange={setOauthOpen}
        onSaved={(app) => setOauthApps((prev) => [app, ...prev])}
      />
      <OAuthAppDialog
        key={`edit-${oauthEdit?.id ?? "closed"}`}
        mode="edit"
        app={oauthEdit}
        open={!!oauthEdit}
        onOpenChange={(v) => !v && setOauthEdit(null)}
        onSaved={(app) =>
          setOauthApps((prev) => prev.map((a) => (a.id === app.id ? app : a)))
        }
      />
      <WebhookDialog
        key={`create-${webhookOpen}`}
        mode="create"
        open={webhookOpen}
        onOpenChange={setWebhookOpen}
        teams={teams}
        onSaved={(w) => setWebhooks((prev) => [w, ...prev])}
      />
      <WebhookDialog
        key={`edit-${webhookEdit?.id ?? "closed"}`}
        mode="edit"
        webhook={webhookEdit}
        open={!!webhookEdit}
        onOpenChange={(v) => !v && setWebhookEdit(null)}
        teams={teams}
        onSaved={(w) =>
          setWebhooks((prev) => prev.map((x) => (x.id === w.id ? w : x)))
        }
      />
    </div>
  )
}

function OAuthAppRow({
  app,
  onEdit,
  onRotated,
  onDeleted,
}: {
  app: OAuthApp
  onEdit: () => void
  onRotated: (next: OAuthApp) => void
  onDeleted: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [rotatedSecret, setRotatedSecret] = useState<string | null>(null)

  const onRotate = async () => {
    try {
      const res = await fetch(`/api/oauth-apps/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotate-secret" }),
      })
      if (!res.ok) throw new Error()
      const next = (await res.json()) as OAuthApp
      onRotated(next)
      setRotatedSecret(next.clientSecret)
    } catch {
      toast.error("Rotate failed")
    }
  }

  const onConfirmDelete = async () => {
    try {
      const res = await fetch(`/api/oauth-apps/${app.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      onDeleted(app.id)
      toast.success(`Deleted ${app.name}`)
    } catch {
      toast.error("Delete failed")
    } finally {
      setConfirmDelete(false)
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {app.iconDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={app.iconDataUrl}
            alt=""
            className="size-7 shrink-0 rounded object-cover"
          />
        ) : (
          <div className="bg-muted/60 flex size-7 shrink-0 items-center justify-center rounded text-[10px] font-semibold">
            {app.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{app.name}</div>
          <div className="text-muted-foreground truncate font-mono text-[11px]">
            {app.clientId}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-muted-foreground text-xs">
          {formatShortDate(app.createdAt)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Actions for ${app.name}`}
                className="text-muted-foreground hover:bg-accent flex size-6 items-center justify-center rounded"
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onEdit} className="text-xs">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRotate} className="text-xs">
              Rotate secret
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setConfirmDelete(true)}
              className="text-destructive focus:text-destructive text-xs"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        open={rotatedSecret !== null}
        onOpenChange={(v) => !v && setRotatedSecret(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Client secret rotated</DialogTitle>
            <DialogDescription>
              Copy this value now — it won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>
          <code className="bg-muted/40 block rounded-md border p-2 font-mono text-xs break-all">
            {rotatedSecret}
          </code>
          <DialogFooter>
            <Button onClick={() => setRotatedSecret(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {app.name}?</DialogTitle>
            <DialogDescription>
              The OAuth application and all its credentials will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              onClick={onConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  )
}

function WebhookRow({
  webhook,
  teamName,
  onEdit,
  onRotated,
  onDeleted,
}: {
  webhook: Webhook
  teamName?: string
  onEdit: () => void
  onRotated: (next: Webhook) => void
  onDeleted: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [rotatedSecret, setRotatedSecret] = useState<string | null>(null)

  const onRotate = async () => {
    try {
      const res = await fetch(`/api/webhooks/${webhook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotate-secret" }),
      })
      if (!res.ok) throw new Error()
      const next = (await res.json()) as Webhook
      onRotated(next)
      setRotatedSecret(next.secret)
    } catch {
      toast.error("Rotate failed")
    }
  }

  const onConfirmDelete = async () => {
    try {
      const res = await fetch(`/api/webhooks/${webhook.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      onDeleted(webhook.id)
      toast.success("Webhook deleted")
    } catch {
      toast.error("Delete failed")
    } finally {
      setConfirmDelete(false)
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="truncate font-mono text-xs">{webhook.url}</div>
        <div className="text-muted-foreground mt-0.5 truncate text-[11px]">
          {webhook.resources.join(", ")}
          {teamName ? ` · ${teamName}` : ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-muted-foreground text-xs">
          {formatShortDate(webhook.createdAt)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Actions for webhook ${webhook.url}`}
                className="text-muted-foreground hover:bg-accent flex size-6 items-center justify-center rounded"
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onEdit} className="text-xs">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRotate} className="text-xs">
              Rotate secret
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setConfirmDelete(true)}
              className="text-destructive focus:text-destructive text-xs"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        open={rotatedSecret !== null}
        onOpenChange={(v) => !v && setRotatedSecret(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Signing secret rotated</DialogTitle>
            <DialogDescription>
              Copy this value now — it won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>
          <code className="bg-muted/40 block rounded-md border p-2 font-mono text-xs break-all">
            {rotatedSecret}
          </code>
          <DialogFooter>
            <Button onClick={() => setRotatedSecret(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete webhook?</DialogTitle>
            <DialogDescription>
              <span className="font-mono text-xs">{webhook.url}</span> will stop
              receiving events.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              onClick={onConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  )
}

function validateRedirectUrisText(text: string): {
  ok: boolean
  bad: string[]
  lines: string[]
} {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
  const bad = lines.filter((l) => !/^https?:\/\//i.test(l))
  return { ok: lines.length > 0 && bad.length === 0, bad, lines }
}

function OAuthAppDialog({
  mode,
  open,
  onOpenChange,
  onSaved,
  app,
}: {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: (app: OAuthApp) => void
  app?: OAuthApp | null
}) {
  // Seed state from `app` once on mount (supports both create and edit
  // modes). Parent passes a key tied to the editing target so this dialog
  // remounts whenever the target changes.
  const isEdit = mode === "edit" && !!app
  const [name, setName] = useState(isEdit ? app.name : "")
  const [description, setDescription] = useState(isEdit ? app.description : "")
  const [redirectUris, setRedirectUris] = useState(
    isEdit ? app.redirectUris.join("\n") : ""
  )
  const [scopes, setScopes] = useState<Set<string>>(
    new Set(isEdit && app.scopes.length > 0 ? app.scopes : ["read"])
  )
  const [iconDataUrl, setIconDataUrl] = useState<string | null>(
    isEdit ? app.iconDataUrl : null
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const iconRef = useRef<HTMLInputElement>(null)

  const onIcon = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image")
      return
    }
    const reader = new FileReader()
    reader.onload = () => setIconDataUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  const redirectValidation = validateRedirectUrisText(redirectUris)
  const canSubmit =
    !submitting && name.trim().length > 0 && redirectValidation.ok

  const toggleScope = (s: string) => {
    setScopes((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  const onSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const url =
        mode === "create" ? "/api/oauth-apps" : `/api/oauth-apps/${app!.id}`
      const body =
        mode === "create"
          ? {
              name: name.trim(),
              description: description.trim(),
              redirectUris,
              scopes: Array.from(scopes),
              iconDataUrl,
            }
          : {
              action: "update",
              name: name.trim(),
              description: description.trim(),
              redirectUris,
              scopes: Array.from(scopes),
              iconDataUrl,
            }
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error || "Save failed")
      }
      const next = (await res.json()) as OAuthApp
      toast.success(
        mode === "create" ? `Created ${next.name}` : `Updated ${next.name}`
      )
      onSaved(next)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "New OAuth application"
              : "Edit OAuth application"}
          </DialogTitle>
          <DialogDescription>
            Register an OAuth 2.0 client that can act on behalf of users in your
            workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => iconRef.current?.click()}
              aria-label="Upload OAuth app icon"
              className="bg-muted/40 hover:bg-muted focus-visible:ring-ring flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border focus-visible:ring-2 focus-visible:outline-none"
            >
              {iconDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconDataUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="text-muted-foreground size-4"
                />
              )}
            </button>
            <input
              ref={iconRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onIcon(f)
                e.target.value = ""
              }}
            />
            <div className="text-muted-foreground text-xs">
              Upload a square icon (PNG or JPG). Optional.
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="oauth-name">Name</Label>
            <Input
              id="oauth-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Dashboard"
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="oauth-desc">Description</Label>
            <Input
              id="oauth-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description shown on the consent screen"
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="oauth-redirects">Redirect URIs</Label>
            <textarea
              id="oauth-redirects"
              value={redirectUris}
              onChange={(e) => setRedirectUris(e.target.value)}
              placeholder="https://app.acme.com/callback"
              rows={3}
              aria-invalid={redirectValidation.bad.length > 0}
              aria-describedby={
                redirectValidation.bad.length > 0
                  ? "oauth-redirects-error"
                  : "oauth-redirects-help"
              }
              className={`placeholder:text-muted-foreground/60 w-full resize-y rounded-md border bg-transparent p-2.5 font-mono text-xs outline-none focus:ring-2 ${
                redirectValidation.bad.length > 0
                  ? "border-destructive focus:ring-destructive/40"
                  : "focus:ring-ring"
              }`}
            />
            {redirectValidation.bad.length > 0 ? (
              <p
                id="oauth-redirects-error"
                role="alert"
                className="text-destructive text-xs"
              >
                Each line must start with http:// or https:// —{" "}
                {redirectValidation.bad.join(", ")}
              </p>
            ) : (
              <p
                id="oauth-redirects-help"
                className="text-muted-foreground text-xs"
              >
                One per line. http(s) only.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span
              id="oauth-scopes-label"
              className="text-foreground text-sm font-medium"
            >
              Scopes
            </span>
            <div
              role="group"
              aria-labelledby="oauth-scopes-label"
              className="flex flex-wrap gap-2"
            >
              {OAUTH_SCOPE_OPTIONS.map((s) => {
                const active = scopes.has(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleScope(s)}
                    aria-pressed={active}
                    className={`focus-visible:ring-ring rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                      active
                        ? "bg-foreground/90 text-background border-transparent"
                        : "hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-destructive text-xs">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit}>
            {submitting
              ? mode === "create"
                ? "Creating…"
                : "Saving…"
              : mode === "create"
                ? "Create application"
                : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WebhookDialog({
  mode,
  open,
  onOpenChange,
  teams,
  onSaved,
  webhook,
}: {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (v: boolean) => void
  teams: { id: string; name: string; key: string }[]
  onSaved: (w: Webhook) => void
  webhook?: Webhook | null
}) {
  // Seed state from `webhook` once on mount. Parent passes a key tied to
  // the editing target so this dialog remounts whenever the target changes.
  const isEdit = mode === "edit" && !!webhook
  const [url, setUrl] = useState(isEdit ? webhook.url : "")
  const [resources, setResources] = useState<Set<string>>(
    new Set(isEdit ? webhook.resources : ["issues", "comments"])
  )
  const [teamId, setTeamId] = useState<string>(
    isEdit ? (webhook.teamId ?? "all") : "all"
  )
  const [secret, setSecret] = useState(isEdit ? webhook.secret : "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleResource = (value: string) => {
    setResources((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const urlValid = /^https?:\/\//i.test(url.trim())
  const canSubmit =
    !submitting && url.trim().length > 0 && urlValid && resources.size > 0

  const onSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const isCreate = mode === "create"
      const endpoint = isCreate
        ? "/api/webhooks"
        : `/api/webhooks/${webhook!.id}`
      const body = isCreate
        ? {
            url,
            resources: Array.from(resources),
            teamId: teamId === "all" ? null : teamId,
            secret,
          }
        : {
            action: "update",
            url,
            resources: Array.from(resources),
            teamId: teamId === "all" ? null : teamId,
            secret,
          }
      const res = await fetch(endpoint, {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error || "Save failed")
      }
      const next = (await res.json()) as Webhook
      toast.success(isCreate ? "Webhook created" : "Webhook updated")
      onSaved(next)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New webhook" : "Edit webhook"}
          </DialogTitle>
          <DialogDescription>
            Receive HTTP POST requests when selected resources change.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhook-url">URL</Label>
            <Input
              id="webhook-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/webhook"
              aria-invalid={url.trim().length > 0 && !urlValid}
              aria-describedby={
                url.trim().length > 0 && !urlValid
                  ? "webhook-url-error"
                  : undefined
              }
              className="font-mono text-xs"
              autoComplete="off"
            />
            {url.trim().length > 0 && !urlValid && (
              <p
                id="webhook-url-error"
                role="alert"
                className="text-destructive text-xs"
              >
                URL must start with http:// or https://
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span
              id="webhook-resources-label"
              className="text-foreground text-sm font-medium"
            >
              Resource types
            </span>
            <div
              role="group"
              aria-labelledby="webhook-resources-label"
              className="grid grid-cols-2 gap-2"
            >
              {WEBHOOK_RESOURCES.map((r) => {
                const active = resources.has(r.value)
                return (
                  <label
                    key={r.value}
                    className="hover:bg-accent/40 flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs"
                  >
                    <Checkbox
                      checked={active}
                      onCheckedChange={() => toggleResource(r.value)}
                      aria-label={r.label}
                    />
                    {r.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhook-team">Team scope</Label>
            <Select
              value={teamId}
              onValueChange={onSelectChange((v) => setTeamId(v))}
            >
              <SelectTrigger
                id="webhook-team"
                aria-label="Team scope"
                className="h-8 text-xs"
              >
                {/* Map team-id values back to team names so the trigger
                 * doesn't display the raw "team-1" identifier after
                 * selection. "all" is its own label, not a team. */}
                <SelectValue>
                  {(v) =>
                    v === "all"
                      ? "All teams"
                      : (teams.find((t) => t.id === (v as string))?.name ?? v)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teams</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhook-secret">Signing secret (optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="webhook-secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Used to verify payloads"
                className="font-mono text-xs"
                autoComplete="off"
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setSecret(generateClientSideSecret())}
                aria-label="Generate signing secret"
              >
                Generate
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Generates a 32-byte base64 string. Leave blank to have the server
              generate one on save.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-destructive text-xs">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit}>
            {submitting
              ? mode === "create"
                ? "Creating…"
                : "Saving…"
              : mode === "create"
                ? "Create webhook"
                : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const APPLICATIONS_DOCS_URL =
  "https://linear.app/docs/third-party-application-approvals"

function ApplicationsSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Applications</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage which third-party applications have access to your workspace.{" "}
          <a
            href={APPLICATIONS_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Third-party application approvals docs (opens in new tab)"
            className="text-foreground font-semibold underline-offset-2 hover:underline"
          >
            Docs <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </p>
      </div>
      <div className="bg-card flex flex-col gap-2 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">
          Your workspace has not yet authorized any external applications to
          connect with your Linear account.
        </p>
        <a
          href={APPLICATIONS_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Learn more about third-party application approvals (opens in new tab)"
          className="text-foreground w-fit text-xs font-medium underline-offset-2 hover:underline"
        >
          Learn more <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
    </div>
  )
}

const BILLING_CONTACT_URL = "https://linear.app/contact/support"
const BILLING_PRICING_URL = "https://linear.app/pricing"

type BillingFeature = { label: string; fullText?: string }

const BILLING_FEATURES: BillingFeature[] = [
  { label: "5 teams" },
  { label: "Unlimited file upload size" },
  { label: "Unlimited issues" },
  { label: "Admin roles" },
  { label: "File upload deletion" },
  { label: "Restrict new user invitations" },
  {
    label: "Restrict agent invocation to …",
    fullText: "Restrict agent invocation to specific teams, members, or tiers.",
  },
]

function BillingSection() {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <div className="mt-2 flex items-start justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              For questions about billing,{" "}
              <a
                href={BILLING_CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Linear support (opens in new tab)"
                className="text-foreground font-semibold underline-offset-2 hover:underline"
              >
                contact us
              </a>
              .
            </p>
            <a
              href={BILLING_PRICING_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="All plans on linear.app/pricing (opens in new tab)"
              className="text-foreground text-sm font-medium underline-offset-2 hover:underline"
            >
              All plans <span aria-hidden="true">→</span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
        </div>

        {/* Current plan — Users label + count share the same baseline */}
        <div className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Free plan</span>
              <span className="border-border bg-muted/40 text-muted-foreground rounded-full border px-2 py-0.5 text-[10px] font-medium">
                Current
              </span>
            </div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              Free for all users
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs">Users</span>
            <span className="text-sm font-semibold">1</span>
          </div>
        </div>

        {/* Upgrade card */}
        <div className="bg-card rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Upgrade to Basic plan</div>
              <div className="text-muted-foreground text-xs">
                $12 per user/mo
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground text-sm font-medium"
              >
                <Link
                  href="/settings/billing/upgrade"
                  scroll={false}
                  aria-label="View all plans"
                >
                  View all plans
                </Link>
              </Button>
              <Button size="sm" className="h-8 text-xs" asChild>
                <Link
                  href="/settings/billing/upgrade"
                  scroll={false}
                  aria-label="Upgrade now"
                >
                  Upgrade now
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {BILLING_FEATURES.map((f) => {
              const row = (
                <div className="text-muted-foreground flex items-start gap-1.5 text-xs">
                  <svg
                    viewBox="0 0 12 12"
                    className="mt-0.5 size-3 shrink-0 fill-none stroke-current stroke-2 text-violet-500"
                    aria-hidden="true"
                  >
                    <polyline points="1.5,6 4.5,9 10.5,3" />
                  </svg>
                  <span className="truncate">{f.label}</span>
                </div>
              )
              if (!f.fullText) {
                return <div key={f.label}>{row}</div>
              }
              return (
                <Tooltip key={f.label}>
                  <TooltipTrigger render={<div tabIndex={0}>{row}</div>} />
                  <TooltipContent>{f.fullText}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </div>

        {/* Recent invoices — demoted to h3 because the page's only h1 is
            "Billing" and there is no intermediate h2 on this view. */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Recent invoices</h3>
          <div className="bg-card rounded-lg border px-4 py-3">
            <span className="text-muted-foreground text-sm">
              No invoices yet
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

const IMPORT_DOCS_URL = "https://linear.app/docs/import-issues"
const CLI_IMPORT_URL =
  "https://github.com/linear/linear/tree/master/packages/import"

const IMPORT_SOURCES: {
  key: string
  name: string
  // Each source renders its official brand mark inline. Marks that include
  // their own background (Shortcut, Linear, Trello) render on a transparent
  // tile; marks drawn in currentColor (GitHub, Jira) sit on a brand-tinted
  // tile; Asana's coral dots render on a neutral white tile.
  Logo: (props: { className?: string }) => React.ReactElement
  tileClass: string
}[] = [
  { key: "asana", name: "Asana", Logo: AsanaLogo, tileClass: "bg-white" },
  { key: "shortcut", name: "Shortcut", Logo: ShortcutLogo, tileClass: "" },
  {
    key: "github",
    name: "GitHub",
    Logo: GitHubLogo,
    tileClass: "bg-[#24292e] text-white",
  },
  {
    key: "jira",
    name: "Jira",
    Logo: JiraLogo,
    tileClass: "bg-[#2684ff] text-white",
  },
  { key: "linear", name: "Linear", Logo: LinearLogo, tileClass: "" },
  { key: "trello", name: "Trello", Logo: TrelloLogo, tileClass: "" },
]

type IncludePrivateTeams = "none" | "all"

function ExportCard() {
  const [privateTeams, setPrivateTeams] =
    usePersistedState<IncludePrivateTeams>(
      "import-export:includePrivateTeams",
      "none"
    )
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const triggerExport = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/export/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includePrivateTeams: privateTeams }),
      })
      if (!res.ok) throw new Error()
      setOpen(false)
      toast.success(
        "We'll email you a link to download the CSV when it's ready."
      )
    } catch {
      toast.error(
        <span>
          Export failed.{" "}
          <button
            type="button"
            onClick={triggerExport}
            className="underline underline-offset-2"
          >
            Retry
          </button>
        </span>
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="divide-border bg-card divide-y overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium">Issue data</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={submitting}
            aria-label="Export issue data"
            className="focus-visible:ring-ring flex items-center gap-1.5 rounded-sm text-sm font-medium hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span
                  aria-hidden="true"
                  className="border-muted-foreground/40 border-t-foreground inline-block size-3 animate-spin rounded-full border-2"
                />
                Requesting…
              </>
            ) : (
              "Export…"
            )}
          </button>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <label
            htmlFor="include-private-teams"
            className="text-sm font-medium"
          >
            Include private teams
          </label>
          <Select
            value={privateTeams}
            onValueChange={(v) => {
              if (v === "none" || v === "all") setPrivateTeams(v)
            }}
          >
            <SelectTrigger
              id="include-private-teams"
              aria-label="Include private teams in export"
              className="h-8 w-28 text-xs"
            >
              <SelectValue>
                {privateTeams === "all" ? "All" : "None"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ExportIssueDataDialog
        open={open}
        onOpenChange={setOpen}
        includePrivateTeams={privateTeams}
        submitting={submitting}
        onConfirm={triggerExport}
      />
    </>
  )
}

function ExportIssueDataDialog({
  open,
  onOpenChange,
  includePrivateTeams,
  submitting,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  includePrivateTeams: IncludePrivateTeams
  submitting: boolean
  onConfirm: () => void | Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export issue data</DialogTitle>
          <DialogDescription>
            We&apos;ll email you a link to download the CSV when it&apos;s
            ready. Exports can take a few minutes for large workspaces.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/40 rounded-md border p-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Format</span>
            <span className="font-medium">CSV</span>
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-muted-foreground">Include private teams</span>
            <span className="font-medium">
              {includePrivateTeams === "all" ? "All" : "None"}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting ? "Requesting…" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ImportExportSection() {
  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Import &amp; export</h1>

      {/* Import assistant */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Import assistant</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          If you use another service to track issues, this tool will create a
          copy of them in Linear.{" "}
          <a
            href={IMPORT_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Import issues documentation (opens in new tab)"
            className="text-foreground font-semibold underline-offset-2 hover:underline"
          >
            Docs <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </p>
        <div className="divide-border divide-y overflow-hidden rounded-lg border">
          {IMPORT_SOURCES.map(({ key, name, Logo, tileClass }) => (
            <Link
              key={key}
              href={`/settings/import-export/migration-assistant?service=${key}`}
              scroll={false}
              aria-label={`Import from ${name}`}
              className="focus-visible:ring-ring group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
            >
              <div
                className={`flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg ${tileClass}`}
              >
                <Logo className="size-6" />
              </div>
              <span className="flex-1 text-sm font-medium">{name}</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="text-muted-foreground size-4"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* CLI import */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">CLI import</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Import issues using our open-source command line tool. Supports Asana
          (CSV), Jira (CSV), GitHub (API), Pivotal Tracker (CSV), Shortcut
          (CSV), and Trello (JSON).
        </p>
        <div className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
          <span className="text-sm font-medium">CLI Importer</span>
          <a
            href={CLI_IMPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the CLI importer on GitHub (opens in new tab)"
            className="focus-visible:ring-ring flex items-center gap-1 rounded-sm text-sm font-medium hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
          >
            Open <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
      </div>

      {/* Export */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Export</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          You can export your issue data in CSV format. Once the export is
          available, we&apos;ll email you the download link.
        </p>
        <ExportCard />
      </div>
    </div>
  )
}

const LABEL_SWATCHES = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#6b7280",
] as const

type LabelScope = "workspace" | "workspace-and-teams" | "archived"

const SCOPE_LABELS: Record<LabelScope, string> = {
  workspace: "Workspace",
  "workspace-and-teams": "Workspace and teams",
  archived: "Archived",
}

type EditTarget = { id: string; field: "name" | "description" } | null

type LabelGroupRow = { id: string; name: string; color: string }

function IssueLabelsSection() {
  const [labels, setLabels] = useState<LabelType[]>([])
  const [groups, setGroups] = useState<LabelGroupRow[]>([])
  const [filter, setFilter] = useState("")
  const [scope, setScope] = useState<LabelScope>("workspace")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState<{
    color: string
    name: string
    description: string
  } | null>(null)
  const [groupDraft, setGroupDraft] = useState<{
    color: string
    name: string
  } | null>(null)
  const [editing, setEditing] = useState<EditTarget>(null)
  const [editingValue, setEditingValue] = useState("")

  useEffect(() => {
    fetch("/api/data/labels")
      .then((r) => r.json())
      .then(setLabels)
      .catch(() => {})
  }, [])

  const visibleLabels = useMemo(() => {
    const term = filter.trim().toLowerCase()
    return labels
      .filter((l) => {
        const archived = Boolean(l.archivedAt)
        if (scope === "archived" && !archived) return false
        if (scope !== "archived" && archived) return false
        if (!term) return true
        return (
          l.name.toLowerCase().includes(term) ||
          (typeof l.description === "string" &&
            l.description.toLowerCase().includes(term))
        )
      })
      .sort((a, b) => {
        const cmp = a.name.localeCompare(b.name)
        return sortDir === "asc" ? cmp : -cmp
      })
  }, [labels, filter, scope, sortDir])

  const startNewLabel = () => {
    setDraft({ color: LABEL_SWATCHES[11], name: "", description: "" })
  }

  const saveNewLabel = async () => {
    if (!draft) return
    const name = draft.name.trim()
    if (!name) {
      setDraft(null)
      return
    }
    try {
      const res = await fetch("/api/data/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color: draft.color,
          description: draft.description.trim(),
          teamId: null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error || "Failed to create label")
        return
      }
      const created = (await res.json()) as LabelType
      setLabels((prev) => [created, ...prev])
      setDraft(null)
      toast.success(`Label "${name}" created`)
    } catch {
      toast.error("Failed to create label")
    }
  }

  const applyUpdate = async (id: string, patch: Partial<LabelType>) => {
    const prev = labels
    setLabels((list) =>
      list.map((l) => (l.id === id ? ({ ...l, ...patch } as LabelType) : l))
    )
    try {
      const res = await fetch(`/api/data/labels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error()
    } catch {
      setLabels(prev)
      toast.error("Failed to update label")
    }
  }

  const commitNameEdit = (id: string) => {
    const next = editingValue.trim()
    const current = labels.find((l) => l.id === id)
    setEditing(null)
    if (!current || !next || next === current.name) return
    applyUpdate(id, { name: next })
  }

  const commitDescriptionEdit = (id: string) => {
    const next = editingValue.trim()
    const current = labels.find((l) => l.id === id)
    setEditing(null)
    if (!current || next === (current.description ?? "")) return
    applyUpdate(id, { description: next })
  }

  const archiveIds = async (ids: string[]) => {
    const at = new Date().toISOString()
    const prev = labels
    setLabels((list) =>
      list.map((l) => (ids.includes(l.id) ? { ...l, archivedAt: at } : l))
    )
    setSelected(new Set())
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/data/labels/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archivedAt: at }),
        })
      )
    ).catch(() => {
      setLabels(prev)
      toast.error("Failed to archive labels")
      return
    })
    toast.success(
      ids.length === 1 ? "Label archived" : `${ids.length} labels archived`
    )
  }

  const deleteIds = async (ids: string[]) => {
    const prev = labels
    setLabels((list) => list.filter((l) => !ids.includes(l.id)))
    setSelected(new Set())
    await Promise.all(
      ids.map((id) => fetch(`/api/data/labels/${id}`, { method: "DELETE" }))
    ).catch(() => {
      setLabels(prev)
      toast.error("Failed to delete labels")
      return
    })
    toast.success(
      ids.length === 1 ? "Label deleted" : `${ids.length} labels deleted`
    )
  }

  const duplicateLabel = async (label: LabelType) => {
    const name = `${label.name} (copy)`
    try {
      const res = await fetch("/api/data/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color: label.color,
          description: label.description ?? "",
          teamId: label.teamId,
        }),
      })
      if (!res.ok) throw new Error()
      const created = (await res.json()) as LabelType
      setLabels((prev) => [created, ...prev])
      toast.success(`Duplicated as "${name}"`)
    } catch {
      toast.error("Failed to duplicate label")
    }
  }

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const saveNewGroup = () => {
    if (!groupDraft || !groupDraft.name.trim()) {
      setGroupDraft(null)
      return
    }
    const group: LabelGroupRow = {
      id: `grp_${Math.random().toString(36).slice(2, 10)}`,
      name: groupDraft.name.trim(),
      color: groupDraft.color,
    }
    setGroups((prev) => [group, ...prev])
    setGroupDraft(null)
    toast.success(`Group "${group.name}" created`)
  }

  // Linear's issue-labels table is 6 columns: select / color dot / name
  // (with description as a smaller secondary line below) / Last applied /
  // Created / row-actions menu. Description and Issues columns were
  // dropped to match Linear.
  const gridCols = "grid grid-cols-[32px_16px_1fr_120px_96px_32px]"
  const allVisibleSelected =
    visibleLabels.length > 0 && visibleLabels.every((l) => selected.has(l.id))
  const someVisibleSelected = visibleLabels.some((l) => selected.has(l.id))

  return (
    <div className="flex max-w-4xl flex-col p-6">
      <h1 className="mb-4 text-xl font-semibold">Issue labels</h1>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name..."
            aria-label="Filter labels by name"
            className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background h-8 w-full rounded-md border bg-transparent pr-3 pl-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Scope: ${SCOPE_LABELS[scope]}`}
                className="text-muted-foreground hover:bg-accent/40 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {SCOPE_LABELS[scope]}
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
              </button>
            }
          />
          <DropdownMenuContent align="start" sideOffset={4}>
            {(
              ["workspace", "workspace-and-teams", "archived"] as LabelScope[]
            ).map((key) => (
              <DropdownMenuItem
                key={key}
                onClick={() => {
                  setScope(key)
                  setSelected(new Set())
                }}
                className="justify-between"
              >
                {SCOPE_LABELS[key]}
                {scope === key && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label="New label group"
            onClick={() =>
              setGroupDraft({ color: LABEL_SWATCHES[9], name: "" })
            }
            className="h-8 text-sm"
          >
            New group
          </Button>
          <Button
            size="sm"
            aria-label="New label"
            onClick={startNewLabel}
            className="h-8 bg-violet-600 text-sm text-white hover:bg-violet-700"
          >
            New label
          </Button>
        </div>
      </div>

      {/* Column headers */}
      <div
        className={`${gridCols} text-muted-foreground border-b px-2 pb-2 text-xs font-medium`}
      >
        <div className="flex items-center">
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={!allVisibleSelected && someVisibleSelected}
            onCheckedChange={(v) => {
              if (v) setSelected(new Set(visibleLabels.map((l) => l.id)))
              else setSelected(new Set())
            }}
            aria-label={
              allVisibleSelected ? "Deselect all labels" : "Select all labels"
            }
            className="size-3.5"
          />
        </div>
        <div />
        <div>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            aria-label={`Sort by name ${sortDir === "asc" ? "descending" : "ascending"}`}
            className="hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex items-center gap-1 rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Name
            <HugeiconsIcon
              icon={sortDir === "asc" ? ArrowDown01Icon : ArrowUp01Icon}
              className="size-3"
            />
          </button>
        </div>
        <div>Last applied</div>
        <div>Created</div>
        <div />
      </div>

      {/* Inline new-label row (prepended) */}
      {draft && (
        <NewLabelDraftRow
          draft={draft}
          setDraft={setDraft}
          onSave={saveNewLabel}
          onCancel={() => setDraft(null)}
          gridCols={gridCols}
        />
      )}

      {/* Inline new-group row */}
      {groupDraft && (
        <div
          className={`${gridCols} bg-accent/20 items-center border-b px-2 py-2.5 text-sm`}
        >
          <div />
          <ColorDotPicker
            color={groupDraft.color}
            onChange={(c) => setGroupDraft((g) => (g ? { ...g, color: c } : g))}
            ariaLabel="Group color"
          />
          <div className="col-span-4 pr-2">
            <input
              autoFocus
              value={groupDraft.name}
              onChange={(e) =>
                setGroupDraft((g) => (g ? { ...g, name: e.target.value } : g))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNewGroup()
                if (e.key === "Escape") setGroupDraft(null)
              }}
              onBlur={saveNewGroup}
              placeholder="Group name"
              aria-label="Group name"
              className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
          </div>
          <div />
        </div>
      )}

      {/* Group rows (non-selectable headers) */}
      {groups.map((g) => (
        <div key={g.id} className={`${gridCols} border-b px-2 py-2.5 text-sm`}>
          <div />
          <span
            className="mt-[3px] size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: g.color }}
            aria-hidden="true"
          />
          <div className="text-foreground col-span-4 text-sm font-medium">
            {g.name}
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              group
            </span>
          </div>
        </div>
      ))}

      {visibleLabels.map((label) => {
        const isChecked = selected.has(label.id)
        const isEditingName =
          editing !== null &&
          editing.id === label.id &&
          editing.field === "name"
        const isEditingDesc =
          editing !== null &&
          editing.id === label.id &&
          editing.field === "description"
        return (
          <div
            key={label.id}
            className={`${gridCols} group/row hover:bg-accent/20 items-center border-b px-2 py-2.5 text-sm last:border-b-0 ${
              isChecked ? "bg-accent/30" : ""
            }`}
          >
            <div className="flex items-center">
              <Checkbox
                checked={isChecked}
                onCheckedChange={(v) => toggleSelect(label.id, !!v)}
                aria-label={`Select ${label.name}`}
                className={`size-3.5 transition-opacity ${
                  isChecked
                    ? "opacity-100"
                    : "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100"
                }`}
              />
            </div>
            <ColorDotPicker
              color={label.color}
              onChange={(c) => applyUpdate(label.id, { color: c })}
              ariaLabel={`Change color of ${label.name}`}
            />
            <div className="flex min-w-0 flex-col pr-2">
              {isEditingName ? (
                <input
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitNameEdit(label.id)
                    if (e.key === "Escape") setEditing(null)
                  }}
                  onBlur={() => commitNameEdit(label.id)}
                  aria-label={`Rename ${label.name}`}
                  className="focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditing({ id: label.id, field: "name" })
                    setEditingValue(label.name)
                  }}
                  aria-label={`Edit name for ${label.name}`}
                  className="hover:bg-accent/30 focus-visible:ring-primary/50 focus-visible:ring-offset-background -ml-1 w-fit max-w-full truncate rounded px-1 text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {label.name}
                </button>
              )}
              {/* Description rendered as inline secondary text under the
                  name to preserve the field after dropping the dedicated
                  Description column. */}
              {isEditingDesc ? (
                <input
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitDescriptionEdit(label.id)
                    if (e.key === "Escape") setEditing(null)
                  }}
                  onBlur={() => commitDescriptionEdit(label.id)}
                  aria-label={`Edit description for ${label.name}`}
                  placeholder="Add label description…"
                  className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditing({ id: label.id, field: "description" })
                    setEditingValue(label.description ?? "")
                  }}
                  aria-label={`Edit description for ${label.name}`}
                  className={`hover:bg-accent/30 focus-visible:ring-primary/50 focus-visible:ring-offset-background -ml-1 w-fit max-w-full truncate rounded px-1 text-left text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                    label.description
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {label.description || "Add label description…"}
                </button>
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              {label.createdAt
                ? new Date(label.createdAt as string).toLocaleDateString()
                : "—"}
            </div>
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label={`Actions for ${label.name}`}
                      className="text-muted-foreground hover:bg-accent/40 hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <HugeiconsIcon
                        icon={MoreHorizontalIcon}
                        strokeWidth={2}
                        className="size-3.5"
                      />
                    </button>
                  }
                />
                <DropdownMenuContent align="end" sideOffset={4}>
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing({ id: label.id, field: "name" })
                      setEditingValue(label.name)
                    }}
                  >
                    <HugeiconsIcon
                      icon={PencilEdit01Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateLabel(label)}>
                    <HugeiconsIcon
                      icon={Copy01Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => archiveIds([label.id])}>
                    <HugeiconsIcon
                      icon={Archive01Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => deleteIds([label.id])}
                    className="text-destructive data-highlighted:text-destructive data-highlighted:bg-destructive/10"
                  >
                    <HugeiconsIcon
                      icon={Delete01Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
      })}

      {visibleLabels.length === 0 && !draft && (
        <div className="text-muted-foreground py-10 text-center text-sm">
          {scope === "archived"
            ? "No archived labels"
            : filter.trim()
              ? "No labels match your filter"
              : "No labels yet"}
        </div>
      )}

      {/* Floating bulk-action bar */}
      {selected.size > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="bg-popover/90 ring-border/70 fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg px-3 py-2 shadow-lg ring-1 supports-backdrop-filter:backdrop-blur-xs"
        >
          <span className="text-muted-foreground text-xs">
            {selected.size} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Archive selected labels"
            onClick={() => archiveIds([...selected])}
            className="h-7 text-xs"
          >
            <HugeiconsIcon
              icon={Archive01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            Archive
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Delete selected labels"
            onClick={() => deleteIds([...selected])}
            className="text-destructive hover:text-destructive h-7 text-xs"
          >
            <HugeiconsIcon
              icon={Delete01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Clear selection"
            onClick={() => setSelected(new Set())}
            className="text-muted-foreground h-7 text-xs"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

function NewLabelDraftRow({
  draft,
  setDraft,
  onSave,
  onCancel,
  gridCols,
}: {
  draft: { color: string; name: string; description: string }
  setDraft: Dispatch<
    SetStateAction<{ color: string; name: string; description: string } | null>
  >
  onSave: () => void
  onCancel: () => void
  gridCols: string
}) {
  // The row has two inputs. Save only when the row fully blurs (neither input
  // is focused after the transition) to avoid saving while moving between them.
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleBlur = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    blurTimer.current = setTimeout(() => {
      if (!draft.name.trim()) {
        onCancel()
      } else {
        onSave()
      }
    }, 0)
  }
  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current)
  }
  return (
    <div
      className={`${gridCols} bg-accent/20 items-center border-b px-2 py-2.5 text-sm`}
    >
      <div />
      <ColorDotPicker
        color={draft.color}
        onChange={(c) => setDraft((d) => (d ? { ...d, color: c } : d))}
        ariaLabel="Pick label color"
      />
      {/* Name + description stack in a single column to match the row
          layout after dropping the standalone Description column. */}
      <div className="flex flex-col pr-2">
        <input
          autoFocus
          value={draft.name}
          onChange={(e) =>
            setDraft((d) => (d ? { ...d, name: e.target.value } : d))
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave()
            if (e.key === "Escape") onCancel()
          }}
          placeholder="Label name"
          aria-label="Label name"
          className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
        <input
          value={draft.description}
          onChange={(e) =>
            setDraft((d) => (d ? { ...d, description: e.target.value } : d))
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave()
            if (e.key === "Escape") onCancel()
          }}
          placeholder="Add label description…"
          aria-label="Label description"
          className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full bg-transparent text-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>
      <div />
      <div />
      <div />
    </div>
  )
}

function ColorDotPicker({
  color,
  onChange,
  ariaLabel,
}: {
  color: string
  onChange: (color: string) => void
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={ariaLabel}
            className="focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-5 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          </button>
        }
      />
      <PopoverContent className="w-auto p-2" align="start" sideOffset={4}>
        <div className="grid grid-cols-8 gap-1.5">
          {LABEL_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Color ${swatch}`}
              onClick={() => {
                onChange(swatch)
                setOpen(false)
              }}
              className="focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-5 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span
                className="size-3.5 rounded-full"
                style={{ backgroundColor: swatch }}
              />
              {swatch.toLowerCase() === color.toLowerCase() && (
                <span className="absolute inline-block size-1.5 rounded-full bg-white mix-blend-difference" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

type IssueTemplateSummary = {
  id: string
  type: "standard" | "custom-form"
  name: string
  description: string
  updatedAt: string
}

function IssueTemplatesSection() {
  const router = useRouter()
  const [templates, setTemplates] = useState<IssueTemplateSummary[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] =
    useState<IssueTemplateSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/templates")
      .then((r) => r.json())
      .then((list: IssueTemplateSummary[]) => {
        if (!cancelled) setTemplates(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const pickType = (type: "standard" | "custom-form") => {
    setPickerOpen(false)
    router.push(`/settings/templates/issue/new?type=${type}`)
  }

  const duplicate = async (t: IssueTemplateSummary) => {
    try {
      const res = await fetch(`/api/templates/${t.id}/duplicate`, {
        method: "POST",
      })
      if (!res.ok) throw new Error()
      const copy = (await res.json()) as IssueTemplateSummary
      setTemplates((prev) => [...prev, copy])
      toast.success(`Duplicated "${t.name}"`)
    } catch {
      toast.error("Failed to duplicate template")
    }
  }

  const exportTemplate = (t: IssueTemplateSummary) => {
    // "Export" is a client-side JSON download — no extra API needed.
    fetch(`/api/templates/${t.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((full) => {
        const blob = new Blob([JSON.stringify(full, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${t.name.replace(/[^\w.-]+/g, "_")}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("Template exported")
      })
      .catch(() => toast.error("Failed to export template"))
  }

  const confirmDeleteTemplate = async () => {
    if (!confirmDelete) return
    const t = confirmDelete
    const prev = templates
    setTemplates((list) => list.filter((x) => x.id !== t.id))
    setConfirmDelete(null)
    try {
      const res = await fetch(`/api/templates/${t.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success(`Deleted "${t.name}"`)
    } catch {
      setTemplates(prev)
      toast.error("Failed to delete template")
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Issue templates</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          These templates are available when creating issues for any team in the
          workspace. To create templates that only apply to specific teams, add
          them as team templates.{" "}
          <a
            href="https://linear.app/docs/issue-templates"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-2 hover:underline"
          >
            Docs ↗
          </a>
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
          <span className="text-muted-foreground text-sm">
            No issue templates
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="New issue template"
            onClick={() => setPickerOpen(true)}
            className="gap-1 text-sm font-medium"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New
            template
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <ul role="list" className="divide-border divide-y">
            {templates.map((t) => (
              <TemplateRow
                key={t.id}
                template={t}
                onOpen={() => router.push(`/settings/templates/issue/${t.id}`)}
                onDuplicate={() => duplicate(t)}
                onExport={() => exportTemplate(t)}
                onDelete={() => setConfirmDelete(t)}
              />
            ))}
          </ul>
          <div className="flex justify-end border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label="New issue template"
              onClick={() => setPickerOpen(true)}
              className="gap-1 text-sm font-medium"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New
              template
            </Button>
          </div>
        </div>
      )}

      <TemplateTypeDialog
        key={String(pickerOpen)}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={pickType}
      />
      <ConfirmDeleteTemplateDialog
        template={confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteTemplate}
      />
    </div>
  )
}

function TemplateRow({
  template,
  onOpen,
  onDuplicate,
  onExport,
  onDelete,
}: {
  template: IssueTemplateSummary
  onOpen: () => void
  onDuplicate: () => void
  onExport: () => void
  onDelete: () => void
}) {
  const updated = new Date(template.updatedAt)
  const relative = formatRelative(updated)

  return (
    <li className="group/tpl hover:bg-accent/20 relative flex items-center gap-3 px-4 py-3">
      {/* Drag handle (decorative; DnD reorder is not persisted). */}
      <span
        className="text-muted-foreground/50 text-xs select-none"
        aria-hidden="true"
      >
        ⋮⋮
      </span>
      <div className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
        <HugeiconsIcon
          icon={FileAddIcon}
          strokeWidth={2}
          className="size-3.5"
        />
      </div>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Edit template ${template.name}`}
        className="focus-visible:ring-primary/50 focus-visible:ring-offset-background min-w-0 flex-1 rounded-sm text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <div className="text-sm font-medium">{template.name}</div>
        {template.description && (
          <div className="text-muted-foreground mt-0.5 truncate text-xs">
            {template.description}
          </div>
        )}
      </button>
      <div className="text-muted-foreground shrink-0 text-xs">
        Updated {relative}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={`Actions for ${template.name}`}
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:bg-accent/40 hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/tpl:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <HugeiconsIcon
                icon={MoreHorizontalIcon}
                strokeWidth={2}
                className="size-3.5"
              />
            </button>
          }
        />
        <DropdownMenuContent align="end" sideOffset={4}>
          <DropdownMenuItem onClick={onOpen}>
            <HugeiconsIcon
              icon={PencilEdit01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}>
            <HugeiconsIcon
              icon={Copy01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExport}>
            <HugeiconsIcon
              icon={BookUploadIcon}
              strokeWidth={2}
              className="size-3.5"
            />
            Export
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive data-highlighted:text-destructive data-highlighted:bg-destructive/10"
          >
            <HugeiconsIcon
              icon={Delete01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

function TemplateTypeDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onPick: (type: "standard" | "custom-form") => void
}) {
  // Parent passes a key tied to `open` so this dialog remounts each time it
  // opens; `focused` therefore starts at "standard" without an effect.
  const [focused, setFocused] = useState<"standard" | "custom-form">("standard")
  const standardRef = useRef<HTMLButtonElement>(null)
  const customRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      ;(focused === "standard" ? standardRef : customRef).current?.focus()
    }, 0)
    return () => clearTimeout(t)
  }, [open, focused])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault()
      setFocused("custom-form")
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault()
      setFocused("standard")
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onPick(focused)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        aria-labelledby="template-type-title"
        aria-describedby="template-type-description"
      >
        <DialogHeader>
          <DialogTitle id="template-type-title">
            Choose issue template type
          </DialogTitle>
          <DialogDescription id="template-type-description">
            Pick the kind of template you&apos;d like to create.
          </DialogDescription>
        </DialogHeader>
        <div
          role="radiogroup"
          aria-label="Template type"
          onKeyDown={handleKeyDown}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <TemplateTypeCard
            ref={standardRef}
            title="Standard"
            subtitle="Basic template with title, description, and default attributes."
            selected={focused === "standard"}
            onSelect={() => {
              setFocused("standard")
              onPick("standard")
            }}
          >
            <div className="bg-muted/30 mt-3 flex flex-col gap-2 rounded-md border p-3">
              <div className="text-xs font-medium">Issue title</div>
              <div className="text-muted-foreground text-[11px]">
                Add description…
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]">
                  Backlog
                </span>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]">
                  Priority
                </span>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]">
                  …
                </span>
              </div>
            </div>
          </TemplateTypeCard>

          <TemplateTypeCard
            ref={customRef}
            title="Custom Form"
            subtitle="Define structured fields and inputs. Ideal for Asks."
            selected={focused === "custom-form"}
            onSelect={() => {
              setFocused("custom-form")
              onPick("custom-form")
            }}
          >
            <div className="bg-muted/30 mt-3 flex flex-col gap-2 rounded-md border p-3">
              <div className="flex flex-col gap-1">
                <div className="text-muted-foreground text-[10px] font-medium uppercase">
                  Repro steps
                </div>
                <div className="bg-background h-5 rounded border" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-muted-foreground text-[10px] font-medium uppercase">
                  Platform
                </div>
                <div className="bg-background flex h-5 items-center justify-between rounded border px-2">
                  <span className="text-muted-foreground/70 text-[10px]">
                    Select…
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className="text-muted-foreground size-2.5"
                  />
                </div>
              </div>
            </div>
          </TemplateTypeCard>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const TemplateTypeCard = forwardRef<
  HTMLButtonElement,
  {
    title: string
    subtitle: string
    selected: boolean
    onSelect: () => void
    children: React.ReactNode
  }
>(function TemplateTypeCard(
  { title, subtitle, selected, onSelect, children },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${title}. ${subtitle}`}
      onClick={onSelect}
      className={`bg-card focus-visible:ring-primary/50 focus-visible:ring-offset-background flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
        selected
          ? "border-primary ring-primary/30 ring-2"
          : "hover:bg-accent/20"
      }`}
    >
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-muted-foreground text-xs">{subtitle}</span>
      {children}
    </button>
  )
})

function ConfirmDeleteTemplateDialog({
  template,
  onCancel,
  onConfirm,
}: {
  template: IssueTemplateSummary | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={!!template} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete template?</DialogTitle>
          <DialogDescription>
            The template{" "}
            <span className="text-foreground font-medium">
              {template?.name}
            </span>{" "}
            will be permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type BillingPlan = "free" | "standard" | "trial" | "business" | "enterprise"

type PlanState = {
  plan: BillingPlan
  trialDaysRemaining: number | null
}

type SlaDurationUnit = "minutes" | "hours" | "days" | "business-hours"

type SlaPolicy = {
  id: string
  name: string
  durationValue: number
  durationUnit: SlaDurationUnit
  scopeChips: string[]
  pauseConditions: string
  breachNotify: string
  createdAt: string
  updatedAt: string
}

type AutomationTrigger = "issue-created" | "issue-updated" | "label-added"
type AutomationAction = "add-sla" | "remove-sla"

type AutomationRule = {
  id: string
  name: string
  trigger: AutomationTrigger
  conditions: {
    teamId: string | null
    labelIds: string[]
    priority: string | null
    assigneeId: string | null
  }
  action: AutomationAction
  slaPolicyId: string | null
  createdAt: string
  updatedAt: string
}

const TRIGGER_LABEL: Record<AutomationTrigger, string> = {
  "issue-created": "When issue is created",
  "issue-updated": "When issue is updated",
  "label-added": "When label is added",
}

function isGatedPlan(plan: BillingPlan): boolean {
  return plan === "free" || plan === "standard"
}

function SLAsSection() {
  const [planData, setPlanData] = useState<PlanState>({
    plan: "free",
    trialDaysRemaining: null,
  })
  const [loading, setLoading] = useState(true)
  const [policies, setPolicies] = useState<SlaPolicy[]>([])
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [trialOpen, setTrialOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<SlaPolicy | "new" | null>(
    null
  )
  const [editingRule, setEditingRule] = useState<AutomationRule | "new" | null>(
    null
  )
  const [confirmDeletePolicy, setConfirmDeletePolicy] =
    useState<SlaPolicy | null>(null)
  const [confirmDeleteRule, setConfirmDeleteRule] =
    useState<AutomationRule | null>(null)

  const gated = isGatedPlan(planData.plan)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [p, pols, rls] = await Promise.all([
          fetch("/api/billing/plan").then((r) => r.json()),
          fetch("/api/slas/policies").then((r) => r.json()),
          fetch("/api/slas/automation-rules").then((r) => r.json()),
        ])
        if (cancelled) return
        setPlanData(p)
        setPolicies(pols)
        setRules(rls)
      } catch {
        if (!cancelled) toast.error("Failed to load SLA settings")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const onTrialStarted = (next: PlanState) => {
    setPlanData(next)
    toast.success("Trial started")
  }

  const upsertPolicy = (p: SlaPolicy, created: boolean) => {
    setPolicies((list) =>
      created ? [...list, p] : list.map((x) => (x.id === p.id ? p : x))
    )
  }

  const upsertRule = (r: AutomationRule, created: boolean) => {
    setRules((list) =>
      created ? [...list, r] : list.map((x) => (x.id === r.id ? r : x))
    )
  }

  const onDeletePolicy = async () => {
    if (!confirmDeletePolicy) return
    const policy = confirmDeletePolicy
    const prev = policies
    setPolicies((list) => list.filter((p) => p.id !== policy.id))
    setConfirmDeletePolicy(null)
    try {
      const res = await fetch(`/api/slas/policies/${policy.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      // Disassociate rules that pointed at this policy (server does this too).
      setRules((list) =>
        list.map((r) =>
          r.slaPolicyId === policy.id ? { ...r, slaPolicyId: null } : r
        )
      )
      toast.success(`Deleted "${policy.name}"`)
    } catch {
      setPolicies(prev)
      toast.error("Failed to delete policy")
    }
  }

  const onDeleteRule = async () => {
    if (!confirmDeleteRule) return
    const rule = confirmDeleteRule
    const prev = rules
    setRules((list) => list.filter((r) => r.id !== rule.id))
    setConfirmDeleteRule(null)
    try {
      const res = await fetch(`/api/slas/automation-rules/${rule.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success(`Deleted rule "${rule.name}"`)
    } catch {
      setRules(prev)
      toast.error("Failed to delete rule")
    }
  }

  return (
    <TooltipProvider>
      <div className="flex max-w-2xl flex-col gap-6 p-6">
        <div>
          <h1 className="text-xl font-semibold">SLAs</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Service-level agreements (SLAs) automatically apply deadlines to
            issues when they match predefined parameters. While often used to
            define response times to customer issues, they can also be used to
            define internal standards for bug and time-sensitive issue
            resolution.{" "}
            <a
              href="https://linear.app/docs/slas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium underline-offset-2 hover:underline"
            >
              Docs ↗
            </a>
          </p>
        </div>

        {/* Plan-aware top card: upsell OR trial banner OR hidden. */}
        {!loading && gated && (
          <div className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <div className="text-sm font-medium">SLAs</div>
              <div className="text-muted-foreground text-xs">
                Service-level agreements are available on Business and
                Enterprise plans
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              aria-label="Start free trial of Linear Business"
              onClick={() => setTrialOpen(true)}
              className="h-8 shrink-0 text-sm"
            >
              Start free trial
            </Button>
          </div>
        )}
        {!loading && planData.plan === "trial" && (
          <div
            role="status"
            className="border-primary/40 bg-primary/10 flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <div>
              <div className="text-sm font-medium">Trial active</div>
              <div className="text-muted-foreground text-xs">
                {planData.trialDaysRemaining ?? 30} days remaining — all SLA
                functionality is enabled.
              </div>
            </div>
          </div>
        )}

        {/* Policies — full UI when ungated. */}
        {!loading && !gated && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">SLA policies</h2>
              <Button
                variant="outline"
                size="sm"
                aria-label="New SLA policy"
                onClick={() => setEditingPolicy("new")}
                className="h-8 text-xs"
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  className="size-3.5"
                />
                New SLA policy
              </Button>
            </div>
            {policies.length === 0 ? (
              <div className="text-muted-foreground bg-card rounded-lg border px-4 py-6 text-center text-sm">
                No SLA policies yet
              </div>
            ) : (
              <ul
                role="list"
                className="bg-card divide-border divide-y rounded-lg border"
              >
                {policies.map((p) => (
                  <li
                    key={p.id}
                    className="group/policy hover:bg-accent/20 flex items-center gap-3 px-4 py-3"
                  >
                    <button
                      type="button"
                      onClick={() => setEditingPolicy(p)}
                      aria-label={`Edit SLA policy ${p.name}`}
                      className="focus-visible:ring-primary/50 focus-visible:ring-offset-background min-w-0 flex-1 rounded-sm text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                        <span>
                          {p.durationValue} {p.durationUnit}
                        </span>
                        {p.scopeChips.map((chip, i) => (
                          <span
                            key={i}
                            className="bg-muted/40 text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px]"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button
                            type="button"
                            aria-label={`Actions for ${p.name}`}
                            className="text-muted-foreground hover:bg-accent/40 hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/policy:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                          >
                            <HugeiconsIcon
                              icon={MoreHorizontalIcon}
                              strokeWidth={2}
                              className="size-3.5"
                            />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end" sideOffset={4}>
                        <DropdownMenuItem onClick={() => setEditingPolicy(p)}>
                          <HugeiconsIcon
                            icon={PencilEdit01Icon}
                            strokeWidth={2}
                            className="size-3.5"
                          />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            fetch("/api/slas/policies", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                name: `${p.name} (copy)`,
                                durationValue: p.durationValue,
                                durationUnit: p.durationUnit,
                                scopeChips: p.scopeChips,
                                pauseConditions: p.pauseConditions,
                                breachNotify: p.breachNotify,
                              }),
                            })
                              .then((r) => r.json())
                              .then((copy: SlaPolicy) => {
                                upsertPolicy(copy, true)
                                toast.success(`Duplicated "${p.name}"`)
                              })
                              .catch(() => toast.error("Duplicate failed"))
                          }}
                        >
                          <HugeiconsIcon
                            icon={Copy01Icon}
                            strokeWidth={2}
                            className="size-3.5"
                          />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setConfirmDeletePolicy(p)}
                          className="text-destructive data-highlighted:text-destructive data-highlighted:bg-destructive/10"
                        >
                          <HugeiconsIcon
                            icon={Delete01Icon}
                            strokeWidth={2}
                            className="size-3.5"
                          />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Automation rules — rendered regardless of plan; Add rule gated. */}
        <section>
          <div className="mb-1 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Automation rules</div>
              <div className="text-muted-foreground text-xs">
                Use automation rules to automatically add or remove SLAs based
                on filters.
              </div>
            </div>
            <GatedAddRuleButton
              gated={gated}
              onClick={() => setEditingRule("new")}
            />
          </div>
          {!gated && rules.length > 0 && (
            <ul
              role="list"
              className="bg-card divide-border mt-3 divide-y rounded-lg border"
            >
              {rules.map((r) => (
                <li
                  key={r.id}
                  className="group/rule hover:bg-accent/20 flex items-center gap-3 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => setEditingRule(r)}
                    aria-label={`Edit automation rule ${r.name}`}
                    className="focus-visible:ring-primary/50 focus-visible:ring-offset-background min-w-0 flex-1 rounded-sm text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-muted-foreground mt-0.5 truncate text-xs">
                      {TRIGGER_LABEL[r.trigger]} ·{" "}
                      {summarizeConditions(r.conditions)} ·{" "}
                      {r.action === "add-sla" ? "Add SLA" : "Remove SLA"}
                      {r.slaPolicyId
                        ? ` (${policies.find((p) => p.id === r.slaPolicyId)?.name ?? "policy"})`
                        : ""}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit rule ${r.name}`}
                    onClick={() => setEditingRule(r)}
                    className="h-7 text-xs opacity-0 transition-opacity group-hover/rule:opacity-100 focus-visible:opacity-100"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete rule ${r.name}`}
                    onClick={() => setConfirmDeleteRule(r)}
                    className="text-destructive hover:text-destructive h-7 text-xs opacity-0 transition-opacity group-hover/rule:opacity-100 focus-visible:opacity-100"
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <StartTrialDialog
          key={`sla-${trialOpen}`}
          open={trialOpen}
          onOpenChange={setTrialOpen}
          onStarted={onTrialStarted}
        />
        <SlaPolicyDialog
          // Remount when the editing target changes so local form state is
          // always seeded fresh from the new policy (or cleared on close).
          key={
            editingPolicy === "new" ? "new" : (editingPolicy?.id ?? "closed")
          }
          mode={editingPolicy === "new" ? "new" : "edit"}
          policy={
            editingPolicy && editingPolicy !== "new" ? editingPolicy : null
          }
          open={editingPolicy !== null}
          onOpenChange={(v) => !v && setEditingPolicy(null)}
          onSaved={upsertPolicy}
        />
        <AutomationRuleDialog
          // Remount when the editing target changes so local form state is
          // always seeded fresh from the new rule (or cleared on close).
          key={editingRule === "new" ? "new" : (editingRule?.id ?? "closed")}
          mode={editingRule === "new" ? "new" : "edit"}
          rule={editingRule && editingRule !== "new" ? editingRule : null}
          policies={policies}
          open={editingRule !== null}
          onOpenChange={(v) => !v && setEditingRule(null)}
          onSaved={upsertRule}
        />
        <ConfirmDeleteSlaDialog
          kind="policy"
          name={confirmDeletePolicy?.name ?? null}
          onCancel={() => setConfirmDeletePolicy(null)}
          onConfirm={onDeletePolicy}
        />
        <ConfirmDeleteSlaDialog
          kind="rule"
          name={confirmDeleteRule?.name ?? null}
          onCancel={() => setConfirmDeleteRule(null)}
          onConfirm={onDeleteRule}
        />
      </div>
    </TooltipProvider>
  )
}

function GatedAddRuleButton({
  gated,
  onClick,
}: {
  gated: boolean
  onClick: () => void
}) {
  const button = (
    <Button
      variant="outline"
      size="sm"
      aria-label="Add automation rule"
      aria-disabled={gated || undefined}
      aria-describedby={gated ? "sla-gated-tooltip" : undefined}
      onClick={() => {
        if (gated) return
        onClick()
      }}
      className={`text-muted-foreground h-8 shrink-0 text-sm ${
        gated ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      Add rule
    </Button>
  )
  if (!gated) return button
  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent id="sla-gated-tooltip">
        Available on Business and Enterprise plans
      </TooltipContent>
    </Tooltip>
  )
}

function summarizeConditions(c: AutomationRule["conditions"]): string {
  const parts: string[] = []
  if (c.teamId) parts.push(`Team: ${c.teamId}`)
  if (c.priority) parts.push(`Priority: ${c.priority}`)
  if (c.assigneeId) parts.push(`Assignee: ${c.assigneeId}`)
  if (c.labelIds.length > 0)
    parts.push(
      `${c.labelIds.length} label${c.labelIds.length === 1 ? "" : "s"}`
    )
  return parts.length === 0 ? "Any issue" : parts.join(" · ")
}

function StartTrialDialog({
  open,
  onOpenChange,
  onStarted,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onStarted: (next: PlanState) => void
}) {
  // Parent passes a key tied to `open` so this dialog remounts each time it
  // opens; `submitting` therefore starts false without an effect.
  const [submitting, setSubmitting] = useState(false)

  const onStart = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/billing/trial", { method: "POST" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Could not start trial")
      }
      const next = (await res.json()) as PlanState
      onOpenChange(false)
      onStarted(next)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start trial")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-labelledby="trial-dialog-title"
      >
        <DialogHeader>
          <DialogTitle id="trial-dialog-title">
            Trial Linear Business
          </DialogTitle>
          <DialogDescription>
            Your workspace will have full access to Issue SLAs and all other
            Business features for the next 30 days. No changes will be made to
            your existing plan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onStart} disabled={submitting}>
            {submitting ? "Starting…" : "Start trial"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SlaPolicyDialog({
  mode,
  policy,
  open,
  onOpenChange,
  onSaved,
}: {
  mode: "new" | "edit"
  policy: SlaPolicy | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: (p: SlaPolicy, created: boolean) => void
}) {
  // Seed initial values from `policy` once on mount. Parent passes a key
  // tied to the editing target so this dialog remounts on each change.
  const [name, setName] = useState(policy?.name ?? "")
  const [durationValue, setDurationValue] = useState(
    policy ? String(policy.durationValue) : "4"
  )
  const [durationUnit, setDurationUnit] = useState<SlaDurationUnit>(
    policy?.durationUnit ?? "hours"
  )
  const [pauseConditions, setPauseConditions] = useState(
    policy?.pauseConditions ?? ""
  )
  const [breachNotify, setBreachNotify] = useState(policy?.breachNotify ?? "")
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    const payload = {
      name: name.trim(),
      durationValue: Number(durationValue) || 0,
      durationUnit,
      pauseConditions,
      breachNotify,
    }
    try {
      const url =
        mode === "new"
          ? "/api/slas/policies"
          : `/api/slas/policies/${policy!.id}`
      const method = mode === "new" ? "POST" : "PATCH"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Save failed")
      }
      const saved = (await res.json()) as SlaPolicy
      onSaved(saved, mode === "new")
      toast.success(mode === "new" ? "Policy created" : "Policy saved")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "new" ? "New SLA policy" : "Edit SLA policy"}
          </DialogTitle>
          <DialogDescription>
            Define a duration and optional pause conditions for issues in scope.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sla-policy-name" className="text-xs font-medium">
              Name
            </Label>
            <Input
              id="sla-policy-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. P1 response time"
              className="h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="sla-policy-duration-value"
                className="text-xs font-medium"
              >
                Duration
              </Label>
              <Input
                id="sla-policy-duration-value"
                type="number"
                min={1}
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="sla-policy-duration-unit"
                className="text-xs font-medium"
              >
                Unit
              </Label>
              <Select
                value={durationUnit}
                onValueChange={(v) => setDurationUnit(v as SlaDurationUnit)}
              >
                <SelectTrigger
                  id="sla-policy-duration-unit"
                  className="h-9 w-40 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="business-hours">Business hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sla-policy-pause" className="text-xs font-medium">
              Pause conditions
            </Label>
            <Input
              id="sla-policy-pause"
              value={pauseConditions}
              onChange={(e) => setPauseConditions(e.target.value)}
              placeholder='e.g. "pause on blocked"'
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sla-policy-breach" className="text-xs font-medium">
              Breach notifications
            </Label>
            <Input
              id="sla-policy-breach"
              value={breachNotify}
              onChange={(e) => setBreachNotify(e.target.value)}
              placeholder="comma-separated recipients"
              className="h-9 text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || submitting}>
            {submitting ? "Saving…" : mode === "new" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AutomationRuleDialog({
  mode,
  rule,
  policies,
  open,
  onOpenChange,
  onSaved,
}: {
  mode: "new" | "edit"
  rule: AutomationRule | null
  policies: SlaPolicy[]
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: (r: AutomationRule, created: boolean) => void
}) {
  // Seed initial values from `rule` when remounted (parent passes a `key`
  // tied to `editingRule` so this state is always fresh on open).
  const [name, setName] = useState(rule?.name ?? "")
  const [trigger, setTrigger] = useState<AutomationTrigger>(
    rule?.trigger ?? "issue-created"
  )
  const [priority, setPriority] = useState<string>(
    rule?.conditions.priority ?? ""
  )
  const [action, setAction] = useState<AutomationAction>(
    rule?.action ?? "add-sla"
  )
  const [slaPolicyId, setSlaPolicyId] = useState<string>(
    rule?.slaPolicyId ?? ""
  )
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    const payload = {
      name: name.trim(),
      trigger,
      conditions: {
        teamId: null,
        labelIds: [],
        priority: priority || null,
        assigneeId: null,
      },
      action,
      slaPolicyId: slaPolicyId || null,
    }
    try {
      const url =
        mode === "new"
          ? "/api/slas/automation-rules"
          : `/api/slas/automation-rules/${rule!.id}`
      const method = mode === "new" ? "POST" : "PATCH"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Save failed")
      }
      const saved = (await res.json()) as AutomationRule
      onSaved(saved, mode === "new")
      toast.success(mode === "new" ? "Rule created" : "Rule saved")
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "new" ? "New automation rule" : "Edit automation rule"}
          </DialogTitle>
          <DialogDescription>
            Automatically add or remove an SLA when matching conditions are met.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sla-rule-name" className="text-xs font-medium">
              Rule name
            </Label>
            <Input
              id="sla-rule-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. P1 → attach response SLA"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sla-rule-trigger" className="text-xs font-medium">
              Trigger
            </Label>
            <Select
              value={trigger}
              onValueChange={(v) => setTrigger(v as AutomationTrigger)}
            >
              <SelectTrigger id="sla-rule-trigger" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issue-created">
                  When issue is created
                </SelectItem>
                <SelectItem value="issue-updated">
                  When issue is updated
                </SelectItem>
                <SelectItem value="label-added">When label is added</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sla-rule-priority" className="text-xs font-medium">
              Priority condition{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Select
              value={priority || "__any"}
              onValueChange={(v) => setPriority(!v || v === "__any" ? "" : v)}
            >
              <SelectTrigger id="sla-rule-priority" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any">Any priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sla-rule-action" className="text-xs font-medium">
              Action
            </Label>
            <Select
              value={action}
              onValueChange={(v) => setAction(v as AutomationAction)}
            >
              <SelectTrigger id="sla-rule-action" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add-sla">Add SLA</SelectItem>
                <SelectItem value="remove-sla">Remove SLA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sla-rule-policy" className="text-xs font-medium">
              SLA policy
            </Label>
            <Select
              value={slaPolicyId || "__none"}
              onValueChange={(v) =>
                setSlaPolicyId(!v || v === "__none" ? "" : v)
              }
            >
              <SelectTrigger id="sla-rule-policy" className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {policies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim() || submitting}>
            {submitting ? "Saving…" : mode === "new" ? "Save" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmDeleteSlaDialog({
  kind,
  name,
  onCancel,
  onConfirm,
}: {
  kind: "policy" | "rule"
  name: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={!!name} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {kind}?</DialogTitle>
          <DialogDescription>
            {kind === "policy" ? "The SLA policy " : "The automation rule "}
            <span className="text-foreground font-medium">{name}</span> will be
            permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ProjectLabelsSection() {
  const [filter, setFilter] = useState("")

  return (
    <div className="flex max-w-4xl flex-col p-6">
      <h1 className="mb-4 text-xl font-semibold">Project labels</h1>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name..."
            className="placeholder:text-muted-foreground/60 focus:ring-ring h-8 w-full rounded-md border bg-transparent pr-3 pl-8 text-sm outline-none focus:ring-2"
          />
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent/40 flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm"
        >
          Workspace <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-sm">
            New group
          </Button>
          <Button
            size="sm"
            className="h-8 bg-violet-600 text-sm text-white hover:bg-violet-700"
          >
            New label
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <svg
          viewBox="0 0 80 60"
          className="text-muted-foreground/30 mb-4 w-20"
          fill="none"
          aria-hidden="true"
        >
          <ellipse
            cx="40"
            cy="30"
            rx="30"
            ry="20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <ellipse
            cx="34"
            cy="30"
            rx="7"
            ry="5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <ellipse
            cx="44"
            cy="27"
            rx="7"
            ry="5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <ellipse
            cx="44"
            cy="33"
            rx="7"
            ry="5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
        <p className="text-muted-foreground text-sm">No labels found</p>
      </div>
    </div>
  )
}

function ProjectTemplatesSection() {
  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Project templates</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          These templates are available when creating projects for any team in
          the workspace. To create templates that only apply to specific teams,
          add them as team templates.{" "}
          <a
            href="#"
            className="text-foreground font-medium underline-offset-2 hover:underline"
          >
            Docs ↗
          </a>
        </p>
      </div>
      <div className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
        <span className="text-muted-foreground text-sm">
          No project templates
        </span>
        <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
          <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New
          template
        </Button>
      </div>
    </div>
  )
}

function ProjectStatusesSection() {
  const GROUPS = [
    { name: "Backlog", type: "backlog" },
    { name: "Planned", type: "planned" },
    { name: "In Progress", type: "in-progress" },
    { name: "Completed", type: "completed" },
    { name: "Canceled", type: "canceled" },
  ]
  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Project statuses</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Project statuses define the workflow that projects go through from
          start to completion
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        {GROUPS.map((g) => (
          <div key={g.name}>
            <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-1.5">
              <span className="text-muted-foreground text-xs font-medium">
                {g.name}
              </span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
              <ProjectStatusIcon type={g.type} />
              <span className="text-sm font-medium">{g.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectStatusIcon({ type }: { type: string }) {
  if (type === "backlog")
    return (
      <svg
        viewBox="0 0 20 20"
        className="size-5 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          rx="3"
          fill="#92400e"
          opacity="0.5"
        />
        <circle
          cx="10"
          cy="10"
          r="4"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
      </svg>
    )
  if (type === "planned")
    return (
      <svg
        viewBox="0 0 20 20"
        className="text-muted-foreground size-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="6.5" />
      </svg>
    )
  if (type === "in-progress")
    return (
      <svg
        viewBox="0 0 20 20"
        className="size-5 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="6.5" stroke="#ca8a04" strokeWidth="1.5" />
        <path
          d="M10 3.5A6.5 6.5 0 0 1 16.5 10"
          stroke="#fbbf24"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    )
  if (type === "completed")
    return (
      <svg
        viewBox="0 0 20 20"
        className="size-5 shrink-0"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="10"
          cy="10"
          r="6.5"
          fill="#5b21b6"
          opacity="0.4"
          stroke="#7c3aed"
          strokeWidth="1.5"
        />
        <path
          d="M7 10l2 2 4-4"
          stroke="#a78bfa"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  return (
    <svg
      viewBox="0 0 20 20"
      className="text-muted-foreground size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="6.5" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" strokeLinecap="round" />
    </svg>
  )
}

const SLACK_ICON = (
  <svg viewBox="0 0 20 20" className="size-4 fill-white" aria-hidden="true">
    <path d="M7.077 11.227a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h1.34v1.34Zm.67 0a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34v-3.35Zm1.34-4.704a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v1.34H9.087Zm0 .67a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H5.737a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35Zm4.703 1.34a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H12.45V8.533Zm-.67 0a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V5.183a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35Zm-1.34 4.704a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V12.9h1.34Zm0-.67a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H11.78Z" />
  </svg>
)

function SlackConnectRow({
  label,
  sublabel,
}: {
  label: string
  sublabel: string
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#4A154B]">
        {SLACK_ICON}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-muted-foreground text-xs">{sublabel}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-sm">
        <button
          type="button"
          aria-label="About Slack integration"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 7v4M8 5h.01" strokeLinecap="round" />
          </svg>
        </button>
        <a
          href={
            process.env.NEXT_PUBLIC_OAUTH_SLACK_URL ??
            "https://slack.com/oauth/v2/authorize?client_id=DEMO&scope=incoming-webhook,channels:read"
          }
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Connect Slack workspace in a new tab"
          className="text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex items-center gap-0.5 rounded font-medium hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Connect
          <svg
            viewBox="0 0 12 12"
            className="ml-0.5 size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3.5 1.5h-2v9h9v-2M7 1.5h3.5v3.5M10.5 1.5 5 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}

type UpdateSchedule =
  | "none"
  | "1w"
  | "2w"
  | "3w"
  | "4w"
  | "5w"
  | "6w"
  | "7w"
  | "8w"

const UPDATE_SCHEDULE_LABEL: Record<UpdateSchedule, string> = {
  none: "No expectation for updates",
  "1w": "Every week",
  "2w": "Every 2 weeks",
  "3w": "Every 3 weeks",
  "4w": "Every 4 weeks",
  "5w": "Every 5 weeks",
  "6w": "Every 6 weeks",
  "7w": "Every 7 weeks",
  "8w": "Every 8 weeks",
}

const UPDATE_SCHEDULE_KEYS: UpdateSchedule[] = [
  "none",
  "1w",
  "2w",
  "3w",
  "4w",
  "5w",
  "6w",
  "7w",
  "8w",
]

function ProjectUpdatesSection() {
  const [schedule, setSchedule] = useState<UpdateSchedule>("none")
  const [editing, setEditing] = useState(false)
  // Held separately so Cancel can revert without mutating the persisted value.
  const [draft, setDraft] = useState<UpdateSchedule>("none")

  const startEdit = () => {
    setDraft(schedule)
    setEditing(true)
  }
  const cancel = () => setEditing(false)
  const save = () => {
    setSchedule(draft)
    setEditing(false)
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Project updates</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Short status reports about the progress and health of your projects.
          Project members regularly post updates, and subscribers automatically
          receive them in their inbox.{" "}
          <a
            href="https://linear.app/docs/project-updates"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-2 hover:underline"
          >
            Docs ↗
          </a>
        </p>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">Update schedule</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Configure how often updates are expected on projects. Project leads
          will receive reminders to post updates.
        </p>
        <div className="bg-card border-border/80 flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
          {editing ? (
            <Select
              value={draft}
              onValueChange={(v) => setDraft((v as UpdateSchedule) ?? "none")}
            >
              <SelectTrigger
                aria-label="Update schedule"
                className="h-8 w-64 text-sm"
              >
                {/* base-ui Select renders the raw `value` (e.g. "none",
                 * "2w") in the trigger unless a render fn maps it to
                 * the friendly label that the dropdown items show. */}
                <SelectValue>
                  {(v) => UPDATE_SCHEDULE_LABEL[v as UpdateSchedule] ?? v}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {UPDATE_SCHEDULE_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {UPDATE_SCHEDULE_LABEL[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-muted-foreground text-sm">
              {UPDATE_SCHEDULE_LABEL[schedule]}
            </span>
          )}

          {editing ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancel}
                aria-label="Cancel editing update schedule"
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={save}
                aria-label="Save update schedule"
                className="h-7 bg-indigo-500 text-xs text-white hover:bg-indigo-600"
              >
                Save
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startEdit}
              aria-label="Edit update schedule"
              className="h-7 text-xs"
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* 1px divider between Update schedule and Slack notifications. */}
      <div className="border-t" aria-hidden="true" />

      <div>
        <h2 className="mb-1 text-sm font-semibold">Slack notifications</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Updates are only posted to Slack when associated with at least one
          non-private team
        </p>
        <SlackConnectRow
          label="Send project updates to a Slack channel"
          sublabel="Connect a channel to send all project updates to"
        />
      </div>
    </div>
  )
}

// Row icons matching the Linear glyph set.
function LinearTriangleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M5.5 4.8a.5.5 0 0 1 .77-.42l9 5.2a.5.5 0 0 1 0 .86l-9 5.2a.5.5 0 0 1-.77-.43V4.8Z"
        fill="currentColor"
      />
    </svg>
  )
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10 6v4.2L13 12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
function CrosshairIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
      <path
        d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6A1.5 1.5 0 0 1 14.5 13H9l-3.5 2.6V13h-.5A1.5 1.5 0 0 1 4 11.5v-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function DocumentLinesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M5 3h7l3 3v10.5A.5.5 0 0 1 14.5 17h-9a.5.5 0 0 1-.5-.5v-13A.5.5 0 0 1 5.5 3Zm7 0v3h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7 9h6M7 11.5h6M7 14h4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function AIAgentsSection() {
  const searchParams = useSearchParams()
  const sub = searchParams.get("sub")
  if (sub === "linear-agent") return <LinearAgentDetailView />
  return <AIAgentsListView />
}

function AIAgentsListView() {
  const router = useRouter()
  // Same plan-gating pattern as SLAs / Asks / Customer requests so the
  // upsell CTA reads the actual workspace plan instead of always
  // showing a stub "Trial flow coming soon" toast. When on trial,
  // surface the trial-active banner like the other Business-gated
  // pages; on a paid plan, the CTA is hidden entirely.
  const [planData, setPlanData] = useState<PlanState>({
    plan: "free",
    trialDaysRemaining: null,
  })
  const [planLoading, setPlanLoading] = useState(true)
  const [trialOpen, setTrialOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/billing/plan")
      .then((r) => r.json())
      .then((p: PlanState) => {
        if (!cancelled) setPlanData(p)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPlanLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const gated = isGatedPlan(planData.plan)

  const goIntegrations = () =>
    router.push("/settings?section=integrations", { scroll: false })
  const goLinearAgent = () =>
    router.push("/settings?section=ai-agents&sub=linear-agent", {
      scroll: false,
    })

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">AI &amp; Agents</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Automate your product development processes and operations with AI
        </p>
      </div>

      {!planLoading && gated && (
        <div className="bg-card border-border/80 flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <div className="text-sm font-medium">AI &amp; Agents</div>
            <div className="text-muted-foreground text-xs">
              Linear Agent and AI automations are available on Business and
              Enterprise plans
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            aria-label="Start free trial of Linear Business"
            onClick={() => setTrialOpen(true)}
            className="h-8 shrink-0"
          >
            Start free trial
          </Button>
        </div>
      )}
      {!planLoading && planData.plan === "trial" && (
        <div
          role="status"
          className="border-primary/40 bg-primary/10 flex items-center justify-between rounded-lg border px-4 py-3"
        >
          <div>
            <div className="text-sm font-medium">Trial active</div>
            <div className="text-muted-foreground text-xs">
              {planData.trialDaysRemaining ?? 30} days remaining — AI &amp;
              Agents features are fully available.
            </div>
          </div>
        </div>
      )}

      <StartTrialDialog
        key={`ai-agents-${trialOpen}`}
        open={trialOpen}
        onOpenChange={setTrialOpen}
        onStarted={(next) => {
          setPlanData(next)
          toast.success("Trial started")
        }}
      />

      <div>
        <h2 className="mb-1 text-sm font-semibold">Linear Agent</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Create issues and answer questions about your workspace.{" "}
          <a
            href="https://linear.app/docs/linear-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-2 hover:underline"
          >
            Docs ↗
          </a>
        </p>
        <div className="divide-border border-border/80 bg-card divide-y overflow-hidden rounded-lg border">
          <button
            type="button"
            onClick={goLinearAgent}
            aria-label="Configure Linear Agent for your workspace"
            className="hover:bg-accent/20 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <LinearTriangleIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Linear Agent</span>
                <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">
                  Beta
                </span>
              </div>
              <div className="text-muted-foreground text-xs">
                Configure for your workspace
              </div>
            </div>
            <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-sm">
              Enabled{" "}
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </div>
          </button>
          <div className="flex items-center gap-3 px-4 py-3 opacity-60">
            <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <ClockIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Agent automations</div>
              <div className="text-muted-foreground text-xs">
                Automated workflows that trigger when issues are added to triage
              </div>
            </div>
            <span className="text-muted-foreground shrink-0 text-xs">
              Available on Business
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 opacity-60">
            <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <CrosshairIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Triage Intelligence</div>
              <div className="text-muted-foreground text-xs">
                Find related issues and infer properties like team, project,
                labels, and assignee
              </div>
            </div>
            <span className="text-muted-foreground shrink-0 text-xs">
              Available on Business
            </span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">
          Linear Agent integrations
        </h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Integrations available to Linear Agent.
        </p>
        <button
          type="button"
          onClick={goIntegrations}
          aria-label="Browse available integrations"
          className="bg-card border-border/80 hover:bg-accent/30 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div>
            <div className="text-sm font-medium">Available integrations</div>
            <div className="text-muted-foreground text-xs">
              Available on Slack, Microsoft Teams, and Gong. Add integrations to
              your workspace to use.
            </div>
          </div>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="text-muted-foreground size-4 shrink-0"
          />
        </button>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">Installed Agents</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          AI agents can work alongside you as teammates.{" "}
          <a
            href="https://linear.app/docs/agents"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-2 hover:underline"
          >
            Docs ↗
          </a>
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={goIntegrations}
            aria-label="Browse integrations to enable new agents"
            className="bg-card border-border/80 hover:bg-accent/30 text-muted-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span>
              Browse{" "}
              <span className="text-foreground font-semibold">
                integrations
              </span>{" "}
              to enable new agents
            </span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 shrink-0"
            />
          </button>
          <button
            type="button"
            aria-label="Configure guidance for installed agents"
            onClick={() =>
              toast.info("Installed agents guidance detail page — coming soon")
            }
            className="bg-card border-border/80 hover:bg-accent/30 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <ChatBubbleIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">
                Installed agents guidance
              </div>
              <div className="text-muted-foreground text-xs">
                Provide context and instructions for installed agents
              </div>
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="text-muted-foreground size-4 shrink-0"
            />
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">AI</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Automate your product development processes and operations with AI
        </p>
        <button
          type="button"
          aria-label="Open Summaries configuration"
          onClick={() => toast.info("Summaries configuration — coming soon")}
          className="bg-card border-border/80 hover:bg-accent/30 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
        >
          <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
            <DocumentLinesIcon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Summaries</div>
            <div className="text-muted-foreground text-xs">
              Control AI-generated summaries across Linear
            </div>
          </div>
          <span className="text-muted-foreground shrink-0 text-xs">
            Available on Business
          </span>
        </button>
      </div>
    </div>
  )
}

function LinearAgentDetailView() {
  const router = useRouter()
  const [enabled, setEnabled] = useState(true)
  const [webSearch, setWebSearch] = useState(false)
  const [mcpEnabled, setMcpEnabled] = useState(true)
  const [guidance, setGuidance] = useState("")

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <button
        type="button"
        onClick={() =>
          router.push("/settings?section=ai-agents", { scroll: false })
        }
        aria-label="Back to AI and Agents"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex w-fit items-center gap-1 rounded text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        AI &amp; Agents
      </button>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Linear Agent</h1>
          <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">
            Beta
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Create issues and answer questions about your workspace
        </p>
      </div>

      <div className="bg-card border-border/80 divide-border divide-y overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <div className="text-sm font-medium">Enable Linear Agent</div>
            <div className="text-muted-foreground text-xs">
              Allow conversations with Linear Agent inside your workspace
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label="Enable Linear Agent"
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <div className="text-sm font-medium">Enable web search</div>
            <div className="text-muted-foreground text-xs">
              Allow Linear Agent to search the public web for current
              information and cite sources
            </div>
          </div>
          <Switch
            checked={webSearch}
            onCheckedChange={setWebSearch}
            aria-label="Enable web search"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">MCP servers</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Allow Linear Agent to use MCP servers connected by workspace members
        </p>
        <div className="bg-card border-border/80 divide-border divide-y overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <div className="text-sm font-medium">Enable MCP servers</div>
              <div className="text-muted-foreground text-xs">
                Allow Linear Agent to use connected MCP servers
              </div>
            </div>
            <Switch
              checked={mcpEnabled}
              onCheckedChange={setMcpEnabled}
              aria-label="Enable MCP servers"
            />
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <div className="text-sm font-medium">Allowed MCP servers</div>
              <div className="text-muted-foreground text-xs">
                Configure which MCP servers can be used in this workspace
              </div>
            </div>
            {/* Workspace-scoped policy lives under Administration → Security
             * (the "Allowed MCP servers" Select there is workspace-wide).
             * The previous target — `?section=agent-personalization` — was
             * the *personal* MCP servers page where individual users add
             * their own connections, which is not what an admin clicking
             * "Manage" expects to land on. */}
            <Link
              href="/settings?section=admin-security"
              aria-label="Manage allowed MCP servers"
              className="text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex items-center gap-0.5 rounded text-sm font-medium hover:opacity-70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Manage
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">Workspace guidance</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Provide instructions and context for Linear Agent when responding to
          conversations within Linear
        </p>
        <textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder="Optional agent guidance…"
          aria-label="Workspace guidance for Linear Agent"
          rows={7}
          className="bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background border-border/80 w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>
    </div>
  )
}

// Initiative update schedule runs up to 12 weeks (vs Project updates' 8).
type InitiativeSchedule =
  | "none"
  | "1w"
  | "2w"
  | "3w"
  | "4w"
  | "5w"
  | "6w"
  | "7w"
  | "8w"
  | "9w"
  | "10w"
  | "11w"
  | "12w"

const INITIATIVE_SCHEDULE_KEYS: InitiativeSchedule[] = [
  "none",
  "1w",
  "2w",
  "3w",
  "4w",
  "5w",
  "6w",
  "7w",
  "8w",
  "9w",
  "10w",
  "11w",
  "12w",
]

const INITIATIVE_SCHEDULE_LABEL: Record<InitiativeSchedule, string> = {
  none: "No expectation for updates",
  "1w": "Every week",
  "2w": "Every 2 weeks",
  "3w": "Every 3 weeks",
  "4w": "Every 4 weeks",
  "5w": "Every 5 weeks",
  "6w": "Every 6 weeks",
  "7w": "Every 7 weeks",
  "8w": "Every 8 weeks",
  "9w": "Every 9 weeks",
  "10w": "Every 10 weeks",
  "11w": "Every 11 weeks",
  "12w": "Every 12 weeks",
}

// Linear's brand indigo-blue used for the Initiatives switch + Save button.
const LINEAR_BRAND_BLUE = "#5E6AD2"

function InitiativesSection() {
  const [enabled, setEnabled] = usePersistedState(
    "linear:initiatives:enabled",
    false
  )
  const [schedule, setSchedule] = useState<InitiativeSchedule>("none")
  const [draft, setDraft] = useState<InitiativeSchedule>("none")
  const [editing, setEditing] = useState(false)

  const startEdit = () => {
    setDraft(schedule)
    setEditing(true)
  }
  const cancel = () => setEditing(false)
  const save = () => {
    setSchedule(draft)
    setEditing(false)
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Initiatives</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Initiatives group multiple projects that contribute toward the same
          strategic effort. Use initiatives to plan and coordinate larger
          streams of work and monitor their progress at scale.{" "}
          <a
            href="https://linear.app/docs/initiatives"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-2 hover:underline"
          >
            Docs ↗
          </a>
        </p>
      </div>

      <div className="bg-card border-border/80 flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <div className="text-sm font-medium">Enable Initiatives</div>
          <div className="text-muted-foreground text-xs">
            Visible to all non-guest workspace members
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="Enable Initiatives"
          className="data-checked:bg-[#5E6AD2] dark:data-checked:bg-[#5E6AD2]"
        />
      </div>

      <div
        className={`flex flex-col transition-opacity ${enabled ? "opacity-100" : "pointer-events-none opacity-50"}`}
        aria-disabled={!enabled}
      >
        {/* 32-40px gap between the Enable Initiatives card and this heading */}
        <div className="mt-2">
          <h2 className="mb-1 text-sm font-semibold">Initiative updates</h2>
          <p className="text-muted-foreground text-xs">
            Short status reports about the progress and health of your
            initiative. Updates are ideally written regularly by the owner of
            the initiative. Subscribers receive these updates directly in their
            inbox. You can also configure a Slack channel where all initiative
            updates are posted.
          </p>

          {/* 16-24px gap between description paragraph and Update schedule */}
          <div className="mt-5">
            <div className="mb-1 text-sm font-medium">Update schedule</div>
            <p className="text-muted-foreground mb-3 text-xs">
              Configure how often updates are expected on initiatives.
              Initiative owners will receive reminders to post updates.
            </p>
            <div className="bg-card border-border/80 flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
              {editing ? (
                <Select
                  value={draft}
                  onValueChange={(v) =>
                    setDraft((v as InitiativeSchedule) ?? "none")
                  }
                >
                  <SelectTrigger
                    aria-label="Initiative update schedule"
                    className="h-8 w-64 text-sm"
                  >
                    {/* See UpdateSchedule above — base-ui needs an
                     * explicit value→label render fn or the trigger
                     * shows the raw cadence key ("none", "2w"). */}
                    <SelectValue>
                      {(v) =>
                        INITIATIVE_SCHEDULE_LABEL[v as InitiativeSchedule] ?? v
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {INITIATIVE_SCHEDULE_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {INITIATIVE_SCHEDULE_LABEL[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {INITIATIVE_SCHEDULE_LABEL[schedule]}
                </span>
              )}
              {editing ? (
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancel}
                    aria-label="Cancel editing initiative update schedule"
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={save}
                    aria-label="Save initiative update schedule"
                    style={{ backgroundColor: LINEAR_BRAND_BLUE }}
                    className="h-7 text-xs text-white hover:opacity-90"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startEdit}
                  aria-label="Edit initiative update schedule"
                  className="h-7 text-xs"
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Extra top margin on Slack notifications heading */}
          <div className="mt-7">
            <div className="mb-3 text-sm font-medium">Slack notifications</div>
            <SlackConnectRow
              label="Send initiative updates to a Slack channel"
              sublabel="Connect a channel to send all initiative updates to"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

type DocumentTemplateSummary = {
  id: string
  name: string
  iconName: string
  createdAt: string
  updatedAt: string
}

const DOC_ICON_GLYPHS: Record<string, string> = {
  document: "📄",
  book: "📘",
  pencil: "✏️",
  sparkle: "✨",
  folder: "📁",
  target: "🎯",
  rocket: "🚀",
  bulb: "💡",
}

function DocumentsSection() {
  const router = useRouter()
  const [templates, setTemplates] = useState<DocumentTemplateSummary[]>([])
  const [confirmDelete, setConfirmDelete] =
    useState<DocumentTemplateSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/document-templates")
      .then((r) => r.json())
      .then((list: DocumentTemplateSummary[]) => {
        if (!cancelled) setTemplates(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const newTemplate = () =>
    router.push("/settings/templates/document/new", { scroll: false })

  const openEdit = (id: string) =>
    router.push(`/settings/templates/document/${id}`, { scroll: false })

  const performDelete = async () => {
    if (!confirmDelete) return
    const t = confirmDelete
    const prev = templates
    setTemplates((list) => list.filter((x) => x.id !== t.id))
    setConfirmDelete(null)
    try {
      const res = await fetch(`/api/document-templates/${t.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success(`Deleted "${t.name}"`)
    } catch {
      setTemplates(prev)
      toast.error("Failed to delete template")
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Documents</h1>
      </div>
      <div>
        <h2 className="mb-1 text-sm font-semibold">Templates</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          These templates are available when creating documents for any team in
          the workspace. To create templates that only apply to specific teams,
          add them as team templates.{" "}
          <a
            href="https://linear.app/docs/document-templates"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-2 hover:underline"
          >
            Docs ↗
          </a>
        </p>

        {templates.length === 0 ? (
          <div className="bg-card border-border/80 flex items-center justify-between rounded-lg border px-4 py-3">
            <span className="text-muted-foreground text-sm">
              No document templates
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label="New document template"
              onClick={newTemplate}
              className="gap-1 text-sm font-medium"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New
              template
            </Button>
          </div>
        ) : (
          <div className="bg-card border-border/80 overflow-hidden rounded-lg border">
            <ul role="list" className="divide-border divide-y">
              {templates.map((t) => (
                <li
                  key={t.id}
                  className="group/doc hover:bg-accent/20 flex items-center gap-3 px-4 py-3"
                >
                  <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md text-base">
                    {DOC_ICON_GLYPHS[t.iconName] ?? "📄"}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEdit(t.id)}
                    aria-label={`Edit template ${t.name}`}
                    className="focus-visible:ring-primary/50 focus-visible:ring-offset-background min-w-0 flex-1 rounded-sm text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {t.name}
                  </button>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/doc:opacity-100 focus-within:opacity-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Rename ${t.name}`}
                      onClick={() => openEdit(t.id)}
                      className="h-7 text-xs"
                    >
                      Rename
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${t.name}`}
                      onClick={() => setConfirmDelete(t)}
                      className="text-destructive hover:text-destructive h-7 text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end border-t px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                aria-label="New document template"
                onClick={newTemplate}
                className="gap-1 text-sm font-medium"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New
                template
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete template?</DialogTitle>
            <DialogDescription>
              The document template{" "}
              <span className="text-foreground font-medium">
                {confirmDelete?.name}
              </span>{" "}
              will be permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={performDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const PULSE_SCHEDULE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  never: "Never",
}

function PulseSection() {
  const [enabled, setEnabled] = usePersistedState("linear:pulse:enabled", false)
  const [wsSchedule, setWsSchedule] = usePersistedState(
    "linear:pulse:wsSchedule",
    "daily"
  )
  const [mySchedule, setMySchedule] = usePersistedState(
    "linear:pulse:mySchedule",
    "never"
  )

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Pulse</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pulse centralizes all your project updates into a single feed. Members
          can choose to receive summary notifications daily or weekly.
        </p>
      </div>

      <div className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <div className="text-sm font-medium">Enable Pulse</div>
          <div className="text-muted-foreground text-xs">
            Workspace-wide feed of updates with optional summary notifications
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">Summary notifications</h2>
        <p className="text-muted-foreground mb-3 text-xs">
          Pulse summary notifications can be delivered in the mornings based on
          a set schedule
        </p>
        <div className="divide-border bg-card divide-y overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">
                Default workspace schedule
              </div>
              <div className="text-muted-foreground text-xs">
                Applies to all members who haven&apos;t set their own preference
              </div>
            </div>
            <Select
              value={wsSchedule}
              onValueChange={onSelectChange(setWsSchedule)}
            >
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue>
                  {(v) => PULSE_SCHEDULE_LABELS[v as string] ?? v}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Your personal schedule</div>
              <div className="text-muted-foreground text-xs">
                Only applies to you, overriding the workspace default
              </div>
            </div>
            <Select
              value={mySchedule}
              onValueChange={onSelectChange(setMySchedule)}
            >
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue>
                  {(v) => PULSE_SCHEDULE_LABELS[v as string] ?? v}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

const CUSTOMER_REQUEST_SWATCHES = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
  "#9ca3af",
] as const

type CustomerRequestItem = {
  id: string
  name: string
  color: string
  isDefault?: boolean
}

type DomainRow = { id: string; value: string }

type ExternalProvider = "none" | "attio" | "hubspot" | "salesforce"

const EXTERNAL_PROVIDERS: { value: ExternalProvider; label: string }[] = [
  { value: "none", label: "None" },
  { value: "attio", label: "Attio" },
  { value: "hubspot", label: "HubSpot" },
  { value: "salesforce", label: "Salesforce" },
]

function CustomerRequestsSection() {
  const router = useRouter()
  const [enabled, setEnabled] = usePersistedState(
    "linear:customerRequests:enabled",
    false
  )
  const [manualEdits, setManualEdits] = useState(false)
  const [revenueFormat, setRevenueFormat] = useState("annual")
  const [currency, setCurrency] = useState("usd")
  const [defaultTeam, setDefaultTeam] = useState("")
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const [provider, setProvider] = useState<ExternalProvider>("none")
  const [providerPickerOpen, setProviderPickerOpen] = useState(false)

  const [statuses, setStatuses] = useState<CustomerRequestItem[]>([
    { id: "s-1", name: "Active", color: "#22c55e", isDefault: true },
    { id: "s-2", name: "Prospect", color: "#0ea5e9" },
    { id: "s-3", name: "Churned", color: "#f59e0b" },
    { id: "s-4", name: "Lost", color: "#ef4444" },
  ])
  const [tiers, setTiers] = useState<CustomerRequestItem[]>([])
  const [excluded, setExcluded] = useState<DomainRow[]>([])
  const [generic, setGeneric] = useState<DomainRow[]>([])

  // Which list currently has an inline-add draft open (only one at a time).
  const [statusDraft, setStatusDraft] = useState<{
    name: string
    color: string
  } | null>(null)
  const [tierDraft, setTierDraft] = useState<{
    name: string
    color: string
  } | null>(null)
  const [excludedDraft, setExcludedDraft] = useState<string | null>(null)
  const [genericDraft, setGenericDraft] = useState<string | null>(null)

  const [editing, setEditing] = useState<{
    kind: "status" | "tier"
    id: string
  } | null>(null)
  const [editingValue, setEditingValue] = useState("")

  useEffect(() => {
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then(setTeams)
      .catch(() => {})
  }, [])

  const gated = !enabled

  // ---- Status / tier helpers -------------------------------------------
  const saveNewStatus = () => {
    if (!statusDraft || !statusDraft.name.trim()) {
      setStatusDraft(null)
      return
    }
    const entry: CustomerRequestItem = {
      id: `s_${Math.random().toString(36).slice(2, 10)}`,
      name: statusDraft.name.trim(),
      color: statusDraft.color,
    }
    setStatuses((prev) => [...prev, entry])
    setStatusDraft(null)
    toast.success(`Status "${entry.name}" added`)
  }

  const saveNewTier = () => {
    if (!tierDraft || !tierDraft.name.trim()) {
      setTierDraft(null)
      return
    }
    const entry: CustomerRequestItem = {
      id: `t_${Math.random().toString(36).slice(2, 10)}`,
      name: tierDraft.name.trim(),
      color: tierDraft.color,
      // First tier automatically becomes the default.
      isDefault: tiers.length === 0,
    }
    setTiers((prev) => [...prev, entry])
    setTierDraft(null)
    toast.success(`Tier "${entry.name}" added`)
  }

  const commitRename = () => {
    if (!editing) return
    const next = editingValue.trim()
    if (!next) {
      setEditing(null)
      return
    }
    const updater = (list: CustomerRequestItem[]) =>
      list.map((x) => (x.id === editing.id ? { ...x, name: next } : x))
    if (editing.kind === "status") setStatuses(updater)
    else setTiers(updater)
    setEditing(null)
  }

  const setColor = (kind: "status" | "tier", id: string, color: string) => {
    const updater = (list: CustomerRequestItem[]) =>
      list.map((x) => (x.id === id ? { ...x, color } : x))
    if (kind === "status") setStatuses(updater)
    else setTiers(updater)
  }

  const makeDefault = (kind: "status" | "tier", id: string) => {
    const updater = (list: CustomerRequestItem[]) =>
      list.map((x) => ({ ...x, isDefault: x.id === id }))
    if (kind === "status") setStatuses(updater)
    else setTiers(updater)
    toast.success("Default updated")
  }

  const remove = (kind: "status" | "tier", id: string) => {
    if (kind === "status") setStatuses((p) => p.filter((x) => x.id !== id))
    else setTiers((p) => p.filter((x) => x.id !== id))
    toast.success(`${kind === "status" ? "Status" : "Tier"} removed`)
  }

  // ---- Domain helpers --------------------------------------------------
  const saveDomain = (kind: "excluded" | "generic") => {
    const draft = kind === "excluded" ? excludedDraft : genericDraft
    if (!draft) return
    if (!isValidDomainOrEmail(draft)) {
      toast.error("Enter a valid domain or email")
      return
    }
    const entry: DomainRow = {
      id: `d_${Math.random().toString(36).slice(2, 10)}`,
      value: draft.trim().toLowerCase(),
    }
    if (kind === "excluded") {
      setExcluded((p) => [...p, entry])
      setExcludedDraft(null)
    } else {
      setGeneric((p) => [...p, entry])
      setGenericDraft(null)
    }
    toast.success(`${entry.value} added`)
  }

  const removeDomain = (kind: "excluded" | "generic", id: string) => {
    if (kind === "excluded") setExcluded((p) => p.filter((x) => x.id !== id))
    else setGeneric((p) => p.filter((x) => x.id !== id))
  }

  // ---- Render ----------------------------------------------------------
  const gatedProps = gated
    ? { "aria-disabled": true as const, "data-disabled": "true" }
    : {}

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Customer requests</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Associate customers with projects and issues to align development
          efforts with real user needs. Manage and track customer requests
          across your entire organization.{" "}
          <a
            href="https://linear.app/docs/customer-requests"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-2 hover:underline"
          >
            Docs ↗
          </a>
        </p>
      </div>

      {/* Enable toggle (always interactive) */}
      <div className="bg-card border-border/80 flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <div className="text-sm font-medium">Enable Customer requests</div>
          <div className="text-muted-foreground text-xs">
            Workspace-wide access to create and view customer requests
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="Enable Customer requests"
        />
      </div>

      {/* All subsequent sections — gated by enabled */}
      <div
        className={`flex flex-col gap-6 transition-opacity ${
          gated ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
        {...gatedProps}
      >
        {/* Manage customers */}
        <button
          type="button"
          onClick={() => router.push("/customers")}
          aria-label="Manage customers"
          disabled={gated}
          className="bg-card border-border/80 hover:bg-accent/30 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
            <svg
              viewBox="0 0 20 20"
              className="text-muted-foreground size-4 fill-current"
              aria-hidden="true"
            >
              <path d="M10 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-5 9.5A3.5 3.5 0 0 1 8.5 9h3A3.5 3.5 0 0 1 15 12.5v.5H5v-.5Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Manage customers</div>
            <div className="text-muted-foreground text-xs">
              Manage your list of customers and their requests
            </div>
          </div>
          <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-sm">
            No customers
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </div>
        </button>

        {/* Issue routing */}
        <div>
          <h2 className="mb-1 text-sm font-semibold">Issue routing</h2>
          <p className="text-muted-foreground mb-3 text-xs">
            When a new issue is created from a customer page, it will be routed
            to the default team&apos;s triage or backlog. This centralizes
            customer requests for ease of management and prioritization.
          </p>
          <div className="bg-card border-border/80 flex items-center justify-between rounded-lg border px-4 py-3">
            <span className="text-muted-foreground text-sm">
              Default team for customer requests
            </span>
            <Select
              value={defaultTeam}
              onValueChange={onSelectChange(setDefaultTeam)}
            >
              <SelectTrigger
                aria-label="Default team for customer requests"
                className="h-8 w-44 text-xs"
              >
                <SelectValue placeholder="Select a team">
                  {/* base-ui Select renders the raw `value` (the team's
                   * id) unless a render fn maps it back to a label.
                   * Resolve through `teams` so the trigger displays
                   * "Platform" rather than "team-1" after selection. */}
                  {(v) => teams.find((t) => t.id === (v as string))?.name ?? v}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Customer statuses */}
        <div>
          <h2 className="mb-1 text-sm font-semibold">Customer statuses</h2>
          <p className="text-muted-foreground mb-3 text-xs">
            Define statuses for segmenting customers
          </p>
          <div className="bg-card border-border/80 overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <span className="text-muted-foreground text-sm">
                {statuses.length} customer statuses
              </span>
              <button
                type="button"
                aria-label="Add customer status"
                onClick={() => setStatusDraft({ name: "", color: "#22c55e" })}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              </button>
            </div>
            {statusDraft && (
              <InlineItemDraft
                color={statusDraft.color}
                name={statusDraft.name}
                onChange={(patch) =>
                  setStatusDraft({ ...statusDraft, ...patch })
                }
                onSave={saveNewStatus}
                onCancel={() => setStatusDraft(null)}
                nameAriaLabel="Status name"
                placeholder="Status name"
              />
            )}
            {statuses.map((s, i) => (
              <ItemRow
                key={s.id}
                item={s}
                isLast={i === statuses.length - 1}
                editing={editing?.kind === "status" && editing.id === s.id}
                editingValue={editingValue}
                onStartEdit={() => {
                  setEditing({ kind: "status", id: s.id })
                  setEditingValue(s.name)
                }}
                onEditingValueChange={setEditingValue}
                onCommitEdit={commitRename}
                onCancelEdit={() => setEditing(null)}
                onColorChange={(c) => setColor("status", s.id, c)}
                onMakeDefault={() => makeDefault("status", s.id)}
                onDelete={() => remove("status", s.id)}
                itemLabel="status"
              />
            ))}
          </div>
        </div>

        {/* Customer tiers */}
        <div>
          <h2 className="mb-1 text-sm font-semibold">Customer tiers</h2>
          <p className="text-muted-foreground mb-3 text-xs">
            Define tiers for segmenting customers
          </p>
          <div className="bg-card border-border/80 overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <span className="text-muted-foreground text-sm">
                {tiers.length === 0
                  ? "No customer tiers"
                  : `${tiers.length} customer tier${tiers.length === 1 ? "" : "s"}`}
              </span>
              <button
                type="button"
                aria-label="Add customer tier"
                onClick={() => setTierDraft({ name: "", color: "#6366f1" })}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
              </button>
            </div>
            {tierDraft && (
              <InlineItemDraft
                color={tierDraft.color}
                name={tierDraft.name}
                onChange={(patch) => setTierDraft({ ...tierDraft, ...patch })}
                onSave={saveNewTier}
                onCancel={() => setTierDraft(null)}
                nameAriaLabel="Tier name"
                placeholder="Tier name"
              />
            )}
            {tiers.map((t, i) => (
              <ItemRow
                key={t.id}
                item={t}
                isLast={i === tiers.length - 1}
                editing={editing?.kind === "tier" && editing.id === t.id}
                editingValue={editingValue}
                onStartEdit={() => {
                  setEditing({ kind: "tier", id: t.id })
                  setEditingValue(t.name)
                }}
                onEditingValueChange={setEditingValue}
                onCommitEdit={commitRename}
                onCancelEdit={() => setEditing(null)}
                onColorChange={(c) => setColor("tier", t.id, c)}
                onMakeDefault={() => makeDefault("tier", t.id)}
                onDelete={() => remove("tier", t.id)}
                itemLabel="tier"
              />
            ))}
          </div>
        </div>

        {/* Display options */}
        <div>
          <h2 className="mb-1 text-sm font-semibold">Display options</h2>
          <div className="divide-border border-border/80 bg-card divide-y overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">Revenue formatting</div>
                <div className="text-muted-foreground text-xs">
                  Data imports must be in annual figures, but can be displayed
                  as monthly or annual
                </div>
              </div>
              <Select
                value={revenueFormat}
                onValueChange={onSelectChange(setRevenueFormat)}
              >
                <SelectTrigger
                  aria-label="Revenue formatting"
                  className="h-8 w-28 text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">Revenue currency</div>
                <div className="text-muted-foreground text-xs">
                  The currency used when displaying customer revenue
                </div>
              </div>
              <Select
                value={currency}
                onValueChange={onSelectChange(setCurrency)}
              >
                <SelectTrigger
                  aria-label="Revenue currency"
                  className="h-8 w-28 text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Customer attributes data source */}
        <div>
          <h2 className="mb-1 text-sm font-semibold">
            Customer attributes data source
          </h2>
          <p className="text-muted-foreground mb-3 text-xs">
            Sync customer attributes from an external data source
          </p>
          <div className="divide-border border-border/80 bg-card divide-y overflow-hidden rounded-lg border">
            <button
              type="button"
              onClick={() => setProviderPickerOpen(true)}
              aria-label="Choose external data source"
              disabled={gated}
              className="hover:bg-accent/20 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex w-full items-center justify-between px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span className="text-sm font-medium">External data source</span>
              <span className="text-muted-foreground flex items-center gap-1 text-sm">
                {EXTERNAL_PROVIDERS.find((p) => p.value === provider)?.label ??
                  "None"}
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
              </span>
            </button>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">Enable manual edits</div>
                <div className="text-muted-foreground text-xs">
                  Attributes can be edited in the Linear UI
                </div>
              </div>
              <Switch
                checked={manualEdits}
                onCheckedChange={setManualEdits}
                aria-label="Enable manual edits"
              />
            </div>
          </div>
        </div>

        {/* Excluded domains */}
        <div>
          <h2 className="mb-1 text-sm font-semibold">
            Excluded domains and emails
          </h2>
          <p className="text-muted-foreground mb-3 text-xs">
            Domains and emails that should never create customer requests
          </p>
          <DomainListCard
            rows={excluded}
            draft={excludedDraft}
            emptyLabel="No excluded domains and emails"
            onOpenDraft={() => setExcludedDraft("")}
            onDraftChange={setExcludedDraft}
            onSave={() => saveDomain("excluded")}
            onCancel={() => setExcludedDraft(null)}
            onRemove={(id) => removeDomain("excluded", id)}
            addLabel="Add excluded domain or email"
          />
        </div>

        {/* Generic domains */}
        <div>
          <h2 className="mb-1 text-sm font-semibold">
            Generic domains and emails
          </h2>
          <p className="text-muted-foreground mb-3 text-xs">
            Domains and emails that are not associated with a specific customer.
            Common providers like Gmail, Outlook, etc. are already included.{" "}
            <a
              href="https://linear.app/docs/generic-domains"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium underline-offset-2 hover:underline"
            >
              List of generic domains ↗
            </a>
          </p>
          <DomainListCard
            rows={generic}
            draft={genericDraft}
            emptyLabel="No custom generic domains and emails"
            onOpenDraft={() => setGenericDraft("")}
            onDraftChange={setGenericDraft}
            onSave={() => saveDomain("generic")}
            onCancel={() => setGenericDraft(null)}
            onRemove={(id) => removeDomain("generic", id)}
            addLabel="Add generic domain or email"
          />
        </div>
      </div>

      {/* Provider picker modal */}
      <Dialog open={providerPickerOpen} onOpenChange={setProviderPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose external data source</DialogTitle>
            <DialogDescription>
              Sync customer attributes from a connected CRM or similar tool.
            </DialogDescription>
          </DialogHeader>
          <ul role="list" className="flex flex-col gap-1">
            {EXTERNAL_PROVIDERS.map((p) => (
              <li key={p.value}>
                <button
                  type="button"
                  onClick={() => {
                    setProvider(p.value)
                    setProviderPickerOpen(false)
                    toast.success(
                      p.value === "none"
                        ? "External data source cleared"
                        : `Connected to ${p.label}`
                    )
                  }}
                  aria-label={`Use ${p.label} as data source`}
                  aria-current={provider === p.value ? "true" : undefined}
                  className={`hover:bg-accent/30 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                    provider === p.value
                      ? "bg-muted font-medium"
                      : "font-normal"
                  }`}
                >
                  {p.label}
                  {provider === p.value && (
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProviderPickerOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ItemRow({
  item,
  isLast,
  editing,
  editingValue,
  onStartEdit,
  onEditingValueChange,
  onCommitEdit,
  onCancelEdit,
  onColorChange,
  onMakeDefault,
  onDelete,
  itemLabel,
}: {
  item: CustomerRequestItem
  isLast: boolean
  editing: boolean
  editingValue: string
  onStartEdit: () => void
  onEditingValueChange: (v: string) => void
  onCommitEdit: () => void
  onCancelEdit: () => void
  onColorChange: (c: string) => void
  onMakeDefault: () => void
  onDelete: () => void
  itemLabel: "status" | "tier"
}) {
  return (
    <div
      className={`group/item hover:bg-accent/10 flex items-center gap-3 px-4 py-2.5 ${
        isLast ? "" : "border-b"
      }`}
    >
      <span
        aria-hidden="true"
        className="text-muted-foreground/50 cursor-grab text-xs opacity-0 transition-opacity select-none group-hover/item:opacity-100"
      >
        ⋮⋮
      </span>
      <CustomerRequestSwatchButton
        color={item.color}
        onChange={onColorChange}
        ariaLabel={`Change color of ${item.name}`}
      />
      {editing ? (
        <input
          autoFocus
          value={editingValue}
          onChange={(e) => onEditingValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitEdit()
            if (e.key === "Escape") onCancelEdit()
          }}
          onBlur={onCommitEdit}
          aria-label={`Rename ${item.name}`}
          className="focus-visible:ring-primary/50 focus-visible:ring-offset-background flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          aria-label={`Rename ${item.name}`}
          className="focus-visible:ring-primary/50 focus-visible:ring-offset-background flex flex-1 items-center gap-2 rounded-sm text-left text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span>{item.name}</span>
          {item.isDefault && (
            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
              Default
            </span>
          )}
        </button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={`Open menu for ${item.name}`}
              className="text-muted-foreground hover:bg-accent/40 hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/item:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <HugeiconsIcon
                icon={MoreHorizontalIcon}
                strokeWidth={2}
                className="size-3.5"
              />
            </button>
          }
        />
        <DropdownMenuContent align="end" sideOffset={4}>
          <DropdownMenuItem onClick={onStartEdit}>
            <HugeiconsIcon
              icon={PencilEdit01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            Rename
          </DropdownMenuItem>
          {!item.isDefault && (
            <DropdownMenuItem onClick={onMakeDefault}>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className="size-3.5"
              />
              Set as default
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive data-highlighted:text-destructive data-highlighted:bg-destructive/10"
          >
            <HugeiconsIcon
              icon={Delete01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            Delete {itemLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function InlineItemDraft({
  color,
  name,
  onChange,
  onSave,
  onCancel,
  nameAriaLabel,
  placeholder,
}: {
  color: string
  name: string
  onChange: (patch: Partial<{ name: string; color: string }>) => void
  onSave: () => void
  onCancel: () => void
  nameAriaLabel: string
  placeholder: string
}) {
  return (
    <div className="bg-accent/10 flex items-center gap-3 border-b px-4 py-2.5">
      <span aria-hidden="true" className="text-muted-foreground/50 text-xs">
        ⋮⋮
      </span>
      <CustomerRequestSwatchButton
        color={color}
        onChange={(c) => onChange({ color: c })}
        ariaLabel="Pick color"
      />
      <input
        autoFocus
        value={name}
        onChange={(e) => onChange({ name: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave()
          if (e.key === "Escape") onCancel()
        }}
        placeholder={placeholder}
        aria-label={nameAriaLabel}
        className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-7 text-xs"
      >
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={onSave}
        disabled={!name.trim()}
        className="h-7 text-xs"
      >
        Save
      </Button>
    </div>
  )
}

function CustomerRequestSwatchButton({
  color,
  onChange,
  ariaLabel,
}: {
  color: string
  onChange: (c: string) => void
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={ariaLabel}
            className="focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-5 items-center justify-center rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span
              className="size-3 rounded-sm"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
          </button>
        }
      />
      <PopoverContent className="w-auto p-2" align="start" sideOffset={4}>
        <div className="grid grid-cols-7 gap-1.5">
          {CUSTOMER_REQUEST_SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Color ${s}`}
              onClick={() => {
                onChange(s)
                setOpen(false)
              }}
              className="focus-visible:ring-primary/50 focus-visible:ring-offset-background size-5 rounded-sm transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              style={{ backgroundColor: s }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DomainListCard({
  rows,
  draft,
  emptyLabel,
  onOpenDraft,
  onDraftChange,
  onSave,
  onCancel,
  onRemove,
  addLabel,
}: {
  rows: DomainRow[]
  draft: string | null
  emptyLabel: string
  onOpenDraft: () => void
  onDraftChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  onRemove: (id: string) => void
  addLabel: string
}) {
  const hasRowsOrDraft = rows.length > 0 || draft !== null
  return (
    <div className="bg-card border-border/80 overflow-hidden rounded-lg border">
      {!hasRowsOrDraft && (
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-muted-foreground text-sm">{emptyLabel}</span>
          <button
            type="button"
            aria-label={addLabel}
            onClick={onOpenDraft}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          </button>
        </div>
      )}
      {hasRowsOrDraft && (
        <>
          {rows.length > 0 && (
            <div className="divide-border divide-y">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="group/d hover:bg-accent/10 flex items-center gap-3 px-4 py-2.5"
                >
                  <span className="flex-1 font-mono text-xs">{r.value}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove ${r.value}`}
                    onClick={() => onRemove(r.id)}
                    className="text-destructive hover:text-destructive h-7 text-xs opacity-0 transition-opacity group-hover/d:opacity-100 focus-visible:opacity-100"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          {draft !== null && (
            <div className="bg-accent/10 flex items-center gap-3 border-t px-4 py-2.5">
              <input
                autoFocus
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSave()
                  if (e.key === "Escape") onCancel()
                }}
                placeholder="example.com or name@example.com"
                aria-label={addLabel}
                className="placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={!draft.trim()}
                className="h-7 text-xs"
              >
                Save
              </Button>
            </div>
          )}
          {draft === null && (
            <div className="flex justify-end border-t px-4 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={addLabel}
                onClick={onOpenDraft}
                className="h-7 text-xs"
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="size-3.5"
                  strokeWidth={2}
                />
                Add
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function isValidDomainOrEmail(value: string): boolean {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return false
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  const DOMAIN_RE =
    /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,}|\.[A-Za-z0-9-]{2,63}\.[A-Za-z]{2,})+$/
  if (trimmed.includes("@")) return EMAIL_RE.test(trimmed)
  return DOMAIN_RE.test(trimmed)
}

// ─── Asks / Emojis / Integrations ────────────────────────────────────────────

const ASKS_DOCS_URL = "https://linear.app/docs/asks"

type AsksFeature = {
  title: string
  desc: string
  href: string
}

const ASKS_FEATURES: AsksFeature[] = [
  {
    title: "Slack intake",
    desc: "Collect asks directly from any Slack channel using /ask.",
    href: "/settings?section=integrations",
  },
  {
    title: "Email intake",
    desc: "Dedicate an inbox address to receive and triage requests.",
    href: "/settings?section=integrations",
  },
  {
    title: "Structured templates",
    desc: "Guide submitters with custom fields and required info.",
    href: "/settings?section=issue-templates",
  },
  {
    title: "Auto-link to issues",
    desc: "Turn accepted asks into Linear issues in one click.",
    href: "/settings?section=slas",
  },
]

function AsksSection() {
  const [planData, setPlanData] = useState<PlanState>({
    plan: "free",
    trialDaysRemaining: null,
  })
  const [loading, setLoading] = useState(true)
  const [trialOpen, setTrialOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/billing/plan")
      .then((r) => r.json())
      .then((p: PlanState) => {
        if (!cancelled) setPlanData(p)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const gated = isGatedPlan(planData.plan)

  const onTrialStarted = (next: PlanState) => {
    setPlanData(next)
    toast.success("Trial started")
  }

  return (
    <TooltipProvider>
      <div className="flex max-w-2xl flex-col gap-6 p-6">
        <div>
          <h1 className="text-xl font-semibold">Asks</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Let anyone submit bug reports, feature requests, and more using
            structured templates from Slack or email.{" "}
            <a
              href={ASKS_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Asks documentation (opens in new tab)"
              className="text-foreground font-medium underline-offset-2 hover:underline"
            >
              Docs <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </p>
        </div>

        {/* Upgrade card — always show the trial CTA, emphasised when gated. */}
        {!loading && gated && (
          <div className="via-card to-card relative overflow-hidden rounded-xl border bg-gradient-to-br from-violet-950/40 p-6">
            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-violet-500/10 blur-2xl" />
            <div className="relative">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-violet-400 uppercase">
                  Business
                </span>
                <span className="text-muted-foreground text-xs">/</span>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-400 uppercase">
                  Enterprise
                </span>
              </div>
              <h2 className="mt-3 text-base font-semibold">
                Asks intake is available on Business or Enterprise plans
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Collect structured requests from customers and teammates via
                Slack or email. Triage, assign, and link them directly to issues
                — without leaving Linear.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <Button
                  size="sm"
                  aria-label="Start free trial of Linear Business"
                  onClick={() => setTrialOpen(true)}
                  className="bg-violet-600 text-white hover:bg-violet-700"
                >
                  Start free trial
                </Button>
                <a
                  href={ASKS_DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Learn more about Asks (opens in new tab)"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Learn more <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
          </div>
        )}
        {!loading && planData.plan === "trial" && (
          <div
            role="status"
            className="bg-card flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <div>
              <div className="text-sm font-medium">Business trial active</div>
              <div className="text-muted-foreground text-xs">
                {planData.trialDaysRemaining ?? 30} days remaining — Asks intake
                is fully available.
              </div>
            </div>
          </div>
        )}

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3">
          {ASKS_FEATURES.map((f) => (
            <AsksFeatureCard key={f.title} feature={f} gated={gated} />
          ))}
        </div>

        <StartTrialDialog
          key={`billing-${trialOpen}`}
          open={trialOpen}
          onOpenChange={setTrialOpen}
          onStarted={onTrialStarted}
        />
      </div>
    </TooltipProvider>
  )
}

function AsksFeatureCard({
  feature,
  gated,
}: {
  feature: AsksFeature
  gated: boolean
}) {
  const body = <div className="text-sm font-medium">{feature.title}</div>
  const desc = (
    <div className="text-muted-foreground mt-1 text-xs">{feature.desc}</div>
  )

  if (gated) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <div
              aria-disabled="true"
              className="bg-card flex cursor-not-allowed flex-col rounded-lg border p-4 opacity-60"
            >
              {body}
              {desc}
            </div>
          }
        />
        <TooltipContent>
          Available on Business and Enterprise plans
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link
      href={feature.href}
      scroll={false}
      className="group bg-card hover:bg-accent/40 hover:border-foreground/20 focus-visible:ring-ring flex flex-col rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex items-center justify-between gap-2">
        {body}
        <span className="text-muted-foreground group-hover:text-foreground text-xs transition-colors">
          Configure <span aria-hidden="true">→</span>
        </span>
      </div>
      {desc}
    </Link>
  )
}

// ─── Emojis ─────────────────────────────────────────────────────────────────

type Emoji = {
  id: string
  shortcode: string
  dataUrl: string
  mimeType: string
  sizeBytes: number
  uploaderId: string
  createdAt: string
}

const EMOJI_MAX_BYTES = 1_048_576
const EMOJI_ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
])
const EMOJI_SHORTCODE_PATTERN = /^[a-z0-9_]{2,32}$/

// Current workspace user — the rest of the app pins to usr-1.
const CURRENT_USER_ID = "usr-1"

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(t)
  }, [value, delay])
  return debounced
}

function EmojisSection() {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query, 200)
  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Emoji | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Emoji | null>(null)

  const currentUser = members.find((m) => m.id === CURRENT_USER_ID)
  const isAdmin = currentUser?.role === "admin"

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/emojis")
      if (!res.ok) throw new Error()
      const data = (await res.json()) as Emoji[]
      setEmojis(data)
    } catch {
      toast.error("Failed to load emojis")
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [emojiRes, memberRes] = await Promise.all([
          fetch("/api/emojis").then((r) => r.json()),
          fetch("/api/data/members").then((r) => r.json()),
        ])
        if (cancelled) return
        setEmojis(emojiRes as Emoji[])
        setMembers(memberRes as Member[])
      } catch {
        if (!cancelled) toast.error("Failed to load emojis")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return emojis
    return emojis.filter((e) => e.shortcode.toLowerCase().includes(q))
  }, [emojis, debouncedQuery])

  const uploadButton = (disabledReason: string | null) => {
    const btn = (
      <Button
        size="sm"
        disabled={!!disabledReason}
        onClick={() => !disabledReason && setUploadOpen(true)}
        className="h-8 gap-1.5 text-xs"
      >
        <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
        Upload
      </Button>
    )
    if (!disabledReason) return btn
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="inline-block" aria-label={disabledReason}>
              {btn}
            </span>
          }
        />
        <TooltipContent>{disabledReason}</TooltipContent>
      </Tooltip>
    )
  }

  const permissionReason = !isAdmin
    ? "Only admins can manage custom emojis."
    : null
  const hasQuery = debouncedQuery.trim().length > 0

  return (
    <TooltipProvider>
      <div className="flex max-w-2xl flex-col gap-0 p-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Emojis</h1>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name…"
              aria-label="Filter emojis by name"
              className="h-8 pl-8 text-xs"
            />
          </div>
          {uploadButton(permissionReason)}
        </div>

        {loading ? (
          <EmojiGridSkeleton />
        ) : filtered.length === 0 && hasQuery ? (
          <div className="text-muted-foreground py-16 text-center text-sm">
            No emojis match &ldquo;{debouncedQuery}&rdquo;
          </div>
        ) : emojis.length === 0 ? (
          <EmojiEmptyState uploadButton={uploadButton(permissionReason)} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
            {filtered.map((e) => (
              <EmojiTile
                key={e.id}
                emoji={e}
                uploader={members.find((m) => m.id === e.uploaderId)}
                canManage={isAdmin}
                onRename={() => setRenameTarget(e)}
                onDelete={() => setDeleteTarget(e)}
              />
            ))}
          </div>
        )}

        <EmojiUploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          existingShortcodes={new Set(emojis.map((e) => e.shortcode))}
          onUploaded={async () => {
            await refresh()
          }}
        />

        <EmojiRenameDialog
          key={renameTarget?.id ?? "closed"}
          emoji={renameTarget}
          existingShortcodes={
            new Set(
              emojis
                .filter((e) => e.id !== renameTarget?.id)
                .map((e) => e.shortcode)
            )
          }
          onClose={() => setRenameTarget(null)}
          onSaved={async () => {
            setRenameTarget(null)
            await refresh()
          }}
        />

        <EmojiDeleteDialog
          key={deleteTarget?.id ?? "closed"}
          emoji={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={async () => {
            setDeleteTarget(null)
            await refresh()
          }}
        />
      </div>
    </TooltipProvider>
  )
}

function EmojiGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading emojis"
      className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-[96px] w-full rounded-lg" />
      ))}
    </div>
  )
}

function EmojiEmptyState({ uploadButton }: { uploadButton: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <div
        aria-hidden="true"
        className="relative mb-6 flex h-20 w-24 items-end justify-center"
      >
        <svg
          viewBox="0 0 48 48"
          className="absolute bottom-0 left-0 h-14 w-14 opacity-20"
          fill="none"
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle cx="17" cy="20" r="2.5" fill="currentColor" />
          <circle cx="31" cy="20" r="2.5" fill="currentColor" />
          <path
            d="M15 30 Q24 38 33 30"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <svg
          viewBox="0 0 48 48"
          className="absolute bottom-2 left-5 h-14 w-14 opacity-40"
          fill="none"
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle cx="17" cy="20" r="2.5" fill="currentColor" />
          <circle cx="31" cy="20" r="2.5" fill="currentColor" />
          <path
            d="M15 30 Q24 38 33 30"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <svg viewBox="0 0 48 48" className="relative h-16 w-16" fill="none">
          <circle
            cx="24"
            cy="24"
            r="22"
            className="fill-muted"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="17" cy="20" r="2.5" fill="currentColor" />
          <circle cx="31" cy="20" r="2.5" fill="currentColor" />
          <path
            d="M15 30 Q24 38 33 30"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <p className="text-foreground text-sm font-medium">No emojis</p>
      <p className="text-muted-foreground mt-1.5 max-w-xs text-xs">
        Upload custom emojis to use across your workspace in issues, comments,
        and reactions.
      </p>
      <div className="mt-4">{uploadButton}</div>
    </div>
  )
}

function EmojiTile({
  emoji,
  uploader,
  canManage,
  onRename,
  onDelete,
}: {
  emoji: Emoji
  uploader: Member | undefined
  canManage: boolean
  onRename: () => void
  onDelete: () => void
}) {
  const createdLabel = new Date(emoji.createdAt).toLocaleDateString()
  return (
    <div className="group bg-card relative flex flex-col items-center rounded-lg border p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={emoji.dataUrl}
        alt={`:${emoji.shortcode}:`}
        width={48}
        height={48}
        className="size-12 object-contain"
      />
      <div className="text-foreground mt-2 truncate text-xs font-medium">
        :{emoji.shortcode}:
      </div>
      <div className="text-muted-foreground mt-0.5 truncate text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
        {uploader?.name ?? "Unknown"} · {createdLabel}
      </div>
      {canManage && (
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={onRename}
            aria-label={`Rename ${emoji.shortcode}`}
            className="bg-background hover:bg-accent focus-visible:ring-ring rounded-md border p-1 focus-visible:ring-2 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={PencilEdit01Icon} className="size-3" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${emoji.shortcode}`}
            className="bg-background hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring rounded-md border p-1 focus-visible:ring-2 focus-visible:outline-none"
          >
            <HugeiconsIcon icon={Delete01Icon} className="size-3" />
          </button>
        </div>
      )}
    </div>
  )
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.readAsDataURL(file)
  })
}

function validateEmojiFile(file: File): string | null {
  if (!EMOJI_ALLOWED_MIME.has(file.type)) {
    return "File must be a PNG, JPEG, GIF, or WEBP image"
  }
  if (file.size > EMOJI_MAX_BYTES) {
    return "File must be 1 MB or smaller"
  }
  return null
}

function EmojiUploadDialog({
  open,
  onOpenChange,
  existingShortcodes,
  onUploaded,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  existingShortcodes: Set<string>
  onUploaded: () => Promise<void> | void
}) {
  const [shortcode, setShortcode] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setShortcode("")
      setFile(null)
      setDataUrl(null)
      setFileError(null)
      setSubmitting(false)
      setDragActive(false)
    }
    onOpenChange(next)
  }

  const acceptFile = async (f: File) => {
    const err = validateEmojiFile(f)
    if (err) {
      setFileError(err)
      setFile(null)
      setDataUrl(null)
      return
    }
    setFileError(null)
    setFile(f)
    try {
      const url = await readFileAsDataUrl(f)
      setDataUrl(url)
    } catch {
      setFileError("Could not read file")
      setFile(null)
      setDataUrl(null)
    }
  }

  const shortcodeTrimmed = shortcode.trim().toLowerCase()
  const shortcodeFormatError =
    shortcodeTrimmed.length > 0 &&
    !EMOJI_SHORTCODE_PATTERN.test(shortcodeTrimmed)
      ? "Use 2–32 lowercase letters, numbers, or underscores"
      : null
  const shortcodeDupeError =
    shortcodeTrimmed.length > 0 && existingShortcodes.has(shortcodeTrimmed)
      ? "Shortcode already in use"
      : null
  const shortcodeError = shortcodeFormatError ?? shortcodeDupeError
  const canSubmit =
    !submitting &&
    !!file &&
    !!dataUrl &&
    !fileError &&
    shortcodeTrimmed.length > 0 &&
    !shortcodeError

  const onSubmit = async () => {
    if (!canSubmit || !file || !dataUrl) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/emojis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortcode: shortcodeTrimmed,
          dataUrl,
          mimeType: file.type,
          sizeBytes: file.size,
          uploaderId: CURRENT_USER_ID,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Upload failed")
      }
      toast.success(`Uploaded :${shortcodeTrimmed}:`)
      handleOpenChange(false)
      await onUploaded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload emoji</DialogTitle>
          <DialogDescription>
            PNG, JPEG, GIF, or WEBP. 1 MB max, 128×128 recommended.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragActive(false)
              const dropped = e.dataTransfer.files?.[0]
              if (dropped) void acceptFile(dropped)
            }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Choose or drop emoji image"
            className={`focus-visible:ring-ring flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none ${
              dragActive
                ? "border-foreground/50 bg-accent/40"
                : "border-border hover:border-foreground/30"
            }`}
          >
            {dataUrl ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dataUrl}
                    alt="Preview"
                    className="size-16 object-contain"
                  />
                  <span className="text-muted-foreground text-[10px]">
                    Full
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dataUrl}
                    alt="Preview at emoji size"
                    className="size-6 object-contain"
                  />
                  <span className="text-muted-foreground text-[10px]">
                    Emoji (24×24)
                  </span>
                </div>
              </div>
            ) : (
              <>
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="text-muted-foreground size-5"
                />
                <p className="text-foreground mt-2 text-sm font-medium">
                  Drop an image or click to browse
                </p>
                <p className="text-muted-foreground mt-0.5">
                  PNG, JPEG, GIF, WEBP · 1 MB max
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={[...EMOJI_ALLOWED_MIME].join(",")}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void acceptFile(f)
                // Clear so choosing the same file twice still fires onChange.
                e.target.value = ""
              }}
            />
          </div>
          {fileError && (
            <p role="alert" className="text-destructive text-xs">
              {fileError}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emoji-shortcode">Shortcode</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground bg-muted/50 rounded-l-md border border-r-0 px-2 py-1.5 font-mono text-xs">
                :
              </span>
              <Input
                id="emoji-shortcode"
                value={shortcode}
                onChange={(e) => setShortcode(e.target.value)}
                placeholder="shipit"
                aria-invalid={shortcodeError ? true : undefined}
                aria-describedby={
                  shortcodeError ? "emoji-shortcode-error" : undefined
                }
                className="rounded-l-none font-mono text-xs"
                autoComplete="off"
              />
              <span className="text-muted-foreground bg-muted/50 rounded-r-md border border-l-0 px-2 py-1.5 font-mono text-xs">
                :
              </span>
            </div>
            {shortcodeError ? (
              <p
                id="emoji-shortcode-error"
                role="alert"
                className="text-destructive text-xs"
              >
                {shortcodeError}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Lowercase letters, numbers, and underscores. 2–32 characters.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit}>
            {submitting ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EmojiRenameDialog({
  emoji,
  existingShortcodes,
  onClose,
  onSaved,
}: {
  emoji: Emoji | null
  existingShortcodes: Set<string>
  onClose: () => void
  onSaved: () => Promise<void> | void
}) {
  // Seed from `emoji` once on mount; parent passes a key tied to the emoji
  // id so the dialog remounts (and reseeds) when a different row is selected.
  const [shortcode, setShortcode] = useState(emoji?.shortcode ?? "")
  const [submitting, setSubmitting] = useState(false)

  const trimmed = shortcode.trim().toLowerCase()
  const formatError =
    trimmed.length > 0 && !EMOJI_SHORTCODE_PATTERN.test(trimmed)
      ? "Use 2–32 lowercase letters, numbers, or underscores"
      : null
  const dupeError =
    trimmed.length > 0 && existingShortcodes.has(trimmed)
      ? "Shortcode already in use"
      : null
  const error = formatError ?? dupeError
  const changed = !!emoji && trimmed !== emoji.shortcode
  const canSubmit = !submitting && changed && trimmed.length > 0 && !error

  const onSubmit = async () => {
    if (!emoji || !canSubmit) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/emojis/${emoji.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortcode: trimmed }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Rename failed")
      }
      toast.success(`Renamed to :${trimmed}:`)
      await onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rename failed")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={!!emoji} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename emoji</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rename-shortcode">Shortcode</Label>
          <Input
            id="rename-shortcode"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "rename-shortcode-error" : undefined}
            className="font-mono text-xs"
            autoComplete="off"
          />
          {error && (
            <p
              id="rename-shortcode-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EmojiDeleteDialog({
  emoji,
  onClose,
  onDeleted,
}: {
  emoji: Emoji | null
  onClose: () => void
  onDeleted: () => Promise<void> | void
}) {
  // Parent passes a key tied to the emoji id, so this dialog remounts (and
  // `submitting` resets) whenever a different row is targeted.
  const [submitting, setSubmitting] = useState(false)

  const onConfirm = async () => {
    if (!emoji) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/emojis/${emoji.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success(`Deleted :${emoji.shortcode}:`)
      await onDeleted()
    } catch {
      toast.error("Delete failed")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={!!emoji} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete emoji?</DialogTitle>
          <DialogDescription>
            <span className="text-foreground font-medium">
              :{emoji?.shortcode}:
            </span>{" "}
            will be permanently removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {submitting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Integration data ────────────────────────────────────────────────────────

// Key for persisting the integrations grid scroll position across the
// detail-page round-trip. The detail page's "Back to integrations" link
// triggers a re-mount of <IntegrationsSection>, which reads this value to
// restore where the user was scrolled before clicking into a card.
const INTEGRATIONS_SCROLL_STORAGE_KEY = "linear:settings:integrations-scroll"

type IntCard = {
  key: string
  name: string
  desc: string
  color: string
  abbr: string
  /** Optional hosted logo URL — when provided, replaces the abbr badge. */
  logoUrl?: string
  preinstalled?: boolean
  connected?: boolean
}

// Each entry in a section inherits the section's category tag (see
// INTEG_ALL_SECTIONS below) so tab filtering can work off a single value.
type IntCardWithCategory = IntCard & { category: string }

const INTEG_ESSENTIALS: IntCard[] = [
  {
    key: "github",
    name: "GitHub",
    desc: "Automate your pull request and commit workflows and keep issues synced both ways",
    color: "bg-[#24292e]",
    abbr: "GH",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/c6a06d2d2349df613faf9de2879142b1e60e59ec-640x640.png?q=95&auto=format&dpr=2",
    connected: true,
  },
  {
    key: "slack",
    name: "Slack",
    desc: "Get notifications and create issues from Slack messages.",
    color: "bg-[#4A154B]",
    abbr: "SL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/28e6449162d4a338f94e6e9d05ae2c9c7b988efb-640x640.png?q=95&auto=format&dpr=2",
    connected: true,
  },
  {
    key: "gitlab",
    name: "GitLab",
    desc: "Automate your Merge Request workflow",
    color: "bg-[#FC6D26]",
    abbr: "GL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/e0b90c083341744ed891a22ae746b7d1c7244ec3-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "figma",
    name: "Figma",
    desc: "Embed and create Figma designs directly in issues.",
    color: "bg-[#F24E1E]",
    abbr: "FG",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/449959adb357c35991dbbdf9c369c162937ebd7a-640x640.png?q=95&auto=format&dpr=2",
    connected: true,
  },
  {
    key: "intercom",
    name: "Intercom",
    desc: "Link customer conversations to issues.",
    color: "bg-[#286EFA]",
    abbr: "IC",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/7296805f298e7093fa4856f7f9f81430fcd6e897-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "gsheets",
    name: "Google Sheets",
    desc: "Export and sync Linear data with spreadsheets.",
    color: "bg-[#34A853]",
    abbr: "GS",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/0ca0591196315b3e8a8a0c3ab80fa56807bcb40c-640x640.png?q=95&auto=format&dpr=2",
  },
]
const INTEG_AGENTS: IntCard[] = [
  {
    key: "codex",
    name: "Codex",
    desc: "Automate code tasks with OpenAI Codex agents.",
    color: "bg-[#1a1a1a]",
    abbr: "CX",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/a7789d9c4baa178dc6043070519e7e32b238bffa-980x980.jpg?q=95&auto=format&dpr=2",
  },
  {
    key: "cursor",
    name: "Cursor",
    desc: "AI code editor — assign issues to Cursor to auto-implement.",
    color: "bg-[#1C1C1C]",
    abbr: "CR",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/66a992ec6b5036e3d3c71793e2f4305e039ce187-2048x2048.png?q=95&auto=format&dpr=2",
  },
  {
    key: "copilot",
    name: "GitHub Copilot",
    desc: "AI coding assistant natively integrated with GitHub.",
    color: "bg-[#24292e]",
    abbr: "CO",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/c275964a06f4f86e5d5333a7cd0755746f8601d7-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "factory",
    name: "Factory",
    desc: "Automate pull request workflows with AI.",
    color: "bg-[#5B2D8E]",
    abbr: "FA",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/1c352b9507c038b57a3cf3c8b18aa6de4c3534e5-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "sentry-ag",
    name: "Sentry Agent",
    desc: "Auto-create and triage issues from Sentry errors.",
    color: "bg-[#362D59]",
    abbr: "SA",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/e3f6a96cc27842761e4d1d3a9236fff1d91caf8c-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "devin",
    name: "Devin",
    desc: "AI software engineer agent that can resolve issues.",
    color: "bg-[#0057FF]",
    abbr: "DV",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/30ce4517f876ac3e290a80f4cfb0b7b3b8c998b7-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "chatprd",
    name: "ChatPRD",
    desc: "AI-powered product spec writing and planning.",
    color: "bg-[#FF5C00]",
    abbr: "CP",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/e2802c92deeba2cec1bfc48c94836e55118be18e-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "charlie",
    name: "Charlie",
    desc: "AI agent for project management automation.",
    color: "bg-[#2A9D8F]",
    abbr: "CH",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/f1e777c2bbc41686efe42e2e73191e9d19ad6fe8-320x320.svg?q=95&auto=format&dpr=2",
  },
]
const INTEG_AI_CLIENTS: IntCard[] = [
  {
    key: "cursor-mcp",
    name: "Cursor MCP",
    desc: "Model context protocol integration for Cursor IDE.",
    color: "bg-[#1C1C1C]",
    abbr: "CM",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/a2bb8e6a60f530cb07b4c7363301206597b5e8b5-400x400.jpg?q=95&auto=format&dpr=2",
  },
  {
    key: "chatgpt",
    name: "ChatGPT",
    desc: "Access and manage your Linear data inside ChatGPT.",
    color: "bg-[#10A37F]",
    abbr: "GP",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/a7789d9c4baa178dc6043070519e7e32b238bffa-980x980.jpg?q=95&auto=format&dpr=2",
  },
  {
    key: "claude-ai",
    name: "Claude",
    desc: "Use your Linear workspace context inside Claude.",
    color: "bg-[#D97757]",
    abbr: "CL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/b95ad5ddcb4b835b54ba093d237df7e019a9cb76-338x338.png?q=95&auto=format&dpr=2",
  },
  {
    key: "v0",
    name: "v0 by Vercel MCP",
    desc: "Build and iterate on UI components with v0.",
    color: "bg-[#1a1a1a]",
    abbr: "V0",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/90f005b1b6422abd2f5a485dd7c3a0ba4487807e-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "windsurf",
    name: "Windsurf",
    desc: "AI-native development environment by Codeium.",
    color: "bg-[#0B6EFD]",
    abbr: "WS",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/010368ce15dcc0864d483c82d10abe075a133096-2048x2048.png?q=95&auto=format&dpr=2",
  },
  {
    key: "replit",
    name: "Replit",
    desc: "Build and deploy apps with AI in Replit.",
    color: "bg-[#F26207]",
    abbr: "RP",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/64cbb0c4172e19b417bdb5a1249953e8acdb5a4c-512x512.png?q=95&auto=format&dpr=2",
  },
  {
    key: "dust",
    name: "Dust",
    desc: "AI assistant platform connected to your tools.",
    color: "bg-[#5865F2]",
    abbr: "DU",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/81562aadf0902e7b6d90bbcbc0328a679ba9caca-400x400.jpg?q=95&auto=format&dpr=2",
  },
  {
    key: "adk",
    name: "ADK",
    desc: "Agent Development Kit by Google for building agents.",
    color: "bg-[#4285F4]",
    abbr: "AK",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/37e9f1467d369be3a027b65fe883e3eafe6257fd-512x512.png?q=95&auto=format&dpr=2",
  },
]
const INTEG_ENGINEERING: IntCard[] = [
  {
    key: "github-eng",
    name: "GitHub",
    desc: "Automate your pull request and commit workflows and keep issues synced both ways",
    color: "bg-[#24292e]",
    abbr: "GH",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/c6a06d2d2349df613faf9de2879142b1e60e59ec-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "gitlab-eng",
    name: "GitLab",
    desc: "Automate your Merge Request workflow",
    color: "bg-[#FC6D26]",
    abbr: "GL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/e0b90c083341744ed891a22ae746b7d1c7244ec3-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "pagerduty",
    name: "PagerDuty Triage Responsibility",
    desc: "Automate the rotation of triage responsibility with PagerDuty schedules",
    color: "bg-[#06AC38]",
    abbr: "PD",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/5270d5bb25156b96bc47435cae3e9945898b2bbe-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "sentry-eng",
    name: "Sentry",
    desc: "Create and link issues with Sentry and automate issue creation",
    color: "bg-[#362D59]",
    abbr: "SE",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/064fe767b3259577c743a29fdd10c5d89b882986-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "vscode",
    name: "VS Code",
    desc: "Easily build VS Code extensions with Linear Connect",
    color: "bg-[#007ACC]",
    abbr: "VS",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/af181833bf682f74ddf80677010a45f5336458f1-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "datadog",
    name: "Datadog",
    desc: "Create issues from Datadog monitors and alerts",
    color: "bg-[#632CA6]",
    abbr: "DD",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/d3874255fb62313e4a400a646daded2dd3134ad3-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "incidentio",
    name: "incident.io",
    desc: "Manage incidents and triage responsibility directly in Linear",
    color: "bg-[#FF4500]",
    abbr: "IO",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/ec4ee75448119256c87a7e73a04cd654316a5081-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "raycast-eng",
    name: "Raycast",
    desc: "Create, search, and modify your issues from anywhere",
    color: "bg-[#FF6363]",
    abbr: "RC",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/4924296a6790edbed3f78d9f9d2feade10475432-640x640.png?q=95&auto=format&dpr=2",
  },
]
const INTEG_LINEAR_CRAFTED: IntCard[] = [
  {
    key: "github-lc",
    name: "GitHub",
    desc: "Automate your pull request and commit workflows and keep issues synced both ways",
    color: "bg-[#24292e]",
    abbr: "GH",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/c6a06d2d2349df613faf9de2879142b1e60e59ec-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "slack-lc",
    name: "Slack",
    desc: "Create issues from Slack messages and sync threads",
    color: "bg-[#4A154B]",
    abbr: "SL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/28e6449162d4a338f94e6e9d05ae2c9c7b988efb-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "gitlab-lc",
    name: "GitLab",
    desc: "Automate your Merge Request workflow",
    color: "bg-[#FC6D26]",
    abbr: "GL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/e0b90c083341744ed891a22ae746b7d1c7244ec3-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "figma-lc",
    name: "Figma",
    desc: "Create and link issues directly from Figma",
    color: "bg-[#F24E1E]",
    abbr: "FG",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/449959adb357c35991dbbdf9c369c162937ebd7a-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "linear-asks",
    name: "Linear Asks for Slack",
    desc: "Turn requests from Slack or email into actionable issues and enable helpdesk workflows",
    color: "bg-violet-600",
    abbr: "LA",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/50523dc935cc10d87e73339ac5993e1cee96f96b-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "notion-lc",
    name: "Notion",
    desc: "Previews of Linear issues, views and projects and query Notion AI",
    color: "bg-[#1a1a1a]",
    abbr: "NO",
  },
  {
    key: "pagerduty-lc",
    name: "PagerDuty Triage Responsibility",
    desc: "Automate the rotation of triage responsibility with PagerDuty schedules",
    color: "bg-[#06AC38]",
    abbr: "PD",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/5270d5bb25156b96bc47435cae3e9945898b2bbe-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "zapier-lc",
    name: "Zapier",
    desc: "Build custom automations to create or update Linear issues",
    color: "bg-[#FF4A00]",
    abbr: "ZP",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/94bd5466ea791027d70d782aaff47ef4d3c18799-640x640.png?q=95&auto=format&dpr=2",
  },
]
const INTEG_BUG_REPORTING: IntCard[] = [
  {
    key: "linear-asks-br",
    name: "Linear Asks for Slack",
    desc: "Turn requests from Slack or email into actionable issues and enable helpdesk workflows",
    color: "bg-violet-600",
    abbr: "LA",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/830e30a69616db480837dd03f5c17c67f1e6fbf5-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "sentry-br",
    name: "Sentry",
    desc: "Create and link issues with Sentry and automate issue creation",
    color: "bg-[#362D59]",
    abbr: "SE",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/064fe767b3259577c743a29fdd10c5d89b882986-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "incidentio-br",
    name: "incident.io",
    desc: "Manage incidents and triage responsibility directly in Linear",
    color: "bg-[#FF4500]",
    abbr: "IO",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/ec4ee75448119256c87a7e73a04cd654316a5081-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "birdeats",
    name: "Bird Eats Bug",
    desc: "Speed up your bug reporting workflow with Bird Eats Bug",
    color: "bg-rose-600",
    abbr: "BB",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/65cf0a9026350b5d3c8f1324d8ef3b742e44166c-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "honeybadger",
    name: "Honeybadger",
    desc: "Manage Honeybadger errors via Linear issues",
    color: "bg-amber-600",
    abbr: "HB",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/7466424a5a8ec87795773a6b98a06ff1718cc990-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "jam",
    name: "Jam",
    desc: "Create Linear issues with all the details developers need to resolve bugs faster",
    color: "bg-[#6B21A8]",
    abbr: "JM",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/404cd197c83e602d8cc911cb4300198c8cac03f3-361x361.png?q=95&auto=format&dpr=2",
  },
  {
    key: "vercel-br",
    name: "Vercel",
    desc: "Turn Vercel Preview Deployment comments into action items",
    color: "bg-[#1a1a1a]",
    abbr: "VC",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/a03e6ddf8e9a8b62a4dbc271c74ac922179c69f3-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "arc",
    name: "Arc",
    desc: "Create new issues right from your browser command bar",
    color: "bg-gradient-to-br from-amber-400 to-orange-500",
    abbr: "AC",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/38bd3ef307de0e988855ec3cf35ba66062f4da3d-640x640.png?q=95&auto=format&dpr=2",
    preinstalled: true,
  },
]
const INTEG_AUTOMATIONS: IntCard[] = [
  {
    key: "zapier-au",
    name: "Zapier",
    desc: "Build custom automations to create or update Linear issues",
    color: "bg-[#FF4A00]",
    abbr: "ZP",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/94bd5466ea791027d70d782aaff47ef4d3c18799-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "email-au",
    name: "Create issues via email",
    desc: "Set up email addresses for teams or templates to create issues via email",
    color: "bg-sky-600",
    abbr: "EM",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/c9e4e724a49df49600340f58b5dc0b67de9f5908-320x320.png?q=95&auto=format&dpr=2",
    preinstalled: true,
  },
  {
    key: "jira-au",
    name: "Jira",
    desc: "Smoothly transition from Jira to Linear",
    color: "bg-[#0052CC]",
    abbr: "JR",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/6c8f4a282d5543687b285a001333f552e3a1c168-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "raycast-au",
    name: "Raycast",
    desc: "Create, search, and modify your issues from anywhere",
    color: "bg-[#FF6363]",
    abbr: "RC",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/4924296a6790edbed3f78d9f9d2feade10475432-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "fivetran",
    name: "Fivetran",
    desc: "Sync your Linear data with the Fivetran connector",
    color: "bg-[#0073E6]",
    abbr: "FT",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/cc537fc23546e656b9b0834dadfe222575989c0a-480x480.webp?q=95&auto=format&dpr=2",
  },
  {
    key: "axolo",
    name: "Axolo",
    desc: "Make code reviews easier by syncing your pull request channels with your Linear issues",
    color: "bg-emerald-600",
    abbr: "AX",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/916c00e3f63de8555baa082911ee365240d37ee5-1595x1600.png?q=95&auto=format&dpr=2",
  },
  {
    key: "capybara",
    name: "Capybara",
    desc: "Create Linear issues and comments based on Jira tasks",
    color: "bg-amber-700",
    abbr: "CB",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/138003a7f1cc184124271e84b4f25c078a94abb1-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "circleback",
    name: "Circleback",
    desc: "Automatically create Linear issues from meeting action items",
    color: "bg-[#7C3AED]",
    abbr: "CK",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/ac258376c6682856b7dbefb735a2f426f29ca6a9-640x640.png?q=95&auto=format&dpr=2",
  },
]
const INTEG_CUSTOMER_EXP: IntCard[] = [
  {
    key: "zendesk",
    name: "Zendesk",
    desc: "Link Zendesk tickets to Linear issues and sync status updates back to support agents.",
    color: "bg-[#03363D]",
    abbr: "ZD",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/de2ffe1da4e2a19d4a2bff0eb54eb7772a31d968-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "intercom-cx",
    name: "Intercom",
    desc: "Triage Intercom conversations into Linear issues and track resolution progress.",
    color: "bg-[#286EFA]",
    abbr: "IC",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/7296805f298e7093fa4856f7f9f81430fcd6e897-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "front",
    name: "Front",
    desc: "Turn Front shared-inbox messages into Linear issues and keep customer replies in sync.",
    color: "bg-[#F5365C]",
    abbr: "FR",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/8ff0c78c4358fda5a98bce1d6e8bf0fe3716d902-390x390.png?q=95&auto=format&dpr=2",
  },
  {
    key: "canny",
    name: "Canny",
    desc: "Sync Canny posts to Linear issues to keep customers in the loop",
    color: "bg-[#0C64E4]",
    abbr: "CA",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/5320afb074f86bd08bf2c3a34333b721ea984856-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "productlane",
    name: "Productlane",
    desc: "Helpdesk, customer requests portal, public roadmap, and changelog built on Linear",
    color: "bg-violet-700",
    abbr: "PL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/e5ab4b2ac91a5e345c91a55aa17c22f842547912-1128x1128.png?q=95&auto=format&dpr=2",
  },
  {
    key: "index",
    name: "Index",
    desc: "The Productboard and Jira Product Discovery alternative for Product Management on Linear",
    color: "bg-[#374151]",
    abbr: "IX",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/57cf1ecae593d35acbde56de591d2e82088ee977-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "salesforce",
    name: "Salesforce",
    desc: "Create Linear issues from Salesforce cases",
    color: "bg-[#00A1E0]",
    abbr: "SF",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/38a6f572826cc73efbf3a171c4117ed469d78b3f-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "atlas",
    name: "Atlas Support",
    desc: "Keep a tight feedback loop with customers and streamline customer requests",
    color: "bg-[#6366F1]",
    abbr: "AS",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/05378a6a58912a1a5dc75596dc90905014f31787-361x360.png?q=95&auto=format&dpr=2",
  },
]
const INTEG_COLLABORATION: IntCard[] = [
  {
    key: "slack-co",
    name: "Slack",
    desc: "Create issues from Slack messages and sync threads",
    color: "bg-[#4A154B]",
    abbr: "SL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/28e6449162d4a338f94e6e9d05ae2c9c7b988efb-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "linear-asks-co",
    name: "Linear Asks for Slack",
    desc: "Turn requests from Slack or email into actionable issues and enable helpdesk workflows",
    color: "bg-violet-600",
    abbr: "LA",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/50523dc935cc10d87e73339ac5993e1cee96f96b-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "notion-co",
    name: "Notion",
    desc: "Previews of Linear issues, views and projects and query Notion AI",
    color: "bg-[#1a1a1a]",
    abbr: "NO",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/830e30a69616db480837dd03f5c17c67f1e6fbf5-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "msteams",
    name: "Microsoft Teams",
    desc: "Drive work forward by turning conversations into issues, projects, and documents",
    color: "bg-[#6264A7]",
    abbr: "MT",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/007986d3aa0bf2af94e069f35504badd8f3c5a76-16x16.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "discord",
    name: "Discord",
    desc: "Create issues, share updates, and keep everyone in sync",
    color: "bg-[#5865F2]",
    abbr: "DS",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/03f104f3260fa9b019fc42dd95f97e5879d3b1cf-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "glean",
    name: "Glean",
    desc: "Search Linear for instant insights",
    color: "bg-[#3B82F6]",
    abbr: "GL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/efe22db0da266aaa937e9416f84e542ff43b662e-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "productlane-co",
    name: "Productlane",
    desc: "Helpdesk, customer requests portal, public roadmap, and changelog built on Linear",
    color: "bg-violet-700",
    abbr: "PL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/e5ab4b2ac91a5e345c91a55aa17c22f842547912-1128x1128.png?q=95&auto=format&dpr=2",
  },
  {
    key: "range",
    name: "Range",
    desc: "Pull Linear issues into async check-ins to keep your software development team in sync",
    color: "bg-[#374151]",
    abbr: "RG",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/ebc565fa12d244bcbd0bd5dcd1f0b0d0013f9f09-320x320.png?q=95&auto=format&dpr=2",
  },
]
const INTEG_MEDIA_DESIGN: IntCard[] = [
  {
    key: "figma-md",
    name: "Figma",
    desc: "Create and link issues directly from Figma",
    color: "bg-[#F24E1E]",
    abbr: "FG",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/449959adb357c35991dbbdf9c369c162937ebd7a-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "canva",
    name: "Canva AI Connector",
    desc: "Create and link Linear workflow content directly within Canva",
    color: "bg-[#00C4CC]",
    abbr: "CA",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/1f93effd803c1819902e2115accaf94bece02698-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "claap",
    name: "Claap",
    desc: "Record bugs and directly create issues in Linear",
    color: "bg-rose-600",
    abbr: "CL",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/82881a9e2bc47bf43dbe562a73badb32f02c85fd-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "descript",
    name: "Descript",
    desc: "Embed Descript share URLs in Linear issues and documents",
    color: "bg-[#1a1a2e]",
    abbr: "DE",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/e77d17db16c2b18efd9bd628289a38a82b7b8af0-640x640.png?q=95&auto=format&dpr=2",
    preinstalled: true,
  },
  {
    key: "loom",
    name: "Loom",
    desc: "Embed Loom videos in Linear issues and documents",
    color: "bg-[#625DF5]",
    abbr: "LO",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/af196cdef354cfbd5961a66034797c0328b1a4da-640x640.png?q=95&auto=format&dpr=2",
    preinstalled: true,
  },
  {
    key: "miro",
    name: "Miro",
    desc: "Import, create and manage issues directly in Miro",
    color: "bg-amber-500",
    abbr: "MI",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/6177e5df4fcdba9246d0d2e7b0939d682aca9792-512x512.png?q=95&auto=format&dpr=2",
  },
  {
    key: "screenpresso",
    name: "Screenpresso",
    desc: "Effectively report an issue with embedded screenshots and videos",
    color: "bg-red-600",
    abbr: "SP",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/b0ca9ca4b3799155de703872c9d0eaab02adfba0-256x256.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "youtube",
    name: "YouTube",
    desc: "Embed YouTube videos in Linear issues and documents",
    color: "bg-[#FF0000]",
    abbr: "YT",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/b1a4b2cae4d0b948219dddbd6402a0fd488d341b-640x640.png?q=95&auto=format&dpr=2",
    preinstalled: true,
  },
]
const INTEG_ANALYTICS: IntCard[] = [
  {
    key: "airbyte",
    name: "Airbyte",
    desc: "Connect Linear to Airbyte and consolidate data in data warehouses, lakes, and databases",
    color: "bg-[#6E4FF6]",
    abbr: "AB",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/0f42f3da7d039c3af3b645f0321d8f2a3c02adae-320x320.png?q=95&auto=format&dpr=2",
  },
  {
    key: "gsheets-an",
    name: "Google Sheets",
    desc: "Build custom dashboards and analytics from issue and project data",
    color: "bg-[#34A853]",
    abbr: "GS",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/0ca0591196315b3e8a8a0c3ab80fa56807bcb40c-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "fivetran-an",
    name: "Fivetran",
    desc: "Sync your Linear data with the Fivetran connector",
    color: "bg-[#0073E6]",
    abbr: "FT",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/cc537fc23546e656b9b0834dadfe222575989c0a-480x480.webp?q=95&auto=format&dpr=2",
  },
  {
    key: "retool",
    name: "Retool",
    desc: "Create, update, and analyze Linear issues in custom internal tools",
    color: "bg-[#3E63DD]",
    abbr: "RT",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/f0d7e81bd66cf21e123bb9448961ab336bd29376-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "span",
    name: "Span",
    desc: "See how work translates into engineering impact",
    color: "bg-[#374151]",
    abbr: "SP",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/5cb438d4348ae738386dc1562f619f859c3df68f-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "jellyfish",
    name: "Jellyfish",
    desc: "Developer productivity insights and AI impact signals in one dashboard",
    color: "bg-violet-700",
    abbr: "JF",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/91ae0adf3bd79b0892528b74417544f9d680849a-450x450.webp?q=95&auto=format&dpr=2",
  },
  {
    key: "coda",
    name: "Coda by Packs4Coda",
    desc: "Analyze your team's performance, project lifecycles, issues and more with the Linear Pack for Coda",
    color: "bg-[#F46A54]",
    abbr: "CD",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/fb84f455f55ca52420c7ddcc0dba652fd7cf0242-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "cyclereport",
    name: "Cycle Report",
    desc: "Create reports of your cycles that your clients can review and sign off on",
    color: "bg-[#7C3AED]",
    abbr: "CR",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/6a4a74789aecf9092299b78413bb482b93e2be18-640x640.png?q=95&auto=format&dpr=2",
  },
]
const INTEG_SECURITY: IntCard[] = [
  {
    key: "aikido",
    name: "Aikido Security",
    desc: "Put your application security on autopilot",
    color: "bg-[#6366F1]",
    abbr: "AK",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/2247569c11ceede6b8ab993deb4dca2374e61207-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "cloudback",
    name: "Cloudback",
    desc: "Automated daily backups of your Linear workspace with on-demand restore",
    color: "bg-[#374151]",
    abbr: "CB",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/a9cf5ef7335894fc81b6ff769b9845ca92498db4-640x640.png?q=95&auto=format&dpr=2",
  },
  {
    key: "drata",
    name: "Drata",
    desc: "Simplify risk and managing frameworks like SOC 2, ISO 27001, PCI and more",
    color: "bg-[#1a1a1a]",
    abbr: "DR",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/17f2e1ab4ce6811e31808e1cb3396ec25d662e2a-756x756.png?q=95&auto=format&dpr=2",
  },
  {
    key: "fencer",
    name: "Fencer",
    desc: "Create and link issues directly from Fencer",
    color: "bg-emerald-600",
    abbr: "FE",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/00117d17fd6a70ecdef1577e9d074d7544e96f9d-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "kawach",
    name: "Kawach AI",
    desc: "Keep your workspace compliant with org policies using Kawach.AI",
    color: "bg-[#374151]",
    abbr: "KW",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/bd7a8e53236c30e3ce7e05615d276721d2e88b1b-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "orca",
    name: "Orca Security",
    desc: "Streamline security fixes by sharing relevant context with the right people",
    color: "bg-[#1D4ED8]",
    abbr: "OR",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/d6aeebd5708915bd9ed51041ad5deddc49b32afe-320x320.svg?q=95&auto=format&dpr=2",
  },
  {
    key: "secureslate",
    name: "SecureSlate",
    desc: "Create and link SecureSlate security tickets to Linear",
    color: "bg-emerald-700",
    abbr: "SS",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/e7d37e91802f84c4004482806ef309a70c44d89c-320x320.png?q=95&auto=format&dpr=2",
  },
  {
    key: "vanta",
    name: "Vanta",
    desc: "Automate compliance. Simplify security. Demonstrate trust.",
    color: "bg-[#1a1a1a]",
    abbr: "VA",
    logoUrl:
      "https://webassets.linear.app/images/ornj730p/production/cc51049ac9db240c517f9220841930eeae20abdd-320x320.svg?q=95&auto=format&dpr=2",
  },
]

function IntegrationCard({
  name,
  desc,
  color,
  abbr,
  logoUrl,
  preinstalled,
  connected,
  slug,
}: IntCard & { slug: string }) {
  return (
    <Link
      href={`/settings/integrations/${slug}`}
      scroll={false}
      aria-label={`${name} integration`}
      onClick={() => {
        // Stash the current scroll position so we can restore it when
        // the user clicks "Back to integrations" from the detail page.
        if (typeof window === "undefined") return
        const scroller = document.querySelector<HTMLElement>(
          "[data-settings-scroll-container]"
        )
        if (scroller) {
          sessionStorage.setItem(
            INTEGRATIONS_SCROLL_STORAGE_KEY,
            String(scroller.scrollTop)
          )
        }
      }}
      className="bg-card hover:border-foreground/20 focus-visible:ring-ring group relative flex items-start gap-3 rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          aria-hidden="true"
          className="size-10 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white ${color}`}
        >
          {abbr}
        </div>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm leading-tight font-semibold">{name}</span>
          {preinstalled && (
            <span className="text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] leading-none">
              Pre-installed
            </span>
          )}
        </div>
        <div className="text-muted-foreground mt-1 text-xs leading-4">
          {desc}
        </div>
      </div>
      {connected && (
        <span
          className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] leading-none font-medium text-emerald-500"
          aria-label="Connected"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Connected
        </span>
      )}
    </Link>
  )
}

function ShowAllCard({
  items,
  onExpand,
}: {
  items: IntCardWithCategory[]
  onExpand: () => void
}) {
  const palette = items.slice(0, 6)
  return (
    <button
      type="button"
      onClick={onExpand}
      aria-label={`Show all ${items.length} integrations`}
      className="bg-card hover:bg-muted hover:border-foreground/20 focus-visible:ring-ring flex cursor-pointer flex-col items-start justify-between gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="grid grid-cols-3 gap-2">
        {palette.map((item) =>
          item.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.key}
              src={item.logoUrl}
              alt=""
              aria-hidden="true"
              className="size-8 rounded-lg object-cover"
            />
          ) : (
            <div
              key={item.key}
              className={`flex size-8 items-center justify-center rounded-lg text-[9px] font-bold text-white ${item.color}`}
            >
              {item.abbr}
            </div>
          )
        )}
      </div>
      <span className="text-muted-foreground group-hover:text-foreground flex items-center gap-1 text-xs font-medium">
        Show all
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
      </span>
    </button>
  )
}

function IntegSection({
  title,
  desc,
  items,
}: {
  title: string
  desc?: string
  items: IntCardWithCategory[]
}) {
  const [expanded, setExpanded] = useState(false)
  // Cluster sections collapse to 8 tiles (7 cards + "Show all") until expanded.
  const COLLAPSED_VISIBLE = 7
  const shouldCluster = !expanded && items.length > COLLAPSED_VISIBLE + 1
  const visible = shouldCluster ? items.slice(0, COLLAPSED_VISIBLE) : items

  return (
    <div>
      <div className="text-muted-foreground mb-3 text-[10px] font-semibold tracking-wider uppercase">
        {title}
      </div>
      {desc && (
        <p className="text-muted-foreground -mt-1 mb-3 text-xs">{desc}</p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {visible.map(({ key, ...rest }) => (
          <IntegrationCard key={key} slug={key} {...rest} />
        ))}
        {shouldCluster && (
          <ShowAllCard
            items={items.slice(COLLAPSED_VISIBLE)}
            onExpand={() => setExpanded(true)}
          />
        )}
      </div>
    </div>
  )
}

// Full taxonomy of sections. Each card inherits its section's `category`
// tag for tab-based filtering.
const INTEG_ALL_SECTIONS: {
  title: string
  desc?: string
  items: IntCard[]
}[] = [
  { title: "Essentials", items: INTEG_ESSENTIALS },
  {
    title: "Agents",
    desc: "AI agents that can be assigned to issues and take autonomous action.",
    items: INTEG_AGENTS,
  },
  {
    title: "AI Clients",
    desc: "Connect Linear to your favorite AI tools via MCP or native integrations.",
    items: INTEG_AI_CLIENTS,
  },
  { title: "Engineering", items: INTEG_ENGINEERING },
  { title: "Linear Crafted", items: INTEG_LINEAR_CRAFTED },
  { title: "Bug Reporting", items: INTEG_BUG_REPORTING },
  { title: "Product Development", items: INTEG_AUTOMATIONS },
  { title: "Customer Experience", items: INTEG_CUSTOMER_EXP },
  { title: "Collaboration", items: INTEG_COLLABORATION },
  { title: "Media & Design", items: INTEG_MEDIA_DESIGN },
  { title: "Analytics & Reporting", items: INTEG_ANALYTICS },
  { title: "Security & Compliance", items: INTEG_SECURITY },
]

function sectionsWithCategory(): {
  title: string
  desc?: string
  items: IntCardWithCategory[]
}[] {
  return INTEG_ALL_SECTIONS.map((s) => ({
    ...s,
    items: s.items.map((i) => ({ ...i, category: s.title })),
  }))
}

const FEATURED_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "linear-asks", label: "Linear Asks for Slack" },
  { key: "slack", label: "Slack" },
  { key: "github", label: "GitHub" },
  { key: "figma", label: "Figma" },
]

// Additional brand quick-filters surfaced via the "More…" popover.
const MORE_TABS: { key: string; label: string }[] = [
  { key: "notion", label: "Notion" },
  { key: "intercom", label: "Intercom" },
  { key: "sentry", label: "Sentry" },
  { key: "zapier", label: "Zapier" },
  { key: "jira", label: "Jira" },
  { key: "zendesk", label: "Zendesk" },
  { key: "vercel", label: "Vercel" },
  { key: "raycast", label: "Raycast" },
]

function matchesTab(card: IntCardWithCategory, tabKey: string): boolean {
  if (tabKey === "all") return true
  const needle = tabKey.toLowerCase()
  return (
    card.name.toLowerCase().includes(needle) ||
    card.key.toLowerCase().includes(needle)
  )
}

function IntegrationsSection() {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [morePopoverOpen, setMorePopoverOpen] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  // Restore scroll position when returning from a detail page. The card's
  // onClick stashes scrollTop into sessionStorage; we read & clear it here
  // on mount so subsequent fresh visits start at the top.
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = sessionStorage.getItem(INTEGRATIONS_SCROLL_STORAGE_KEY)
    if (!saved) return
    sessionStorage.removeItem(INTEGRATIONS_SCROLL_STORAGE_KEY)
    const top = Number(saved)
    if (!Number.isFinite(top)) return
    const scroller = document.querySelector<HTMLElement>(
      "[data-settings-scroll-container]"
    )
    if (!scroller) return
    // Wait for content to lay out before applying the scrollTop.
    requestAnimationFrame(() => {
      scroller.scrollTop = top
    })
  }, [])

  const allSections = useMemo(() => sectionsWithCategory(), [])

  const tabFilteredSections = useMemo(() => {
    if (activeTab === "all") return allSections
    return allSections
      .map((s) => ({
        ...s,
        items: s.items.filter((i) => matchesTab(i, activeTab)),
      }))
      .filter((s) => s.items.length > 0)
  }, [allSections, activeTab])

  const q = query.trim().toLowerCase()
  const searchFilteredSections = useMemo(() => {
    if (!q) return tabFilteredSections
    return tabFilteredSections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0)
  }, [tabFilteredSections, q])

  const totalResults = searchFilteredSections.reduce(
    (n, s) => n + s.items.length,
    0
  )

  const onTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault()
      const count = FEATURED_TABS.length + 1 // + More…
      const next =
        e.key === "ArrowRight"
          ? (index + 1) % count
          : (index - 1 + count) % count
      tabRefs.current[next]?.focus()
    }
  }

  const activeTabLabel =
    FEATURED_TABS.find((t) => t.key === activeTab)?.label ??
    MORE_TABS.find((t) => t.key === activeTab)?.label

  return (
    <div className="flex max-w-3xl flex-col gap-0">
      {/* Sticky search bar — stays pinned while the rest scrolls. */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 flex items-center gap-3 border-b px-6 py-4 shadow-sm backdrop-blur">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations"
            aria-label="Search integrations"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8 px-6 pt-4 pb-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Enhance your Linear experience with a wide variety of add-ons and
            integrations.
          </p>
        </div>

        {/* Featured Slack card — always shown, even during search. */}
        <div className="via-card to-card overflow-hidden rounded-xl border bg-gradient-to-r from-[#4A154B]/30">
          <div className="flex items-start gap-5 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white">
              <SlackLogo className="size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Slack</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                  Featured
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Get notified about issues, create new issues, and manage your
                workflow — all without leaving Slack.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    toast.info("Slack OAuth connect flow coming soon")
                  }
                  className="h-7 bg-[#4A154B] text-xs text-white hover:bg-[#5C1F5E]"
                >
                  Connect Slack
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  asChild
                >
                  <a
                    href="https://linear.app/docs/slack"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Slack integration docs (opens in new tab)"
                  >
                    Learn more
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div
          role="tablist"
          aria-label="Filter integrations by brand"
          className="-mb-4 flex gap-0.5 overflow-x-auto border-b"
        >
          {FEATURED_TABS.map((t, i) => {
            const active = activeTab === t.key
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                type="button"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setActiveTab(t.key)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
                className={`focus-visible:ring-ring shrink-0 border-b-2 px-3 pt-1 pb-2.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  active
                    ? "border-foreground text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                {t.label}
              </button>
            )
          })}
          <Popover open={morePopoverOpen} onOpenChange={setMorePopoverOpen}>
            <PopoverTrigger
              render={
                <button
                  ref={(el) => {
                    tabRefs.current[FEATURED_TABS.length] = el
                  }}
                  role="tab"
                  type="button"
                  aria-selected={!!MORE_TABS.find((t) => t.key === activeTab)}
                  aria-haspopup="menu"
                  aria-expanded={morePopoverOpen}
                  tabIndex={
                    !!MORE_TABS.find((t) => t.key === activeTab) ? 0 : -1
                  }
                  onKeyDown={(e) => onTabKeyDown(e, FEATURED_TABS.length)}
                  className={`focus-visible:ring-ring shrink-0 border-b-2 px-3 pt-1 pb-2.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                    MORE_TABS.find((t) => t.key === activeTab)
                      ? "border-foreground text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground border-transparent"
                  }`}
                >
                  {MORE_TABS.find((t) => t.key === activeTab)?.label ?? "More…"}
                </button>
              }
            />
            <PopoverContent align="start" className="w-48 p-1" role="menu">
              {MORE_TABS.map((t) => (
                <button
                  key={t.key}
                  role="menuitemradio"
                  aria-checked={activeTab === t.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(t.key)
                    setMorePopoverOpen(false)
                  }}
                  className={`hover:bg-accent focus-visible:bg-accent flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs focus:outline-none ${
                    activeTab === t.key
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <span>{t.label}</span>
                  {activeTab === t.key && (
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      className="size-3.5"
                    />
                  )}
                </button>
              ))}
              {activeTab !== "all" && (
                <>
                  <Separator className="my-1" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setActiveTab("all")
                      setMorePopoverOpen(false)
                    }}
                    className="hover:bg-accent text-muted-foreground block w-full rounded-sm px-2 py-1.5 text-left text-xs"
                  >
                    Clear filter
                  </button>
                </>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {q && totalResults === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            No integrations match &ldquo;{query}&rdquo;
          </div>
        ) : activeTab !== "all" && totalResults === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            No {activeTabLabel} integrations.
          </div>
        ) : (
          searchFilteredSections.map((s) => (
            <IntegSection
              key={s.title}
              title={s.title}
              desc={s.desc}
              items={s.items}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SettingsCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">{children}</div>
    </div>
  )
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-muted-foreground text-xs">{description}</div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const TEAM_PALETTE = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-fuchsia-500",
  "bg-cyan-500",
  "bg-orange-500",
]
function teamColor(key: string) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return TEAM_PALETTE[h % TEAM_PALETTE.length]
}
// SettingsTeamRow is no longer used — sidebar renders team buttons inline

// ─── Create Team Page ─────────────────────────────────────────────────────────

function CreateTeamPage({
  teams,
}: {
  teams: { id: string; name: string; key: string }[]
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [identifierTouched, setIdentifierTouched] = useState(false)
  const [copyFrom, setCopyFrom] = useState("none")
  const [timezone, setTimezone] = useState("asia-kolkata")

  const handleNameChange = (v: string) => {
    setName(v)
    if (!identifierTouched) {
      setIdentifier(
        v
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 4)
      )
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8 p-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/settings?section=teams")}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Back
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold">Create a new team</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create a new team to manage separate cycles, workflows and
          notifications
        </p>
      </div>

      {/* Identity card */}
      <div className="overflow-hidden rounded-lg border">
        {/* Team icon row */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">Team icon</span>
          <button
            type="button"
            className="bg-muted/40 hover:bg-muted flex size-9 items-center justify-center rounded-md border transition-colors"
          >
            <HugeiconsIcon
              icon={UserMultiple02Icon}
              className="text-muted-foreground size-4"
            />
          </button>
        </div>
        {/* Team name row */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <label htmlFor="team-name" className="text-sm font-medium">
            Team name
          </label>
          <Input
            id="team-name"
            placeholder="e.g. Engineering"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="h-8 w-64 text-sm"
          />
        </div>
        {/* Identifier row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm font-medium">Identifier</div>
            <div className="text-muted-foreground text-xs">
              Used to identify issues from this team (e.g. ENG-123)
            </div>
          </div>
          <Input
            placeholder="e.g. ENG"
            value={identifier}
            onChange={(e) => {
              setIdentifierTouched(true)
              setIdentifier(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, 6)
              )
            }}
            className="h-8 w-32 font-mono text-sm"
          />
        </div>
      </div>

      {/* Team hierarchy */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Team hierarchy</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Teams can be nested to reflect your team structure and to share
            workflows and settings
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Parent team</span>
            <span className="text-muted-foreground text-sm">
              Available on Business
            </span>
          </div>
        </div>
      </div>

      {/* Copy settings */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">
            Copy settings from existing team
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            You can choose to copy the settings of an existing team for your
            newly created team. All settings including workflow and cycle
            settings are copied, but Slack notification settings and team
            members won&apos;t be copied.
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Copy from team</span>
            <Select
              value={copyFrom}
              onValueChange={onSelectChange(setCopyFrom)}
            >
              <SelectTrigger className="border-muted h-8 w-40 rounded-full text-xs">
                {/* Same pattern as Customer requests / webhook scope —
                 * map the stored team key back to the team's display
                 * name so the trigger never shows a raw identifier. */}
                <SelectValue>
                  {(v) =>
                    v === "none"
                      ? "Don't copy"
                      : (teams.find((t) => t.key === (v as string))?.name ?? v)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Don&apos;t copy</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.key}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Timezone</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            The timezone should be set as the location where most of your team
            members reside. All other times referenced by the team will be
            relative to this timezone setting. For example, if your team uses
            cycles, each cycle will start at midnight in the specified timezone.
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Timezone</span>
            <Select
              value={timezone}
              onValueChange={onSelectChange(setTimezone)}
            >
              <SelectTrigger className="border-muted h-8 w-72 rounded-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="us-eastern">
                  GMT-5:00 – Eastern Standard Time
                </SelectItem>
                <SelectItem value="us-pacific">
                  GMT-8:00 – Pacific Standard Time
                </SelectItem>
                <SelectItem value="europe-london">
                  GMT+0:00 – Greenwich Mean Time
                </SelectItem>
                <SelectItem value="europe-berlin">
                  GMT+1:00 – Central European Time
                </SelectItem>
                <SelectItem value="asia-kolkata">
                  GMT+5:30 – India Standard Time - Kolkata
                </SelectItem>
                <SelectItem value="asia-tokyo">
                  GMT+9:00 – Japan Standard Time
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Make team private */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Make team private</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Private teams and their issues are only visible to members of the
            team and admins. Only admins and team owners can add new users to a
            private team. Public teams and their issues are visible to anyone in
            the workspace.
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Private team</span>
            <span className="text-muted-foreground text-sm">
              Available on Business
            </span>
          </div>
        </div>
      </div>

      {/* Create button */}
      <div className="flex justify-end">
        <Button disabled={!name.trim()}>Create team</Button>
      </div>
    </div>
  )
}

// ─── Team Settings Hub ────────────────────────────────────────────────────────
// The hub renderer lives in components/team-settings-hub.tsx and is shared
// between the sidebar flow (section=team-hub-*) and the /settings/teams/[key]
// route so both stay in sync.

function TeamSettingsHubSection({
  team,
}: {
  team: { id: string; name: string; key: string }
}) {
  return <TeamSettingsHub team={team} />
}
