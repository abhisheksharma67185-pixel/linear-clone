"use client"

/**
 * /views/new — the "New view" route.
 *
 * The bug this route fixes: in the previous iteration the only way
 * to create a view was via a modal launched from the Views index;
 * deep-linking to a "create view" URL wasn't possible, and any
 * page-level breadcrumb on the Views index used to leak the
 * previously-viewed view's title into the header on a fresh
 * "create" navigation.
 *
 * This page renders a deterministic "New view" header so the
 * breadcrumb always reads "Views › New view" regardless of what
 * the user navigated from. The CreateViewDialog opens automatically
 * on mount and routes back to /views on close so the create flow
 * still happens through the existing modal — only the entry point
 * is now URL-addressable.
 */

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateViewDialog } from "@/components/create-view-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

export default function NewViewPage() {
  const router = useRouter()
  // Modal opens on mount — this route is essentially a deep-linkable
  // wrapper around the existing CreateViewDialog. When the user
  // dismisses the dialog (Cancel / Escape / backdrop), we route
  // back to the Views index so the URL doesn't get stuck on /new.
  const [dialogOpen, setDialogOpen] = useState(true)

  useEffect(() => {
    if (!dialogOpen) {
      router.push("/views")
    }
  }, [dialogOpen, router])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-2.5">
        <nav
          aria-label="Breadcrumb"
          data-testid="views-breadcrumb"
          className="flex items-center gap-1.5 text-sm"
        >
          <Link
            href="/views"
            data-testid="views-breadcrumb-root"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Views
          </Link>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            aria-hidden="true"
            className="text-muted-foreground/50 size-3"
          />
          {/*
            "New view" is the literal mode==="create" label per spec.
            Tagged so the e2e can assert exact text, and rendered as a
            <span> with no href because it's the current page.
          */}
          <span
            data-testid="views-breadcrumb-current"
            className="font-medium"
          >
            New view
          </span>
        </nav>
      </header>

      {/* Empty body — the dialog is the page. We render a centered
          fallback in case the dialog is dismissed and routing hasn't
          yet landed on /views. */}
      <div className="flex flex-1 items-center justify-center">
        <Button
          type="button"
          onClick={() => setDialogOpen(true)}
          variant="outline"
          className="gap-2"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
          Open New view dialog
        </Button>
      </div>

      <CreateViewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => {
          // After a successful create, leave the /new route — the
          // user is done here.
          router.push("/views")
        }}
      />
    </div>
  )
}
