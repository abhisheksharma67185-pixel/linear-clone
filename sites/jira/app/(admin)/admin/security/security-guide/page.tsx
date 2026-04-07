"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const recommendations = [
  {
    title: "Add another admin",
    description: "Ensure you have another admin to avoid being locked out",
    badge: "1 organization admin",
  },
  {
    title: "Verify your domain",
    description: "Prove you own the domain of your user accounts",
  },
  {
    title: "Claim your user accounts",
    description: "Claim accounts from your domain so you can apply authentication settings to managed accounts",
  },
  {
    title: "Update your authentication policy",
    description: "Specify authentication settings for managed accounts",
  },
  {
    title: "Control the location of your data",
    description: "Choose where you store app data to meet your privacy, security, and legal requirements",
    badge: "3 unpinned apps",
  },
]

const guardRecommendations = [
  {
    title: "Connect your identity provider",
    description: "Make it easy for users to log in from your identity provider and provision them automatically",
    bullets: ["Set up SAML single sign-on", "Set up user provisioning"],
    badge: "0 identity providers",
  },
  {
    title: "Create more authentication policies",
    description: "Create multiple policies to enforce different authentication settings for subsets of users",
    badge: "0 managed accounts",
  },
  {
    title: "Set up your external user policy",
    description: "Control how users you don't manage access your apps",
    badge: "1 external user",
  },
  {
    title: "Activate a data security policy",
    description: "Control how users and other entities interact with your Atlassian app data",
    badge: "4 apps",
  },
  {
    title: "Create a mobile app policy",
    description: "Configure security controls for Jira Cloud, Confluence Cloud, and Opsgenie Cloud mobile apps",
    badge: "0 mobile app users",
  },
]

const featureCards = [
  {
    title: "Analytics",
    description: "View charts about the security of your accounts and the usage of your apps.",
    action: "View analytics",
    iconBg: "bg-green-600",
    icon: (
      <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Audit log",
    description: "Monitor changes to app access, organization settings, and more.",
    action: "View audit log",
    iconBg: "bg-red-500",
    icon: (
      <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <line x1="4" y1="10" x2="20" y2="10" />
        <line x1="10" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    title: "API token activity",
    description: "View API token activity and revoke the tokens you need to.",
    action: "View API tokens",
    iconBg: "bg-purple-600",
    icon: (
      <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Get help",
    description: "Ask questions, share resources, and get tips from fellow admins in the Atlassian Community.",
    action: "Ask the community",
    iconBg: "bg-green-700",
    icon: (
      <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
]

export default function SecurityGuidePage() {
  const [hideCompleted, setHideCompleted] = useState(false)

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-8">Security guide</h1>

      {/* Top cards row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* First step - Verify domain */}
        <div className="rounded-lg border p-6">
          <div className="mb-1">
            <span className="text-xs font-bold text-orange-600">First step</span>
          </div>
          <h3 className="text-base font-semibold mb-2">Verify your domain</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Prove you own your domain so you can claim and manage user accounts. Managed accounts are more secure.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Verify domain
          </Button>
        </div>

        {/* Users with access donut */}
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Users with access to your apps</h3>
            <div className="flex items-center gap-1">
              <button className="rounded p-1 text-muted-foreground hover:bg-accent">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
              <button className="rounded p-1 text-muted-foreground hover:bg-accent">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            {/* Donut chart */}
            <div className="relative">
              <svg className="size-28" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#65a30d"
                  strokeWidth="12"
                  strokeDasharray="314"
                  strokeDashoffset="0"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">1</span>
                <span className="text-xs text-muted-foreground">users</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-sm bg-blue-600" />
                <span>Managed accounts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-sm bg-lime-600" />
                <span>External users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security recommendations */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Security recommendations</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hide completed items</span>
          <Switch checked={hideCompleted} onCheckedChange={setHideCompleted} />
        </div>
      </div>

      {/* Get control section */}
      <p className="text-xs font-bold text-muted-foreground mb-3">Get control of your organization</p>

      <div className="rounded-lg border divide-y mb-6">
        {recommendations.map((item) => (
          <div key={item.title} className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 cursor-pointer transition-colors">
            <div className="shrink-0 text-muted-foreground">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.badge && (
                <span className="rounded border px-2 py-1 text-xs text-muted-foreground">{item.badge}</span>
              )}
              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Atlassian Guard section */}
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs font-bold text-muted-foreground">Secure your organization&apos;s users and data</p>
        <span className="text-sm">🛡️</span>
        <a href="" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline">Requires Atlassian Guard</a>
      </div>

      <div className="rounded-lg border divide-y mb-6">
        {guardRecommendations.map((item) => (
          <div key={item.title} className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 cursor-pointer transition-colors">
            <div className="shrink-0 text-muted-foreground">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {item.bullets && (
                <ul className="mt-1 list-disc list-inside text-sm text-muted-foreground">
                  {item.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.badge && (
                <span className="rounded border px-2 py-1 text-xs text-muted-foreground">{item.badge}</span>
              )}
              <svg className="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Atlassian Guard CTA banner */}
      <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 px-5 py-3 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-sm">🛡️</span>
          <span className="text-sm font-medium">Try Atlassian Guard to secure your users and protect your top-priority projects.</span>
        </div>
        <a href="" onClick={(e) => e.preventDefault()} className="text-sm font-semibold text-blue-600 hover:underline whitespace-nowrap">Start 30-day free trial</a>
      </div>

      {/* Bottom feature cards */}
      <div className="grid grid-cols-4 gap-4">
        {featureCards.map((card) => (
          <div key={card.title} className="rounded-lg border p-5 flex flex-col">
            <div className={`size-9 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <h3 className="text-sm font-semibold mb-1">{card.title}</h3>
            <p className="text-xs text-muted-foreground mb-4 flex-1">{card.description}</p>
            <Button variant="outline" size="sm" className="w-fit">
              {card.action}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
