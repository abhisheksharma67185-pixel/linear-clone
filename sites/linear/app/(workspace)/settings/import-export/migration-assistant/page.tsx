"use client"

import Link from "next/link"
import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

const SERVICE_LABELS: Record<string, string> = {
  asana: "Asana",
  shortcut: "Shortcut",
  github: "GitHub",
  jira: "Jira",
  linear: "Linear",
  trello: "Trello",
}

function MigrationAssistantInner() {
  const searchParams = useSearchParams()
  const raw = searchParams.get("service") ?? ""
  const serviceId = raw.toLowerCase()
  const name =
    SERVICE_LABELS[serviceId] ??
    serviceId.charAt(0).toUpperCase() + serviceId.slice(1)

  useEffect(() => {
    document.title = name ? `Migrate from ${name}` : "Migration assistant"
  }, [name])

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <Link
        href="/settings?section=import-export"
        scroll={false}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Back to Import &amp; export
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">
          {name ? `Migrate from ${name}` : "Migration assistant"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Follow the step-by-step assistant to import {name || "issues"} into
          your Linear workspace.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">Next steps</h2>
        <ol className="text-muted-foreground mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li>
            Connect your {name || "source"} account or upload an export file.
          </li>
          <li>Map projects, teams, and statuses to your Linear workspace.</li>
          <li>
            Preview the migration, then run it — you&apos;ll get an email when
            it&apos;s done.
          </li>
        </ol>
      </div>
    </div>
  )
}

export default function MigrationAssistantPage() {
  return (
    <Suspense fallback={null}>
      <MigrationAssistantInner />
    </Suspense>
  )
}
