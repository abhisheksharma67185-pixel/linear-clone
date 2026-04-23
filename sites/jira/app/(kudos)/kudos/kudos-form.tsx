"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const samplePeople = [
  { id: "1", name: "Abhishek Sharma", type: "person", avatar: "AS" },
  { id: "2", name: "John Doe", type: "person", avatar: "JD" },
  { id: "3", name: "Jane Smith", type: "person", avatar: "JS" },
  { id: "4", name: "Engineering Team", type: "team", avatar: "ET" },
  { id: "5", name: "Design Team", type: "team", avatar: "DT" },
  { id: "6", name: "Product Team", type: "team", avatar: "PT" },
]

const recentLinks = [
  {
    url: "https://myproject.atlassian.net/browse/SCRUM-1",
    title: "SCRUM-1: Set up project",
    source: "jira",
  },
  {
    url: "https://myproject.atlassian.net/browse/SCRUM-2",
    title: "SCRUM-2: Create backlog",
    source: "jira",
  },
  {
    url: "https://myproject.atlassian.net/browse/SCRUM-3",
    title: "SCRUM-3: Sprint planning",
    source: "jira",
  },
]

const defaultGifs = [
  {
    id: "1",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6OHRyMnBzMmx5a2I3OGFhYzFiMzR5czh6YWRyZHB5ZXVkZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oz8xAFtqoOUUrsh7W/giphy.gif",
    title: "Thank You",
  },
  {
    id: "2",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnE4ZGd4czVhNmRrOXBxYjBzb2w0c2JhcHRhMjFqNTJ2OHNyMHZnaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3q2XhfQ8oCkm1Ts4/giphy.gif",
    title: "Celebration",
  },
  {
    id: "3",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWVlcnl2cDhreGx2NzlsMHc1YjdrZmpjbmRkZjgybjZyZGV4cjRsZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26u4cqiYI30juCOGY/giphy.gif",
    title: "Awesome",
  },
  {
    id: "4",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2w1NmtjdnN4NWVqMHFsMjQ0cGg4bTlpcWFtczBqNGpzNHA3c3I3aCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT77XWum9yH7zNkFW0/giphy.gif",
    title: "High Five",
  },
  {
    id: "5",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTZtcXFkOGRxaHM2MjF0NnA3b2k3dGJ2ZXR1ZGtyMWh6ZjcwNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0MYt5jPR6QX5pnqM/giphy.gif",
    title: "Applause",
  },
  {
    id: "6",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2d0cHdsMGZ6dTk3Y3c2NmFtbXY5NWY0ZWpwOXF3d2ZhOWdkbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6fJ1BM7R2EBRDnxK/giphy.gif",
    title: "Star",
  },
  {
    id: "7",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmQ4OWlvbGV4dGpzcmRiYWl5dzJlbjI2N2t2bTlrMzR6cHV1b3NnZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26gsjCZpPolPr3sBy/giphy.gif",
    title: "Congrats",
  },
  {
    id: "8",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGl3Z3FlOGx2MHVjMW95ZmhvdmEyNHdyemRhcjdqaG9zdW9rOGpnbSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0HlHFRbmaZtBRhf2/giphy.gif",
    title: "Well Done",
  },
  {
    id: "9",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmVqanN1OGFyN2k0aWFzcjhwbGxpcXN4ZW43MWgxOHY3bHZqemFuZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEjI5VtIhHvK37XYQ/giphy.gif",
    title: "Party",
  },
]

function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void
  onClose: () => void
}) {
  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "🥲",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🫢",
    "🫣",
    "🤫",
    "🤔",
    "🫡",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "🫥",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "👍",
    "👏",
    "🙌",
    "🤝",
    "💪",
    "🎉",
    "🎊",
    "🏆",
    "⭐",
    "🌟",
    "💯",
    "🔥",
    "❤️",
    "💙",
    "💜",
    "💚",
    "💛",
    "🧡",
    "🤎",
    "🖤",
  ]
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-10 left-0 z-50 w-72 rounded-lg border bg-popover p-3 shadow-lg"
    >
      <div className="grid grid-cols-10 gap-0.5">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji)
              onClose()
            }}
            className="flex size-7 items-center justify-center rounded text-base transition-colors hover:bg-accent"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

