"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const WIZARD_STEPS = ["How it works", "Create tunnel", "Copy security key"]

interface Tunnel {
  id: string
  name: string
  securityKey: string
  status: "Active" | "Pending"
  createdAt: string
}

export default function ApplicationTunnelsPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [step, setStep] = useState(0)
  const [tunnelName, setTunnelName] = useState("")
  const [tunnelUrl, setTunnelUrl] = useState("")
  const [formError, setFormError] = useState("")
  const [tunnels, setTunnels] = useState<Tunnel[]>([])
  const [generatedKey, setGeneratedKey] = useState("")
  const [copied, setCopied] = useState(false)

  const resetWizard = () => {
    setStep(0)
    setTunnelName("")
    setTunnelUrl("")
    setFormError("")
    setGeneratedKey("")
    setCopied(false)
  }

  const nextStep = () => {
    setFormError("")
    if (step === 0) {
      setStep(1)
      return
    }
    if (step === 1) {
      if (!tunnelName.trim()) {
        setFormError("Tunnel name is required")
        return
      }
      if (!tunnelUrl.trim()) {
        setFormError("Instance URL is required")
        return
      }
      // Generate a fake security key
      const key = `atl-tunnel-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}`
      setGeneratedKey(key)
      setStep(2)
      return
    }
    // Step 2: done
    const newTunnel: Tunnel = {
      id: Date.now().toString(),
      name: tunnelName.trim(),
      securityKey: generatedKey,
      status: "Pending",
      createdAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }
    setTunnels([newTunnel, ...tunnels])
    setShowWizard(false)
    resetWizard()
  }

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
                  className={`size-2.5 rounded-full ${i <= step ? "bg-blue-600" : "bg-muted-foreground/30"}`}
                />
                <span
                  className={`text-xs whitespace-nowrap ${i === step ? "font-medium text-blue-600" : "text-muted-foreground"}`}
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

          {/* Step 0: How it works */}
          {step === 0 && (
            <div>
              <h2 className="mb-4 text-xl font-bold">How it works</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Application tunnels use network tunneling to connect your
                Atlassian cloud organization to Data Center instances, without
                needing to open your network for any incoming connections.
              </p>

              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
                <div className="flex gap-3">
                  <svg
                    className="mt-0.5 size-5 shrink-0 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold">
                      Before you begin
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Install application tunnels as a Marketplace app, and
                      configure the required connections and ports.{" "}
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                      >
                        Learn more
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex gap-3">
                  <svg
                    className="mt-0.5 size-5 shrink-0 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold">
                      Create a tunnel
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create a tunnel for each self-managed instance. When
                      you&apos;re done, you&apos;ll get a security key you can
                      copy to the target instance. If you&apos;re not an admin
                      there, you can give it to someone who is.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <svg
                    className="mt-0.5 size-5 shrink-0 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold">
                      Create application links
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Link your cloud apps to the tunnel you created. We&apos;ll
                      forward the traffic to the target instance and create a
                      reciprocal link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Create tunnel */}
          {step === 1 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">Create tunnel</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Provide a name and the URL of the self-managed instance you want
                to connect to.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Tunnel name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Production DC Jira"
                    value={tunnelName}
                    onChange={(e) => setTunnelName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Self-managed instance URL{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., https://jira.yourcompany.com"
                    value={tunnelUrl}
                    onChange={(e) => setTunnelUrl(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    The base URL of the Data Center or Server instance
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Copy security key */}
          {step === 2 && (
            <div>
              <h2 className="mb-2 text-xl font-bold">Copy security key</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Copy this security key and paste it into the application tunnels
                configuration on your self-managed instance. You won&apos;t be
                able to see this key again.
              </p>

              <div className="mb-6 rounded-lg border p-5">
                <label className="mb-2 block text-sm font-medium">
                  Security key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm break-all">
                    {generatedKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyKey}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Save this security key now. For
                  security reasons, it won&apos;t be shown again after you leave
                  this page.
                </p>
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
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step === 0 && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={nextStep}
            >
              Create tunnel
            </Button>
          )}
          {step === 1 && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={nextStep}
            >
              Create
            </Button>
          )}
          {step === 2 && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={nextStep}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    )
  }

  // List view
  if (tunnels.length > 0) {
    return (
      <div className="max-w-5xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Application tunnels</h1>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowWizard(true)}
          >
            Create tunnel
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2.5 text-left font-medium">Name</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {tunnels.map((t) => (
                <tr
                  key={t.id}
                  className="border-b last:border-b-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${t.status === "Active" ? "bg-green-600" : "bg-amber-600"}`}
                      />
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Empty state
  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Application tunnels</h1>

      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          <svg className="h-24 w-32" viewBox="0 0 128 96" fill="none">
            <rect
              x="16"
              y="8"
              width="48"
              height="36"
              rx="3"
              fill="#E0E0E0"
              stroke="#BDBDBD"
              strokeWidth="1.5"
            />
            <rect x="20" y="12" width="40" height="24" rx="1" fill="white" />
            <rect x="10" y="44" width="60" height="4" rx="2" fill="#BDBDBD" />
            <circle cx="78" cy="30" r="2.5" fill="#B3D4FF" />
            <circle cx="86" cy="30" r="1.5" fill="#4C9AFF" />
            <circle cx="104" cy="30" r="20" fill="#2684FF" />
            <line
              x1="104"
              y1="20"
              x2="104"
              y2="40"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <line
              x1="94"
              y1="30"
              x2="114"
              y2="30"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2 className="mb-3 text-lg font-semibold">
          Link Cloud and Data Center
        </h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Communicate with your network securely, without needing to open it to
          the outside world. To do this, create a tunnel to connect to your
          self-managed instances.
        </p>

        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setShowWizard(true)}
        >
          Create tunnel
        </Button>
      </div>
    </div>
  )
}
