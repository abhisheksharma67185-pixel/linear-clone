"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react"
import {
  AtSign,
  Bold,
  ChevronDown,
  Code,
  Code2,
  FileText,
  Image as ImageIcon,
  IndentIncrease,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Mic,
  Plus,
  Send,
  Smile,
  SquareSlash,
  Strikethrough,
  Type,
  Underline,
  Video,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { EmojiPicker } from "./emoji-picker"
import { MentionPicker, type MentionItem } from "./mention-picker"
import { cn } from "@/lib/utils"

type User = {
  id: string
  name: string
  displayName: string
  avatar: string
  presence: "active" | "away" | "offline" | "dnd"
  isBot?: boolean
  title?: string
}

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

  // Mention state — when set, the picker is open and replacing the partial
  // `@xyz` chunk between `start` and the current cursor.
  const [users, setUsers] = useState<User[]>([])
  const [mention, setMention] = useState<{
    query: string
    start: number
    end: number
  } | null>(null)
  // The mention picker registers a listener via this ref so its keyboard
  // nav (↑/↓/Enter/Tab/Esc) can intercept events the textarea would
  // otherwise consume. Returning true from the handler means the picker
  // claimed the key — the textarea's onKeyDown then preventDefault's it.
  const mentionKeydownRef = useRef<
    ((e: KeyboardEvent<HTMLTextAreaElement>) => boolean) | null
  >(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetch("/api/data/users")
      .then((r) => r.json())
      .then((u: User[]) => setUsers(u))
      .catch(() => {})
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

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

  // Detect an in-progress @mention immediately before the cursor.
  // Matches `@xyz` where x..z are word chars; nothing if the @ is mid-word.
  const computeMention = (
    value: string,
    cursor: number
  ): { query: string; start: number; end: number } | null => {
    // Look back from cursor for a "@" preceded by start-of-string or whitespace.
    let i = cursor - 1
    while (i >= 0 && /[A-Za-z0-9_]/.test(value[i])) i--
    if (i < 0 || value[i] !== "@") return null
    if (i > 0 && !/\s/.test(value[i - 1])) return null
    return { query: value.slice(i + 1, cursor), start: i, end: cursor }
  }

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setText(value)
    const cursor = e.target.selectionStart ?? value.length
    setMention(computeMention(value, cursor))
  }

  const handleSelectionChange = () => {
    const ta = textareaRef.current
    if (!ta) return
    const cursor = ta.selectionStart ?? text.length
    setMention(computeMention(text, cursor))
  }

  const handleMentionSelect = (item: MentionItem) => {
    if (!mention) return
    const insertion = `${item.insert} `
    const next =
      text.slice(0, mention.start) + insertion + text.slice(mention.end)
    setText(next)
    setMention(null)
    const ta = textareaRef.current
    requestAnimationFrame(() => {
      ta?.focus()
      const pos = mention.start + insertion.length
      if (ta) ta.selectionStart = ta.selectionEnd = pos
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Let the mention picker handle navigation keys first.
    if (mention && mentionKeydownRef.current?.(e)) {
      e.preventDefault()
      return
    }
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

  // For lists / quote — insert a marker at column 0 of the current line(s).
  const prefixLine = (prefix: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart ?? text.length
    const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1
    const next = `${text.slice(0, lineStart)}${prefix}${text.slice(lineStart)}`
    setText(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + prefix.length
    })
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
    // `relative` so the absolute mention picker positions against this
    // wrapper. shrink-0 keeps the composer pinned to the bottom of its
    // flex parent even when the message list above it grows.
    <div
      className={cn(
        "relative m-4 mt-2 flex shrink-0 flex-col overflow-visible rounded-lg border border-border bg-background shadow-sm focus-within:border-primary/40",
        compact && "m-2"
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("*")}
          aria-label="Bold"
          title="Bold"
        >
          <Bold className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("_")}
          aria-label="Italic"
          title="Italic"
        >
          <Italic className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("__")}
          aria-label="Underline"
          title="Underline"
        >
          <Underline className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("~")}
          aria-label="Strikethrough"
          title="Strikethrough"
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
          title="Link"
        >
          <LinkIcon className="size-3.5" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-4" />
        {/* Numbered before bulleted to match real Slack's order. */}
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => prefixLine("1. ")}
          aria-label="Numbered list"
          title="Numbered list"
        >
          <ListOrdered className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => prefixLine("- ")}
          aria-label="Bulleted list"
          title="Bulleted list"
        >
          <List className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => prefixLine("    ")}
          aria-label="Increase indent"
          title="Increase indent"
        >
          <IndentIncrease className="size-3.5" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("`")}
          aria-label="Inline code"
          title="Inline code"
        >
          <Code className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => wrapSelection("```\n", "\n```")}
          aria-label="Code block"
          title="Code block"
        >
          <Code2 className="size-3.5" />
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onSelect={handleSelectionChange}
        onKeyDown={handleKeyDown}
        onBlur={() =>
          // Defer so a click inside the picker can still register before
          // the picker is dismissed by the textarea losing focus.
          setTimeout(() => setMention(null), 100)
        }
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[44px] resize-none border-0 px-3 py-2 text-[15px] shadow-none focus-visible:ring-0"
      />

      {mention ? (
        <MentionPicker
          query={mention.query}
          users={users}
          onSelect={handleMentionSelect}
          onCancel={() => setMention(null)}
          registerKeydown={(handler) => {
            mentionKeydownRef.current = handler as unknown as (
              e: KeyboardEvent<HTMLTextAreaElement>
            ) => boolean
            return () => {
              if (mentionKeydownRef.current === (handler as unknown))
                mentionKeydownRef.current = null
            }
          }}
        />
      ) : null}

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
          {/* Plus-in-circle (real Slack's attachment / shortcut menu trigger). */}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full border border-border text-muted-foreground hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach or shortcuts"
            title="Attach file"
          >
            <Plus className="size-3.5" />
          </Button>
          {/* Aa — toggles the formatting toolbar in real Slack. We always
              show the toolbar above, so this is decorative for now. */}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            aria-label="Format text"
            title="Format text"
          >
            <Type className="size-3.5" />
          </Button>
          <EmojiPicker onSelect={insertEmoji}>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground"
              aria-label="Insert emoji"
              title="Emoji"
            >
              <Smile className="size-3.5" />
            </Button>
          </EmojiPicker>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={() => {
              const ta = textareaRef.current
              const cursor = ta?.selectionStart ?? text.length
              // Insert "@" at the cursor and immediately open the mention
              // picker (mention state computed from the new text).
              const next = `${text.slice(0, cursor)}@${text.slice(cursor)}`
              setText(next)
              setMention({
                query: "",
                start: cursor,
                end: cursor + 1,
              })
              requestAnimationFrame(() => {
                ta?.focus()
                if (ta) ta.selectionStart = ta.selectionEnd = cursor + 1
              })
            }}
            aria-label="Mention someone"
            title="Mention someone"
          >
            <AtSign className="size-3.5" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            aria-label="Record video clip"
            title="Record video clip"
          >
            <Video className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            aria-label="Record audio clip"
            title="Record audio clip"
          >
            <Mic className="size-3.5" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={() => insertEmoji("/")}
            aria-label="Slash command"
            title="Shortcuts"
          >
            <SquareSlash className="size-3.5" />
          </Button>
        </div>
        {/* Send button — circular, with a small chevron for "schedule send"
            options. Disabled state hides the chevron in real Slack; we keep
            it visible because the dropdown is decorative for now. */}
        <div className="flex items-center">
          <Button
            size="icon"
            onClick={submit}
            disabled={!canSend || disabled}
            aria-label={sending ? "Sending" : "Send message"}
            className="size-7 rounded-md"
          >
            <Send className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canSend || disabled}
            aria-label="Send options"
            title="Send options"
            className="size-6 text-muted-foreground"
          >
            <ChevronDown className="size-3.5" />
          </Button>
        </div>
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
