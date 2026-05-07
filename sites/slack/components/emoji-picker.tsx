"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Emoji catalog — extends the smaller list in reaction-bar.tsx so the picker
// has enough variety to feel real. Keep entries grouped roughly by category;
// the order here is the order the picker shows.
const CATEGORIES: { label: string; items: { code: string; char: string }[] }[] =
  [
    {
      label: "Frequently used",
      items: [
        { code: ":+1:", char: "👍" },
        { code: ":heart:", char: "❤️" },
        { code: ":tada:", char: "🎉" },
        { code: ":fire:", char: "🔥" },
        { code: ":eyes:", char: "👀" },
        { code: ":white_check_mark:", char: "✅" },
        { code: ":pray:", char: "🙏" },
        { code: ":raised_hands:", char: "🙌" },
      ],
    },
    {
      label: "Smileys & people",
      items: [
        { code: ":smile:", char: "😄" },
        { code: ":laughing:", char: "😂" },
        { code: ":sob:", char: "😭" },
        { code: ":thinking_face:", char: "🤔" },
        { code: ":wink:", char: "😉" },
        { code: ":heart_eyes:", char: "😍" },
        { code: ":sweat_smile:", char: "😅" },
        { code: ":100:", char: "💯" },
        { code: ":wave:", char: "👋" },
        { code: ":raised_hand:", char: "✋" },
        { code: ":clap:", char: "👏" },
        { code: ":-1:", char: "👎" },
        { code: ":muscle:", char: "💪" },
        { code: ":ok_hand:", char: "👌" },
        { code: ":point_up:", char: "☝️" },
        { code: ":running:", char: "🏃" },
      ],
    },
    {
      label: "Objects & symbols",
      items: [
        { code: ":rocket:", char: "🚀" },
        { code: ":bulb:", char: "💡" },
        { code: ":warning:", char: "⚠️" },
        { code: ":no_entry:", char: "⛔" },
        { code: ":x:", char: "❌" },
        { code: ":sparkles:", char: "✨" },
        { code: ":pushpin:", char: "📌" },
        { code: ":bookmark:", char: "🔖" },
        { code: ":book:", char: "📖" },
        { code: ":notebook:", char: "📓" },
        { code: ":kanban:", char: "📋" },
        { code: ":shield:", char: "🛡️" },
        { code: ":coffee:", char: "☕" },
        { code: ":pizza:", char: "🍕" },
        { code: ":ramen:", char: "🍜" },
        { code: ":art:", char: "🎨" },
        { code: ":headphones:", char: "🎧" },
      ],
    },
    {
      label: "Nature & places",
      items: [
        { code: ":herb:", char: "🌿" },
        { code: ":palm_tree:", char: "🌴" },
        { code: ":beach_with_umbrella:", char: "🏖️" },
        { code: ":house_with_garden:", char: "🏡" },
        { code: ":dog:", char: "🐶" },
        { code: ":octocat:", char: "🐙" },
        { code: ":sunny:", char: "☀️" },
        { code: ":zap:", char: "⚡" },
      ],
    },
  ]

const ALL_EMOJIS = CATEGORIES.flatMap((c) => c.items)

export function EmojiPicker({
  children,
  onSelect,
  align = "start",
}: {
  children: ReactNode // the trigger element
  onSelect: (shortcode: string) => void
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return ALL_EMOJIS.filter((e) =>
      e.code.toLowerCase().includes(q.replace(/:/g, ""))
    )
  }, [query])

  const handlePick = (code: string) => {
    onSelect(code)
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children as React.ReactElement} />
      <PopoverContent
        align={align}
        className="w-72 max-w-[90vw] p-0"
        sideOffset={6}
      >
        <div className="border-b border-border p-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emoji"
            className="h-8 text-sm"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered ? (
            filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                No emoji match &ldquo;{query}&rdquo;
              </p>
            ) : (
              <EmojiGrid items={filtered} onPick={handlePick} />
            )
          ) : (
            CATEGORIES.map((cat) => (
              <div key={cat.label} className="mb-3 last:mb-0">
                <div className="mb-1 px-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {cat.label}
                </div>
                <EmojiGrid items={cat.items} onPick={handlePick} />
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function EmojiGrid({
  items,
  onPick,
}: {
  items: { code: string; char: string }[]
  onPick: (code: string) => void
}) {
  return (
    <div
      className={cn(
        "grid gap-0.5",
        "grid-cols-[repeat(auto-fill,minmax(2rem,1fr))]"
      )}
    >
      {items.map((e) => (
        <button
          key={e.code}
          type="button"
          onClick={() => onPick(e.code)}
          title={e.code}
          className="flex aspect-square items-center justify-center rounded text-lg hover:bg-accent"
        >
          {e.char}
        </button>
      ))}
    </div>
  )
}
