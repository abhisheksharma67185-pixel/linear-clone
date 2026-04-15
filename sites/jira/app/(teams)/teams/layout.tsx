"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AppSwitcher } from "@/components/app-switcher"
import { CreateButton } from "@/components/top-nav"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const sidebarItems = [
  { name: "For you", href: "/teams", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg> },
  { name: "Teams", href: "/teams/directory", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { name: "People", href: "/teams/people", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg> },
  { name: "Kudos", href: "/teams/kudos", icon: <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
]

function CreateTeamPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("")
  const [members, setMembers] = useState([{ name: "Abhishek Sharma", initials: "AS" }])
  const [memberInput, setMemberInput] = useState("")
  const [type, setType] = useState("official")

  if (!open) return null

  const removeMember = (idx: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== idx))
  }

  const addMember = () => {
    if (memberInput.trim()) {
      const initials = memberInput.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
      setMembers((prev) => [...prev, { name: memberInput.trim(), initials }])
      setMemberInput("")
    }
  }

  const handleCreate = () => {
    if (name.trim()) {
      onClose()
      setName("")
      setMembers([{ name: "Abhishek Sharma", initials: "AS" }])
    }
  }

  return (
    <div className="absolute right-0 top-0 z-50 flex h-full w-[340px] flex-col border-l bg-background shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        <span className="text-sm font-semibold">Team</span>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-4 text-xs text-muted-foreground">
          Required fields are marked with an asterisk <span className="text-red-500">*</span>
        </p>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="border-2 border-blue-600 focus:ring-0"
          />
        </div>

        {/* Members */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium">
            Add team members <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5">
            {members.map((m, i) => (
              <span key={i} className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
                <Avatar className="size-4"><AvatarFallback className="bg-blue-600 text-[7px] font-semibold text-white">{m.initials}</AvatarFallback></Avatar>
                {m.name}
                <button onClick={() => removeMember(i)} className="ml-0.5 text-muted-foreground hover:text-foreground">
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </span>
            ))}
            <input
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              placeholder="Type name"
              className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Type */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium">
            Type <span className="text-red-500">*</span>
          </label>
          <Select value={type} onValueChange={(val) => val && setType(val)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="official">Official team</SelectItem>
              <SelectItem value="virtual">Virtual team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-[11px] text-muted-foreground">
          This site is protected by reCAPTCHA and the Google{" "}
          <span className="text-blue-600">Privacy Policy</span> and{" "}
          <span className="text-blue-600">Terms of Service</span> apply.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleCreate}
          disabled={!name.trim()}
        >
          Create
        </Button>
      </div>
    </div>
  )
}

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [createOpen, setCreateOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const handler = () => setCreateOpen(true)
    window.addEventListener("open-create-team", handler)
    return () => window.removeEventListener("open-create-team", handler)
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4 shrink-0">
        <div className="flex items-center gap-3">
          <AppSwitcher />
          <div className="flex items-center gap-2">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            <span className="text-sm font-semibold">Teams</span>
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="group/collapse relative rounded p-1 text-muted-foreground hover:bg-accent"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className={`size-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-[11px] text-background opacity-0 group-hover/collapse:opacity-100 transition-opacity z-50">
              {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </button>
        </div>
        <div className="flex flex-1 items-center gap-2 mx-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <Input placeholder="Search" className="h-9 pl-9 bg-muted/50" />
          </div>
          <CreateButton />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/home/notifications" className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg></Link>
          <Link href="/home" className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></Link>
          <Link href="/home/account-settings" className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" /></svg></Link>
          <Avatar className="size-8 cursor-pointer"><AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">AS</AvatarFallback></Avatar>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className={`shrink-0 border-r overflow-y-auto flex flex-col transition-all duration-200 ${sidebarCollapsed ? "w-0 border-r-0 overflow-hidden" : "w-64"}`}>
          <nav className="flex flex-col gap-0.5 p-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400" : "text-foreground hover:bg-accent"}`}>
                  <span className={isActive ? "text-blue-600" : "text-muted-foreground"}>{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}

            <div className="my-2 border-t" />

            <Link href="/goals" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent">
              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>
              Goals
              <svg className="ml-auto size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </Link>
            <Link href="/project-directory" className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent">
              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
              Projects
              <svg className="ml-auto size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </Link>
          </nav>
          <div className="mt-auto border-t p-3">
            <Link href="/home/notifications" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Give feedback on the new navigation
            </Link>
          </div>
        </aside>
        <main className="relative flex-1 overflow-y-auto">
          {children}
          <CreateTeamPanel open={createOpen} onClose={() => setCreateOpen(false)} />
        </main>
      </div>
    </div>
  )
}
