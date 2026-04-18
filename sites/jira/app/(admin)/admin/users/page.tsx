"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type FilterType = "role" | "apps" | "status" | null

const roleOptions = [
  "Organization admin",
  "Site admin",
  "User access admin",
  "App admin",
  "User",
  "Guest",
  "Jira Service Management customer",
]

const appOptions = [
  { name: "Goals", sub: "abhisheksharma67185", icon: "◎" },
  { name: "Jira Administration", sub: "abhisheksharma67185", icon: "⚙" },
  { name: "Jira", sub: "abhisheksharma67185", icon: "◆" },
  { name: "Projects", sub: "abhisheksharma67185", icon: "✦" },
]

const statusOptions = ["ACTIVE", "SUSPENDED", "DEACTIVATED"]

function InviteUsersModal({ onClose, onToast }: { onClose: () => void; onToast: (msg: string) => void }) {
  const emailRef = useRef<HTMLInputElement>(null)
  const [role, setRole] = useState("member")
  const [roleOpen, setRoleOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const roleRef = useRef<HTMLDivElement>(null)

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  // Outside click closes role dropdown
  useEffect(() => {
    if (!roleOpen) return
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [roleOpen])

  const handleSubmit = () => {
    const raw = emailRef.current?.value.trim() || ""
    if (!raw) return
    const emails = raw.split(",").map((e) => e.trim()).filter(Boolean)
    if (emails.length === 0) return
    const label = emails.length === 1 ? emails[0] : `${emails.length} users`
    onToast(`Invitation sent to ${label}`)
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-lg rounded-lg border bg-background shadow-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Invite users</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent transition-colors">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Email input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email addresses</label>
            <input
              ref={emailRef}
              type="text"
              autoFocus
              placeholder="e.g. jane@company.com, john@company.com"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">Separate multiple emails with commas</p>
          </div>

          {/* Role dropdown */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Role</label>
            <div className="relative" ref={roleRef}>
              <button
                type="button"
                onClick={() => setRoleOpen(!roleOpen)}
                className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
              >
                <span>{role === "admin" ? "Admin" : "Member"}</span>
                <svg className="size-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
              </button>
              {roleOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 w-full rounded-lg border bg-popover shadow-lg py-1">
                  <button
                    type="button"
                    onClick={() => { setRole("member"); setRoleOpen(false) }}
                    className={`flex w-full flex-col px-3 py-2 text-left hover:bg-accent transition-colors ${role === "member" ? "bg-accent/50" : ""}`}
                  >
                    <span className="text-sm font-medium">Member</span>
                    <span className="text-xs text-muted-foreground">Can access products and basic features</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole("admin"); setRoleOpen(false) }}
                    className={`flex w-full flex-col px-3 py-2 text-left hover:bg-accent transition-colors ${role === "admin" ? "bg-accent/50" : ""}`}
                  >
                    <span className="text-sm font-medium">Admin</span>
                    <span className="text-xs text-muted-foreground">Full organization administration access</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent transition-colors">Cancel</button>
          <button type="button" onClick={handleSubmit} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors">Send invite</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveFilter(null)
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="p-8 max-w-5xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[10000] rounded-lg border bg-background px-4 py-3 shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <svg className="size-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          {toast}
        </div>
      )}

      {/* Invite modal */}
      {inviteOpen && <InviteUsersModal onClose={() => setInviteOpen(false)} onToast={showToast} />}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setInviteOpen(true)}>Invite users</Button>
          <Button variant="outline">Approve requests <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">0</span></Button>
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="rounded-md border p-2 text-muted-foreground hover:bg-accent"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {moreMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border bg-background shadow-lg z-10">
                <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent rounded-lg">
                  Export users
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground max-w-3xl">
        Users are anyone who&apos;s invited to your organization. Manage app access for your users individually or go to app access settings to control other ways users can get access to your apps.{" "}
        <a href="/admin/app-access-settings" className="text-blue-600 hover:underline">Go to app access settings</a>
      </p>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-px rounded-lg border overflow-hidden">
        <div className="p-4">
          <p className="text-xs text-muted-foreground">Total users</p>
          <p className="text-2xl font-bold">1</p>
        </div>
        <div className="border-l p-4">
          <p className="text-xs text-muted-foreground">Active users</p>
          <p className="text-2xl font-bold">1</p>
        </div>
        <div className="border-l p-4">
          <p className="text-xs text-muted-foreground">Organization admins</p>
          <p className="text-2xl font-bold">1</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mb-4 flex items-center gap-2" ref={filterRef}>
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search by name or email" className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
        </div>

        {/* Role filter */}
        <div className="relative">
          <button
            onClick={() => setActiveFilter(activeFilter === "role" ? null : "role")}
            className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${activeFilter === "role" ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
          >
            Role <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>
          {activeFilter === "role" && (
            <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border bg-background shadow-lg z-10">
              <div className="p-2">
                <div className="relative">
                  <input type="text" placeholder="Search" className="h-8 w-full rounded-md border bg-background pl-3 pr-8 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
                  <svg className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto px-2 pb-2">
                {roleOptions.map((role) => (
                  <label key={role} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">
                    <input type="checkbox" className="size-4 rounded border" />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
              <div className="border-t px-3 py-2 text-xs text-muted-foreground text-right">
                7 of 7
              </div>
            </div>
          )}
        </div>

        {/* Apps filter */}
        <div className="relative">
          <button
            onClick={() => setActiveFilter(activeFilter === "apps" ? null : "apps")}
            className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${activeFilter === "apps" ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
          >
            Apps <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>
          {activeFilter === "apps" && (
            <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border bg-background shadow-lg z-10">
              <div className="p-2">
                <div className="relative">
                  <input type="text" placeholder="Search" className="h-8 w-full rounded-md border bg-background pl-3 pr-8 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
                  <svg className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <div className="px-3 py-1 text-xs text-muted-foreground">abhisheksharma67185</div>
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
              <div className="border-t px-3 py-2 text-xs text-muted-foreground text-right">
                4 of 4
              </div>
            </div>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <button
            onClick={() => setActiveFilter(activeFilter === "status" ? null : "status")}
            className={`flex items-center gap-1 rounded-md border px-3 py-2 text-sm ${activeFilter === "status" ? "border-blue-600 text-blue-600" : "hover:bg-accent"}`}
          >
            Status <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
          </button>
          {activeFilter === "status" && (
            <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border bg-background shadow-lg z-10">
              <div className="p-2">
                <div className="relative">
                  <input type="text" placeholder="Search" className="h-8 w-full rounded-md border bg-background pl-3 pr-8 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
                  <svg className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto px-2 pb-2">
                {statusOptions.map((status) => (
                  <label key={status} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">
                    <input type="checkbox" className="size-4 rounded border" />
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      status === "ACTIVE" ? "border-green-300 text-green-700" :
                      status === "SUSPENDED" ? "border-yellow-300 text-yellow-700" :
                      "border-gray-300 text-gray-600"
                    }`}>{status}</span>
                  </label>
                ))}
              </div>
              <div className="border-t px-3 py-2 text-xs text-muted-foreground text-right">
                3 of 3
              </div>
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

      {/* Groups panel — Bug 3: groups API returns total:0 → show empty state */}
      <div className="mb-8 rounded-xl border bg-background p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-sm">Groups</p>
            <p className="text-xs text-muted-foreground mt-0.5">Organise users into groups to manage access at scale.</p>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create group
          </button>
        </div>
        <div data-testid="groups-empty-state" className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
          <svg className="mb-3 size-10 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p className="text-sm font-medium mb-1">No groups configured yet</p>
          <p className="text-xs text-muted-foreground">Groups help you manage user access to apps and products.</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">User</th>
              <th className="px-4 py-2.5 text-left font-medium w-[100px]">Status</th>
              <th className="px-4 py-2.5 text-left font-medium w-[160px]">
                <div className="flex items-center gap-1">
                  Last seen
                  <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
              </th>
              <th className="px-4 py-2.5 text-left font-medium w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Abhishek Sharma</p>
                    <p className="text-xs text-muted-foreground">abhisheksharma67185@gmail.com · Organization admin</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="rounded border border-green-300 px-1.5 py-0.5 text-[10px] font-bold text-green-700 uppercase">Active</span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">Apr 07, 2026</td>
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
          </tbody>
        </table>
      </div>
    </div>
  )
}
