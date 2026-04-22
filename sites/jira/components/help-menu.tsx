"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// ─── Icons ───────────────────────────────────────────────────────────────────

function HelpArticlesIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-[#626f86]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line
        x1="12"
        y1="17"
        x2="12.01"
        y2="17"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-[#626f86]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function FeedbackIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-[#626f86]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8l-4 4" />
      <path d="M8 10h8M8 7h5" />
    </svg>
  )
}

function SupportIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-[#626f86]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  )
}

function StatusPageIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-[#626f86]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line
        x1="12"
        y1="17"
        x2="12.01"
        y2="17"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function KeyboardIcon() {
  return (
    <svg
      className="size-5 shrink-0 text-[#626f86]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line
        x1="6"
        y1="8"
        x2="6.01"
        y2="8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="8"
        x2="10.01"
        y2="8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="8"
        x2="14.01"
        y2="8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="8"
        x2="18.01"
        y2="8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      className="size-[15px] shrink-0 text-[#626f86]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

// ─── Keyboard Shortcuts Data ──────────────────────────────────────────────────

type ShortcutRow = { description: string; keys: string[] }
type ShortcutSection = { title: string; shortcuts: ShortcutRow[] }

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: "Global",
    shortcuts: [
      { description: "Keyboard shortcuts", keys: ["?"] },
      { description: "Quick search", keys: ["/"] },
      { description: "Create new", keys: ["c"] },
      { description: "Go home", keys: ["g", "h"] },
      { description: "Go projects", keys: ["g", "p"] },
      { description: "Go goals", keys: ["g", "g"] },
      { description: "Go teams", keys: ["g", "t"] },
      { description: "Go tags", keys: ["g", "o"] },
    ],
  },
  {
    title: "Home page updates",
    shortcuts: [
      { description: "Previous page", keys: ["j"] },
      { description: "Next page", keys: ["k"] },
      { description: "Previous item", keys: ["p"] },
      { description: "Next item", keys: ["n"] },
      { description: "Activate reading mode", keys: ["r"] },
    ],
  },
  {
    title: "Projects and goals",
    shortcuts: [
      { description: "Follow", keys: ["w"] },
      { description: "Share", keys: ["s"] },
      { description: "Post an update", keys: ["p"] },
      { description: "Copy link to clipboard", keys: ["k"] },
      { description: "Go about tab", keys: ["g", "a"] },
      { description: "Go updates tab", keys: ["g", "u"] },
      { description: "Go learnings tab", keys: ["g", "l"] },
    ],
  },
  {
    title: "Directory",
    shortcuts: [
      { description: "Search in directory", keys: ["s", "d"] },
      { description: "Copy link to clipboard", keys: ["k"] },
    ],
  },
]

// ─── Feedback Dialog ─────────────────────────────────────────────────────────

function FeedbackDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!rating && !comment.trim()) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setRating(null)
      setComment("")
      onClose()
    }, 2000)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setSubmitted(false)
          setRating(null)
          setComment("")
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Give feedback</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="size-6 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-[#172b4d] dark:text-foreground">
              Thank you for your feedback!
            </p>
            <p className="text-[12px] text-[#626f86]">
              Your input helps us improve Jira.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div>
              <p className="mb-3 text-[13px] font-medium text-[#172b4d] dark:text-foreground">
                How would you rate your experience with Jira?
              </p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      className={`size-8 transition-colors ${star <= (rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "fill-none text-[#dfe1e6]"}`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
                {rating && (
                  <span className="ml-2 text-[12px] text-[#626f86]">
                    {rating === 1
                      ? "Poor"
                      : rating === 2
                        ? "Fair"
                        : rating === 3
                          ? "Good"
                          : rating === 4
                            ? "Very good"
                            : "Excellent"}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-[#172b4d] dark:text-foreground">
                Tell us more (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What could we improve? What's working well?"
                rows={4}
                className="w-full resize-none rounded-[3px] border border-[#dfe1e6] bg-background px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-[#626f86] focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRating(null)
                  setComment("")
                  onClose()
                }}
                className="border-[#dfe1e6] text-[#172b4d] dark:text-foreground"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!rating && !comment.trim()}
                className="bg-[#0052cc] text-white hover:bg-[#0747a6]"
              >
                Send feedback
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Help Menu ────────────────────────────────────────────────────────────────

interface HelpItem {
  label: string
  icon: React.ReactNode
  external?: boolean
  href?: string
  action?: "shortcuts" | "feedback"
}

const HELP_ITEMS: HelpItem[] = [
  {
    label: "Documentation",
    icon: <HelpArticlesIcon />,
    external: true,
    href: "https://support.atlassian.com/jira-software-cloud/",
  },
  {
    label: "Ask the community",
    icon: <CommunityIcon />,
    external: true,
    href: "https://community.atlassian.com/t5/Jira/ct-p/jira",
  },
  {
    label: "Give feedback",
    icon: <FeedbackIcon />,
    action: "feedback",
  },
  {
    label: "Contact support",
    icon: <SupportIcon />,
    external: true,
    href: "https://support.atlassian.com/contact/",
  },
  {
    label: "Status page",
    icon: <StatusPageIcon />,
    external: true,
    href: "https://status.atlassian.com/",
  },
  {
    label: "Keyboard shortcuts",
    icon: <KeyboardIcon />,
    external: true,
    href: "https://support.atlassian.com/jira-software-cloud/docs/use-keyboard-shortcuts/",
  },
]

type View = "main" | "shortcuts"

export function HelpMenu() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>("main")
  const [optModifier, setOptModifier] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const closePanel = () => {
    setOpen(false)
    setView("main")
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  // Close panel on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closePanel()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleItemClick = (item: HelpItem) => {
    if (item.action === "shortcuts") {
      setView("shortcuts")
    } else if (item.action === "feedback") {
      closePanel()
      setFeedbackOpen(true)
    }
  }

  return (
    <>
      {/* Help trigger button */}
      <button
        type="button"
        aria-label="Help"
        data-testid="help-menu-trigger"
        onClick={() => {
          setOpen((v) => !v)
          setView("main")
        }}
        className="rounded-full p-1.5 text-[#626f86] transition-colors hover:bg-[#f4f5f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-muted-foreground dark:hover:bg-accent"
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line
            x1="12"
            y1="17"
            x2="12.01"
            y2="17"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Floating panel — fixed, no backdrop */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Help"
          data-testid="help-panel"
          className="fixed inset-y-0 right-0 z-50 flex w-[380px] max-w-full flex-col border-l border-[#dfe1e6] bg-white shadow-[-4px_0_24px_rgba(9,30,66,0.12)] dark:border-border dark:bg-background"
          style={{ top: 0, bottom: 0 }}
        >
          {/* ── Header ── */}
          <div className="shrink-0 border-b border-[#dfe1e6] bg-[#f4f5f7] dark:border-border dark:bg-muted">
            <div className="relative flex h-12 items-center justify-center px-4">
              {/* Back button (shortcuts view only) */}
              {view === "shortcuts" && (
                <button
                  type="button"
                  onClick={() => setView("main")}
                  className="absolute left-3 flex items-center gap-1.5 rounded px-2 py-1 text-[13px] text-[#172b4d] transition-colors hover:bg-[#dfe1e6] dark:text-foreground dark:hover:bg-border"
                >
                  <svg
                    className="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back
                </button>
              )}

              {/* Title */}
              <span className="text-[15px] font-semibold text-[#172b4d] dark:text-foreground">
                Help
              </span>

              {/* Close × */}
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close help"
                className="absolute right-3 rounded p-1 text-[#626f86] transition-colors hover:bg-[#dfe1e6] dark:text-muted-foreground dark:hover:bg-border"
              >
                <svg
                  className="size-[18px]"
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
          </div>

          {/* ── Content ── */}
          {view === "main" ? (
            /* Main help list */
            <div className="flex-1 overflow-y-auto py-2">
              {HELP_ITEMS.map((item) => {
                const cls =
                  "flex w-full items-center gap-3 px-5 py-3 text-[13px] text-[#172b4d] dark:text-foreground hover:bg-[#f4f5f7] dark:hover:bg-accent transition-colors text-left"

                if (item.external && item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className={cls}
                      data-testid={`help-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      <ExternalLinkIcon />
                    </a>
                  )
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={cls}
                    data-testid={`help-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            /* Keyboard shortcuts sub-page */
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <h2 className="mb-5 text-[18px] leading-tight font-bold text-[#172b4d] dark:text-foreground">
                Keyboard shortcuts
              </h2>

              {/* Multi key shortcuts toggle */}
              <div className="mb-6">
                <p className="mb-2 text-[13px] font-semibold text-[#172b4d] dark:text-foreground">
                  Multi key shortcuts
                </p>
                <div className="flex items-start gap-3 rounded-[3px] border border-[#dfe1e6] bg-[#f4f5f7] px-4 py-3 dark:border-border dark:bg-muted/30">
                  <p className="flex-1 text-[13px] leading-snug text-[#172b4d] dark:text-foreground">
                    Add{" "}
                    <kbd className="inline-flex items-center justify-center rounded border border-[#dfe1e6] bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#626f86] dark:bg-background">
                      opt
                    </kbd>{" "}
                    as a modifier key to all shortcuts for improved
                    accessibility
                  </p>
                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={optModifier}
                    onClick={() => setOptModifier((v) => !v)}
                    className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#0052cc] focus-visible:outline-none ${
                      optModifier ? "bg-[#36b37e]" : "bg-[#97a0af]"
                    }`}
                  >
                    <span
                      className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                        optModifier ? "translate-x-[18px]" : "translate-x-[3px]"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Shortcut sections */}
              <div className="space-y-6">
                {SHORTCUT_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <p className="mb-2 text-[13px] font-bold text-[#172b4d] dark:text-foreground">
                      {section.title}
                    </p>
                    <div>
                      {section.shortcuts.map((s) => (
                        <div
                          key={s.description}
                          className="flex items-center justify-between border-b border-[#f4f5f7] py-2 last:border-0 dark:border-border"
                        >
                          <span className="text-[13px] text-[#172b4d] dark:text-foreground">
                            {s.description}
                          </span>
                          <div className="ml-4 flex shrink-0 items-center gap-1">
                            {optModifier && (
                              <kbd className="inline-flex min-w-[22px] items-center justify-center rounded border border-[#dfe1e6] bg-[#f4f5f7] px-1.5 py-0.5 font-mono text-[11px] text-[#626f86] dark:border-border dark:bg-muted dark:text-muted-foreground">
                                opt
                              </kbd>
                            )}
                            {s.keys.map((k, i) => (
                              <kbd
                                key={i}
                                className="inline-flex min-w-[22px] items-center justify-center rounded border border-[#dfe1e6] bg-[#f4f5f7] px-1.5 py-0.5 font-mono text-[11px] text-[#626f86] dark:border-border dark:bg-muted dark:text-muted-foreground"
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="shrink-0 border-t border-[#dfe1e6] px-5 py-3 dark:border-border">
            <div className="flex items-center gap-3 text-[11px] text-[#626f86] dark:text-muted-foreground">
              <a href="/terms" className="hover:underline">
                Terms of Use
              </a>
              <span>·</span>
              <a
                href="/privacy/notice-of-collection"
                className="hover:underline"
              >
                Notice of Collection
              </a>
              <span>·</span>
              <a href="/privacy" className="hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      )}

      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  )
}
