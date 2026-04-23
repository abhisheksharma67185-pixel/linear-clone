"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const activityItems = [
  {
    category: "SETTINGS",
    items: [
      "Created admin API key",
      "Revoked admin API key",
      "Added user as organization admin",
      "Created audit log webhook registration",
      "New site created",
      "Deleted audit log webhook registration",
      "Exported user counts list",
      "Exported app audit log",
      "Updated organization name",
      "Updated organization avatar",
      "Changed default language",
      "Updated time zone settings",
      "Enabled two-step verification",
      "Disabled two-step verification",
      "Updated email domain",
      "Changed notification preferences",
      "Updated billing contact",
      "Changed subscription plan",
      "Enabled sandbox mode",
      "Disabled sandbox mode",
      "Updated release track",
      "Changed data residency",
      "Updated compliance settings",
      "Enabled audit log streaming",
      "Disabled audit log streaming",
      "Created webhook",
      "Deleted webhook",
      "Updated webhook configuration",
      "Changed session duration",
      "Updated idle timeout",
      "Enabled IP allowlisting",
      "Disabled IP allowlisting",
      "Updated SMTP settings",
      "Changed default project template",
      "Updated branding settings",
      "Enabled dark mode default",
      "Changed default dashboard",
      "Updated announcement banner",
      "Created custom field",
      "Deleted custom field",
      "Updated workflow scheme",
      "Changed permission scheme",
      "Created notification scheme",
      "Updated notification scheme",
      "Deleted notification scheme",
      "Changed issue security scheme",
      "Updated screen scheme",
      "Created issue type scheme",
      "Updated priority scheme",
      "Changed resolution scheme",
      "Enabled automation rule",
      "Disabled automation rule",
      "Created automation rule",
      "Deleted automation rule",
      "Updated automation rule",
      "Triggered automation manually",
    ],
  },
  {
    category: "USER MANAGEMENT",
    items: [
      "Invited user",
      "Removed user",
      "Updated user role",
      "Deactivated user account",
      "Reactivated user account",
      "Added user to group",
      "Removed user from group",
      "Created group",
      "Deleted group",
      "Updated group membership",
      "Changed user email",
      "Reset user password",
      "Granted admin access",
      "Revoked admin access",
      "Added user to project",
      "Removed user from project",
      "Changed project role",
      "Updated user profile",
      "Suspended user",
      "Restored suspended user",
      "Exported user list",
      "Imported users",
      "Created service account",
      "Deleted service account",
      "Updated service account permissions",
      "Enabled API access for user",
      "Disabled API access for user",
      "Generated API token for user",
      "Revoked all API tokens for user",
      "Changed user language preference",
      "Updated user notification settings",
      "Added user to team",
      "Removed user from team",
      "Changed team lead",
      "Created team",
      "Deleted team",
      "Updated team description",
      "Changed team visibility",
      "Merged teams",
      "Invited external user",
      "Removed external user",
      "Updated external user access",
      "Converted external to managed",
      "Updated managed account settings",
      "Claimed user account",
      "Released user account",
      "Transferred user data",
      "Enabled user provisioning",
      "Disabled user provisioning",
      "Synced user directory",
      "Updated SCIM configuration",
      "Created access request",
      "Approved access request",
      "Denied access request",
      "Updated access policy",
    ],
  },
  {
    category: "SECURITY",
    items: [
      "Updated authentication policy",
      "Changed password policy",
      "Updated IP allowlist",
      "Created API token",
      "Revoked API token",
      "Enabled SSO",
      "Disabled SSO",
      "Updated SAML configuration",
      "Changed identity provider",
      "Enabled two-factor authentication",
      "Disabled two-factor authentication",
      "Updated session policy",
      "Changed password requirements",
      "Enabled password expiration",
      "Disabled password expiration",
      "Updated data security policy",
      "Created data classification rule",
      "Deleted data classification rule",
      "Enabled encryption",
      "Updated encryption settings",
      "Changed key rotation policy",
      "Enabled HIPAA compliance mode",
      "Updated compliance settings",
      "Generated compliance report",
      "Created mobile app policy",
      "Updated mobile app policy",
      "Deleted mobile app policy",
      "Enabled device trust",
      "Disabled device trust",
      "Updated device security policy",
      "Created access policy",
      "Updated access policy",
      "Deleted access policy",
      "Enabled external user policy",
      "Updated external user policy",
      "Changed token expiration",
      "Rotated API keys",
      "Updated OAuth settings",
      "Created OAuth application",
      "Deleted OAuth application",
      "Enabled audit log access for site admins",
      "Disabled audit log access for site admins",
      "Updated data residency policy",
      "Changed data retention period",
      "Enabled data loss prevention",
      "Disabled data loss prevention",
      "Created DLP rule",
      "Updated DLP rule",
      "Deleted DLP rule",
      "Enabled Atlassian Guard",
      "Updated Guard configuration",
      "Generated security report",
    ],
  },
  {
    category: "APPS",
    items: [
      "Installed app",
      "Uninstalled app",
      "Updated app",
      "Enabled app",
      "Disabled app",
      "Changed app permissions",
      "Updated app configuration",
      "Created app link",
      "Deleted app link",
      "Approved app request",
      "Denied app request",
      "Updated app access policy",
      "Installed Marketplace app",
      "Updated Marketplace app",
      "Removed Marketplace app",
      "Changed app data access",
      "Enabled app API access",
      "Disabled app API access",
      "Created app webhook",
      "Deleted app webhook",
      "Updated app webhook",
      "Exported app data",
      "Imported app data",
      "Cleared app cache",
      "Installed Forge app",
      "Updated Forge app",
      "Removed Forge app",
      "Changed Connect app scope",
      "Updated app licensing",
      "Transferred app license",
    ],
  },
  {
    category: "PROJECTS",
    items: [
      "Created project",
      "Deleted project",
      "Archived project",
      "Restored project",
      "Updated project settings",
      "Changed project lead",
      "Updated project description",
      "Changed project key",
      "Updated project avatar",
      "Changed project category",
      "Added component",
      "Deleted component",
      "Updated component",
      "Created version",
      "Released version",
      "Archived version",
      "Deleted version",
      "Updated board configuration",
      "Created board",
      "Deleted board",
      "Changed column mapping",
      "Updated swimlane configuration",
      "Created quick filter",
      "Deleted quick filter",
      "Updated card layout",
      "Changed estimation method",
      "Enabled backlog",
      "Disabled backlog",
      "Updated sprint settings",
      "Created sprint",
      "Started sprint",
      "Completed sprint",
      "Deleted sprint",
      "Moved issue between sprints",
      "Ranked issue",
      "Changed issue priority bulk",
    ],
  },
  {
    category: "ISSUES",
    items: [
      "Created issue",
      "Updated issue",
      "Deleted issue",
      "Moved issue",
      "Changed issue status",
      "Changed issue priority",
      "Changed issue type",
      "Assigned issue",
      "Unassigned issue",
      "Added comment",
      "Edited comment",
      "Deleted comment",
      "Added attachment",
      "Deleted attachment",
      "Added label",
      "Removed label",
      "Linked issue",
      "Unlinked issue",
      "Added watcher",
      "Removed watcher",
      "Voted on issue",
      "Removed vote",
      "Created subtask",
      "Converted to subtask",
      "Converted from subtask",
      "Changed parent issue",
      "Updated story points",
      "Changed epic",
      "Added to sprint",
      "Removed from sprint",
      "Transitioned issue",
      "Bulk updated issues",
      "Bulk moved issues",
      "Bulk deleted issues",
      "Exported issues",
      "Imported issues",
      "Cloned issue",
    ],
  },
  {
    category: "WORKFLOWS",
    items: [
      "Created workflow",
      "Updated workflow",
      "Deleted workflow",
      "Published workflow",
      "Created workflow scheme",
      "Updated workflow scheme",
      "Deleted workflow scheme",
      "Added transition",
      "Removed transition",
      "Updated transition",
      "Added condition",
      "Removed condition",
      "Added validator",
      "Removed validator",
      "Added post function",
      "Removed post function",
      "Updated post function",
      "Created status",
      "Updated status",
      "Deleted status",
      "Changed status category",
      "Created resolution",
      "Updated resolution",
      "Deleted resolution",
      "Mapped workflow to issue type",
      "Unmapped workflow from issue type",
    ],
  },
  {
    category: "PERMISSIONS",
    items: [
      "Created permission scheme",
      "Updated permission scheme",
      "Deleted permission scheme",
      "Granted permission",
      "Revoked permission",
      "Changed project permissions",
      "Updated global permissions",
      "Changed issue-level security",
      "Created security level",
      "Updated security level",
      "Deleted security level",
      "Changed default security level",
      "Updated anonymous access",
      "Enabled public access",
      "Disabled public access",
      "Changed sharing permissions",
    ],
  },
  {
    category: "FILTERS & DASHBOARDS",
    items: [
      "Created filter",
      "Updated filter",
      "Deleted filter",
      "Shared filter",
      "Changed filter permissions",
      "Subscribed to filter",
      "Unsubscribed from filter",
      "Created dashboard",
      "Updated dashboard",
      "Deleted dashboard",
      "Shared dashboard",
      "Added gadget",
      "Removed gadget",
      "Updated gadget configuration",
      "Changed dashboard layout",
      "Set default dashboard",
    ],
  },
  {
    category: "INTEGRATIONS",
    items: [
      "Connected integration",
      "Disconnected integration",
      "Updated integration settings",
      "Created Slack integration",
      "Removed Slack integration",
      "Updated Slack channel mapping",
      "Connected GitHub",
      "Disconnected GitHub",
      "Updated GitHub repository mapping",
      "Connected Bitbucket",
      "Disconnected Bitbucket",
      "Created deployment pipeline",
      "Updated CI/CD configuration",
      "Connected Confluence",
      "Updated Confluence space link",
      "Created application link",
      "Updated application link",
      "Deleted application link",
      "Enabled development tools",
      "Updated development tool configuration",
      "Connected Microsoft Teams",
      "Disconnected Microsoft Teams",
    ],
  },
  {
    category: "DATA MANAGEMENT",
    items: [
      "Started data export",
      "Completed data export",
      "Failed data export",
      "Started data import",
      "Completed data import",
      "Failed data import",
      "Created backup",
      "Restored from backup",
      "Deleted backup",
      "Started data migration",
      "Completed data migration",
      "Failed data migration",
      "Updated data retention policy",
      "Purged old data",
      "Archived old data",
      "Started reindex",
      "Completed reindex",
      "Failed reindex",
      "Updated attachment settings",
      "Changed storage configuration",
      "Enabled data residency pinning",
      "Changed data residency region",
    ],
  },
  {
    category: "NOTIFICATIONS",
    items: [
      "Updated notification scheme",
      "Changed email template",
      "Updated email settings",
      "Enabled batch notifications",
      "Disabled batch notifications",
      "Changed notification frequency",
      "Updated mention notifications",
      "Enabled webhook notifications",
      "Disabled webhook notifications",
      "Changed in-app notification settings",
      "Updated mobile push settings",
      "Created notification rule",
      "Updated notification rule",
      "Deleted notification rule",
    ],
  },
  {
    category: "SYSTEM",
    items: [
      "System startup",
      "System shutdown",
      "Updated system configuration",
      "Changed base URL",
      "Updated license",
      "Renewed license",
      "Applied system patch",
      "Updated Java version",
      "Changed database configuration",
      "Updated index settings",
      "Cleared system cache",
      "Updated logging level",
      "Changed attachment path",
      "Updated proxy settings",
      "Enabled maintenance mode",
      "Disabled maintenance mode",
      "Generated system report",
      "Updated clustering configuration",
      "Changed garbage collection settings",
      "Updated thread pool configuration",
      "Enabled rate limiting",
      "Updated rate limiting configuration",
    ],
  },
]

