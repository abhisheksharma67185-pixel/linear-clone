"use client"

import { useState, useEffect } from "react"

const CATEGORIES = [
  "Software development",
  "Service management",
  "Work management",
  "Product management",
  "Marketing",
  "Human resources",
  "Finance",
  "Design",
  "Personal",
  "Operations",
  "Legal",
  "Sales",
  "Analytics",
  "Facilities",
  "Nonprofit",
]

const PRODUCT_COLORS: Record<string, { bg: string; diamond: string }> = {
  Jira: { bg: "#E9F2FF", diamond: "#0052CC" },
  "Jira Service Management": { bg: "#EAE6FF", diamond: "#6554C0" },
  "Customer Service Management": { bg: "#FFF0B3", diamond: "#FF8B00" },
  "Jira Product Discovery": { bg: "#E3FCEF", diamond: "#00875A" },
}

const TEMPLATE_ICON_BG: Record<string, string> = {
  Scrum: "#00B8D9",
  Kanban: "#36B37E",
  "Product discovery": "#6554C0",
  "IT service management": "#FF5630",
  "Project management": "#0052CC",
  "Cross-team planning": "#FF8B00",
}

const TEMPLATES: Record<
  string,
  {
    name: string
    badge: string | null
    desc: string
    product: string
    category: string
  }[]
> = {
  "Made for you": [
    {
      name: "Scrum",
      badge: "Last created",
      desc: "Plan, track, and execute work using sprints and a backlog.",
      product: "Jira",
      category: "Software development",
    },
    {
      name: "Product discovery",
      badge: "Try",
      desc: "Prioritize ideas then connect them from discovery through to delivery.",
      product: "Jira Product Discovery",
      category: "Product management",
    },
    {
      name: "IT service management",
      badge: "Try",
      desc: "Quickly respond to requests, resolve incidents, and deploy changes.",
      product: "Jira Service Management",
      category: "Service management",
    },
    {
      name: "Kanban",
      badge: null,
      desc: "Work efficiently and visualise work on a board with to do, doing, and done.",
      product: "Jira",
      category: "Software development",
    },
    {
      name: "Project management",
      badge: null,
      desc: "Plan and deliver business projects.",
      product: "Jira",
      category: "Work management",
    },
    {
      name: "Cross-team planning",
      badge: "Premium",
      desc: "Align teams on shared goals and timelines.",
      product: "Jira",
      category: "Work management",
    },
  ],
  "Custom templates": [],
  "Import data": [],
}

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  Try: { bg: "#E9F2FF", color: "#0052CC" },
  Premium: { bg: "#FFF0B3", color: "#172B4D" },
  Enterprise: { bg: "#EAE6FF", color: "#403294" },
  "Last created": { bg: "#E3FCEF", color: "#006644" },
}

type Template = {
  name: string
  badge: string | null
  desc: string
  product: string
  category: string
}

function TemplateIllustration({
  name,
  product,
}: {
  name: string
  product: string
}) {
  const bg = TEMPLATE_ICON_BG[name] ?? PRODUCT_COLORS[product]?.bg ?? "#E9F2FF"
  return (
    <div
      style={{
        width: "100%",
        height: 112,
        borderRadius: "4px 4px 0 0",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 0,
        flexShrink: 0,
      }}
    >
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect
          x="6"
          y="10"
          width="44"
          height="6"
          rx="3"
          fill="rgba(255,255,255,0.5)"
        />
        <rect
          x="6"
          y="22"
          width="32"
          height="5"
          rx="2.5"
          fill="rgba(255,255,255,0.4)"
        />
        <rect
          x="6"
          y="33"
          width="38"
          height="5"
          rx="2.5"
          fill="rgba(255,255,255,0.4)"
        />
        <rect
          x="6"
          y="44"
          width="26"
          height="5"
          rx="2.5"
          fill="rgba(255,255,255,0.35)"
        />
      </svg>
    </div>
  )
}

function DiamondIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
      <polygon points="5,0 10,5 5,10 0,5" fill={color} />
    </svg>
  )
}

