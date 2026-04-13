import type { Metadata } from "next"
import AdminOverviewPage from "./overview-client"

export const metadata: Metadata = { title: "Overview" }

export default function Page() {
  return <AdminOverviewPage />
}
