"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function CreateSpaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateName = searchParams.get("template") || "Scrum"
  const templateDesc =
    searchParams.get("desc") ||
    "Sprint toward your project goals with a board, backlog, and timeline."
  const templateProduct = searchParams.get("product") || "Jira"

  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [key, setKey] = useState("")
  const [managed, setManaged] = useState("")
  const [access, setAccess] = useState("open")
  const [managedOpen, setManagedOpen] = useState(false)
  const [accessOpen, setAccessOpen] = useState(false)
  const [shareSettings, setShareSettings] = useState(false)
  const [previewTab, setPreviewTab] = useState<"list" | "board">("board")
  const [showToast, setShowToast] = useState(false)
  const [members, setMembers] = useState([
    { name: "jira-users-abhisheksharma67185", id: "1" },
    { name: "org-admins", id: "2" },
  ])
  const [memberInput, setMemberInput] = useState("")
  const [role, setRole] = useState("member")

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = e.target as HTMLElement
      if (!t.closest("[data-dropdown]")) {
        setManagedOpen(false)
        setAccessOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleNameChange = (val: string) => {
    setName(val)
    setKey(
      val
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase()
        .slice(0, 5)
    )
  }

  const handleCreate = () => {
    // Navigate to the new project board (fallback to SCRUM if no key)
    const projectKey = key.trim() || "SCRUM"
    router.push(`/projects/${projectKey}/board`)
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-background">
      {/* Left: Form */}
      <div className="flex flex-1 flex-col border-r">
        <div className="mx-auto w-full max-w-[560px] flex-1 px-8 py-10">
          {/* Back link */}
          <Link
            href="/templates"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
              />
            </svg>
            Back to templates
          </Link>

          {step === 1 ? (
            <>
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                Name your space
              </h1>
              <p className="mb-8 text-sm text-muted-foreground">
                Required fields are marked with an asterisk{" "}
                <span className="text-red-500">*</span>
              </p>

              {/* Name */}
              <div className="mb-6">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Try a team name, project goal, milestone..."
                  className="h-11"
                />
              </div>

              {/* How managed - custom dropdown */}
              <div className="relative mb-6" data-dropdown>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  How your space is managed{" "}
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setManagedOpen(!managedOpen)
                    setAccessOpen(false)
                  }}
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    {managed === "team" && (
                      <svg
                        className="size-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                      </svg>
                    )}
                    {managed === "company" && (
                      <svg
                        className="size-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                      </svg>
                    )}
                    <span
                      className={
                        managed ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {managed === "team"
                        ? "Team-managed"
                        : managed === "company"
                          ? "Company-managed"
                          : "Please select"}
                    </span>
                  </div>
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>
                {managedOpen && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border bg-white shadow-lg dark:bg-card">
                    <button
                      type="button"
                      onClick={() => {
                        setManaged("team")
                        setManagedOpen(false)
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-accent ${managed === "team" ? "bg-blue-50 dark:bg-accent" : ""}`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <svg
                          className="size-4 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                        <span className="text-sm font-semibold text-foreground">
                          Team-managed
                        </span>
                        <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                          LAST CREATED
                        </span>
                      </div>
                      <p className="ml-6 text-xs text-muted-foreground">
                        For teams who want to control their own working
                        processes and practices in a self-contained space.
                      </p>
                      <p className="mt-1 ml-6 text-xs text-blue-600 hover:underline">
                        More about team-managed spaces
                      </p>
                    </button>
                    <div className="border-t" />
                    <button
                      type="button"
                      onClick={() => {
                        setManaged("company")
                        setManagedOpen(false)
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-accent ${managed === "company" ? "bg-blue-50 dark:bg-accent" : ""}`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <svg
                          className="size-4 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                        </svg>
                        <span className="text-sm font-semibold text-foreground">
                          Company-managed
                        </span>
                      </div>
                      <p className="ml-6 text-xs text-muted-foreground">
                        For teams who work with others across many spaces in a
                        standard way.
                      </p>
                      <p className="mt-1 ml-6 text-xs text-blue-600 hover:underline">
                        More about company-managed spaces
                      </p>
                    </button>
                  </div>
                )}
              </div>

              {/* Conditional fields based on managed type */}
              {managed === "team" && (
                <>
                  {/* Access - custom dropdown */}
                  <div className="relative mb-6" data-dropdown>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Access <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAccessOpen(!accessOpen)
                        setManagedOpen(false)
                      }}
                      className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="size-4 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          />
                          <path
                            d={
                              access === "private"
                                ? "M7 11V7a5 5 0 0 1 10 0v4"
                                : "M7 11V7a5 5 0 0 1 9.9-1"
                            }
                          />
                        </svg>
                        <span className="text-foreground capitalize">
                          {access}
                        </span>
                      </div>
                      <svg
                        className="size-4 text-muted-foreground"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                    </button>
                    {accessOpen && (
                      <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border bg-white shadow-lg dark:bg-card">
                        {[
                          {
                            value: "private",
                            label: "Private",
                            desc: "Only admins and people you add to the project can search for, view, create, or edit its issues.",
                          },
                          {
                            value: "limited",
                            label: "Limited",
                            desc: 'Anyone with access to the "abhisheksharma67185" Jira site can search for, view, and comment on this project\'s issues. Only people you add to the project can create and edit its issues.',
                          },
                          {
                            value: "open",
                            label: "Open",
                            desc: 'Anyone with access to the "abhisheksharma67185" Jira site can search for, view, create and edit this project\'s issues.',
                          },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setAccess(opt.value)
                              setAccessOpen(false)
                            }}
                            className={`w-full border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-blue-50 dark:hover:bg-accent ${access === opt.value ? "bg-blue-50 dark:bg-accent" : ""}`}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <svg
                                className="size-4 text-muted-foreground"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect
                                  x="3"
                                  y="11"
                                  width="18"
                                  height="11"
                                  rx="2"
                                  ry="2"
                                />
                                <path
                                  d={
                                    opt.value === "private"
                                      ? "M7 11V7a5 5 0 0 1 10 0v4"
                                      : "M7 11V7a5 5 0 0 1 9.9-1"
                                  }
                                />
                              </svg>
                              <span
                                className={`text-sm font-semibold ${access === opt.value ? "text-blue-600" : "text-foreground"}`}
                              >
                                {opt.label}
                              </span>
                            </div>
                            <p className="ml-6 text-xs text-muted-foreground">
                              {opt.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Key */}
                  <div className="mb-8">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Key <span className="text-red-500">*</span>
                      <span
                        className="ml-1 inline-flex size-4 cursor-help items-center justify-center rounded-full border text-[10px] text-muted-foreground"
                        title="A unique identifier for your space"
                      >
                        i
                      </span>
                    </label>
                    <Input
                      value={key}
                      onChange={(e) => setKey(e.target.value.toUpperCase())}
                      className="h-11 w-[220px] font-mono"
                    />
                  </div>
                </>
              )}

              {managed === "company" && (
                <>
                  {/* Share settings checkbox */}
                  <div className="mb-6">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={shareSettings}
                        onChange={(e) => setShareSettings(e.target.checked)}
                        className="size-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-foreground">
                        Share settings with an existing project
                      </span>
                    </label>
                  </div>

                  {/* Key */}
                  <div className="mb-8">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Key <span className="text-red-500">*</span>
                      <span
                        className="ml-1 inline-flex size-4 cursor-help items-center justify-center rounded-full border text-[10px] text-muted-foreground"
                        title="A unique identifier for your space"
                      >
                        i
                      </span>
                    </label>
                    <Input
                      value={key}
                      onChange={(e) => setKey(e.target.value.toUpperCase())}
                      className="h-11 w-[220px] font-mono"
                    />
                  </div>
                </>
              )}

              {/* Template info */}
              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Template
                  </span>
                  <Link
                    href="/templates"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    See details
                  </Link>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <svg
                      className="size-8 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {templateName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <svg
                        className="size-4"
                        viewBox="0 0 32 32"
                        fill="#2684FF"
                      >
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                      <span className="text-xs text-muted-foreground">
                        {templateProduct}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {templateDesc}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-bold text-foreground">
                Bring your team along
              </h1>
              <p className="mb-8 text-sm text-muted-foreground">
                Add people you&apos;ve already worked with in Jira, or invite
                someone new.
              </p>

              {/* Members input */}
              <div className="mb-6">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Enter names or emails
                </label>
                <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-blue-500">
                  {members.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-sm dark:bg-muted"
                    >
                      <svg
                        className="size-3.5 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      {m.name}
                      <button
                        onClick={() =>
                          setMembers(members.filter((x) => x.id !== m.id))
                        }
                        className="ml-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <svg
                          className="size-3"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && memberInput.trim()) {
                        setMembers([
                          ...members,
                          {
                            name: memberInput.trim(),
                            id: Date.now().toString(),
                          },
                        ])
                        setMemberInput("")
                      }
                    }}
                    placeholder={
                      members.length === 0
                        ? "Enter names or emails"
                        : "Enter more"
                    }
                    className="min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="mb-6">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-11 w-full cursor-pointer appearance-none rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Administrator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed bottom-20 left-8 z-50 flex max-w-[360px] items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg dark:bg-card">
            <svg
              className="mt-0.5 size-5 shrink-0 text-green-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Jira space successfully created
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Just a few more steps to get it connected.
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t px-8 py-4">
          <span className="text-sm text-muted-foreground">
            Step {step} of 2
          </span>
          <div className="flex gap-3">
            {step === 1 ? (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={!name.trim() || !managed}
                onClick={() => {
                  setStep(2)
                  setShowToast(true)
                  setTimeout(() => setShowToast(false), 5000)
                }}
              >
                Next
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCreate}>
                  I&apos;ll do this later
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleCreate}
                >
                  Next
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Live preview */}
      <div className="hidden w-[480px] shrink-0 overflow-auto bg-gray-50 p-8 lg:block dark:bg-muted/20">
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-card">
          {/* Preview header */}
          <div className="border-b px-5 py-4">
            <div className="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase">
              {managed === "team"
                ? "Team-managed space"
                : managed === "company"
                  ? "Company-managed space"
                  : "Space"}
            </div>
            <h3 className="text-base font-bold text-foreground">
              {name || "My space"}
            </h3>
          </div>

          {/* Tabs */}
          <div className="border-b px-5">
            <div className="flex gap-0">
              {(["list", "board"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPreviewTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors ${
                    previewTab === tab
                      ? "border-b-2 border-blue-600 font-medium text-blue-600"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "list" ? (
                    <svg
                      className="size-4"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M2 4h12v1H2zm0 3.5h12v1H2zm0 3.5h12v1H2z" />
                    </svg>
                  ) : (
                    <svg
                      className="size-4"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path
                        d="M1 2h4v12H1zm5 0h4v12H6zm5 0h4v12h-4z"
                        opacity="0.7"
                      />
                    </svg>
                  )}
                  {tab === "list" ? "List" : "Board"}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar row */}
          <div className="border-b px-5 py-3">
            <div className="flex size-6 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
              <svg
                className="size-3 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          {previewTab === "board" ? (
            /* Board view */
            <div className="flex min-h-[300px] gap-0 p-4">
              {["TO DO", "IN PROGRESS", "DONE"].map((col, i) => (
                <div key={col} className="flex-1 px-2">
                  <div className="mb-3 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                    {col}
                  </div>
                  {i === 0 && (
                    <div className="rounded-md border bg-white p-3 shadow-sm dark:bg-card">
                      <p className="mb-3 text-sm font-medium text-foreground">
                        Task
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="flex size-4 items-center justify-center rounded-sm bg-blue-500">
                            <svg
                              className="size-2.5 text-white"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                            >
                              <path d="M2.5 3.5L6 7l-1.5 1.5L1 5l1.5-1.5z" />
                            </svg>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {key || "KEY"}-1
                          </span>
                        </div>
                        <div className="flex size-5 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
                          <svg
                            className="size-2.5 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* List view */
            <div className="min-h-[300px]">
              {/* Table header */}
              <div className="flex items-center border-b text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                <div className="flex w-10 items-center justify-center px-3 py-2.5">
                  <div className="size-3.5 rounded-sm border border-gray-300" />
                </div>
                <div className="w-14 px-2 py-2.5">Type</div>
                <div className="w-20 px-2 py-2.5">Key</div>
                <div className="w-24 px-2 py-2.5">Status</div>
                <div className="flex-1 px-2 py-2.5">Summary</div>
              </div>
              {/* Table row */}
              <div className="flex items-center border-b hover:bg-gray-50 dark:hover:bg-accent/30">
                <div className="flex w-10 items-center justify-center px-3 py-2.5">
                  <div className="size-3.5 rounded-sm border border-gray-300" />
                </div>
                <div className="w-14 px-2 py-2.5">
                  <div className="flex size-4 items-center justify-center rounded-sm bg-blue-500">
                    <svg
                      className="size-2.5 text-white"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M2.5 3.5L6 7l-1.5 1.5L1 5l1.5-1.5z" />
                    </svg>
                  </div>
                </div>
                <div className="w-20 px-2 py-2.5">
                  <span className="font-mono text-xs text-blue-600">
                    {key || "KEY"}-1
                  </span>
                </div>
                <div className="w-24 px-2 py-2.5">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-foreground dark:bg-muted">
                    TO DO
                  </span>
                </div>
                <div className="flex-1 px-2 py-2.5 text-sm text-foreground">
                  Task
                </div>
              </div>
              {/* + Create row */}
              <div className="flex cursor-pointer items-center px-3 py-2.5 text-sm text-muted-foreground hover:text-blue-600">
                <svg
                  className="mr-1.5 size-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
                </svg>
                Create
              </div>
            </div>
          )}
        </div>

        {/* Decorative lines */}
        <div className="mt-6 flex justify-center">
          <svg className="h-[60px] w-[300px]" viewBox="0 0 300 60" fill="none">
            <path
              d="M0 30 Q75 0 150 30 Q225 60 300 30"
              stroke="#0052CC"
              strokeWidth="2"
              opacity="0.2"
            />
            <path
              d="M0 40 Q75 10 150 40 Q225 70 300 40"
              stroke="#36B37E"
              strokeWidth="2"
              opacity="0.2"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function CreateSpacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <CreateSpaceContent />
    </Suspense>
  )
}
