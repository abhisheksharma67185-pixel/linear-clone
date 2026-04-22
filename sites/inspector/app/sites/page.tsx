"use client"

import * as React from "react"
import {
  IconCheck,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StatusDot } from "@/components/status-dot"
import { PageShell } from "@/components/page-shell"
import { useSitesStore, DEFAULT_SITES } from "@/lib/sites-store"
import { useHealth } from "@/lib/hooks"
import { relativeTime } from "@/lib/format"
import type { SiteConnection } from "@/lib/types"

function HealthCell({ site }: { site: SiteConnection }) {
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } =
    useHealth(site)
  const status = isLoading
    ? "loading"
    : isError
    ? "error"
    : data?.status === "ok"
    ? "ok"
    : "warn"

  return (
    <div className="flex items-center gap-3">
      <StatusDot status={status} />
      <div className="min-w-0">
        <div className="text-sm font-medium capitalize">
          {isLoading ? "checking…" : isError ? "down" : data?.status}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {dataUpdatedAt
            ? `last seen ${relativeTime(new Date(dataUpdatedAt).toISOString())}`
            : "—"}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => refetch()}
        aria-label="Re-check health"
        disabled={isFetching}
      >
        <IconRefresh className={isFetching ? "animate-spin size-3" : "size-3"} />
      </Button>
    </div>
  )
}

function TaskCount({ site }: { site: SiteConnection }) {
  const { data, isLoading, isError } = useHealth(site)
  if (isLoading) return <Skeleton className="h-4 w-10" />
  if (isError || !data) return <span className="text-muted-foreground">—</span>
  return <span className="font-mono">{data.tasks}</span>
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

function AddSiteForm() {
  const addSite = useSitesStore((s) => s.addSite)
  const [name, setName] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Name is required")
      return
    }
    if (!isValidUrl(url)) {
      setError("URL must be an absolute http(s) URL")
      return
    }
    setError(null)
    addSite({ name: name.trim(), url: url.trim().replace(/\/$/, "") })
    toast.success(`Added ${name.trim()}`)
    setName("")
    setUrl("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconPlus className="size-4" /> Add a site
        </CardTitle>
        <CardDescription>
          Sites are stored locally in your browser. URLs should be the site&apos;s
          base URL (no trailing path).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={onSubmit}
          className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="site-name">Name</Label>
            <Input
              id="site-name"
              placeholder="e.g. zendesk"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site-url">URL</Label>
            <Input
              id="site-url"
              placeholder="http://localhost:3004"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button type="submit">Add site</Button>
        </form>
        {error && (
          <p className="text-destructive text-xs mt-2" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function EditableRow({ site }: { site: SiteConnection }) {
  const updateSite = useSitesStore((s) => s.updateSite)
  const removeSite = useSitesStore((s) => s.removeSite)
  const [editing, setEditing] = React.useState(false)
  const [draftName, setDraftName] = React.useState(site.name)
  const [draftUrl, setDraftUrl] = React.useState(site.url)

  const onSave = () => {
    if (!draftName.trim()) {
      toast.error("Name required")
      return
    }
    if (!isValidUrl(draftUrl)) {
      toast.error("URL must be absolute http(s)")
      return
    }
    updateSite(site.id, {
      name: draftName.trim(),
      url: draftUrl.trim().replace(/\/$/, ""),
    })
    toast.success("Site updated")
    setEditing(false)
  }

  const onCancel = () => {
    setDraftName(site.name)
    setDraftUrl(site.url)
    setEditing(false)
  }

  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {site.id}
      </TableCell>
      <TableCell>
        {editing ? (
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="h-8"
          />
        ) : (
          <span className="font-medium">{site.name}</span>
        )}
      </TableCell>
      <TableCell className="max-w-[260px]">
        {editing ? (
          <Input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        ) : (
          <span className="font-mono text-xs truncate inline-block max-w-full">
            {site.url}
          </span>
        )}
      </TableCell>
      <TableCell>
        <HealthCell site={site} />
      </TableCell>
      <TableCell>
        <TaskCount site={site} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          {editing ? (
            <>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={onSave}
                aria-label="Save"
              >
                <IconCheck className="size-3" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={onCancel}
                aria-label="Cancel"
              >
                <IconX className="size-3" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label="Edit"
                onClick={() => setEditing(true)}
              >
                <IconPencil className="size-3" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label="Remove"
                onClick={() => {
                  if (
                    confirm(
                      `Remove "${site.name}"? Local history is preserved.`,
                    )
                  ) {
                    removeSite(site.id)
                    toast.success("Site removed")
                  }
                }}
              >
                <IconTrash className="size-3 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function SitesPage() {
  const sites = useSitesStore((s) => s.sites)
  const resetDefaults = useSitesStore((s) => s.resetDefaults)
  const hydrated = useSitesStore((s) => s.hydrated)

  return (
    <PageShell
      title="Sites"
      description="Manage the ThetaBench site connections inspector talks to."
      actions={
        <Button
          variant="outline"
          onClick={() => {
            resetDefaults()
            toast.success("Defaults restored")
          }}
        >
          Reset to defaults
        </Button>
      }
    >
      <div className="space-y-6">
        <AddSiteForm />

        <Card>
          <CardHeader>
            <CardTitle>Configured sites ({sites.length})</CardTitle>
            <CardDescription>
              Defaults: {DEFAULT_SITES.map((s) => s.id).join(", ")}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hydrated ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sites.length === 0 ? (
              <Alert>
                <AlertTitle>No sites</AlertTitle>
                <AlertDescription>
                  Click <Badge variant="outline">Reset to defaults</Badge> or add
                  one above.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site) => (
                    <EditableRow key={site.id} site={site} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
