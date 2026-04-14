"use client"

import { useEffect, useMemo, useState } from "react"
import type { Member } from "@/app/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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

type Health = "on_track" | "at_risk" | "off_track" | "no_update"

type Initiative = {
  id: string
  name: string
  summary: string
  ownerId: string | null
  targetDate: string | null
  totalProjects: number
  completedProjects: number
  activeProjects: number
  health: Health
}

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
  const [initiatives, setInitiatives] = useState<Initiative[]>(INITIAL_INITIATIVES)
  const [creating, setCreating] = useState(false)
  const [activeProps, setActiveProps] = useState<Set<string>>(
    () => new Set(DISPLAY_PROPERTIES.filter((p) => p.default).map((p) => p.key)),
  )

  useEffect(() => {
    fetch("/api/data/members")
      .then((r) => r.json())
      .then(setMembers)
      .catch(() => setMembers([]))
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <h1 className="text-sm font-medium">Initiatives</h1>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          onClick={() => setCreating(true)}
          aria-label="New initiative"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
        </Button>
      </header>

      <Tabs defaultValue="active" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="flex items-center justify-between px-4 pr-6">
          <TabsList className="h-10 gap-1 bg-transparent p-0">
            <TabPill value="active">Active</TabPill>
            <TabPill value="planned">Planned</TabPill>
            <TabPill value="completed">Completed</TabPill>
          </TabsList>

          <div className="flex items-center gap-0.5 text-muted-foreground">
            <FilterDropdown />
            <ViewOptions activeProps={activeProps} setActiveProps={setActiveProps} />
          </div>
        </div>

        <TabsContent value="active" className="m-0 flex-1 overflow-auto">
          <InitiativeTable
            initiatives={initiatives}
            members={members}
            creating={creating}
            onCancelCreate={() => setCreating(false)}
            onCreate={(i) => {
              setInitiatives([i, ...initiatives])
              setCreating(false)
            }}
            activeProps={activeProps}
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
  )
}

function TabPill({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-full border-0 bg-transparent px-3 py-1 text-xs font-medium text-muted-foreground shadow-none data-[state=active]:bg-accent data-[state=active]:text-foreground data-[state=active]:shadow-none"
    >
      {children}
    </TabsTrigger>
  )
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center py-24 text-xs text-muted-foreground">
      {label}
    </div>
  )
}

// ---------- Table ----------

