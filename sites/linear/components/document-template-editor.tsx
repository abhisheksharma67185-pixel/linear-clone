"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Linear's brand indigo-blue (used for the primary Save/Create CTA here and
// shared with Initiatives → Update schedule Save).
const LINEAR_BRAND_BLUE = "#5E6AD2"

const ICON_PRESETS = [
  { name: "document", glyph: "📄" },
  { name: "book", glyph: "📘" },
  { name: "pencil", glyph: "✏️" },
  { name: "sparkle", glyph: "✨" },
  { name: "folder", glyph: "📁" },
  { name: "target", glyph: "🎯" },
  { name: "rocket", glyph: "🚀" },
  { name: "bulb", glyph: "💡" },
] as const

type DocumentTemplate = {
  id: string
  name: string
  iconName: string
  body: string
  createdAt: string
  updatedAt: string
}

type Props =
  | { mode: "new"; templateId?: undefined }
  | { mode: "edit"; templateId: string }

export function DocumentTemplateEditor(props: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(props.mode === "edit")
  const [name, setName] = useState("")
  const [iconName, setIconName] = useState("document")
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  // Baseline for dirty-tracking — populated from the loaded template in edit
  // mode, stays empty in new mode.
  const [baseline, setBaseline] = useState<{
    name: string
    iconName: string
    body: string
  }>({ name: "", iconName: "document", body: "" })

  useEffect(() => {
    let cancelled = false
    if (props.mode === "edit") {
      fetch(`/api/document-templates/${props.templateId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((tpl: DocumentTemplate | null) => {
          if (cancelled) return
          if (!tpl) {
            toast.error("Template not found")
            router.replace("/settings?section=documents")
            return
          }
          setName(tpl.name)
          setIconName(tpl.iconName)
          setBody(tpl.body)
          setBaseline({
            name: tpl.name,
            iconName: tpl.iconName,
            body: tpl.body,
          })
        })
        .catch(() => {
          if (!cancelled) toast.error("Failed to load template")
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }
    return () => {
      cancelled = true
    }
  }, [props, router])

  // Autofocus the name input on first mount.
  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => nameRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [loading])

  const isDirty =
    name !== baseline.name ||
    iconName !== baseline.iconName ||
    body !== baseline.body

  const goToDocuments = () => router.push("/settings?section=documents")

  const onCancelClick = () => {
    if (isDirty) setConfirmOpen(true)
    else goToDocuments()
  }

  const canSave = name.trim().length > 0 && !submitting

  const save = async () => {
    if (!canSave) return
    setSubmitting(true)
    try {
      const url =
        props.mode === "new"
          ? "/api/document-templates"
          : `/api/document-templates/${props.templateId}`
      const method = props.mode === "new" ? "POST" : "PATCH"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), iconName, body }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error || "Save failed")
      }
      toast.success(
        props.mode === "new" ? "Template created" : "Template saved"
      )
      router.push("/settings?section=documents")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
      setSubmitting(false)
    }
  }

  // Cmd/Ctrl+Enter → Create.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        if (canSave) save()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSave, name, iconName, body])

  const glyph =
    ICON_PRESETS.find((p) => p.name === iconName)?.glyph ?? "📄"

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 text-sm">
        <div className="text-muted-foreground">Loading template…</div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col p-6">
      <Link
        href="/settings?section=documents"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 focus-visible:ring-offset-background -ml-1 inline-flex w-fit items-center gap-1 rounded px-1 py-0.5 text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Documents
      </Link>

      <h1 className="mt-3 text-xl font-semibold">
        {props.mode === "new" ? "New document template" : "Edit document template"}
      </h1>

      <hr className="border-border/80 mt-4 border-t" aria-hidden="true" />

      <div className="mt-6 flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Change icon (current: ${iconName})`}
                className="bg-muted hover:bg-muted/80 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex size-8 shrink-0 items-center justify-center rounded-md text-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {glyph}
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
        <input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name"
          aria-label="Template name"
          aria-required="true"
          className="text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background flex-1 rounded bg-transparent px-1 py-0.5 text-xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Click here to start writing…"
        aria-label="Document template body"
        rows={14}
        className="text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/50 focus-visible:ring-offset-background mt-5 w-full resize-none rounded bg-transparent px-1 py-2 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      />

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancelClick}
          aria-label="Cancel and return to Documents"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={save}
          disabled={!canSave}
          aria-label={
            props.mode === "new"
              ? "Create document template"
              : "Save document template"
          }
          style={{ backgroundColor: LINEAR_BRAND_BLUE }}
          className="text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting
            ? "Saving…"
            : props.mode === "new"
              ? "Create"
              : "Save"}
        </Button>
      </div>
      <div className="text-muted-foreground mt-2 text-right text-[11px]">
        <kbd className="font-mono">⌘/Ctrl + Enter</kbd> to save
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Template is not saved</DialogTitle>
            <DialogDescription>
              Do you want to navigate and lose your changes?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={goToDocuments}
              className="bg-destructive hover:bg-destructive/90"
              aria-label="Discard changes and navigate away"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
