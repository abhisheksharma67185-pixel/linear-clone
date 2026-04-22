"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function LoginPageSettingsPage() {
  const [thirdPartyLogin, setThirdPartyLogin] = useState<"show" | "hide">(
    "show"
  )

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Login page</h1>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        The login page is the first thing that your users see when they log in
        to Confluence and Jira apps.{" "}
        <button type="button" className="text-blue-600 hover:underline">
          How to customize your login page
        </button>
      </p>

      <div className="flex gap-8">
        {/* Left column - settings */}
        <div className="flex-1">
          <h2 className="mb-2 text-base font-semibold">Third-party login</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Choose whether users see third-party login options on the login
            page.
          </p>

          <div className="mb-4 flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="thirdPartyLogin"
                checked={thirdPartyLogin === "show"}
                onChange={() => setThirdPartyLogin("show")}
                className="size-4 text-blue-600"
              />
              <span className="text-sm font-medium">Show</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="thirdPartyLogin"
                checked={thirdPartyLogin === "hide"}
                onChange={() => setThirdPartyLogin("hide")}
                className="size-4"
                disabled
              />
              <span className="text-sm text-muted-foreground">Hide</span>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                Requires an Atlassian Guard subscription
              </button>
            </label>
          </div>

          <p className="mb-1 text-sm text-muted-foreground">
            Use authentication policies to block managed accounts from using
            third-party login.
          </p>
          <a
            href="/admin/security/user-security/authentication-policies"
            className="mb-6 inline-block text-sm text-blue-600 hover:underline"
          >
            Go to Authentication policies
          </a>

          <div className="mt-4 flex items-center gap-2">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Update
            </Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </div>

        {/* Right column - preview */}
        <div className="w-72 shrink-0">
          <div className="rounded-lg border bg-gradient-to-b from-blue-50 to-white p-6 shadow-sm dark:from-blue-950/20 dark:to-background">
            {/* Atlassian logo */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <svg className="size-5" viewBox="0 0 32 32" fill="#1868DB">
                  <path d="M11.57 14.14a.87.87 0 00-1.47.27L5.15 27a.87.87 0 00.8 1.2h7.07a.86.86 0 00.78-.5 18.52 18.52 0 00-2.23-13.56zM15.72 4.2a20.79 20.79 0 00-1.55 20.25.87.87 0 00.78.5h7.07a.87.87 0 00.8-1.19C20.41 16.66 17.06 5.83 16.25 3.93a.88.88 0 00-1.53.27z" />
                </svg>
                <span className="text-sm font-bold text-blue-700">
                  ATLASSIAN
                </span>
              </div>
            </div>

            {/* Form placeholder lines */}
            <div className="mb-5 space-y-3">
              <div className="h-2.5 w-full rounded bg-muted" />
              <div className="h-8 w-full rounded bg-muted" />
              <div className="h-2.5 w-3/4 rounded bg-muted" />
              <div className="h-8 w-full rounded bg-blue-200" />
            </div>

            {/* Or continue with */}
            <p className="mb-3 text-center text-[10px] text-muted-foreground">
              Or continue with
            </p>

            <div className="space-y-2">
              {[
                { name: "Google", icon: "G", color: "text-red-500" },
                { name: "Microsoft", icon: "⊞", color: "text-blue-500" },
                { name: "Apple", icon: "", color: "text-foreground" },
                { name: "Slack", icon: "#", color: "text-purple-500" },
              ].map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-center gap-1.5 rounded border bg-background px-3 py-1.5 text-[10px]"
                >
                  <span className={provider.color}>{provider.icon}</span>
                  {provider.name}
                </div>
              ))}
            </div>

            {/* Bottom placeholders */}
            <div className="mt-4 space-y-2">
              <div className="mx-auto h-2 w-1/2 rounded bg-muted" />
              <div className="mx-auto h-2 w-2/3 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
