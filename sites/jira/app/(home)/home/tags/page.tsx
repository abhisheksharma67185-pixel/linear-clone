"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const trendingTopics = [
  { name: "infinity-flow", items: 16, followers: 90 },
  { name: "carebear", items: 16, followers: 90 },
  { name: "vortex", items: 16, followers: 90 },
]

const followingTopics = [
  { name: "new-product", items: 16, following: true },
  { name: "team-central", items: 16, following: true },
]

const everythingElse = [
  { name: "50k scale", places: 17, followers: 90 },
  { name: "api-design", places: 12, followers: 45 },
  { name: "cloud-migration", places: 8, followers: 120 },
  { name: "design-system", places: 22, followers: 67 },
]

export default function TagsPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="mb-8 flex items-center justify-between rounded-lg border bg-blue-50/50 px-6 py-4 dark:bg-blue-900/10">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600">#</span>
          <p className="text-sm">
            <span className="font-medium text-blue-600">Topics</span> are custom, curated feeds that you get by tagging things across Atlassian.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 text-white hover:bg-blue-700" size="sm">Find goals to tag</Button>
          <Button variant="outline" size="sm">Find projects to tag</Button>
        </div>
      </div>

      {/* Topics heading */}
      <h2 className="mb-4 text-lg font-semibold text-muted-foreground">Topics</h2>

      {/* Search */}
      <div className="relative mb-8 max-w-2xl">
        <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics"
          className="pl-9"
        />
      </div>

      {/* Trending topics */}
      <div className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Trending topics</h3>
        <div className="grid grid-cols-3 gap-3">
          {trendingTopics.map((topic) => (
            <div key={topic.name} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground/40">#</span>
                <div>
                  <p className="text-sm font-medium">{topic.name}</p>
                  <p className="text-xs text-muted-foreground">{topic.items} items &middot; {topic.followers} followers</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">Follow</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Topics you're following */}
      <div className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Topics you&apos;re following</h3>
        <div className="grid grid-cols-3 gap-3">
          {followingTopics.map((topic) => (
            <div key={topic.name} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground/40">#</span>
                <div>
                  <p className="text-sm font-medium">{topic.name}</p>
                  <p className="text-xs text-muted-foreground">{topic.items} items</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">Following</Button>
            </div>
          ))}
        </div>
      </div>

      {/* Everything else */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Everything else</h3>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Sort by followers
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </div>
        <div className="flex flex-col">
          {everythingElse.map((topic) => (
            <div key={topic.name} className="flex items-center justify-between border-b py-3 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-muted-foreground/40">#</span>
                <span className="text-sm">{topic.name}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-xs text-muted-foreground">{topic.places} places</span>
                <span className="text-xs text-muted-foreground">{topic.followers} followers</span>
                <Button variant="outline" size="sm" className="text-xs">Follow</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
