"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const teamsData: Record<string, {
  name: string
  description: string
  color: string
  members: { name: string; role: string; initials: string; color: string }[]
  projects: { name: string; key: string; status: string }[]
}> = {
  engineering: {
    name: "Engineering",
    description: "Build and maintain the core product, APIs, and infrastructure.",
    color: "bg-blue-500",
    members: [
      { name: "Abhishek Sharma", role: "Tech Lead", initials: "AS", color: "bg-blue-600" },
      { name: "Rahul Gupta", role: "Senior Engineer", initials: "RG", color: "bg-indigo-600" },
      { name: "Neha Kumar", role: "Backend Engineer", initials: "NK", color: "bg-cyan-600" },
      { name: "Dev Mehta", role: "Frontend Engineer", initials: "DM", color: "bg-teal-600" },
    ],
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
      { name: "Kanban Project", key: "KANB", status: "Active" },
    ],
  },
  product: {
    name: "Product",
    description: "Define product strategy, roadmap, and feature prioritization.",
    color: "bg-purple-500",
    members: [
      { name: "Priya Patel", role: "Product Manager", initials: "PP", color: "bg-purple-600" },
      { name: "Suresh Krishnan", role: "Product Analyst", initials: "SK", color: "bg-violet-600" },
      { name: "Maya Reddy", role: "UX Researcher", initials: "MR", color: "bg-fuchsia-600" },
    ],
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
    ],
  },
  design: {
    name: "Design",
    description: "Craft user experiences, visual design, and maintain the design system.",
    color: "bg-pink-500",
    members: [
      { name: "Anita Desai", role: "Design Lead", initials: "AD", color: "bg-pink-600" },
      { name: "Jordan Lee", role: "UI Designer", initials: "JL", color: "bg-rose-600" },
      { name: "Kim Tanaka", role: "Visual Designer", initials: "KT", color: "bg-red-500" },
    ],
    projects: [
      { name: "Kanban Project", key: "KANB", status: "Active" },
    ],
  },
  qa: {
    name: "QA",
    description: "Ensure product quality through automated and manual testing.",
    color: "bg-green-500",
    members: [
      { name: "Vikram Singh", role: "QA Lead", initials: "VS", color: "bg-green-600" },
      { name: "Ritu Thakur", role: "Test Engineer", initials: "RT", color: "bg-emerald-600" },
      { name: "Amit Mishra", role: "Automation Engineer", initials: "AM", color: "bg-lime-600" },
      { name: "Pooja Kapoor", role: "Manual Tester", initials: "PK", color: "bg-green-700" },
    ],
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
    ],
  },
  devops: {
    name: "DevOps",
    description: "Manage CI/CD pipelines, cloud infrastructure, and deployment workflows.",
    color: "bg-orange-500",
    members: [
      { name: "Sanjay Bhatt", role: "DevOps Lead", initials: "SB", color: "bg-orange-600" },
      { name: "Kiran Rao", role: "Cloud Engineer", initials: "KR", color: "bg-amber-600" },
      { name: "Nitin Verma", role: "SRE", initials: "NV", color: "bg-yellow-600" },
    ],
    projects: [
      { name: "My Scrum Project", key: "SCRUM", status: "Active" },
      { name: "Kanban Project", key: "KANB", status: "Active" },
    ],
  },
  marketing: {
    name: "Marketing",
    description: "Drive product awareness, growth initiatives, and brand strategy.",
    color: "bg-red-500",
    members: [
      { name: "Lakshmi Menon", role: "Marketing Lead", initials: "LM", color: "bg-red-600" },
      { name: "Tara Sharma", role: "Content Strategist", initials: "TS", color: "bg-rose-500" },
      { name: "Raj Joshi", role: "Growth Manager", initials: "RJ", color: "bg-pink-500" },
      { name: "Anu Kapoor", role: "Social Media", initials: "AK", color: "bg-red-700" },
    ],
    projects: [],
  },
}

export default function TeamDetailPage() {
  const params = useParams<{ id: string }>()
  const teamId = params.id
  const team = teamsData[teamId]
  const [activeTab, setActiveTab] = useState("members")

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground">
        <p>Team not found.</p>
        <Link href="/teams/directory" className="mt-2 text-blue-600 hover:underline">Back to directory</Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/teams" className="hover:text-foreground hover:underline">Teams</Link>
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3l5 5-5 5" /></svg>
        <Link href="/teams/directory" className="hover:text-foreground hover:underline">Directory</Link>
        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3l5 5-5 5" /></svg>
        <span className="text-foreground">{team.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`flex size-14 items-center justify-center rounded-lg ${team.color}`}>
          <span className="text-xl font-bold text-white">{team.name.charAt(0)}</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{team.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{team.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
        <span>{team.members.length} members</span>
        <span>{team.projects.length} projects</span>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        {/* Members tab */}
        <TabsContent value="members">
          <div className="rounded-lg border">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
              <span>Name</span><span>Role</span><span>Actions</span>
            </div>
            {team.members.map((member) => (
              <Link
                key={member.name}
                href="/teams/people"
                className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b last:border-b-0 px-4 py-3 items-center hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className={`text-[11px] font-medium text-white ${member.color}`}>
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{member.role}</span>
                <Button variant="outline" size="sm" className="text-xs">View profile</Button>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* Projects tab */}
        <TabsContent value="projects">
          {team.projects.length === 0 ? (
            <div className="rounded-lg border px-4 py-12 text-center text-sm text-muted-foreground">
              This team has no projects yet.
            </div>
          ) : (
            <div className="rounded-lg border">
              <div className="grid grid-cols-[1fr_100px_100px] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
                <span>Project</span><span>Key</span><span>Status</span>
              </div>
              {team.projects.map((project) => (
                <Link
                  key={project.key}
                  href={`/projects/${project.key}/board`}
                  className="grid grid-cols-[1fr_100px_100px] gap-4 border-b last:border-b-0 px-4 py-3 items-center hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm font-medium">{project.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{project.key}</span>
                  <span className="rounded border border-green-300 bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {project.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
