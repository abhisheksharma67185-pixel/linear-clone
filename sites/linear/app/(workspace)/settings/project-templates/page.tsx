"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PlusSignIcon,
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Copy01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"

type ProjectTemplate = {
  id: string
  name: string
  iconName: string
  projectName: string
  summary: string
  description: string
  visibility: "private" | "workspace"
  scope: "workspace" | "team"
  createdAt: string
  updatedAt: string
}

const ICON_GLYPHS: Record<string, string> = {
  cube: "🧊",
  rocket: "🚀",
  target: "🎯",
  sparkle: "✨",
  compass: "🧭",
  flag: "🏳️",
}

export default function ProjectTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [confirmDelete, setConfirmDelete] = useState<ProjectTemplate | null>(
    null
  )

  // Client component — set the tab title manually (Next `metadata` export
  // is server-component only).
  useEffect(() => {
    document.title = "Project templates"
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/project-templates")
      .then((r) => r.json())
      .then((list: ProjectTemplate[]) => {
        if (!cancelled) setTemplates(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const duplicate = async (t: ProjectTemplate) => {
    try {
      const res = await fetch(`/api/project-templates/${t.id}/duplicate`, {
        method: "POST",
      })
      if (!res.ok) throw new Error()
      const copy = (await res.json()) as ProjectTemplate
      setTemplates((prev) => [...prev, copy])
      toast.success(`Duplicated "${t.name}"`)
    } catch {
      toast.error("Failed to duplicate template")
    }
  }

  const remove = async () => {
    if (!confirmDelete) return
    const t = confirmDelete
    const prev = templates
    setTemplates((list) => list.filter((x) => x.id !== t.id))
    setConfirmDelete(null)
    try {
      const res = await fetch(`/api/project-templates/${t.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast.success(`Deleted "${t.name}"`)
    } catch {
      setTemplates(prev)
      toast.error("Failed to delete template")
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <Link
        href="/settings"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex w-fit items-center gap-1 rounded text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Settings
      </Link>

      <div>
        <h1 className="text-xl font-semibold">Project templates</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          These templates are available when creating projects for any team in
          the workspace. To create templates that only apply to specific teams,
          add them as team templates.{" "}
          <a
            href="https://linear.app/docs/project-templates"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open project templates documentation in a new tab"
            className="text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex items-center rounded font-medium underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Docs ↗
          </a>
        </p>
      </div>

      {templates.length === 0 ? (
        <div
          data-testid="empty-state"
          className="bg-card flex items-center justify-between rounded-lg border px-4 py-3"
        >
          <span className="text-muted-foreground text-sm">
            No project templates
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="New project template"
            onClick={() => router.push("/settings/templates/project/new")}
            className="gap-1 text-sm font-medium"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New
            template
          </Button>
        </div>
      ) : (
        <div data-testid="list-state" className="bg-card rounded-lg border">
          <ul role="list" className="divide-border divide-y">
            {templates.map((t) => (
              <li
                key={t.id}
                className="group/row hover:bg-accent/20 flex items-center gap-3 px-4 py-3"
              >
                <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-base">
                  {ICON_GLYPHS[t.iconName] ?? "🧊"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/settings/templates/project/${t.id}`)
                  }
                  aria-label={`Edit template ${t.name}`}
                  className="focus-visible:ring-primary/50 focus-visible:ring-offset-background min-w-0 flex-1 rounded-sm text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t.name}</span>
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
                      {t.visibility === "workspace" ? "Workspace" : "Private"}
                    </span>
                  </div>
                  {t.summary && (
                    <div className="text-muted-foreground mt-0.5 truncate text-xs">
                      {t.summary}
                    </div>
                  )}
                </button>
                <div className="text-muted-foreground shrink-0 text-xs">
                  Updated{" "}
                  {new Date(t.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        aria-label={`Actions for ${t.name}`}
                        className="text-muted-foreground hover:bg-accent/40 hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <HugeiconsIcon
                          icon={MoreHorizontalIcon}
                          strokeWidth={2}
                          className="size-3.5"
                        />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" sideOffset={4}>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/settings/templates/project/${t.id}`)
                      }
                    >
                      <HugeiconsIcon
                        icon={PencilEdit01Icon}
                        strokeWidth={2}
                        className="size-3.5"
                      />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicate(t)}>
                      <HugeiconsIcon
                        icon={Copy01Icon}
                        strokeWidth={2}
                        className="size-3.5"
                      />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setConfirmDelete(t)}
                      className="text-destructive data-highlighted:text-destructive data-highlighted:bg-destructive/10"
                    >
                      <HugeiconsIcon
                        icon={Delete01Icon}
                        strokeWidth={2}
                        className="size-3.5"
                      />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
          <div className="flex justify-end border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label="New project template"
              onClick={() => router.push("/settings/templates/project/new")}
              className="gap-1 text-sm font-medium"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" /> New
              template
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete template?</DialogTitle>
            <DialogDescription>
              The project template{" "}
              <span className="text-foreground font-medium">
                {confirmDelete?.name}
              </span>{" "}
              will be permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={remove}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
