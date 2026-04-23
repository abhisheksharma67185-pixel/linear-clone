import { IconArrowRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

// Dark navbar at the very top of the screen — matches the Zendesk trial
// banner in the reference screenshot.
export function TopTrialBar() {
  return (
    <div className="flex h-10 w-full items-center justify-between gap-3 bg-zinc-900 px-3 text-zinc-100">
      <Button
        variant="outline"
        size="sm"
        className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:hover:bg-zinc-800"
      >
        View all setup guides
        <IconArrowRight data-icon="inline-end" />
      </Button>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-zinc-300 sm:inline">
          You have 13 days left in your trial
        </span>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:hover:bg-zinc-800"
        >
          Compare plans
        </Button>
        <Button
          size="sm"
          className="bg-sky-600 text-white hover:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          Buy your trial
        </Button>
      </div>
    </div>
  )
}
