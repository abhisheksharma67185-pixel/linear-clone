"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

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
  const [sent, setSent] = useState<number | null>(null)
  // Last validation error surfaced to the user. Cleared whenever the
  // user types, so error state never blocks them once they correct
  // the input. Set on Enter/comma/blur if the draft fails validation.
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset form fields when the dialog closes.
  useEffect(() => {
    if (!open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setDraft("")
      setEmails([])
      setSent(null)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Keep "Invite people" as the accessible name so existing
        // selectors (`getByRole('dialog', { name: /Invite people/i })`)
        // still match even though the visible heading reads
        // "Invite to your workspace".
        aria-label="Invite people"
        className="sm:max-w-[520px]"
      >
        <DialogTitle className="sr-only">Invite people</DialogTitle>

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
          <>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-500 to-pink-500 text-[10px] font-semibold text-white"
              >
                AB
              </span>
              <h2 className="text-base font-medium">
                Invite to your workspace
              </h2>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="invite-emails" className="text-sm font-medium">
                Email
              </label>
              <div
                className="focus-within:ring-ring/40 flex min-h-10 flex-wrap items-center gap-1 rounded-md border bg-transparent px-2.5 py-1.5 focus-within:ring-2"
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
                  type="email"
                  multiple
                  data-testid="invite-emails-input"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "invite-emails-error" : undefined}
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
                    emails.length ? "" : "email@gmail.com, email2@gmail.com…"
                  }
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

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSend}
                disabled={!canSend}
                className="rounded-full bg-violet-600 px-5 text-white hover:bg-violet-500"
              >
                Send invites
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
