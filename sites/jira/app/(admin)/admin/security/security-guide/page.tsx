"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const recommendations = [
  {
    title: "Add another admin",
    description: "Ensure you have another admin to avoid being locked out",
    badge: "1 organization admin",
    href: "/admin/users",
  },
  {
    title: "Verify your domain",
    description: "Prove you own the domain of your user accounts",
    href: "/admin/domains",
  },
  {
    title: "Claim your user accounts",
    description:
      "Claim accounts from your domain so you can apply authentication settings to managed accounts",
    href: "/admin/managed-accounts",
  },
  {
    title: "Update your authentication policy",
    description: "Specify authentication settings for managed accounts",
    href: "/admin/security/user-security/authentication-policies",
  },
  {
    title: "Control the location of your data",
    description:
      "Choose where you store app data to meet your privacy, security, and legal requirements",
    badge: "3 unpinned apps",
    href: "/admin/data-management/data-residency",
  },
]

const guardRecommendations = [
  {
    title: "Connect your identity provider",
    description:
      "Make it easy for users to log in from your identity provider and provision them automatically",
    bullets: ["Set up SAML single sign-on", "Set up user provisioning"],
    badge: "0 identity providers",
    href: "/admin/security/user-security/identity-providers",
  },
  {
    title: "Create more authentication policies",
    description:
      "Create multiple policies to enforce different authentication settings for subsets of users",
    badge: "0 managed accounts",
    href: "/admin/security/user-security/authentication-policies",
  },
  {
    title: "Set up your external user policy",
    description: "Control how users you don't manage access your apps",
    badge: "1 external user",
    href: "/admin/security/user-security/external-users",
  },
  {
    title: "Activate a data security policy",
    description:
      "Control how users and other entities interact with your Atlassian app data",
    badge: "4 apps",
    href: "/admin/security/data-protection/data-security-policy",
  },
  {
    title: "Create a mobile app policy",
    description:
      "Configure security controls for Jira Cloud, Confluence Cloud, and Opsgenie Cloud mobile apps",
    badge: "0 mobile app users",
    href: "/admin/security/device-security/mobile-app-policies",
  },
]

const featureCards = [
  {
    title: "Analytics",
    description:
      "View charts about the security of your accounts and the usage of your apps.",
    action: "View analytics",
    href: "/admin/insights/analytics",
    iconBg: "bg-green-600",
    icon: (
      <svg
        className="size-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Audit log",
    description:
      "Monitor changes to app access, organization settings, and more.",
    action: "View audit log",
    href: "/admin/insights/audit-log",
    iconBg: "bg-red-500",
    icon: (
      <svg
        className="size-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
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
    href: "/admin/insights/api-token-activity",
    iconBg: "bg-purple-600",
    icon: (
      <svg
        className="size-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Get help",
    description:
      "Ask questions, share resources, and get tips from fellow admins in the Atlassian Community.",
    action: "Ask the community",
    href: "/teams",
    iconBg: "bg-green-700",
    icon: (
      <svg
        className="size-4 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
]

export default function SecurityGuidePage() {
  const [hideCompleted, setHideCompleted] = useState(false)

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-semibold">Security guide</h1>

      {/* Top cards row */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        {/* First step - Verify domain */}
        <div className="rounded-lg border p-6">
          <div className="mb-1">
            <span className="text-xs font-bold text-orange-600">
              First step
            </span>
          </div>
          <h3 className="mb-2 text-base font-semibold">Verify your domain</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Prove you own your domain so you can claim and manage user accounts.
            Managed accounts are more secure.
          </p>
          <Link href="/admin/domains">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Verify domain
            </Button>
          </Link>
        </div>

        {/* Users with access donut */}
        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Users with access to your apps
            </h3>
            <div className="flex items-center gap-1">
              <button className="rounded p-1 text-muted-foreground hover:bg-accent">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Security recommendations</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Hide completed items
          </span>
          <Switch checked={hideCompleted} onCheckedChange={setHideCompleted} />
        </div>
      </div>

      {/* Get control section */}
      <p className="mb-3 text-xs font-bold text-muted-foreground">
        Get control of your organization
      </p>

      <div className="mb-6 divide-y rounded-lg border">
        {recommendations.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50"
          >
            <div className="shrink-0 text-muted-foreground">
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold">{item.title}</h4>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {item.badge && (
                <span className="rounded border px-2 py-1 text-xs text-muted-foreground">
                  {item.badge}
                </span>
              )}
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Atlassian Guard section */}
      <div className="mb-3 flex items-center gap-2">
        <p className="text-xs font-bold text-muted-foreground">
          Secure your organization&apos;s users and data
        </p>
        <span className="text-sm">🛡️</span>
        <button type="button" className="text-sm text-blue-600 hover:underline">
          Requires Atlassian Guard
        </button>
      </div>

      <div className="mb-6 divide-y rounded-lg border">
        {guardRecommendations.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50"
          >
            <div className="shrink-0 text-muted-foreground">
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold">{item.title}</h4>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              {item.bullets && (
                <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                  {item.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {item.badge && (
                <span className="rounded border px-2 py-1 text-xs text-muted-foreground">
                  {item.badge}
                </span>
              )}
              <svg
                className="size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Atlassian Guard CTA banner */}
      <div className="mb-8 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-5 py-3 dark:border-blue-800 dark:bg-blue-950/20">
        <div className="flex items-center gap-2">
          <span className="text-sm">🛡️</span>
          <span className="text-sm font-medium">
            Try Atlassian Guard to secure your users and protect your
            top-priority projects.
          </span>
        </div>
        <button
          type="button"
          className="text-sm font-semibold whitespace-nowrap text-blue-600 hover:underline"
        >
          Start 30-day free trial
        </button>
      </div>

      {/* Bottom feature cards */}
      <div className="grid grid-cols-4 gap-4">
        {featureCards.map((card) => (
          <div key={card.title} className="flex flex-col rounded-lg border p-5">
            <div
              className={`size-9 rounded-lg ${card.iconBg} mb-3 flex items-center justify-center`}
            >
              {card.icon}
            </div>
            <h3 className="mb-1 text-sm font-semibold">{card.title}</h3>
            <p className="mb-4 flex-1 text-xs text-muted-foreground">
              {card.description}
            </p>
            <Link href={card.href}>
              <Button variant="outline" size="sm" className="w-fit">
                {card.action}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
