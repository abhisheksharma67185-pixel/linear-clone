"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function RovoInsightsPage() {
  const [activeTab, setActiveTab] = useState<"adoption" | "agents">("agents")
  const [featureGroup, setFeatureGroup] = useState("all")
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackChoice, setFeedbackChoice] = useState("")
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Rovo insights</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="4weeks">
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1week">Last 1 week</SelectItem>
              <SelectItem value="2weeks">Last 2 weeks</SelectItem>
              <SelectItem value="4weeks">Last 4 weeks</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <button className="rounded-md p-2 text-muted-foreground hover:bg-accent" onClick={() => setExportOpen(true)}>
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          </button>
          <button className="rounded-md p-2 text-muted-foreground hover:bg-accent" onClick={() => setFeedbackOpen(true)}>
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        Track your team&apos;s Rovo and AI use in Atlassian apps over time. Change the time filter to find spikes and dips in different periods.{" "}
        <button className="text-blue-600 hover:underline">How these insights are calculated</button>
      </p>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        <button onClick={() => setActiveTab("adoption")} className={`pb-2.5 text-sm font-medium transition-colors ${activeTab === "adoption" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}>
          Adoption
        </button>
        <button onClick={() => setActiveTab("agents")} className={`pb-2.5 text-sm font-medium transition-colors ${activeTab === "agents" ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}>
          Agents
        </button>
      </div>

      {activeTab === "adoption" && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border p-5">
              <h3 className="text-sm font-semibold mb-1">Users with AI enabled</h3>
              <p className="text-2xl font-bold text-muted-foreground mb-2">--</p>
              <p className="text-xs text-muted-foreground">Users who have access to apps with Rovo&apos;s AI features turned on.</p>
            </div>
            <div className="rounded-lg border p-5">
              <h3 className="text-sm font-semibold mb-1">Active Rovo users</h3>
              <p className="text-2xl font-bold text-muted-foreground mb-2">--</p>
              <p className="text-xs text-muted-foreground">Users who engaged with Rovo&apos;s AI features at least once.</p>
            </div>
            <div className="rounded-lg border p-5">
              <h3 className="text-sm font-semibold mb-1">Rovo interactions</h3>
              <p className="text-2xl font-bold text-muted-foreground mb-2">--</p>
              <p className="text-xs text-muted-foreground">Number of times Rovo generated content (for example, chat responses or smart answers).</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-5">
              <h3 className="text-sm font-semibold mb-1">Rovo usage over time</h3>
              <p className="text-xs text-muted-foreground mb-4">Track changes in active users across all or specific features.</p>
              <div className="flex items-center gap-2 mb-4">
                <Select value={featureGroup} onValueChange={(v) => v && setFeatureGroup(v)}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="All feature groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All feature groups</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="search">Search</SelectItem>
                    <SelectItem value="agents">Agents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <svg className="size-12 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="8" x2="14" y2="14" /><line x1="14" y1="8" x2="8" y2="14" /></svg>
                <p className="text-sm">We have no insights to show yet</p>
              </div>
            </div>
            <div className="rounded-lg border p-5">
              <h3 className="text-sm font-semibold mb-1">Rovo interactions by app</h3>
              <p className="text-xs text-muted-foreground mb-4">See where teams use Rovo the most across your apps.</p>
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-4xl font-bold mb-1">0</p>
                <p className="text-sm text-muted-foreground">Rovo interactions</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "agents" && (
        <>
          {/* Agents stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border p-5">
              <h3 className="text-sm font-semibold mb-1">Active agents</h3>
              <p className="text-2xl font-bold text-muted-foreground mb-2">--</p>
              <p className="text-xs text-muted-foreground">Individual agents that were used at least once.</p>
            </div>
            <div className="rounded-lg border p-5">
              <h3 className="text-sm font-semibold mb-1">Agent runs</h3>
              <p className="text-2xl font-bold text-muted-foreground mb-2">--</p>
              <p className="text-xs text-muted-foreground">Number of times agents were used, triggered by automations or users.</p>
            </div>
            <div className="rounded-lg border p-5">
              <h3 className="text-sm font-semibold mb-1">Agents created</h3>
              <p className="text-2xl font-bold text-muted-foreground mb-2">--</p>
              <p className="text-xs text-muted-foreground">Custom agents created by members of your teams.</p>
            </div>
          </div>

          {/* Agent usage over time */}
          <div className="rounded-lg border p-5">
            <h3 className="text-sm font-semibold mb-1">Agent usage over time</h3>
            <p className="text-xs text-muted-foreground mb-4">Track how many agents were used across your apps.</p>
            <div className="flex items-center gap-2 mb-4">
              <button className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                All apps
                <svg className="size-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <svg className="size-16 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="8" x2="14" y2="14" />
                <line x1="14" y1="8" x2="8" y2="14" />
              </svg>
              <p className="text-sm">We have no insights to show yet</p>
            </div>
          </div>
        </>
      )}

      {/* Feedback dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Share your thoughts</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Required fields are marked with an asterisk <span className="text-red-500">*</span>
          </p>

          <div>
            <Label className="mb-1.5">
              Select feedback <span className="text-red-500">*</span>
            </Label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              value={feedbackChoice}
              onChange={(e) => setFeedbackChoice(e.target.value)}
            >
              <option value="">Choose one</option>
              <option value="question">Ask a question</option>
              <option value="comment">Leave a comment</option>
              <option value="bug">Report a bug</option>
              <option value="improvement">Suggest an improvement</option>
            </select>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setFeedbackOpen(false); setFeedbackChoice("") }}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" disabled={!feedbackChoice} onClick={() => { setFeedbackOpen(false); setFeedbackChoice("") }}>
              Send feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Export Rovo trends</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            We&apos;ll send a CSV file of selected data matching your filter criteria to your email when it&apos;s ready.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setExportOpen(false)}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
