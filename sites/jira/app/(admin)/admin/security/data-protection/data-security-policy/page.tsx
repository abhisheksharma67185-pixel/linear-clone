"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const controls = [
  {
    name: "Export data",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Jira", "Confluence"] as string[],
    overrides: 0,
    updatedBy: "Atlassian",
    description:
      "Controls whether users can export data from Jira and Confluence. When blocked, users cannot use bulk export features.",
  },
  {
    name: "Attachment download",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Jira", "Confluence"] as string[],
    overrides: 0,
    updatedBy: "Atlassian",
    description:
      "Controls whether users can download file attachments. When blocked, attachments can be viewed inline but not downloaded.",
  },
  {
    name: "Public links",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Confluence"] as string[],
    overrides: 0,
    updatedBy: "Atlassian",
    description:
      "Controls whether users can create public links to share content outside your organization.",
  },
  {
    name: "Anonymous access",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Jira", "Confluence"] as string[],
    overrides: 0,
    updatedBy: "Atlassian",
    description:
      "Controls whether anonymous (unauthenticated) users can access your Jira and Confluence instances.",
  },
  {
    name: "Marketplace and custom app access",
    icon: (
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Jira", "Confluence"] as string[],
    overrides: 0,
    updatedBy: "Atlassian",
    description:
      "Controls whether third-party Marketplace apps and custom apps can access data in your organization's apps.",
  },
]

function AppBadge({ app }: { app: string }) {
  if (app === "Jira") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="flex size-4 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
          <svg className="size-2.5" viewBox="0 0 32 32" fill="white">
            <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
          </svg>
        </span>
        <span className="text-xs">Jira</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex size-4 items-center justify-center rounded bg-gradient-to-br from-blue-400 to-blue-600">
        <svg className="size-2.5" viewBox="0 0 32 32" fill="white">
          <path d="M5.634 25.335c0 .873.708 1.58 1.582 1.58h17.568c.874 0 1.582-.708 1.582-1.58V15.21H5.634v10.125zM26.366 6.665H5.634A1.58 1.58 0 004.052 8.24v3.795h23.896V8.24a1.58 1.58 0 00-1.582-1.575z" />
        </svg>
      </span>
      <span className="text-xs">Confluence</span>
    </span>
  )
}

export default function DataSecurityPolicyPage() {
  const [selectedControl, setSelectedControl] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const selected = controls.find((c) => c.name === selectedControl)

  return (
    <div className="max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Data security policy</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setFeedbackOpen(true)}
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Give feedback
        </Button>
      </div>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        A data security policy helps keep your organization&apos;s data secure
        and protects it from unauthorized access, loss, or damage. Manage the
        controls below to minimize risk to your data.{" "}
        <Link
          href="/admin/security/security-guide"
          className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
        >
          More about data security policy controls
          <svg
            className="size-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>
      </p>

      {/* Controls table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Control</th>
              <th className="px-4 py-2.5 text-left font-medium">
                Default configuration
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Applies to</th>
              <th className="px-4 py-2.5 text-left font-medium">Overrides</th>
              <th className="px-4 py-2.5 text-left font-medium">Updated by</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <tr
                key={control.name}
                className="border-b transition-colors last:border-b-0 hover:bg-accent/30"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {control.icon}
                    </span>
                    <Link
                      href={`/admin/security/data-protection/data-security-policy/${control.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-left font-medium text-blue-600 hover:underline"
                    >
                      {control.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-green-500" />
                    {control.defaultConfig}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {control.appliesTo.map((app) => (
                      <AppBadge key={app} app={app} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">{control.overrides}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="size-4 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {control.updatedBy}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setMenuOpen(
                          menuOpen === control.name ? null : control.name
                        )
                      }
                      className="rounded p-1 text-muted-foreground hover:bg-accent"
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
                    {menuOpen === control.name && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute top-full right-0 z-50 mt-1 w-48 rounded-md border bg-popover py-1 shadow-lg">
                          <Link
                            href={`/admin/security/data-protection/data-security-policy/${control.name.toLowerCase().replace(/\s+/g, "-")}`}
                            onClick={() => setMenuOpen(null)}
                            className="block px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                          >
                            View control details
                          </Link>
                          <button
                            onClick={() => setMenuOpen(null)}
                            className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                          >
                            Edit configuration
                          </button>
                          <button
                            onClick={() => setMenuOpen(null)}
                            className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                          >
                            Add override
                          </button>
                          <button
                            onClick={() => setMenuOpen(null)}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-accent"
                          >
                            Block access
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

      {/* Control detail dialog */}
      <Dialog
        open={!!selectedControl}
        onOpenChange={(open) => {
          if (!open) setSelectedControl(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected && (
                <span className="text-muted-foreground">{selected.icon}</span>
              )}
              {selectedControl}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selected.description}
              </p>
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <span className="size-2 rounded-full bg-green-500" />
                    {selected.defaultConfig}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Applies to</span>
                  <div className="flex gap-2">
                    {selected.appliesTo.map((a) => (
                      <AppBadge key={a} app={a} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overrides</span>
                  <span className="text-sm">{selected.overrides}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Updated by</span>
                  <span className="text-sm">{selected.updatedBy}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedControl(null)}>
              Close
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setSelectedControl(null)}
            >
              Edit configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Give feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Help us improve data security policies. What would you like to
              share?
            </p>
            <Textarea
              className="h-24 resize-none"
              placeholder="Type your feedback here..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setFeedbackOpen(false)}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
