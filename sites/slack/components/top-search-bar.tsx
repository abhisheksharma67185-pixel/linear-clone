"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  HelpCircle,
  Hash,
  ListFilter,
  Lock,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Channel = {
  id: string
  name: string
  type: "public" | "private"
}

export function TopSearchBar() {
  const router = useRouter()
  const params = useParams<{ channelName?: string }>()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [channels, setChannels] = useState<Channel[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Pull the in-channel context (when the user is viewing /c/<name>) so the
  // first suggestion can be "Search in #<name>" — exactly like real Slack's
  // search palette does.
  const channelName = params?.channelName
  const currentChannel = channels.find((c) => c.name === channelName) ?? null

  useEffect(() => {
    fetch("/api/data/channels")
      .then((r) => r.json())
      .then((d: Channel[]) => setChannels(d))
      .catch(() => {})
  }, [])

  // Click outside to dismiss.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  type Suggestion = {
    icon: React.ReactNode
    label: React.ReactNode
    onSelect: () => void
  }

  const suggestions: Suggestion[] = []
  if (currentChannel) {
    const ChIcon = currentChannel.type === "private" ? Lock : Hash
    suggestions.push({
      icon: <ListFilter className="size-4 text-muted-foreground" />,
      label: (
        <span className="flex items-center gap-1">
          <span className="font-bold text-foreground">Search in</span>
          <ChIcon className="size-3.5 text-foreground" />
          <span className="font-bold text-foreground">
            {currentChannel.name}
          </span>
        </span>
      ),
      onSelect: () => {
        router.push(
          `/search?q=in%3A${encodeURIComponent(currentChannel.name)}+${encodeURIComponent(query.trim())}`
        )
        setOpen(false)
      },
    })
  }
  if (query.trim()) {
    suggestions.push({
      icon: <Search className="size-4 text-muted-foreground" />,
      label: (
        <span>
          <span className="text-muted-foreground">Show results for:</span>{" "}
          <span className="font-semibold text-foreground">
            &quot;{query.trim()}&quot;
          </span>
        </span>
      ),
      onSelect: () => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setOpen(false)
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (!suggestions.length) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault()
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setOpen(false)
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      suggestions[activeIndex]?.onSelect()
    }
  }

  return (
    <div className="relative flex h-11 shrink-0 items-center gap-2 bg-slack-aubergine px-3 text-white">
      <div className="flex w-[calc(16rem-0.75rem)] shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => router.back()}
              >
                <ArrowLeft className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => router.forward()}
              >
                <ArrowRight className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Clock className="size-4" />
              </Button>
            }
          />
          <TooltipContent>History</TooltipContent>
        </Tooltip>
      </div>
      <div
        ref={wrapperRef}
        className="relative mx-auto flex max-w-xl min-w-0 flex-1 items-center"
      >
        {/* When the palette is open we elevate the wrapper so the dropdown
            renders above the page chrome, and we visually replace the
            compact field with a tall white pill that sits in the same row. */}
        <div
          className={cn("relative flex w-full items-center", open && "z-50")}
        >
          <Search
            className={cn(
              "absolute left-2.5 size-4",
              open ? "text-muted-foreground" : "text-white/70"
            )}
          />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you are looking for"
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(
              "h-7 pr-10 pl-8 text-sm focus-visible:ring-0",
              open
                ? "h-10 border-transparent bg-background text-foreground shadow-md placeholder:text-muted-foreground"
                : "border-white/20 bg-white/10 text-white placeholder:text-white/70 focus-visible:border-white/40"
            )}
          />
          {open ? (
            <button
              type="button"
              aria-label="Close search"
              onClick={() => {
                setOpen(false)
                setQuery("")
                inputRef.current?.blur()
              }}
              className="absolute right-2 flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Slack AI search"
              title="Slack AI search"
              onClick={() => {
                inputRef.current?.focus()
                setOpen(true)
              }}
              className="absolute right-1 flex size-6 items-center justify-center rounded bg-gradient-to-br from-pink-400 to-purple-500 text-white hover:opacity-90"
            >
              <Sparkles className="size-3.5" />
            </button>
          )}
        </div>

        {open ? (
          <div
            role="listbox"
            className="absolute top-10 right-0 left-0 z-50 overflow-hidden rounded-md bg-background text-foreground shadow-2xl ring-1 ring-border"
          >
            {suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Start typing to search…
              </div>
            ) : (
              <ul className="py-1">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => s.onSelect()}
                      className={cn(
                        "flex w-full items-center gap-2 px-4 py-2 text-left text-sm",
                        i === activeIndex
                          ? "bg-blue-600 text-white"
                          : "hover:bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0",
                          i === activeIndex && "[&_*]:!text-white"
                        )}
                      >
                        {s.icon}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate",
                          i === activeIndex && "[&_*]:!text-white"
                        )}
                      >
                        {s.label}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                          i === activeIndex
                            ? "border-white/40 text-white"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        Enter
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between border-t border-border bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Kbd className="h-4 px-1 text-[10px]">↑</Kbd>
                  <Kbd className="h-4 px-1 text-[10px]">↓</Kbd>
                  <span>Select</span>
                </span>
                {suggestions.length > 0 ? (
                  <>
                    <span className="flex items-center gap-1">
                      <Kbd className="h-4 px-1 text-[10px]">Enter</Kbd>
                      <span>Open</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Kbd className="h-4 px-1 text-[10px]">Tab</Kbd>
                      <span>Actions</span>
                    </span>
                  </>
                ) : null}
              </div>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="font-medium text-blue-600 hover:underline"
              >
                Give feedback
              </a>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex w-28 shrink-0 justify-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <HelpCircle className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Help</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
