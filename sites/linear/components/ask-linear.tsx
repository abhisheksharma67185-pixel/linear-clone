"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { Cycle, Issue, Member, Project } from "@/app/lib/mock-data"
import { CURRENT_USER } from "@/lib/view-filter"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { statusStyle, priorityStyle } from "@/lib/status-styles"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Cancel01Icon,
  Sent02Icon,
  AiBrain03Icon,
  UserIcon,
  AlertCircleIcon,
  PlayCircleIcon,
  Hexagon01Icon,
  SparklesIcon,
  History as HistoryIcon,
} from "@hugeicons/core-free-icons"

type Msg = {
  id: string
  role: "user" | "assistant"
  text: string
  answer?: Answer
}

type Answer =
  | { kind: "issues"; title: string; issues: Issue[]; members: Member[] }
  | { kind: "projects"; title: string; projects: Project[]; members: Member[] }
  | { kind: "cycle"; cycle: Cycle; issues: Issue[]; members: Member[] }
  | { kind: "text"; title: string; body: string }

const SUGGESTIONS: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  color: string
}[] = [
  {
    icon: UserIcon,
    label: "What issues are assigned to me?",
    color: "text-violet-500",
  },
  {
    icon: AlertCircleIcon,
    label: "Show urgent issues",
    color: "text-rose-500",
  },
  {
    icon: PlayCircleIcon,
    label: "What's in the current cycle?",
    color: "text-amber-500",
  },
  {
    icon: Hexagon01Icon,
    label: "Which projects are in progress?",
    color: "text-sky-500",
  },
]

export type AskLinearVariant = "floating" | "inline"

