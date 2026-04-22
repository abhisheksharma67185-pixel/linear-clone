"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AppEntry {
  id: string
  name: string
  product: string
  iconType: "goals" | "jira" | "projects"
  location: string
  pinnedApps: string
  marketplaceStatus: string
  canSetLocation: boolean
}

const LOCATIONS = [
  "United States",
  "Europe (Germany)",
  "Europe (Ireland)",
  "Australia",
  "Canada",
  "United Kingdom",
  "India",
  "Japan",
  "Singapore",
  "South Korea",
]

const initialApps: AppEntry[] = [
  {
    id: "goals",
    name: "abhisheksharma67185.atlassian.net",
    product: "Goals",
    iconType: "goals",
    location: "Not set",
    pinnedApps: "No apps",
    marketplaceStatus: "Not applicable",
    canSetLocation: false,
  },
  {
    id: "jira",
    name: "abhisheksharma67185.atlassian.net",
    product: "Jira",
    iconType: "jira",
    location: "Not set",
    pinnedApps: "No apps",
    marketplaceStatus: "Not applicable",
    canSetLocation: true,
  },
  {
    id: "projects",
    name: "abhisheksharma67185.atlassian.net",
    product: "Projects",
    iconType: "projects",
    location: "Not set",
    pinnedApps: "No apps",
    marketplaceStatus: "Not applicable",
    canSetLocation: false,
  },
]

function AppIcon({ type }: { type: "goals" | "jira" | "projects" }) {
  if (type === "jira") {
    return (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-4" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    )
  }
  if (type === "projects") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    )
  }
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-muted">
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
  )
}

const MOVE_WINDOWS = [
  "As soon as possible",
  "This weekend (Saturday 2:00 AM UTC)",
  "Next weekend (Saturday 2:00 AM UTC)",
  "In 2 weeks (Saturday 2:00 AM UTC)",
  "Custom date and time",
]

