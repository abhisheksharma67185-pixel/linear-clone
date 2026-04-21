"use client"

import { Suspense, useEffect, useMemo, useState, useCallback } from "react"
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
import { HugeiconsIcon } from "@hugeicons/react"
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
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | null
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
        {teams.length > 0 && (
          <div className="mb-1 mt-1">
            <div className="mb-0.5 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
              Your teams
            </div>
            {teams.map((team) => (
              <SettingsTeamRow
                key={team.id}
                team={team}
                section={section}
                onSection={setSection}
              />
            ))}
          </div>
        )}

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
  if (section === "members") return <MembersSection />
  if (section === "issue-labels") return <IssueLabelsSection />
  if (section === "issue-templates") return <IssueTemplatesSection />
  if (section === "slas") return <SLAsSection />
  if (section === "project-labels") return <ProjectLabelsSection />
  if (section === "project-templates") return <ProjectTemplatesSection />
  if (section === "statuses") return <ProjectStatusesSection />
  if (section === "updates") return <ProjectUpdatesSection />
  if (section === "ai-agents") return <AIAgentsSection />
  if (section === "initiatives") return <InitiativesSection />
  if (section === "preferences") return <PreferencesSection />
  if (section === "profile") return <ProfileSection />
  if (section === "notifications") return <NotificationsSection />
  if (section === "security") return <SecuritySection />
  if (section === "connected") return <ConnectedAccountsSection />
  if (section === "agents") return <AgentPersonalizationSection />

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
          <Select value={homeView} onValueChange={setHomeView}>
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
          <Select value={displayNames} onValueChange={setDisplayNames}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fullname">Full name</SelectItem>
              <SelectItem value="username">Username</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <Separator />
        <SettingsRow label="First day of week">
          <Select value={firstDay} onValueChange={setFirstDay}>
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
          <Select value={sendOn} onValueChange={setSendOn}>
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
          <Select value={fontSize} onValueChange={setFontSize}>
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
          <Select value={theme} onValueChange={setTheme}>
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
          <Select value={gitFormat} onValueChange={setGitFormat}>
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
  const [workspaceName, setWorkspaceName] = useState("Theta Engineering")
  const [workspaceUrl, setWorkspaceUrl] = useState("theta-engineering")
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 1800) }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your workspace settings.</p>
      </div>
      <SettingsCard title="General">
        <SettingsRow label="Workspace name" description="The display name of your workspace.">
          <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="h-8 w-52 text-xs" />
        </SettingsRow>
        <SettingsRow label="URL" description="Your workspace's unique URL slug.">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>linear.app/</span>
            <Input value={workspaceUrl} onChange={(e) => setWorkspaceUrl(e.target.value)} className="h-8 w-40 text-xs" />
          </div>
        </SettingsRow>
        <Separator />
        <div className="flex items-center gap-3 pt-1">
          <Button size="sm" onClick={save}>Save changes</Button>
          {saved && <span className="text-xs text-emerald-500">Saved!</span>}
        </div>
      </SettingsCard>
    </div>
  )
}

function MembersSection() {
  const [members, setMembers] = useState<Member[]>([])
  useEffect(() => {
    fetch("/api/data/members").then((r) => r.json()).then(setMembers).catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""} in this workspace.</p>
        </div>
        <Button size="sm">Invite members</Button>
      </div>
      <SettingsCard title="Workspace members">
        {members.map((member, i) => (
          <div key={member.id}>
            {i > 0 && <Separator />}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Avatar className="size-7">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-[10px]">{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <span className="rounded-full border px-2 py-0.5 text-[10px] capitalize text-muted-foreground">{member.role}</span>
            </div>
          </div>
        ))}
      </SettingsCard>
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

const TEAM_SUBITEMS = [
  { key: "issues", label: "Issues" },
  { key: "projects", label: "Projects" },
  { key: "views", label: "Views" },
] as const

function SettingsTeamRow({
  team,
  section,
  onSection,
}: {
  team: { id: string; name: string; key: string }
  section: string
  onSection: (key: string) => void
}) {
  const prefix = `team-${team.key}-`
  const isActive = (sub: string) => section === `${prefix}${sub}`
  const isTeamActive = TEAM_SUBITEMS.some((s) => isActive(s.key))
  const [open, setOpen] = useState(true)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
          isTeamActive
            ? "text-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        }`}
      >
        <TeamIcon teamKey={team.key} />
        <span className="flex-1 truncate">{team.name}</span>
        <svg
          viewBox="0 0 8 8"
          aria-hidden="true"
          className={`size-2 shrink-0 fill-current text-muted-foreground/70 transition-transform ${open ? "" : "-rotate-90"}`}
        >
          <path d="M1 2 L7 2 L4 6 Z" />
        </svg>
      </button>
      {open && (
        <div className="relative ml-3 flex flex-col border-l border-sidebar-border pl-3">
          {TEAM_SUBITEMS.map((sub) => (
            <button
              key={sub.key}
              type="button"
              onClick={() => onSection(`${prefix}${sub.key}`)}
              className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                isActive(sub.key)
                  ? "bg-sidebar-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
