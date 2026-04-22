"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TransferPlan {
  id: string
  name: string
  app: string
  source: string
  destination: string
  spaces: string[]
  dataTypes: string[]
  status: "Draft" | "In progress" | "Completed" | "Failed"
  createdAt: string
}

const WIZARD_STEPS = [
  "Select app",
  "Select source and destination",
  "Select spaces",
  "Select data",
  "Validate data",
  "Review selections",
]

const INTRO_STEPS = [
  {
    title: "Select source and destination",
    description:
      "Select the app you want to copy the data from, and the app you want to copy the data to, within or across organizations.",
  },
  {
    title: "Select projects or spaces",
    description:
      "Select projects or spaces based on the number of work items, pages, or the size of attachments.",
  },
  {
    title: "Select users, groups, and teams",
    description:
      "Select all users, groups, and teams, or only those related to the projects or spaces you want to move.",
  },
  {
    title: "Validate data",
    description:
      "We'll run some checks to identify potential problems and help you resolve them.",
  },
  {
    title: "Review and copy data",
    description:
      "Before copying, review your selections, and if needed, edit them to include, exclude, or change any data.",
  },
]

const APPS = [
  { name: "Confluence", icon: "confluence" },
  { name: "Jira Apps", icon: "jira" },
]

const SAMPLE_SPACES = [
  { name: "Engineering", key: "ENG", items: 1250 },
  { name: "Product", key: "PROD", items: 340 },
  { name: "Design", key: "DES", items: 128 },
  { name: "Marketing", key: "MKT", items: 89 },
  { name: "HR", key: "HR", items: 45 },
  { name: "Finance", key: "FIN", items: 67 },
]

const DATA_TYPES = [
  { name: "Users", description: "User accounts and profiles" },
  { name: "Groups", description: "User groups and memberships" },
  { name: "Teams", description: "Team structures" },
  { name: "Permissions", description: "Permission schemes and grants" },
  { name: "Configurations", description: "App configurations and settings" },
  { name: "Workflows", description: "Workflow definitions and transitions" },
  { name: "Custom fields", description: "Custom field definitions and values" },
  { name: "Attachments", description: "File attachments" },
]

