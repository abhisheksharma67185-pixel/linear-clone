"use client"

import { Suspense, useEffect, useMemo, useState, useCallback, type Dispatch, type SetStateAction } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
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
  Activity03Icon,
  HelpCircleIcon,
  SmileIcon,
  Building03Icon,
  Group01Icon,
  Shield01Icon,
  SourceCodeIcon,
  AppStoreIcon,
  CreditCardAcceptIcon,
  BookUploadIcon,
  Satellite01Icon,
  PlusSignIcon,
  ArrowRight01Icon,
  Search01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"

export default function SettingsPage() {
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
  setter: Dispatch<SetStateAction<string>>,
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
      { key: "initiatives", label: "Initiatives", icon: Satellite01Icon },
      { key: "documents", label: "Documents", icon: FileAddIcon },
      { key: "customer-requests", label: "Customer requests", icon: UserMultiple02Icon },
      { key: "pulse", label: "Pulse", icon: Activity03Icon },
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

function SettingsPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const section = searchParams.get("section") ?? "preferences"

  const [teams, setTeams] = useState<{ id: string; name: string; key: string }[]>([])
  useEffect(() => {
    fetch("/api/data/teams").then((r) => r.json()).then(setTeams).catch(() => {})
  }, [])

  const setSection = (key: SectionKey) => {
    router.push(`/settings?section=${key}`, { scroll: false })
  }

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      {/* Sidebar */}
      <nav className="flex w-56 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-sidebar-border bg-sidebar px-2 py-3">
        <Link
          href="/"
          className="mb-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
          Back to app
        </Link>

        {NAV.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.title && (
              <div className="mb-0.5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
                {group.title}
              </div>
            )}
            {group.items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSection(item.key)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                  section === item.key
                    ? "bg-sidebar-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                {item.icon && (
                  <HugeiconsIcon icon={item.icon} className="size-3.5 shrink-0" />
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}

        {/* Your teams */}
        <div className="mb-1 mt-1">
          <div className="mb-0.5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
            Your teams
          </div>
          <button
            type="button"
            onClick={() => setSection("team-hub-abhishek")}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
              section === "team-hub-abhishek"
                ? "bg-sidebar-accent font-medium text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            }`}
          >
            <span className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-pink-500/60 text-pink-500">
              <HugeiconsIcon icon={UserIcon} className="size-3" />
            </span>
            <span className="flex-1 truncate">Abhishek</span>
          </button>
          <button
            type="button"
            onClick={() => setSection("create-team")}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5 shrink-0" />
            <span>Create a team</span>
          </button>
        </div>

      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <SectionContent section={section} teams={teams} />
      </div>
    </div>
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
  if (section === "profile") return <ProfileSection />
  if (section === "notifications") return <NotificationsSection />
  if (section === "security") return <SecuritySection />
  if (section === "connected") return <ConnectedAccountsSection />
  if (section === "agents") return <AgentPersonalizationSection />
  if (section === "create-team") return <CreateTeamPage teams={teams} />
  if (section.startsWith("team-hub-")) {
    const teamKey = section.replace("team-hub-", "")
    const team = teams.find((t) => t.key === teamKey)
    return <TeamSettingsHubSection team={team ?? { id: teamKey, name: teamKey, key: teamKey }} />
  }

  const allItems = NAV.flatMap((g) => g.items)
  const item = allItems.find((i) => i.key === section)
  const label = item?.label ?? section

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">{label}</h1>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-16 text-center">
        <p className="text-sm text-muted-foreground">
          {label} settings coming soon.
        </p>
      </div>
    </div>
  )
}

// ─── Sections ────────────────────────────────────────────────────────────────

function PreferencesSection() {
  const [homeView, setHomeView] = useState("active")
  const [displayNames, setDisplayNames] = useState("fullname")
  const [firstDay, setFirstDay] = useState("monday")
  const [textEmoticons, setTextEmoticons] = useState(true)
  const [sendOn, setSendOn] = useState("enter")
  const [fontSize, setFontSize] = useState("default")
  const [pointerCursors, setPointerCursors] = useState(false)
  const [theme, setTheme] = useState("dark")
  const [desktopApp, setDesktopApp] = useState(false)
  const [autoAssign, setAutoAssign] = useState(false)
  const [gitFormat, setGitFormat] = useState("title")
  const [gitBranchMove, setGitBranchMove] = useState(false)
  const [codingToolMove, setCodingToolMove] = useState(false)
  const [startedAssign, setStartedAssign] = useState(false)

  const themeColor =
    theme === "dark" ? "bg-violet-500" :
    theme === "light" ? "bg-sky-400" :
    "bg-gradient-to-r from-sky-400 to-violet-500"

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Preferences</h1>
      </div>

      {/* General */}
      <SettingsCard title="General">
        <SettingsRow label="Default home view">
          <Select value={homeView} onValueChange={onSelectChange(setHomeView)}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active issues</SelectItem>
              <SelectItem value="inbox">Inbox</SelectItem>
              <SelectItem value="my-issues">My issues</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow label="Display names">
          <Select value={displayNames} onValueChange={onSelectChange(setDisplayNames)}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fullname">Full name</SelectItem>
              <SelectItem value="username">Username</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow label="First day of week">
          <Select value={firstDay} onValueChange={onSelectChange(setFirstDay)}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="sunday">Sunday</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow label="Convert text emoticons into emojis">
          <Switch checked={textEmoticons} onCheckedChange={setTextEmoticons} />
        </SettingsRow>
        <Separator />
        <SettingsRow label="Send comment on...">
          <Select value={sendOn} onValueChange={onSelectChange(setSendOn)}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="enter">Enter</SelectItem>
              <SelectItem value="cmd-enter">⌘ + Enter</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsCard>

      {/* Interface and theme */}
      <SettingsCard title="Interface and theme">
        <SettingsRow label="App sidebar">
          <Button variant="outline" size="sm" className="h-8 text-xs">Customize</Button>
        </SettingsRow>
        <Separator />
        <SettingsRow label="Font size">
          <Select value={fontSize} onValueChange={onSelectChange(setFontSize)}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow label="Use pointer cursors">
          <Switch checked={pointerCursors} onCheckedChange={setPointerCursors} />
        </SettingsRow>
        <Separator />
        <SettingsRow label="Interface theme">
          <Select value={theme} onValueChange={onSelectChange(setTheme)}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <span className={`mr-1.5 inline-block size-2.5 rounded-full shrink-0 ${themeColor}`} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
      </SettingsCard>

      {/* Desktop application */}
      <SettingsCard title="Desktop application">
        <SettingsRow label="Open in desktop app">
          <Switch checked={desktopApp} onCheckedChange={setDesktopApp} />
        </SettingsRow>
      </SettingsCard>

      {/* Coding tools */}
      <SettingsCard title="Coding tools">
        <button
          type="button"
          className="flex w-full items-center justify-between py-0.5 text-left transition-colors hover:opacity-70"
        >
          <span className="text-sm font-medium">Configure coding tools</span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 text-muted-foreground" />
        </button>
      </SettingsCard>

      {/* Automations and workflows */}
      <SettingsCard title="Automations and workflows">
        <SettingsRow label="Auto-assign to self">
          <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
        </SettingsRow>
        <Separator />
        <SettingsRow label="Git attachment format">
          <Select value={gitFormat} onValueChange={onSelectChange(setGitFormat)}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="id-title">ID + Title</SelectItem>
              <SelectItem value="url">URL</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow label="On git branch copy move to started">
          <Switch checked={gitBranchMove} onCheckedChange={setGitBranchMove} />
        </SettingsRow>
        <Separator />
        <SettingsRow label="On open in coding tool move to started">
          <Switch checked={codingToolMove} onCheckedChange={setCodingToolMove} />
        </SettingsRow>
        <Separator />
        <SettingsRow label="On move to started assign to yourself">
          <Switch checked={startedAssign} onCheckedChange={setStartedAssign} />
        </SettingsRow>
      </SettingsCard>
    </div>
  )
}

