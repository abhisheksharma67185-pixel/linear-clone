"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const apps = [
  { name: "Goals", icon: "goal", url: "abhisheksharma67185.a..." },
  { name: "Jira", icon: "jira", url: "abhisheksharma67185.a..." },
  { name: "Projects", icon: "projects", url: "abhisheksharma67185.a..." },
  {
    name: "Jira Administration",
    icon: "jira-admin",
    url: "abhisheksharma67185.a...",
  },
]

function AppIconSmall({ icon }: { icon: string }) {
  if (icon === "jira" || icon === "jira-admin") {
    return (
      <div className="flex size-8 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-blue-700">
        <svg className="size-4" viewBox="0 0 32 32" fill="white">
          <path d="M27.545 15.2L16.8 4.454 16 3.654l-8.345 8.346-.855.854L4.454 15.2a1.547 1.547 0 000 2.189L12.2 25.135 16 28.935l8.345-8.346.354-.354 2.846-2.846a1.547 1.547 0 000-2.189zM16 20.6l-4.254-4.254L16 12.092l4.254 4.254L16 20.6z" />
        </svg>
      </div>
    )
  }
  if (icon === "goal") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm">
        &#9678;
      </div>
    )
  }
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm">
      &#10022;
    </div>
  )
}

type DomainEntry = {
  domain: string
  appRoles: Record<string, string>
  notifyAdmins: string
}

const permissionOptions = [
  {
    value: "invite-anyone",
    label: "Invite anyone",
    desc: "Can invite anyone, from any domain (no org admin approval). Can request access for anyone from any domain (requires org admin approval).",
  },
  {
    value: "invite-approved",
    label: "Invite approved domains",
    desc: "Can invite people with approved domains only (no org admin approval). Can request access for anyone from any domain (requires org admin approval).",
  },
  {
    value: "require-approval",
    label: "Require admin approval",
    desc: "Unable to invite anyone. Can request access for anyone from any domain (requires org admin approval).",
  },
  {
    value: "dont-allow",
    label: "Don't allow invites",
    desc: "Unable to invite or request access for anyone, regardless of domain.",
  },
]

