import { IconArrowRight } from "@tabler/icons-react"

import { Card, CardContent } from "@/components/ui/card"

export function ChannelsMiniCard() {
  return (
    <Card className="gap-2 py-3" size="sm">
      <CardContent className="flex flex-col gap-1 px-4 py-1">
        <div className="text-sm font-medium text-foreground">
          Add more support channels
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          View all setup guides
          <IconArrowRight className="size-3" />
        </a>
      </CardContent>
    </Card>
  )
}
