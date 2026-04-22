"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const appsData = [
  {
    name: "Goals",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
    ),
  },
  {
    name: "Jira",
    icon: (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-4" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    ),
  },
  {
    name: "Projects",
    icon: (
      <div className="flex size-8 items-center justify-center rounded-full bg-muted">
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    ),
  },
]

function AppStatusDetail({
  app,
  onBack,
}: {
  app: (typeof appsData)[0]
  onBack: () => void
}) {
  const [impactTab, setImpactTab] = useState<"instances" | "experiences">(
    "instances"
  )

  return (
    <div className="max-w-5xl p-8">
      <button
        onClick={onBack}
        className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        System health
      </button>
      <div className="mb-4 flex items-center gap-3">
        {app.icon}
        <h1 className="text-2xl font-semibold">{app.name} status overview</h1>
      </div>

      <p className="mb-1 text-sm text-muted-foreground">
        View events affecting {app.name} and their impact on your organization.
      </p>
      <button
        type="button"
        className="mb-6 inline-flex items-center gap-0.5 text-sm text-blue-600 hover:underline"
      >
        Understand how we detect and classify incidents
        <svg
          className="size-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </button>

      {/* Status banner */}
      <div className="mb-2 rounded-lg border">
        <div className="flex items-center gap-2 px-5 py-3">
          <svg
            className="size-5 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="text-sm font-semibold">
            {app.name} is fully operational
          </span>
        </div>
        <div className="border-t px-5 py-3">
          <span className="text-sm text-muted-foreground">
            No ongoing events
          </span>
        </div>
      </div>

      <button
        type="button"
        className="mt-3 mb-8 flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        View event history
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </button>

      {/* Impact details */}
      <h2 className="mb-4 text-lg font-semibold">Impact details</h2>

      <div className="mb-4 flex gap-6 border-b">
        <button
          onClick={() => setImpactTab("instances")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            impactTab === "instances"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          App instances
        </button>
        <button
          onClick={() => setImpactTab("experiences")}
          className={`pb-2.5 text-sm font-medium transition-colors ${
            impactTab === "experiences"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Experiences
        </button>
      </div>

      {impactTab === "instances" && (
        <>
          <div className="relative mb-4 max-w-xs">
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
            <Input placeholder="Search instances" className="pl-9" />
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing 1 item</span>
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </div>

          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-medium">
                    Instance
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    Experiences impacted
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium">
                    Incident ID
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {app.icon}
                      <div>
                        <p className="text-sm font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">
                          https://abhisheksharma67185.atlassian.net
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase">
                      Operational
                    </span>
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {impactTab === "experiences" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No experiences data available
          </p>
        </div>
      )}
    </div>
  )
}

function AppStatusListItems({
  onSelect,
}: {
  onSelect: (name: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {appsData.map((app) => (
        <button
          key={app.name}
          type="button"
          onClick={() => onSelect(app.name)}
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent/30"
        >
          <div className="flex items-center gap-3">
            {app.icon}
            <span className="text-sm font-medium">{app.name}</span>
            <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800 uppercase dark:bg-green-900/30 dark:text-green-300">
              Operational
            </span>
          </div>
          <svg
            className="size-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function SystemHealthPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState("just now")
  const [showNotifSettings, setShowNotifSettings] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifSlack, setNotifSlack] = useState(false)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)

  const selectedAppData = appsData.find((a) => a.name === selectedApp)
  if (selectedAppData) {
    return (
      <AppStatusDetail
        app={selectedAppData}
        onBack={() => setSelectedApp(null)}
      />
    )
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      setLastUpdated("just now")
    }, 1500)
  }

  // Notification settings modal
  if (showNotifSettings) {
    return (
      <Dialog open={showNotifSettings} onOpenChange={setShowNotifSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notification settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Choose how you want to be notified about incidents affecting your
              organization.
            </p>

            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive email alerts for new incidents and status changes
                </p>
              </div>
              <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
            </label>

            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <p className="text-sm font-medium">Slack notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get notified in Slack when incidents are detected
                </p>
              </div>
              <Switch checked={notifSlack} onCheckedChange={setNotifSlack} />
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNotifSettings(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowNotifSettings(false)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Feedback modal
  if (showFeedbackForm) {
    return (
      <Dialog
        open={showFeedbackForm}
        onOpenChange={(o) => {
          if (!o) {
            setShowFeedbackForm(false)
            setFeedbackSent(false)
            setFeedbackText("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Give feedback</DialogTitle>
          </DialogHeader>
          {feedbackSent ? (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="size-6 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold">
                Thanks for your feedback!
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Your feedback helps us improve System health.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setShowFeedbackForm(false)
                  setFeedbackSent(false)
                  setFeedbackText("")
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Help us improve System health by sharing your thoughts and
                suggestions.
              </p>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What would you like to tell us?"
                rows={4}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFeedbackForm(false)
                    setFeedbackText("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!feedbackText.trim()}
                  onClick={() => setFeedbackSent(true)}
                >
                  Submit
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">System health</h1>
          <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold">
            BETA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifSettings(true)}
          >
            Notification settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowFeedbackForm(true)}
          >
            <svg
              className="size-3.5"
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
      </div>

      <div className="mb-1 text-sm text-muted-foreground">
        View events affecting your app portfolio and their impact on your
        organization here.
      </div>
      <div className="mb-1 text-sm text-muted-foreground">
        Go to{" "}
        <button
          type="button"
          className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
        >
          status.atlassian.com
          <svg
            className="size-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>{" "}
        for a full list of Atlassian incidents.
      </div>
      <button
        type="button"
        className="mb-4 inline-flex items-center gap-0.5 text-sm text-blue-600 hover:underline"
      >
        Understand how we detect and classify incidents
        <svg
          className="size-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </button>

      <div className="mb-2 flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <svg
              className="mr-1 size-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : null}
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* All systems operational banner */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950/20">
        <svg
          className="size-5 text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span className="text-sm font-medium">All systems operational</span>
      </div>

      {/* Status by app */}
      <h2 className="mb-4 text-base font-semibold">Status by app</h2>

      <AppStatusListItems onSelect={setSelectedApp} />
    </div>
  )
}
