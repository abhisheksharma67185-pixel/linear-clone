"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function CreateSiteDialog() {
  const [open, setOpen] = useState(false)
  const [siteName, setSiteName] = useState("abhisheksharma67185-177558774")
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-[#0052CC] hover:text-[#0747A6] hover:underline"
      >
        Create a new site
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[480px] rounded-2xl border-0 p-0 shadow-2xl [&>button]:hidden">
          <div className="flex flex-col items-center px-10 pt-10 pb-8">
            {/* Jira logo */}
            <div className="mb-6 flex items-center gap-2">
              <svg className="size-7" viewBox="0 0 32 32" fill="#2684FF">
                <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
              </svg>
              <span className="text-xl font-semibold text-slate-800">Jira</span>
            </div>

            {/* Welcome heading */}
            <h2 className="mb-1 text-center text-2xl font-bold text-slate-800">
              <span className="relative inline-block">
                Welcome back, Abhishek
                <svg
                  className="absolute -bottom-1 left-[42%] w-[70px]"
                  viewBox="0 0 120 12"
                  fill="none"
                >
                  <path
                    d="M2 6C12 2 22 10 32 6C42 2 52 10 62 6C72 2 82 10 92 6C102 2 112 10 118 6"
                    stroke="#F5A623"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>

            <p className="mb-8 text-sm text-slate-600">
              Pick up where you left off in Jira.
            </p>

            {/* Your site input */}
            <div className="w-full">
              <Label className="mb-1.5 block text-sm font-medium text-slate-800">
                Your site
              </Label>
              <div className="flex items-center rounded-md border-2 border-green-600 bg-white px-3 py-0.5">
                <Input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="flex-1 border-0 bg-transparent px-0 text-sm text-slate-800 shadow-none focus-visible:ring-0"
                />
                <span className="mx-2 shrink-0 text-sm text-slate-500">
                  .atlassian.net
                </span>
                {/* Green checkmark */}
                <svg
                  className="size-5 shrink-0 text-green-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>

            {/* Continue button */}
            <Button
              onClick={() => {
                setOpen(false)
                router.push("/dashboard")
              }}
              className="mt-5 w-full bg-[#0052CC] py-3 text-base font-semibold text-white hover:bg-[#0747A6]"
              size="lg"
            >
              Continue
            </Button>

            {/* Join existing site link */}
            <p className="mt-6 text-sm text-slate-600">
              or{" "}
              <button
                onClick={() => setOpen(false)}
                className="font-medium text-[#0052CC] hover:underline"
              >
                join an existing site
              </button>
            </p>
          </div>

          {/* Atlassian logo at bottom */}
          <div className="flex justify-center border-t border-slate-200 py-5">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 32 32" fill="#2684FF">
                <path
                  d="M10.543 18.17a.86.86 0 0 0-1.478.147L4.076 28.204A.86.86 0 0 0 4.85 29.5h7.956a.86.86 0 0 0 .774-.491c1.806-3.763.62-8.928-3.037-10.839z"
                  opacity="0.7"
                />
                <path d="M15.593 3.09a14.58 14.58 0 0 0-.98 14.79l4.56 9.13a.86.86 0 0 0 1.538 0l5.213-10.42a.86.86 0 0 0 0-.77L18.67 3.09a1.63 1.63 0 0 0-3.076 0z" />
              </svg>
              <span className="text-sm font-bold tracking-wider text-slate-800">
                ATLASSIAN
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
