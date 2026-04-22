"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Most engine data is cheap to refetch and changes between actions.
        // We keep a short stale time and retry once so transient site
        // restarts don't hose the UI.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Lazily create a per-render client to keep React Query state stable across
  // the React tree (and avoid recreating it during HMR).
  const [client] = React.useState(makeClient)

  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        {children}
        <Toaster richColors position="bottom-right" />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
