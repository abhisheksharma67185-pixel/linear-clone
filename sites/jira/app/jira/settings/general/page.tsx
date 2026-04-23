"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const selectStyle: React.CSSProperties = {
  height: 36,
  padding: "0 8px",
  border: "1px solid #DFE1E6",
  borderRadius: 3,
  fontSize: 14,
  color: "#172B4D",
  background: "white",
  minWidth: 200,
  outline: "none",
  cursor: "pointer",
}

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
        transition: "background 0.15s ease",
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
          transition: "left 0.15s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        marginBottom: 28,
        paddingBottom: 28,
        borderBottom: "1px solid #F4F5F7",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#172B4D",
              marginBottom: 4,
            }}
          >
            {label}
          </p>
          <p style={{ fontSize: 13, color: "#6B778C", lineHeight: 1.5 }}>
            {description}
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
      </div>
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
        color: active ? "#0052CC" : "#172B4D",
        fontWeight: active ? 500 : 400,
        background: active ? "#E9F2FF" : "none",
        borderRadius: 3,
        textDecoration: "none",
        marginBottom: 2,
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

export default function GeneralSettingsPage() {
  const pathname = usePathname()
  const [language, setLanguage] = useState("en_US")
  const [timezone, setTimezone] = useState("Asia/Kolkata")
  const [watchOwn, setWatchOwn] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/jira/preferences")
      .then((r) => r.json())
      .then((prefs) => {
        setLanguage(prefs.language ?? "en_US")
        setTimezone(prefs.timezone ?? "Asia/Kolkata")
        setWatchOwn(prefs.watchOwn ?? true)
      })
      .catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch("/api/jira/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, timezone, watchOwn }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const intlWithSupported = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[]
  }
  const timezones =
    typeof Intl !== "undefined" && intlWithSupported.supportedValuesOf
      ? intlWithSupported.supportedValuesOf("timeZone")
      : [
          "Asia/Kolkata",
          "America/New_York",
          "America/Los_Angeles",
          "Europe/London",
          "Europe/Paris",
          "Asia/Tokyo",
        ]

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
      {/* Left sidebar */}
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
      <div style={{ flex: 1, maxWidth: 600 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: "#172B4D",
            marginBottom: 32,
            marginTop: 0,
          }}
        >
          General settings
        </h1>

        <SettingRow
          label="Language"
          description="The language used throughout Jira."
        >
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={selectStyle}
          >
            <option value="en_US">English (US)</option>
            <option value="en_GB">English (UK)</option>
            <option value="de_DE">Deutsch</option>
            <option value="fr_FR">Français</option>
            <option value="ja_JP">日本語</option>
            <option value="zh_CN">中文（简体）</option>
          </select>
        </SettingRow>

        <SettingRow
          label="Your timezone"
          description="The timezone used for date and time information across Jira."
        >
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            style={selectStyle}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </SettingRow>

        <SettingRow
          label="Watch your work items"
          description="You'll be added as a watcher when you create or comment on a work item, and receive email updates."
        >
          <Toggle value={watchOwn} onChange={setWatchOwn} />
        </SettingRow>

        <div style={{ marginTop: 32 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "#0052CC",
              color: "white",
              border: "none",
              borderRadius: 3,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.8 : 1,
            }}
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
