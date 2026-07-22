"use client"

/**
 * Cmd+K command palette — Linear-style modal that lets the user search
 * across navigation items, issues, and members without leaving the
 * keyboard.
 *
 * Opens when the global `OPEN_COMMAND_PALETTE_EVENT` fires (dispatched by
 * KeyboardShortcuts on ⌘K / Ctrl+K).
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  TaskEdit01Icon,
  CheckListIcon,
  InboxIcon,
  CubeIcon,
  Contact02Icon,
  Settings02Icon,
  Layers01Icon,
  ArrowReloadHorizontalIcon,
} from "@hugeicons/core-free-icons"
import { OPEN_COMMAND_PALETTE_EVENT } from "@/components/keyboard-shortcuts"
import type { IconSvgElement } from "@hugeicons/react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavItem {
  kind: "nav"
  id: string
  label: string
  href: string
  icon: IconSvgElement
}

interface IssueItem {
  kind: "issue"
  id: string
  identifier: string
  title: string
  href: string
}

interface MemberItem {
  kind: "member"
  id: string
  name: string
  avatar: string
  href: string
}

type ResultItem = NavItem | IssueItem | MemberItem

// ---------------------------------------------------------------------------
// Static nav items (always shown at top when query is empty)
// ---------------------------------------------------------------------------

const NAV_ITEMS: NavItem[] = [
  {
    kind: "nav",
    id: "issues",
    label: "Issues",
    href: "/issues",
    icon: TaskEdit01Icon,
  },
  {
    kind: "nav",
    id: "my-issues",
    label: "My Issues",
    href: "/my-issues",
    icon: CheckListIcon,
  },
  {
    kind: "nav",
    id: "inbox",
    label: "Inbox",
    href: "/inbox",
    icon: InboxIcon,
  },
  {
    kind: "nav",
    id: "projects",
    label: "Projects",
    href: "/projects",
    icon: CubeIcon,
  },
  {
    kind: "nav",
    id: "teams",
    label: "Teams",
    href: "/teams",
    icon: Contact02Icon,
  },
  {
    kind: "nav",
    id: "views",
    label: "Views",
    href: "/views",
    icon: Layers01Icon,
  },
  {
    kind: "nav",
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings02Icon,
  },
]

// ---------------------------------------------------------------------------
// Helper — initial avatar letter from name
// ---------------------------------------------------------------------------

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// ---------------------------------------------------------------------------
// Row sub-components (defined outside CommandPalette to avoid re-creating
// them on every render, which the react/no-unstable-nested-components rule
// flags as an error).
// ---------------------------------------------------------------------------

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground px-4 py-1.5 text-[11px] font-medium tracking-wide uppercase">
      {label}
    </div>
  )
}

function NavRow({
  item,
  index,
  selected,
  onActivate,
  onHover,
}: {
  item: NavItem
  index: number
  selected: boolean
  onActivate: (item: ResultItem) => void
  onHover: (index: number) => void
}) {
  return (
    <button
      type="button"
      data-cmd-index={index}
      onClick={() => onActivate(item)}
      onMouseEnter={() => onHover(index)}
      className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
        selected ? "bg-accent" : "hover:bg-accent/50"
      }`}
    >
      <HugeiconsIcon
        icon={item.icon}
        className="text-muted-foreground size-4 shrink-0"
      />
      <span>{item.label}</span>
    </button>
  )
}

function IssueRow({
  item,
  index,
  selected,
  onActivate,
  onHover,
}: {
  item: IssueItem
  index: number
  selected: boolean
  onActivate: (item: ResultItem) => void
  onHover: (index: number) => void
}) {
  return (
    <button
      type="button"
      data-cmd-index={index}
      onClick={() => onActivate(item)}
      onMouseEnter={() => onHover(index)}
      className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
        selected ? "bg-accent" : "hover:bg-accent/50"
      }`}
    >
      <span className="text-muted-foreground w-14 shrink-0 font-mono text-xs">
        {item.identifier}
      </span>
      <span className="truncate">{item.title}</span>
    </button>
  )
}

function MemberRow({
  item,
  index,
  selected,
  onActivate,
  onHover,
}: {
  item: MemberItem
  index: number
  selected: boolean
  onActivate: (item: ResultItem) => void
  onHover: (index: number) => void
}) {
  return (
    <button
      type="button"
      data-cmd-index={index}
      onClick={() => onActivate(item)}
      onMouseEnter={() => onHover(index)}
      className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
        selected ? "bg-accent" : "hover:bg-accent/50"
      }`}
    >
      {/* Avatar */}
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-semibold text-white">
        {initials(item.name)}
      </span>
      <span>{item.name}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Remote data fetched once on mount
  const [issues, setIssues] = useState<IssueItem[]>([])
  const [members, setMembers] = useState<MemberItem[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Fetch issues and members once
  useEffect(() => {
    fetch("/api/data/issues")
      .then((r) => r.json())
      .then(
        (data: Array<{ id: string; identifier: string; title: string }>) => {
          setIssues(
            data.map((iss) => ({
              kind: "issue" as const,
              id: iss.id,
              identifier: iss.identifier,
              title: iss.title,
              href: `/issues/${iss.identifier.toLowerCase()}`,
            }))
          )
        }
      )
      .catch(() => {})

    fetch("/api/data/members")
      .then((r) => r.json())
      .then((data: Array<{ id: string; name: string; avatar?: string }>) => {
        setMembers(
          data.map((m) => ({
            kind: "member" as const,
            id: m.id,
            name: m.name,
            avatar: m.avatar ?? "",
            href: `/settings?section=members`,
          }))
        )
      })
      .catch(() => {})
  }, [])

  // Listen for open event
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handler)
    return () => window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handler)
  }, [])

  // Focus input when dialog opens; reset state on close
  useEffect(() => {
    if (open) {
      // Defer focus so Base UI's dialog animation completes
      const id = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(id)
    } else {
      /* eslint-disable react-hooks/set-state-in-effect */
      setQuery("")
      setSelectedIndex(0)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open])

  // ---------------------------------------------------------------------------
  // Filtered results
  // ---------------------------------------------------------------------------

  const results = useCallback((): {
    nav: NavItem[]
    issueResults: IssueItem[]
    memberResults: MemberItem[]
  } => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return { nav: NAV_ITEMS, issueResults: [], memberResults: [] }
    }
    const nav = NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(q))
    const issueResults = issues
      .filter(
        (iss) =>
          iss.title.toLowerCase().includes(q) ||
          iss.identifier.toLowerCase().includes(q)
      )
      .slice(0, 10)
    const memberResults = members
      .filter((m) => m.name.toLowerCase().includes(q))
      .slice(0, 5)
    return { nav, issueResults, memberResults }
  }, [query, issues, members])

  const { nav, issueResults, memberResults } = results()

  // Flat list for keyboard navigation
  const flatResults: ResultItem[] = [...nav, ...issueResults, ...memberResults]
  const totalCount = flatResults.length

  // Keep selectedIndex in bounds when results change
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSelectedIndex((prev) => Math.min(prev, Math.max(0, totalCount - 1)))
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [totalCount])

  // Scroll selected row into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-cmd-index="${selectedIndex}"]`
    )
    el?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  // ---------------------------------------------------------------------------
  // Keyboard navigation inside the input
  // ---------------------------------------------------------------------------

  const activate = useCallback(
    (item: ResultItem) => {
      setOpen(false)
      router.push(item.href)
    },
    [router]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalCount))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev <= 0 ? Math.max(0, totalCount - 1) : prev - 1
      )
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = flatResults[selectedIndex]
      if (item) activate(item)
    }
  }

  const showNavGroup = nav.length > 0
  const showIssuesGroup = issueResults.length > 0
  const showMembersGroup = memberResults.length > 0
  const hasResults = totalCount > 0

  // Build cumulative offsets for correct flat index calculation
  const issueOffset = nav.length
  const memberOffset = nav.length + issueResults.length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="flex max-w-[560px] flex-col gap-0 overflow-hidden p-0"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground size-4 shrink-0"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search or jump to..."
            className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-base focus:outline-none"
          />
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1">
          {!hasResults && (
            <div className="flex items-center justify-center py-10">
              <p className="text-muted-foreground text-xs">
                {query.length > 0 ? `No results for "${query}"` : "No items"}
              </p>
            </div>
          )}

          {showNavGroup && (
            <div>
              <GroupLabel label="Navigation" />
              {nav.map((item, i) => (
                <NavRow
                  key={item.id}
                  item={item}
                  index={i}
                  selected={i === selectedIndex}
                  onActivate={activate}
                  onHover={setSelectedIndex}
                />
              ))}
            </div>
          )}

          {showIssuesGroup && (
            <div>
              <GroupLabel label="Issues" />
              {issueResults.map((item, i) => (
                <IssueRow
                  key={item.id}
                  item={item}
                  index={issueOffset + i}
                  selected={issueOffset + i === selectedIndex}
                  onActivate={activate}
                  onHover={setSelectedIndex}
                />
              ))}
            </div>
          )}

          {showMembersGroup && (
            <div>
              <GroupLabel label="Members" />
              {memberResults.map((item, i) => (
                <MemberRow
                  key={item.id}
                  item={item}
                  index={memberOffset + i}
                  selected={memberOffset + i === selectedIndex}
                  onActivate={activate}
                  onHover={setSelectedIndex}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 border-t px-4 py-2">
          <HugeiconsIcon
            icon={ArrowReloadHorizontalIcon}
            className="text-muted-foreground size-3"
          />
          <span className="text-muted-foreground text-[11px]">
            ↑↓ navigate · ↵ open · esc close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
