"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"

export default function ContactsPage() {
  const [contactsEnabled, setContactsEnabled] = useState(true)

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Contacts</h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        Contacts are email accounts from a third-party app, like Slack. Control when users connect or invite these contacts to your organization.
      </p>

      <div className="flex items-start gap-3 pl-1">
        <Switch
          checked={contactsEnabled}
          onCheckedChange={setContactsEnabled}
          className="mt-0.5"
        />
        <div>
          <p className="text-sm font-medium">Allow users to connect contacts from Google, Slack, and Microsoft</p>
          <p className="text-sm text-muted-foreground">
            Users can connect and invite contacts.{" "}
            <button type="button" className="text-blue-600 hover:underline">How to invite contacts</button>
          </p>
        </div>
      </div>
    </div>
  )
}
