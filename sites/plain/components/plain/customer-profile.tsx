"use client"

import { IconMail, IconExternalLink } from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { Customer, Tenant, Thread } from "@/app/lib/mock-data"
import { StatusPill } from "./status-pill"

const PLAN_BADGE: Record<string, string> = {
  enterprise: "bg-foreground/10 text-foreground",
  growth: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  starter: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  free: "bg-muted text-muted-foreground",
}

export function CustomerProfile({
  customer,
  tenant,
  recentThreads,
  className,
}: {
  customer: Customer
  tenant: Tenant | undefined
  recentThreads: Thread[]
  className?: string
}) {
  return (
    <aside
      className={cn(
        "flex w-[300px] shrink-0 flex-col border-l border-border/60 bg-card/30",
        className
      )}
    >
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4">
          {/* Customer card */}
          <Card className="border-border/60 bg-background/40 shadow-none">
            <CardHeader className="gap-2">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-foreground/10 text-sm font-medium text-foreground">
                    {customer.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <CardTitle className="truncate text-sm">
                    {customer.fullName}
                  </CardTitle>
                  <CardDescription className="truncate text-xs">
                    {customer.role}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 pt-0 text-xs">
              <a
                href={`mailto:${customer.email}`}
                className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground"
              >
                <IconMail className="size-3.5 text-muted-foreground" />
                <span className="truncate">{customer.email}</span>
              </a>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1">
                <ProfileField
                  label="Plan"
                  value={
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-5 rounded-md font-normal capitalize",
                        PLAN_BADGE[customer.plan]
                      )}
                    >
                      {customer.plan}
                    </Badge>
                  }
                />
                <ProfileField
                  label="Lifecycle"
                  value={
                    <span className="text-foreground capitalize">
                      {customer.lifecycleStage.replace("_", " ")}
                    </span>
                  }
                />
                <ProfileField
                  label="External ID"
                  value={customer.externalId}
                  mono
                />
                <ProfileField
                  label="Created"
                  value={new Date(customer.createdAt).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      year: "numeric",
                    }
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tenant */}
          {tenant && (
            <Card className="border-border/60 bg-background/40 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Tenant
                  <IconExternalLink className="size-3" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {tenant.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 rounded-md font-normal capitalize",
                      PLAN_BADGE[tenant.plan]
                    )}
                  >
                    {tenant.plan}
                  </Badge>
                </div>
                <div className="text-muted-foreground">{tenant.domain}</div>
                <Separator className="my-1" />
                <ProfileField
                  label="MRR"
                  value={
                    <span className="font-mono text-foreground tabular-nums">
                      ${tenant.mrr.toLocaleString()}
                    </span>
                  }
                  inline
                />
              </CardContent>
            </Card>
          )}

          {/* Custom attributes */}
          {Object.keys(customer.customAttributes).length > 0 && (
            <Card className="border-border/60 bg-background/40 shadow-none">
              <CardHeader>
                <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Custom attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 pt-0 text-xs">
                {Object.entries(customer.customAttributes).map(([k, v]) => (
                  <ProfileField key={k} label={k} value={String(v)} inline />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent threads */}
          <Card className="border-border/60 bg-background/40 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Recent threads
                <span className="font-mono text-[11px] text-muted-foreground/80">
                  {recentThreads.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 pt-0">
              {recentThreads.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No other threads.
                </div>
              ) : (
                recentThreads.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1 text-xs hover:bg-muted/40"
                  >
                    <span className="line-clamp-1 text-foreground/85">
                      {t.title}
                    </span>
                    <StatusPill
                      status={t.status}
                      className="h-4 px-1.5 text-[10px]"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </aside>
  )
}

function ProfileField({
  label,
  value,
  inline,
  mono,
}: {
  label: string
  value: React.ReactNode
  inline?: boolean
  mono?: boolean
}) {
  return (
    <div
      className={cn(
        "flex gap-1",
        inline ? "flex-row items-center justify-between" : "flex-col"
      )}
    >
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={cn(
          "text-foreground/85",
          mono && "font-mono text-[11px] tabular-nums"
        )}
      >
        {value}
      </span>
    </div>
  )
}
