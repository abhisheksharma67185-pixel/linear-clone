import "@testing-library/jest-dom/vitest"

// Node 22+ ships a built-in `localStorage` global that's a stub object
// without Storage methods. It shadows jsdom's. Replace it with a working
// in-memory Storage so `localStorage.clear()` etc. work.
const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
    removeItem(key: string) {
      store.delete(key)
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
  }
}

Object.defineProperty(globalThis, "localStorage", {
  value: createMemoryStorage(),
  configurable: true,
  writable: true,
})
Object.defineProperty(globalThis, "sessionStorage", {
  value: createMemoryStorage(),
  configurable: true,
  writable: true,
})
