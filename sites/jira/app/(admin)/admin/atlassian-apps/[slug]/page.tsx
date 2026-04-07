"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const appData: Record<string, { name: string; icon: string; url: string; plan: string; users: number; groups: { name: string; desc: string; members: number; defaultGroup: boolean; role: string }[] }> = {
  goals: {
    name: "Goals", icon: "◎", url: "abhisheksharma67185.atlassian.net", plan: "Free", users: 1,
    groups: [
      { name: "goals-admins-abhisheksharma67185", desc: "Grants access to Goals and Goals administration features on abhisheksharma67185", members: 0, defaultGroup: true, role: "App admin" },
      { name: "goals-user-access-admins-abhisheksharma67185", desc: "Grants access to administer users and groups for Goals on abhisheksharma67185.\nDoesn't grant any product access.", members: 0, defaultGroup: true, role: "User access admin" },
      { name: "goals-users-abhisheksharma67185", desc: "Grants access to Goals on abhisheksharma67185", members: 0, defaultGroup: true, role: "User" },
      { name: "org-admins", desc: "Grants access to administer org-level settings, users, and groups, and to view billing", members: 1, defaultGroup: false, role: "App admin" },
    ],
  },
  "jira-administration": {
    name: "Jira Administration", icon: "⚙", url: "abhisheksharma67185.atlassian.net", plan: "", users: 0,
    groups: [
      { name: "jira-admins-abhisheksharma67185", desc: "Grants access to the administration features for all Jira products", members: 0, defaultGroup: true, role: "App admin" },
      { name: "org-admins", desc: "Grants access to administer org-level settings", members: 1, defaultGroup: false, role: "App admin" },
    ],
  },
  jira: {
    name: "Jira", icon: "◆", url: "abhisheksharma67185.atlassian.net", plan: "Premium", users: 1,
    groups: [
      { name: "jira-admins-abhisheksharma67185", desc: "Grants access to the administration features for all Jira products", members: 0, defaultGroup: true, role: "App admin" },
      { name: "jira-user-access-admins-abhisheksharma67185", desc: "Grants access to administer users and groups for Jira", members: 0, defaultGroup: true, role: "User access admin" },
      { name: "jira-users-abhisheksharma67185", desc: "Grants access to Jira on abhisheksharma67185", members: 1, defaultGroup: true, role: "User" },
      { name: "org-admins", desc: "Grants access to administer org-level settings", members: 1, defaultGroup: false, role: "App admin" },
    ],
  },
  projects: {
    name: "Projects", icon: "✦", url: "abhisheksharma67185.atlassian.net", plan: "Free", users: 1,
    groups: [
      { name: "projects-admins-abhisheksharma67185", desc: "Grants access to Projects and Projects administration features", members: 0, defaultGroup: true, role: "App admin" },
      { name: "projects-user-access-admins-abhisheksharma67185", desc: "Grants access to administer users and groups for Projects", members: 0, defaultGroup: true, role: "User access admin" },
      { name: "projects-users-abhisheksharma67185", desc: "Grants access to Projects on abhisheksharma67185", members: 0, defaultGroup: true, role: "User" },
      { name: "org-admins", desc: "Grants access to administer org-level settings", members: 1, defaultGroup: false, role: "App admin" },
    ],
  },
}

function AppIcon({ icon }: { icon: string }) {
  if (icon === "◆" || icon === "⚙") {
    return (
      <div className="flex size-10 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-5" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    )
  }
  return (
    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-lg">{icon}</div>
  )
}

