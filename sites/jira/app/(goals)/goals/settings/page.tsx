"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useCustomFields } from "@/hooks/use-custom-fields"
import { useGoalTypes } from "@/hooks/use-goal-types"
import type { GoalTypeItem } from "@/hooks/use-goal-types"
import { RESERVED_LABELS } from "@/lib/columns-def"

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD_TYPES = ["Text", "Number", "Date", "URL", "Select", "User"] as const
type FieldType = (typeof FIELD_TYPES)[number]

/** Seeded read-only rows — always shown, cannot be deleted */
const SEEDED_FIELDS = [
  {
    id: "dept",
    name: "Department",
    type: "Text" as const,
    description: "Department leading this project",
    icon: (
      <svg
        className="size-4 text-[#626f86]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 7V4h16v3" />
        <path d="M9 20h6" />
        <path d="M12 4v16" />
      </svg>
    ),
  },
  {
    id: "project-key",
    name: "Project key",
    type: "Text" as const,
    description: "Project keys assigned to this goal",
    icon: (
      <svg
        className="size-4 text-[#626f86]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "sponsor",
    name: "Sponsor",
    type: "User" as const,
    description: "Person carrying this goal over the finish line",
    icon: (
      <svg
        className="size-4 text-[#626f86]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      </svg>
    ),
  },
]

// ─── Goal type icons ─────────────────────────────────────────────────────────

function GoalTypeIcon({ id }: { id: string }) {
  if (id === "objective")
    return (
      <svg
        className="size-5 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  return (
    <svg
      className="size-5 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function GoalChildIcon({ name }: { name: string }) {
  if (name === "Key result")
    return (
      <svg
        className="size-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  return (
    <svg
      className="size-4 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  )
}

// ─── Validate field name ──────────────────────────────────────────────────────

function validateFieldName(
  name: string,
  existingNames: string[]
): string | null {
  const trimmed = name.trim()
  if (!trimmed) return "Field name is required"
  if (trimmed.length > 50) return "Must be 50 characters or fewer"
  const lc = trimmed.toLowerCase()
  if (RESERVED_LABELS.some((r) => r.toLowerCase() === lc))
    return `"${trimmed}" is a reserved name`
  if (existingNames.some((n) => n.toLowerCase() === lc))
    return `A field named "${trimmed}" already exists`
  return null
}

// ─── Field type icon ─────────────────────────────────────────────────────────

function FieldTypeIcon({ type }: { type: string }) {
  if (type === "Number")
    return (
      <svg
        className="size-4 text-[#626f86]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    )
  if (type === "User")
    return (
      <svg
        className="size-4 text-[#626f86]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      </svg>
    )
  if (type === "Select")
    return (
      <svg
        className="size-4 text-[#626f86]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    )
  // Text
  return (
    <svg
      className="size-4 text-[#626f86]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  )
}

// ─── Add Field Inline Form ────────────────────────────────────────────────────

interface AddFieldFormProps {
  existingNames: string[]
  onSave: (data: {
    name: string
    type: FieldType
    options: string[]
    multi: boolean
    description: string
  }) => Promise<void>
  onCancel: () => void
}

function AddFieldForm({ existingNames, onSave, onCancel }: AddFieldFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<FieldType>("Text")
  const [options, setOptions] = useState<string[]>([""])
  const [multi, setMulti] = useState(false)
  const [description, setDescription] = useState("")
  const [nameError, setNameError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const nameErr = name ? validateFieldName(name, existingNames) : null
  const optionsFilled = options.filter((o) => o.trim())
  const selectValid = type !== "Select" || optionsFilled.length > 0
  const canSave = name.trim() && !nameErr && selectValid

  const handleSave = async () => {
    const err = validateFieldName(name, existingNames)
    if (err) {
      setNameError(err)
      return
    }
    if (!selectValid) return
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        type,
        options: optionsFilled,
        multi,
        description: description.trim(),
      })
    } finally {
      setSaving(false)
    }
  }

  const addOption = () => setOptions((prev) => [...prev, ""])
  const updateOption = (i: number, val: string) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)))
  const removeOption = (i: number) =>
    setOptions((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev
    )

  return (
    <div className="rounded-lg border border-[#0052cc] bg-white p-5 shadow-sm dark:bg-card">
      <h3 className="mb-4 text-[14px] font-semibold text-[#172b4d] dark:text-foreground">
        Create field
      </h3>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#172b4d] dark:text-foreground">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            maxLength={50}
            onChange={(e) => {
              setName(e.target.value)
              setNameError(validateFieldName(e.target.value, existingNames))
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") onCancel()
            }}
            placeholder="e.g. Priority, Quarter, Cost center"
            className={`w-full rounded-[3px] border bg-background px-3 py-2 text-[13px] outline-none placeholder:text-[#626f86] focus:ring-1 ${
              nameError || nameErr
                ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                : "border-[#dfe1e6] focus:border-[#0052cc] focus:ring-[#0052cc]"
            }`}
          />
          {(nameError ?? nameErr) && (
            <p className="mt-1 text-[11px] text-red-500">
              {nameError ?? nameErr}
            </p>
          )}
          <p className="mt-1 text-[11px] text-[#626f86]">{name.length}/50</p>
        </div>

        {/* Field type */}
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#172b4d] dark:text-foreground">
            Field type <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as FieldType)}
            className="w-full rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-[#626f86]">
            You can&apos;t change the type after creating a field.
          </p>
        </div>

        {/* Select-specific */}
        {type === "Select" && (
          <>
            <div className="flex items-center gap-2">
              <input
                id="multi-check"
                type="checkbox"
                checked={multi}
                onChange={(e) => setMulti(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-[#dfe1e6] accent-[#0052cc]"
              />
              <label
                htmlFor="multi-check"
                className="cursor-pointer text-[13px] text-[#172b4d] dark:text-foreground"
              >
                Let users select multiple options
              </label>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#172b4d] dark:text-foreground">
                Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-1.5 text-[13px] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      disabled={options.length === 1}
                      className="rounded p-1 text-[#626f86] transition-colors hover:text-red-500 disabled:opacity-30"
                    >
                      <svg
                        className="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-2 flex items-center gap-1 text-[12px] text-[#0052cc] hover:underline"
              >
                <svg
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add option
              </button>
              {type === "Select" && optionsFilled.length === 0 && (
                <p className="mt-1 text-[11px] text-red-500">
                  At least one option is required
                </p>
              )}
            </div>
          </>
        )}

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#172b4d] dark:text-foreground">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this field captures…"
            rows={2}
            className="w-full resize-none rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-2 text-[13px] outline-none placeholder:text-[#626f86] focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
          />
          <p className="mt-1 text-[11px] text-[#626f86]">
            Users see this info when they hover over the field.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid="add-field-save-btn"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="rounded-[3px] bg-[#0052cc] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0747a6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function GoalSettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab =
    (searchParams.get("tab") as "types" | "fields" | "scoring") ?? "types"
  const [activeTab, setActiveTab] = useState<"types" | "fields" | "scoring">(
    initialTab
  )

  const {
    fields: customFields,
    createField,
    updateField,
    deleteField,
  } = useCustomFields()
  const {
    types,
    createType: apiCreateType,
    updateType: apiUpdateType,
    deleteType: apiDeleteType,
    toggleType: apiToggleType,
  } = useGoalTypes()

  const [scoringMethod, setScoringMethod] = useState<"simple" | "score">(
    "simple"
  )
  const [savedScoring, setSavedScoring] = useState<"simple" | "score">("simple")

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // When URL tab param changes, sync state (external sync: URL → UI).
  useEffect(() => {
    const tab = searchParams.get("tab") as "types" | "fields" | "scoring" | null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab && tab !== activeTab) setActiveTab(tab)
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab: "types" | "fields" | "scoring") => {
    setActiveTab(tab)
    router.replace(`/goals/settings?tab=${tab}`, { scroll: false })
  }

  // ── Types tab ──────────────────────────────────────────────────────────────
  const [editTypeId, setEditTypeId] = useState<string | null>(null)
  const [editTypeName, setEditTypeName] = useState("")
  const [editTypeDesc, setEditTypeDesc] = useState("")
  const [newTypeName, setNewTypeName] = useState("")
  const [newTypeDesc, setNewTypeDesc] = useState("")
  const [newTypeEnabled, setNewTypeEnabled] = useState(false)
  const [showSuccessMeasure, setShowSuccessMeasure] = useState(false)
  const [smName, setSmName] = useState("")
  const [smNamePlural, setSmNamePlural] = useState("")
  const [smDesc, setSmDesc] = useState("")
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null)
  const [deleteTypeName, setDeleteTypeName] = useState("")

  const toggleType = async (id: string) => {
    await apiToggleType(id)
  }

  const openEditType = (type: GoalTypeItem) => {
    setEditTypeId(type.id)
    setEditTypeName(type.name)
    setEditTypeDesc(type.description)
  }

  const saveEditType = async () => {
    if (!editTypeName.trim()) return
    await apiUpdateType(editTypeId!, {
      name: editTypeName.trim(),
      description: editTypeDesc.trim(),
    })
    setEditTypeId(null)
    showToast("Goal type updated.")
  }

  const createType = async () => {
    if (!newTypeName.trim()) return
    await apiCreateType({
      name: newTypeName.trim(),
      description: newTypeDesc.trim() || "Custom goal type",
      enabled: newTypeEnabled,
      children:
        showSuccessMeasure && smName.trim()
          ? [
              {
                name: smName.trim(),
                description: smDesc.trim() || smNamePlural.trim(),
              },
            ]
          : [],
    })
    const name = newTypeName.trim()
    setNewTypeName("")
    setNewTypeDesc("")
    setNewTypeEnabled(false)
    setShowSuccessMeasure(false)
    setSmName("")
    setSmNamePlural("")
    setSmDesc("")
    showToast(`Goal type "${name}" created.`)
    router.push("/goals/settings?tab=types")
  }

  // ── Fields tab ─────────────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false)
  const [manageMenuId, setManageMenuId] = useState<string | null>(null)

  // seeded field editable state
  const [seededFields, setSeededFields] = useState(
    SEEDED_FIELDS.map((sf) => ({ ...sf }))
  )
  const [seededEditingId, setSeededEditingId] = useState<string | null>(null)
  const [seededEditName, setSeededEditName] = useState("")
  const [seededEditDesc, setSeededEditDesc] = useState("")
  const [seededDeleteId, setSeededDeleteId] = useState<string | null>(null)
  const [seededDeleteName, setSeededDeleteName] = useState("")

  // inline rename
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [renameError, setRenameError] = useState<string | null>(null)

  // edit options
  const [editOptionsId, setEditOptionsId] = useState<string | null>(null)
  const [editOptionsValue, setEditOptionsValue] = useState<string[]>([])

  // edit description
  const [editDescId, setEditDescId] = useState<string | null>(null)
  const [editDescValue, setEditDescValue] = useState("")

  // delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteConfirmName, setDeleteConfirmName] = useState("")

  // Dismiss manage menu on Escape
  useEffect(() => {
    if (manageMenuId === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setManageMenuId(null)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [manageMenuId])

  const existingNames = [
    ...seededFields.map((sf) => sf.name),
    ...customFields.map((f) => f.name),
  ]

  const handleAddField = async (data: {
    name: string
    type: FieldType
    options: string[]
    multi: boolean
    description: string
  }) => {
    await createField({
      name: data.name,
      type: data.type,
      options: data.options,
      multi: data.multi,
      description: data.description,
    })
    setShowAddForm(false)
    showToast(`Field "${data.name}" created.`)
  }

  const handleRename = async (id: string) => {
    const otherNames = existingNames.filter(
      (_, i) => customFields[i]?.id !== id
    )
    const err = validateFieldName(renameValue, otherNames)
    if (err) {
      setRenameError(err)
      return
    }
    try {
      await updateField(id, { name: renameValue.trim() })
      showToast("Field renamed.")
      setRenamingId(null)
      setRenameValue("")
      setRenameError(null)
    } catch (e: unknown) {
      setRenameError(e instanceof Error ? e.message : "Failed to rename field")
    }
  }

  const handleSaveOptions = async (id: string) => {
    const opts = editOptionsValue.filter((o) => o.trim())
    await updateField(id, { options: opts })
    showToast("Options updated.")
    setEditOptionsId(null)
  }

  const handleSaveDescription = async (id: string) => {
    await updateField(id, { description: editDescValue.trim() })
    showToast("Description updated.")
    setEditDescId(null)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteField(id)
      showToast("Field deleted.")
    } catch {
      showToast("Failed to delete field.")
    }
    setDeleteConfirmId(null)
  }

  // ── Scoring tab ────────────────────────────────────────────────────────────
  const scoringDirty = scoringMethod !== savedScoring
  const saveScoring = () => {
    setSavedScoring(scoringMethod)
    showToast("Scoring method saved.")
  }
  const cancelScoring = () => setScoringMethod(savedScoring)

  const formParam = searchParams.get("form")

  // ── Create goal type full-page form ────────────────────────────────────────
  if (formParam === "createGoalType") {
    return (
      <div className="max-w-2xl p-8">
        {/* Breadcrumb */}
        <p className="mb-3 text-[13px] text-[#626f86]">
          <button
            onClick={() => router.push("/goals/settings?tab=types")}
            className="hover:text-[#172b4d] hover:underline"
          >
            Goal settings
          </button>
          {" / "}
          <span>Create goal type</span>
        </p>

        {/* Back + heading */}
        <div className="mb-8 flex items-center gap-3">
          <button
            data-testid="create-type-back-btn"
            onClick={() => router.push("/goals/settings?tab=types")}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[#f4f5f7]"
          >
            <svg
              className="size-5 text-[#172b4d]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-[#172b4d] dark:text-foreground">
            Create goal type
          </h1>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#172b4d] dark:text-foreground">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              data-testid="create-type-name-input"
              type="text"
              value={newTypeName}
              maxLength={25}
              onChange={(e) => setNewTypeName(e.target.value)}
              className="w-full rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-2 text-[13px] transition-shadow outline-none focus:border-[#4c9aff] focus:ring-2 focus:ring-[#4c9aff]/30"
            />
            <p className="mt-1 text-[12px] text-[#626f86]">
              Max length of 25 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#172b4d] dark:text-foreground">
              Description
            </label>
            <input
              data-testid="create-type-desc-input"
              type="text"
              value={newTypeDesc}
              maxLength={75}
              onChange={(e) => setNewTypeDesc(e.target.value)}
              className="w-full rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-2 text-[13px] transition-shadow outline-none focus:border-[#4c9aff] focus:ring-2 focus:ring-[#4c9aff]/30"
            />
            <p className="mt-1 text-[12px] text-[#626f86]">
              Max length of 75 characters
            </p>
          </div>

          {/* Success measure — collapsed card or expanded form */}
          {!showSuccessMeasure ? (
            <button
              type="button"
              data-testid="add-success-measure-btn"
              onClick={() => setShowSuccessMeasure(true)}
              className="w-full rounded-[3px] border border-[#dfe1e6] bg-[#f4f5f7] p-5 text-left transition-colors hover:bg-[#ebecf0]"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-7 shrink-0 items-center justify-center rounded border border-[#dfe1e6] bg-white text-[#626f86]">
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#172b4d] dark:text-foreground">
                    Add a success measure
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#626f86]">
                    Bundle this goal type with a success measure to track the
                    outcomes needed to accomplish it.
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div>
              <hr className="mb-6 border-[#dfe1e6]" />
              {/* Success measure heading */}
              <div className="mb-4 flex items-center gap-2">
                <svg
                  className="size-4 text-[#626f86]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                </svg>
                <p className="text-[13px] font-semibold text-[#172b4d] dark:text-foreground">
                  Success measure
                </p>
              </div>
              <p className="mb-5 text-[13px] text-[#626f86]">
                Bundle this goal type with a success measure to track the
                outcomes needed to accomplish it.
              </p>
              <div className="space-y-5">
                {/* SM Name */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-[#172b4d] dark:text-foreground">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    data-testid="sm-name-input"
                    type="text"
                    value={smName}
                    maxLength={25}
                    onChange={(e) => setSmName(e.target.value)}
                    className="w-full rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-2 text-[13px] transition-shadow outline-none focus:border-[#4c9aff] focus:ring-2 focus:ring-[#4c9aff]/30"
                  />
                  <p className="mt-1 text-[12px] text-[#626f86]">
                    Max length of 25 characters
                  </p>
                </div>
                {/* SM Name plural */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-[#172b4d] dark:text-foreground">
                    Name (plural form) <span className="text-red-500">*</span>
                  </label>
                  <input
                    data-testid="sm-name-plural-input"
                    type="text"
                    value={smNamePlural}
                    maxLength={25}
                    onChange={(e) => setSmNamePlural(e.target.value)}
                    className="w-full rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-2 text-[13px] transition-shadow outline-none focus:border-[#4c9aff] focus:ring-2 focus:ring-[#4c9aff]/30"
                  />
                  <p className="mt-1 text-[12px] text-[#626f86]">
                    Used to show your custom success measure in appropriate
                    contexts. Max length of 25 characters.
                  </p>
                </div>
                {/* SM Description */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-[#172b4d] dark:text-foreground">
                    Description
                  </label>
                  <input
                    data-testid="sm-desc-input"
                    type="text"
                    value={smDesc}
                    maxLength={75}
                    onChange={(e) => setSmDesc(e.target.value)}
                    className="w-full rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-2 text-[13px] transition-shadow outline-none focus:border-[#4c9aff] focus:ring-2 focus:ring-[#4c9aff]/30"
                  />
                  <p className="mt-1 text-[12px] text-[#626f86]">
                    Max length of 75 characters
                  </p>
                </div>
                {/* Remove */}
                <button
                  type="button"
                  data-testid="remove-success-measure-btn"
                  onClick={() => {
                    setShowSuccessMeasure(false)
                    setSmName("")
                    setSmNamePlural("")
                    setSmDesc("")
                  }}
                  className="rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground"
                >
                  Remove success measure
                </button>
              </div>
            </div>
          )}

          {/* Enable toggle */}
          <div>
            <p className="mb-3 text-[13px] font-semibold text-[#172b4d] dark:text-foreground">
              Enable this goal type
            </p>
            <div className="flex items-center gap-3">
              <button
                data-testid="create-type-enable-toggle"
                onClick={() => setNewTypeEnabled((v) => !v)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  newTypeEnabled ? "bg-green-500" : "bg-[#626f86]/30"
                }`}
              >
                <span
                  className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                    newTypeEnabled ? "translate-x-[18px]" : "translate-x-1"
                  }`}
                />
                {newTypeEnabled && (
                  <svg
                    className="absolute left-1.5 size-2.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {!newTypeEnabled && (
                  <svg
                    className="absolute right-1 size-2.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </button>
              <span className="text-[13px] text-[#626f86]">
                Allow users to create goals of this type
              </span>
            </div>
          </div>

          {/* Create / Cancel */}
          <div className="flex items-center gap-3 pt-2">
            <button
              data-testid="create-type-submit-btn"
              onClick={createType}
              disabled={!newTypeName.trim()}
              className="rounded-[3px] bg-[#0052cc] px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0747a6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create
            </button>
            <button
              data-testid="create-type-cancel-btn"
              onClick={() => {
                setNewTypeName("")
                setNewTypeDesc("")
                setNewTypeEnabled(false)
                setShowSuccessMeasure(false)
                setSmName("")
                setSmNamePlural("")
                setSmDesc("")
                router.push("/goals/settings?tab=types")
              }}
              className="rounded-[3px] px-5 py-2 text-[13px] font-medium text-[#626f86] transition-colors hover:text-[#172b4d]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl p-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border bg-white px-5 py-3 text-sm font-medium shadow-lg dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <svg
              className="size-4 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {toastMessage}
          </div>
        </div>
      )}

      <h1 className="mb-6 text-xl font-semibold text-[#172b4d] dark:text-foreground">
        Goal settings
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-4 border-b border-[#dfe1e6]">
        {(["types", "fields", "scoring"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-2.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-[#0052cc] text-[#0052cc]"
                : "text-[#626f86] hover:text-[#172b4d]"
            }`}
          >
            {tab === "types"
              ? "Types"
              : tab === "fields"
                ? "Fields"
                : "Scoring"}
          </button>
        ))}
      </div>

      {/* ── Types tab ──────────────────────────────────────────────────────── */}
      {activeTab === "types" && (
        <div>
          <h2 className="mb-2 text-base font-semibold text-[#172b4d] dark:text-foreground">
            Goal types
          </h2>
          <p className="mb-6 text-sm text-[#626f86]">
            Customize the name and description for your goals and success
            measures, or create new types to better model your company&apos;s
            goal framework.{" "}
            <button type="button" className="text-[#0052cc] hover:underline">
              Understand goal types
            </button>
          </p>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#172b4d] dark:text-foreground">
                Available goal types
              </h3>
              <span
                data-testid="goal-types-count"
                className="rounded bg-[#f4f5f7] px-1.5 py-0.5 text-xs font-medium text-[#626f86]"
              >
                {types.length}
              </span>
            </div>
            <Button
              data-testid="create-type-btn"
              className="bg-[#0052cc] text-white hover:bg-[#0747a6]"
              onClick={() =>
                router.push("/goals/settings?tab=types&form=createGoalType")
              }
            >
              Create type
            </Button>
          </div>

          <div className="space-y-3">
            {types.map((type) => (
              <div
                key={type.id}
                data-testid={`goal-type-card-${type.id}`}
                className="rounded-lg border border-[#dfe1e6] p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GoalTypeIcon id={type.id} />
                    <div>
                      <p className="text-sm font-semibold text-[#172b4d] dark:text-foreground">
                        {type.name}
                      </p>
                      <p className="text-xs text-[#626f86]">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        type.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-[#f4f5f7] text-[#626f86]"
                      }`}
                    >
                      {type.enabled ? "ENABLED" : "DISABLED"}
                    </span>
                    <button
                      data-testid={`toggle-type-btn-${type.id}`}
                      onClick={() => toggleType(type.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        type.enabled ? "bg-green-500" : "bg-[#626f86]/30"
                      }`}
                    >
                      <span
                        className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                          type.enabled ? "translate-x-[18px]" : "translate-x-1"
                        }`}
                      />
                      {type.enabled && (
                        <svg
                          className="absolute left-1.5 size-2.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {!type.enabled && (
                        <svg
                          className="absolute right-1 size-2.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </button>
                    <Button
                      data-testid={`edit-type-btn-${type.id}`}
                      variant="outline"
                      size="sm"
                      onClick={() => openEditType(type)}
                    >
                      Edit
                    </Button>
                    {!type.seeded && (
                      <Button
                        data-testid={`delete-type-btn-${type.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteTypeId(type.id)
                          setDeleteTypeName(type.name)
                        }}
                        className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
                {type.children.length > 0 && (
                  <div className="mt-4 ml-8 border-l-2 border-[#dfe1e6] pl-4">
                    {type.children.map((child) => (
                      <div
                        key={child.name}
                        className="flex items-center gap-3 py-2"
                      >
                        <GoalChildIcon name={child.name} />
                        <div>
                          <p className="text-sm font-medium text-[#172b4d] dark:text-foreground">
                            {child.name}
                          </p>
                          <p className="text-xs text-[#626f86]">
                            {child.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fields tab ─────────────────────────────────────────────────────── */}
      {activeTab === "fields" && (
        <div>
          {/* Three illustrated steps */}
          <div className="mb-8 overflow-hidden rounded-[3px] border border-[#dfe1e6]">
            <div className="grid grid-cols-3 divide-x divide-[#dfe1e6]">
              {/* Step 1 */}
              <div className="flex flex-col">
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#e9f2ff] to-[#cce0ff]">
                  {/* Mock UI: goal form with custom field */}
                  <div className="absolute inset-2 flex flex-col gap-1.5 rounded bg-white p-2 shadow-sm">
                    <div className="mb-1 flex items-center gap-1.5">
                      <div className="size-3 rounded-full bg-[#0052cc]/20" />
                      <div className="h-2 w-16 rounded bg-[#172b4d]/10" />
                    </div>
                    <div className="h-1.5 w-full rounded bg-[#dfe1e6]" />
                    <div className="h-1.5 w-4/5 rounded bg-[#dfe1e6]" />
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="flex h-5 w-16 items-center justify-center rounded-[2px] border border-[#b3d4ff] bg-[#e9f2ff]">
                        <div className="h-1.5 w-8 rounded bg-[#0052cc]/40" />
                      </div>
                      <div className="h-5 flex-1 rounded-[2px] border border-[#dfe1e6] bg-[#f4f5f7]" />
                    </div>
                    <div className="mt-auto flex items-center gap-1">
                      <div className="h-4 w-12 rounded-[2px] bg-[#0052cc]" />
                      <div className="h-4 w-10 rounded-[2px] border border-[#dfe1e6] bg-[#f4f5f7]" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[13px] leading-snug text-[#626f86]">
                    <span className="font-semibold text-[#172b4d] dark:text-foreground">
                      1.
                    </span>{" "}
                    Create fields to add additional information to goals
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col">
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#f3f0ff] to-[#dfd8fd]">
                  {/* Mock UI: goal directory with filter chips */}
                  <div className="absolute inset-2 flex flex-col gap-1.5 rounded bg-white p-2 shadow-sm">
                    <div className="mb-0.5 flex items-center gap-1">
                      <div className="flex h-4 w-full items-center gap-1 rounded-[2px] border border-[#dfe1e6] bg-[#f4f5f7] px-1.5">
                        <svg
                          className="size-2.5 text-[#626f86]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <div className="h-1 w-12 rounded bg-[#626f86]/20" />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="flex h-4 items-center rounded-full border border-[#b3d4ff] bg-[#e9f2ff] px-1.5">
                        <div className="h-1 w-8 rounded bg-[#0052cc]/50" />
                      </div>
                      <div className="flex h-4 items-center rounded-full border border-[#dfe1e6] bg-[#f4f5f7] px-1.5">
                        <div className="h-1 w-6 rounded bg-[#626f86]/30" />
                      </div>
                    </div>
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full bg-[#36b37e]/40" />
                        <div
                          className="h-1.5 flex-1 rounded bg-[#dfe1e6]"
                          style={{ width: `${60 + n * 10}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[13px] leading-snug text-[#626f86]">
                    <span className="font-semibold text-[#172b4d] dark:text-foreground">
                      2.
                    </span>{" "}
                    Search and filter goals in the directory with custom fields
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col">
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#e3fcef] to-[#abf5d1]">
                  {/* Mock UI: embedded goal list card */}
                  <div className="absolute inset-2 flex flex-col gap-1.5 rounded bg-white p-2 shadow-sm">
                    <div className="mb-0.5 flex items-center gap-1">
                      <div className="size-2.5 rounded bg-[#36b37e]/50" />
                      <div className="h-1.5 w-14 rounded bg-[#172b4d]/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="flex flex-col gap-0.5 rounded-[2px] border border-[#dfe1e6] p-1"
                        >
                          <div className="h-1.5 w-full rounded bg-[#dfe1e6]" />
                          <div className="h-1 w-3/4 rounded bg-[#dfe1e6]/60" />
                          <div className="mt-0.5 h-2.5 w-8 rounded-full bg-[#e3fcef]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[13px] leading-snug text-[#626f86]">
                    <span className="font-semibold text-[#172b4d] dark:text-foreground">
                      3.
                    </span>{" "}
                    Embed a list of goals curated by custom fields in a page,
                    ticket, or card
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#172b4d] dark:text-foreground">
                Sidebar
              </h2>
              <p className="text-[13px] text-[#626f86]">
                Customise your goal&apos;s sidebar fields
              </p>
            </div>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-[3px] bg-[#0052cc] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0747a6]"
            >
              <svg
                className="size-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add field
            </button>
          </div>

          {/* Field list */}
          <div className="overflow-hidden rounded-lg border border-[#dfe1e6]">
            {/* Seeded rows */}
            {seededFields.map((sf, i) => {
              const hasBorder =
                i < seededFields.length - 1 || customFields.length > 0
              return seededEditingId === sf.id ? (
                <div
                  key={sf.id}
                  data-seeded-field-name={sf.name}
                  data-testid={`seeded-field-row-${sf.id}`}
                  className={`bg-[#f4f5f7] px-4 py-4 dark:bg-muted/20 ${hasBorder ? "border-b border-[#dfe1e6]" : ""}`}
                >
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[12px] font-medium text-[#172b4d] dark:text-foreground">
                        Name
                      </label>
                      <input
                        data-testid="seeded-edit-form-name"
                        type="text"
                        value={seededEditName}
                        onChange={(e) => setSeededEditName(e.target.value)}
                        className="w-full rounded-[3px] border border-[#0052cc] bg-background px-3 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#0052cc]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-medium text-[#172b4d] dark:text-foreground">
                        Field type
                      </label>
                      <select
                        data-testid="seeded-edit-form-type"
                        disabled
                        value={sf.type}
                        className="w-full cursor-not-allowed rounded-[3px] border border-[#dfe1e6] bg-[#f4f5f7] px-3 py-1.5 text-[13px] text-[#626f86]"
                      >
                        <option value={sf.type}>{sf.type}</option>
                      </select>
                      <p className="mt-1 text-[11px] text-[#626f86]">
                        You can&apos;t change the type after creating a field.
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-medium text-[#172b4d] dark:text-foreground">
                        Description
                      </label>
                      <textarea
                        data-testid="seeded-edit-form-desc"
                        value={seededEditDesc}
                        onChange={(e) => setSeededEditDesc(e.target.value)}
                        rows={2}
                        className="w-full resize-none rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-1.5 text-[13px] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        data-testid="seeded-edit-form-cancel"
                        onClick={() => setSeededEditingId(null)}
                        className="rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium text-[#172b4d] transition-colors hover:bg-white dark:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        data-testid="seeded-edit-form-save"
                        onClick={() => {
                          const trimmed = seededEditName.trim()
                          setSeededFields((prev) =>
                            prev.map((s) =>
                              s.id === sf.id
                                ? {
                                    ...s,
                                    name: trimmed || s.name,
                                    description: seededEditDesc,
                                  }
                                : s
                            )
                          )
                          setSeededEditingId(null)
                          showToast("Field updated.")
                        }}
                        className="rounded-[3px] bg-[#0052cc] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0747a6]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={sf.id}
                  data-seeded-field-name={sf.name}
                  data-testid={`seeded-field-row-${sf.id}`}
                  className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f4f5f7] dark:hover:bg-muted/30 ${hasBorder ? "border-b border-[#dfe1e6]" : ""}`}
                >
                  <div className="shrink-0">{sf.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#172b4d] dark:text-foreground">
                      {sf.name}
                    </p>
                    {sf.description && (
                      <p className="text-[11px] text-[#626f86]">
                        {sf.description}
                      </p>
                    )}
                  </div>
                  <div className="invisible ml-auto flex shrink-0 items-center gap-1 group-hover:visible">
                    <button
                      data-testid={`seeded-edit-btn-${sf.id}`}
                      onClick={() => {
                        setSeededEditingId(sf.id)
                        setSeededEditName(sf.name)
                        setSeededEditDesc(sf.description)
                      }}
                      title="Edit field"
                      className="rounded p-1 text-[#626f86] transition-colors hover:bg-[#e9f2ff] hover:text-[#0052cc]"
                    >
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="m18.5 2.5 2.5 2.5L11 15H8v-3z" />
                      </svg>
                    </button>
                    <button
                      data-testid={`seeded-delete-btn-${sf.id}`}
                      onClick={() => {
                        setSeededDeleteId(sf.id)
                        setSeededDeleteName(sf.name)
                      }}
                      title="Delete field"
                      className="rounded p-1 text-[#626f86] transition-colors hover:bg-[#ffebe6] hover:text-red-500"
                    >
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Custom fields */}
            {customFields.map((cf, i) => (
              <div
                key={cf.id}
                data-testid={`custom-field-row-${cf.id}`}
                data-field-name={cf.name}
                className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#f4f5f7] dark:hover:bg-muted/30 ${
                  i < customFields.length - 1 ? "border-b border-[#dfe1e6]" : ""
                }`}
              >
                <div className="mt-0.5">
                  <FieldTypeIcon type={cf.type} />
                </div>
                <div className="min-w-0 flex-1">
                  {/* Inline rename */}
                  {renamingId === cf.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={renameValue}
                        onChange={(e) => {
                          setRenameValue(e.target.value)
                          setRenameError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(cf.id)
                          if (e.key === "Escape") {
                            setRenamingId(null)
                            setRenameError(null)
                          }
                        }}
                        className={`rounded-[3px] border bg-background px-2 py-1 text-[13px] outline-none focus:ring-1 ${
                          renameError
                            ? "border-red-400 focus:ring-red-200"
                            : "border-[#0052cc] focus:ring-[#0052cc]"
                        }`}
                      />
                      <button
                        onClick={() => handleRename(cf.id)}
                        className="rounded-[3px] bg-[#0052cc] px-2.5 py-1 text-[12px] font-medium text-white hover:bg-[#0747a6]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setRenamingId(null)
                          setRenameError(null)
                        }}
                        className="rounded-[3px] border border-[#dfe1e6] px-2.5 py-1 text-[12px] font-medium text-[#626f86] hover:bg-[#f4f5f7]"
                      >
                        Cancel
                      </button>
                      {renameError && (
                        <p className="text-[11px] text-red-500">
                          {renameError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[13px] font-medium text-[#172b4d] dark:text-foreground">
                      {cf.name}
                    </p>
                  )}

                  {/* Description display / edit */}
                  {editDescId === cf.id ? (
                    <div className="mt-2 flex items-start gap-2">
                      <textarea
                        autoFocus
                        value={editDescValue}
                        onChange={(e) => setEditDescValue(e.target.value)}
                        rows={2}
                        className="flex-1 resize-none rounded-[3px] border border-[#0052cc] bg-background px-2 py-1 text-[12px] outline-none focus:ring-1 focus:ring-[#0052cc]"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSaveDescription(cf.id)}
                          className="rounded-[3px] bg-[#0052cc] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#0747a6]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditDescId(null)}
                          className="rounded-[3px] border border-[#dfe1e6] px-2.5 py-1 text-[11px] font-medium text-[#626f86] hover:bg-[#f4f5f7]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : cf.description ? (
                    renamingId !== cf.id && (
                      <p className="mt-0.5 text-[11px] text-[#626f86]">
                        {cf.description}
                      </p>
                    )
                  ) : null}

                  {/* Edit options inline (Select only) */}
                  {editOptionsId === cf.id && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[11px] font-medium text-[#626f86]">
                        Options
                      </p>
                      {editOptionsValue.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              setEditOptionsValue((prev) =>
                                prev.map((o, idx) =>
                                  idx === oi ? e.target.value : o
                                )
                              )
                            }
                            className="flex-1 rounded-[3px] border border-[#dfe1e6] bg-background px-2 py-1 text-[12px] outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
                          />
                          <button
                            onClick={() =>
                              setEditOptionsValue((prev) =>
                                prev.length > 1
                                  ? prev.filter((_, idx) => idx !== oi)
                                  : prev
                              )
                            }
                            className="rounded p-0.5 text-[#626f86] hover:text-red-500"
                          >
                            <svg
                              className="size-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          setEditOptionsValue((prev) => [...prev, ""])
                        }
                        className="flex items-center gap-1 text-[11px] text-[#0052cc] hover:underline"
                      >
                        <svg
                          className="size-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add option
                      </button>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSaveOptions(cf.id)}
                          className="rounded-[3px] bg-[#0052cc] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#0747a6]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditOptionsId(null)}
                          className="rounded-[3px] border border-[#dfe1e6] px-2.5 py-1 text-[11px] font-medium text-[#626f86] hover:bg-[#f4f5f7]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2">
                  {/* Manage menu */}
                  <div className="relative">
                    <button
                      data-testid={`field-menu-btn-${cf.id}`}
                      onClick={() =>
                        setManageMenuId(manageMenuId === cf.id ? null : cf.id)
                      }
                      className="rounded p-1 text-[#626f86] transition-colors hover:bg-[#f4f5f7] hover:text-[#172b4d]"
                    >
                      <svg
                        className="size-4"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                      </svg>
                    </button>
                    {manageMenuId === cf.id && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setManageMenuId(null)}
                        />
                        <div className="absolute top-full right-0 z-40 mt-1 w-44 rounded-md border border-[#dfe1e6] bg-white py-1 shadow-[0_4px_16px_rgba(9,30,66,0.15)] dark:bg-popover">
                          <button
                            onClick={() => {
                              setRenamingId(cf.id)
                              setRenameValue(cf.name)
                              setRenameError(null)
                              setManageMenuId(null)
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground"
                          >
                            <svg
                              className="size-3.5 text-[#626f86]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Rename
                          </button>
                          {cf.type === "Select" && (
                            <button
                              onClick={() => {
                                setEditOptionsId(cf.id)
                                setEditOptionsValue(
                                  cf.options && cf.options.length > 0
                                    ? [...cf.options]
                                    : [""]
                                )
                                setManageMenuId(null)
                              }}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground"
                            >
                              <svg
                                className="size-3.5 text-[#626f86]"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" />
                                <line x1="3" y1="18" x2="3.01" y2="18" />
                              </svg>
                              Edit options
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditDescId(cf.id)
                              setEditDescValue(cf.description ?? "")
                              setManageMenuId(null)
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground"
                          >
                            <svg
                              className="size-3.5 text-[#626f86]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Edit description
                          </button>
                          <div className="my-1 border-t border-[#dfe1e6]" />
                          <button
                            onClick={() => {
                              setDeleteConfirmId(cf.id)
                              setDeleteConfirmName(cf.name)
                              setManageMenuId(null)
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 transition-colors hover:bg-red-50"
                          >
                            <svg
                              className="size-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Inline Add Field form */}
          {showAddForm && (
            <div className="mt-4">
              <AddFieldForm
                existingNames={existingNames}
                onSave={handleAddField}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Scoring tab ────────────────────────────────────────────────────── */}
      {activeTab === "scoring" && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-[#172b4d] dark:text-foreground">
            Goal scoring method
          </h2>

          <div className="space-y-3">
            <div
              onClick={() => setScoringMethod("simple")}
              className="cursor-pointer rounded-[3px] border border-[#dfe1e6] p-5 transition-colors hover:bg-[#f4f5f7]"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    scoringMethod === "simple"
                      ? "border-[#0052cc]"
                      : "border-[#626f86]/40"
                  }`}
                >
                  {scoringMethod === "simple" && (
                    <div className="size-2.5 rounded-full bg-[#0052cc]" />
                  )}
                </div>
                <span className="text-sm font-semibold text-[#172b4d] dark:text-foreground">
                  Simple status
                </span>
              </div>
              <div className="mb-3 ml-8 flex items-center gap-2">
                <span className="rounded-[3px] bg-[#57d9a3] px-2 py-0.5 text-[11px] font-bold text-[#006644]">
                  ON TRACK
                </span>
                <span className="rounded-[3px] bg-[#ffc400] px-2 py-0.5 text-[11px] font-bold text-[#172b4d]">
                  AT RISK
                </span>
                <span className="rounded-[3px] bg-[#ff5630] px-2 py-0.5 text-[11px] font-bold text-white">
                  OFF TRACK
                </span>
              </div>
              <p className="ml-8 text-sm text-[#626f86]">
                Communicate how goals are tracking towards completion with a
                simple status.
              </p>
            </div>

            <div
              onClick={() => setScoringMethod("score")}
              className="cursor-pointer rounded-[3px] border border-[#dfe1e6] p-5 transition-colors hover:bg-[#f4f5f7]"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    scoringMethod === "score"
                      ? "border-[#0052cc]"
                      : "border-[#626f86]/40"
                  }`}
                >
                  {scoringMethod === "score" && (
                    <div className="size-2.5 rounded-full bg-[#0052cc]" />
                  )}
                </div>
                <span className="text-sm font-semibold text-[#172b4d] dark:text-foreground">
                  Status and score
                </span>
              </div>
              <div className="mb-3 ml-8 flex items-center gap-2">
                <span className="rounded-[3px] bg-[#57d9a3] px-2 py-0.5 text-[11px] font-bold text-[#006644]">
                  ON TRACK{" "}
                  <span className="ml-1 font-mono font-semibold">0.7</span>
                </span>
                <span className="rounded-[3px] bg-[#ffc400] px-2 py-0.5 text-[11px] font-bold text-[#172b4d]">
                  AT RISK{" "}
                  <span className="ml-1 font-mono font-semibold">0.5</span>
                </span>
                <span className="rounded-[3px] bg-[#ff5630] px-2 py-0.5 text-[11px] font-bold text-white">
                  OFF TRACK{" "}
                  <span className="ml-1 font-mono font-semibold">0.2</span>
                </span>
              </div>
              <p className="ml-8 text-sm text-[#626f86]">
                Apply a 0.0 – 1.0 score for the current status of each goal.
                <br />
                This method is best if you use Objectives and Key Results
                (OKRs).
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button
              disabled={!scoringDirty}
              onClick={saveScoring}
              className="rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium text-[#172b4d] transition-colors hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
            <button
              disabled={!scoringDirty}
              onClick={cancelScoring}
              className="rounded-[3px] px-4 py-1.5 text-[13px] font-medium text-[#626f86] transition-colors hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Edit type dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={editTypeId !== null}
        onOpenChange={(open) => {
          if (!open) setEditTypeId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit goal type</DialogTitle>
            <DialogDescription>
              Update the name and description for this goal type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-type-name">Name</Label>
              <Input
                id="edit-type-name"
                value={editTypeName}
                onChange={(e) => setEditTypeName(e.target.value)}
                placeholder="Goal type name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type-desc">Description</Label>
              <Input
                id="edit-type-desc"
                value={editTypeDesc}
                onChange={(e) => setEditTypeDesc(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTypeId(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0052cc] text-white hover:bg-[#0747a6]"
              onClick={saveEditType}
              disabled={!editTypeName.trim()}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete seeded field confirm dialog ──────────────────────────────── */}
      {seededDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setSeededDeleteId(null)}
        >
          <div className="fixed inset-0 bg-black/40" />
          <div
            className="relative z-10 w-full max-w-[380px] rounded-lg border border-[#dfe1e6] bg-white p-6 shadow-2xl dark:bg-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-[15px] font-semibold text-[#172b4d] dark:text-foreground">
              Delete field
            </h3>
            <p className="mb-1 text-[13px] text-[#626f86]">
              Deleting this field will remove it from all goals.
            </p>
            <p className="mb-5 text-[13px] text-[#626f86]">
              Are you sure you want to delete{" "}
              <strong className="text-[#172b4d] dark:text-foreground">
                {seededDeleteName}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                data-testid="seeded-delete-cancel"
                onClick={() => setSeededDeleteId(null)}
                className="rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground"
              >
                Cancel
              </button>
              <button
                data-testid="seeded-delete-confirm"
                onClick={() => {
                  setSeededFields((prev) =>
                    prev.filter((sf) => sf.id !== seededDeleteId)
                  )
                  setSeededDeleteId(null)
                  showToast("Field deleted.")
                }}
                className="rounded-[3px] bg-red-500 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete goal type confirm dialog ──────────────────────────────── */}
      {deleteTypeId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setDeleteTypeId(null)}
        >
          <div className="fixed inset-0 bg-black/40" />
          <div
            className="relative z-10 w-full max-w-[380px] rounded-lg border border-[#dfe1e6] bg-white p-6 shadow-2xl dark:bg-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-[15px] font-semibold text-[#172b4d] dark:text-foreground">
              Delete goal type
            </h3>
            <p className="mb-5 text-[13px] text-[#626f86]">
              Are you sure you want to delete{" "}
              <strong className="text-[#172b4d] dark:text-foreground">
                {deleteTypeName}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                data-testid="delete-type-cancel-btn"
                onClick={() => setDeleteTypeId(null)}
                className="rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground"
              >
                Cancel
              </button>
              <button
                data-testid="delete-type-confirm-btn"
                onClick={async () => {
                  await apiDeleteType(deleteTypeId)
                  setDeleteTypeId(null)
                  showToast(`Goal type "${deleteTypeName}" deleted.`)
                }}
                className="rounded-[3px] bg-red-500 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete field confirm dialog ───────────────────────────────────── */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div className="fixed inset-0 bg-black/40" />
          <div
            className="relative z-10 w-full max-w-[380px] rounded-lg border border-[#dfe1e6] bg-white p-6 shadow-2xl dark:bg-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-[15px] font-semibold text-[#172b4d] dark:text-foreground">
              Delete field
            </h3>
            <p className="mb-5 text-[13px] text-[#626f86]">
              Are you sure you want to delete{" "}
              <strong className="text-[#172b4d] dark:text-foreground">
                {deleteConfirmName}
              </strong>
              ? All stored values for this field will be permanently removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-[3px] border border-[#dfe1e6] px-4 py-1.5 text-[13px] font-medium text-[#172b4d] transition-colors hover:bg-[#f4f5f7] dark:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-[3px] bg-red-500 px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GoalSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      }
    >
      <GoalSettingsContent />
    </Suspense>
  )
}
