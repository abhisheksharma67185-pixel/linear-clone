// Shared configuration + helpers for the Create a new team page.

export type TimezoneOption = {
  /** IANA zone id, e.g. "Asia/Kolkata". */
  id: string
  /** Offset in minutes from UTC (positive east, negative west). */
  offsetMinutes: number
  /** Zone display name, e.g. "India Standard Time". */
  displayName: string
  /** City segment from the IANA id, e.g. "Kolkata". */
  city: string
  /** "GMT±HH:MM" prefix. */
  offsetLabel: string
  /** Final single-source-of-truth label shown in both trigger and menu. */
  label: string
  /** Lowercased haystack for substring search. */
  search: string
}

export const DEFAULT_TIMEZONE_ID = "Asia/Kolkata"

// Fallback list used when `Intl.supportedValuesOf("timeZone")` is not
// available (older runtimes, some test environments).
const FALLBACK_IANA_ZONES: readonly string[] = [
  "UTC",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "America/Anchorage",
  "America/Argentina/Buenos_Aires",
  "America/Bogota",
  "America/Chicago",
  "America/Denver",
  "America/Halifax",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/New_York",
  "America/Phoenix",
  "America/Sao_Paulo",
  "America/Toronto",
  "America/Vancouver",
  "Asia/Bangkok",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Jakarta",
  "Asia/Jerusalem",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Kuala_Lumpur",
  "Asia/Manila",
  "Asia/Riyadh",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Taipei",
  "Asia/Tehran",
  "Asia/Tokyo",
  "Atlantic/Reykjavik",
  "Australia/Adelaide",
  "Australia/Brisbane",
  "Australia/Melbourne",
  "Australia/Perth",
  "Australia/Sydney",
  "Europe/Amsterdam",
  "Europe/Athens",
  "Europe/Berlin",
  "Europe/Bucharest",
  "Europe/Dublin",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Moscow",
  "Europe/Oslo",
  "Europe/Paris",
  "Europe/Prague",
  "Europe/Rome",
  "Europe/Stockholm",
  "Europe/Vienna",
  "Europe/Warsaw",
  "Europe/Zurich",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Pacific/Honolulu",
]

function getSupportedTimeZones(): readonly string[] {
  const api = (
    Intl as unknown as {
      supportedValuesOf?: (key: string) => string[]
    }
  ).supportedValuesOf
  if (typeof api === "function") {
    try {
      const all = api("timeZone")
      if (Array.isArray(all) && all.length > 0) return all
    } catch {}
  }
  return FALLBACK_IANA_ZONES
}

function offsetMinutesForZone(id: string, at: Date = new Date()): number {
  // Build a date in UTC vs the target zone using Intl, then diff them. This
  // works without loading a tz database.
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: id,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const parts = Object.fromEntries(
      dtf.formatToParts(at).map((p) => [p.type, p.value])
    )
    const asUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour === "24" ? 0 : parts.hour),
      Number(parts.minute),
      Number(parts.second)
    )
    return Math.round((asUtc - at.getTime()) / 60_000)
  } catch {
    return 0
  }
}

function zoneDisplayName(id: string, at: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: id,
      timeZoneName: "long",
    }).formatToParts(at)
    return parts.find((p) => p.type === "timeZoneName")?.value ?? id
  } catch {
    return id
  }
}

function cityFor(id: string): string {
  const segs = id.split("/")
  return (segs[segs.length - 1] ?? id).replace(/_/g, " ")
}

export function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-"
  const abs = Math.abs(minutes)
  const hh = String(Math.floor(abs / 60)).padStart(2, "0")
  const mm = String(abs % 60).padStart(2, "0")
  return `GMT${sign}${hh}:${mm}`
}

export function buildTimezoneOption(
  id: string,
  at: Date = new Date()
): TimezoneOption {
  const offsetMinutes = offsetMinutesForZone(id, at)
  const displayName = zoneDisplayName(id, at)
  const city = cityFor(id)
  const offsetLabel = formatOffset(offsetMinutes)
  const label = `${offsetLabel} — ${displayName} — ${city}`
  return {
    id,
    offsetMinutes,
    displayName,
    city,
    offsetLabel,
    label,
    search: `${label} ${id}`.toLowerCase(),
  }
}

// Some runtimes (older Node ICU) return legacy aliases (e.g. Asia/Calcutta)
// while modern browsers return the canonical id (Asia/Kolkata). Normalize to
// the canonical id so the UI stays consistent regardless of environment.
const ZONE_ALIASES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "Atlantic/Faeroe": "Atlantic/Faroe",
  "Pacific/Ponape": "Pacific/Pohnpei",
  "Pacific/Truk": "Pacific/Chuuk",
  "US/Pacific": "America/Los_Angeles",
  "US/Eastern": "America/New_York",
  "US/Central": "America/Chicago",
  "US/Mountain": "America/Denver",
}

