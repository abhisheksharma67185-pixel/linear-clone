"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { ForwardMessageDialog } from "./forward-message-dialog"

type Ctx = {
  openForward: (messageId: string) => void
}

const ForwardCtx = createContext<Ctx | null>(null)

export function ForwardMessageProvider({ children }: { children: ReactNode }) {
  const [messageId, setMessageId] = useState<string | null>(null)

  return (
    <ForwardCtx.Provider value={{ openForward: setMessageId }}>
      {children}
      <ForwardMessageDialog
        open={messageId !== null}
        onOpenChange={(v) => !v && setMessageId(null)}
        messageId={messageId}
      />
    </ForwardCtx.Provider>
  )
}

export function useForwardMessage(): Ctx {
  const ctx = useContext(ForwardCtx)
  // If the provider is missing, the hook is a no-op so MessageItem can still
  // render without it (e.g., in isolated tests).
  return (
    ctx ?? {
      openForward: () => {
        // eslint-disable-next-line no-console
        console.warn("ForwardMessageProvider missing — forward unavailable")
      },
    }
  )
}
