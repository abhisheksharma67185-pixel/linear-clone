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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open])

  const commitDraft = () => {
    const trimmed = draft.trim().replace(/,$/, "")
    if (!trimmed) return
    if (!EMAIL_RE.test(trimmed)) return
    if (emails.includes(trimmed)) {
      setDraft("")
      return
    }
    setEmails((prev) => [...prev, trimmed])
    setDraft("")
  }

  const removeEmail = (email: string) =>
    setEmails((prev) => prev.filter((e) => e !== email))

  const canSend = emails.length > 0 || EMAIL_RE.test(draft.trim())

  const handleSend = () => {
    const final = [...emails]
    const t = draft.trim()
    if (t && EMAIL_RE.test(t) && !final.includes(t)) final.push(t)
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
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
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
