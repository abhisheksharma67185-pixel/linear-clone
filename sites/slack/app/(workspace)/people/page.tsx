"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Building2,
  Check,
  ExternalLink,
  Filter,
  Hash,
  Lock,
  Mail,
  PencilLine,
  Search,
  Send,
  Settings,
  User as UserIcon,
  UserPlus,
  Users as UsersIcon,
  X,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/user-avatar"
import { InvitePeopleDialog } from "@/components/invite-people-dialog"
import { CreateChannelDialog } from "@/components/create-channel-dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type User = {
  id: string
  name: string
  displayName: string
  email: string
  avatar: string
  title: string
  timezone: string
  status: { emoji: string; text: string; expiresAt: string | null }
  presence: "active" | "away" | "offline" | "dnd"
  role: string
  isBot?: boolean
}

type Channel = {
  id: string
  name: string
  topic: string
  purpose: string
  type: "public" | "private"
  isArchived: boolean
  isShared: boolean
  memberIds: string[]
}

type Tab = "people" | "channels" | "groups" | "external" | "invitations"

const CURRENT_USER_ID = "usr-1"
const BANNER_KEYS: Record<Tab, string> = {
  people: "slack:dir-banner:people:v1",
  channels: "slack:dir-banner:channels:v1",
  groups: "slack:dir-banner:groups:v1",
  external: "slack:dir-banner:external:v1",
  invitations: "",
}

function DirectoriesPageInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const tab = ((sp.get("tab") as Tab) || "people") as Tab
  const setTab = (t: Tab) =>
    router.replace(`/people${t === "people" ? "" : `?tab=${t}`}`)

  const [users, setUsers] = useState<User[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [bannerOpen, setBannerOpen] = useState<Record<Tab, boolean>>({
    people: true,
    channels: true,
    groups: true,
    external: true,
    invitations: false,
  })
  const [inviteOpen, setInviteOpen] = useState(false)
  const [createChannelOpen, setCreateChannelOpen] = useState(false)

  const load = useCallback(async () => {
    const [u, c]: [User[], Channel[]] = await Promise.all([
      fetch("/api/data/users").then((r) => r.json()),
      fetch("/api/data/channels").then((r) => r.json()),
    ])
    setUsers(u)
    setChannels(c)
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (typeof window === "undefined") return
    const next = { ...bannerOpen }
    for (const k of Object.keys(BANNER_KEYS) as Tab[]) {
      const key = BANNER_KEYS[k]
      if (!key) continue
      next[k] = window.localStorage.getItem(key) !== "true"
    }
    setBannerOpen(next)
    // Run only once on mount; bannerOpen is derived state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const dismissBanner = (t: Tab) => {
    setBannerOpen((s) => ({ ...s, [t]: false }))
    const key = BANNER_KEYS[t]
    if (key) {
      try {
        window.localStorage.setItem(key, "true")
      } catch {}
    }
  }

  const TABS: { value: Tab; label: string; icon: typeof UserIcon }[] = [
    { value: "people", label: "People", icon: UserIcon },
    { value: "channels", label: "Channels", icon: Hash },
    { value: "groups", label: "User Groups", icon: UsersIcon },
    { value: "external", label: "External", icon: Building2 },
    { value: "invitations", label: "Invitations", icon: Mail },
  ]

  return (
    <>
      <div className="flex shrink-0 flex-col border-b border-border bg-background">
        <h1 className="px-6 pt-5 text-base font-bold text-foreground">
          Directories
        </h1>
        <nav role="tablist" className="flex items-center gap-6 px-6">
          {TABS.map((t) => {
            const active = tab === t.value
            const Icon = t.icon
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.value)}
                className={cn(
                  "relative flex items-center gap-1.5 py-3 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {t.label}
                {active ? (
                  <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t bg-foreground" />
                ) : null}
              </button>
            )
          })}
        </nav>
      </div>

      <ScrollArea className="min-h-0 flex-1 bg-background">
        {tab === "people" ? (
          <PeopleTab
            users={users}
            bannerOpen={bannerOpen.people}
            onDismissBanner={() => dismissBanner("people")}
            onInvite={() => setInviteOpen(true)}
          />
        ) : null}
        {tab === "channels" ? (
          <ChannelsTab
            channels={channels}
            currentUserId={CURRENT_USER_ID}
            bannerOpen={bannerOpen.channels}
            onDismissBanner={() => dismissBanner("channels")}
            onCreate={() => setCreateChannelOpen(true)}
          />
        ) : null}
        {tab === "groups" ? (
          <UserGroupsTab
            bannerOpen={bannerOpen.groups}
            onDismissBanner={() => dismissBanner("groups")}
          />
        ) : null}
        {tab === "external" ? (
          <ExternalTab
            bannerOpen={bannerOpen.external}
            onDismissBanner={() => dismissBanner("external")}
            workspaceName="ThetaLabHQ"
          />
        ) : null}
        {tab === "invitations" ? <InvitationsTab /> : null}
      </ScrollArea>

      <InvitePeopleDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      <CreateChannelDialog
        open={createChannelOpen}
        onOpenChange={setCreateChannelOpen}
        onCreated={() => load()}
      />
    </>
  )
}

