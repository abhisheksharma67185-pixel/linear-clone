"use client"

import { Button } from "@/components/ui/button"

export default function EmailsPage() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Emails</h1>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-lg mx-auto">
        <h2 className="text-lg font-semibold mb-3">
          Deliver secure emails from your domain
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          Improve delivery rates and security by personalizing notifications from your apps. To start, verify your domain and add email addresses for project admins to use.{" "}
          <button type="button" className="text-blue-600 hover:underline">Explore emails</button>
        </p>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Add domain
        </Button>
      </div>
    </div>
  )
}
