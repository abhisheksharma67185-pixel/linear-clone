"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NOTIFICATION_TYPES = [
  { key: "watching", label: "I am watching the work item", default: true },
  { key: "reporter", label: "I am the reporter", default: true },
  { key: "assignee", label: "I am the assignee", default: true },
  { key: "mentions", label: "Someone mentions me", default: true },
  { key: "own_changes", label: "I made the change", default: false },
]

function Toggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: value ? "#0052CC" : "#DFE1E6",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.15s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: value ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.15s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  )
}

function SidebarLink({
  href,
  children,
  active,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "6px 12px",
        fontSize: 14,
        borderRadius: 3,
        marginBottom: 2,
        textDecoration: "none",
        color: active ? "#0052CC" : "#172B4D",
        background: active ? "#E9F2FF" : "none",
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.background = "#F4F5F7"
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "none"
      }}
    >
      {children}
    </Link>
  )
}

type Prefs = {
  watching: boolean
  reporter: boolean
  assignee: boolean
  mentions: boolean
  own_changes: boolean
}

const TABS = ["Spaces and work items", "Alert notifications"]

export default function NotificationSettingsPage() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(0)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [prefs, setPrefs] = useState<Prefs>({
    watching: true,
    reporter: true,
    assignee: true,
    mentions: true,
    own_changes: false,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/jira/notification-preferences")
      .then((r) => r.json())
      .then((data) => {
        setEmailEnabled(data.emailEnabled ?? true)
        setPrefs({
          watching: data.watching ?? true,
          reporter: data.reporter ?? true,
          assignee: data.assignee ?? true,
          mentions: data.mentions ?? true,
          own_changes: data.own_changes ?? false,
        })
      })
      .catch(() => {})
  }, [])

  async function handleSave() {
    await fetch("/api/jira/notification-preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailEnabled, ...prefs }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      style={{
        display: "flex",
        padding: "32px 40px",
        gap: 0,
        minHeight: "100vh",
        background: "white",
      }}
    >
      {/* Sidebar */}
      <nav style={{ width: 220, flexShrink: 0 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#6B778C",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            margin: "0 0 8px 0",
          }}
        >
          Personal settings
        </p>
        <SidebarLink
          href="/jira/settings/general"
          active={pathname === "/jira/settings/general"}
        >
          General settings
        </SidebarLink>
        <SidebarLink
          href="/jira/settings/notifications"
          active={pathname === "/jira/settings/notifications"}
        >
          Notification settings
        </SidebarLink>
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, maxWidth: 640 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: "#172B4D",
            marginBottom: 8,
            marginTop: 0,
          }}
        >
          Notification settings
        </h1>

        {/* Sub-nav tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #DFE1E6",
            marginBottom: 32,
          }}
        >
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                background: "none",
                border: "none",
                borderBottom:
                  i === activeTab
                    ? "2px solid #0052CC"
                    : "2px solid transparent",
                padding: "10px 0",
                marginRight: 24,
                fontSize: 14,
                fontWeight: i === activeTab ? 500 : 400,
                color: i === activeTab ? "#0052CC" : "#42526E",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div>
            {/* Master email toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
                paddingBottom: 24,
                borderBottom: "1px solid #F4F5F7",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#172B4D",
                    margin: "0 0 2px 0",
                  }}
                >
                  Send me emails for work item activity
                </p>
                <p style={{ fontSize: 13, color: "#6B778C", margin: 0 }}>
                  Receive email notifications when work items are updated.
                </p>
              </div>
              <Toggle value={emailEnabled} onChange={setEmailEnabled} />
            </div>

            {/* Checkboxes */}
            {emailEnabled && (
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#172B4D",
                    marginBottom: 12,
                  }}
                >
                  Send me an email when:
                </p>
                {NOTIFICATION_TYPES.map((type) => (
                  <label
                    key={type.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={prefs[type.key as keyof Prefs] ?? type.default}
                      onChange={(e) =>
                        setPrefs((p) => ({
                          ...p,
                          [type.key]: e.target.checked,
                        }))
                      }
                      style={{ width: 16, height: 16, accentColor: "#0052CC" }}
                    />
                    <span style={{ fontSize: 14, color: "#172B4D" }}>
                      {type.label}
                    </span>
                  </label>
                ))}

                <button
                  onClick={handleSave}
                  style={{
                    marginTop: 24,
                    background: "#0052CC",
                    color: "white",
                    border: "none",
                    borderRadius: 3,
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {saved ? "Saved!" : "Save changes"}
                </button>
              </div>
            )}

            {!emailEnabled && (
              <button
                onClick={handleSave}
                style={{
                  background: "#0052CC",
                  color: "white",
                  border: "none",
                  borderRadius: 3,
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {saved ? "Saved!" : "Save changes"}
              </button>
            )}
          </div>
        )}

        {activeTab === 1 && (
          <div>
            <p style={{ fontSize: 14, color: "#6B778C" }}>
              Alert notification preferences coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
