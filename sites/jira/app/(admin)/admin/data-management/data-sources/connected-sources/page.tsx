"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const WIZARD_STEPS = [
  "Agree to connect",
  "Add details of your instance",
  "Complete connection",
]

export default function ConnectedSourcesPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [step, setStep] = useState(0)
  const [instanceUrl, setInstanceUrl] = useState("")
  const [instanceName, setInstanceName] = useState("")
  const [formError, setFormError] = useState("")
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const resetWizard = () => {
    setStep(0)
    setInstanceUrl("")
    setInstanceName("")
    setFormError("")
    setConnecting(false)
  }

  const nextStep = () => {
    setFormError("")
    if (step === 1) {
      if (!instanceUrl.trim()) {
        setFormError("Instance URL is required")
        return
      }
      if (!instanceName.trim()) {
        setFormError("Instance name is required")
        return
      }
    }
    if (step === 2) {
      // Simulate connection
      setConnecting(true)
      setTimeout(() => {
        setConnecting(false)
        setConnected(true)
        setShowWizard(false)
        resetWizard()
      }, 2500)
      return
    }
    setStep(step + 1)
  }

  const prevStep = () => {
    setFormError("")
    if (step === 0) {
      setShowWizard(false)
      resetWizard()
      return
    }
    setStep(step - 1)
  }

  // Wizard overlay
  if (showWizard) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <button
          onClick={() => {
            setShowWizard(false)
            resetWizard()
          }}
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

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 pt-6">
          {WIZARD_STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`size-2.5 rounded-full ${
                    i <= step ? "bg-blue-600" : "bg-muted-foreground/30"
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
                <div className="mx-2 mb-5 h-px w-16 bg-border" />
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-2xl px-8 pt-12 pb-32">
          {formError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Step 0: Agree to connect */}
          {step === 0 && (
            <div>
              <h2 className="mb-6 text-xl font-bold">Agree to connect</h2>

              <div className="rounded-lg border p-6">
                <p className="mb-4 text-sm">
                  By making this connection, you&apos;ll share the following
                  data from your Data Center instance with your cloud
                  organization:
                </p>
                <ul className="mb-6 list-disc space-y-2 pl-5 text-sm">
                  <li>
                    System configuration (ServerId, SEN, instance name and
                    version)
                  </li>
                  <li>App names, versions, and capabilities</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Read the{" "}
                  <button
                    type="button"
                    className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
                  >
                    Atlassian Customer Agreement
                    <svg
                      className="size-3"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M3.5 2H10v6.5" />
                      <path d="M10 2L2 10" />
                    </svg>
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
                  >
                    Privacy Policy
                    <svg
                      className="size-3"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M3.5 2H10v6.5" />
                      <path d="M10 2L2 10" />
                    </svg>
                  </button>
                  .
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Add details */}
          {step === 1 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">
                Add details of your instance
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Provide the URL and a display name for your Data Center
                instance.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Instance URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., https://jira.yourcompany.com"
                    value={instanceUrl}
                    onChange={(e) => setInstanceUrl(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    The base URL of your Data Center instance
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Display name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Production Jira DC"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    A friendly name to identify this instance
                  </p>
                </div>

                <div className="rounded-md border bg-muted/30 p-5">
                  <h3 className="mb-2 text-sm font-semibold">
                    What happens next?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    After submitting these details, you&apos;ll need to install
                    the Atlassian Cloud connector app on your Data Center
                    instance to complete the connection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Complete connection */}
          {step === 2 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">Complete connection</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Review your connection details and complete the setup.
              </p>

              <div className="mb-6 divide-y rounded-md border">
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Instance URL
                  </span>
                  <p className="text-sm font-medium">{instanceUrl}</p>
                </div>
                <div className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Display name
                  </span>
                  <p className="text-sm font-medium">{instanceName}</p>
                </div>
              </div>

              {connecting ? (
                <div className="flex flex-col items-center py-8 text-center">
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
                    Establishing connection...
                  </p>
                </div>
              ) : (
                <div className="rounded-md border bg-muted/30 p-5">
                  <h3 className="mb-2 text-sm font-semibold">Next steps</h3>
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>
                      Click <strong>Connect</strong> to initiate the connection
                    </li>
                    <li>
                      Install the Atlassian Cloud connector app on your Data
                      Center instance
                    </li>
                    <li>
                      Follow the setup wizard in your Data Center instance
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="fixed right-0 bottom-0 left-0 flex items-center justify-center gap-3 border-t bg-background py-4">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          {step < 2 ? (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={nextStep}
            >
              Next
            </Button>
          ) : (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={nextStep}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect"}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Connected state
  if (connected) {
    return (
      <div className="max-w-5xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Connected sources</h1>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              setConnected(false)
            }}
          >
            Connect Data Center
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2.5 text-left font-medium">Name</th>
                <th className="px-4 py-2.5 text-left font-medium">URL</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">
                  {instanceName || "Data Center Instance"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {instanceUrl || "https://jira.example.com"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    <span className="size-1.5 rounded-full bg-green-600" />
                    Connected
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Empty state
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Connected sources</h1>

      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        {/* Globe illustration */}
        <div className="relative mb-6">
          <svg className="size-32" viewBox="0 0 128 128" fill="none">
            <circle cx="56" cy="72" r="40" fill="#E0E0E0" />
            <ellipse cx="56" cy="72" rx="20" ry="40" fill="#BDBDBD" />
            <line
              x1="16"
              y1="72"
              x2="96"
              y2="72"
              stroke="#9E9E9E"
              strokeWidth="1.5"
            />
            <line
              x1="56"
              y1="32"
              x2="56"
              y2="112"
              stroke="#9E9E9E"
              strokeWidth="1.5"
            />
            <ellipse
              cx="56"
              cy="52"
              rx="35"
              ry="8"
              stroke="#9E9E9E"
              strokeWidth="1"
              fill="none"
            />
            <ellipse
              cx="56"
              cy="92"
              rx="35"
              ry="8"
              stroke="#9E9E9E"
              strokeWidth="1"
              fill="none"
            />
            <circle cx="88" cy="44" r="24" fill="#2684FF" />
            <line
              x1="88"
              y1="34"
              x2="88"
              y2="54"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="78"
              y1="44"
              x2="98"
              y2="44"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2 className="mb-3 text-lg font-semibold">
          Connect your Data Center instance
        </h2>

        <p className="mb-2 text-sm text-muted-foreground">
          Bring your Data Center instance into your cloud organization.
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          Once connected, you&apos;ll be able to manage your connections from a
          single location and integrate with a variety of apps.{" "}
          <button type="button" className="text-blue-600 hover:underline">
            Learn how
          </button>
        </p>

        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setShowWizard(true)}
        >
          Connect Data Center
        </Button>
      </div>
    </div>
  )
}
