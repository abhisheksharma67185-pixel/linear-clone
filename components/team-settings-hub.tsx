"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Settings02Icon,
  UserMultiple02Icon,
  Notification01Icon,
  LabelIcon,
  FileAddIcon,
  Activity03Icon,
  CheckmarkCircle02Icon,
  ZapIcon,
  FireIcon,
  Chart01Icon,
  AiBrain01Icon,
  SmileIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  TEAM_DANGER_ACTIONS,
  TEAM_HUB_GROUPS,
  sectionValueLabel,
  validateTeamNameMatch,
  type TeamDangerAction,
  type TeamHubSection,
  type TeamHubSectionSummary,
} from "@/lib/team-hub"

const SECTION_ICONS: Record<TeamHubSection["id"], typeof Settings02Icon> = {
  general: Settings02Icon,
  members: UserMultiple02Icon,
  notifications: Notification01Icon,
  "issue-labels": LabelIcon,
  templates: FileAddIcon,
  "recurring-issues": Activity03Icon,
  statuses: CheckmarkCircle02Icon,
  workflow: ZapIcon,
  triage: FireIcon,
  cycles: Chart01Icon,
  agents: AiBrain01Icon,
  "discussion-summaries": SmileIcon,
}

export type TeamRef = { id: string; name: string; key: string }

export function TeamSettingsHub({ team }: { team: TeamRef }) {
  const [summary, setSummary] = useState<TeamHubSectionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [danger, setDanger] = useState<TeamDangerAction | null>(null)
  const teamIdSegment = team.key.toUpperCase()

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/${team.id}/sections`)
      if (!res.ok) throw new Error()
      setSummary((await res.json()) as TeamHubSectionSummary)
    } catch {
      // Silent — the rows just render without their trailing value.
    } finally {
      setLoading(false)
    }
  }, [team.id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load on mount
    void load()
  }, [load])

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      {/* Breadcrumb — real Link so browser back + open-in-new-tab work. */}
      <Link
        href="/settings?section=teams"
        scroll={false}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex w-fit items-center gap-1.5 rounded-sm text-xs focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Back to Teams"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Teams
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-rose-400/50 text-rose-400">
          <HugeiconsIcon icon={UserMultiple02Icon} className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold">{team.name}</h1>
          <p className="text-muted-foreground text-xs">Team settings</p>
        </div>
      </div>

      {/* Navigation groups */}
      {TEAM_HUB_GROUPS.map((group, gi) => (
        <section key={gi} className="flex flex-col gap-2">
          {group.title && (
            <h2 className="text-muted-foreground text-xs font-semibold">
              {group.title}
            </h2>
          )}
          <div className="divide-border flex flex-col divide-y overflow-hidden rounded-lg border">
            {group.sections.map((section) => {
              const value = sectionValueLabel(section, summary)
              return (
                <Link
                  key={section.id}
                  href={`/settings/teams/${teamIdSegment}/${section.id}`}
                  scroll={false}
                  aria-label={`Open ${section.label} settings`}
                  className="bg-card focus-visible:ring-ring group flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <HugeiconsIcon
                    icon={SECTION_ICONS[section.id]}
                    className="text-muted-foreground size-4 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{section.label}</div>
                    <div className="text-muted-foreground text-xs">
                      {section.subtitle}
                    </div>
                  </div>
                  {section.valueKey && (
                    <div className="text-muted-foreground flex shrink-0 items-center text-xs">
                      {loading ? (
                        <Skeleton className="h-3.5 w-12 rounded" />
                      ) : (
                        <span>{value}</span>
                      )}
                    </div>
                  )}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="text-muted-foreground/50 size-3.5 shrink-0"
                  />
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      {/* Team hierarchy */}
      <section className="flex flex-col gap-2">
        <h2 className="text-muted-foreground text-xs font-semibold">
          Team hierarchy
        </h2>
        <p className="text-muted-foreground text-xs">
          Teams can be nested to reflect your team structure and to share
          workflows and settings.{" "}
          <a
            href="https://linear.app/docs/team-hierarchy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Team hierarchy documentation (opens in new tab)"
            className="text-foreground font-medium underline-offset-2 hover:underline"
          >
            Docs <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </p>
        <div className="rounded-lg border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium">Parent team</div>
              <div className="text-muted-foreground text-xs">
                Organize this team under a parent
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 cursor-default text-xs opacity-50"
              disabled
            >
              Available on Business
            </Button>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="flex flex-col gap-2">
        <h2 className="text-muted-foreground text-xs font-semibold">
          Danger zone
        </h2>
        <div className="border-destructive/20 divide-destructive/10 divide-y overflow-hidden rounded-lg border">
          {TEAM_DANGER_ACTIONS.map((action) => (
            <div
              key={action.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-muted-foreground text-xs">
                  {action.subtitle}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDanger(action.id)}
                aria-label={action.button}
                className="text-destructive border-destructive/30 hover:bg-destructive/10 h-7 text-xs"
              >
                {action.button}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <TeamDangerDialog
        key={danger ?? "closed"}
        action={danger}
        team={team}
        onClose={() => setDanger(null)}
      />
    </div>
  )
}

function TeamDangerDialog({
  action,
  team,
  onClose,
}: {
  action: TeamDangerAction | null
  team: TeamRef
  onClose: () => void
}) {
  const [confirmText, setConfirmText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!action) {
    return (
      <Dialog open={false} onOpenChange={onClose}>
        <DialogContent />
      </Dialog>
    )
  }

  const config = TEAM_DANGER_ACTIONS.find((a) => a.id === action)!
  const requiresTyping = action === "delete"
  const canConfirm =
    !submitting &&
    (!requiresTyping || validateTeamNameMatch(confirmText, team.name))

  const onConfirm = async () => {
    if (!canConfirm) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: config.apiAction }),
      })
      if (!res.ok) throw new Error()
      toast.success(
        action === "leave"
          ? `Left ${team.name}`
          : action === "retire"
            ? `${team.name} retired`
            : `${team.name} scheduled for deletion`
      )
      onClose()
    } catch {
      toast.error("Action failed")
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === "leave" && `Leave ${team.name}?`}
            {action === "retire" && `Retire ${team.name}?`}
            {action === "delete" && `Delete ${team.name}?`}
          </DialogTitle>
          <DialogDescription>
            {action === "leave" &&
              `You'll lose access to ${team.name}'s team-only views and issues. You can be re-added by a team admin.`}
            {action === "retire" &&
              "Retired teams preserve all historical data — existing issues, comments, and attachments stay accessible and searchable. Creating new issues is disabled until the team is restored."}
            {action === "delete" &&
              `Permanently delete ${team.name} and all of its data. Linear keeps a 30-day restoration window before full purge. Type the team name to confirm.`}
          </DialogDescription>
        </DialogHeader>

        {requiresTyping && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-delete-confirm">
              Team name to confirm deletion
            </Label>
            <Input
              id="team-delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={team.name}
              autoComplete="off"
              aria-invalid={
                confirmText.length > 0 && !canConfirm ? true : undefined
              }
              className="font-mono text-sm"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={
              action === "delete"
                ? "bg-destructive hover:bg-destructive/90 text-white"
                : undefined
            }
          >
            {submitting
              ? "Working…"
              : action === "leave"
                ? "Leave"
                : action === "retire"
                  ? "Retire"
                  : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
