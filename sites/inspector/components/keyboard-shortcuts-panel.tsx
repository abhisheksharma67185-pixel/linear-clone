"use client"

/**
 * Keyboard Shortcuts side-panel.
 *
 * Mirrors the panel that opens from the help popover ("Keyboard shortcuts"
 * row) and from the global `⌘/` binding. The panel is purely informational —
 * it lists the bindings users can press; it doesn't actually wire them up.
 * The bindings themselves are dispatched by `<KeyboardShortcuts />` (in
 * `components/keyboard-shortcuts.tsx`).
 *
 * The panel listens for a window-level `linear:open-keyboard-shortcuts`
 * event so any UI surface (popover row, command palette item, hotkey
 * handler) can trigger it without prop drilling.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

export const OPEN_KEYBOARD_SHORTCUTS_EVENT = "linear:open-keyboard-shortcuts"

// A "key" is a single keycap label; an "Item" describes one shortcut row
// composed of one or more chord groups. A chord group is an array of
// keycaps that should be pressed together; multiple groups are joined by
// the literal word "then" (e.g. `G then I`).
type Chord = string[]
type ShortcutItem = {
  label: string
  /**
   * Each entry in `chords` is one chord group. A row with two groups
   * renders as `[chord1] then [chord2]`. Most rows have a single group.
   */
  chords: Chord[]
  /**
   * Optional alternate single-key form rendered after the primary
   * chords with an "or" separator — used for rows like
   * `Move up   ↑ or K`. Kept narrow on purpose: the only real use
   * cases are vim-style up/down aliases.
   */
  altKey?: string
}

type ShortcutSection = {
  title: string
  items: ShortcutItem[]
}

// Glyph helpers — keep them as constants so the data table reads cleanly.
const CMD = "⌘"
const SHIFT = "⇧"
const OPT = "⌥"
const CTRL = "Ctrl"
const ENTER = "Enter"
const ESC = "Esc"
const SPACE = "Space"
const BACKSPACE = "⌫"
const ARROW_UP = "↑"
const ARROW_DOWN = "↓"
const ARROW_LEFT = "←"
const ARROW_RIGHT = "→"
const RETURN = "↵"

