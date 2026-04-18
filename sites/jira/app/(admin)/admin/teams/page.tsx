"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

// Bug 1: manage:atlassian-team scope missing
const CURRENT_SCOPES = ["read:jira-work", "write:jira-work"]
const HAS_SCOPE = CURRENT_SCOPES.includes("manage:atlassian-team")

type NavSection = "team-types" | "hris" | "notifications"

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function VerifiedBadge() {
  return (
    <svg aria-label="Verified" className="size-4 shrink-0" style={{ color: "#0052CC" }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
    </svg>
  )
}

function ExternalIcon({ size = 14 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

// Bug 1: disabled mutation button with tooltip
function MutationButton({ label, testid, className = "" }: { label: string; testid?: string; className?: string }) {
  if (HAS_SCOPE) {
    return (
      <button data-testid={testid}
        className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${className || "border border-[#DFE1E6] bg-white hover:bg-gray-50 text-gray-700"}`}>
        {label}
      </button>
    )
  }
  return (
    <div className="group relative inline-block">
      <button data-testid={testid} disabled
        className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium opacity-40 cursor-not-allowed ${className || "border border-[#DFE1E6] bg-white text-gray-700"}`}>
        {label}
      </button>
      <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
        Requires admin permissions
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  )
}

// ─── Team types view ──────────────────────────────────────────────────────────

const AVAILABLE_TYPES = [
  {
    id: "official",
    name: "Official team",
    isVerified: true,
    subtitle: "Default type • Teams that are managed by admins and marked as verified",
  },
  {
    id: "virtual",
    name: "Team",
    isVerified: false,
    subtitle: "Default type • Teams that anyone can create and manage",
  },
]

const COMMON_TYPES = [
  { id: "dept", name: "Department", desc: "A formal organisational unit led by a manager or director." },
  { id: "pod", name: "Pod", desc: "A small, cross-functional group focused on a specific product area." },
  { id: "feature", name: "Feature team", desc: "A team that owns and ships a specific feature end-to-end." },
  { id: "program", name: "Program", desc: "A group of related teams aligned to a shared strategic initiative." },
]

function TeamTypesView() {
  const [commonHidden, setCommonHidden] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("atlas_hide_common_team_types") === "true"
    }
    return false
  })
  const [overflowOpen, setOverflowOpen] = useState(false)
  const overflowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) setOverflowOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  function hideSection() {
    setCommonHidden(true)
    localStorage.setItem("atlas_hide_common_team_types", "true")
    setOverflowOpen(false)
  }

  // Bug 7: Rovo search 403 graceful fallback
  const [searchQuery, setSearchQuery] = useState("")
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "error_403" | "ok">("idle")

  function handleSearch(q: string) {
    setSearchQuery(q)
    if (!q) { setSearchStatus("idle"); return }
    setSearchStatus("loading")
    setTimeout(() => setSearchStatus("error_403"), 300)
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
      {/* Breadcrumb */}
      <p className="mb-4 text-sm text-gray-500">
        <Link href="/admin/teams" className="hover:underline">Teams settings</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-700 font-medium">Team types</span>
      </p>

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }} className="leading-tight">Team types</h1>
          <p className="mt-1 text-sm text-gray-600 max-w-lg">
            Customize the name and description of your team types, or create new types to better model your organization&apos;s team structure.
          </p>
          <a href="https://support.atlassian.com/jira-software-cloud/docs/team-types/"
            target="_blank" rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline">
            Understand team types <ExternalIcon size={12} />
          </a>
        </div>
        {/* Bug 1: Create type button disabled without scope */}
        <MutationButton label="Create type" testid="create-team-type-btn"
          className="inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#0052CC" } as React.CSSProperties} />
      </div>

      {/* Search — Bug 7: catches 403, shows fallback */}
      <div className="mb-6 relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search team types (Rovo)"
          className="w-full rounded border border-[#DFE1E6] py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />
        {searchStatus === "error_403" && (
          <p className="mt-1 text-xs text-gray-500">Search is unavailable on this site</p>
        )}
        {searchStatus === "loading" && (
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        )}
      </div>

      {/* Available team types */}
      <section className="mb-8">
        <p style={{ fontSize: 14, fontWeight: 700 }} className="mb-3 text-gray-800">Available team types</p>
        <div className="rounded overflow-hidden border border-[#DFE1E6]">
          {AVAILABLE_TYPES.map((tt, i) => (
            <div key={tt.id}
              className={`flex items-center gap-4 p-4 bg-white ${i < AVAILABLE_TYPES.length - 1 ? "border-b border-[#DFE1E6]" : ""}`}>
              <div className="flex size-9 shrink-0 items-center justify-center rounded" style={{ backgroundColor: "#DEEBFF" }}>
                <svg className="size-5" style={{ color: "#0052CC" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 14, fontWeight: 600 }} className="text-gray-900">{tt.name}</span>
                  {tt.isVerified && <VerifiedBadge />}
                </div>
                <p style={{ fontSize: 12 }} className="text-gray-500 mt-0.5">{tt.subtitle}</p>
              </div>
              <MutationButton label="Edit" testid={`edit-team-type-${tt.id}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Common team types — Bug 6 */}
      {!commonHidden && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p style={{ fontSize: 14, fontWeight: 700 }} className="text-gray-800">Common team types</p>
            {/* Bug 6: three-dot overflow menu */}
            <div className="relative" ref={overflowRef}>
              <button
                data-testid="common-types-overflow-btn"
                onClick={() => setOverflowOpen(v => !v)}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                </svg>
              </button>
              {overflowOpen && (
                <div data-testid="common-types-overflow-menu"
                  className="absolute right-0 top-full mt-1 z-20 w-44 rounded border border-[#DFE1E6] bg-white shadow-lg py-1">
                  <button
                    data-testid="hide-common-types-btn"
                    onClick={hideSection}
                    className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Hide this section
                  </button>
                  <a
                    href="https://support.atlassian.com/jira-software-cloud/docs/team-types/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOverflowOpen(false)}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Learn more <ExternalIcon size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
          <div data-testid="common-types-grid" className="grid grid-cols-4 gap-3">
            {COMMON_TYPES.map((ct) => (
              <div key={ct.id}
                className="flex flex-col rounded bg-white p-4 border border-[#DFE1E6]"
                style={{ borderRadius: 3 }}>
                <p style={{ fontSize: 14, fontWeight: 600 }} className="text-gray-900 mb-1">{ct.name}</p>
                <p style={{ fontSize: 12 }} className="text-gray-500 flex-1 mb-4">{ct.desc}</p>
                <MutationButton label="Create" testid={`create-common-${ct.id}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {commonHidden && (
        <div className="rounded border border-dashed border-[#DFE1E6] p-4 text-sm text-gray-500 flex items-center justify-between">
          Common team types section is hidden.
          <button
            onClick={() => { setCommonHidden(false); localStorage.removeItem("atlas_hide_common_team_types") }}
            className="text-sm text-blue-700 hover:underline">Show</button>
        </div>
      )}
    </div>
  )
}

// ─── HRIS connections view ────────────────────────────────────────────────────

function HRISView() {
  const [connectorReady, setConnectorReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Bug 3: simulate GET /gateway/api/teams/v4/org/{orgId}/hris/connectors
    const t = setTimeout(() => { setConnectorReady(false); setChecking(false) }, 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
      {/* Breadcrumb */}
      <p className="mb-4 text-sm text-gray-500">
        <Link href="/admin/teams" className="hover:underline">Teams settings</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-700 font-medium">HRIS connections</span>
      </p>

      {/* Page header */}
      <h1 style={{ fontSize: 24, fontWeight: 700 }} className="mb-5 leading-tight">HRIS connections</h1>

      {/* Subheading + body — Bug 4: exact Workday copy */}
      <p style={{ fontSize: 18, fontWeight: 700 }} className="mb-2 text-gray-900">
        Sync teams based on official reporting lines
      </p>
      <p style={{ fontSize: 14 }} className="mb-3 text-gray-700 leading-relaxed max-w-2xl">
        Connect an HRIS to sync your organisation structure and create verified teams in Atlassian that can only be managed in the connected HRIS app. Currently, only Workday is supported.{" "}
        {/* Bug 4: "Read more about HRIS sync" exact link */}
        <a href="https://support.atlassian.com/platform-experiences/docs/sync-teams-data-from-workday/"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-700 hover:underline">
          Read more about HRIS sync <ExternalIcon size={12} />
        </a>
      </p>

      {/* Setup instruction paragraph */}
      <p style={{ fontSize: 14 }} className="mb-6 text-gray-600 max-w-2xl">
        To get started, you&apos;ll first need to connect the HRIS app in Atlassian Administration using a Teamwork Graph connector, then return here to the Teams app to sync your teams.
      </p>

      {/* Step 1 card */}
      <div className="mb-4 rounded bg-white p-4 border border-[#DFE1E6]" style={{ borderRadius: 3 }}>
        <div className="flex items-start gap-4">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white mt-0.5">
            1
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 14, fontWeight: 700 }} className="text-gray-900 mb-1">
              Connect HRIS app in Atlassian Administration
            </p>
            <p style={{ fontSize: 14 }} className="text-gray-600 mb-4">
              First, set up your HRIS app as a Teamwork Graph connector.
            </p>
            {/* Bug 2: real <a> tag, target="_blank", external icon, className="hris-cta-btn" */}
            <a
              href="https://admin.atlassian.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hris-cta-btn inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#0052CC" }}
              data-testid="hris-go-to-admin-btn"
            >
              Go to Atlassian Administration
              <ExternalIcon size={14} />
            </a>
            {checking && (
              <span className="ml-3 inline-flex items-center gap-1 text-xs text-gray-400">
                <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Checking connection…
              </span>
            )}
            {!checking && connectorReady && (
              <span className="ml-3 inline-flex items-center gap-1 text-xs font-medium text-green-700">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step 2 card — Bug 3: greyed out until connectorReady */}
      <div
        data-testid="hris-step-2"
        className={`rounded bg-white p-4 border border-[#DFE1E6] transition-opacity ${!connectorReady ? "opacity-50" : ""}`}
        style={{ borderRadius: 3 }}
      >
        <div className="flex items-start gap-4">
          {/* Bug 3: grey outline circle "2" when not connected */}
          <div className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5 ${
            connectorReady
              ? "bg-gray-900 text-white"
              : "border-2 border-gray-300 text-gray-400 bg-transparent"
          }`}>
            2
          </div>
          <div className="flex-1">
            {/* Bug 3: title always shown, body only when connected */}
            <p style={{ fontSize: 14, fontWeight: connectorReady ? 700 : 400 }} className="text-gray-500 mb-1">
              Sync HRIS teams in the Teams app
            </p>
            {connectorReady && (
              <div>
                <p style={{ fontSize: 14 }} className="text-gray-600 mb-4">
                  Choose which Workday teams to import and keep in sync.
                </p>
                <button className="rounded px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: "#0052CC" }}>
                  Configure sync settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Notifications view ───────────────────────────────────────────────────────

function NotificationsView() {
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
      <p className="mb-4 text-sm text-gray-500">
        <Link href="/admin/teams" className="hover:underline">Teams settings</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-700 font-medium">Notifications settings</span>
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700 }} className="mb-4">Notifications settings</h1>
      <p style={{ fontSize: 14 }} className="text-gray-500">Notification configuration coming soon.</p>
    </div>
  )
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: "team-types", label: "Team types" },
  { id: "hris", label: "HRIS connections" },
  { id: "notifications", label: "Notifications settings" },
]

// ─── Root page ────────────────────────────────────────────────────────────────

export default function AdminTeamsPage() {
  const [active, setActive] = useState<NavSection>("team-types")

  return (
    <div className="flex h-full min-h-screen">
      {/* Left sidebar — 145px */}
      <aside style={{ width: 145, minWidth: 145 }} className="shrink-0 border-r border-[#DFE1E6] bg-white flex flex-col">
        <div className="flex items-center gap-2 border-b border-[#DFE1E6] px-3 py-3">
          <Link href="/admin" className="rounded p-0.5 text-gray-500 hover:bg-gray-100 transition-colors">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <span style={{ fontSize: 14, fontWeight: 700 }} className="text-gray-900 truncate">Teams settings</span>
        </div>
        <nav className="flex flex-col py-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              data-testid={`nav-${item.id}`}
              className="relative text-left px-3 py-2 transition-colors"
              style={{
                fontSize: 14,
                fontWeight: active === item.id ? 600 : 400,
                color: active === item.id ? "#0052CC" : "#42526E",
                backgroundColor: active === item.id ? "#DEEBFF" : "transparent",
                borderLeft: active === item.id ? "2px solid #0052CC" : "2px solid transparent",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      {active === "team-types" && <TeamTypesView />}
      {active === "hris" && <HRISView />}
      {active === "notifications" && <NotificationsView />}
    </div>
  )
}
