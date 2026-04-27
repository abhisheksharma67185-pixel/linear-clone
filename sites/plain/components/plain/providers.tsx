"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Threads, customers, etc. don't change behind our back; we want
        // optimistic updates to feel instant and only refetch on explicit
        // invalidation or window focus.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  })
}

export function PlainQueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Lazily create a per-render client so HMR doesn't blow it away on every
  // edit, but each tab/page mount gets its own.
  const [client] = React.useState(makeClient)
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