export function buildTimezoneOptions(at: Date = new Date()): TimezoneOption[] {
  const zones = getSupportedTimeZones()
  const ids = new Set<string>()
  for (const raw of zones) {
    ids.add(ZONE_ALIASES[raw] ?? raw)
  }
  // Guarantee the default is always queryable.
  ids.add(DEFAULT_TIMEZONE_ID)
  const options = [...ids].map((id) => buildTimezoneOption(id, at))
  options.sort(
    (a, b) =>
      a.offsetMinutes - b.offsetMinutes ||
      a.displayName.localeCompare(b.displayName) ||
      a.city.localeCompare(b.city)
  )
  return options
}

export function findTimezoneOption(
  options: TimezoneOption[],
  id: string
): TimezoneOption | undefined {
  return options.find((o) => o.id === id)
}

// ---------------------------------------------------------------------------
// Team icon palette
// ---------------------------------------------------------------------------

export const TEAM_ICON_COLORS: { id: string; bg: string; label: string }[] = [
  { id: "violet", bg: "bg-violet-500", label: "Violet" },
  { id: "sky", bg: "bg-sky-500", label: "Sky" },
  { id: "emerald", bg: "bg-emerald-500", label: "Emerald" },
  { id: "amber", bg: "bg-amber-500", label: "Amber" },
  { id: "rose", bg: "bg-rose-500", label: "Rose" },
  { id: "fuchsia", bg: "bg-fuchsia-500", label: "Fuchsia" },
  { id: "cyan", bg: "bg-cyan-500", label: "Cyan" },
  { id: "orange", bg: "bg-orange-500", label: "Orange" },
  { id: "indigo", bg: "bg-indigo-500", label: "Indigo" },
]

export const TEAM_ICON_EMOJIS: string[] = [
  "🏢",
  "⚙️",
  "🚀",
  "💡",
  "🧠",
  "🔧",
  "🧩",
  "📦",
  "🎯",
  "🛠️",
  "📊",
  "🗂️",
  "🧪",
  "🎨",
  "💬",
  "🛡️",
  "🤖",
  "📣",
  "🔬",
  "🏗️",
]

export const DEFAULT_TEAM_ICON = {
  colorId: "violet",
  emoji: "🏢",
}

export function findTeamIconColor(id: string) {
  return TEAM_ICON_COLORS.find((c) => c.id === id) ?? TEAM_ICON_COLORS[0]
}

// ---------------------------------------------------------------------------
// Copy settings + validation
// ---------------------------------------------------------------------------

export const NEW_TEAM_COPY = {
  identifierHelp:
    "Used as the identifier for this team's issues (e.g. ENG-123). Uppercase letters and numbers, 2–6 characters.",
  timezoneDescription:
    "The timezone should match where most of the team resides. All scheduled team artefacts — including cycles — use this timezone.",
  copyFromDescription:
    "Copy all the settings from an existing team except for Slack notifications and members.",
  teamHierarchyDescription:
    "Teams can be nested to reflect your team structure and to share workflows and settings.",
  teamHierarchyDocsUrl: "https://linear.app/docs/team-hierarchy",
  makeTeamPrivateDescription:
    "Private teams and their issues are only visible to members of the team and admins. Only admins and team owners can add new users to a private team. Public teams and their issues are visible to anyone in the workspace.",
  copyFromNoneLabel: "Don't copy",
} as const

// The exact string shown when nothing is selected in Copy from team. Used
// both in the trigger's collapsed state and the menu item so they stay in
// sync — referenced by Playwright tests.
export const COPY_FROM_NONE_VALUE = "none"

export const KEY_PATTERN = /^[A-Z0-9]{2,6}$/

export type NewTeamFormErrors = {
  name?: string
  identifier?: string
}

export function validateNewTeamForm(input: {
  name: string
  identifier: string
  usedKeys: Set<string>
}): NewTeamFormErrors {
  const errors: NewTeamFormErrors = {}
  if (input.name.trim().length === 0) {
    errors.name = "Team name is required"
  }
  if (input.identifier.trim().length === 0) {
    errors.identifier = "Identifier is required"
  } else if (!KEY_PATTERN.test(input.identifier)) {
    errors.identifier =
      "Identifier must be 2–6 uppercase letters or numbers"
  } else if (input.usedKeys.has(input.identifier)) {
    errors.identifier = `Identifier ${input.identifier} is already in use`
  }
  return errors
}
