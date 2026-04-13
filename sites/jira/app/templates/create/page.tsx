"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function CreateSpaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateName = searchParams.get("template") || "Scrum"
  const templateDesc = searchParams.get("desc") || "Sprint toward your project goals with a board, backlog, and timeline."
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
    setKey(val.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5))
  }

  const handleCreate = () => {
    // Navigate to the new project board (fallback to SCRUM if no key)
    const projectKey = key.trim() || "SCRUM"
    router.push(`/projects/${projectKey}/board`)
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-background">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col border-r">
        <div className="flex-1 max-w-[560px] mx-auto w-full px-8 py-10">
          {/* Back link */}
          <Link href="/templates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
            </svg>
            Back to templates
          </Link>

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">Name your space</h1>
              <p className="text-sm text-muted-foreground mb-8">
                Required fields are marked with an asterisk <span className="text-red-500">*</span>
              </p>

              {/* Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">
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
              <div className="mb-6 relative" data-dropdown>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  How your space is managed <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setManagedOpen(!managedOpen); setAccessOpen(false) }}
                  className="flex w-full h-11 items-center justify-between rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center gap-2">
                    {managed === "team" && (
                      <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                    )}
                    {managed === "company" && (
                      <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" /></svg>
                    )}
                    <span className={managed ? "text-foreground" : "text-muted-foreground"}>
                      {managed === "team" ? "Team-managed" : managed === "company" ? "Company-managed" : "Please select"}
                    </span>
                  </div>
                  <svg className="size-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                </button>
                {managedOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-white dark:bg-card shadow-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { setManaged("team"); setManagedOpen(false) }}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-accent transition-colors ${managed === "team" ? "bg-blue-50 dark:bg-accent" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                        <span className="text-sm font-semibold text-foreground">Team-managed</span>
                        <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">LAST CREATED</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">For teams who want to control their own working processes and practices in a self-contained space.</p>
                      <p className="text-xs text-blue-600 ml-6 mt-1 hover:underline">More about team-managed spaces</p>
                    </button>
                    <div className="border-t" />
                    <button
                      type="button"
                      onClick={() => { setManaged("company"); setManagedOpen(false) }}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-accent transition-colors ${managed === "company" ? "bg-blue-50 dark:bg-accent" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" /></svg>
                        <span className="text-sm font-semibold text-foreground">Company-managed</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">For teams who work with others across many spaces in a standard way.</p>
                      <p className="text-xs text-blue-600 ml-6 mt-1 hover:underline">More about company-managed spaces</p>
                    </button>
                  </div>
                )}
              </div>

              {/* Conditional fields based on managed type */}
              {managed === "team" && (
                <>
                  {/* Access - custom dropdown */}
                  <div className="mb-6 relative" data-dropdown>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Access <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setAccessOpen(!accessOpen); setManagedOpen(false) }}
                      className="flex w-full h-11 items-center justify-between rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d={access === "private" ? "M7 11V7a5 5 0 0 1 10 0v4" : "M7 11V7a5 5 0 0 1 9.9-1"} />
                        </svg>
                        <span className="text-foreground capitalize">{access}</span>
                      </div>
                      <svg className="size-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                    </button>
                    {accessOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-white dark:bg-card shadow-lg overflow-hidden">
                        {[
                          { value: "private", label: "Private", desc: 'Only admins and people you add to the project can search for, view, create, or edit its issues.' },
                          { value: "limited", label: "Limited", desc: 'Anyone with access to the "abhisheksharma67185" Jira site can search for, view, and comment on this project\'s issues. Only people you add to the project can create and edit its issues.' },
                          { value: "open", label: "Open", desc: 'Anyone with access to the "abhisheksharma67185" Jira site can search for, view, create and edit this project\'s issues.' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setAccess(opt.value); setAccessOpen(false) }}
                            className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-accent transition-colors border-b last:border-0 ${access === opt.value ? "bg-blue-50 dark:bg-accent" : ""}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d={opt.value === "private" ? "M7 11V7a5 5 0 0 1 10 0v4" : "M7 11V7a5 5 0 0 1 9.9-1"} />
                              </svg>
                              <span className={`text-sm font-semibold ${access === opt.value ? "text-blue-600" : "text-foreground"}`}>{opt.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Key */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Key <span className="text-red-500">*</span>
                      <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full border text-[10px] text-muted-foreground cursor-help" title="A unique identifier for your space">i</span>
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareSettings}
                        onChange={(e) => setShareSettings(e.target.checked)}
                        className="size-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-foreground">Share settings with an existing project</span>
                    </label>
                  </div>

                  {/* Key */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Key <span className="text-red-500">*</span>
                      <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full border text-[10px] text-muted-foreground cursor-help" title="A unique identifier for your space">i</span>
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
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Template</span>
                  <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground">
                    See details
                  </Link>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <svg className="size-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{templateName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <svg className="size-4" viewBox="0 0 32 32" fill="#2684FF">
                        <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                      </svg>
                      <span className="text-xs text-muted-foreground">{templateProduct}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{templateDesc}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2">Bring your team along</h1>
              <p className="text-sm text-muted-foreground mb-8">
                Add people you&apos;ve already worked with in Jira, or invite someone new.
              </p>

              {/* Members input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Enter names or emails
                </label>
                <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-2 min-h-[44px] focus-within:ring-2 focus-within:ring-blue-500">
                  {members.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 rounded bg-gray-100 dark:bg-muted px-2 py-1 text-sm"
                    >
                      <svg className="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      {m.name}
                      <button
                        onClick={() => setMembers(members.filter((x) => x.id !== m.id))}
                        className="ml-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
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
                        setMembers([...members, { name: memberInput.trim(), id: Date.now().toString() }])
                        setMemberInput("")
                      }
                    }}
                    placeholder={members.length === 0 ? "Enter names or emails" : "Enter more"}
                    className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Administrator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed bottom-20 left-8 z-50 flex items-start gap-3 rounded-lg border bg-white dark:bg-card px-4 py-3 shadow-lg max-w-[360px]">
            <svg className="size-5 shrink-0 text-green-500 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Jira space successfully created</p>
              <p className="text-xs text-muted-foreground mt-0.5">Just a few more steps to get it connected.</p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-muted-foreground hover:text-foreground shrink-0">
              <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
        )}

        {/* Bottom bar */}
        <div className="border-t px-8 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Step {step} of 2</span>
          <div className="flex gap-3">
            {step === 1 ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!name.trim() || !managed}
                onClick={() => { setStep(2); setShowToast(true); setTimeout(() => setShowToast(false), 5000) }}
              >
                Next
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCreate}>
                  I&apos;ll do this later
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
      <div className="hidden w-[480px] shrink-0 bg-gray-50 dark:bg-muted/20 p-8 lg:block overflow-auto">
        <div className="rounded-lg border bg-white dark:bg-card shadow-sm overflow-hidden">
          {/* Preview header */}
          <div className="border-b px-5 py-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              {managed === "team" ? "Team-managed space" : managed === "company" ? "Company-managed space" : "Space"}
            </div>
            <h3 className="text-base font-bold text-foreground">{name || "My space"}</h3>
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
                      ? "text-blue-600 font-medium border-b-2 border-blue-600"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "list" ? (
                    <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 4h12v1H2zm0 3.5h12v1H2zm0 3.5h12v1H2z" />
                    </svg>
                  ) : (
                    <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M1 2h4v12H1zm5 0h4v12H6zm5 0h4v12h-4z" opacity="0.7" />
                    </svg>
                  )}
                  {tab === "list" ? "List" : "Board"}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar row */}
          <div className="px-5 py-3 border-b">
            <div className="size-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
              <svg className="size-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          {previewTab === "board" ? (
            /* Board view */
            <div className="flex gap-0 p-4 min-h-[300px]">
              {["TO DO", "IN PROGRESS", "DONE"].map((col, i) => (
                <div key={col} className="flex-1 px-2">
                  <div className="text-[11px] font-bold text-muted-foreground mb-3 uppercase tracking-wide">{col}</div>
                  {i === 0 && (
                    <div className="rounded-md border bg-white dark:bg-card p-3 shadow-sm">
                      <p className="text-sm font-medium text-foreground mb-3">Task</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="size-4 rounded-sm bg-blue-500 flex items-center justify-center">
                            <svg className="size-2.5 text-white" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 3.5L6 7l-1.5 1.5L1 5l1.5-1.5z" /></svg>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{key || "KEY"}-1</span>
                        </div>
                        <div className="size-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <svg className="size-2.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
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
              <div className="flex items-center border-b text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <div className="w-10 px-3 py-2.5 flex items-center justify-center">
                  <div className="size-3.5 rounded-sm border border-gray-300" />
                </div>
                <div className="w-14 px-2 py-2.5">Type</div>
                <div className="w-20 px-2 py-2.5">Key</div>
                <div className="w-24 px-2 py-2.5">Status</div>
                <div className="flex-1 px-2 py-2.5">Summary</div>
              </div>
              {/* Table row */}
              <div className="flex items-center border-b hover:bg-gray-50 dark:hover:bg-accent/30">
                <div className="w-10 px-3 py-2.5 flex items-center justify-center">
                  <div className="size-3.5 rounded-sm border border-gray-300" />
                </div>
                <div className="w-14 px-2 py-2.5">
                  <div className="size-4 rounded-sm bg-blue-500 flex items-center justify-center">
                    <svg className="size-2.5 text-white" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 3.5L6 7l-1.5 1.5L1 5l1.5-1.5z" /></svg>
                  </div>
                </div>
                <div className="w-20 px-2 py-2.5">
                  <span className="text-xs font-mono text-blue-600">{key || "KEY"}-1</span>
                </div>
                <div className="w-24 px-2 py-2.5">
                  <span className="rounded bg-gray-100 dark:bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground">TO DO</span>
                </div>
                <div className="flex-1 px-2 py-2.5 text-sm text-foreground">Task</div>
              </div>
              {/* + Create row */}
              <div className="flex items-center px-3 py-2.5 text-sm text-muted-foreground hover:text-blue-600 cursor-pointer">
                <svg className="size-4 mr-1.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
                </svg>
                Create
              </div>
            </div>
          )}
        </div>

        {/* Decorative lines */}
        <div className="mt-6 flex justify-center">
          <svg className="w-[300px] h-[60px]" viewBox="0 0 300 60" fill="none">
            <path d="M0 30 Q75 0 150 30 Q225 60 300 30" stroke="#0052CC" strokeWidth="2" opacity="0.2" />
            <path d="M0 40 Q75 10 150 40 Q225 70 300 40" stroke="#36B37E" strokeWidth="2" opacity="0.2" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function CreateSpacePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-sm text-muted-foreground">Loading...</div>}>
      <CreateSpaceContent />
    </Suspense>
  )
}