function CreateProjectFromTemplate({
  template,
  onBack,
  onClose,
}: {
  template: Template
  onBack: () => void
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [key, setKey] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // External sync: derive a default project key from the user-typed name,
  // but allow the user to override it manually afterward.
  useEffect(() => {
    if (name) {
      const autoKey = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 10)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKey(autoKey || "PROJ")
    }
  }, [name])

  async function handleCreate() {
    if (!name.trim()) {
      setError("Project name is required")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/jira/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          key: key.trim(),
          projectTypeKey: "software",
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      onClose()
      window.location.reload()
    } catch (e: unknown) {
      setError(
        `Failed to create project: ${e instanceof Error ? e.message : String(e)}`
      )
      setCreating(false)
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "white",
        zIndex: 10,
        padding: "48px 56px",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          color: "#44546F",
          marginBottom: 32,
          padding: 0,
          width: "fit-content",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#44546F"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <h1
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "#172B4D",
          marginBottom: 6,
          marginTop: 0,
        }}
      >
        {template.name}
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "#6B778C",
          marginBottom: 32,
          marginTop: 0,
        }}
      >
        {template.desc}
      </p>

      <div style={{ maxWidth: 480 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#172B4D",
            marginBottom: 4,
          }}
        >
          Project name <span style={{ color: "#DE350B" }}>*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My Scrum Project"
          autoFocus
          style={{
            width: "100%",
            height: 36,
            padding: "0 10px",
            border: "2px solid #DFE1E6",
            borderRadius: 3,
            fontSize: 14,
            color: "#172B4D",
            marginBottom: 16,
            boxSizing: "border-box",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0052CC"
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#DFE1E6"
          }}
        />

        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#172B4D",
            marginBottom: 4,
          }}
        >
          Key
        </label>
        <input
          value={key}
          onChange={(e) =>
            setKey(
              e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .substring(0, 10)
            )
          }
          style={{
            width: "100%",
            height: 36,
            padding: "0 10px",
            border: "2px solid #DFE1E6",
            borderRadius: 3,
            fontSize: 14,
            color: "#172B4D",
            marginBottom: 24,
            boxSizing: "border-box",
            fontFamily: "monospace",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0052CC"
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#DFE1E6"
          }}
        />

        {error && (
          <p
            style={{
              color: "#DE350B",
              fontSize: 13,
              marginBottom: 16,
              marginTop: 0,
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              background: creating ? "#0052CC99" : "#0052CC",
              color: "white",
              border: "none",
              borderRadius: 3,
              padding: "0 16px",
              height: 36,
              fontSize: 14,
              fontWeight: 500,
              cursor: creating ? "not-allowed" : "pointer",
            }}
          >
            {creating ? "Creating..." : "Create project"}
          </button>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              borderRadius: 3,
              padding: "0 12px",
              height: 36,
              fontSize: 14,
              cursor: "pointer",
              color: "#172B4D",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F4F5F7"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export function CreateSpaceModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("Made for you")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const templates = TEMPLATES[activeTab] ?? TEMPLATES["Made for you"]
  const filtered = activeCategory
    ? templates.filter((t) => t.category === activeCategory)
    : templates

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "white",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* LEFT SIDEBAR */}
      <div
        style={{
          width: 256,
          flexShrink: 0,
          borderRight: "1px solid #DFE1E6",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 16px 12px 20px",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#172B4D" }}>
            Space templates
          </span>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              background: "none",
              border: "none",
              cursor: "pointer",
              borderRadius: 4,
              color: "#44546F",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F4F5F7"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none"
            }}
            title="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#44546F"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: "0 8px 8px" }}>
          {(["Made for you", "Custom templates", "Import data"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setActiveCategory(null)
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "7px 12px",
                  background: activeTab === tab ? "#E9F2FF" : "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14,
                  color: activeTab === tab ? "#0052CC" : "#172B4D",
                  fontWeight: activeTab === tab ? 600 : 400,
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab)
                    e.currentTarget.style.background = "#F4F5F7"
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab)
                    e.currentTarget.style.background = "none"
                }}
              >
                <span>{tab}</span>
                {tab === "Custom templates" && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: 3,
                      background: "#EAE6FF",
                      color: "#403294",
                      flexShrink: 0,
                    }}
                  >
                    Enterprise
                  </span>
                )}
                {tab === "Import data" && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B778C"
                    strokeWidth="2"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                )}
              </button>
            )
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#DFE1E6", margin: "4px 0" }} />

        {/* Categories — direct list, no header */}
        <div style={{ padding: "8px 8px 0" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(cat === activeCategory ? null : cat)
              }
              style={{
                display: "block",
                width: "100%",
                padding: "7px 12px",
                background: activeCategory === cat ? "#E9F2FF" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
                color: activeCategory === cat ? "#0052CC" : "#172B4D",
                fontWeight: activeCategory === cat ? 600 : 400,
                borderRadius: 4,
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat)
                  e.currentTarget.style.background = "#F4F5F7"
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat)
                  e.currentTarget.style.background = "none"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "40px 48px",
          position: "relative",
        }}
      >
        {selectedTemplate && (
          <CreateProjectFromTemplate
            template={selectedTemplate}
            onBack={() => setSelectedTemplate(null)}
            onClose={onClose}
          />
        )}

        {/* Breadcrumb */}
        <nav
          style={{
            fontSize: 13,
            color: "#6B778C",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <button
            onClick={() => {
              setActiveCategory(null)
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B778C",
              fontSize: 13,
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#0052CC"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6B778C"
            }}
          >
            Space templates
          </button>
          {activeCategory && (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6B778C"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span style={{ color: "#172B4D" }}>{activeCategory}</span>
            </>
          )}
        </nav>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#172B4D",
            marginBottom: 4,
            marginTop: 0,
          }}
        >
          {activeCategory || activeTab}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#6B778C",
            marginBottom: 32,
            marginTop: 0,
          }}
        >
          {activeCategory
            ? `Templates for ${activeCategory.toLowerCase()} teams.`
            : "Templates for you based on how similar teams work."}
        </p>

        {/* Template cards grid */}
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "80px 0",
              textAlign: "center",
              color: "#6B778C",
              fontSize: 14,
            }}
          >
            No templates found{activeCategory ? ` for "${activeCategory}"` : ""}
            .
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((tpl) => {
              const prod = PRODUCT_COLORS[tpl.product] ?? {
                bg: "#E9F2FF",
                diamond: "#0052CC",
              }
              return (
                <button
                  key={tpl.name}
                  onClick={() => setSelectedTemplate(tpl)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    padding: 0,
                    border: "1px solid #DFE1E6",
                    borderRadius: 6,
                    background: "white",
                    cursor: "pointer",
                    textAlign: "left",
                    overflow: "hidden",
                    transition: "box-shadow 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(9,30,66,0.15)"
                    e.currentTarget.style.borderColor = "#B3BAC5"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none"
                    e.currentTarget.style.borderColor = "#DFE1E6"
                  }}
                >
                  <TemplateIllustration name={tpl.name} product={tpl.product} />

                  <div style={{ padding: "14px 16px 16px" }}>
                    {/* Name + badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#172B4D",
                        }}
                      >
                        {tpl.name}
                      </span>
                      {tpl.badge && BADGE_COLORS[tpl.badge] && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 5px",
                            borderRadius: 3,
                            background: BADGE_COLORS[tpl.badge].bg,
                            color: BADGE_COLORS[tpl.badge].color,
                            flexShrink: 0,
                          }}
                        >
                          {tpl.badge}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6B778C",
                        margin: "0 0 12px",
                        lineHeight: 1.45,
                      }}
                    >
                      {tpl.desc}
                    </p>

                    {/* Product with diamond icon */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <DiamondIcon color={prod.diamond} />
                      <span style={{ fontSize: 12, color: "#44546F" }}>
                        {tpl.product}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
