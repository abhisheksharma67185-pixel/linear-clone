"use client"

import { useEffect, useMemo, useState } from "react"
import type { Member } from "@/app/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  FilterIcon,
  Settings02Icon,
  Satellite01Icon,
  UserMultiple02Icon,
  CalendarBlock01Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  UserIcon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons"
import {
  CreateInitiativeDialog,
  HEALTH_OPTIONS,
  type InitiativeHealth,
  type NewInitiative,
} from "@/components/create-initiative-dialog"

type Initiative = NewInitiative

const INITIAL_INITIATIVES: Initiative[] = [
  {
    id: "init-1",
    name: "Launch desktop app",
    summary: "",
    ownerId: null,
    targetDate: "2025-10-31",
    totalProjects: 0,
    completedProjects: 0,
    activeProjects: 0,
    health: "no_update",
  },
  {
    id: "init-2",
    name: "AGI-App v0 Rollout",
    summary: "",
    ownerId: "usr-11",
    targetDate: "2025-07-31",
    totalProjects: 10,
    completedProjects: 0,
    activeProjects: 4,
    health: "no_update",
  },
]

const DISPLAY_PROPERTIES = [
  { key: "description", label: "Description", default: true },
  { key: "owner", label: "Owner", default: true },
  { key: "start_date", label: "Start date", default: false },
  { key: "target_date", label: "Target date", default: true },
  { key: "completed", label: "Completed", default: false },
  { key: "updated", label: "Updated", default: false },
  { key: "created", label: "Created", default: false },
  { key: "teams", label: "Teams", default: false },
  { key: "health", label: "Initiative Health", default: true },
  { key: "projects", label: "Projects", default: false },
  { key: "active_projects", label: "Active Projects", default: false },
]

export default function InitiativesPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [initiatives, setInitiatives] =
    useState<Initiative[]>(INITIAL_INITIATIVES)
  const [creating, setCreating] = useState(false)
  const [activeProps, setActiveProps] = useState<Set<string>>(
    () => new Set(DISPLAY_PROPERTIES.filter((p) => p.default).map((p) => p.key))
  )

  useEffect(() => {
    fetch("/api/data/members")
      .then((r) => r.json())
      .then(setMembers)
      .catch(() => setMembers([]))
  }, [])

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <h1 className="text-sm font-medium">Initiatives</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7"
            onClick={() => setCreating(true)}
            aria-label="New initiative"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
          </Button>
        </header>

        <Tabs
          defaultValue="active"
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="flex items-center justify-between px-4 pr-6">
            <TabsList className="h-10 gap-1 bg-transparent p-0">
              <TabPill value="active">Active</TabPill>
              <TabPill value="planned">Planned</TabPill>
              <TabPill value="completed">Completed</TabPill>
            </TabsList>

            <div className="text-muted-foreground flex items-center gap-0.5">
              <FilterDropdown />
              <ViewOptions
                activeProps={activeProps}
                setActiveProps={setActiveProps}
              />
            </div>
          </div>

          <TabsContent value="active" className="m-0 flex-1 overflow-auto">
            <InitiativeTable
              initiatives={initiatives}
              members={members}
              activeProps={activeProps}
              onNew={() => setCreating(true)}
            />
          </TabsContent>

          <TabsContent value="planned" className="m-0 flex-1 overflow-auto">
            <EmptyTab label="No planned initiatives" />
          </TabsContent>
          <TabsContent value="completed" className="m-0 flex-1 overflow-auto">
            <EmptyTab label="No completed initiatives" />
          </TabsContent>
        </Tabs>
      </div>

      <CreateInitiativeDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={(i) => setInitiatives((prev) => [i, ...prev])}
      />
    </>
  )
}

function TabPill({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return (
    <TabsTrigger
      value={value}
      className="text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground rounded-full border-0 bg-transparent px-3 py-1 text-xs font-medium shadow-none data-[state=active]:shadow-none"
    >
      {children}
    </TabsTrigger>
  )
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center py-24 text-xs">
      {label}
    </div>
  )
}

