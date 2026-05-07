"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SimplePageHeader } from "@/components/simple-page-header"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Headphones, Phone } from "lucide-react"
import { toast } from "sonner"

type User = {
  id: string
  cessId: string
  name: string
  displayName: string
  email: string
  avatar: string
  title: string
  timezone: string
  status: { emoji: string; text: string; expiresAt: string | null }
  presence: "active" | "away" | "offline" | "dnd"
  role: string
}

const CURRENT_USER_ID = "usr-1"

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch(`/api/data/users/${params.userId}`)
      .then((r) => r.json())
      .then(setUser)
  }, [params.userId])

  const openDm = async () => {
    const res = await fetch("/api/data/dms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantIds: [CURRENT_USER_ID, params.userId],
      }),
    })
    if (res.ok) {
      const dm = await res.json()
      router.push(`/dm/${dm.id}`)
    }
  }

  // Both Huddle and Call use the same backend mutation — they differ only
  // in real Slack's voice/video defaults, which the mock doesn't model.
  const startHuddle = async () => {
    const dmRes = await fetch("/api/data/dms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantIds: [CURRENT_USER_ID, params.userId],
      }),
    })
    if (!dmRes.ok) {
      toast.error("Could not open conversation")
      return
    }
    const dm = await dmRes.json()
    const huddleRes = await fetch("/api/data/huddles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dmId: dm.id }),
    })
    if (huddleRes.ok) {
      toast.success(`Huddle started with ${user?.name ?? "user"}`)
      router.push(`/dm/${dm.id}`)
    } else {
      const err = await huddleRes.json().catch(() => ({}))
      toast.error(err.error ?? "Failed to start huddle")
    }
  }

  if (!user)
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )

  return (
    <>
      <SimplePageHeader title={user.name} subtitle={user.title} />
      <div className="flex flex-col items-start gap-6 p-8">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={user.name}
            src={user.avatar}
            presence={user.presence}
            size="lg"
            showPresence
          />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {user.displayName} · {user.role}
            </p>
            {user.status.text ? (
              <p className="mt-1 text-sm text-foreground">
                {user.status.emoji} {user.status.text}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={openDm}>
            <MessageCircle className="size-4" />
            Message
          </Button>
          <Button variant="outline" onClick={startHuddle}>
            <Headphones className="size-4" />
            Huddle
          </Button>
          <Button variant="outline" onClick={startHuddle}>
            <Phone className="size-4" />
            Call
          </Button>
        </div>
        <div className="grid max-w-2xl grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Email
            </div>
            <div className="text-foreground">{user.email}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Timezone
            </div>
            <div className="text-foreground">{user.timezone}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              CESS ID
            </div>
            <div className="text-foreground">{user.cessId}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              Presence
            </div>
            <div className="text-foreground capitalize">{user.presence}</div>
          </div>
        </div>
      </div>
    </>
  )
}
