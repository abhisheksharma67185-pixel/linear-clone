"use client"

import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ComponentType,
} from "react"
import {
  Cherry,
  Clock,
  Flag,
  Hash,
  Lightbulb,
  Plane,
  Search,
  Smile,
  Sparkles,
  Trees,
  Trophy,
  X,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Emoji catalog — extended to ~10 categories matching real Slack's picker.
// Order = render order. The first category is the synthetic "Frequently
// Used" set so it always appears first.
type EmojiItem = { code: string; char: string }
type Category = {
  id: string
  label: string
  // The icon used in the category-tab strip at the top of the picker.
  icon: ComponentType<{ className?: string }>
  items: EmojiItem[]
}

const CATEGORIES: Category[] = [
  {
    id: "frequent",
    label: "Frequently Used",
    icon: Clock,
    items: [
      { code: ":raised_hands:", char: "🙌" },
      { code: ":heart:", char: "❤️" },
      { code: ":eyes:", char: "👀" },
      { code: ":+1:", char: "👍" },
      { code: ":white_check_mark:", char: "✅" },
      { code: ":tada:", char: "🎉" },
      { code: ":fire:", char: "🔥" },
      { code: ":pray:", char: "🙏" },
    ],
  },
  {
    id: "smileys",
    label: "Smileys & People",
    icon: Smile,
    items: [
      { code: ":grinning:", char: "😀" },
      { code: ":smile:", char: "😄" },
      { code: ":joy:", char: "😂" },
      { code: ":laughing:", char: "😆" },
      { code: ":sweat_smile:", char: "😅" },
      { code: ":wink:", char: "😉" },
      { code: ":blush:", char: "😊" },
      { code: ":heart_eyes:", char: "😍" },
      { code: ":thinking_face:", char: "🤔" },
      { code: ":sob:", char: "😭" },
      { code: ":sleepy:", char: "😪" },
      { code: ":sunglasses:", char: "😎" },
      { code: ":nerd:", char: "🤓" },
      { code: ":zany:", char: "🤪" },
      { code: ":exploding_head:", char: "🤯" },
      { code: ":100:", char: "💯" },
      { code: ":wave:", char: "👋" },
      { code: ":raised_hand:", char: "✋" },
      { code: ":clap:", char: "👏" },
      { code: ":-1:", char: "👎" },
      { code: ":muscle:", char: "💪" },
      { code: ":ok_hand:", char: "👌" },
      { code: ":point_up:", char: "☝️" },
      { code: ":point_right:", char: "👉" },
    ],
  },
  {
    id: "nature",
    label: "Animals & Nature",
    icon: Trees,
    items: [
      { code: ":dog:", char: "🐶" },
      { code: ":cat:", char: "🐱" },
      { code: ":mouse:", char: "🐭" },
      { code: ":fox:", char: "🦊" },
      { code: ":bear:", char: "🐻" },
      { code: ":panda:", char: "🐼" },
      { code: ":octopus:", char: "🐙" },
      { code: ":whale:", char: "🐳" },
      { code: ":herb:", char: "🌿" },
      { code: ":palm_tree:", char: "🌴" },
      { code: ":sunflower:", char: "🌻" },
      { code: ":leaves:", char: "🍃" },
      { code: ":sunny:", char: "☀️" },
      { code: ":crescent_moon:", char: "🌙" },
      { code: ":zap:", char: "⚡" },
      { code: ":snowflake:", char: "❄️" },
    ],
  },
  {
    id: "food",
    label: "Food & Drink",
    icon: Cherry,
    items: [
      { code: ":pizza:", char: "🍕" },
      { code: ":hamburger:", char: "🍔" },
      { code: ":fries:", char: "🍟" },
      { code: ":sushi:", char: "🍣" },
      { code: ":ramen:", char: "🍜" },
      { code: ":taco:", char: "🌮" },
      { code: ":bread:", char: "🍞" },
      { code: ":cheese:", char: "🧀" },
      { code: ":apple:", char: "🍎" },
      { code: ":banana:", char: "🍌" },
      { code: ":cherries:", char: "🍒" },
      { code: ":coffee:", char: "☕" },
      { code: ":beer:", char: "🍺" },
      { code: ":wine_glass:", char: "🍷" },
      { code: ":cake:", char: "🍰" },
      { code: ":doughnut:", char: "🍩" },
    ],
  },
  {
    id: "travel",
    label: "Travel & Places",
    icon: Plane,
    items: [
      { code: ":airplane:", char: "✈️" },
      { code: ":car:", char: "🚗" },
      { code: ":train:", char: "🚆" },
      { code: ":rocket:", char: "🚀" },
      { code: ":ship:", char: "🚢" },
      { code: ":bike:", char: "🚲" },
      { code: ":beach_with_umbrella:", char: "🏖️" },
      { code: ":mountain:", char: "⛰️" },
      { code: ":city_sunset:", char: "🌆" },
      { code: ":statue_of_liberty:", char: "🗽" },
      { code: ":house_with_garden:", char: "🏡" },
      { code: ":office:", char: "🏢" },
      { code: ":school:", char: "🏫" },
      { code: ":hospital:", char: "🏥" },
    ],
  },
  {
    id: "activities",
    label: "Activities",
    icon: Trophy,
    items: [
      { code: ":soccer:", char: "⚽" },
      { code: ":basketball:", char: "🏀" },
      { code: ":football:", char: "🏈" },
      { code: ":tennis:", char: "🎾" },
      { code: ":trophy:", char: "🏆" },
      { code: ":medal:", char: "🥇" },
      { code: ":running:", char: "🏃" },
      { code: ":swimmer:", char: "🏊" },
      { code: ":weight_lifter:", char: "🏋️" },
      { code: ":art:", char: "🎨" },
      { code: ":musical_note:", char: "🎵" },
      { code: ":headphones:", char: "🎧" },
      { code: ":video_game:", char: "🎮" },
      { code: ":dart:", char: "🎯" },
    ],
  },
  {
    id: "objects",
    label: "Objects",
    icon: Lightbulb,
    items: [
      { code: ":bulb:", char: "💡" },
      { code: ":sparkles:", char: "✨" },
      { code: ":pushpin:", char: "📌" },
      { code: ":bookmark:", char: "🔖" },
      { code: ":book:", char: "📖" },
      { code: ":notebook:", char: "📓" },
      { code: ":kanban:", char: "📋" },
      { code: ":shield:", char: "🛡️" },
      { code: ":lock:", char: "🔒" },
      { code: ":key:", char: "🔑" },
      { code: ":bell:", char: "🔔" },
      { code: ":mailbox:", char: "📬" },
      { code: ":phone:", char: "📱" },
      { code: ":computer:", char: "💻" },
      { code: ":briefcase:", char: "💼" },
      { code: ":money_bag:", char: "💰" },
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: Hash,
    items: [
      { code: ":warning:", char: "⚠️" },
      { code: ":no_entry:", char: "⛔" },
      { code: ":x:", char: "❌" },
      { code: ":heavy_check_mark:", char: "✔️" },
      { code: ":bangbang:", char: "‼️" },
      { code: ":question:", char: "❓" },
      { code: ":exclamation:", char: "❗" },
      { code: ":heart_red:", char: "❤️" },
      { code: ":blue_heart:", char: "💙" },
      { code: ":green_heart:", char: "💚" },
      { code: ":yellow_heart:", char: "💛" },
      { code: ":purple_heart:", char: "💜" },
      { code: ":broken_heart:", char: "💔" },
      { code: ":star:", char: "⭐" },
    ],
  },
  {
    id: "flags",
    label: "Flags",
    icon: Flag,
    items: [
      { code: ":flag_us:", char: "🇺🇸" },
      { code: ":flag_in:", char: "🇮🇳" },
      { code: ":flag_gb:", char: "🇬🇧" },
      { code: ":flag_jp:", char: "🇯🇵" },
      { code: ":flag_de:", char: "🇩🇪" },
      { code: ":flag_fr:", char: "🇫🇷" },
      { code: ":flag_br:", char: "🇧🇷" },
      { code: ":flag_au:", char: "🇦🇺" },
      { code: ":flag_ca:", char: "🇨🇦" },
      { code: ":pirate_flag:", char: "🏴‍☠️" },
      { code: ":rainbow_flag:", char: "🏳️‍🌈" },
      { code: ":checkered_flag:", char: "🏁" },
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
  const scrollRef = useRef<HTMLDivElement>(null)

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

  // Click a category icon to scroll its section into view.
  const scrollToCategory = (id: string) => {
    const el = scrollRef.current?.querySelector(`[data-category="${id}"]`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={children as React.ReactElement} />
      <PopoverContent
        align={align}
        className="w-80 max-w-[90vw] p-0"
        sideOffset={6}
      >
        {/* Category icon strip — clicking jumps to that section. */}
        <div className="flex items-center gap-0.5 border-b border-border px-1.5 py-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToCategory(cat.id)}
                title={cat.label}
                aria-label={cat.label}
                className="group flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-4" />
              </button>
            )
          })}
        </div>

        {/* Search input. */}
        <div className="relative border-b border-border p-2">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all emoji"
            className="h-8 w-full rounded-md border border-border bg-background pr-2 pl-8 text-sm outline-none focus-visible:border-primary"
          />
        </div>

        {/* Slackbot promo (decorative, dismissible) */}
        <SlackbotPromo />

        <div ref={scrollRef} className="max-h-72 overflow-y-auto p-2">
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
              <div
                key={cat.id}
                data-category={cat.id}
                className="mb-3 last:mb-0"
              >
                <div className="mb-1 px-1 text-xs font-semibold text-foreground">
                  {cat.label}
                </div>
                <EmojiGrid items={cat.items} onPick={handlePick} />
              </div>
            ))
          )}
        </div>

        {/* Footer — Add Emoji + skin tone (decorative) */}
        <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
          <button
            type="button"
            className="rounded-md border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
          >
            Add Emoji
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
            aria-label="Choose skin tone"
            title="Skin Tone"
          >
            <span className="text-base leading-none">✋</span>
            Skin Tone
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function EmojiGrid({
  items,
  onPick,
}: {
  items: EmojiItem[]
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

// Tiny dismissible banner — promo for custom emojis. Real Slack uses this
// space to push workspace branding; we keep it visually accurate.
function SlackbotPromo() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="flex items-center gap-2 border-b border-border bg-accent/40 px-2 py-1.5">
      <Sparkles className="size-3.5 shrink-0 text-primary" />
      <span className="flex-1 text-[11px] font-medium">
        Slackbot emojis for your team
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
