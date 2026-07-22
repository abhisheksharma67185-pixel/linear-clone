"use client"

import { use, useEffect, useState } from "react"
import { TeamSettingsHub, type TeamRef } from "@/components/team-settings-hub"

export default function TeamSettingsPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = use(params)
  const teamKey = key.toUpperCase()
  const [team, setTeam] = useState<TeamRef | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then((list: TeamRef[]) => {
        if (cancelled) return
        setTeam(list.find((t) => t.key.toUpperCase() === teamKey) ?? null)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [teamKey])

  useEffect(() => {
    document.title = team?.name ?? "Team settings"
  }, [team?.name])

  if (loading) {
    return (
      <div className="text-muted-foreground p-6 text-sm">Loading team…</div>
    )
  }

  if (!team) {
    return (
      <div className="flex max-w-2xl flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Team not found</h1>
        <p className="text-muted-foreground text-sm">
          No team with key <span className="font-mono">{teamKey}</span> was
          found.
        </p>
      </div>
    )
  }

  return <TeamSettingsHub team={team} />
}
