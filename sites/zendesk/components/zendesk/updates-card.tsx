import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UpdatesCard() {
  return (
    <Card className="gap-2 py-4" size="sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm">Updates</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-1 text-sm text-muted-foreground">
        No recent updates.
      </CardContent>
    </Card>
  )
}
