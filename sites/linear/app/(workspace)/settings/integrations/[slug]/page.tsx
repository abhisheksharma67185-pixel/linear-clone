"use client"

import Link from "next/link"
import { use } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Shield01Icon,
  Link01Icon,
} from "@hugeicons/core-free-icons"

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ")
}

export default function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const name = titleFromSlug(slug)

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <Link
        href="/settings?section=integrations"
        scroll={false}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Back to integrations
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Full integration configuration for <span className="font-medium">{name}</span>.
          Connect your workspace to sync data and enable workflow automations.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <h2 className="text-sm font-semibold">About</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          This is a stub detail page used by the settings mock. The production
          integration details pane would include a full product description,
          supported features, pricing tier requirements, and release notes.
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              toast.info(`${name} OAuth connect flow coming soon`)
            }
          >
            <HugeiconsIcon icon={Link01Icon} className="size-3.5" />
            Connect {name}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a
              href={`https://linear.app/docs/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} docs (opens in new tab)`}
            >
              Learn more
            </a>
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-5">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={Shield01Icon}
            className="text-muted-foreground size-4"
          />
          <h2 className="text-sm font-semibold">Permissions</h2>
        </div>
        <ul className="text-muted-foreground mt-3 list-disc space-y-1.5 pl-5 text-sm">
          <li>Read your Linear workspace and teams.</li>
          <li>Create and update issues on your behalf.</li>
          <li>Post notifications to connected channels.</li>
        </ul>
      </div>
    </div>
  )
}
