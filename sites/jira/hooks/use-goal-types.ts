"use client"

import { useState, useEffect, useCallback } from "react"

export interface GoalTypeChild {
  name: string
  description: string
}

export interface GoalTypeItem {
  id: string
  name: string
  description: string
  enabled: boolean
  seeded: boolean
  children: GoalTypeChild[]
}

export function useGoalTypes() {
  const [types, setTypes] = useState<GoalTypeItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch("/api/data/goal-types")
    if (res.ok) setTypes(await res.json())
    setLoading(false)
  }, [])

  // Mount: fetch goal types from API.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const createType = async (data: {
    name: string
    description?: string
    enabled?: boolean
    children?: GoalTypeChild[]
  }) => {
    const res = await fetch("/api/data/goal-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Failed to create goal type")
    }
    const created = await res.json()
    setTypes((prev) => [...prev, created])
    return created as GoalTypeItem
  }

  const updateType = async (
    id: string,
    data: { name?: string; description?: string; enabled?: boolean }
  ) => {
    const res = await fetch(`/api/data/goal-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update goal type")
    const updated = await res.json()
    setTypes((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated as GoalTypeItem
  }

  const deleteType = async (id: string) => {
    const res = await fetch(`/api/data/goal-types/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete goal type")
    setTypes((prev) => prev.filter((t) => t.id !== id))
  }

  const toggleType = async (id: string) => {
    const type = types.find((t) => t.id === id)
    if (!type) return
    await updateType(id, { enabled: !type.enabled })
  }

  return {
    types,
    loading,
    createType,
    updateType,
    deleteType,
    toggleType,
    reload: load,
  }
}
