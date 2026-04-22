"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FilterIcon,
  Settings02Icon,
  MoreHorizontalIcon,
  PlayIcon,
  Clock01Icon,
  Layers01Icon,
  InboxCheckIcon,
  Message01Icon,
  UserMultiple02Icon,
  Hexagon01Icon,
  UserIcon,
  BarChartIcon,
  CircleIcon,
  Satellite01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

type Notification = {
  id: string
  title: string
  preview: string
  ago: string
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "welcome",
    title: "Welcome to Linear",
    preview: "Watch an introductory video and access a list o…",
    ago: "20min",
  },
]

const RESOURCES = [
  {
    title: "Join a live onboarding session",
    description: "Learn the essentials and see demos of core workflows",
  },
  {
    title: "Join our Slack community",
    description: "Connect with other Linear users and get tips",
  },
  {
    title: "Onboarding videos",
    description: "Everything you need to know to get started with Linear",
  },
]

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | null>("welcome")
  const selected = NOTIFICATIONS.find((n) => n.id === selectedId) ?? null

  return (
    <div className="flex h-full min-h-0 flex-1">
      <aside className="flex w-[320px] shrink-0 flex-col border-r">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-1">
            <h1 className="text-sm font-medium">Inbox</h1>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-6"
                  />
                }
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>
                  <HugeiconsIcon icon={InboxCheckIcon} className="size-4" />
                  <span className="flex-1">Delete all</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={InboxCheckIcon} className="size-4" />
                  <span className="flex-1">Delete all read</span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    ⇧⌫
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-muted-foreground flex items-center gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-7" />
                }
              >
                <HugeiconsIcon icon={FilterIcon} className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-0">
                <div className="text-muted-foreground flex items-center justify-between border-b px-2 py-1.5 text-xs">
                  <span>Add Filter...</span>
                  <span className="rounded border px-1 font-mono text-[10px]">
                    F
                  </span>
                </div>
                <div className="p-1">
                  {[
                    { icon: Message01Icon, label: "Notification type" },
                    { icon: UserIcon, label: "From" },
                    { icon: UserMultiple02Icon, label: "Team" },
                    { icon: Hexagon01Icon, label: "Project" },
                    { icon: Satellite01Icon, label: "Initiative" },
                    { icon: BarChartIcon, label: "Issue priority" },
                    { icon: CircleIcon, label: "Issue status type" },
                  ].map((f) => (
                    <button
                      key={f.label}
                      type="button"
                      className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs"
                    >
                      <HugeiconsIcon
                        icon={f.icon}
                        className="text-muted-foreground size-3.5"
                      />
                      <span className="flex-1 text-left">{f.label}</span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="text-muted-foreground size-3"
                      />
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="size-7">
              <HugeiconsIcon icon={Settings02Icon} className="size-4" />
            </Button>
          </div>
        </header>

        <ul className="flex flex-1 flex-col overflow-auto">
          {NOTIFICATIONS.map((n) => {
            const active = n.id === selectedId
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(n.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                    active ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <div className="bg-foreground text-background mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                    <HugeiconsIcon icon={Layers01Icon} className="size-3.5" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {n.preview}
                      </p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-[10px]">
                      {n.ago}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className="relative flex flex-1 flex-col">
        <div className="text-muted-foreground flex items-center justify-end gap-0.5 border-b px-4 py-2">
          <Button variant="ghost" size="icon" className="size-7">
            <HugeiconsIcon icon={Clock01Icon} className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7">
            <HugeiconsIcon icon={Settings02Icon} className="size-4" />
          </Button>
        </div>

        {selected ? <WelcomeContent /> : <EmptyInbox />}
      </section>
    </div>
  )
}

function EmptyInbox() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <svg
        viewBox="0 0 96 72"
        className="text-muted-foreground/50 h-16 w-20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 24 L24 24 L30 36 L66 36 L72 24 L92 24 L92 60 C92 63 90 65 87 65 L9 65 C6 65 4 63 4 60 Z" />
        <path d="M4 24 L16 6 L80 6 L92 24" />
      </svg>
      <p className="text-muted-foreground text-xs">No unread notifications</p>
    </div>
  )
}

function WelcomeContent() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-2xl px-12 py-10">
        <div className="bg-foreground text-background mb-6 flex size-10 items-center justify-center rounded-full">
          <HugeiconsIcon icon={Layers01Icon} className="size-5" />
        </div>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight">
          Welcome to Linear
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Watch an introductory video and access a list of resources below.
        </p>

        <div className="bg-muted/30 mb-10 overflow-hidden rounded-lg border">
          <div className="flex aspect-video items-center justify-center">
            <div className="bg-foreground flex size-16 items-center justify-center rounded-full">
              <HugeiconsIcon
                icon={PlayIcon}
                className="text-background size-6 translate-x-0.5"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-base font-semibold">Resources</h2>
          <ul className="flex flex-col gap-4">
            {RESOURCES.map((r) => (
              <li key={r.title} className="flex items-baseline gap-2">
                <span className="text-muted-foreground">•</span>
                <div>
                  <button className="text-sm text-violet-600 hover:underline">
                    {r.title}
                  </button>
                  <p className="text-muted-foreground text-xs">
                    {r.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
