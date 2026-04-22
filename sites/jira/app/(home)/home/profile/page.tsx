"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

export default function PersonalProfilePage() {
  const [fullName, setFullName] = useState("Abhishek Sharma")
  const [email] = useState("abhisheksharma67185@gmail.com")
  const [jobTitle, setJobTitle] = useState("")
  const [department, setDepartment] = useState("")
  const [organization] = useState("abhisheksharma67185")
  const [location, setLocation] = useState("")
  const [timezone, setTimezone] = useState(
    "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi"
  )
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  )

  const handleSave = () => {
    if (!fullName.trim()) return
    setSaveStatus("saving")
    setTimeout(() => {
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 500)
  }

  return (
    <div className="max-w-3xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">Profile and visibility</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Manage your personal information, and control which information other
        people see and apps may access.
      </p>

      {/* Profile photo */}
      <section className="mb-10">
        <h2 className="mb-4 text-base font-semibold">Profile photo</h2>
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarFallback className="bg-blue-600 text-2xl font-semibold text-white">
              AS
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              Upload a photo
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              Max file size: 1MB. JPG, GIF, or PNG.
            </p>
          </div>
        </div>
      </section>

      {/* About you */}
      <section className="mb-10">
        <h2 className="mb-4 text-base font-semibold">About you</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Full name <span className="text-red-500">*</span>
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Public name
            </label>
            <Input value={fullName} disabled className="max-w-sm bg-muted" />
            <p className="mt-1 text-xs text-muted-foreground">
              This name is visible to anyone who can view your content.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Job title</label>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="max-w-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Department</label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              className="max-w-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Organization
            </label>
            <Input
              value={organization}
              disabled
              className="max-w-sm bg-muted"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Based in</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New Delhi, India"
              className="max-w-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Time zone</label>
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
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mb-10">
        <h2 className="mb-4 text-base font-semibold">Contact</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Email address
          </label>
          <Input value={email} disabled className="max-w-sm bg-muted" />
          <p className="mt-1 text-xs text-muted-foreground">
            This is the email address associated with your Atlassian account. To
            change it, go to Account settings.
          </p>
        </div>
      </section>

      <Button
        className="bg-blue-600 text-white hover:bg-blue-700"
        onClick={handleSave}
        disabled={!fullName.trim() || saveStatus === "saving"}
      >
        {saveStatus === "saving"
          ? "Saving..."
          : saveStatus === "saved"
            ? "Saved!"
            : "Save changes"}
      </Button>
    </div>
  )
}
