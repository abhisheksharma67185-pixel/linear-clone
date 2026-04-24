"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowDown01Icon,
  PlusSignIcon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"
import type { Team, Member } from "@/app/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Priority = "none" | "low" | "medium" | "high" | "urgent"
const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "none", label: "No priority" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const ICON_PRESETS = [
  { name: "cube", glyph: "🧊" },
  { name: "rocket", glyph: "🚀" },
  { name: "target", glyph: "🎯" },
  { name: "sparkle", glyph: "✨" },
  { name: "compass", glyph: "🧭" },
  { name: "flag", glyph: "🏳️" },
] as const

type Milestone = { id: string; name: string }

type Attributes = {
  status: string
  priority: Priority
  leadId: string | null
  memberIds: string[]
  teamId: string | null
  labelIds: string[]
  dependencies: string[]
  issuesSeed: number
}

type ProjectTemplate = {
  id: string
  name: string
  iconName: string
  projectName: string
  summary: string
  description: string
  attributes: Attributes
  milestones: Milestone[]
  visibility: "private" | "workspace"
  scope: "workspace" | "team"
  createdAt: string
  updatedAt: string
}

type Props =
  | { mode: "new"; templateId?: undefined }
  | { mode: "edit"; templateId: string }

export function ProjectTemplateEditor(props: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(props.mode === "edit")
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [name, setName] = useState("")
  const [iconName, setIconName] = useState("cube")
  const [projectName, setProjectName] = useState("")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [attrs, setAttrs] = useState<Attributes>({
    status: "backlog",
    priority: "none",
    leadId: null,
    memberIds: [],
    teamId: null,
    labelIds: [],
    dependencies: [],
    issuesSeed: 0,
  })
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [visibility, setVisibility] =
    useState<"private" | "workspace">("workspace")
  const [scope, setScope] = useState<"workspace" | "team">("workspace")
  const [submitting, setSubmitting] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [t, m] = await Promise.all([
          fetch("/api/data/teams").then((r) => r.json()),
          fetch("/api/data/members").then((r) => r.json()),
        ])
        if (cancelled) return
        setTeams(t)
        setMembers(m)
        if (props.mode === "edit") {
          const tpl = (await fetch(
            `/api/project-templates/${props.templateId}`
          ).then((r) => (r.ok ? r.json() : null))) as ProjectTemplate | null
          if (tpl && !cancelled) {
            setName(tpl.name)
            setIconName(tpl.iconName)
            setProjectName(tpl.projectName)
            setSummary(tpl.summary)
            setDescription(tpl.description)
            setAttrs(tpl.attributes)
            setMilestones(tpl.milestones)
            setVisibility(tpl.visibility)
            setScope(tpl.scope)
          } else if (!cancelled) {
            toast.error("Template not found")
            router.replace("/settings/project-templates")
            return
          }
        }
      } catch {
        if (!cancelled) toast.error("Failed to load template data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [props, router])

  // Dirty-tracking: the Cancel button confirms only if the user has made edits.
  const isDirty =
    name.trim() !== "" ||
    projectName.trim() !== "" ||
    summary.trim() !== "" ||
    description.trim() !== "" ||
    milestones.length > 0

  const confirmCancel = () => {
    router.push("/settings/project-templates")
  }

  const onCancelClick = () => {
    if (isDirty) setCancelConfirmOpen(true)
    else confirmCancel()
  }

  const canSave = name.trim().length > 0 && !submitting

  const onSubmit = async () => {
    if (!canSave) return
    setSubmitting(true)
    const payload = {
      name,
      iconName,
      projectName,
      summary,
      description,
      attributes: attrs,
      milestones,
      visibility,
      scope,
    }
    try {
      const url =
        props.mode === "new"
          ? "/api/project-templates"
          : `/api/project-templates/${props.templateId}`
      const method = props.mode === "new" ? "POST" : "PATCH"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Save failed")
      }
      toast.success(
        props.mode === "new"
          ? "Project template created"
          : "Project template saved"
      )
      router.push("/settings/project-templates")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
      setSubmitting(false)
    }
  }

  // Keyboard: Esc = Cancel (with confirmation if dirty); Cmd/Ctrl+Enter = Create.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (cancelConfirmOpen) return
      if (e.key === "Escape") {
        e.preventDefault()
        onCancelClick()
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        onSubmit()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelConfirmOpen, canSave, name, summary, projectName, description, milestones])

  const iconGlyph =
    ICON_PRESETS.find((p) => p.name === iconName)?.glyph ?? "🧊"

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 text-sm">
        <div className="text-muted-foreground">Loading template…</div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <Link
        href="/settings/project-templates"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex w-fit items-center gap-1 rounded text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Project templates
      </Link>

      <div>
        <h1 className="text-xl font-semibold">
          {props.mode === "new" ? "New project template" : "Edit project template"}
        </h1>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pt-name" className="text-xs font-medium">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="pt-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a descriptive name…"
          aria-label="Template name"
          aria-required="true"
          className="h-9 text-sm"
        />
      </div>

      {/* Template body preview */}
      <div className="bg-card flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label={`Change template icon (current: ${iconName})`}
                  className="bg-muted focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-10 shrink-0 items-center justify-center rounded-md text-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {iconGlyph}
                </button>
              }
            />
            <DropdownMenuContent align="start" sideOffset={4}>
              {ICON_PRESETS.map((p) => (
                <DropdownMenuItem
                  key={p.name}
                  onClick={() => setIconName(p.name)}
                  aria-label={`Icon: ${p.name}`}
                >
                  <span className="text-base">{p.glyph}</span>
                  <span>{p.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex flex-1 flex-col gap-1">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              aria-label="Default project name"
              className="h-9 border-none bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0"
            />
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Add a short summary…"
              aria-label="Project summary"
              className="h-8 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Attribute chip row */}
        <div className="flex flex-wrap gap-1.5">
          <AttrSelect
            label="Backlog"
            value={attrs.status}
            options={[
              { value: "backlog", label: "Backlog" },
              { value: "planned", label: "Planned" },
              { value: "in-progress", label: "In progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            onChange={(v) => setAttrs((a) => ({ ...a, status: v }))}
            ariaLabel="Default project status"
          />
          <AttrSelect
            label="No priority"
            value={attrs.priority}
            options={PRIORITY_OPTIONS.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
            onChange={(v) => setAttrs((a) => ({ ...a, priority: v as Priority }))}
            ariaLabel="Default priority"
          />
          <AttrSelect
            label="Lead"
            value={attrs.leadId ?? ""}
            options={[
              { value: "", label: "No lead" },
              ...members.map((m) => ({ value: m.id, label: m.name })),
            ]}
            onChange={(v) =>
              setAttrs((a) => ({ ...a, leadId: v === "" ? null : v }))
            }
            ariaLabel="Default lead"
          />
          <AttrChip label={`Members${attrs.memberIds.length ? ` (${attrs.memberIds.length})` : ""}`} />
          <AttrSelect
            label="Team"
            value={attrs.teamId ?? ""}
            options={[
              { value: "", label: "No team" },
              ...teams.map((t) => ({ value: t.id, label: t.name })),
            ]}
            onChange={(v) =>
              setAttrs((a) => ({ ...a, teamId: v === "" ? null : v }))
            }
            ariaLabel="Default team"
          />
          <AttrChip label={`Labels${attrs.labelIds.length ? ` (${attrs.labelIds.length})` : ""}`} />
          <AttrChip label="Dependencies" />
          <AttrChip label="Issues" />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a description, a project brief, or collect ideas…"
            aria-label="Project description"
            rows={8}
            className="bg-background text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          />
        </div>

        {/* Milestones */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Milestones</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Add milestone"
              onClick={() =>
                setMilestones((list) => [
                  ...list,
                  {
                    id: `m_${Math.random().toString(36).slice(2, 8)}`,
                    name: "",
                  },
                ])
              }
              className="h-7 text-xs"
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                className="size-3"
              />
              Add milestone
            </Button>
          </div>
          {milestones.length === 0 ? (
            <div className="text-muted-foreground/70 rounded-md border border-dashed px-3 py-2 text-xs">
              No milestones yet
            </div>
          ) : (
            <ul role="list" className="flex flex-col gap-1.5">
              {milestones.map((ms, idx) => (
                <li key={ms.id} className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs w-5 tabular-nums">
                    {idx + 1}.
                  </span>
                  <Input
                    value={ms.name}
                    onChange={(e) =>
                      setMilestones((list) =>
                        list.map((m) =>
                          m.id === ms.id ? { ...m, name: e.target.value } : m
                        )
                      )
                    }
                    placeholder="Milestone name"
                    aria-label={`Milestone ${idx + 1} name`}
                    className="h-8 flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove milestone ${idx + 1}`}
                    onClick={() =>
                      setMilestones((list) =>
                        list.filter((m) => m.id !== ms.id)
                      )
                    }
                  >
                    <HugeiconsIcon
                      icon={Delete01Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="pt-visibility"
            className="text-xs font-medium"
          >
            Visibility
          </Label>
          <Select
            value={visibility}
            onValueChange={(v) =>
              setVisibility(v as "private" | "workspace")
            }
          >
            <SelectTrigger id="pt-visibility" className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workspace">Workspace</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="pt-scope" className="text-xs font-medium">
            Scope
          </Label>
          <Select
            value={scope}
            onValueChange={(v) => setScope(v as "workspace" | "team")}
          >
            <SelectTrigger id="pt-scope" className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workspace">Workspace</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onCancelClick}
            aria-label="Cancel and return to the list"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!canSave}
            aria-label={
              props.mode === "new"
                ? "Create project template"
                : "Save project template"
            }
          >
            {submitting
              ? "Saving…"
              : props.mode === "new"
                ? "Create"
                : "Save"}
          </Button>
        </div>
      </div>
      <div className="text-muted-foreground text-right text-[11px]">
        <kbd className="font-mono">Esc</kbd> cancel ·{" "}
        <kbd className="font-mono">⌘/Ctrl + Enter</kbd> save
      </div>

      {/* Simple confirm-cancel dialog — inline to avoid another module. */}
      {cancelConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pt-cancel-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setCancelConfirmOpen(false)}
        >
          <div
            className="bg-popover ring-border/70 flex w-full max-w-sm flex-col gap-3 rounded-lg p-4 shadow-xl ring-1"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="pt-cancel-title" className="text-sm font-semibold">
              Discard changes?
            </h2>
            <p className="text-muted-foreground text-xs">
              You&apos;ll lose the unsaved edits to this template.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelConfirmOpen(false)}
              >
                Keep editing
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={confirmCancel}
                className="bg-destructive hover:bg-destructive/90"
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AttrSelect({
  label,
  value,
  options,
  onChange,
  ariaLabel,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  ariaLabel: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={ariaLabel}
            className="bg-muted/40 text-foreground hover:bg-accent/40 focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {options.find((o) => o.value === value)?.label ?? label}
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
          </button>
        }
      />
      <DropdownMenuContent align="start" sideOffset={4}>
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onClick={() => onChange(o.value)}>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AttrChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      aria-label={`${label} (picker coming soon)`}
      className="bg-muted/20 text-muted-foreground inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-dashed px-2.5 py-1 text-xs font-medium"
    >
      {label}
    </button>
  )
}
