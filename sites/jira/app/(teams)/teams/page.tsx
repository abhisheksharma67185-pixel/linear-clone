"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const people = [
  {
    name: "Abhishek Sharma",
    initials: "AS",
    color: "bg-blue-600",
    role: "Software Engineer",
  },
  {
    name: "Priya Patel",
    initials: "PP",
    color: "bg-purple-600",
    role: "Product Manager",
  },
  {
    name: "Rahul Gupta",
    initials: "RG",
    color: "bg-green-600",
    role: "Senior Developer",
  },
  {
    name: "Anita Desai",
    initials: "AD",
    color: "bg-pink-600",
    role: "UX Designer",
  },
  {
    name: "Vikram Singh",
    initials: "VS",
    color: "bg-orange-600",
    role: "QA Engineer",
  },
]

interface TeamData {
  id: string
  name: string
  description: string
  members: number
  color: string
  createdAt: string
}

export default function TeamsForYouPage() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [addPeopleOpen, setAddPeopleOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDesc, setNewTeamDesc] = useState("")

  const fetchTeams = () => {
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then(setTeams)
      .catch(() => {})
  }

  useEffect(() => {
    fetchTeams()
    // Re-fetch when page becomes visible (e.g. after creating team from nav dropdown)
    const onFocus = () => fetchTeams()
    window.addEventListener("focus", onFocus)
    // Listen for custom event from Create Team dialogs
    const onTeamCreated = () => fetchTeams()
    window.addEventListener("team-created", onTeamCreated)
    return () => {
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("team-created", onTeamCreated)
    }
  }, [])

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return
    const res = await fetch("/api/data/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTeamName.trim(),
        description: newTeamDesc.trim(),
      }),
    })
    if (res.ok) {
      const newTeam = await res.json()
      setTeams((prev) => [...prev, newTeam])
      setCreateTeamOpen(false)
      setNewTeamName("")
      setNewTeamDesc("")
      setToast(`Team "${newTeam.name}" created`)
      setTimeout(() => setToast(null), 3000)
      window.dispatchEvent(new CustomEvent("team-created"))
    }
  }

  return (
    <div className="max-w-5xl p-8">
      {/* People you work with */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">People you work with</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddPeopleOpen(true)}
            >
              Add people
            </Button>
          </div>
          <Link
            href="/teams/people"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Browse everyone
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        <div className="flex flex-wrap gap-4">
          {people.map((person) => (
            <Link
              key={person.name}
              href="/teams/people"
              className="flex w-40 cursor-pointer flex-col items-center rounded-lg border p-6 transition-colors hover:bg-accent/50"
            >
              <Avatar className="mb-3 size-20">
                <AvatarFallback
                  className={`${person.color} text-2xl font-semibold text-white`}
                >
                  {person.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-center text-sm font-medium">
                {person.name}
              </span>
              <span className="mt-1 text-center text-xs text-muted-foreground">
                {person.role}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Your teams */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Your teams</h2>
          <Link
            href="/teams/directory"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Browse all teams
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="group flex flex-col rounded-lg border p-5 transition-all hover:shadow-md"
            >
              {/* Top row: team icon + user avatar */}
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${team.color}`}
                >
                  <svg
                    className="size-5 text-white"
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
                </div>
                <Avatar className="size-7">
                  <AvatarFallback className="bg-teal-500 text-[10px] font-bold text-white">
                    AS
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Team name */}
              <h3 className="text-sm font-semibold transition-colors group-hover:text-blue-600">
                {team.name}
              </h3>

              {/* Official team badge + member count */}
              <div className="mt-0.5 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Official team
                </span>
                <svg
                  className="size-3.5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span className="text-xs text-muted-foreground">
                  · {team.members} member{team.members !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Create a team CTA */}
      <div className="flex items-start gap-8 rounded-xl border p-6">
        <div className="pt-1">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <svg
              className="size-6 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">
            Want to create a new team?
          </h2>
          <p className="mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Bring people together by creating a team. Teams help you organize
            work, share knowledge, and collaborate more effectively across
            projects.
          </p>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setCreateTeamOpen(true)}
          >
            Create a team
          </Button>
        </div>
      </div>

      {/* Create team modal */}
      {createTeamOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setCreateTeamOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[440px] rounded-lg border bg-popover shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">Create a team</h3>
              <button
                onClick={() => setCreateTeamOpen(false)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Team name <span className="text-red-500">*</span>
                </label>
                <input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Marketing"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTeamName.trim())
                      handleCreateTeam()
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Description
                </label>
                <textarea
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="What does this team work on?"
                  rows={3}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreateTeamOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!newTeamName.trim()}
                onClick={handleCreateTeam}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add people modal */}
      {addPeopleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setAddPeopleOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[480px] rounded-lg border bg-popover shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">Add people</h3>
              <button
                onClick={() => setAddPeopleOpen(false)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Invite people to collaborate with your team by entering their
                email addresses.
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Email addresses
                </label>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. name@company.com"
                  autoFocus
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Separate multiple emails with commas.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Role</label>
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/30">
                  <option>Member</option>
                  <option>Admin</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddPeopleOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!inviteEmail.trim()}
                onClick={() => {
                  setAddPeopleOpen(false)
                  setInviteEmail("")
                  setToast("Invitations sent successfully")
                  setTimeout(() => setToast(null), 3000)
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-lg border bg-popover px-4 py-2.5 shadow-lg">
            <svg
              className="size-4 shrink-0 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm">{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
