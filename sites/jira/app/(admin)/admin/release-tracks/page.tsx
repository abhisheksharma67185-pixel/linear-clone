"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ReleaseTracksPage() {
  const [showBanner, setShowBanner] = useState(true)
  const [changeTrackOpen, setChangeTrackOpen] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState("continuous")
  const [currentTrack, setCurrentTrack] = useState("Continuous")

  function handleSaveTrack() {
    setCurrentTrack(selectedTrack === "continuous" ? "Continuous" : "Bundled")
    setChangeTrackOpen(false)
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Release tracks</h1>

      <p className="mb-6 text-sm text-muted-foreground">
        Choose when changes and new features are released to your apps. You can
        check recent and upcoming changes in{" "}
        <button className="text-blue-600 hover:underline">app updates</button>.
      </p>

      <div className="mb-6 space-y-2 text-sm text-muted-foreground">
        <p>
          <span className="font-bold text-foreground">Continuous track:</span>{" "}
          Changes are added as soon as they&apos;re ready.
        </p>
        <p>
          <span className="font-bold text-foreground">Bundled track:</span>{" "}
          Changes roll out as a bundle once a month, on a set release date.
        </p>
        <p>
          <span className="font-bold text-foreground">Preview track:</span>{" "}
          Bundled changes are available early in sandboxes before their release
          date.
        </p>
      </div>

      {showBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
          <svg
            className="mt-0.5 size-6 shrink-0 text-blue-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15ZM1.5 19.5v-12h21v12a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3Zm6.75-7.5a.75.75 0 1 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Zm-.75 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
              Jira seasonal releases are coming soon
            </p>
            <p className="mt-1 text-sm text-purple-800 dark:text-purple-300">
              The first set of features will roll out in seasonal releases.
              Bundled changes will be available to test in sandboxes on the
              preview track from May 9, 2026.
            </p>
            <button className="mt-1 text-sm text-blue-600 hover:underline">
              More about seasonal releases
            </button>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="shrink-0 p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App</TableHead>
            <TableHead>Track</TableHead>
            <TableHead>Next release</TableHead>
            <TableHead>Last release</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
                  <svg className="size-3.5" viewBox="0 0 32 32" fill="white">
                    <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Jira</span>
                  <p className="text-xs text-muted-foreground">
                    https://abhisheksharma67185.atlassian.net
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>{currentTrack}</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChangeTrackOpen(true)}
              >
                Change track
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Change track dialog */}
      <Dialog open={changeTrackOpen} onOpenChange={setChangeTrackOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Select release track
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Changes you make here will affect all users with Jira using
            abhisheksharma67185.atlassian.net.
          </p>

          <div>
            <p className="mb-3 text-sm font-medium">Release tracks</p>
            <RadioGroup value={selectedTrack} onValueChange={setSelectedTrack}>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="continuous" className="mt-0.5" />
                <div>
                  <Label className="font-medium">
                    Continuous release track
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Receive app changes and features as soon as they become
                    available.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2">
                <RadioGroupItem value="bundled" className="mt-0.5" />
                <div>
                  <Label className="font-medium">Bundled release track</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Receive app changes and features as a bundle, once a month
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setChangeTrackOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={handleSaveTrack}
            >
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
