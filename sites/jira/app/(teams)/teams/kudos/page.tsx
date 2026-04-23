"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const people = [
  { name: "Sam Williams", initials: "SW" },
  { name: "Jordan Lee", initials: "JL" },
  { name: "Taylor Brown", initials: "TB" },
  { name: "Priya Patel", initials: "PP" },
  { name: "Engineering Team", initials: "ET" },
  { name: "Ravi Kumar", initials: "RK" },
  { name: "Liam Chen", initials: "LC" },
]

const BADGES = [
  { key: "hammer", label: "Ship It", emoji: "🔨" },
  { key: "heart", label: "Team Player", emoji: "💛" },
  { key: "crayons", label: "Creative", emoji: "🖍️" },
  { key: "rocket", label: "Above & Beyond", emoji: "🚀" },
  { key: "brain", label: "Problem Solver", emoji: "🧠" },
  { key: "star", label: "Star", emoji: "⭐" },
]

// "to.kind" is 'team' for team kudos (green left border), 'peer' for peer kudos (yellow left border)
const initialKudos = [
  {
    id: "k-1",
    from: { name: "Abhishek Sharma", initials: "AS" },
    to: { name: "Sam Williams", initials: "SW", kind: "peer" as const },
    message:
      "Amazing work on the sprint board! The drag-and-drop is super smooth now.",
    card: "hammer",
    createdAt: "2026-03-12T10:00:00.000Z",
    reactions: [
      { emoji: "🎉", count: 2 },
      { emoji: "👏", count: 1 },
    ],
  },
  {
    id: "k-2",
    from: { name: "Jordan Lee", initials: "JL" },
    to: { name: "Abhishek Sharma", initials: "AS", kind: "peer" as const },
    message:
      "Thanks for helping debug the authentication flow — saved us hours!",
    card: "heart",
    createdAt: "2026-03-14T14:30:00.000Z",
    reactions: [
      { emoji: "❤️", count: 4 },
      { emoji: "🙏", count: 1 },
    ],
  },
  {
    id: "k-3",
    from: { name: "Taylor Brown", initials: "TB" },
    to: { name: "Engineering Team", initials: "ET", kind: "team" as const },
    message:
      "Great collaboration on the release! Everyone pulled together to ship on time.",
    card: "crayons",
    createdAt: "2026-03-14T09:00:00.000Z",
    reactions: [
      { emoji: "🚀", count: 5 },
      { emoji: "🎉", count: 3 },
    ],
  },
  {
    id: "k-4",
    from: { name: "Sam Williams", initials: "SW" },
    to: { name: "Jordan Lee", initials: "JL", kind: "peer" as const },
    message:
      "Your code review feedback is always thorough and constructive. Really appreciate it!",
    card: "heart",
    createdAt: "2026-03-10T16:00:00.000Z",
    reactions: [] as { emoji: string; count: number }[],
  },
]