function LinkDialog({
  open,
  onClose,
  onInsert,
}: {
  open: boolean
  onClose: () => void
  onInsert: (url: string, text: string) => void
}) {
  const [linkTab, setLinkTab] = useState<"home" | "jira">("home")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  if (!open) return null

  const filteredLinks = recentLinks.filter((l) => {
    const matchesTab = linkTab === "jira" ? l.source === "jira" : true
    const matchesSearch = searchQuery
      ? l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.url.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesTab && matchesSearch
  })

  const isUrl =
    linkUrl.startsWith("http://") ||
    linkUrl.startsWith("https://") ||
    linkUrl.startsWith("www.")

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="p-0 sm:max-w-[480px]">
        <div className="p-5">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium">
              Search or paste a link <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Find recent links or paste a new link"
              value={linkUrl || searchQuery}
              onChange={(e) => {
                const val = e.target.value
                if (val.startsWith("http") || val.startsWith("www.")) {
                  setLinkUrl(val)
                  setSearchQuery("")
                } else {
                  setSearchQuery(val)
                  setLinkUrl("")
                }
              }}
              className="h-10"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium">
              Display text (optional)
            </label>
            <Input
              placeholder="Text to display"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="h-10"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Give this link a title or description
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-4 border-b">
            <button
              onClick={() => setLinkTab("home")}
              className={`pb-2 text-sm font-medium transition-colors ${linkTab === "home" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              Home
            </button>
            <button
              onClick={() => setLinkTab("jira")}
              className={`pb-2 text-sm font-medium transition-colors ${linkTab === "jira" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
            >
              Jira
            </button>
          </div>

          {/* Link results */}
          <div className="min-h-[180px]">
            {isUrl ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <svg
                    className="size-5 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Link ready to insert</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click Insert to add this link
                </p>
              </div>
            ) : filteredLinks.length > 0 && !searchQuery ? (
              <div className="space-y-1">
                {filteredLinks.map((link) => (
                  <button
                    key={link.url}
                    onClick={() => {
                      setLinkUrl(link.url)
                      setLinkText(link.title)
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex size-8 items-center justify-center rounded bg-blue-50 dark:bg-blue-900/20">
                      <svg
                        className="size-4 text-blue-600"
                        viewBox="0 0 32 32"
                        fill="currentColor"
                      >
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {link.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {link.url}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg
                  className="mb-3 size-16 text-muted-foreground/30"
                  viewBox="0 0 64 64"
                  fill="none"
                >
                  <circle
                    cx="28"
                    cy="28"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <line
                    x1="40"
                    y1="40"
                    x2="54"
                    y2="54"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="28"
                    cy="24"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M22 34c0-3.3 2.7-6 6-6s6 2.7 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-sm font-semibold">
                  We couldn&apos;t find anything
                  <br />
                  matching your search.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try again with a different term.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-5 py-3">
          <Button
            variant="ghost"
            onClick={() => {
              setLinkUrl("")
              setLinkText("")
              setSearchQuery("")
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            disabled={!linkUrl}
            onClick={() => {
              onInsert(linkUrl, linkText || linkUrl)
              setLinkUrl("")
              setLinkText("")
              setSearchQuery("")
              onClose()
            }}
          >
            Insert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GifPicker({
  onSelect,
  onClose,
  inline,
}: {
  onSelect: (url: string) => void
  onClose: () => void
  inline?: boolean
}) {
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (inline) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose, inline])

  const filtered = search
    ? defaultGifs.filter((g) =>
        g.title.toLowerCase().includes(search.toLowerCase())
      )
    : defaultGifs

  const content = (
    <>
      <h3 className="mb-3 text-sm font-semibold">Choose a GIF</h3>
      <div className="relative mb-3">
        <Input
          placeholder="Search Giphy"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pr-9"
        />
        <svg
          className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto">
        {filtered.map((gif) => (
          <button
            key={gif.id}
            onClick={() => {
              onSelect(gif.url)
              onClose()
            }}
            className="group relative aspect-square overflow-hidden rounded-md border transition-all hover:ring-2 hover:ring-blue-500"
          >
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <span className="px-1 text-center text-xs text-muted-foreground">
                {gif.title}
              </span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-8 text-center text-sm text-muted-foreground">
            No GIFs found
          </div>
        )}
      </div>
    </>
  )

  if (inline) return <div>{content}</div>

  return (
    <div
      ref={ref}
      className="absolute top-12 right-0 z-50 w-80 rounded-lg border bg-popover p-4 shadow-lg"
    >
      {content}
    </div>
  )
}

export default function KudosForm() {
  const router = useRouter()
  const [recipient, setRecipient] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState<
    (typeof samplePeople)[0] | null
  >(null)
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false)
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [selectedGif, setSelectedGif] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<
    "heart" | "crayons" | "hammer"
  >("hammer")
  const [insertedLinks, setInsertedLinks] = useState<
    Array<{ url: string; text: string }>
  >([])
  const [kudosSent, setKudosSent] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const recipientRef = useRef<HTMLDivElement>(null)

  const filteredPeople = samplePeople.filter((p) =>
    p.name.toLowerCase().includes(recipient.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        recipientRef.current &&
        !recipientRef.current.contains(e.target as Node)
      ) {
        setShowRecipientDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const canSend =
    selectedRecipient && (message.trim() || insertedLinks.length > 0)

  const handleSendKudos = () => {
    if (!canSend) return
    setKudosSent(true)
    setTimeout(() => {
      setKudosSent(false)
      setSelectedRecipient(null)
      setRecipient("")
      setMessage("")
      setInsertedLinks([])
      setSelectedGif(null)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] dark:bg-background">
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          {/* Recipient selector */}
          <div ref={recipientRef} className="relative">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full border bg-muted">
                {selectedRecipient ? (
                  <span className="text-xs font-medium">
                    {selectedRecipient.avatar}
                  </span>
                ) : (
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <input
                type="text"
                placeholder="Choose a person or team this kudos is for"
                value={selectedRecipient ? selectedRecipient.name : recipient}
                onChange={(e) => {
                  setRecipient(e.target.value)
                  setSelectedRecipient(null)
                  setShowRecipientDropdown(true)
                }}
                onFocus={() => setShowRecipientDropdown(true)}
                className="w-80 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {showRecipientDropdown && (
              <div className="absolute top-full left-0 z-50 mt-2 w-96 rounded-lg border bg-popover py-1 shadow-lg">
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => {
                        setSelectedRecipient(person)
                        setRecipient("")
                        setShowRecipientDropdown(false)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {person.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{person.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {person.type}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                    No options
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Button
          disabled={!canSend || kudosSent}
          onClick={handleSendKudos}
          className={`rounded-full px-5 ${canSend && !kudosSent ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
          variant={canSend && !kudosSent ? "default" : "outline"}
        >
          {kudosSent ? "Kudos Sent!" : "Give Kudos"}
        </Button>
      </div>

      {/* Success toast */}
      {kudosSent && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-lg border bg-green-50 px-6 py-3 shadow-lg dark:bg-green-900/20">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-sm font-medium">
              Kudos sent to {selectedRecipient?.name}!
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-light text-muted-foreground">
          Let them know why you&apos;re giving this kudos
        </h1>

        {/* Editor area */}
        <div className="mb-2">
          <div
            ref={editorRef}
            className="min-h-[80px] rounded-md text-sm outline-none"
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message..."
              className="min-h-[80px] w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Inserted links */}
          {insertedLinks.length > 0 && (
            <div className="mt-2 space-y-1">
              {insertedLinks.map((link, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 dark:bg-blue-900/20"
                >
                  <svg
                    className="size-3.5 shrink-0 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-blue-600 hover:underline"
                  >
                    {link.text}
                  </a>
                  <button
                    onClick={() =>
                      setInsertedLinks((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent"
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
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="relative mb-6 flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="group relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent"
              title="Add emoji"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
            {showEmojiPicker && (
              <EmojiPicker
                onSelect={(emoji) => setMessage((prev) => prev + emoji)}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
          <button
            onClick={() => setShowLinkDialog(true)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent"
            title="Add link"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </div>

        {/* Kudos card image */}
        <div className="relative overflow-hidden rounded-2xl">
          {selectedGif ? (
            <div className="relative aspect-[16/9] bg-muted">
              <div className="flex size-full items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20">
                <p className="text-sm text-muted-foreground">
                  Custom GIF selected
                </p>
              </div>
              <button
                onClick={() => setSelectedGif(null)}
                className="absolute top-3 left-3 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
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
          ) : selectedCard === "heart" ? (
            <KudosHeartIllustration />
          ) : selectedCard === "hammer" ? (
            <KudosHammerIllustration />
          ) : (
            <KudosCrayonsIllustration />
          )}

          {/* Personalise button */}
          <div className="absolute top-4 right-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGifPicker(!showGifPicker)}
                className="bg-background/90 text-sm font-medium shadow-sm backdrop-blur"
              >
                Personalise
              </Button>
              {showGifPicker && (
                <div className="absolute top-12 right-0 z-50">
                  {/* Card picker */}
                  <div className="mb-2 w-80 rounded-lg border bg-popover p-4 shadow-lg">
                    <h3 className="mb-3 text-sm font-semibold">
                      Choose a card
                    </h3>
                    <div className="mb-3 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setSelectedCard("hammer")
                          setSelectedGif(null)
                        }}
                        className={`overflow-hidden rounded-lg border-2 transition-all ${selectedCard === "hammer" && !selectedGif ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-muted-foreground/30"}`}
                      >
                        <KudosHammerIllustration mini />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCard("heart")
                          setSelectedGif(null)
                        }}
                        className={`overflow-hidden rounded-lg border-2 transition-all ${selectedCard === "heart" && !selectedGif ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-muted-foreground/30"}`}
                      >
                        <KudosHeartIllustration mini />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCard("crayons")
                          setSelectedGif(null)
                        }}
                        className={`overflow-hidden rounded-lg border-2 transition-all ${selectedCard === "crayons" && !selectedGif ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-muted-foreground/30"}`}
                      >
                        <KudosCrayonsIllustration mini />
                      </button>
                    </div>
                    <div className="border-t pt-3">
                      <GifPicker
                        onSelect={(url) => setSelectedGif(url)}
                        onClose={() => setShowGifPicker(false)}
                        inline
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Link dialog */}
      <LinkDialog
        open={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onInsert={(url, text) =>
          setInsertedLinks((prev) => [...prev, { url, text }])
        }
      />
    </div>
  )
}

function KudosHeartIllustration({ mini }: { mini?: boolean } = {}) {
  return (
    <svg
      viewBox="0 0 800 450"
      className={mini ? "h-full w-full" : "w-full"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="800" height="450" rx="16" fill="#F5C518" />

      {/* Confetti / dash marks */}
      {[
        { x: 180, y: 80, r: -30 },
        { x: 250, y: 50, r: 15 },
        { x: 350, y: 40, r: -10 },
        { x: 450, y: 45, r: 20 },
        { x: 550, y: 55, r: -25 },
        { x: 620, y: 85, r: 10 },
        { x: 140, y: 180, r: 45 },
        { x: 660, y: 170, r: -40 },
        { x: 120, y: 300, r: 30 },
        { x: 680, y: 290, r: -20 },
        { x: 200, y: 380, r: -15 },
        { x: 350, y: 400, r: 25 },
        { x: 500, y: 390, r: -30 },
        { x: 600, y: 370, r: 15 },
      ].map((d, i) => (
        <rect
          key={i}
          x={d.x}
          y={d.y}
          width="28"
          height="6"
          rx="3"
          fill="#2EC4F6"
          transform={`rotate(${d.r} ${d.x + 14} ${d.y + 3})`}
        />
      ))}

      {/* Blue dots */}
      <circle cx="300" cy="280" r="6" fill="#1A74E2" />
      <circle cx="520" cy="260" r="6" fill="#1A74E2" />

      {/* Heart shape */}
      <path
        d="M400 340 C400 340 280 260 280 190 C280 150 320 120 360 130 C380 135 395 155 400 170 C405 155 420 135 440 130 C480 120 520 150 520 190 C520 260 400 340 400 340Z"
        fill="none"
        stroke="#E85D3A"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Smile on heart */}
      <path
        d="M360 250 C370 270 430 270 440 250"
        fill="none"
        stroke="#1A74E2"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Eyes */}
      <circle cx="370" cy="225" r="5" fill="#1A74E2" />
      <circle cx="430" cy="225" r="5" fill="#1A74E2" />

      {/* Crayon drawing the heart (red/orange) */}
      <g transform="translate(500, 170) rotate(35)">
        <rect x="0" y="0" width="120" height="22" rx="3" fill="#E85D3A" />
        <polygon points="-18,5 0,0 0,22 -18,17" fill="#E85D3A" />
        <rect
          x="60"
          y="2"
          width="4"
          height="18"
          rx="1"
          fill="#F0A090"
          opacity="0.6"
        />
        <rect
          x="72"
          y="2"
          width="4"
          height="18"
          rx="1"
          fill="#F0A090"
          opacity="0.6"
        />
      </g>

      {/* Blue pen bottom left */}
      <g transform="translate(160, 340) rotate(-50)">
        <rect x="0" y="0" width="140" height="16" rx="3" fill="#2563EB" />
        <polygon points="-14,3 0,0 0,16 -14,13" fill="#3B82F6" />
        <rect x="110" y="0" width="30" height="16" rx="3" fill="#1D4ED8" />
      </g>

      {/* Light blue pencil top right */}
      <g transform="translate(540, 30) rotate(25)">
        <rect x="0" y="0" width="110" height="14" rx="2" fill="#67E8F9" />
        <polygon points="-12,2 0,0 0,14 -12,12" fill="#22D3EE" />
        <rect x="85" y="0" width="25" height="14" rx="2" fill="#06B6D4" />
      </g>

      {/* Ray lines from heart */}
      {[
        { x1: 400, y1: 130, x2: 400, y2: 70, r: 0 },
        { x1: 310, y1: 160, x2: 270, y2: 120, r: 0 },
        { x1: 490, y1: 160, x2: 530, y2: 120, r: 0 },
        { x1: 260, y1: 220, x2: 210, y2: 220, r: 0 },
        { x1: 540, y1: 220, x2: 590, y2: 220, r: 0 },
      ].map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#F5C518"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0"
        />
      ))}
    </svg>
  )
}

function KudosCrayonsIllustration({ mini }: { mini?: boolean } = {}) {
  return (
    <svg
      viewBox="0 0 800 450"
      className={mini ? "h-full w-full" : "w-full"}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Yellow gradient background */}
      <defs>
        <linearGradient id="crayonsBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5C518" />
          <stop offset="100%" stopColor="#F0B800" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" rx="16" fill="url(#crayonsBg)" />

      {/* Scattered confetti dashes */}
      {[
        { x: 300, y: 80, r: -25 },
        { x: 420, y: 60, r: 15 },
        { x: 180, y: 160, r: 45 },
        { x: 620, y: 140, r: -35 },
        { x: 250, y: 300, r: 20 },
        { x: 550, y: 320, r: -15 },
        { x: 480, y: 380, r: 30 },
      ].map((d, i) => (
        <rect
          key={i}
          x={d.x}
          y={d.y}
          width="32"
          height="7"
          rx="3.5"
          fill="#2EC4F6"
          transform={`rotate(${d.r} ${d.x + 16} ${d.y + 3.5})`}
        />
      ))}

      {/* Light blue/cyan pencil - top center, angled */}
      <g transform="translate(280, 120) rotate(-30)">
        <rect x="0" y="0" width="130" height="18" rx="3" fill="#67E8F9" />
        <polygon points="-16,3 0,0 0,18 -16,15" fill="#22D3EE" />
        <rect x="100" y="0" width="30" height="18" rx="3" fill="#06B6D4" />
      </g>

      {/* Red/coral crayon - right side, angled */}
      <g transform="translate(480, 200) rotate(10)">
        <rect x="0" y="0" width="140" height="24" rx="4" fill="#F87171" />
        <polygon points="-20,5 0,0 0,24 -20,19" fill="#EF4444" />
        <rect
          x="70"
          y="3"
          width="5"
          height="18"
          rx="1.5"
          fill="#FCA5A5"
          opacity="0.5"
        />
        <rect
          x="84"
          y="3"
          width="5"
          height="18"
          rx="1.5"
          fill="#FCA5A5"
          opacity="0.5"
        />
        <rect x="110" y="0" width="30" height="24" rx="4" fill="#DC2626" />
      </g>

      {/* Blue pen - bottom center, angled */}
      <g transform="translate(300, 310) rotate(15)">
        <rect x="0" y="0" width="160" height="18" rx="3" fill="#3B82F6" />
        <polygon points="-16,3 0,0 0,18 -16,15" fill="#2563EB" />
        <rect x="130" y="0" width="30" height="18" rx="3" fill="#1D4ED8" />
      </g>
    </svg>
  )
}

function KudosHammerIllustration({ mini }: { mini?: boolean } = {}) {
  return (
    <svg
      viewBox="0 0 800 450"
      className={mini ? "h-full w-full" : "w-full"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hammerBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5C518" />
          <stop offset="100%" stopColor="#EDBA00" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" rx="16" fill="url(#hammerBg)" />

      {/* White surface / table */}
      <rect
        x="200"
        y="300"
        width="400"
        height="150"
        rx="4"
        fill="white"
        opacity="0.9"
      />

      {/* Green building blocks - back row */}
      <rect x="220" y="230" width="160" height="120" rx="6" fill="#34D399" />
      <rect
        x="220"
        y="230"
        width="160"
        height="120"
        rx="6"
        fill="url(#none)"
        stroke="#10B981"
        strokeWidth="2"
      />
      {/* Block face shading */}
      <rect x="220" y="230" width="160" height="20" rx="6" fill="#6EE7B7" />

      {/* Green building blocks - front row */}
      <rect x="380" y="260" width="180" height="90" rx="6" fill="#4ADE80" />
      <rect x="380" y="260" width="180" height="15" rx="6" fill="#86EFAC" />

      {/* Small green block */}
      <rect x="300" y="190" width="80" height="50" rx="4" fill="#22C55E" />
      <rect x="300" y="190" width="80" height="10" rx="4" fill="#4ADE80" />

      {/* Blue pins/nails */}
      {/* Pin 1 */}
      <g transform="translate(310, 160)">
        <rect x="-3" y="0" width="6" height="40" rx="3" fill="#3B82F6" />
        <circle cx="0" cy="-4" r="10" fill="#3B82F6" />
        <circle cx="0" cy="-4" r="6" fill="#60A5FA" />
      </g>

      {/* Pin 2 */}
      <g transform="translate(460, 210)">
        <rect x="-3" y="0" width="6" height="55" rx="3" fill="#3B82F6" />
        <circle cx="0" cy="-4" r="10" fill="#3B82F6" />
        <circle cx="0" cy="-4" r="6" fill="#60A5FA" />
      </g>

      {/* Loose pin on surface */}
      <g transform="translate(380, 310) rotate(80)">
        <rect x="-2.5" y="0" width="5" height="20" rx="2.5" fill="#3B82F6" />
        <circle cx="0" cy="-3" r="8" fill="#3B82F6" />
        <circle cx="0" cy="-3" r="5" fill="#60A5FA" />
      </g>

      {/* Hammer */}
      <g transform="translate(380, 80) rotate(25)">
        {/* Handle */}
        <rect x="-8" y="30" width="16" height="120" rx="4" fill="#3B82F6" />
        {/* Head */}
        <rect x="-40" y="-10" width="80" height="45" rx="6" fill="#2563EB" />
        {/* Head highlight */}
        <rect
          x="-35"
          y="-5"
          width="70"
          height="8"
          rx="3"
          fill="#60A5FA"
          opacity="0.5"
        />
        {/* Claw */}
        <path
          d="M-40 35 L-40 20 Q-40 10 -30 15"
          fill="none"
          stroke="#1D4ED8"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* Small green leaf/confetti pieces */}
      <g transform="translate(250, 280) rotate(-20)">
        <path d="M0 0 Q5 -8 12 -4 Q8 2 0 0Z" fill="#22C55E" />
      </g>
      <g transform="translate(270, 310) rotate(40)">
        <path d="M0 0 Q5 -8 12 -4 Q8 2 0 0Z" fill="#16A34A" />
      </g>

      {/* Subtle pattern on green blocks */}
      <path
        d="M230 280 Q300 270 370 280"
        fill="none"
        stroke="#10B981"
        strokeWidth="1"
        opacity="0.3"
      />
      <path
        d="M390 300 Q450 290 550 300"
        fill="none"
        stroke="#22C55E"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  )
}
