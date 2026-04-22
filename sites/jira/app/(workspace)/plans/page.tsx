"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import type { Plan } from "@/app/lib/mock-data"

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [access, setAccess] = useState<"open" | "private" | "team">("open")
  const [workType, setWorkType] = useState("space")
  const [spaceName, setSpaceName] = useState("")

  useEffect(() => {
    fetch("/api/data/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data)
        setLoading(false)
      })
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    const workSources = spaceName.trim()
      ? [
          {
            type: workType as "space" | "board" | "filter",
            name: spaceName.trim(),
          },
        ]
      : []
    const res = await fetch("/api/data/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), access, workSources }),
    })
    if (res.ok) {
      const created = await res.json()
      setPlans((prev) => [created, ...prev])
      setName("")
      setAccess("open")
      setWorkType("space")
      setSpaceName("")
      setShowCreate(false)
    }
    setSaving(false)
  }

  // ─── Full-page Create Form ──────────────────────────────────────────────
  if (showCreate) {
    return (
      <div className="fixed inset-0 z-50 flex bg-blue-50/40 dark:bg-background">
        {/* Left form panel */}
        <div className="flex w-full max-w-xl flex-col overflow-y-auto bg-card px-12 py-8">
          {/* Close */}
          <button
            onClick={() => setShowCreate(false)}
            className="mb-8 self-start rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Logo */}
          <div className="mb-6 flex items-center gap-2">
            <svg className="size-7" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient
                  id="jira-plan-logo"
                  x1="50%"
                  y1="0%"
                  x2="50%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#2684FF" />
                  <stop offset="100%" stopColor="#0052CC" />
                </linearGradient>
              </defs>
              <path
                d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z"
                fill="url(#jira-plan-logo)"
              />
            </svg>
            <span className="text-lg font-bold">Jira</span>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-2xl font-bold">Create your plan</h1>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            Visualize, plan, track, and report on work across multiple spaces,
            boards or teams.
          </p>

          {/* Required fields note */}
          <p className="mb-5 text-xs text-muted-foreground">
            Required fields are marked with an asterisk{" "}
            <span className="text-red-500">*</span>
          </p>

          {/* Name */}
          <div className="mb-5">
            <Label className="mb-1.5 text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Enter a plan name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Access */}
          <div className="mb-6">
            <Label className="mb-1.5 text-sm font-medium">
              Access <span className="text-red-500">*</span>
            </Label>
            <select
              value={access}
              onChange={(e) =>
                setAccess(e.target.value as "open" | "private" | "team")
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            >
              <option value="open">Open</option>
              <option value="private">Private</option>
              <option value="team">Team</option>
            </select>
          </div>

          {/* Add work */}
          <h3 className="mb-1 text-base font-semibold">Add work</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Include work items from multiple spaces, boards, or using filters.
          </p>

          {/* Work */}
          <div className="mb-2">
            <Label className="mb-1.5 text-sm font-medium">
              Work <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="h-10 w-36 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="space">Space</option>
                <option value="board">Board</option>
                <option value="filter">Filter</option>
              </select>
              <div className="relative flex-1">
                <Input
                  placeholder="Enter space name"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  className="pr-9"
                />
                <svg
                  className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const v = prompt("Enter additional space/board name:")
              if (v) setSpaceName((prev) => (prev ? `${prev}, ${v}` : v))
            }}
            className="mb-8 flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add more work
          </button>

          {/* Create button */}
          <div className="mt-auto pt-6">
            <Button
              className="bg-blue-600 px-6 text-white hover:bg-blue-700"
              onClick={handleCreate}
              disabled={!name.trim() || saving}
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>

        {/* Right preview panel */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="w-[560px] rounded-xl bg-card p-6 shadow-xl">
            {/* Fake plan preview header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg
                  className="size-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <svg className="h-3 w-28" viewBox="0 0 112 12">
                  <path
                    d="M0,6 Q14,1 28,6 T56,6 T84,6 T112,6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-foreground"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-8 rounded bg-muted" />
                <div className="h-3 w-8 rounded bg-muted" />
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex gap-4 border-b text-sm">
              <span className="pb-2 text-muted-foreground">Summary</span>
              <span className="border-b-2 border-foreground pb-2 font-medium">
                Timeline
              </span>
              <span className="pb-2 text-muted-foreground">Program</span>
              <span className="pb-2 text-muted-foreground">Calendar</span>
              <span className="pb-2 text-muted-foreground">Teams</span>
              <span className="pb-2 text-muted-foreground">Dependencies</span>
            </div>

            {/* Gantt chart with SVG for dependency lines */}
            <div className="relative flex flex-col gap-0">
              {/* Header row */}
              <div className="flex items-center gap-2 py-2">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="flex-1" />
                <div className="h-3 w-16 rounded bg-muted" />
              </div>

              {/* Group 1 header */}
              <div className="flex items-center gap-2 py-2">
                <svg
                  className="size-3.5 text-muted-foreground"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
                <div className="h-3 w-20 rounded bg-muted" />
              </div>

              {/* Group 1 rows */}
              {[
                {
                  color: "bg-[#6B8E23]",
                  width: "w-[180px]",
                  offset: "ml-[60px]",
                },
                {
                  color: "bg-[#6B8E23]",
                  width: "w-[170px]",
                  offset: "ml-[70px]",
                },
                {
                  color: "bg-purple-500",
                  width: "w-[60px]",
                  offset: "ml-[140px]",
                },
                {
                  color: "bg-[#556B2F]",
                  width: "w-[130px]",
                  offset: "ml-[160px]",
                },
              ].map((bar, i) => (
                <div
                  key={`g1-${i}`}
                  className="flex items-center gap-2 py-[5px]"
                >
                  <div className="h-2 w-2 rounded-sm bg-muted" />
                  <div className="h-3 w-[90px] rounded bg-muted" />
                  <div className="size-5 rounded-full bg-muted/80" />
                  <div
                    className={`h-[18px] rounded-sm ${bar.color} ${bar.width} ${bar.offset}`}
                  />
                </div>
              ))}

              {/* Dependency line between purple bar (row 3) and green bar (row 4) */}
              <svg
                className="pointer-events-none absolute"
                style={{
                  top: "188px",
                  left: "280px",
                  width: "60px",
                  height: "32px",
                }}
              >
                <path
                  d="M0,0 L0,16 Q0,24 8,24 L52,24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Group 2 header */}
              <div className="mt-1 flex items-center gap-2 py-2">
                <svg
                  className="size-3.5 text-muted-foreground"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
                <div className="h-3 w-20 rounded bg-muted" />
              </div>

              {/* Group 2 rows */}
              {[
                {
                  color: "bg-blue-500",
                  width: "w-[210px]",
                  offset: "ml-[60px]",
                },
                {
                  color: "bg-pink-500",
                  width: "w-[80px]",
                  offset: "ml-[120px]",
                },
                {
                  color: "bg-blue-400",
                  width: "w-[120px]",
                  offset: "ml-[160px]",
                },
              ].map((bar, i) => (
                <div
                  key={`g2-${i}`}
                  className="flex items-center gap-2 py-[5px]"
                >
                  <div className="h-2 w-2 rounded-sm bg-muted" />
                  <div className="h-3 w-[90px] rounded bg-muted" />
                  <div className="size-5 rounded-full bg-muted/80" />
                  <div
                    className={`h-[18px] rounded-sm ${bar.color} ${bar.width} ${bar.offset}`}
                  />
                </div>
              ))}

              {/* Dependency line in group 2 */}
              <svg
                className="pointer-events-none absolute"
                style={{
                  top: "308px",
                  left: "280px",
                  width: "60px",
                  height: "32px",
                }}
              >
                <path
                  d="M0,0 L0,16 Q0,24 8,24 L52,24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Group 3 header */}
              <div className="mt-1 flex items-center gap-2 py-2">
                <svg
                  className="size-3.5 text-muted-foreground"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
                <div className="h-3 w-20 rounded bg-muted" />
              </div>

              {/* Group 3 rows */}
              {[
                {
                  color: "bg-[#6B8E23]",
                  width: "w-[150px]",
                  offset: "ml-[120px]",
                },
                {
                  color: "bg-blue-500",
                  width: "w-[180px]",
                  offset: "ml-[100px]",
                },
                {
                  color: "bg-pink-500",
                  width: "w-[160px]",
                  offset: "ml-[140px]",
                },
              ].map((bar, i) => (
                <div
                  key={`g3-${i}`}
                  className="flex items-center gap-2 py-[5px]"
                >
                  <div className="h-2 w-2 rounded-sm bg-muted" />
                  <div className="h-3 w-[90px] rounded bg-muted" />
                  <div className="size-5 rounded-full bg-muted/80" />
                  <div
                    className={`h-[18px] rounded-sm ${bar.color} ${bar.width} ${bar.offset}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  // ─── Empty State ─────────────────────────────────────────────────────────
  if (plans.length === 0) {
    return (
      <div className="p-8">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Plans</h1>

        <div className="flex flex-col items-center justify-center py-24">
          <svg className="mb-6 size-40" viewBox="0 0 200 200" fill="none">
            <rect
              x="40"
              y="40"
              width="120"
              height="100"
              rx="8"
              fill="#DBEAFE"
            />
            <rect x="50" y="55" width="40" height="50" rx="4" fill="#93C5FD" />
            <rect x="95" y="65" width="25" height="40" rx="4" fill="#60A5FA" />
            <rect x="125" y="50" width="25" height="55" rx="4" fill="#3B82F6" />
            <polyline
              points="55,95 75,80 100,88 120,70 145,60"
              stroke="#2563EB"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="55" cy="95" r="4" fill="#2563EB" />
            <circle cx="75" cy="80" r="4" fill="#2563EB" />
            <circle cx="100" cy="88" r="4" fill="#2563EB" />
            <circle cx="120" cy="70" r="4" fill="#2563EB" />
            <circle cx="145" cy="60" r="4" fill="#2563EB" />
            <circle cx="155" cy="45" r="12" fill="#22C55E" />
            <polyline
              points="149,45 153,49 161,41"
              stroke="white"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="65" cy="145" r="8" fill="#FBBF24" />
            <rect x="57" y="155" width="16" height="20" rx="8" fill="#FBBF24" />
            <circle cx="140" cy="148" r="7" fill="#3B82F6" />
            <rect
              x="133"
              y="157"
              width="14"
              height="18"
              rx="7"
              fill="#3B82F6"
            />
          </svg>

          <h2 className="mb-2 text-xl font-semibold">No plans yet</h2>
          <p className="mb-1 text-sm text-muted-foreground">
            Get started by making your first plan.
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            For tips on making the best plans, check out the{" "}
            <a
              href="/products"
              className="font-medium text-blue-600 hover:underline"
            >
              Get Started with Plans
              <svg
                className="mb-0.5 ml-0.5 inline size-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>{" "}
            guide.
          </p>

          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowCreate(true)}
          >
            Create plan
          </Button>
        </div>
      </div>
    )
  }

  // ─── Plans List ──────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Plans</h1>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setShowCreate(true)}
        >
          Create plan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Link
            key={plan.id}
            href="/plans"
            className="group rounded-lg border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <h3 className="mb-1 text-sm font-semibold">{plan.name}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize">
                {plan.access}
              </span>
              <span>
                {new Date(plan.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