export function AskLinear({
  variant = "floating",
}: {
  /**
   * "floating" (default) renders the Ask Linear pill fixed at the bottom-right
   * of the viewport. "inline" renders a compact button sized for a sidebar
   * footer alongside a chat-history icon button.
   */
  variant?: AskLinearVariant
} = {}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const [workspace, setWorkspace] = useState<{
    issues: Issue[]
    projects: Project[]
    cycles: Cycle[]
    members: Member[]
  } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || workspace) return
    Promise.all([
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/projects").then((r) => r.json()),
      fetch("/api/data/cycles").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
    ]).then(([issues, projects, cycles, members]) => {
      setWorkspace({ issues, projects, cycles, members })
    })
  }, [open, workspace])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking])

  const ask = async (text: string) => {
    const prompt = text.trim()
    if (!prompt || !workspace) return
    const userMsg: Msg = { id: `m-${Date.now()}-u`, role: "user", text: prompt }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setThinking(true)
    await new Promise((r) => setTimeout(r, 450))
    const answer = answerFor(prompt, workspace)
    const assistantMsg: Msg = {
      id: `m-${Date.now()}-a`,
      role: "assistant",
      text: "",
      answer,
    }
    setMessages((prev) => [...prev, assistantMsg])
    setThinking(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      ask(input)
    }
  }

  const newChat = () => {
    setMessages([])
    setInput("")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {variant === "floating" ? (
        <SheetTrigger
          render={
            <button
              type="button"
              className="bg-background text-muted-foreground hover:bg-accent hover:text-foreground fixed right-4 bottom-4 z-40 flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs shadow-sm transition-colors"
              aria-label="Ask Linear"
            />
          }
        >
          <AskLinearGlyph className="size-3.5 text-violet-400" />
          <span>Ask Linear</span>
          <HugeiconsIcon icon={HistoryIcon} className="size-3.5" />
        </SheetTrigger>
      ) : (
        <SheetTrigger
          render={
            <button
              type="button"
              className="bg-sidebar hover:bg-sidebar-accent text-muted-foreground hover:text-foreground flex w-full flex-1 items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition-colors"
              aria-label="Ask Linear"
            />
          }
        >
          <HugeiconsIcon icon={AiBrain03Icon} className="size-3.5" />
          <span className="flex-1 text-left">Ask Linear</span>
        </SheetTrigger>
      )}
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-[440px]"
      >
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-violet-500/15 text-violet-500">
              <HugeiconsIcon icon={AiBrain03Icon} className="size-3.5" />
            </div>
            <div>
              <div className="text-sm font-medium">Ask Linear</div>
              <div className="text-muted-foreground text-[11px]">
                {messages.length === 0
                  ? "Ask anything about your workspace"
                  : `${messages.filter((m) => m.role === "user").length} messages`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={newChat}
                className="text-muted-foreground h-7 px-2 text-xs"
              >
                New
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-7"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            </Button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState onPick={(q) => ask(q)} />
          ) : (
            <div className="flex flex-col gap-5 px-4 py-4">
              {messages.map((m) => (
                <MessageRow key={m.id} msg={m} onClose={() => setOpen(false)} />
              ))}
              {thinking && <ThinkingRow />}
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <div className="bg-background focus-within:border-foreground/30 flex items-end gap-2 rounded-lg border px-2 py-1.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about issues, projects, cycles..."
              rows={1}
              className="placeholder:text-muted-foreground/50 flex-1 resize-none bg-transparent text-sm focus:outline-none"
            />
            <Button
              size="icon"
              onClick={() => ask(input)}
              disabled={!input.trim() || thinking || !workspace}
              className="size-7 rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-600/50"
              aria-label="Send"
            >
              <HugeiconsIcon icon={Sent02Icon} className="size-3.5" />
            </Button>
          </div>
          <p className="text-muted-foreground mt-1.5 px-1 text-[10px]">
            Answers are generated from your workspace data.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Compact "Ask" sigil — a right-pointing triangle/cursor that prefixes
 * the floating Ask Linear pill, matching the inline glyph Linear uses on
 * its real workspace footer. Drawn inline (rather than picked from
 * Hugeicons) so its proportions stay tight at 14px.
 */
function AskLinearGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M3.5 2.4a.7.7 0 0 1 1.06-.6l9 5.6a.7.7 0 0 1 0 1.2l-9 5.6a.7.7 0 0 1-1.06-.6V2.4Z" />
    </svg>
  )
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex h-full flex-col gap-4 px-4 py-6">
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
          <HugeiconsIcon icon={SparklesIcon} className="size-5" />
        </div>
        <h2 className="text-sm font-medium">How can I help?</h2>
        <p className="text-muted-foreground text-xs">
          Ask about issues, projects, cycles, or teammates.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="text-muted-foreground px-1 text-[10px] font-medium tracking-wide uppercase">
          Suggested
        </div>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onPick(s.label)}
            className="group hover:bg-accent/60 flex items-center gap-3 rounded-md border px-3 py-2 text-left text-xs transition-colors"
          >
            <HugeiconsIcon icon={s.icon} className={`size-3.5 ${s.color}`} />
            <span className="flex-1">{s.label}</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="text-muted-foreground size-3 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageRow({ msg, onClose }: { msg: Msg; onClose: () => void }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-violet-600 px-3 py-1.5 text-xs text-white">
          {msg.text}
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="text-muted-foreground flex items-center gap-2 text-[10px]">
        <div className="flex size-4 items-center justify-center rounded-sm bg-violet-500/15 text-violet-500">
          <HugeiconsIcon icon={AiBrain03Icon} className="size-2.5" />
        </div>
        <span>Linear</span>
      </div>
      <div className="ml-6">
        {msg.answer && <AnswerView answer={msg.answer} onClose={onClose} />}
      </div>
    </div>
  )
}

function ThinkingRow() {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
      <div className="flex size-4 items-center justify-center rounded-sm bg-violet-500/15 text-violet-500">
        <HugeiconsIcon icon={AiBrain03Icon} className="size-2.5" />
      </div>
      <span className="flex gap-1">
        <span className="animate-pulse">Thinking</span>
        <span className="animate-pulse [animation-delay:150ms]">.</span>
        <span className="animate-pulse [animation-delay:300ms]">.</span>
        <span className="animate-pulse [animation-delay:450ms]">.</span>
      </span>
    </div>
  )
}

