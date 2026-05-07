"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { SimplePageHeader } from "@/components/simple-page-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileText, Hash, Image as ImageIcon, Link2, Lock } from "lucide-react"

type Message = {
  id: string
  text: string
  authorId: string
  channelId: string | null
  dmId: string | null
  createdAt: string
}
type Channel = {
  id: string
  name: string
  topic: string
  type: "public" | "private"
}
type User = {
  id: string
  name: string
  displayName: string
  email: string
  title: string
}
type FileResult = {
  id: string
  type: "file" | "image" | "link"
  name: string
  url: string
  messageId: string
}

type Results = {
  query: string
  totalResults: number
  messages: Message[]
  channels: Channel[]
  users: User[]
  files: FileResult[]
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const [results, setResults] = useState<Results | null>(null)

  useEffect(() => {
    if (!q) return
    fetch(`/api/data/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then(setResults)
  }, [q])

  return (
    <>
      <SimplePageHeader
        title={`Search: "${q}"`}
        subtitle={results ? `${results.totalResults} results` : "Searching…"}
      />
      {!q ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Type a query in the top bar.
        </div>
      ) : results ? (
        <Tabs defaultValue="messages" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="w-fit rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="messages">
              Messages ({results.messages.length})
            </TabsTrigger>
            <TabsTrigger value="channels">
              Channels ({results.channels.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              People ({results.users.length})
            </TabsTrigger>
            <TabsTrigger value="files">
              Files ({results.files.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="messages" className="flex-1">
            <ScrollArea className="h-full">
              <div className="flex flex-col divide-y divide-border">
                {results.messages.map((m) => (
                  <div key={m.id} className="px-4 py-3">
                    <div className="text-xs text-muted-foreground">
                      {m.authorId} ·{" "}
                      {new Date(m.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-foreground">{m.text}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="channels" className="flex-1">
            <ScrollArea className="h-full">
              <div className="flex flex-col divide-y divide-border">
                {results.channels.map((c) => {
                  const Icon = c.type === "private" ? Lock : Hash
                  return (
                    <Link
                      key={c.id}
                      href={`/c/${c.name}`}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-muted"
                    >
                      <Icon className="size-4" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {c.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.topic}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="users" className="flex-1">
            <ScrollArea className="h-full">
              <div className="flex flex-col divide-y divide-border">
                {results.users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/people/${u.id}`}
                    className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted"
                  >
                    <span className="font-semibold text-foreground">
                      {u.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {u.title} · {u.email}
                    </span>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="files" className="flex-1">
            <ScrollArea className="h-full">
              {results.files.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No files match &ldquo;{q}&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.files.map((f) => {
                    const Icon =
                      f.type === "image"
                        ? ImageIcon
                        : f.type === "link"
                          ? Link2
                          : FileText
                    return (
                      <a
                        key={f.id}
                        href={f.url}
                        className="flex items-start gap-3 rounded-md border border-border bg-card p-3 hover:bg-muted"
                      >
                        <Icon className="size-5 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-semibold">
                            {f.name}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase">
                            {f.type}
                          </span>
                        </div>
                      </a>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Searching…
        </div>
      )}
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  )
}
