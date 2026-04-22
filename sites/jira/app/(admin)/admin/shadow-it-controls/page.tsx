"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const apps = [
  {
    name: "Confluence",
    color: "bg-blue-600",
    tooltip:
      "You need a Confluence Enterprise or Teamwork Collection Enterprise subscription to change this request setting.",
  },
  {
    name: "Jira Service Management",
    color: "bg-green-500",
    tooltip:
      "You need a Jira Service Management Enterprise or Teamwork Collection Enterprise subscription to change this request setting.",
  },
  {
    name: "Jira",
    color: "bg-blue-600",
    tooltip:
      "You need a Jira Enterprise or Teamwork Collection Enterprise subscription to change this request setting.",
  },
  {
    name: "Trello",
    color: "bg-purple-500",
    tooltip:
      "You need a Confluence, Jira, Jira Service Management, or Teamwork Collection Enterprise subscription to change this request setting.",
  },
  {
    name: "Bitbucket",
    color: "bg-green-600",
    beta: true,
    tooltip:
      "As part of the beta program, this is only available to Bitbucket customers with a Premium plan.",
  },
]

function AppIcon({ color }: { color: string }) {
  return (
    <div className={`flex size-7 items-center justify-center rounded ${color}`}>
      <svg className="size-3.5" viewBox="0 0 32 32" fill="white">
        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
      </svg>
    </div>
  )
}

function InfoPopover({
  tooltip,
  hasPlanLink,
}: {
  tooltip: string
  hasPlanLink: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-blue-500 transition-colors hover:text-blue-600"
      >
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 z-50 mt-1 w-56 rounded-lg border bg-background p-3 shadow-lg">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {tooltip}
              {hasPlanLink && (
                <>
                  {" "}
                  <button className="text-blue-600 hover:underline">
                    Learn about Enterprise plans
                  </button>
                </>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default function ShadowItControlsPage() {
  const [showSettings, setShowSettings] = useState(false)

  if (showSettings) {
    return (
      <div className="max-w-5xl p-8">
        <button
          onClick={() => setShowSettings(false)}
          className="mb-4 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
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
          Back to Shadow IT controls
        </button>
        <h1 className="mb-4 text-2xl font-semibold">App request settings</h1>
        <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
          These settings control what happens when a user tries to sign up for a
          new app. Request settings are only available for eligible app plans.{" "}
          <button className="text-blue-600 hover:underline">
            Learn more about app request settings
          </button>
        </p>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">App</TableHead>
                <TableHead className="w-[200px] font-medium">
                  App setting
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AppIcon color={app.color} />
                      <span className="text-sm text-muted-foreground">
                        {app.name}
                        {app.beta && (
                          <span className="ml-2 rounded border px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground uppercase">
                            BETA
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <InfoPopover
                        tooltip={app.tooltip}
                        hasPlanLink={!app.beta}
                      />
                      <span className="text-sm">Allow new apps</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Shadow IT controls</h1>

      <div className="flex flex-col items-center py-8 text-center">
        <svg
          className="mb-6 size-28"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="60" r="56" fill="#EFF6FF" />
          <g transform="translate(42, 38)">
            <path
              d="M22 0l3 7.5h8l-1.5 8 6.5 4.5-4.5 6.5 3 7.5h-8l-3 7.5-7.5-3-7.5 3-3-7.5H0l3-7.5L-1.5 20l6.5-4.5L3.5 7.5h8L22 0Z"
              fill="#3B82F6"
            />
            <circle cx="18" cy="22" r="8" fill="#EFF6FF" />
            <circle cx="18" cy="22" r="4" fill="#2563EB" />
          </g>
          <g transform="translate(65, 60)">
            <path
              d="M14 0l2 5h5.5l-1 5.5 4.5 3-3 4.5 2 5h-5.5l-2 5-5-2-5 2-2-5H-1l2-5-4.5-3 3-4.5-1-5.5H5L14 0Z"
              fill="#8B5CF6"
            />
            <circle cx="11.5" cy="14" r="5.5" fill="#EFF6FF" />
            <circle cx="11.5" cy="14" r="2.5" fill="#7C3AED" />
          </g>
        </svg>

        <h2 className="mb-2 text-lg font-semibold">
          Control the ability of users to sign up for apps
        </h2>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          Prevent users from signing up for an app without your approval. To
          start, update your request settings for each eligible app.{" "}
          <button className="text-blue-600 hover:underline">
            Explore shadow IT controls
          </button>
        </p>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setShowSettings(true)}
        >
          Update request settings
        </Button>
      </div>
    </div>
  )
}
