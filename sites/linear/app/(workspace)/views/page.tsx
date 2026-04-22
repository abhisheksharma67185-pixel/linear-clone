"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { View, Member, Issue, Cycle, Label } from "@/app/lib/mock-data"
import { filterIssuesForView as _filterIssuesForView } from "@/lib/view-filter"
import { CreateViewDialog } from "@/components/create-view-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { IconPickerPopover } from "@/components/icon-picker-popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  SlidersHorizontalIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"

const WORKSPACE_NAME = "Theta Computers"
const WORKSPACE_INITIALS = "TC"

export default function ViewsPage() {
  const [views, setViews] = useState<View[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"issues" | "projects">("issues")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/data/views").then((r) => r.json()),
      fetch("/api/data/members").then((r) => r.json()),
      fetch("/api/data/issues").then((r) => r.json()),
      fetch("/api/data/cycles").then((r) => r.json()),
      fetch("/api/data/labels").then((r) => r.json()),
    ]).then(([v, m, i, c, l]) => {
      setViews(v)
      setMembers(m)
      setIssues(i)
      setCycles(c)
      setLabels(Array.isArray(l) ? l : [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2.5">
        <h1 className="text-sm font-medium">Views</h1>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setDialogOpen(true)}
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
        </Button>
      </header>

      {/* Tabs + toolbar */}
      <div className="flex items-center justify-between border-b px-4">
        <div className="flex items-center gap-0.5">
          {(["issues", "projects"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <ViewsDisplayPopover />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded" />
            ))}
          </div>
        ) : tab === "issues" ? (
          <>
            {/* Column header */}
            <div className="text-muted-foreground flex items-center border-b px-5 py-2 text-[11px]">
              <button
                type="button"
                className="hover:text-foreground flex flex-1 items-center gap-1"
              >
                Name
                <svg
                  viewBox="0 0 10 10"
                  className="size-2.5 fill-current opacity-60"
                >
                  <path d="M5 7L1 3h8z" />
                </svg>
              </button>
              <span className="w-44">Owner</span>
            </div>

            {/* Personal views section header */}
            <div className="group bg-accent/20 flex items-center gap-2 border-b px-5 py-2">
              <Avatar className="size-5 shrink-0">
                <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                  {WORKSPACE_INITIALS}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground flex-1 text-xs font-medium">
                Personal views
                <span className="ml-1.5 font-normal opacity-60">
                  · Only visible to you
                </span>
              </span>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
              </button>
            </div>

            {/* User-created views */}
            {views.map((view) => {
              const owner = members.find((m) => m.id === view.ownerId)
              return (
                <Link
                  key={view.id}
                  href={`/views/${view.id}`}
                  className="hover:bg-accent/40 flex items-center border-b px-5 py-2.5 transition-colors"
                >
                  <div className="flex flex-1 items-center gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <ViewIconPicker />
                    </div>
                    <span className="text-sm">{view.name}</span>
                  </div>
                  <div className="flex w-44 items-center gap-2">
                    {owner ? (
                      <>
                        <Avatar className="size-5">
                          <AvatarImage src={owner.avatar} />
                          <AvatarFallback className="text-[9px]">
                            {owner.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground truncate text-xs">
                          {owner.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <Avatar className="size-5">
                          <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                            {WORKSPACE_INITIALS}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground truncate text-xs">
                          {WORKSPACE_NAME}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              )
            })}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-muted-foreground text-sm">
              No project views yet
            </p>
          </div>
        )}
      </div>

      <CreateViewDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

function ViewsDisplayPopover() {
  const [grouping, setGrouping] = useState("No grouping")
  const [ordering, setOrdering] = useState("Last updated")

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="bg-muted text-muted-foreground hover:text-foreground flex size-7 items-center justify-center rounded-full"
          />
        }
      >
        <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        className="w-72 gap-0 p-0"
      >
        <div className="flex flex-col px-2.5 py-2">
          {[
            {
              label: "Grouping",
              value: grouping,
              options: ["No grouping", "Owner"],
              set: setGrouping,
            },
            {
              label: "Ordering",
              value: ordering,
              options: ["Last updated", "Name", "Created"],
              set: setOrdering,
            },
          ].map(({ label, value, options, set }) => (
            <div
              key={label}
              className="flex items-center justify-between py-1.5"
            >
              <span className="text-muted-foreground text-xs">{label}</span>
              <div className="relative">
                <select
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="bg-muted text-foreground cursor-pointer appearance-none rounded-full px-3 py-1 pr-6 text-xs font-medium focus:outline-none"
                >
                  {options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2"
                />
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ViewIconPicker() {
  return (
    <IconPickerPopover
      trigger={
        <svg
          viewBox="0 0 16 16"
          className="text-muted-foreground size-4 shrink-0"
          fill="none"
        >
          <path
            d="M2 4h12M2 8h8M2 12h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      }
    />
  )
}
