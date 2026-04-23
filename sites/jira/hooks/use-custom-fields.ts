"use client"

import { useState, useEffect, useCallback } from "react"

export interface CustomField {
  id: string
  name: string
  type: "Number" | "Text" | "User" | "Select" | "Date" | "URL"
  options?: string[]
  multi?: boolean
  description?: string
  createdAt: string
}

let _cache: CustomField[] | null = null
const _listeners = new Set<() => void>()

function notify() {
  _listeners.forEach((fn) => fn())
}

export async function fetchAndCacheFields(): Promise<CustomField[]> {
  const res = await fetch("/api/data/goal-fields")
  const data: CustomField[] = await res.json()
  _cache = data
  notify()
  return data
}

export function useCustomFields() {
  const [fields, setFields] = useState<CustomField[]>(_cache ?? [])

  const refresh = useCallback(() => {
    fetchAndCacheFields()
      .then(setFields)
      .catch(() => {})
  }, [])

  // External sync: subscribe to module-level cache updates and hydrate from
  // it on mount.
  useEffect(() => {
    // Subscribe to cross-component updates
    const handler = () => {
      if (_cache) setFields([..._cache])
    }
    _listeners.add(handler)

    // Initial load
    if (_cache === null) {
      refresh()
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFields([..._cache])
    }

    return () => {
      _listeners.delete(handler)
    }
  }, [refresh])

  const createField = useCallback(
    async (payload: {
      name: string
      type: string
      options?: string[]
      multi?: boolean
      description?: string
    }) => {
      const res = await fetch("/api/data/goal-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(err.error ?? "Failed to create field")
      }
      await fetchAndCacheFields()
    },
    []
  )

  const updateField = useCallback(
    async (
      id: string,
      payload: {
        name?: string
        options?: string[]
        multi?: boolean
        description?: string
      }
    ) => {
      const res = await fetch(`/api/data/goal-fields/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(err.error ?? "Failed to update field")
      }
      await fetchAndCacheFields()
    },
    []
  )

  const renameField = useCallback(async (id: string, name: string) => {
    const res = await fetch(`/api/data/goal-fields/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(err.error ?? "Failed to rename field")
    }
    await fetchAndCacheFields()
  }, [])

  const deleteField = useCallback(async (id: string) => {
    const res = await fetch(`/api/data/goal-fields/${id}`, { method: "DELETE" })
    if (!res.ok && res.status !== 204) {
      throw new Error("Failed to delete field")
    }
    await fetchAndCacheFields()
  }, [])

  return { fields, refresh, createField, updateField, renameField, deleteField }
}
