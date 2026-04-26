"use client"

import Link from "next/link"
import { use, useEffect, useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowDown01Icon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { TEAM_HUB_GROUPS } from "@/lib/team-hub"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TeamRef = { id: string; name: string; key: string }

function sectionCopy(sectionId: string): {
  label: string
  subtitle: string
} {
  for (const g of TEAM_HUB_GROUPS) {
    for (const s of g.sections) {
      if (s.id === sectionId) return { label: s.label, subtitle: s.subtitle }
    }
  }
  const label = sectionId
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
  return { label, subtitle: "" }
}

export default function TeamSectionSubPage({
  params,
}: {
  params: Promise<{ key: string; section: string }>
}) {
  const { key, section } = use(params)
  const teamKey = key.toUpperCase()
  const [team, setTeam] = useState<TeamRef | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then((list: TeamRef[]) => {
        if (cancelled) return
        setTeam(list.find((t) => t.key.toUpperCase() === teamKey) ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [teamKey])

  const copy = sectionCopy(section)
  useEffect(() => {
    document.title = `${copy.label}${team ? ` · ${team.name}` : ""}`
  }, [copy.label, team])

  return (
    <div className="flex max-w-3xl flex-col gap-6 p-6">
      <Link
        href={`/settings/teams/${teamKey}`}
        scroll={false}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        <span className="flex size-4 items-center justify-center rounded-sm border border-pink-500/60 text-pink-500">
          <HugeiconsIcon icon={UserIcon} className="size-3" />
        </span>
        {team?.name ?? teamKey}
      </Link>

      {section === "general" ? (
        <GeneralSection team={team} />
      ) : section === "members" ? (
        <MembersSection team={team} />
      ) : section === "notifications" ? (
        <NotificationsSection />
      ) : (
        <PlaceholderSection label={copy.label} subtitle={copy.subtitle} team={team} />
      )}
    </div>
  )
}

function GeneralSection({ team }: { team: TeamRef | null }) {
  const [name, setName] = useState(team?.name ?? "")
  const [identifier, setIdentifier] = useState(team?.key ?? "")
  const [timezone, setTimezone] = useState("Asia/Kolkata")
  const [estimation, setEstimation] = useState("none")
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [historyEnabled, setHistoryEnabled] = useState(false)

  useEffect(() => {
    if (team) {
      setName(team.name)
      setIdentifier(team.key)
    }
  }, [team])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">General</h1>

      <div className="divide-border bg-card divide-y rounded-lg border">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="text-sm font-medium">Icon &amp; Name</div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md border border-pink-500/60 text-pink-500">
              <HugeiconsIcon icon={UserIcon} className="size-4" />
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 w-44 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <div className="text-sm font-medium">Identifier</div>
            <div className="text-muted-foreground text-xs">Used in issue IDs</div>
          </div>
          <Input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
            className="h-8 w-44 text-sm"
          />
        </div>
      </div>

      <Section
        title="Timezone"
        description="The timezone should be set as the location where most of your team members reside. All other times referenced by the team will be relative to this timezone setting. For example, if the team uses cycles, each cycle will start at midnight in the specified timezone."
      >
        <div className="bg-card flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="text-sm font-medium">Timezone</div>
          <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
            <SelectTrigger className="h-8 w-72 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">
                GMT+5:30 – India Standard Time - Kolkata
              </SelectItem>
              <SelectItem value="America/Los_Angeles">
                GMT-7:00 – Pacific Time - Los Angeles
              </SelectItem>
              <SelectItem value="America/New_York">
                GMT-4:00 – Eastern Time - New York
              </SelectItem>
              <SelectItem value="Europe/London">
                GMT+1:00 – British Summer Time - London
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section
        title="Estimates"
        description="Estimates are a great way of communicating the complexity of each issue or to calculate whether a cycle has more room left. Below you can choose how your team estimates issue complexity."
      >
        <div className="bg-card flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="text-sm font-medium">Issue estimation</div>
          <Select value={estimation} onValueChange={(v) => v && setEstimation(v)}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not in use</SelectItem>
              <SelectItem value="exponential">Exponential (1, 2, 4, 8, 16)</SelectItem>
              <SelectItem value="fibonacci">Fibonacci (1, 2, 3, 5, 8)</SelectItem>
              <SelectItem value="linear">Linear (1, 2, 3, 4, 5)</SelectItem>
              <SelectItem value="tshirt">T-shirt (XS, S, M, L, XL)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section
        title="Create issues by email"
        description="Use a team-specific email address to create and collaborate on issues via email"
      >
        <div className="bg-card flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="text-sm">Enable issue creation by email</div>
          <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
        </div>
      </Section>

      <Section title="Other">
        <div className="bg-card flex items-start justify-between gap-4 rounded-lg border px-4 py-3">
          <div>
            <div className="text-sm font-medium">Enable detailed issue history</div>
            <div className="text-muted-foreground mt-1 text-xs leading-5">
              Each change to an issue receives and persists a distinct history entry, creating a more detailed history for auditing purposes.
            </div>
          </div>
          <Switch checked={historyEnabled} onCheckedChange={setHistoryEnabled} />
        </div>
      </Section>
    </div>
  )
}

type MemberRow = {
  id: string
  name: string
  email: string
  username: string | null
  role: "admin" | "admin-invited" | "member" | "guest"
}

function MembersSection({ team }: { team: TeamRef | null }) {
  const [filter, setFilter] = useState("")
  const [scope, setScope] = useState("all")

  // Mock the two rows from the screenshot — the user's own account plus
  // one pending invite. The real backend would source these from the
  // team membership join table.
  const rows: MemberRow[] = useMemo(
    () => [
      {
        id: "invite-hvkvkvk",
        name: "hvkvkvk@234234gmail.com",
        email: "hvkvkvk@234234gmail.com",
        username: null,
        role: "admin-invited",
      },
      {
        id: "user-theta",
        name: "Theta Computer",
        email: "theta.computer01@gmail.com",
        username: "theta.computer01",
        role: "admin",
      },
    ],
    []
  )

  const filtered = rows.filter((r) => {
    const q = filter.trim().toLowerCase()
    if (!q) return true
    return (
      r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Team members</h1>

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
            aria-label="Search team members"
            className="placeholder:text-muted-foreground/60 focus:ring-ring h-8 w-full rounded-md border bg-transparent pr-3 pl-8 text-sm outline-none focus:ring-2"
          />
        </div>
        <Select value={scope} onValueChange={(v) => v && setScope(v)}>
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="members">Members</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button
            size="sm"
            className="h-8 bg-violet-600 px-4 text-xs text-white hover:bg-violet-700"
          >
            Add a member
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="text-muted-foreground grid grid-cols-[2fr_2fr_180px_32px] border-b px-4 py-2 text-xs font-medium">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div />
        </div>
        {filtered.length === 0 ? (
          <div className="text-muted-foreground px-4 py-10 text-center text-sm">
            No members match your filter.
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="hover:bg-accent/30 grid grid-cols-[2fr_2fr_180px_32px] items-center border-b px-4 py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {m.role === "admin-invited" ? (
                  <div className="bg-muted/30 flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed">
                    <span className="text-muted-foreground text-[10px] font-medium">
                      {initials(m.name)}
                    </span>
                  </div>
                ) : (
                  <Avatar className="size-7 shrink-0">
                    <AvatarFallback className="bg-violet-500 text-[10px] text-white">
                      {initials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{m.name}</div>
                  {m.username && (
                    <div className="text-muted-foreground truncate text-xs">
                      {m.username}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-muted-foreground truncate text-sm">
                {m.email}
              </div>
              <div>
                <span className="rounded-md bg-indigo-500/15 px-2 py-1 text-[11px] font-medium text-indigo-300">
                  {m.role === "admin"
                    ? "Workspace admin"
                    : m.role === "admin-invited"
                      ? "Workspace admin (Invited)"
                      : m.role === "guest"
                        ? "Guest"
                        : "Member"}
                </span>
              </div>
              <div className="text-muted-foreground text-right text-xs">
                {m.role === "admin" ? "···" : ""}
              </div>
            </div>
          ))
        )}
      </div>
      {team && (
        <div className="text-muted-foreground text-xs">
          Members of <span className="text-foreground">{team.name}</span>
        </div>
      )}
    </div>
  )
}

const SLACK_NOTIFICATIONS = [
  { key: "project-update", label: "New project update is posted" },
  { key: "issue-added", label: "An issue is added to the team" },
  { key: "issue-closed", label: "An issue is marked completed or canceled" },
  { key: "issue-status", label: "An issue changes status" },
  { key: "comments", label: "Comments to issues" },
  { key: "triage-added", label: "An issue is added to the triage queue" },
] as const

function NotificationsSection() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const setKey = (key: string) => (v: boolean) =>
    setEnabled((prev) => ({ ...prev, [key]: v }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Slack notifications</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect a Slack channel to receive notifications about this team
        </p>
      </div>

      <div className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <div className="text-sm font-medium">Connect a Slack channel</div>
          <div className="text-muted-foreground text-xs">
            Connect a channel to broadcast notifications from this team
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
          Connect
          <span aria-hidden="true">↗</span>
        </Button>
      </div>

      <section>
        <h2 className="text-muted-foreground mb-2 text-xs font-semibold">
          Notifications
        </h2>
        <div className="divide-border bg-card divide-y overflow-hidden rounded-lg border">
          {SLACK_NOTIFICATIONS.map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="text-sm">{n.label}</div>
              <Switch
                checked={!!enabled[n.key]}
                onCheckedChange={setKey(n.key)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function PlaceholderSection({
  label,
  subtitle,
  team,
}: {
  label: string
  subtitle: string
  team: TeamRef | null
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{label}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        )}
      </div>
      <div className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Coming soon</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          This is a placeholder for the <span className="font-medium">{label}</span>{" "}
          section of the {team?.name ?? ""} team. The production page would host
          the detailed configuration UI for this area.
        </p>
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function initials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
