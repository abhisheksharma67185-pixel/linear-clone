"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface TeamData {
  id: string
  name: string
  description: string
  members: number
  color: string
  createdAt: string
}

const TABS = [
  "About",
  "Activity",
  "Hierarchy",
  "Goals",
  "Projects",
  "Kudos",
] as const
type Tab = (typeof TABS)[number]

export default function TeamDetailPage() {
  const params = useParams<{ id: string }>()
  const [team, setTeam] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("About")
  const [addPeopleOpen, setAddPeopleOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [isMember, setIsMember] = useState(true)

  useEffect(() => {
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then((teams: TeamData[]) => {
        const found = teams.find((t) => t.id === params.id)
        setTeam(found ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (loading)
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  if (!team)
    return (
      <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground">
        <p>Team not found.</p>
        <Link
          href="/teams/directory"
          className="mt-2 text-blue-600 hover:underline"
        >
          Back to directory
        </Link>
      </div>
    )

  return (
    <div className="mx-auto max-w-5xl">
      {/* Breadcrumb */}
      <div className="px-8 pt-4 text-xs text-muted-foreground">
        <Link href="/teams" className="hover:underline">
          Teams
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{team.name}</span>
      </div>

      {/* Banner */}
      <div className="relative mx-8 mt-3 h-32 overflow-hidden rounded-t-xl bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500">
        <div className="absolute inset-0 opacity-30">
          <svg
            className="h-full w-full"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0 100C200 50 400 150 800 80V200H0Z"
              fill="white"
              opacity="0.2"
            />
            <path
              d="M0 140C300 80 500 180 800 100V200H0Z"
              fill="white"
              opacity="0.15"
            />
          </svg>
        </div>
      </div>

      {/* Team header */}
      <div className="relative z-10 mx-8 -mt-8 px-6">
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-4">
            <div
              className={`flex size-16 items-center justify-center rounded-xl border-4 border-background ${team.color}`}
            >
              <svg
                className="size-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-semibold">{team.name}</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Official team</span>
                <svg
                  className="size-3.5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <Button
              variant={isMember ? "outline" : "default"}
              size="sm"
              aria-label={isMember ? "Leave team" : "Join team"}
              onClick={() => {
                setIsMember((prev) => {
                  setToast(prev ? "You left the team" : "You joined the team")
                  return !prev
                })
              }}
              className={
                isMember
                  ? "hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            >
              {isMember ? "Leave team" : "Join team"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddPeopleOpen(true)}
            >
              Add people
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="px-2"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </Button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border bg-popover py-1 shadow-lg">
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        setMenuOpen(false)
                        setToast("Team settings updated")
                      }}
                    >
                      Edit team
                    </button>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        setMenuOpen(false)
                        setToast("Team archived")
                      }}
                    >
                      Archive team
                    </button>
                    <div className="my-1 border-t" />
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-accent"
                      onClick={() => {
                        setMenuOpen(false)
                        setToast("Team deleted")
                        window.location.href = "/teams"
                      }}
                    >
                      Delete team
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-8 mt-4 border-b">
        <div className="flex gap-0 px-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content + sidebar */}
      <div className="mx-8 flex gap-8 px-6 py-6">
        <div className="min-w-0 flex-1">
          {/* About */}
          {tab === "About" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  What we&apos;re doing
                </h3>
                <p className="text-sm text-muted-foreground">
                  {team.description ||
                    'Your CEO steps into the elevator. "What\'s your team working on?"'}
                </p>
                <input
                  placeholder="Write your answer here."
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Members{" "}
                    <span className="font-normal text-muted-foreground">
                      {team.members}
                    </span>
                  </h3>
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setAddPeopleOpen(true)}
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-teal-500 font-bold text-white">
                      AS
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Abhishek Sharma</span>
                </div>
              </div>
            </div>
          )}

          {/* Activity */}
          {tab === "Activity" && (
            <div>
              <h3 className="mb-3 text-sm font-semibold">
                {team.name}&apos;s work
              </h3>
              <div className="space-y-1">
                {[
                  "geeta",
                  "wsdsadaas",
                  "vijay",
                  "Subtask 2.1",
                  "Task 3",
                  "Task 1",
                  "Task 2",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent/50"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-blue-500">
                      <svg
                        className="size-3 text-white"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M3 3h10v10H3z" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{item}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Jira Issue · My Team
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {i < 2
                        ? "4 hours ago"
                        : i < 4
                          ? "8 hours ago"
                          : "5 days ago"}
                    </span>
                    <Avatar className="size-6 shrink-0">
                      <AvatarFallback className="bg-blue-500 text-[8px] text-white">
                        AS
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                Jira work items assigned to team
              </p>
            </div>
          )}

          {/* Hierarchy */}
          {tab === "Hierarchy" && (
            <div className="flex flex-col items-center py-8">
              <svg
                className="mb-4 size-12 text-muted-foreground/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="2" width="20" height="8" rx="2" />
                <rect x="6" y="14" width="12" height="8" rx="2" />
                <path d="M12 10v4" />
              </svg>
              <h3 className="mb-1 text-base font-semibold">
                Visualise your team&apos;s reporting structure
              </h3>
              <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
                Add a parent team and sub-teams to see where your team sits in
                the organisation.
              </p>
              <button className="mb-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add parent team
              </button>
              <div className="mb-4 flex items-center gap-3 rounded-lg border p-3 px-4">
                <div
                  className={`flex size-8 items-center justify-center rounded-lg ${team.color}`}
                >
                  <svg
                    className="size-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{team.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Official team · {team.members} member
                    {team.members !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add sub-teams
              </button>
            </div>
          )}

          {/* Goals */}
          {tab === "Goals" && (
            <div>
              <p className="mb-4 text-xs text-muted-foreground">
                Currently contributing to
              </p>
              <div className="flex items-start gap-4 rounded-lg border p-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <svg
                    className="size-6 text-purple-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold">
                    See what goals your team is working toward
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Goals help your team connect their work to the outcomes they
                    contribute to, giving you a single place to share updates on
                    your goals&apos; progress.
                  </p>
                  <Link
                    href="/goals"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <svg
                      className="size-5 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add goals
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          {tab === "Projects" && (
            <div>
              <p className="mb-4 text-xs text-muted-foreground">
                Currently contributing to
              </p>
              <div className="flex items-start gap-4 rounded-lg border p-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="size-6 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold">
                    Assign your team the projects they&apos;re working on
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Projects can help your team share weekly status updates with
                    stakeholders across your organisation.
                  </p>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <svg
                      className="size-5 text-blue-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create a project
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Kudos */}
          {tab === "Kudos" && (
            <div className="flex flex-col items-center py-12 text-center">
              <svg
                className="mb-4 size-12 text-muted-foreground/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h3 className="mb-1 text-base font-semibold">
                Give kudos to your teammates
              </h3>
              <p className="mb-4 max-w-md text-sm text-muted-foreground">
                Celebrate your team&apos;s wins and recognize great work.
              </p>
              <Link
                href="/kudos"
                className="text-sm text-blue-600 hover:underline"
              >
                Give kudos
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-[240px] shrink-0 space-y-6">
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
              Team links
            </h4>
            <button className="mb-1 flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M7 7h10M7 12h10M7 17h6" />
              </svg>
              Add Jira Project
            </button>
            <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
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
              Add Link
            </button>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
              Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parent team</span>
                <span>No parent team</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sub-teams</span>
                <span>No sub-teams</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Team type</span>
                <span className="flex items-center gap-1">
                  Official team{" "}
                  <svg
                    className="size-3 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add people modal */}
      {addPeopleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setAddPeopleOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-[400px] rounded-lg border bg-popover shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold">
                Add people to {team.name}
              </h3>
              <button
                onClick={() => setAddPeopleOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-accent"
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
            <div className="space-y-3 px-5 py-4">
              <input
                placeholder="Enter names or emails"
                autoFocus
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30"
              />
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
                onClick={() => {
                  setAddPeopleOpen(false)
                  setToast("People added")
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
              className="size-4 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm">{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}