export default function AppDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const app = appData[slug]
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpTab, setHelpTab] = useState<"help" | "search">("help")
  const [chatInput, setChatInput] = useState("")
  const [addGroupOpen, setAddGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupRole, setGroupRole] = useState("None")

  if (!app) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">App not found</h1>
        <Link href="/admin/atlassian-apps" className="text-blue-600 hover:underline mt-2 inline-block">Back to Atlassian apps</Link>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Breadcrumb */}
        <p className="text-xs text-muted-foreground mb-1">Apps</p>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AppIcon icon={app.icon} />
            <h1 className="text-2xl font-semibold">{app.name}</h1>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setAddGroupOpen(true)}>Add groups</Button>
        </div>

        <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline mb-4 inline-block">{app.url}</a>

        {/* Plan / Users */}
        <div className="flex items-start gap-12 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Plan</p>
            <p className="text-2xl font-bold">{app.plan || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Users</p>
            <p className="text-2xl font-bold text-blue-600">{app.users}</p>
          </div>
        </div>

        {/* Groups table */}
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2.5 text-left font-medium">Group</th>
                <th className="px-4 py-2.5 text-left font-medium w-[80px]">Members</th>
                <th className="px-4 py-2.5 text-left font-medium w-[100px]">Default group</th>
                <th className="px-4 py-2.5 text-left font-medium w-[160px]">Roles</th>
                <th className="px-4 py-2.5 text-left font-medium w-[60px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {app.groups.map((group) => (
                <tr key={group.name} className="border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href="/admin/groups" className="text-sm font-medium text-blue-600 hover:underline">{group.name}</Link>
                    <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line">{group.desc}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">{group.members}</td>
                  <td className="px-4 py-3 text-center">
                    {group.defaultGroup && (
                      <svg className="size-5 text-green-600 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select className="w-full rounded-md border px-2 py-1.5 text-sm bg-background">
                      <option>{group.role}</option>
                      <option>App admin</option>
                      <option>User access admin</option>
                      <option>User</option>
                      <option>None</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded p-1 text-muted-foreground hover:bg-accent">
                      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add groups dialog */}
      <Dialog open={addGroupOpen} onOpenChange={setAddGroupOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add groups to this app</DialogTitle>
            <DialogDescription>Grant roles to all the users in a group.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5">
                Group name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Add groups"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1.5">
                Role <span className="text-red-500">*</span>
              </Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                value={groupRole}
                onChange={(e) => setGroupRole(e.target.value)}
              >
                <option>None</option>
                <option>App admin</option>
                <option>User access admin</option>
                <option>User</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setAddGroupOpen(false)
                setGroupName("")
                setGroupRole("None")
              }}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              disabled={!groupName.trim()}
              className="text-muted-foreground disabled:opacity-50"
              onClick={() => {
                setAddGroupOpen(false)
                setGroupName("")
                setGroupRole("None")
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help sidebar toggle */}
      {!helpOpen && (
        <div className="border-l flex flex-col items-center py-4 px-2 gap-4">
          <button onClick={() => { setHelpOpen(true); setHelpTab("help") }} className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Help
          </button>
          <button onClick={() => { setHelpOpen(true); setHelpTab("search") }} className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            Search
          </button>
        </div>
      )}

      {/* Help sidebar expanded */}
      {helpOpen && (
        <div className="w-80 border-l flex flex-col shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">Help</h2>
            <div className="flex items-center gap-2">
              <button className="rounded border px-2 py-1 text-xs flex items-center gap-1">
                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 4 12 14.01 9 11.01" /></svg>
                Close
              </button>
              <button onClick={() => setHelpOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b">
            <button onClick={() => setHelpTab("help")} className={`flex-1 py-2 text-sm font-medium text-center ${helpTab === "help" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground"}`}>
              Help
            </button>
            <button onClick={() => setHelpTab("search")} className={`flex-1 py-2 text-sm font-medium text-center ${helpTab === "search" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground"}`}>
              Search
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {helpTab === "help" && (
              <div className="flex flex-col h-full">
                {/* AI chat area */}
                <div className="flex-1">
                  <div className="rounded-lg bg-muted/50 p-4 mb-4">
                    <p className="text-sm mb-2">Hi, welcome to Atlassian Support.</p>
                    <p className="text-sm mb-2">You can get help with any of our apps in this AI-powered chat.</p>
                    <p className="text-sm font-medium">How can I assist you today?</p>
                  </div>

                  {/* Suggested questions */}
                  <div className="flex flex-col gap-2">
                    {[
                      "What is an Atlassian account?",
                      "How do I control user access to products?",
                      "What are Smart Links?",
                    ].map((q) => (
                      <button key={q} className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors">
                        <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {helpTab === "search" && (
              <div>
                <div className="relative mb-4">
                  <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <Input placeholder="Search help articles..." className="pl-9" />
                </div>
                <p className="text-sm text-muted-foreground text-center py-8">Search for help articles and documentation</p>
              </div>
            )}
          </div>

          {/* Chat input (help tab only) */}
          {helpTab === "help" && (
            <div className="border-t p-3">
              <div className="relative">
                <Input
                  placeholder="Ask a question to get started"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="pr-10"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <svg className="size-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                Uses AI. Verify results.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
