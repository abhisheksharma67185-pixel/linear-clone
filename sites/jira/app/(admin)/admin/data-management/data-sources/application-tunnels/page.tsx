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
      if (!tunnelName.trim()) { setFormError("Tunnel name is required"); return }
      if (!tunnelUrl.trim()) { setFormError("Instance URL is required"); return }
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
      createdAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
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
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <button
          onClick={() => { setShowWizard(false); resetWizard() }}
          className="absolute left-6 top-6 rounded p-1.5 text-muted-foreground hover:bg-accent"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 pt-6">
          {WIZARD_STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`size-2.5 rounded-full ${i <= step ? "bg-blue-600" : "bg-muted-foreground/30"}`} />
                <span className={`text-xs whitespace-nowrap ${i === step ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div className="w-16 h-px bg-border mb-5 mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto px-8 pt-12 pb-32">
          {formError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Step 0: How it works */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">How it works</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Application tunnels use network tunneling to connect your Atlassian cloud organization to Data Center instances, without needing to open your network for any incoming connections.
              </p>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 mb-6">
                <div className="flex gap-3">
                  <svg className="size-5 text-blue-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Before you begin</h3>
                    <p className="text-sm text-muted-foreground">
                      Install application tunnels as a Marketplace app, and configure the required connections and ports.{" "}
                      <button type="button" className="text-blue-600 hover:underline">Learn more</button>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex gap-3">
                  <svg className="size-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Create a tunnel</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a tunnel for each self-managed instance. When you&apos;re done, you&apos;ll get a security key you can copy to the target instance. If you&apos;re not an admin there, you can give it to someone who is.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <svg className="size-5 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Create application links</h3>
                    <p className="text-sm text-muted-foreground">
                      Link your cloud apps to the tunnel you created. We&apos;ll forward the traffic to the target instance and create a reciprocal link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Create tunnel */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Create tunnel</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Provide a name and the URL of the self-managed instance you want to connect to.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Tunnel name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Production DC Jira"
                    value={tunnelName}
                    onChange={(e) => setTunnelName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Self-managed instance URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., https://jira.yourcompany.com"
                    value={tunnelUrl}
                    onChange={(e) => setTunnelUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The base URL of the Data Center or Server instance
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Copy security key */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Copy security key</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Copy this security key and paste it into the application tunnels configuration on your self-managed instance. You won&apos;t be able to see this key again.
              </p>

              <div className="rounded-lg border p-5 mb-6">
                <label className="block text-sm font-medium mb-2">Security key</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono break-all">
                    {generatedKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyKey}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Save this security key now. For security reasons, it won&apos;t be shown again after you leave this page.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-3 border-t bg-background py-4">
          {step === 0 ? (
            <Button variant="outline" onClick={() => { setShowWizard(false); resetWizard() }}>Cancel</Button>
          ) : (
            <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step === 0 && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={nextStep}>
              Create tunnel
            </Button>
          )}
          {step === 1 && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={nextStep}>
              Create
            </Button>
          )}
          {step === 2 && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={nextStep}>
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
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Application tunnels</h1>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowWizard(true)}>
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
                <tr key={t.id} className="border-b last:border-b-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      t.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      <span className={`size-1.5 rounded-full ${t.status === "Active" ? "bg-green-600" : "bg-amber-600"}`} />
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.createdAt}</td>
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
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Application tunnels</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
        <div className="relative mb-6">
          <svg className="w-32 h-24" viewBox="0 0 128 96" fill="none">
            <rect x="16" y="8" width="48" height="36" rx="3" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="1.5" />
            <rect x="20" y="12" width="40" height="24" rx="1" fill="white" />
            <rect x="10" y="44" width="60" height="4" rx="2" fill="#BDBDBD" />
            <circle cx="78" cy="30" r="2.5" fill="#B3D4FF" />
            <circle cx="86" cy="30" r="1.5" fill="#4C9AFF" />
            <circle cx="104" cy="30" r="20" fill="#2684FF" />
            <line x1="104" y1="20" x2="104" y2="40" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="94" y1="30" x2="114" y2="30" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-lg font-semibold mb-3">Link Cloud and Data Center</h2>

        <p className="text-sm text-muted-foreground mb-6">
          Communicate with your network securely, without needing to open it to the outside world. To do this, create a tunnel to connect to your self-managed instances.
        </p>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowWizard(true)}>
          Create tunnel
        </Button>
      </div>
    </div>
  )
}
