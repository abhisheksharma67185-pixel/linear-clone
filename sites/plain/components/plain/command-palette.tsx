"use client"

import * as React from "react"
import {
  IconCheck,
  IconClock,
  IconFlag,
  IconInbox,
  IconUser,
  IconUsers,
} from "@tabler/icons-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

import type { Customer, Thread } from "@/app/lib/mock-data"

import { Kbd } from "./kbd"

export function CommandPalette({
  open,
  onOpenChange,
  threads,
  customersById,
  onPickThread,
  onSwitchView,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  threads: Thread[]
  customersById: Map<string, Customer>
  onPickThread: (id: string) => void
  onSwitchView: (v: "inbox" | "snoozed" | "done") => void
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command menu"
      description="Quickly navigate or search the workspace"
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => onSwitchView("inbox")}>
            <IconInbox className="size-4" />
            Go to Inbox
            <Kbd>G I</Kbd>
          </CommandItem>
          <CommandItem onSelect={() => onSwitchView("snoozed")}>
            <IconClock className="size-4" />
            Go to Snoozed
            <Kbd>G S</Kbd>
          </CommandItem>
          <CommandItem onSelect={() => onSwitchView("done")}>
            <IconCheck className="size-4" />
            Go to Done
            <Kbd>G D</Kbd>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Threads">
          {threads.slice(0, 10).map((t) => {
            const c = customersById.get(t.customerId)
            return (
              <CommandItem
                key={t.id}
                value={`${t.title} ${c?.fullName ?? ""}`}
                onSelect={() => onPickThread(t.id)}
              >
                <IconFlag className="size-4 text-muted-foreground" />
                <span className="line-clamp-1 flex-1">{t.title}</span>
                <span className="ml-2 text-[11px] text-muted-foreground">
                  {c?.fullName}
                </span>
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Customers">
          {[...customersById.values()].slice(0, 6).map((c) => (
            <CommandItem
              key={c.id}
              value={`${c.fullName} ${c.email}`}
              onSelect={() => onOpenChange(false)}
            >
              <IconUser className="size-4 text-muted-foreground" />
              <span className="flex-1">{c.fullName}</span>
              <span className="text-[11px] text-muted-foreground">
                {c.email}
              </span>
            </CommandItem>
          ))}
          <CommandItem onSelect={() => onOpenChange(false)}>
            <IconUsers className="size-4 text-muted-foreground" />
            View all customers…
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