// ---------- Table ----------

function InitiativeTable({
  initiatives,
  members,
  activeProps,
  onNew,
}: {
  initiatives: Initiative[]
  members: Member[]
  activeProps: Set<string>
  onNew: () => void
}) {
  const showOwner = activeProps.has("owner")
  const showTarget = activeProps.has("target_date")
  const showProjects = activeProps.has("projects") || true
  const showHealth = activeProps.has("health")
  const showActive = activeProps.has("active_projects")

  if (initiatives.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 py-24 text-sm">
        <div className="flex size-10 items-center justify-center rounded-md bg-orange-100 text-orange-500">
          <HugeiconsIcon icon={Satellite01Icon} className="size-5" />
        </div>
        <p>No initiatives yet.</p>
        <Button
          onClick={onNew}
          className="h-7 rounded-md bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700"
        >
          New initiative
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="text-muted-foreground grid grid-cols-[1fr_160px_160px_120px_160px_120px] items-center gap-4 border-b px-6 py-2 text-[11px]">
        <span>Name</span>
        {showOwner && <span>Owner</span>}
        {showTarget && <span>Target</span>}
        {showProjects && <span>Projects</span>}
        {showHealth && <span>Initiative Health</span>}
        {showActive && <span>Active Projects</span>}
      </div>

      {initiatives.map((init) => (
        <InitiativeRow
          key={init.id}
          initiative={init}
          members={members}
          activeProps={activeProps}
        />
      ))}
    </div>
  )
}

function InitiativeRow({
  initiative,
  members,
  activeProps,
}: {
  initiative: Initiative
  members: Member[]
  activeProps: Set<string>
}) {
  const owner = members.find((m) => m.id === initiative.ownerId) ?? null
  return (
    <div className="hover:bg-accent/40 grid grid-cols-[1fr_160px_160px_120px_160px_120px] items-center gap-4 border-b px-6 py-2.5 text-sm">
      <div className="flex items-center gap-3">
        <InitiativeGlyph />
        <span className="truncate">{initiative.name}</span>
      </div>

      {activeProps.has("owner") && (
        <div className="flex items-center gap-2 text-xs">
          {owner ? (
            <>
              <MemberAvatar member={owner} />
              <span className="truncate">{owner.name}</span>
            </>
          ) : (
            <>
              <div className="bg-muted text-muted-foreground flex size-5 items-center justify-center rounded-full">
                <HugeiconsIcon icon={UserIcon} className="size-3" />
              </div>
              <span className="text-muted-foreground">Unassigned</span>
            </>
          )}
        </div>
      )}

      {activeProps.has("target_date") && (
        <div className="flex items-center gap-2 text-xs">
          <HugeiconsIcon
            icon={CalendarBlock01Icon}
            className="size-4 text-rose-500"
          />
          <span>{formatTargetDate(initiative.targetDate)}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className="size-4 text-indigo-500"
        />
        <span>
          {initiative.totalProjects === 0
            ? "0"
            : `${initiative.completedProjects} / ${initiative.totalProjects}`}
        </span>
      </div>

      {activeProps.has("health") && <HealthCell health={initiative.health} />}

      {activeProps.has("active_projects") && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>{initiative.activeProjects}</span>
        </div>
      )}
    </div>
  )
}

function InitiativeGlyph() {
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-500">
      <HugeiconsIcon icon={Satellite01Icon} className="size-4" />
    </div>
  )
}

function HealthCell({ health }: { health: InitiativeHealth }) {
  const meta =
    HEALTH_OPTIONS.find((h) => h.value === health) ?? HEALTH_OPTIONS[0]
  const isNoUpdate = health === "no_update"
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`size-2.5 rounded-full border ${meta.dot}`} />
      <span className={isNoUpdate ? "text-muted-foreground" : ""}>
        {meta.label}
      </span>
    </div>
  )
}

