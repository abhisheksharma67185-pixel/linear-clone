"use client"

import { Button } from "@/components/ui/button"

const controls = [
  {
    name: "Export data",
    href: "#",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Jira", "Confluence"],
    overrides: 0,
    updatedBy: "Atlassian",
  },
  {
    name: "Attachment download",
    href: "#",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Jira", "Confluence"],
    overrides: 0,
    updatedBy: "Atlassian",
  },
  {
    name: "Public links",
    href: "#",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Confluence"],
    overrides: 0,
    updatedBy: "Atlassian",
  },
  {
    name: "Anonymous access",
    href: "#",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Jira", "Confluence"],
    overrides: 0,
    updatedBy: "Atlassian",
  },
  {
    name: "Marketplace and custom app access",
    href: "#",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    defaultConfig: "Allowed",
    appliesTo: ["Jira", "Confluence"],
    overrides: 0,
    updatedBy: "Atlassian",
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
  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Data security policy</h1>
        <Button variant="outline" size="sm" className="gap-1.5">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Give feedback
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        A data security policy helps keep your organization&apos;s data secure and protects it from unauthorized access, loss, or damage. Manage the controls below to minimize risk to your data.{" "}
        <button type="button" className="text-blue-600 hover:underline inline-flex items-center gap-0.5">
          More about data security policy controls
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </p>

      {/* Controls table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Control</th>
              <th className="px-4 py-2.5 text-left font-medium">Default configuration</th>
              <th className="px-4 py-2.5 text-left font-medium">Applies to</th>
              <th className="px-4 py-2.5 text-left font-medium">Overrides</th>
              <th className="px-4 py-2.5 text-left font-medium">Updated by</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <tr key={control.name} className="border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{control.icon}</span>
                    <a href={control.href} className="text-blue-600 hover:underline font-medium">
                      {control.name}
                    </a>
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
                    <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {control.updatedBy}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="rounded p-1 text-muted-foreground hover:bg-accent">
                    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
