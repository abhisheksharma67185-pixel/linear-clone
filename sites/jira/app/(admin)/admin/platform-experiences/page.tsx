"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
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

export default function PlatformExperiencesPage() {
  const [optOutOpen, setOptOutOpen] = useState(false)
  const [betaEnabled, setBetaEnabled] = useState(false)

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-semibold">Platform experiences</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Platform experiences are features that come with any plan and can be
        used across Atlassian apps.{" "}
        <button className="text-blue-600 hover:underline">
          More about platform experiences
        </button>
      </p>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Site</TableHead>
              <TableHead className="w-[120px] font-medium">
                Activated on
              </TableHead>
              <TableHead className="w-[140px] font-medium">
                Beta features
                <svg
                  className="ml-1 inline size-3.5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </TableHead>
              <TableHead className="w-[160px] font-medium">
                AI for dashboards
                <svg
                  className="ml-1 inline size-3.5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </TableHead>
              <TableHead className="w-[100px] font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-sm">
                https://abhisheksharma67185.atlassian.net
              </TableCell>
              <TableCell className="text-sm">Apr 5, 2026</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    size="sm"
                    checked={betaEnabled}
                    onCheckedChange={setBetaEnabled}
                  />
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full border-2 border-muted-foreground/30" />
                  <svg
                    className="size-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOptOutOpen(true)}
                >
                  Opt out
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Opt out confirmation dialog */}
      <Dialog open={optOutOpen} onOpenChange={setOptOutOpen}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <svg
                className="size-5 shrink-0 text-amber-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Opt out of platform experiences
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Once you opt out, all platform experiences features will be
              disabled on abhisheksharma67185. All content you submit to these
              features will be inaccessible to you and your users until you opt
              in to platform experiences again.
            </p>
            <p className="text-sm font-medium">
              Are you sure you want to opt out?
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOptOutOpen(false)}>
              Cancel
            </Button>
            <Button
              className="border border-amber-500 bg-amber-400 text-amber-950 hover:bg-amber-500"
              onClick={() => setOptOutOpen(false)}
            >
              Opt out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