function ProfileSection() {
  const [name, setName] = useState("Theta Computer")
  const [username, setUsername] = useState("theta.computer01")
  const email = "theta.computer01@gmail.com"

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
      </div>

      <div className="divide-y divide-border rounded-lg border">
        {/* Profile picture */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium">Profile picture</span>
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white select-none">
            {initials}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium">Email</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{email}</span>
            <button
              type="button"
              className="flex size-6 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground hover:bg-muted"
            >
              <svg viewBox="0 0 16 16" className="size-3 fill-current" aria-hidden="true">
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
            <div className="text-xs text-muted-foreground">One word, like a nickname or first name</div>
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
            <span className="text-sm text-muted-foreground">Remove yourself from workspace</span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              Leave workspace
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [newsletter, setNewsletter] = useState(false)
  const [marketing, setMarketing] = useState(true)
  const [inviteAccepted, setInviteAccepted] = useState(true)
  const [privacyUpdates, setPrivacyUpdates] = useState(true)
  const [dpa, setDpa] = useState(false)

  const CHANNELS = [
    { key: "desktop", label: "Desktop", status: "Disabled", enabled: false },
    { key: "mobile",  label: "Mobile",  status: "Enabled for all notifications", enabled: true },
    { key: "email",   label: "Email",   status: "Enabled for all notifications", enabled: true },
    { key: "slack",   label: "Slack",   status: "Disabled", enabled: false },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Notifications</h1>
      </div>

      {/* Notification channels */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Notification channels</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Choose how to be notified for workspace activity. Notifications will always go to your Linear inbox.
        </p>
        <div className="divide-y divide-border rounded-lg border">
          {CHANNELS.map((ch) => (
            <button
              key={ch.key}
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <ChannelIcon type={ch.key} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{ch.label}</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={`size-1.5 shrink-0 rounded-full ${ch.enabled ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  <span className="text-xs text-muted-foreground">{ch.status}</span>
                </div>
              </div>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 shrink-0 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </div>

      {/* Updates from Linear */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Updates from Linear</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Subscribe to product announcements and important changes from the Linear team
        </p>

        <div className="mb-2 text-sm font-medium">Changelog</div>
        <div className="mb-4 divide-y divide-border rounded-lg border">
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
        <div className="mb-4 divide-y divide-border rounded-lg border">
          <NotifToggleRow
            label="Marketing and onboarding"
            description="Occasional emails to help you get the most out of Linear"
            checked={marketing}
            onCheckedChange={setMarketing}
          />
        </div>

        <div className="mb-2 text-sm font-medium">Other updates</div>
        <div className="divide-y divide-border rounded-lg border">
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
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function ChannelIcon({ type }: { type: string }) {
  if (type === "desktop") return (
    <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true">
      <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h13A1.5 1.5 0 0 1 18 4.5v8A1.5 1.5 0 0 1 16.5 14H12v1.5h1a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1 0-1.5h1V14H3.5A1.5 1.5 0 0 1 2 12.5v-8Zm1.5 0v8h13v-8h-13Z" />
    </svg>
  )
  if (type === "mobile") return (
    <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true">
      <path d="M7 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm0 1.5h6a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5ZM10 15a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
    </svg>
  )
  if (type === "email") return (
    <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true">
      <path d="M3 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3Zm0 1.5h14a.5.5 0 0 1 .5.5v.51l-7.5 4.875L2.5 6.51V6a.5.5 0 0 1 .5-.5ZM2.5 8.25l7.13 4.635a.75.75 0 0 0 .74 0L17.5 8.25V14a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V8.25Z" />
    </svg>
  )
  if (type === "slack") return (
    <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true">
      <path d="M7.077 11.227a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h1.34v1.34Zm.67 0a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34v-3.35Zm1.34-4.704a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v1.34H9.087Zm0 .67a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H5.737a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35Zm4.703 1.34a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H12.45V8.533Zm-.67 0a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V5.183a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35Zm-1.34 4.704a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V12.9h1.34Zm0-.67a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H11.78Z" />
    </svg>
  )
  return null
}

function SecuritySection() {
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; created: string }[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [showNewKey, setShowNewKey] = useState(false)

  const createKey = () => {
    if (!newKeyName.trim()) return
    setApiKeys((p) => [...p, { id: crypto.randomUUID(), name: newKeyName.trim(), created: new Date().toLocaleDateString() }])
    setNewKeyName("")
    setShowNewKey(false)
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Security &amp; access</h1>
      </div>

      {/* Sessions */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Sessions</h2>
        <p className="mb-3 text-xs text-muted-foreground">Devices logged into your account</p>
        <div className="rounded-lg border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2Zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Chrome on macOS</div>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-500">Current session</span>
                <span className="text-xs text-muted-foreground">&nbsp;· Bilaspur, IN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Passkeys */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Passkeys</h2>
        <p className="mb-3 text-xs text-muted-foreground">Passkeys are a secure way to sign in to your Linear account</p>
        <div className="rounded-lg border px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">No passkeys registered</span>
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">New passkey</Button>
          </div>
        </div>
      </div>

      {/* Personal API keys */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Personal API keys</h2>
        <p className="mb-3 text-xs text-muted-foreground">Use Linear's GraphQL API to build your own integrations</p>
        <div className="rounded-lg border">
          {apiKeys.length === 0 && !showNewKey ? (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">No API keys created</span>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" onClick={() => setShowNewKey(true)}>
                New API key
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {apiKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{k.name}</div>
                    <div className="text-xs text-muted-foreground">Created {k.created}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => setApiKeys((p) => p.filter((x) => x.id !== k.id))}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
              {showNewKey ? (
                <div className="flex items-center gap-2 px-4 py-3">
                  <input
                    autoFocus
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") createKey(); if (e.key === "Escape") setShowNewKey(false) }}
                    placeholder="Key name"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  <Button size="sm" className="h-7 text-xs" onClick={createKey} disabled={!newKeyName.trim()}>Create</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowNewKey(false)}>Cancel</Button>
                </div>
              ) : (
                <div className="flex justify-end px-4 py-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-medium" onClick={() => setShowNewKey(true)}>New API key</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Authorized applications */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Authorized applications</h2>
        <p className="mb-3 text-xs text-muted-foreground">OAuth applications you've approved</p>
        <div className="rounded-lg border px-4 py-3">
          <p className="text-sm text-muted-foreground">No applications have been authorized to connect with your account.</p>
        </div>
      </div>
    </div>
  )
}

function ConnectedAccountsSection() {
  const INTEGRATIONS = [
    {
      key: "slack",
      name: "Slack",
      description: "Sync attribution of your messages, and optionally receive notifications in Slack",
      label: "Connect",
      external: true,
      icon: (
        <svg viewBox="0 0 20 20" className="size-4 fill-current" aria-hidden="true">
          <path d="M7.077 11.227a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h1.34v1.34Zm.67 0a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34v-3.35Zm1.34-4.704a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v1.34H9.087Zm0 .67a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H5.737a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35Zm4.703 1.34a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H12.45V8.533Zm-.67 0a1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V5.183a1.34 1.34 0 0 1 1.34-1.34 1.34 1.34 0 0 1 1.34 1.34v3.35Zm-1.34 4.704a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34 1.34 1.34 0 0 1-1.34-1.34V12.9h1.34Zm0-.67a1.34 1.34 0 0 1-1.34-1.34 1.34 1.34 0 0 1 1.34-1.34h3.35a1.34 1.34 0 0 1 1.34 1.34 1.34 1.34 0 0 1-1.34 1.34H11.78Z" />
        </svg>
      ),
      iconBg: "bg-[#4A154B]",
      iconColor: "text-white",
    },
    {
      key: "github",
      name: "GitHub",
      description: "First, your workspace needs to be connected to GitHub",
      label: "Connect workspace",
      external: false,
      icon: (
        <svg viewBox="0 0 20 20" className="size-4 fill-current" aria-hidden="true">
          <path fillRule="evenodd" d="M10 2C5.58 2 2 5.58 2 10c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 18 10c0-4.42-3.58-8-8-8Z" clipRule="evenodd" />
        </svg>
      ),
      iconBg: "bg-[#24292F]",
      iconColor: "text-white",
    },
    {
      key: "gcal",
      name: "Google Calendar",
      description: "Sync your calendar out-of-office status to Linear",
      label: "Connect",
      external: true,
      icon: (
        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
          <rect x="3" y="3" width="14" height="14" rx="1.5" fill="#fff" />
          <rect x="3" y="3" width="14" height="4" rx="1" fill="#4285F4" />
          <rect x="3" y="7" width="7" height="7" fill="#34A853" />
          <rect x="10" y="7" width="7" height="7" fill="#FBBC05" />
          <rect x="3" y="14" width="14" height="3" rx="1" fill="#EA4335" />
        </svg>
      ),
      iconBg: "bg-white",
      iconColor: "",
    },
    {
      key: "notion",
      name: "Notion",
      description: "Preview issues, projects, and views within Notion",
      label: "Connect",
      external: true,
      icon: (
        <svg viewBox="0 0 20 20" className="size-4 fill-current text-foreground" aria-hidden="true">
          <path d="M4.5 3h8.25l3.25 3.25V17a.5.5 0 0 1-.5.5H4.5A.5.5 0 0 1 4 17V3.5A.5.5 0 0 1 4.5 3Zm7.75 0v3h3l-3-3Zm-5 4.5h5v1h-5v-1Zm0 2.5h5v1h-5V10Zm0 2.5h3v1h-3v-1Z" />
        </svg>
      ),
      iconBg: "bg-[#F6F5F4] dark:bg-neutral-700",
      iconColor: "",
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Connected accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your user accounts to sync attribution of your actions between apps
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {INTEGRATIONS.map((intg) => (
          <div key={intg.key} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${intg.iconBg} ${intg.iconColor}`}>
              {intg.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{intg.name}</div>
              <div className="text-xs text-muted-foreground">{intg.description}</div>
            </div>
            <button
              type="button"
              className="shrink-0 text-sm font-medium text-foreground hover:opacity-70 transition-opacity flex items-center gap-0.5"
            >
              {intg.label}
              {intg.external ? (
                <svg viewBox="0 0 12 12" className="ml-0.5 size-3 fill-current" aria-hidden="true">
                  <path d="M3.5 1.5h-2v9h9v-2M7 1.5h3.5v3.5M10.5 1.5 5 7" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 12 12" className="ml-0.5 size-3 fill-current" aria-hidden="true">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgentPersonalizationSection() {
  const [guidance, setGuidance] = useState("")

  return (
    <div className="flex flex-col gap-8 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Agent personalization</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your personal settings for Linear Agent</p>
      </div>

      {/* Guidance */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Guidance</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Provide personal instructions and context for the Linear Agent when responding to conversations
        </p>
        <textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder="Enter personal guidance for the Linear Agent (optional)..."
          rows={7}
          className="w-full resize-none rounded-lg border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Skills */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Skills</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Reusable prompts auto-selected by the agent or invoked via slash commands
        </p>
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-card px-4 py-10">
          <p className="text-sm text-muted-foreground">You haven't added any skills yet</p>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <svg viewBox="0 0 14 14" className="size-3.5 fill-current text-muted-foreground" aria-hidden="true">
              <path d="M7 1.5a.75.75 0 0 1 .75.75v4h4a.75.75 0 0 1 0 1.5h-4v4a.75.75 0 0 1-1.5 0v-4h-4a.75.75 0 0 1 0-1.5h4v-4A.75.75 0 0 1 7 1.5Z" />
            </svg>
            Create skill
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkspaceSection() {
  const [name, setName] = useState("Abhishek")
  const [url, setUrl] = useState("abhishek2007")
  const [fiscalYear, setFiscalYear] = useState("january")

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Workspace</h1>

      {/* Logo / Name / URL card */}
      <div className="divide-y divide-border overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm font-medium">Logo</div>
            <div className="text-xs text-muted-foreground">Recommended size is 256x256px</div>
          </div>
          <div className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-violet-600 text-sm font-semibold text-white hover:opacity-80">
            AB
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-medium">Name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-52 text-sm" />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-medium">URL</div>
          <div className="flex items-center overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-ring">
            <span className="border-r bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">linear.app/</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-36 bg-transparent px-2.5 py-1.5 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Time & region */}
      <div>
        <h2 className="mb-2 text-sm font-semibold">Time &amp; region</h2>
        <div className="divide-y divide-border overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">First month of the fiscal year</div>
              <div className="text-xs text-muted-foreground">Used when grouping projects and issues quarterly, half-yearly, and yearly</div>
            </div>
            <Select value={fiscalYear} onValueChange={onSelectChange(setFiscalYear)}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
                  <SelectItem key={m.toLowerCase()} value={m.toLowerCase()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Region</div>
              <div className="text-xs text-muted-foreground">
                Set when a workspace is created and cannot be changed.{" "}
                <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">Read more ↗</a>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">United States</span>
          </div>
        </div>
      </div>

      {/* Welcome message */}
      <div>
        <h2 className="mb-2 text-sm font-semibold">Welcome message</h2>
        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
          <span className="text-sm text-muted-foreground">Configure welcome message</span>
          <span className="text-xs text-muted-foreground">Available on Enterprise</span>
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <h2 className="mb-2 text-sm font-semibold">Danger zone</h2>
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <div className="text-sm font-medium">Delete workspace</div>
            <div className="text-xs text-muted-foreground">Schedule workspace to be permanently deleted</div>
          </div>
          <button type="button" className="text-sm font-medium text-rose-500 hover:text-rose-400">
            Delete workspace
          </button>
        </div>
      </div>
    </div>
  )
}

function MembersSection() {
  const [members, setMembers] = useState<Member[]>([])
  const [filter, setFilter] = useState("")

  useEffect(() => {
    fetch("/api/data/members").then((r) => r.json()).then(setMembers).catch(() => {})
  }, [])

  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(filter.toLowerCase()) || m.email?.toLowerCase().includes(filter.toLowerCase())
  )

  const COL = "grid-cols-[2fr_2fr_140px_80px_90px_110px_32px]"

  return (
    <div className="flex flex-col gap-4 p-6 max-w-5xl">
      <h1 className="text-xl font-semibold">Members</h1>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name or email"
            className="h-8 w-full rounded-md border bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="button" className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs text-muted-foreground hover:bg-accent/40">
          All <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">Export CSV</Button>
          <Button size="sm" className="h-8 bg-violet-600 hover:bg-violet-700 text-white text-xs px-4">Invite</Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        {/* Header */}
        <div className={`grid ${COL} border-b px-4 py-2 text-xs font-medium text-muted-foreground`}>
          <div className="flex items-center gap-1">Name <span className="opacity-60">↓</span></div>
          <div>Email</div>
          <div>Status</div>
          <div>Teams</div>
          <div>Joined</div>
          <div>Last seen</div>
          <div />
        </div>

        {/* Active group */}
        <div className="border-b bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground">
          Active <span className="ml-1">{filtered.length}</span>
        </div>

        {filtered.map((member) => (
          <div
            key={member.id}
            className={`group grid ${COL} items-center border-b last:border-b-0 px-4 py-2.5 transition-colors hover:bg-accent/30 cursor-pointer`}
          >
            <div className="flex items-center gap-2.5">
              <Avatar className="size-7 shrink-0">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-[10px] bg-violet-500 text-white">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{member.name}</div>
                <div className="truncate text-xs text-muted-foreground">{member.email?.split("@")[0]}</div>
              </div>
            </div>
            <div className="truncate text-sm text-muted-foreground">{member.email}</div>
            <div>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-foreground">
                Admin
              </span>
            </div>
            <div className="text-sm text-muted-foreground">1 team</div>
            <div className="text-sm text-muted-foreground">Apr 21</div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Online
            </div>
            <div />
          </div>
        ))}

        {/* Invited group */}
        <div className="border-b bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground">
          Invited <span className="ml-1">1</span>
        </div>
        <div className={`group grid ${COL} items-center border-b px-4 py-2.5 transition-colors hover:bg-accent/30 cursor-pointer`}>
          <div className="flex items-center gap-2.5">
            {/* Greyed-out initials avatar for invited user */}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted text-[10px] font-semibold text-muted-foreground">
              HV
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-muted-foreground">hvkvkvk@234234gmail.com</div>
            </div>
          </div>
          <div className="truncate text-sm text-muted-foreground">hvkvkvk@234234gmail.com</div>
          <div>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-foreground">
              Admin (Invited)
            </span>
          </div>
          <div className="text-sm text-muted-foreground">1 team</div>
          <div className="text-sm text-muted-foreground">Apr 23</div>
          <div className="text-sm text-muted-foreground" />
          <div />
        </div>

        {/* Application group */}
        <div className="border-b bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground">
          Application <span className="ml-1">1</span>
        </div>
        <div className={`group grid ${COL} items-center px-4 py-2.5 transition-colors hover:bg-accent/30 cursor-pointer`}>
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted/40">
              {/* Linear-style spinning circle icon */}
              <svg viewBox="0 0 16 16" className="size-4 text-muted-foreground" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium">Linear</div>
              <div className="text-xs text-muted-foreground">linear</div>
            </div>
          </div>
          <div />
          <div className="text-sm text-muted-foreground">Application</div>
          <div />
          <div className="text-sm text-muted-foreground">Apr 21</div>
          <div className="text-sm text-muted-foreground">Apr 21</div>
          {/* ··· action menu */}
          <button
            type="button"
            className="flex size-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 12 12" className="size-3.5" fill="currentColor">
              <circle cx="2" cy="6" r="1" /><circle cx="6" cy="6" r="1" /><circle cx="10" cy="6" r="1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function TeamsAdminSection() {
  const [teams, setTeams] = useState<{ id: string; name: string; key: string }[]>([])
  const [filter, setFilter] = useState("")

  useEffect(() => {
    fetch("/api/data/teams").then((r) => r.json()).then(setTeams).catch(() => {})
  }, [])

  const filtered = teams.filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="flex flex-col gap-4 p-6 max-w-5xl">
      <h1 className="text-xl font-semibold">Teams</h1>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name..."
            className="h-8 w-full rounded-md border bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="button" className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs text-muted-foreground hover:bg-accent/40">
          Active <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
        </button>
        <div className="ml-auto">
          <Button size="sm" className="h-8 gap-1.5 bg-violet-600 text-xs text-white hover:bg-violet-700">
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
            Create team
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[1fr_120px_80px_80px_100px] border-b px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1">Name <span>↓</span></div>
          <div>Visibility</div>
          <div>Members</div>
          <div>Issues</div>
          <div>Created</div>
        </div>
        <div className="border-b bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground">
          Active {filtered.length}
        </div>
        {filtered.map((team) => (
          <div key={team.id} className="grid grid-cols-[1fr_120px_80px_80px_100px] cursor-pointer items-center border-b px-4 py-2.5 last:border-b-0 hover:bg-accent/30">
            <div className="flex items-center gap-2.5">
              <div className={`flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white ${teamColor(team.key)}`}>
                {team.key.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{team.name}</span>
              <span className="text-xs text-muted-foreground">{team.key.toUpperCase()}</span>
            </div>
            <div className="text-sm text-muted-foreground">Workspace</div>
            <div className="text-sm">1</div>
            <div className="text-sm">4</div>
            <div className="text-sm text-muted-foreground">Apr 21</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminSecuritySection() {
  const [inviteLinks, setInviteLinks] = useState(false)
  const [googleAuth, setGoogleAuth] = useState(true)
  const [emailAuth, setEmailAuth] = useState(true)
  const [apiKeyPerm, setApiKeyPerm] = useState("all-members")
  const [agentGuidancePerm, setAgentGuidancePerm] = useState("only-admins")
  const [improveAi, setImproveAi] = useState(false)
  const [agentWebSearch, setAgentWebSearch] = useState(false)

  return (
    <div className="flex flex-col gap-8 p-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Security</h1>

      {/* Workspace access */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold">Workspace access</h2>

        <div>
          <div className="mb-1 text-sm font-medium">Invite links</div>
          <div className="mb-2 text-xs text-muted-foreground">A uniquely generated invite link allows anyone with the link to join your workspace</div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span className="text-sm">Enable invite links</span>
            <Switch checked={inviteLinks} onCheckedChange={setInviteLinks} />
          </div>
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">Workspace login and restrictions</div>
          <div className="mb-2 text-xs text-muted-foreground">
            Anyone with an email address at these domains is allowed to sign up for this workspace.{" "}
            <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">Docs ↗</a>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span className="text-sm text-muted-foreground">No approved email domains</span>
            <button type="button" className="flex items-center gap-1 text-sm font-medium hover:opacity-70">
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> Add domain
            </button>
          </div>
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">Authentication methods</div>
          <div className="mb-2 text-xs text-muted-foreground">
            Admins and guests can always authenticate via Google and email/passkeys—even when disabled for members.
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">Google authentication</div>
                <div className="text-xs text-muted-foreground">When enabled, this is available to all workspace members and guests</div>
              </div>
              <Switch checked={googleAuth} onCheckedChange={setGoogleAuth} />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">Email &amp; passkey authentication</div>
                <div className="text-xs text-muted-foreground">When enabled, this is available to all workspace members and guests</div>
              </div>
              <Switch checked={emailAuth} onCheckedChange={setEmailAuth} />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">SAML &amp; SCIM</div>
                <div className="text-xs text-muted-foreground">Manage logins via an identity provider's SSO</div>
              </div>
              <span className="text-xs text-muted-foreground">Available on Enterprise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace management */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Workspace management</h2>
        <div className="divide-y divide-border overflow-hidden rounded-lg border">
          {[
            { label: "New user invitations", desc: "Who can invite new members to the workspace", badge: "Available on Basic" },
            { label: "Team creation", desc: "Who can create new teams", badge: "Available on Business" },
            { label: "Manage workspace labels", desc: "Who can create, update, and delete workspace labels", badge: "Available on Business" },
            { label: "Manage workspace templates", desc: "Who can manage workspace templates and recurring issues", badge: "Available on Business" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">{row.label}</div>
                <div className="text-xs text-muted-foreground">{row.desc}</div>
              </div>
              <span className="text-xs text-muted-foreground">{row.badge}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">API key creation</div>
              <div className="text-xs text-muted-foreground">Who can create API keys to interact with the Linear API on their behalf</div>
            </div>
            <Select value={apiKeyPerm} onValueChange={onSelectChange(setApiKeyPerm)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-members">All members</SelectItem>
                <SelectItem value="only-admins">Only admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Modify agent guidance</div>
              <div className="text-xs text-muted-foreground">Who can modify workspace-level agent guidance prompts</div>
            </div>
            <Select value={agentGuidancePerm} onValueChange={onSelectChange(setAgentGuidancePerm)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="only-admins">Only admins</SelectItem>
                <SelectItem value="all-members">All members</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <div>
            <div className="text-sm text-muted-foreground">Restrict file uploads</div>
            <div className="text-xs text-muted-foreground">Only allow specific file types to be uploaded</div>
          </div>
          <span className="text-xs text-muted-foreground">Available on Enterprise</span>
        </div>
      </div>

      {/* Integrations & applications */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Integrations &amp; applications</h2>
        <div className="divide-y divide-border overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm text-muted-foreground">Review third-party applications</div>
              <div className="text-xs text-muted-foreground">
                Control which applications can be installed to your workspace.{" "}
                <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">Docs ↗</a>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Available on Enterprise</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm text-muted-foreground">Reduce personal information from support integrations</div>
              <div className="text-xs text-muted-foreground">Personal information from support integrations won't be stored</div>
            </div>
            <span className="text-xs text-muted-foreground">Available on Enterprise</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm text-muted-foreground">Prevent guests from interacting with agents in the workspace</div>
              <div className="text-xs text-muted-foreground">Restrict agent invocation to full workspace members only</div>
            </div>
            <span className="text-xs text-muted-foreground">Available on Basic</span>
          </div>
        </div>
      </div>

      {/* AI & Agents */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">AI &amp; Agents</h2>
        <div className="divide-y divide-border overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Improve AI features by sharing usage data</div>
              <div className="text-xs text-muted-foreground">Feedback on AI results is used to enhance functionality and will not be used to train models</div>
            </div>
            <Switch checked={improveAi} onCheckedChange={setImproveAi} />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Enable Linear Agent web search</div>
              <div className="text-xs text-muted-foreground">Allow Linear Agent to search the public web for current information and cite sources</div>
            </div>
            <Switch checked={agentWebSearch} onCheckedChange={setAgentWebSearch} />
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Compliance</h2>
        <div className="divide-y divide-border overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm text-muted-foreground">HIPAA compliance</div>
              <div className="text-xs text-muted-foreground">Enable privacy and security measures to ensure that Protected Health Information (PHI) is appropriately safeguarded</div>
            </div>
            <span className="text-xs text-muted-foreground">Available on Enterprise</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApiSection() {
  const [apiKeyPerm, setApiKeyPerm] = useState("all-members")

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">API</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Linear's GraphQL API provides a programmable interface to your data. Use our API to build public
          or private apps, workflows, and integrations for Linear.{" "}
          <a href="#" className="font-semibold text-foreground underline-offset-2 hover:underline">Join our Slack</a>{" "}
          for help and questions.
        </p>
        <a href="#" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-foreground underline-offset-2 hover:underline">
          Docs ↗
        </a>
      </div>

      {/* OAuth Applications */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">OAuth Applications</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Manage your organization's OAuth applications.{" "}
          <a href="#" className="font-semibold text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">No OAuth applications</span>
          <button type="button" className="flex items-center gap-1 text-sm font-medium hover:opacity-70">
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New OAuth application
          </button>
        </div>
      </div>

      {/* Webhooks */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Webhooks</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Webhooks allow you to receive HTTP requests when an entity is created, updated, or deleted.{" "}
          <a href="#" className="font-semibold text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">No webhooks</span>
          <button type="button" className="flex items-center gap-1 text-sm font-medium hover:opacity-70">
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New webhook
          </button>
        </div>
      </div>

      {/* Member API keys */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Member API keys</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Members of your workspace can create API keys to interact with the Linear API on their behalf.
          View your personal API keys from your{" "}
          <a href="#" className="font-semibold text-foreground underline-offset-2 hover:underline">security &amp; access settings</a>.
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">API key creation</div>
              <div className="text-xs text-muted-foreground">Who can create API keys to interact with the Linear API on their behalf</div>
            </div>
            <Select value={apiKeyPerm} onValueChange={onSelectChange(setApiKeyPerm)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-members">All members</SelectItem>
                <SelectItem value="only-admins">Only admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="px-4 py-3">
            <span className="text-sm text-muted-foreground">No API keys have been created yet</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApplicationsSection() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage which third-party applications have access to your workspace.{" "}
          <a href="#" className="font-semibold text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
      </div>
      <div className="rounded-lg border bg-card px-4 py-4">
        <p className="text-sm text-muted-foreground">
          Your workspace has not yet authorized any external applications to connect with your Linear account
        </p>
      </div>
    </div>
  )
}

function BillingSection() {
  const features = [
    ["5 teams", "Unlimited file upload size", "Unlimited issues"],
    ["Admin roles", "File upload deletion", "Restrict new user invitations"],
    ["Restrict agent invocation to …"],
  ]

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">
          For questions about billing,{" "}
          <a href="#" className="font-semibold text-foreground underline-offset-2 hover:underline">contact us</a>
        </p>
        <a href="#" className="text-sm font-medium text-foreground underline-offset-2 hover:underline">All plans →</a>
      </div>

      {/* Current plan */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Free plan</span>
            <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Current</span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">Free for all users</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Users</div>
          <div className="text-sm font-semibold">1</div>
        </div>
      </div>

      {/* Upgrade card */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Upgrade to Basic plan</div>
            <div className="text-xs text-muted-foreground">$12 per user/mo</div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="text-sm font-medium text-muted-foreground hover:text-foreground">View all plans</button>
            <Button size="sm" className="h-8 bg-violet-600 text-xs hover:bg-violet-700 text-white">Upgrade now</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {features.flat().map((f) => (
            <div key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <svg viewBox="0 0 12 12" className="mt-0.5 size-3 shrink-0 text-violet-500 fill-none stroke-current stroke-2">
                <polyline points="1.5,6 4.5,9 10.5,3" />
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Recent invoices */}
      <div>
        <h2 className="mb-2 text-sm font-semibold">Recent invoices</h2>
        <div className="rounded-lg border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">No invoices yet</span>
        </div>
      </div>
    </div>
  )
}

function ExportCard() {
  const [privateTeams, setPrivateTeams] = useState("none")
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium">Issue data</span>
        <button type="button" className="text-sm font-medium hover:opacity-70">Export…</button>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium">Include private teams</span>
        <Select value={privateTeams} onValueChange={onSelectChange(setPrivateTeams)}>
          <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function ImportExportSection() {
  const importSources = [
    { key: "asana", name: "Asana", color: "bg-rose-500", abbr: "AS" },
    { key: "shortcut", name: "Shortcut", color: "bg-amber-500", abbr: "SC" },
    { key: "github", name: "GitHub", color: "bg-[#24292e]", abbr: "GH" },
    { key: "jira", name: "Jira", color: "bg-[#0052CC]", abbr: "JR" },
    { key: "linear", name: "Linear", color: "bg-violet-600", abbr: "LN" },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Import &amp; export</h1>

      {/* Import assistant */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Import assistant</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          If you use another service to track issues, this tool will create a copy of them in Linear.{" "}
          <a href="#" className="font-semibold text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-lg border">
          {importSources.map(({ key, name, color, abbr }) => (
            <button
              key={key}
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/40 transition-colors"
            >
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white ${color}`}>
                {abbr}
              </div>
              <span className="flex-1 text-sm font-medium">{name}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* CLI import */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">CLI import</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Import issues using our open-source command line tool. Supports Asana (CSV), Jira (CSV),
          GitHub (API), Pivotal Tracker (CSV), Shortcut (CSV), and Trello (JSON).
        </p>
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <span className="text-sm font-medium">CLI Importer</span>
          <a href="#" className="flex items-center gap-1 text-sm font-medium hover:opacity-70">
            Open ↗
          </a>
        </div>
      </div>

      {/* Export */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Export</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          You can export your issue data in CSV format. Once the export is available, we'll email you the download link.
        </p>
        <ExportCard />
      </div>
    </div>
  )
}

function IssueLabelsSection() {
  const [labels, setLabels] = useState<LabelType[]>([])
  const [filter, setFilter] = useState("")

  useEffect(() => {
    fetch("/api/data/labels").then((r) => r.json()).then(setLabels).catch(() => {})
  }, [])

  const filtered = labels.filter((l) =>
    l.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="flex flex-col p-6 max-w-4xl">
      <h1 className="mb-4 text-xl font-semibold">Issue labels</h1>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name..."
            className="h-8 w-full rounded-md border bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="button" className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm text-muted-foreground hover:bg-accent/40">
          Workspace <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-sm">New group</Button>
          <Button size="sm" className="h-8 bg-violet-600 text-sm hover:bg-violet-700 text-white">New label</Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr_64px_120px_96px] border-b pb-2 px-2 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1">Name <span className="text-[10px]">↓</span></div>
        <div>Description</div>
        <div>Issues</div>
        <div>Last applied</div>
        <div>Created</div>
      </div>

      {filtered.map((label) => (
        <div
          key={label.id}
          className="grid grid-cols-[1fr_2fr_64px_120px_96px] items-center border-b px-2 py-2.5 text-sm last:border-b-0 hover:bg-accent/20"
        >
          <div className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: label.color }} />
            <span className="font-medium">{label.name}</span>
          </div>
          <div />
          <div />
          <div />
          <div className="text-xs text-muted-foreground">Apr 21</div>
        </div>
      ))}
    </div>
  )
}

function IssueTemplatesSection() {
  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Issue templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          These templates are available when creating issues for any team in the workspace. To create
          templates that only apply to specific teams, add them as team templates.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">
            Docs ↗
          </a>
        </p>
      </div>
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">No issue templates</span>
        <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
          <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New template
        </Button>
      </div>
    </div>
  )
}

function SLAsSection() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">SLAs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Service-level agreements (SLAs) automatically apply deadlines to issues when they match
          predefined parameters. While often used to define response times to customer issues, they can
          also be used to define internal standards for bug and time-sensitive issue resolution.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">
            Docs ↗
          </a>
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <div>
          <div className="text-sm font-medium">SLAs</div>
          <div className="text-xs text-muted-foreground">
            Service-level agreements are available on Business and Enterprise plans
          </div>
        </div>
        <Button size="sm" variant="outline" className="h-8 shrink-0 text-sm">
          Start free trial
        </Button>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Automation rules</div>
            <div className="text-xs text-muted-foreground">
              Use automation rules to automatically add or remove SLAs based on filters.
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 shrink-0 text-sm text-muted-foreground">
            Add rule
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProjectLabelsSection() {
  const [filter, setFilter] = useState("")

  return (
    <div className="flex flex-col p-6 max-w-4xl">
      <h1 className="mb-4 text-xl font-semibold">Project labels</h1>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name..."
            className="h-8 w-full rounded-md border bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="button" className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm text-muted-foreground hover:bg-accent/40">
          Workspace <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-sm">New group</Button>
          <Button size="sm" className="h-8 bg-violet-600 text-sm hover:bg-violet-700 text-white">New label</Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <svg viewBox="0 0 80 60" className="mb-4 w-20 text-muted-foreground/30" fill="none" aria-hidden="true">
          <ellipse cx="40" cy="30" rx="30" ry="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
          <ellipse cx="34" cy="30" rx="7" ry="5" stroke="currentColor" strokeWidth="1.2" />
          <ellipse cx="44" cy="27" rx="7" ry="5" stroke="currentColor" strokeWidth="1.2" />
          <ellipse cx="44" cy="33" rx="7" ry="5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <p className="text-sm text-muted-foreground">No labels found</p>
      </div>
    </div>
  )
}

function ProjectTemplatesSection() {
  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Project templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          These templates are available when creating projects for any team in the workspace. To create
          templates that only apply to specific teams, add them as team templates.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">
            Docs ↗
          </a>
        </p>
      </div>
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">No project templates</span>
        <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
          <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New template
        </Button>
      </div>
    </div>
  )
}

function ProjectStatusesSection() {
  const GROUPS = [
    { name: "Backlog",     type: "backlog" },
    { name: "Planned",     type: "planned" },
    { name: "In Progress", type: "in-progress" },
    { name: "Completed",   type: "completed" },
    { name: "Canceled",    type: "canceled" },
  ]
  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Project statuses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Project statuses define the workflow that projects go through from start to completion
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        {GROUPS.map((g) => (
          <div key={g.name}>
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">{g.name}</span>
              <button type="button" className="text-muted-foreground hover:text-foreground">
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
  if (type === "backlog") return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="3" fill="#92400e" opacity="0.5" />
      <circle cx="10" cy="10" r="4" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  )
  if (type === "planned") return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" />
    </svg>
  )
  if (type === "in-progress") return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" stroke="#ca8a04" strokeWidth="1.5" />
      <path d="M10 3.5A6.5 6.5 0 0 1 16.5 10" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
  if (type === "completed") return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" fill="#5b21b6" opacity="0.4" stroke="#7c3aed" strokeWidth="1.5" />
      <path d="M7 10l2 2 4-4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
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

function SlackConnectRow({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#4A154B]">
        {SLACK_ICON}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sublabel}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-sm">
        <button type="button" className="text-muted-foreground hover:text-foreground">
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 7v4M8 5h.01" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="flex items-center gap-0.5 font-medium hover:opacity-70">
          Connect
          <svg viewBox="0 0 12 12" className="ml-0.5 size-3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3.5 1.5h-2v9h9v-2M7 1.5h3.5v3.5M10.5 1.5 5 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function ProjectUpdatesSection() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Project updates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Short status reports about the progress and health of your projects. Project members regularly
          post updates, and subscribers automatically receive them in their inbox.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
      </div>
      <div>
        <h2 className="mb-1 text-sm font-semibold">Update schedule</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Configure how often updates are expected on projects. Project leads will receive reminders to post updates.
        </p>
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">No expectation for updates</span>
          <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
        </div>
      </div>
      <div>
        <h2 className="mb-1 text-sm font-semibold">Slack notifications</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Updates are only posted to Slack when associated with at least one non-private team
        </p>
        <SlackConnectRow
          label="Send project updates to a Slack channel"
          sublabel="Connect a channel to send all project updates to"
        />
      </div>
    </div>
  )
}

function AIAgentsSection() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">AI &amp; Agents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Automate your product development processes and operations with AI
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <div>
          <div className="text-sm font-medium">AI &amp; Agents</div>
          <div className="text-xs text-muted-foreground">
            Linear Agent and AI automations are available on Business and Enterprise plans
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 shrink-0">Start free trial</Button>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">Linear Agent</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Create issues and answer questions about your workspace.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true"><path d="M10 3 4 8v4l6 5 6-5V8L10 3Z" /></svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Linear Agent</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">Beta</span>
              </div>
              <div className="text-xs text-muted-foreground">Configure for your workspace</div>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
              Enabled <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 opacity-60">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true"><path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2Zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm-.75 3v4.25l3.5 2-.5.87-4-2.25V6.5h1Z" /></svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Agent automations</div>
              <div className="text-xs text-muted-foreground">Automated workflows that trigger when issues are added to triage</div>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">Available on Business</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 opacity-60">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true"><circle cx="10" cy="10" r="7.5" /></svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Triage Intelligence</div>
              <div className="text-xs text-muted-foreground">Find related issues and infer properties like team, project, labels, and assignee</div>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">Available on Business</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">Linear Agent integrations</h2>
        <p className="mb-3 text-xs text-muted-foreground">Integrations available to Linear Agent.</p>
        <button type="button" className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/30 transition-colors">
          <div>
            <div className="text-sm font-medium">Available integrations</div>
            <div className="text-xs text-muted-foreground">Available on Slack, Microsoft Teams, and Gong. Add integrations to your workspace to use.</div>
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">Installed Agents</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          AI agents can work alongside you as teammates.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
            Browse <span className="font-semibold text-foreground">integrations</span> to enable new agents
          </div>
          <button type="button" className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/30 transition-colors">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true"><path d="M10 3 4 8v4l6 5 6-5V8L10 3Z" /></svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Installed agents guidance</div>
              <div className="text-xs text-muted-foreground">Provide context and instructions for installed agents</div>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">AI</h2>
        <p className="mb-3 text-xs text-muted-foreground">Automate your product development processes and operations with AI</p>
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 opacity-60">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true"><path d="M10 3 4 8v4l6 5 6-5V8L10 3Z" /></svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">Summaries</div>
            <div className="text-xs text-muted-foreground">Control AI-generated summaries across Linear</div>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">Available on Business</span>
        </div>
      </div>
    </div>
  )
}

function InitiativesSection() {
  const [enabled, setEnabled] = useState(false)
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Initiatives</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Initiatives group multiple projects that contribute toward the same strategic effort. Use initiatives to
          plan and coordinate larger streams of work and monitor their progress at scale.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <div>
          <div className="text-sm font-medium">Enable Initiatives</div>
          <div className="text-xs text-muted-foreground">Visible to all non-guest workspace members</div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className={`flex flex-col gap-6 transition-opacity ${enabled ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
        <div>
          <h2 className="mb-1 text-sm font-semibold">Initiative updates</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Short status reports about the progress and health of your initiative. Updates are ideally written
            regularly by the owner of the initiative. Subscribers receive these updates directly in their inbox.
            You can also configure a Slack channel where all initiative updates are posted.
          </p>

          <div className="mb-4">
            <div className="mb-1 text-sm font-medium">Update schedule</div>
            <p className="mb-3 text-xs text-muted-foreground">
              Configure how often updates are expected on initiatives. Initiative owners will receive reminders to post updates.
            </p>
            <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
              <span className="text-sm text-muted-foreground">No expectation for updates</span>
              <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
            </div>
          </div>

          <div>
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

function DocumentsSection() {
  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Documents</h1>
      </div>
      <div>
        <h2 className="mb-1 text-sm font-semibold">Templates</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          These templates are available when creating documents for any team in the workspace. To create
          templates that only apply to specific teams, add them as team templates.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">No document templates</span>
          <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium">
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New template
          </Button>
        </div>
      </div>
    </div>
  )
}

function PulseSection() {
  const [enabled, setEnabled] = useState(false)
  const [wsSchedule, setWsSchedule] = useState("daily")
  const [mySchedule, setMySchedule] = useState("never")

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Pulse</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pulse centralizes all your project updates into a single feed. Members can choose to receive
          summary notifications daily or weekly.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <div>
          <div className="text-sm font-medium">Enable Pulse</div>
          <div className="text-xs text-muted-foreground">Workspace-wide feed of updates with optional summary notifications</div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold">Summary notifications</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Pulse summary notifications can be delivered in the mornings based on a set schedule
        </p>
        <div className="divide-y divide-border overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Default workspace schedule</div>
              <div className="text-xs text-muted-foreground">Applies to all members who haven't set their own preference</div>
            </div>
            <Select value={wsSchedule} onValueChange={onSelectChange(setWsSchedule)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
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
              <div className="text-xs text-muted-foreground">Only applies to you, overriding the workspace default</div>
            </div>
            <Select value={mySchedule} onValueChange={onSelectChange(setMySchedule)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
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

function CustomerRequestsSection() {
  const [enabled, setEnabled] = useState(false)
  const [manualEdits, setManualEdits] = useState(false)
  const [revenueFormat, setRevenueFormat] = useState("annual")
  const [currency, setCurrency] = useState("usd")
  const [defaultTeam, setDefaultTeam] = useState("")
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch("/api/data/teams").then(r => r.json()).then(setTeams).catch(() => {})
  }, [])

  const STATUSES = ["Active", "Prospect", "Churned", "Lost"]

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Customer requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Associate customers with projects and issues to align development efforts with real user needs.
          Manage and track customer requests across your entire organization.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">Docs ↗</a>
        </p>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
        <div>
          <div className="text-sm font-medium">Enable Customer requests</div>
          <div className="text-xs text-muted-foreground">Workspace-wide access to create and view customer requests</div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {/* Manage customers */}
      <button type="button" className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left hover:bg-accent/30 transition-colors">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <svg viewBox="0 0 20 20" className="size-4 fill-current text-muted-foreground" aria-hidden="true">
            <path d="M10 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-5 9.5A3.5 3.5 0 0 1 8.5 9h3A3.5 3.5 0 0 1 15 12.5v.5H5v-.5Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">Manage customers</div>
          <div className="text-xs text-muted-foreground">Manage your list of customers and their requests</div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
          No customers <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </div>
      </button>

      {/* Issue routing */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Issue routing</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          When a new issue is created from a customer page, it will be routed to the default team's triage or
          backlog. This centralizes customer requests for ease of management and prioritization.
        </p>
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Default team for customer requests</span>
          <Select value={defaultTeam} onValueChange={onSelectChange(setDefaultTeam)}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Select a team" /></SelectTrigger>
            <SelectContent>
              {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer statuses */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Customer statuses</h2>
        <p className="mb-3 text-xs text-muted-foreground">Define statuses for segmenting customers</p>
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-sm text-muted-foreground">{STATUSES.length} customer statuses</span>
            <button type="button" className="text-muted-foreground hover:text-foreground">
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
            </button>
          </div>
          {STATUSES.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 px-4 py-2.5 ${i < STATUSES.length - 1 ? "border-b" : ""}`}>
              <span className="size-3 shrink-0 rounded-sm bg-muted-foreground/40" />
              <span className="text-sm">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer tiers */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Customer tiers</h2>
        <p className="mb-3 text-xs text-muted-foreground">Define tiers for segmenting customers</p>
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">No customer tiers</span>
          <button type="button" className="text-muted-foreground hover:text-foreground">
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Display options */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Display options</h2>
        <div className="divide-y divide-border overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Revenue formatting</div>
              <div className="text-xs text-muted-foreground">Data imports must be in annual figures, but can be displayed as monthly or annual</div>
            </div>
            <Select value={revenueFormat} onValueChange={onSelectChange(setRevenueFormat)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Revenue currency</div>
              <div className="text-xs text-muted-foreground">The currency used when displaying customer revenue</div>
            </div>
            <Select value={currency} onValueChange={onSelectChange(setCurrency)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
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
        <h2 className="mb-1 text-sm font-semibold">Customer attributes data source</h2>
        <p className="mb-3 text-xs text-muted-foreground">Sync customer attributes from an external data source</p>
        <div className="divide-y divide-border overflow-hidden rounded-lg border bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">External data source</span>
            <span className="text-sm text-muted-foreground">None</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Enable manual edits</div>
              <div className="text-xs text-muted-foreground">Attributes can be edited in the Linear UI</div>
            </div>
            <Switch checked={manualEdits} onCheckedChange={setManualEdits} />
          </div>
        </div>
      </div>

      {/* Excluded domains */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Excluded domains and emails</h2>
        <p className="mb-3 text-xs text-muted-foreground">Domains and emails that should never create customer requests</p>
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">No excluded domains and emails</span>
          <button type="button" className="text-muted-foreground hover:text-foreground">
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Generic domains */}
      <div>
        <h2 className="mb-1 text-sm font-semibold">Generic domains and emails</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Domains and emails that are not associated with a specific customer. Common providers like
          Gmail, Outlook, etc. are already included.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">List of generic domains ↗</a>
        </p>
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">No custom generic domains and emails</span>
          <button type="button" className="text-muted-foreground hover:text-foreground">
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Asks / Emojis / Integrations ────────────────────────────────────────────

function AsksSection() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Asks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let anyone submit bug reports, feature requests, and more using structured templates from
          Slack or email.{" "}
          <a href="#" className="font-medium text-foreground underline-offset-2 hover:underline">
            Docs ↗
          </a>
        </p>
      </div>

      {/* Upgrade card */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-violet-950/40 via-card to-card p-6">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="relative">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-400">
              Business
            </span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-400">
              Enterprise
            </span>
          </div>
          <h2 className="mt-3 text-base font-semibold">Asks intake is available on Business or Enterprise plans</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Collect structured requests from customers and teammates via Slack or email. Triage, assign,
            and link them directly to issues — without leaving Linear.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
              Start free trial
            </Button>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Learn more ↗
            </a>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { title: "Slack intake", desc: "Collect asks directly from any Slack channel using /ask." },
          { title: "Email intake", desc: "Dedicate an inbox address to receive and triage requests." },
          { title: "Structured templates", desc: "Guide submitters with custom fields and required info." },
          { title: "Auto-link to issues", desc: "Turn accepted asks into Linear issues in one click." },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium">{f.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmojisSection() {
  const [query, setQuery] = useState("")

  return (
    <div className="flex flex-col gap-0 p-6 max-w-2xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Emojis</h1>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter emojis…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
          <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          Upload
        </Button>
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        {/* Stacked smiley SVG illustration */}
        <div className="relative mb-6 flex h-20 w-24 items-end justify-center">
          {/* back face */}
          <svg viewBox="0 0 48 48" className="absolute bottom-0 left-0 h-14 w-14 opacity-20" fill="none">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="17" cy="20" r="2.5" fill="currentColor" />
            <circle cx="31" cy="20" r="2.5" fill="currentColor" />
            <path d="M15 30 Q24 38 33 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
          {/* mid face */}
          <svg viewBox="0 0 48 48" className="absolute bottom-2 left-5 h-14 w-14 opacity-40" fill="none">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="17" cy="20" r="2.5" fill="currentColor" />
            <circle cx="31" cy="20" r="2.5" fill="currentColor" />
            <path d="M15 30 Q24 38 33 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
          {/* front face */}
          <svg viewBox="0 0 48 48" className="relative h-16 w-16" fill="none">
            <circle cx="24" cy="24" r="22" className="fill-muted" stroke="currentColor" strokeWidth="2" />
            <circle cx="17" cy="20" r="2.5" fill="currentColor" />
            <circle cx="31" cy="20" r="2.5" fill="currentColor" />
            <path d="M15 30 Q24 38 33 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">No emojis</p>
        <p className="mt-1.5 max-w-xs text-xs text-muted-foreground">
          Upload custom emojis to use across your workspace in issues, comments, and reactions.
        </p>
        <Button size="sm" variant="outline" className="mt-4 gap-1.5 text-xs">
          <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
          Upload emoji
        </Button>
      </div>
    </div>
  )
}

// ─── Integration data ────────────────────────────────────────────────────────

type IntCard = { key: string; name: string; desc: string; color: string; abbr: string; preinstalled?: boolean }

const INTEG_ESSENTIALS: IntCard[] = [
  { key: "github",       name: "GitHub",               desc: "Automate your pull request and commit workflows and keep issues synced both ways", color: "bg-[#24292e]", abbr: "GH" },
  { key: "slack",        name: "Slack",                desc: "Get notifications and create issues from Slack messages.", color: "bg-[#4A154B]", abbr: "SL" },
  { key: "gitlab",       name: "GitLab",               desc: "Automate your Merge Request workflow", color: "bg-[#FC6D26]", abbr: "GL" },
  { key: "figma",        name: "Figma",                desc: "Embed and create Figma designs directly in issues.", color: "bg-[#F24E1E]", abbr: "FG" },
  { key: "intercom",     name: "Intercom",             desc: "Link customer conversations to issues.", color: "bg-[#286EFA]", abbr: "IC" },
  { key: "gsheets",      name: "Google Sheets",        desc: "Export and sync Linear data with spreadsheets.", color: "bg-[#34A853]", abbr: "GS" },
]
const INTEG_AGENTS: IntCard[] = [
  { key: "codex",        name: "Codex",                desc: "Automate code tasks with OpenAI Codex agents.", color: "bg-[#1a1a1a]", abbr: "CX" },
  { key: "cursor",       name: "Cursor",               desc: "AI code editor — assign issues to Cursor to auto-implement.", color: "bg-[#1C1C1C]", abbr: "CR" },
  { key: "copilot",      name: "GitHub Copilot",       desc: "AI coding assistant natively integrated with GitHub.", color: "bg-[#24292e]", abbr: "CO" },
  { key: "factory",      name: "Factory",              desc: "Automate pull request workflows with AI.", color: "bg-[#5B2D8E]", abbr: "FA" },
  { key: "sentry-ag",    name: "Sentry Agent",         desc: "Auto-create and triage issues from Sentry errors.", color: "bg-[#362D59]", abbr: "SA" },
  { key: "devin",        name: "Devin",                desc: "AI software engineer agent that can resolve issues.", color: "bg-[#0057FF]", abbr: "DV" },
  { key: "chatprd",      name: "ChatPRD",              desc: "AI-powered product spec writing and planning.", color: "bg-[#FF5C00]", abbr: "CP" },
  { key: "charlie",      name: "Charlie",              desc: "AI agent for project management automation.", color: "bg-[#2A9D8F]", abbr: "CH" },
]
const INTEG_AI_CLIENTS: IntCard[] = [
  { key: "cursor-mcp",   name: "Cursor MCP",           desc: "Model context protocol integration for Cursor IDE.", color: "bg-[#1C1C1C]", abbr: "CM" },
  { key: "chatgpt",      name: "ChatGPT",              desc: "Access and manage your Linear data inside ChatGPT.", color: "bg-[#10A37F]", abbr: "GP" },
  { key: "claude-ai",    name: "Claude",               desc: "Use your Linear workspace context inside Claude.", color: "bg-[#D97757]", abbr: "CL" },
  { key: "v0",           name: "v0 by Vercel MCP",     desc: "Build and iterate on UI components with v0.", color: "bg-[#1a1a1a]", abbr: "V0" },
  { key: "windsurf",     name: "Windsurf",             desc: "AI-native development environment by Codeium.", color: "bg-[#0B6EFD]", abbr: "WS" },
  { key: "replit",       name: "Replit",               desc: "Build and deploy apps with AI in Replit.", color: "bg-[#F26207]", abbr: "RP" },
  { key: "dust",         name: "Dust",                 desc: "AI assistant platform connected to your tools.", color: "bg-[#5865F2]", abbr: "DU" },
  { key: "adk",          name: "ADK",                  desc: "Agent Development Kit by Google for building agents.", color: "bg-[#4285F4]", abbr: "AK" },
]
const INTEG_ENGINEERING: IntCard[] = [
  { key: "github-eng",   name: "GitHub",               desc: "Automate your pull request and commit workflows and keep issues synced both ways", color: "bg-[#24292e]", abbr: "GH" },
  { key: "gitlab-eng",   name: "GitLab",               desc: "Automate your Merge Request workflow", color: "bg-[#FC6D26]", abbr: "GL" },
  { key: "pagerduty",    name: "PagerDuty Triage Responsibility", desc: "Automate the rotation of triage responsibility with PagerDuty schedules", color: "bg-[#06AC38]", abbr: "PD" },
  { key: "sentry-eng",   name: "Sentry",               desc: "Create and link issues with Sentry and automate issue creation", color: "bg-[#362D59]", abbr: "SE" },
  { key: "vscode",       name: "VS Code",              desc: "Easily build VS Code extensions with Linear Connect", color: "bg-[#007ACC]", abbr: "VS" },
  { key: "datadog",      name: "Datadog",              desc: "Create issues from Datadog monitors and alerts", color: "bg-[#632CA6]", abbr: "DD" },
  { key: "incidentio",   name: "incident.io",          desc: "Manage incidents and triage responsibility directly in Linear", color: "bg-[#FF4500]", abbr: "IO" },
  { key: "raycast-eng",  name: "Raycast",              desc: "Create, search, and modify your issues from anywhere", color: "bg-[#FF6363]", abbr: "RC" },
]
const INTEG_LINEAR_CRAFTED: IntCard[] = [
  { key: "github-lc",    name: "GitHub",               desc: "Automate your pull request and commit workflows and keep issues synced both ways", color: "bg-[#24292e]", abbr: "GH" },
  { key: "slack-lc",     name: "Slack",                desc: "Create issues from Slack messages and sync threads", color: "bg-[#4A154B]", abbr: "SL" },
  { key: "gitlab-lc",    name: "GitLab",               desc: "Automate your Merge Request workflow", color: "bg-[#FC6D26]", abbr: "GL" },
  { key: "figma-lc",     name: "Figma",                desc: "Create and link issues directly from Figma", color: "bg-[#F24E1E]", abbr: "FG" },
  { key: "linear-asks",  name: "Linear Asks for Slack", desc: "Turn requests from Slack or email into actionable issues and enable helpdesk workflows", color: "bg-violet-600", abbr: "LA" },
  { key: "notion-lc",    name: "Notion",               desc: "Previews of Linear issues, views and projects and query Notion AI", color: "bg-[#1a1a1a]", abbr: "NO" },
  { key: "pagerduty-lc", name: "PagerDuty Triage Responsibility", desc: "Automate the rotation of triage responsibility with PagerDuty schedules", color: "bg-[#06AC38]", abbr: "PD" },
  { key: "zapier-lc",    name: "Zapier",               desc: "Build custom automations to create or update Linear issues", color: "bg-[#FF4A00]", abbr: "ZP" },
]
const INTEG_BUG_REPORTING: IntCard[] = [
  { key: "linear-asks-br", name: "Linear Asks for Slack", desc: "Turn requests from Slack or email into actionable issues and enable helpdesk workflows", color: "bg-violet-600", abbr: "LA" },
  { key: "sentry-br",    name: "Sentry",               desc: "Create and link issues with Sentry and automate issue creation", color: "bg-[#362D59]", abbr: "SE" },
  { key: "incidentio-br", name: "incident.io",         desc: "Manage incidents and triage responsibility directly in Linear", color: "bg-[#FF4500]", abbr: "IO" },
  { key: "birdeats",     name: "Bird Eats Bug",        desc: "Speed up your bug reporting workflow with Bird Eats Bug", color: "bg-rose-600", abbr: "BB" },
  { key: "honeybadger",  name: "Honeybadger",          desc: "Manage Honeybadger errors via Linear issues", color: "bg-amber-600", abbr: "HB" },
  { key: "jam",          name: "Jam",                  desc: "Create Linear issues with all the details developers need to resolve bugs faster", color: "bg-[#6B21A8]", abbr: "JM" },
  { key: "vercel-br",    name: "Vercel",               desc: "Turn Vercel Preview Deployment comments into action items", color: "bg-[#1a1a1a]", abbr: "VC" },
  { key: "arc",          name: "Arc",                  desc: "Create new issues right from your browser command bar", color: "bg-gradient-to-br from-amber-400 to-orange-500", abbr: "AC", preinstalled: true },
]
const INTEG_AUTOMATIONS: IntCard[] = [
  { key: "zapier-au",    name: "Zapier",               desc: "Build custom automations to create or update Linear issues", color: "bg-[#FF4A00]", abbr: "ZP" },
  { key: "email-au",     name: "Create issues via email", desc: "Set up email addresses for teams or templates to create issues via email", color: "bg-sky-600", abbr: "EM", preinstalled: true },
  { key: "jira-au",      name: "Jira",                 desc: "Smoothly transition from Jira to Linear", color: "bg-[#0052CC]", abbr: "JR" },
  { key: "raycast-au",   name: "Raycast",              desc: "Create, search, and modify your issues from anywhere", color: "bg-[#FF6363]", abbr: "RC" },
  { key: "fivetran",     name: "Fivetran",             desc: "Sync your Linear data with the Fivetran connector", color: "bg-[#0073E6]", abbr: "FT" },
  { key: "axolo",        name: "Axolo",                desc: "Make code reviews easier by syncing your pull request channels with your Linear issues", color: "bg-emerald-600", abbr: "AX" },
  { key: "capybara",     name: "Capybara",             desc: "Create Linear issues and comments based on Jira tasks", color: "bg-amber-700", abbr: "CB" },
  { key: "circleback",   name: "Circleback",           desc: "Automatically create Linear issues from meeting action items", color: "bg-[#7C3AED]", abbr: "CK" },
]
const INTEG_CUSTOMER_EXP: IntCard[] = [
  { key: "zendesk",      name: "Zendesk",              desc: "Keep a tight feedback loop with customers and streamline bug reports", color: "bg-[#03363D]", abbr: "ZD" },
  { key: "intercom-cx",  name: "Intercom",             desc: "Keep a tight feedback loop with customers and streamline bug reports", color: "bg-[#286EFA]", abbr: "IC" },
  { key: "front",        name: "Front",                desc: "Keep a tight feedback loop with customers and streamline bug reports", color: "bg-[#F5365C]", abbr: "FR" },
  { key: "canny",        name: "Canny",                desc: "Sync Canny posts to Linear issues to keep customers in the loop", color: "bg-[#0C64E4]", abbr: "CA" },
  { key: "productlane",  name: "Productlane",          desc: "Helpdesk, customer requests portal, public roadmap, and changelog built on Linear", color: "bg-violet-700", abbr: "PL" },
  { key: "index",        name: "Index",                desc: "The Productboard and Jira Product Discovery alternative for Product Management on Linear", color: "bg-[#374151]", abbr: "IX" },
  { key: "salesforce",   name: "Salesforce",           desc: "Create Linear issues from Salesforce cases", color: "bg-[#00A1E0]", abbr: "SF" },
  { key: "atlas",        name: "Atlas Support",        desc: "Keep a tight feedback loop with customers and streamline customer requests", color: "bg-[#6366F1]", abbr: "AS" },
]
const INTEG_COLLABORATION: IntCard[] = [
  { key: "slack-co",       name: "Slack",                desc: "Create issues from Slack messages and sync threads", color: "bg-[#4A154B]", abbr: "SL" },
  { key: "linear-asks-co", name: "Linear Asks for Slack", desc: "Turn requests from Slack or email into actionable issues and enable helpdesk workflows", color: "bg-violet-600", abbr: "LA" },
  { key: "notion-co",      name: "Notion",               desc: "Previews of Linear issues, views and projects and query Notion AI", color: "bg-[#1a1a1a]", abbr: "NO" },
  { key: "msteams",        name: "Microsoft Teams",      desc: "Drive work forward by turning conversations into issues, projects, and documents", color: "bg-[#6264A7]", abbr: "MT" },
  { key: "discord",        name: "Discord",              desc: "Create issues, share updates, and keep everyone in sync", color: "bg-[#5865F2]", abbr: "DS" },
  { key: "glean",          name: "Glean",                desc: "Search Linear for instant insights", color: "bg-[#3B82F6]", abbr: "GL" },
  { key: "productlane-co", name: "Productlane",          desc: "Helpdesk, customer requests portal, public roadmap, and changelog built on Linear", color: "bg-violet-700", abbr: "PL" },
  { key: "range",          name: "Range",                desc: "Pull Linear issues into async check-ins to keep your software development team in sync", color: "bg-[#374151]", abbr: "RG" },
]
const INTEG_MEDIA_DESIGN: IntCard[] = [
  { key: "figma-md",     name: "Figma",              desc: "Create and link issues directly from Figma", color: "bg-[#F24E1E]", abbr: "FG" },
  { key: "canva",        name: "Canva AI Connector", desc: "Create and link Linear workflow content directly within Canva", color: "bg-[#00C4CC]", abbr: "CA" },
  { key: "claap",        name: "Claap",              desc: "Record bugs and directly create issues in Linear", color: "bg-rose-600", abbr: "CL" },
  { key: "descript",     name: "Descript",           desc: "Embed Descript share URLs in Linear issues and documents", color: "bg-[#1a1a2e]", abbr: "DE", preinstalled: true },
  { key: "loom",         name: "Loom",               desc: "Embed Loom videos in Linear issues and documents", color: "bg-[#625DF5]", abbr: "LO", preinstalled: true },
  { key: "miro",         name: "Miro",               desc: "Import, create and manage issues directly in Miro", color: "bg-amber-500", abbr: "MI" },
  { key: "screenpresso", name: "Screenpresso",       desc: "Effectively report an issue with embedded screenshots and videos", color: "bg-red-600", abbr: "SP" },
  { key: "tella",        name: "Tella",              desc: "Embed Tella videos in Linear", color: "bg-violet-600", abbr: "TE" },
  { key: "youtube",      name: "YouTube",            desc: "Embed YouTube videos in Linear issues and documents", color: "bg-[#FF0000]", abbr: "YT", preinstalled: true },
]
const INTEG_ANALYTICS: IntCard[] = [
  { key: "airbyte",      name: "Airbyte",            desc: "Connect Linear to Airbyte and consolidate data in data warehouses, lakes, and databases", color: "bg-[#6E4FF6]", abbr: "AB" },
  { key: "gsheets-an",   name: "Google Sheets",      desc: "Build custom dashboards and analytics from issue and project data", color: "bg-[#34A853]", abbr: "GS" },
  { key: "fivetran-an",  name: "Fivetran",           desc: "Sync your Linear data with the Fivetran connector", color: "bg-[#0073E6]", abbr: "FT" },
  { key: "retool",       name: "Retool",             desc: "Create, update, and analyze Linear issues in custom internal tools", color: "bg-[#3E63DD]", abbr: "RT" },
  { key: "span",         name: "Span",               desc: "See how work translates into engineering impact", color: "bg-[#374151]", abbr: "SP" },
  { key: "jellyfish",    name: "Jellyfish",          desc: "Developer productivity insights and AI impact signals in one dashboard", color: "bg-violet-700", abbr: "JF" },
  { key: "coda",         name: "Coda by Packs4Coda", desc: "Analyze your team's performance, project lifecycles, issues and more with the Linear Pack for Coda", color: "bg-[#F46A54]", abbr: "CD" },
  { key: "cyclereport",  name: "Cycle Report",       desc: "Create reports of your cycles that your clients can review and sign off on", color: "bg-[#7C3AED]", abbr: "CR" },
]
const INTEG_SECURITY: IntCard[] = [
  { key: "aikido",       name: "Aikido Security",    desc: "Put your application security on autopilot", color: "bg-[#6366F1]", abbr: "AK" },
  { key: "cloudback",    name: "Cloudback",          desc: "Automated daily backups of your Linear workspace with on-demand restore", color: "bg-[#374151]", abbr: "CB" },
  { key: "drata",        name: "Drata",              desc: "Simplify risk and managing frameworks like SOC 2, ISO 27001, PCI and more", color: "bg-[#1a1a1a]", abbr: "DR" },
  { key: "fencer",       name: "Fencer",             desc: "Create and link issues directly from Fencer", color: "bg-emerald-600", abbr: "FE" },
  { key: "kawach",       name: "Kawach AI",          desc: "Keep your workspace compliant with org policies using Kawach.AI", color: "bg-[#374151]", abbr: "KW" },
  { key: "orca",         name: "Orca Security",      desc: "Streamline security fixes by sharing relevant context with the right people", color: "bg-[#1D4ED8]", abbr: "OR" },
  { key: "secureslate",  name: "SecureSlate",        desc: "Create and link SecureSlate security tickets to Linear", color: "bg-emerald-700", abbr: "SS" },
  { key: "vanta",        name: "Vanta",              desc: "Automate compliance. Simplify security. Demonstrate trust.", color: "bg-[#1a1a1a]", abbr: "VA" },
]

function IntegrationCard({ name, desc, color, abbr, preinstalled }: IntCard) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4 hover:border-foreground/20 transition-colors cursor-pointer">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white ${color}`}>
        {abbr}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold leading-tight">{name}</span>
          {preinstalled && (
            <span className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground leading-none">Pre-installed</span>
          )}
        </div>
        <div className="mt-1 text-xs text-muted-foreground leading-4">{desc}</div>
      </div>
    </div>
  )
}

function ShowAllCard({ items }: { items: IntCard[] }) {
  const palette = items.slice(0, 12)
  return (
    <div className="flex flex-col items-start justify-between rounded-lg border bg-card p-4 hover:border-foreground/20 transition-colors cursor-pointer">
      <div className="grid grid-cols-4 gap-1.5">
        {palette.map((item, i) => (
          <div
            key={i}
            className={`flex size-7 items-center justify-center rounded-lg text-[8px] font-bold text-white ${item.color}`}
          >
            {item.abbr.slice(0, 1)}
          </div>
        ))}
      </div>
      <button type="button" className="mt-3 text-xs font-medium text-muted-foreground hover:text-foreground">
        Show all
      </button>
    </div>
  )
}

function IntegSection({ title, desc, items, showAll = true }: { title: string; desc?: string; items: IntCard[]; showAll?: boolean }) {
  const cards = showAll ? items.slice(0, 8) : items
  return (
    <div>
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      {desc && <p className="mb-3 -mt-1 text-xs text-muted-foreground">{desc}</p>}
      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ key, ...i }) => <IntegrationCard key={key} {...i} />)}
        {showAll && items.length >= 8 && <ShowAllCard items={items} />}
      </div>
    </div>
  )
}

function IntegrationsSection() {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const tabs = [
    { key: "all", label: "All" },
    { key: "asks-slack", label: "Linear Asks for Slack" },
    { key: "slack", label: "Slack" },
    { key: "github", label: "GitHub" },
    { key: "figma", label: "Figma" },
    { key: "more", label: "More…" },
  ]

  const allSections = [
    { title: "Essentials", items: INTEG_ESSENTIALS, showAll: false },
    { title: "Agents", desc: "AI agents that can be assigned to issues and take autonomous action.", items: INTEG_AGENTS },
    { title: "AI Clients", desc: "Connect Linear to your favorite AI tools via MCP or native integrations.", items: INTEG_AI_CLIENTS },
    { title: "Engineering", items: INTEG_ENGINEERING },
    { title: "Linear Crafted", items: INTEG_LINEAR_CRAFTED },
    { title: "Bug Reporting", items: INTEG_BUG_REPORTING },
    { title: "Automations", items: INTEG_AUTOMATIONS },
    { title: "Customer Experience", items: INTEG_CUSTOMER_EXP },
    { title: "Collaboration", items: INTEG_COLLABORATION },
    { title: "Media & Design", items: INTEG_MEDIA_DESIGN, showAll: false },
    { title: "Analytics", items: INTEG_ANALYTICS },
    { title: "Security & Compliance", items: INTEG_SECURITY, showAll: false },
  ]

  const filtered = query
    ? allSections
        .map((s) => ({ ...s, items: s.items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase())) }))
        .filter((s) => s.items.length > 0)
    : allSections

  return (
    <div className="flex flex-col gap-0 max-w-3xl">
      {/* Sticky search */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-6 py-4">
        <div className="relative flex-1">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search integrations…" className="h-8 pl-8 text-xs" />
        </div>
      </div>

      <div className="px-6 pt-4 pb-8 flex flex-col gap-8">
        {/* Featured Slack card */}
        {!query && (
          <div className="overflow-hidden rounded-xl border bg-gradient-to-r from-[#4A154B]/30 via-card to-card">
            <div className="flex items-start gap-5 p-5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#4A154B] text-sm font-bold text-white">SL</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Slack</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-500">Featured</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Get notified about issues, create new issues, and manage your workflow — all without leaving Slack.</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="h-7 text-xs bg-[#4A154B] hover:bg-[#5C1F5E] text-white">Connect Slack</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Learn more</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab nav */}
        {!query && (
          <div className="flex gap-0.5 overflow-x-auto border-b -mb-4">
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
                className={`shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-xs transition-colors ${activeTab === t.key ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {filtered.map((s) => (
          <IntegSection key={s.title} title={s.title} desc={s.desc} items={s.items} showAll={s.showAll} />
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
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
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const TEAM_PALETTE = ["bg-violet-500","bg-sky-500","bg-amber-500","bg-emerald-500","bg-rose-500","bg-fuchsia-500","bg-cyan-500","bg-orange-500"]
function teamColor(key: string) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return TEAM_PALETTE[h % TEAM_PALETTE.length]
}
function TeamIcon({ teamKey }: { teamKey: string }) {
  return (
    <div className={`flex size-4 shrink-0 items-center justify-center rounded-sm text-[9px] font-semibold text-white ${teamColor(teamKey)}`}>
      {teamKey.slice(0, 2)}
    </div>
  )
}

// SettingsTeamRow is no longer used — sidebar renders team buttons inline

// ─── Create Team Page ─────────────────────────────────────────────────────────

function CreateTeamPage({ teams }: { teams: { id: string; name: string; key: string }[] }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [identifierTouched, setIdentifierTouched] = useState(false)
  const [copyFrom, setCopyFrom] = useState("none")
  const [timezone, setTimezone] = useState("asia-kolkata")

  const handleNameChange = (v: string) => {
    setName(v)
    if (!identifierTouched) {
      setIdentifier(v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6 max-w-2xl">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/settings?section=teams")}
        className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Back
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold">Create a new team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new team to manage separate cycles, workflows and notifications
        </p>
      </div>

      {/* Identity card */}
      <div className="rounded-lg border overflow-hidden">
        {/* Team icon row */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">Team icon</span>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-md border bg-muted/40 transition-colors hover:bg-muted"
          >
            <HugeiconsIcon icon={UserMultiple02Icon} className="size-4 text-muted-foreground" />
          </button>
        </div>
        {/* Team name row */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <label htmlFor="team-name" className="text-sm font-medium">Team name</label>
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
            <div className="text-xs text-muted-foreground">
              Used to identify issues from this team (e.g. ENG-123)
            </div>
          </div>
          <Input
            placeholder="e.g. ENG"
            value={identifier}
            onChange={(e) => {
              setIdentifierTouched(true)
              setIdentifier(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
            }}
            className="h-8 w-32 text-sm font-mono"
          />
        </div>
      </div>

      {/* Team hierarchy */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Team hierarchy</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Teams can be nested to reflect your team structure and to share workflows and settings
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Parent team</span>
            <span className="text-sm text-muted-foreground">Available on Business</span>
          </div>
        </div>
      </div>

      {/* Copy settings */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Copy settings from existing team</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You can choose to copy the settings of an existing team for your newly created team. All
            settings including workflow and cycle settings are copied, but Slack notification settings
            and team members won't be copied.
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Copy from team</span>
            <Select value={copyFrom} onValueChange={onSelectChange(setCopyFrom)}>
              <SelectTrigger className="h-8 w-40 text-xs rounded-full border-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Don't copy</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.key}>{t.name}</SelectItem>
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
          <p className="mt-1 text-sm text-muted-foreground">
            The timezone should be set as the location where most of your team members reside. All
            other times referenced by the team will be relative to this timezone setting. For example,
            if your team uses cycles, each cycle will start at midnight in the specified timezone.
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Timezone</span>
            <Select value={timezone} onValueChange={onSelectChange(setTimezone)}>
              <SelectTrigger className="h-8 w-72 text-xs rounded-full border-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="us-eastern">GMT-5:00 – Eastern Standard Time</SelectItem>
                <SelectItem value="us-pacific">GMT-8:00 – Pacific Standard Time</SelectItem>
                <SelectItem value="europe-london">GMT+0:00 – Greenwich Mean Time</SelectItem>
                <SelectItem value="europe-berlin">GMT+1:00 – Central European Time</SelectItem>
                <SelectItem value="asia-kolkata">GMT+5:30 – India Standard Time - Kolkata</SelectItem>
                <SelectItem value="asia-tokyo">GMT+9:00 – Japan Standard Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Make team private */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Make team private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Private teams and their issues are only visible to members of the team and admins. Only
            admins and team owners can add new users to a private team. Public teams and their issues
            are visible to anyone in the workspace.
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Private team</span>
            <span className="text-sm text-muted-foreground">Available on Business</span>
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

function TeamSettingsHubSection({
  team,
}: {
  team: { id: string; name: string; key: string }
}) {
  const router = useRouter()

  const hubGroups = [
    {
      title: null,
      cards: [
        { label: "General", desc: "Name, identifier, icon, timezone", icon: Settings02Icon },
        { label: "Members", desc: "Manage team membership and roles", icon: UserMultiple02Icon },
        { label: "Slack notifications", desc: "Post updates to Slack channels", icon: Notification01Icon },
      ],
    },
    {
      title: "Issues, projects & docs",
      cards: [
        { label: "Issue labels", desc: "Categorize and filter issues", icon: LabelIcon },
        { label: "Templates", desc: "Standardize issue creation", icon: FileAddIcon },
        { label: "Recurring issues", desc: "Auto-create issues on a schedule", icon: Activity03Icon },
      ],
    },
    {
      title: "Workflow",
      cards: [
        { label: "Issue statuses", desc: "Configure the states issues move through", icon: CheckmarkCircle02Icon },
        { label: "Workflows & automations", desc: "Automate repetitive actions", icon: ArrowRight01Icon },
        { label: "Triage", desc: "Review and route incoming issues", icon: FireIcon },
        { label: "Cycles", desc: "Plan work in time-boxed sprints", icon: Chart01Icon },
      ],
    },
    {
      title: "AI & Agents",
      cards: [
        { label: "Agents", desc: "AI teammates that work on issues", icon: AiBrain01Icon },
        { label: "Discussion summaries", desc: "Auto-summarize long threads", icon: SmileIcon },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push("/settings?section=teams")}
        className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Teams
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-400/50 text-rose-400">
          <HugeiconsIcon icon={UserIcon} className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold">{team.name}</h1>
          <p className="text-xs text-muted-foreground">Team settings</p>
        </div>
      </div>

      {/* Navigation cards */}
      {hubGroups.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-2">
          {group.title && (
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground/60">
              {group.title}
            </h2>
          )}
          <div className="flex flex-col divide-y rounded-lg border overflow-hidden">
            {group.cards.map((card) => (
              <button
                key={card.label}
                type="button"
                className="flex items-center gap-3 bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
              >
                <HugeiconsIcon icon={card.icon} className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{card.label}</div>
                  <div className="text-xs text-muted-foreground">{card.desc}</div>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 shrink-0 text-muted-foreground/50" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Team hierarchy */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground/60">Team hierarchy</h2>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Parent team</div>
              <div className="text-xs text-muted-foreground">Organize this team under a parent</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-400">
                Business
              </span>
              <Button variant="outline" size="sm" className="h-7 text-xs opacity-50 cursor-default">
                Available on Business
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground/60">Danger zone</h2>
        <div className="rounded-lg border border-destructive/20 divide-y divide-destructive/10 overflow-hidden">
          {[
            { label: "Leave team", desc: "Remove yourself from this team" },
            { label: "Retire team", desc: "Archive the team and all its content" },
            { label: "Delete team", desc: "Permanently delete this team and all issues" },
          ].map((action) => (
            <div key={action.label} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.desc}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                {action.label.split(" ")[0]}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
