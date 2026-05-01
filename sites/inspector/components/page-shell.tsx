/**
 * <PageShell>
 *
 * PURPOSE  Standard page wrapper used by every top-level inspector
 *          route. Provides the centered max-w-7xl container, the page
 *          heading, optional subtitle/description, and an optional
 *          right-aligned action slot (typically a primary Button).
 * USAGE    `<PageShell title="Tasks" description="..." actions={...}>
 *            <YourContent />
 *          </PageShell>`
 *          Keep page bodies focused on content; let this component own
 *          the chrome so the layout stays consistent across routes.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface PageShellProps {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PageShell({
  title,
  description,
  actions,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl p-4 md:p-8", className)}>
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </header>
      {children}
    </div>
  )
}
