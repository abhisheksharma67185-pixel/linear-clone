"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  HelpCircle,
  Search,
  Sparkles,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function TopSearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="flex h-11 shrink-0 items-center gap-2 bg-slack-aubergine px-3 text-white">
      <div className="flex w-[calc(16rem-0.75rem)] shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => router.back()}
              >
                <ArrowLeft className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Back</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => router.forward()}
              >
                <ArrowRight className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Clock className="size-4" />
              </Button>
            }
          />
          <TooltipContent>History</TooltipContent>
        </Tooltip>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-xl min-w-0 flex-1 items-center"
      >
        <div className="relative flex w-full items-center">
          <Search className="absolute left-2.5 size-4 text-white/70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you are looking for"
            className="h-7 border-white/20 bg-white/10 pr-10 pl-8 text-sm text-white placeholder:text-white/70 focus-visible:border-white/40 focus-visible:ring-0"
          />
          {/* Slack AI affordance — opens the assistant on real Slack; here it
              still submits the form so the search remains functional. */}
          <button
            type="submit"
            aria-label="Slack AI search"
            title="Slack AI search"
            className="absolute right-1 flex size-6 items-center justify-center rounded bg-gradient-to-br from-pink-400 to-purple-500 text-white hover:opacity-90"
          >
            <Sparkles className="size-3.5" />
          </button>
        </div>
      </form>
      <div className="flex w-28 shrink-0 justify-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="size-7 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <HelpCircle className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Help</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
