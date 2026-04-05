"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Project, User } from "@/app/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ]).then(([p, u]) => {
      setProjects(p)
      setUsers(u)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All projects in your organization.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const lead = users.find((u) => u.id === project.lead)
          return (
            <Link key={project.id} href={`/projects/${project.key}/board`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      {project.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        project.type === "scrum"
                          ? "border-blue-300 text-blue-700 dark:text-blue-400"
                          : "border-purple-300 text-purple-700 dark:text-purple-400"
                      }
                    >
                      {project.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono font-medium">{project.key}</span>
                    {lead && (
                      <>
                        <span className="text-border">|</span>
                        <Avatar className="size-4">
                          <AvatarImage src={lead.avatar} />
                          <AvatarFallback className="text-[8px]">
                            {lead.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>Lead: {lead.name}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
