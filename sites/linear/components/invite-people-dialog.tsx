"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Link01Icon,
  Cancel01Icon,
  ArrowDown01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

type Role = "admin" | "member" | "guest"

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  member: "Member",
  guest: "Guest",
}

/**
 * Email validation regex. Stricter than the previous
 * `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` which accepted obviously malformed
 * inputs that contained any "@…." sequence. This pattern follows the
 * HTML5 `type="email"` spec (single address):
 *
 *   - local: at least one of the standard atext characters
 *   - domain: starts and ends with an alphanumeric, internal hyphens
 *     allowed, ≥1 dot-separated label, last label ≥2 alpha chars (TLD)
 *
 * `^...$` anchors the regex and `.test()` is run against a trimmed
 * string. Server-side mirrors this in `validateInviteEmail` so an
 * attacker who bypasses the client cannot create a malformed member.
 */
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/

/**
 * Single source of truth used by both the dialog and any server-side
 * code paths that need to validate invite addresses.
 */
export function isValidInviteEmail(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  // Reject anything obviously over-long; RFC 5321 caps the local at
  // 64 and the full address at 254 — keep the same bounds.
  if (trimmed.length > 254) return false
  const at = trimmed.indexOf("@")
  if (at < 0 || at > 64) return false
  return EMAIL_RE.test(trimmed)
}

export function InvitePeopleDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [draft, setDraft] = useState("")
  const [emails, setEmails] = useState<string[]>([])
  const [role, setRole] = useState<Role>("member")
  const [sent, setSent] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  // Last validation error surfaced to the user. Cleared whenever the
  // user types, so error state never blocks them once they correct
  // the input. Set on Enter/comma/blur if the draft fails validation.
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset form fields when the dialog closes. open → UI state sync is what
  // useEffect is for; the rule's caution doesn't apply.
  useEffect(() => {
    if (!open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setDraft("")
      setEmails([])
      setRole("member")
      setSent(null)
      setCopied(false)
      setError(null)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open])

  const commitDraft = () => {
    const trimmed = draft.trim().replace(/,$/, "")
    if (!trimmed) {
      setError(null)
      return
    }
    if (!isValidInviteEmail(trimmed)) {
      setError(`"${trimmed}" is not a valid email address`)
      return
    }
    if (emails.includes(trimmed)) {
      setDraft("")
      setError(null)
      return
    }
    setEmails((prev) => [...prev, trimmed])
    setDraft("")
    setError(null)
  }

  const removeEmail = (email: string) =>
    setEmails((prev) => prev.filter((e) => e !== email))

  const canSend =
    emails.length > 0 || isValidInviteEmail(draft.trim())

  const handleSend = () => {
    const final = [...emails]
    const t = draft.trim()
    if (t) {
      if (!isValidInviteEmail(t)) {
        // Surface the error and abort — never silently drop a draft
        // that the user thought they'd just sent.
        setError(`"${t}" is not a valid email address`)
        return
      }
      if (!final.includes(t)) final.push(t)
    }
    if (final.length === 0) return
    setSent(final.length)
  }

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/theta-engineering?token=demo`
      : "/invite/theta-engineering?token=demo"

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>
            Invite teammates to collaborate in your workspace.
          </DialogDescription>
        </DialogHeader>

        {sent !== null ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <HugeiconsIcon
              icon={Tick02Icon}
              className="size-8 text-emerald-500"
            />
            <p className="text-sm font-medium">
              {sent} invite{sent === 1 ? "" : "s"} sent
            </p>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="invite-emails" className="text-xs font-medium">
                Email addresses
              </label>
              <div
                className="focus-within:ring-ring flex min-h-9 flex-wrap items-center gap-1 rounded-md border bg-transparent px-2 py-1 focus-within:ring-2"
                onClick={() => inputRef.current?.focus()}
              >
                {emails.map((email) => (
                  <span
                    key={email}
                    className="bg-muted flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
                  >
                    {email}
                    <button
                      type="button"
                      aria-label={`Remove ${email}`}
                      onClick={() => removeEmail(email)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                    </button>
                  </span>
                ))}
                <input
                  id="invite-emails"
                  ref={inputRef}
                  autoFocus
                  // type="email" enables browser-native validation as
                  // a second line of defence and triggers email-tuned
                  // soft keyboards on mobile.
                  type="email"
                  multiple
                  data-testid="invite-emails-input"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={
                    error ? "invite-emails-error" : undefined
                  }
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    // Typing clears the error so the user isn't held
                    // by stale validation after they've corrected
                    // the value.
                    if (error) setError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      commitDraft()
                    } else if (
                      e.key === "Backspace" &&
                      !draft &&
                      emails.length
                    ) {
                      setEmails((prev) => prev.slice(0, -1))
                    }
                  }}
                  onBlur={commitDraft}
                  placeholder={emails.length ? "" : "name@company.com, …"}
                  className="placeholder:text-muted-foreground/60 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              {error && (
                <p
                  id="invite-emails-error"
                  data-testid="invite-emails-error"
                  role="alert"
                  className="text-destructive text-xs"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Role</span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="hover:bg-muted/60 flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs"
                    />
                  }
                >
                  <span>{ROLE_LABEL[role]}</span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className="text-muted-foreground size-3"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                    <DropdownMenuItem key={r} onClick={() => setRole(r)}>
                      <span>{ROLE_LABEL[r]}</span>
                      {r === role && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="text-muted-foreground ml-auto"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="bg-muted/40 rounded-md border p-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <HugeiconsIcon
                    icon={Link01Icon}
                    className="text-muted-foreground size-3.5"
                  />
                  <span className="text-muted-foreground truncate">
                    {inviteLink}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyLink}
                  className="h-6 shrink-0 px-2 text-xs"
                >
                  {copied ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {sent === null && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!canSend}>
              Send invites
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
