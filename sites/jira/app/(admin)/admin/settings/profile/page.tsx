"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ProfilePage() {
  const [orgName, setOrgName] = useState("abhisheksharma67185")

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Profile</h1>

      {/* Change organization name */}
      <h2 className="text-base font-semibold mb-2">Change organization name</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
        Your organization name is displayed in headings, navigation, and emails sent to managed accounts. It will usually be the name of your company or organization.
      </p>

      <div className="mb-2">
        <label className="text-sm font-medium">
          Organization name <span className="text-red-500">*</span>
        </label>
      </div>
      <Input
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        className="max-w-sm mb-4"
      />

      <div className="flex items-center gap-2 mb-10">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
        <Button variant="ghost">Cancel</Button>
      </div>

      {/* Transfer section */}
      <h2 className="text-base font-semibold mb-2">Transfer all apps to another organization you administer</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
        Move all apps from this organization to another so that you can administer all users from the same place. Users will retain all existing app access and roles.
      </p>

      <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 px-4 py-3 mb-10">
        <svg className="size-5 text-yellow-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <div>
          <p className="text-sm">
            This feature is unavailable for your organization. To transfer your apps to another organization, contact support and raise a ticket under the category <strong>Technical issues and bugs.</strong>
          </p>
          <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline">Contact support</a>
        </div>
      </div>

      {/* Delete organization */}
      <h2 className="text-base font-semibold mb-2">Delete organization</h2>
      <p className="text-sm text-muted-foreground mb-2 max-w-3xl">
        We recommend that you delete this organization only if you no longer need it. Make sure you&apos;ve backed up any data that you would like to keep.{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">How to delete an organization</a>
      </p>
      <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
        You can delete an organization only if there are no domains and no active app subscriptions associated with the organization.
      </p>

      <Button variant="outline">Delete organization</Button>
    </div>
  )
}