function MemberAvatar({ member }: { member: Member }) {
  // Mock avatars are remote SVGs from api.dicebear.com — adding the host to
  // next.config images.remotePatterns is a separate concern; plain <img>
  // keeps the visual identical without coupling lint cleanup to next config.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={member.avatar}
      alt={member.name}
      className="size-5 rounded-full"
    />
  )
}

function formatTargetDate(iso: string | null) {
  if (!iso) return "No date"
  const d = new Date(iso)
  const month = d.toLocaleDateString("en-US", { month: "short" })
  const day = d.getDate()
  const year = d.getFullYear()
  const suffix = (n: number) =>
    n % 10 === 1 && n % 100 !== 11
      ? "st"
      : n % 10 === 2 && n % 100 !== 12
        ? "nd"
        : n % 10 === 3 && n % 100 !== 13
          ? "rd"
          : "th"
  return `${month} ${day}${suffix(day)}, ${year}`
}

// ---------- Filter & view-options dropdowns ----------

function FilterDropdown() {
  const items: {
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
    label: string
  }[] = [
    { icon: FilterIcon, label: "Advanced filter" },
    { icon: UserIcon, label: "Owner" },
    { icon: UserMultiple02Icon, label: "Creator" },
    { icon: UserMultiple02Icon, label: "Teams" },
    { icon: HelpCircleIcon, label: "Health" },
    { icon: Calendar01Icon, label: "Dates" },
  ]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="size-7" />}
      >
        <HugeiconsIcon icon={FilterIcon} className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-0">
        <div className="text-muted-foreground flex items-center justify-between border-b px-2 py-1.5 text-xs">
          <span>Add Filter...</span>
          <span className="rounded border px-1 font-mono text-[10px]">F</span>
        </div>
        <div className="p-1">
          {items.map((f) => (
            <button
              key={f.label}
              type="button"
              className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs"
            >
              <HugeiconsIcon
                icon={f.icon}
                className="text-muted-foreground size-3.5"
              />
              <span className="flex-1 text-left">{f.label}</span>
              {f.label !== "Advanced filter" && (
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="text-muted-foreground size-3"
                />
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ViewOptions({
  activeProps,
  setActiveProps,
}: {
  activeProps: Set<string>
  setActiveProps: (s: Set<string>) => void
}) {
  const [grouping, setGrouping] = useState("none")
  const [ordering, setOrdering] = useState("manual")

  const groupingOptions = useMemo(
    () => [
      { value: "none", label: "No grouping" },
      { value: "owner", label: "Owner" },
      { value: "health", label: "Health" },
    ],
    []
  )
  const orderingOptions = useMemo(
    () => [
      { value: "manual", label: "Manual" },
      { value: "target", label: "Target date" },
      { value: "created", label: "Created" },
    ],
    []
  )

  const toggleProp = (key: string) => {
    const next = new Set(activeProps)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setActiveProps(next)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon" className="size-7" />}
      >
        <HugeiconsIcon icon={Settings02Icon} className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <Row label="Grouping">
          <InlineSelect
            value={grouping}
            onChange={setGrouping}
            options={groupingOptions}
          />
        </Row>
        <Row label="Ordering">
          <InlineSelect
            value={ordering}
            onChange={setOrdering}
            options={orderingOptions}
          />
        </Row>
        <div className="my-3 border-t" />
        <div className="mb-2 text-xs font-medium">Display properties</div>
        <div className="flex flex-wrap gap-1.5">
          {DISPLAY_PROPERTIES.map((p) => {
            const active = activeProps.has(p.key)
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => toggleProp(p.key)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  active
                    ? "border-foreground/20 bg-muted text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span>{label}</span>
      {children}
    </div>
  )
}

function InlineSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-6 rounded-md border bg-transparent px-2 text-xs focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
