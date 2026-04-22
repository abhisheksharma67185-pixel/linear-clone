"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function RovoSettingsPage() {
  const [activeTab, setActiveTab] = useState<"beta" | "web" | "bookmarks">(
    "beta"
  )
  const [betaEnabled, setBetaEnabled] = useState(true)
  const [webSearchEnabled, setWebSearchEnabled] = useState(true)
  const [importOpen, setImportOpen] = useState(false)
  const [addBookmarkOpen, setAddBookmarkOpen] = useState(false)
  const [bookmarkTitle, setBookmarkTitle] = useState("")
  const [bookmarkUrl, setBookmarkUrl] = useState("")
  const [bookmarkDesc, setBookmarkDesc] = useState("")
  const [bookmarkTerms, setBookmarkTerms] = useState("")

  const tabs = [
    { id: "beta" as const, label: "Beta featur...", badge: "BETA" },
    { id: "web" as const, label: "Web search" },
    { id: "bookmarks" as const, label: "Search bookmarks" },
  ]

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">Rovo settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage settings for Rovo features, and search preferences in your
        organization.
      </p>

      <div className="mb-6 flex gap-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 pb-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
            {tab.badge && (
              <span className="rounded border px-1 py-0.5 text-[9px] leading-none font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Beta features tab */}
      {activeTab === "beta" && (
        <>
          <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
            Control access to supported beta AI and Rovo features across apps in
            your organization.{" "}
            <button className="text-blue-600 hover:underline">
              Beta features
            </button>{" "}
            may be added or removed over time.
          </p>
          <div className="rounded-lg border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-sm font-semibold">
                  Enable beta features
                </h3>
                <p className="text-sm text-muted-foreground">
                  When enabled, supported beta AI and Rovo features will appear
                  in apps as they become available.
                </p>
              </div>
              <Switch checked={betaEnabled} onCheckedChange={setBetaEnabled} />
            </div>
          </div>
        </>
      )}

      {/* Web search tab */}
      {activeTab === "web" && (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            Allow Rovo Chat and agents to search the web to help generate more
            accurate answers.
          </p>
          <div className="rounded-lg border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1 text-sm font-semibold">
                  Enable web search
                </h3>
                <p className="text-sm text-muted-foreground">
                  When enabled, responses in Rovo Chat can use knowledge from
                  the web.
                </p>
              </div>
              <Switch
                checked={webSearchEnabled}
                onCheckedChange={setWebSearchEnabled}
              />
            </div>
          </div>
        </>
      )}

      {/* Search bookmarks tab */}
      {activeTab === "bookmarks" && (
        <>
          <div className="mb-6 flex items-start justify-between">
            <p className="max-w-2xl text-sm text-muted-foreground">
              Bookmarks show as a first result when someone searches using
              particular keywords. Add bookmarks to make sure people get the
              preferred result when searching.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                Import bookmarks
              </Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setAddBookmarkOpen(true)}
              >
                Add new bookmark
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center py-16 text-center">
            <svg
              className="mb-4 size-24 text-muted-foreground/20"
              viewBox="0 0 100 100"
              fill="none"
            >
              <rect
                x="20"
                y="20"
                width="60"
                height="45"
                rx="4"
                fill="currentColor"
              />
              <rect
                x="25"
                y="25"
                width="50"
                height="4"
                rx="2"
                fill="white"
                opacity="0.3"
              />
              <rect
                x="25"
                y="33"
                width="35"
                height="4"
                rx="2"
                fill="white"
                opacity="0.3"
              />
              <rect
                x="25"
                y="41"
                width="45"
                height="4"
                rx="2"
                fill="white"
                opacity="0.3"
              />
              <circle cx="55" cy="55" r="15" fill="#3B82F6" />
              <line
                x1="55"
                y1="48"
                x2="55"
                y2="62"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="48"
                y1="55"
                x2="62"
                y2="55"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any bookmarks yet.{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => setAddBookmarkOpen(true)}
              >
                Create bookmark
              </button>
            </p>
          </div>
        </>
      )}

      {/* Import bookmarks dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Bulk import bookmarks
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Download the template to prepare your bookmarks and ensure the
            import works without issue.{" "}
            <button className="text-blue-600 hover:underline">
              How to bulk upload bookmarks
            </button>
          </p>

          <button className="flex w-fit items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors hover:bg-accent">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CSV template
          </button>

          {/* Drop zone */}
          <div className="flex flex-col items-center rounded-lg border-2 border-dashed p-8 text-center">
            <svg className="mb-3 size-16" viewBox="0 0 80 80" fill="none">
              <path
                d="M40 15c-12 0-22 8-25 19-8 3-13 10-13 19 0 11 9 20 20 20h38c9 0 16-7 16-16 0-7-5-14-12-16-1-15-13-26-24-26z"
                fill="#3B82F6"
              />
              <path
                d="M35 50l5-15 5 15"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="40"
                y1="35"
                x2="40"
                y2="55"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm">
              <button className="font-medium text-foreground">
                Select a file to upload
              </button>{" "}
              <span className="text-muted-foreground">
                or drag and drop here
              </span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add new bookmark dialog */}
      <Dialog open={addBookmarkOpen} onOpenChange={setAddBookmarkOpen}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add a new bookmark
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Bookmarks allow you to show a search result first, based on
            particular search terms.
          </p>

          <div>
            <p className="mb-1 text-sm font-semibold">Bookmark details</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Everyone in your organization will see this result when they
              search for the terms.
            </p>

            <div className="space-y-3">
              <div>
                <Label className="mb-1">Search result title</Label>
                <Input
                  placeholder="Enter a title for this bookmark"
                  value={bookmarkTitle}
                  onChange={(e) => setBookmarkTitle(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1">URL</Label>
                <Input
                  placeholder="Enter internal or external URL for this bookmark"
                  value={bookmarkUrl}
                  onChange={(e) => setBookmarkUrl(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1">Description</Label>
                <Input
                  placeholder="Enter a short description for this bookmark"
                  value={bookmarkDesc}
                  onChange={(e) => setBookmarkDesc(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 flex items-center gap-1">
                  Search terms
                  <svg
                    className="size-3.5 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </Label>
                <Input
                  placeholder="Enter up to 5 terms to display this bookmark"
                  value={bookmarkTerms}
                  onChange={(e) => setBookmarkTerms(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setAddBookmarkOpen(false)
                setBookmarkTitle("")
                setBookmarkUrl("")
                setBookmarkDesc("")
                setBookmarkTerms("")
              }}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              disabled={!bookmarkTitle.trim() || !bookmarkUrl.trim()}
              onClick={() => {
                setAddBookmarkOpen(false)
                setBookmarkTitle("")
                setBookmarkUrl("")
                setBookmarkDesc("")
                setBookmarkTerms("")
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