const SECTIONS: ShortcutSection[] = [
  {
    title: "General",
    items: [
      { label: "Open command menu", chords: [[CMD, "K"]] },
      { label: "Save or submit", chords: [[CMD, ENTER]] },
      { label: "Send comment", chords: [[ENTER]] },
      { label: "Back", chords: [[ESC]] },
      { label: "Open search", chords: [["/"]] },
      { label: "Open help center", chords: [["?"]] },
      { label: "View keyboard shortcuts", chords: [[CMD, "/"]] },
      { label: "Switch workspace", chords: [["O"], ["W"]] },
      { label: "Log out", chords: [[OPT, SHIFT, "Q"]] },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "Toggle left sidebar", chords: [["["]] },
      { label: "Toggle right sidebar", chords: [["]"]] },
      { label: "Open issue", chords: [["O"], ["I"]] },
      { label: "Open parent issue", chords: [[CMD, SHIFT, ARROW_UP]] },
      { label: "Go to team", chords: [[CTRL, SHIFT, "1-9"]] },
      { label: "Go to inbox", chords: [["G"], ["I"]] },
      { label: "Go to my issues", chords: [["G"], ["M"]] },
      { label: "Go to triage", chords: [["G"], ["T"]] },
      { label: "Go to drafts", chords: [["G"], ["D"]] },
      { label: "Go to active issues", chords: [["G"], ["A"]] },
      { label: "Go to backlog", chords: [["G"], ["B"]] },
      { label: "Open team archive", chords: [["G"], ["X"]] },
      { label: "Go to all issues", chords: [["G"], ["E"]] },
      { label: "Go to cycles", chords: [["G"], ["C"]] },
      { label: "Go to current cycle", chords: [["G"], ["V"]] },
      { label: "Go to upcoming cycle", chords: [["G"], ["W"]] },
      { label: "Go to projects", chords: [["G"], ["P"]] },
      { label: "Go to settings", chords: [["G"], ["S"]] },
      { label: "Open a favorite", chords: [["O"], ["F"]] },
      { label: "Open a project", chords: [["O"], ["P"]] },
      { label: "Open a cycle", chords: [["O"], ["C"]] },
      { label: "Open a user", chords: [["O"], ["U"]] },
      { label: "Open a team", chords: [["O"], ["T"]] },
      { label: "Open view", chords: [["O"], ["V"]] },
      { label: "Go to initiatives", chords: [["G"], ["N"]] },
      { label: "Open initiative", chords: [["O"], ["N"]] },
      { label: "Go to customers", chords: [["G"], ["Q"]] },
      { label: "Open a customer", chords: [["O"], ["Q"]] },
      { label: "Open link from last toast", chords: [[CMD, OPT, "O"]] },
      { label: "Show display options", chords: [[SHIFT, "V"]] },
    ],
  },
  {
    title: "Issues",
    items: [
      { label: "New issue", chords: [["C"]] },
      { label: "New issue from template", chords: [[OPT, "C"]] },
      { label: "New issue in full screen view", chords: [["V"]] },
      { label: "Assign issue to user", chords: [["A"]] },
      { label: "Assign to me", chords: [["I"]] },
      { label: "Apply template to issue", chords: [[CTRL, OPT, SHIFT, "T"]] },
      { label: "Change labels", chords: [["L"]] },
      { label: "Change issue status", chords: [["S"]] },
      { label: "Change priority", chords: [["P"]] },
      { label: "Change estimate", chords: [[SHIFT, "E"]] },
      { label: "Set due date", chords: [[SHIFT, "D"]] },
      { label: "Remove due date", chords: [[CMD, SHIFT, "D"]] },
      { label: "Rename", chords: [[SHIFT, "R"]] },
      { label: "Focus issue description input", chords: [[CTRL, SHIFT, "I"]] },
      { label: "Mark as favorite", chords: [[OPT, "F"]] },
      { label: "Remind about issue", chords: [[SHIFT, "H"]] },
      { label: "Move to another team", chords: [[CMD, SHIFT, "M"]] },
      { label: "Delete issue", chords: [[CMD, BACKSPACE]] },
      { label: "Restore issue", chords: [["#"]] },
      { label: "Subscribe to issue", chords: [[SHIFT, "S"]] },
      { label: "Manage issue subscribers", chords: [[CMD, SHIFT, "S"]] },
      { label: "Mark as blocked", chords: [["M"], ["B"]] },
      { label: "Mark as blocking", chords: [["M"], ["X"]] },
      { label: "Reference related issue", chords: [["M"], ["R"]] },
      { label: "Mark as duplicate of another issue", chords: [["M"], ["M"]] },
      { label: "Link any URL to issue…", chords: [[CTRL, "L"]] },
      { label: "Copy issue id", chords: [[CMD, "."]] },
      { label: "Copy git branch name", chords: [[CMD, SHIFT, "."]] },
      { label: "Copy issue URL", chords: [[CMD, SHIFT, ","]] },
      { label: "Copy issue title", chords: [[CMD, SHIFT, "'"]] },
      { label: "Create sub-issue", chords: [[CMD, SHIFT, "O"]] },
      { label: "Add to cycle", chords: [[SHIFT, "C"]] },
      { label: "Add to project", chords: [[SHIFT, "P"]] },
      { label: "Add to project milestone", chords: [[SHIFT, "M"]] },
      { label: "Set parent issue", chords: [[CMD, SHIFT, "P"]] },
      { label: "Open sub-issue", chords: [[CMD, SHIFT, ARROW_DOWN]] },
      { label: "Toggle links section", chords: [[CTRL, SHIFT, "L"]] },
    ],
  },
  {
    title: "Projects",
    items: [
      { label: "New project", chords: [["N"], ["P"]] },
      { label: "Change project status", chords: [["P"], ["S"]] },
      { label: "Change project initiatives", chords: [["P"], ["N"]] },
      { label: "Change project lead", chords: [["P"], ["A"]] },
      { label: "Change project members", chords: [["P"], ["M"]] },
      { label: "Change project teams", chords: [["P"], ["T"]] },
      { label: "Change project labels", chords: [["P"], ["L"]] },
      { label: "Set start date", chords: [[CTRL, OPT, "S"]] },
      { label: "Set target date", chords: [[CTRL, OPT, "D"]] },
      { label: "Mark as favorite", chords: [[OPT, "F"]] },
      { label: "Remind about project", chords: [[SHIFT, "H"]] },
      { label: "Open project updates & activity", chords: [[CMD, "U"]] },
      { label: "Write new project update", chords: [[CMD, SHIFT, "U"]] },
      { label: "Copy project URL", chords: [[CMD, SHIFT, ","]] },
      { label: "Copy project title", chords: [[CMD, SHIFT, "'"]] },
    ],
  },
  {
    title: "Initiatives",
    items: [
      { label: "Change initiative owner", chords: [["N"], ["O"]] },
      { label: "Set target date", chords: [[CTRL, OPT, "D"]] },
      { label: "Mark as favorite", chords: [[OPT, "F"]] },
      { label: "Remind about initiative", chords: [[SHIFT, "H"]] },
      {
        label: "Open initiative updates & activity",
        chords: [[CMD, "U"]],
      },
      { label: "Write new initiative update", chords: [[CMD, SHIFT, "U"]] },
      { label: "Copy initiative URL", chords: [[CMD, SHIFT, ","]] },
      { label: "Copy initiative title", chords: [[CMD, SHIFT, "'"]] },
    ],
  },
  {
    title: "List / Board",
    items: [
      { label: "Peek into item", chords: [[SPACE]] },
      { label: "Open focused item", chords: [[ENTER]] },
      { label: "Select item", chords: [["X"]] },
      { label: "Select all items in a group", chords: [[CMD, OPT, "A"]] },
      { label: "Select all items", chords: [[CMD, "A"]] },
      { label: "Clear selection", chords: [[ESC]] },
      { label: "Toggle layout view", chords: [[CMD, "B"]] },
      { label: "Copy page URL", chords: [[CMD, SHIFT, "C"]] },
      { label: "Move up", chords: [[ARROW_UP]], altKey: "K" },
      { label: "Move down", chords: [[ARROW_DOWN]], altKey: "J" },
      { label: "Move right", chords: [[ARROW_RIGHT]] },
      { label: "Move left", chords: [[ARROW_LEFT]] },
      { label: "Select multiple items in a list", chords: [[SHIFT, "Click"]] },
      { label: "Move to top of the group", chords: [[OPT, SHIFT, ARROW_UP]] },
      { label: "Move one position up", chords: [[OPT, ARROW_UP]] },
      { label: "Move one position down", chords: [[OPT, ARROW_DOWN]] },
      {
        label: "Move to bottom of the group",
        chords: [[OPT, SHIFT, ARROW_DOWN]],
      },
      { label: "Move to the left column", chords: [[OPT, ARROW_LEFT]] },
      { label: "Move to the right column", chords: [[OPT, ARROW_RIGHT]] },
      { label: "Collapse/expand row", chords: [["T"]] },
      { label: "Collapse/expand all rows", chords: [[OPT, "T"]] },
    ],
  },
  {
    title: "Timeline",
    items: [
      { label: "Toggle timeline project list", chords: [[SHIFT, "{"]] },
      { label: "Select project / milestone", chords: [["X"]] },
      { label: "Select project or next milestone", chords: [[ARROW_RIGHT]] },
      {
        label: "Select previous milestone or project",
        chords: [[ARROW_LEFT]],
      },
      { label: "Deselect project or milestone", chords: [[ESC]] },
      {
        label: "Keep dependencies & milestones in place",
        chords: [[CMD, "Drag project"]],
      },
      { label: "Shift dependencies", chords: [[SHIFT, "Drag project"]] },
      {
        label: "Shift subsequent milestones",
        chords: [[SHIFT, "Drag milestone"]],
      },
      { label: "Zoom in/out", chords: [[CMD, "Scroll"]] },
      { label: "Zoom out", chords: [["-"]] },
      { label: "Zoom in", chords: [["="]] },
      { label: "Zoom to year", chords: [["Y"]] },
      { label: "Zoom to quarter", chords: [["Q"]] },
      { label: "Zoom to month", chords: [["M"]] },
      { label: "Zoom to week", chords: [["W"]] },
    ],
  },
  {
    title: "Comments",
    items: [
      { label: "Comment on issue", chords: [[CTRL, "M"]] },
      { label: "Reply to comment", chords: [["R"]] },
    ],
  },
  {
    title: "Inbox",
    items: [
      { label: "Delete notification", chords: [[BACKSPACE]] },
      { label: "Delete all read notifications", chords: [[SHIFT, BACKSPACE]] },
      { label: "Mark as read/unread", chords: [["U"]] },
      { label: "Mark all as read", chords: [[OPT, "U"]] },
      { label: "Snooze notification", chords: [["H"]] },
    ],
  },
  {
    title: "Filters",
    items: [
      { label: "Add filter", chords: [["F"]] },
      { label: "Clear all filters", chords: [[OPT, SHIFT, "F"]] },
      { label: "Clear last issue filter", chords: [[SHIFT, "F"]] },
    ],
  },
  {
    title: "Editor",
    items: [
      { label: "Bold", chords: [[CMD, "B"]] },
      { label: "Italic", chords: [[CMD, "I"]] },
      { label: "Underline", chords: [[CMD, "U"]] },
      { label: "Strikethrough", chords: [[CMD, "S"]] },
      { label: "Attach image/file", chords: [[CMD, SHIFT, "U"]] },
      { label: "Inline code", chords: [[CMD, "E"]] },
      { label: "Turn text into link", chords: [[CMD, "K"]] },
      { label: "Blockquote", chords: [[OPT, SHIFT, "."]] },
      { label: "Regular text", chords: [[CMD, OPT, "0"]] },
      { label: "Heading 1", chords: [[CMD, OPT, "1"]] },
      { label: "Heading 2", chords: [[CMD, OPT, "2"]] },
      { label: "Heading 3", chords: [[CMD, OPT, "3"]] },
      { label: "Heading 4", chords: [[CMD, OPT, "4"]] },
      { label: "Collapsible section", chords: [[CMD, SHIFT, "6"]] },
      { label: "Checklist", chords: [[CMD, SHIFT, "7"]] },
      { label: "Toggle checklist", chords: [[CMD, RETURN]] },
      { label: "Toggle nested checklist", chords: [[CMD, SHIFT, RETURN]] },
      { label: "Bulleted list", chords: [[CMD, SHIFT, "8"]] },
      { label: "Numbered list", chords: [[CMD, SHIFT, "9"]] },
      { label: "Code block", chords: [[CMD, SHIFT, "\\"]] },
      { label: "New line in document", chords: [[ENTER]] },
      { label: "New line in comment", chords: [[SHIFT, ENTER]] },
      { label: "Move selection up", chords: [[OPT, ARROW_UP]] },
      { label: "Move selection down", chords: [[OPT, ARROW_DOWN]] },
      { label: "Undo", chords: [[CMD, "Z"]] },
      { label: "Redo", chords: [[CMD, SHIFT, "Z"]] },
    ],
  },
  {
    title: "Markdown formatting",
    items: [
      { label: "Heading 1", chords: [["#"], [SPACE]] },
      { label: "Heading 2", chords: [["##"], [SPACE]] },
      { label: "Heading 3", chords: [["###"], [SPACE]] },
      { label: "Heading 4", chords: [["####"], [SPACE]] },
      { label: "Bulleted list", chords: [["-"], [SPACE]] },
      { label: "Numbered list", chords: [["1."], [SPACE]] },
      { label: "Checklist", chords: [["[]"]] },
      { label: "Blockquote", chords: [[">"], [SPACE]] },
      { label: "Code block", chords: [["```"]] },
      { label: "Table", chords: [["|--"]] },
      { label: "Italic", chords: [["_Text_"]] },
      { label: "Bold", chords: [["**Text**"]] },
      { label: "Strikethrough", chords: [["~Text~"]] },
      { label: "Inline code", chords: [["`Code`"]] },
      { label: "Horizontal divider", chords: [["***"], [SPACE]] },
      { label: "Collapsible section", chords: [[">>>"], [SPACE]] },
    ],
  },
]