export default function DirectoriesPage() {
  return (
    <Suspense fallback={null}>
      <DirectoriesPageInner />
    </Suspense>
  )
}

// ---------- People ----------

function PeopleTab({
  users,
  bannerOpen,
  onDismissBanner,
  onInvite,
}: {
  users: User[]
  bannerOpen: boolean
  onDismissBanner: () => void
  onInvite: () => void
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => !u.isBot)
      .filter(
        (u) =>
          !q ||
          `${u.name} ${u.displayName} ${u.email} ${u.title}`
            .toLowerCase()
            .includes(q)
      )
  }, [users, query])

  return (
    <div className="flex flex-col gap-4 px-6 pt-4 pb-8">
      <SearchRow
        placeholder="Search for people"
        value={query}
        onChange={setQuery}
        action={
          <Button onClick={onInvite}>
            <UserPlus className="size-3.5" />
            Invite People
          </Button>
        }
      />

      {bannerOpen ? (
        <PromoBanner
          onDismiss={onDismissBanner}
          title="Invite your team to Slack"
          body="Bring your team members into Slack to start working better together. Send invites via email, or get a handy link to share."
          cta={
            <Button variant="outline" onClick={onInvite}>
              Invite people
            </Button>
          }
        />
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterChip label="Title" />
          <FilterChip label="Location" />
          <button className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <Filter className="size-3.5" />
            Filters
          </button>
        </div>
        <FilterChip label="Most recommended" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((u) => (
          <PersonCard key={u.id} user={u} />
        ))}
      </div>
    </div>
  )
}

function PersonCard({ user }: { user: User }) {
  const isMe = user.id === CURRENT_USER_ID
  return (
    <Link
      href={`/people/${user.id}`}
      className="group relative flex flex-col gap-3 rounded-lg border border-border bg-background p-4 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        {user.avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.avatar}
            alt={user.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-purple-200 text-3xl font-bold text-purple-800">
            {user.name[0]?.toUpperCase()}
          </div>
        )}
        {isMe ? (
          <button
            type="button"
            className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-background px-2 py-1 text-xs font-semibold shadow-sm hover:bg-muted"
            onClick={(e) => {
              e.preventDefault()
              toast.info("Edit profile coming soon")
            }}
          >
            <PencilLine className="size-3" />
            Edit
          </button>
        ) : null}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold">{user.name}</span>
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              user.presence === "active"
                ? "bg-emerald-500"
                : "border border-muted-foreground"
            )}
            aria-hidden
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {isMe ? "That’s you!" : (user.title ?? user.displayName)}
        </div>
      </div>
    </Link>
  )
}

// ---------- Channels ----------

