"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"

export default function ContactsPage() {
  const [contactsEnabled, setContactsEnabled] = useState(true)

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Contacts</h1>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        Contacts are email accounts from a third-party app, like Slack. Control
        when users connect or invite these contacts to your organization.
      </p>

      <div className="flex items-start gap-3 pl-1">
        <Switch
          checked={contactsEnabled}
          onCheckedChange={setContactsEnabled}
          className="mt-0.5"
        />
        <div>
          <p className="text-sm font-medium">
            Allow users to connect contacts from Google, Slack, and Microsoft
          </p>
          <p className="text-sm text-muted-foreground">
            Users can connect and invite contacts.{" "}
            <a
              href="https://support.atlassian.com/organization-administration/docs/manage-contacts-in-your-organization/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              How to invite contacts
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
