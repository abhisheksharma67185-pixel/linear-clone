"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

type FilterName = "app" | "deployment" | "connectivity" | "insight"

const APPS_DATA = [
  {
    name: "Jira",
    url: "https://abhisheksharma67185.atlassian.net",
    deployment: "Cloud",
    connectivityStatus: "",
    insightStatus: "",
    goToUrl: "/",
  },
]

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  isOpen,
  onOpenChange,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onToggle: (value: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onOpenChange])

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          onOpenChange(!isOpen)
          setSearch("")
        }}
        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
          isOpen
            ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/30"
            : selected.size > 0
              ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/30"
              : "border-input text-foreground hover:bg-accent"
        }`}
      >
        {label}
        {selected.size > 0 && (
          <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
            {selected.size}
          </span>
        )}
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-2 py-1.5">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <svg
              className="size-3.5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-2 text-center text-sm text-muted-foreground">
                No matches found
              </p>
            ) : (
              filtered.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(option)}
                    onChange={() => onToggle(option)}
                    className="size-3.5 rounded border-input accent-blue-600"
                  />
                  {option}
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ActionsDropdown({
  appName,
  goToUrl,
}: {
  appName: string
  goToUrl: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className="relative inline-flex justify-end" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`rounded-md border p-1 text-muted-foreground transition-colors ${
          open
            ? "border-blue-600 bg-accent"
            : "border-transparent hover:bg-accent"
        }`}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-40 rounded-md border bg-popover shadow-md">
          <a
            href={goToUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            Go to {appName}
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}

function MoreActionsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`rounded-md border p-1.5 text-muted-foreground transition-colors ${
          open ? "border-input bg-accent" : "border-transparent hover:bg-accent"
        }`}
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-56 rounded-md border bg-popover py-1 shadow-md">
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            Upload assessment file
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            Export to CSV
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            Manage data residency
          </button>
          <a
            href="/admin/settings"
            className="flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            Manage connections
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}

export default function PortfolioInsightsPage() {
  const [activeTab, setActiveTab] = useState<"apps" | "detected">("apps")
  const [view, setView] = useState<"main" | "hidden">("main")
  const [searchUrl, setSearchUrl] = useState("")
  const [sortAsc, setSortAsc] = useState(true)
  const [openFilter, setOpenFilter] = useState<FilterName | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)

  // Filter selections
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set())
  const [selectedDeployments, setSelectedDeployments] = useState<Set<string>>(
    new Set()
  )
  const [selectedConnectivity, setSelectedConnectivity] = useState<Set<string>>(
    new Set()
  )
  const [selectedInsight, setSelectedInsight] = useState<Set<string>>(new Set())

  // Detected apps tab filters
  const [detectedSearchUrl, setDetectedSearchUrl] = useState("")
  const [detectedOpenFilter, setDetectedOpenFilter] =
    useState<FilterName | null>(null)
  const [detectedSelectedApps, setDetectedSelectedApps] = useState<Set<string>>(
    new Set()
  )
  const [detectedSelectedDeployments, setDetectedSelectedDeployments] =
    useState<Set<string>>(new Set())

  // Hidden apps view filters
  const [hiddenSearchUrl, setHiddenSearchUrl] = useState("")
  const [hiddenOpenFilter, setHiddenOpenFilter] = useState<FilterName | null>(
    null
  )
  const [hiddenSelectedApps, setHiddenSelectedApps] = useState<Set<string>>(
    new Set()
  )
  const [hiddenSelectedDeployments, setHiddenSelectedDeployments] = useState<
    Set<string>
  >(new Set())

  const toggleInSet = (set: Set<string>, value: string): Set<string> => {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  // Derive unique filter options from data
  const appOptions = [...new Set(APPS_DATA.map((a) => a.name))]
  const deploymentOptions = [...new Set(APPS_DATA.map((a) => a.deployment))]
  const connectivityOptions = [
    ...new Set(APPS_DATA.map((a) => a.connectivityStatus).filter(Boolean)),
  ]
  const insightOptions = [
    ...new Set(APPS_DATA.map((a) => a.insightStatus).filter(Boolean)),
  ]

  // Filter the data
  const filteredApps = APPS_DATA.filter((app) => {
    if (searchUrl && !app.url.toLowerCase().includes(searchUrl.toLowerCase()))
      return false
    if (selectedApps.size > 0 && !selectedApps.has(app.name)) return false
    if (
      selectedDeployments.size > 0 &&
      !selectedDeployments.has(app.deployment)
    )
      return false
    if (
      selectedConnectivity.size > 0 &&
      app.connectivityStatus &&
      !selectedConnectivity.has(app.connectivityStatus)
    )
      return false
    if (
      selectedInsight.size > 0 &&
      app.insightStatus &&
      !selectedInsight.has(app.insightStatus)
    )
      return false
    return true
  }).sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  )

  // Feedback form state
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Hidden apps view
  if (view === "hidden") {
    return (
      <div className="max-w-5xl p-8">
        {/* Breadcrumb + Header */}
        <div className="mb-1">
          <button
            onClick={() => setView("main")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Portfolio insights
          </button>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Hidden apps</h1>
          <div className="flex items-center gap-2">
            {/* Give Feedback Dialog */}
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-1.5" />
                }
              >
                <svg
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Give feedback
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Give feedback</DialogTitle>
                  <DialogDescription>
                    Help us improve Portfolio insights. Share your experience,
                    report bugs, or suggest new features.
                  </DialogDescription>
                </DialogHeader>
                {feedbackSubmitted ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <svg
                      className="size-10 text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <p className="text-sm font-medium">
                      Thank you for your feedback!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      We appreciate you taking the time to help us improve.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <label
                        className="text-xs font-medium"
                        htmlFor="feedback-hidden"
                      >
                        Your feedback
                      </label>
                      <textarea
                        id="feedback-hidden"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Tell us what you think about Portfolio insights..."
                        className="min-h-[100px] resize-none rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFeedbackOpen(false)
                          setFeedbackText("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => {
                          setFeedbackSubmitted(true)
                          setTimeout(() => {
                            setFeedbackOpen(false)
                            setFeedbackSubmitted(false)
                            setFeedbackText("")
                          }, 2000)
                        }}
                        disabled={!feedbackText.trim()}
                      >
                        Submit feedback
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Connect Data Center Dialog */}
            <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-blue-600 text-white hover:bg-blue-700" />
                }
              >
                Connect Data Center
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Connect Data Center</DialogTitle>
                  <DialogDescription>
                    Connect your Atlassian Data Center instance to get insights
                    and recommendations on performance and cloud readiness.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      htmlFor="dc-url-hidden"
                    >
                      Data Center URL
                    </label>
                    <Input
                      id="dc-url-hidden"
                      placeholder="https://your-instance.atlassian.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-medium"
                      htmlFor="dc-token-hidden"
                    >
                      Access token
                    </label>
                    <Input
                      id="dc-token-hidden"
                      type="password"
                      placeholder="Enter your access token"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConnectOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Connect
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* More actions */}
            <MoreActionsDropdown />
          </div>
        </div>

        {/* Tip banner */}
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-950/20">
          <svg
            className="size-5 shrink-0 text-purple-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <p className="text-sm">
            Get insights and recommendations on how to improve your Data Center
            performance and cloud readiness.{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => setConnectOpen(true)}
            >
              Connect Data Center
            </button>
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-6 border-b">
          <button
            onClick={() => {
              setActiveTab("apps")
              setView("main")
            }}
            className="pb-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Apps
          </button>
          <button className="border-b-2 border-blue-600 pb-2.5 text-sm font-medium text-blue-600 transition-colors">
            Detected apps
          </button>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Atlassian apps that we detected based on app links and license
          records.
        </p>

        {/* Filters - no Restore hidden on this view */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative max-w-xs flex-1">
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
              placeholder="Find by URL"
              className="pl-9"
              value={hiddenSearchUrl}
              onChange={(e) => setHiddenSearchUrl(e.target.value)}
            />
          </div>
          <FilterDropdown
            label="App"
            options={[]}
            selected={hiddenSelectedApps}
            onToggle={(v) =>
              setHiddenSelectedApps(toggleInSet(hiddenSelectedApps, v))
            }
            isOpen={hiddenOpenFilter === "app"}
            onOpenChange={(o) => setHiddenOpenFilter(o ? "app" : null)}
          />
          <FilterDropdown
            label="Deployment"
            options={[]}
            selected={hiddenSelectedDeployments}
            onToggle={(v) =>
              setHiddenSelectedDeployments(
                toggleInSet(hiddenSelectedDeployments, v)
              )
            }
            isOpen={hiddenOpenFilter === "deployment"}
            onOpenChange={(o) => setHiddenOpenFilter(o ? "deployment" : null)}
          />
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing 0 results out of 0 items</span>
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
                <th className="px-4 py-2.5 text-left font-medium">App</th>
                <th className="px-4 py-2.5 text-left font-medium">
                  Deployment
                </th>
                <th className="px-4 py-2.5 text-left font-medium">
                  <div className="flex items-center gap-1">
                    Detected on
                    <svg
                      className="size-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14" />
                      <path d="M19 12l-7 7-7-7" />
                    </svg>
                  </div>
                </th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    No discarded app suggestions
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Main view
  return (
    <div className="max-w-5xl p-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portfolio insights</h1>
        <div className="flex items-center gap-2">
          {/* Give Feedback Dialog */}
          <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm" className="gap-1.5" />
              }
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Give feedback
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Give feedback</DialogTitle>
                <DialogDescription>
                  Help us improve Portfolio insights. Share your experience,
                  report bugs, or suggest new features.
                </DialogDescription>
              </DialogHeader>
              {feedbackSubmitted ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <svg
                    className="size-10 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-sm font-medium">
                    Thank you for your feedback!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    We appreciate you taking the time to help us improve.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" htmlFor="feedback">
                      Your feedback
                    </label>
                    <textarea
                      id="feedback"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us what you think about Portfolio insights..."
                      className="min-h-[100px] resize-none rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFeedbackOpen(false)
                        setFeedbackText("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => {
                        setFeedbackSubmitted(true)
                        setTimeout(() => {
                          setFeedbackOpen(false)
                          setFeedbackSubmitted(false)
                          setFeedbackText("")
                        }, 2000)
                      }}
                      disabled={!feedbackText.trim()}
                    >
                      Submit feedback
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Connect Data Center Dialog */}
          <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
            <DialogTrigger
              render={
                <Button className="bg-blue-600 text-white hover:bg-blue-700" />
              }
            >
              Connect Data Center
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Connect Data Center</DialogTitle>
                <DialogDescription>
                  Connect your Atlassian Data Center instance to get insights
                  and recommendations on performance and cloud readiness.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" htmlFor="dc-url">
                    Data Center URL
                  </label>
                  <Input
                    id="dc-url"
                    placeholder="https://your-instance.atlassian.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" htmlFor="dc-token">
                    Access token
                  </label>
                  <Input
                    id="dc-token"
                    type="password"
                    placeholder="Enter your access token"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConnectOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Connect
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* More actions */}
          <MoreActionsDropdown />
        </div>
      </div>

      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        Manage and optimize your Atlassian portfolio by adding, discovering, and
        assessing your Atlassian apps for cloud readiness and instance
        optimization.{" "}
        <button type="button" className="text-blue-600 hover:underline">
          Get started with Portfolio insights
        </button>
      </p>

      {/* Tip banner */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-950/20">
        <svg
          className="size-5 shrink-0 text-purple-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <p className="text-sm">
          Get insights and recommendations on how to improve your Data Center
          performance and cloud readiness.{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => setConnectOpen(true)}
          >
            Connect Data Center
          </button>
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("apps")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            activeTab === "apps"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Apps
        </button>
        <button
          onClick={() => setActiveTab("detected")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            activeTab === "detected"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Detected apps
        </button>
      </div>

      {activeTab === "apps" ? (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Atlassian apps that you connected to or confirmed as part of your
            portfolio.
          </p>

          {/* Filters */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative max-w-xs flex-1">
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
                placeholder="Find by URL"
                className="pl-9"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
              />
            </div>
            <FilterDropdown
              label="App"
              options={appOptions}
              selected={selectedApps}
              onToggle={(v) => setSelectedApps(toggleInSet(selectedApps, v))}
              isOpen={openFilter === "app"}
              onOpenChange={(o) => setOpenFilter(o ? "app" : null)}
            />
            <FilterDropdown
              label="Deployment"
              options={deploymentOptions}
              selected={selectedDeployments}
              onToggle={(v) =>
                setSelectedDeployments(toggleInSet(selectedDeployments, v))
              }
              isOpen={openFilter === "deployment"}
              onOpenChange={(o) => setOpenFilter(o ? "deployment" : null)}
            />
            <FilterDropdown
              label="Connectivity status"
              options={connectivityOptions}
              selected={selectedConnectivity}
              onToggle={(v) =>
                setSelectedConnectivity(toggleInSet(selectedConnectivity, v))
              }
              isOpen={openFilter === "connectivity"}
              onOpenChange={(o) => setOpenFilter(o ? "connectivity" : null)}
            />
            <FilterDropdown
              label="Insight status"
              options={insightOptions}
              selected={selectedInsight}
              onToggle={(v) =>
                setSelectedInsight(toggleInSet(selectedInsight, v))
              }
              isOpen={openFilter === "insight"}
              onOpenChange={(o) => setOpenFilter(o ? "insight" : null)}
            />
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {filteredApps.length} result
              {filteredApps.length !== 1 ? "s" : ""} out of {APPS_DATA.length}{" "}
              item{APPS_DATA.length !== 1 ? "s" : ""}
            </span>
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
                  <th className="px-4 py-2.5 text-left font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => setSortAsc(!sortAsc)}
                    >
                      App
                      <svg
                        className={`size-3 transition-transform ${!sortAsc ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14" />
                        <path d="M19 12l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    Deployment
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    Connectivity status
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    Insight status
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-sm text-muted-foreground italic">
                        No apps match your filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr
                      key={app.name}
                      className="border-b transition-colors last:border-b-0 hover:bg-accent/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                            <svg
                              className="size-4"
                              viewBox="0 0 32 32"
                              fill="white"
                            >
                              <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{app.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {app.url}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{app.deployment}</td>
                      <td className="px-4 py-3 text-sm">
                        {app.connectivityStatus}
                      </td>
                      <td className="px-4 py-3 text-sm">{app.insightStatus}</td>
                      <td className="px-4 py-3 text-right">
                        <ActionsDropdown
                          appName={app.name}
                          goToUrl={app.goToUrl}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Atlassian apps that we detected based on app links and license
            records.
          </p>

          {/* Filters */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative max-w-xs flex-1">
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
                placeholder="Find by URL"
                className="pl-9"
                value={detectedSearchUrl}
                onChange={(e) => setDetectedSearchUrl(e.target.value)}
              />
            </div>
            <FilterDropdown
              label="App"
              options={[]}
              selected={detectedSelectedApps}
              onToggle={(v) =>
                setDetectedSelectedApps(toggleInSet(detectedSelectedApps, v))
              }
              isOpen={detectedOpenFilter === "app"}
              onOpenChange={(o) => setDetectedOpenFilter(o ? "app" : null)}
            />
            <FilterDropdown
              label="Deployment"
              options={[]}
              selected={detectedSelectedDeployments}
              onToggle={(v) =>
                setDetectedSelectedDeployments(
                  toggleInSet(detectedSelectedDeployments, v)
                )
              }
              isOpen={detectedOpenFilter === "deployment"}
              onOpenChange={(o) =>
                setDetectedOpenFilter(o ? "deployment" : null)
              }
            />
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setView("hidden")}
              >
                <svg
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                Restore hidden
              </Button>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing 0 results out of 0 items</span>
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
                  <th className="px-4 py-2.5 text-left font-medium">App</th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    Deployment
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    <div className="flex items-center gap-1">
                      Detected on
                      <svg
                        className="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14" />
                        <path d="M19 12l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground italic">
                      No detected apps yet. We&apos;ll notify you if we find
                      anything
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