const CARD_COLORS: Record<string, string> = {
  hammer: "from-orange-400 to-amber-300",
  heart: "from-yellow-400 to-yellow-300",
  crayons: "from-green-400 to-emerald-300",
  rocket: "from-blue-400 to-indigo-300",
  brain: "from-purple-400 to-violet-300",
  star: "from-pink-400 to-rose-300",
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

const EMOJI_PICKER = [
  "❤️",
  "🙏",
  "🎉",
  "🔥",
  "👏",
  "🚀",
  "💪",
  "🙌",
  "⭐",
  "👍",
]
export default function KudosPage() {
  const [tab, setTab] = useState<"all" | "received" | "given">("all")
  const [kudos, setKudos] = useState(initialKudos)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [emojiPickerForKudo, setEmojiPickerForKudo] = useState<string | null>(
    null
  )

  const addReaction = (kudoId: string, emoji: string) => {
    setKudos((prev) =>
      prev.map((k) => {
        if (k.id !== kudoId) return k
        const existing = k.reactions.find((r) => r.emoji === emoji)
        if (existing) {
          return {
            ...k,
            reactions: k.reactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            ),
          }
        }
        return { ...k, reactions: [...k.reactions, { emoji, count: 1 }] }
      })
    )
  }
  const toggleReaction = (kudoId: string, emoji: string) => {
    setKudos((prev) =>
      prev.map((k) => {
        if (k.id !== kudoId) return k
        const existing = k.reactions.find((r) => r.emoji === emoji)
        if (!existing) return k
        // Toggle: if count > 1 decrement; if 1 remove
        if (existing.count <= 1)
          return {
            ...k,
            reactions: k.reactions.filter((r) => r.emoji !== emoji),
          }
        return {
          ...k,
          reactions: k.reactions.map((r) =>
            r.emoji === emoji ? { ...r, count: r.count - 1 } : r
          ),
        }
      })
    )
  }

  // Modal form state
  const [recipientSearch, setRecipientSearch] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState<{
    name: string
    initials: string
  } | null>(null)
  const [message, setMessage] = useState("")
  const [selectedBadge, setSelectedBadge] = useState("hammer")
  const [recipientDropOpen, setRecipientDropOpen] = useState(false)
  const recipientRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const closeModal = () => {
    setModalOpen(false)
    setRecipientSearch("")
    setSelectedRecipient(null)
    setMessage("")
    setSelectedBadge("hammer")
    setRecipientDropOpen(false)
  }

  useEffect(() => {
    if (!modalOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [modalOpen])

  useEffect(() => {
    if (!recipientDropOpen) return
    const handler = (e: MouseEvent) => {
      if (
        recipientRef.current &&
        !recipientRef.current.contains(e.target as Node)
      )
        setRecipientDropOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [recipientDropOpen])

  const handleSend = () => {
    if (!selectedRecipient || !message.trim()) return
    setKudos((prev) => [
      {
        id: `k-${Date.now()}`,
        from: { name: "Abhishek Sharma", initials: "AS" },
        to: { ...selectedRecipient, kind: "peer" as const },
        message: message.trim(),
        card: selectedBadge,
        createdAt: new Date().toISOString(),
        reactions: [] as { emoji: string; count: number }[],
      },
      ...prev,
    ])
    closeModal()
    showToast("Kudos sent!")
  }

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(recipientSearch.toLowerCase())
  )

  const filtered =
    tab === "received"
      ? kudos.filter((k) => k.to.name === "Abhishek Sharma")
      : tab === "given"
        ? kudos.filter((k) => k.from.name === "Abhishek Sharma")
        : kudos

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[10000] flex animate-in items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg fade-in slide-in-from-top-2">
          <svg
            className="size-4 shrink-0 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {toast}
        </div>
      )}

      {/* Give Kudos Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            className="w-full max-w-md rounded-lg border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Give kudos</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Recognize a teammate for their great work.
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              {/* Recipient */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  To <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={recipientRef}>
                  {selectedRecipient ? (
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="bg-blue-100 text-[9px] text-blue-700">
                          {selectedRecipient.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm">
                        {selectedRecipient.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecipient(null)
                          setRecipientSearch("")
                        }}
                        className="text-muted-foreground hover:text-foreground"
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
                  ) : (
                    <input
                      type="text"
                      autoFocus
                      value={recipientSearch}
                      onChange={(e) => {
                        setRecipientSearch(e.target.value)
                        setRecipientDropOpen(true)
                      }}
                      onFocus={() => setRecipientDropOpen(true)}
                      placeholder="Search people or teams..."
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                    />
                  )}
                  {recipientDropOpen && !selectedRecipient && (
                    <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                      {filteredPeople.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No results
                        </p>
                      ) : (
                        filteredPeople.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setSelectedRecipient(p)
                              setRecipientSearch("")
                              setRecipientDropOpen(false)
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                          >
                            <Avatar className="size-6">
                              <AvatarFallback className="bg-blue-100 text-[9px] text-blue-700">
                                {p.initials}
                              </AvatarFallback>
                            </Avatar>
                            {p.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="What did they do that was awesome?"
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Badge selector */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Badge
                </label>
                <div className="flex flex-wrap gap-2">
                  {BADGES.map((b) => (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setSelectedBadge(b.key)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedBadge === b.key
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                          : "hover:bg-accent"
                      }`}
                    >
                      <span>{b.emoji}</span>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!selectedRecipient || !message.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kudos</h1>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setModalOpen(true)}
        >
          <svg
            className="mr-1.5 size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Give kudos
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b">
        {(
          [
            { key: "all", label: "All" },
            { key: "received", label: "Received" },
            { key: "given", label: "Given" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Kudos feed */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <svg
            className="mb-4 size-16 text-muted-foreground/30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="text-sm font-medium">No kudos yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {tab === "given"
              ? "You haven't given any kudos yet."
              : "No kudos received yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((kudo) => {
            const borderColor =
              kudo.to.kind === "team"
                ? "border-l-4 border-l-green-400"
                : "border-l-4 border-l-yellow-400"
            const hasReactions = kudo.reactions.length > 0
            const addBtnClass = hasReactions
              ? "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
              : // When no reactions, only show Add on hover
                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent transition-colors opacity-0 group-hover/kudo:opacity-100"
            return (
              <div
                key={kudo.id}
                className={`group/kudo overflow-hidden rounded-xl border ${borderColor} relative`}
              >
                {/* Card gradient banner */}
                <div
                  className={`h-2 bg-gradient-to-r ${CARD_COLORS[kudo.card] ?? CARD_COLORS.hammer}`}
                />

                <div className="p-4">
                  {/* From → To */}
                  <div className="mb-3 flex items-center gap-2">
                    <button
                      onClick={() =>
                        showToast(`Viewing ${kudo.from.name}'s profile`)
                      }
                      className="flex items-center gap-2"
                    >
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-blue-100 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {kudo.from.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hover:text-blue-600 hover:underline">
                        {kudo.from.name}
                      </span>
                    </button>
                    <svg
                      className="size-3.5 text-muted-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <button
                      onClick={() => {
                        const msg =
                          kudo.to.kind === "team"
                            ? `Viewing ${kudo.to.name}`
                            : `Viewing ${kudo.to.name}'s profile`
                        showToast(msg)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-green-100 text-[10px] text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          {kudo.to.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hover:text-blue-600 hover:underline">
                        {kudo.to.name}
                      </span>
                    </button>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {timeAgo(kudo.createdAt)}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="mb-3 text-sm text-foreground">{kudo.message}</p>

                  {/* Reactions */}
                  <div className="relative flex items-center gap-2">
                    {kudo.reactions.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => toggleReaction(kudo.id, r.emoji)}
                        className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors hover:bg-accent"
                      >
                        <span>{r.emoji}</span>
                        <span className="text-muted-foreground">{r.count}</span>
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setEmojiPickerForKudo(
                          emojiPickerForKudo === kudo.id ? null : kudo.id
                        )
                      }
                      className={addBtnClass}
                    >
                      <svg
                        className="size-3"
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
                      Add
                    </button>
                    {emojiPickerForKudo === kudo.id && (
                      <div className="absolute top-full left-0 z-50 mt-1 flex gap-1 rounded-lg border bg-popover p-2 shadow-lg">
                        {EMOJI_PICKER.map((e) => (
                          <button
                            key={e}
                            onClick={() => {
                              addReaction(kudo.id, e)
                              setEmojiPickerForKudo(null)
                            }}
                            className="rounded p-1 text-lg hover:bg-accent"
                          >
                            {e}
                          </button>
                        ))}
                        <button
                          onClick={() => setEmojiPickerForKudo(null)}
                          className="rounded p-1 text-muted-foreground hover:bg-accent"
                          title="Close"
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
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
