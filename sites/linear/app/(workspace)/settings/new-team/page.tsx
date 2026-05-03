"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowDown01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import {
  COPY_FROM_NONE_VALUE,
  DEFAULT_TEAM_ICON,
  DEFAULT_TIMEZONE_ID,
  NEW_TEAM_COPY,
  TEAM_ICON_COLORS,
  TEAM_ICON_EMOJIS,
  buildTimezoneOption,
  buildTimezoneOptions,
  findTeamIconColor,
  findTimezoneOption,
  validateNewTeamForm,
  type TimezoneOption,
} from "@/lib/new-team"

type TeamRef = { id: string; name: string; key: string }

export default function NewTeamPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<TeamRef[]>([])
  const [name, setName] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [identifierTouched, setIdentifierTouched] = useState(false)
  const [nameTouched, setNameTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [copyFrom, setCopyFrom] = useState<string>(COPY_FROM_NONE_VALUE)
  const [timezoneId, setTimezoneId] = useState<string>(DEFAULT_TIMEZONE_ID)
  const [iconColor, setIconColor] = useState<string>(DEFAULT_TEAM_ICON.colorId)
  const [iconEmoji, setIconEmoji] = useState<string>(DEFAULT_TEAM_ICON.emoji)
  const [makePrivate] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then(setTeams)
      .catch(() => {})
  }, [])

  const usedKeys = useMemo(
    () => new Set(teams.map((t) => t.key.toUpperCase())),
    [teams]
  )

  const handleNameChange = (v: string) => {
    setName(v)
    if (!identifierTouched) {
      const base = v
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 3)
      // Auto-generation defaulted to a 3-char prefix and silently
      // collided with existing keys (e.g. "QA Test Team" → "QAT" when
      // a QAT team already exists). Suffix with the next free integer
      // so the generated key is usable on the first try; users can
      // still overwrite it manually if they want a different scheme.
      let candidate = base
      if (base.length >= 2 && usedKeys.has(candidate)) {
        for (let i = 2; i < 1000; i++) {
          const next = (base + String(i)).slice(0, 6)
          if (!usedKeys.has(next)) {
            candidate = next
            break
          }
        }
      }
      setIdentifier(candidate)
    }
  }

  const errors = useMemo(
    () => validateNewTeamForm({ name, identifier, usedKeys }),
    [name, identifier, usedKeys]
  )
  const canSubmit = !submitting && Object.keys(errors).length === 0
  const showNameError = errors.name && (nameTouched || submitAttempted)
  // Surface identifier errors as soon as the user has typed something —
  // including via the auto-populated identifier from name input.
  // Previously the error was hidden until the user hand-edited the
  // identifier field or clicked submit, leaving the Create button
  // mysteriously disabled when auto-gen collided with an existing key.
  const showIdentifierError =
    errors.identifier &&
    (identifierTouched || nameTouched || submitAttempted || name.length > 0) &&
    identifier.length > 0

  const onSubmit = async () => {
    setSubmitAttempted(true)
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), key: identifier }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to create team")
      }
      const team = (await res.json()) as TeamRef
      toast.success(`Created ${team.name}`)
      router.push(`/settings/teams/${team.key}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create team")
      setSubmitting(false)
    }
  }

  const timezoneOptions = useMemo(() => buildTimezoneOptions(), [])
  const activeTimezone =
    findTimezoneOption(timezoneOptions, timezoneId) ??
    buildTimezoneOption(timezoneId)
  const activeIconColor = findTeamIconColor(iconColor)

  return (
    <div className="flex max-w-2xl flex-col gap-8 p-6">
      <Link
        href="/settings?section=teams"
        scroll={false}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Back
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Create a new team</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create a new team to manage separate cycles, workflows and
          notifications.
        </p>
      </div>

      {/* Identity card */}
      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">Team icon</span>
          <TeamIconPicker
            iconColor={iconColor}
            iconEmoji={iconEmoji}
            onPickColor={setIconColor}
            onPickEmoji={setIconEmoji}
            activeColorBg={activeIconColor.bg}
          />
        </div>
        <div className="flex items-start justify-between gap-4 border-b px-4 py-3">
          <label htmlFor="team-name" className="text-sm font-medium">
            Team name
          </label>
          <div className="flex w-64 flex-col items-stretch gap-1">
            <Input
              id="team-name"
              placeholder="e.g. Engineering"
              value={name}
              autoComplete="off"
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => setNameTouched(true)}
              aria-invalid={showNameError ? true : undefined}
              aria-describedby={showNameError ? "team-name-error" : undefined}
              className="h-8 text-sm"
            />
            {showNameError && (
              <p
                id="team-name-error"
                role="alert"
                className="text-destructive text-xs"
              >
                {errors.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 px-4 py-3">
          <div>
            <div className="text-sm font-medium">Identifier</div>
            <div className="text-muted-foreground text-xs">
              {NEW_TEAM_COPY.identifierHelp}
            </div>
          </div>
          <div className="flex w-32 flex-col items-stretch gap-1">
            <Input
              id="team-identifier"
              placeholder="e.g. ENG"
              value={identifier}
              aria-invalid={showIdentifierError ? true : undefined}
              aria-describedby={
                showIdentifierError ? "team-identifier-error" : undefined
              }
              onChange={(e) => {
                setIdentifierTouched(true)
                setIdentifier(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 6)
                )
              }}
              className="h-8 font-mono text-sm"
            />
            {showIdentifierError && (
              <p
                id="team-identifier-error"
                role="alert"
                className="text-destructive text-xs"
              >
                {errors.identifier}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Team hierarchy */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Team hierarchy</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {NEW_TEAM_COPY.teamHierarchyDescription}{" "}
            <a
              href={NEW_TEAM_COPY.teamHierarchyDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Team hierarchy documentation (opens in new tab)"
              className="text-foreground font-medium underline-offset-2 hover:underline"
            >
              Docs <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
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
            {NEW_TEAM_COPY.copyFromDescription}
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Copy from team</span>
            <CopyFromTeamPicker
              value={copyFrom}
              onChange={setCopyFrom}
              teams={teams}
            />
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Timezone</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {NEW_TEAM_COPY.timezoneDescription}
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Timezone</span>
            <TimezonePicker
              value={timezoneId}
              options={timezoneOptions}
              activeLabel={activeTimezone.label}
              onChange={setTimezoneId}
            />
          </div>
        </div>
      </div>

      {/* Make team private */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">Make team private</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {NEW_TEAM_COPY.makeTeamPrivateDescription}
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Private team</div>
              <div className="text-muted-foreground text-xs">
                Restrict visibility to team members and admins only.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              aria-disabled
              className="h-7 cursor-default text-xs opacity-50"
            >
              Available on Business
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {submitAttempted && Object.keys(errors).length > 0 && (
          <span role="alert" className="text-destructive mr-auto text-xs">
            Please fix the highlighted fields.
          </span>
        )}
        <Button onClick={onSubmit} disabled={!canSubmit}>
          {submitting ? "Creating…" : "Create team"}
        </Button>
      </div>

      {/* makePrivate is read-only on the free tier — parity with Linear. */}
      <span className="sr-only">Private team: {String(makePrivate)}</span>
    </div>
  )
}

function TeamIconPicker({
  iconColor,
  iconEmoji,
  activeColorBg,
  onPickColor,
  onPickEmoji,
}: {
  iconColor: string
  iconEmoji: string
  activeColorBg: string
  onPickColor: (id: string) => void
  onPickEmoji: (emoji: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Choose team icon"
            aria-haspopup="dialog"
            aria-expanded={open}
            className={`focus-visible:ring-ring flex size-9 items-center justify-center rounded-md border text-base text-white transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none ${activeColorBg}`}
          >
            <span aria-hidden="true">{iconEmoji}</span>
          </button>
        }
      />
      <PopoverContent
        align="end"
        role="dialog"
        aria-label="Team icon picker"
        className="w-64 p-3"
      >
        <div className="flex flex-col gap-3">
          <div className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
            Color
          </div>
          <div className="grid grid-cols-9 gap-1.5">
            {TEAM_ICON_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onPickColor(c.id)}
                aria-pressed={iconColor === c.id}
                aria-label={`${c.label} background`}
                className={`focus-visible:ring-ring size-5 rounded-full transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:outline-none ${c.bg} ${
                  iconColor === c.id
                    ? "ring-foreground/60 ring-offset-background ring-2 ring-offset-2"
                    : ""
                }`}
              />
            ))}
          </div>
          <div className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
            Icon
          </div>
          <div className="grid grid-cols-5 gap-1">
            {TEAM_ICON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onPickEmoji(emoji)}
                aria-pressed={iconEmoji === emoji}
                aria-label={`Emoji ${emoji}`}
                className={`focus-visible:ring-ring hover:bg-accent/60 flex size-8 items-center justify-center rounded-md text-lg focus-visible:ring-2 focus-visible:outline-none ${
                  iconEmoji === emoji ? "bg-accent" : ""
                }`}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function CopyFromTeamPicker({
  value,
  onChange,
  teams,
}: {
  value: string
  onChange: (v: string) => void
  teams: TeamRef[]
}) {
  const [open, setOpen] = useState(false)
  // The trigger always shows the full label — never the raw "none" id.
  const activeLabel =
    value === COPY_FROM_NONE_VALUE
      ? NEW_TEAM_COPY.copyFromNoneLabel
      : (teams.find((t) => t.key === value)?.name ??
        NEW_TEAM_COPY.copyFromNoneLabel)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Copy settings from team: ${activeLabel}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="border-muted hover:bg-accent/40 focus-visible:ring-ring flex h-8 w-40 items-center justify-between gap-1.5 rounded-full border px-3 text-xs focus-visible:ring-2 focus-visible:outline-none"
          />
        }
      >
        <span className="truncate">{activeLabel}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1" role="listbox">
        <button
          type="button"
          role="option"
          aria-selected={value === COPY_FROM_NONE_VALUE}
          onClick={() => {
            onChange(COPY_FROM_NONE_VALUE)
            setOpen(false)
          }}
          className="hover:bg-accent flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs"
        >
          {NEW_TEAM_COPY.copyFromNoneLabel}
        </button>
        {teams.length > 0 && (
          <div className="bg-border my-1 h-px" aria-hidden="true" />
        )}
        {teams.map((t) => (
          <button
            key={t.id}
            type="button"
            role="option"
            aria-selected={value === t.key}
            onClick={() => {
              onChange(t.key)
              setOpen(false)
            }}
            className="hover:bg-accent flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs"
          >
            <span className="truncate">{t.name}</span>
            <span className="text-muted-foreground font-mono text-[10px]">
              {t.key}
            </span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function TimezonePicker({
  value,
  options,
  activeLabel,
  onChange,
}: {
  value: string
  options: TimezoneOption[]
  activeLabel: string
  onChange: (id: string) => void
}) {
  const [open, setOpenRaw] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const setOpen = useCallback((next: boolean) => {
    setOpenRaw(next)
    if (next) setQuery("")
  }, [])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 10)
    return () => window.clearTimeout(t)
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.search.includes(q))
  }, [options, query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label={`Timezone: ${activeLabel}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="border-muted hover:bg-accent/40 focus-visible:ring-ring flex h-8 w-72 items-center justify-between gap-1.5 rounded-full border px-3 text-xs focus-visible:ring-2 focus-visible:outline-none"
          />
        }
      >
        <span className="truncate">{activeLabel}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" role="listbox">
        <div className="relative border-b">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search timezone…"
            aria-label="Search timezones"
            className="placeholder:text-muted-foreground/60 h-9 w-full bg-transparent px-3 pr-8 text-xs outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
            </button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="text-muted-foreground px-2 py-6 text-center text-xs">
              No timezones match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={value === o.id}
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                }}
                className={`hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs ${
                  value === o.id ? "bg-accent/60 font-medium" : ""
                }`}
              >
                <span className="truncate">{o.label}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
