"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface IpAllowlistEntry {
  id: string
  name: string
  ipAddresses: string[]
  accessOrigin: string
  appliesTo: string[]
  status: "Enabled" | "Disabled"
}

export default function IpAllowlistsPage() {
  const [search, setSearch] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<IpAllowlistEntry | null>(
    null
  )
  const [allowlists, setAllowlists] = useState<IpAllowlistEntry[]>([])
  const [actionsOpen, setActionsOpen] = useState<string | null>(null)

  // Create form state
  const [formName, setFormName] = useState("")
  const [formIpInput, setFormIpInput] = useState("")
  const [formIpAddresses, setFormIpAddresses] = useState<string[]>([])
  const [formAccessOrigin, setFormAccessOrigin] = useState("Any")
  const [formAppliesTo, setFormAppliesTo] = useState<string[]>(["All apps"])
  const [formStatus, setFormStatus] = useState<"Enabled" | "Disabled">(
    "Enabled"
  )
  const [formError, setFormError] = useState("")

  const resetForm = () => {
    setFormName("")
    setFormIpInput("")
    setFormIpAddresses([])
    setFormAccessOrigin("Any")
    setFormAppliesTo(["All apps"])
    setFormStatus("Enabled")
    setFormError("")
    setEditingEntry(null)
  }

  const openCreate = () => {
    resetForm()
    setShowCreateForm(true)
  }

  const openEdit = (entry: IpAllowlistEntry) => {
    setFormName(entry.name)
    setFormIpAddresses([...entry.ipAddresses])
    setFormAccessOrigin(entry.accessOrigin)
    setFormAppliesTo([...entry.appliesTo])
    setFormStatus(entry.status)
    setFormError("")
    setEditingEntry(entry)
    setShowCreateForm(true)
    setActionsOpen(null)
  }

  const addIpAddress = () => {
    const trimmed = formIpInput.trim()
    if (!trimmed) return
    // Basic IP/CIDR validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
    if (!ipRegex.test(trimmed)) {
      setFormError(
        "Enter a valid IP address or CIDR range (e.g., 192.168.1.0/24)"
      )
      return
    }
    if (formIpAddresses.includes(trimmed)) {
      setFormError("This IP address has already been added")
      return
    }
    setFormIpAddresses([...formIpAddresses, trimmed])
    setFormIpInput("")
    setFormError("")
  }

  const removeIpAddress = (ip: string) => {
    setFormIpAddresses(formIpAddresses.filter((a) => a !== ip))
  }

  const handleSave = () => {
    if (!formName.trim()) {
      setFormError("Name is required")
      return
    }
    if (formIpAddresses.length === 0) {
      setFormError("At least one IP address is required")
      return
    }

    if (editingEntry) {
      setAllowlists(
        allowlists.map((a) =>
          a.id === editingEntry.id
            ? {
                ...a,
                name: formName.trim(),
                ipAddresses: formIpAddresses,
                accessOrigin: formAccessOrigin,
                appliesTo: formAppliesTo,
                status: formStatus,
              }
            : a
        )
      )
    } else {
      const newEntry: IpAllowlistEntry = {
        id: Date.now().toString(),
        name: formName.trim(),
        ipAddresses: formIpAddresses,
        accessOrigin: formAccessOrigin,
        appliesTo: formAppliesTo,
        status: formStatus,
      }
      setAllowlists([...allowlists, newEntry])
    }

    setShowCreateForm(false)
    resetForm()
  }

  const toggleStatus = (id: string) => {
    setAllowlists(
      allowlists.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "Enabled" ? "Disabled" : "Enabled" }
          : a
      )
    )
    setActionsOpen(null)
  }

  const deleteEntry = (id: string) => {
    setAllowlists(allowlists.filter((a) => a.id !== id))
    setActionsOpen(null)
  }

  const filteredAllowlists = allowlists.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.name.toLowerCase().includes(q) ||
      a.ipAddresses.some((ip) => ip.includes(q)) ||
      a.appliesTo.some((app) => app.toLowerCase().includes(q))
    )
  })

  // Create / Edit form overlay
  if (showCreateForm) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <button
          onClick={() => {
            setShowCreateForm(false)
            resetForm()
          }}
          className="absolute top-6 left-6 rounded p-1.5 text-muted-foreground hover:bg-accent"
        >
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mx-auto max-w-xl px-8 pt-24 pb-32">
          <h1 className="mb-2 text-2xl font-bold">
            {editingEntry ? "Edit IP allowlist" : "Create IP allowlist"}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Define IP addresses and ranges that are allowed to access your
            organization&apos;s apps.{" "}
            <button type="button" className="text-blue-600 hover:underline">
              More about IP allowlists.
            </button>
          </p>

          {formError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., Office network"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* IP addresses */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                IP addresses <span className="text-red-500">*</span>
              </label>
              <p className="mb-2 text-xs text-muted-foreground">
                Add individual IP addresses or CIDR ranges (e.g.,
                192.168.1.0/24)
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter IP address or CIDR range"
                  value={formIpInput}
                  onChange={(e) => {
                    setFormIpInput(e.target.value)
                    setFormError("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addIpAddress()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addIpAddress}>
                  Add
                </Button>
              </div>
              {formIpAddresses.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formIpAddresses.map((ip) => (
                    <div
                      key={ip}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="font-mono">{ip}</span>
                      <button
                        type="button"
                        onClick={() => removeIpAddress(ip)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <svg
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Access origin */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Access origin
              </label>
              <select
                value={formAccessOrigin}
                onChange={(e) => setFormAccessOrigin(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <option value="Any">Any</option>
                <option value="Browser">Browser</option>
                <option value="API">API</option>
              </select>
            </div>

            {/* Applies to */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Applies to
              </label>
              <select
                value={formAppliesTo[0]}
                onChange={(e) => setFormAppliesTo([e.target.value])}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <option value="All apps">All apps</option>
                <option value="Jira">Jira</option>
                <option value="Confluence">Confluence</option>
                <option value="Jira Service Management">
                  Jira Service Management
                </option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="status"
                    checked={formStatus === "Enabled"}
                    onChange={() => setFormStatus("Enabled")}
                    className="accent-blue-600"
                  />
                  Enabled
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="status"
                    checked={formStatus === "Disabled"}
                    onChange={() => setFormStatus("Disabled")}
                    className="accent-blue-600"
                  />
                  Disabled
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed right-0 bottom-0 left-0 flex items-center justify-center gap-3 border-t bg-background py-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateForm(false)
              resetForm()
            }}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSave}
          >
            {editingEntry ? "Save" : "Create"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">IP allowlists</h1>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={openCreate}
        >
          Create IP allowlist
        </Button>
      </div>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        An IP allowlist ensures that only users from trusted IP addresses or
        locations can access the apps in your organization.{" "}
        <button type="button" className="text-blue-600 hover:underline">
          More about IP allowlists.
        </button>
      </p>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <svg
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            placeholder="Search by app, IP address, location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          Origin
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Applies to
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          Status
          <svg className="size-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Showing {filteredAllowlists.length} items</span>
        <svg
          className="size-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left font-medium">Name</th>
              <th className="px-4 py-2.5 text-left font-medium">
                Access origin
              </th>
              <th className="px-4 py-2.5 text-left font-medium">Applies to</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAllowlists.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-muted-foreground italic"
                >
                  No IP allowlist created
                </td>
              </tr>
            ) : (
              filteredAllowlists.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b last:border-b-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{entry.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {entry.ipAddresses.join(", ")}
                    </div>
                  </td>
                  <td className="px-4 py-3">{entry.accessOrigin}</td>
                  <td className="px-4 py-3">{entry.appliesTo.join(", ")}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.status === "Enabled"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActionsOpen(
                            actionsOpen === entry.id ? null : entry.id
                          )
                        }
                        className="rounded p-1 hover:bg-accent"
                      >
                        <svg
                          className="size-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                      {actionsOpen === entry.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActionsOpen(null)}
                          />
                          <div className="absolute top-8 right-0 z-50 w-48 rounded-md border bg-popover shadow-md">
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
                              onClick={() => openEdit(entry)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
                              onClick={() => toggleStatus(entry.id)}
                            >
                              {entry.status === "Enabled"
                                ? "Disable"
                                : "Enable"}
                            </button>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-accent"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
