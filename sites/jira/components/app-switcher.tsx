"use client"

import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const ThreeDotsIcon = (
  <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
  </svg>
)

const mainApps = [
  { name: "Home", href: "/home", icon: <svg className="size-7 rounded-md bg-blue-100 p-1 text-blue-600 dark:bg-blue-900/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { name: "Jira", href: "/dashboard", icon: <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700"><svg className="size-4 text-white" viewBox="0 0 32 32" fill="white"><path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" /></svg></div> },
  { name: "Goals", href: "/goals", icon: <div className="flex size-7 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30"><svg className="size-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg></div> },
  { name: "Projects", href: "/project-directory", icon: <div className="flex size-7 items-center justify-center rounded-md bg-pink-100 dark:bg-pink-900/30"><svg className="size-4 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div> },
  { name: "Teams", href: "/teams", icon: <div className="flex size-7 items-center justify-center rounded-md bg-teal-100 dark:bg-teal-900/30"><svg className="size-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div> },
  { name: "Administration", href: "/applications", icon: <div className="flex size-7 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800"><svg className="size-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg></div> },
]

const recommended = [
  {
    name: "Product roadmap",
    description: "Align everyone with custom roadmaps",
    icon: <div className="flex size-8 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30"><svg className="size-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg></div>,
  },
  {
    name: "Confluence",
    description: "Document collaboration",
    icon: <div className="flex size-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30"><svg className="size-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg></div>,
  },
  {
    name: "Work requests",
    description: "Create one place to manage requests",
    icon: <div className="flex size-8 items-center justify-center rounded-md bg-yellow-100 dark:bg-yellow-900/30"><svg className="size-4 text-yellow-600" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>,
  },
]

export function AppSwitcher() {
  return (
    <Popover>
      <PopoverTrigger className="rounded-md border p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-80 p-0" sideOffset={8}>
        <div className="p-3">
          <div className="flex flex-col gap-0.5">
            {mainApps.map((app) => (
              <Link
                key={app.name}
                href={app.href}
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors"
              >
                {app.icon}
                <span className="font-medium">{app.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t" />

        <div className="p-3">
          <p className="mb-2 px-2 text-[11px] font-semibold text-muted-foreground">Recommended for your team</p>
          <div className="flex flex-col gap-0.5">
            {recommended.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent transition-colors cursor-pointer"
              >
                {item.icon}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{item.name}</span>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <button className="text-muted-foreground hover:text-foreground shrink-0">
                  {ThreeDotsIcon}
                </button>
              </div>
            ))}

            <button className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors">
              <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <span className="font-medium">More Atlassian apps</span>
            </button>
          </div>
        </div>

        <div className="border-t px-4 py-3">
          <button className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors">
            Manage list
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