const actorItems = {
  apps: ["Third-party applications"],
  users: [
    {
      name: "Abhishek Sharma",
      email: "abhisheksharma67185@gmail.com",
      initials: "AS",
    },
  ],
}

const ipAddresses = ["10.19.46.105", "10.19.69.165"]

function FilterDropdown({
  label: _label,
  active,
  children,
  onClose,
}: {
  label: string
  active: boolean
  children: React.ReactNode
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    if (active) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [active, onClose])

  return (
    <div className="relative" ref={ref}>
      {active && (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 rounded-lg border bg-popover shadow-lg">
          {children}
        </div>
      )}
    </div>
  )
}

export default function AuditLogPage() {
  const [searchMode, setSearchMode] = useState<"basic" | "alql">("basic")
  const [showBanner, setShowBanner] = useState(true)
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [alqlQuery, setAlqlQuery] = useState(
    `created >= 2026-03-31T21:26:45.000Z and created <= 2026-04-07T21:26:45.000Z`
  )
  const [alqlExpanded, setAlqlExpanded] = useState(false)
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false)
  const [alqlSearching, setAlqlSearching] = useState(false)

  // Filter states
  const [dateMode, setDateMode] = useState<
    "between" | "within" | "more" | "range"
  >("within")
  const [dateValue, setDateValue] = useState("7")
  const [dateUnit, setDateUnit] = useState("days")
  const [activitySearch, setActivitySearch] = useState("")
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(
    new Set()
  )
  const [actorSearch, setActorSearch] = useState("")
  const [selectedActors, setSelectedActors] = useState<Set<string>>(new Set())
  const [ipSearch, setIpSearch] = useState("")
  const [selectedIps, setSelectedIps] = useState<Set<string>>(new Set())
  const [locationSearch, setLocationSearch] = useState("")
  const [appSearch, setAppSearch] = useState("")
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set())

  const appList = [
    {
      name: "Assets",
      bg: "bg-green-100",
      icon: (
        <svg
          className="size-4 text-green-700"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      name: "Atlassian Analytics",
      bg: "bg-blue-100",
      icon: (
        <svg
          className="size-4 text-blue-700"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="4" y="14" width="4" height="7" rx="1" />
          <rect x="10" y="10" width="4" height="11" rx="1" />
          <rect x="16" y="4" width="4" height="17" rx="1" />
        </svg>
      ),
    },
    {
      name: "Bitbucket",
      bg: "bg-blue-600",
      icon: (
        <svg
          className="size-4 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M3.28 2a.5.5 0 00-.49.59l2.7 16.37a.68.68 0 00.66.57h12.17a.5.5 0 00.5-.42L21.21 2.6a.5.5 0 00-.49-.59zm11.08 12.11H9.82L8.87 8.44h6.47z" />
        </svg>
      ),
    },
    {
      name: "Compass",
      bg: "bg-teal-500",
      icon: (
        <svg
          className="size-4 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon
            points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"
            fill="white"
          />
        </svg>
      ),
    },
    {
      name: "Focus",
      bg: "bg-gradient-to-br from-orange-400 to-red-500",
      icon: (
        <svg
          className="size-4 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="5" />
          <path
            d="M12 2v4M12 18v4M2 12h4M18 12h4"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
    },
    {
      name: "Jira",
      bg: "bg-gradient-to-br from-blue-500 to-blue-700",
      icon: (
        <svg className="size-4 text-white" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      ),
    },
    {
      name: "Loom",
      bg: "bg-gradient-to-br from-blue-400 to-purple-600",
      icon: (
        <svg className="size-4 text-white" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      ),
    },
    {
      name: "Rovo",
      bg: "bg-gradient-to-br from-blue-500 to-purple-500",
      icon: (
        <svg className="size-4 text-white" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      name: "Talent",
      bg: "bg-gradient-to-br from-yellow-400 to-amber-500",
      icon: (
        <svg className="size-4 text-white" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
  ]

  const filteredApps = appSearch
    ? appList.filter((a) =>
        a.name.toLowerCase().includes(appSearch.toLowerCase())
      )
    : appList

  const toggleApp = (name: string) => {
    setSelectedApps((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const toggleFilter = (name: string) => {
    setOpenFilter(openFilter === name ? null : name)
  }

  const toggleActivity = (item: string) => {
    setSelectedActivities((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  const toggleActor = (item: string) => {
    setSelectedActors((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  const toggleIp = (item: string) => {
    setSelectedIps((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  const allActivities = activityItems.flatMap((c) => c.items)
  const filteredActivities = activitySearch
    ? activityItems
        .map((c) => ({
          ...c,
          items: c.items.filter((i) =>
            i.toLowerCase().includes(activitySearch.toLowerCase())
          ),
        }))
        .filter((c) => c.items.length > 0)
    : activityItems
  const totalActivities = allActivities.length

  const filteredIps = ipSearch
    ? ipAddresses.filter((ip) => ip.includes(ipSearch))
    : ipAddresses

  return (
    <div className="max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <Button variant="outline">Export log</Button>
      </div>

      <div className="mb-2 max-w-3xl text-sm text-muted-foreground">
        <p className="mb-2">
          Your organization&apos;s audit log tracks activities that occurred
          from your organization and across your sites within the past 180 days.
        </p>
      </div>

      {/* Guard upsell card */}
      <div className="mb-6 rounded-lg border p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <span className="text-base font-semibold">Guard</span>
        </div>
        <h3 className="mb-1 text-sm font-semibold">
          Quickly investigate user access changes
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          The audit log is an Atlassian Guard feature. To see audit log
          activity, you need to have an Atlassian Guard subscription.
        </p>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Learn more
        </Button>
      </div>

      {/* Info banner */}
      {showBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/20">
          <svg
            className="mt-0.5 size-5 shrink-0 text-blue-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
            <line
              x1="12"
              y1="16"
              x2="12"
              y2="12"
              stroke="white"
              strokeWidth="2"
            />
            <line
              x1="12"
              y1="8"
              x2="12.01"
              y2="8"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
          <div className="flex-1">
            <h4 className="mb-0.5 text-sm font-semibold">
              Audit log access available to site admins
            </h4>
            <p className="mb-1 text-sm text-muted-foreground">
              Site admins can now view audit log data for their site(s), making
              it easier to track important changes and events.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <button type="button" className="text-blue-600 hover:underline">
                Understand more about site admin access
              </button>
              <span className="text-muted-foreground">&middot;</span>
              <button
                onClick={() => setShowBanner(false)}
                className="text-blue-600 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search filters */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-md border">
          <button
            onClick={() => setSearchMode("basic")}
            className={`px-3 py-1.5 text-xs font-medium ${searchMode === "basic" ? "bg-blue-600 text-white" : "bg-background text-foreground hover:bg-accent"}`}
          >
            Basic
          </button>
          <button
            onClick={() => setSearchMode("alql")}
            className={`border-l px-3 py-1.5 text-xs font-medium ${searchMode === "alql" ? "bg-blue-600 text-white" : "bg-background text-foreground hover:bg-accent"}`}
          >
            ALQL
          </button>
        </div>

        {searchMode === "alql" ? (
          /* ALQL query editor with syntax highlighting */
          <>
            <div
              className={`flex flex-1 rounded-md border bg-background ${alqlExpanded ? "flex-col" : "items-center"}`}
            >
              <div
                className={`relative min-w-0 flex-1 ${alqlExpanded ? "" : ""}`}
              >
                {/* Visible highlighted layer */}
                {!alqlExpanded && (
                  <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-3 py-2 font-mono text-sm whitespace-nowrap">
                    <span className="text-purple-600">created</span>
                    <span className="mx-1 text-muted-foreground">&ge;</span>
                    <span>{alqlQuery.match(/>=\s*(\S+)/)?.[1] ?? ""}</span>
                    <span className="mx-1.5 font-medium text-blue-600">
                      and
                    </span>
                    <span className="text-purple-600">created</span>
                    <span className="mx-1 text-muted-foreground">&le;</span>
                    <span>{alqlQuery.match(/<=\s*(\S+)/)?.[1] ?? ""}</span>
                  </div>
                )}
                {alqlExpanded ? (
                  <textarea
                    value={alqlQuery}
                    onChange={(e) => setAlqlQuery(e.target.value)}
                    rows={12}
                    className="w-full resize-none bg-transparent px-3 py-2 font-mono text-sm text-foreground outline-none"
                    spellCheck={false}
                  />
                ) : (
                  <input
                    type="text"
                    value={alqlQuery}
                    onChange={(e) => setAlqlQuery(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 font-mono text-sm text-transparent caret-foreground outline-none"
                    spellCheck={false}
                  />
                )}
              </div>
              <div
                className={`flex shrink-0 items-center gap-0.5 px-2 ${alqlExpanded ? "justify-end border-t py-1" : "border-l"}`}
              >
                <button
                  onClick={() => setAlqlExpanded(!alqlExpanded)}
                  className="group relative rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent"
                  title={alqlExpanded ? "Collapse editor" : "Expand editor"}
                >
                  {alqlExpanded ? (
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="4 14 10 14 10 20" />
                      <polyline points="20 10 14 10 14 4" />
                      <line x1="14" y1="10" x2="21" y2="3" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  ) : (
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  )}
                  <span className="absolute right-0 -bottom-8 z-10 hidden rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg group-hover:block">
                    {alqlExpanded ? "Collapse editor" : "Expand editor"}
                  </span>
                </button>
                <button
                  onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
                  className="group relative rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent"
                  title="Syntax help"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </button>
                <button
                  onClick={() => setAlqlSearching(true)}
                  className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent"
                  title="Run query"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Syntax help panel */}
            {showSyntaxHelp && (
              <div className="mt-2 w-full rounded-lg border bg-popover p-4 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">
                    ALQL Syntax Reference
                  </h4>
                  <button
                    onClick={() => setShowSyntaxHelp(false)}
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-purple-600">
                      created
                    </code>
                    <span className="text-muted-foreground">
                      Filter by creation date
                    </span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-purple-600">
                      action
                    </code>
                    <span className="text-muted-foreground">
                      Filter by activity type
                    </span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-purple-600">
                      actor
                    </code>
                    <span className="text-muted-foreground">
                      Filter by user or app
                    </span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-purple-600">
                      location
                    </code>
                    <span className="text-muted-foreground">
                      Filter by IP or location
                    </span>
                  </div>
                  <div className="mt-3 border-t pt-2 text-xs text-muted-foreground">
                    <p>
                      <strong>Operators:</strong>{" "}
                      <code className="rounded bg-muted px-1">=</code>{" "}
                      <code className="rounded bg-muted px-1">&gt;=</code>{" "}
                      <code className="rounded bg-muted px-1">&lt;=</code>{" "}
                      <code className="rounded bg-muted px-1">!=</code>{" "}
                      <code className="rounded bg-muted px-1">~</code>{" "}
                      (contains)
                    </p>
                    <p className="mt-1">
                      <strong>Keywords:</strong>{" "}
                      <code className="rounded bg-muted px-1 text-blue-600">
                        and
                      </code>{" "}
                      <code className="rounded bg-muted px-1 text-blue-600">
                        or
                      </code>{" "}
                      <code className="rounded bg-muted px-1 text-blue-600">
                        not
                      </code>
                    </p>
                    <p className="mt-1">
                      <strong>Example:</strong>{" "}
                      <code className="rounded bg-muted px-1">
                        action = &quot;Created issue&quot; and actor =
                        &quot;Abhishek Sharma&quot;
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search executing feedback */}
            {alqlSearching && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="size-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Executing query...
              </div>
            )}
          </>
        ) : (
          <>
            <div className="relative">
              <svg
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <Input
                placeholder="Search by name, group, or site"
                className="h-8 w-56 pl-9 text-xs"
              />
            </div>

            {/* Date filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("date")}
                className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${openFilter === "date" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-blue-300 text-blue-600"}`}
              >
                Date: Within the last {dateValue} {dateUnit}
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              <FilterDropdown
                label="date"
                active={openFilter === "date"}
                onClose={() => setOpenFilter(null)}
              >
                <div className="space-y-3 p-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="dateMode"
                      checked={dateMode === "between"}
                      onChange={() => setDateMode("between")}
                      className="accent-blue-600"
                    />
                    Between
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="dateMode"
                      checked={dateMode === "within"}
                      onChange={() => setDateMode("within")}
                      className="accent-blue-600"
                    />
                    Within the last
                  </label>
                  {dateMode === "within" && (
                    <div className="ml-6 flex items-center gap-2">
                      <input
                        type="number"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        className="w-16 rounded-md border px-2 py-1.5 text-sm"
                      />
                      <select
                        value={dateUnit}
                        onChange={(e) => setDateUnit(e.target.value)}
                        className="rounded-md border bg-background px-2 py-1.5 text-sm"
                      >
                        <option value="days">days</option>
                        <option value="weeks">weeks</option>
                        <option value="months">months</option>
                      </select>
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="dateMode"
                      checked={dateMode === "more"}
                      onChange={() => setDateMode("more")}
                      className="accent-blue-600"
                    />
                    More than
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="dateMode"
                      checked={dateMode === "range"}
                      onChange={() => setDateMode("range")}
                      className="accent-blue-600"
                    />
                    In the range
                  </label>
                </div>
              </FilterDropdown>
            </div>

            {/* Activities filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("activities")}
                className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${openFilter === "activities" ? "border-blue-500 bg-blue-50 text-blue-600" : "hover:bg-accent"}`}
              >
                Activities
                {selectedActivities.size > 0 && ` (${selectedActivities.size})`}
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              <FilterDropdown
                label="activities"
                active={openFilter === "activities"}
                onClose={() => setOpenFilter(null)}
              >
                <div className="border-b p-3">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="h-8 pr-8 text-sm"
                    />
                    <svg
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {filteredActivities.map((cat) => (
                    <div key={cat.category}>
                      <p className="px-4 pt-3 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        {cat.category}
                      </p>
                      {cat.items.map((item) => (
                        <label
                          key={item}
                          className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-accent"
                        >
                          <input
                            type="checkbox"
                            checked={selectedActivities.has(item)}
                            onChange={() => toggleActivity(item)}
                            className="accent-blue-600"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="border-t px-4 py-2 text-right text-xs text-muted-foreground">
                  {selectedActivities.size} of {totalActivities}
                </div>
              </FilterDropdown>
            </div>

            {/* Actor filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("actor")}
                className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${openFilter === "actor" ? "border-blue-500 bg-blue-50 text-blue-600" : "hover:bg-accent"}`}
              >
                Actor
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              <FilterDropdown
                label="actor"
                active={openFilter === "actor"}
                onClose={() => setOpenFilter(null)}
              >
                <div className="border-b p-3">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={actorSearch}
                      onChange={(e) => setActorSearch(e.target.value)}
                      className="h-8 pr-8 text-sm"
                    />
                    <svg
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <p className="px-4 pt-3 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    Apps
                  </p>
                  {actorItems.apps.map((app) => (
                    <label
                      key={app}
                      className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={selectedActors.has(app)}
                        onChange={() => toggleActor(app)}
                        className="accent-blue-600"
                      />
                      {app}
                    </label>
                  ))}
                  <p className="px-4 pt-3 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    Users
                  </p>
                  {actorItems.users.map((user) => (
                    <label
                      key={user.name}
                      className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={selectedActors.has(user.name)}
                        onChange={() => toggleActor(user.name)}
                        className="accent-blue-600"
                      />
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-blue-600 text-[10px] font-medium text-white">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </label>
                  ))}
                  <button className="px-4 py-2 text-sm text-blue-600 hover:underline">
                    Show more
                  </button>
                </div>
              </FilterDropdown>
            </div>

            {/* IP Address filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("ip")}
                className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${openFilter === "ip" ? "border-blue-500 bg-blue-50 text-blue-600" : "hover:bg-accent"}`}
              >
                IP Address
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              <FilterDropdown
                label="ip"
                active={openFilter === "ip"}
                onClose={() => setOpenFilter(null)}
              >
                <div className="border-b p-3">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={ipSearch}
                      onChange={(e) => setIpSearch(e.target.value)}
                      className="h-8 pr-8 text-sm"
                    />
                    <svg
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredIps.map((ip) => (
                    <label
                      key={ip}
                      className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIps.has(ip)}
                        onChange={() => toggleIp(ip)}
                        className="accent-blue-600"
                      />
                      {ip}
                    </label>
                  ))}
                </div>
              </FilterDropdown>
            </div>

            {/* Location filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("location")}
                className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${openFilter === "location" ? "border-blue-500 bg-blue-50 text-blue-600" : "hover:bg-accent"}`}
              >
                Location
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              <FilterDropdown
                label="location"
                active={openFilter === "location"}
                onClose={() => setOpenFilter(null)}
              >
                <div className="border-b p-3">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="h-8 pr-8 text-sm"
                    />
                    <svg
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No matches found
                </div>
              </FilterDropdown>
            </div>

            {/* App filter */}
            <div className="relative">
              <button
                onClick={() => toggleFilter("app")}
                className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${openFilter === "app" ? "border-blue-500 bg-blue-50 text-blue-600" : "hover:bg-accent"}`}
              >
                App{selectedApps.size > 0 && ` (${selectedApps.size})`}
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              <FilterDropdown
                label="app"
                active={openFilter === "app"}
                onClose={() => setOpenFilter(null)}
              >
                <div className="border-b p-3">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="h-8 pr-8 text-sm"
                    />
                    <svg
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {filteredApps.map((app) => (
                    <label
                      key={app.name}
                      className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={selectedApps.has(app.name)}
                        onChange={() => toggleApp(app.name)}
                        className="accent-blue-600"
                      />
                      <div
                        className={`flex size-7 items-center justify-center rounded-md ${app.bg}`}
                      >
                        {app.icon}
                      </div>
                      {app.name}
                    </label>
                  ))}
                </div>
              </FilterDropdown>
            </div>
          </>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Button variant="outline" size="sm" disabled className="h-8 text-xs">
          Apply
        </Button>
        <button
          onClick={() => {
            setSelectedActivities(new Set())
            setSelectedActors(new Set())
            setSelectedIps(new Set())
            setSelectedApps(new Set())
            setDateValue("7")
            setDateUnit("days")
            setDateMode("within")
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Reset
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Showing 0 activities</span>
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Date</th>
              <th className="px-4 py-2.5 text-left font-medium">Location</th>
              <th className="px-4 py-2.5 text-left font-medium">Actor</th>
              <th className="px-4 py-2.5 text-left font-medium">Activity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-sm text-muted-foreground italic"
              >
                No events
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Feedback */}
      <div className="mt-6 flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          Did you find what you were looking for?
        </span>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          Yes
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          No
        </Button>
        <button type="button" className="text-sm text-blue-600 hover:underline">
          Give feedback or suggestions
        </button>
      </div>
    </div>
  )
}
