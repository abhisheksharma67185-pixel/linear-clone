"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const timezones = [
  "(GMT-12:00) International Date Line West",
  "(GMT-08:00) Pacific Time (US & Canada)",
  "(GMT-07:00) Mountain Time (US & Canada)",
  "(GMT-06:00) Central Time (US & Canada)",
  "(GMT-05:00) Eastern Time (US & Canada)",
  "(GMT+00:00) UTC",
  "(GMT+00:00) London, Edinburgh",
  "(GMT+01:00) Amsterdam, Berlin, Rome",
  "(GMT+02:00) Helsinki, Kyiv, Riga",
  "(GMT+03:00) Moscow, St. Petersburg",
  "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi",
  "(GMT+08:00) Beijing, Perth, Singapore",
  "(GMT+09:00) Tokyo, Seoul",
  "(GMT+10:00) Sydney, Melbourne",
  "(GMT+12:00) Auckland, Wellington",
]

export default function OrganizationSettingsPage() {
  const [orgName, setOrgName] = useState("abhisheksharma67185")
  const [savedOrgName, setSavedOrgName] = useState("abhisheksharma67185")
  const [timezone, setTimezone] = useState(
    "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi"
  )
  const [savedTimezone, setSavedTimezone] = useState(
    "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi"
  )
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  )

  const isDirty = orgName !== savedOrgName || timezone !== savedTimezone

  const handleSave = () => {
    if (!orgName.trim()) return
    setSaveStatus("saving")
    setTimeout(() => {
      setSavedOrgName(orgName)
      setSavedTimezone(timezone)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 500)
  }

  const handleCancel = () => {
    setOrgName(savedOrgName)
    setTimezone(savedTimezone)
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Workspace settings</h1>

      {/* Workspace name */}
      <section className="mb-10">
        <h2 className="mb-2 text-base font-semibold">Workspace name</h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Your workspace name is displayed across Atlassian products in headings
          and navigation. It&apos;s usually the name of your company or
          organization.
        </p>
        <div className="mb-2">
          <label className="text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </label>
        </div>
        <Input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="max-w-sm"
        />
      </section>

      {/* Domains */}
      <section className="mb-10">
        <h2 className="mb-2 text-base font-semibold">Domains</h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Verified domains allow you to manage accounts that use email addresses
          from your domains. Users who sign up with a verified domain are
          automatically added to your organization.
        </p>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            No domains verified yet.
          </p>
        </div>
      </section>

      {/* User groups */}
      <section className="mb-10">
        <h2 className="mb-2 text-base font-semibold">User groups</h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Organize users into groups to manage permissions and access across
          your Atlassian products more efficiently.
        </p>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Default group</p>
              <p className="text-xs text-muted-foreground">1 member</p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              Active
            </span>
          </div>
        </div>
      </section>

      {/* Time zone */}
      <section className="mb-10">
        <h2 className="mb-2 text-base font-semibold">Time zone</h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          Set the default time zone for your workspace. This affects how dates
          and times are displayed across products.
        </p>
        <div className="mb-2">
          <label className="text-sm font-medium">Workspace time zone</label>
        </div>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full max-w-sm rounded-md border bg-background px-3 py-2 text-sm"
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </section>

      {/* Save / Cancel */}
      <div className="flex items-center gap-2">
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleSave}
          disabled={!isDirty || !orgName.trim() || saveStatus === "saving"}
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? "Saved!"
              : "Save"}
        </Button>
        <Button variant="ghost" onClick={handleCancel} disabled={!isDirty}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
