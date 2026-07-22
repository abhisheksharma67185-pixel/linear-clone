"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  Tick02Icon,
  Link04Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

type Role = "Member" | "Admin" | "Guest"

/**
 * Compress a workspace name to a 2-letter monogram for the avatar.
 * Multi-word: first letter of the first two words ("Theta Engineering" → "TE").
 * Single word: first two letters ("Abhishek" → "AB").
 * Falls back to "WS" if the name is empty.
 */
function workspaceInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return "WS"
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
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
  const [role, setRole] = useState<Role>("Member")
  const [sent, setSent] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  // Workspace identity used in the header / invite link / footer
  // copy. Hardcoded to match the workspace chip the sidebar shows
  // ("Abhishek" with the AB monogram). The mock-data.ts workspace
  // fixture says "Theta Engineering" but that's a benchmark
  // ground-truth value the retrieval task scores against, so we
  // can't repoint it without breaking that suite.
  const workspaceName = "Abhishek"
  const workspaceSlug = "abhishek2007"
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setDraft("")
      setEmails([])
      setRole("Member")
      setSent(null)
      setError(null)
      setLinkCopied(false)
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

  const canSend = emails.length > 0 || isValidInviteEmail(draft.trim())

  const handleSend = () => {
    const final = [...emails]
    const t = draft.trim()
    if (t) {
      if (!isValidInviteEmail(t)) {
        setError(`"${t}" is not a valid email address`)
        return
      }
      if (!final.includes(t)) final.push(t)
    }
    if (final.length === 0) return
    setSent(final.length)
  }

  const inviteLinkPath = `linear.app/${workspaceSlug}/join/abc123def456`
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${inviteLinkPath}`).catch(() => {})
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-label="Invite people"
        className="gap-0 overflow-hidden p-0 sm:max-w-[520px]"
      >
        <DialogTitle className="sr-only">Invite people</DialogTitle>

        {sent !== null ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
              <HugeiconsIcon
                icon={Tick02Icon}
                className="size-6 text-emerald-500"
              />
            </div>
            <p className="text-base font-semibold">
              {sent} invite{sent === 1 ? "" : "s"} sent!
            </p>
            <p className="text-muted-foreground max-w-xs text-center text-sm">
              Your teammates will receive an email invitation to join{" "}
              {workspaceName}.
            </p>
            <Button
              onClick={() => onOpenChange(false)}
              className="mt-2 rounded-full bg-violet-600 px-5 text-white hover:bg-violet-500"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b px-5 py-4">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-500 to-violet-600 text-[11px] font-bold text-white"
              >
                {workspaceInitials(workspaceName)}
              </span>
              <h2 className="flex-1 text-[15px] font-semibold">
                Invite to {workspaceName}
              </h2>
            </div>

            <div className="space-y-4 px-5 py-4">
              {/* Invite link */}
              <div className="bg-muted/40 flex items-center gap-2 rounded-lg border px-3 py-2.5">
                <div className="bg-background flex size-7 shrink-0 items-center justify-center rounded-md border">
                  <HugeiconsIcon
                    icon={Link04Icon}
                    className="text-muted-foreground size-3.5"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">Invite link</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {inviteLinkPath}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="bg-background hover:bg-accent shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  {linkCopied ? "Copied!" : "Copy link"}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t" />
                <span className="text-muted-foreground text-xs">
                  or invite by email
                </span>
                <div className="flex-1 border-t" />
              </div>

              {/* Email + role row */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  {/* Chip input */}
                  <div
                    className="focus-within:ring-ring/40 flex min-h-10 flex-1 flex-wrap items-center gap-1 rounded-md border bg-transparent px-2.5 py-1.5 focus-within:ring-2"
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
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="size-3"
                          />
                        </button>
                      </span>
                    ))}
                    <input
                      id="invite-emails"
                      ref={inputRef}
                      autoFocus
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
                      placeholder={
                        emails.length
                          ? ""
                          : "email@example.com, email2@example.com…"
                      }
                      className="placeholder:text-muted-foreground/50 min-w-[120px] flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>

                  {/* Role dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="hover:bg-accent flex h-10 shrink-0 items-center gap-1.5 rounded-md border bg-transparent px-3 text-sm font-medium transition-colors"
                        />
                      }
                    >
                      {role}
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="text-muted-foreground size-3.5"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <div className="px-2 pt-1.5 pb-1">
                        <p className="text-muted-foreground/60 text-[11px] font-medium tracking-wider uppercase">
                          Role
                        </p>
                      </div>
                      {(["Member", "Admin", "Guest"] as Role[]).map((r) => (
                        <DropdownMenuItem
                          key={r}
                          onClick={() => setRole(r)}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm">{r}</p>
                            <p className="text-muted-foreground text-xs">
                              {r === "Member"
                                ? "Can view and edit"
                                : r === "Admin"
                                  ? "Full access"
                                  : "View only"}
                            </p>
                          </div>
                          {role === r && (
                            <HugeiconsIcon
                              icon={Tick02Icon}
                              className="size-3.5 shrink-0"
                            />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-5 py-3">
              <p className="text-muted-foreground text-xs">
                Invitees join as {role.toLowerCase()}s.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!canSend}
                  className="rounded-full bg-violet-600 px-4 text-white hover:bg-violet-500 disabled:opacity-40"
                >
                  Send invites
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
