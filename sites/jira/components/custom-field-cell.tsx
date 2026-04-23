"use client"

import { useState, useRef, useEffect } from "react"

interface Props {
  fieldId: string
  goalId: string
  type: "Text" | "Number" | "User" | "Select" | "Date" | "URL"
  options?: string[]
  multi?: boolean
  description?: string
  value: unknown
  onSave: (fieldId: string, value: unknown) => Promise<void>
  /** If true, render as a stacked detail-panel row instead of a table cell chip */
  detailView?: boolean
}

export function CustomFieldCell({
  fieldId,
  type,
  options = [],
  multi = false,
  description,
  value,
  onSave,
  detailView,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<unknown>(value)
  const [selectOpen, setSelectOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectRef = useRef<HTMLDivElement>(null)

  // Sync draft when value changes from parent (external sync: prop → state).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = async (newVal: unknown) => {
    if (saving) return
    setSaving(true)
    try {
      await onSave(fieldId, newVal)
    } finally {
      setSaving(false)
    }
    setEditing(false)
    setSelectOpen(false)
  }

  // ── Select (single or multi) ─────────────────────────────────────────────────
  if (type === "Select") {
    const toArray = (v: unknown): string[] => {
      if (!v) return []
      if (Array.isArray(v))
        return v.filter((x) => typeof x === "string") as string[]
      if (typeof v === "string") return v ? [v] : []
      return []
    }

    const selectedArr = toArray(draft)
    const isSelected = (opt: string) => selectedArr.includes(opt)

    const toggleOption = (opt: string) => {
      if (multi) {
        const next = isSelected(opt)
          ? selectedArr.filter((o) => o !== opt)
          : [...selectedArr, opt]
        setDraft(next)
        commit(next)
      } else {
        const next = selectedArr[0] === opt ? "" : opt
        setDraft(next)
        commit(next)
      }
    }

    return (
      <div
        className="relative"
        title={description}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setSelectOpen((v) => !v)}
          className={`flex min-w-[60px] items-center gap-1 rounded border border-transparent px-2 py-0.5 text-xs transition-colors hover:border-[#dfe1e6] hover:bg-[#f4f5f7] ${
            detailView ? "w-full justify-between px-2 py-1 text-[13px]" : ""
          }`}
        >
          {selectedArr.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {selectedArr.map((s) => (
                <span
                  key={s}
                  className="rounded bg-[#e9f2ff] px-2 py-0.5 text-xs font-medium text-[#0052cc]"
                >
                  {s}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-[#626f86]">—</span>
          )}
          <svg
            className="size-3 shrink-0 text-[#626f86]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {selectOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSelectOpen(false)}
            />
            <div
              ref={selectRef}
              className="absolute top-full left-0 z-50 mt-1 min-w-[140px] rounded-md border border-[#dfe1e6] bg-white py-1 shadow-[0_4px_16px_rgba(9,30,66,0.15)] dark:bg-popover"
            >
              {!multi && (
                <button
                  onClick={() => {
                    setDraft("")
                    commit("")
                  }}
                  className="flex w-full items-center px-3 py-1.5 text-[13px] text-[#626f86] transition-colors hover:bg-[#f4f5f7]"
                >
                  — None
                </button>
              )}
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors hover:bg-[#f4f5f7] ${
                    isSelected(opt)
                      ? "bg-[#e9f2ff] font-medium text-[#0052cc]"
                      : "text-[#172b4d] dark:text-foreground"
                  }`}
                >
                  {multi && (
                    <span
                      className={`inline-flex size-3.5 shrink-0 items-center justify-center rounded border ${
                        isSelected(opt)
                          ? "border-[#0052cc] bg-[#0052cc]"
                          : "border-[#626f86]"
                      }`}
                    >
                      {isSelected(opt) && (
                        <svg
                          className="size-2.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  )}
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── User ─────────────────────────────────────────────────────────────────────
  if (type === "User") {
    const userVal = typeof draft === "string" ? draft : ""
    if (editing) {
      return (
        <div
          title={description}
          onClick={(e) => e.stopPropagation()}
          className={detailView ? "w-full" : ""}
        >
          <input
            ref={inputRef}
            type="text"
            value={userVal}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commit(draft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(draft)
              if (e.key === "Escape") {
                setDraft(value)
                setEditing(false)
              }
            }}
            className={`rounded border border-[#0052cc] bg-background px-2 py-0.5 text-[13px] outline-none focus:ring-1 focus:ring-[#0052cc] ${
              detailView ? "w-full px-3 py-1.5 text-sm" : "w-32"
            }`}
            placeholder="User name"
          />
        </div>
      )
    }
    return (
      <div
        title={description}
        className="group/user flex cursor-pointer items-center gap-1.5"
        onClick={(e) => {
          e.stopPropagation()
          setEditing(true)
        }}
      >
        {userVal ? (
          <>
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-[9px] font-semibold text-white">
              {userVal
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
            <span className="max-w-[80px] truncate text-xs text-[#172b4d] hover:underline dark:text-foreground">
              {userVal}
            </span>
          </>
        ) : (
          <span className="text-xs text-[#626f86] group-hover/user:text-[#172b4d]">
            —
          </span>
        )}
      </div>
    )
  }

  // ── Number ───────────────────────────────────────────────────────────────────
  if (type === "Number") {
    const numVal =
      draft !== undefined && draft !== null && draft !== "" ? String(draft) : ""
    if (editing) {
      return (
        <div
          title={description}
          onClick={(e) => e.stopPropagation()}
          className={detailView ? "w-full" : ""}
        >
          <input
            ref={inputRef}
            type="number"
            value={numVal}
            onChange={(e) =>
              setDraft(e.target.value === "" ? "" : Number(e.target.value))
            }
            onBlur={() => commit(draft === "" ? null : Number(draft))}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(draft === "" ? null : Number(draft))
              if (e.key === "Escape") {
                setDraft(value)
                setEditing(false)
              }
            }}
            className={`rounded border border-[#0052cc] bg-background text-right outline-none focus:ring-1 focus:ring-[#0052cc] ${
              detailView
                ? "w-full px-3 py-1.5 text-sm"
                : "w-20 px-2 py-0.5 text-[13px]"
            }`}
          />
        </div>
      )
    }
    return (
      <div
        title={description}
        className="group/num cursor-pointer text-right"
        onClick={(e) => {
          e.stopPropagation()
          setEditing(true)
        }}
      >
        {numVal !== "" ? (
          <span className="font-mono text-xs text-[#172b4d] dark:text-foreground">
            {numVal}
          </span>
        ) : (
          <span className="text-xs text-[#626f86] group-hover/num:text-[#172b4d]">
            —
          </span>
        )}
      </div>
    )
  }

  // ── Text (default) ───────────────────────────────────────────────────────────
  const textVal = typeof draft === "string" ? draft : ""
  if (editing) {
    return (
      <div
        title={description}
        onClick={(e) => e.stopPropagation()}
        className={detailView ? "w-full" : ""}
      >
        <input
          ref={inputRef}
          type="text"
          value={textVal}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(draft)
            if (e.key === "Escape") {
              setDraft(value)
              setEditing(false)
            }
          }}
          className={`rounded border border-[#0052cc] bg-background px-2 py-0.5 text-[13px] outline-none focus:ring-1 focus:ring-[#0052cc] ${
            detailView ? "w-full px-3 py-1.5 text-sm" : "w-28"
          }`}
        />
      </div>
    )
  }
  return (
    <div
      title={description}
      className="group/text relative cursor-pointer"
      onClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
    >
      {textVal ? (
        <span
          className="block max-w-[110px] truncate text-xs text-[#172b4d] hover:underline dark:text-foreground"
          title={textVal}
        >
          {textVal}
        </span>
      ) : (
        <span className="text-xs text-[#626f86] group-hover/text:text-[#172b4d]">
          —
        </span>
      )}
    </div>
  )
}
