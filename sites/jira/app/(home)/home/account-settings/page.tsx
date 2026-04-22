"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export default function AccountSettingsPage() {
  const [email] = useState("abhisheksharma67185@gmail.com")
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  return (
    <div className="max-w-3xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">Account settings</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Manage settings related to your Atlassian account.
      </p>

      {/* Email */}
      <section className="mb-10">
        <h2 className="mb-2 text-base font-semibold">Email</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Your email address is used to log in and receive notifications.
        </p>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{email}</p>
              <p className="text-xs text-muted-foreground">Primary email</p>
            </div>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Verified
            </span>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-10">
        <h2 className="mb-2 text-base font-semibold">Security</h2>

        {/* Change password */}
        <div className="mb-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                Last changed: Never
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangePasswordOpen(!changePasswordOpen)}
            >
              Change password
            </Button>
          </div>
          {changePasswordOpen && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Current password
                </label>
                <Input type="password" className="max-w-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  New password
                </label>
                <Input type="password" className="max-w-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Confirm new password
                </label>
                <Input type="password" className="max-w-sm" />
              </div>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                size="sm"
              >
                Save password
              </Button>
            </div>
          )}
        </div>

        {/* Two-step verification */}
        <div className="mb-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-step verification</p>
              <p className="text-xs text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Switch />
          </div>
        </div>

        {/* API tokens */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">API tokens</p>
              <p className="text-xs text-muted-foreground">
                Create and manage API tokens for third-party integrations.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>
        </div>
      </section>

      {/* Connected accounts */}
      <section className="mb-10">
        <h2 className="mb-2 text-base font-semibold">Connected accounts</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Link third-party accounts to use them for logging in.
        </p>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <div>
                <p className="text-sm font-medium">Google</p>
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-10">
        <h2 className="mb-2 text-base font-semibold">Privacy</h2>
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Profile visibility</p>
              <p className="text-xs text-muted-foreground">
                Control who can see your profile information.
              </p>
            </div>
            <select className="rounded-md border bg-background px-3 py-1.5 text-sm">
              <option>Anyone</option>
              <option>Organization members</option>
              <option>Only you</option>
            </select>
          </div>
        </div>
      </section>

      {/* Delete account */}
      <section>
        <h2 className="mb-2 text-base font-semibold text-red-600">
          Delete account
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950/20"
        >
          Delete your account
        </Button>
      </section>
    </div>
  )
}
