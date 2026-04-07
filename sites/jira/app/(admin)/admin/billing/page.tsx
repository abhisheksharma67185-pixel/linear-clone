"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const apps = [
  {
    name: "Goals",
    url: "https://abhisheksharma67185.atlassian.ne",
    plan: "Free",
    users: "",
    site: "https://abhishekshar",
    nextPrice: "-",
    billingCycle: "",
    icon: (
      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
    ),
  },
  {
    name: "Projects",
    url: "https://abhisheksharma67185.atlassian.ne",
    plan: "Free",
    users: "",
    site: "https://abhishekshar",
    nextPrice: "-",
    billingCycle: "",
    icon: (
      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Jira",
    url: "https://abhisheksharma67185.atlassian.ne",
    plan: "Premium",
    users: "1 / 1",
    usersLink: true,
    site: "https://abhishekshar",
    nextPrice: "USD 18.30",
    billingCycle: "Monthly",
    icon: (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-4" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
  },
]

export default function BillingPage() {
  const [sitesOpen, setSitesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSitesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Billing preview</h1>

      <p className="text-sm text-muted-foreground mb-6">
        Centrally manage and view a summary of all your Atlassian and Marketplace apps.
      </p>

      {/* Sites dropdown */}
      <div className="relative mb-6" ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          className={`gap-1 ${sitesOpen ? "border-blue-600 text-blue-600" : ""}`}
          onClick={() => setSitesOpen(!sitesOpen)}
        >
          Sites
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
        </Button>

        {sitesOpen && (
          <div className="absolute top-full left-0 mt-1 w-72 rounded-lg border bg-background shadow-lg z-10">
            <div className="p-2">
              <div className="relative">
                <Input placeholder="Search" className="pr-8 h-8 text-xs" />
                <svg className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
            <div className="px-2 pb-2">
              <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">
                <input type="checkbox" className="size-4 rounded border" />
                <span>abhisheksharma67185.atlassian.net</span>
              </label>
            </div>
            <div className="border-t px-3 py-2 text-xs text-muted-foreground text-right">
              1 of 1
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Atlassian and Marketplace apps</th>
              <th className="px-4 py-2.5 text-left font-medium">Plan</th>
              <th className="px-4 py-2.5 text-left font-medium">Users</th>
              <th className="px-4 py-2.5 text-left font-medium">Site</th>
              <th className="px-4 py-2.5 text-left font-medium">Next price estimat...</th>
              <th className="px-4 py-2.5 text-left font-medium">Billing cycl...</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.name} className="border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {app.icon}
                    <div>
                      <p className="text-sm font-medium">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.url}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{app.plan}</td>
                <td className="px-4 py-3 text-sm">
                  {app.usersLink ? (
                    <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">{app.users}</a>
                  ) : (
                    app.users
                  )}
                </td>
                <td className="px-4 py-3 text-sm truncate max-w-[140px]">{app.site}</td>
                <td className="px-4 py-3 text-sm">{app.nextPrice}</td>
                <td className="px-4 py-3 text-sm">{app.billingCycle}</td>
                <td className="px-4 py-3">
                  <Button variant="outline" size="sm">Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Separate billing section */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold">Can&apos;t see all your subscriptions here?</h3>
        <p className="text-sm text-muted-foreground">Some of your apps may be billed separately.</p>
      </div>

      <div className="flex items-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded bg-blue-600">
            <svg className="size-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </div>
          <span className="text-sm font-medium">Bitbucket</span>
          <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline inline-flex items-center gap-0.5">
            Visit Bitbucket
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded bg-blue-500">
            <svg className="size-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <rect x="7" y="7" width="4" height="4" rx="1" fill="white" opacity="0.5" />
            </svg>
          </div>
          <span className="text-sm font-medium">Trello</span>
          <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline inline-flex items-center gap-0.5">
            Visit Trello
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
