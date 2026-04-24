"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { TEAM_HUB_GROUPS } from "@/lib/team-hub"

type TeamRef = { id: string; name: string; key: string }

function sectionCopy(sectionId: string): {
  label: string
  subtitle: string
} {
  for (const g of TEAM_HUB_GROUPS) {
    for (const s of g.sections) {
      if (s.id === sectionId) return { label: s.label, subtitle: s.subtitle }
    }
  }
  const label = sectionId
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
  return { label, subtitle: "" }
}

export default function TeamSectionSubPage({
  params,
}: {
  params: Promise<{ key: string; section: string }>
}) {
  const { key, section } = use(params)
  const teamKey = key.toUpperCase()
  const [team, setTeam] = useState<TeamRef | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/data/teams")
      .then((r) => r.json())
      .then((list: TeamRef[]) => {
        if (cancelled) return
        setTeam(list.find((t) => t.key.toUpperCase() === teamKey) ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [teamKey])

  const copy = sectionCopy(section)
  useEffect(() => {
    document.title = `${copy.label}${team ? ` · ${team.name}` : ""}`
  }, [copy.label, team])

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <Link
        href={`/settings/teams/${teamKey}`}
        scroll={false}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        {team?.name ?? teamKey}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{copy.label}</h1>
        {copy.subtitle && (
          <p className="text-muted-foreground mt-1 text-sm">{copy.subtitle}</p>
        )}
      </div>

      <div className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Coming soon</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          This is a placeholder for the <span className="font-medium">{copy.label}</span>{" "}
          section of the {team?.name ?? teamKey} team. The production page
          would host the detailed configuration UI for this area.
        </p>
      </div>
    </div>
  )
}