function AnswerView({
  answer,
  onClose,
}: {
  answer: Answer
  onClose: () => void
}) {
  if (answer.kind === "text") {
    return (
      <div className="bg-card rounded-lg border px-3 py-2">
        <div className="text-xs font-medium">{answer.title}</div>
        <p className="text-muted-foreground mt-1 text-xs">{answer.body}</p>
      </div>
    )
  }
  if (answer.kind === "issues") {
    return (
      <div className="bg-card rounded-lg border">
        <div className="px-3 py-2 text-xs font-medium">{answer.title}</div>
        {answer.issues.length === 0 ? (
          <div className="text-muted-foreground border-t px-3 py-3 text-xs">
            No matching issues found.
          </div>
        ) : (
          <ul className="divide-y">
            {answer.issues.slice(0, 8).map((issue) => (
              <IssueLine
                key={issue.id}
                issue={issue}
                members={answer.members}
                onClose={onClose}
              />
            ))}
            {answer.issues.length > 8 && (
              <li className="text-muted-foreground px-3 py-2 text-[11px]">
                + {answer.issues.length - 8} more
              </li>
            )}
          </ul>
        )}
      </div>
    )
  }
  if (answer.kind === "projects") {
    return (
      <div className="bg-card rounded-lg border">
        <div className="px-3 py-2 text-xs font-medium">{answer.title}</div>
        {answer.projects.length === 0 ? (
          <div className="text-muted-foreground border-t px-3 py-3 text-xs">
            No projects matched.
          </div>
        ) : (
          <ul className="divide-y">
            {answer.projects.map((p) => {
              const lead = answer.members.find((m) => m.id === p.leadId)
              return (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    onClick={onClose}
                    className="hover:bg-accent/50 flex items-center gap-2 px-3 py-2 text-xs"
                  >
                    <div className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-sky-500 to-cyan-500 text-[9px] font-semibold text-white">
                      {p.name.charAt(0)}
                    </div>
                    <span className="flex-1 truncate">{p.name}</span>
                    {lead && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={lead.avatar}
                        alt={lead.name}
                        className="size-4 rounded-full"
                      />
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {p.status.replace("_", " ")}
                    </Badge>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }
  // cycle
  const cycle = answer.cycle
  const done = answer.issues.filter(
    (i) => i.status === "done" || i.status === "cancelled"
  ).length
  return (
    <div className="bg-card rounded-lg border">
      <div className="flex items-center gap-2 px-3 py-2">
        <HugeiconsIcon
          icon={PlayCircleIcon}
          className="size-3.5 text-amber-500"
        />
        <span className="text-xs font-medium">{cycle.name}</span>
        <span className="text-muted-foreground ml-auto text-[10px]">
          {done}/{answer.issues.length} done
        </span>
      </div>
      {answer.issues.length === 0 ? (
        <div className="text-muted-foreground border-t px-3 py-3 text-xs">
          No issues in this cycle.
        </div>
      ) : (
        <ul className="divide-y">
          {answer.issues.slice(0, 6).map((issue) => (
            <IssueLine
              key={issue.id}
              issue={issue}
              members={answer.members}
              onClose={onClose}
            />
          ))}
          {answer.issues.length > 6 && (
            <li className="text-muted-foreground px-3 py-2 text-[11px]">
              + {answer.issues.length - 6} more
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function IssueLine({
  issue,
  members,
  onClose,
}: {
  issue: Issue
  members: Member[]
  onClose: () => void
}) {
  const assignee = members.find((m) => m.id === issue.assigneeId)
  return (
    <li>
      <Link
        href={`/issues/${issue.identifier}`}
        onClick={onClose}
        className="hover:bg-accent/50 flex items-center gap-2 px-3 py-2 text-xs"
      >
        <Badge
          variant="secondary"
          className={`shrink-0 text-[10px] ${priorityStyle[issue.priority]}`}
        >
          {issue.priority}
        </Badge>
        <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
          {issue.identifier}
        </span>
        <span className="flex-1 truncate">{issue.title}</span>
        <Badge
          variant="secondary"
          className={`shrink-0 text-[10px] ${statusStyle[issue.status]}`}
        >
          {issue.status.replace("_", " ")}
        </Badge>
        {assignee ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assignee.avatar}
            alt={assignee.name}
            className="size-4 rounded-full"
          />
        ) : (
          <div className="size-4 rounded-full border border-dashed" />
        )}
      </Link>
    </li>
  )
}

// ---------- Mock "AI" ----------

function answerFor(
  prompt: string,
  ws: {
    issues: Issue[]
    projects: Project[]
    cycles: Cycle[]
    members: Member[]
  }
): Answer {
  const q = prompt.toLowerCase()

  const mentionsMe = /\b(me|mine|my|assigned to me|i('m| am))\b/.test(q)
  const mentionsUnassigned = /\bunassigned|no assignee\b/.test(q)
  const mentionsUrgent = /\burgent|p0\b/.test(q)
  const mentionsHigh = /\bhigh( priority)?|p1\b/.test(q)
  const mentionsDone = /\bdone|complete|finished|shipped\b/.test(q)
  const mentionsInProgress = /\b(in[\s-]?progress|active|working on)\b/.test(q)
  const mentionsBacklog = /\bbacklog\b/.test(q)
  const mentionsBugs = /\bbug|bugs\b/.test(q)
  const mentionsProjects = /\bproject(s)?\b/.test(q)
  const mentionsCycle = /\bcycle|sprint\b/.test(q)
  const mentionsCurrent = /\bcurrent|active|this (cycle|sprint|week)\b/.test(q)

  if (mentionsCycle) {
    const active = ws.cycles.find((c) => c.state === "active")
    if (active) {
      const issues = ws.issues.filter((i) => i.cycleId === active.id)
      return { kind: "cycle", cycle: active, issues, members: ws.members }
    }
  }

  if (mentionsProjects) {
    const projects = mentionsInProgress
      ? ws.projects.filter((p) => p.status === "in_progress")
      : mentionsDone
        ? ws.projects.filter((p) => p.status === "completed")
        : ws.projects
    const title = mentionsInProgress
      ? "Projects in progress"
      : mentionsDone
        ? "Completed projects"
        : "All projects"
    return { kind: "projects", title, projects, members: ws.members }
  }

  let pool = ws.issues
  const filters: string[] = []

  if (mentionsMe) {
    pool = pool.filter((i) => i.assigneeId === CURRENT_USER)
    filters.push("assigned to you")
  }
  if (mentionsUnassigned) {
    pool = pool.filter((i) => i.assigneeId === null)
    filters.push("unassigned")
  }
  if (mentionsUrgent) {
    pool = pool.filter((i) => i.priority === "urgent")
    filters.push("urgent")
  }
  if (mentionsHigh) {
    pool = pool.filter((i) => i.priority === "high" || i.priority === "urgent")
    filters.push("high priority")
  }
  if (mentionsInProgress) {
    pool = pool.filter((i) => i.status === "in_progress")
    filters.push("in progress")
  }
  if (mentionsDone) {
    pool = pool.filter((i) => i.status === "done")
    filters.push("done")
  }
  if (mentionsBacklog) {
    pool = pool.filter((i) => i.status === "backlog")
    filters.push("in backlog")
  }
  if (mentionsBugs) {
    pool = pool.filter(
      (i) => /bug/i.test(i.title) || /bug/i.test(i.description)
    )
    filters.push("bugs")
  }
  if (mentionsCurrent && !mentionsCycle) {
    const active = ws.cycles.find((c) => c.state === "active")
    if (active) {
      pool = pool.filter((i) => i.cycleId === active.id)
      filters.push(`in ${active.name}`)
    }
  }

  if (filters.length > 0) {
    return {
      kind: "issues",
      title: `Issues ${filters.join(", ")}`,
      issues: pool,
      members: ws.members,
    }
  }

  // Fallback: try name match against members
  const matchedMember = ws.members.find(
    (m) => q.includes(m.name.toLowerCase()) || q.includes(m.email.split("@")[0])
  )
  if (matchedMember) {
    return {
      kind: "issues",
      title: `Issues assigned to ${matchedMember.name}`,
      issues: ws.issues.filter((i) => i.assigneeId === matchedMember.id),
      members: ws.members,
    }
  }

  return {
    kind: "text",
    title: "I couldn't find specific results",
    body: "Try asking about issues assigned to you, urgent issues, the current cycle, or projects in progress.",
  }
}
