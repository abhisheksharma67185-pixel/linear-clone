"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { IssueDrawer } from "@/components/issue-drawer"

interface IssueDrawerContextValue {
  openIssue: (key: string) => void
  closeIssue: () => void
}

const IssueDrawerContext = createContext<IssueDrawerContextValue>({
  openIssue: () => {},
  closeIssue: () => {},
})

export function useIssueDrawer() {
  return useContext(IssueDrawerContext)
}

export function IssueDrawerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [drawerKey, setDrawerKey] = useState<string | null>(null)

  const openIssue = useCallback((key: string) => setDrawerKey(key), [])
  const closeIssue = useCallback(() => setDrawerKey(null), [])

  return (
    <IssueDrawerContext.Provider value={{ openIssue, closeIssue }}>
      {children}
      <IssueDrawer
        issueKey={drawerKey}
        open={drawerKey !== null}
        onClose={closeIssue}
      />
    </IssueDrawerContext.Provider>
  )
}
