"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TrendingTopic {
  name: string
  items: number
  followers: number
  following: boolean
}

interface FollowingTopic {
  name: string
  items: number
  following: boolean
}

interface EverythingTopic {
  name: string
  places: number
  followers: number
  following: boolean
}

const initialTrending: TrendingTopic[] = [
  { name: "infinity-flow", items: 16, followers: 90, following: false },
  { name: "carebear", items: 16, followers: 90, following: false },
  { name: "vortex", items: 16, followers: 90, following: false },
]

const initialFollowing: FollowingTopic[] = [
  { name: "new-product", items: 16, following: true },
  { name: "team-central", items: 16, following: true },
]

const initialEverything: EverythingTopic[] = [
  { name: "50k scale", places: 17, followers: 90, following: false },
  { name: "api-design", places: 12, followers: 45, following: false },
  { name: "cloud-migration", places: 8, followers: 120, following: false },
  { name: "design-system", places: 22, followers: 67, following: false },
]

type SortKey = "followers" | "places" | "name"

export default function TagsPage() {
  const [search, setSearch] = useState("")
  const [trending, setTrending] = useState(initialTrending)
  const [followingTopics, setFollowingTopics] = useState(initialFollowing)
  const [everything, setEverything] = useState(initialEverything)
  const sortBy: SortKey = "followers"
  const [sortAsc, setSortAsc] = useState(false)

  const toggleTrending = (name: string) => {
    setTrending((prev) =>
      prev.map((t) => (t.name === name ? { ...t, following: !t.following } : t))
    )
  }

  const toggleFollowing = (name: string) => {
    setFollowingTopics((prev) =>
      prev.map((t) => (t.name === name ? { ...t, following: !t.following } : t))
    )
  }

  const toggleEverything = (name: string) => {
    setEverything((prev) =>
      prev.map((t) => (t.name === name ? { ...t, following: !t.following } : t))
    )
  }

  const toggleSort = () => {
    setSortAsc((prev) => !prev)
  }

  const query = search.toLowerCase().trim()

  const filteredTrending = useMemo(
    () => trending.filter((t) => t.name.toLowerCase().includes(query)),
    [trending, query]
  )

  const filteredFollowing = useMemo(
    () => followingTopics.filter((t) => t.name.toLowerCase().includes(query)),
    [followingTopics, query]
  )

  const filteredEverything = useMemo(() => {
    const filtered = everything.filter((t) =>
      t.name.toLowerCase().includes(query)
    )
    return [...filtered].sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      if (sortBy === "followers") return (b.followers - a.followers) * dir
      if (sortBy === "places") return (b.places - a.places) * dir
      return a.name.localeCompare(b.name) * dir
    })
  }, [everything, query, sortBy, sortAsc])

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Banner */}
      <div className="mb-8 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/60 px-6 py-4 dark:border-blue-800 dark:bg-blue-950/20">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600">#</span>
          <p className="text-sm text-foreground">
            <span className="font-semibold text-blue-600">Topics</span> are
            custom, curated feeds that you get by tagging things across
            Atlassian.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/goals">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              size="sm"
            >
              Find goals to tag
            </Button>
          </Link>
          <Link href="/project-directory">
            <Button variant="outline" size="sm">
              Find projects to tag
            </Button>
          </Link>
        </div>
      </div>

      {/* Topics heading */}
      <h2 className="mb-4 text-lg font-semibold">Topics</h2>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics"
          className="pl-9"
        />
      </div>

      {/* Trending topics */}
      {filteredTrending.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Trending topics
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {filteredTrending.map((topic) => (
              <div
                key={topic.name}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-100 text-base font-bold text-purple-600 dark:bg-purple-900/30">
                    #
                  </span>
                  <div>
                    <p className="text-sm font-medium">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {topic.items} items &middot; {topic.followers} followers
                    </p>
                  </div>
                </div>
                <Button
                  variant={topic.following ? "default" : "outline"}
                  size="sm"
                  className={
                    topic.following
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : ""
                  }
                  onClick={() => toggleTrending(topic.name)}
                >
                  {topic.following ? "Following" : "Follow"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics you're following */}
      {filteredFollowing.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Topics you&apos;re following
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {filteredFollowing.map((topic) => (
              <div
                key={topic.name}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-100 text-base font-bold text-purple-600 dark:bg-purple-900/30">
                    #
                  </span>
                  <div>
                    <p className="text-sm font-medium">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {topic.items} items
                    </p>
                  </div>
                </div>
                <Button
                  variant={topic.following ? "default" : "outline"}
                  size="sm"
                  className={
                    topic.following
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : ""
                  }
                  onClick={() => toggleFollowing(topic.name)}
                >
                  {topic.following ? "Following" : "Follow"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Everything else */}
      {filteredEverything.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Everything else
            </h3>
            <button
              onClick={toggleSort}
              className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Sort by {sortBy}
              <svg
                className={`size-3.5 transition-transform ${sortAsc ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col">
            {filteredEverything.map((topic) => (
              <div
                key={topic.name}
                className="flex items-center justify-between border-b py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-purple-100 text-base font-bold text-purple-600 dark:bg-purple-900/30">
                    #
                  </span>
                  <span className="text-sm font-medium">{topic.name}</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-xs text-muted-foreground">
                    {topic.places} places
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {topic.followers} followers
                  </span>
                  <Button
                    variant={topic.following ? "default" : "outline"}
                    size="sm"
                    className={
                      topic.following
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : ""
                    }
                    onClick={() => toggleEverything(topic.name)}
                  >
                    {topic.following ? "Following" : "Follow"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
