"use client"

import { SmilePlus } from "lucide-react"
import { cn } from "@/lib/utils"

type Reaction = { emoji: string; userIds: string[] }

const EMOJI_MAP: Record<string, string> = {
  ":+1:": "👍",
  ":-1:": "👎",
  ":tada:": "🎉",
  ":fire:": "🔥",
  ":eyes:": "👀",
  ":rocket:": "🚀",
  ":white_check_mark:": "✅",
  ":thinking_face:": "🤔",
  ":heart:": "❤️",
  ":pushpin:": "📌",
  ":art:": "🎨",
  ":wave:": "👋",
  ":raised_hands:": "🙌",
  ":raised_hand:": "✋",
  ":shield:": "🛡️",
  ":coffee:": "☕",
  ":pizza:": "🍕",
  ":ramen:": "🍜",
  ":running:": "🏃",
  ":beach_with_umbrella:": "🏖️",
  ":herb:": "🌿",
  ":palm_tree:": "🌴",
  ":house_with_garden:": "🏡",
  ":headphones:": "🎧",
  ":laughing:": "😂",
  ":dog:": "🐶",
  ":octocat:": "🐙",
  ":book:": "📖",
  ":notebook:": "📓",
  ":kanban:": "📋",
  ":bookmark:": "🔖",
}

export function emojiFor(shortcode: string): string {
  return EMOJI_MAP[shortcode] ?? shortcode.replace(/:/g, "")
}

export function ReactionBar({
  reactions,
  currentUserId,
  onToggle,
  onAdd,
}: {
  reactions: Reaction[]
  currentUserId: string
  onToggle: (emoji: string) => void
  onAdd: () => void
}) {
  if (reactions.length === 0) return null
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {reactions.map((r) => {
        const mine = r.userIds.includes(currentUserId)
        return (
          <button
            key={r.emoji}
            type="button"
            onClick={() => onToggle(r.emoji)}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
              mine
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary hover:border-primary/30 hover:bg-secondary/80"
            )}
          >
            <span>{emojiFor(r.emoji)}</span>
            <span className="font-semibold">{r.userIds.length}</span>
          </button>
        )
      })}
      <button
        type="button"
        onClick={onAdd}
        className="flex size-6 items-center justify-center rounded-full border border-transparent text-muted-foreground hover:border-border hover:bg-secondary"
        aria-label="Add reaction"
      >
        <SmilePlus className="size-3.5" />
      </button>
    </div>
  )
}
