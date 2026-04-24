"use client"

import Link from "next/link"
import { use, useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

type MemberSummary = {
  id: string
  name: string
  email: string
  avatar: string
  username: string
  role: "admin" | "member" | "guest"
  status: "active" | "invited" | "suspended" | "application"
  joinedAt: string
  lastSeenAt: string | null
  teamCount: number
  isApplication: boolean
  isInvite: boolean
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)
  const [member, setMember] = useState<MemberSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/members")
      .then((r) => r.json())
      .then((list: MemberSummary[]) => {
        if (cancelled) return
        setMember(
          list.find((m) => m.username.toLowerCase() === username.toLowerCase()) ??
            null
        )
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [username])

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <Link
        href="/settings?section=members"
        scroll={false}
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Back to members
      </Link>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading profile…</div>
      ) : !member ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            No profile found for <span className="font-mono">@{username}</span>.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted flex size-16 items-center justify-center overflow-hidden rounded-full text-lg font-semibold">
              {member.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatar}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                member.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{member.name}</h1>
              <p className="text-muted-foreground text-sm font-mono">
                @{member.username}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-5">
            <dl className="text-muted-foreground grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 text-sm">
              <dt>Email</dt>
              <dd className="text-foreground">{member.email}</dd>
              <dt>Role</dt>
              <dd className="text-foreground capitalize">{member.role}</dd>
              <dt>Status</dt>
              <dd className="text-foreground capitalize">{member.status}</dd>
              <dt>Teams</dt>
              <dd className="text-foreground">{member.teamCount}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