export default function DataResidencyPage() {
  const [search, setSearch] = useState("")
  const [apps, setApps] = useState<AppEntry[]>(initialApps)
  const [showLocationPicker, setShowLocationPicker] = useState<string | null>(
    null
  )
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedMoveWindow, setSelectedMoveWindow] = useState("")
  const [locationStep, setLocationStep] = useState(0)
  const [actionsOpen, setActionsOpen] = useState<string | null>(null)
  const [showExplore, setShowExplore] = useState(false)
  const [showAppDetails, setShowAppDetails] = useState<string | null>(null)

  const pinnedCount = apps.filter((a) => a.location !== "Not set").length

  const filteredApps = apps.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.name.toLowerCase().includes(q) ||
      a.product.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q)
    )
  })

  const openLocationPicker = (appId: string) => {
    setSelectedLocation("")
    setSelectedMoveWindow("")
    setLocationStep(0)
    setShowLocationPicker(appId)
    setActionsOpen(null)
  }

  const closeLocationPicker = () => {
    setShowLocationPicker(null)
    setSelectedLocation("")
    setSelectedMoveWindow("")
    setLocationStep(0)
  }

  const submitLocationChange = () => {
    if (!showLocationPicker || !selectedLocation) return
    setApps(
      apps.map((a) =>
        a.id === showLocationPicker ? { ...a, location: selectedLocation } : a
      )
    )
    closeLocationPicker()
  }

  // Explore data residency overlay
  if (showExplore) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <div className="border-b bg-[#0052CC]">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
            <span className="text-lg font-bold text-white">
              Atlassian Support
            </span>
            <button
              onClick={() => setShowExplore(false)}
              className="text-sm text-white/70 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-8 pt-8 pb-16">
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => setShowExplore(false)}
              className="hover:text-foreground"
            >
              Atlassian Support
            </button>
            <span>/</span>
            <span>Organization administration Resources</span>
          </div>

          <h1 className="mb-8 text-2xl font-bold">Data residency</h1>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "What is data residency?",
                description:
                  "Learn what data residency means and how it applies to your Atlassian apps.",
              },
              {
                title: "Set or change your data residency",
                description:
                  "Learn how to set a location for your in-scope Atlassian app data.",
              },
              {
                title: "Supported products and locations",
                description:
                  "View the list of supported products and available data residency locations.",
              },
              {
                title: "Data residency for Marketplace apps",
                description:
                  "Learn how data residency works with Marketplace apps.",
              },
              {
                title: "Data residency FAQs",
                description:
                  "Find answers to common questions about data residency.",
              },
              {
                title: "Data residency and compliance",
                description:
                  "Understand how data residency helps meet regulatory requirements.",
              },
            ].map((topic) => (
              <div
                key={topic.title}
                className="rounded-lg border p-6 transition-colors hover:bg-muted/30"
              >
                <h3 className="mb-2 text-base font-semibold">{topic.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {topic.description}
                </p>
                <Button variant="outline" size="sm">
                  View topic
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // View app details overlay
  if (showAppDetails) {
    const app = apps.find((a) => a.id === showAppDetails)
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <button
          onClick={() => setShowAppDetails(null)}
          className="absolute top-6 left-6 rounded p-1.5 text-muted-foreground hover:bg-accent"
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mx-auto max-w-2xl px-8 pt-24 pb-16">
          <div className="mb-8 flex items-center gap-4">
            <AppIcon type={app?.iconType ?? "goals"} />
            <div>
              <h1 className="text-2xl font-bold">{app?.name}</h1>
              <p className="text-muted-foreground">{app?.product}</p>
            </div>
          </div>

          <div className="divide-y rounded-md border">
            <div className="flex justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Data residency location
              </span>
              <span className="text-sm font-medium">{app?.location}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Pinned Marketplace apps
              </span>
              <span className="text-sm">{app?.pinnedApps}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Marketplace apps status
              </span>
              <span className="text-sm">{app?.marketplaceStatus}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                0 installed Marketplace apps
              </span>
            </div>
          </div>

          {app?.canSetLocation && (
            <div className="mt-6">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setShowAppDetails(null)
                  openLocationPicker(app.id)
                }}
              >
                {app.location === "Not set"
                  ? "Set location"
                  : "Change location"}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Set location — full-screen 3-step wizard
  if (showLocationPicker) {
    const app = apps.find((a) => a.id === showLocationPicker)
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <button
          onClick={closeLocationPicker}
          className="absolute top-6 left-6 rounded p-1.5 text-muted-foreground hover:bg-accent"
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mx-auto max-w-3xl px-8 pt-24 pb-32">
          <h1 className="mb-3 text-2xl font-bold">
            Change data residency location
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            To change your Atlassian app&apos;s location to a new data residency
            location, select your preferred move window and submit the move
            request.{" "}
            <button type="button" className="text-blue-600 hover:underline">
              Learn more about how we manage your data residency move
            </button>
          </p>

          {/* App info */}
          <div className="mb-1 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <AppIcon type={app?.iconType ?? "goals"} />
              <div>
                <p className="text-sm font-medium">{app?.name}</p>
                <p className="text-xs text-muted-foreground">{app?.product}</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {app?.location}
            </span>
          </div>
          <p className="mb-8 text-sm text-muted-foreground">
            0 installed Marketplace apps
          </p>

          {/* Step 0: Intro with 3 steps visual */}
          {locationStep === 0 && (
            <div>
              <div className="mb-10 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="mb-4 flex items-center justify-center">
                    <svg className="size-16" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="28" r="10" fill="#FFC400" />
                      <path
                        d="M32 38c-8 0-14 4-14 8v2h28v-2c0-4-6-8-14-8z"
                        fill="#FFC400"
                      />
                      <circle cx="24" cy="20" r="4" fill="#FF5630" />
                      <path d="M24 20v12" stroke="#0052CC" strokeWidth="2" />
                      <circle cx="24" cy="32" r="3" fill="#0052CC" />
                    </svg>
                  </div>
                  <h3 className="mb-1 text-sm font-semibold">
                    Select a location
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select a location for this Atlassian app
                  </p>
                </div>

                <div className="flex items-start">
                  <svg
                    className="mt-8 -ml-2 size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                  <div className="flex-1 text-center">
                    <div className="mb-4 flex items-center justify-center">
                      <svg className="size-16" viewBox="0 0 64 64" fill="none">
                        <rect
                          x="12"
                          y="12"
                          width="40"
                          height="36"
                          rx="4"
                          fill="#FF8B00"
                        />
                        <rect
                          x="16"
                          y="8"
                          width="32"
                          height="8"
                          rx="2"
                          fill="#FFAB00"
                        />
                        <rect
                          x="20"
                          y="22"
                          width="8"
                          height="8"
                          rx="1"
                          fill="white"
                        />
                        <rect
                          x="32"
                          y="22"
                          width="8"
                          height="8"
                          rx="1"
                          fill="white"
                        />
                        <rect
                          x="20"
                          y="34"
                          width="8"
                          height="8"
                          rx="1"
                          fill="white"
                        />
                        <rect
                          x="32"
                          y="34"
                          width="8"
                          height="8"
                          rx="1"
                          fill="#0052CC"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold">
                      Select a move window
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select a time to schedule your data residency move
                    </p>
                  </div>
                  <svg
                    className="mt-8 -mr-2 size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="text-center">
                  <div className="mb-4 flex items-center justify-center">
                    <svg className="size-16" viewBox="0 0 64 64" fill="none">
                      <rect
                        x="14"
                        y="8"
                        width="36"
                        height="48"
                        rx="4"
                        fill="#4C9AFF"
                      />
                      <rect
                        x="20"
                        y="16"
                        width="24"
                        height="3"
                        rx="1"
                        fill="white"
                      />
                      <rect
                        x="20"
                        y="23"
                        width="18"
                        height="3"
                        rx="1"
                        fill="white"
                        opacity="0.7"
                      />
                      <rect
                        x="20"
                        y="30"
                        width="24"
                        height="3"
                        rx="1"
                        fill="white"
                        opacity="0.7"
                      />
                      <rect
                        x="20"
                        y="37"
                        width="12"
                        height="3"
                        rx="1"
                        fill="white"
                        opacity="0.7"
                      />
                      <circle cx="44" cy="44" r="8" fill="#FFC400" />
                      <path
                        d="M41 44l2 2 4-4"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-1 text-sm font-semibold">
                    Review and submit request
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Review your data residency move details and submit the
                    request
                  </p>
                </div>
              </div>

              <div className="rounded-md border p-5">
                <h3 className="mb-3 text-sm font-semibold">Things to know</h3>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>
                    All Jira apps are linked. All Jira instances on this site
                    URL will move together to your new location.
                  </li>
                  <li>
                    All Jira instances and their installed Marketplace apps will
                    be offline during the data residency move. Users won&apos;t
                    be able to access them until the move is complete
                  </li>
                  <li>You can&apos;t move the audit log.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 1: Select location */}
          {locationStep === 1 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Select a location</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Choose a new data residency location for your Atlassian app.
              </p>

              <div className="space-y-2">
                {LOCATIONS.map((loc) => (
                  <label
                    key={loc}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                      selectedLocation === loc
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded-full border-2 ${
                        selectedLocation === loc
                          ? "border-blue-600"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selectedLocation === loc && (
                        <div className="size-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <span className="text-sm">{loc}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select move window */}
          {locationStep === 2 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Select a move window
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Choose when you&apos;d like the data residency move to begin.
                Your apps will be offline during the move.
              </p>

              <div className="space-y-2">
                {MOVE_WINDOWS.map((w) => (
                  <label
                    key={w}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                      selectedMoveWindow === w
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded-full border-2 ${
                        selectedMoveWindow === w
                          ? "border-blue-600"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selectedMoveWindow === w && (
                        <div className="size-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <span className="text-sm">{w}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {locationStep === 3 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Review and submit request
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Review your data residency move details before submitting.
              </p>

              <div className="mb-6 divide-y rounded-md border">
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">App</span>
                  <div className="mt-1 flex items-center gap-2">
                    <AppIcon type={app?.iconType ?? "goals"} />
                    <span className="text-sm font-medium">
                      {app?.product} — {app?.name}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Current location
                  </span>
                  <span className="text-sm">{app?.location}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    New location
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {selectedLocation}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Move window
                  </span>
                  <span className="text-sm">{selectedMoveWindow}</span>
                </div>
                <div className="flex justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Marketplace apps affected
                  </span>
                  <span className="text-sm">0</span>
                </div>
              </div>

              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> All Jira instances will be offline
                  during the move. Users won&apos;t be able to access them until
                  the move is complete.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="fixed right-0 bottom-0 left-0 flex items-center justify-center gap-3 border-t bg-background py-4">
          {locationStep === 0 ? (
            <Button variant="outline" onClick={closeLocationPicker}>
              Cancel
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setLocationStep(locationStep - 1)}
            >
              Back
            </Button>
          )}
          {locationStep < 3 ? (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={
                (locationStep === 1 && !selectedLocation) ||
                (locationStep === 2 && !selectedMoveWindow)
              }
              onClick={() => setLocationStep(locationStep + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={submitLocationChange}
            >
              Submit request
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl p-8">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Admin</span>
        <span>/</span>
        <span>Security</span>
      </div>

      <h1 className="mb-4 text-2xl font-semibold">Data residency</h1>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        You can control the location of your data with data residency. If data
        residency is available for your Atlassian app, you can set a location
        for hosting the in-scope Atlassian app and Marketplace app data.{" "}
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => setShowExplore(true)}
        >
          Explore data residency
        </button>
      </p>

      {/* Summary card */}
      <div className="mb-6 rounded-lg border px-5 py-3">
        <p className="text-sm text-muted-foreground">Atlassian apps</p>
        <p className="text-lg font-semibold">
          {pinnedCount} of {apps.length} pinned
        </p>
      </div>

      {/* App summary */}
      <h2 className="mb-4 text-base font-semibold">App summary</h2>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder="Search by site URL or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
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
        <Button variant="outline" size="sm" className="gap-1">
          Atlassian apps
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Location
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Status
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </Button>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Showing {filteredApps.length} results
      </p>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">
                <div className="flex items-center gap-1">
                  Atlassian app
                  <svg
                    className="size-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 19V5" />
                    <path d="M5 12l7-7 7 7" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Location</th>
              <th className="px-4 py-2.5 text-left font-medium">
                Pinned Marketplace apps
              </th>
              <th className="px-4 py-2.5 text-left font-medium">
                <div className="flex items-center gap-1">
                  Marketplace apps status
                  <svg
                    className="size-3.5 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.map((app) => (
              <tr
                key={app.id}
                className="border-b transition-colors last:border-b-0 hover:bg-accent/30"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <AppIcon type={app.iconType} />
                    <div>
                      <p className="text-sm font-medium">{app.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.product}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm ${app.location !== "Not set" ? "font-medium text-foreground" : ""}`}
                    >
                      {app.location}
                    </span>
                    <svg
                      className="size-3.5 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{app.pinnedApps}</td>
                <td className="px-4 py-3 text-sm">{app.marketplaceStatus}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {app.canSetLocation && (
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => openLocationPicker(app.id)}
                      >
                        {app.location === "Not set" ? "Set location" : "Change"}
                      </button>
                    )}
                    {app.canSetLocation && (
                      <div className="relative">
                        <button
                          className="rounded p-1 text-muted-foreground hover:bg-accent"
                          onClick={() =>
                            setActionsOpen(
                              actionsOpen === app.id ? null : app.id
                            )
                          }
                        >
                          <svg
                            className="size-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                        {actionsOpen === app.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActionsOpen(null)}
                            />
                            <div className="absolute top-8 right-0 z-50 w-48 rounded-md border bg-popover shadow-md">
                              <button
                                type="button"
                                className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
                                onClick={() => {
                                  setActionsOpen(null)
                                  setShowAppDetails(app.id)
                                }}
                              >
                                View app details
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
