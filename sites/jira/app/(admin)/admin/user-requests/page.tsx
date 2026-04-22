"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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

export default function UserRequestsPage() {
  const [activeTab, setActiveTab] = useState("access")
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackChoice, setFeedbackChoice] = useState("")
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState("All sites")

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User requests</h1>
        <Button variant="outline" onClick={() => setFeedbackOpen(true)}>
          <svg
            className="mr-1.5 size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Give feedback
        </Button>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage your users&apos; app access requests and discover what else
        they&apos;re showing interest in.
      </p>

      <div className="mb-4 flex gap-4 border-b">
        {[
          { id: "access", label: "Access requests" },
          { id: "interests", label: "User interests" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "access" && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Approve or deny access requests from your users. Each user granted
              access counts toward your subscription.{" "}
              <button className="text-blue-600 hover:underline">
                How requests for access work
              </button>
            </p>
            <Link href="/admin/app-access-settings">
              <Button variant="outline" size="sm">
                App access settings
              </Button>
            </Link>
          </div>

          {/* Site filter dropdown */}
          <div className="relative mb-4 inline-block">
            <button
              onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${siteDropdownOpen ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950/30" : "hover:bg-accent"}`}
            >
              Site{" "}
              <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
            {siteDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSiteDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-lg border bg-background shadow-lg">
                  {["All sites", "abhisheksharma67185"].map((site) => (
                    <button
                      key={site}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-accent/50 ${selectedSite === site ? "font-medium" : ""}`}
                      onClick={() => {
                        setSelectedSite(site)
                        setSiteDropdownOpen(false)
                      }}
                    >
                      {site}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {selectedSite !== "All sites" && (
            <p className="mb-4 text-xs text-muted-foreground">
              Site: {selectedSite}
            </p>
          )}

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">
                    Who needs access
                  </TableHead>
                  <TableHead className="font-medium">Requested by</TableHead>
                  <TableHead className="font-medium">App</TableHead>
                  <TableHead className="w-[100px] font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-20 text-center text-sm text-muted-foreground italic"
                  >
                    You don&apos;t have any access requests
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {activeTab === "interests" && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No user interests to display.
          </p>
        </div>
      )}

      {/* Give feedback dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Share your thoughts
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Required fields are marked with an asterisk{" "}
            <span className="text-red-500">*</span>
          </p>

          <div>
            <Label className="mb-1.5">
              user-requests-admin-hub <span className="text-red-500">*</span>
            </Label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={feedbackChoice}
              onChange={(e) => setFeedbackChoice(e.target.value)}
            >
              <option value="">Choose one</option>
              <option value="very-satisfied">Very satisfied</option>
              <option value="satisfied">Satisfied</option>
              <option value="neutral">Neutral</option>
              <option value="dissatisfied">Dissatisfied</option>
              <option value="very-dissatisfied">Very dissatisfied</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setFeedbackOpen(false)
                setFeedbackChoice("")
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!feedbackChoice}
              onClick={() => {
                setFeedbackOpen(false)
                setFeedbackChoice("")
              }}
            >
              Send feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
