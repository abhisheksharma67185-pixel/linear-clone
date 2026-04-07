"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const mockGroups = [
  { name: "goals-admins-abhisheksharma67185", desc: "Grants access to Goals and Goals administrat...", members: 0, apps: "1 app", team: "None" },
  { name: "goals-user-access-admins-abhisheksharma67185", desc: "Grants access to administer users and groups...", members: 0, apps: "1 app", team: "None" },
  { name: "goals-users-abhisheksharma67185", desc: "Grants access to Goals on abhisheksharma67...", members: 0, apps: "1 app", team: "None" },
  { name: "jira-admins-abhisheksharma67185", desc: "Grants access to the administration features for all Jira products on abhishek...", members: 0, apps: "1 app", team: "None" },
  { name: "jira-user-access-admins-abhisheksharma67185", desc: "Grants access to administer users and groups for Jira on abhisheksharma671...", members: 0, apps: "1 app", team: "None" },
  { name: "jira-users-abhisheksharma67185", desc: "Grants access to Jira on abhisheksharma67185", members: 1, apps: "1 app", team: "None" },
  { name: "org-admins", desc: "Grants access to administer org-level settings, users, and groups, and to vie...", members: 1, apps: "4 apps", team: "None" },
  { name: "projects-admins-abhisheksharma67185", desc: "Grants access to Projects and Projects administration features on abhisheks...", members: 0, apps: "1 app", team: "None" },
  { name: "projects-user-access-admins-abhisheksharma67185", desc: "Grants access to administer users and groups for Projects on abhisheksharm...", members: 0, apps: "1 app", team: "None" },
  { name: "projects-users-abhisheksharma67185", desc: "Grants access to Projects on abhisheksharma67185", members: 0, apps: "1 app", team: "None" },
]

const appOptions = [
  { name: "Goals", sub: "abhisheksharma67185", icon: "◎" },
  { name: "Jira Administration", sub: "abhisheksharma67185", icon: "⚙" },
  { name: "Jira", sub: "abhisheksharma67185", icon: "◆" },
  { name: "Projects", sub: "abhisheksharma67185", icon: "✦" },
]

export default function AdminGroupsPage() {
  const [appsOpen, setAppsOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setAppsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Groups</h1>
        <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setDialogOpen(true)}>Create group</Button>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Use groups to grant the same access and permissions to multiple users.{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">How to manage groups</a>
      </p>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input placeholder="Search by group name" className="pl-9" />
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setAppsOpen(!appsOpen)}
            className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${appsOpen ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
          >
            Apps <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>
          {appsOpen && (
            <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border bg-background shadow-lg z-10">
              <div className="p-2">
                <div className="relative">
                  <Input placeholder="Search" className="h-8 text-xs pr-8" />
                  <svg className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto px-2 pb-2">
                {appOptions.map((app) => (
                  <label key={app.name} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">
                    <input type="checkbox" className="size-4 rounded border" />
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded bg-muted flex items-center justify-center text-xs shrink-0">{app.icon}</div>
                      <div>
                        <p className="text-sm font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.sub}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="border-t px-3 py-2 text-xs text-muted-foreground text-right">4 of 4</div>
            </div>
          )}
        </div>
      </div>

      <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        Showing results
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </p>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Group</th>
              <th className="px-4 py-2.5 text-left font-medium w-[80px]">Members</th>
              <th className="px-4 py-2.5 text-left font-medium w-[80px]">Apps</th>
              <th className="px-4 py-2.5 text-left font-medium w-[80px]">Team</th>
              <th className="px-4 py-2.5 text-left font-medium w-[60px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockGroups.map((g) => (
              <tr key={g.name} className="border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{g.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-lg">{g.desc}</p>
                </td>
                <td className="px-4 py-3 text-sm">{g.members}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center gap-0.5">
                    {g.apps}
                    <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{g.team}</td>
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

      {/* Create group dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDialogOpen(false)}>
          <div className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-2">Create group</h2>
            <p className="text-sm text-muted-foreground mb-1">Groups give users the same app access and permissions.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Required fields are marked with an asterisk <span className="text-red-500">*</span>
            </p>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Name <span className="text-red-500">*</span>
              </label>
              <Input className="mb-1" />
              <p className="text-xs text-muted-foreground">This will be visible to anyone in the organization</p>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px] bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium mb-1 block">Users</label>
              <Input placeholder="Search" />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
