import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StatCardProps {
  // The header label (e.g. "Ticket statistics" or "Open tickets")
  title: string
  // Subtitle shown under the header (e.g. "This week", "Your groups")
  subtitle?: string
  // Big number rendered prominently
  value: number | string
  // Caption directly under the number (e.g. "Solved", "Your groups")
  caption: string
}

export function StatCard({ title, subtitle, value, caption }: StatCardProps) {
  return (
    <Card className="gap-1 py-3" size="sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        {subtitle ? (
          <CardDescription className="text-xs">{subtitle}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-0.5 px-4 pb-1">
        <div className="font-heading text-3xl leading-none font-medium text-foreground">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{caption}</div>
      </CardContent>
    </Card>
  )
}
