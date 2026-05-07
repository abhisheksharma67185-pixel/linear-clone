"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Hash, Link2, Lock, Plus, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Channel = {
  id: string
  name: string
  type: "public" | "private"
  isArchived: boolean
}

type Workspace = { name: string; urlKey?: string }

type InviteRole = "admin" | "member" | "guest"

const ROLES: { value: InviteRole; label: string; description: string }[] = [
  {
    value: "member",
    label: "Member",
    description: "Full access to public channels.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Member access plus workspace administration.",
  },
  {
    value: "guest",
    label: "Multi-channel guest",
    description: "Access only to specific channels.",
  },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InvitePeopleDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [emails, setEmails] = useState("")
  const [role, setRole] = useState<InviteRole>("member")
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([])
  const [externalHintDismissed, setExternalHintDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return
    Promise.all([
      fetch("/api/data/workspace").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
    ]).then(([w, c]) => {
      setWorkspace(w as Workspace)
      setChannels((c as Channel[]).filter((ch) => !ch.isArchived))
    })
  }, [open])

  useEffect(() => {
    if (!open) {
      // Reset on close so re-opening is clean.
      setEmails("")
      setRole("member")
      setSelectedChannelIds([])
      setExternalHintDismissed(false)
    }
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  const placeholder = workspace?.urlKey
    ? `name@${workspace.urlKey}.tech`
    : "name@thetalab.tech"

  // Parse the textarea: split on commas / whitespace, dedupe (case-insensitive),
  // separate valid from invalid for inline feedback before sending.
  const parsed = useMemo(() => {
    const parts = emails
      .split(/[\s,;\n]+/)
      .map((p) => p.trim())
      .filter(Boolean)
    const seen = new Set<string>()
    const valid: string[] = []
    const invalid: string[] = []
    for (const p of parts) {
      const k = p.toLowerCase()
      if (seen.has(k)) continue
      seen.add(k)
      if (EMAIL_RE.test(p)) valid.push(p)
      else invalid.push(p)
    }
    return { valid, invalid }
  }, [emails])

  const selectedSet = useMemo(
    () => new Set(selectedChannelIds),
    [selectedChannelIds]
  )

  // Suggested = up to 3 currently-active channels not already selected.
  const suggestedChannels = useMemo(
    () => channels.filter((c) => !selectedSet.has(c.id)).slice(0, 3),
    [channels, selectedSet]
  )

  const selectedChannels = useMemo(
    () =>
      selectedChannelIds
        .map((id) => channels.find((c) => c.id === id))
        .filter((c): c is Channel => Boolean(c)),
    [channels, selectedChannelIds]
  )

  const addChannel = (id: string) =>
    setSelectedChannelIds((cur) => (cur.includes(id) ? cur : [...cur, id]))
  const removeChannel = (id: string) =>
    setSelectedChannelIds((cur) => cur.filter((x) => x !== id))

  const copyInviteLink = async () => {
    const link = workspace?.urlKey
      ? `https://${workspace.urlKey}.slack.com/signup`
      : "https://thetalab.slack.com/signup"
    try {
      await navigator.clipboard.writeText(link)
      toast.success("Invite link copied")
    } catch {
      toast.error("Couldn't copy — copy manually: " + link)
    }
  }

  const send = async () => {
    if (parsed.valid.length === 0) {
      toast.error("Add at least one valid email")
      return
    }
    setSending(true)
    // No /invites endpoint in the mock — just acknowledge. A future
    // version could persist these as `members-admin` invites so they
    // show up under the admin people list.
    await new Promise((r) => setTimeout(r, 300))
    setSending(false)
    toast.success(
      `Invited ${parsed.valid.length} ${parsed.valid.length === 1 ? "person" : "people"}`
    )
    onOpenChange(false)
  }

  const roleInfo = ROLES.find((r) => r.value === role)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Invite people to {workspace?.name ?? "this workspace"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="invite-emails"
              className="text-sm font-semibold text-foreground"
            >
              To:
            </label>
            <Textarea
              id="invite-emails"
              autoFocus
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="resize-none text-sm"
            />
            {parsed.invalid.length > 0 ? (
              <p className="text-xs text-destructive">
                Not valid: {parsed.invalid.join(", ")}
              </p>
            ) : null}
          </div>

          <div className="relative my-1 text-center text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
            <span className="bg-background px-3">OR</span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-center gap-2 font-semibold"
          >
            <span
              aria-hidden
              className="grid size-4 grid-cols-2 grid-rows-2 gap-px"
            >
              <span className="bg-[#4285F4]" />
              <span className="bg-[#EA4335]" />
              <span className="bg-[#FBBC05]" />
              <span className="bg-[#34A853]" />
            </span>
            Continue with Google Workspace
          </Button>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Invite as:
            </label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as InviteRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {roleInfo ? (
              <p className="text-xs text-muted-foreground">
                {roleInfo.description}
              </p>
            ) : null}
          </div>

          {!externalHintDismissed ? (
            <div className="flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <p className="flex-1 leading-relaxed">
                <span className="font-semibold text-foreground">
                  Working with people from external organizations?
                </span>{" "}
                See options for inviting them to your channel with{" "}
                <a
                  href="#"
                  className="font-semibold text-primary hover:underline"
                >
                  Slack Connect
                </a>{" "}
                or{" "}
                <a
                  href="#"
                  className="font-semibold text-primary hover:underline"
                >
                  guest accounts
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => setExternalHintDismissed(true)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Add to team channels{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Make sure your teammates are in the right conversations from the
                get-go.
              </p>
            </div>

            {suggestedChannels.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground">Suggested:</span>
                {suggestedChannels.map((c) => {
                  const Icon = c.type === "private" ? Lock : Hash
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => addChannel(c.id)}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Plus className="size-3" />
                      <Icon className="size-3" />
                      {c.name}
                    </button>
                  )
                })}
              </div>
            ) : null}

            <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-border px-2 py-1.5">
              {selectedChannels.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  No channels selected
                </span>
              ) : (
                selectedChannels.map((c) => {
                  const Icon = c.type === "private" ? Lock : Hash
                  return (
                    <span
                      key={c.id}
                      className="flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs"
                    >
                      <Icon className="size-3" />
                      {c.name}
                      <button
                        type="button"
                        onClick={() => removeChannel(c.id)}
                        aria-label={`Remove ${c.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <button
              type="button"
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Link2 className="size-3.5" />
              Copy invite link
              <span className="text-muted-foreground">
                {" "}
                – Edit link settings
              </span>
            </button>
            <Button
              onClick={send}
              disabled={parsed.valid.length === 0 || sending}
              className={cn(parsed.valid.length === 0 && "opacity-60")}
            >
              {sending ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>

        {/* Invisible role-explanation chevron — keeps the layout dense. */}
        <ChevronDown className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
