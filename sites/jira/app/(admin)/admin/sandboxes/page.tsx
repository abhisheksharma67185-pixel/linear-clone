"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// ── Sandbox Creation Wizard ────────────────────────────────────────
const sandboxSteps = [
  { id: "select-production", label: "Select production" },
  { id: "add-name", label: "Add name" },
  { id: "add-app", label: "Add app" },
]

function SandboxWizard({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedProduction, setSelectedProduction] = useState(
    "abhisheksharma67185.atlassian.net"
  )
  const [sandboxName, setSandboxName] = useState("abhisheksharma67185-sandbox")
  const [selectedApps, setSelectedApps] = useState<string[]>([])

  if (!open) return null

  const stepId = sandboxSteps[currentStep].id

  function handleClose() {
    setCurrentStep(0)
    setSelectedProduction("abhisheksharma67185.atlassian.net")
    setSandboxName("abhisheksharma67185-sandbox")
    setSelectedApps([])
    onClose()
  }

  function handleNext() {
    if (currentStep < sandboxSteps.length - 1) setCurrentStep(currentStep + 1)
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center border-b px-6 py-4">
        <button
          onClick={handleClose}
          className="rounded-md border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
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

      {/* Step indicator */}
      <div className="flex items-center justify-center px-8 py-6">
        {sandboxSteps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            {i > 0 && (
              <div
                className={`h-0.5 w-24 ${i <= currentStep ? "bg-blue-600" : "bg-muted-foreground/30"}`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`size-2.5 rounded-full ${i <= currentStep ? "bg-blue-600" : "bg-muted-foreground/40"}`}
              />
              <span
                className={`text-sm whitespace-nowrap ${i === currentStep ? "font-medium text-blue-600" : i < currentStep ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-8 py-10">
          {/* Step 1: Select production */}
          {stepId === "select-production" && (
            <div>
              <h2 className="mb-3 text-2xl font-semibold">
                Select production environment
              </h2>
              <p className="mb-2 text-sm text-muted-foreground">
                Select the production environment that you&apos;d like to create
                a sandbox for. We&apos;ll first create a corresponding sandbox
                URL for it.{" "}
                <button className="text-blue-600 hover:underline">
                  How to create a sandbox
                </button>
              </p>

              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                Showing 1 item
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="w-10 px-4 py-2.5 text-left font-medium" />
                      <th className="px-4 py-2.5 text-left font-medium">
                        <div className="flex items-center gap-1">
                          Production
                          <svg
                            className="size-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 5v14M5 12l7-7 7 7" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium">
                        Eligible apps
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className={`cursor-pointer border-b transition-colors last:border-b-0 ${selectedProduction === "abhisheksharma67185.atlassian.net" ? "bg-blue-50 dark:bg-blue-950/20" : "hover:bg-accent/30"}`}
                      onClick={() =>
                        setSelectedProduction(
                          "abhisheksharma67185.atlassian.net"
                        )
                      }
                    >
                      <td className="px-4 py-3">
                        <RadioGroup
                          value={selectedProduction}
                          onValueChange={setSelectedProduction}
                        >
                          <RadioGroupItem value="abhisheksharma67185.atlassian.net" />
                        </RadioGroup>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                            <svg
                              className="size-3.5"
                              viewBox="0 0 32 32"
                              fill="white"
                            >
                              <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                            </svg>
                          </div>
                          abhisheksharma67185.atlassian.net
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex size-7 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                          <svg
                            className="size-3.5"
                            viewBox="0 0 32 32"
                            fill="white"
                          >
                            <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 2: Add name */}
          {stepId === "add-name" && (
            <div>
              <h2 className="mb-3 text-2xl font-semibold">Name the sandbox</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Create a URL for your sandbox. The URL works like a container
                for sandbox apps from the selected production environment.
              </p>

              {/* Production card */}
              <div className="mb-6 rounded-md border bg-muted/30 p-4">
                <p className="mb-2 text-xs text-muted-foreground">Production</p>
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                    <svg className="size-3.5" viewBox="0 0 32 32" fill="white">
                      <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                    </svg>
                  </div>
                  <span className="text-sm">
                    abhisheksharma67185.atlassian.net
                  </span>
                </div>
              </div>

              {/* Sandbox URL input */}
              <div>
                <p className="mb-2 text-sm font-semibold">Sandbox URL</p>
                <div className="flex items-center">
                  <Input
                    value={sandboxName}
                    onChange={(e) => setSandboxName(e.target.value)}
                    className="rounded-r-none border-r-0"
                  />
                  <span className="flex h-9 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm whitespace-nowrap text-muted-foreground">
                    .atlassian.net
                  </span>
                  {sandboxName && (
                    <svg
                      className="ml-2 size-5 shrink-0 text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  )}
                </div>
                {sandboxName && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                    <svg
                      className="size-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Site name available.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Add app */}
          {stepId === "add-app" && (
            <div>
              <h2 className="mb-3 text-2xl font-semibold">Add apps</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Add an app from production environment to your sandbox. You can
                add more apps to the sandbox later from the dashboard.
              </p>

              {/* Production + Sandbox URL cards */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-md border bg-muted/30 p-4">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Production
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                      <svg
                        className="size-3.5"
                        viewBox="0 0 32 32"
                        fill="white"
                      >
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                    </div>
                    <span className="text-sm">
                      abhisheksharma67185.atlassian.net
                    </span>
                  </div>
                </div>
                <div className="rounded-md border bg-muted/30 p-4">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Sandbox URL
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded bg-green-500">
                      <svg
                        className="size-3.5"
                        viewBox="0 0 32 32"
                        fill="white"
                      >
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                    </div>
                    <span className="text-sm">{sandboxName}.atlassian.net</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="w-10 px-4 py-2.5 text-left font-medium" />
                      <th className="px-4 py-2.5 text-left font-medium">App</th>
                      <th className="px-4 py-2.5 text-left font-medium">
                        Plan
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium">
                        Sandboxes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: "Jira",
                        site: "abhisheksharma67185.atlassian.net",
                        plan: "Premium",
                        sandboxes: 0,
                      },
                    ].map((app) => (
                      <tr
                        key={app.name}
                        className={`cursor-pointer border-b transition-colors last:border-b-0 ${selectedApps.includes(app.name) ? "bg-blue-50 dark:bg-blue-950/20" : "hover:bg-accent/30"}`}
                        onClick={() => {
                          setSelectedApps(
                            selectedApps.includes(app.name)
                              ? selectedApps.filter((a) => a !== app.name)
                              : [...selectedApps, app.name]
                          )
                        }}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedApps.includes(app.name)}
                            onChange={() => {}}
                            className="size-4 rounded border accent-blue-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                              <svg
                                className="size-3.5"
                                viewBox="0 0 32 32"
                                fill="white"
                              >
                                <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">{app.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {app.site}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{app.plan}</td>
                        <td className="px-4 py-3 text-right">
                          {app.sandboxes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                By creating a sandbox, you acknowledge that the sandbox is
                subject to and governed by Section 14 of the{" "}
                <button className="text-blue-600 hover:underline">
                  Cloud Terms of Service
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-end gap-2 border-t px-8 py-4">
        {currentStep === 0 && (
          <>
            <Button variant="outline" onClick={handleBack} disabled>
              Back
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleNext}
            >
              Next
            </Button>
          </>
        )}
        {currentStep === 1 && (
          <>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!sandboxName.trim()}
              onClick={handleNext}
            >
              Next
            </Button>
          </>
        )}
        {currentStep === 2 && (
          <>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleClose}
            >
              Create sandbox
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────
export default function SandboxesPage() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-semibold">Sandboxes</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="mb-6 size-28" viewBox="0 0 120 120" fill="none">
          <rect x="30" y="40" width="60" height="45" rx="6" fill="#2684FF" />
          <rect x="30" y="40" width="60" height="12" rx="6" fill="#0052CC" />
          <rect x="30" y="48" width="60" height="4" fill="#0052CC" />
          <rect x="40" y="60" width="15" height="3" rx="1.5" fill="#93C5FD" />
          <rect x="40" y="67" width="20" height="3" rx="1.5" fill="#93C5FD" />
          <rect x="40" y="74" width="12" height="3" rx="1.5" fill="#93C5FD" />
          <circle cx="72" cy="35" r="12" fill="#F59E0B" />
          <rect
            x="69"
            y="30"
            width="6"
            height="14"
            rx="1"
            fill="#92400E"
            transform="rotate(-30 72 37)"
          />
          <rect
            x="65"
            y="28"
            width="14"
            height="4"
            rx="2"
            fill="#92400E"
            transform="rotate(-30 72 30)"
          />
          <circle cx="82" cy="32" r="8" fill="#A855F7" />
          <rect
            x="79"
            y="28"
            width="6"
            height="12"
            rx="1"
            fill="#6B21A8"
            transform="rotate(15 82 34)"
          />
        </svg>
        <h2 className="mb-3 text-xl font-semibold">
          Manage changes to your apps with sandboxes
        </h2>
        <p className="mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
          A sandbox is a secure environment to test and experiment before making
          changes to your production environment. The Premium plans include 1
          app sandbox, while the Enterprise plans include 5. You can buy
          additional app sandboxes if needed.{" "}
          <button className="text-blue-600 hover:underline">
            More about sandboxes
          </button>
        </p>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setWizardOpen(true)}
        >
          Create your first sandbox
        </Button>
      </div>

      <SandboxWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  )
}
