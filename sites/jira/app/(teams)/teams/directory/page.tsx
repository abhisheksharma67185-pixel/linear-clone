"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const allTeams = [
  {
    name: "Engineering",
    members: 12,
    description: "Build and maintain the core product, APIs, and infrastructure.",
    color: "bg-blue-500",
    avatarColors: ["bg-blue-600", "bg-indigo-600", "bg-cyan-600", "bg-teal-600"],
    initials: ["AS", "RG", "NK", "DM"],
  },
  {
    name: "Product",
    members: 6,
    description: "Define product strategy, roadmap, and feature prioritization.",
    color: "bg-purple-500",
    avatarColors: ["bg-purple-600", "bg-violet-600", "bg-fuchsia-600"],
    initials: ["PP", "SK", "MR"],
  },
  {
    name: "Design",
    members: 5,
    description: "Craft user experiences, visual design, and maintain the design system.",
    color: "bg-pink-500",
    avatarColors: ["bg-pink-600", "bg-rose-600", "bg-red-500"],
    initials: ["AD", "JL", "KT"],
  },
  {
    name: "QA",
    members: 4,
    description: "Ensure product quality through automated and manual testing.",
    color: "bg-green-500",
    avatarColors: ["bg-green-600", "bg-emerald-600", "bg-lime-600", "bg-green-700"],
    initials: ["VS", "RT", "AM", "PK"],
  },
  {
    name: "DevOps",
    members: 3,
    description: "Manage CI/CD pipelines, cloud infrastructure, and deployment workflows.",
    color: "bg-orange-500",
    avatarColors: ["bg-orange-600", "bg-amber-600", "bg-yellow-600"],
    initials: ["SB", "KR", "NV"],
  },
  {
    name: "Marketing",
    members: 8,
    description: "Drive product awareness, growth initiatives, and brand strategy.",
    color: "bg-red-500",
    avatarColors: ["bg-red-600", "bg-rose-500", "bg-pink-500", "bg-red-700"],
    initials: ["LM", "TS", "RJ", "AK"],
  },
]

export default function TeamsDirectoryPage() {
  const [search, setSearch] = useState("")

  const filteredTeams = allTeams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Team directory</h1>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => window.dispatchEvent(new CustomEvent("open-create-team"))}
        >
          Create team
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {filteredTeams.length} {filteredTeams.length === 1 ? "team" : "teams"} found
      </p>

      {/* Teams grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <Link
              key={team.name}
              href={`/teams/${team.name.toLowerCase()}`}
              className="group flex flex-col rounded-lg border p-5 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex size-10 items-center justify-center rounded-lg ${team.color}`}>
                  <span className="text-sm font-bold text-white">
                    {team.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold group-hover:text-blue-600 transition-colors">
                    {team.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {team.members} {team.members === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                {team.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {team.initials.map((initial, i) => (
                    <Avatar key={i} className="size-7 border-2 border-background">
                      <AvatarFallback className={`text-[10px] font-medium text-white ${team.avatarColors[i]}`}>
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {team.members > team.initials.length && (
                    <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-gray-100 dark:bg-gray-800 text-[10px] text-muted-foreground font-medium">
                      +{team.members - team.initials.length}
                    </div>
                  )}
                </div>
                <svg
                  className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="mb-4 size-12 text-muted-foreground/50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h3 className="mb-1 text-sm font-medium">No teams found</h3>
          <p className="text-sm text-muted-foreground">
            Try a different search term or{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => window.dispatchEvent(new CustomEvent("open-create-team"))}
            >
              create a new team
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
