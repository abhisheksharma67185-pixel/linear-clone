"use client"

import { useEffect, useState } from "react"
import type { Member } from "@/app/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  ArrowExpandDiagonal01Icon,
  Satellite01Icon,
  UserIcon,
  UserMultiple02Icon,
  Calendar01Icon,
  CalendarBlock01Icon,
  HelpCircleIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Attachment01Icon,
} from "@hugeicons/core-free-icons"

export type InitiativeHealth =
  | "on_track"
  | "at_risk"
  | "off_track"
  | "no_update"

export interface NewInitiative {
  id: string
  name: string
  summary: string
  ownerId: string | null
  targetDate: string | null
  totalProjects: number
  completedProjects: number
  activeProjects: number
  health: InitiativeHealth
}

export const HEALTH_OPTIONS: {
  value: InitiativeHealth
  label: string
  dot: string
}[] = [
  {
    value: "no_update",
    label: "No update",
    dot: "border-dashed border-muted-foreground/60",
  },
  { value: "on_track", label: "On track", dot: "bg-emerald-500" },
  { value: "at_risk", label: "At risk", dot: "bg-amber-500" },
  { value: "off_track", label: "Off track", dot: "bg-rose-500" },
]

export function CreateInitiativeDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (init: NewInitiative) => void
}) {
  const [members, setMembers] = useState<Member[]>([])
  const [loaded, setLoaded] = useState(false)

  const [name, setName] = useState("")
  const [summary, setSummary] = useState("")
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [targetDate, setTargetDate] = useState<string | null>(null)
  const [health, setHealth] = useState<InitiativeHealth>("no_update")
  const [fullscreen, setFullscreen] = useState(false)
  const [createMore, setCreateMore] = useState(false)

  useEffect(() => {
    if (open && !loaded) {
      fetch("/api/data/members")
        .then((r) => r.json())
        .then((m: Member[]) => {
          setMembers(m)
          setLoaded(true)
        })
        .catch(() => setLoaded(true))
    }
  }, [open, loaded])

  const owner = members.find((m) => m.id === ownerId) ?? null
  const healthMeta =
    HEALTH_OPTIONS.find((h) => h.value === health) ?? HEALTH_OPTIONS[0]

  const resetForm = () => {
    setName("")
    setSummary("")
    setOwnerId(null)
    setTargetDate(null)
    setHealth("no_update")
  }

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
      health,
    })
    resetForm()
    if (!createMore) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={
          fullscreen
            ? "flex h-[95vh] w-[95vw] max-w-none flex-col gap-0 overflow-hidden p-0"
            : "flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[620px]"
        }
      >
        <header className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-1 rounded-md border px-1.5 py-0.5">
              <HugeiconsIcon
                icon={Satellite01Icon}
                className="size-3 text-orange-500"
              />
              <span className="font-medium">Initiative</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-6"
              onClick={() => setFullscreen((v) => !v)}
              aria-label="Toggle fullscreen"
            >
              <HugeiconsIcon
                icon={ArrowExpandDiagonal01Icon}
                className="size-3.5"
              />
            </Button>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground size-6"
                />
              }
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
            </DialogClose>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-1 px-4 pt-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Initiative name"
            className="placeholder:text-muted-foreground/50 w-full bg-transparent text-lg font-semibold focus:outline-none"
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Add a short summary..."
            className={`placeholder:text-muted-foreground/50 w-full flex-1 resize-none bg-transparent text-sm focus:outline-none ${
              fullscreen ? "min-h-[300px]" : "min-h-[48px]"
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger render={<PillButton />}>
              {owner ? (
                <Avatar src={owner.avatar} name={owner.name} />
              ) : (
                <div className="border-muted-foreground/60 flex size-4 items-center justify-center rounded-full border border-dashed">
                  <HugeiconsIcon
                    icon={UserIcon}
                    className="text-muted-foreground size-2.5"
                  />
                </div>
              )}
              <span>{owner ? owner.name : "Owner"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-80 w-64 overflow-auto"
            >
              <MenuHeader title="Set owner..." shortcut="N then O" />
              <MenuRow
                icon={
                  <div className="border-muted-foreground/60 flex size-4 items-center justify-center rounded-full border border-dashed">
                    <HugeiconsIcon
                      icon={UserIcon}
                      className="text-muted-foreground size-2.5"
                    />
                  </div>
                }
                checked={ownerId === null}
                onClick={() => setOwnerId(null)}
              >
                No owner
              </MenuRow>
              <MenuSection label="Workspace members" />
              {members.map((m) => (
                <MenuRow
                  key={m.id}
                  icon={<Avatar src={m.avatar} name={m.name} />}
                  checked={m.id === ownerId}
                  onClick={() => setOwnerId(m.id)}
                >
                  {m.email}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger render={<PillButton />}>
              <HugeiconsIcon
                icon={targetDate ? CalendarBlock01Icon : Calendar01Icon}
                className={`size-3.5 ${targetDate ? "text-rose-500" : "text-muted-foreground"}`}
              />
              <span>
                {targetDate ? formatTargetDate(targetDate) : "Target date"}
              </span>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[320px] p-3">
              <div className="mb-2 text-xs font-medium">Target date</div>
              <div className="border-t pt-2">
                <Calendar
                  mode="single"
                  selected={targetDate ? new Date(targetDate) : undefined}
                  onSelect={(d) => {
                    if (d) setTargetDate(d.toISOString())
                  }}
                  className="p-0"
                />
              </div>
              {targetDate && (
                <button
                  type="button"
                  onClick={() => setTargetDate(null)}
                  className="text-muted-foreground hover:bg-muted/50 mt-2 w-full rounded-md border px-2 py-1 text-xs"
                >
                  Clear target date
                </button>
              )}
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger render={<PillButton />}>
              <HealthDot className={healthMeta.dot} />
              <span>{healthMeta.label}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <MenuHeader title="Set health..." />
              {HEALTH_OPTIONS.map((h) => (
                <MenuRow
                  key={h.value}
                  icon={<HealthDot className={h.dot} />}
                  checked={h.value === health}
                  onClick={() => setHealth(h.value)}
                >
                  {h.label}
                </MenuRow>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <PillButton disabled>
            <HugeiconsIcon
              icon={UserMultiple02Icon}
              className="text-muted-foreground size-3.5"
            />
            <span>Teams</span>
          </PillButton>
        </div>

        <footer className="flex items-center justify-between border-t px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7"
            aria-label="Attach file"
          >
            <HugeiconsIcon icon={Attachment01Icon} className="size-4" />
          </Button>
          <div className="flex items-center gap-3">
            <label className="text-muted-foreground flex items-center gap-2 text-xs">
              <Switch
                checked={createMore}
                onCheckedChange={setCreateMore}
                className="scale-75"
              />
              <span>Create more</span>
            </label>
            <Button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="h-7 rounded-md bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700 disabled:bg-violet-600/50"
            >
              Create initiative
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  )
}

function PillButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`text-foreground hover:bg-muted/60 flex h-6 items-center gap-1 rounded-md border px-1.5 text-xs disabled:opacity-60 ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  )
}

function MenuHeader({ title, shortcut }: { title: string; shortcut?: string }) {
  return (
    <div className="text-muted-foreground flex items-center justify-between px-2 py-1.5 text-xs">
      <span>{title}</span>
      {shortcut && (
        <span className="rounded border px-1 font-mono text-[10px]">
          {shortcut}
        </span>
      )}
    </div>
  )
}

function MenuSection({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground mt-1 px-2 py-1 text-[10px] font-medium tracking-wide uppercase">
      {label}
    </div>
  )
}

function MenuRow({
  icon,
  children,
  checked,
  onClick,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
  checked?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs"
    >
      {icon && (
        <span className="flex size-4 shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {checked && <span className="text-[10px]">✓</span>}
    </button>
  )
}

function HealthDot({ className }: { className: string }) {
  return <span className={`size-2.5 rounded-full border ${className}`} />
}

function Avatar({ src, name }: { src: string; name: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} className="size-4 rounded-full" />
}

function formatTargetDate(iso: string): string {
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
