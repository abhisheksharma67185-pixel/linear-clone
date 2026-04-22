"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function BitbucketPage() {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceId, setWorkspaceId] = useState("")
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [workspace, setWorkspace] = useState<{
    name: string
    id: string
  } | null>(null)
  const [search, setSearch] = useState("")

  const handleNameChange = (val: string) => {
    setWorkspaceName(val)
    setWorkspaceId(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    )
  }

  const handleCreate = () => {
    if (!workspaceName.trim()) return
    setCreating(true)
    setTimeout(() => {
      setWorkspace({
        name: workspaceName.trim(),
        id: workspaceId || "my-workspace",
      })
      setCreated(true)
      setCreating(false)
      setCreateOpen(false)
      setWorkspaceName("")
      setWorkspaceId("")
    }, 800)
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              className="rounded p-1 hover:bg-accent"
              onClick={() => router.push("/home")}
            >
              <svg
                className="size-5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
            <Link href="/bitbucket" className="flex items-center gap-1.5">
              <svg className="size-6" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#2684FF" />
                <path
                  d="M10.2 11h11.6a.5.5 0 01.5.57l-1.6 9.66a.68.68 0 01-.66.57h-8.83a.92.92 0 01-.91-.78L8.7 11.57a.5.5 0 01.5-.57h1z"
                  fill="white"
                />
                <path
                  d="M20.5 15.5h-4.2l-.6 3.8h3.4a.68.68 0 00.66-.57l.74-3.23z"
                  fill="#2684FF"
                  opacity="0.4"
                />
              </svg>
              <span className="text-sm font-semibold">Bitbucket</span>
            </Link>
          </div>
          <button className="rounded p-1 hover:bg-accent">
            <svg
              className="size-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-3">
          <Link
            href="/bitbucket"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <svg
              className="size-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            For you
          </Link>
          <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent">
            <svg
              className="size-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Recent
            <svg
              className="ml-auto size-3.5 text-muted-foreground"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>

          <div className="mt-2">
            <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              Customize sidebar
            </button>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b px-6 py-2.5">
          <div className="max-w-xl flex-1">
            <div className="relative">
              <svg
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 border-muted bg-muted/30 pl-9"
              />
            </div>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <button className="rounded-full p-2 text-muted-foreground hover:bg-accent">
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button className="relative rounded-full p-2 text-muted-foreground hover:bg-accent">
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                6
              </span>
            </button>
            <button
              className="rounded-full p-2 text-muted-foreground hover:bg-accent"
              onClick={() => router.push("/admin/settings")}
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09" />
              </svg>
            </button>
            <Link
              href="/switch-account"
              className="rounded-full p-1 hover:ring-2 hover:ring-blue-400"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                AS
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          {created && workspace ? (
            /* After workspace created — show success */
            <div className="text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="size-8 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 className="mb-2 text-2xl font-bold">Workspace created!</h1>
              <p className="mb-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {workspace.name}
                </span>
              </p>
              <p className="mb-6 text-xs text-muted-foreground">
                bitbucket.org/{workspace.id}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreated(false)
                    setWorkspace(null)
                  }}
                >
                  Back to home
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => router.push("/projects")}
                >
                  Go to repositories
                </Button>
              </div>
            </div>
          ) : (
            /* Welcome state */
            <>
              <div className="mb-6">
                <svg className="h-40 w-52" viewBox="0 0 260 180" fill="none">
                  {/* Screen/monitor */}
                  <rect
                    x="80"
                    y="10"
                    width="110"
                    height="80"
                    rx="6"
                    fill="#DEEBFF"
                    stroke="#4C9AFF"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="90"
                    y="22"
                    width="90"
                    height="55"
                    rx="3"
                    fill="white"
                    stroke="#B3D4FF"
                    strokeWidth="1"
                  />
                  <rect
                    x="100"
                    y="32"
                    width="45"
                    height="3.5"
                    rx="1.5"
                    fill="#B3D4FF"
                  />
                  <rect
                    x="100"
                    y="40"
                    width="65"
                    height="3.5"
                    rx="1.5"
                    fill="#DEEBFF"
                  />
                  <rect
                    x="100"
                    y="48"
                    width="35"
                    height="3.5"
                    rx="1.5"
                    fill="#B3D4FF"
                  />
                  <rect
                    x="100"
                    y="56"
                    width="55"
                    height="3.5"
                    rx="1.5"
                    fill="#DEEBFF"
                  />
                  {/* Yellow folder */}
                  <rect
                    x="150"
                    y="35"
                    width="60"
                    height="70"
                    rx="5"
                    fill="#FFC400"
                    opacity="0.85"
                  />
                  <rect
                    x="157"
                    y="44"
                    width="46"
                    height="52"
                    rx="3"
                    fill="#FFE380"
                  />
                  {/* Person 1 — yellow (running) */}
                  <circle cx="58" cy="108" r="9" fill="#FFC400" />
                  <rect
                    x="52"
                    y="118"
                    width="12"
                    height="18"
                    rx="5"
                    fill="#FFC400"
                  />
                  <line
                    x1="52"
                    y1="134"
                    x2="44"
                    y2="155"
                    stroke="#FFC400"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="64"
                    y1="134"
                    x2="72"
                    y2="155"
                    stroke="#FFC400"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="54"
                    y1="125"
                    x2="42"
                    y2="132"
                    stroke="#FFC400"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="62"
                    y1="123"
                    x2="74"
                    y2="118"
                    stroke="#FFC400"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Person 2 — green (pointing) */}
                  <circle cx="120" cy="95" r="8" fill="#00875A" />
                  <rect
                    x="114"
                    y="105"
                    width="12"
                    height="18"
                    rx="5"
                    fill="#00875A"
                  />
                  <line
                    x1="126"
                    y1="108"
                    x2="142"
                    y2="98"
                    stroke="#00875A"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="114"
                    y1="110"
                    x2="103"
                    y2="118"
                    stroke="#00875A"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="116"
                    y1="121"
                    x2="110"
                    y2="145"
                    stroke="#00875A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="124"
                    y1="121"
                    x2="130"
                    y2="145"
                    stroke="#00875A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Person 3 — blue */}
                  <circle cx="185" cy="90" r="8" fill="#0052CC" />
                  <rect
                    x="179"
                    y="100"
                    width="12"
                    height="18"
                    rx="5"
                    fill="#0052CC"
                  />
                  <line
                    x1="181"
                    y1="116"
                    x2="174"
                    y2="140"
                    stroke="#0052CC"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="189"
                    y1="116"
                    x2="196"
                    y2="140"
                    stroke="#0052CC"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Dots */}
                  <circle
                    cx="140"
                    cy="6"
                    r="2.5"
                    fill="#4C9AFF"
                    opacity="0.4"
                  />
                  <circle
                    cx="152"
                    cy="2"
                    r="1.5"
                    fill="#4C9AFF"
                    opacity="0.3"
                  />
                  <circle cx="160" cy="10" r="2" fill="#00875A" opacity="0.3" />
                </svg>
              </div>

              <h1 className="mb-3 text-2xl font-bold text-foreground">
                Welcome to Bitbucket Cloud
              </h1>
              <p className="mb-2 max-w-md text-center text-sm text-muted-foreground">
                A workspace is the place where you can collaborate and share
                your code and content with your teammates.
              </p>
              <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
                To join your teammates in an already existing workspace, contact
                your Bitbucket admin.
              </p>

              <button
                onClick={() => setCreateOpen(true)}
                className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Create a workspace
              </button>
            </>
          )}
        </main>
      </div>

      {/* Create workspace dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create a workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Workspace name <span className="text-red-500">*</span>
              </label>
              <Input
                value={workspaceName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. My team"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Workspace ID
              </label>
              <Input
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                placeholder="my-team"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Your workspace URL: bitbucket.org/{workspaceId || "..."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleCreate}
              disabled={!workspaceName.trim() || creating}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
