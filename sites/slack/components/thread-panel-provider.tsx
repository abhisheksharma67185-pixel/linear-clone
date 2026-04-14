"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ThreadPanelState = {
  rootId: string | null;
  open: (rootId: string) => void;
  close: () => void;
};

const ThreadPanelContext = createContext<ThreadPanelState | null>(null);

export function ThreadPanelProvider({ children }: { children: ReactNode }) {
  const [rootId, setRootId] = useState<string | null>(null);
  return (
    <ThreadPanelContext.Provider
      value={{
        rootId,
        open: setRootId,
        close: () => setRootId(null),
      }}
    >
      {children}
    </ThreadPanelContext.Provider>
  );
}

export function useThreadPanel() {
  const ctx = useContext(ThreadPanelContext);
  if (!ctx) {
    throw new Error("useThreadPanel must be used within ThreadPanelProvider");
  }
  return ctx;
}
