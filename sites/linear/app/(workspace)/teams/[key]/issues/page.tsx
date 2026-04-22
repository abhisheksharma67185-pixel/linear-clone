"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FilterIcon,
  SlidersHorizontalIcon,
  PanelRightIcon,
  Layers01Icon,
  PlusSignIcon,
  UserIcon,
  Notification01Icon,
} from "@hugeicons/core-free-icons"

const ASSIGNEE = {
  name: "Abhishek",
  avatar: "",
  initials: "AB",
}

const ISSUES = [
  {
    id: "abh-1",
    identifier: "ABH-1",
    title: "Get familiar with Linear",
    date: "Apr 21",
  },
  {
    id: "abh-2",
    identifier: "ABH-2",
    title: "Set up your teams",
    date: "Apr 21",
  },
  {
    id: "abh-3",
    identifier: "ABH-3",
    title: "Connect your tools",
    date: "Apr 21",
  },
  {
    id: "abh-4",
    identifier: "ABH-4",
    title: "Import your data",
    date: "Apr 21",
  },
]

export default function TeamIssuesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "backlog">(
    "active"
  )
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-pink-500/70 text-pink-500">
            <HugeiconsIcon icon={UserIcon} className="size-2.5" />
          </span>
          <h1 className="text-sm font-medium">Issues</h1>
          <button
            type="button"
            className="text-muted-foreground/50 hover:text-foreground ml-0.5"
          >
            <svg
              viewBox="0 0 16 16"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 2l.8 2.4L11 4l-1.8 1.4.6 2.4L8 6.5 6.2 7.8l.6-2.4L5 4l2.2.4z" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={Notification01Icon} className="size-4" />
        </button>
      </header>

      {/* Tabs + toolbar */}
      <div className="flex items-center justify-between border-b px-4">
        <div className="flex items-center gap-0.5">
          {(["all", "active", "backlog"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {tab === "all"
                ? "All issues"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button
            type="button"
            className="text-muted-foreground hover:bg-accent hover:text-foreground ml-1 flex size-6 items-center justify-center rounded"
          >
            <HugeiconsIcon icon={Layers01Icon} className="size-3" />
          </button>
        </div>
        <div className="text-muted-foreground flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="size-7">
            <HugeiconsIcon icon={FilterIcon} className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7">
            <HugeiconsIcon icon={SlidersHorizontalIcon} className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7">
            <HugeiconsIcon icon={PanelRightIcon} className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Group header */}
        <div className="group hover:bg-accent/30 flex items-center gap-2 px-5 py-2">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <svg
              viewBox="0 0 8 8"
              className={`text-muted-foreground/70 size-2 shrink-0 fill-current transition-transform ${
                collapsed ? "-rotate-90" : ""
              }`}
            >
              <path d="M1 2 L7 2 L4 6 Z" />
            </svg>
            <StatusCircle />
            <span>Todo</span>
            <span className="text-muted-foreground ml-0.5 text-xs font-normal">
              {ISSUES.length}
            </span>
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:bg-accent hover:text-foreground ml-auto flex size-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
          >
            <HugeiconsIcon icon={PlusSignIcon} className="size-3" />
          </button>
        </div>

        {/* Issue rows */}
        {!collapsed &&
          ISSUES.map((issue) => (
            <div
              key={issue.id}
              className="group hover:bg-accent/40 flex items-center gap-2 border-b border-transparent px-5 py-2 transition-colors"
            >
              {/* Checkbox (shows on hover) */}
              <div className="flex size-4 shrink-0 items-center justify-center">
                <div className="border-muted-foreground/30 flex size-3.5 items-center justify-center rounded border opacity-0 group-hover:opacity-100"></div>
              </div>
              {/* Priority */}
              <PriorityDots />
              {/* Identifier */}
              <span className="text-muted-foreground w-12 font-mono text-[11px]">
                {issue.identifier}
              </span>
              {/* Status */}
              <StatusCircle />
              {/* Title */}
              <span className="flex-1 truncate text-sm">{issue.title}</span>
              {/* Assignee */}
              <Avatar className="size-5">
                <AvatarFallback className="bg-violet-600 text-[9px] text-white">
                  {ASSIGNEE.initials}
                </AvatarFallback>
              </Avatar>
              {/* Date */}
              <span className="text-muted-foreground w-12 text-right text-xs">
                {issue.date}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}

function StatusCircle() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="text-muted-foreground/60 size-3.5 shrink-0"
      fill="none"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function PriorityDots() {
  return (
    <span className="text-muted-foreground/50 flex items-center gap-[2px]">
      <span className="block size-[3px] rounded-full bg-current" />
      <span className="block size-[3px] rounded-full bg-current" />
      <span className="block size-[3px] rounded-full bg-current" />
    </span>
  )
}
