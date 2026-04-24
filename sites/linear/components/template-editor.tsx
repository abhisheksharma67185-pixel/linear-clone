"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowDown01Icon,
  FileAddIcon,
  PlusSignIcon,
  Delete01Icon,
  MoreHorizontalIcon,
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
import { Switch } from "@/components/ui/switch"
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

type CustomFormField = {
  id: string
  kind:
    | "text"
    | "textarea"
    | "select"
    | "multi-select"
    | "number"
    | "date"
    | "toggle"
  label: string
  placeholder: string
  required: boolean
  options: string[]
}

type IssueTemplate = {
  id: string
  type: "standard" | "custom-form"
  name: string
  description: string
  issueTitle: string
  issueBody: string
  defaults: {
    teamId: string | null
    priority: Priority
    assigneeId: string | null
    projectId: string | null
    labelIds: string[]
  }
  fields: CustomFormField[]
  createdAt: string
  updatedAt: string
}

type Props =
  | { mode: "new"; type: "standard" | "custom-form"; templateId?: undefined }
  | { mode: "edit"; templateId: string; type?: undefined }

export function TemplateEditor(props: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(props.mode === "edit")
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [issueTitle, setIssueTitle] = useState("")
  const [issueBody, setIssueBody] = useState("")
  const [teamId, setTeamId] = useState<string | null>(null)
  const [priority, setPriority] = useState<Priority>("none")
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [fields, setFields] = useState<CustomFormField[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Effective type: from props for "new", from fetched template for "edit".
  const [type, setType] = useState<"standard" | "custom-form">(
    props.mode === "new" ? props.type : "standard"
  )

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
            `/api/templates/${props.templateId}`
          ).then((r) => (r.ok ? r.json() : null))) as IssueTemplate | null
          if (tpl && !cancelled) {
            setType(tpl.type)
            setName(tpl.name)
            setDescription(tpl.description)
            setIssueTitle(tpl.issueTitle)
            setIssueBody(tpl.issueBody)
            setTeamId(tpl.defaults.teamId)
            setPriority(tpl.defaults.priority)
            setAssigneeId(tpl.defaults.assigneeId)
            setFields(tpl.fields)
          } else if (!cancelled) {
            toast.error("Template not found")
            router.replace("/settings?section=issue-templates")
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

  const canSave = name.trim().length > 0 && !!teamId && !submitting

  const onCancel = () => {
    router.push("/settings?section=issue-templates")
  }

  const onSubmit = async () => {
    if (!canSave) return
    setSubmitting(true)
    const payload = {
      type,
      name,
      description,
      issueTitle,
      issueBody,
      defaults: { teamId, priority, assigneeId, projectId: null, labelIds: [] },
      fields,
    }
    try {
      const url =
        props.mode === "new"
          ? "/api/templates"
          : `/api/templates/${props.templateId}`
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
        props.mode === "new" ? "Template created" : "Template saved"
      )
      router.push("/settings?section=issue-templates")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
      setSubmitting(false)
    }
  }

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
        href="/settings?section=issue-templates"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex w-fit items-center gap-1 rounded text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Issue templates
      </Link>

      <div className="flex items-start gap-3">
        <div className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md">
          <HugeiconsIcon
            icon={FileAddIcon}
            strokeWidth={2}
            className="size-4"
          />
        </div>
        <div className="flex-1">
          <Input
            id="template-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            aria-label="Template name"
            className="h-9 border-none bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          />
          <Input
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add an optional template description…"
            aria-label="Template description"
            className="h-8 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {type === "standard" ? (
        <StandardTemplateBody
          issueTitle={issueTitle}
          setIssueTitle={setIssueTitle}
          issueBody={issueBody}
          setIssueBody={setIssueBody}
        />
      ) : (
        <CustomFormBody fields={fields} setFields={setFields} />
      )}

      <DefaultPropertiesSection
        teams={teams}
        members={members}
        teamId={teamId}
        setTeamId={setTeamId}
        priority={priority}
        setPriority={setPriority}
        assigneeId={assigneeId}
        setAssigneeId={setAssigneeId}
      />

      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          aria-label="Cancel and discard template"
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!canSave}
          aria-label={props.mode === "new" ? "Create template" : "Save template"}
        >
          {submitting
            ? "Saving…"
            : props.mode === "new"
              ? "Create"
              : "Save"}
        </Button>
      </div>
    </div>
  )
}