function ChannelsTab({
  channels,
  currentUserId,
  bannerOpen,
  onDismissBanner,
  onCreate,
}: {
  channels: Channel[]
  currentUserId: string
  bannerOpen: boolean
  onDismissBanner: () => void
  onCreate: () => void
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return channels
      .filter((c) => !c.isArchived)
      .filter((c) => !q || c.name.toLowerCase().includes(q))
  }, [channels, query])

  return (
    <div className="flex flex-col gap-4 px-6 pt-4 pb-8">
      <SearchRow
        placeholder="Search for channels"
        value={query}
        onChange={setQuery}
        action={<Button onClick={onCreate}>Create Channel</Button>}
      />

      {bannerOpen ? (
        <PromoBanner
          onDismiss={onDismissBanner}
          title="Organize your team’s conversations"
          body={
            <>
              Channels are spaces for gathering all the right people, messages,
              files and tools.
              <br />
              Organize them by any project, group, initiative or topic of your
              choosing.
            </>
          }
          cta={
            <Button variant="outline" onClick={onCreate}>
              Create a channel
            </Button>
          }
        />
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FilterChip label="All channels" />
          <FilterChip label="Any channel type" />
          <FilterChip label="Workspaces" />
          <FilterChip label="Organizations" />
          <button className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <Filter className="size-3.5" />
            Filters
          </button>
        </div>
        <FilterChip label="Most recommended" />
      </div>

      <ul className="overflow-hidden rounded-lg border border-border">
        {filtered.map((c) => {
          const Icon = c.type === "private" ? Lock : Hash
          const joined = c.memberIds.includes(currentUserId)
          return (
            <li key={c.id} className="border-b border-border last:border-b-0">
              <Link
                href={`/c/${c.name}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-4" />
                    <span className="truncate text-sm font-bold">{c.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {joined ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Check className="size-3" />
                        Joined
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        Not joined
                      </span>
                    )}
                    <span aria-hidden>·</span>
                    <span>
                      {c.memberIds.length} member
                      {c.memberIds.length === 1 ? "" : "s"}
                    </span>
                    {c.topic ? (
                      <>
                        <span aria-hidden>·</span>
                        <span className="truncate">{c.topic}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ---------- User Groups ----------

function UserGroupsTab({
  bannerOpen,
  onDismissBanner,
}: {
  bannerOpen: boolean
  onDismissBanner: () => void
}) {
  return (
    <div className="flex flex-col gap-4 px-6 pt-4 pb-8">
      <SearchRow
        placeholder="Search by team name, project or department"
        value=""
        onChange={() => {}}
        action={
          <Button onClick={() => toast.info("Create user group coming soon")}>
            Create user group
          </Button>
        }
      />

      {bannerOpen ? (
        <PromoBanner
          onDismiss={onDismissBanner}
          title="Assemble your dream team"
          body="Easily @mention departments or teams all at once by bundling them into user groups."
          cta={
            <Button
              variant="outline"
              onClick={() => toast.info("Create user group coming soon")}
            >
              Create a user group
            </Button>
          }
        />
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FilterChip label="Workspaces" />
          <FilterChip label="Exclude deactivated" />
        </div>
        <FilterChip label="A to Z" />
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <h2 className="text-base font-bold text-foreground">No results</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          No user groups have been created yet
        </p>
      </div>
    </div>
  )
}

// ---------- External ----------

function ExternalTab({
  bannerOpen,
  onDismissBanner,
  workspaceName,
}: {
  bannerOpen: boolean
  onDismissBanner: () => void
  workspaceName: string
}) {
  return (
    <div className="flex flex-col gap-4 px-6 pt-4 pb-8">
      <SearchRow
        placeholder="Search for people by their name, company, or email address"
        value=""
        onChange={() => {}}
        rightSlot={
          <Button
            size="icon"
            variant="ghost"
            aria-label="External directory settings"
            onClick={() => toast.info("Slack Connect settings")}
          >
            <Settings className="size-4 text-muted-foreground" />
          </Button>
        }
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => toast.info("Slack Connect channel — Pro plan")}
            >
              Create Channel
              <span className="ml-1 rounded bg-purple-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                Pro
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info("Start an external DM")}
            >
              Start a DM
            </Button>
          </div>
        }
      />

      {bannerOpen ? (
        <div className="relative overflow-hidden rounded-md bg-amber-50 px-6 py-6">
          <button
            type="button"
            onClick={onDismissBanner}
            aria-label="Dismiss"
            className="absolute top-3 right-3 rounded p-1 text-muted-foreground hover:bg-amber-100"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-start gap-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-foreground">
                Work with people outside {workspaceName} in Slack
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Move your conversations out of siloed email threads and
                collaborate with external people, clients, vendors, and partners
                in Slack.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-background px-4 py-3 shadow-sm">
                  <div className="text-sm font-bold">
                    Create a channel with external people
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Work with multiple people and organizations outside of{" "}
                    {workspaceName}
                  </p>
                  <Button
                    className="mt-3 bg-emerald-700 text-white hover:bg-emerald-800"
                    onClick={() =>
                      toast.info("Slack Connect channel — Pro plan")
                    }
                  >
                    Create Channel
                  </Button>
                </div>
                <div className="rounded-md bg-background px-4 py-3 shadow-sm">
                  <div className="text-sm font-bold">Talk one-on-one</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Talk one-on-one with anyone outside of {workspaceName}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => toast.info("Start an external DM")}
                  >
                    Start a DM
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section>
        <div className="mb-2 text-sm font-bold">
          Set {workspaceName} up for safe, secure collaboration
        </div>
        <ul className="overflow-hidden rounded-lg border border-border">
          {[
            {
              icon: Settings,
              title: "Customize settings",
              body: "Set permissions and view options for added security",
            },
            {
              icon: Send,
              title: "Manage requests",
              body: "Review and approve connection requests from your team",
            },
            {
              icon: UsersIcon,
              title: "Manage connections",
              body: "Streamline approvals with trusted partners",
            },
          ].map((row) => {
            const Icon = row.icon
            return (
              <li
                key={row.title}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/40"
              >
                <Icon className="size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">{row.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.body}
                  </div>
                </div>
                <ExternalLink className="size-4 text-muted-foreground" />
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex flex-col items-center justify-center py-8 text-center">
        <h3 className="text-sm font-bold">
          How to create channels with external people
        </h3>
        <ol className="mt-3 flex w-full max-w-xl items-center justify-between text-xs text-muted-foreground">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex flex-1 items-center">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                {n}
              </span>
              {n !== 3 ? (
                <span
                  aria-hidden
                  className="mx-2 flex-1 border-t border-dashed border-muted-foreground/40"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

// ---------- Invitations ----------

function InvitationsTab() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-md bg-sky-200">
        <Mail className="size-10 text-sky-700" strokeWidth={1.5} />
      </div>
      <h2 className="mt-4 text-base font-bold text-foreground">
        Track your invitations
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        You&rsquo;ll see the status of invitations you&rsquo;ve sent and
        received here.
      </p>
      <Button variant="outline" className="mt-3">
        Learn more
      </Button>
      <button className="mt-2 text-sm text-blue-600 hover:underline">
        Enable Slack Connect to work with other companies
      </button>

      <hr className="my-6 w-48" />

      <ol className="mx-auto flex max-w-md list-decimal flex-col gap-2 text-left text-sm text-muted-foreground">
        <li>Invite someone to join a channel via email or link.</li>
        <li>Depending on your company, admins may need to sign off.</li>
        <li>They&rsquo;re in! And they can add their coworkers, too.</li>
      </ol>
    </div>
  )
}

// ---------- Shared subcomponents ----------

function SearchRow({
  placeholder,
  value,
  onChange,
  action,
  rightSlot,
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  action?: React.ReactNode
  rightSlot?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 rounded-md border-blue-500 pl-9 text-sm shadow-sm focus-visible:ring-0"
        />
      </div>
      {rightSlot}
      {action}
    </div>
  )
}

function PromoBanner({
  title,
  body,
  cta,
  onDismiss,
}: {
  title: React.ReactNode
  body: React.ReactNode
  cta: React.ReactNode
  onDismiss: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-md bg-sky-50 px-6 py-6">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 rounded p-1 text-muted-foreground hover:bg-sky-100"
      >
        <X className="size-4" />
      </button>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{body}</p>
      <div className="mt-4">{cta}</div>
    </div>
  )
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-sm hover:bg-muted">
      {label}
      <span aria-hidden className="text-muted-foreground">
        ▾
      </span>
    </button>
  )
}
