import { AppShell } from "@/components/zendesk/app-shell"
import { ChannelsMiniCard } from "@/components/zendesk/channels-mini-card"
import { SetupGuideCard } from "@/components/zendesk/setup-guide-card"
import { StatCard } from "@/components/zendesk/stat-card"
import { TicketList } from "@/components/zendesk/ticket-list"
import { UpdatesCard } from "@/components/zendesk/updates-card"
import { ViewsSidebar } from "@/components/zendesk/views-sidebar"
import * as store from "@/app/lib/store"
import "@/app/lib/init-sim"
import type { User } from "@/app/lib/mock-data"

export const dynamic = "force-dynamic"

export default function HomePage() {
  const home = store.getHomeInitialData()
  const usersById: Record<string, User> = Object.fromEntries(
    store.getUsers().map((u) => [u.id, u])
  )

  return (
    <AppShell
      agentName={home.currentAgent.name}
      conversations={0}
      left={<ViewsSidebar />}
      main={<TicketList tickets={home.tickets} usersById={usersById} />}
      right={
        <>
          <SetupGuideCard />
          <ChannelsMiniCard />
          <StatCard
            title="Ticket statistics"
            subtitle="This week"
            value={home.counts.solvedThisWeek}
            caption="Solved"
          />
          <StatCard
            title="Open tickets"
            value={home.counts.groupOpenTickets}
            caption="Your groups"
          />
          <UpdatesCard />
        </>
      }
    />
  )
}