function InitiativeTable({
  initiatives,
  members,
  creating,
  onCreate,
  onCancelCreate,
  activeProps,
}: {
  initiatives: Initiative[]
  members: Member[]
  creating: boolean
  onCreate: (i: Initiative) => void
  onCancelCreate: () => void
  activeProps: Set<string>
}) {
  const showOwner = activeProps.has("owner")
  const showTarget = activeProps.has("target_date")
  const showProjects = activeProps.has("projects") || true
  const showHealth = activeProps.has("health")
  const showActive = activeProps.has("active_projects")

  return (
    <div>
      <div className="grid grid-cols-[1fr_160px_160px_120px_160px_120px] items-center gap-4 border-b px-6 py-2 text-[11px] text-muted-foreground">
        <span>Name</span>
        {showOwner && <span>Owner</span>}
        {showTarget && <span>Target</span>}
        {showProjects && <span>Projects</span>}
        {showHealth && <span>Initiative Health</span>}
        {showActive && <span>Active Projects</span>}
      </div>

      {creating && (
        <NewInitiativeRow members={members} onCreate={onCreate} onCancel={onCancelCreate} />
      )}

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
    <div className="grid grid-cols-[1fr_160px_160px_120px_160px_120px] items-center gap-4 border-b px-6 py-2.5 text-sm hover:bg-accent/40">
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
              <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <HugeiconsIcon icon={UserIcon} className="size-3" />
              </div>
              <span className="text-muted-foreground">Unassigned</span>
            </>
          )}
        </div>
      )}

      {activeProps.has("target_date") && (
        <div className="flex items-center gap-2 text-xs">
          <HugeiconsIcon icon={CalendarBlock01Icon} className="size-4 text-rose-500" />
          <span>{formatTargetDate(initiative.targetDate)}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-indigo-500" />
        <span>
          {initiative.totalProjects === 0
            ? "0"
            : `${initiative.completedProjects} / ${initiative.totalProjects}`}
        </span>
      </div>

      {activeProps.has("health") && (
        <div className="flex items-center gap-2 text-xs">
          <div className="size-4 rounded-full border border-dashed border-muted-foreground/60" />
          <span className="text-muted-foreground">No updates</span>
        </div>
      )}

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

function MemberAvatar({ member }: { member: Member }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={member.avatar} alt={member.name} className="size-5 rounded-full" />
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

// ---------- New initiative inline form ----------

function NewInitiativeRow({
  members,
  onCreate,
  onCancel,
}: {
  members: Member[]
  onCreate: (i: Initiative) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [summary, setSummary] = useState("")
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [targetDate, setTargetDate] = useState<string | null>(null)

  const owner = members.find((m) => m.id === ownerId) ?? null

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({
      id: `init-${Date.now()}`,
      name: name.trim(),
      summary: summary.trim(),
      ownerId,
      targetDate,
      totalProjects: 0,
      completedProjects: 0,
      activeProjects: 0,
      health: "no_update",
    })
  }

  return (
    <div className="flex gap-4 border-b px-6 py-3">
      <InitiativeGlyph />
      <div className="flex flex-1 flex-col gap-1">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New initiative"
          className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Add a short summary..."
          className="w-full bg-transparent text-xs placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TargetDatePicker value={targetDate} onChange={setTargetDate} />
            <OwnerPicker
              value={ownerId}
              onChange={setOwnerId}
              members={members}
              owner={owner}
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="h-7 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={handleCreate}
              className="h-7 rounded-md bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700 disabled:bg-violet-600/50"
            >
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Target date picker ----------

function TargetDatePicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (v: string | null) => void
}) {
  const [mode, setMode] = useState<"day" | "month" | "quarter" | "half" | "year">("day")
  const [input, setInput] = useState("")
  const selected = value ? new Date(value) : undefined

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-6 items-center gap-1 rounded-md border border-dashed px-2 text-xs text-muted-foreground hover:bg-muted/60"
          />
        }
      >
        <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" />
        <span>{value ? formatTargetDate(value) : "Target date"}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-3">
        <div className="mb-2 text-xs font-medium">Target date</div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try: May 2027, Q4, 20/05/2027"
          className="mb-3 h-8 w-full rounded-md border px-2 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <div className="mb-3 flex flex-wrap gap-1">
          {(["day", "month", "quarter", "half", "year"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                mode === m
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {m === "day"
                ? "Day"
                : m === "month"
                  ? "Month"
                  : m === "quarter"
                    ? "Quarter"
                    : m === "half"
                      ? "Half-year"
                      : "Year"}
            </button>
          ))}
        </div>
        <div className="border-t pt-2">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              if (d) onChange(d.toISOString())
            }}
            className="p-0"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ---------- Owner picker ----------

function OwnerPicker({
  value,
  onChange,
  members,
  owner,
}: {
  value: string | null
  onChange: (v: string | null) => void
  members: Member[]
  owner: Member | null
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex h-6 items-center gap-1 rounded-md border border-dashed px-2 text-xs text-muted-foreground hover:bg-muted/60"
          />
        }
      >
        {owner ? (
          <MemberAvatar member={owner} />
        ) : (
          <HugeiconsIcon icon={UserMultiple02Icon} className="size-3.5" />
        )}
        <span>{owner ? owner.name : "Owner"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-96 w-64 overflow-auto">
        <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
          <span>Set owner...</span>
          <span className="font-mono text-[10px]">
            <span className="rounded border px-1">N</span>{" "}
            <span>then</span> <span className="rounded border px-1">O</span>
          </span>
        </div>
        <MenuRow
          icon={
            <div className="flex size-4 items-center justify-center rounded-full border border-dashed border-muted-foreground/60">
              <HugeiconsIcon icon={UserIcon} className="size-2.5 text-muted-foreground" />
            </div>
          }
          checked={value === null}
          right={<span className="text-[10px] text-muted-foreground">0</span>}
          onClick={() => onChange(null)}
        >
          No owner
        </MenuRow>
        {members.map((m, i) => (
          <MenuRow
            key={m.id}
            icon={<MemberAvatar member={m} />}
            checked={m.id === value}
            right={
              i < 10 ? (
                <span className="text-[10px] text-muted-foreground">{i + 1}</span>
              ) : undefined
            }
            onClick={() => onChange(m.id)}
          >
            <span className="truncate">{m.email}</span>
          </MenuRow>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MenuRow({
  icon,
  children,
  checked,
  right,
  onClick,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
  checked?: boolean
  right?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs hover:bg-accent"
    >
      {icon && <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {checked && <span className="text-[10px]">✓</span>}
      {right}
    </button>
  )
}

// ---------- Filter & view-options dropdowns ----------

function FilterDropdown() {
  const items: { icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]; label: string }[] = [
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
        <div className="flex items-center justify-between border-b px-2 py-1.5 text-xs text-muted-foreground">
          <span>Add Filter...</span>
          <span className="rounded border px-1 font-mono text-[10px]">F</span>
        </div>
        <div className="p-1">
          {items.map((f) => (
            <button
              key={f.label}
              type="button"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
            >
              <HugeiconsIcon icon={f.icon} className="size-3.5 text-muted-foreground" />
              <span className="flex-1 text-left">{f.label}</span>
              {f.label !== "Advanced filter" && (
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-3 text-muted-foreground"
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
    [],
  )
  const orderingOptions = useMemo(
    () => [
      { value: "manual", label: "Manual" },
      { value: "target", label: "Target date" },
      { value: "created", label: "Created" },
    ],
    [],
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
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
