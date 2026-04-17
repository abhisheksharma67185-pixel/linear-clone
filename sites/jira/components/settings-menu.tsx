"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Target01Icon,
  ComputerIcon,
  UserIcon,
  UserMultiple02Icon,
  IdentityCardIcon,
  CreditCardIcon,
  ArrowUpRight01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// ─────────────────────────────────────────────────────────────────────────────
// Atlassian-style Settings menu.
//
// Rich list of 6 items across 3 categories:
//
//   ── (no header) ────────────────────────────
//   Goal settings       — internal route
//
//   Atlassian Home settings
//   Workspace settings  — opens in new tab
//   Personal settings   — opens in new tab
//
//   Atlassian admin settings
//   User management     — internal route
//   Licensing           — internal route
//   Billing             — internal route
//
// Each row: leading icon, bold title, muted-gray description, hover-accent
// background, and a trailing arrow-up-right for the two external items.
// ─────────────────────────────────────────────────────────────────────────────

type IconDef = Parameters<typeof HugeiconsIcon>[0]["icon"]

interface SettingsItem {
  title: string
  description: string
  icon: IconDef
  href: string
  external?: boolean
  testId: string
}

interface SettingsCategory {
  header?: string
  items: SettingsItem[]
}

const categories: SettingsCategory[] = [
  {
    items: [
      {
        title: "Goal settings",
        description: "Manage goal custom fields and scoring method",
        icon: Target01Icon,
        href: "/goals/settings",
        testId: "settings-item-goal-settings",
      },
    ],
  },
  {
    header: "Atlassian Home settings",
    items: [
      {
        title: "Workspace settings",
        description: "Manage workspace name, domains, user groups and time zone",
        icon: ComputerIcon,
        href: "/admin/organization-settings",
        external: true,
        testId: "settings-item-workspace-settings",
      },
      {
        title: "Personal settings",
        description: "Manage notification preferences and themes",
        icon: UserIcon,
        href: "/home/account-settings",
        external: true,
        testId: "settings-item-personal-settings",
      },
    ],
  },
  {
    header: "Atlassian admin settings",
    items: [
      {
        title: "User management",
        description: "Manage users, groups, and access requests",
        icon: UserMultiple02Icon,
        href: "/admin/users",
        testId: "settings-item-user-management",
      },
      {
        title: "Licensing",
        description: "Server and Data Center licensing",
        icon: IdentityCardIcon,
        href: "/admin/licensing",
        testId: "settings-item-licensing",
      },
      {
        title: "Billing",
        description: "Update your billing details, manage subscriptions, and more",
        icon: CreditCardIcon,
        href: "/admin/billing",
        testId: "settings-item-billing",
      },
    ],
  },
]

function SettingsRow({ item }: { item: SettingsItem }) {
  const linkProps = item.external
    ? { target: "_blank", rel: "noopener noreferrer" as const }
    : {}

  return (
    <Link
      href={item.href}
      data-testid={item.testId}
      {...linkProps}
      className="group flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
    >
      <HugeiconsIcon
        icon={item.icon}
        className="size-5 shrink-0 text-foreground mt-0.5"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground leading-snug">{item.title}</p>
        <p className="text-sm text-gray-500 dark:text-muted-foreground leading-snug">
          {item.description}
        </p>
      </div>
      {item.external && (
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          className="size-4 shrink-0 text-gray-400 mt-1"
          aria-label="Opens in new tab"
          data-testid={`${item.testId}-external`}
        />
      )}
    </Link>
  )
}

export function SettingsMenu() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Settings"
        className="rounded-full p-1.5 text-muted-foreground hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <HugeiconsIcon icon={Settings02Icon} className="size-5" aria-hidden="true" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 overflow-hidden rounded-lg border shadow-xl"
      >
        <div className="py-2">
          {categories.map((cat, i) => (
            <div key={cat.header ?? `cat-${i}`}>
              {cat.header && (
                <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-muted-foreground">
                  {cat.header}
                </p>
              )}
              {cat.items.map((item) => (
                <SettingsRow key={item.testId} item={item} />
              ))}
              {i < categories.length - 1 && <div className="my-2 border-t" />}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
