"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Target01Icon,
  ComputerIcon,
  UserIcon,
  UserMultiple02Icon,
  IdentityCardIcon,
  CreditCardIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
        description:
          "Manage workspace name, domains, user groups and time zone",
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
        description:
          "Update your billing details, manage subscriptions, and more",
        icon: CreditCardIcon,
        href: "/admin/billing",
        testId: "settings-item-billing",
      },
    ],
  },
]

function ExternalIcon() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0 text-[#626f86] dark:text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-label="Opens in new tab"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function SettingsRow({
  item,
  onClose,
}: {
  item: SettingsItem
  onClose: () => void
}) {
  return (
    <Link
      href={item.href}
      data-testid={item.testId}
      onClick={onClose}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#f4f5f7] focus:bg-[#f4f5f7] focus:outline-none dark:hover:bg-accent"
    >
      <HugeiconsIcon
        icon={item.icon}
        className="mt-0.5 size-5 shrink-0 text-[#44546f] dark:text-foreground"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug font-semibold text-[#172b4d] dark:text-foreground">
          {item.title}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-[#626f86] dark:text-muted-foreground">
          {item.description}
        </p>
      </div>
      {item.external && <ExternalIcon />}
    </Link>
  )
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Settings"
        data-testid="settings-menu-trigger"
        className="rounded-full p-1.5 text-[#626f86] transition-colors hover:bg-[#f4f5f7] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-muted-foreground dark:hover:bg-accent"
      >
        <HugeiconsIcon
          icon={Settings02Icon}
          className="size-5"
          aria-hidden="true"
        />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] overflow-hidden rounded-[3px] border border-[#dfe1e6] p-0 shadow-[0_8px_24px_rgba(9,30,66,0.15)]"
      >
        <div className="py-2">
          {categories.map((cat, i) => (
            <div key={cat.header ?? `cat-${i}`}>
              {cat.header && (
                <p className="px-4 pt-3 pb-1.5 text-[11px] font-bold text-[#626f86] dark:text-muted-foreground">
                  {cat.header}
                </p>
              )}
              {cat.items.map((item) => (
                <SettingsRow
                  key={item.testId}
                  item={item}
                  onClose={() => setOpen(false)}
                />
              ))}
              {i < categories.length - 1 && (
                <div className="my-1 border-t border-[#dfe1e6] dark:border-border" />
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
