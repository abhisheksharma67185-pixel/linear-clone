import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * `useSyncExternalStore` is the React-recommended way to subscribe to a
 * browser API (here: matchMedia). It avoids the "setState in effect"
 * cascade that the `useEffect` + `setState` shape triggers, and integrates
 * cleanly with concurrent rendering.
 */
export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false // SSR snapshot — assume desktop until hydration
  )
}

function subscribe(onStoreChange: () => void): () => void {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}
