"use client"

import { useState, type ReactNode } from "react"
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

interface GoalTypeChild {
  name: string
  description: string
  icon: ReactNode
}

interface GoalType {
  id: string
  name: string
  description: string
  enabled: boolean
  icon: ReactNode
  children: GoalTypeChild[]
}

interface SidebarField {
  id: string
  name: string
  description: string
  icon: ReactNode
}

const defaultGoalTypes: GoalType[] = [
  {
    id: "goal",
    name: "Goal",
    description: "All-purpose goals",
    enabled: false,
    icon: <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>,
    children: [],
  },
  {
    id: "objective",
    name: "Objective",
    description: "The outcome you want to achieve (OKR framework).",
    enabled: true,
    icon: <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    children: [
      {
        name: "Key result",
        description: "The quantitative way to measure an objective (OKR framework).",
        icon: <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
      },
    ],
  },
]

const defaultSidebarFields: SidebarField[] = [
  { id: "department", name: "Department", description: "Department leading this project", icon: <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg> },
  { id: "project-key", name: "Project key", description: "Project keys assigned to you by your program manager", icon: <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg> },
  { id: "sponsor", name: "Sponsor", description: "Person carrying this project over the finish line", icon: <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg> },
]

const genericIcon = (
  <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

const genericFieldIcon = (
  <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
  </svg>
)

export default function GoalSettingsPage() {
  const [activeTab, setActiveTab] = useState<"types" | "fields" | "scoring">("types")
  const [types, setTypes] = useState<GoalType[]>(defaultGoalTypes)
  const [fields, setFields] = useState<SidebarField[]>(defaultSidebarFields)
  const [scoringMethod, setScoringMethod] = useState<"simple" | "score">("simple")
  const [savedScoring, setSavedScoring] = useState<"simple" | "score">("simple")

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Edit type dialog state
  const [editTypeId, setEditTypeId] = useState<string | null>(null)
  const [editTypeName, setEditTypeName] = useState("")
  const [editTypeDesc, setEditTypeDesc] = useState("")

  // Create type dialog state
  const [createTypeOpen, setCreateTypeOpen] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const [newTypeDesc, setNewTypeDesc] = useState("")

  // Add field dialog state
  const [addFieldOpen, setAddFieldOpen] = useState(false)
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldDesc, setNewFieldDesc] = useState("")

  const toggleType = (id: string) => {
    setTypes((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t))
  }

  const openEditType = (type: GoalType) => {
    setEditTypeId(type.id)
    setEditTypeName(type.name)
    setEditTypeDesc(type.description)
  }

  const saveEditType = () => {
    if (!editTypeName.trim()) return
    setTypes((prev) =>
      prev.map((t) =>
        t.id === editTypeId ? { ...t, name: editTypeName.trim(), description: editTypeDesc.trim() } : t
      )
    )
    setEditTypeId(null)
    showToast("Goal type updated successfully.")
  }

  const createType = () => {
    if (!newTypeName.trim()) return
    const id = newTypeName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
    setTypes((prev) => [
      ...prev,
      {
        id,
        name: newTypeName.trim(),
        description: newTypeDesc.trim() || "Custom goal type",
        enabled: true,
        icon: genericIcon,
        children: [],
      },
    ])
    setNewTypeName("")
    setNewTypeDesc("")
    setCreateTypeOpen(false)
    showToast(`Goal type "${newTypeName.trim()}" created.`)
  }

  const addField = () => {
    if (!newFieldName.trim()) return
    const id = newFieldName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
    setFields((prev) => [
      ...prev,
      {
        id,
        name: newFieldName.trim(),
        description: newFieldDesc.trim() || "Custom sidebar field",
        icon: genericFieldIcon,
      },
    ])
    setNewFieldName("")
    setNewFieldDesc("")
    setAddFieldOpen(false)
    showToast(`Field "${newFieldName.trim()}" added.`)
  }

  const saveScoring = () => {
    setSavedScoring(scoringMethod)
    showToast("Scoring method saved.")
  }

  const cancelScoring = () => {
    setScoringMethod(savedScoring)
  }

  const scoringDirty = scoringMethod !== savedScoring

  return (
    <div className="p-6 max-w-4xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border bg-white px-5 py-3 text-sm font-medium shadow-lg dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <svg className="size-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {toastMessage}
          </div>
        </div>
      )}

      <h1 className="mb-6 text-xl font-semibold">Goal settings</h1>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-4 border-b">
        {(["types", "fields", "scoring"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab === "types" ? "Types" : tab === "fields" ? "Fields" : "Scoring"}
          </button>
        ))}
      </div>

      {/* Types tab */}
      {activeTab === "types" && (
        <div>
          <h2 className="mb-2 text-base font-semibold">Goal types</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Customize the name and description for your goals and success measures, or create new types to better model your company&apos;s goal framework.{" "}
            <button type="button" className="text-blue-600 hover:underline">Understand goal types</button>
          </p>

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Available goal types</h3>
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{types.length}</span>
            </div>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setCreateTypeOpen(true)}
            >
              Create type
            </Button>
          </div>

          <div className="space-y-3">
            {types.map((type) => (
              <div key={type.id} className="rounded-lg border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {type.icon}
                    <div>
                      <p className="text-sm font-semibold">{type.name}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${type.enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {type.enabled ? "ENABLED" : "DISABLED"}
                    </span>
                    <button
                      onClick={() => toggleType(type.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${type.enabled ? "bg-green-500" : "bg-muted-foreground/30"}`}
                    >
                      <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${type.enabled ? "translate-x-[18px]" : "translate-x-1"}`} />
                      {type.enabled && <svg className="absolute left-1.5 size-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      {!type.enabled && <svg className="absolute right-1 size-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                    </button>
                    <Button variant="outline" size="sm" onClick={() => openEditType(type)}>
                      Edit
                    </Button>
                  </div>
                </div>
                {type.children.length > 0 && (
                  <div className="mt-4 ml-8 border-l-2 border-muted pl-4">
                    {type.children.map((child) => (
                      <div key={child.name} className="flex items-center gap-3 py-2">
                        {child.icon}
                        <div>
                          <p className="text-sm font-medium">{child.name}</p>
                          <p className="text-xs text-muted-foreground">{child.description}</p>
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

      {/* Fields tab */}
      {activeTab === "fields" && (
        <div>
          {/* Info cards */}
          <div className="mb-8 rounded-lg border p-6">
            <div className="grid grid-cols-3 gap-6">
              {[
                { step: "1", text: "Create fields to add additional information to goals" },
                { step: "2", text: "Search and filter goals in the directory with custom fields" },
                { step: "3", text: "Embed a list of goals curated by custom fields in a page, ticket, or card" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mb-3 flex items-center justify-center">
                    <div className="h-28 w-full rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 flex items-center justify-center">
                      <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
                        <div className="space-y-1.5">
                          <div className="h-2 w-20 rounded bg-muted" />
                          <div className="h-2 w-16 rounded bg-muted" />
                          <div className="h-2 w-12 rounded bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.step}. {item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar fields */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Sidebar</h2>
              <p className="text-sm text-muted-foreground">Customize your goal&apos;s sidebar fields</p>
            </div>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => setAddFieldOpen(true)}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add field
            </Button>
          </div>

          <div className="rounded-lg border">
            {fields.map((field, i) => (
              <div key={field.id} className={`flex items-center gap-4 px-5 py-4 ${i < fields.length - 1 ? "border-b" : ""}`}>
                {field.icon}
                <div>
                  <p className="text-sm font-medium">{field.name}</p>
                </div>
                <p className="ml-auto text-sm text-muted-foreground">{field.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring tab */}
      {activeTab === "scoring" && (
        <div>
          <h2 className="mb-4 text-base font-semibold">Goal scoring method</h2>

          <div className="space-y-4">
            {/* Simple status */}
            <div
              onClick={() => setScoringMethod("simple")}
              className={`cursor-pointer rounded-lg border p-5 transition-colors ${scoringMethod === "simple" ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10" : "hover:bg-accent/50"}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className={`flex size-5 items-center justify-center rounded-full border-2 ${scoringMethod === "simple" ? "border-blue-600" : "border-muted-foreground/40"}`}>
                  {scoringMethod === "simple" && <div className="size-2.5 rounded-full bg-blue-600" />}
                </div>
                <span className="text-sm font-semibold">Simple status</span>
              </div>
              <div className="mb-3 ml-8 flex items-center gap-2">
                <span className="rounded bg-green-400 px-2 py-0.5 text-[10px] font-bold text-white">ON TRACK</span>
                <span className="rounded bg-yellow-300 px-2 py-0.5 text-[10px] font-bold text-yellow-900">AT RISK</span>
                <span className="rounded bg-red-400 px-2 py-0.5 text-[10px] font-bold text-white">OFF TRACK</span>
              </div>
              <p className="ml-8 text-sm text-muted-foreground">Communicate how goals are tracking towards completion with a simple status.</p>
            </div>

            {/* Status and score */}
            <div
              onClick={() => setScoringMethod("score")}
              className={`cursor-pointer rounded-lg border p-5 transition-colors ${scoringMethod === "score" ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10" : "hover:bg-accent/50"}`}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className={`flex size-5 items-center justify-center rounded-full border-2 ${scoringMethod === "score" ? "border-blue-600" : "border-muted-foreground/40"}`}>
                  {scoringMethod === "score" && <div className="size-2.5 rounded-full bg-blue-600" />}
                </div>
                <span className="text-sm font-semibold">Status and score</span>
              </div>
              <div className="mb-3 ml-8 flex items-center gap-2">
                <span className="rounded bg-green-400 px-2 py-0.5 text-[10px] font-bold text-white">ON TRACK <span className="ml-1 font-mono">0.7</span></span>
                <span className="rounded bg-yellow-300 px-2 py-0.5 text-[10px] font-bold text-yellow-900">AT RISK <span className="ml-1 font-mono">0.5</span></span>
                <span className="rounded bg-red-400 px-2 py-0.5 text-[10px] font-bold text-white">OFF TRACK <span className="ml-1 font-mono">0.2</span></span>
              </div>
              <p className="ml-8 text-sm text-muted-foreground">
                Apply a 0.0 - 1.0 score for the current status of each goal.<br />
                This method is best if you use Objectives and Key Results (OKRs).
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="outline"
              disabled={!scoringDirty}
              onClick={saveScoring}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              disabled={!scoringDirty}
              onClick={cancelScoring}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Edit type dialog */}
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
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={saveEditType}
              disabled={!editTypeName.trim()}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create type dialog */}
      <Dialog
        open={createTypeOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateTypeOpen(false)
            setNewTypeName("")
            setNewTypeDesc("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create goal type</DialogTitle>
            <DialogDescription>
              Define a new goal type to model your company&apos;s goal framework.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-type-name">Name</Label>
              <Input
                id="new-type-name"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g. Initiative, Key Result, Milestone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-type-desc">Description</Label>
              <Input
                id="new-type-desc"
                value={newTypeDesc}
                onChange={(e) => setNewTypeDesc(e.target.value)}
                placeholder="Brief description of this goal type"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateTypeOpen(false); setNewTypeName(""); setNewTypeDesc(""); }}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={createType}
              disabled={!newTypeName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add field dialog */}
      <Dialog
        open={addFieldOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddFieldOpen(false)
            setNewFieldName("")
            setNewFieldDesc("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add sidebar field</DialogTitle>
            <DialogDescription>
              Create a custom field that will appear in the goal sidebar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-field-name">Field name</Label>
              <Input
                id="new-field-name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Priority, Quarter, Cost center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-field-desc">Description</Label>
              <Input
                id="new-field-desc"
                value={newFieldDesc}
                onChange={(e) => setNewFieldDesc(e.target.value)}
                placeholder="What information does this field capture?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddFieldOpen(false); setNewFieldName(""); setNewFieldDesc(""); }}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={addField}
              disabled={!newFieldName.trim()}
            >
              Add field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
