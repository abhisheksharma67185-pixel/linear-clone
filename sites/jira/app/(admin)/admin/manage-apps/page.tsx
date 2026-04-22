"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const switchOptions = [
  { icon: "monitor", label: "System" },
  { icon: "grid", label: "Jira apps" },
  { icon: "pen", label: "Spaces" },
  { icon: "clipboard", label: "Work items" },
  { icon: "grid", label: "Marketplace apps" },
]

function SwitchIcon({ icon }: { icon: string }) {
  if (icon === "monitor")
    return (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  if (icon === "pen")
    return (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    )
  if (icon === "clipboard")
    return (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
      </svg>
    )
  return (
    <svg
      className="size-4"
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
  )
}

export default function ManageAppsPage() {
  const [activePage, setActivePage] = useState<"manage" | "oauth">("manage")
  const [switchOpen, setSwitchOpen] = useState(false)

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-52 shrink-0 overflow-y-auto border-r px-3 py-4">
        <Link
          href="/admin"
          className="mb-3 flex items-center gap-1.5 text-sm font-semibold hover:text-foreground"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Jira admin settings
        </Link>

        <p className="mb-2 px-1 text-[10px] tracking-wider text-muted-foreground uppercase">
          Switch settings
        </p>
        <div className="relative mb-4">
          <button
            onClick={() => setSwitchOpen(!switchOpen)}
            className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm ${switchOpen ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
          >
            <svg
              className="size-4"
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
            Marketplace apps
            <svg
              className="ml-auto size-3"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {switchOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setSwitchOpen(false)}
              />
              <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border bg-background py-1 shadow-lg">
                {switchOptions.map((opt) => (
                  <button
                    key={opt.label}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent/50 ${opt.label === "Marketplace apps" ? "border-l-2 border-blue-600 font-medium text-blue-600" : ""}`}
                    onClick={() => setSwitchOpen(false)}
                  >
                    <SwitchIcon icon={opt.icon} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setActivePage("manage")}
          className={`mb-0.5 w-full rounded px-3 py-1.5 text-left text-sm transition-colors ${activePage === "manage" ? "border-l-2 border-blue-600 bg-blue-50 font-medium text-blue-600 dark:bg-blue-950/30" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
        >
          Manage apps
        </button>
        <button
          onClick={() => setActivePage("oauth")}
          className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors ${activePage === "oauth" ? "border-l-2 border-blue-600 bg-blue-50 font-medium text-blue-600 dark:bg-blue-950/30" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
        >
          OAuth credentials
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activePage === "manage" && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Apps</h1>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search Jira admin
              </button>
            </div>

            <div className="flex flex-col items-center py-16 text-center">
              <svg className="mb-6 size-36" viewBox="0 0 160 160" fill="none">
                <circle cx="80" cy="75" r="30" fill="#F59E0B" />
                <path
                  d="M80 45l4 10h10l-3 12 8 6-6 8 4 10h-10l-4 10-8-4-8 4-4-10H43l4-10-6-8 8-6-3-12h10L80 45Z"
                  fill="#F59E0B"
                />
                <circle cx="80" cy="75" r="14" fill="white" />
                <circle cx="80" cy="75" r="6" fill="#F59E0B" />
                <polygon points="65,50 55,65 75,65" fill="#A855F7" />
                <polygon points="70,45 60,60 80,55" fill="#D946EF" />
                <circle cx="105" cy="100" r="10" fill="#3B82F6" />
                <circle cx="105" cy="100" r="5" fill="#1D4ED8" />
              </svg>
              <h2 className="mb-3 text-xl font-semibold">
                App management has moved to Administration
              </h2>
              <p className="mb-1 max-w-md text-sm text-muted-foreground">
                You can access and manage your apps by visiting Connected Apps
                in Administration. This can also be accessed through{" "}
                <strong>Apps &gt; Manage your apps</strong> within your product.
              </p>
              <div className="mt-4 flex gap-2">
                <Link href="/admin/sites/abhisheksharma67185">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Take me there
                  </Button>
                </Link>
                <Button variant="ghost" className="text-muted-foreground">
                  View audit logs
                </Button>
              </div>
            </div>
          </div>
        )}

        {activePage === "oauth" && (
          <div className="flex flex-col items-center py-16 text-center">
            <svg className="mb-6 size-36" viewBox="0 0 160 160" fill="none">
              <circle cx="60" cy="90" r="15" fill="#6366F1" />
              <rect x="54" y="70" width="12" height="8" rx="4" fill="#818CF8" />
              <circle cx="60" cy="66" r="8" fill="#A5B4FC" />
              <rect
                x="75"
                y="65"
                width="20"
                height="3"
                rx="1.5"
                fill="#D1D5DB"
              />
              <rect
                x="95"
                y="60"
                width="3"
                height="12"
                rx="1.5"
                fill="#D1D5DB"
              />
              <circle cx="100" cy="90" r="15" fill="#3B82F6" />
              <rect x="94" y="70" width="12" height="8" rx="4" fill="#60A5FA" />
              <circle cx="100" cy="66" r="8" fill="#93C5FD" />
              <path d="M70 50l5-5 3 3-5 5z" fill="#F59E0B" />
              <path d="M90 50l-5-5-3 3 5 5z" fill="#F59E0B" />
            </svg>
            <h2 className="mb-3 text-xl font-semibold">
              Create and manage OAuth credentials
            </h2>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Create and manage keys for your third-party apps to send
              information to Jira
            </p>
            <div className="flex gap-2">
              <Button variant="outline">Learn more</Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Create credentials
              </Button>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Any issues with your OAuth credentials?
            </p>
            <button className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Give feedback
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