function StandardTemplateBody({
  issueTitle,
  setIssueTitle,
  issueBody,
  setIssueBody,
}: {
  issueTitle: string
  setIssueTitle: (v: string) => void
  issueBody: string
  setIssueBody: (v: string) => void
}) {
  return (
    <div className="bg-card flex flex-col rounded-lg border">
      <Input
        value={issueTitle}
        onChange={(e) => setIssueTitle(e.target.value)}
        placeholder="Issue title"
        aria-label="Default issue title"
        className="h-10 border-none bg-transparent px-4 text-base font-medium shadow-none focus-visible:ring-0"
      />
      <textarea
        value={issueBody}
        onChange={(e) => setIssueBody(e.target.value)}
        placeholder="Add description…"
        aria-label="Default issue description. Supports markdown and slash commands."
        rows={10}
        className="placeholder:text-muted-foreground/60 w-full resize-none bg-transparent px-4 pb-4 text-sm outline-none"
      />
      <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">
        Supports markdown and <code className="font-mono">/</code> slash commands
      </div>
    </div>
  )
}

function CustomFormBody({
  fields,
  setFields,
}: {
  fields: CustomFormField[]
  setFields: React.Dispatch<React.SetStateAction<CustomFormField[]>>
}) {
  const addField = (kind: CustomFormField["kind"]) => {
    setFields((list) => [
      ...list,
      {
        id: `fld_${Math.random().toString(36).slice(2, 10)}`,
        kind,
        label: "",
        placeholder: "",
        required: false,
        options: kind === "select" || kind === "multi-select" ? [""] : [],
      },
    ])
  }

  const updateField = (id: string, patch: Partial<CustomFormField>) => {
    setFields((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  const removeField = (id: string) => {
    setFields((list) => list.filter((f) => f.id !== id))
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>
          Define structured fields and inputs. Saved with the template schema.
        </span>
      </div>

      {fields.length === 0 && (
        <div className="text-muted-foreground py-3 text-center text-xs">
          No fields yet — add one below to start building your form.
        </div>
      )}

      <ul role="list" className="flex flex-col gap-3">
        {fields.map((field) => (
          <li
            key={field.id}
            className="bg-background flex flex-col gap-2 rounded-md border p-3"
          >
            <div className="flex items-center gap-2">
              <Input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                placeholder="Field label"
                aria-label="Field label"
                className="h-8 flex-1 text-sm"
              />
              <Select
                value={field.kind}
                onValueChange={(v) =>
                  updateField(field.id, {
                    kind: v as CustomFormField["kind"],
                  })
                }
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="multi-select">Multi-select</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="toggle">Toggle</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete field ${field.label || "(unnamed)"}`}
                onClick={() => removeField(field.id)}
              >
                <HugeiconsIcon
                  icon={Delete01Icon}
                  strokeWidth={2}
                  className="size-3.5"
                />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Input
                value={field.placeholder}
                onChange={(e) =>
                  updateField(field.id, { placeholder: e.target.value })
                }
                placeholder="Placeholder (optional)"
                aria-label="Field placeholder"
                className="h-8 flex-1 text-sm"
              />
              <label className="text-muted-foreground flex items-center gap-2 text-xs">
                <Switch
                  checked={field.required}
                  onCheckedChange={(v) =>
                    updateField(field.id, { required: v })
                  }
                />
                Required
              </label>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {(
          ["text", "textarea", "select", "multi-select", "number", "date", "toggle"] as const
        ).map((kind) => (
          <Button
            key={kind}
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Add ${kind} field`}
            onClick={() => addField(kind)}
            className="h-7 text-xs"
          >
            <HugeiconsIcon
              icon={PlusSignIcon}
              strokeWidth={2}
              className="size-3"
            />
            {kind}
          </Button>
        ))}
      </div>
    </div>
  )
}

function DefaultPropertiesSection({
  teams,
  members,
  teamId,
  setTeamId,
  priority,
  setPriority,
  assigneeId,
  setAssigneeId,
}: {
  teams: Team[]
  members: Member[]
  teamId: string | null
  setTeamId: (v: string | null) => void
  priority: Priority
  setPriority: (v: Priority) => void
  assigneeId: string | null
  setAssigneeId: (v: string | null) => void
}) {
  const teamName = useMemo(
    () => teams.find((t) => t.id === teamId)?.name ?? null,
    [teams, teamId]
  )
  const priorityLabel =
    PRIORITY_OPTIONS.find((p) => p.value === priority)?.label ?? "No priority"
  const assigneeName =
    members.find((m) => m.id === assigneeId)?.name ?? "No assignee"

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">Default properties</h2>
        <p className="text-muted-foreground text-xs">
          Automatically applied upon issue creation, and editable when composing
          within Linear.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <PillPicker
          label="Team"
          value={teamName}
          required={!teamId}
          ariaLabel="Set default team"
          options={teams.map((t) => ({
            key: t.id,
            label: t.name,
            onSelect: () => setTeamId(t.id),
          }))}
        />
        <PillPicker
          label="Priority"
          value={priorityLabel !== "No priority" ? priorityLabel : null}
          ariaLabel="Set default priority"
          options={PRIORITY_OPTIONS.map((p) => ({
            key: p.value,
            label: p.label,
            onSelect: () => setPriority(p.value),
          }))}
        />
        <PillPicker
          label="Assignee"
          value={assigneeId ? assigneeName : null}
          ariaLabel="Set default assignee"
          options={[
            {
              key: "__none",
              label: "No assignee",
              onSelect: () => setAssigneeId(null),
            },
            ...members.map((m) => ({
              key: m.id,
              label: m.name,
              onSelect: () => setAssigneeId(m.id),
            })),
          ]}
        />
        <PillPicker
          label="Project"
          value={null}
          ariaLabel="Set default project"
          options={[]}
        />
        <PillPicker
          label="Labels"
          value={null}
          ariaLabel="Set default labels"
          options={[]}
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="More default properties"
                className="text-muted-foreground hover:bg-accent/30 focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex items-center gap-1 rounded-md border border-dashed px-2.5 py-1 text-xs font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  strokeWidth={2}
                  className="size-3"
                />
                More
              </button>
            }
          />
          <DropdownMenuContent align="start" sideOffset={4}>
            <DropdownMenuItem disabled>Status</DropdownMenuItem>
            <DropdownMenuItem disabled>Estimate</DropdownMenuItem>
            <DropdownMenuItem disabled>Cycle</DropdownMenuItem>
            <DropdownMenuItem disabled>Due date</DropdownMenuItem>
            <DropdownMenuItem disabled>Parent</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function PillPicker({
  label,
  value,
  required,
  ariaLabel,
  options,
}: {
  label: string
  value: string | null
  required?: boolean
  ariaLabel: string
  options: { key: string; label: string; onSelect: () => void }[]
}) {
  const display = value ?? label
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={ariaLabel}
            className={`focus-visible:ring-primary/50 focus-visible:ring-offset-background inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
              value
                ? "bg-muted/40 text-foreground"
                : "text-muted-foreground hover:bg-accent/30"
            } ${required ? "border-destructive/50" : ""}`}
          >
            {display}
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />
          </button>
        }
      />
      <DropdownMenuContent align="start" sideOffset={4}>
        {options.length === 0 ? (
          <DropdownMenuItem disabled>No options available</DropdownMenuItem>
        ) : (
          options.map((opt) => (
            <DropdownMenuItem
              key={opt.key}
              onClick={opt.onSelect}
              aria-label={`${label}: ${opt.label}`}
            >
              {opt.label}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
