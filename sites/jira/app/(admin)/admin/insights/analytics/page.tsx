"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const tabs = [
  { id: "ai-usage", label: "AI usage" },
  { id: "users", label: "Users" },
  { id: "user-security", label: "User security" },
  { id: "mobile-usage", label: "Mobile usage" },
  { id: "user-activity", label: "User activity" },
  { id: "jira-usage", label: "Jira usage" },
]

function DataTableModal({
  title,
  onClose,
}: {
  title: string
  onClose: () => void
}) {
  const [page, setPage] = useState(1)
  const perPage = 10
  // Generate 90 days of sample data
  const allRows = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(2026, 0, 8 + i)
    return {
      app: "Jira (bef43714-49b9-43e9-9f83-3e75487b6553)",
      date: d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      value: i >= 80 ? 1 : 0,
    }
  })
  const totalPages = Math.ceil(allRows.length / perPage)
  const rows = allRows.slice((page - 1) * perPage, page * perPage)

  const pageNumbers = () => {
    const pages: (number | string)[] = []
    for (let i = 1; i <= totalPages; i++) {
      if (i <= 5 || i === totalPages || Math.abs(i - page) <= 1) {
        if (
          pages.length > 0 &&
          typeof pages[pages.length - 1] === "number" &&
          (pages[pages.length - 1] as number) < i - 1
        ) {
          pages.push("...")
        }
        pages.push(i)
      }
    }
    return pages
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="flex max-h-[80vh] flex-col p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b bg-muted/30">
                <th className="px-6 py-2.5 text-left font-medium">App</th>
                <th className="px-4 py-2.5 text-left font-medium">
                  Date range
                </th>
                <th className="px-4 py-2.5 text-left font-medium">
                  Total active users
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-6 py-3 text-sm">{row.app}</td>
                  <td className="px-4 py-3 text-sm">{row.date}</td>
                  <td className="px-4 py-3 text-sm">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex shrink-0 items-center justify-center gap-1 border-t px-6 py-3">
            <button
              className="rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent disabled:opacity-30"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              &lt;
            </button>
            {pageNumbers().map((p, i) =>
              typeof p === "string" ? (
                <span
                  key={`e${i}`}
                  className="px-1 text-sm text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  className={`rounded px-2.5 py-1 text-sm ${p === page ? "border border-blue-500 font-medium text-blue-600" : "text-muted-foreground hover:bg-accent"}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              className="rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent disabled:opacity-30"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function CardHeader({
  title,
  subtitle,
  children,
  extraMenuItems,
}: {
  title: string
  subtitle: string
  children?: React.ReactNode
  extraMenuItems?: { label: string; href?: string }[]
}) {
  const [showDataTable, setShowDataTable] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [patternFill, setPatternFill] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <div className="mb-6 rounded-lg border p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <div className="flex items-center gap-1">
          <button
            className="rounded p-1 text-muted-foreground hover:bg-accent"
            onClick={handleRefresh}
            title="Refresh"
          >
            <svg
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded p-1 text-muted-foreground hover:bg-accent">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {extraMenuItems?.map((item) =>
                item.href ? (
                  <DropdownMenuItem
                    key={item.label}
                    render={<Link href={item.href} />}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem key={item.label}>
                    {item.label}
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuItem onClick={() => setShowDataTable(true)}>
                View data table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPatternFill(!patternFill)}>
                {patternFill ? "Remove pattern fill" : "Apply pattern fill"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>
      {showDataTable && (
        <DataTableModal title={title} onClose={() => setShowDataTable(false)} />
      )}
      <div
        className={
          patternFill
            ? "[&_.chart-bar]:bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.3)_4px,rgba(255,255,255,0.3)_8px)] [&_.chart-fill]:bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.3)_4px,rgba(255,255,255,0.3)_8px)]"
            : ""
        }
      >
        {children}
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <svg
        className="mb-3 size-12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="8" x2="14" y2="14" />
        <line x1="14" y1="8" x2="8" y2="14" />
      </svg>
      <p className="text-sm">We have no insights to show yet</p>
    </div>
  )
}

function BarChart({
  label,
  value,
  xLabel,
}: {
  label: string
  value: number
  xLabel: string
}) {
  const yLabels = [1, 0.8, 0.6, 0.4, 0.2, 0]
  return (
    <div>
      <div className="flex">
        <div className="flex h-[250px] flex-col items-end justify-between py-1 pr-2 text-xs text-muted-foreground">
          {yLabels.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
        <div className="relative h-[250px] flex-1 border-b border-l">
          {/* Grid lines */}
          {yLabels.slice(0, -1).map((v, i) => (
            <div
              key={v}
              className="absolute w-full border-t border-dashed border-muted"
              style={{ top: `${(i / (yLabels.length - 1)) * 100}%` }}
            />
          ))}
          {/* Bar */}
          <div
            className="chart-bar absolute bottom-0 left-1/2 w-1/3 -translate-x-1/2 rounded-t-sm bg-blue-500"
            style={{ height: `${(value / 1) * 100}%` }}
          />
        </div>
      </div>
      <div className="mt-1 text-center">
        <p className="text-xs text-muted-foreground">{xLabel}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function LineChart() {
  // Simulated data points matching the screenshot
  const dates = [
    "Jan 07",
    "Jan 14",
    "Jan 21",
    "Jan 28",
    "Feb 04",
    "Feb 11",
    "Feb 18",
    "Feb 25",
    "Mar 04",
    "Mar 11",
    "Mar 18",
    "Mar 25",
    "Apr 01",
  ]
  const values = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 1]
  const maxVal = 1.2
  const yLabels = [1.2, 1, 0.8, 0.6, 0.4, 0.2, 0]

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-blue-500" />
          <span className="text-xs text-muted-foreground">
            Jira (bef43714-49b...
          </span>
        </div>
      </div>
      <div className="flex">
        <div className="flex h-[280px] flex-col items-end justify-between py-1 pr-2 text-xs text-muted-foreground">
          <span className="absolute top-1/2 -left-4 origin-right -translate-y-1/2 -rotate-90 text-[10px] font-medium whitespace-nowrap text-muted-foreground">
            Total active users
          </span>
          {yLabels.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
        <div className="relative ml-4 h-[280px] flex-1 border-b border-l">
          {/* Grid lines */}
          {yLabels.slice(0, -1).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-dashed border-muted"
              style={{ top: `${(i / (yLabels.length - 1)) * 100}%` }}
            />
          ))}
          {/* Line path */}
          <svg
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox={`0 0 ${dates.length - 1} ${maxVal}`}
          >
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="0.03"
              points={values.map((v, i) => `${i},${maxVal - v}`).join(" ")}
            />
          </svg>
        </div>
      </div>
      <div className="mt-1 ml-10 flex justify-between">
        {dates.map((d, i) => (
          <span
            key={i}
            className="text-[10px] text-muted-foreground"
            style={{ width: `${100 / dates.length}%`, textAlign: "center" }}
          >
            {i % 2 === 0 ? d : ""}
          </span>
        ))}
      </div>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Date range
      </p>
    </div>
  )
}

function DonutChart() {
  return (
    <div className="flex items-center justify-center gap-12 py-8">
      <div className="relative">
        <svg className="size-48" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="14"
          />
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#84cc16"
            strokeWidth="14"
            strokeDasharray="301.6"
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">0%</span>
          <span className="text-xs text-muted-foreground">
            total managed users
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="size-3 rounded-sm bg-blue-600" />
          <span>Managed accounts (0 of 1 user)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="size-3 rounded-sm bg-lime-500" />
          <span>External users (1 of 1 user)</span>
        </div>
      </div>
    </div>
  )
}

function FeedbackBar() {
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)

  if (feedbackSent) {
    return (
      <div className="mt-6 flex items-center gap-2 border-t pt-4">
        <svg
          className="size-4 text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span className="text-sm text-muted-foreground">
          Thanks for your feedback!
        </span>
      </div>
    )
  }

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Are these insights helpful?
        </span>
        <Button
          variant={feedback === "yes" ? "default" : "outline"}
          size="sm"
          onClick={() => setFeedback("yes")}
          className={
            feedback === "yes" ? "bg-blue-600 text-white hover:bg-blue-700" : ""
          }
        >
          Yes
        </Button>
        <Button
          variant={feedback === "no" ? "default" : "outline"}
          size="sm"
          onClick={() => setFeedback("no")}
          className={
            feedback === "no" ? "bg-blue-600 text-white hover:bg-blue-700" : ""
          }
        >
          No
        </Button>
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => setShowFeedbackForm(!showFeedbackForm)}
        >
          Give feedback or make suggestions for future insights
        </button>
      </div>
      {showFeedbackForm && (
        <div className="mt-4 max-w-lg">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us what you think or suggest improvements..."
            rows={3}
            className="mb-3 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                setFeedbackSent(true)
                setShowFeedbackForm(false)
              }}
            >
              Submit feedback
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFeedbackForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ActiveUsersByAppCard() {
  const [error, setError] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleRetry = () => {
    setLoading(true)
    setError(false)
    setTimeout(() => {
      setLoading(false)
      // Simulate successful load after retry
    }, 1500)
  }

  return (
    <div className="mb-6 rounded-lg border p-6">
      <h3 className="mb-2 text-base font-semibold">Active users by app</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        For each app we show the number of active users out of the all the users
        for the selected time range. Active users include users who have been
        active during the selected time range, even if currently deactivated.
      </p>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">App</th>
              <th className="px-4 py-2.5 text-left font-medium">
                Active users
              </th>
              <th className="px-4 py-2.5 text-left font-medium">User lists</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center">
                  <svg
                    className="mx-auto mb-2 size-6 animate-spin text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Loading data...
                  </p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <svg
                        className="size-5 text-amber-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                      </svg>
                      <span className="text-sm">
                        We ran into an issue loading this data
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                      Try again
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                      <svg className="size-3" viewBox="0 0 32 32" fill="white">
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                    </div>
                    <span>Jira</span>
                  </div>
                </td>
                <td className="px-4 py-3">1 of 1</td>
                <td className="px-4 py-3">
                  <button className="text-sm text-blue-600 hover:underline">
                    View user list
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function JiraUsageTab() {
  const [jiraUsagePeriod, setJiraUsagePeriod] = useState("4weeks")
  const [jiraIssuesPeriod, setJiraIssuesPeriod] = useState("4weeks")
  const periodOptions = [
    { value: "4weeks", label: "Last 4 weeks" },
    { value: "3months", label: "Last 3 months" },
    { value: "12months", label: "Last 12 months" },
  ]
  return (
    <>
      <CardHeader
        title="Jira usage activity"
        subtitle="This chart compares the number of active users who have logged into your Jira instances with the number of seats that you've paid for."
        extraMenuItems={[{ label: "View users", href: "/admin/directory" }]}
      >
        <div className="mb-4">
          <DropdownButton
            label="calendar"
            value={jiraUsagePeriod}
            onChange={setJiraUsagePeriod}
            options={periodOptions}
          />
        </div>
        <EmptyChart />
      </CardHeader>

      <CardHeader
        title="Jira issues activity"
        subtitle="This chart compares the number of issues marked as done with the number of issues created across all your Jira instances."
      >
        <div className="mb-4">
          <DropdownButton
            label="calendar"
            value={jiraIssuesPeriod}
            onChange={setJiraIssuesPeriod}
            options={periodOptions}
          />
        </div>
        <EmptyChart />
      </CardHeader>

      <FeedbackBar />
    </>
  )
}

function DropdownButton({
  label,
  options,
  value,
  onChange,
}: {
  label?: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(!open)}
      >
        {label && (
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )}
        {selected?.label ?? value}
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-9 left-0 z-50 min-w-[180px] rounded-md border bg-popover shadow-md">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`w-full px-4 py-2 text-left text-sm hover:bg-accent ${o.value === value ? "bg-blue-50 font-medium text-blue-600" : ""}`}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [timePeriod, setTimePeriod] = useState("3months")
  const [appFilter, setAppFilter] = useState("all")
  const [aiTimePeriod, setAiTimePeriod] = useState("4weeks")
  const [aiSiteFilter, setAiSiteFilter] = useState("all")

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Analytics</h1>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        View analytics for insights about the users of your organization&apos;s
        Atlassian apps and your security practices.{" "}
        <Link
          href="/admin/insights/analytics"
          className="text-blue-600 hover:underline"
        >
          Tell me more about organizational insights.
        </Link>
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Usage tab */}
      {activeTab === "ai-usage" && (
        <>
          <CardHeader
            title="Active AI users"
            subtitle="Monthly active users who used AI-enabled features at least once across any apps with AI activated."
          >
            <div className="mb-4 flex items-center gap-3">
              <DropdownButton
                label="calendar"
                value={aiTimePeriod}
                onChange={setAiTimePeriod}
                options={[
                  { value: "4weeks", label: "Last 4 weeks" },
                  { value: "3months", label: "Last 3 months" },
                  { value: "12months", label: "Last 12 months" },
                ]}
              />
              <DropdownButton
                value={aiSiteFilter}
                onChange={setAiSiteFilter}
                options={[
                  { value: "all", label: "All sites" },
                  {
                    value: "abhisheksharma67185",
                    label: "abhisheksharma67185",
                  },
                ]}
              />
            </div>
            <EmptyChart />
          </CardHeader>
          <FeedbackBar />
        </>
      )}

      {/* Users tab */}
      {activeTab === "users" && (
        <>
          {/* Verify domain banner */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 px-5 py-4 dark:border-purple-800 dark:bg-purple-950/20">
            <svg
              className="mt-0.5 size-5 shrink-0 text-purple-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.73V17h8v-2.27A7 7 0 0 0 12 2z" />
            </svg>
            <div>
              <p className="text-sm">
                Verify a domain and claim accounts to gain more control over
                user accounts in your organization.
              </p>
              <Link
                href="/admin/domains"
                className="text-sm text-blue-600 hover:underline"
              >
                Verify a domain
              </Link>
            </div>
          </div>

          <CardHeader
            title="Domains with access to your apps"
            subtitle="Number of users from each domain based on Atlassian account email addresses with access to your apps."
          >
            <BarChart label="Domains" value={1} xLabel="gmail.com" />
          </CardHeader>

          <CardHeader
            title="Users with access to your apps"
            subtitle="User totals include managed accounts and external users with access to your organization's apps."
          >
            <DonutChart />
          </CardHeader>

          <FeedbackBar />
        </>
      )}

      {/* User security tab */}
      {activeTab === "user-security" && (
        <>
          <CardHeader
            title="Authentication for managed accounts"
            subtitle="User totals show how your users log in to their Atlassian accounts."
            extraMenuItems={[
              {
                label: "View managed accounts",
                href: "/admin/managed-accounts",
              },
              {
                label: "View identity providers",
                href: "/admin/security/user-security/identity-providers",
              },
            ]}
          >
            <EmptyChart />
          </CardHeader>

          <CardHeader
            title="Two-step verification for external users"
            subtitle="Your external user security policy may require external users to log in with two-step verification."
            extraMenuItems={[
              {
                label: "View external user settings",
                href: "/admin/security/user-security/external-users",
              },
            ]}
          >
            <div className="mb-4 flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-sm bg-blue-600" />
                <span>Two-step verification not enabled 1/1</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-sm bg-lime-500" />
                <span>Two-step verification enabled 0/1</span>
              </div>
            </div>
            {/* Stacked bar */}
            <div className="chart-bar flex h-10 items-center rounded-md bg-blue-500 px-3">
              <span className="text-sm font-medium text-white">100%</span>
            </div>
          </CardHeader>

          <FeedbackBar />
        </>
      )}

      {/* Mobile usage tab */}
      {activeTab === "mobile-usage" && (
        <>
          <CardHeader
            title="Mobile app usage"
            subtitle="Number of mobile users using Atlassian mobile apps."
            extraMenuItems={[
              {
                label: "View mobile app policies",
                href: "/admin/security/device-security/mobile-app-policies",
              },
            ]}
          >
            <div className="flex">
              <div className="flex h-[280px] flex-col items-end justify-between py-1 pr-2 text-xs text-muted-foreground">
                <span className="absolute top-1/2 -left-4 origin-right -translate-y-1/2 -rotate-90 text-[10px] font-medium whitespace-nowrap text-muted-foreground">
                  Total users
                </span>
                {[1, 0.8, 0.6, 0.4, 0.2, 0].map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
              <div className="relative ml-4 h-[280px] flex-1 border-b border-l">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-dashed border-muted"
                    style={{ top: `${(i / 5) * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Apps
            </p>
          </CardHeader>

          <FeedbackBar />
        </>
      )}

      {/* User activity tab */}
      {activeTab === "user-activity" && (
        <>
          <div className="mb-6 flex items-center gap-3">
            <Select
              value={timePeriod}
              onValueChange={(v) => v && setTimePeriod(v)}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <svg
                  className="mr-1.5 size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last 1 month</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={appFilter}
              onValueChange={(v) => v && setAppFilter(v)}
            >
              <SelectTrigger className="h-9 w-[200px]">
                <svg
                  className="mr-1.5 size-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select apps: All apps</SelectItem>
                <SelectItem value="jira">Jira</SelectItem>
                <SelectItem value="confluence">Confluence</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CardHeader
            title="Active users"
            subtitle="An active user is a user who logs in to an app during the selected date range. This chart shows the number of active users of the first five apps you select."
          >
            <LineChart />
          </CardHeader>

          <ActiveUsersByAppCard />

          <FeedbackBar />
        </>
      )}

      {/* Jira usage tab */}
      {activeTab === "jira-usage" && <JiraUsageTab />}
    </div>
  )
}
