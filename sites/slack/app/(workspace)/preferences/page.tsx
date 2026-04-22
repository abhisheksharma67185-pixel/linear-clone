"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { SimplePageHeader } from "@/components/simple-page-header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Preferences = {
  theme: string
  notifications: {
    desktop: "all" | "mentions" | "nothing"
    mobile: "all" | "mentions" | "nothing"
    dnd: { enabled: boolean; start: string; end: string }
    sound: string
  }
  sidebar: {
    showUnreadOnly: boolean
    showProfilePhotos: boolean
    listMode: "compact" | "clean"
  }
  language: string
  timezone: string
  keyboardShortcuts: boolean
  markAsReadOnEnter: boolean
}

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme()
  const [prefs, setPrefs] = useState<Preferences | null>(null)

  useEffect(() => {
    fetch("/api/data/preferences")
      .then((r) => r.json())
      .then(setPrefs)
  }, [])

  const update = async (key: string, value: unknown) => {
    const res = await fetch("/api/data/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    })
    if (res.ok) setPrefs(await res.json())
  }

  if (!prefs) return null

  return (
    <>
      <SimplePageHeader title="Preferences" />
      <Tabs
        defaultValue="notifications"
        className="flex min-h-0 flex-1 flex-row"
        orientation="vertical"
      >
        <TabsList className="h-full w-52 shrink-0 flex-col items-start border-r bg-transparent px-2 py-3">
          <TabsTrigger value="notifications" className="w-full justify-start">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="sidebar" className="w-full justify-start">
            Sidebar
          </TabsTrigger>
          <TabsTrigger value="themes" className="w-full justify-start">
            Themes
          </TabsTrigger>
          <TabsTrigger value="messages" className="w-full justify-start">
            Messages & media
          </TabsTrigger>
          <TabsTrigger value="language" className="w-full justify-start">
            Language & region
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="w-full justify-start">
            Accessibility
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <TabsContent value="notifications" className="p-6">
            <h2 className="mb-4 text-lg font-bold">Notifications</h2>
            <div className="flex max-w-xl flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label>Desktop notifications</Label>
                <Select
                  value={prefs.notifications.desktop}
                  onValueChange={(v) =>
                    update("notifications", {
                      ...prefs.notifications,
                      desktop: v,
                    })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All new messages</SelectItem>
                    <SelectItem value="mentions">
                      Direct messages, mentions & keywords
                    </SelectItem>
                    <SelectItem value="nothing">Nothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Do not disturb</Label>
                <Switch
                  checked={prefs.notifications.dnd.enabled}
                  onCheckedChange={(v) =>
                    update("notifications", {
                      ...prefs.notifications,
                      dnd: { ...prefs.notifications.dnd, enabled: v },
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="sidebar" className="p-6">
            <h2 className="mb-4 text-lg font-bold">Sidebar</h2>
            <div className="flex max-w-xl flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label>Show profile photos next to DMs</Label>
                <Switch
                  checked={prefs.sidebar.showProfilePhotos}
                  onCheckedChange={(v) =>
                    update("sidebar", {
                      ...prefs.sidebar,
                      showProfilePhotos: v,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show unread channels only</Label>
                <Switch
                  checked={prefs.sidebar.showUnreadOnly}
                  onCheckedChange={(v) =>
                    update("sidebar", { ...prefs.sidebar, showUnreadOnly: v })
                  }
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="themes" className="p-6">
            <h2 className="mb-4 text-lg font-bold">Themes</h2>
            <div className="flex max-w-xl flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label>Color mode</Label>
                <Select
                  value={theme ?? "system"}
                  onValueChange={(v) => v && setTheme(v)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">Sync with OS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="messages" className="p-6">
            <h2 className="mb-4 text-lg font-bold">Messages & media</h2>
            <div className="flex max-w-xl flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label>Mark as read on Enter</Label>
                <Switch
                  checked={prefs.markAsReadOnEnter}
                  onCheckedChange={(v) => update("markAsReadOnEnter", v)}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="language" className="p-6">
            <h2 className="mb-4 text-lg font-bold">Language & region</h2>
            <div className="grid max-w-xl grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Language</Label>
                <div>{prefs.language}</div>
              </div>
              <div>
                <Label>Timezone</Label>
                <div>{prefs.timezone}</div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="accessibility" className="p-6">
            <h2 className="mb-4 text-lg font-bold">Accessibility</h2>
            <div className="flex max-w-xl flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label>Keyboard shortcuts</Label>
                <Switch
                  checked={prefs.keyboardShortcuts}
                  onCheckedChange={(v) => update("keyboardShortcuts", v)}
                />
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </>
  )
}
