"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const appRoles = [
  { name: "Goals", sub: "abhisheksharma67185", plan: "Free", icon: "◎" },
  { name: "Jira", sub: "abhisheksharma67185", plan: "Premium", icon: "◆" },
  { name: "Projects", sub: "abhisheksharma67185", plan: "Free", icon: "✦" },
  { name: "Jira Administration", sub: "abhisheksharma67185", plan: "", icon: "⚙" },
]

export default function ServiceAccountsPage() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)

  if (wizardOpen) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Wizard header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <button onClick={() => { setWizardOpen(false); setWizardStep(1) }} className="text-muted-foreground hover:text-foreground">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="flex-1" />
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-8 py-6">
          <div className="flex items-center gap-2">
            <div className={`size-2.5 rounded-full ${wizardStep >= 1 ? "bg-blue-600" : "bg-muted-foreground"}`} />
            {wizardStep >= 2 && <div className="w-24 h-0.5 bg-blue-600" />}
            {wizardStep < 2 && <div className="w-24 h-0.5 bg-muted" />}
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-2.5 rounded-full ${wizardStep >= 2 ? "bg-blue-600" : "bg-muted-foreground"}`} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-16 -mt-2 mb-6">
          <span className={`text-sm ${wizardStep === 1 ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
            Name service account
          </span>
          <span className={`text-sm ${wizardStep === 2 ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
            Select app roles
          </span>
        </div>

        <div className="border-t" />

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 max-w-2xl mx-auto w-full">
          {wizardStep === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Name service account</h2>
              <p className="text-sm text-muted-foreground mb-1">
                Give your service account a name and a description. We use this to generate a unique email for your service account.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Required fields are marked with an asterisk <span className="text-red-500">*</span>
              </p>

              <div className="mb-4">
                <label className="text-sm font-medium mb-1 block">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input className="mb-1" />
                <p className="text-xs text-muted-foreground">Enter a unique name with at least 6 and no more than 30 characters.</p>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px] bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                <p className="text-xs text-muted-foreground">For example, describe the purpose of the service account.</p>
              </div>
            </>
          )}

          {wizardStep === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Select app role for service account</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select an app role to determine the service account&apos;s level of access to an app.
              </p>

              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                  <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <Input placeholder="Search by site" className="pl-9" />
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  App <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  Plan <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>Showing 4 results out of 4 items</span>
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>

              <div className="rounded-md border mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-2.5 text-left font-medium">App</th>
                      <th className="px-4 py-2.5 text-left font-medium w-[120px]">Plan</th>
                      <th className="px-4 py-2.5 text-left font-medium w-[140px]">Roles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appRoles.map((app) => (
                      <tr key={app.name} className="border-b last:border-b-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded bg-muted flex items-center justify-center text-sm shrink-0">{app.icon}</div>
                            <div>
                              <p className="text-sm font-medium">{app.name}</p>
                              <p className="text-xs text-muted-foreground">{app.sub}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{app.plan}</td>
                        <td className="px-4 py-3">
                          <select className="w-full rounded-md border px-2 py-1.5 text-sm bg-background">
                            <option>None</option>
                            <option>User</option>
                            <option>Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-2">
                <h3 className="text-sm font-semibold mb-2">Groups</h3>
                <select className="w-full rounded-md border px-3 py-2 text-sm bg-background">
                  <option>Add groups</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">Customized groups give users access to specific projects or spaces</p>
              </div>
            </>
          )}
        </div>

        {/* Wizard footer */}
        <div className="border-t px-8 py-4 flex items-center justify-end gap-2">
          {wizardStep === 1 && (
            <>
              <Button variant="ghost" onClick={() => { setWizardOpen(false); setWizardStep(1) }}>Close</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setWizardStep(2)}>Next</Button>
            </>
          )}
          {wizardStep === 2 && (
            <>
              <Button variant="ghost" onClick={() => setWizardStep(1)}>Back</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create</Button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="mb-8 text-2xl font-semibold">Service accounts</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="mb-6 size-28" viewBox="0 0 120 120" fill="none">
          <circle cx="45" cy="50" r="22" fill="#2684FF" />
          <circle cx="45" cy="42" r="10" fill="#4C9AFF" />
          <path d="M25 72a20 20 0 0 1 40 0" fill="#2684FF" />
          <circle cx="75" cy="45" r="18" fill="#F59E0B" />
          <circle cx="75" cy="38" r="8" fill="#FBBF24" />
          <path d="M59 63a16 16 0 0 1 32 0" fill="#F59E0B" />
          <circle cx="85" cy="55" r="14" fill="#2684FF" opacity="0.7" />
          <circle cx="85" cy="49" r="6" fill="#4C9AFF" />
          <path d="M73 69a12 12 0 0 1 24 0" fill="#2684FF" opacity="0.7" />
        </svg>
        <h2 className="mb-3 text-xl font-semibold">Keep the work flowing</h2>
        <p className="mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Service accounts allow you to automate tasks with an account not associated with a person. People change teams and companies but service accounts keep doing the work.
        </p>
        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setWizardOpen(true)}>
          Create a service account
        </Button>
        <button type="button" className="mt-3 text-sm text-blue-600 hover:underline">Understand service accounts</button>
      </div>
    </div>
  )
}
