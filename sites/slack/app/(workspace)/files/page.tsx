"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import {
  FileText,
  Image as ImageIcon,
  Link2,
  MoreHorizontal,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type Attachment = {
  id: string
  type: "file" | "image" | "link"
  name: string
  url: string
}

type Message = {
  id: string
  channelId: string | null
  dmId: string | null
  authorId: string
  text: string
  attachments: Attachment[]
  createdAt: string
}

type Channel = { id: string; name: string }
type User = { id: string; name: string; displayName: string }

type FileRow = Attachment & {
  messageId: string
  channelId: string | null
  dmId: string | null
  authorId: string
  createdAt: string
}

const CURRENT_USER_ID = "usr-1"

const TYPE_ICON = {
  file: FileText,
  image: ImageIcon,
  link: Link2,
} as const

export default function FilesPage() {
  const [files, setFiles] = useState<FileRow[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<
    "all" | "file" | "image" | "link"
  >("all")
  const [uploadOpen, setUploadOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const [m, c, u] = await Promise.all([
      fetch("/api/data/messages").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
      fetch("/api/data/users").then((r) => r.json()),
    ])
    const msgs = m as Message[]
    const all: FileRow[] = msgs.flatMap((msg) =>
      msg.attachments.map((a) => ({
        ...a,
        messageId: msg.id,
        channelId: msg.channelId,
        dmId: msg.dmId,
        authorId: msg.authorId,
        createdAt: msg.createdAt,
      }))
    )
    setFiles(all)
    setChannels(c as Channel[])
    setUsers(u as User[])
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Upload posts the file as an attachment on a new message in #general so
  // it shows up here. (Real Slack treats orphan-uploads similarly.)
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    if (picked.length === 0) return
    setUploadOpen(true)
    const general = channels.find((c) => c.name === "general") ?? channels[0]
    if (!general) {
      toast.error("No channel to upload to")
      setUploadOpen(false)
      return
    }
    const attachments = await Promise.all(
      picked.map(async (file) => ({
        id: `att-${Math.random().toString(36).slice(2, 10)}`,
        type: file.type.startsWith("image/")
          ? ("image" as const)
          : ("file" as const),
        name: file.name,
        url: await fileToDataUrl(file),
      }))
    )
    const res = await fetch("/api/data/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: general.id,
        authorId: CURRENT_USER_ID,
        text: `Uploaded ${picked.length} file${picked.length === 1 ? "" : "s"}`,
        attachments,
      }),
    })
    setUploadOpen(false)
    e.target.value = ""
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Upload failed")
      return
    }
    toast.success(
      `Uploaded ${picked.length} file${picked.length === 1 ? "" : "s"} to #${general.name}`
    )
    load()
  }

  // No dedicated attachment endpoint — delete the underlying message via the
  // existing DELETE /api/data/messages/[id] route (soft-delete, attachments
  // disappear too because the message renders as "deleted").
  const deleteFile = async (row: FileRow) => {
    if (
      !window.confirm(
        `Delete the message containing "${row.name}"? Other attachments on that message will also be removed.`
      )
    ) {
      return
    }
    const res = await fetch(`/api/data/messages/${row.messageId}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to remove file")
      return
    }
    toast.success("File removed")
    load()
  }

  const filtered = files.filter((f) => {
    if (typeFilter !== "all" && f.type !== typeFilter) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return f.name.toLowerCase().includes(q)
  })

  const labelFor = (row: FileRow): string => {
    if (row.channelId) {
      const ch = channels.find((c) => c.id === row.channelId)
      return ch ? `#${ch.name}` : "Channel"
    }
    if (row.dmId) return "DM"
    return ""
  }

  const authorName = (id: string) => users.find((u) => u.id === id)?.name ?? id

  return (
    <>
      <SimplePageHeader
        title="Files"
        subtitle={`${files.length} files`}
        action={
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleUpload}
              className="hidden"
              aria-hidden
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadOpen}
            >
              <Upload className="size-3.5" />
              {uploadOpen ? "Uploading…" : "Upload"}
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-2 border-b border-border px-4 py-2 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files by name"
            className="h-9 pl-8"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="file">Files</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="link">Links</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>
                {files.length === 0 ? "No files yet" : "No files match"}
              </EmptyTitle>
              <EmptyDescription>
                {files.length === 0
                  ? "Click Upload above to share a file with the workspace."
                  : "Try a different query or change the type filter."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => {
              const Icon = TYPE_ICON[f.type] ?? FileText
              return (
                <div
                  key={`${f.messageId}:${f.id}`}
                  className="group flex items-start gap-3 rounded-md border border-border bg-card p-3 hover:bg-muted/30"
                >
                  <Icon className="mt-0.5 size-5 text-muted-foreground" />
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 flex-1 flex-col"
                  >
                    <span className="truncate text-sm font-semibold">
                      {f.name}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase">
                      {f.type}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      Shared by {authorName(f.authorId)} in {labelFor(f)} ·{" "}
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </a>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 opacity-0 group-hover:opacity-100"
                          aria-label="File actions"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => deleteFile(f)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </>
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
