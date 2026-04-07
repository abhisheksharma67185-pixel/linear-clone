"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function LoginPageSettingsPage() {
  const [thirdPartyLogin, setThirdPartyLogin] = useState<"show" | "hide">("show")

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-4">Login page</h1>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        The login page is the first thing that your users see when they log in to Confluence and Jira apps.{" "}
        <a href="" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">How to customize your login page</a>
      </p>

      <div className="flex gap-8">
        {/* Left column - settings */}
        <div className="flex-1">
          <h2 className="text-base font-semibold mb-2">Third-party login</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose whether users see third-party login options on the login page.
          </p>

          <div className="flex flex-col gap-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="thirdPartyLogin"
                checked={thirdPartyLogin === "show"}
                onChange={() => setThirdPartyLogin("show")}
                className="size-4 text-blue-600"
              />
              <span className="text-sm font-medium">Show</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="thirdPartyLogin"
                checked={thirdPartyLogin === "hide"}
                onChange={() => setThirdPartyLogin("hide")}
                className="size-4"
                disabled
              />
              <span className="text-sm text-muted-foreground">Hide</span>
              <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline">Requires an Atlassian Guard subscription</a>
            </label>
          </div>

          <p className="text-sm text-muted-foreground mb-1">
            Use authentication policies to block managed accounts from using third-party login.
          </p>
          <a href="/admin/security/user-security/authentication-policies" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
            Go to Authentication policies
          </a>

          <div className="flex items-center gap-2 mt-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Update</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </div>

        {/* Right column - preview */}
        <div className="w-72 shrink-0">
          <div className="rounded-lg border bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background p-6 shadow-sm">
            {/* Atlassian logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-1">
                <svg className="size-5" viewBox="0 0 32 32" fill="#1868DB">
                  <path d="M11.57 14.14a.87.87 0 00-1.47.27L5.15 27a.87.87 0 00.8 1.2h7.07a.86.86 0 00.78-.5 18.52 18.52 0 00-2.23-13.56zM15.72 4.2a20.79 20.79 0 00-1.55 20.25.87.87 0 00.78.5h7.07a.87.87 0 00.8-1.19C20.41 16.66 17.06 5.83 16.25 3.93a.88.88 0 00-1.53.27z" />
                </svg>
                <span className="text-sm font-bold text-blue-700">ATLASSIAN</span>
              </div>
            </div>

            {/* Form placeholder lines */}
            <div className="space-y-3 mb-5">
              <div className="h-2.5 bg-muted rounded w-full" />
              <div className="h-8 bg-muted rounded w-full" />
              <div className="h-2.5 bg-muted rounded w-3/4" />
              <div className="h-8 bg-blue-200 rounded w-full" />
            </div>

            {/* Or continue with */}
            <p className="text-[10px] text-center text-muted-foreground mb-3">Or continue with</p>

            <div className="space-y-2">
              {[
                { name: "Google", icon: "G", color: "text-red-500" },
                { name: "Microsoft", icon: "⊞", color: "text-blue-500" },
                { name: "Apple", icon: "", color: "text-foreground" },
                { name: "Slack", icon: "#", color: "text-purple-500" },
              ].map((provider) => (
                <div key={provider.name} className="flex items-center justify-center gap-1.5 rounded border bg-background px-3 py-1.5 text-[10px]">
                  <span className={provider.color}>{provider.icon}</span>
                  {provider.name}
                </div>
              ))}
            </div>

            {/* Bottom placeholders */}
            <div className="mt-4 space-y-2">
              <div className="h-2 bg-muted rounded w-1/2 mx-auto" />
              <div className="h-2 bg-muted rounded w-2/3 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
