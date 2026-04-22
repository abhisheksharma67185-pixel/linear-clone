"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function RovoMcpPage() {
  const [apiTokenEnabled, setApiTokenEnabled] = useState(false)
  const [atlassianDomainsEnabled, setAtlassianDomainsEnabled] = useState(true)
  const [domainSearch, setDomainSearch] = useState("")
  const [domains, setDomains] = useState<string[]>([])
  const [addDomainOpen, setAddDomainOpen] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [termsOpen, setTermsOpen] = useState(false)

  const filteredDomains = domains.filter(
    (d) => !domainSearch || d.toLowerCase().includes(domainSearch.toLowerCase())
  )

  function handleAddDomain() {
    if (newDomain.trim()) {
      setDomains([...domains, newDomain.trim()])
      setNewDomain("")
      setTermsOpen(false)
      setAddDomainOpen(false)
    }
  }

  return (
    <div className="max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Atlassian Rovo MCP server</h1>
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      <p className="mb-8 max-w-3xl text-sm text-muted-foreground">
        The Rovo MCP server enables AI tools, like ChatGPT or Claude.ai, to
        connect to Atlassian apps. Each AI tool is associated with a domain. You
        can also enable API tokens for non-interactive or service-based access
        to the Rovo MCP server.
      </p>

      <h2 className="mb-2 text-base font-semibold">Authentication methods</h2>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        By default, users connect to the Atlassian Rovo MCP Server with OAuth
        2.1. As an admin, you can enable API tokens to handle non-active
        scenarios, where no users complete the consent flow. Domain allowlisting
        does not apply to API token access.{" "}
        <button className="text-blue-600 hover:underline">
          View supported authentication methods
        </button>
      </p>

      <div className="mb-8 flex items-center gap-3 pl-2">
        <Switch
          checked={apiTokenEnabled}
          onCheckedChange={setApiTokenEnabled}
        />
        <span className="text-sm">API token</span>
      </div>

      <div className="my-6 border-t" />

      <h2 className="mb-2 text-base font-semibold">
        Atlassian supported domains
      </h2>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        You can automatically connect AI tools that we partner with. Block
        supported domains if you don&apos;t want them to access your Atlassian
        apps.{" "}
        <button className="text-blue-600 hover:underline">
          View Atlassian supported domains
        </button>
      </p>

      <div className="mb-8 flex items-center gap-3 pl-2">
        <Switch
          checked={atlassianDomainsEnabled}
          onCheckedChange={setAtlassianDomainsEnabled}
        />
        <span className="text-sm">Allow Atlassian supported domains</span>
      </div>

      <div className="my-6 border-t" />

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold">Your domains</h2>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setAddDomainOpen(true)}
        >
          Add domain
        </Button>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        We use the domain you trust to authorize access to the Atlassian Rovo
        MCP Server.{" "}
        <button className="text-blue-600 hover:underline">
          How to add your domains
        </button>
      </p>

      <div className="relative mb-4 max-w-md">
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
          placeholder="Search by domain"
          value={domainSearch}
          onChange={(e) => setDomainSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        Showing {filteredDomains.length} result
        {filteredDomains.length !== 1 ? "s" : ""}
        <svg
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-[1fr_auto] border-b bg-muted/30 px-4 py-2.5">
          <span className="text-sm font-medium">Domain</span>
          <span className="text-sm font-medium">Actions</span>
        </div>
        {filteredDomains.length === 0 ? (
          <div className="flex items-center justify-center px-4 py-8">
            <span className="text-sm text-muted-foreground italic">
              No domain added
            </span>
          </div>
        ) : (
          filteredDomains.map((d) => (
            <div
              key={d}
              className="grid grid-cols-[1fr_auto] items-center border-b px-4 py-3 last:border-b-0"
            >
              <span className="text-sm">{d}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDomains(domains.filter((x) => x !== d))}
              >
                Delete
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Add domain dialog */}
      <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add domain
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Add a domain to allow access to apps like Jira and Confluence.{" "}
            <button className="text-blue-600 hover:underline">
              Review domain patterns
            </button>
          </p>

          <div>
            <Label className="mb-1.5">Domain</Label>
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Example domain pattern: https://claude.ai/**
            </p>
          </div>

          <div>
            <button
              onClick={() => setTermsOpen(!termsOpen)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <svg
                className={`size-3.5 transition-transform ${termsOpen ? "rotate-90" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              By connecting to the Rovo MCP Server you agree to the following
              terms around Atlassian&apos;s use of data and compliance with 3rd
              party terms:
            </button>
            {termsOpen && (
              <div className="mt-2 ml-5 space-y-1 text-xs text-muted-foreground">
                <p>
                  - Atlassian processes data according to its Privacy Policy
                </p>
                <p>
                  - Third-party AI tools may have their own data handling
                  policies
                </p>
                <p>
                  - You are responsible for compliance with applicable
                  regulations
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setAddDomainOpen(false)
                setNewDomain("")
                setTermsOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!newDomain.trim()}
              onClick={handleAddDomain}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
