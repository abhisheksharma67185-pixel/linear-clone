"use client"

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react"
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Paperclip,
  Send,
  Smile,
  Strikethrough,
  Code,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { EmojiPicker } from "./emoji-picker"
import { cn } from "@/lib/utils"

export type ComposerAttachment = {
  // Local-only id; the server assigns its own when the message is created.
  localId: string
  type: "file" | "image" | "link"
  name: string
  url: string
}

export function Composer({
  placeholder,
  onSend,
  disabled,
  compact,
}: {
  placeholder: string
  // Optional second arg lets the caller persist attachments. Existing call
  // sites that ignore it keep working — a string-only signature is preserved.
  onSend: (
    text: string,
    attachments: ComposerAttachment[]
  ) => Promise<void> | void
  disabled?: boolean
  compact?: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState("")
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
  const [sending, setSending] = useState(false)

  const submit = async () => {
    const trimmed = text.trim()
    if (sending || disabled) return
    if (!trimmed && attachments.length === 0) return
    setSending(true)
    try {
      await onSend(trimmed, attachments)
      setText("")
      setAttachments([])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  // ---------------------------------------------------------------------
  // Markdown toolbar — wrap the current selection in markers and re-focus.
  // ---------------------------------------------------------------------

  const wrapSelection = (before: string, after = before) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart ?? text.length
    const end = ta.selectionEnd ?? text.length
    const selected = text.slice(start, end) || ""
    const next = `${text.slice(0, start)}${before}${selected}${after}${text.slice(end)}`
    setText(next)
    requestAnimationFrame(() => {
      ta.focus()
      const offset = before.length + selected.length + after.length
      ta.selectionStart = ta.selectionEnd = start + offset
    })
  }

  const insertLink = () => {
    const url = window.prompt("Link URL")
    if (!url) return
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart ?? text.length
    const end = ta.selectionEnd ?? text.length
    const label = text.slice(start, end) || url
    const next = `${text.slice(0, start)}<${url}|${label}>${text.slice(end)}`
    setText(next)
  }

  const insertEmoji = (shortcode: string) => {
    const ta = textareaRef.current
    const cursor = ta?.selectionStart ?? text.length
    const next = `${text.slice(0, cursor)}${shortcode} ${text.slice(cursor)}`
    setText(next)
    requestAnimationFrame(() => {
      ta?.focus()
      const pos = cursor + shortcode.length + 1
      if (ta) ta.selectionStart = ta.selectionEnd = pos
    })
  }

  // ---------------------------------------------------------------------
  // Attachments — local-only metadata. Real upload would go to a CDN; the
  // mock just records the file name + a data: URL for previewing.
  // ---------------------------------------------------------------------

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const next: ComposerAttachment[] = []
    for (const file of files) {
      const dataUrl = await fileToDataUrl(file)
      next.push({
        localId: `att-${Math.random().toString(36).slice(2, 10)}`,
        type: file.type.startsWith("image/") ? "image" : "file",
        name: file.name,
        url: dataUrl,
      })
    }
    setAttachments((cur) => [...cur, ...next])
    // Reset so picking the same file twice still fires onChange.
    e.target.value = ""
  }

  const removeAttachment = (localId: string) =>
    setAttachments((cur) => cur.filter((a) => a.localId !== localId))

  const canSend = (text.trim() !== "" || attachments.length > 0) && !sending

  return (
    <div
      className={cn(
        "m-4 mt-2 flex flex-col rounded-lg border border-border bg-background shadow-sm focus-within:border-primary/40",
        compact && "m-2"
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-border px-2 py-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("*")}
          aria-label="Bold"
        >
          <Bold className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("_")}
          aria-label="Italic"
        >
          <Italic className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("~")}
          aria-label="Strikethrough"
        >
          <Strikethrough className="size-3.5" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={insertLink}
          aria-label="Link"
        >
          <LinkIcon className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("`")}
          aria-label="Code"
        >
          <Code className="size-3.5" />
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[44px] resize-none border-0 px-3 py-2 text-[15px] shadow-none focus-visible:ring-0"
      />

      {attachments.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2">
          {attachments.map((a) => {
            const Icon = a.type === "image" ? ImageIcon : FileText
            return (
              <div
                key={a.localId}
                className="group/att flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs"
              >
                <Icon className="size-3.5 text-muted-foreground" />
                <span className="max-w-40 truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(a.localId)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${a.name}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            )
          })}
        </div>
      ) : null}

      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center gap-0.5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFiles}
            className="hidden"
            aria-hidden
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
          >
            <Paperclip className="size-3.5" />
          </Button>
          <EmojiPicker onSelect={insertEmoji}>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Insert emoji"
            >
              <Smile className="size-3.5" />
            </Button>
          </EmojiPicker>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => insertEmoji("@")}
            aria-label="Mention"
          >
            @
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 font-mono"
            onClick={() => insertEmoji("/")}
            aria-label="Slash command"
          >
            /
          </Button>
        </div>
        <Button
          size="sm"
          onClick={submit}
          disabled={!canSend || disabled}
          className="h-7 gap-1 rounded px-2"
        >
          <Send className="size-3.5" />
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>
    </div>
  )
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