export default function AppAccessSettingsPage() {
  const [activeTab, setActiveTab] = useState("approved")
  const tabs = [
    { id: "approved", label: "Approved domains" },
    { id: "invites", label: "User invites" },
    { id: "links", label: "Invitation links" },
  ]

  // Domain state
  const [domains, setDomains] = useState<DomainEntry[]>([
    {
      domain: "Any domain",
      appRoles: { Goals: "None", Jira: "None", Projects: "None" },
      notifyAdmins: "only-approval",
    },
  ])

  // Add domain dialog
  const [addDomainOpen, setAddDomainOpen] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [newDomainRoles, setNewDomainRoles] = useState<Record<string, string>>({
    Goals: "None",
    Jira: "None",
    Projects: "None",
  })
  const [newNotifyAdmins, setNewNotifyAdmins] = useState("only-approval")

  // Edit domain dialog
  const [editDomainOpen, setEditDomainOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editDomain, setEditDomain] = useState("")
  const [editDomainRoles, setEditDomainRoles] = useState<
    Record<string, string>
  >({})
  const [editNotifyAdmins, setEditNotifyAdmins] = useState("only-approval")

  // User invites state
  const [invitePermissions, setInvitePermissions] = useState<
    Record<string, string>
  >({
    Goals: "require-approval",
    Jira: "require-approval",
    Projects: "require-approval",
    "Jira Administration": "require-approval",
  })
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Invitation links state
  const [linkToggles, setLinkToggles] = useState<Record<string, boolean>>({
    Goals: false,
    Jira: false,
    Projects: false,
  })

  function handleAddDomain() {
    setDomains([
      ...domains,
      {
        domain: newDomain,
        appRoles: { ...newDomainRoles },
        notifyAdmins: newNotifyAdmins,
      },
    ])
    setAddDomainOpen(false)
    setNewDomain("")
    setNewDomainRoles({ Goals: "None", Jira: "None", Projects: "None" })
    setNewNotifyAdmins("only-approval")
  }

  function handleEditDomain() {
    if (editIndex === null) return
    const updated = [...domains]
    updated[editIndex] = {
      domain: editDomain,
      appRoles: { ...editDomainRoles },
      notifyAdmins: editNotifyAdmins,
    }
    setDomains(updated)
    setEditDomainOpen(false)
    setEditIndex(null)
  }

  function openEdit(index: number) {
    const d = domains[index]
    setEditIndex(index)
    setEditDomain(d.domain)
    setEditDomainRoles({ ...d.appRoles })
    setEditNotifyAdmins(d.notifyAdmins)
    setEditDomainOpen(true)
  }

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-semibold">App access settings</h1>
      <p className="mb-1 max-w-3xl text-sm text-muted-foreground">
        These settings control how users get access to your apps. If you wish to
        transfer your apps to another organization, you can{" "}
        <button className="text-blue-600 hover:underline">
          reset your app access settings
        </button>
        . If you exceed the user limit on any app&apos;s Free plan, we&apos;ll
        upgrade that app to a trial of the Standard plan with unlocked user
        limits. Trials can be cancelled at any time.{" "}
        <button className="text-blue-600 hover:underline">
          How to configure app access settings
        </button>
      </p>

      {/* Tabs */}
      <div className="mt-6 mb-4 flex gap-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Approved domains tab */}
      {activeTab === "approved" && (
        <>
          <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
            Allow users with approved email domains to request access to your
            apps. These requests can be reviewed from the Access requests page.
            You can skip the review process if you trust a specific domain (e.g.
            your company&apos;s domain).
          </p>

          <Button
            className="mb-6 bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setAddDomainOpen(true)}
          >
            Add domain
          </Button>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Domain</TableHead>
                  <TableHead className="w-[120px] font-medium">
                    Applies to
                  </TableHead>
                  <TableHead className="w-[80px] font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button className="text-sm text-blue-600 hover:underline">
                          {d.domain}
                        </button>
                        {d.domain === "Any domain" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <svg
                                  className="size-3.5 text-muted-foreground"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="12" y1="8" x2="12" y2="12" />
                                  <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Users from non-public and public domains
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {Object.values(d.appRoles).filter((r) => r !== "None")
                        .length || Object.keys(d.appRoles).length}{" "}
                      apps
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(i)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* User invites tab */}
      {activeTab === "invites" && (
        <>
          <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
            Control whether an admin needs to approve invited users.
          </p>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">App</TableHead>
                  <TableHead className="w-[300px] font-medium">
                    Existing user permissions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AppIconSmall icon={app.icon} />
                        <div>
                          <p className="text-sm font-medium">{app.name}</p>
                          <p className="text-xs text-muted-foreground">
                            abhisheksharma67185.atlassian.net
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === app.name ? null : app.name
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm ${openDropdown === app.name ? "border-blue-600 ring-1 ring-blue-600" : ""}`}
                        >
                          <span>
                            {permissionOptions.find(
                              (o) => o.value === invitePermissions[app.name]
                            )?.label || "Require admin approval"}
                          </span>
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {openDropdown === app.name && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute top-full right-0 z-50 mt-1 w-80 rounded-lg border bg-background shadow-lg">
                              {permissionOptions.map((opt) => (
                                <button
                                  key={opt.value}
                                  className={`w-full border-b px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg last:border-b-0 hover:bg-accent/50 ${invitePermissions[app.name] === opt.value ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}
                                  onClick={() => {
                                    setInvitePermissions({
                                      ...invitePermissions,
                                      [app.name]: opt.value,
                                    })
                                    setOpenDropdown(null)
                                  }}
                                >
                                  <p
                                    className={`text-sm font-medium ${invitePermissions[app.name] === opt.value ? "text-blue-600" : ""}`}
                                  >
                                    {opt.label}
                                  </p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {opt.desc}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Invitation links tab */}
      {activeTab === "links" && (
        <>
          <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
            Invitation links are sharable URLs that give anyone access to your
            apps, without admin approval. A new user will only have access to
            the app associated to a specific invite link.
          </p>

          <div className="space-y-0">
            {apps
              .filter((a) => a.name !== "Jira Administration")
              .map((app) => (
                <div
                  key={app.name}
                  className="flex items-center gap-4 border-b py-4 last:border-b-0"
                >
                  <Switch
                    checked={linkToggles[app.name] || false}
                    onCheckedChange={(checked: boolean) =>
                      setLinkToggles({ ...linkToggles, [app.name]: checked })
                    }
                  />
                  <AppIconSmall icon={app.icon} />
                  <div>
                    <p className="text-sm font-medium">{app.name}</p>
                    <p className="text-xs text-muted-foreground">
                      abhisheksharma67185.atlassian.net
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* Add domain dialog */}
      <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add a new domain
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5">Domain</Label>
              <Input
                placeholder="yourcompany.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
            </div>

            {/* App roles table */}
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      App
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Role
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Admin approval
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      More info
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {["Goals", "Jira", "Projects"].map((appName) => (
                    <tr key={appName} className="border-b last:border-b-0">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <AppIconSmall
                            icon={
                              appName === "Goals"
                                ? "goal"
                                : appName === "Jira"
                                  ? "jira"
                                  : "projects"
                            }
                          />
                          <div>
                            <p className="text-sm font-medium">{appName}</p>
                            <p className="text-xs text-muted-foreground">
                              abhisheksharma67185.a...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                          value={newDomainRoles[appName]}
                          onChange={(e) =>
                            setNewDomainRoles({
                              ...newDomainRoles,
                              [appName]: e.target.value,
                            })
                          }
                        >
                          <option>None</option>
                          <option>User</option>
                          <option>App admin</option>
                          <option>User access admin</option>
                        </select>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                        -
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notify org admins */}
            <div>
              <p className="mb-2 text-sm font-medium">Notify org admins</p>
              <RadioGroup
                value={newNotifyAdmins}
                onValueChange={setNewNotifyAdmins}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="when-access" />
                  <Label className="font-normal">When users get access</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="only-approval" />
                  <Label className="font-normal">
                    Only when users need admin approval
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setAddDomainOpen(false)
                setNewDomain("")
                setNewDomainRoles({
                  Goals: "None",
                  Jira: "None",
                  Projects: "None",
                })
                setNewNotifyAdmins("only-approval")
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleAddDomain}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit domain dialog */}
      <Dialog open={editDomainOpen} onOpenChange={setEditDomainOpen}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit domain
            </DialogTitle>
            <DialogDescription>
              Edit access settings for {editDomain}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-1.5">Domain</Label>
              <Input
                value={editDomain}
                onChange={(e) => setEditDomain(e.target.value)}
                disabled={editDomain === "Any domain"}
              />
            </div>

            {/* App roles table */}
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      App
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Role
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      Admin approval
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium">
                      More info
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {["Goals", "Jira", "Projects"].map((appName) => (
                    <tr key={appName} className="border-b last:border-b-0">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <AppIconSmall
                            icon={
                              appName === "Goals"
                                ? "goal"
                                : appName === "Jira"
                                  ? "jira"
                                  : "projects"
                            }
                          />
                          <div>
                            <p className="text-sm font-medium">{appName}</p>
                            <p className="text-xs text-muted-foreground">
                              abhisheksharma67185.a...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                          value={editDomainRoles[appName] || "None"}
                          onChange={(e) =>
                            setEditDomainRoles({
                              ...editDomainRoles,
                              [appName]: e.target.value,
                            })
                          }
                        >
                          <option>None</option>
                          <option>User</option>
                          <option>App admin</option>
                          <option>User access admin</option>
                        </select>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                        -
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notify org admins */}
            <div>
              <p className="mb-2 text-sm font-medium">Notify org admins</p>
              <RadioGroup
                value={editNotifyAdmins}
                onValueChange={setEditNotifyAdmins}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="when-access" />
                  <Label className="font-normal">When users get access</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="only-approval" />
                  <Label className="font-normal">
                    Only when users need admin approval
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDomainOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleEditDomain}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
