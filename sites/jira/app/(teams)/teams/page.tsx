"use client"

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const people = [
  { name: "Abhishek Sharma", initials: "AS", color: "bg-blue-600", role: "Software Engineer" },
  { name: "Priya Patel", initials: "PP", color: "bg-purple-600", role: "Product Manager" },
  { name: "Rahul Gupta", initials: "RG", color: "bg-green-600", role: "Senior Developer" },
  { name: "Anita Desai", initials: "AD", color: "bg-pink-600", role: "UX Designer" },
  { name: "Vikram Singh", initials: "VS", color: "bg-orange-600", role: "QA Engineer" },
]

const teams = [
  {
    name: "Engineering",
    slug: "engineering",
    description: "Build and maintain the core product, APIs, and infrastructure.",
    members: 12,
    color: "bg-blue-500",
    icon: (
      <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    name: "Product",
    slug: "product",
    description: "Define product strategy, roadmap, and feature prioritization.",
    members: 6,
    color: "bg-purple-500",
    icon: (
      <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    name: "Design",
    slug: "design",
    description: "Craft user experiences, visual design, and design systems.",
    members: 5,
    color: "bg-pink-500",
    icon: (
      <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

export default function TeamsForYouPage() {
  return (
    <div className="p-8 max-w-5xl">
      {/* People you work with */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">People you work with</h2>
            <Button variant="outline" size="sm">Add people</Button>
          </div>
          <Link href="/teams/people" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Browse everyone
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
        </div>

        <div className="flex flex-wrap gap-4">
          {people.map((person) => (
            <Link
              key={person.name}
              href="/teams/people"
              className="flex w-40 flex-col items-center rounded-lg border p-6 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <Avatar className="size-20 mb-3">
                <AvatarFallback className={`${person.color} text-2xl font-semibold text-white`}>
                  {person.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-center">{person.name}</span>
              <span className="text-xs text-muted-foreground text-center mt-1">{person.role}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Your teams */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Your teams</h2>
          <Link href="/teams/directory" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Browse all teams
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.slug}
              href={`/teams/${team.slug}`}
              className="group flex flex-col rounded-lg border p-5 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex size-10 items-center justify-center rounded-lg ${team.color}`}>
                  {team.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold group-hover:text-blue-600 transition-colors">{team.name}</h3>
                  <span className="text-xs text-muted-foreground">{team.members} members</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{team.description}</p>
              <div className="mt-3 flex -space-x-2">
                {Array.from({ length: Math.min(team.members, 4) }).map((_, i) => (
                  <Avatar key={i} className="size-7 border-2 border-background">
                    <AvatarFallback className="text-[10px] bg-gray-200 dark:bg-gray-700">
                      {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {team.members > 4 && (
                  <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-gray-100 dark:bg-gray-800 text-[10px] text-muted-foreground font-medium">
                    +{team.members - 4}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Create a team CTA */}
      <div className="flex items-start gap-8 rounded-xl border p-6">
        <div className="pt-1">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <svg className="size-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Want to create a new team?</h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground max-w-md">
            Bring people together by creating a team. Teams help you organize work, share knowledge, and collaborate more effectively across projects.
          </p>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => window.dispatchEvent(new CustomEvent("open-create-team"))}
          >
            Create a team
          </Button>
        </div>
      </div>
    </div>
  )
}