export function KeyboardShortcutsPanel() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Open in response to the global event. Reset the query each time so
  // the panel always opens fresh — users expect "open shortcuts" to
  // always show the full list, not whatever they last filtered for.
  useEffect(() => {
    const onOpen = () => {
      setQuery("")
      setOpen(true)
    }
    window.addEventListener(OPEN_KEYBOARD_SHORTCUTS_EVENT, onOpen)
    return () =>
      window.removeEventListener(OPEN_KEYBOARD_SHORTCUTS_EVENT, onOpen)
  }, [])

  // Close on Escape. Bound only while open so the listener doesn't
  // compete with other Esc handlers (e.g. Clear selection in a list)
  // when the panel isn't visible.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Autofocus the search input on open so users can immediately filter.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SECTIONS
    return SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(q)
      ),
    })).filter((section) => section.items.length > 0)
  }, [query])

  if (!open) return null

  return (
    <aside
      role="dialog"
      aria-label="Keyboard Shortcuts"
      data-testid="keyboard-shortcuts-panel"
      className="bg-popover ring-foreground/10 fixed top-0 right-0 z-50 flex h-screen w-[360px] flex-col text-xs ring-1"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-2 px-3 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Back"
            data-testid="keyboard-shortcuts-back"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex size-6 items-center justify-center rounded transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </button>
          <h2 className="text-sm font-medium">Keyboard Shortcuts</h2>
        </div>
        <button
          type="button"
          aria-label="Close"
          data-testid="keyboard-shortcuts-close"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground hover:bg-accent/60 flex size-6 items-center justify-center rounded transition-colors"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
        </button>
      </header>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shortcuts"
            aria-label="Search shortcuts"
            data-testid="keyboard-shortcuts-search"
            className="ring-ring/60 placeholder:text-muted-foreground/60 focus-visible:ring-ring h-9 w-full rounded-md bg-transparent pr-2 pl-8 text-xs ring-1 outline-none focus-visible:ring-2"
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {filtered.length === 0 && (
          <p
            className="text-muted-foreground py-6 text-center"
            data-testid="keyboard-shortcuts-empty"
          >
            No matching shortcuts
          </p>
        )}
        {filtered.map((section) => (
          <section key={section.title} className="mb-4">
            <h3 className="text-foreground mt-2 mb-1 text-sm font-semibold">
              {section.title}
            </h3>
            <ul className="flex flex-col">
              {section.items.map((item, index) => (
                <li
                  key={`${item.label}-${index}`}
                  className="flex min-h-7 items-center justify-between gap-3 px-1 py-1.5"
                >
                  <span className="text-muted-foreground/90 truncate">
                    {item.label}
                  </span>
                  <ChordRow chords={item.chords} altKey={item.altKey} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}

/**
 * Renders one shortcut's keys. A `chords` array of one group is a single
 * combo (e.g. `⌘ K`); multiple groups are joined by a faint "then" so
 * leader-key sequences read naturally (`G then I`). When `altKey` is
 * set, an extra cap is appended after a faint "or" — used by the
 * vim-style up/down aliases (`↑ or K`, `↓ or J`).
 */
function ChordRow({ chords, altKey }: { chords: Chord[]; altKey?: string }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {chords.map((chord, groupIndex) => (
        <span key={groupIndex} className="flex items-center gap-1">
          {groupIndex > 0 && (
            <span className="text-muted-foreground/60 px-0.5">then</span>
          )}
          {chord.map((key, keyIndex) => (
            <KeyCap key={`${groupIndex}-${keyIndex}`} value={key} />
          ))}
        </span>
      ))}
      {altKey && (
        <>
          <span className="text-muted-foreground/60 px-0.5">or</span>
          <KeyCap value={altKey} />
        </>
      )}
    </span>
  )
}

function KeyCap({ value }: { value: string }) {
  // Single-character keys (letters, digits, punctuation) center cleanly
  // in a square cap; multi-character labels (Enter, Esc, Ctrl) need
  // extra horizontal padding so they don't crop.
  const isSingle = value.length === 1
  return (
    <kbd
      aria-hidden="false"
      className={`bg-muted text-muted-foreground inline-flex h-5 items-center justify-center rounded font-sans text-[11px] font-medium ${
        isSingle ? "min-w-5 px-1" : "px-1.5"
      }`}
    >
      {value}
    </kbd>
  )
}
