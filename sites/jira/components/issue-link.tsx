"use client"

import { useContext, createContext } from "react"
import Link from "next/link"
import { useIssueDrawer } from "@/components/issue-drawer-provider"

export function IssueLink({
  issueKey,
  children,
  className,
}: {
  issueKey: string
  children: React.ReactNode
  className?: string
}) {
  const { openIssue } = useIssueDrawer()

  // Test if the drawer context is real (not the default no-op).
  // The default context has openIssue: () => {} which does nothing.
  // If we're outside IssueDrawerProvider, fall back to a proper <Link>.
  const hasDrawer = useHasDrawerProvider()

  if (hasDrawer) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          openIssue(issueKey)
        }}
        className={className}
      >
        {children}
      </button>
    )
  }

  return (
    <Link
      href={`/issue/${issueKey}`}
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      {children}
    </Link>
  )
}

// Internal: detect if we're inside a real IssueDrawerProvider.
// We use a separate context just for detection so we don't change the provider API.
const DrawerDetectContext = createContext(false)

export function DrawerDetectProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DrawerDetectContext.Provider value={true}>
      {children}
    </DrawerDetectContext.Provider>
  )
}

function useHasDrawerProvider() {
  return useContext(DrawerDetectContext)
}
