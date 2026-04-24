"use client"

import Link from "next/link"
import { useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

const PLANS = [
  {
    name: "Free",
    price: "$0",
    tagline: "For small teams trying out Linear",
    features: ["Up to 250 issues", "Unlimited members", "GitHub + Slack"],
  },
  {
    name: "Basic",
    price: "$12 /user/mo",
    tagline: "For growing teams that need more",
    features: [
      "Unlimited issues + file uploads",
      "Admin roles",
      "Restrict new user invitations",
    ],
    highlight: true,
  },
  {
    name: "Business",
    price: "$24 /user/mo",
    tagline: "For cross-functional orgs",
    features: [
      "SLAs + Asks intake",
      "Workflows & automations",
      "SAML / SCIM SSO",
    ],
  },
]

export default function BillingUpgradePage() {
  useEffect(() => {
    document.title = "Upgrade plan"
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/settings?section=billing"
        scroll={false}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Back to billing
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Choose a plan</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upgrade to unlock advanced collaboration, admin, and security
          features.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`bg-card rounded-lg border p-4 ${
              p.highlight
                ? "border-foreground/30 ring-foreground/10 ring-1"
                : ""
            }`}
          >
            <div className="text-sm font-semibold">{p.name}</div>
            <div className="mt-1 text-lg font-semibold">{p.price}</div>
            <p className="text-muted-foreground mt-1 text-xs">{p.tagline}</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-xs">
              {p.features.map((f) => (
                <li key={f} className="text-muted-foreground">
                  • {f}
                </li>
              ))}
            </ul>
            <Button size="sm" className="mt-4 w-full" disabled={p.name === "Free"}>
              {p.name === "Free" ? "Current plan" : `Upgrade to ${p.name}`}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
