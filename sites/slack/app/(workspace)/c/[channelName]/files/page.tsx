"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Download, Forward, Info, MoreVertical, Search } from "lucide-react"
import { ChannelHeader } from "@/components/channel-header"
import { ChannelBookmarksBar } from "@/components/channel-bookmarks-bar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShareFileDialog } from "@/components/share-file-dialog"
import { cn } from "@/lib/utils"
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
  authorId: string
  createdAt: string
  attachments: Attachment[]
}
type Channel = {
  id: string
  name: string
  topic: string
  type: "public" | "private"
  isArchived: boolean
  isShared: boolean
  memberIds: string[]
}
type Bookmark = { id: string; title: string; url: string; emoji: string }
type User = { id: string; name: string; displayName: string; avatar: string }

type FileRow = {
  attachment: Attachment
  authorId: string
  createdAt: string
}

// File-extension → background colour + label, mirroring Slack's coloured
// document tiles. The set covers the formats that show up in the seed data.
const EXT_STYLES: Record<string, { bg: string; label: string }> = {
  xlsx: { bg: "bg-emerald-600", label: "X" },
  xls: { bg: "bg-emerald-600", label: "X" },
  csv: { bg: "bg-emerald-700", label: "C" },
  docx: { bg: "bg-blue-600", label: "W" },
  doc: { bg: "bg-blue-600", label: "W" },
  pdf: { bg: "bg-rose-500", label: "P" },
  md: { bg: "bg-sky-500", label: "T" },
  txt: { bg: "bg-sky-500", label: "T" },
  pptx: { bg: "bg-orange-600", label: "P" },
  ppt: { bg: "bg-orange-600", label: "P" },
}

function fileStyle(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  return (
    EXT_STYLES[ext] ?? {
      bg: "bg-muted",
      label: ext.slice(0, 1).toUpperCase() || "F",
    }
  )
}

export default function ChannelFilesPage() {
  const params = useParams<{ channelName: string }>()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [rows, setRows] = useState<FileRow[]>([])
  const [query, setQuery] = useState("")
  const [shareTarget, setShareTarget] = useState<FileRow | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetch(`/api/data/channels/${params.channelName}`)
      .then((r) => r.json())
      .then(async (c: Channel) => {
        setChannel(c)
        const [msgs, bm, us] = await Promise.all([
          fetch(`/api/data/messages?channelId=${c.id}`).then(
            (r) => r.json() as Promise<Message[]>
          ),
          fetch(`/api/data/channels/${c.name}/bookmarks`).then(
            (r) => r.json() as Promise<Bookmark[]>
          ),
          fetch("/api/data/users").then((r) => r.json() as Promise<User[]>),
        ])
        setBookmarks(bm)
        setUsers(us)
        const flat: FileRow[] = []
        for (const m of msgs) {
          for (const a of m.attachments) {
            flat.push({
              attachment: a,
              authorId: m.authorId,
              createdAt: m.createdAt,
            })
          }
        }
        flat.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        setRows(flat)
      })
  }, [params.channelName])
  /* eslint-enable react-hooks/set-state-in-effect */

  const photos = useMemo(
    () => rows.filter((r) => r.attachment.type === "image"),
    [rows]
  )
  const documents = useMemo(
    () =>
      rows
        .filter((r) => r.attachment.type !== "image")
        .filter(
          (r) =>
            !query.trim() ||
            r.attachment.name.toLowerCase().includes(query.toLowerCase())
        ),
    [rows, query]
  )

  const userById = (id: string) => users.find((u) => u.id === id)

  if (!channel) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <>
      <ChannelHeader channel={channel} />
      <ChannelBookmarksBar bookmarks={bookmarks} />
      <ScrollArea className="min-h-0 flex-1 bg-muted/30">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files"
              className="h-10 rounded-lg bg-background pl-9 text-sm shadow-sm"
            />
          </div>

          {/* Photos and videos */}
          {photos.length > 0 ? (
            <section>
              <div className="mb-2 flex items-end justify-between">
                <h2 className="text-sm font-bold text-foreground">
                  Photos and videos
                </h2>
                <button className="text-xs font-semibold text-blue-600 hover:underline">
                  See all
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {photos.slice(0, 12).map((r) => (
                  <a
                    key={r.attachment.id}
                    href={r.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative size-44 shrink-0 overflow-hidden rounded-lg border border-border bg-background"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.attachment.url}
                      alt={r.attachment.name}
                      className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {/* Documents */}
          <section>
            <h2 className="mb-2 text-sm font-bold text-foreground">
              Documents
            </h2>
            {documents.length === 0 ? (
              <div className="rounded-md bg-background px-4 py-8 text-center text-sm text-muted-foreground shadow-sm">
                No documents in this channel.
              </div>
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-lg bg-background shadow-sm">
                {documents.map((r) => {
                  const u = userById(r.authorId)
                  const sty = fileStyle(r.attachment.name)
                  const date = new Date(r.createdAt).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric" }
                  )
                  return (
                    <li
                      key={r.attachment.id}
                      className="group relative flex items-center gap-3 px-4 py-3 hover:bg-muted/40"
                    >
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-md text-base font-bold text-white",
                          sty.bg
                        )}
                      >
                        {sty.label}
                      </span>
                      <a
                        href={r.attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 flex-1"
                      >
                        <div className="truncate text-sm font-bold text-foreground">
                          {r.attachment.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          Shared by {u?.name ?? "someone"} on {date}
                        </div>
                      </a>
                      {/* Hover-only action cluster — Slack reveals these on
                          row hover. */}
                      <div className="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-background p-0.5 shadow-sm group-hover:flex">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 text-muted-foreground"
                                aria-label="Download"
                                onClick={() =>
                                  toast.success(
                                    `Downloading ${r.attachment.name}`
                                  )
                                }
                              >
                                <Download className="size-3.5" />
                              </Button>
                            }
                          />
                          <TooltipContent>Download</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 text-muted-foreground"
                                aria-label="Share file"
                                onClick={() => setShareTarget(r)}
                              >
                                <Forward className="size-3.5" />
                              </Button>
                            }
                          />
                          <TooltipContent>Share file</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 text-muted-foreground"
                                aria-label="File details"
                                onClick={() => toast.info("File details")}
                              >
                                <Info className="size-3.5" />
                              </Button>
                            }
                          />
                          <TooltipContent>File details</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 text-muted-foreground"
                                aria-label="More actions"
                              >
                                <MoreVertical className="size-3.5" />
                              </Button>
                            }
                          />
                          <TooltipContent>More actions</TooltipContent>
                        </Tooltip>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </ScrollArea>
      <ShareFileDialog
        open={shareTarget !== null}
        onOpenChange={(v) => !v && setShareTarget(null)}
        file={shareTarget?.attachment ?? null}
        sharedByName={
          shareTarget ? (userById(shareTarget.authorId)?.name ?? null) : null
        }
        sharedAt={shareTarget?.createdAt ?? null}
      />
    </>
  )
}
