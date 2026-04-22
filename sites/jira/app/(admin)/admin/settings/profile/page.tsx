"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function ProfilePage() {
  const [orgName, setOrgName] = useState("abhisheksharma67185")
  const [savedOrgName, setSavedOrgName] = useState("abhisheksharma67185")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  )
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const isDirty = orgName !== savedOrgName
  const canDelete = deleteConfirmText === savedOrgName

  const handleSave = () => {
    if (!orgName.trim()) return
    setSaveStatus("saving")
    setTimeout(() => {
      setSavedOrgName(orgName)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 500)
  }

  const handleCancel = () => {
    setOrgName(savedOrgName)
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Profile</h1>

      {/* Change organization name */}
      <h2 className="mb-2 text-base font-semibold">Change organization name</h2>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        Your organization name is displayed in headings, navigation, and emails
        sent to managed accounts. It will usually be the name of your company or
        organization.
      </p>

      <div className="mb-2">
        <label className="text-sm font-medium">
          Organization name <span className="text-red-500">*</span>
        </label>
      </div>
      <Input
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
        className="mb-4 max-w-sm"
      />

      <div className="mb-10 flex items-center gap-2">
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleSave}
          disabled={!orgName.trim() || saveStatus === "saving"}
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

      {/* Transfer section */}
      <h2 className="mb-2 text-base font-semibold">
        Transfer all apps to another organization you administer
      </h2>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        Move all apps from this organization to another so that you can
        administer all users from the same place. Users will retain all existing
        app access and roles.
      </p>

      <div className="mb-10 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-800 dark:bg-yellow-950/20">
        <svg
          className="mt-0.5 size-5 shrink-0 text-yellow-600"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <div>
          <p className="text-sm">
            This feature is unavailable for your organization. To transfer your
            apps to another organization, contact support and raise a ticket
            under the category <strong>Technical issues and bugs.</strong>
          </p>
          <a
            href="https://support.atlassian.com/contact/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Contact support
          </a>
        </div>
      </div>

      {/* Delete organization */}
      <h2 className="mb-2 text-base font-semibold">Delete organization</h2>
      <p className="mb-2 max-w-3xl text-sm text-muted-foreground">
        We recommend that you delete this organization only if you no longer
        need it. Make sure you&apos;ve backed up any data that you would like to
        keep.{" "}
        <a
          href="https://support.atlassian.com/organization-administration/docs/delete-an-organization/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          How to delete an organization
        </a>
      </p>
      <p className="mb-2 max-w-3xl text-sm text-muted-foreground">
        Before you can delete the organization, you&apos;ll need to:
      </p>
      <ul className="mb-4 max-w-3xl list-disc pl-6">
        <li className="text-sm text-muted-foreground">
          Remove all apps included in your active subscriptions.{" "}
          <a
            href="https://support.atlassian.com/organization-administration/docs/manage-your-product-subscriptions/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            How to do this
          </a>
        </li>
      </ul>

      <Button variant="outline" onClick={() => setDeleteOpen(true)}>
        Delete organization
      </Button>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete organization</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              organization <strong>{savedOrgName}</strong> and all associated
              data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium">
              Type <strong>{savedOrgName}</strong> to confirm
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={savedOrgName}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false)
                setDeleteConfirmText("")
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={!canDelete}
              onClick={() => {
                setDeleteOpen(false)
                setDeleteConfirmText("")
              }}
            >
              Delete organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