export default function DataTransferPage() {
  const [plans, setPlans] = useState<TransferPlan[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [step, setStep] = useState(0)
  const [actionsOpen, setActionsOpen] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [validated, setValidated] = useState(false)
  const [jiraDetailsOpen, setJiraDetailsOpen] = useState(false)

  // Wizard form state
  const [selectedApp, setSelectedApp] = useState("")
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([])
  const [selectedData, setSelectedData] = useState<string[]>([])
  const [formError, setFormError] = useState("")

  const resetWizard = () => {
    setSelectedApp("")
    setSource("")
    setDestination("")
    setSelectedSpaces([])
    setSelectedData([])
    setFormError("")
    setStep(0)
    setValidating(false)
    setValidated(false)
    setJiraDetailsOpen(false)
  }

  const openWizard = () => {
    resetWizard()
    setShowIntro(true)
  }

  const startWizard = () => {
    setShowIntro(false)
    setShowWizard(true)
  }

  const nextStep = () => {
    setFormError("")
    if (step === 0 && !selectedApp) {
      setFormError("Please select an app")
      return
    }
    if (step === 1) {
      if (!source.trim()) {
        setFormError("Source site is required")
        return
      }
      if (!destination.trim()) {
        setFormError("Destination site is required")
        return
      }
      if (source.trim() === destination.trim()) {
        setFormError("Source and destination must be different")
        return
      }
    }
    if (step === 2 && selectedSpaces.length === 0) {
      setFormError("Select at least one space or project")
      return
    }
    if (step === 3 && selectedData.length === 0) {
      setFormError("Select at least one data type")
      return
    }
    if (step === 4 && !validated) {
      // Run validation
      setValidating(true)
      setTimeout(() => {
        setValidating(false)
        setValidated(true)
      }, 2000)
      return
    }
    setStep(step + 1)
  }

  const prevStep = () => {
    setFormError("")
    if (step === 4) {
      setValidating(false)
      setValidated(false)
    }
    setStep(step - 1)
  }

  const toggleSpace = (key: string) => {
    setSelectedSpaces((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  const toggleAllSpaces = () => {
    if (selectedSpaces.length === SAMPLE_SPACES.length) {
      setSelectedSpaces([])
    } else {
      setSelectedSpaces(SAMPLE_SPACES.map((s) => s.key))
    }
  }

  const toggleDataType = (name: string) => {
    setSelectedData((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]
    )
  }

  const toggleAllData = () => {
    if (selectedData.length === DATA_TYPES.length) {
      setSelectedData([])
    } else {
      setSelectedData(DATA_TYPES.map((d) => d.name))
    }
  }

  const createPlan = () => {
    const newPlan: TransferPlan = {
      id: Date.now().toString(),
      name: `${selectedApp} transfer`,
      app: selectedApp,
      source: source.trim(),
      destination: destination.trim(),
      spaces: selectedSpaces,
      dataTypes: selectedData,
      status: "Draft",
      createdAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }
    setPlans([newPlan, ...plans])
    setShowWizard(false)
    resetWizard()
  }

  const deletePlan = (id: string) => {
    setPlans(plans.filter((p) => p.id !== id))
    setActionsOpen(null)
  }

  const runPlan = (id: string) => {
    setPlans(
      plans.map((p) =>
        p.id === id ? { ...p, status: "In progress" as const } : p
      )
    )
    setActionsOpen(null)
    setTimeout(() => {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "Completed" as const } : p
        )
      )
    }, 3000)
  }

  // Intro overlay — "How to transfer app data"
  if (showIntro) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <div className="flex items-center justify-between px-6 pt-6">
          <button
            onClick={() => {
              setShowIntro(false)
              resetWizard()
            }}
            className="rounded p-1.5 text-muted-foreground hover:bg-accent"
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
          <button className="rounded p-1.5 text-muted-foreground hover:bg-accent">
            <svg
              className="size-5"
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
        </div>

        <div className="mx-auto max-w-4xl px-8 pt-16 pb-32">
          <h1 className="mb-3 text-2xl font-bold">How to transfer app data</h1>
          <p className="mb-12 max-w-3xl text-sm text-muted-foreground">
            Copy Jira projects or Confluence spaces, users, groups, teams, and
            related data from one instance of your app to another.
          </p>

          <div className="grid grid-cols-5 gap-4">
            {INTRO_STEPS.map((s, i) => (
              <div key={s.title} className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="mb-2 text-sm font-semibold">{s.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
                {i < INTRO_STEPS.length - 1 && (
                  <svg
                    className="mt-1 size-4 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="fixed right-0 bottom-0 left-0 flex items-center justify-center gap-3 border-t bg-background py-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowIntro(false)
              resetWizard()
            }}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={startWizard}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }

  // Main wizard overlay
  if (showWizard) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        {/* Header: X + stepper + help */}
        <div className="flex items-start justify-between px-6 pt-6">
          <button
            onClick={() => {
              setShowWizard(false)
              resetWizard()
            }}
            className="rounded p-1.5 text-muted-foreground hover:bg-accent"
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

          {/* Horizontal stepper */}
          <div className="flex items-center gap-1">
            {WIZARD_STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`size-2.5 rounded-full ${
                      i < step
                        ? "bg-blue-600"
                        : i === step
                          ? "bg-blue-600"
                          : "bg-muted-foreground/30"
                    }`}
                  />
                  <span
                    className={`text-xs whitespace-nowrap ${
                      i === step
                        ? "font-medium text-blue-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className="mx-1 mb-5 h-px w-10 bg-border" />
                )}
              </div>
            ))}
          </div>

          <button className="rounded p-1.5 text-muted-foreground hover:bg-accent">
            <svg
              className="size-5"
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
        </div>

        <div className="mx-auto max-w-xl px-8 pt-12 pb-32">
          {formError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Step 0: Select app */}
          {step === 0 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">Select an app</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Copy spaces or projects, users, groups, and related data between
                instances of your apps within or across organizations.
              </p>

              <div className="space-y-3">
                {APPS.map((app) => (
                  <div key={app.name}>
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app.name)}
                      className={`flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                        selectedApp === app.name
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <div
                        className={`flex size-4 items-center justify-center rounded-full border-2 ${
                          selectedApp === app.name
                            ? "border-blue-600"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {selectedApp === app.name && (
                          <div className="size-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      {app.icon === "confluence" ? (
                        <svg className="size-6" viewBox="0 0 32 32" fill="none">
                          <rect width="32" height="32" rx="6" fill="#1868DB" />
                          <path
                            d="M7.5 22.5c.3-.5.7-1 1.2-1.5 2.5-2.5 5.5-2 8.3-.5s5 2 7.5-.5c.5-.5.9-1 1.2-1.5l-2-1.5c-.3.4-.6.8-1 1.1-2 2-4 1.5-6.8 0s-6-2.5-8.8.5c-.4.4-.7.8-1 1.2l1.4 2.2z"
                            fill="white"
                          />
                          <path
                            d="M24.5 9.5c-.3.5-.7 1-1.2 1.5-2.5 2.5-5.5 2-8.3.5s-5-2-7.5.5c-.5.5-.9 1-1.2 1.5l2 1.5c.3-.4.6-.8 1-1.1 2-2 4-1.5 6.8 0s6 2.5 8.8-.5c.4-.4.7-.8 1-1.2l-1.4-2.2z"
                            fill="white"
                          />
                        </svg>
                      ) : (
                        <svg className="size-6" viewBox="0 0 32 32" fill="none">
                          <rect width="32" height="32" rx="6" fill="#1868DB" />
                          <path
                            d="M16 7l-8 8 4 4 4-4 4 4 4-4-8-8z"
                            fill="white"
                          />
                          <path
                            d="M12 19l-4-4-1 1 5 5 4-4-1-1-3 3z"
                            fill="white"
                            opacity="0.7"
                          />
                          <path
                            d="M20 19l4-4 1 1-5 5-4-4 1-1 3 3z"
                            fill="white"
                            opacity="0.7"
                          />
                        </svg>
                      )}
                      <span className="flex-1 text-sm font-medium">
                        {app.name}
                      </span>
                      {app.name === "Jira Apps" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setJiraDetailsOpen(!jiraDetailsOpen)
                          }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          DETAILS
                          <svg
                            className={`size-3 transition-transform ${jiraDetailsOpen ? "rotate-180" : ""}`}
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <path d="M4 6l4 4 4-4" />
                          </svg>
                        </button>
                      )}
                    </button>
                    {app.name === "Jira Apps" && jiraDetailsOpen && (
                      <div className="mt-2 ml-11 space-y-1 pb-2 text-xs text-muted-foreground">
                        <p>
                          Includes: Jira Software, Jira Service Management, Jira
                          Work Management
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Select source and destination */}
          {step === 1 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">
                Select source and destination
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Choose where to copy data from and where to copy it to.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Source <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., mycompany.atlassian.net"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    The site you want to copy data from
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., mycompany-new.atlassian.net"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    The site you want to copy data to
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select spaces/projects */}
          {step === 2 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">
                {selectedApp === "Confluence"
                  ? "Select spaces"
                  : "Select projects"}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {selectedApp === "Confluence"
                  ? "Select the spaces you want to transfer."
                  : "Select the projects you want to transfer."}
              </p>

              <div className="rounded-md border">
                <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedSpaces.length === SAMPLE_SPACES.length}
                    onChange={toggleAllSpaces}
                    className="size-4 accent-blue-600"
                  />
                  <span className="text-sm font-medium">Select all</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {selectedSpaces.length} of {SAMPLE_SPACES.length} selected
                  </span>
                </div>
                {SAMPLE_SPACES.map((space) => (
                  <label
                    key={space.key}
                    className="flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/20"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSpaces.includes(space.key)}
                      onChange={() => toggleSpace(space.key)}
                      className="size-4 accent-blue-600"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{space.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({space.key})
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {space.items.toLocaleString()} items
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select data */}
          {step === 3 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">Select data</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Select the types of data you want to include in the transfer.
              </p>

              <div className="rounded-md border">
                <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedData.length === DATA_TYPES.length}
                    onChange={toggleAllData}
                    className="size-4 accent-blue-600"
                  />
                  <span className="text-sm font-medium">Select all</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {selectedData.length} of {DATA_TYPES.length} selected
                  </span>
                </div>
                {DATA_TYPES.map((dt) => (
                  <label
                    key={dt.name}
                    className="flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/20"
                  >
                    <input
                      type="checkbox"
                      checked={selectedData.includes(dt.name)}
                      onChange={() => toggleDataType(dt.name)}
                      className="size-4 accent-blue-600"
                    />
                    <div>
                      <span className="text-sm font-medium">{dt.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {dt.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Validate data */}
          {step === 4 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">Validate data</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                We&apos;ll run some checks to identify potential problems and
                help you resolve them.
              </p>

              {!validating && !validated && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="mb-4 size-16 text-muted-foreground/30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Click <strong>Validate</strong> to check your selections for
                    potential issues.
                  </p>
                </div>
              )}

              {validating && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="mb-4 size-10 animate-spin text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Validating your selections...
                  </p>
                </div>
              )}

              {validated && (
                <div className="rounded-md border border-green-200 bg-green-50 p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <svg
                      className="size-6 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <h3 className="text-sm font-semibold text-green-800">
                      Validation passed
                    </h3>
                  </div>
                  <p className="text-sm text-green-700">
                    No issues found. Your data is ready to be transferred.
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-green-700">
                    <li>
                      • {selectedSpaces.length}{" "}
                      {selectedApp === "Confluence" ? "spaces" : "projects"}{" "}
                      checked
                    </li>
                    <li>• {selectedData.length} data types verified</li>
                    <li>• No conflicts detected</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review selections */}
          {step === 5 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">Review selections</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Before copying, review your selections. If needed, go back to
                edit them.
              </p>

              <div className="divide-y rounded-md border">
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">App</span>
                  <p className="text-sm font-medium">{selectedApp}</p>
                </div>
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">Source</span>
                  <p className="text-sm font-medium">{source}</p>
                </div>
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Destination
                  </span>
                  <p className="text-sm font-medium">{destination}</p>
                </div>
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    {selectedApp === "Confluence" ? "Spaces" : "Projects"}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selectedSpaces.map((key) => {
                      const space = SAMPLE_SPACES.find((s) => s.key === key)
                      return (
                        <span
                          key={key}
                          className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {space?.name ?? key}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Data types
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selectedData.map((name) => (
                      <span
                        key={name}
                        className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Validation
                  </span>
                  <p className="text-sm font-medium text-green-600">Passed</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed right-0 bottom-0 left-0 flex items-center justify-center gap-3 border-t bg-background py-4">
          {step === 0 ? (
            <Button
              variant="outline"
              onClick={() => {
                setShowWizard(false)
                resetWizard()
              }}
            >
              Cancel
            </Button>
          ) : (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={nextStep}
            >
              Next
            </Button>
          ) : step === 4 ? (
            validated ? (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setStep(5)}
              >
                Next
              </Button>
            ) : (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={nextStep}
                disabled={validating}
              >
                {validating ? "Validating..." : "Validate"}
              </Button>
            )
          ) : (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={createPlan}
            >
              Copy data
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Empty state
  if (plans.length === 0) {
    return (
      <div className="max-w-5xl p-8">
        <h1 className="mb-8 text-2xl font-semibold">Data transfer</h1>

        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <svg className="h-28 w-40" viewBox="0 0 160 112" fill="none">
              <ellipse cx="90" cy="52" rx="50" ry="30" fill="#B3D4FF" />
              <ellipse cx="70" cy="60" rx="45" ry="28" fill="#4C9AFF" />
              <ellipse cx="60" cy="68" rx="40" ry="24" fill="#2684FF" />
              <ellipse cx="50" cy="72" rx="20" ry="12" fill="#0052CC" />
              <ellipse cx="95" cy="50" rx="12" ry="8" fill="#8777D9" />
            </svg>
          </div>

          <h2 className="mb-3 text-lg font-semibold">
            Start by creating a transfer plan
          </h2>

          <p className="mb-4 text-sm text-muted-foreground">
            A transfer plan is a collection of project, spaces, users, groups,
            and related data such as pages, configurations, and settings you
            want to transfer.
          </p>

          <button
            type="button"
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            How to transfer data
          </button>

          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={openWizard}
          >
            Create transfer plan
          </Button>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Data transfer</h1>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={openWizard}
        >
          Create transfer plan
        </Button>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Manage your transfer plans.{" "}
        <button type="button" className="text-blue-600 hover:underline">
          How to transfer data
        </button>
      </p>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Name</th>
              <th className="px-4 py-2.5 text-left font-medium">App</th>
              <th className="px-4 py-2.5 text-left font-medium">Source</th>
              <th className="px-4 py-2.5 text-left font-medium">Destination</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">Created</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="border-b last:border-b-0 hover:bg-muted/20"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{plan.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {plan.spaces.length}{" "}
                    {plan.app === "Confluence" ? "spaces" : "projects"} ·{" "}
                    {plan.dataTypes.length} data types
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{plan.app}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {plan.source}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {plan.destination}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      plan.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : plan.status === "In progress"
                          ? "bg-blue-100 text-blue-700"
                          : plan.status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {plan.status === "In progress" && (
                      <svg
                        className="size-3 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    )}
                    {plan.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {plan.createdAt}
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActionsOpen(actionsOpen === plan.id ? null : plan.id)
                      }
                      className="rounded p-1 hover:bg-accent"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {actionsOpen === plan.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActionsOpen(null)}
                        />
                        <div className="absolute top-8 right-0 z-50 w-44 rounded-md border bg-popover shadow-md">
                          {plan.status === "Draft" && (
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
                              onClick={() => runPlan(plan.id)}
                            >
                              Run transfer
                            </button>
                          )}
                          <button
                            type="button"
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-accent"
                            onClick={() => deletePlan(plan.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
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
