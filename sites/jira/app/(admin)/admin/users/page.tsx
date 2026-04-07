"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
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

export default function AdminUsersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">Invite users</Button>
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
          <Input placeholder="Search by name or email" className="pl-9" />
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
                  <Input placeholder="Search" className="h-8 text-xs pr-8" />
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
                  <Input placeholder="Search" className="h-8 text-xs pr-8" />
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
                  <Input placeholder="Search" className="h-8 text-xs pr-8" />
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
